import React, { useState } from "react";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  type: "situation" | "motivation" | "outcome";
  feedback: string;
}

const SITUATION_OPTIONS: Option[] = [
  {
    id: "sit-1",
    text: "When rushing between back-to-back online meetings with only 5 minutes to spare,",
    isCorrect: true,
    type: "situation",
    feedback: "Excellent! This is highly specific, observable physical/routine context."
  },
  {
    id: "sit-2",
    text: "When I am in a bad mood and feel lazy,",
    isCorrect: false,
    type: "situation",
    feedback: "Too vague. Moods are fleeting and hard to target with precise triggers."
  },
  {
    id: "sit-3",
    text: "When opening the mobile application dashboard from my smartphone,",
    isCorrect: false,
    type: "situation",
    feedback: "This describes clicking a button / app load, not the human context or problem trigger."
  }
];

const MOTIVATION_OPTIONS: Option[] = [
  {
    id: "mot-1",
    text: "I want to quickly capture action items and key decisions in one single keystroke",
    isCorrect: true,
    type: "motivation",
    feedback: "Perfection! It states the user's direct active intent without specifying heavy design widgets."
  },
  {
    id: "mot-2",
    text: "I want a smart AI-powered calendar-assistant button to schedule my tasks",
    isCorrect: false,
    type: "motivation",
    feedback: "Solution contamination! Avoid naming specific features or design widgets like 'buttons' or 'AI'."
  },
  {
    id: "mot-3",
    text: "I want to sync my central SQL database with cloud servers",
    isCorrect: false,
    type: "motivation",
    feedback: "This is a technical system task, not a human motivation or personal goal."
  }
];

const OUTCOME_OPTIONS: Option[] = [
  {
    id: "out-1",
    text: "so I can prevent missing commitments made to team members and preserve professional trust.",
    isCorrect: true,
    type: "outcome",
    feedback: "Outstanding! This is a verifiable emotional/functional success metric."
  },
  {
    id: "out-2",
    text: "so I can clicks on the screen 25% faster.",
    isCorrect: false,
    type: "outcome",
    feedback: "Too minor. This measures a mechanical micro-interaction rather than broad human value/progress."
  }
];

