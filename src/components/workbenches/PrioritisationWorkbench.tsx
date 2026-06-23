import React, { useState } from "react";
import { Check, Info, Award, HelpCircle, ArrowUpRight, TrendingUp } from "lucide-react";

interface FeatureCard {
  id: string;
  name: string;
  reach: number;
  impact: number; // 0.25 to 3
  confidence: number; // 0.5 to 1.0
  effort: number; // 1 to 12
  description: string;
}

const DEFAULT_FEATURES: FeatureCard[] = [
  {
    id: "feat-1",
    name: "Integrate Local QR Payment Gateways (UPI/OVO)",
    reach: 4000,
    impact: 2, // High
    confidence: 0.9, // 90%
    effort: 2, // 2 months
    description: "Enables customers in India/Indonesia to pay using dominant native QR systems instead of requiring credit cards."
  },
  {
    id: "feat-2",
    name: "Create 3D Carousel Swipable Menu Animations",
    reach: 5000,
    impact: 0.5, // Low
    confidence: 1.0, // 100%
    effort: 5, // 5 months (heavy customization)
    description: "Adds a fluid 3D card deck visual styling to the vehicle/driver selector screen."
  },
  {
    id: "feat-3",
    name: "Build Instant Medical Status Notification Triggers",
    reach: 1200,
    impact: 3, // Massive
    confidence: 0.5, // Low (highly speculative user demand)
    effort: 3, // 3 months
    description: "Emits sms alerts using a Twilio interface directly for order confirmations, based on a single conceptual partner request."
  }
];

export default function PrioritisationWorkbench({ onComplete }: { onComplete?: () => void }) {
  const [features, setFeatures] = useState<FeatureCard[]>(DEFAULT_FEATURES);
  const [hasToggled, setHasToggled] = useState(false);

  const calculateScore = (f: FeatureCard) => {
    const raw = (f.reach * f.impact * f.confidence) / f.effort;
    return Math.round(raw);
  };

  const handleSliderChange = (id: string, field: keyof FeatureCard, value: number) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
    setHasToggled(true);
  };

  // Sort features by their RICE score
  const sortedFeatures = [...features].sort((a, b) => calculateScore(b) - calculateScore(a));

  const uPIGatewayScore = calculateScore(features.find(f => f.id === "feat-1")!);
  const carousel3DScore = calculateScore(features.find(f => f.id === "feat-2")!);
  const twilioScore = calculateScore(features.find(f => f.id === "feat-3")!);

  const correctSortingMatched = sortedFeatures[0].id === "feat-1" && sortedFeatures[2].id === "feat-2";

  const handleVerify = () => {
    if (correctSortingMatched && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6" id="prioritisation-workbench">
      <div>
        <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
          T3 · Intercom RICE Method
        </span>
        <h3 className="font-display font-semibold text-lg text-slate-900 mt-2">
          Interactive RICE Score Calculator Workout
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Adjust the priority parameters of UPI gateway additions, 3D sliders, and SMS triggers. Realize how confidence dampers speculate-risk features.
        </p>
      </div>

      {/* Feature Adjusters Grid */}
      <div className="space-y-4 mt-6">
        {features.map((f) => {
          const score = calculateScore(f);
          return (
            <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row justify-between gap-4" id={`feat-card-${f.id}`}>
              <div className="md:w-1/3 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 leading-tight">
                    {f.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {f.description}
                  </p>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-850 px-2.5 py-1 rounded-md text-[10px] font-mono w-fit font-semibold border border-indigo-100">
                  <TrendingUp className="w-3.5 h-3.5" /> Score: {score}
                </div>
              </div>

              {/* Sliders Area */}
              <div className="md:w-2/3 grid grid-cols-2 gap-4">
                {/* REACH */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Reach</span>
                    <span className="font-bold text-slate-800 font-mono">{f.reach} active</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={f.reach}
                    onChange={(e) => handleSliderChange(f.id, "reach", parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[9px] text-slate-400 block font-sans">Monthly target experiences</span>
                </div>

                {/* IMPACT */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Impact</span>
                    <span className="font-bold text-slate-800 font-mono">x{f.impact}</span>
                  </div>
                  <select
                    value={f.impact}
                    onChange={(e) => handleSliderChange(f.id, "impact", parseFloat(e.target.value))}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-1 text-slate-700 bg-slate-50"
                  >
                    <option value="3">3.0 · Massive Impact</option>
                    <option value="2">2.0 · High Impact</option>
                    <option value="1">1.0 · Medium Impact</option>
                    <option value="0.5">0.5 · Low Impact</option>
                    <option value="0.25">0.25 · Minimal Impact</option>
                  </select>
                  <span className="text-[9px] text-slate-400 block font-sans">Core contribution factor</span>
                </div>

                {/* CONFIDENCE */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Confidence</span>
                    <span className="font-bold text-slate-800 font-mono">{(f.confidence * 100)}%</span>
                  </div>
                  <select
                    value={f.confidence}
                    onChange={(e) => handleSliderChange(f.id, "confidence", parseFloat(e.target.value))}
                    className="w-full text-xs font-medium border border-slate-200 rounded p-1 text-slate-700 bg-slate-50"
                  >
                    <option value="1.0">100% · High Certainty (Data Verified)</option>
                    <option value="0.8">80% · Medium (Interview Pattern)</option>
                    <option value="0.5">50% · Low (Speculative Hypothesis)</option>
                  </select>
                  <span className="text-[9px] text-slate-400 block font-sans">Level of validation proof</span>
                </div>

                {/* EFFORT */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Effort</span>
                    <span className="font-bold text-slate-800 font-mono">{f.effort} month(s)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={f.effort}
                    onChange={(e) => handleSliderChange(f.id, "effort", parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-[9px] text-slate-400 block font-sans">Person-months engineering</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sorted Leaderboard Outflow */}
      <div className="mt-6 bg-slate-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <Award className="w-5 h-5 text-amber-500" />
            <h4 className="font-display font-semibold text-sm">Sprint Execution Blueprint (Priority Sorted Rank)</h4>
          </div>
          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            Filtered live
          </span>
        </div>

        <div className="space-y-2">
          {sortedFeatures.map((f, index) => {
            const score = calculateScore(f);
            const isTop = index === 0;
            return (
              <div key={f.id} className={`flex items-center justify-between p-3 rounded-lg border leading-relaxed ${isTop ? "bg-blue-950/80 border-blue-800 text-blue-50" : "bg-slate-800/50 border-slate-700/50 text-slate-300"}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${isTop ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-xs block leading-tight">{f.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">RICE Score: {score}</span>
                  </div>
                </div>
                {isTop && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-sans border border-emerald-500/20">
                    Highest Priority
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification triggers */}
      {correctSortingMatched && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-xs leading-relaxed text-emerald-800 animate-fadeIn">
          <strong>Prioritisation Match Acknowledged!</strong> By balancing reach, impact, confidence, and effort, standard local payments correctly rose to Rank 1 (highest priority) and flashy 3D sliders correctly dropped to Rank 3 due to its disproportionate effort and insignificant metrics trigger. You have demonstrated complete mastery of RICE prioritisation! If you have completed other aspects of the prioritisation lesson overlays, this completes Unit 4 verification!
          {onComplete && (
            <button
              onClick={onComplete}
              className="mt-3 block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs transition text-center cursor-pointer"
            >
              Confirm Unit 4 Complete & Unlock Practitioner Badge
            </button>
          )}
        </div>
      )}
    </div>
  );
}
