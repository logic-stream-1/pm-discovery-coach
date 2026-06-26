import React, { useState, useEffect } from "react";
import { 
  Compass, Award, Target, Shield, Zap, Flame, User, Play, Sparkles, BookOpen, 
  HelpCircle, CheckCircle2, ChevronRight, RefreshCw, Layers, ShieldAlert,
  Sliders, Terminal, FileText, Check, AlertCircle, Share2, Star, ThumbsUp, Gamepad2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProgress, Unit, Lesson } from "../types";

// Types for the Custom Scenario
interface ScenarioChoice {
  text: string;
  nextSlideId: string;
  feedback: string;
  moraleChange: number;
  qualityChange: number;
  budgetChange: number;
}

interface ScenarioSlide {
  challenge: string;
  choices: ScenarioChoice[];
}

interface ScenarioResolution {
  title: string;
  narrative: string;
  postMortem: string;
}

interface BranchingScenario {
  scenarioName: string;
  role: string;
  startSlide: ScenarioSlide;
  branches: Record<string, ScenarioSlide>;
  resolutions: Record<string, ScenarioResolution>;
}

interface CustomPathTabProps {
  progress: UserProgress;
  onUpdateLocalProgress: (newProgress: UserProgress) => void;
  onSelectCustomLesson: (lesson: Lesson, unit: Unit) => void;
  onShareToFeed: (postContent: string, unitShared: any) => void;
}

// Roles and objectives
const ROLES = [
  { id: "pm", name: "Product Manager", desc: "Focuses on strategic alignment, user metrics, and business viability." },
  { id: "engineer", name: "Software Engineer", desc: "Focuses on tech stacks, performance architecture, and scaling constraints." },
  { id: "ux", name: "UX Designer", desc: "Focuses on user mental models, usability heuristics, and discovery validation." },
  { id: "founder", name: "Startup Founder", desc: "Focuses on market traction, fast feedback loops, and runway management." },
  { id: "marketer", name: "Product Marketer", desc: "Focuses on positioning, value propositions, and growth conversion rates." }
];

const OBJECTIVES = [
  { id: "ai_feature", title: "Launch an AI-Powered Feature", desc: "Deploy LLM agents while maintaining prompt safety and user trust." },
  { id: "autonomous_agents", title: "Build Autonomous Workflows", desc: "Design reliable looping triggers and fail-safe human-in-the-loop steps." },
  { id: "latency_cost", title: "Optimize Latency & Operating Cost", desc: "Refactor architecture, balance cache states, and reduce token usage." },
  { id: "user_discovery", title: "Scale User Interview Loops", desc: "Establish high-frequency customer continuous validation patterns." },
  { id: "gamified_progress", title: "Gamified Progress & Micro-Credentials", desc: "Design active engagement loops, streak protections, and skill-badge ladders." },
  { id: "daily_goals", title: "Daily Goal Setting & Habit Formation", desc: "Integrate cognitive constraints, micro-checklists, and focus intervals into product routines." }
];

