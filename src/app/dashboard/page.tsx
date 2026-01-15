"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { IStats, ILesson } from "@/types";
import LevelSelectionModal from "@/components/dashboard/LevelSelectionModal";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, Flame, Trophy, Lock, ArrowRight, Star, 
  Sparkles, Target, Zap, ChevronRight, 
  BookMarked, GraduationCap, Crown, Play, Medal, TrendingUp
} from "lucide-react";
import { toast } from "sonner";

// Streak and Leaderboard Types
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalActiveDays: number;
  isActiveToday: boolean;
}

interface LeaderboardUser {
  rank: number;
  user: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}



// Utility function to strip HTML tags and get plain text
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  // Create a temporary div to parse HTML and extract text
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

// Free vs Premium levels
const PREMIUM_LEVELS = ["B1", "B2", "C1", "C2"];

// Helper function to get next level
const getNextLevel = (currentLevel: string): string => {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : "C2";
};

// Utility functions
const getOnboardingKey = (userId?: string, email?: string) =>
  `onboarding_completed_${userId || email}`;

// Calculate progress based on lessons completed at current level
const calculateLevelProgress = (
  currentLevel: string,
  lessons: ILesson[]
): number => {
  // Filter lessons at current level
  const currentLevelLessons = lessons.filter(
    (lesson) => lesson.difficulty === currentLevel
  );

  // If no lessons at this level, show 100% (level complete)
  if (currentLevelLessons.length === 0) {
    return 100;
  }

  // Count completed lessons at current level
  const completedAtCurrentLevel = currentLevelLessons.filter(
    (lesson) => lesson.isCompleted
  ).length;

  // Calculate percentage
  return Math.round((completedAtCurrentLevel / currentLevelLessons.length) * 100);
};

