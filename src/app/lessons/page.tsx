"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { ILesson } from "@/types";
import { getLevelValue } from "@/lib/level-utils";
import { stripHtmlTags } from "@/lib/text-utils";
import { BackgroundTexture } from "@/components/ui/background-texture";

// UI Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen, Lock, ArrowRight, Star, CheckCircle } from "lucide-react";
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
  
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<ILesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [userLevel, setUserLevel] = useState(1);

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

  return (
    <div className="min-h-screen bg-background">
      <BackgroundTexture />
      
      {/* Navigation Bar */}
      {user && (
        <nav className="bg-card border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden relative">
                  <Image
                    src="/logo/klartext logo.png"
                    alt="KlarText Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-serif font-bold text-foreground">KlarText</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/lessons">
                  <Button variant="default" className="bg-primary text-primary-foreground">
                    All Lessons
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Library</h1>
            <p className="text-muted-foreground">Explore stories at your level.</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full max-w-md bg-muted border-border focus:bg-background"
            />
          </div>

          {/* Level Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedLevel === level.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No stories found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms." : "No stories match the selected level."}
            </p>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredLessons.map((lesson, index) => {
              const lessonLevel = getLevelValue(lesson.difficulty) || 0;
              const isLocked = userLevel < lessonLevel;
              const isRecommended = lessonLevel === userLevel;

              return (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group"
                >
                  <Card className="overflow-hidden bg-card hover:bg-card/95 transition-all duration-300 border-border hover:shadow-xl">
                    <div className="flex">
                      {/* Image Section - Left Side */}
                      <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden">
                        {lesson.coverImage ? (
                          <motion.img 
                            src={lesson.coverImage} 
                            alt={lesson.title}
                            className={`w-full h-full object-cover ${isLocked ? "grayscale" : ""}`}
                            whileHover={!isLocked ? { scale: 1.1 } : {}}
                            transition={{ duration: 0.3 }}
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            isLocked ? "bg-muted" : "bg-gradient-to-br from-primary/10 to-primary/20"
                          }`}>
                            <BookOpen className={`h-8 w-8 ${
                              isLocked ? "text-muted-foreground" : "text-primary/60"
                            }`} />
                          </div>
                        )}
                        
                        {/* Lock Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <Lock className="h-6 w-6 text-white" />
                          </div>
                        )}
                        
                        {/* Completion Badge */}
                        {lesson.isCompleted && (
                          <div className="absolute top-2 right-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-green-500 text-white p-1.5 rounded-full shadow-lg"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </motion.div>
                          </div>
                        )}
                      </div>
                      
                      {/* Content Section - Right Side */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <motion.h3 
                            className="text-lg font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors"
                            whileHover={{ x: 2 }}
                          >
                            {lesson.title}
                          </motion.h3>
                          
                          {/* Level Badge */}
                          <div className="mb-2">
                            <Badge 
                              className={`text-xs font-bold px-2 py-1 ${
                                lesson.difficulty === 'A1' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                lesson.difficulty === 'A2' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                lesson.difficulty === 'B1' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                lesson.difficulty === 'B2' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                lesson.difficulty === 'C1' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                'bg-purple-500 hover:bg-purple-600 text-white'
                              }`}
                            >
                              {lesson.difficulty}
                            </Badge>
                            {!isLocked && isRecommended && (
                              <Star className="inline h-4 w-4 text-yellow-500 fill-yellow-500 ml-2" />
                            )}
                          </div>
                          
                          {/* Description */}
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                            {lesson.content
                              ? stripHtmlTags(lesson.content).substring(0, 100) + "..."
                              : "Discover German culture through engaging stories."}
                          </p>
                        </div>
                        
                        {/* Action Area */}
                        <div className="mt-3">
                          {isLocked ? (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                disabled
                                variant="outline"
                                size="sm"
                                className="bg-muted text-muted-foreground border-border cursor-not-allowed"
                              >
                                <Lock className="h-3 w-3 mr-2" />
                                Locked
                              </Button>
                            </motion.div>
                          ) : (
                            <Link href={`/read/${lesson._id}`}>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button 
                                  size="sm"
                                  className={`transition-all shadow-md ${
                                    lesson.isCompleted 
                                      ? 'bg-green-500 hover:bg-green-600 text-white'
                                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                  }`}
                                >
                                  {lesson.isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      Review
                                    </>
                                  ) : (
                                    <>
                                      <BookOpen className="h-3 w-3 mr-2" />
                                      Read Story
                                    </>
                                  )}
                                  <ArrowRight className="h-3 w-3 ml-2" />
                                </Button>
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-12 w-80 mb-6" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}