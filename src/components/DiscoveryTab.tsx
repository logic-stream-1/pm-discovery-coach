import React, { useState } from "react";
import { Play, Lock, ChevronDown, ChevronUp, Users, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Unit, Lesson, UserProgress } from "../types";
import { UNITS } from "../data/lessonsData";

interface DiscoveryTabProps {
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson, unit: Unit) => void;
  onExploreCommunity: () => void;
  onContinueLearning: () => void;
}

export default function DiscoveryTab({ progress, onSelectLesson, onExploreCommunity, onContinueLearning }: DiscoveryTabProps) {
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>("unit-1");

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
      {/* Hero Goal Card matched to mockup */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-md overflow-hidden" id="hero-goal-card">
        {/* Ambient background accent */}
        <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute left-1/4 bottom-0 w-48 h-10 bg-gradient-to-r from-blue-500/20 to-indigo-500/10 rounded-full blur-xl"></div>

        <span className="text-[10px] uppercase font-mono tracking-widest text-[#eff4ff] font-bold block mb-1">
          CURRENT GOAL
        </span>
        <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-4">
          Your Discovery Habit
        </h2>

        {/* Dynamic Goal unit */}
        <div className="flex justify-between items-center text-xs text-[#eff4ff] mb-2 font-semibold">
          <span className="truncate max-w-[200px]">Unit 1: Continuous Discovery</span>
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
          Continue Learning <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Learning Path List header matches design */}
      <div>
        <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight mb-3">
          Learning Path
        </h3>

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
                    {/* Circle Percentage display matching 3/4 mockup design */}
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
                  <div className="border-t border-slate-100 bg-slate-50/40 p-3 sm:p-4 space-y-2 animate-slideDown">
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
