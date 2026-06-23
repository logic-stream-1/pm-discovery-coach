import React, { useState } from "react";
import { Check, Info, FileText, Lock, Play, RefreshCw, AlertTriangle } from "lucide-react";

interface AssumptionItem {
  id: string;
  statement: string;
  category: "Desirability" | "Feasibility" | "Viability" | "Usability";
  correctQuadrant: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  explanation: string;
}

const STARTUP_ASSUMPTIONS: AssumptionItem[] = [
  {
    id: "asm-1",
    statement: "Patients trust receiving prescription drugs via unmanned automated drone delivery.",
    category: "Desirability",
    correctQuadrant: "top-left",
    explanation: "This is a massive Desirability risk with no pre-existing trust. It is critical (top) but completely unproven (left). Must be tested immediately."
  },
  {
    id: "asm-2",
    statement: "The aviation administration will grant legal airspace clearance within 12 months.",
    category: "Viability",
    correctQuadrant: "top-left",
    explanation: "A high-severity regulatory/viability blocker. Without this clearance, the business model collapses. We have no confirmation (low evidence)."
  },
  {
    id: "asm-3",
    statement: "Standard GPS sensors tracker modules are available for under $10 per device.",
    category: "Feasibility",
    correctQuadrant: "top-right",
    explanation: "Highly important for hardware manufacturing (feasibility), but we have abundant evidence from standard component catalogs verifying this price point."
  },
  {
    id: "asm-4",
    statement: "Couriers wear organic-cotton orange outfits to stand out in traffic.",
    category: "Usability",
    correctQuadrant: "bottom-left",
    explanation: "Low impact on delivery success (low importance). Also unverified if drivers prefer organic cotton over windbreakers, making it low evidence."
  }
];

