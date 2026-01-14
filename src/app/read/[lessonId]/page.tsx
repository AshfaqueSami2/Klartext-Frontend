"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import ReaderView from "@/components/reader/ReaderView";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, BookOpen, Clock, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ReadLessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [myVocab, setMyVocab] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const lessonRes = await api.get(`/lessons?_id=${params.lessonId}`); 
        const foundLesson = lessonRes.data.data.find((l: any) => l._id === params.lessonId);
        if (!isMounted) return;
        setLesson(foundLesson);

        const vocabRes = await api.get("/vocab/my-list");
        const words = vocabRes.data.data.map((v: any) => v.word);
        if (!isMounted) return;
        setMyVocab(words);
        
        try {
          const progressRes = await api.get("/progress/my-progress");
          const completedLessons = progressRes.data.data?.completedLessons || 
                                   progressRes.data.completedLessons || 
                                   [];
          
          const isLessonCompleted = completedLessons.some((cl: any) => {
            const lessonIdFromProgress = cl.lesson?._id || cl.lesson || cl.lessonId;
            return lessonIdFromProgress === params.lessonId;
          });
          
          if (!isMounted) return;
          setIsCompleted(isLessonCompleted);
        } catch (err) {
          if (isMounted) setIsCompleted(false);
        }
        
      } catch (error) {
        if (isMounted) toast.error("Could not load lesson");
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(() => setShowContent(true), 100);
        }
      }
    };
    loadData();
    
    return () => { isMounted = false; };
  }, [params.lessonId]);

  if (loading || !lesson) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-10 text-center"
      >
        <div className="relative">
          <Spinner size="xl" className="mx-auto mb-6" />
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-foreground text-xl font-medium"
        >
          Loading your story...
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm mt-2"
        >
          Preparing an immersive reading experience
        </motion.p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 md:w-[500px] md:h-[500px] bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 md:w-[500px] md:h-[500px] bg-gradient-to-br from-blue-400/10 to-cyan-400/10 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            x: [0, -20, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-emerald-400/5 to-teal-400/5 dark:from-emerald-600/5 dark:to-teal-600/5 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Enhanced Top Bar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50 px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between shadow-lg shadow-slate-200/20 dark:shadow-slate-900/50"
      >
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="gap-1.5 sm:gap-2 text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 px-2 sm:px-4 text-sm rounded-xl transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" /> 
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center min-w-0 px-2">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
          >
            <BookOpen className="h-4 w-4" />
          </motion.div>
          
          <h1 className="font-bold text-foreground truncate max-w-[150px] xs:max-w-xs sm:max-w-md text-sm sm:text-lg">
            {lesson.title}
          </h1>
          
          <AnimatePresence>
            {isCompleted && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-1 flex-shrink-0"
              >
                <Award className="h-3 w-3" />
                <span className="hidden xs:inline">Completed</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <SimpleThemeToggle />
      </motion.header>

      {/* Reading Area */}
      <main className="flex-1 w-full relative z-10">
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Enhanced Cover Image Section */}
              {lesson.coverImage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="py-6 sm:py-10 w-full max-w-4xl mx-auto px-4 sm:px-6"
                >
                  <div className="relative group">
                    {/* Glow effect behind image */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50">
                      <div className="relative w-full h-52 sm:h-72 md:h-96">
                        <Image 
                          src={lesson.coverImage} 
                          alt={lesson.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 896px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Title overlay on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                          <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-white text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-lg"
                          >
                            {lesson.title}
                          </motion.h2>
                          
                          {/* Lesson meta info */}
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-3"
                          >
                            {lesson.level && (
                              <span className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <Sparkles className="h-3.5 w-3.5" />
                                {lesson.level}
                              </span>
                            )}
                            {lesson.estimatedTime && (
                              <span className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <Clock className="h-3.5 w-3.5" />
                                {lesson.estimatedTime} min
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Reader View */}
              <ReaderView 
                lessonId={lesson._id} 
                content={lesson.content} 
                initialSavedWords={myVocab}
                isPreview={isCompleted}
                audioUrl={lesson.audioUrl}
                audioStatus={lesson.audioStatus || 'pending'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}