import React from "react";
import { Award, BookOpen, Flame, Compass, Target, Shield, Zap, CheckCircle } from "lucide-react";
import { UserProgress } from "../types";
import { UNITS } from "../data/lessonsData";

interface MyPathTabProps {
  progress: UserProgress;
}

export default function MyPathTab({ progress }: MyPathTabProps) {
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

  return (
    <div className="space-y-6 animate-fadeIn" id="my-path-tab">
      {/* Title */}
      <div>
        <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
          Your Product Journey
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-normal">
          Track milestones, build durable discovery muscles, and earn official framework badges.
        </p>
      </div>

      {/* Path Master Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
          <span>Syllabus Progress</span>
          <span className="font-mono text-blue-700">{pathPercent}% Completed</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${pathPercent}%` }}
          ></div>
        </div>
        <span className="text-[10px] text-slate-400 block font-normal mt-1 leading-relaxed">
          Completed {completedCount} out of {totalLessons} interactive recall challenges
        </span>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4" id="stats-dashboard-grid">
        {/* Completed count */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 text-center shadow-3xs">
          <BookOpen className="w-4 h-4 mx-auto text-blue-600 mb-1" />
          <span className="block font-mono font-bold text-lg sm:text-2xl text-slate-800 leading-none mt-1">
            {completedCount}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wide block mt-1 leading-tight">
            Lessons Done
          </span>
        </div>

        {/* Est. Mind Minutes */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 text-center shadow-3xs">
          <Compass className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
          <span className="block font-mono font-bold text-lg sm:text-2xl text-slate-800 leading-none mt-1">
            {estimatedMins}m
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wide block mt-1 leading-tight">
            Study Time
          </span>
        </div>

        {/* Streaks */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 text-center shadow-3xs">
          <Flame className="w-4 h-4 mx-auto text-rose-500 mb-1" />
          <span className="block font-mono font-bold text-lg sm:text-2xl text-slate-800 leading-none mt-1">
            {progress.streak}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wide block mt-1 leading-tight">
            Day Streak
          </span>
        </div>
      </div>

      {/* Badges Achievement Grid */}
      <div className="space-y-3">
        <h4 className="font-display font-semibold text-sm text-slate-800">
          Earned Competency Badges
        </h4>

        <div className="grid grid-cols-1 gap-2.5" id="competency-badges-grid">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  b.unlocked
                    ? "bg-white border-slate-200"
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
                    <h5 className={`font-semibold text-xs sm:text-sm ${b.unlocked ? "text-slate-800" : "text-slate-400"}`}>
                      {b.name}
                    </h5>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-normal mt-0.5">
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
    </div>
  );
}
