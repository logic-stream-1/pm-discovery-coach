import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY_PS || process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ai) {
    return res.status(400).json({
      error: "Gemini API key is not configured on the server. Please check Vercel environment variables or Settings > Secrets in AI Studio.",
    });
  }

  const { role, goal, notes, url } = req.body || {};

  const prompt = `You are an expert product management and continuous discovery instructor.
Generate a custom-tailored 3-lesson learning unit for the user with the following profile:
- Functional Role: ${role} (Analogy, technical complexity, and phrasing should be targeted specifically to this domain!)
- Outcome-Based Learning Goal: ${goal}
- Context Grounding Notes: ${notes || "None supplied"}
- Context Grounding URL: ${url || "None supplied"}

Format your entire response as a single, valid JSON object matching this schema:
{
  "title": "Custom Unit Title (e.g., Continuous Discovery for ${role}s to ${goal})",
  "lessons": [
    {
      "title": "Lesson 1 Title",
      "durationMins": 5,
      "slides": [
        {
          "title": "Slide 1: Concepts",
          "body": "Clear, instructive text teaching continuous discovery mapped to the ${role} domain. Must mention concrete methods.",
          "evidenceTier": "T1",
          "evidenceSource": "Customer Interviews",
          "tip": "Pro-tip for this role",
          "example": "Real-world scenario example for this goal"
        },
        {
          "title": "Slide 2: Execution",
          "body": "Step-by-step guidance on implementing discovery for this role.",
          "evidenceTier": "T2",
          "evidenceSource": "Analytics Logs",
          "tip": "Actionable tactic",
          "example": "Application example"
        }
      ],
      "quiz": {
        "question": "A tough multiple-choice question testing practical application in a scenario...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Clear explanation of why Option A is correct and why other choices fail."
      },
      "widgetType": "prompt-comparator"
    },
    {
      "title": "Lesson 2 Title",
      "durationMins": 5,
      "slides": [
        { "title": "Slide 1 Title", "body": "Instructive body...", "tip": "Tip..." }
      ],
      "quiz": {
        "question": "Question text...",
        "options": ["A", "B", "C"],
        "correctIndex": 1,
        "explanation": "Explanation..."
      },
      "widgetType": "token-predictor"
    },
    {
      "title": "Lesson 3: Advanced Scenario Matrix",
      "durationMins": 5,
      "slides": [
        { "title": "Slide 1 Title", "body": "Advanced continuous discovery mapping...", "tip": "Tactic..." }
      ],
      "quiz": {
        "question": "Question text...",
        "options": ["A", "B", "C"],
        "correctIndex": 2,
        "explanation": "Explanation..."
      },
      "widgetType": "decision-matrix"
    }
  ]
}

Ensure the widgetType parameter for each lesson is selected from: "prompt-comparator", "token-predictor", "decision-matrix", "agent-simulator", or "evaluator-brief".
Ensure the output is 100% valid JSON, with no enclosing markdown or backticks.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Gemini curriculum generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate custom curriculum" });
  }
}
