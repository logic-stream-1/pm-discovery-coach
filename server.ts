import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import healthHandler from "./api/health";
import generateCurriculumHandler from "./api/gemini/generate-curriculum";
import generateScenarioHandler from "./api/gemini/generate-scenario";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Proxy endpoints mapped directly to Vercel Serverless Function handlers
app.get("/api/health", healthHandler as any);
app.post("/api/gemini/generate-curriculum", generateCurriculumHandler as any);
app.post("/api/gemini/generate-scenario", generateScenarioHandler as any);

// Vite / Production Asset handling
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
