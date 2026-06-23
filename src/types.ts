export interface SlideContent {
  title: string;
  body: string;
  evidenceTier?: "T1" | "T2" | "T3" | "T4" | "T5";
  evidenceSource?: string;
  tip?: string;
  example?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMins: number;
  slides: SlideContent[];
  quiz: QuizQuestion;
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  durationMins: number;
  lessons: Lesson[];
}

export interface UserProgress {
  completedLessonIds: string[];
  streak: number;
  lastActiveDate: string | null;
  quizAnswers: Record<string, number>; // lessonId -> selected option index
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  content: string;
  likesCount: number;
  hasLiked?: boolean;
  comments: {
    id: string;
    authorName: string;
    content: string;
    timestamp: string;
  }[];
  timestamp: string;
  unitShared?: {
    unitNumber: number;
    unitTitle: string;
    score: string;
  } | null;
}
