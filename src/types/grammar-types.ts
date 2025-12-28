/**
 * Grammar System Type Definitions
 */

export interface GrammarError extends Error {
  code?: string;
  statusCode?: number;
  retryable?: boolean;
}

export interface GrammarLesson {
  id: string;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  content: string;
  exercises?: GrammarExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface GrammarExercise {
  id: string;
  type: 'fill-in-the-blank' | 'multiple-choice' | 'translation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface GrammarProgress {
  lessonId: string;
  completed: boolean;
  score?: number;
  completedAt?: string;
}

