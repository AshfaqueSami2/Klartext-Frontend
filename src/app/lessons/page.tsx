"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { motion } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Lock, ArrowRight, Star, CheckCircle, Crown } from "lucide-react";
import { toast } from "sonner";

// Constants
const DIFFICULTY_LEVELS = [
  { value: "all", label: "All", color: "bg-muted text-muted-foreground" },
  { value: "A1", label: "A1", color: "bg-green-100 text-green-800" },
  { value: "A2", label: "A2", color: "bg-blue-100 text-blue-800" },
  { value: "B1", label: "B1", color: "bg-yellow-100 text-yellow-800" },
  { value: "B2", label: "B2", color: "bg-orange-100 text-orange-800" },
  { value: "C1", label: "C1", color: "bg-red-100 text-red-800" },
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

  // Free levels available to all users
  const PREMIUM_LEVELS = ["B1", "B2", "C1", "C2"];
  
  // Check if user has premium access
  const hasPremiumAccess = subscription?.isPremium || false;

  // Fetch all lessons and user progress
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [lessonsRes, statsRes, progressRes] = await Promise.all([
          api.get("/lessons"),
          api.get("/analytics/dashboard"),
          api.get("/progress/my-progress"),
        ]);

        const lessonsData = lessonsRes.data.data;
        const statsData = statsRes.data.data;
        const progressData = progressRes.data.data;
        
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
        
        // Track completed lessons - backend returns completedLessons with lesson objects  
        const completed = new Set<string>(
          progressData.completedLessons?.map((item: any) => 
            item.lesson?._id || item.lessonId || item
          ) || []
        );
        
        // Add completion status to lessons
        const enrichedLessons = lessonsData.map((lesson: any) => ({
          ...lesson,
          isCompleted: completed.has(lesson._id)
        }));

        setLessons(enrichedLessons);
        setFilteredLessons(enrichedLessons);
      } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-30" 
           style={{ 
             backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Animated gradient mesh */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-600/20 via-transparent to-cyan-600/20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Navigation Bar */}
      {user && (
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-50 w-full backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500 shadow-lg"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(168, 85, 247, 0.4)",
                      "0 0 30px rgba(59, 130, 246, 0.6)",
                      "0 0 20px rgba(168, 85, 247, 0.4)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img
                    src="/logo/main logo.png"
                    alt="KlarText Logo"
                    className="w-full h-full object-contain p-1.5 mix-blend-lighten"
                  />
                </motion.div>
                <span className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  KlarText
                </span>
              </motion.div>
              
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 border-white/10">
                      Dashboard
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/lessons">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white shadow-lg shadow-purple-500/30">
                      All Lessons
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>
      )}
      
      {/* Header with Glassmorphism */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <motion.h1 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl font-serif font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3"
            >
              Library
            </motion.h1>
            <motion.p 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-300 text-lg"
            >
              Explore stories at your level and master German through immersive content.
            </motion.p>
          </div>

          {/* Search Bar with Futuristic Design */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative mb-8 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 h-5 w-5 z-10" />
              <Input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-purple-400/50 rounded-2xl text-lg shadow-2xl transition-all"
              />
            </div>
          </motion.div>

          {/* Level Filter Pills with Gradient */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            {DIFFICULTY_LEVELS.map((level, index) => (
              <motion.button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedLevel === level.value
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 border-2 border-white/20"
                    : "bg-white/10 backdrop-blur-xl text-gray-300 hover:bg-white/20 border-2 border-white/10"
                }`}
              >
                {level.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {filteredLessons.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">No stories found</h3>
              <p className="text-gray-400 text-lg">
                {searchQuery ? "Try adjusting your search terms." : "No stories match the selected level."}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {filteredLessons.map((lesson, index) => {
              const lessonLevel = getLevelValue(lesson.difficulty) || 0;
              const isPremiumLevel = PREMIUM_LEVELS.includes(lesson.difficulty);
              
              // Simple lock logic: Premium levels need subscription
              const isLocked = isPremiumLevel && !hasPremiumAccess;
              
              const isRecommended = lessonLevel === userLevel;

              return (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl hover:shadow-purple-500/20">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    <div className="flex relative">
                      {/* Image Section - Left Side */}
                      <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden">
                        {lesson.coverImage ? (
                          <motion.img 
                            src={lesson.coverImage} 
                            alt={lesson.title}
                            className={`w-full h-full object-cover ${isLocked ? "grayscale" : ""}`}
                            whileHover={!isLocked ? { scale: 1.15 } : {}}
                            transition={{ duration: 0.6 }}
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            isLocked ? "bg-white/5" : "bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-cyan-600/30"
                          }`}>
                            <BookOpen className={`h-12 w-12 ${
                              isLocked ? "text-gray-500" : "text-purple-300"
                            }`} />
                          </div>
                        )}
                        
                        {/* Lock Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Lock className="h-8 w-8 text-white" />
                            </motion.div>
                          </div>
                        )}
                        
                        {/* Completion Badge */}
                        {lesson.isCompleted && (
                          <div className="absolute top-3 right-3">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ type: "spring" }}
                              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-2 rounded-full shadow-lg shadow-green-500/50"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </motion.div>
                          </div>
                        )}
                      </div>
                      
                      {/* Content Section - Right Side */}
                      <div className="flex-1 p-6 flex flex-col justify-between relative">
                        <div>
                          {/* Title */}
                          <motion.h3 
                            className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:via-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all"
                            whileHover={{ x: 4 }}
                          >
                            {lesson.title}
                          </motion.h3>
                          
                          {/* Level Badge */}
                          <div className="mb-4 flex items-center gap-3 flex-wrap">
                            <Badge 
                              className={`text-sm font-bold px-4 py-1.5 rounded-full shadow-lg ${
                                lesson.difficulty === 'A1' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0' :
                                lesson.difficulty === 'A2' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white border-0' :
                                lesson.difficulty === 'B1' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white border-0' :
                                lesson.difficulty === 'B2' ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white border-0' :
                                lesson.difficulty === 'C1' ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white border-0' :
                                'bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-white border-0'
                              }`}
                            >
                              {lesson.difficulty}
                            </Badge>
                            
                            {!isLocked && isRecommended && (
                              <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30"
                              >
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-yellow-300">Recommended</span>
                              </motion.div>
                            )}
                          </div>
                          
                          {/* Description */}
                          <p className="text-gray-300 text-base leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                            {lesson.content
                              ? stripHtmlTags(lesson.content).substring(0, 120) + "..."
                              : "Discover German culture through engaging stories."}
                          </p>
                        </div>
                        
                        {/* Action Area */}
                        <div className="mt-6">
                          {isLocked ? (
                            <div className="flex items-center gap-2">
                              <Link href="/pricing" className="flex-1">
                                <motion.div
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="group/btn relative"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur-lg opacity-50 group-hover/btn:opacity-75 transition-opacity" />
                                  <Button
                                    size="lg"
                                    className="relative w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold border-0 shadow-xl"
                                  >
                                    <Crown className="h-4 w-4 mr-2" />
                                    Unlock with Premium
                                  </Button>
                                </motion.div>
                              </Link>
                            </div>
                          ) : (
                            <Link href={`/read/${lesson._id}`}>
                              <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button 
                                  size="lg"
                                  className={`w-full font-bold transition-all shadow-xl ${
                                    lesson.isCompleted 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0'
                                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0'
                                  }`}
                                >
                                  {lesson.isCompleted ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Review Story
                                    </>
                                  ) : (
                                    <>
                                      <BookOpen className="h-4 w-4 mr-2" />
                                      Read Story
                                    </>
                                  )}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
function LibrarySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-30" 
           style={{ 
             backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      <div className="backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <Skeleton className="h-12 w-48 mb-3 bg-white/10" />
            <Skeleton className="h-6 w-96 bg-white/10" />
          </div>
          <Skeleton className="h-16 w-full max-w-2xl mb-8 rounded-2xl bg-white/10" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-12 w-20 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-3xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}