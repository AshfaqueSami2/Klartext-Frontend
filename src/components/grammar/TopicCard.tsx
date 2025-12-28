'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';
import { GrammarTopic, MasteryLevel } from '@/types/grammar.types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: GrammarTopic;
  index: number;
}

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  A2: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30' },
  B1: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' },
  B2: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/30' },
  C1: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30' },
  C2: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
};

const masteryConfig: Record<MasteryLevel, { color: string; label: string; icon: React.ReactNode }> = {
  'not-started': { color: 'text-muted-foreground', label: 'Not Started', icon: null },
  'beginner': { color: 'text-amber-500', label: 'Beginner', icon: <Sparkles className="w-3.5 h-3.5" /> },
  'intermediate': { color: 'text-blue-500', label: 'Intermediate', icon: <Target className="w-3.5 h-3.5" /> },
  'advanced': { color: 'text-purple-500', label: 'Advanced', icon: <Award className="w-3.5 h-3.5" /> },
  'mastered': { color: 'text-emerald-500', label: 'Mastered', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export function TopicCard({ topic, index }: TopicCardProps) {
  const colors = difficultyColors[topic.difficulty] || difficultyColors.A1;
  const masteryLevel = topic.userProgress?.masteryLevel || 'not-started';
  const mastery = masteryConfig[masteryLevel];
  
  const lessonsCompleted = topic.userProgress?.lessonsCompleted || 0;
  const totalLessons = topic.lessonsCount || 0;
  const progress = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/grammar/${topic._id}`}>
        <div className={cn(
          "group relative h-full rounded-2xl border-2 bg-card p-6 transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
          "hover:border-primary/50 cursor-pointer overflow-hidden"
        )}>
          {/* Background Gradient */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "bg-gradient-to-br from-primary/5 via-transparent to-transparent"
          )} />

          {/* Mastery Badge */}
          {masteryLevel !== 'not-started' && (
            <div className={cn(
              "absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              mastery.color,
              "bg-background/80 backdrop-blur-sm border"
            )}>
              {mastery.icon}
              <span>{mastery.label}</span>
            </div>
          )}

          {/* Difficulty Badge */}
          <div className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4",
            colors.bg, colors.text, colors.border, "border"
          )}>
            {topic.difficulty}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors pr-8">
            {topic.title}
          </h3>

          {/* German Title */}
          <p className="text-sm text-muted-foreground/70 italic mb-3">
            {topic.titleDe}
          </p>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2">
            {topic.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{totalLessons} lessons</span>
            </div>
            {topic.exerciseSetsCount && topic.exerciseSetsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>{topic.exerciseSetsCount} exercises</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Arrow Icon */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
