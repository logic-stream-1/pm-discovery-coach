import React, { useState } from "react";
import { X, Copy, Share2, Sparkles, Flame, Check } from "lucide-react";
import { Unit } from "../types";
import { trackEvent } from "../lib/analytics";

interface UnitCompletionOverlayProps {
  unit: Unit;
  streak: number;
  onClose: () => void;
}

const keyConcepts: Record<string, string[]> = {
  "unit-1": [
    "Teresa Torres Continuous Discovery Cadence",
    "Product Trio (PM-Designer-Dev) Customer interviews",
    "Opportunity-Solution Trees modeling"
  ],
  "unit-2": [
    "Jobs-to-be-Done Philosophy (We Hire Products)",
    "Motivation and Situational context pairing",
    "Writing contamination-free Job Statements"
  ],
  "unit-3": [
    "Desirability, Feasibility, Usability, and Viability Risks",
    "David Bland's Horizontal-Vertical 2x2 Mapping Grid",
    "Visualizing High-Importance, Low-Evidence Danger Zones"
  ],
  "unit-4": [
    "Overcoming Executive Bias & HiPPOs",
    "Intercom RICE scoring math formula calculation",
    "Balancing Reach, Impact, Confidence, and Developer Effort"
  ]
};

export default function UnitCompletionOverlay({ unit, streak, onClose }: UnitCompletionOverlayProps) {
  const [copied, setCopied] = useState(false);

  // Trigger track event whenCompletionScreen mounts
  React.useEffect(() => {
    trackEvent("unit_completed", { unit_id: unit.id });
  }, [unit.id]);

  const concepts = keyConcepts[unit.id] || [
    "Continuous Customer Learning Habits",
    "Rigorous Hypothesis Validation Frames",
    "Logic-Driven Roadmap Delivery Models"
  ];

  const appUrl = (import.meta as any).env?.VITE_APP_URL || (import.meta as any).env?.APP_URL || window.location.href;

  const shareText = `I just completed "${unit.title}" on the Product Discovery App.
Learned:
• ${concepts[0]}
• ${concepts[1]}
• ${concepts[2]}
Streak: ${streak} days 🔥
Try it free: ${appUrl}`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      trackEvent("share_triggered", { unit_id: unit.id, method: "clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy share text to clipboard", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Completed ${unit.title}!`,
          text: shareText,
          url: appUrl
        });
        trackEvent("share_triggered", { unit_id: unit.id, method: "native" });
      } catch (err) {
        // User may cancel or encounter an error, fallback to clipboard
        console.warn("Native share dismissed, copying to clipboard instead.", err);
        handleCopyToClipboard();
      }
    } else {
      // Fallback
      handleCopyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-left animate-fadeIn" id="unit-completion-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative max-h-[92vh] border border-slate-100">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500"></div>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center relative">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
            <Sparkles className="w-8 h-8 fill-current" />
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            UNIT COMPLETED
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-950 mt-3 tracking-tight">
            Level Up! Unit {unit.number} Conquered
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-normal">
            You have successfully completed every active recall milestone for <strong>{unit.title}</strong>!
          </p>
        </div>

        {/* Scrollable Center Details */}
        <div className="px-6 py-2 overflow-y-auto space-y-4">
          
          {/* Key learning takeaways block */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-sans mb-2">
              Key Insights Mastered:
            </h4>
            <ul className="space-y-2">
              {concepts.map((concept, index) => (
                <li key={index} className="flex gap-2.5 items-start text-xs text-slate-700">
                  <span className="text-blue-500 font-bold text-sm leading-none mt-0.5">•</span>
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Share Preview Text area */}
          <div className="bg-indigo-50/40 border border-dashed border-indigo-150 p-4 rounded-xl relative">
            <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-indigo-500 block mb-2">
              Shareable Summary Preview:
            </span>
            <p className="text-[11px] font-mono text-slate-600 leading-normal whitespace-pre-wrap select-all bg-white/80 p-3 rounded-lg border border-slate-100/50">
              {shareText}
            </p>
          </div>

          {/* Active streak indicators */}
          <div className="flex items-center gap-3 bg-rose-50/40 border border-rose-100 rounded-xl p-3 justify-center">
            <Flame className="w-5 h-5 text-rose-500 fill-current animate-pulse" />
            <span className="text-xs text-slate-800 font-medium">
              You kept your learning streak burning at <strong>{streak} days</strong>!
            </span>
          </div>

        </div>

        {/* Foot Buttons */}
        <div className="p-6 space-y-2 border-t border-slate-100 mt-4 bg-slate-50 flex flex-col sm:flex-row gap-2 sm:space-y-0">
          <button
            onClick={handleCopyToClipboard}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition flex justify-center items-center gap-2 cursor-pointer shadow-3xs ${
              copied
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
            }`}
            id="completion-copy-btn"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Text
              </>
            )}
          </button>

          <button
            onClick={handleNativeShare}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-xs transition flex justify-center items-center gap-2 cursor-pointer"
            id="completion-share-btn"
          >
            <Share2 className="w-4 h-4" /> Share Summary
          </button>
        </div>

        {/* Close Button cross on absolute top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          id="close-completion-overlay"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
