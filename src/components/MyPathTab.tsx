import React, { useState } from "react";
import { Award, BookOpen, Flame, Compass, Target, Shield, Zap, CheckCircle, Sparkles, Plus, Trash2, Lightbulb, CheckSquare, Square, CheckCircle2, ChevronRight, Sliders, Terminal, ShieldCheck, Lock, ChevronUp, ChevronDown, Play } from "lucide-react";
import { UserProgress, Unit, Lesson } from "../types";
import { UNITS } from "../data/lessonsData";
import CustomPathTab from "./CustomPathTab";
import { 
  PromptComparatorWidget, 
  TokenPredictorWidget, 
  DecisionMatrixWidget, 
  AgentSimulatorLoop, 
  EvaluationBriefWidget 
} from "./InteractiveWidgets";

interface MyPathTabProps {
  progress: UserProgress;
  onUpdateLocalProgress: (newProgress: UserProgress) => void;
  onSelectCustomLesson: (lesson: Lesson, unit: Unit) => void;
  onShareToFeed: (postContent: string, unitShared: any) => void;
  onSelectLesson: (lesson: Lesson, unit: Unit) => void;
  activeSection?: "journey" | "habits" | "sandboxes" | "ai-onboarding";
  onActiveSectionChange?: (section: "journey" | "habits" | "sandboxes" | "ai-onboarding") => void;
}

