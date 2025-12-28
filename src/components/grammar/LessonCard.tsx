'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  BookOpen,
  Play
} from 'lucide-react';
import { GrammarLesson } from '@/types/grammar.types';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  lesson: GrammarLesson;
  topicSlug: string;
  index: number;
}

const difficultyColors: Record<string, string> = {
  A1: 'bg-emerald-500',
  A2: 'bg-teal-500',
  B1: 'bg-blue-500',
  B2: 'bg-violet-500',
  C1: 'bg-orange-500',
  C2: 'bg-rose-500',
};

export function LessonCard({ lesson, topicSlug, index }: LessonCardProps) {
  const isCompleted = lesson.userProgress?.isCompleted || false;
  const difficultyColor = difficultyColors[lesson.difficulty] || 'bg-primary';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Link href={`/grammar/${topicSlug}/${lesson._id}`}>
        <div className={cn(
          "group relative flex items-center gap-5 p-5 rounded-xl border-2 bg-card",
          "transition-all duration-300 hover:shadow-lg hover:border-primary/50",
          "cursor-pointer overflow-hidden",
          isCompleted && "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
        )}>
          {/* Left: Order Number & Status */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
              "transition-all duration-300",
              isCompleted 
                ? "bg-emerald-500 text-white" 
                : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                lesson.order
              )}
            </div>
            {/* Difficulty Indicator */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
              difficultyColor
            )} />
          </div>

          {/* Center: Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold text-foreground group-hover:text-primary transition-colors truncate",
                isCompleted && "text-emerald-700 dark:text-emerald-400"
              )}>
                {lesson.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground/80 italic truncate mb-2">
              {lesson.titleDe}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{lesson.estimatedTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lesson.explanationBlocks?.length || 0} sections</span>
              </div>
              {lesson.exerciseSets && lesson.exerciseSets.length > 0 && (
                <div className="flex items-center gap-1">
                  <Play className="w-3.5 h-3.5" />
                  <span>{lesson.exerciseSets.length} exercises</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Arrow */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            "bg-muted/50 group-hover:bg-primary/10 transition-all duration-300",
            "transform group-hover:translate-x-1"
          )}>
            <ChevronRight className={cn(
              "w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors",
              isCompleted && "text-emerald-600"
            )} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
