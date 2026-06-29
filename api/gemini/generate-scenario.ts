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

  const { role, goal } = req.body || {};

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
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Gemini scenario generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate custom branching scenario" });
  }
}
