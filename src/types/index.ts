
export interface User {
  id: string;
  name: string;
  email: string;
  skills: string[];
  visualPoints: number;
  textualPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  skillsOffered: string[];
  creatorId: string;
  creatorName: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  systemPrompt: string;
}

export interface Module {
  id: string;
  title: string;
  courseId: string;
  order: number;
}

export interface ModuleContent {
  id: string;
  moduleId: string;
  content: string;
  visualContent?: string[];
  textualContent?: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  type: 'visual' | 'textual';
}

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  completedModules: string[];
  quizScores: Record<string, number>;
  lastAccessed: string;
  personalizedContent?: Record<string, any>;
}
