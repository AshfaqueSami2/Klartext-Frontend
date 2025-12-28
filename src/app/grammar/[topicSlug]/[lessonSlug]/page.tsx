'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  BookOpen, 
  Clock, 
  CheckCircle2,
  Play,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExplanationBlock } from '@/components/grammar/ExplanationBlock';
import { KeyPointsBox } from '@/components/grammar/KeyPointsBox';
import { CommonMistakesBox } from '@/components/grammar/CommonMistakesBox';
import { PracticeExamplesBox } from '@/components/grammar/PracticeExamplesBox';
import { LessonDetailSkeleton } from '@/components/grammar/GrammarSkeletons';
import { GrammarService } from '@/services/grammar.service';
import { GrammarLesson } from '@/types/grammar.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const difficultyColors: Record<string, string> = {
  A1: 'bg-emerald-500',
  A2: 'bg-teal-500',
  B1: 'bg-blue-500',
  B2: 'bg-violet-500',
  C1: 'bg-orange-500',
  C2: 'bg-rose-500',
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicSlug = params.topicSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGerman, setShowGerman] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (lessonSlug) {
      loadLesson();
      startTimeRef.current = Date.now();
    }
  }, [lessonSlug]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const scrollTop = window.scrollY - element.offsetTop;
      const scrollHeight = element.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1) * 100;
      
      setReadProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson]);

  const loadLesson = async () => {
    try {
      setIsLoading(true);
      const data = await GrammarService.getLessonById(lessonSlug);
      setLesson(data);
    } catch (error: any) {
      toast.error('Failed to load lesson');
      console.error('Error loading lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    
    try {
      setIsCompleting(true);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      await GrammarService.completeLesson(lesson._id, timeSpent);
      
      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success('Lesson completed! 🎉');
      
      // Reload to update progress
      loadLesson();
    } catch (error: any) {
      toast.error('Failed to mark lesson as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LessonDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Lesson not found</h2>
          <p className="text-muted-foreground mb-6">
            The lesson you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push(`/grammar/${topicSlug}`)}>
            Back to Topic
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = lesson.userProgress?.isCompleted || false;
  const difficultyColor = difficultyColors[lesson.difficulty] || 'bg-primary';

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress value={readProgress} className="h-1 rounded-none" />
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-lg border shadow-xl"
        >
          {/* Language Toggle */}
          <Button
            variant={showGerman ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGerman(!showGerman)}
            className="gap-2"
          >
            <Languages className="w-4 h-4" />
            {showGerman ? 'Deutsch' : 'English'}
          </Button>

          {/* Complete Button */}
          {!isCompleted ? (
            <Button
              onClick={handleCompleteLesson}
              disabled={isCompleting}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              {isCompleting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Mark Complete
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
          )}

          {/* Exercise Link */}
          {lesson.exerciseSets && lesson.exerciseSets.length > 0 && (
            <Link href={`/grammar/${topicSlug}/${lessonSlug}/exercises`}>
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Practice
              </Button>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push(`/grammar/${topicSlug}`)}
            className="gap-2 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topic
          </Button>
        </motion.div>

        {/* Lesson Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={cn("text-white", difficultyColor)}>
              {lesson.difficulty}
            </Badge>
            {isCompleted && (
              <Badge className="bg-emerald-500 text-white gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight leading-tight">
            {showGerman && lesson.titleDe ? lesson.titleDe : lesson.title}
          </h1>
          <p className="text-xl text-muted-foreground/80 italic mb-6">
            {showGerman && lesson.title ? lesson.title : lesson.titleDe}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{lesson.estimatedTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{lesson.explanationBlocks?.length || 0} sections</span>
            </div>
          </div>
        </motion.header>

        {/* Introduction */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-foreground leading-relaxed">
              {showGerman && lesson.introductionDe ? lesson.introductionDe : lesson.introduction}
            </p>
          </div>
        </motion.section>

        {/* Explanation Blocks */}
        {lesson.explanationBlocks && lesson.explanationBlocks.length > 0 && (
          <section className="mb-12 space-y-6">
            {lesson.explanationBlocks.map((block, index) => (
              <ExplanationBlock 
                key={index} 
                block={block} 
                index={index}
                showGerman={showGerman}
              />
            ))}
          </section>
        )}

        {/* Key Points */}
        {lesson.keyPoints && lesson.keyPoints.length > 0 && (
          <section className="mb-12">
            <KeyPointsBox points={lesson.keyPoints} showGerman={showGerman} />
          </section>
        )}

        {/* Practice Examples */}
        {lesson.practiceExamples && lesson.practiceExamples.length > 0 && (
          <section className="mb-12">
            <PracticeExamplesBox examples={lesson.practiceExamples} />
          </section>
        )}

        {/* Common Mistakes */}
        {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
          <section className="mb-12">
            <CommonMistakesBox mistakes={lesson.commonMistakes} />
          </section>
        )}

        {/* Navigation Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-8 border-t"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/grammar/${topicSlug}`)}
              className="gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topic
            </Button>

            {lesson.exerciseSets && lesson.exerciseSets.length > 0 && (
              <Link href={`/grammar/${topicSlug}/${lessonSlug}/exercises`} className="w-full sm:w-auto">
                <Button className="gap-2 w-full shadow-lg shadow-primary/20">
                  Practice Exercises
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
