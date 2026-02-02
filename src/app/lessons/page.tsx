"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { ILesson } from "@/types";
import { getLevelValue } from "@/lib/level-utils";
import { stripHtmlTags } from "@/lib/text-utils";

import { breadcrumbStructuredData } from "@/config/seo-config";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, BookOpen, Lock, ArrowRight, Star, CheckCircle, Crown, 
  ArrowLeft,LayoutGrid, List, Play, 
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

// Constants
const DIFFICULTY_LEVELS = [
  { value: "all", label: "All Levels", shortLabel: "All", color: "from-slate-500 to-slate-600" },
  { value: "A1", label: "Beginner", shortLabel: "A1", color: "from-emerald-500 to-teal-600" },
  { value: "A2", label: "Elementary", shortLabel: "A2", color: "from-blue-500 to-cyan-600" },
  { value: "B1", label: "Intermediate", shortLabel: "B1", color: "from-amber-500 to-orange-600" },
  { value: "B2", label: "Upper Int.", shortLabel: "B2", color: "from-orange-500 to-red-600" },
  { value: "C1", label: "Advanced", shortLabel: "C1", color: "from-rose-500 to-pink-600" },
];

export default function AllLessonsPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [userLevel, setUserLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Free levels available to all users
  const PREMIUM_LEVELS = ["B1", "B2", "C1", "C2"];
  
  // Check if user has premium access
  const hasPremiumAccess = subscription?.isPremium || false;

  // Fetch all lessons and user progress
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log("[Lessons] No user found, skipping fetch");
        return;
      }
      
      try {
        console.log("[Lessons] Fetching lessons and progress data...");
        
        const [lessonsRes, statsRes, progressRes] = await Promise.all([
          api.get("/lessons"),
          api.get("/analytics/dashboard"),
          api.get("/progress/my-progress"),
        ]);

        const lessonsData = lessonsRes.data.data;
        const statsData = statsRes.data.data;
        const progressData = progressRes.data.data;
        
        // Debug logging
        console.log("[Lessons] Lessons fetched:", lessonsData?.length || 0);
        console.log("[Lessons] Progress data:", progressData);
        console.log("[Lessons] Completed lessons from API:", progressData?.completedLessons);
        
        // Check for recent level promotion (in case user navigated here after promotion)
        const recentPromotionData = sessionStorage.getItem('recentPromotion');
        if (recentPromotionData && !sessionStorage.getItem('promotionShown')) {
          const recentPromotion = JSON.parse(recentPromotionData);
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              const celebration = document.createElement('div');
              celebration.innerHTML = `
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in-95 duration-500">
                    <div class="text-6xl mb-4">🎆</div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome to ${recentPromotion.newLevel}!</h2>
                    <p class="text-gray-600 mb-4">You've unlocked <strong class="text-primary">${recentPromotion.newLevel} level lessons</strong>!</p>
                    <p class="text-sm text-gray-500 mb-6">Explore new stories and continue your German learning journey.</p>
                    <button onclick="this.parentElement.parentElement.remove(); sessionStorage.removeItem('recentPromotion');" class="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                      Explore New Lessons
                    </button>
                  </div>
                </div>
              `;
              document.body.appendChild(celebration);
              sessionStorage.setItem('promotionShown', 'true');
            }
          }, 600);
        }
        
        // Get user's current level
        const currentUserLevel = getLevelValue(statsData.currentLevel) || 1;
        setUserLevel(currentUserLevel);
        
        // Track completed lessons - handle multiple possible data structures
        const completedLessons = progressData?.completedLessons || [];
        console.log("[Lessons] Processing completed lessons array:", completedLessons);
        
        // Extract lesson IDs from completed lessons array
        const completedIds: string[] = [];
        completedLessons.forEach((item: any, index: number) => {
          let lessonId: string | null = null;
          
          // Handle different possible structures
          if (typeof item === 'string') {
            // Direct string ID
            lessonId = item;
          } else if (item?.lesson?._id) {
            // Populated lesson object: { lesson: { _id: "..." } }
            lessonId = item.lesson._id;
          } else if (item?.lesson && typeof item.lesson === 'string') {
            // Non-populated reference: { lesson: "objectId" }
            lessonId = item.lesson;
          } else if (item?.lessonId) {
            // Legacy format: { lessonId: "..." }
            lessonId = item.lessonId;
          } else if (item?._id) {
            // Just the lesson object: { _id: "..." }
            lessonId = item._id;
          }
          
          if (lessonId) {
            completedIds.push(lessonId);
            console.log(`[Lessons] Found completed lesson [${index}]:`, lessonId);
          } else {
            console.warn(`[Lessons] Could not extract lesson ID from item [${index}]:`, item);
          }
        });
        
        const completed = new Set<string>(completedIds);
        console.log("[Lessons] Total completed lesson IDs:", completed.size, Array.from(completed));
        
        // Add completion status to lessons
        const enrichedLessons = lessonsData.map((lesson: any) => {
          const isCompleted = completed.has(lesson._id);
          if (isCompleted) {
            console.log(`[Lessons] Lesson "${lesson.title}" (${lesson._id}) is COMPLETED`);
          }
          return {
            ...lesson,
            isCompleted
          };
        });
        
        const completedCount = enrichedLessons.filter((l: any) => l.isCompleted).length;
        console.log(`[Lessons] Final: ${completedCount}/${enrichedLessons.length} lessons marked as completed`);

        setLessons(enrichedLessons);
        setFilteredLessons(enrichedLessons);
      } catch (error: any) {
        console.error("[Lessons] Error fetching data:", error);
        console.error("[Lessons] Error details:", {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status
        });
        toast.error("Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter lessons based on search and level
  useEffect(() => {
    let filtered = lessons;

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter(lesson => lesson.difficulty === selectedLevel);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stripHtmlTags(lesson.content).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLessons(filtered);
  }, [lessons, selectedLevel, searchQuery]);

  if (loading) return <LibrarySkeleton />;

  const breadcrumbData = breadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'German Lessons', url: '/lessons' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-16 md:pt-8">
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-teal-600 p-6 sm:p-8 lg:p-10 shadow-2xl mb-8"
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
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/80 font-medium text-sm">Story Library</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3"
              >
                Explore German Stories
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-lg max-w-xl"
              >
                Immerse yourself in captivating stories designed for your level. 
                Learn vocabulary naturally through context.
              </motion.p>
            </div>

            {/* Stats Pills */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                <BookOpen className="h-5 w-5 text-white" />
                <div>
                  <p className="text-white font-bold text-lg">{lessons.length}</p>
                  <p className="text-white/70 text-xs">Stories</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                <TrendingUp className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-white font-bold text-lg">{lessons.filter(l => l.isCompleted).length}</p>
                  <p className="text-white/70 text-xs">Completed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-4 sm:p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stories by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background/50 border-border/50 rounded-xl text-base focus-visible:ring-primary/50"
                />
                {searchQuery && (
                  <span className="absolute right-4 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                    {filteredLessons.length} results
                  </span>
                )}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <div className="flex bg-muted/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Level Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {DIFFICULTY_LEVELS.map((level, index) => (
              <motion.button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedLevel === level.value
                    ? `bg-gradient-to-r ${level.color} text-white shadow-lg`
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="hidden sm:inline">{level.label}</span>
                <span className="sm:hidden">{level.shortLabel}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Lessons Display */}
        {filteredLessons.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-xl p-12 max-w-md mx-auto">
              <div className="relative inline-block mb-6">
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
                <BookOpen className="relative h-16 w-16 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">No stories found</h3>
              <p className="text-muted-foreground text-lg">
                {searchQuery ? `No results for "${searchQuery}"` : "No stories match the selected level."}
              </p>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredLessons.map((lesson, index) => {
                const isPremiumLevel = PREMIUM_LEVELS.includes(lesson.difficulty);
                const isLocked = isPremiumLevel && !hasPremiumAccess;
                const isRecommended = getLevelValue(lesson.difficulty) === userLevel;

                return (
                  <motion.div
                    key={lesson._id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="group"
                  >
                    <div className={`relative h-full overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-300 ${
                      isLocked 
                        ? "bg-muted/50 opacity-70" 
                        : "bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.02]"
                    }`}>
                      {/* Gradient overlay on hover */}
                      {!isLocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}

                      {/* Cover Image */}
                      <div className="relative w-full h-44 overflow-hidden">
                        {lesson.coverImage ? (
                          <Image 
                            src={lesson.coverImage} 
                            alt={lesson.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isLocked ? 'grayscale' : ''}`}
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            isLocked ? 'bg-muted' : 'bg-gradient-to-br from-primary/20 to-purple-500/20'
                          }`}>
                            <BookOpen className={`h-12 w-12 ${isLocked ? 'text-muted-foreground' : 'text-primary/50'}`} />
                          </div>
                        )}
                        
                        {/* Gradient overlay on image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                        
                        {/* Lock overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="p-3 bg-white/10 rounded-full"
                            >
                              <Lock className="h-6 w-6 text-white" />
                            </motion.div>
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm bg-gradient-to-r ${
                            DIFFICULTY_LEVELS.find(l => l.value === lesson.difficulty)?.color || 'from-slate-500 to-slate-600'
                          } text-white`}>
                            {lesson.difficulty}
                          </span>
                          {lesson.isCompleted && (
                            <span className="bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm font-medium flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Done
                            </span>
                          )}
                        </div>

                        {/* Recommended/Lock indicator */}
                        <div className="absolute top-3 right-3">
                          {isLocked ? null : isRecommended ? (
                            <motion.div 
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="p-2 bg-yellow-500/90 backdrop-blur-sm rounded-lg"
                            >
                              <Star className="h-4 w-4 text-white fill-white" />
                            </motion.div>
                          ) : null}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 p-4">
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {lesson.content
                            ? stripHtmlTags(lesson.content).substring(0, 80) + "..."
                            : "Discover German culture through engaging stories."}
                        </p>

                        {isLocked ? (
                          <Link href="/pricing">
                            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0 shadow-lg">
                              <Crown className="h-4 w-4 mr-2" />
                              Unlock Premium
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/read/${lesson._id}`}>
                            <Button className={`w-full shadow-lg ${
                              lesson.isCompleted 
                                ? "bg-emerald-600 hover:bg-emerald-700" 
                                : "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
                            } text-white`}>
                              {lesson.isCompleted ? <CheckCircle className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                              {lesson.isCompleted ? "Review Lesson" : "Start Reading"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* List View */
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredLessons.map((lesson, index) => {
                const isPremiumLevel = PREMIUM_LEVELS.includes(lesson.difficulty);
                const isLocked = isPremiumLevel && !hasPremiumAccess;
                const isRecommended = getLevelValue(lesson.difficulty) === userLevel;

                return (
                  <motion.div
                    key={lesson._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="group"
                  >
                    <div className={`relative overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-300 ${
                      isLocked 
                        ? "bg-muted/50 opacity-70" 
                        : "bg-card/80 backdrop-blur-sm hover:shadow-2xl"
                    }`}>
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="relative w-full sm:w-48 md:w-56 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
                          {lesson.coverImage ? (
                            <Image 
                              src={lesson.coverImage} 
                              alt={lesson.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 200px"
                              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isLocked ? 'grayscale' : ''}`}
                            />
                          ) : (
                            <div className={`w-full h-full min-h-[10rem] flex items-center justify-center ${
                              isLocked ? 'bg-muted' : 'bg-gradient-to-br from-primary/20 to-purple-500/20'
                            }`}>
                              <BookOpen className={`h-10 w-10 ${isLocked ? 'text-muted-foreground' : 'text-primary/50'}`} />
                            </div>
                          )}
                          
                          {isLocked && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                              <Lock className="h-6 w-6 text-white" />
                            </div>
                          )}
                          
                          {lesson.isCompleted && (
                            <div className="absolute top-2 left-2 bg-emerald-500 text-white p-1.5 rounded-full">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r ${
                                DIFFICULTY_LEVELS.find(l => l.value === lesson.difficulty)?.color || 'from-slate-500 to-slate-600'
                              } text-white`}>
                                {lesson.difficulty}
                              </span>
                              {isRecommended && !isLocked && (
                                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-lg text-xs font-medium">
                                  <Star className="h-3 w-3 fill-current" /> Recommended
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                              {lesson.content
                                ? stripHtmlTags(lesson.content).substring(0, 120) + "..."
                                : "Discover German culture through engaging stories."}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center gap-3">
                            {isLocked ? (
                              <Link href="/pricing" className="flex-1 sm:flex-none">
                                <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white">
                                  <Crown className="h-4 w-4 mr-2" />
                                  Unlock Premium
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/read/${lesson._id}`} className="flex-1 sm:flex-none">
                                <Button className={`w-full sm:w-auto ${
                                  lesson.isCompleted 
                                    ? "bg-emerald-600 hover:bg-emerald-700" 
                                    : "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
                                } text-white`}>
                                  {lesson.isCompleted ? <CheckCircle className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                  {lesson.isCompleted ? "Review Lesson" : "Start Reading"}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer with Internal Links */}
        <div className="mt-16 pt-8 border-t border-border/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>•</span>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Upgrade to Premium
              </Link>
            </div>
            <p>© 2024 KlarText. Learn German through reading.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function LibrarySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-16 md:pt-8">
        {/* Back button skeleton */}
        <Skeleton className="h-10 w-40 mb-6 rounded-lg" />
        
        {/* Hero skeleton */}
        <div className="rounded-3xl bg-gradient-to-r from-primary/20 to-teal-600/20 p-6 sm:p-8 lg:p-10 mb-8">
          <Skeleton className="h-8 w-32 mb-3" />
          <Skeleton className="h-12 w-80 mb-3" />
          <Skeleton className="h-6 w-96" />
        </div>
        
        {/* Search bar skeleton */}
        <div className="bg-card/80 rounded-2xl border border-border/50 p-4 sm:p-6 mb-8">
          <Skeleton className="h-12 w-full mb-4 rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-10 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden bg-card/80">
              <Skeleton className="h-44 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}