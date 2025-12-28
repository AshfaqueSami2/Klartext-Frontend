"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios";
import ReaderView from "@/components/reader/ReaderView";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BackgroundTexture } from "@/components/ui/background-texture";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ReadLessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [myVocab, setMyVocab] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // 1. Get Lesson Content
        const lessonRes = await api.get(`/lessons?_id=${params.lessonId}`); 
        // Note: You might need a specific 'get one' endpoint or filter the list
        const foundLesson = lessonRes.data.data.find((l: any) => l._id === params.lessonId);
        if (!isMounted) return;
        setLesson(foundLesson);

        // 2. Get User's Vocab (to highlight saved words)
        const vocabRes = await api.get("/vocab/my-list");
        const words = vocabRes.data.data.map((v: any) => v.word);
        if (!isMounted) return;
        setMyVocab(words);
        
        // 3. Check if lesson is completed using your backend endpoint
        try {
          const progressRes = await api.get("/progress/my-progress");
          const completedLessons = progressRes.data.data.completedLessons || [];
          const isLessonCompleted = completedLessons.some((cl: any) => cl.lessonId === params.lessonId);
          if (!isMounted) return;
          setIsCompleted(isLessonCompleted);
        } catch {
          // If progress check fails, assume not completed
          if (isMounted) setIsCompleted(false);
        }
        
      } catch (error) {
        if (isMounted) toast.error("Could not load lesson");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [params.lessonId]);

  if (loading || !lesson) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="p-10 text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <p className="text-foreground text-lg">Loading Story...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <BackgroundTexture />
      
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-6 h-16 flex items-center justify-between shadow-sm">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-foreground hover:bg-accent">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-foreground truncate max-w-md text-lg">{lesson.title}</h1>
          {isCompleted && (
            <span className="bg-success/10 text-success text-xs px-3 py-1 rounded-full font-medium border border-success/20">
              ✓ Completed
            </span>
          )}
        </div>
        <SimpleThemeToggle />
      </header>

      {/* Reading Area */}
      <main className="flex-1 w-full">
        {/* Cover Image */}
        {lesson.coverImage && (
          <div className="mb-12 w-full max-w-3xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-border/50">
              <div className="relative w-full h-64 md:h-80">
                <Image 
                  src={lesson.coverImage} 
                  alt={lesson.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        )}
        
        <ReaderView 
          lessonId={lesson._id} 
          content={lesson.content} 
          initialSavedWords={myVocab}
          isPreview={isCompleted}
          audioUrl={lesson.audioUrl}
          audioStatus={lesson.audioStatus || 'pending'}
        />
      </main>
    </div>
  );
}