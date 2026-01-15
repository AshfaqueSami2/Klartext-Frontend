export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  profileImage?: string;
  authProvider?: 'local' | 'google';
  needsPasswordChange?: boolean;
}

// ✅ NEW: Stats from your Analytics Endpoint
export interface IStats {
  totalWords: number;
  completedLessons: number;
  coins: number;
  currentLevel: string; // e.g. "A1"
}

// ✅ NEW: Lesson Interface
export interface ILesson {
  _id: string;
  title: string;
  content: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  coverImage?: string;
  author?: {
    name: string;
  };
  isCompleted?: boolean;
  isFreePreview?: boolean;
  lessonNumber?: number;
}

export interface IStudentProfile {
  user: IUser;
  currentLevel: string;
  coins: number;
}