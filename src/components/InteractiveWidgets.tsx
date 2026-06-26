import React, { useState } from "react";
import { Sliders, Terminal, ShieldCheck, Check, Sparkles, HelpCircle, ArrowRight, Play, Eye } from "lucide-react";

interface WidgetProps {
  onComplete: () => void;
}

// 1. PROMPT COMPARATOR WIDGET
export function PromptComparatorWidget({ onComplete }: WidgetProps) {
  const [userPrompt, setUserPrompt] = useState("Explain continuous discovery.");
  const [groundedPrompt, setGroundedPrompt] = useState("Explain continuous discovery habits strictly using Teresa Torres' frameworks, focusing on the opportunity-solution tree and keeping response under 100 words.");
  const [simulated, setSimulated] = useState(false);

  const handleSimulate = () => {
    setSimulated(true);
    onComplete();
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl" id="prompt-comparator-widget">
      <div className="flex justify-between items-center">
        <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" /> Prompt Comparison Board
        </h4>
        <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Grounding Test</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Box A */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 block">Standard Prompt (Naive)</span>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 h-20"
          />
        </div>

        {/* Box B */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-indigo-600 block">Grounded Prompt (Structured Context)</span>
          <textarea
            value={groundedPrompt}
            onChange={(e) => setGroundedPrompt(e.target.value)}
            className="w-full text-xs p-2.5 border border-indigo-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 font-mono text-[10px]"
          />
        </div>
      </div>

      {simulated ? (
        <div className="space-y-3 p-3 bg-white border border-slate-150 rounded-xl animate-fadeIn">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Outcome Comparison</span>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 block">Naive Prompt Outcome:</span>
              <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 leading-relaxed italic h-24 overflow-y-auto">
                "Continuous discovery is a process where product teams continuously gather feedback and validate ideas. It includes interviews and data analysis..." (Generic, prone to rambling hallucination)
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                <span>Hallucination Risk: <strong className="text-rose-500">High</strong></span>
                <span>Tokens: ~400</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-indigo-600 block">Grounded Prompt Outcome:</span>
              <div className="p-2 bg-indigo-50/20 border border-indigo-100 rounded text-[10px] text-indigo-900 leading-relaxed italic h-24 overflow-y-auto">
                "Continuous discovery, as defined by Teresa Torres, is weekly touchpoints with customers, by the team building the product, conducting small research activities to achieve an opportunity-solution tree." (Concise, accurate)
              </div>
              <div className="flex justify-between text-[9px] font-mono text-indigo-500 mt-1">
                <span>Hallucination Risk: <strong className="text-emerald-500">Low</strong></span>
                <span>Tokens: ~120</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed text-center mt-2 font-medium">
            💡 Perfect! Grounding your prompt with strict context parameters reduces latency by 70% and prevents hallucinations.
          </p>
        </div>
      ) : (
        <button
          onClick={handleSimulate}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition cursor-pointer text-center block"
        >
          Simulate Outcomes
        </button>
      )}
    </div>
  );
}

// 2. TOKEN PREDICTOR WIDGET
export function TokenPredictorWidget({ onComplete }: WidgetProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const handleSelect = (token: string) => {
    setSelectedToken(token);
    onComplete();
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl" id="token-predictor-widget">
      <div className="flex justify-between items-center">
        <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-indigo-500" /> Token Predictor Game
        </h4>
        <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Autoregression</span>
      </div>

      <div className="bg-white border border-slate-150 p-3.5 rounded-xl text-center space-y-2">
        <p className="text-xs text-slate-500 leading-normal">
          An LLM predicts the next word (token) sequentially based on probability. Predict the next token below:
        </p>
        <p className="font-display font-extrabold text-sm text-slate-800 tracking-tight py-2 bg-slate-50 rounded-lg">
          "Continuous product discovery requires talking to actual customers every <span className="text-indigo-600 border-b-2 border-dashed border-indigo-400 px-3">{selectedToken || "_______"}</span>"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => handleSelect("week")}
          className={`p-3 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
            selectedToken === "week"
              ? "bg-emerald-50 border-emerald-400 text-emerald-800"
              : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
        >
          week (Probability: 84.6%)
        </button>
        <button
          onClick={() => handleSelect("quarter")}
          className={`p-3 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
            selectedToken === "quarter"
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
        >
          quarter (Probability: 12.1%)
        </button>
        <button
          onClick={() => handleSelect("year")}
          className={`p-3 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
            selectedToken === "year"
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
        >
          year (Probability: 2.3%)
        </button>
        <button
          onClick={() => handleSelect("hour")}
          className={`p-3 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
            selectedToken === "hour"
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
          }`}
        >
          hour (Probability: 1.0%)
        </button>
      </div>

      {selectedToken && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-xl text-center text-[10px] text-emerald-800 animate-fadeIn">
          {selectedToken === "week" ? (
            <span className="font-bold">Correct! Weekly customer touchpoints represents the standard Teresa Torres discovery tempo.</span>
          ) : (
            <span className="font-normal text-rose-700">The model assigns this a lower probability. The correct continuous target is "week" to ensure tight loops.</span>
          )}
        </div>
      )}
    </div>
  );
}

// 3. DECISION MATRIX WIDGET
export function DecisionMatrixWidget({ onComplete }: WidgetProps) {
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [effort, setEffort] = useState(5);
  const [calculated, setCalculated] = useState(false);

  const riceScore = Math.round((impact * 1.5 * (confidence / 10)) / (effort / 2));

  const handleCalculate = () => {
    setCalculated(true);
    onComplete();
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl" id="decision-matrix-widget">
      <div className="flex justify-between items-center">
        <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-indigo-500" /> Continuous Feasibility Matrix
        </h4>
        <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">RICE Formula</span>
      </div>

      <div className="space-y-3.5 bg-white border border-slate-150 p-4 rounded-xl">
        {/* Reach/Impact */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-600">
            <span>Customer Value Impact (Reach x Impact)</span>
            <span className="font-mono text-indigo-600">{impact}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={impact}
            onChange={(e) => { setImpact(Number(e.target.value)); setCalculated(false); }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Confidence */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-600">
            <span>Discovery Confidence Score</span>
            <span className="font-mono text-indigo-600">{confidence * 10}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={confidence}
            onChange={(e) => { setConfidence(Number(e.target.value)); setCalculated(false); }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Effort */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-600">
            <span>Engineering Effort Hours</span>
            <span className="font-mono text-indigo-600">{effort} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={effort}
            onChange={(e) => { setEffort(Number(e.target.value)); setCalculated(false); }}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <button
          onClick={handleCalculate}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
        >
          Evaluate Priority Score
        </button>

        {calculated && (
          <div className="bg-emerald-50 border border-emerald-150 px-4 py-2 rounded-lg text-center animate-fadeIn shrink-0">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold">RICE Score</span>
            <strong className="text-base font-mono text-emerald-700 block">{riceScore}</strong>
          </div>
        )}
      </div>

      {calculated && (
        <p className="text-[10px] text-slate-400 leading-relaxed text-center font-medium animate-fadeIn">
          {riceScore > 10 ? "✅ Excellent score! High discovery confidence easily outweighs the estimated implementation effort." : "⚠️ Low feasibility. Consider running a quick mock sprint to decrease implementation effort."}
        </p>
      )}
    </div>
  );
}

// 4. AGENT SIMULATOR LOOP
export function AgentSimulatorLoop({ onComplete }: WidgetProps) {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>(["[System initialized] Ready to launch agent loop..."]);

  const steps = [
    { title: "SENSE", detail: "Read environment prompts and customer context notes.", log: "Agent reads prompt: 'Continuous discovery validation requested'." },
    { title: "PLAN", detail: "Formulate sub-goals and select grounded tools.", log: "Grounding check: Restricting execution parameters to certified Teresa Torres wiki." },
    { title: "ACT", detail: "Generate output or run tool operations.", log: "Gemini executes content synthesis via secure server proxy routes." },
    { title: "EVALUATE", detail: "Check compliance and compile diagnostics.", log: "Evaluating results: Sentiment analysis 94.2% matching. Completion confirmed." }
  ];

  const handleStep = () => {
    if (step < 4) {
      const currentLog = steps[step].log;
      setLogs([...logs, `> ${currentLog}`]);
      setStep(prev => prev + 1);
      if (step === 3) {
        onComplete();
      }
    }
  };

  const handleReset = () => {
    setStep(0);
    setLogs(["[System reset] Ready to launch agent loop..."]);
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl" id="agent-simulator-widget">
      <div className="flex justify-between items-center">
        <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-500" /> Autonomous Agent Loop
        </h4>
        <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Trigger Execution</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`p-2 rounded text-center border text-[9px] font-bold transition ${
              idx === step
                ? "bg-amber-500 border-amber-600 text-white animate-pulse"
                : idx < step
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-slate-100 text-slate-400"
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Terminal logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 h-28 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1 select-none">
        {logs.map((log, idx) => (
          <div key={idx}>{log}</div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStep}
          disabled={step === 4}
          className="flex-1 py-2.5 bg-blue-600 disabled:bg-slate-250 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex justify-center items-center gap-1"
        >
          {step === 4 ? "Loop Complete" : `Run Step ${step + 1}: ${steps[step]?.title || ""}`} <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {step === 4 && (
          <button
            onClick={handleReset}
            className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// 5. EVALUATION BRIEF WIDGET
export function EvaluationBriefWidget({ onComplete }: WidgetProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    safety: false,
    bias: false,
    latency: false,
    accuracy: false
  });

  const handleCheck = (key: string) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    
    const allChecked = Object.values(next).every(v => v === true);
    if (allChecked) {
      onComplete();
    }
  };

  const auditItems = [
    { id: "safety", title: "Grounding Safety", desc: "No adversarial injection or key leakage in LLM output." },
    { id: "bias", title: "Fairness & Tone Heuristic", desc: "Output is professional, humble, objective and helpful." },
    { id: "latency", title: "Latency Check (< 3s)", desc: "Response delivered under the SLA limit to ensure user love." },
    { id: "accuracy", title: "Factual Precision Check", desc: "Verified definitions map to active uploaded reference documents." }
  ];

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-xl" id="evaluation-brief-widget">
      <div className="flex justify-between items-center">
        <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Evaluation Brief Scorecard
        </h4>
        <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">SLA Check</span>
      </div>

      <div className="space-y-2.5 bg-white border border-slate-150 p-3 rounded-xl">
        {auditItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleCheck(item.id)}
            className="w-full p-2.5 text-left border rounded-lg flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
              checked[item.id] ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
            }`}>
              {checked[item.id] && <Check className="w-3 h-3" />}
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 block leading-tight">{item.title}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {Object.values(checked).every(v => v === true) && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl text-center font-bold animate-fadeIn">
          🎉 Comprehensive Audit Pass! High SLA metrics and perfect validation grounding achieved.
        </div>
      )}
    </div>
  );
}