export default function AssumptionMappingWorkbench({ onComplete }: { onComplete?: () => void }) {
  const [placedItems, setPlacedItems] = useState<Record<string, "top-left" | "top-right" | "bottom-left" | "bottom-right" | "unplaced">>({
    "asm-1": "unplaced",
    "asm-2": "unplaced",
    "asm-3": "unplaced",
    "asm-4": "unplaced"
  });

  const [activeItem, setActiveItem] = useState<AssumptionItem | null>(STARTUP_ASSUMPTIONS[0]);
  const [showResults, setShowResults] = useState(false);

  // Quadrants definition
  const quadrants = [
    {
      id: "top-left" as const,
      name: "The Danger Zone",
      desc: "High Importance, Low Evidence",
      bg: "bg-rose-50/50 border-rose-300",
      text: "text-rose-900"
    },
    {
      id: "top-right" as const,
      name: "Proven Core",
      desc: "High Importance, High Evidence",
      bg: "bg-emerald-50/50 border-emerald-300",
      text: "text-emerald-900"
    },
    {
      id: "bottom-left" as const,
      name: "Unproven Nice-to-Have",
      desc: "Low Importance, Low Evidence",
      bg: "bg-slate-50 border-slate-300",
      text: "text-slate-800"
    },
    {
      id: "bottom-right" as const,
      name: "Proven Low Priority",
      desc: "Low Importance, High Evidence",
      bg: "bg-slate-50 border-slate-300",
      text: "text-slate-800"
    }
  ];

  const handlePlace = (quadId: "top-left" | "top-right" | "bottom-left" | "bottom-right") => {
    if (!activeItem) return;

    setPlacedItems((prev) => ({
      ...prev,
      [activeItem.id]: quadId
    }));

    // Find next unplaced item
    const unplaced = STARTUP_ASSUMPTIONS.find(
      (item) => item.id !== activeItem.id && placedItems[item.id] === "unplaced"
    );

    if (unplaced) {
      setActiveItem(unplaced);
    } else {
      setActiveItem(null);
    }
  };

  const handleSelectPlaced = (item: AssumptionItem) => {
    setActiveItem(item);
  };

  const handleReset = () => {
    setPlacedItems({
      "asm-1": "unplaced",
      "asm-2": "unplaced",
      "asm-3": "unplaced",
      "asm-4": "unplaced"
    });
    setActiveItem(STARTUP_ASSUMPTIONS[0]);
    setShowResults(false);
  };

  const allPlaced = Object.values(placedItems).every((q) => q !== "unplaced");

  const correctnessCount = STARTUP_ASSUMPTIONS.filter(
    (item) => placedItems[item.id] === item.correctQuadrant
  ).length;

  const isAllCorrect = correctnessCount === STARTUP_ASSUMPTIONS.length;

  const handleVerify = () => {
    setShowResults(true);
    if (isAllCorrect && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6" id="assumption-mapping-workbench">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
            T3 · David Bland Grid
          </span>
          <h3 className="font-display font-semibold text-lg text-slate-900 mt-2">
            Interactive Assumption Mapping Grid
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Prioritize drug drone startup hypotheses to detect make-or-break validation experiments.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 text-xs cursor-pointer"
          id="reset-mapping-btn"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Active Selection Panel */}
      {activeItem ? (
        <div className="bg-white border-2 border-primary/20 rounded-xl p-4 mb-6 shadow-sm animate-fadeIn" id="activeselectionpanel">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
              {activeItem.category}
            </span>
            <span className="text-xs text-slate-400">Drag or Tap Quadrant below to position:</span>
          </div>
          <p className="text-sm font-medium text-slate-800 leading-relaxed mb-3">
            &ldquo;{activeItem.statement}&rdquo;
          </p>
          <div className="flex flex-wrap gap-2">
            {quadrants.map((q) => (
              <button
                key={q.id}
                onClick={() => handlePlace(q.id)}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-medium text-blue-800 cursor-pointer transition"
                id={`btn-place-${q.id}`}
              >
                Place in &ldquo;{q.name}&rdquo;
              </button>
            ))}
          </div>
        </div>
      ) : !allPlaced ? (
        <div className="p-4 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl mb-6 text-sm text-center">
          No active assumption selected. Click a card on the grid below to inspect or re-place.
        </div>
      ) : null}

      {/* The 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative mt-4">
        {/* Y Axis line labels */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 border-r-2 border-dashed border-slate-300 pointer-events-none z-10"></div>
        <div className="hidden md:block absolute top-1/2 left-0 right-0 border-b-2 border-dashed border-slate-300 pointer-events-none z-10"></div>

        {/* Labels info */}
        <div className="hidden md:flex absolute left-1/2 top-1 -translate-x-1/2 bg-slate-200 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest text-slate-600 z-20">
          Critical / High Importance
        </div>
        <div className="hidden md:flex absolute left-1/2 bottom-1 -translate-x-1/2 bg-slate-200 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest text-slate-600 z-20">
          Low Importance
        </div>
        <div className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 bg-slate-200 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest text-slate-600 z-20">
          No Evidence / High Risk
        </div>
        <div className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 bg-slate-200 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest text-slate-600 z-20">
          Heavy Evidence / Known
        </div>

        {quadrants.map((q) => {
          // Find assumptions currently placed in this quadrant
          const itemsInQuad = STARTUP_ASSUMPTIONS.filter(
            (item) => placedItems[item.id] === q.id
          );

          // Danger Zone gets customized pink border
          const isDangerZone = q.id === "top-left";
          const borderStyle = isDangerZone && showResults && !isAllCorrect
            ? "border-rose-400 border-2"
            : "border-slate-300 border-2 border-dashed";

          return (
            <div
              key={q.id}
              className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[160px] cursor-pointer transition ${q.bg} ${borderStyle} relative`}
              onClick={() => {
                if (activeItem) {
                  handlePlace(q.id);
                }
              }}
              id={`quad-${q.id}`}
            >
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-display uppercase tracking-wider ${q.text}`}>
                    {q.name}
                  </span>
                  {isDangerZone && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">{q.desc}</span>
              </div>

              {/* Items Container */}
              <div className="space-y-2 mt-2 flex-grow">
                {itemsInQuad.length > 0 ? (
                  itemsInQuad.map((item) => {
                    const isCorrect = item.correctQuadrant === q.id;
                    const cardBg = showResults
                      ? isCorrect
                        ? "bg-emerald-100/90 border-emerald-400 text-slate-900 shadow-xs"
                        : "bg-rose-100/90 border-rose-400 text-slate-900 shadow-xs"
                      : "bg-white border-slate-200 hover:border-blue-300 shadow-xs text-slate-800";

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlaced(item);
                        }}
                        className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition ${cardBg} ${
                          activeItem?.id === item.id ? "ring-2 ring-primary ring-offset-1" : ""
                        }`}
                        id={`card-placed-${item.id}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-semibold block shrink-0 text-[9px] uppercase tracking-wide tracking-tight font-mono text-slate-400 mb-1">
                            {item.category}
                          </span>
                          {showResults && (
                            <span className={`text-[10px] font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                              {isCorrect ? "✓ Correct" : "✗ Relocate"}
                            </span>
                          )}
                        </div>
                        <p>{item.statement}</p>

                        {showResults && (
                          <p className="mt-1.5 pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-600 block leading-normal italic">
                            {item.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-[90px] text-slate-400 border border-dashed border-slate-200 rounded-lg text-xs" id="emptyzone">
                    <span className="font-mono text-[10px] text-slate-300 uppercase tracking-widest mb-1">[Empty Zone]</span>
                    <p className="text-[10px] text-slate-400">Click &ldquo;Place&rdquo; to fill</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification triggers */}
      <div className="mt-6">
        <button
          onClick={handleVerify}
          disabled={!allPlaced}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm shadow-xs transition flex justify-center items-center gap-2 cursor-pointer ${
            !allPlaced
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : showResults && isAllCorrect
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          id="verify-mapping-btn"
        >
          {showResults && isAllCorrect ? (
            <>
              <Check className="w-4 h-4" /> All Placements Verified! Unlocked Unit 3
            </>
          ) : (
            "Verify Quadrant Mapping"
          )}
        </button>

        {showResults && !isAllCorrect && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-lg text-xs leading-relaxed text-rose-800 animate-fadeIn">
            <span className="flex items-center gap-1 font-bold mb-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Quadrant Conflict Found:
            </span>
            <span>You correctly positioned {correctnessCount} out of 4 risks. Redundant or unproven high-importance items must lie specifically under the High Importance row (top), or unproven statements under the Low Evidence column (left). Relocate red items and re-verify!</span>
          </div>
        )}

        {showResults && isAllCorrect && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-xs leading-relaxed text-emerald-800 animate-fadeIn">
            <strong>Well Done!</strong> You mapped all 4 commercial drone drug delivery hypotheses to their exact David Bland strategic quadrants. Notice how keeping low-evidence/high-importance factors (airspace clearance or citizen trust) separated from low-importance features creates a tight, highly optimized validation program.
          </div>
        )}
      </div>
    </div>
  );
}
