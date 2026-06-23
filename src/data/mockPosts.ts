import { ForumPost } from "../types";

export const INITIAL_POSTS: ForumPost[] = [
  {
    id: "post-1",
    authorName: "Ananya Mehta",
    authorRole: "Platform PM @ TechCorp",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    content: "Just completed Teresa Torres' book. We started our Product Trio calls last week (PM + Designer + Eng Lead) and the immediate alignment is incredible. Instead of debating features, we are talking about outcomes. Highly recommend trying the OST tree structure described in Unit 1! ✨",
    likesCount: 14,
    hasLiked: false,
    timestamp: "2 hours ago",
    comments: [
      {
        id: "c-1",
        authorName: "Rohan Das",
        content: "Totally agree! Moving from output-thinking to outcome-thinking is a complete game changer. Who did you invite from Eng to your trio?",
        timestamp: "1 hour ago"
      },
      {
        id: "c-2",
        authorName: "Ananya Mehta",
        content: "We brought our Tech Lead. He's been able to spot feasibility issues in 10 seconds during customer conversations, saving weeks of speculative mockups.",
        timestamp: "45 mins ago"
      }
    ],
    unitShared: null
  },
  {
    id: "post-2",
    authorName: "Devin Gupta",
    authorRole: "Aspiring PM | Scaler Cohort",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    content: "Attempted writing a JTBD statement for our mock final project on a ride-sharing service. Let me know what you think:\n\n'When traveling during torrential rains with limited mobile network, I want to easily order a cab without the app crashing, so I can arrive home safely and dry.'\n\nIs 'cab ordering' considered a feature contaminant here, or does it stay true to motivation?",
    likesCount: 8,
    hasLiked: false,
    timestamp: "5 hours ago",
    comments: [
      {
        id: "c-3",
        authorName: "Vikram Sen",
        content: "Great start Devin! 'Order a cab' is close to the core job of commuting, but maybe 'secure a dry, direct transport' is even more generic to prevent solution-anchoring. Still, extremely realistic context!",
        timestamp: "3 hours ago"
      }
    ],
    unitShared: null
  },
  {
    id: "post-3",
    authorName: "Sarah Al-Ghazali",
    authorRole: "Associate PM @ FinGrow",
    authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
    content: "Celebrated milestone check! Reached a 12-day discovery practice streak. Loving how active recall and tactical workbenches prevent content rot. Keeping my streak ablaze 🔥",
    likesCount: 22,
    hasLiked: true,
    timestamp: "1 day ago",
    comments: [],
    unitShared: {
      unitNumber: 2,
      unitTitle: "Jobs-to-be-Done",
      score: "100%"
    }
  }
];
