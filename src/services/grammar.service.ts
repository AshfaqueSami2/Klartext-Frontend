import api from '@/lib/axios';
import { 
  GrammarTopic, 
  GrammarLesson, 
  ExerciseSet, 
  GrammarProgress,
  ExerciseSubmissionResult
} from '@/types/grammar.types';

// Frontend format
interface ExerciseAnswerPayload {
  exerciseId: string;
  answer: string | string[];
  hintUsed?: boolean;
}

// Backend API format
interface BackendAnswerPayload {
  exerciseIndex: number;
  userAnswer: string | string[];
}

// ============================================================================
// TOPICS API
// ============================================================================

export const grammarService = {
  // Get all topics
  getTopics: async (params?: { difficulty?: string; page?: number; limit?: number }): Promise<{
    topics: GrammarTopic[];
    total: number;
    page: number;
    pages: number;
  }> => {
    const response = await api.get('/grammar/topics', { params });
    const data = response.data.data;
    // Handle both array response and object with topics property
    if (Array.isArray(data)) {
      return { topics: data, total: data.length, page: 1, pages: 1 };
    }
    return data;
  },

  // Get topic by ID or slug
  getTopicById: async (topicId: string): Promise<GrammarTopic> => {
    const response = await api.get(`/grammar/topics/${topicId}`);
    return response.data.data;
  },

  // Get lessons by topic
  getLessonsByTopic: async (topicId: string): Promise<GrammarLesson[]> => {
    const response = await api.get(`/grammar/topics/${topicId}/lessons`);
    const data = response.data.data;
    // Handle both array response and object with lessons property
    if (Array.isArray(data)) {
      return data;
    }
    return data?.lessons || [];
  },

  // ============================================================================
  // LESSONS API
  // ============================================================================

  // Get lesson by ID or slug
  getLessonById: async (lessonId: string): Promise<GrammarLesson> => {
    const response = await api.get(`/grammar/lessons/${lessonId}`);
    return response.data.data;
  },

  // Mark lesson as complete
  completeLesson: async (lessonId: string, timeSpent: number): Promise<void> => {
    await api.post(`/grammar/lessons/${lessonId}/complete`, { timeSpent });
  },

  // ============================================================================
  // EXERCISES API
  // ============================================================================

  // Get exercises for a lesson
  getExercisesByLesson: async (lessonId: string): Promise<ExerciseSet | null> => {
    const response = await api.get(`/grammar/lessons/${lessonId}/exercises`);
    const data = response.data.data;
    // API returns array of exercise sets, return the first one
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    return data;
  },

  // Get exercise set by ID
  getExerciseSetById: async (exerciseSetId: string): Promise<ExerciseSet> => {
    const response = await api.get(`/grammar/exercises/${exerciseSetId}`);
    return response.data.data;
  },

  // Submit exercise answers
  submitExercises: async (
    exerciseSetId: string, 
    answers: ExerciseAnswerPayload[],
    exerciseIds?: string[], // ordered list of exercise IDs to get index
    timeSpent?: number
  ): Promise<ExerciseSubmissionResult> => {
    // Transform to backend format: { exerciseIndex, userAnswer }
    const backendAnswers: BackendAnswerPayload[] = answers.map((a, index) => ({
      exerciseIndex: exerciseIds ? exerciseIds.indexOf(a.exerciseId) : index,
      userAnswer: a.answer
    }));
    
    const response = await api.post(`/grammar/exercises/${exerciseSetId}/submit`, {
      answers: backendAnswers,
      timeSpent: timeSpent || 0
    });
    return response.data.data;
  },

  // ============================================================================
  // PROGRESS API
  // ============================================================================

  // Get user's grammar progress
  getProgress: async (): Promise<GrammarProgress> => {
    const response = await api.get('/grammar/progress');
    return response.data.data;
  },

  // Get recommended lesson
  getRecommendedLesson: async (difficulty?: string): Promise<GrammarLesson | null> => {
    const response = await api.get('/grammar/recommended', { params: { difficulty } });
    return response.data.data;
  }
};

// Export alias for backwards compatibility
export const GrammarService = grammarService;
