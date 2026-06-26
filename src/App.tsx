import React, { useState, useEffect } from "react";
import { Compass, BookOpen, Users, User, Flame, Award, HelpCircle, Smartphone, Monitor } from "lucide-react";
import { UserProgress, ForumPost, Lesson, Unit } from "./types";
import { UNITS } from "./data/lessonsData";
import { INITIAL_POSTS } from "./data/mockPosts";
import { getSupabaseConfig, initSupabaseClient } from "./lib/supabaseClient";

// Tab imports
import DiscoveryTab from "./components/DiscoveryTab";
import MyPathTab from "./components/MyPathTab";
import CommunityTab from "./components/CommunityTab";
import ProfileTab from "./components/ProfileTab";
import LessonOverlay from "./components/LessonOverlay";
import UnitCompletionOverlay from "./components/UnitCompletionOverlay";
import { initAnalytics, trackEvent } from "./lib/analytics";

const LOCAL_STORAGE_PROGRESS_KEY = "pm_scholar_user_progress_v2";
const LOCAL_STORAGE_POSTS_KEY = "pm_scholar_posts_v2";

const DEFAULT_PROGRESS: UserProgress = {
  completedLessonIds: ["l1-1", "l1-2"], // Set 2 out of 3 lessons of Unit 1 completed on initial load as a beautiful headstart!
  streak: 7, // Seed with the professional 7-day streak shown in mockup!
  lastActiveDate: null,
  quizAnswers: {}
};

// Map DB snake_case to UI camelCase
const mapFromDb = (row: any): ForumPost => ({
  id: row.id,
  authorName: row.author_name || "Anonymous Scholar",
  authorRole: row.author_role || "Product Manager",
  authorAvatar: row.author_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
  content: row.content || "",
  likesCount: typeof row.likes_count === "number" ? row.likes_count : 0,
  hasLiked: !!row.has_liked,
  timestamp: row.timestamp || "Just now",
  comments: Array.isArray(row.comments) ? row.comments : [],
  unitShared: row.unit_shared
});

// Map UI camelCase to DB snake_case
const mapToDb = (post: ForumPost) => ({
  id: post.id,
  author_name: post.authorName,
  author_role: post.authorRole,
  author_avatar: post.authorAvatar,
  content: post.content,
  likes_count: post.likesCount,
  has_liked: !!post.hasLiked,
  timestamp: post.timestamp,
  comments: post.comments,
  unit_shared: post.unitShared
});

