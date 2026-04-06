import "dotenv/config";
import { Readable } from "node:stream";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

const allowedCorsOrigins = new Set([...BUILTIN_CORS_ORIGINS, ...extraCorsOrigins]);

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

/**
 * @returns {{ model: string, payload: object } | { error: string, status: number }}
 */
function parseGeminiRequestBody(body) {
  body = body ?? {};
  const model =
    typeof body.model === "string" && body.model.trim()
      ? body.model.trim()
      : "gemini-2.0-flash";

  let contents = body.contents;
  if (!contents && typeof body.prompt === "string") {
    contents = [{ role: "user", parts: [{ text: body.prompt }] }];
  }

  if (!Array.isArray(contents) || contents.length === 0) {
    return {
      error: "Send `prompt` (string) or `contents` (array) in JSON body",
      status: 400,
    };
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

  return { model, payload };
}

/**
 * 프론트는 API 키 없이 이 엔드포인트만 호출합니다.
 * body: { prompt: string } 또는 Gemini REST와 동일한 { contents, model?, systemInstruction?, generationConfig? }
 */
app.post("/api/gemini", async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
    return;
  }

  const parsed = parseGeminiRequestBody(req.body);
  if ("error" in parsed) {
    res.status(parsed.status).json({ error: parsed.error });
    return;
  }

  const { model, payload } = parsed;
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

/**
 * 스트리밍: Google `streamGenerateContent?alt=sse`를 그대로 프록시합니다.
 */
app.post("/api/gemini/stream", async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
    return;
  }

  const parsed = parseGeminiRequestBody(req.body);
  if ("error" in parsed) {
    res.status(parsed.status).json({ error: parsed.error });
    return;
  }

  const { model, payload } = parsed;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      res.status(upstream.status).type("application/json").send(text || "{}");
      return;
    }

    if (!upstream.body) {
      res.status(502).json({ error: "Empty upstream body" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.status(200);
    Readable.fromWeb(upstream.body)
      .on("error", () => {
        if (!res.writableEnded) res.destroy();
      })
      .pipe(res);
  } catch {
    if (!res.headersSent) {
      res.status(502).json({ error: "Failed to reach Gemini API" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