export default function MyPathTab({ 
  progress, 
  onUpdateLocalProgress, 
  onSelectCustomLesson, 
  onShareToFeed, 
  onSelectLesson,
  activeSection: propActiveSection,
  onActiveSectionChange
}: MyPathTabProps) {
  const [localActiveSection, setLocalActiveSection] = useState<"journey" | "habits" | "sandboxes" | "ai-onboarding">("journey");
  
  const activeSection = propActiveSection || localActiveSection;
  const setActiveSection = onActiveSectionChange || setLocalActiveSection;
  
  // Interactive Syllabus Units state inside Journey
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>("unit-1");

  const toggleExpand = (unitId: string) => {
    setExpandedUnitId(expandedUnitId === unitId ? null : unitId);
  };

  const isUnitUnlocked = (unit: Unit) => {
    if (unit.number === 1) return true;
    const prevUnit = UNITS.find((u) => u.number === unit.number - 1);
    if (!prevUnit) return true;
    return prevUnit.lessons.every((l) => progress.completedLessonIds.includes(l.id));
  };

  const getUnitProgress = (unit: Unit) => {
    const lessonIds = unit.lessons.map((l) => l.id);
    const completed = lessonIds.filter((id) => progress.completedLessonIds.includes(id)).length;
    const total = lessonIds.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  // Sandbox active selection
  const [selectedSandbox, setSelectedSandbox] = useState<"prompt-comparator" | "token-predictor" | "decision-matrix" | "agent-simulator" | "evaluator-brief">("prompt-comparator");
  const [sandboxCompletes, setSandboxCompletes] = useState<Record<string, boolean>>({
    "prompt-comparator": false,
    "token-predictor": false,
    "decision-matrix": false,
    "agent-simulator": false,
    "evaluator-brief": false,
  });

  const handleCompleteSandbox = (id: string) => {
    setSandboxCompletes(prev => ({ ...prev, [id]: true }));
  };

  // Daily goals state
  const [dailyGoals, setDailyGoals] = useState<{ id: string; text: string; completed: boolean; isCustom?: boolean }[]>(() => {
    const saved = localStorage.getItem("pm_scholar_daily_goals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: "g1", text: "Study 1 new continuous discovery framework lesson", completed: false },
      { id: "g2", text: "Examine custom grounding scenarios in AI assistant", completed: false },
      { id: "g3", text: "Review active competency badges milestone progress", completed: false }
    ];
  });

  const [newGoalText, setNewGoalText] = useState("");

  const saveDailyGoals = (newGoals: typeof dailyGoals) => {
    setDailyGoals(newGoals);
    localStorage.setItem("pm_scholar_daily_goals", JSON.stringify(newGoals));
  };

  const handleToggleGoal = (id: string) => {
    const updated = dailyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    saveDailyGoals(updated);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = {
      id: "goal-" + Date.now(),
      text: newGoalText.trim(),
      completed: false,
      isCustom: true
    };
    const updated = [...dailyGoals, newGoal];
    saveDailyGoals(updated);
    setNewGoalText("");
  };

  const handleDeleteGoal = (id: string) => {
    const updated = dailyGoals.filter(g => g.id !== id);
    saveDailyGoals(updated);
  };

  // Aggregate stats
  const totalLessons = UNITS.flatMap((u) => u.lessons).length;
  const completedCount = progress.completedLessonIds.length;
  const estimatedMins = completedCount * 5; // assume 5 mins average study per lesson

  const isUnitCompleted = (unitId: string) => {
    const unit = UNITS.find((u) => u.id === unitId);
    if (!unit) return false;
    return unit.lessons.every((l) => progress.completedLessonIds.includes(l.id));
  };

  const badges = [
    {
      id: "b1",
      name: "Discovery Pioneer",
      desc: "Complete Unit 1: Continuous Discovery Habits",
      unlocked: isUnitCompleted("unit-1"),
      icon: Compass,
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
      id: "b2",
      name: "JTBD Craftsman",
      desc: "Complete Unit 2: Jobs-to-be-Done Workbench",
      unlocked: isUnitCompleted("unit-2"),
      icon: Target,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    {
      id: "b3",
      name: "Hypothesis Shield",
      desc: "Complete Unit 3: Assumption Mapping Matrix",
      unlocked: isUnitCompleted("unit-3"),
      icon: Shield,
      color: "bg-indigo-100 text-indigo-700 border-indigo-200"
    },
    {
      id: "b4",
      name: "Logical Prioritizer",
      desc: "Complete Unit 4: RICE Framework Sandbox",
      unlocked: isUnitCompleted("unit-4"),
      icon: Zap,
      color: "bg-amber-100 text-amber-700 border-amber-200"
    },
    {
      id: "b5",
      name: "Streak Fire starter",
      desc: "Maintain an active streak greater than 5 days",
      unlocked: progress.streak > 5,
      icon: Flame,
      color: "bg-rose-100 text-rose-700 border-rose-200"
    }
  ];

  // Global completion percent
  const pathPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Dynamic study suggestions based on progress
  const getSuggestions = () => {
    const list = [];
    if (completedCount === 0) {
      list.push({
        title: "Launch Unit 1",
        desc: "Begin with Unit 1: 'Continuous Discovery Habits' to explore Opportunity-Solution Trees.",
        actionLabel: "Start Studying",
        tab: "discovery"
      });
    } else {
      if (!isUnitCompleted("unit-1")) {
        list.push({
          title: "Unlock Discovery Badge",
          desc: "Complete the remaining quizzes in Unit 1 to claim your 'Discovery Pioneer' badge.",
          actionLabel: "View Unit 1",
          tab: "discovery"
        });
      }
      if (!isUnitCompleted("unit-2")) {
        list.push({
          title: "Run the JTBD Playground",
          desc: "Practice translating user inputs into core functional jobs on the interactive JTBD Workbench.",
          actionLabel: "Launch Playground",
          tab: "discovery"
        });
      }
      if (progress.streak < 3) {
        list.push({
          title: "Build Streak Momentum",
          desc: "Complete at least one microlearning activity today to scale your active streak multipliers.",
          actionLabel: "Boost Streak",
          tab: "discovery"
        });
      }
    }

    // Always offer a personalized suggestion
    list.push({
      title: "Ground Prompt Grounding",
      desc: "Simulate prompt differences to reduce hallucination rates in the AI Custom Path Assistant.",
      actionLabel: "Open AI Assistant",
      action: () => setActiveSection("ai-onboarding")
    });

    return list;
  };

  const suggestions = getSuggestions();

  return (
    <div className="space-y-6 animate-fadeIn" id="my-path-tab">
      {/* PERSISTENT TOP-LEVEL GAMIFIED PROGRESS BOARD */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Flame Streak & Mastery */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-slate-800 border-2 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
            <span className="absolute -bottom-1 bg-rose-600 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded-full border border-slate-900">
              {progress.streak}D
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase">MASTERY LEVEL</span>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                {completedCount >= 10 ? "Discovery Champion" : completedCount >= 6 ? "Specialist" : completedCount >= 3 ? "Associate" : "Initiate"}
              </span>
            </div>
            <h3 className="font-display font-extrabold text-base text-slate-100 tracking-tight mt-0.5">
              Continuous Discovery Practitioner
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
              Daily Streak active &bull; Completed {completedCount} quizzes &bull; 1.5x Daily Multiplier
            </p>
          </div>
        </div>

        {/* Middle: Daily Habits Goal Progress */}
        <div className="space-y-1 bg-slate-800/40 p-2.5 sm:px-4 rounded-xl border border-slate-800 min-w-[160px]">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-blue-400" /> Daily Targets</span>
            <span className="font-mono text-emerald-400">
              {dailyGoals.filter(g => g.completed).length} / {dailyGoals.length}
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(dailyGoals.filter(g => g.completed).length / (dailyGoals.length || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Right: Next Badge Milestone Target */}
        <div className="space-y-1.5 bg-slate-850 p-2.5 sm:px-4 rounded-xl border border-slate-800">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold block">NEXT COMPREHENSIVE BADGE</span>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-500 rounded">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-200 block leading-tight">
                {!isUnitCompleted("unit-1") ? "Discovery Pioneer" : !isUnitCompleted("unit-2") ? "JTBD Craftsman" : !isUnitCompleted("unit-3") ? "Hypothesis Shield" : "Logical Prioritizer"}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {!isUnitCompleted("unit-1") ? "Complete Unit 1 lessons" : !isUnitCompleted("unit-2") ? "Complete Unit 2 lessons" : !isUnitCompleted("unit-3") ? "Complete Unit 3 lessons" : "Complete Unit 4 lessons"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOUR CLEAN THEMATIC CATEGORIES */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 gap-1.5 shadow-3xs" id="mypath-section-selector">
        <button
          onClick={() => setActiveSection("journey")}
          className={`flex-1 py-3 px-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "journey" 
              ? "bg-white text-blue-800 shadow-sm border border-slate-200/50" 
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          <Award className={`w-4 h-4 transition ${activeSection === "journey" ? "text-amber-500 scale-110" : "text-slate-400"}`} /> 
          <span>Journey & Badges</span>
        </button>
        <button
          onClick={() => setActiveSection("habits")}
          className={`flex-1 py-3 px-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "habits" 
              ? "bg-white text-blue-800 shadow-sm border border-slate-200/50" 
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          <Target className={`w-4 h-4 transition ${activeSection === "habits" ? "text-blue-500 scale-110" : "text-slate-400"}`} /> 
          <span>Daily Habits</span>
        </button>
        <button
          onClick={() => setActiveSection("sandboxes")}
          className={`flex-1 py-3 px-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "sandboxes" 
              ? "bg-white text-indigo-800 shadow-sm border border-slate-200/50" 
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          <Sliders className={`w-4 h-4 transition ${activeSection === "sandboxes" ? "text-indigo-500 scale-110" : "text-slate-400"}`} /> 
          <span>Sandboxes</span>
        </button>
        <button
          onClick={() => setActiveSection("ai-onboarding")}
          className={`flex-1 py-3 px-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === "ai-onboarding" 
              ? "bg-white text-indigo-800 shadow-sm border border-slate-200/50" 
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          <Sparkles className={`w-4 h-4 transition ${activeSection === "ai-onboarding" ? "text-indigo-500 scale-110" : "text-slate-400"}`} /> 
          <span>AI Onboarding & Adventure</span>
        </button>
      </div>

      {/* 1. JOURNEY & BADGES TAB */}
      {activeSection === "journey" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5.5 h-5.5 text-amber-500" /> Your Product Journey
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Track your syllabus completion status alongside earned competency milestone badges in one cohesive experience.
            </p>
          </div>

          {/* Path Master Progress Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" /> Syllabus Progress Check
              </span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold">{pathPercent}% Completed</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${pathPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 block font-normal mt-1.5 leading-relaxed">
              Successfully completed {completedCount} out of {totalLessons} recall milestones in your core path.
            </span>
          </div>

          {/* Stats Counter Row */}
          <div className="grid grid-cols-3 gap-3" id="stats-dashboard-grid">
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-3xs hover:border-blue-155 transition">
              <BookOpen className="w-4 h-4 mx-auto text-blue-600 mb-1" />
              <span className="block font-mono font-bold text-lg sm:text-2xl text-slate-850 leading-none mt-1">
                {completedCount}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wide block mt-1 leading-tight">
                Lessons Done
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-3xs hover:border-indigo-155 transition">
              <Compass className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
              <span className="block font-mono font-bold text-lg sm:text-2xl text-slate-850 leading-none mt-1">
                {estimatedMins}m
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wide block mt-1 leading-tight">
                Study Time
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-3xs hover:border-rose-155 transition">
              <Flame className="w-4 h-4 mx-auto text-rose-500 mb-1" />
              <span className="block font-mono font-bold text-lg sm:text-2xl text-slate-850 leading-none mt-1">
                {progress.streak}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wide block mt-1 leading-tight">
                Day Streak
              </span>
            </div>
          </div>

          {/* Badges Achievement Grid */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-extrabold text-sm text-slate-850 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Earned Competency Badges
              </h4>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5" id="competency-badges-grid">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      b.unlocked
                        ? "bg-white border-slate-200 hover:border-slate-300 shadow-3xs"
                        : "bg-slate-50/70 border-slate-100 opacity-60"
                    }`}
                    id={`badge-card-${b.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${
                        b.unlocked ? b.color : "bg-slate-100 border-slate-200 text-slate-350"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className={`font-semibold text-xs sm:text-sm ${b.unlocked ? "text-slate-850" : "text-slate-400"}`}>
                          {b.name}
                        </h5>
                        <p className="text-[10px] sm:text-xs text-slate-450 leading-normal mt-0.5">
                          {b.desc}
                        </p>
                      </div>
                    </div>

                    <div>
                      {b.unlocked ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Syllabus Units Accordion List */}
          <div className="space-y-3.5 pt-5 border-t border-slate-200">
            <div>
              <h4 className="font-display font-extrabold text-sm text-slate-850 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" /> Syllabus Course Units
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Explore each structured microlearning unit, pass recall milestone checks, and unlock playgrounds.</p>
            </div>

            <div className="space-y-3" id="learning-path-list">
              {UNITS.map((unit) => {
                const unlocked = isUnitUnlocked(unit);
                const { completed, total, percentage } = getUnitProgress(unit);
                const isExpanded = expandedUnitId === unit.id;

                return (
                  <div
                    key={unit.id}
                    className={`border rounded-xl bg-white overflow-hidden shadow-xs transition duration-250 ${
                      unlocked ? "border-slate-200" : "border-slate-200 bg-slate-50/30"
                    }`}
                    id={`unit-container-${unit.id}`}
                  >
                    {/* Header card trigger */}
                    <div
                      onClick={() => toggleExpand(unit.id)}
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50/50"
                      id={`unit-header-${unit.id}`}
                    >
                      <div className="flex items-center gap-4">
                        {unlocked ? (
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            {/* Circle SVG */}
                            <svg className="absolute w-full h-full transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="19"
                                stroke="#eff4ff"
                                strokeWidth="3.5"
                                fill="transparent"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="19"
                                stroke="#0058be"
                                strokeWidth="3.5"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 19}
                                strokeDashoffset={2 * Math.PI * 19 * (1 - percentage / 100)}
                              />
                            </svg>
                            <span className="font-mono text-[10px] font-bold text-blue-700">
                              {completed}/{total}
                            </span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-full border border-slate-200/50 flex items-center justify-center text-slate-400 shrink-0 select-none">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}

                        {/* Unit metadata */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm tracking-wider font-mono">
                              UNIT {unit.number}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              🕒 {unit.durationMins} mins
                            </span>
                          </div>
                          <h4 className={`font-display font-bold text-sm sm:text-base mt-0.5 ${unlocked ? "text-slate-800" : "text-slate-400"}`}>
                            {unit.title}
                          </h4>
                        </div>
                      </div>

                      {/* Icon togglers */}
                      <div>
                        {unlocked ? (
                          isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-slate-400 font-mono">LOCKED</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sub-lessons expandable drawer list */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/40 p-3 sm:p-4 space-y-2">
                        {unit.lessons.map((lesson) => {
                          const isCompleted = progress.completedLessonIds.includes(lesson.id);
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (unlocked) {
                                  onSelectLesson(lesson, unit);
                                } else {
                                  alert(`🔒 This lesson is part of '${unit.title}' which is locked.\n\nTo unlock, please finish the preceding lessons first, or go to the "Profile" tab to click "Unlock All Units" to instantly explore the complete course!`);
                                }
                              }}
                              className={`flex justify-between items-center p-3 rounded-lg shadow-2xs transition ${
                                unlocked
                                  ? "bg-white border border-slate-200 hover:border-blue-400 cursor-pointer"
                                  : "bg-slate-100/50 border border-slate-150 opacity-75 hover:opacity-100 cursor-not-allowed"
                              }`}
                              id={`lesson-row-${lesson.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${
                                  !unlocked
                                    ? "bg-slate-100 text-slate-400 border border-slate-200"
                                    : isCompleted
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-slate-100 text-slate-500 border border-slate-250"
                                }`}>
                                  {!unlocked ? "🔒" : isCompleted ? "✓" : "▶"}
                                </span>
                                <div>
                                  <h5 className={`font-semibold text-xs sm:text-sm leading-tight ${unlocked ? "text-slate-800" : "text-slate-400 font-normal"}`}>
                                    {lesson.title}
                                  </h5>
                                  <span className="text-[10px] text-slate-400 block font-sans">
                                    Duration: {lesson.durationMins} mins
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* Workbench custom pill tag */}
                                {(lesson.id === "l2-3" || lesson.id === "l3-3" || lesson.id === "l4-3") && (
                                  <span className="text-[8px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded font-extrabold font-mono tracking-wide">
                                    PLAYGROUND
                                  </span>
                                )}
                                <span className={`text-xs font-bold ${unlocked ? "text-blue-600 hover:underline" : "text-slate-400"}`}>
                                  {unlocked ? "Launch" : "Locked"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. DAILY HABITS TAB */}
      {activeSection === "habits" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-5.5 h-5.5 text-blue-600 animate-pulse" /> Daily Habits & Recommendations
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Organize your continuous study habits, set customized microlearning goals, and review personalized suggestions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="daily-goals-suggestions-grid">
            {/* Checklist */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <div>
                  <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-600" /> Habits Checklist
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define your daily continuous validation rituals.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg shrink-0 text-right">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-blue-600 font-bold block leading-none">TARGETS</span>
                  <span className="font-mono text-xs font-black text-blue-700 block mt-0.5">
                    {dailyGoals.filter(g => g.completed).length} / {dailyGoals.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {dailyGoals.map(g => (
                  <div
                    key={g.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                      g.completed ? "bg-emerald-50/50 border-emerald-200 text-emerald-900" : "bg-slate-50/50 border-slate-150 hover:bg-slate-100/60"
                    }`}
                  >
                    <button
                      onClick={() => handleToggleGoal(g.id)}
                      className="flex items-center gap-2.5 text-left flex-grow cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={`text-xs ${g.completed ? "line-through text-emerald-650 font-normal" : "text-slate-700 font-bold"}`}>
                        {g.text}
                      </span>
                    </button>
                    {g.isCustom && (
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition shrink-0 cursor-pointer"
                        title="Remove custom goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {dailyGoals.length === 0 && (
                  <p className="text-[11px] text-slate-400 text-center py-4 italic">No active goals yet. Add one below!</p>
                )}
              </div>

              <form onSubmit={handleAddGoal} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newGoalText}
                  onChange={e => setNewGoalText(e.target.value)}
                  placeholder="Create custom study habit goal..."
                  className="flex-grow text-xs px-3 py-2.5 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Recommendations */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="pb-2.5 border-b border-slate-100">
                <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" /> Personalized Suggestions
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Interactive micro-actions suggested based on your progress.</p>
              </div>

              <div className="space-y-3">
                {suggestions.map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0 animate-pulse" />
                    <div className="space-y-1 flex-grow">
                      <span className="font-bold text-xs text-slate-850 block leading-tight">{s.title}</span>
                      <p className="text-[10px] text-slate-450 leading-normal font-medium">{s.desc}</p>
                      <button
                        onClick={s.action ? s.action : () => {
                          const element = document.getElementById("tab-btn-discovery");
                          if (element) element.click();
                        }}
                        className="text-[10px] font-black text-indigo-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer pt-1"
                      >
                        {s.actionLabel} &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE SANDBOXES TAB (FIRST CLASS CITIZENS EXPOSED DIRECTLY) */}
      {activeSection === "sandboxes" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div>
            <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5.5 h-5.5 text-indigo-600" /> Interactive Practitioner Sandboxes
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Directly access all 5 customized sandbox widgets. Safely simulate autoregressive token probabilities, compare contextual prompts, evaluate prioritizing matrix scores, and watch system trace audits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar Sandbox Selector */}
            <div className="space-y-2 lg:col-span-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Select a Playable Board</span>
              <div className="space-y-1.5 flex flex-col">
                {/* 1. Prompt Comparator */}
                <button
                  onClick={() => setSelectedSandbox("prompt-comparator")}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedSandbox === "prompt-comparator"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className={`w-4 h-4 shrink-0 ${selectedSandbox === "prompt-comparator" ? "text-white" : "text-amber-500"}`} />
                    <div>
                      <span className="text-xs font-bold block leading-tight">Prompt Comparator</span>
                      <span className={`text-[9px] block mt-0.5 leading-none ${selectedSandbox === "prompt-comparator" ? "text-indigo-200" : "text-slate-400"}`}>Compare standard vs grounded</span>
                    </div>
                  </div>
                  {sandboxCompletes["prompt-comparator"] && (
                    <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-mono">Run</span>
                  )}
                </button>

                {/* 2. Token Predictor */}
                <button
                  onClick={() => setSelectedSandbox("token-predictor")}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedSandbox === "token-predictor"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className={`w-4 h-4 shrink-0 ${selectedSandbox === "token-predictor" ? "text-white" : "text-indigo-500"}`} />
                    <div>
                      <span className="text-xs font-bold block leading-tight">Token Predictor</span>
                      <span className={`text-[9px] block mt-0.5 leading-none ${selectedSandbox === "token-predictor" ? "text-indigo-200" : "text-slate-400"}`}>Probability next-word game</span>
                    </div>
                  </div>
                  {sandboxCompletes["token-predictor"] && (
                    <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-mono">Run</span>
                  )}
                </button>

                {/* 3. Decision Matrix */}
                <button
                  onClick={() => setSelectedSandbox("decision-matrix")}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedSandbox === "decision-matrix"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className={`w-4 h-4 shrink-0 ${selectedSandbox === "decision-matrix" ? "text-white" : "text-indigo-500"}`} />
                    <div>
                      <span className="text-xs font-bold block leading-tight">Decision Matrix</span>
                      <span className={`text-[9px] block mt-0.5 leading-none ${selectedSandbox === "decision-matrix" ? "text-indigo-200" : "text-slate-400"}`}>Interactive RICE priorities</span>
                    </div>
                  </div>
                  {sandboxCompletes["decision-matrix"] && (
                    <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-mono">Run</span>
                  )}
                </button>

                {/* 4. Agent Simulator */}
                <button
                  onClick={() => setSelectedSandbox("agent-simulator")}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedSandbox === "agent-simulator"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className={`w-4 h-4 shrink-0 ${selectedSandbox === "agent-simulator" ? "text-white" : "text-emerald-500"}`} />
                    <div>
                      <span className="text-xs font-bold block leading-tight">Agent Simulator</span>
                      <span className={`text-[9px] block mt-0.5 leading-none ${selectedSandbox === "agent-simulator" ? "text-indigo-200" : "text-slate-400"}`}>Autonomous trace simulator</span>
                    </div>
                  </div>
                  {sandboxCompletes["agent-simulator"] && (
                    <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-mono">Run</span>
                  )}
                </button>

                {/* 5. Evaluator Brief */}
                <button
                  onClick={() => setSelectedSandbox("evaluator-brief")}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedSandbox === "evaluator-brief"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className={`w-4 h-4 shrink-0 ${selectedSandbox === "evaluator-brief" ? "text-white" : "text-emerald-500"}`} />
                    <div>
                      <span className="text-xs font-bold block leading-tight">Evaluation Scorecard</span>
                      <span className={`text-[9px] block mt-0.5 leading-none ${selectedSandbox === "evaluator-brief" ? "text-indigo-200" : "text-slate-400"}`}>Safety & SLA quality checks</span>
                    </div>
                  </div>
                  {sandboxCompletes["evaluator-brief"] && (
                    <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-mono">Run</span>
                  )}
                </button>
              </div>
            </div>

            {/* Sandbox Render Area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                {/* Visual Title Header */}
                <div className="pb-3 border-b border-slate-100 flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-600 font-bold">ACTIVE WORKSPACE</span>
                    <h4 className="font-display font-extrabold text-sm text-slate-800">
                      {selectedSandbox === "prompt-comparator" && "Prompt Comparator & Grounder Test"}
                      {selectedSandbox === "token-predictor" && "Autoregression Next-Word Predictor"}
                      {selectedSandbox === "decision-matrix" && "Continuous Feasibility Scoring Board"}
                      {selectedSandbox === "agent-simulator" && "Sense-Plan-Act Autonomous Agent Trace"}
                      {selectedSandbox === "evaluator-brief" && "Safety & SLA Evaluation Scorecard Audit"}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Live Playground</span>
                </div>

                {/* Render Selected Playground Widget */}
                {selectedSandbox === "prompt-comparator" && (
                  <PromptComparatorWidget onComplete={() => handleCompleteSandbox("prompt-comparator")} />
                )}
                {selectedSandbox === "token-predictor" && (
                  <TokenPredictorWidget onComplete={() => handleCompleteSandbox("token-predictor")} />
                )}
                {selectedSandbox === "decision-matrix" && (
                  <DecisionMatrixWidget onComplete={() => handleCompleteSandbox("decision-matrix")} />
                )}
                {selectedSandbox === "agent-simulator" && (
                  <AgentSimulatorLoop onComplete={() => handleCompleteSandbox("agent-simulator")} />
                )}
                {selectedSandbox === "evaluator-brief" && (
                  <EvaluationBriefWidget onComplete={() => handleCompleteSandbox("evaluator-brief")} />
                )}

                {/* Lesson Context */}
                <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5 text-left text-xs text-slate-600">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Grounded Practitioner Guideline:
                  </span>
                  <p className="leading-relaxed">
                    {selectedSandbox === "prompt-comparator" && "Naively querying an LLM results in loose, verbose definitions. In production, we programmatically wrap user prompts in highly grounded, structured templates bounded strictly to the verified Torres wiki."}
                    {selectedSandbox === "token-predictor" && "Large Language Models work sequentially by predicting the next probable token. Setting a high temperature introduces creative variability, while lower temperature stabilizes exact theoretical framework terms."}
                    {selectedSandbox === "decision-matrix" && "Prioritizing should not be guess-work. This continuous matrix calculates weighted RICE indexes, combining customer impact confidence ratios directly against design sprint engineering effort days."}
                    {selectedSandbox === "agent-simulator" && "Watch the step-by-step diagnostic loops. PM Scholar uses autonomous agents executing the Sense-Plan-Act paradigm, fetching grounded corporate docs from custom security-hardened storage layers."}
                    {selectedSandbox === "evaluator-brief" && "Before client-facing delivery, generative AI outputs must pass a strict heuristic audit. Complete this scorecard to verify standard SLA latencies, tone neutrality, and fact-checking boundaries."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI ONBOARDING & BRANCHING ADVENTURE TAB */}
      {activeSection === "ai-onboarding" && (
        <CustomPathTab
          progress={progress}
          onUpdateLocalProgress={onUpdateLocalProgress}
          onSelectCustomLesson={onSelectCustomLesson}
          onShareToFeed={onShareToFeed}
        />
      )}
    </div>
  );
}
