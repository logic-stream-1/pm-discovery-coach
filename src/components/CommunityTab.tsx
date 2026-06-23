import React, { useState } from "react";
import { ThumbsUp, MessageSquare, Send, PlusCircle, Share2, Award, Zap } from "lucide-react";
import { ForumPost } from "../types";
import { INITIAL_POSTS } from "../data/mockPosts";

interface CommunityTabProps {
  posts: ForumPost[];
  onAddPost: (content: string, category: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

export default function CommunityTab({ posts, onAddPost, onLikePost, onAddComment }: CommunityTabProps) {
  const [newPostText, setNewPostText] = useState("");
  const [category, setCategory] = useState("Insight");
  const [showEditor, setShowEditor] = useState(false);
  const [commentStates, setCommentStates] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    onAddPost(newPostText, category);
    setNewPostText("");
    setShowEditor(false);
  };

  const handleAddCommentSubmit = (postId: string) => {
    const text = commentStates[postId] || "";
    if (!text.trim()) return;
    onAddComment(postId, text);
    setCommentStates((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="community-tab">
      {/* Feed title */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
            PM Scholar Squad Feed
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            Discuss continuous outcomes, peer review JTBD statements, and collaborate live.
          </p>
        </div>
        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="p-2 sm:px-3 sm:py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            id="open-editor-btn"
          >
            <PlusCircle className="w-4 h-4" /> <span className="hidden sm:inline">Write Post</span>
          </button>
        )}
      </div>

      {/* Editor Modal/Expanded Form */}
      {showEditor && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white border-2 border-dashed border-blue-200 rounded-xl p-4 sm:p-5 shadow-xs relative animate-fadeIn"
          id="post-creator-form"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold font-display text-slate-700">Compose post to PM Squad</span>
            <div className="flex gap-1">
              {["Insight", "Question", "Resource"].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md border tracking-wide transition ${
                    category === cat
                      ? "bg-blue-50 border-blue-200 text-blue-700"
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
            placeholder="Share an Opportunity-Solution Tree insight, or draft a JTBD question for peer checking..."
            rows={3}
            className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            id="post-textarea"
          ></textarea>

          <div className="mt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowEditor(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              id="cancel-post"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newPostText.trim()}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                newPostText.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              id="submit-post-btn"
            >
              Publish <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      <div className="space-y-4" id="community-posts-list">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-slate-250 rounded-xl p-4 sm:p-5 shadow-3xs text-left"
            id={`post-card-${post.id}`}
          >
            {/* Post Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
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

            {/* Post shared badge */}
            {post.unitShared && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3 flex items-center justify-between" id="shared-achievement-badge">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block font-sans">
                      Achievement Shared
                    </span>
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      Completed Unit {post.unitShared.unitNumber}: {post.unitShared.unitTitle}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">
                  {post.unitShared.score} Score
                </span>
              </div>
            )}

            {/* Post Body */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
              {post.content}
            </p>

            {/* Likes and Commands counter */}
            <div className="flex gap-4 text-xs text-slate-500 border-t border-slate-50 pt-3">
              <button
                onClick={() => onLikePost(post.id)}
                className={`flex items-center gap-1.5 transition cursor-pointer ${
                  post.hasLiked ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                }`}
                id={`like-btn-${post.id}`}
              >
                <ThumbsUp className={`w-4 h-4 ${post.hasLiked ? "fill-current" : ""}`} />
                <span>{post.likesCount} {post.likesCount === 1 ? "Like" : "Likes"}</span>
              </button>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}</span>
              </div>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50/50 rounded-lg space-y-2.5 border border-slate-100" id={`comments-list-${post.id}`}>
                {post.comments.map((comment) => (
                  <div key={comment.id} className="text-xs leading-normal">
                    <span className="font-bold text-slate-700 mr-1.5">{comment.authorName}</span>
                    <span className="text-slate-400 text-[10px] mr-2 font-mono">{comment.timestamp}</span>
                    <p className="text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment input form */}
            <div className="mt-3.5 flex gap-2">
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
                className="flex-grow text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                id={`comment-input-${post.id}`}
              />
              <button
                onClick={() => handleAddCommentSubmit(post.id)}
                className="px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 text-blue-700 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center justify-center p-2"
                id={`submit-comment-${post.id}`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
