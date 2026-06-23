import React, { useState } from "react";
import { User, Flame, Award, RefreshCw, CheckCircle, Trophy, BookOpen, Share2, Unlock } from "lucide-react";
import { UserProgress } from "../types";
import { UNITS } from "../data/lessonsData";
import SupabaseSync from "./SupabaseSync";

interface ProfileTabProps {
  progress: UserProgress;
  onClearProgress: () => void;
  onUnlockAllProgress: () => void;
  onShareCertificateToFeed: (name: string) => void;
  onUpdateLocalProgress: (progress: UserProgress) => void;
  onSyncTrigger?: () => void;
}

export default function ProfileTab({ 
  progress, 
  onClearProgress, 
  onUnlockAllProgress, 
  onShareCertificateToFeed,
  onUpdateLocalProgress,
  onSyncTrigger
}: ProfileTabProps) {
  const [userName, setUserName] = useState("Aspiring Product Master");
  const [isEditing, setIsEditing] = useState(false);
  const [certShared, setCertShared] = useState(false);

  const totalLessons = UNITS.flatMap((u) => u.lessons).length;
  const completedCount = progress.completedLessonIds.length;
  const allCompleted = completedCount === totalLessons && totalLessons > 0;

  const handleShareCert = () => {
    onShareCertificateToFeed(userName);
    setCertShared(true);
    alert("Certificate shared to Community Feed successfully! Open the Community tab to see your post.");
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="profile-tab">
      {/* Title */}
      <div>
        <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
          Your Professional Profile
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-normal">
          Refine your professional credentials, and download official framework certificates.
        </p>
      </div>

      {/* Profile info cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="relative">
          <div className="w-16 h-16 bg-blue-100/80 rounded-full flex items-center justify-center text-blue-600 border-2 border-white shadow-sm shrink-0">
            <User className="w-8 h-8" />
          </div>
          <span className="absolute bottom-0 right-0 w-5.5 h-5.5 bg-emerald-500 text-white border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">
            ✓
          </span>
        </div>

        <div className="flex-grow space-y-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-sm px-2.5 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-500 font-semibold"
                id="edit-username-input"
              />
              <button
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition cursor-pointer"
                id="save-username-btn"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h4 className="font-display font-bold text-base text-slate-800 leading-tight">
                {userName}
              </h4>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                id="edit-username-toggle"
              >
                (Edit)
              </button>
            </div>
          )}
          <p className="text-xs text-slate-400 font-medium font-sans">
            Continuous Discovery Practitioner Apprentice
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 flex items-center gap-1.5 shrink-0 shadow-3xs" id="streakbadge">
          <Flame className="w-5 h-5 text-rose-500 animate-pulse fill-current" />
          <div className="text-left leading-none">
            <span className="font-mono font-bold text-[15px] text-slate-800 block">
              {progress.streak} days
            </span>
            <span className="text-[9px] text-slate-450 font-semibold uppercase tracking-wider block mt-0.5">
              Discovery Streak
            </span>
          </div>
        </div>
      </div>

      {/* Supabase synchronisation */}
      <SupabaseSync progress={progress} onUpdateLocalProgress={onUpdateLocalProgress} onSyncTrigger={onSyncTrigger} />

      {/* Certificate Display Block */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50 border-b border-slate-100 p-4">
          <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" /> Professional Certification Credentials
          </h4>
        </div>

        {allCompleted ? (
          /* Unlocked beautiful certified Diploma */
          <div className="p-5 sm:p-7 text-center space-y-4 bg-gradient-to-br from-amber-50/20 to-indigo-50/10 animate-fadeIn" id="unlocked-certified-diploma">
            {/* The Certificate graphical container */}
            <div className="border-4 border-double border-amber-500/50 rounded-xl p-5 sm:p-8 bg-white shadow-md relative max-w-lg mx-auto">
              {/* Seal decor */}
              <div className="absolute right-4 bottom-4 w-12 h-12 border border-dashed border-amber-400 rounded-full flex items-center justify-center font-serif text-[10px] font-bold text-amber-600 bg-amber-50/50 opacity-80 shadow-3xs select-none">
                SEAL
              </div>

              <span className="text-[9px] tracking-widest font-mono text-amber-600 font-bold block uppercase leading-none mb-3">
                PM Scholar Institute of Continuous Discovery
              </span>
              
              <h5 className="font-serif italic text-base text-slate-500 mb-2 leading-tight">
                This certifies that
              </h5>
              
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 border-b border-slate-200 pb-1.5 w-fit mx-auto px-4 uppercase tracking-wide leading-none">
                {userName}
              </h3>
              
              <p className="font-sans text-[11px] text-slate-500 mt-4 max-w-sm mx-auto leading-relaxed">
                has successfully compiled and processed all 4 Units of study across Teresa Torres habit loops, Jobs-to-be-Done statements, david bland grids, and quantitative rice prioritisation methods.
              </p>

              <div className="mt-6 flex justify-between items-end border-t border-slate-100 pt-4 text-left max-w-sm mx-auto select-none">
                <div>
                  <span className="font-mono text-[9px] text-slate-400 block tracking-normal">credential ID</span>
                  <span className="font-mono text-[10px] font-bold text-slate-700 block">PMS-DISCO-94821</span>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-slate-400 block tracking-normal">verify code</span>
                  <span className="font-mono text-[10px] font-bold text-slate-700 block">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3 pt-3">
              <h5 className="font-display font-semibold text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 py-1.5 rounded flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Certification Verified & Active
              </h5>
              
              <button
                onClick={handleShareCert}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs text-xs transition flex justify-center items-center gap-1.5 cursor-pointer"
                id="share-cert-feed-btn"
              >
                Share Certificate to Squad Feed <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Locked indicator matching progress metrics */
          <div className="p-5 sm:p-6 text-center space-y-4" id="locked-certified-diploma">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 border border-slate-200 rounded-full flex items-center justify-center mx-auto shadow-3xs" id="lockdiploma">
              <Award className="w-6 h-6 grayscale" />
            </div>
            
            <div className="max-w-sm mx-auto">
              <h5 className="font-display font-bold text-sm text-slate-800">
                Product Discovery Certified Practitioner
              </h5>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Complete all 4 microlearning units and pass their active recall challenges to unlock your credential certificate verified badge.
              </p>
            </div>

            {/* Micro Progress metrics */}
            <div className="max-w-sm mx-auto bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl shadow-3xs text-left space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-1">
                <span>Microlearning challenge progress</span>
                <span className="font-mono">{completedCount} / {totalLessons} done</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalLessons) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Developer / testing actions */}
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 space-y-4">
        <div>
          <span className="font-display font-bold text-xs text-slate-800 block leading-tight">
            Developer & Exploration Tools
          </span>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            Quickly unlock all microlearning units, simulators, and calculators to review every interactive corner of the app instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={onUnlockAllProgress}
            className="flex-grow sm:flex-none text-emerald-600 hover:text-white border border-emerald-300 hover:bg-emerald-600 font-bold px-3.5 py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
            id="unlock-all-progress-btn"
          >
            <Unlock className="w-3.5 h-3.5" /> Unlock All Units
          </button>
          
          <button
            onClick={onClearProgress}
            className="flex-grow sm:flex-none text-rose-600 hover:text-white border border-rose-300 hover:bg-rose-600 font-bold px-3.5 py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
            id="clear-progress-profile-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Wipe Progress
          </button>
        </div>
      </div>
    </div>
  );
}
