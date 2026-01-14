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
import { motion } from "framer-motion";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, Flame, Trophy, Lock, ArrowRight, Star, 
  Sparkles,Target, Zap, ChevronRight, 
  BookMarked, GraduationCap, Crown, Play
} from "lucide-react";
import { toast } from "sonner";



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
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        setLessons(enrichedLessons);      // Show modal for new users without a selected level
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
  }, [fetchDashboardData]);

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
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                  <Flame className="h-5 w-5 text-orange-300" />
                  <div>
                    <p className="text-white font-bold text-lg">{stats?.completedLessons || 0}</p>
                    <p className="text-white/70 text-xs">Lessons</p>
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
              <Link href="/lessons">
                <LiquidButton variant="outline" className="hidden sm:flex gap-2">
                  View All <ArrowRight className="h-4 w-4" />
                </LiquidButton>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lessons.length === 0 ? (
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
                lessons.map((lesson, index) => {
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
            <div className="mt-6 sm:hidden">
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
