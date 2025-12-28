import useSWR from "swr";
import api from "@/lib/axios";
import { IStats, ILesson } from "@/types";

// ============================================
// DASHBOARD HOOKS
// ============================================

/**
 * Fetch dashboard stats with caching
 * Cache time: 30 seconds, background revalidation
 */
export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<IStats>(
    "/analytics/dashboard",
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    stats: data || null,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

/**
 * Fetch all lessons with caching
 * Cache time: 60 seconds (lessons don't change often)
 */
export function useLessons() {
  const { data, error, isLoading, mutate } = useSWR<ILesson[]>("/lessons", {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 60 seconds
  });

  return {
    lessons: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

/**
 * Fetch user's progress with caching
 */
export function useUserProgress() {
  const { data, error, isLoading, mutate } = useSWR<{
    completedLessons: any[];
    currentLevel: string;
  }>("/progress/my-progress", {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const completedLessonIds = new Set<string>(
    data?.completedLessons?.map(
      (item: any) => item.lesson?._id || item.lessonId || item
    ) || []
  );

  return {
    progress: data,
    completedLessonIds,
    currentLevel: data?.currentLevel || "A1",
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

/**
 * Combined dashboard data hook - fetches all data in parallel
 */
export function useDashboardData() {
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useDashboardStats();
  const { lessons, isLoading: lessonsLoading, refresh: refreshLessons } = useLessons();
  const { completedLessonIds, currentLevel, isLoading: progressLoading, refresh: refreshProgress } = useUserProgress();

  // Enrich lessons with completion status
  const enrichedLessons = lessons.map((lesson) => ({
    ...lesson,
    isCompleted: completedLessonIds.has(lesson._id),
  }));

  const refreshAll = () => {
    refreshStats();
    refreshLessons();
    refreshProgress();
  };

  return {
    stats,
    lessons: enrichedLessons,
    completedLessonIds,
    currentLevel,
    isLoading: statsLoading || lessonsLoading || progressLoading,
    refresh: refreshAll,
  };
}

// ============================================
// VOCABULARY HOOKS
// ============================================

interface VocabWord {
  _id: string;
  word: string;
  translation?: string;
  lessonId?: string;
  createdAt: string;
}

/**
 * Fetch user's vocabulary list
 */
export function useVocabulary() {
  const { data, error, isLoading, mutate } = useSWR<VocabWord[]>(
    "/vocab/my-list",
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    vocabulary: data || [],
    words: data?.map((v) => v.word) || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// ============================================
// PROFILE HOOKS
// ============================================

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  coins?: number;
  currentLevel?: string;
  createdAt?: string;
}

/**
 * Fetch user profile
 */
export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    "/user/profile",
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    profile: data || null,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Add word to vocabulary
 */
export function useAddVocabulary() {
  const { refresh } = useVocabulary();
  
  const addWord = async (word: string, lessonId?: string) => {
    try {
      await api.post("/vocab/add", { word, lessonId });
      refresh(); // Refresh the vocabulary list
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { addWord };
}

/**
 * Complete a lesson
 */
export function useCompleteLesson() {
  const { refresh: refreshProgress } = useUserProgress();
  const { refresh: refreshStats } = useDashboardStats();

  const completeLesson = async (lessonId: string) => {
    try {
      const response = await api.post("/progress/complete", { lessonId });
      // Refresh related data
      refreshProgress();
      refreshStats();
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { completeLesson };
}
