import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.GEMINI_API_KEY_PS || process.env.GEMINI_API_KEY;
  res.status(200).json({ status: "ok", hasApiKey: !!apiKey });
}
