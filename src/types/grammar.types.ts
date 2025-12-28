/**
 * Grammar Module - Complete Type Definitions
 */

// ============================================================================
// TOPIC TYPES
// ============================================================================

export interface GrammarTopic {
  _id: string;
  title: string;
  titleDe: string;
  slug: string;
  description: string;
  descriptionDe: string;
  icon: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  order: number;
  coverImage?: string;
  isPublished: boolean;
  lessonsCount?: number;
  exerciseSetsCount?: number;
  userProgress?: {
    lessonsCompleted: number;
    exercisesPassed: number;
    masteryLevel: MasteryLevel;
  };
  createdAt: string;
  updatedAt: string;
}

export type MasteryLevel = 'not-started' | 'beginner' | 'intermediate' | 'advanced' | 'mastered';

// ============================================================================
// LESSON TYPES
// ============================================================================

export interface GrammarLesson {
  _id: string;
  topic: string | GrammarTopic;
  title: string;
  titleDe: string;
  slug: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  order: number;
  introduction: string;
  introductionDe: string;
  explanationBlocks: ExplanationBlock[];
  keyPoints: KeyPoint[];
  commonMistakes: CommonMistake[];
  practiceExamples: PracticeExample[];
  estimatedTime: number; // in minutes
  isPublished: boolean;
  userProgress?: {
    isCompleted: boolean;
    timeSpent: number;
    completedAt?: string;
  };
  exerciseSets?: ExerciseSet[];
  createdAt: string;
  updatedAt: string;
}

export type ExplanationBlockType = 'text' | 'table' | 'example' | 'tip' | 'warning' | 'comparison';

export interface ExplanationBlock {
  type: ExplanationBlockType;
  title?: string;
  titleDe?: string;
  content: string;
  contentDe: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  examples?: GrammarExample[];
}

export interface GrammarExample {
  german: string;
  english: string;
  breakdown?: string;
  audio?: string;
}

export interface KeyPoint {
  point: string;
  pointDe: string;
}

export interface CommonMistake {
  mistake: string;
  correction: string;
  explanation: string;
  explanationDe?: string;
}

export interface PracticeExample {
  german: string;
  english: string;
}

// ============================================================================
// EXERCISE TYPES
// ============================================================================

export interface ExerciseSet {
  id: string;
  _id: string;
  lesson: string | GrammarLesson;
  title: string;
  titleDe: string;
  slug: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  passingScore: number;
  timeLimit?: number; // in minutes
  totalXP: number;
  order: number;
  exercises: Exercise[];
  isPublished: boolean;
  userProgress?: {
    isPassed: boolean;
    bestScore: number;
    attempts: number;
    lastAttemptAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type ExerciseType = 
  | 'fill-blank'
  | 'multiple-choice'
  | 'matching'
  | 'word-order'
  | 'conjugation'
  | 'case-selection'
  | 'article-selection'
  | 'translation'
  | 'error-correction';

export interface BaseExercise {
  id?: string;
  _id: string;
  type: ExerciseType;
  instruction: string;
  instructionDe: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  points: number;
  explanation: string;
  explanationDe: string;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fill-blank';
  sentence: string;
  sentenceTranslation: string;
  correctAnswer: string;
  acceptableAnswers: string[];
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  question: string;
  questionTranslation: string;
  options: { text: string; isCorrect: boolean }[];
}

export interface MatchingExercise extends BaseExercise {
  type: 'matching';
  pairs: { left: string; right: string }[];
}

export interface WordOrderExercise extends BaseExercise {
  type: 'word-order';
  words: string[];
  correctOrder: string[];
  translation: string;
}

export interface ConjugationExercise extends BaseExercise {
  type: 'conjugation';
  verb: string;
  tense: string;
  pronoun: string;
  correctAnswer: string;
  verbTranslation: string;
}

export interface CaseSelectionExercise extends BaseExercise {
  type: 'case-selection';
  sentence: string;
  sentenceTranslation: string;
  targetWord: string;
  correctCase: string;
}

export interface ArticleSelectionExercise extends BaseExercise {
  type: 'article-selection';
  sentence: string;
  sentenceTranslation: string;
  options: string[];
  correctAnswer: string;
  noun: string;
  nounGender: string;
  caseUsed: string;
}

export interface TranslationExercise extends BaseExercise {
  type: 'translation';
  sourceLanguage: 'en' | 'de';
  sourceText: string;
  correctTranslations: string[];
  keyWords: string[];
}

export interface ErrorCorrectionExercise extends BaseExercise {
  type: 'error-correction';
  incorrectSentence: string;
  correctSentence: string;
  errorType: string;
  translation: string;
}

export type Exercise = 
  | FillBlankExercise
  | MultipleChoiceExercise
  | MatchingExercise
  | WordOrderExercise
  | ConjugationExercise
  | CaseSelectionExercise
  | ArticleSelectionExercise
  | TranslationExercise
  | ErrorCorrectionExercise;

// ============================================================================
// PROGRESS TYPES
// ============================================================================

export interface GrammarProgress {
  overview: {
    totalLessonsCompleted: number;
    totalExercisesPassed: number;
    totalTimeSpent: number;
    averageExerciseScore: number;
  };
  topicMasteries: TopicMastery[];
  recentActivity: ActivityItem[];
}

export interface TopicMastery {
  topic: GrammarTopic;
  lessonsCompleted: number;
  totalLessons: number;
  exercisesPassed: number;
  totalExercises: number;
  averageScore: number;
  masteryLevel: MasteryLevel;
}

export interface ActivityItem {
  type: 'lesson_completed' | 'exercise_passed' | 'exercise_failed';
  item: {
    title: string;
    titleDe: string;
  };
  score?: number;
  timestamp: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ExerciseSubmissionResult {
  score: number;
  correctCount: number;
  totalCount: number;
  isPassed: boolean;
  timeSpent: number;
  xpEarned: number;
  newMasteryLevel: MasteryLevel;
  masteryProgress: number;
  gradedAnswers: GradedAnswer[];
  masteryUpdate?: {
    previous: MasteryLevel;
    current: MasteryLevel;
  };
}

export interface GradedAnswer {
  exerciseId: string;
  exerciseIndex: number;
  isCorrect: boolean;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation: string;
  explanationDe: string;
  pointsEarned: number;
  maxPoints: number;
}

export interface ExerciseAnswer {
  exerciseIndex: number;
  userAnswer: string | string[];
}
