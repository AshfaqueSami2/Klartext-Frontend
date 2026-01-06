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

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Flame, Trophy, Lock, ArrowRight, Star } from "lucide-react";
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

      <main className="min-h-screen bg-background text-foreground">
        {/* Level Selection Modal */}
        {showOnboarding && (
          <LevelSelectionModal
            currentLevel={stats?.currentLevel}
            onComplete={handleOnboardingComplete}
          />
        )}

        {/* Main Dashboard Layout */}
        <div className="relative overflow-hidden">
          {/* Futuristic Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>
          
          {/* Main Content */}
          <div className="relative space-y-8 p-6 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent backdrop-blur-sm border border-primary/20 rounded-2xl p-6 shadow-lg">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Willkommen, {user?.name || "Student"}!
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              You are currently at{" "}
              <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full font-bold text-primary">
                Level {stats?.currentLevel || "A1"}
              </span>
            </p>
          </div>

          {/* Progress Pills */}
          <div
            className="flex gap-3"
            role="status"
            aria-label="Learning progress summary"
          >
            <div className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm text-orange-100 px-5 py-2.5 rounded-full border border-orange-400/30 text-sm font-bold shadow-lg overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-400/20 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <Flame
                className="h-5 w-5 fill-orange-400 text-orange-400 drop-shadow-glow"
                aria-hidden="true"
              />
              <span className="relative z-10">{stats?.completedLessons || 0} Lessons</span>
            </div>
            <div className="relative flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 backdrop-blur-sm text-yellow-100 px-5 py-2.5 rounded-full border border-yellow-400/30 text-sm font-bold shadow-lg overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-400/20 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <Trophy
                className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-glow"
                aria-hidden="true"
              />
              <span className="relative z-10">{stats?.coins || 0} Coins</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          aria-label="Learning Statistics"
        >
          <Card className="relative overflow-hidden border border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Total Words Learned
              </CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {stats?.totalWords || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Keep growing your vocabulary!
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-purple-500/20 shadow-xl bg-gradient-to-br from-purple-500/5 to-transparent backdrop-blur-sm group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Level Progress
              </CardTitle>
              <span className="text-xs font-bold bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1.5 rounded-lg shadow-lg border border-primary/30">
                {stats?.currentLevel || "A1"}
              </span>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {progress.toFixed(0)}%
              </div>
              <div className="relative mt-3">
                <Progress
                  value={progress}
                  className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner"
                  aria-label="Learning progress"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-sm"></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                {totalCurrentLevelLessons === 0 
                  ? `No lessons at ${currentLevel} level yet` 
                  : `${completedCurrentLevelLessons}/${totalCurrentLevelLessons} lessons completed at ${currentLevel}`
                }
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Lessons Section */}
        <section aria-label="Available German Stories">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg">
                <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              Recommended Stories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No lessons available yet.</p>
              </div>
            ) : (
              lessons.map((lesson) => {
                const isPremiumLevel = PREMIUM_LEVELS.includes(lesson.difficulty);
                const hasPremiumAccess = subscription?.isPremium || false;
                
                // Simple lock logic: Premium levels need subscription
                const isLocked = isPremiumLevel && !hasPremiumAccess;
                
                const isRecommended = lesson.difficulty === stats?.currentLevel;

                return (
                  <Card
                    key={lesson._id}
                    className={`relative flex flex-col justify-between transition-all duration-500 border overflow-hidden group ${
                      isLocked 
                        ? "bg-muted/50 opacity-60 border-border/50" 
                        : "bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:shadow-2xl hover:scale-[1.03]"
                    }`}
                  >
                    {!isLocked && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}
                    {/* Cover Image */}
                    {lesson.coverImage && (
                      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                        <Image 
                          src={lesson.coverImage} 
                          alt={lesson.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded border ${
                              isRecommended
                                ? "bg-green-50 text-green-700 border-green-200"
                                : isLocked
                                ? "bg-gray-200 text-gray-600 border-gray-300"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                            aria-label={`Difficulty level ${lesson.difficulty}`}
                          >
                            {lesson.difficulty}
                          </span>
                          
                          {lesson.isCompleted && (
                            <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                              ✓ Completed
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isLocked && (
                            <Lock
                              className="h-4 w-4 text-gray-400"
                              aria-label="Locked content"
                            />
                          )}
                          {!isLocked && isRecommended && (
                            <Star
                              className="h-4 w-4 text-yellow-500 fill-yellow-500"
                              aria-label="Recommended for you"
                            />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-serif text-card-foreground leading-tight">
                        {lesson.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className={lesson.coverImage ? "pt-2" : "pt-4"}>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 font-serif">
                        {lesson.content
                          ? `${stripHtmlTags(lesson.content).substring(0, 150)}...`
                          : "No preview available."}
                      </p>

                      {isLocked ? (
                        <Link href="/pricing">
                          <LiquidButton
                            variant="outline"
                            className="w-full text-muted-foreground border-border hover:border-primary hover:text-primary"
                            aria-label="Unlock with premium subscription"
                          >
                            🔒 Unlock with Premium
                          </LiquidButton>
                        </Link>
                      ) : (
                        <Link
                          href={`/read/${lesson._id}`}
                          aria-label={`${lesson.isCompleted ? 'Preview' : 'Read'} story: ${lesson.title}`}
                        >
                          <LiquidButton className={`w-full shadow-sm ${
                            lesson.isCompleted 
                              ? "bg-green-600 hover:bg-green-700 text-white" 
                              : "bg-primary hover:bg-teal-900 text-white"
                          }`} variant={lesson.isCompleted ? "success" : "primary"}>
                            {lesson.isCompleted ? "Preview Lesson" : "Read Story"}{" "}
                            <ArrowRight
                              className="ml-2 h-4 w-4"
                              aria-hidden="true"
                            />
                          </LiquidButton>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
          </div>
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
