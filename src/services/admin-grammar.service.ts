import api from '@/lib/axios';
import { 
  GrammarTopic, 
  GrammarLesson, 
  ExerciseSet,
  Exercise
} from '@/types/grammar.types';

// ============================================================================
// ADMIN TOPIC TYPES
// ============================================================================

export interface CreateTopicPayload {
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
}

export interface CreateLessonPayload {
  topic: string;
  title: string;
  titleDe: string;
  slug: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  order: number;
  introduction: string;
  introductionDe: string;
  explanationBlocks: ExplanationBlockPayload[];
  keyPoints: { point: string; pointDe: string }[];
  commonMistakes: { mistake: string; correction: string; explanation: string; explanationDe?: string }[];
  practiceExamples: { german: string; english: string }[];
  estimatedTime: number;
  isPublished: boolean;
}

export interface ExplanationBlockPayload {
  type: 'text' | 'table' | 'example' | 'tip' | 'warning' | 'comparison';
  title?: string;
  titleDe?: string;
  content: string;
  contentDe: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  examples?: {
    german: string;
    english: string;
    breakdown?: string;
    audio?: string;
  }[];
}

export interface CreateExerciseSetPayload {
  lesson: string;
  title: string;
  titleDe: string;
  slug: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  passingScore: number;
  timeLimit?: number;
  order: number;
  exercises: Omit<Exercise, 'id'>[];
  isPublished: boolean;
}

// ============================================================================
// ADMIN GRAMMAR SERVICE
// ============================================================================

export const adminGrammarService = {
  // ============================================================================
  // TOPICS
  // ============================================================================

  // Get all topics (including unpublished)
  getTopics: async (params?: { showAll?: boolean; page?: number; limit?: number }): Promise<{
    topics: GrammarTopic[];
    total: number;
    page: number;
    pages: number;
  }> => {
    const response = await api.get('/grammar/topics', { 
      params: { ...params, showAll: true } 
    });
    return response.data.data;
  },

  // Get topic by ID
  getTopicById: async (topicId: string): Promise<GrammarTopic> => {
    const response = await api.get(`/grammar/topics/${topicId}`);
    return response.data.data;
  },

  // Create topic
  createTopic: async (payload: CreateTopicPayload): Promise<GrammarTopic> => {
    const response = await api.post('/grammar/topics', payload);
    return response.data.data;
  },

  // Update topic
  updateTopic: async (topicId: string, payload: Partial<CreateTopicPayload>): Promise<GrammarTopic> => {
    const response = await api.put(`/grammar/topics/${topicId}`, payload);
    return response.data.data;
  },

  // Delete topic
  deleteTopic: async (topicId: string): Promise<void> => {
    await api.delete(`/grammar/topics/${topicId}`);
  },

  // ============================================================================
  // LESSONS
  // ============================================================================

  // Get all lessons for a topic
  getLessonsByTopic: async (topicId: string): Promise<GrammarLesson[]> => {
    const response = await api.get(`/grammar/topics/${topicId}/lessons`, {
      params: { showAll: true }
    });
    return response.data.data;
  },

  // Get lesson by ID
  getLessonById: async (lessonId: string): Promise<GrammarLesson> => {
    const response = await api.get(`/grammar/lessons/${lessonId}`);
    return response.data.data;
  },

  // Create lesson
  createLesson: async (payload: CreateLessonPayload): Promise<GrammarLesson> => {
    const response = await api.post('/grammar/lessons', payload);
    return response.data.data;
  },

  // Update lesson
  updateLesson: async (lessonId: string, payload: Partial<CreateLessonPayload>): Promise<GrammarLesson> => {
    const response = await api.put(`/grammar/lessons/${lessonId}`, payload);
    return response.data.data;
  },

  // Delete lesson
  deleteLesson: async (lessonId: string): Promise<void> => {
    await api.delete(`/grammar/lessons/${lessonId}`);
  },

  // ============================================================================
  // EXERCISES
  // ============================================================================

  // Get exercise sets for a lesson
  getExercisesByLesson: async (lessonId: string): Promise<ExerciseSet[]> => {
    const response = await api.get(`/grammar/lessons/${lessonId}/exercises`, {
      params: { showAll: true }
    });
    return response.data.data;
  },

  // Get exercise set by ID
  getExerciseSetById: async (exerciseSetId: string): Promise<ExerciseSet> => {
    const response = await api.get(`/grammar/exercises/${exerciseSetId}`);
    return response.data.data;
  },

  // Create exercise set
  createExerciseSet: async (payload: CreateExerciseSetPayload): Promise<ExerciseSet> => {
    const response = await api.post('/grammar/exercises', payload);
    return response.data.data;
  },

  // Update exercise set
  updateExerciseSet: async (exerciseSetId: string, payload: Partial<CreateExerciseSetPayload>): Promise<ExerciseSet> => {
    const response = await api.put(`/grammar/exercises/${exerciseSetId}`, payload);
    return response.data.data;
  },

  // Delete exercise set
  deleteExerciseSet: async (exerciseSetId: string): Promise<void> => {
    await api.delete(`/grammar/exercises/${exerciseSetId}`);
  }
};
