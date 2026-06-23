import React, { useState, useEffect } from "react";
import { Database, Link, RefreshCcw, CheckCircle, XCircle, Info, Copy, Settings, HelpCircle, Save, Download, Upload } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { UserProgress } from "../types";
import { initSupabaseClient, getSupabaseConfig, saveSupabaseConfig } from "../lib/supabaseClient";

interface SupabaseSyncProps {
  progress: UserProgress;
  onUpdateLocalProgress: (progress: UserProgress) => void;
  onSyncTrigger?: () => void;
}

export default function SupabaseSync({ progress, onUpdateLocalProgress, onSyncTrigger }: SupabaseSyncProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [status, setStatus] = useState<"disconnected" | "connected" | "error" | "syncing">("disconnected");
  const [statusMsg, setStatusMsg] = useState("");
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load existing credentials
  useEffect(() => {
    const config = getSupabaseConfig();
    setUrl(config.url);
    setAnonKey(config.key);
    
    if (config.url && config.key) {
      testConnection(config.url, config.key);
    }
  }, []);

  const testConnection = async (testUrl: string, testKey: string, testSchema?: string) => {
    if (!testUrl || !testKey) {
      setStatus("disconnected");
      setStatusMsg("Credentials not fully provided.");
      return;
    }

    setStatus("syncing");
    setStatusMsg("Connecting to Supabase...");

    try {
      const activeSchema = testSchema !== undefined ? testSchema : (getSupabaseConfig().schema || "public");
      const options = activeSchema && activeSchema !== "public" ? { db: { schema: activeSchema } } : undefined;
      const tempClient = createClient(testUrl, testKey, options);

      // We read or write to "pm_scholar_progress" or "progress" depending on schema isolation
      const tableName = activeSchema === "pm_scholar" ? "progress" : "pm_scholar_progress";
      const userEmail = "nsp1235679@gmail.com"; // Standard user identifier
      const { data, error } = await tempClient
        .from(tableName)
        .select("*")
        .eq("user_email", userEmail)
        .maybeSingle();

      if (error) {
        // If error code is 'PGRST116' (no rows found or check succeeded but null), that's fine.
        // But if error is relation doesn't exist, we notify them to run the SQL script.
        if (error.code === "PGRST116") {
          setStatus("connected");
          setStatusMsg(`Connected! Custom schema '${activeSchema}' exists, but no user record found yet.`);
        } else if (error.code === "PGRST106" || (error.message && error.message.includes("Invalid schema"))) {
          setStatus("error");
          setStatusMsg(`Schema '${activeSchema}' is not exposed in your Supabase API settings. Go to Settings > API in your Supabase Dashboard, look for 'Exposed schemas', add 'pm_scholar', press ENTER to convert it to a tag, and click the green 'Save' button at the bottom of the page! Or, simply switch to Prefix Mode above to use the public schema.`);
        } else if (
          error.code === "PGRST205" || 
          (error.message && error.message.includes("relation")) ||
          (error.message && error.message.includes("not found in the schema cache"))
        ) {
          setStatus("error");
          const targetTablePath = activeSchema === "pm_scholar" ? "pm_scholar.progress" : "public.pm_scholar_progress";
          setStatusMsg(`Table '${targetTablePath}' is missing in your Supabase project. Open the 'Multi-Project Database Setup Guide (4 Schemas)' below, select Tab 1, and run the SQL code inside your Supabase SQL Editor!`);
        } else {
          setStatus("error");
          setStatusMsg(`Database Query Error: ${error.message} (Code: ${error.code}). Please copy and execute the database schema SQL scripts provided below.`);
        }
      } else {
        const targetTablePath = activeSchema === "pm_scholar" ? "pm_scholar.progress" : "public.pm_scholar_progress";
        setStatus("connected");
        setStatusMsg(`Connected! Table '${targetTablePath}' is active.`);
        // If they have existing remote progress, let the user know they can sync/download it
        if (data) {
          setStatusMsg(`Connected! Remote progress found (Streak: ${data.streak}, Lessons Completed: ${data.completed_lesson_ids?.length || 0}).`);
        }
        if (onSyncTrigger) {
          onSyncTrigger();
        }
      }
    } catch (err: any) {
      setStatus("error");
      setStatusMsg(`Connection Failed: ${err?.message || "Check keys, network stability, and CORS configurations."}`);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();
    const selectedSchema = schemaMode === "schema" ? "pm_scholar" : "public";

    saveSupabaseConfig(cleanUrl, cleanKey, selectedSchema);
    setIsConfiguring(false);
    
    if (cleanUrl && cleanKey) {
      await testConnection(cleanUrl, cleanKey, selectedSchema);
    } else {
      setStatus("disconnected");
      setStatusMsg("Supabase integration disabled. Reverting back to browser localStorage fallback.");
    }
  };

  const handleDownload = async () => {
    const config = getSupabaseConfig();
    const tempClient = initSupabaseClient();
    if (!tempClient) {
      alert("Please configure a valid Supabase key first.");
      return;
    }

    setStatus("syncing");
    setStatusMsg("Downloading cloud progress...");

    try {
      const userEmail = "nsp1235679@gmail.com";
      const tableName = config.schema === "pm_scholar" ? "progress" : "pm_scholar_progress";
      const { data, error } = await tempClient
        .from(tableName)
        .select("*")
        .eq("user_email", userEmail)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const remoteProgress: UserProgress = {
          completedLessonIds: Array.isArray(data.completed_lesson_ids) ? data.completed_lesson_ids : [],
          streak: typeof data.streak === "number" ? data.streak : 1,
          lastActiveDate: data.last_active_date || null,
          quizAnswers: typeof data.quiz_answers === "object" && data.quiz_answers !== null ? data.quiz_answers : {}
        };
        onUpdateLocalProgress(remoteProgress);
        setStatus("connected");
        setStatusMsg("Successfully localized cloud progress.");
        alert("📥 Progress downloaded from Supabase and synchronized locally!");
      } else {
        setStatus("connected");
        setStatusMsg("No cloud saving found for your email. Try pushing your local stats up!");
        alert("No cloud data exists yet. Click 'Upload to Cloud' to push this device's progress to Supabase.");
      }
    } catch (err: any) {
      setStatus("error");
      setStatusMsg(`Download crashed: ${err.message}`);
      alert(`Cloud sync download error: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    const config = getSupabaseConfig();
    const tempClient = initSupabaseClient();
    if (!tempClient) {
      alert("Configure a valid Supabase setup first.");
      return;
    }

    setStatus("syncing");
    setStatusMsg("Uploading stats to database tables...");

    try {
      const userEmail = "nsp1235679@gmail.com";
      const tableName = config.schema === "pm_scholar" ? "progress" : "pm_scholar_progress";
      
      // Upsert the progress record
      const { error } = await tempClient
        .from(tableName)
        .upsert({
          user_email: userEmail,
          completed_lesson_ids: progress.completedLessonIds,
          streak: progress.streak,
          last_active_date: progress.lastActiveDate,
          quiz_answers: progress.quizAnswers,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_email"
        });

      if (error) {
        throw error;
      }

      setStatus("connected");
      setStatusMsg("Local progress saved to Supabase securely.");
      alert("📤 local progress pushed to Supabase database successfully!");
    } catch (err: any) {
      setStatus("error");
      setStatusMsg(`Upload failed: ${err.message}`);
      alert(`Could not push progress to your database: ${err.message}\n\nMake sure the table exists and CORS/RLS settings permit updates.`);
    }
  };

  const [sqlTab, setSqlTab] = useState<"progress" | "posts" | "workbenches" | "profiles">("progress");
  const [schemaMode, setSchemaMode] = useState<"prefix" | "schema">(() => {
    const config = getSupabaseConfig();
    return config.schema === "pm_scholar" ? "schema" : "prefix";
  });

  const handleToggleSchemaMode = (mode: "prefix" | "schema") => {
    setSchemaMode(mode);
    const config = getSupabaseConfig();
    if (config.url && config.key) {
      saveSupabaseConfig(config.url, config.key, mode === "schema" ? "pm_scholar" : "public");
      testConnection(config.url, config.key, mode === "schema" ? "pm_scholar" : "public");
    }
  };

  const progressSql = `-- Table 1: Learning Progress Tracker (completed lessons, quiz answers, streaks)
create table public.pm_scholar_progress (
  id uuid default gen_random_uuid() primary key,
  user_email text unique not null,
  completed_lesson_ids jsonb default '[]'::jsonb not null,
  streak integer default 7 not null,
  last_active_date text,
  quiz_answers jsonb default '{}'::jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.pm_scholar_progress enable row level security;

-- Create direct access policy for study client applications
create policy "Allow internal read/write for all active scholars"
on public.pm_scholar_progress
for all
using (true)
with check (true);`;

  const postsSql = `-- Table 2: Peer Review Discovery Community Feed
create table public.pm_scholar_posts (
  id text primary key,
  author_name text not null,
  author_role text not null,
  author_avatar text not null,
  content text not null,
  likes_count integer default 0 not null,
  has_liked boolean default false not null,
  timestamp text not null,
  comments jsonb default '[]'::jsonb not null,
  unit_shared jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pm_scholar_posts enable row level security;

create policy "Allow read and write access for squad community posts"
on public.pm_scholar_posts
for all
using (true)
with check (true);`;

  const workbenchesSql = `-- Table 3: Active Workbench Playbook Saves (JTBD, Assumptions, Prioritizations)
create table public.pm_scholar_workbenches (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  workbench_id text not null, -- 'jtbd', 'assumption_mapping', 'prioritisation'
  saved_state jsonb not null, -- specific configurations, matrix positions, and score metrics
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_workbench unique(user_email, workbench_id)
);

-- Enable RLS
alter table public.pm_scholar_workbenches enable row level security;

create policy "Allow read/write access for interactive playbooks"
on public.pm_scholar_workbenches
for all
using (true)
with check (true);`;

  const profilesSql = `-- Table 4: User Profile Customizations & Practitioner Certificates
create table public.pm_scholar_profiles (
  id uuid default gen_random_uuid() primary key,
  user_email text unique not null,
  display_name text default 'Aspiring Product Master' not null,
  professional_role text default 'Continuous Discovery Practitioner' not null,
  avatar_url text not null,
  bio text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pm_scholar_profiles enable row level security;

create policy "Allow read and write access for custom user profiles"
on public.pm_scholar_profiles
for all
using (true)
with check (true);`;

  const getActiveSql = () => {
    let sql = "";
    switch (sqlTab) {
      case "progress": sql = progressSql; break;
      case "posts": sql = postsSql; break;
      case "workbenches": sql = workbenchesSql; break;
      case "profiles": sql = profilesSql; break;
    }

    if (schemaMode === "schema") {
      const header = `-- ==========================================\n-- PLAN B: DEDICATED DATABASE SCHEMA\n-- Creates an isolated PostgreSQL schema "pm_scholar" in your DB.\n-- Separates this app's tables and grants API access.\n-- ==========================================\nCREATE SCHEMA IF NOT EXISTS pm_scholar;\n\n-- IMPORTANT: Grant schema USAGE and future default table privileges to Supabase/PostgREST roles\nGRANT USAGE ON SCHEMA pm_scholar TO anon, authenticated, service_role;\nALTER DEFAULT PRIVILEGES IN SCHEMA pm_scholar GRANT ALL ON TABLES TO anon, authenticated, service_role;\nALTER DEFAULT PRIVILEGES IN SCHEMA pm_scholar GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;\nALTER DEFAULT PRIVILEGES IN SCHEMA pm_scholar GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;\n\n`;
      let convertedSql = sql
        .replace(/public\.pm_scholar_progress/g, "pm_scholar.progress")
        .replace(/public\.pm_scholar_posts/g, "pm_scholar.posts")
        .replace(/public\.pm_scholar_workbenches/g, "pm_scholar.workbenches")
        .replace(/public\.pm_scholar_profiles/g, "pm_scholar.profiles");

      let tableName = "";
      if (sqlTab === "progress") tableName = "pm_scholar.progress";
      else if (sqlTab === "posts") tableName = "pm_scholar.posts";
      else if (sqlTab === "workbenches") tableName = "pm_scholar.workbenches";
      else if (sqlTab === "profiles") tableName = "pm_scholar.profiles";

      if (tableName) {
        convertedSql += `\n\n-- Ensure API roles can access this table directly\nGRANT ALL ON TABLE ${tableName} TO anon, authenticated, service_role;\n`;
      }

      // Add PostgREST reload helper command at the very end
      convertedSql += `\n-- Force PostgREST schema cache reload\nNOTIFY pgrst, 'reload schema';\n`;

      return header + convertedSql;
    }
    return sql;
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(getActiveSql());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4" id="supabase-sync-panel">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-800 leading-none flex items-center gap-1.5">
              Own Database Integration (Supabase)
            </h4>
            <p className="text-[10px] text-slate-550 mt-1">
              Synchronize e-learning progress and custom simulator answers across multiple devices.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConfiguring(!isConfiguring)}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition"
          id="toggle-supabase-settings"
        >
          <Settings className="w-3.5 h-3.5" />
          {isConfiguring ? "Close" : "Setup Keys"}
        </button>
      </div>

      {/* Connection State Details */}
      <div className="bg-slate-50 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            {status === "connected" && (
              <span className="flex items-center gap-1 font-bold text-emerald-600 font-sans">
                <CheckCircle className="w-3.5 h-3.5" /> Synchronized Backend Connected
              </span>
            )}
            {status === "syncing" && (
              <span className="flex items-center gap-1 font-bold text-amber-600 animate-pulse font-sans">
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Querying Database...
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 font-bold text-rose-600 font-sans">
                <XCircle className="w-3.5 h-3.5" /> Connection Flagged
              </span>
            )}
            {status === "disconnected" && (
              <span className="flex items-center gap-1 font-bold text-slate-500 font-sans">
                <Info className="w-3.5 h-3.5" /> Local Fallback Active
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-550 font-sans leading-relaxed">
            {statusMsg || "Saving progress automatically only to local browser storage."}
          </p>
        </div>

        {status === "connected" && (
          <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            <button
              onClick={handleDownload}
              className="flex-grow sm:flex-none py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-3xs"
              id="download-progress-cloud"
            >
              <Download className="w-3 h-3" /> Download Cloud
            </button>
            <button
              onClick={handleUpload}
              className="flex-grow sm:flex-none py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-3xs"
              id="upload-progress-cloud"
            >
              <Upload className="w-3 h-3" /> Push Progress
            </button>
          </div>
        )}
      </div>

      {/* Configuration Input Panel */}
      {isConfiguring && (
        <form onSubmit={handleSaveCredentials} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3.5 animate-fadeIn" id="supabase-config-form">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Configure Supabase endpoint</span>
            <p className="text-[10px] text-slate-450">
              Provide credentials to sync study points. Your keys are treated safely and saved purely in your client browser cache.
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Supabase URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-250 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Supabase Anon key (JWT)</label>
              <input
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-250 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setAnonKey("");
                saveSupabaseConfig("", "");
                setStatus("disconnected");
                setStatusMsg("Database connection reset. Reverting to local storage.");
                setIsConfiguring(false);
              }}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-bold text-[10px] transition cursor-pointer"
            >
              Clear Connection
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Save className="w-3 h-3" /> Apply Keys
            </button>
          </div>
        </form>
      )}

      {/* SQL Setup Guide */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => setShowSqlGuide(!showSqlGuide)}
          className="w-full text-left font-display font-semibold text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 p-3 flex justify-between items-center transition cursor-pointer"
          id="toggle-sql-guide"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" /> Multi-Project Database Setup Guide (4 Schemas)
          </span>
          <span className="text-[10px] text-blue-600 hover:underline">
            {showSqlGuide ? "Hide Setup Panel" : "View SQL Setup Panel"}
          </span>
        </button>

        {showSqlGuide && (
          <div className="p-4 bg-slate-900 text-slate-300 space-y-4 relative animate-fadeIn" id="supabase-multi-sql-guide">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Initialize Blank Database Tables</span>
              <p className="text-[10px] text-slate-400 font-sans leading-normal">
                Click on the tabs below to view and copy the specific SQL table schemas. You can host this alongside your other 3 projects inside the same database!
              </p>
            </div>

            {/* Strategy Toggler */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-sans">Multi-Project Isolation Strategy:</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">1 DB, Multiple Projects</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleToggleSchemaMode("prefix")}
                  className={`px-2 py-1.5 rounded text-[10px] font-bold tracking-wide font-sans transition cursor-pointer text-center ${
                    schemaMode === "prefix"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="toggle-multi-prefix"
                >
                  Option A: Prefixed Tables (public.pm_scholar_*)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSchemaMode("schema")}
                  className={`px-2 py-1.5 rounded text-[10px] font-bold tracking-wide font-sans transition cursor-pointer text-center ${
                    schemaMode === "schema"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  id="toggle-multi-schema"
                >
                  Option B: Custom Schema (pm_scholar.*)
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                {schemaMode === "prefix" 
                  ? "💡 Recommended for standard Supabase. All tables live inside your default 'public' schema but use 'pm_scholar_...' prefixes. This prevents naming collisions with your other 3 projects and works automatically."
                  : "🚀 Advanced. Separates this app entirely by creating a dedicated PostgreSQL schema namespace called 'pm_scholar'. In Supabase, make sure to add 'pm_scholar' down in Settings -> API -> Exposed Schemas."
                }
              </p>
            </div>

            {/* Schema Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2">
              {[
                { id: "progress", label: "1. Progress Sync", tablename: "pm_scholar_progress" },
                { id: "posts", label: "2. Forum Feed", tablename: "pm_scholar_posts" },
                { id: "workbenches", label: "3. Playbook Saves", tablename: "pm_scholar_workbenches" },
                { id: "profiles", label: "4. Scholar Profiles", tablename: "pm_scholar_profiles" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSqlTab(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-md font-mono text-[10px] font-bold tracking-wide transition border cursor-pointer ${
                    sqlTab === tab.id
                      ? "bg-emerald-650 border-emerald-500 text-white shadow-xs"
                      : "bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                  id={`sql-tab-btn-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center text-slate-400 font-mono text-[9px]">
              <span className="uppercase text-amber-400 font-bold">SQL QUERY FOR {sqlTab.toUpperCase()}</span>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[9px] font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy SQL Code"}
              </button>
            </div>

            <pre className="overflow-x-auto max-h-64 p-3 bg-slate-950 rounded border border-slate-800 text-teal-400 font-mono text-[10px] whitespace-pre scrollbar-thin">
              {getActiveSql()}
            </pre>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[10px] font-sans text-slate-400 leading-normal flex items-start gap-2">
              <span className="text-emerald-500 font-bold text-xs">🚀</span>
              <div>
                <strong>How to deploy:</strong> Copy the code block above, open your <strong>Supabase Console</strong> project, go to the <strong>SQL Editor</strong> in the left sidebar, click <strong>"New Query"</strong>, paste this in, and hit <strong>"Run"</strong>. Repeat this for all tables to build a neat, structured multi-project database!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
