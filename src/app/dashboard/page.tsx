"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
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

// Constants
const LEVEL_VALUES: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

const WORDS_PER_LEVEL = 50;

// Utility functions
const getOnboardingKey = (userId?: string, email?: string) =>
  `onboarding_completed_${userId || email}`;

const calculateProgress = (totalWords: number) =>
  Math.min((totalWords / WORDS_PER_LEVEL) * 100, 100);

function DashboardContent() {
  const { user } = useAuth();
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

  const userRank = stats ? LEVEL_VALUES[stats.currentLevel] || 1 : 1;
  const progress = calculateProgress(stats?.totalWords || 0);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
          {/* Left Content - Main Dashboard */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8 p-6">
            {/* Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Willkommen, {user?.name || "Student"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              You are currently at{" "}
              <strong>Level {stats?.currentLevel || "A1"}</strong>
            </p>
          </div>

          {/* Progress Pills */}
          <div
            className="flex gap-3"
            role="status"
            aria-label="Learning progress summary"
          >
            <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-100 text-sm font-medium shadow-sm">
              <Flame
                className="h-4 w-4 fill-orange-500 text-orange-500"
                aria-hidden="true"
              />
              <span>{stats?.completedLessons || 0} Lessons</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-100 text-sm font-medium shadow-sm">
              <Trophy
                className="h-4 w-4 fill-yellow-500 text-yellow-500"
                aria-hidden="true"
              />
              <span>{stats?.coins || 0} Coins</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          aria-label="Learning Statistics"
        >
          <Card className="border-l-4 border-l-primary shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Words Learned
              </CardTitle>
              <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalWords || 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Keep growing your vocabulary!
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Level Progress
              </CardTitle>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                {stats?.currentLevel || "A1"}
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {progress.toFixed(0)}%
              </div>
              <Progress
                value={progress}
                className="h-2 mt-2 bg-gray-100"
                aria-label="Learning progress"
              />
            </CardContent>
          </Card>
        </section>

        {/* Lessons Section */}
        <section aria-label="Available German Stories">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
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
                const lessonRank = LEVEL_VALUES[lesson.difficulty] || 0;
                const isLocked = userRank < lessonRank;
                const isRecommended = lesson.difficulty === stats?.currentLevel;

                return (
                  <Card
                    key={lesson._id}
                    className={`flex flex-col justify-between transition-all duration-300 hover:shadow-md border-border ${
                      isLocked ? "bg-muted opacity-80" : "bg-card"
                    }`}
                  >
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
                      <div className="flex justify-between items-start mb-2">
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
                        {lesson.isCompleted && (
                          <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            ✓ Completed
                          </div>
                        )}
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
                        <LiquidButton
                          disabled
                          variant="outline"
                          className="w-full text-muted-foreground border-border"
                          aria-label={`Unlock by reaching level ${lesson.difficulty}`}
                        >
                          Locked (Reach Level {lesson.difficulty})
                        </LiquidButton>
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
          
          {/* Right Sidebar - Cartoon Character */}
          <div className="lg:col-span-4 xl:col-span-3 hidden lg:block relative">
            <div className="sticky top-8 h-screen flex items-center justify-center">
              <div className="relative w-full max-w-md mx-auto">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-3xl transform rotate-3 opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-green-50 to-yellow-50 dark:from-green-950/20 dark:to-yellow-950/20 rounded-3xl transform -rotate-2 opacity-40"></div>
                
                {/* Main image container */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                  <Image 
                    src="/cartoon/photorealistic-hyper-realistic-image-white-background-ai-generated-by-freepik_643360-534785.avif" 
                    alt="Learning companion character"
                    width={400}
                    height={500}
                    className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                    priority={false}
                  />
                  
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                    Level {stats?.currentLevel || 'A1'}!
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    🎯 Keep Learning!
                  </div>
                  
                  {/* Progress circle */}
                  <div className="absolute top-4 left-4 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {Math.round(progress)}%
                  </div>
                </div>
                
                {/* Motivational text */}
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Du schaffst das! 💪
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your learning companion is here to support your German journey!
                  </p>
                </div>
              </div>
            </div>
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
