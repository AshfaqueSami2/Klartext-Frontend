'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Target,
  Trophy,
  Sparkles,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LessonCard } from '@/components/grammar/LessonCard';
import { LessonCardSkeleton, TopicHeaderSkeleton } from '@/components/grammar/GrammarSkeletons';
import { GrammarService } from '@/services/grammar.service';
import { GrammarTopic, GrammarLesson } from '@/types/grammar.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const difficultyColors: Record<string, { bg: string; text: string; gradient: string }> = {
  A1: { bg: 'bg-emerald-500', text: 'text-emerald-600', gradient: 'from-emerald-500/20 to-emerald-500/5' },
  A2: { bg: 'bg-teal-500', text: 'text-teal-600', gradient: 'from-teal-500/20 to-teal-500/5' },
  B1: { bg: 'bg-blue-500', text: 'text-blue-600', gradient: 'from-blue-500/20 to-blue-500/5' },
  B2: { bg: 'bg-violet-500', text: 'text-violet-600', gradient: 'from-violet-500/20 to-violet-500/5' },
  C1: { bg: 'bg-orange-500', text: 'text-orange-600', gradient: 'from-orange-500/20 to-orange-500/5' },
  C2: { bg: 'bg-rose-500', text: 'text-rose-600', gradient: 'from-rose-500/20 to-rose-500/5' },
};

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicSlug = params.topicSlug as string;

  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (topicSlug) {
      loadTopicData();
    }
  }, [topicSlug]);

  const loadTopicData = async () => {
    try {
      setIsLoading(true);
      // First get the topic (works with slug)
      const topicData = await GrammarService.getTopicById(topicSlug);
      console.log('Topic Data:', topicData);
      setTopic(topicData);
      
      // Then use the topic's _id to fetch lessons (backend requires ObjectId, not slug)
      if (topicData?._id) {
        const lessonsData = await GrammarService.getLessonsByTopic(topicData._id);
        console.log('Lessons Data:', lessonsData);
        setLessons(lessonsData || []);
      } else {
        setLessons([]);
      }
    } catch (error: any) {
      toast.error('Failed to load topic');
      console.error('Error loading topic:', error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <TopicHeaderSkeleton />
          <div className="mt-12 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <LessonCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Topic not found</h2>
          <p className="text-muted-foreground mb-6">
            The grammar topic you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/grammar')}>
            Back to Grammar
          </Button>
        </div>
      </div>
    );
  }

  const colors = difficultyColors[topic.difficulty] || difficultyColors.A1;
  const completedLessons = lessons.filter(l => l.userProgress?.isCompleted).length;
  const progressPercent = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;
  const nextLesson = lessons.find(l => !l.userProgress?.isCompleted);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className={cn("relative overflow-hidden", `bg-gradient-to-b ${colors.gradient}`)}>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/grammar')}
              className="gap-2 mb-6 hover:bg-background/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Grammar
            </Button>
          </motion.div>

          {/* Topic Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Difficulty Badge */}
            <Badge className={cn("mb-4 text-white", colors.bg)}>
              {topic.difficulty} Level
            </Badge>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
              {topic.title}
            </h1>
            <p className="text-xl text-muted-foreground/80 italic mb-4">
              {topic.titleDe}
            </p>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">
              {topic.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">{lessons.length} Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center">
                  <Target className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">{topic.exerciseSetsCount || 0} Exercises</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">{completedLessons}/{lessons.length} Completed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Your Progress</span>
                <span className="text-sm font-bold text-primary">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            {nextLesson && (
              <Link href={`/grammar/${topicSlug}/${nextLesson.slug || nextLesson._id}`}>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                  <Play className="w-4 h-4" />
                  Continue Learning
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Lessons</h2>
            <p className="text-sm text-muted-foreground">
              Work through each lesson in order
            </p>
          </div>
        </motion.div>

        {lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <LessonCard 
                key={lesson._id} 
                lesson={lesson} 
                topicSlug={topicSlug}
                index={index} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No lessons yet
            </h3>
            <p className="text-muted-foreground">
              Lessons for this topic are coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