// High quality offline fallback compiler
function compileFallbackScenario(role: string, goal: string): BranchingScenario {
  const roleLabel = ROLES.find(r => r.id === role)?.name || "Product Leader";
  const goalLabel = OBJECTIVES.find(g => g.id === goal)?.title || "Optimizing Product Discoveries";

  return {
    scenarioName: `Adventure: Scaling the Summit of ${goalLabel}`,
    role: roleLabel,
    startSlide: {
      challenge: `Your team is actively building toward '${goalLabel}'. Suddenly, the core engine experiences a critical performance degradation. Customer trust is wavering, and the marketing lead demands you launch tomorrow to capitalize on the news cycle. As a ${roleLabel}, what is your strategic mandate?`,
      choices: [
        {
          text: "Tactical Patch: Deploy a fast database bypass & launch tomorrow anyway",
          nextSlideId: "slide-patch",
          feedback: "You launched! The marketing wave brings 5,000 sign-ups, but server response time jumps to 4.2 seconds.",
          moraleChange: -10,
          qualityChange: -20,
          budgetChange: 15
        },
        {
          text: "Strategic Refactor: Delay the launch by 10 days to rebuild cache consistency",
          nextSlideId: "slide-refactor",
          feedback: "Launch delayed. Leadership is anxious, but your engineers are thrilled to build a robust foundation.",
          moraleChange: 15,
          qualityChange: 20,
          budgetChange: -15
        }
      ]
    },
    branches: {
      "slide-patch": {
        challenge: "The system is live, but sluggish. Customers are complaining about timeouts on social media. Your lead engineer says the temporary bypass is now corrupting non-critical telemetry logs. What is your recourse?",
        choices: [
          {
            text: "Double-down: Silence telemetry entirely to save memory",
            nextSlideId: "resolution-collapse",
            feedback: "You completely turn off telemetry. The CPU cools down, but you are now flying blind.",
            moraleChange: -15,
            qualityChange: -15,
            budgetChange: -5
          },
          {
            text: "Graceful Pivot: Announce a maintenance window & implement queuing logic",
            nextSlideId: "resolution-recovery",
            feedback: "You announce the fix transparently. Active logins drop temporarily, but metrics stabilize.",
            moraleChange: 10,
            qualityChange: 10,
            budgetChange: -10
          }
        ]
      },
      "slide-refactor": {
        challenge: "Your refactored caching architecture is elegant and stable. However, a major competitor catches wind and quickly announces a generic version of your value proposition. Sales team urges you to rush the launch now.",
        choices: [
          {
            text: "Rush now: Compress final testing cycles & ship tonight",
            nextSlideId: "resolution-buggy",
            feedback: "You shipped early. But the compressed integration test missed a race condition.",
            moraleChange: -20,
            qualityChange: -10,
            budgetChange: -10
          },
          {
            text: "Hold the line: Finish rigorous multi-browser regression tests",
            nextSlideId: "resolution-victory",
            feedback: "You launched with absolute structural integrity. Customers praise the flawless execution.",
            moraleChange: 15,
            qualityChange: 15,
            budgetChange: 10
          }
        ]
      }
    },
    resolutions: {
      "resolution-collapse": {
        title: "The Telemetry Abyss (Critical Quality Fallout)",
        narrative: "Your system remains live but is structurally hollow. Flying blind with telemetry offline means subsequent bugs go unnoticed. Your team is burned out, and customer retention is tumbling.",
        postMortem: "Trading discovery and metrics for momentary speed guarantees catastrophic downstream failure. Always maintain customer feedback loops."
      },
      "resolution-recovery": {
        title: "Transparent Recovery (Pragmatic Ascent)",
        narrative: "A pragmatic recovery! By owning up to the stability constraints, you saved the core database. Morale restored, though your launch timeline took a slight hit.",
        postMortem: "Product discovery means continuous feedback. Transparent pivots build higher long-term customer affinity than rushed bug patches."
      },
      "resolution-buggy": {
        title: "The Race-Condition Fumble (Compromised Refactor)",
        narrative: "Rushing after a long delay led to the worst of both: a late launch that was still buggy. Leadership is displeased, and devs feel their strategic work was wasted.",
        postMortem: "If you invest in high-quality discovery and refactoring, do not abandon it at the finish line. Commitment to quality is binary."
      },
      "resolution-victory": {
        title: "Pure Quality Ascent (The Definitive Masterclass)",
        narrative: "A stunning victory! Your refactored code scales effortlessly under load. Your SLA is solid, and enterprise accounts are already signing contracts due to your robust reliability.",
        postMortem: "Strategic patience and continuous validation build unassailable competitive advantages. This is the continuous discovery ideal."
      }
    }
  };
}

