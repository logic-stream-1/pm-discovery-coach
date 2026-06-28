import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client with standard headers
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

// Keep API endpoints before Vite middleware
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!apiKey });
});

// Proxy endpoint for custom-tailored curriculum generation
app.post("/api/gemini/generate-curriculum", async (req: express.Request, res: express.Response) => {
  if (!ai) {
    return res.status(400).json({
      error: "Gemini API key is not configured on the server. Please check Settings > Secrets.",
    });
  }

  const { role, goal, notes, url } = req.body;

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
    res.json(data);
  } catch (error: any) {
    console.error("Gemini curriculum generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate custom curriculum" });
  }
});

// Proxy endpoint for branching scenario generation
app.post("/api/gemini/generate-scenario", async (req: express.Request, res: express.Response) => {
  if (!ai) {
    return res.status(400).json({
      error: "Gemini API key is not configured on the server. Please check Settings > Secrets.",
    });
  }

  const { role, goal } = req.body;

  const prompt = `You are a curriculum designer for a premier product academy.
Generate a realistic, high-stakes 3-stage 'Choose-Your-Own-Adventure' Branching Decision Scenario tailored to:
- Role: ${role}
- Goal: ${goal}

It must involve trade-offs between speed, stability, customer trust, and team alignment.
Track three metrics in subsequent slides based on selections:
- Team Morale (Starts at 75)
- Product Quality (Starts at 70)
- Budget (Starts at 100)

Provide a JSON object matching this schema precisely:
{
  "scenarioName": "The Crisis of ${goal}",
  "role": "${role}",
  "startSlide": {
    "challenge": "A high-stakes situation occurs regarding ${goal}. For example, server loads are spiking, or a major partner is leaving. Introduce the dramatic hook.",
    "choices": [
      {
        "text": "Option A: Fast, dirty patch",
        "nextSlideId": "slide-A",
        "feedback": "You chose speed. Your team stays up all night to patch the issue.",
        "moraleChange": -15,
        "qualityChange": -10,
        "budgetChange": -5
      },
      {
        "text": "Option B: Careful long-term architecture refactoring",
        "nextSlideId": "slide-B",
        "feedback": "You prioritize robust architecture, delaying the marketing team.",
        "moraleChange": 10,
        "qualityChange": 15,
        "budgetChange": -20
      }
    ]
  },
  "branches": {
    "slide-A": {
      "challenge": "Stage 2 (Speed Route): The patch works, but team is exhausted. Suddenly, a customer complaints wave starts because of secondary bugs! What's next?",
      "choices": [
        {
          "text": "Option A1: Launch PR campaign & promise fixes later",
          "nextSlideId": "resolution-A1",
          "feedback": "The marketing engine covers up the fallout, but engineers feel ignored.",
          "moraleChange": -20,
          "qualityChange": -15,
          "budgetChange": -10
        },
        {
          "text": "Option A2: Stop feature development to pay off technical debt",
          "nextSlideId": "resolution-A2",
          "feedback": "The engineering team breathes a sigh of relief, but leadership is nervous about milestones.",
          "moraleChange": 15,
          "qualityChange": 10,
          "budgetChange": -15
        }
      ]
    },
    "slide-B": {
      "challenge": "Stage 2 (Quality Route): The refactoring keeps the system stable, but competitors launched an AI feature first, and sales team is furious! What's next?",
      "choices": [
        {
          "text": "Option B1: Overtime sprint to clone the competitor's feature",
          "nextSlideId": "resolution-B1",
          "feedback": "You rush to build. Technicians complain about breaking the architecture.",
          "moraleChange": -25,
          "qualityChange": -5,
          "budgetChange": -15
        },
        {
          "text": "Option B2: Focus on niche stable performance marketing",
          "nextSlideId": "resolution-B2",
          "feedback": "You double down on stability, attracting enterprise users who hate bugs.",
          "moraleChange": 10,
          "qualityChange": 15,
          "budgetChange": 5
        }
      ]
    }
  },
  "resolutions": {
    "resolution-A1": {
      "title": "A Hollow Victory (High Morale Debt)",
      "narrative": "You survived the launch window, but your technical debt is astronomical. Morale took a critical dive, and key devs are updating their resumes.",
      "postMortem": "Speed is addictive but creates compounding human and tech interest. Balance the launch window with team sustainable pacing."
    },
    "resolution-A2": {
      "title": "Sustainable Pivot (Restored Integrity)",
      "narrative": "By stopping development to pay off the debt, you stabilized quality. Customers appreciate the reliability, though some target milestones slid by.",
      "postMortem": "Acknowledging errors early is painful but saves you from a fatal quality trap."
    },
    "resolution-B1": {
      "title": "Rushed Clone (Double Whammy Fail)",
      "narrative": "Rushing a clone after delayed refactoring led to the worst of both worlds: late delivery and high bugs. Team morale has hit rock bottom.",
      "postMortem": "Commit fully to your chosen strategy. Half-measures fail on both axes."
    },
    "resolution-B2": {
      "title": "Enterprise Quality Victory (Calculated Ascent)",
      "narrative": "Your stable quality became a key differentiator. High-paying enterprise accounts signed on due to your SLA reliability. Budget and team spirit are surging!",
      "postMortem": "Focusing on core capabilities rather than cloning competitors builds defensible product moats."
    }
  }
}

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
    res.json(data);
  } catch (error: any) {
    console.error("Gemini scenario generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate custom branching scenario" });
  }
});

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
