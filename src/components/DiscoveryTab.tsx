import React, { useState } from "react";
import { 
  Play, Lock, ChevronDown, ChevronUp, Users, ArrowRight, 
  ShieldCheck, HelpCircle, Sparkles, Sliders, Gamepad2, 
  Info, CheckCircle2, Trophy, Compass, ChevronRight, Lightbulb, UserCheck, BookOpen,
  Flame, Award, CheckSquare, MessageSquare
} from "lucide-react";
import { Unit, Lesson, UserProgress } from "../types";
import { UNITS } from "../data/lessonsData";

interface DiscoveryTabProps {
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson, unit: Unit) => void;
  onExploreCommunity: () => void;
  onContinueLearning: () => void;
  onNavigateToMyPathSection?: (section: "journey" | "habits" | "sandboxes" | "ai-onboarding") => void;
}

export default function DiscoveryTab({ 
  progress, 
  onSelectLesson, 
  onExploreCommunity, 
  onContinueLearning,
  onNavigateToMyPathSection
}: DiscoveryTabProps) {
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>("unit-1");

  // Onboarding potential discovery state
  const [onboardingView, setOnboardingView] = useState<"overview" | "quiz" | "result" | "habit">(() => {
    const completedOnboard = localStorage.getItem("pm_scholar_completed_onboard");
    return completedOnboard ? "habit" : "overview";
  });
  
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [archetypeResult, setArchetypeResult] = useState<{
    title: string;
    description: string;
    badge: string;
    focusArea: string;
    focusAction: string;
  } | null>(null);

  const QUIZ_QUESTIONS = [
    {
      id: "challenge",
      text: "What is your primary continuous discovery obstacle today?",
      options: [
        { key: "customers", label: "Engaging and recruiting customers consistently", desc: "You want structured loops to regularly interview target cohorts." },
        { key: "insights", label: "Mapping messy interview notes into code tasks", desc: "You struggle to convert open-ended answers into clear product requirements." },
        { key: "priority", label: "Prioritizing validation checks against stakeholders", desc: "You need mathematical consensus models to prove value and viability." }
      ]
    },
    {
      id: "validation",
      text: "How do you currently run product validation?",
      options: [
        { key: "instinct", label: "Instinct & competitive guesswork", desc: "Fast, but risky. You want grounded heuristics and metrics." },
        { key: "quantitative", label: "Basic quantitative RICE indexes or charts", desc: "Good starting point, but lacks structural qualitative validation." },
        { key: "external", label: "None, stakeholders or executives decide", desc: "You seek logical arguments and customer-evidence frameworks to push back." }
      ]
    },
    {
      id: "persona",
      text: "What is your target PM learning profile?",
      options: [
        { key: "tactician", label: "Tactical Execution PM", desc: "Focuses on delivery speed, clear stories, and immediate customer problems." },
        { key: "visionary", label: "Strategic Visionary Leader", desc: "Focuses on long-term opportunity maps, business models, and discovery habits." },
        { key: "technical", label: "Tech PM & AI Practitioner", desc: "Focuses on LLMs, autoregressive agent structures, and prompt guardrails." }
      ]
    }
  ];

  const handleQuizAnswer = (questionId: string, optionKey: string) => {
    const updatedAnswers = { ...quizAnswers, [questionId]: optionKey };
    setQuizAnswers(updatedAnswers);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      // Calculate archetype based on answers
      let title = "Discovery Practitioner";
      let badge = "🏆 Opportunities Advocate";
      let description = "You are committed to building what users genuinely want, backing decisions with qualitative customer proof.";
      let focusArea = "Opportunity Solution Trees & Customer Interviewing";
      let focusAction = "Unit 1: Continuous Discovery Syllabus";

      const challenge = updatedAnswers["challenge"];
      const validation = updatedAnswers["validation"];
      const persona = updatedAnswers["persona"];

      if (persona === "technical") {
        title = "AI Product Architect";
        badge = "🦾 Grounded Engineer";
        description = "You combine product discovery instincts with deep technical knowledge of LLMs and generative AI agent loops.";
        focusArea = "Autoregressive LLM Sandboxes (Prompt Comparator & Agent Simulator)";
        focusAction = "Play around in the 'My Path > Sandboxes' tab!";
      } else if (persona === "visionary" || challenge === "priority") {
        title = "Strategic Opportunity Explorer";
        badge = "🧠 Opportunity Architect";
        description = "You are focused on long-term value, aligning engineering efforts to validated user opportunity sub-trees.";
        focusArea = "Weighted Decision Scoring Matrices & Torres Frameworks";
        focusAction = "Practice in 'My Path > Sandboxes > Decision Matrix' & complete Unit 3.";
      } else if (challenge === "insights" || validation === "instinct") {
        title = "User-Centric Validator";
        badge = "🔍 Qualitative Alchemist";
        description = "You thrive on transforming qualitative user insights into clean, prioritizable feature definitions.";
        focusArea = "Job-to-be-Done (JTBD) Frameworks & Outcome-Based Mapping";
        focusAction = "Study Unit 2: Job-to-be-Done & Customer Interviews.";
      }

      setArchetypeResult({ title, description, badge, focusArea, focusAction });
      setOnboardingView("result");
      localStorage.setItem("pm_scholar_completed_onboard", "true");
    }
  };

  const getUnitProgress = (unit: Unit) => {
    const lessonIds = unit.lessons.map((l) => l.id);
    const completed = lessonIds.filter((id) => progress.completedLessonIds.includes(id)).length;
    return {
      completed,
      total: lessonIds.length,
      percentage: Math.round((completed / lessonIds.length) * 100)
    };
  };

  const isUnitUnlocked = (unit: Unit) => {
    if (unit.number === 1) return true;
    
    // Unlocked only if all lessons of the previous unit are completed
    const prevUnit = UNITS.find((u) => u.number === unit.number - 1);
    if (!prevUnit) return false;

    return prevUnit.lessons.every((l) => progress.completedLessonIds.includes(l.id));
  };

  const currentGoalUnit = UNITS[0]; // Unit 1 is the default habit goal
  const goalProgress = getUnitProgress(currentGoalUnit);

  const toggleExpand = (unitId: string) => {
    setExpandedUnitId(expandedUnitId === unitId ? null : unitId);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="discovery-tab">
      {/* APP POTENTIAL DISCOVERY & ONBOARDING HUB */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="discovery-onboarding-hub">
        {/* Navigation tabs inside the Welcome Card */}
        <div className="bg-slate-900 px-4 py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <h3 className="font-display font-extrabold text-xs tracking-wider uppercase">Discovery Control Center</h3>
          </div>
          
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700/50 self-start sm:self-auto">
            <button
              onClick={() => setOnboardingView("overview")}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                onboardingView === "overview" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              How it Works
            </button>
            <button
              onClick={() => {
                setQuizStep(0);
                setQuizAnswers({});
                setOnboardingView("quiz");
              }}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                onboardingView === "quiz" || onboardingView === "result" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              Discover Style
            </button>
            <button
              onClick={() => setOnboardingView("habit")}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                onboardingView === "habit" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
              }`}
            >
              Habit Tracker
            </button>
          </div>
        </div>

        {/* View 1: Application potential overview */}
        {onboardingView === "overview" && (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 font-extrabold block">Welcome to PM Scholar</span>
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 tracking-tight mt-0.5">
                Master Continuous Discovery Under One Roof
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Most platforms give you simple textbooks. PM Scholar combines three active pedagogical pillars to guarantee true industry readiness. Click tabs to discover:
              </p>
            </div>

            {/* Three Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold font-display">1. Theoretical Core</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Structured microlearning path adapted from the Teresa Torres continuous discovery methodology. Build true fundamentals.
                </p>
              </div>

              <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold font-display">2. Sandbox Rooms</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Five playable playgrounds (Prompt Comparator, Predictor, RICE Matrix, Agent Trace, Scorecard) in <strong>My Path &gt; Sandboxes</strong>.
                </p>
              </div>

              <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Gamepad2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold font-display">3. Case Adventures</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  AI-driven branching CYOA games. Test decision trade-offs and team morale metrics under <strong>My Path &gt; AI Onboarding</strong>.
                </p>
              </div>
            </div>

            {/* CTA panel */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setQuizStep(0);
                  setQuizAnswers({});
                  setOnboardingView("quiz");
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition flex justify-center items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                Discover My Learning Style <UserCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOnboardingView("habit")}
                className="bg-slate-100 hover:bg-slate-250 text-slate-700 border border-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer"
              >
                Explore Core Syllabus <Play className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* View 2: Onboarding quiz */}
        {onboardingView === "quiz" && (
          <div className="p-5 space-y-4 animate-fadeIn">
            {/* Steps tracker */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[10px] font-mono tracking-wider font-extrabold text-indigo-600 uppercase">
                PRACTITIONER DIAGNOSTIC &bull; STEP {quizStep + 1} OF {QUIZ_QUESTIONS.length}
              </span>
              <div className="flex gap-1">
                {QUIZ_QUESTIONS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 w-6 rounded-full transition-all duration-350 ${
                      idx === quizStep ? "bg-indigo-600" : idx < quizStep ? "bg-indigo-400" : "bg-slate-100"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Question description */}
            <div className="space-y-3">
              <h4 className="font-display font-black text-sm sm:text-base text-slate-850 leading-snug">
                {QUIZ_QUESTIONS[quizStep].text}
              </h4>
              
              <div className="space-y-2">
                {QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => {
                  const letters = ["A", "B", "C"];
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleQuizAnswer(QUIZ_QUESTIONS[quizStep].id, opt.key)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/15 cursor-pointer transition-all duration-200 flex items-start gap-3 group"
                    >
                      <span className="bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-700 border border-slate-200 group-hover:border-indigo-250 text-xs font-mono font-black py-0.5 px-2 rounded shrink-0">
                        {letters[idx]}
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block group-hover:text-slate-900 leading-tight">
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block leading-normal">
                          {opt.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View 3: Onboarding result */}
        {onboardingView === "result" && archetypeResult && (
          <div className="p-5 space-y-4 animate-fadeIn">
            <div className="text-center space-y-2 pb-3 border-b border-slate-100">
              <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 mb-1 animate-bounce">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-widest text-indigo-600 font-extrabold uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150">
                  {archetypeResult.badge}
                </span>
                <h3 className="font-display font-black text-lg text-slate-900 mt-1.5 leading-none">
                  Archetype: {archetypeResult.title}
                </h3>
              </div>
              <p className="text-xs text-slate-550 max-w-sm mx-auto leading-relaxed">
                {archetypeResult.description}
              </p>
            </div>

            {/* Custom study recommendation */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1 text-left">
              <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-emerald-700 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" /> High-Yield Study Focus:
              </span>
              <span className="font-bold text-xs text-slate-800 block">
                {archetypeResult.focusArea}
              </span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Based on your goals, we recommend this path: <strong>{archetypeResult.focusAction}</strong>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setOnboardingView("habit")}
                className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition flex justify-center items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                Go to Core Syllabus <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setQuizStep(0);
                  setQuizAnswers({});
                  setOnboardingView("quiz");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2.5 px-3.5 rounded-xl text-xs transition cursor-pointer"
              >
                Retake Diagnostic
              </button>
            </div>
          </div>
        )}

        {/* View 4: Core Habits Progress Board (Standard Hero Goal) */}
        {onboardingView === "habit" && (
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 overflow-hidden animate-fadeIn" id="hero-goal-card">
            {/* Ambient background accent */}
            <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute left-1/4 bottom-0 w-48 h-10 bg-gradient-to-r from-blue-500/20 to-indigo-500/10 rounded-full blur-xl"></div>

            <span className="text-[10px] uppercase font-mono tracking-widest text-[#eff4ff] font-bold block mb-1">
              CURRENT HABIT GOAL
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-4">
              Your Syllabus Mastery Habit
            </h2>

            {/* Dynamic Goal unit */}
            <div className="flex justify-between items-center text-xs text-[#eff4ff] mb-2 font-semibold">
              <span className="truncate max-w-[200px]">Unit 1: Continuous Discovery Basics</span>
              <span className="font-mono">{goalProgress.percentage}%</span>
            </div>

            {/* Progress Bar slider */}
            <div className="h-2.5 bg-blue-900/40 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${goalProgress.percentage}%` }}
              ></div>
            </div>

            {/* Continue Learning CTA button matches layout */}
            <button
              onClick={onContinueLearning}
              className="w-full bg-white hover:bg-slate-50 text-blue-700 font-bold py-3 px-4 rounded-xl shadow-sm text-xs sm:text-sm transition flex justify-center items-center gap-1.5 cursor-pointer"
              id="continue-learning-hero-btn"
            >
              Continue Learning Syllabus <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        )}
      </div>

      {/* CAPABILITY EXPLORER: ACTIVE PRACTICE ARENAS */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-blue-700">Practice Arenas Map</span>
          <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight mt-0.5">
            How the App Helps You Master the Syllabus
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            True mastery doesn't come from memorizing definitions. PM Scholar integrates five interactive sandboxes and AI branching roleplay scenarios to let you actively practice Continuous Discovery.
          </p>
        </div>

        {/* Dynamic Capability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Card 1: Prompt Comparator Room */}
          <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-3xs transition-all duration-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800">
                    Prompt Comparator Playground
                  </h4>
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold">Active Practice Tool</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Test different LLM prompts side-by-side to understand how custom system instructions and strict guardrails change the quality of user-interview analysis.
              </p>
            </div>
            
            <div className="pt-2">
              <button
                onClick={() => onNavigateToMyPathSection?.("sandboxes")}
                className="w-full text-center py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold border border-slate-200 hover:border-blue-300 rounded-lg text-xs cursor-pointer transition duration-200"
              >
                Launch Prompt Sandbox &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Hypothesis Scoring Matrix */}
          <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-3xs transition-all duration-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800">
                    Assumption Scoring Matrix
                  </h4>
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold">Validation Simulator</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Enter user opportunities, assign scores to mathematical variables, and generate relative risk factors to prove what features have actual viability.
              </p>
            </div>
            
            <div className="pt-2">
              <button
                onClick={() => onNavigateToMyPathSection?.("sandboxes")}
                className="w-full text-center py-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold border border-slate-200 hover:border-indigo-300 rounded-lg text-xs cursor-pointer transition duration-200"
              >
                Launch Decision Matrix &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BRANCHING ADVENTURE SPOTLIGHT BLOCK (CRITICAL REQUEST EXPLAINED & HIGHLIGHTED) */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-5 border border-emerald-500/30 shadow-md space-y-4 relative overflow-hidden" id="branching-adventure-spotlight">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-48 h-10 bg-indigo-500/10 rounded-full blur-xl"></div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider">
              <Gamepad2 className="w-3 h-3" /> RECOMMENDED ACTIVE ROLEPLAY
            </div>
            <h3 className="font-display font-black text-base sm:text-lg tracking-tight text-white mt-1">
              Interactive Branching Adventure Simulator
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Don't just read definitions—live them! Face real-world stakeholder friction, engineering compromises, and customer recruitment trade-offs in our **Choose Your Own Adventure (CYOA)** game.
            </p>
          </div>
          
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
            ⚡ Double XP Quest
          </span>
        </div>

        {/* Dynamic Interactive Features Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-200">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
            <span className="text-xs font-bold block text-white">🎭 Custom Roleplay Profiles</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Select your persona (Product Manager, Lead Architect, UX Researcher) to experience role-specific constraints and scenarios.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
            <span className="text-xs font-bold block text-white">📊 Interactive Team Metrics</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Every decision moves real-time meters: **Stakeholder Morale**, **Discovery Velocity**, and **Feature Confidence**.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
            <span className="text-xs font-bold block text-white">🧠 Gemini-Generated Specs</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Paste your company's actual product wiki notes to compile custom, hyper-relevant branch scenarios on the fly.
            </p>
          </div>
        </div>

        {/* Mini Simulated Status Console Mockup */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 font-mono space-y-2.5 text-xs text-emerald-400">
          <div className="flex justify-between items-center text-[10px] text-slate-505 border-b border-white/5 pb-1.5">
            <span>📟 CYOA SIMULATOR TELEMETRY</span>
            <span className="animate-pulse flex items-center gap-1 text-emerald-500">● LIVE STANDBY</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">Current Morale Level:</span>
              <div className="flex items-center gap-2">
                <div className="flex-grow bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-550 h-full w-[75%]"></div>
                </div>
                <span className="text-[10px] font-bold">75%</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">Discovery Velocity:</span>
              <div className="flex items-center gap-2">
                <div className="flex-grow bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-550 h-full w-[80%]"></div>
                </div>
                <span className="text-[10px] font-bold">80%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Large Button Deep-Link */}
        <button
          onClick={() => onNavigateToMyPathSection?.("ai-onboarding")}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm transition flex justify-center items-center gap-2 cursor-pointer border border-emerald-400/20"
        >
          <Gamepad2 className="w-4 h-4 text-emerald-200" /> Start CYOA Branching Adventure Now &rarr;
        </button>
      </div>

      {/* GAMIFICATION CORE QUESTS & PROGRESS Road-Map (CRITICAL REQUEST SHOWCASED) */}
      <div className="space-y-4" id="gamification-quests">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-indigo-600">Engagement Framework</span>
          <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight mt-0.5">
            Daily Milestone Quests &amp; Gamification Loop
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            Continuous Discovery isn't a task—it's a habit. The platform integrates a complete gamification engine to ensure daily consistency and track completion.
          </p>
        </div>

        {/* Quests Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs p-4 sm:p-5 space-y-4">
          
          {/* Header Scoreboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pb-4 border-b border-slate-100">
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-500 shrink-0">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block">Current Streak</span>
                <span className="font-mono text-xs font-bold text-slate-800">{progress.streak} Active Days</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-500 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block">XP Earned</span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {progress.completedLessonIds.length * 150} XP Points
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-500 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block">Certificate Status</span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {progress.completedLessonIds.length === 12 ? "100% UNLOCKED" : `${Math.round((progress.completedLessonIds.length / 12) * 100)}% Complete`}
                </span>
              </div>
            </div>
          </div>

          {/* Gamified Checklist Quests */}
          <div className="space-y-3">
            <span className="text-[9px] uppercase font-mono text-slate-400 font-extrabold block tracking-wider">Your Active Gamification Tasks</span>
            
            {/* Quest 1: Diagnostic */}
            {(() => {
              const completedOnboard = localStorage.getItem("pm_scholar_completed_onboard") === "true";
              return (
                <div className={`flex items-start justify-between p-3.5 rounded-xl border transition duration-205 ${
                  completedOnboard ? "bg-emerald-50/20 border-emerald-200" : "bg-white border-slate-200"
                }`}>
                  <div className="flex gap-3 items-start">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      completedOnboard ? "bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-bold" : "bg-slate-50 text-slate-400 border-slate-250"
                    }`}>
                      {completedOnboard ? "✓" : "○"}
                    </span>
                    <div>
                      <span className={`text-xs font-bold block ${completedOnboard ? "text-slate-800" : "text-slate-700"}`}>
                        Practitioner Diagnostic Verification
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        Identify your custom Discovery learning profile and target recommendations.
                      </p>
                      {completedOnboard && (
                        <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50/50 border border-emerald-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                          Archetype Analyzed Successfully (+100 XP)
                        </span>
                      )}
                    </div>
                  </div>

                  {!completedOnboard && (
                    <button
                      onClick={() => setOnboardingView("quiz")}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] shrink-0 cursor-pointer transition animate-pulse"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Quest 2: Streak Study */}
            <div className={`flex items-start justify-between p-3.5 rounded-xl border transition duration-200 ${
              progress.streak > 0 ? "bg-emerald-50/20 border-emerald-200" : "bg-white border-slate-200"
            }`}>
              <div className="flex gap-3 items-start">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  progress.streak > 0 ? "bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-bold" : "bg-slate-50 text-slate-400 border-slate-250"
                }`}>
                  {progress.streak > 0 ? "✓" : "○"}
                </span>
                <div>
                  <span className={`text-xs font-bold block ${progress.streak > 0 ? "text-slate-800" : "text-slate-700"}`}>
                    Establish Active Study Streak
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                    Complete any lesson review to start or grow your study streak index.
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      🔥 Streak: {progress.streak} Days
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Streak multipliers boost overall XP!</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onContinueLearning}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 shrink-0 cursor-pointer transition"
              >
                Learn Now
              </button>
            </div>

            {/* Quest 3: Curriculum Mastery */}
            {(() => {
              const lessonsDone = progress.completedLessonIds.length;
              const hasDoneAny = lessonsDone > 0;
              return (
                <div className={`flex items-start justify-between p-3.5 rounded-xl border transition duration-200 ${
                  lessonsDone === 12 ? "bg-emerald-50/20 border-emerald-200" : "bg-white border-slate-200"
                }`}>
                  <div className="flex gap-3 items-start flex-grow">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      lessonsDone === 12 ? "bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-bold" : "bg-slate-50 text-slate-400 border-slate-250"
                    }`}>
                      {lessonsDone === 12 ? "✓" : "○"}
                    </span>
                    <div className="flex-grow">
                      <span className="text-xs font-bold block text-slate-800">
                        Complete Theoretical Core Syllabus
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        Finish all 4 Units adapting Torres' Continuous Discovery guidelines.
                      </p>
                      
                      {/* Micro Progress Bar */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                          <span>Syllabus Reviews:</span>
                          <span>{lessonsDone} / 12 lessons</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full border border-slate-200/50">
                          <div 
                            className="bg-indigo-650 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(lessonsDone / 12) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToMyPathSection?.("journey")}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 shrink-0 ml-3 cursor-pointer transition"
                  >
                    View Units
                  </button>
                </div>
              );
            })()}

            {/* Quest 4: Sandbox Practicum */}
            <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border bg-slate-50 text-slate-400 border-slate-250">
                  ○
                </span>
                <div>
                  <span className="text-xs font-bold block text-slate-700">
                    Interact with Sandbox Playgrounds
                  </span>
                  <p className="text-[10px] text-slate-550 mt-0.5 leading-normal">
                    Test LLM structures, prompt guardrails, or build scoring decision metrics side-by-side.
                  </p>
                  <span className="text-[9px] font-mono font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                    5 Active Playgrounds Available (+150 XP per review)
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigateToMyPathSection?.("sandboxes")}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] border border-indigo-200 shrink-0 cursor-pointer transition shadow-3xs"
              >
                Go Sandbox
              </button>
            </div>

            {/* Quest 5: Official Certificate share */}
            {(() => {
              const allDone = progress.completedLessonIds.length === 12;
              return (
                <div className={`flex items-start justify-between p-3.5 rounded-xl border transition duration-200 ${
                  allDone ? "bg-amber-50/15 border-amber-300" : "bg-slate-50/45 border-slate-200/60 text-slate-400"
                }`}>
                  <div className="flex gap-3 items-start">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      allDone ? "bg-amber-100 text-amber-800 border-amber-300 text-xs font-bold animate-pulse" : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {allDone ? "★" : "🔒"}
                    </span>
                    <div>
                      <span className={`text-xs font-bold block ${allDone ? "text-amber-900" : "text-slate-500 font-normal"}`}>
                        Certified Discovery Practitioner Badge
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        Unlock, display, and share your verifiable practitioner certificate to the community forum.
                      </p>
                      {allDone ? (
                        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded mt-1.5 inline-block animate-bounce">
                          🎉 UNLOCKED - Claim in Profile!
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                          Unlocks automatically after completing 12 curriculum lessons.
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigateToMyPathSection?.("journey");
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 shrink-0 cursor-pointer transition"
                  >
                    {allDone ? "Claim Badge" : "View Progress"}
                  </button>
                </div>
              );
            })()}

          </div>
        </div>
      </div>

      {/* CONTINUOUS DISCOVERY CORE AXIOMS */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-indigo-600 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" /> Daily Discovery Axioms
          </span>
          <h3 className="font-display font-bold text-base text-slate-800 tracking-tight mt-0.5">
            Philosophy Grounding
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
            Keep these core principles from continuous discovery experts in mind during your practice sessions today:
          </p>
        </div>

        <div className="space-y-3.5">
          <div className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">We don't validate ideas, we test assumptions.</span>
              <p className="text-[10px] text-slate-550 leading-relaxed mt-0.5">
                Testing a whole product idea is too slow. Break it down into smaller, testable viability, feasibility, usability, and value assumptions.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start border-t border-slate-200/50 pt-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Focus on Opportunities, Not Solutions.</span>
              <p className="text-[10px] text-slate-550 leading-relaxed mt-0.5">
                Always map custom user needs and opportunities first. Don't jump directly into feature solutions, or you risk wasting engineering hours on things that don't shift metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation advice */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5 text-[11px]">
            <BookOpen className="w-4.5 h-4.5 text-blue-600 shrink-0" /> Ready to browse units?
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Syllabus is now centralized in <strong className="text-slate-700">My Path &gt; Journey &amp; Badges</strong>
          </span>
        </div>
      </div>

      {/* Learn with the Squad banner container */}
      <div className="bg-slate-50 border border-dashed border-blue-200 rounded-2xl p-6 text-center shadow-2xs flex flex-col items-center justify-center space-y-4" id="squad-invites">
        <div className="w-12 h-12 bg-blue-100/60 rounded-full flex items-center justify-center text-blue-600">
          <Users className="w-5 h-5" />
        </div>
        <div className="max-w-md">
          <h4 className="font-display font-semibold text-base text-slate-900">
            Learn with the Squad
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Join 2,400+ other Product Managers in the community to share insights, check statements, and exchange validation techniques.
          </p>
        </div>
        <button
          onClick={onExploreCommunity}
          className="bg-blue-50 hover:bg-blue-100/80 border border-blue-200/50 text-blue-700 px-5 py-2 hover:px-6 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all duration-200"
          id="explore-community-btn"
        >
          Explore Community <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
