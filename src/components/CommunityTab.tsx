import React, { useState } from "react";
import { 
  ThumbsUp, MessageSquare, Send, PlusCircle, Share2, Award, Zap, 
  Flame, Target, Sliders, Gamepad2, Sparkles, BookOpen, UserCheck, 
  ShieldCheck, HelpCircle, Trophy, RefreshCw, BarChart2, Info, 
  CheckSquare, BrainCircuit, Users, X, ArrowRight, Lightbulb
} from "lucide-react";
import { ForumPost, UserProgress } from "../types";

interface CommunityTabProps {
  posts: ForumPost[];
  onAddPost: (content: string, category: string, unitShared?: any) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  progress: UserProgress;
  onNavigateToMyPathSection?: (section: "journey" | "habits" | "sandboxes" | "ai-onboarding") => void;
}

export default function CommunityTab({ 
  posts, 
  onAddPost, 
  onLikePost, 
  onAddComment,
  progress,
  onNavigateToMyPathSection 
}: CommunityTabProps) {
  const [newPostText, setNewPostText] = useState("");
  const [category, setCategory] = useState("Insight");
  const [showEditor, setShowEditor] = useState(false);
  const [commentStates, setCommentStates] = useState<Record<string, string>>({});
  
  // Custom Attachment State
  const [attachedAchievement, setAttachedAchievement] = useState<{
    unitNumber: number;
    unitTitle: string;
    score: string;
  } | null>(null);

  // Filter state for Feed
  const [feedFilter, setFeedFilter] = useState<"all" | "Insight" | "Question" | "ai-roleplay" | "sandbox-duel" | "milestone" | "streak">("all");

  // Accordion state for Pedagogy explanation
  const [showPedagogyLoop, setShowPedagogyLoop] = useState(false);

  // Attachment handler helpers
  const handleAttachStreak = () => {
    const text = `Celebrated milestone check! Reached a ${progress.streak}-day active practice streak. Continuous study prevents content rot and builds real-world PM muscle! 🔥📈`;
    setNewPostText(text);
    setCategory("Insight");
    setAttachedAchievement({
      unitNumber: -1,
      unitTitle: `${progress.streak}-Day Discovery Practice Streak`,
      score: `🔥 ${progress.streak} Days`
    });
  };

  const handleAttachSimulation = () => {
    const text = `Just wrapped up the Unit 3 CYOA simulation scenario! Faced resistance from engineering and sales stakeholders, but managed to recruit a 4-user interview cohort to prove our alignment. Finished with high team morale! 🎭🚀`;
    setNewPostText(text);
    setCategory("Insight");
    setAttachedAchievement({
      unitNumber: -2,
      unitTitle: `AI Branching Scenario (PM vs Stakeholder Align)`,
      score: "🎭 85% Morale"
    });
  };

  const handleAttachSandbox = () => {
    const text = `Ran a side-by-side prompt experiment in the Sandbox using real interview transcripts. Comparing strict JTBD guidelines vs generic open-ended analysis showed a 40% reduction in solution-bias. Try it out! 🧪📊`;
    setNewPostText(text);
    setCategory("Insight");
    setAttachedAchievement({
      unitNumber: -3,
      unitTitle: `Prompt Comparator Sandbox Duel`,
      score: "🧪 Sandbox Duel"
    });
  };

  const handleAttachSyllabusBadge = () => {
    const completedCount = progress.completedLessonIds.length;
    if (completedCount === 0) {
      alert("You haven't completed any syllabus lessons yet! Head to 'My Path' or 'Discovery' to finish your first topic!");
      return;
    }
    const text = `Syllabus update: Conquered ${completedCount} lessons across our Continuous Discovery curriculum! Highly recommend reviewing the opportunity validation workbenches. 🎓✨`;
    setNewPostText(text);
    setCategory("Insight");
    setAttachedAchievement({
      unitNumber: 1,
      unitTitle: "Continuous Discovery Practice Curriculum",
      score: `${Math.round((completedCount / 12) * 100)}% Complete`
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    onAddPost(newPostText, category, attachedAchievement);
    setNewPostText("");
    setAttachedAchievement(null);
    setShowEditor(false);
  };

  const handleAddCommentSubmit = (postId: string) => {
    const text = commentStates[postId] || "";
    if (!text.trim()) return;
    onAddComment(postId, text);
    setCommentStates((prev) => ({ ...prev, [postId]: "" }));
  };

  // Filter posts logic
  const filteredPosts = posts.filter(post => {
    if (feedFilter === "all") return true;
    if (feedFilter === "Insight") return post.content.includes("[#Insight]") || (!post.content.includes("[#") && !post.unitShared);
    if (feedFilter === "Question") return post.content.includes("[#Question]");
    if (feedFilter === "ai-roleplay") return post.unitShared?.unitNumber === -2;
    if (feedFilter === "sandbox-duel") return post.unitShared?.unitNumber === -3;
    if (feedFilter === "streak") return post.unitShared?.unitNumber === -1;
    if (feedFilter === "milestone") return post.unitShared && post.unitShared.unitNumber > 0;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="community-tab">
      
      {/* Title block */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-blue-700 block">
            Collaborative Learning Room
          </span>
          <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight mt-0.5">
            PM Scholar Squad Hub
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-normal max-w-lg">
            Connect active recall practice with social accountability. Share sandbox duels, celebrate streaks, and critique JTBD statements together.
          </p>
        </div>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className={`px-4 py-2.5 text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer border shrink-0 ${
            showEditor
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-350"
              : "bg-blue-600 hover:bg-blue-700 text-white border-blue-500/10"
          }`}
          id="open-editor-btn"
        >
          {showEditor ? (
            <>
              <X className="w-4 h-4" /> <span>Close Editor</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" /> <span>Write Post</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Modal/Expanded Form - Rendered IMMEDIATELY below header for direct user focus */}
      {showEditor && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white border-2 border-indigo-250 rounded-2xl p-4 sm:p-5 shadow-md relative animate-fadeIn space-y-4"
          id="post-creator-form"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold font-display text-slate-800 flex items-center gap-1">
              <PlusCircle className="w-4 h-4 text-indigo-600" /> Compose Post to PM Squad Feed
            </span>
            <div className="flex gap-1.5">
              {["Insight", "Question", "Resource"].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border tracking-wide transition cursor-pointer ${
                    category === cat
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                  id={`cat-btn-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share an Opportunity-Solution Tree insight, draft a JTBD question for peer checking, or post an AI Roleplay debrief..."
            rows={4}
            className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            id="post-textarea"
          ></textarea>

          {/* DYNAMIC SYNERGY ATTACHMENTS SHELF (Motivating Engagement) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500 block">
              📎 Attach Discovery Practice Achievement (Optional)
            </span>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Attachment Button 1: Streak */}
              <button
                type="button"
                onClick={handleAttachStreak}
                className="p-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-[10px] font-bold text-slate-700 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer transition shadow-3xs"
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-current" /> Celebrate Practice Streak
              </button>

              {/* Attachment Button 2: Simulation */}
              <button
                type="button"
                onClick={handleAttachSimulation}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-[10px] font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer transition shadow-3xs"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" /> Share AI Sim Debrief
              </button>

              {/* Attachment Button 3: Sandbox */}
              <button
                type="button"
                onClick={handleAttachSandbox}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-[10px] font-bold text-slate-700 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer transition shadow-3xs"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Share Sandbox Duel
              </button>

              {/* Attachment Button 4: Syllabus Badge */}
              <button
                type="button"
                onClick={handleAttachSyllabusBadge}
                className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-[10px] font-bold text-slate-700 hover:text-amber-700 flex items-center gap-1.5 cursor-pointer transition shadow-3xs"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" /> Share Syllabus Progress
              </button>
            </div>

            {/* Render Active Attachment Glow Card */}
            {attachedAchievement && (
              <div className="bg-indigo-50/55 border border-indigo-250 p-2.5 rounded-xl flex items-center justify-between mt-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    {attachedAchievement.unitNumber === -1 ? (
                      <Flame className="w-4 h-4 text-rose-500 fill-current" />
                    ) : attachedAchievement.unitNumber === -2 ? (
                      <Gamepad2 className="w-4 h-4 text-emerald-600" />
                    ) : attachedAchievement.unitNumber === -3 ? (
                      <Sliders className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Award className="w-4 h-4 text-amber-600" />
                    )}
                  </span>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-indigo-400 font-extrabold block">Attachment Configured</span>
                    <span className="text-xs font-bold text-slate-800 block">
                      {attachedAchievement.unitTitle}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAttachedAchievement(null)}
                  className="p-1 hover:bg-slate-200 rounded-md cursor-pointer text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowEditor(false);
                setAttachedAchievement(null);
              }}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
              id="cancel-post"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!newPostText.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                newPostText.trim()
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border border-indigo-500/10"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
              id="submit-post-btn"
            >
              Publish to Feed <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* PEDAGOGY EXPLORER: HOW THE SQUAD ACCELERATES DISCOVERY SKILLS */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-150 rounded-2xl p-4 shadow-3xs space-y-3">
        <button
          onClick={() => setShowPedagogyLoop(!showPedagogyLoop)}
          className="w-full flex justify-between items-center text-left cursor-pointer focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                The Continuous Peer Synergy Loop
              </span>
              <span className="text-[10px] text-slate-450 block font-mono">
                How our science-backed pedagogy enhances your learning outcomes
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-blue-100 shadow-3xs">
            {showPedagogyLoop ? "Hide Guide" : "Explain &rarr;"}
          </span>
        </button>

        {showPedagogyLoop && (
          <div className="pt-3 border-t border-slate-200/60 space-y-3.5 text-xs text-slate-600 leading-relaxed animate-fadeIn">
            <p>
              Teresa Torres’ continuous discovery methodology requires habits, not just reading. By sharing, auditing, and peer-critiquing each other's outputs, we turn abstract frameworks into reflex behaviors.
            </p>
            
            {/* Visual Pathway of Pedagogy */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono font-extrabold text-blue-600">Phase 1</span>
                <span className="font-bold text-slate-800 block">🎓 Active Recall</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Engage core syllabus, quizzes, and micro-workbenches.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-600">Phase 2</span>
                <span className="font-bold text-slate-800 block">🧪 Sandbox Duel</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Experiment with raw prompt guardrails side-by-side.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono font-extrabold text-emerald-600">Phase 3</span>
                <span className="font-bold text-slate-800 block">🎭 Live Stakeholder Sim</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Face resistance and alignment problems in CYOA games.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono font-extrabold text-rose-600">Phase 4</span>
                <span className="font-bold text-slate-800 block">💬 Peer Check-offs</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Publish findings to the feed to spark critique.
                </p>
              </div>
            </div>

            <div className="bg-white/50 border border-blue-200/60 p-2.5 rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[10px] text-indigo-900 leading-normal font-sans">
                <strong>Why this works:</strong> Cognitive science shows that learners who teach or showcase their experiments to a group retain up to **90% more** knowledge than passive readers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* COHORT SCOREBOARD (THE SQUAD ACTIVE METRICS) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-500">
            Collective Cohort Momentum
          </span>
          <span className="text-[9px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
            <Users className="w-3 h-3" /> Live Squad Indicators
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Average Streak Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-left flex items-center gap-2.5 hover:border-slate-300 transition shadow-3xs">
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 shrink-0">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-400 block font-extrabold leading-none">
                Cohort Streak
              </span>
              <span className="font-mono text-xs font-black text-slate-800 mt-0.5 block">
                5.4 Days Avg
              </span>
            </div>
          </div>

          {/* Syllabus Mastery Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-left flex items-center gap-2.5 hover:border-slate-300 transition shadow-3xs">
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-400 block font-extrabold leading-none">
                Syllabus Lessons
              </span>
              <span className="font-mono text-xs font-black text-slate-800 mt-0.5 block">
                342 Completed
              </span>
            </div>
          </div>

          {/* Simulations Completed */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-left flex items-center gap-2.5 hover:border-slate-300 transition shadow-3xs">
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-400 block font-extrabold leading-none">
                AI Roleplays
              </span>
              <span className="font-mono text-xs font-black text-slate-800 mt-0.5 block">
                112 Game Runs
              </span>
            </div>
          </div>

          {/* Sandbox Duels */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-left flex items-center gap-2.5 hover:border-slate-300 transition shadow-3xs">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-400 block font-extrabold leading-none">
                Prompt Duels
              </span>
              <span className="font-mono text-xs font-black text-slate-800 mt-0.5 block">
                256 Sandboxes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* WEEKLY COMMUNITY SYNERGY CHALLENGES (ACTIVE GAMIFICATION FOR THE FEED) */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-955 text-white rounded-2xl p-4 border border-indigo-500/20 shadow-sm space-y-3.5 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1 bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase">
              🏆 ACTIVE COHORT QUESTS
            </div>
            <h4 className="font-display font-black text-sm text-white tracking-tight pt-1">
              Weekly Collaborative Challenges
            </h4>
            <p className="text-[11px] text-slate-300">
              Complete these group challenges to unlock XP multiplier awards for everyone.
            </p>
          </div>
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold shrink-0">
            Multiplier: 1.5x
          </span>
        </div>

        {/* Quest list */}
        <div className="space-y-2.5 text-xs text-slate-200">
          
          {/* Challenge 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white">🎯 JTBD Peer Statement Checker</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">COHORT GOAL</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Post comments reviewing Devin's or any classmate's Jobs-to-be-Done statements. (Needs 3 reviews)
              </p>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 font-extrabold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
              +150 XP
            </span>
          </div>

          {/* Challenge 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white">🎭 Share simulated stakeholder trade-offs</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">ROLEPLAY</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Conquer a Branching Scenario to an 80%+ stakeholder morale, then post your debrief.
              </p>
            </div>
            
            <button
              onClick={() => onNavigateToMyPathSection?.("ai-onboarding")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] shrink-0 border border-emerald-400/25 cursor-pointer transition shadow-3xs self-start sm:self-auto"
            >
              Start Game
            </button>
          </div>

          {/* Challenge 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white">🧪 Sandbox Duel Duelist</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">EXPERIMENT</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Run an side-by-side prompt experiment in the sandboxes and share your comparison results.
              </p>
            </div>

            <button
              onClick={() => onNavigateToMyPathSection?.("sandboxes")}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[10px] shrink-0 border border-purple-400/25 cursor-pointer transition shadow-3xs self-start sm:self-auto"
            >
              Go Sandbox
            </button>
          </div>

        </div>
      </div>



      {/* FEED FILTER BAR */}
      <div className="flex flex-wrap gap-1.5 pb-1 overflow-x-auto border-b border-slate-100" id="community-feed-filters">
        <button
          onClick={() => setFeedFilter("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            feedFilter === "all" ? "bg-slate-800 text-white font-extrabold shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Feed
        </button>
        <button
          onClick={() => setFeedFilter("Insight")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            feedFilter === "Insight" ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Insights 💡
        </button>
        <button
          onClick={() => setFeedFilter("Question")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            feedFilter === "Question" ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Questions ❓
        </button>
        <button
          onClick={() => setFeedFilter("ai-roleplay")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            feedFilter === "ai-roleplay" ? "bg-emerald-600 text-white font-extrabold shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          AI Roleplays 🎭
        </button>
        <button
          onClick={() => setFeedFilter("sandbox-duel")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            feedFilter === "sandbox-duel" ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Sandbox Duels 🧪
        </button>
        <button
          onClick={() => setFeedFilter("milestone")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            feedFilter === "milestone" ? "bg-amber-600 text-white font-extrabold shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Milestones 🎓
        </button>
        <button
          onClick={() => setFeedFilter("streak")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            feedFilter === "streak" ? "bg-rose-600 text-white font-extrabold shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Streak Fire 🔥
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4" id="community-posts-list">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-xl space-y-2">
            <span className="text-2xl">📪</span>
            <h4 className="font-bold text-slate-800 text-sm">No activity tagged in this category yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Be the first to perform this activity on the app and attach it to a new feed post!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-slate-250 rounded-2xl p-4 sm:p-5 shadow-3xs text-left hover:border-slate-300 transition duration-200"
              id={`post-card-${post.id}`}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3.5">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                      {post.authorName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium font-sans">
                      {post.authorRole}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium font-mono">
                  {post.timestamp}
                </span>
              </div>

              {/* HIGH-FIDELITY CUSTOM ATTACHMENT BADGE RENDERING */}
              {post.unitShared && (() => {
                const isStreak = post.unitShared.unitNumber === -1;
                const isSimulation = post.unitShared.unitNumber === -2;
                const isSandbox = post.unitShared.unitNumber === -3;
                
                if (isStreak) {
                  return (
                    <div className="bg-rose-50/60 border border-rose-150 rounded-xl p-3 mb-3.5 flex items-center justify-between shadow-3xs" id="shared-streak-badge">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-rose-100 border border-rose-200 text-rose-650 rounded-xl shrink-0">
                          <Flame className="w-4 h-4 fill-current animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[9px] text-rose-800 font-extrabold uppercase tracking-wider block font-sans">
                            Practice Streak Celebrated
                          </span>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">
                            {post.unitShared.unitTitle}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-rose-600 border border-rose-500 text-white px-2.5 py-1 rounded-lg font-black shrink-0">
                        {post.unitShared.score}
                      </span>
                    </div>
                  );
                }

                if (isSimulation) {
                  return (
                    <div className="bg-emerald-50/60 border border-emerald-150 rounded-xl p-3 mb-3.5 flex items-center justify-between shadow-3xs" id="shared-sim-badge">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl shrink-0">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-emerald-850 font-extrabold uppercase tracking-wider block font-sans">
                            AI Roleplay Simulation debrief
                          </span>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">
                            {post.unitShared.unitTitle}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-emerald-600 border border-emerald-500 text-white px-2.5 py-1 rounded-lg font-black shrink-0">
                        {post.unitShared.score}
                      </span>
                    </div>
                  );
                }

                if (isSandbox) {
                  return (
                    <div className="bg-indigo-50/60 border border-indigo-150 rounded-xl p-3 mb-3.5 flex items-center justify-between shadow-3xs" id="shared-sandbox-badge">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl shrink-0">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[9px] text-indigo-850 font-extrabold uppercase tracking-wider block font-sans">
                            Prompt Sandbox Comparator Duel
                          </span>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">
                            {post.unitShared.unitTitle}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-indigo-600 border border-indigo-500 text-white px-2.5 py-1 rounded-lg font-black shrink-0">
                        {post.unitShared.score}
                      </span>
                    </div>
                  );
                }

                // Standard Syllabus completed badge
                return (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3.5 flex items-center justify-between shadow-3xs" id="shared-achievement-badge">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wider block font-sans">
                          Syllabus Achievement Unlocked
                        </span>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">
                          Completed Unit {post.unitShared.unitNumber}: {post.unitShared.unitTitle}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] bg-emerald-600 border border-emerald-500 text-white px-2.5 py-1 rounded-lg font-black shrink-0">
                      {post.unitShared.score} Score
                    </span>
                  </div>
                );
              })()}

              {/* Post Body */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4 font-sans">
                {post.content}
              </p>

              {/* Likes and Comments counter */}
              <div className="flex gap-4 text-xs text-slate-500 border-t border-slate-50 pt-3.5">
                <button
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition cursor-pointer ${
                    post.hasLiked ? "text-blue-650 font-extrabold" : "hover:text-blue-600"
                  }`}
                  id={`like-btn-${post.id}`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${post.hasLiked ? "fill-current" : ""}`} />
                  <span>{post.likesCount} {post.likesCount === 1 ? "Like" : "Likes"}</span>
                </button>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}</span>
                </div>
              </div>

              {/* Comments List */}
              {post.comments.length > 0 && (
                <div className="mt-4 p-3.5 bg-slate-50/55 rounded-xl space-y-3 border border-slate-100" id={`comments-list-${post.id}`}>
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="text-xs leading-relaxed text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 mr-1.5">{comment.authorName}</span>
                        <span className="text-slate-400 text-[10px] font-mono">{comment.timestamp}</span>
                      </div>
                      <p className="text-slate-650 mt-1 whitespace-pre-line leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment input form */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a supportive comment or statement review..."
                  value={commentStates[post.id] || ""}
                  onChange={(e) =>
                    setCommentStates((prev) => ({ ...prev, [post.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCommentSubmit(post.id);
                    }
                  }}
                  className="flex-grow text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400"
                  id={`comment-input-${post.id}`}
                />
                <button
                  onClick={() => handleAddCommentSubmit(post.id)}
                  className="px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center p-2 shrink-0"
                  id={`submit-comment-${post.id}`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
