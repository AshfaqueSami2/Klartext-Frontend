'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle2, PlayCircle, BookOpen } from 'lucide-react';

interface LessonCardProps {
  lesson: {
    _id: string;
    title: string;
    description?: string;
    difficulty: string;
    isPremium: boolean;
    canAccess: boolean;
    requiresUpgrade: boolean;
    lockReason: string | null;
    isCompleted: boolean;
    duration?: number; // in minutes
    topicCount?: number;
  };
  onUpgradeClick?: () => void;
}

export function LessonCardWithAccess({ lesson, onUpgradeClick }: LessonCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!lesson.canAccess) {
      // Show upgrade prompt
      if (onUpgradeClick) {
        onUpgradeClick();
      } else {
        const shouldUpgrade = confirm(
          `🔒 ${lesson.lockReason || 'This lesson requires a premium subscription.'}\n\nWould you like to upgrade now?`
        );
        if (shouldUpgrade) {
          router.push('/pricing');
        }
      }
      return;
    }

    // Navigate to lesson
    router.push(`/read/${lesson._id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'A1': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'A2': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'B1': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'B2': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'C1': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'C2': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        !lesson.canAccess ? 'opacity-75' : 'cursor-pointer'
      }`}
      onClick={lesson.canAccess ? handleClick : undefined}
    >
      {/* Lock Overlay for Premium Lessons */}
      {lesson.isPremium && !lesson.canAccess && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-md">
            <Lock className="w-3 h-3" />
            <span className="text-xs font-bold">Premium</span>
          </div>
        </div>
      )}

      {/* Completed Badge */}
      {lesson.isCompleted && (
        <div className="absolute top-0 left-0 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-br-lg flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-xs font-bold">Completed</span>
          </div>
        </div>
      )}

      <CardHeader className={lesson.isCompleted || (lesson.isPremium && !lesson.canAccess) ? 'pt-10' : ''}>
        {/* Difficulty Badge */}
        <div className="flex items-center justify-between mb-2">
          <Badge className={getDifficultyColor(lesson.difficulty)}>
            {lesson.difficulty}
          </Badge>
          
          {lesson.isPremium && lesson.canAccess && (
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200">
              Premium Access
            </Badge>
          )}
        </div>

        <CardTitle className="text-lg leading-tight">
          {lesson.title}
        </CardTitle>

        {lesson.description && (
          <CardDescription className="line-clamp-2">
            {lesson.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Lesson Stats */}
        {(lesson.duration || lesson.topicCount) && lesson.canAccess && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {lesson.duration && (
              <div className="flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                <span>{lesson.duration} min</span>
              </div>
            )}
            {lesson.topicCount && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.topicCount} topics</span>
              </div>
            )}
          </div>
        )}

        {/* Lock Reason */}
        {lesson.lockReason && !lesson.canAccess && (
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
                {lesson.lockReason}
              </p>
            </div>
          </div>
        )}

        {/* Premium Benefits Preview */}
        {!lesson.canAccess && lesson.requiresUpgrade && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Unlock to get:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>Full lesson content</span>
              </li>
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>Audio pronunciations</span>
              </li>
              <li className="flex items-start gap-1">
                <span>•</span>
                <span>Progress tracking</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="w-full"
          variant={!lesson.canAccess ? 'default' : lesson.isCompleted ? 'outline' : 'default'}
          disabled={!lesson.canAccess && !lesson.requiresUpgrade}
        >
          {!lesson.canAccess ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Unlock with Premium
            </>
          ) : lesson.isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Review Lesson
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Lesson
            </>
          )}
        </Button>
      </CardFooter>

      {/* Hover Effect for Accessible Lessons */}
      {lesson.canAccess && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </Card>
  );
}