function compileFallbackCurriculum(role: string, goal: string): any {
  const roleLabel = ROLES.find(r => r.id === role)?.name || "Product Leader";
  const goalLabel = OBJECTIVES.find(g => g.id === goal)?.title || "Continuous Discovery";

  return {
    id: `custom-unit-${Date.now()}`,
    number: 5,
    title: `AI Path: Continuous Discovery for ${roleLabel}s`,
    durationMins: 15,
    lessons: [
      {
        id: `custom-l1-${Date.now()}`,
        title: `Calibrating Discovery to ${goalLabel}`,
        durationMins: 5,
        slides: [
          {
            title: "Analyzing the Customer Dilemma",
            body: `In professional continuous discovery, as a ${roleLabel}, your primary goal is to align your domain metrics with '${goalLabel}'. Instead of assuming user requirements, we formulate precise hypothesis loops. This minimizes wasted engineering runway and maximizes technical feasibility.`,
            evidenceTier: "T1",
            evidenceSource: "Weekly User Interviews",
            tip: "Never build a custom AI module without a proven user interview log proving the pain point.",
            example: "If user latency spikes above 2 seconds, run a mock interface test first to verify if user retention is affected."
          }
        ],
        quiz: {
          question: "Which continuous discovery activity provides the highest certainty validation before implementing any machine learning pipelines?",
          options: [
            "Weekly customer discovery interviews mapped to an opportunity-solution tree",
            "A standard system architecture diagram without user input",
            "Writing 10 test scenarios in Jest",
            "Consulting a theoretical industry benchmark report"
          ],
          correctIndex: 0,
          explanation: "Weekly customer validation interviews offer immediate, qualitative certainty directly aligning with actual user pain, ensuring your software addresses authentic demands."
        },
        widgetType: "prompt-comparator"
      },
      {
        id: `custom-l2-${Date.now()}`,
        title: `Validation Frameworks for ${roleLabel}s`,
        durationMins: 5,
        slides: [
          {
            title: "Synthesizing Interactive Feedback",
            body: `To achieve '${goalLabel}', you must systematically compare input structures against real outcomes. By comparing configurations (such as system rules or priority metrics) in real-time, we optimize the loop efficiency.`,
            evidenceTier: "T2",
            evidenceSource: "A/B Testing Logs",
            tip: "Use small test configurations to find anomalies before scaling up cloud database resources.",
            example: "Setting strict system boundaries reduces user error rate by 34%."
          }
        ],
        quiz: {
          question: "When evaluating a user's prompt interaction, which parameter provides the best guardrail against system hallucination?",
          options: [
            "Injecting strict system-instructions grounding the model to actual validated documentation",
            "Increasing the temperature to 1.5",
            "Allowing the model to search the entire index unfettered",
            "Omitting system-instructions to keep responses flexible"
          ],
          correctIndex: 0,
          explanation: "Grounding system instructions explicitly in checked company documentation limits the model's creative range, keeping answers accurate and on-brand."
        },
        widgetType: "token-predictor"
      },
      {
        id: `custom-l3-${Date.now()}`,
        title: `Outcome-Driven Priority Matrix`,
        durationMins: 5,
        slides: [
          {
            title: "The Continuous Feasibility Index",
            body: `The final step is mapping solutions to impact. We weigh the potential user value against technical effort and confidence score, creating a customized Decision Matrix.`,
            evidenceTier: "T3",
            evidenceSource: "Confidence Score Heuristics",
            tip: "If confidence score is below 50%, run another continuous validation loop before writing production code.",
            example: "Using a weighted matrix increases launch accuracy by 25%."
          }
        ],
        quiz: {
          question: "What is the primary factor in determining if a custom feature is safe to be prioritized in a sprint?",
          options: [
            "Continuous qualitative user interviews backed by quantitative engineering stress tests",
            "A request from a single high-profile account on an ad-hoc call",
            "The competitor's latest press release marketing details",
            "The engineer's preference for a specific new language framework"
          ],
          correctIndex: 0,
          explanation: "Combining qualitative discovery (validates user love) with engineering testing (validates feasibility) represents the pinnacle of professional product discovery safety."
        },
        widgetType: "decision-matrix"
      }
    ]
  };
}