function DashboardContent() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const searchParams = useSearchParams();

  const [stats, setStats] = useState<IStats | null>(null);
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [displayedLessons, setDisplayedLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Function to get 3 random stories
  const getRandomStories = useCallback((allLessons: ILesson[]) => {
    if (allLessons.length <= 3) return allLessons;
    const shuffled = [...allLessons].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  // Shuffle stories handler
  const handleShuffleStories = useCallback(() => {
    setDisplayedLessons(getRandomStories(lessons));
  }, [lessons, getRandomStories]);

  // Fetch streak data
  const fetchStreakData = useCallback(async () => {
    try {
      const response = await api.get("/streak/my-streak");
      if (response.data.success) {
        setStreakData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch streak data:", error);
    }
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await api.get("/streak/leaderboard?limit=10");
      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      const userOnboardingKey = getOnboardingKey(user._id, user.email);
      const hasCompletedOnboarding = localStorage.getItem(userOnboardingKey);
      const hasUrlFlag = searchParams.get("onboarding") === "true";

        const [statsRes, lessonsRes, progressRes] = await Promise.all([
          api.get("/analytics/dashboard"),
          api.get("/lessons"),
          api.get("/progress/my-progress"),
        ]);

        const statsData = statsRes.data.data;
        const lessonsData = lessonsRes.data.data;
        const progressData = progressRes.data.data;
        
        // Check for recent level promotion from sessionStorage
        const recentPromotionData = sessionStorage.getItem('recentPromotion');
        if (recentPromotionData && !sessionStorage.getItem('promotionShown')) {
          const recentPromotion = JSON.parse(recentPromotionData);
          // Show level promotion celebration
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              const celebration = document.createElement('div');
              celebration.innerHTML = `
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in-95 duration-500">
                    <div class="text-6xl mb-4">🎉</div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Level Up Achieved!</h2>
                    <p class="text-gray-600 mb-2">Promoted from <strong class="text-red-600">${recentPromotion.oldLevel}</strong> to <strong class="text-primary">${recentPromotion.newLevel}</strong>!</p>
                    <p class="text-sm text-gray-500 mb-4">You earned <strong>+${recentPromotion.promotionBonus} bonus coins</strong> for reaching the next level!</p>
                    <p class="text-xs text-gray-400 mb-6">New lessons at ${recentPromotion.newLevel} level are now unlocked.</p>
                    <button onclick="this.parentElement.parentElement.remove(); sessionStorage.removeItem('recentPromotion');" class="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                      Continue Learning
                    </button>
                  </div>
                </div>
              `;
              document.body.appendChild(celebration);
              sessionStorage.setItem('promotionShown', 'true');
            }
          }, 800);
        }
        
        // Mark completed lessons - backend returns completedLessons with lesson objects
        const completedLessonIds = new Set(
          progressData.completedLessons?.map((item: any) => 
            item.lesson?._id || item.lessonId || item
          ) || []
        );
        
        const enrichedLessons = lessonsData.map((lesson: any) => ({
          ...lesson,
          isCompleted: completedLessonIds.has(lesson._id)
        }));

        setStats(statsData);
        setLessons(enrichedLessons);
        // Set initial random 3 stories
        const shuffled = [...enrichedLessons].sort(() => Math.random() - 0.5);
        setDisplayedLessons(shuffled.slice(0, 3));
        // Show modal for new users without a selected level
      const isNewUser = !statsData.currentLevel;
      if (!hasCompletedOnboarding && (hasUrlFlag || isNewUser)) {
        setShowOnboarding(true);
      }

      // Clean URL parameter
      if (hasUrlFlag) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user, searchParams]);

  useEffect(() => {
    fetchDashboardData();
    fetchStreakData();
    fetchLeaderboard();
  }, [fetchDashboardData, fetchStreakData, fetchLeaderboard]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    const userOnboardingKey = getOnboardingKey(user?._id, user?.email);
    localStorage.setItem(userOnboardingKey, "true");
    window.location.reload();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  const progress = calculateLevelProgress(stats?.currentLevel || 'A1', lessons);
  
  // Calculate lessons at current level
  const currentLevel = stats?.currentLevel || 'A1';
  const currentLevelLessons = lessons.filter(lesson => lesson.difficulty === currentLevel);
  const completedCurrentLevelLessons = currentLevelLessons.filter(lesson => lesson.isCompleted).length;
  const totalCurrentLevelLessons = currentLevelLessons.length;

  return (
    <>
      <Head>
        <title>Dashboard - KlarText German Learning Platform</title>
        <meta
          name="description"
          content={`Track your German learning progress at Level ${
            stats?.currentLevel || "A1"
          }. Access personalized stories and improve your vocabulary with KlarText.`}
        />
        <meta
          name="keywords"
          content="German learning, language dashboard, progress tracking, German stories, vocabulary building"
        />
        <meta
          property="og:title"
          content="German Learning Dashboard - KlarText"
        />
        <meta
          property="og:description"
          content="Your personalized German learning journey with progress tracking and interactive stories."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/dashboard" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground">
        {/* Level Selection Modal */}
        {showOnboarding && (
          <LevelSelectionModal
            currentLevel={stats?.currentLevel}
            onComplete={handleOnboardingComplete}
          />
        )}

        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 right-1/3 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-16 md:pt-8 space-y-6 sm:space-y-8">
          
          {/* Hero Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-teal-600 p-6 sm:p-8 shadow-2xl"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white/80 font-medium text-sm">Welcome back!</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2"
                >
                  Guten Tag, {user?.name || "Student"}! 👋
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-lg flex items-center gap-2 flex-wrap"
                >
                  <span>You're learning at</span>
                  <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">
                    Level {stats?.currentLevel || "A1"}
                  </span>
                  <span className="hidden sm:inline">• Keep up the great work!</span>
                </motion.p>
              </div>

              {/* Quick Stats Pills */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                {/* Streak Pill with Fire Animation */}
                <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-3 rounded-2xl ${
                  streakData?.isActiveToday 
                    ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 ring-2 ring-orange-400/50' 
                    : 'bg-white/20'
                }`}>
                  <motion.div
                    animate={streakData?.isActiveToday ? { 
                      scale: [1, 1.2, 1],
                      rotate: [-5, 5, -5]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <Flame className={`h-5 w-5 ${streakData?.isActiveToday ? 'text-orange-400' : 'text-orange-300'}`} />
                  </motion.div>
                  <div>
                    <p className="text-white font-bold text-lg">{streakData?.currentStreak || 0}</p>
                    <p className="text-white/70 text-xs">Day Streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                  <Trophy className="h-5 w-5 text-yellow-300" />
                  <div>
                    <p className="text-white font-bold text-lg">{stats?.coins || 0}</p>
                    <p className="text-white/70 text-xs">Coins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                  <BookOpen className="h-5 w-5 text-teal-300" />
                  <div>
                    <p className="text-white font-bold text-lg">{stats?.totalWords || 0}</p>
                    <p className="text-white/70 text-xs">Words</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats & Progress Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Level Progress Card - Takes 2 columns on large screens */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="relative overflow-hidden border-0 shadow-xl bg-card/80 backdrop-blur-xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent" />
                <CardContent className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Level Progress
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete lessons to advance to the next level
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-primary to-teal-600 rounded-xl text-white font-bold text-lg shadow-lg">
                      {stats?.currentLevel || "A1"}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {completedCurrentLevelLessons} of {totalCurrentLevelLessons} lessons completed
                      </span>
                      <span className="font-bold text-primary">{progress.toFixed(0)}%</span>
                    </div>
                    
                    <div className="relative">
                      <Progress 
                        value={progress} 
                        className="h-4 bg-muted rounded-full overflow-hidden"
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 rounded-full"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">Current: {stats?.currentLevel || "A1"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Next: {getNextLevel(stats?.currentLevel || "A1")}</span>
                        <div className="w-3 h-3 rounded-full bg-muted border-2 border-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-xl bg-card/80 backdrop-blur-xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-primary/5" />
                <CardContent className="relative z-10 p-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <Link href="/lessons" className="block">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all group cursor-pointer">
                        <div className="p-2 bg-primary rounded-lg text-white">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">Browse Library</p>
                          <p className="text-xs text-muted-foreground">Explore all stories</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>

                    <Link href="/myVocabulary" className="block">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-500/10 to-teal-500/5 hover:from-teal-500/20 hover:to-teal-500/10 transition-all group cursor-pointer">
                        <div className="p-2 bg-teal-600 rounded-lg text-white">
                          <BookMarked className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">My Vocabulary</p>
                          <p className="text-xs text-muted-foreground">{stats?.totalWords || 0} words saved</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>

                    <Link href="/grammar" className="block">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 transition-all group cursor-pointer">
                        <div className="p-2 bg-purple-600 rounded-lg text-white">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">Grammar Practice</p>
                          <p className="text-xs text-muted-foreground">Improve your skills</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Streak & Leaderboard Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Streak Stats Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-xl bg-card/80 backdrop-blur-xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent" />
                <CardContent className="relative z-10 p-6">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Flame className="h-5 w-5 text-orange-500" />
                    </motion.div>
                    Your Streak
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Current Streak - Large Display */}
                    <div className="text-center py-4">
                      <motion.div 
                        className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                        animate={streakData?.isActiveToday ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {streakData?.currentStreak || 0}
                      </motion.div>
                      <p className="text-muted-foreground text-sm mt-1">
                        {streakData?.isActiveToday ? (
                          <span className="text-green-500 flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active Today!
                          </span>
                        ) : (
                          "Days in a Row"
                        )}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <Trophy className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{streakData?.longestStreak || 0}</p>
                        <p className="text-xs text-muted-foreground">Best Streak</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <TrendingUp className="h-4 w-4 text-teal-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{streakData?.totalActiveDays || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Days</p>
                      </div>
                    </div>

                    {/* Motivation Message */}
                    {!streakData?.isActiveToday && (
                      <div className="bg-orange-500/10 rounded-xl p-3 text-center">
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Complete a lesson today to keep your streak! 🔥
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="relative overflow-hidden border-0 shadow-xl bg-card/80 backdrop-blur-xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5" />
                <CardContent className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Medal className="h-5 w-5 text-yellow-500" />
                      Streak Leaderboard
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      Top 10
                    </span>
                  </div>
                  
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No streak data yet</p>
                      <p className="text-muted-foreground/70 text-xs">Complete lessons to appear here!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                      <AnimatePresence>
                        {leaderboard.map((entry, index) => {
                          const isCurrentUser = entry.user._id === user?._id;
                          const rankColors: Record<number, string> = {
                            1: 'from-yellow-500 to-amber-500',
                            2: 'from-gray-400 to-gray-500',
                            3: 'from-orange-600 to-orange-700'
                          };
                          const rankBg = rankColors[entry.rank] || 'from-primary/20 to-primary/10';
                          
                          return (
                            <motion.div
                              key={entry.user._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                isCurrentUser 
                                  ? 'bg-primary/10 ring-2 ring-primary/30' 
                                  : 'bg-muted/30 hover:bg-muted/50'
                              }`}
                            >
                              {/* Rank */}
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                entry.rank <= 3 
                                  ? `bg-gradient-to-br ${rankBg} text-white` 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {entry.rank <= 3 ? (
                                  entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                                ) : (
                                  entry.rank
                                )}
                              </div>

                              {/* Avatar */}
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={entry.user.profileImage} alt={entry.user.name} />
                                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                  {entry.user.name?.charAt(0)?.toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>

                              {/* Name */}
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm truncate ${
                                  isCurrentUser ? 'text-primary' : 'text-foreground'
                                }`}>
                                  {isCurrentUser ? 'You' : entry.user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.totalActiveDays} total days
                                </p>
                              </div>

                              {/* Streak Count */}
                              <div className="flex items-center gap-1 bg-orange-500/10 px-3 py-1.5 rounded-lg">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="font-bold text-orange-600 dark:text-orange-400">
                                  {entry.currentStreak}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Lessons Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            aria-label="Available German Stories"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-teal-600 rounded-xl shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Recommended Stories
                  </h2>
                  <p className="text-sm text-muted-foreground">Stories matched to your level</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LiquidButton 
                  variant="outline" 
                  className="hidden sm:flex gap-2"
                  onClick={handleShuffleStories}
                >
                  <Sparkles className="h-4 w-4" /> Shuffle
                </LiquidButton>
                <Link href="/lessons">
                  <LiquidButton variant="outline" className="hidden sm:flex gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </LiquidButton>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedLessons.length === 0 ? (
                <div className="col-span-full">
                  <Card className="border-dashed border-2 border-border bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">No lessons available yet</p>
                      <p className="text-muted-foreground text-sm">Check back soon for new stories!</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                displayedLessons.map((lesson, index) => {
                  const isPremiumLevel = PREMIUM_LEVELS.includes(lesson.difficulty);
                  const hasPremiumAccess = subscription?.isPremium || false;
                  const isLocked = isPremiumLevel && !hasPremiumAccess;
                  const isRecommended = lesson.difficulty === stats?.currentLevel;

                  return (
                    <motion.div
                      key={lesson._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <Card
                        className={`relative flex flex-col h-full overflow-hidden border-0 shadow-lg transition-all duration-300 group ${
                          isLocked 
                            ? "bg-muted/50 opacity-70" 
                            : "bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.02]"
                        }`}
                      >
                        {/* Gradient overlay on hover */}
                        {!isLocked && (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}

                        {/* Cover Image */}
                        {lesson.coverImage ? (
                          <div className="relative w-full h-44 overflow-hidden">
                            <Image 
                              src={lesson.coverImage} 
                              alt={lesson.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                            
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm ${
                                isRecommended
                                  ? "bg-green-500/90 text-white"
                                  : isLocked
                                  ? "bg-gray-500/90 text-white"
                                  : "bg-primary/90 text-white"
                              }`}>
                                {lesson.difficulty}
                              </span>
                              {lesson.isCompleted && (
                                <span className="bg-green-500/90 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium">
                                  ✓ Done
                                </span>
                              )}
                            </div>

                            {/* Lock/Recommended indicator */}
                            <div className="absolute top-3 right-3">
                              {isLocked ? (
                                <div className="p-2 bg-black/50 backdrop-blur-sm rounded-lg">
                                  <Lock className="h-4 w-4 text-white" />
                                </div>
                              ) : isRecommended ? (
                                <div className="p-2 bg-yellow-500/90 backdrop-blur-sm rounded-lg">
                                  <Star className="h-4 w-4 text-white fill-white" />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-primary/50" />
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                                isRecommended
                                  ? "bg-green-500 text-white"
                                  : isLocked
                                  ? "bg-gray-500 text-white"
                                  : "bg-primary text-white"
                              }`}>
                                {lesson.difficulty}
                              </span>
                            </div>
                          </div>
                        )}

                        <CardContent className="relative z-10 flex-1 flex flex-col p-4">
                          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 leading-tight">
                            {lesson.title}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {lesson.content
                              ? `${stripHtmlTags(lesson.content).substring(0, 100)}...`
                              : "No preview available."}
                          </p>

                          {isLocked ? (
                            <Link href="/pricing" className="mt-auto">
                              <LiquidButton
                                variant="outline"
                                className="w-full border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Unlock Premium
                              </LiquidButton>
                            </Link>
                          ) : (
                            <Link href={`/read/${lesson._id}`} className="mt-auto">
                              <LiquidButton 
                                className={`w-full shadow-lg ${
                                  lesson.isCompleted 
                                    ? "bg-green-600 hover:bg-green-700" 
                                    : "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
                                } text-white`}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {lesson.isCompleted ? "Review" : "Start Reading"}
                              </LiquidButton>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-6 sm:hidden flex flex-col gap-2">
              <LiquidButton 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleShuffleStories}
              >
                <Sparkles className="h-4 w-4" /> Shuffle Stories
              </LiquidButton>
              <Link href="/lessons">
                <LiquidButton variant="outline" className="w-full gap-2">
                  View All Stories <ArrowRight className="h-4 w-4" />
                </LiquidButton>
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading dashboard">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
