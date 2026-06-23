import React, { useState } from "react";
import { X, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, BookOpen, AlertTriangle } from "lucide-react";
import { Lesson, Unit } from "../types";
import JTBDWorkbench from "./workbenches/JTBDWorkbench";
import AssumptionMappingWorkbench from "./workbenches/AssumptionMappingWorkbench";
import PrioritisationWorkbench from "./workbenches/PrioritisationWorkbench";
import { trackEvent } from "../lib/analytics";

interface LessonOverlayProps {
  lesson: Lesson;
  unit: Unit;
  onClose: () => void;
  onComplete: (lessonId: string, isCorrect: boolean) => void;
}

export default function LessonOverlay({ lesson, unit, onClose, onComplete }: LessonOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [workbenchCompleted, setWorkbenchCompleted] = useState(false);

  // Track lesson start when mounted
  React.useEffect(() => {
    trackEvent("lesson_started", {
      unit_id: unit.id,
      lesson_id: lesson.id
    });
  }, [lesson.id, unit.id]);

  const totalSlides = lesson.slides.length;
  // If we have a workbench lesson, we add 1 slide for the workbench, and 1 slide for the quiz!
  const hasWorkbench = lesson.id === "l2-3" || lesson.id === "l3-3" || lesson.id === "l4-3";
  
  const slideCount = totalSlides + (hasWorkbench ? 1 : 0) + 1; // Content Slides + Workbench (if any) + Quiz

  const handleNext = () => {
    if (currentSlide < slideCount - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null) return;
    setQuizSubmitted(true);
    const isCorrect = selectedOption === lesson.quiz.correctIndex;
    
    // Fire quiz_answered event
    trackEvent("quiz_answered", {
      lesson_id: lesson.id,
      question_id: lesson.id + "-quiz",
      correct: isCorrect
    });
    
    onComplete(lesson.id, isCorrect);
  };

  // Determine slide type
  const isQuizSlide = currentSlide === slideCount - 1;
  const isWorkbenchSlide = hasWorkbench && currentSlide === totalSlides;
  const isContentSlide = !isQuizSlide && !isWorkbenchSlide;

  const currentContentSlide = isContentSlide ? lesson.slides[currentSlide] : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 text-left" id="lesson-overlay">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh] animate-slideUp">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400">
              Unit {unit.number} · Lesson {lesson.id.split("-")[1]}
            </span>
            <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 truncate max-w-[280px] sm:max-w-[400px]">
              {lesson.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            id="close-lesson-overlay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ProgressBar */}
        <div className="h-1 bg-slate-100 w-full shrink-0">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slideCount) * 100}%` }}
          ></div>
        </div>

        {/* Core Content */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6" id="lesson-scrollable-content">
          {isContentSlide && currentContentSlide && (
            <div className="space-y-4 animate-fadeIn">
              {/* Slide Title */}
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight">
                {currentContentSlide.title}
              </h2>

              {/* Evidence Tier Badge if present */}
              {currentContentSlide.evidenceTier && (
                <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-mono">
                  <span className="font-bold">{currentContentSlide.evidenceTier}</span>
                  <span>&bull;</span>
                  <span className="truncate max-w-[200px] sm:max-w-xs">{currentContentSlide.evidenceSource}</span>
                </div>
              )}

              {/* Body prose */}
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {currentContentSlide.body}
              </p>

              {/* Example block */}
              {currentContentSlide.example && (
                <div className="bg-slate-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-lg">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest font-sans block mb-1">
                    Real World Application
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    {currentContentSlide.example}
                  </p>
                </div>
              )}

              {/* Pro Tip bullet block */}
              {currentContentSlide.tip && (
                <div className="bg-amber-50/50 border border-amber-200/60 p-3 sm:p-4 rounded-lg flex items-start gap-2.5">
                  <span className="text-amber-500 shrink-0 font-bold block mt-0.5 text-xs">💡</span>
                  <div>
                    <span className="text-xs font-bold text-amber-850 block mb-0.5">Practitioner Tip</span>
                    <p className="text-xs text-slate-700 leading-normal">
                      {currentContentSlide.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Special Slide: Workbench */}
          {isWorkbenchSlide && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
                Skill Application Challenge
              </h2>
              <p className="text-xs text-slate-600">
                Put theory directly into practice below to complete the final lesson milestone:
              </p>

              {lesson.id === "l2-3" && (
                <JTBDWorkbench onComplete={() => setWorkbenchCompleted(true)} />
              )}
              {lesson.id === "l3-3" && (
                <AssumptionMappingWorkbench onComplete={() => setWorkbenchCompleted(true)} />
              )}
              {lesson.id === "l4-3" && (
                <PrioritisationWorkbench onComplete={() => setWorkbenchCompleted(true)} />
              )}
            </div>
          )}

          {/* Special Slide: Quiz Question */}
          {isQuizSlide && (
            <div className="space-y-4 animate-fadeIn">
              <span className="font-mono text-xs uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-extrabold border border-emerald-150">
                Cognitive Check · Active Recall
              </span>
              <h2 className="font-display font-semibold text-base sm:text-lg text-slate-900 leading-snug">
                {lesson.quiz.question}
              </h2>

              {/* Options list */}
              <div className="space-y-2 mt-4" id="quiz-options-container">
                {lesson.quiz.options.map((opt, idx) => {
                  let designClass = "border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer";
                  
                  if (selectedOption === idx) {
                    designClass = "border-blue-500 bg-blue-50 text-blue-950 font-medium";
                  }

                  if (quizSubmitted) {
                    if (idx === lesson.quiz.correctIndex) {
                      designClass = "border-emerald-500 bg-emerald-50/75 text-emerald-950 font-medium shadow-xs";
                    } else if (selectedOption === idx) {
                      designClass = "border-rose-300 bg-rose-50/75 text-rose-950";
                    } else {
                      designClass = "opacity-60 border-slate-200 bg-slate-100 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition flex gap-3 items-center ${designClass}`}
                      id={`quiz-option-${idx}`}
                    >
                      <span className="text-[10px] w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert box */}
              {quizSubmitted && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border animate-fadeIn ${
                    selectedOption === lesson.quiz.correctIndex
                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                      : "bg-rose-50 border-rose-100 text-rose-800"
                  }`}
                  id="quiz-alert-feedback"
                >
                  <div className="flex items-start gap-2.5">
                    {selectedOption === lesson.quiz.correctIndex ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block mb-1">
                        {selectedOption === lesson.quiz.correctIndex
                          ? "Factual Recall Correct! Skill Unlocked"
                          : "Recall Friction Detected"}
                      </span>
                      <p className="text-slate-700 leading-normal mb-1">
                        {lesson.quiz.explanation}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Verified Outcome Tier Check: Continuous Mastery active
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation bar */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 sm:px-6 flex justify-between items-center shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              currentSlide === 0
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-600 hover:bg-slate-200 cursor-pointer"
            }`}
            id="prev-slide"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Middle current numbers slider */}
          <span className="text-[11px] font-semibold text-slate-500 font-mono">
            {currentSlide + 1} / {slideCount}
          </span>

          {isQuizSlide ? (
            <button
              onClick={quizSubmitted ? onClose : handleSubmitQuiz}
              disabled={selectedOption === null}
              className={`px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                selectedOption === null
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : quizSubmitted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              id="submit-quiz-or-close"
            >
              {quizSubmitted ? "Complete Lesson" : "Submit Answer"}
            </button>
          ) : isWorkbenchSlide ? (
            <button
              onClick={handleNext}
              disabled={!workbenchCompleted}
              className={`px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                !workbenchCompleted
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              id="workbench-next-btn"
            >
              {workbenchCompleted ? "Proceed to Quiz" : "Complete Task First"} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              id="next-slide"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
