import "dotenv/config";
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
 * 프론트는 API 키 없이 이 엔드포인트만 호출합니다.
 * body: { prompt: string } 또는 Gemini REST와 동일한 { contents, model?, generationConfig? }
 */
app.post("/api/gemini", async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
    return;
  }

  const body = req.body ?? {};
  const model =
    typeof body.model === "string" && body.model.trim()
      ? body.model.trim()
      : "gemini-2.0-flash";

  let contents = body.contents;
  if (!contents && typeof body.prompt === "string") {
    contents = [{ role: "user", parts: [{ text: body.prompt }] }];
  }

  if (!Array.isArray(contents) || contents.length === 0) {
    res
      .status(400)
      .json({ error: "Send `prompt` (string) or `contents` (array) in JSON body" });
    return;
  }

  const payload = { contents };
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
