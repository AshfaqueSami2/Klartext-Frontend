'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target,
  TrendingUp
} from 'lucide-react';
import { GrammarProgress, TopicMastery } from '@/types/grammar.types';
import { cn } from '@/lib/utils';

interface ProgressOverviewProps {
  progress: GrammarProgress;
}

export function ProgressOverview({ progress }: ProgressOverviewProps) {
  // Handle both nested and flat API response structures
  const overview = progress.overview || {
    totalLessonsCompleted: progress.totalLessonsCompleted || 0,
    totalExercisesPassed: progress.totalExercisesPassed || 0,
    totalTimeSpent: progress.totalTimeSpent || 0,
    averageExerciseScore: progress.overallAverageScore || progress.averageExerciseScore || 0
  };

  // Debug log to verify data
  console.log('ProgressOverview - overview data:', overview);
  
  const stats = [
    {
      label: 'Lessons Completed',
      value: overview.totalLessonsCompleted || 0,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Exercises Passed',
      value: overview.totalExercisesPassed || 0,
      icon: Trophy,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      label: 'Time Spent',
      value: `${Math.round((overview.totalTimeSpent || 0) / 60)}m`,
      icon: Clock,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10'
    },
    {
      label: 'Avg. Score',
      value: overview.averageExerciseScore ? `${Math.round(overview.averageExerciseScore)}%` : '0%',
      icon: Target,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    }
  ];

  console.log('ProgressOverview - stats:', stats); // Debug: see computed stats

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface MasteryCardProps {
  mastery: TopicMastery;
  index: number;
}

export function MasteryCard({ mastery, index }: MasteryCardProps) {
  const progressPercent = mastery.totalLessons > 0 
    ? (mastery.lessonsCompleted / mastery.totalLessons) * 100 
    : 0;

  const masteryColors = {
    'not-started': 'text-muted-foreground',
    'beginner': 'text-amber-500',
    'intermediate': 'text-blue-500',
    'advanced': 'text-purple-500',
    'mastered': 'text-emerald-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground truncate">{mastery.topic.title}</h3>
          <span className={cn("text-xs font-medium", masteryColors[mastery.masteryLevel])}>
            {mastery.masteryLevel.charAt(0).toUpperCase() + mastery.masteryLevel.slice(1).replace('-', ' ')}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lessons</span>
            <span className="font-medium">{mastery.lessonsCompleted}/{mastery.totalLessons}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          
          <div className="flex justify-between text-sm pt-2">
            <span className="text-muted-foreground">Exercises</span>
            <span className="font-medium">{mastery.exercisesPassed}/{mastery.totalExercises}</span>
          </div>
          
          {mastery.averageScore > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg. Score:</span>
              <span className="text-sm font-medium">{mastery.averageScore}%</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