export default function CustomPathTab({ progress, onUpdateLocalProgress, onSelectCustomLesson, onShareToFeed }: CustomPathTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"onboarding" | "adventure" | "curriculum">("onboarding");
  
  // Onboarding setup state
  const [selectedRole, setSelectedRole] = useState("pm");
  const [selectedGoal, setSelectedGoal] = useState("ai_feature");
  const [customNotes, setCustomNotes] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Loaded units state
  const [customUnits, setCustomUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem("pm_scholar_custom_units");
    return saved ? JSON.parse(saved) : [];
  });

  // Scenario Gameplay state
  const [currentGameplay, setCurrentGameplay] = useState<BranchingScenario | null>(null);
  const [currentSlideId, setCurrentSlideId] = useState<string>("start"); // "start" or specific branch ID
  const [currentSlide, setCurrentSlide] = useState<ScenarioSlide | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string>("");
  const [morale, setMorale] = useState(75);
  const [quality, setQuality] = useState(70);
  const [budget, setBudget] = useState(100);
  const [gameIsOver, setGameIsOver] = useState(false);
  const [resolution, setResolution] = useState<ScenarioResolution | null>(null);
  const [decisionCount, setDecisionCount] = useState(0);

  // Status logs
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load custom units on start
  useEffect(() => {
    localStorage.setItem("pm_scholar_custom_units", JSON.stringify(customUnits));
  }, [customUnits]);

  // Handle Scenario Choice selection
  const handleSelectChoice = (choice: ScenarioChoice) => {
    setLastFeedback(choice.feedback);
    setDecisionCount(prev => prev + 1);
    
    // Apply metric shifts with boundaries [0, 100]
    setMorale(prev => Math.max(0, Math.min(100, prev + choice.moraleChange)));
    setQuality(prev => Math.max(0, Math.min(100, prev + choice.qualityChange)));
    setBudget(prev => Math.max(0, Math.min(100, prev + choice.budgetChange)));

    const nextId = choice.nextSlideId;
    setCurrentSlideId(nextId);

    if (currentGameplay) {
      if (currentGameplay.branches[nextId]) {
        setCurrentSlide(currentGameplay.branches[nextId]);
      } else if (currentGameplay.resolutions[nextId]) {
        setResolution(currentGameplay.resolutions[nextId]);
        setGameIsOver(true);
      }
    }
  };

  // Start Scenario Adventure game
  const startAdventure = async () => {
    setIsLoading(true);
    setDecisionCount(0);
    setStatusMsg("Gemini is designing your branching decision adventure...");
    try {
      const res = await fetch("/api/gemini/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, goal: selectedGoal })
      });

      if (!res.ok) throw new Error("Server scenario endpoint failed");
      const data = await res.json();
      
      setCurrentGameplay(data);
      setCurrentSlide(data.startSlide);
      setCurrentSlideId("start");
      setMorale(75);
      setQuality(70);
      setBudget(100);
      setLastFeedback("");
      setGameIsOver(false);
      setResolution(null);
      setActiveSubTab("adventure");
    } catch (err) {
      console.warn("Falling back to local client adventure engine:", err);
      const fallback = compileFallbackScenario(selectedRole, selectedGoal);
      setCurrentGameplay(fallback);
      setCurrentSlide(fallback.startSlide);
      setCurrentSlideId("start");
      setMorale(75);
      setQuality(70);
      setBudget(100);
      setLastFeedback("");
      setGameIsOver(false);
      setResolution(null);
      setActiveSubTab("adventure");
    } finally {
      setIsLoading(false);
      setStatusMsg("");
    }
  };

  // Generate Custom curriculum Unit
  const generateCustomUnit = async () => {
    setIsLoading(true);
    setStatusMsg("Gemini is structuring your customized learning unit & interactive widgets...");
    try {
      const res = await fetch("/api/gemini/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          goal: selectedGoal,
          notes: customNotes,
          url: customUrl
        })
      });

      if (!res.ok) throw new Error("Server curriculum endpoint failed");
      const data = await res.json();

      const newUnit: Unit = {
        id: `custom-unit-${Date.now()}`,
        number: 5 + customUnits.length,
        title: data.title || "Custom AI Dynamic Unit",
        durationMins: 15,
        lessons: data.lessons.map((l: any, idx: number) => ({
          id: `custom-l-${Date.now()}-${idx}`,
          title: l.title,
          durationMins: l.durationMins || 5,
          slides: l.slides || [],
          quiz: l.quiz || {
            question: "Sample Question?",
            options: ["A", "B"],
            correctIndex: 0,
            explanation: "Explanation."
          },
          widgetType: l.widgetType || "prompt-comparator"
        }))
      };

      setCustomUnits([newUnit, ...customUnits]);
      setActiveSubTab("curriculum");
    } catch (err) {
      console.warn("Falling back to offline curriculum builder:", err);
      const fallback = compileFallbackCurriculum(selectedRole, selectedGoal);
      setCustomUnits([fallback, ...customUnits]);
      setActiveSubTab("curriculum");
    } finally {
      setIsLoading(false);
      setStatusMsg("");
    }
  };

  // Share Scenario post-mortem to the community tab feed
  const shareScenarioMilestone = () => {
    if (!resolution) return;
    const shareText = `Just completed the Choose-Your-Own-Adventure Case Study: "${currentGameplay?.scenarioName || "Product Decision Adventure"}"! Finished with metrics: Team Morale ${morale}%, Product Quality ${quality}%, Budget ${budget}%. Reached ending: "${resolution.title}"! Highly recommend training your strategic PM decision-making! 🧠🎮`;
    onShareToFeed(shareText, {
      unitNumber: 5,
      unitTitle: currentGameplay?.scenarioName || "Branching Case Study",
      score: `${quality}% Quality`
    });
    alert("Scenario milestone shared directly to the Community Tab!");
  };

  return (
    <div className="space-y-6" id="custom-path-tab-container">
      {/* Tab Select Header */}
      <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-300/30 gap-1 shadow-3xs" id="custom-subtab-selector">
        <button
          onClick={() => setActiveSubTab("onboarding")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "onboarding" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Dynamic Setup
        </button>
        <button
          onClick={() => setActiveSubTab("adventure")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "adventure" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Branching Adventure
        </button>
        <button
          onClick={() => setActiveSubTab("curriculum")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "curriculum" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-500" /> AI Syllabus ({customUnits.length})
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs animate-pulse flex flex-col items-center justify-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800">Compiling with Gemini AI</h4>
            <p className="text-xs text-slate-400 mt-1">{statusMsg}</p>
          </div>
        </div>
      )}

      {/* ONBOARDING SUB TAB */}
      {!isLoading && activeSubTab === "onboarding" && (
        <div className="space-y-6 animate-fadeIn" id="onboarding-setup-view">
          {/* Welcome Intro */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-display font-bold text-sm text-slate-900">Dual-Engine Custom Generator</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Combine your functional role with target metrics to instantly generate branching scenarios and custom microlearning modules tailored directly to your context.
              </p>
            </div>
          </div>

          {/* 1. Functional Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">1. Select Your Functional Role</label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedRole === r.id ? "bg-blue-50 border-blue-300 shadow-3xs" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{r.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{r.desc}</span>
                  </div>
                  {selectedRole === r.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Outcome Objective */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">2. Target Learning Goal</label>
            <div className="grid grid-cols-1 gap-2">
              {OBJECTIVES.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`p-3 text-left rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedGoal === g.id ? "bg-indigo-50 border-indigo-300 shadow-3xs" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{g.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{g.desc}</span>
                  </div>
                  {selectedGoal === g.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Notes & Context Grounding */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">3. Context Grounding (Optional)</label>
              <p className="text-[10px] text-slate-400 mt-0.5">Supply custom specs, wiki documents or reference links to anchor lessons with actual terminology.</p>
            </div>
            
            <div className="space-y-2">
              <textarea
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="Paste corporate wiki text, specs, or custom PM guidelines..."
                className="w-full text-xs p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
              />
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="Reference Specification URL (e.g., https://my-docs.com)"
                className="w-full text-xs p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Launchers */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={startAdventure}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Terminal className="w-4 h-4" /> Start CYOA Adventure
            </button>
            <button
              onClick={generateCustomUnit}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Synthesize AI Syllabus
            </button>
          </div>
        </div>
      )}

      {/* ADVENTURE CYOA GAMEPLAY */}
      {!isLoading && activeSubTab === "adventure" && (
        <div className="space-y-5 animate-fadeIn" id="adventure-cyoa-gameplay">
          {!currentGameplay ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto">
                  <Gamepad2 className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-display font-extrabold text-base text-slate-900 tracking-tight">Branching Decision Case Study Simulator</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Test your real-time strategic trade-offs under high-stakes circumstances. Can you balance team morale, software quality, and tight budgets under fire?
                </p>
              </div>

              {/* Instant Preset Quick-Launch Grid */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Instant Quick-Start Presets (Zero Wait)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      const fallback = compileFallbackScenario("pm", "ai_feature");
                      setCurrentGameplay(fallback);
                      setCurrentSlide(fallback.startSlide);
                      setCurrentSlideId("start");
                      setMorale(75);
                      setQuality(70);
                      setBudget(100);
                      setLastFeedback("");
                      setGameIsOver(false);
                      setResolution(null);
                    }}
                    className="p-4 bg-slate-50/60 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition duration-200 cursor-pointer flex flex-col justify-between h-32 group"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 block leading-tight group-hover:text-indigo-900">Product Manager</span>
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal">Topic: Launching LLM features with prompt constraints</span>
                    </div>
                    <span className="text-[9px] font-mono font-extrabold text-indigo-600 flex items-center gap-1">PLAY NOW &rarr;</span>
                  </button>

                  <button
                    onClick={() => {
                      const fallback = compileFallbackScenario("engineer", "autonomous_agents");
                      setCurrentGameplay(fallback);
                      setCurrentSlide(fallback.startSlide);
                      setCurrentSlideId("start");
                      setMorale(75);
                      setQuality(70);
                      setBudget(100);
                      setLastFeedback("");
                      setGameIsOver(false);
                      setResolution(null);
                    }}
                    className="p-4 bg-slate-50/60 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition duration-200 cursor-pointer flex flex-col justify-between h-32 group"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 block leading-tight group-hover:text-emerald-900">Lead Architect</span>
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal">Topic: Designing reliable looping workflows & fail-safes</span>
                    </div>
                    <span className="text-[9px] font-mono font-extrabold text-emerald-600 flex items-center gap-1">PLAY NOW &rarr;</span>
                  </button>

                  <button
                    onClick={() => {
                      const fallback = compileFallbackScenario("ux", "user_discovery");
                      setCurrentGameplay(fallback);
                      setCurrentSlide(fallback.startSlide);
                      setCurrentSlideId("start");
                      setMorale(75);
                      setQuality(70);
                      setBudget(100);
                      setLastFeedback("");
                      setGameIsOver(false);
                      setResolution(null);
                    }}
                    className="p-4 bg-slate-50/60 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition duration-200 cursor-pointer flex flex-col justify-between h-32 group"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 block leading-tight group-hover:text-amber-900">UX Researcher</span>
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal">Topic: Scaling customer continuous validation loops</span>
                    </div>
                    <span className="text-[9px] font-mono font-extrabold text-amber-600 flex items-center gap-1">PLAY NOW &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Setup alternative card */}
              <div className="bg-indigo-50/40 rounded-xl p-4 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 leading-relaxed text-center sm:text-left">
                  Want to use your own company spec notes, wiki guidelines, or live Gemini-powered branch generation?
                </span>
                <button
                  onClick={() => setActiveSubTab("onboarding")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-lg text-xs transition duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Customize with Gemini
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono tracking-widest text-indigo-400 font-extrabold bg-indigo-950/80 px-2 py-0.5 rounded uppercase border border-indigo-900">CYOA GAME</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">Decision Turn #{decisionCount + 1}</span>
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-white mt-1">{currentGameplay.scenarioName}</h4>
                </div>
                <span className="text-[10px] font-bold text-slate-200 bg-slate-850 border border-slate-700 px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
                  Playing as: <strong className="text-indigo-400">{currentGameplay.role}</strong>
                </span>
              </div>

              {/* REAL-TIME METRICS BAR / HUD */}
              <div className="bg-white border border-slate-250 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-xs">
                {/* Morale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Flame className={`w-4 h-4 ${morale > 40 ? "text-rose-500 animate-pulse" : "text-rose-400"}`} />
                      <span className="text-xs font-bold text-slate-700">Team Morale</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900">{morale}%</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        morale > 70 ? "bg-emerald-50 text-emerald-700 border border-emerald-150" :
                        morale > 40 ? "bg-amber-50 text-amber-700 border border-amber-150" :
                        "bg-rose-50 text-rose-700 border border-rose-150 animate-pulse"
                      }`}>
                        {morale > 70 ? "High" : morale > 40 ? "Stable" : "Critical"}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${morale}%` }}></div>
                  </div>
                </div>

                {/* Quality */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700">Product Quality</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900">{quality}%</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        quality > 70 ? "bg-emerald-50 text-emerald-700 border border-emerald-150" :
                        quality > 40 ? "bg-amber-50 text-amber-700 border border-amber-150" :
                        "bg-rose-50 text-rose-700 border border-rose-150 animate-pulse"
                      }`}>
                        {quality > 70 ? "Excellent" : quality > 40 ? "Fair" : "Poor"}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${quality}%` }}></div>
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-700">Sprint Budget</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900">{budget}%</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        budget > 65 ? "bg-emerald-50 text-emerald-700 border border-emerald-150" :
                        budget > 35 ? "bg-amber-50 text-amber-700 border border-amber-150" :
                        "bg-rose-50 text-rose-700 border border-rose-150 animate-pulse"
                      }`}>
                        {budget > 65 ? "Healthy" : budget > 35 ? "Tight" : "depleted"}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${budget}%` }}></div>
                  </div>
                </div>
              </div>

              {/* GAME OVER RESOLUTION SCREEN */}
              {gameIsOver && resolution ? (
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4" id="adventure-resolution-card">
                  <div className="text-center space-y-2">
                    <Award className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                    <h4 className="font-display font-extrabold text-base text-slate-900">{resolution.title}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CYOA Final Outcome</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{resolution.narrative}</p>
                  </div>

                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5">
                    <h5 className="font-display font-bold text-xs text-indigo-900 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Post-Mortem Assessment:
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{resolution.postMortem}</p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      onClick={shareScenarioMilestone}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share Milestone
                    </button>
                    <button
                      onClick={startAdventure}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Play Again
                    </button>
                  </div>
                </div>
              ) : (
                /* ACTIVE PLAYING SLIDE */
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
                  {/* Feedback line if there was a previous selection */}
                  {lastFeedback && (
                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 text-slate-800 rounded-xl text-xs flex gap-2 items-start leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-indigo-900 block font-bold mb-0.5">Previous Decision Result:</strong>
                        <p className="text-slate-650 font-medium">{lastFeedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Challenge Text */}
                  <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-150">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-indigo-600 font-extrabold block">Current Predicament</span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-bold">
                      {currentSlide?.challenge}
                    </p>
                  </div>

                  {/* Action Choices */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wide">Select your strategy carefully:</span>
                    {currentSlide?.choices.map((choice, index) => {
                      // Determine the letters (A, B, C, D)
                      const letters = ["A", "B", "C", "D"];
                      const letter = letters[index] || (index + 1).toString();
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectChoice(choice)}
                          className="w-full text-left bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/15 rounded-xl transition-all duration-200 hover:shadow-xs p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="flex items-start gap-3 flex-grow">
                            <span className="bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700 border border-slate-200 group-hover:border-indigo-250 text-xs font-mono font-black py-1 px-2.5 rounded shrink-0">
                              {letter}
                            </span>
                            <span className="text-xs font-bold text-slate-800 leading-relaxed mt-0.5">
                              {choice.text}
                            </span>
                          </div>

                          {/* Dynamic explicit impact tags */}
                          <div className="flex flex-wrap gap-1 items-center shrink-0 pl-8 sm:pl-0">
                            {choice.moraleChange !== 0 && (
                              <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                                choice.moraleChange > 0 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                  : "bg-rose-50 text-rose-700 border-rose-150"
                              }`}>
                                {choice.moraleChange > 0 ? "Morale ▲" : "Morale ▼"}
                              </span>
                            )}
                            {choice.qualityChange !== 0 && (
                              <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                                choice.qualityChange > 0 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                  : "bg-rose-50 text-rose-700 border-rose-150"
                              }`}>
                                {choice.qualityChange > 0 ? "Quality ▲" : "Quality ▼"}
                              </span>
                            )}
                            {choice.budgetChange !== 0 && (
                              <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                                choice.budgetChange > 0 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                  : "bg-rose-50 text-rose-700 border-rose-150"
                              }`}>
                                {choice.budgetChange > 0 ? "Budget ▲" : "Budget ▼"}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI GENERATED SYLLABUS LIST */}
      {!isLoading && activeSubTab === "curriculum" && (
        <div className="space-y-5 animate-fadeIn" id="ai-curriculum-syllabus">
          {customUnits.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
              <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="font-display font-bold text-sm text-slate-800">No AI Curriculum Generated</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Use the 'Dynamic Setup' tab to synthesize dynamic microlearning units directly based on your customized documentation.
              </p>
              <button
                onClick={() => setActiveSubTab("onboarding")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Go to Setup
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-display font-bold text-sm text-slate-900">Custom Dynamic Syllabus</h4>
                <button
                  onClick={() => {
                    if (window.confirm("Clear all AI synthesized units?")) {
                      setCustomUnits([]);
                    }
                  }}
                  className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-150 px-2 py-1 rounded"
                >
                  Wipe Custom Path
                </button>
              </div>

              <div className="space-y-3">
                {customUnits.map(unit => (
                  <div key={unit.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-600 font-bold block">SYNTHESIZED LEVEL</span>
                        <h5 className="font-display font-extrabold text-xs text-slate-800 leading-tight">{unit.title}</h5>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400">{unit.durationMins} Mins</span>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 space-y-2">
                      {unit.lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectCustomLesson(lesson, unit)}
                          className="p-3 bg-slate-50 hover:bg-emerald-50/20 border border-slate-150 hover:border-emerald-300 rounded-lg flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-bold text-xs text-slate-800 block leading-tight">{lesson.title}</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5 capitalize">{lesson.widgetType || "standard-sandbox"} Widget Included</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
