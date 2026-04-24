import "dotenv/config";
import express from "express";
import {
  buildTarotUserPrompt,
  TAROT_SYSTEM_INSTRUCTION,
  TAROT_GENERATION_CONFIG,
  TAROT_MODEL_PRIMARY,
  TAROT_MODEL_FALLBACK,
} from "./tarotPrompts.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/** 일반 `POST /api/gemini`용 기본 모델 — 클라이언트 `body.model`은 무시 (서버에서만 제어) */
const GEMINI_DEFAULT_MODEL =
  process.env.GEMINI_DEFAULT_MODEL || "gemini-2.0-flash";
const TAROT_MODEL = process.env.GEMINI_TAROT_MODEL || TAROT_MODEL_PRIMARY;
const TAROT_FALLBACK_MODEL =
  process.env.GEMINI_TAROT_FALLBACK_MODEL || TAROT_MODEL_FALLBACK;

/** 프로덕션 + 흔한 로컬 프론트 포트. `CORS_ORIGIN`에 콤마로 더 추가 가능 */
const BUILTIN_CORS_ORIGINS = [
  "https://office-tarot.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
];

const extraCorsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedCorsOrigins = new Set([
  ...BUILTIN_CORS_ORIGINS,
  ...extraCorsOrigins,
]);

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && allowedCorsOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    if (origin && !allowedCorsOrigins.has(origin)) {
      res.sendStatus(403);
      return;
    }
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

function extractGenerateContentText(data) {
  if (!data || typeof data !== "object") return "";
  if (data.error?.message) {
    const c = data.error.code;
    const msg = data.error.message;
    const status = data.error.status;
    const prefix =
      c != null ? String(c) : status != null ? status : "error";
    throw new Error(`${prefix} ${msg}`);
  }
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts?.length) return "";
  return parts
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join("");
}

async function callGeminiGenerateContent(model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(payload),
  });
  const data = await upstream.json().catch(() => ({}));
  return { upstream, data };
}

/**
 * 타로 앱: 프롬프트·시스템 지시·모델·재시도는 전부 서버.
 * body: { cards: { name, englishName }[], nickname?, questionText?, colleagueName? }
 */
app.post("/api/tarot-interpret", async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
    return;
  }

  const body = req.body ?? {};
  const cards = body.cards;
  if (!Array.isArray(cards) || cards.length === 0) {
    res
      .status(400)
      .json({ error: "`cards` (non-empty array) is required in JSON body" });
    return;
  }
  for (const c of cards) {
    if (!c || typeof c.name !== "string" || typeof c.englishName !== "string") {
      res.status(400).json({
        error: "Each card must have `name` and `englishName` (strings)",
      });
      return;
    }
  }

  const nickname =
    typeof body.nickname === "string" ? body.nickname : "익명의 직장인";
  const questionText =
    typeof body.questionText === "string"
      ? body.questionText
      : "오늘의 전반적인 운세";
  const colleagueName =
    typeof body.colleagueName === "string" ? body.colleagueName : undefined;

  const userPrompt = buildTarotUserPrompt(
    cards,
    nickname,
    questionText,
    colleagueName,
  );

  const maxRetries = 3;
  let retryCount = 0;
  let currentModel = TAROT_MODEL;

  const basePayload = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: TAROT_SYSTEM_INSTRUCTION }] },
    generationConfig: TAROT_GENERATION_CONFIG,
  };

  while (retryCount <= maxRetries) {
    try {
      const { upstream, data } = await callGeminiGenerateContent(
        currentModel,
        basePayload,
      );
      if (!upstream.ok) {
        const errText =
          typeof data?.error?.message === "string"
            ? data.error.message
            : JSON.stringify(data);
        throw new Error(`${upstream.status} ${errText}`);
      }
      const text = extractGenerateContentText(data);
      if (!text) {
        throw new Error("빈 응답");
      }
      res.status(200).json({ text });
      return;
    } catch (e) {
      const errorMsg = e?.message || String(e);
      const isQuotaError =
        errorMsg.includes("429") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("Quota exceeded");

      if (isQuotaError && retryCount < maxRetries) {
        retryCount++;
        const delay = Math.pow(2, retryCount - 1) * 1000;
        if (retryCount === 2) {
          currentModel = TAROT_FALLBACK_MODEL;
        }
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (isQuotaError) {
        res.status(503).json({
          error: "quota",
          message:
            "현재 사용량이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }
      res.status(502).json({
        error: "gemini",
        message: errorMsg,
      });
      return;
    }
  }
  res.status(502).json({ error: "gemini", message: "Max retries exceeded" });
});

/**
 * 프론트는 API 키 없이 이 엔드포인트만 호출합니다.
 * 모델은 `GEMINI_DEFAULT_MODEL`로 고정(요청 `body.model`은 무시).
 * body: { prompt: string } 또는 Gemini REST와 동일한 { contents, generationConfig? }
 */
app.post("/api/gemini", async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
    return;
  }

  const body = req.body ?? {};
  const model = GEMINI_DEFAULT_MODEL;

  let contents = body.contents;
  if (!contents && typeof body.prompt === "string") {
    contents = [{ role: "user", parts: [{ text: body.prompt }] }];
  }

  if (!Array.isArray(contents) || contents.length === 0) {
    res
      .status(400)
      .json({
        error: "Send `prompt` (string) or `contents` (array) in JSON body",
      });
    return;
  }

  const payload = { contents };
  if (body.systemInstruction && typeof body.systemInstruction === "object") {
    payload.systemInstruction = body.systemInstruction;
  }
  if (body.generationConfig && typeof body.generationConfig === "object") {
    payload.generationConfig = body.generationConfig;
  }
  if (body.safetySettings && Array.isArray(body.safetySettings)) {
    payload.safetySettings = body.safetySettings;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(data);
  } catch {
    res.status(502).json({ error: "Failed to reach Gemini API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