export default function JTBDWorkbench({ onComplete }: { onComplete?: () => void }) {
  const [selectedSit, setSelectedSit] = useState<Option | null>(null);
  const [selectedMot, setSelectedMot] = useState<Option | null>(null);
  const [selectedOut, setSelectedOut] = useState<Option | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const isAllCorrect = selectedSit?.isCorrect && selectedMot?.isCorrect && selectedOut?.isCorrect;

  const handleReset = () => {
    setSelectedSit(null);
    setSelectedMot(null);
    setSelectedOut(null);
    setShowFeedback(false);
  };

  const handleValidate = () => {
    setShowFeedback(true);
    if (isAllCorrect && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6" id="jtbd-workbench">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
            T2 · Practitioner Sandbox
          </span>
          <h3 className="font-display font-semibold text-lg text-slate-900 mt-2">
            Interactive JTBD Statement Workspace
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Construct a feature-free Job Statement matchingClayton Christensen's progress theory.
          </p>
        </div>
        {(selectedSit || selectedMot || selectedOut) && (
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 text-xs"
            id="reset-jtbd-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* The Constructing Box */}
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 sm:p-5 mb-6 shadow-xs leading-relaxed text-sm sm:text-base text-slate-800">
        <span className="text-slate-400 font-medium">When</span>{" "}
        {selectedSit ? (
          <span className={`px-2 py-0.5 rounded font-medium ${selectedSit.isCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
            {selectedSit.text.replace("When ", "")}
          </span>
        ) : (
          <span className="text-slate-400 underline decoration-dotted underline-offset-4">
            [select physical trigger situation]
          </span>
        )}
        {", "}
        <span className="text-slate-400 font-medium">I want to</span>{" "}
        {selectedMot ? (
          <span className={`px-2 py-0.5 rounded font-medium ${selectedMot.isCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
            {selectedMot.text.replace("I want to ", "")}
          </span>
        ) : (
          <span className="text-slate-400 underline decoration-dotted underline-offset-4">
            [state customer intent / motivation without feature names]
          </span>
        )}
        {" "}
        {selectedOut ? (
          <span className={`px-2 py-0.5 rounded font-medium ${selectedOut.isCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
            {selectedOut.text}
          </span>
        ) : (
          <span className="text-slate-400 underline decoration-dotted underline-offset-4">
            [specify outcome criteria mapping progress]
          </span>
        )}
      </div>

      {/* Selectors Grid */}
      <div className="space-y-4">
        {/* Situation Block */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Step 1: Choose the Situation context
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SITUATION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedSit(opt);
                  setShowFeedback(false);
                }}
                className={`text-left p-3 rounded-lg text-xs border ${
                  selectedSit?.id === opt.id
                    ? "border-blue-500 bg-blue-50/50 text-blue-950 font-medium shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                } transition cursor-pointer`}
                id={`btn-${opt.id}`}
              >
                {opt.text}
              </button>
            ))}
          </div>
          {showFeedback && selectedSit && (
            <div className={`mt-1 text-xs flex gap-1 items-start ${selectedSit.isCorrect ? "text-emerald-700" : "text-rose-600 animate-pulse"}`}>
              {selectedSit.isCorrect ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span>{selectedSit.feedback}</span>
            </div>
          )}
        </div>

        {/* Motivation Block */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Step 2: Choose the Motivation (Feature-Free)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MOTIVATION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                disabled={!selectedSit}
                onClick={() => {
                  setSelectedMot(opt);
                  setShowFeedback(false);
                }}
                className={`text-left p-3 rounded-lg text-xs border transition ${
                  !selectedSit
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                    : selectedMot?.id === opt.id
                    ? "border-blue-500 bg-blue-50/50 text-blue-950 font-medium shadow-xs cursor-pointer"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 cursor-pointer"
                }`}
                id={`btn-${opt.id}`}
              >
                {opt.text}
              </button>
            ))}
          </div>
          {showFeedback && selectedMot && (
            <div className={`mt-1 text-xs flex gap-1 items-start ${selectedMot.isCorrect ? "text-emerald-700" : "text-rose-600 animate-pulse"}`}>
              {selectedMot.isCorrect ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span>{selectedMot.feedback}</span>
            </div>
          )}
        </div>

        {/* Outcome Block */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Step 3: Specify the Expected Outcome success
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OUTCOME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                disabled={!selectedMot}
                onClick={() => {
                  setSelectedOut(opt);
                  setShowFeedback(false);
                }}
                className={`text-left p-3 rounded-lg text-xs border transition ${
                  !selectedMot
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                    : selectedOut?.id === opt.id
                    ? "border-blue-500 bg-blue-50/50 text-blue-950 font-medium shadow-xs cursor-pointer"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 cursor-pointer"
                }`}
                id={`btn-${opt.id}`}
              >
                {opt.text}
              </button>
            ))}
          </div>
          {showFeedback && selectedOut && (
            <div className={`mt-1 text-xs flex gap-1 items-start ${selectedOut.isCorrect ? "text-emerald-700" : "text-rose-600 animate-pulse"}`}>
              {selectedOut.isCorrect ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              <span>{selectedOut.feedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Buttons trigger */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleValidate}
          disabled={!selectedSit || !selectedMot || !selectedOut}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm shadow-xs transition flex justify-center items-center gap-2 ${
            (!selectedSit || !selectedMot || !selectedOut)
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isAllCorrect
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          }`}
          id="jtbd-validate-btn"
        >
          {isAllCorrect ? (
            <>
              <CheckCircle className="w-4 h-4" /> Perfect Statement Verified!
            </>
          ) : (
            "Analyze Job Statement"
          )}
        </button>
      </div>

      {showFeedback && isAllCorrect && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-xs leading-relaxed text-emerald-800 animate-fadeIn">
          <strong>Practitioner Team Sign-off:</strong> This is a masterful JTBD statement. It accurately isolates trigger triggers, describes human motivation without solution locking, and anchors success on high-impact professional metrics. You have successfully passed this sandbox validation!
        </div>
      )}
    </div>
  );
}