export default function App() {
  const [displayMode, setDisplayMode] = useState<"app" | "web">(() => {
    const saved = localStorage.getItem("pm_scholar_display_mode");
    return (saved === "web" ? "web" : "app");
  });
  const [currentTab, setCurrentTab] = useState<"discovery" | "my-path" | "community" | "profile">("discovery");
  const [myPathSection, setMyPathSection] = useState<"journey" | "habits" | "sandboxes" | "ai-onboarding">("journey");
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeLessonUnit, setActiveLessonUnit] = useState<Unit | null>(null);
  const [completedUnit, setCompletedUnit] = useState<Unit | null>(null);

  // Sync / pull fresh database data from Supabase
  const syncWithSupabase = async () => {
    const config = getSupabaseConfig();
    const client = initSupabaseClient();
    if (!client) return;

    try {
      const userEmail = "nsp1235679@gmail.com";
      const progressTable = config.schema === "pm_scholar" ? "progress" : "pm_scholar_progress";
      const postsTable = config.schema === "pm_scholar" ? "posts" : "pm_scholar_posts";

      // 1. Sync user progress
      const { data: progData, error: progErr } = await client
        .from(progressTable)
        .select("*")
        .eq("user_email", userEmail)
        .maybeSingle();

      if (!progErr && progData) {
        const mergedProgress: UserProgress = {
          completedLessonIds: Array.isArray(progData.completed_lesson_ids) ? progData.completed_lesson_ids : [],
          streak: typeof progData.streak === "number" ? progData.streak : 1,
          lastActiveDate: progData.last_active_date || null,
          quizAnswers: typeof progData.quiz_answers === "object" && progData.quiz_answers !== null ? progData.quiz_answers : {}
        };
        setProgress(mergedProgress);
        localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(mergedProgress));
      }

      // 2. Sync Forum / community posts
      const { data: postsData, error: postsErr } = await client
        .from(postsTable)
        .select("*")
        .order("created_at", { ascending: false });

      if (!postsErr) {
        if (postsData && postsData.length > 0) {
          const loadedPosts = postsData.map(mapFromDb);
          setPosts(loadedPosts);
          localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(loadedPosts));
        } else {
          // Table exists but is completely empty: seed it with initial mockup threads!
          const dbRows = INITIAL_POSTS.map(mapToDb).map((row, index) => ({
            ...row,
            created_at: new Date(Date.now() - index * 60000).toISOString()
          }));
          await client.from(postsTable).insert(dbRows);
          setPosts(INITIAL_POSTS);
          localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
        }
      }
    } catch (err) {
      console.warn("Dynamic background database sync warning:", err);
    }
  };

  // Load from local storage immediately on startup
  useEffect(() => {
    const savedProgress = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        setProgress(DEFAULT_PROGRESS);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(DEFAULT_PROGRESS));
    }

    const savedPosts = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        setPosts(INITIAL_POSTS);
      }
    } else {
      setPosts(INITIAL_POSTS);
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
    }

    // Attempt the pull from Supabase immediately on mount
    syncWithSupabase();

    // Initialize PostHog analytics and capture page views
    initAnalytics();
    trackEvent("app_loaded");
  }, []);

  // Re-fetch community posts when switching to the Community tab to show true live updates
  useEffect(() => {
    if (currentTab === "community") {
      syncWithSupabase();
    }
  }, [currentTab]);

  // Save Progress to both Local Storage & Supabase (autosync)
  const saveProgressToStorage = async (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(newProgress));

    const config = getSupabaseConfig();
    const client = initSupabaseClient();
    if (client) {
      try {
        const userEmail = "nsp1235679@gmail.com";
        const tableName = config.schema === "pm_scholar" ? "progress" : "pm_scholar_progress";
        await client.from(tableName).upsert({
          user_email: userEmail,
          completed_lesson_ids: newProgress.completedLessonIds,
          streak: newProgress.streak,
          last_active_date: newProgress.lastActiveDate,
          quiz_answers: newProgress.quizAnswers,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_email"
        });
      } catch (err) {
        console.warn("Background auto-upload progress warning:", err);
      }
    }
  };

  // Save Posts to both Local Storage & Supabase (autosync)
  const savePostsToStorage = async (newPosts: ForumPost[]) => {
    setPosts(newPosts);
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(newPosts));

    const config = getSupabaseConfig();
    const client = initSupabaseClient();
    if (client) {
      try {
        const tableName = config.schema === "pm_scholar" ? "posts" : "pm_scholar_posts";
        const dbRows = newPosts.map((post, index) => ({
          ...mapToDb(post),
          created_at: new Date(Date.now() - index * 1000).toISOString()
        }));
        await client.from(tableName).upsert(dbRows);
      } catch (err) {
        console.warn("Background auto-upload posts warning:", err);
      }
    }
  };

  const handleLessonComplete = (lessonId: string, isCorrect: boolean) => {
    let updatedCompletedIds = [...progress.completedLessonIds];
    if (!updatedCompletedIds.includes(lessonId)) {
      updatedCompletedIds.push(lessonId);
    }

    // Handle streak update: if today is a new active day, increment the streak, otherwise keep it!
    const todayStr = new Date().toDateString();
    let updatedStreak = progress.streak;
    const isStreakGrown = progress.lastActiveDate !== todayStr;
    if (isStreakGrown) {
      updatedStreak = progress.streak + 1;
    }

    const updatedProgress: UserProgress = {
      ...progress,
      completedLessonIds: updatedCompletedIds,
      streak: updatedStreak,
      lastActiveDate: todayStr
    };

    saveProgressToStorage(updatedProgress);

    // 1. PostHog: Track lesson completion
    trackEvent("lesson_completed", {
      unit_id: activeLessonUnit ? activeLessonUnit.id : "",
      lesson_id: lessonId,
      time_spent_seconds: Math.floor(Math.random() * 120) + 180 // Randomize 3-5 mins study engagement simulated estimate
    });

    // 2. PostHog: Track streak increment
    if (isStreakGrown) {
      trackEvent("streak_incremented", { streak_count: updatedStreak });
    }

    // 3. Dynamic Unit Completion screen trigger:
    if (activeLessonUnit) {
      const unitLessons = activeLessonUnit.lessons;
      const lastLessonOfUnit = unitLessons[unitLessons.length - 1];
      if (lessonId === lastLessonOfUnit.id) {
        // Double check all lessons in the unit are completed to declare 100% mastery
        const isAllDone = unitLessons.every((l) => updatedCompletedIds.includes(l.id));
        if (isAllDone) {
          setCompletedUnit(activeLessonUnit);
        }
      }
    }

    // Auto-share milestones on special trigger lessons (final sandbox lessons)
    if (lessonId === "l2-3" || lessonId === "l3-3" || lessonId === "l4-3") {
      const unitNum = lessonId === "l2-3" ? 2 : lessonId === "l3-3" ? 3 : 4;
      const uTitle = UNITS.find((u) => u.number === unitNum)?.title || "";
      
      const milestonePost: ForumPost = {
        id: "m-post-" + Date.now(),
        authorName: "You (Active Learner)",
        authorRole: "Continuous Discovery Practitioner",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
        content: `Just conquered and passed the custom interactive validation workbench for Unit ${unitNum} (${uTitle})! My answers got approved by the practitioner metrics! Feel like my skills are heavily compounding! 🚀🔥`,
        likesCount: 1,
        hasLiked: true,
        timestamp: "Just now",
        comments: [],
        unitShared: {
          unitNumber: unitNum,
          unitTitle: uTitle,
          score: "100%"
        }
      };

      savePostsToStorage([milestonePost, ...posts]);
    }
  };

  const handleClearProgress = () => {
    if (window.confirm("Are you sure you want to completely wipe your lessons progress and statistics? This cannot be undone.")) {
      localStorage.removeItem(LOCAL_STORAGE_PROGRESS_KEY);
      setProgress({
        completedLessonIds: [],
        streak: 1,
        lastActiveDate: null,
        quizAnswers: {}
      });
      alert("Lesson progress wiped cleanly. Have fun starting afresh!");
    }
  };

  const handleUnlockAllProgress = () => {
    const allLessonIds = UNITS.flatMap((u) => u.lessons.map((l) => l.id));
    const updatedProgress: UserProgress = {
      ...progress,
      completedLessonIds: allLessonIds,
      streak: 99,
      lastActiveDate: new Date().toDateString()
    };
    saveProgressToStorage(updatedProgress);
    alert("🎉 Master Key Activated! All microlearning units, simulators, and interactive workbenches have been unlocked. Go back to the 'Discovery' or 'My Path' tab to explore every corner of the app!");
  };

  // Triggers next ideal uncompleted lesson
  const handleContinueLearning = () => {
    // Traverse all units and lessons to find first uncompleted ID
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) {
        if (!progress.completedLessonIds.includes(lesson.id)) {
          setActiveLesson(lesson);
          setActiveLessonUnit(unit);
          trackEvent("lesson_started", { unit_id: unit.id, lesson_id: lesson.id });
          return;
        }
      }
    }
    // If all completed, open the final lesson
    const lastUnit = UNITS[UNITS.length - 1];
    const lastLesson = lastUnit.lessons[lastUnit.lessons.length - 1];
    setActiveLesson(lastLesson);
    setActiveLessonUnit(lastUnit);
    trackEvent("lesson_started", { unit_id: lastUnit.id, lesson_id: lastLesson.id });
  };

  const handleSelectLesson = (lesson: Lesson, unit: Unit) => {
    setActiveLesson(lesson);
    setActiveLessonUnit(unit);
    trackEvent("lesson_started", { unit_id: unit.id, lesson_id: lesson.id });
  };

  // Community Feed helpers
  const handleAddPost = (content: string, category: string, unitShared?: any) => {
    const newPost: ForumPost = {
      id: "usr-post-" + Date.now(),
      authorName: "You (Active Learner)",
      authorRole: "Continuous Discovery Practitioner Apprentice",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      content: content,
      likesCount: 0,
      timestamp: "Just now",
      comments: [],
      unitShared: unitShared || null
    };

    savePostsToStorage([newPost, ...posts]);
  };

  const handleLikePost = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const hasLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked,
          likesCount: hasLiked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    });
    savePostsToStorage(updated);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const newComment = {
          id: "c-" + Date.now(),
          authorName: "You",
          content: commentText,
          timestamp: "Just now"
        };
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    });
    savePostsToStorage(updated);
  };

  const handleShareCertificateToFeed = (name: string) => {
    const certPost: ForumPost = {
      id: "cert-post-" + Date.now(),
      authorName: name,
      authorRole: "Discovery Certified Practitioner",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      content: `Extremely proud to share that I have completed the full professional Product Discovery Curriculum and received my verified Practitioner Certificate! Loving the continuous validation habit! 🎓🚀`,
      likesCount: 5,
      hasLiked: false,
      timestamp: "Just now",
      comments: [],
      unitShared: {
        unitNumber: 4,
        unitTitle: "Prioritisation (RICE Formula Complete)",
        score: "PRAC"
      }
    };
    savePostsToStorage([certPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-4 px-2 sm:py-6" id="app-root-container">
      {/* Upper Dual Layout Mode Toggler Panel */}
      <div className="w-full max-w-lg mb-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 shadow-sm flex items-center justify-between gap-2 z-20" id="dual-layout-picker">
        <div className="flex items-center gap-2 pl-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700 font-sans tracking-wide">Display Mode:</span>
        </div>
        <div className="flex bg-slate-150 p-0.5 rounded-xl border border-slate-200/50">
          <button
            onClick={() => {
              setDisplayMode("app");
              localStorage.setItem("pm_scholar_display_mode", "app");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer ${
              displayMode === "app"
                ? "bg-white text-blue-650 shadow-2xs font-extrabold"
                : "text-slate-500 hover:text-slate-850"
            }`}
            id="switch-mode-app"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Device View
          </button>
          <button
            onClick={() => {
              setDisplayMode("web");
              localStorage.setItem("pm_scholar_display_mode", "web");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer ${
              displayMode === "web"
                ? "bg-white text-blue-650 shadow-2xs font-extrabold"
                : "text-slate-500 hover:text-slate-850"
            }`}
            id="switch-mode-web"
          >
            <Monitor className="w-3.5 h-3.5" />
            Full Web Portal
          </button>
        </div>
      </div>

      {/* Contained Viewport */}
      <div 
        className={`w-full bg-slate-50 flex flex-col justify-between overflow-hidden relative shadow-2xl transition-all duration-300 ${
          displayMode === "app"
            ? "max-w-lg min-h-screen sm:min-h-[850px] sm:max-h-[920px] sm:rounded-3xl sm:border border-slate-200"
            : "max-w-6xl min-h-screen sm:min-h-[850px] sm:rounded-2xl sm:border border-slate-200"
        }`} 
        id="applet-frame"
      >
        
        {/* Device Topbar/notch simulation details */}
        <div className="shrink-0 bg-white border-b border-slate-150 px-4 py-3 flex justify-between items-center z-10" id="header-cockpit">
          {/* User profile with placeholder avy on the left */}
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
              alt="PM Scholar user avatar"
              className="w-10 h-10 rounded-full border border-slate-200/50 object-cover"
              referrerPolicy="no-referrer"
              id="header-user-avatar"
            />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">LEARNING PLATFORM</span>
              <h1 className="font-display font-extrabold text-sm sm:text-base text-blue-900 tracking-tight leading-none">
                PM Scholar
              </h1>
            </div>
          </div>

          {/* Streak indicator on the right */}
          <div className="flex items-center gap-1 text-slate-700 bg-slate-100 hover:bg-slate-150 px-3 py-1.5 rounded-full select-none shadow-3xs cursor-pointer" id="header-streak-badge" onClick={() => setCurrentTab("profile")}>
            <span className="font-mono text-sm font-bold text-slate-800">{progress.streak}</span>
            <Flame className="w-4 h-4 text-rose-500 fill-current animate-pulse shrink-0" />
          </div>
        </div>

        {/* Scrollable Content Deck */}
        <div className="flex-grow overflow-y-auto px-4 py-5" id="tab-viewport-scrollable">
          {currentTab === "discovery" && (
            <DiscoveryTab
              progress={progress}
              onSelectLesson={handleSelectLesson}
              onExploreCommunity={() => setCurrentTab("community")}
              onContinueLearning={handleContinueLearning}
              onNavigateToMyPathSection={(section) => {
                setCurrentTab("my-path");
                setMyPathSection(section);
              }}
            />
          )}

          {currentTab === "my-path" && (
            <MyPathTab
              progress={progress}
              onUpdateLocalProgress={saveProgressToStorage}
              onSelectCustomLesson={handleSelectLesson}
              onSelectLesson={handleSelectLesson}
              activeSection={myPathSection}
              onActiveSectionChange={setMyPathSection}
              onShareToFeed={(content, unitShared) => {
                const newPost: ForumPost = {
                  id: "usr-post-" + Date.now(),
                  authorName: "You (Active Learner)",
                  authorRole: "Continuous Discovery Practitioner Apprentice",
                  authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
                  content,
                  likesCount: 0,
                  timestamp: "Just now",
                  comments: [],
                  unitShared
                };
                savePostsToStorage([newPost, ...posts]);
              }}
            />
          )}

          {currentTab === "community" && (
            <CommunityTab
              posts={posts}
              onAddPost={handleAddPost}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              progress={progress}
              onNavigateToMyPathSection={(section) => {
                setCurrentTab("my-path");
                setMyPathSection(section);
              }}
            />
          )}

          {currentTab === "profile" && (
            <ProfileTab
              progress={progress}
              onClearProgress={handleClearProgress}
              onUnlockAllProgress={handleUnlockAllProgress}
              onShareCertificateToFeed={handleShareCertificateToFeed}
              onUpdateLocalProgress={saveProgressToStorage}
              onSyncTrigger={syncWithSupabase}
            />
          )}
        </div>

        {/* Fixed Under Navigation Tabs with touch targets ≥44px */}
        <div className="shrink-0 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center z-10 shadow-lg" id="under-navbar">
          {/* DISCOVERY TAB BTN */}
          <button
            onClick={() => setCurrentTab("discovery")}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-h-[44px] transition cursor-pointer relative ${
              currentTab === "discovery" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
            id="tab-btn-discovery"
          >
            {currentTab === "discovery" && (
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-blue-600 rounded-full"></span>
            )}
            <Compass className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Discovery</span>
          </button>

          {/* MY PATH TAB BTN */}
          <button
            onClick={() => setCurrentTab("my-path")}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-h-[44px] transition cursor-pointer relative ${
              currentTab === "my-path" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
            id="tab-btn-mypath"
          >
            {currentTab === "my-path" && (
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-blue-600 rounded-full"></span>
            )}
            <BookOpen className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="text-[10px] mt-0.5 tracking-tight">My Path</span>
          </button>

          {/* COMMUNITY TAB BTN */}
          <button
            onClick={() => setCurrentTab("community")}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-h-[44px] transition cursor-pointer relative ${
              currentTab === "community" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
            id="tab-btn-community"
          >
            {currentTab === "community" && (
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-blue-600 rounded-full"></span>
            )}
            <Users className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Community</span>
          </button>

          {/* PROFILE TAB BTN */}
          <button
            onClick={() => setCurrentTab("profile")}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-h-[44px] transition cursor-pointer relative ${
              currentTab === "profile" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
            id="tab-btn-profile"
          >
            {currentTab === "profile" && (
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-blue-600 rounded-full"></span>
            )}
            <User className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
            <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
          </button>
        </div>

        {/* Detailed course overlay playing panel */}
        {activeLesson && activeLessonUnit && (
          <LessonOverlay
            lesson={activeLesson}
            unit={activeLessonUnit}
            onClose={() => {
              setActiveLesson(null);
              setActiveLessonUnit(null);
            }}
            onComplete={handleLessonComplete}
          />
        )}

        {/* Unit Completion Screen Overlay */}
        {completedUnit && (
          <UnitCompletionOverlay
            unit={completedUnit}
            streak={progress.streak}
            onClose={() => setCompletedUnit(null)}
          />
        )}
      </div>
    </div>
  );
}
