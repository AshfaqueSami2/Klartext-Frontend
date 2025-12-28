'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Topic Card Skeleton
export function TopicCardSkeleton() {
  return (
    <Card className="p-6 h-[280px]">
      <Skeleton className="h-6 w-12 rounded-full mb-4" />
      <Skeleton className="h-7 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-6" />
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-2 w-full" />
    </Card>
  );
}

// Lesson Card Skeleton
export function LessonCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-5">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </Card>
  );
}

// Topic Detail Header Skeleton
export function TopicHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-4/5" />
    </div>
  );
}

// Lesson Detail Skeleton
export function LessonDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex gap-3 mb-4">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-12 w-3/4 mb-3" />
        <Skeleton className="h-5 w-1/2 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Introduction */}
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* Explanation Blocks */}
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}

      {/* Key Points */}
      <Skeleton className="h-48 w-full rounded-2xl" />

      {/* Common Mistakes */}
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

// Progress Stats Skeleton
export function ProgressStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-8 w-16" />
        </Card>
      ))}
    </div>
  );
}

// Exercise Skeleton
export function ExerciseSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      
      {/* Progress bar */}
      <Skeleton className="h-2 w-full" />
      
      {/* Exercise Card */}
      <Card className="p-6">
        <Skeleton className="h-4 w-1/3 mb-6" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-4 w-2/3 mb-8" />
        
        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
      
      {/* Dots */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 w-3 rounded-full" />
        ))}
      </div>
    </div>
  );
}
