'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  FileText,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export function AdminQuickGuide() {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-violet-500/5 to-primary/5 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Quick Start Guide</h3>
          <p className="text-sm text-muted-foreground">Create grammar content in 3 steps</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            1
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Create a Topic</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Category like "German Cases" or "Verb Conjugation"
            </p>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/admin/grammar/topics/new">
                <BookOpen className="w-4 h-4" />
                New Topic
              </Link>
            </Button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            2
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Add Lessons</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Explanations, examples, and key points
            </p>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/admin/grammar/lessons/new">
                <FileText className="w-4 h-4" />
                New Lesson
              </Link>
            </Button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            3
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Create Exercises</h4>
            <p className="text-sm text-muted-foreground mb-2">
              9 types: Fill-blank, multiple choice, and more
            </p>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/admin/grammar/exercises/new">
                <ClipboardList className="w-4 h-4" />
                New Exercises
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">
            Remember to <strong className="text-foreground">publish</strong> content to make it visible to students
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">
            Set appropriate <strong className="text-foreground">CEFR levels</strong> (A1-C2) for content
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/grammar/guide" className="text-sm text-primary hover:underline flex items-center gap-1">
          View Complete Guide <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  );
}

export function ExerciseTypeReference() {
  const exerciseTypes = [
    { name: 'Fill in the Blank', icon: '📝', description: 'Complete sentences' },
    { name: 'Multiple Choice', icon: '✅', description: 'Select correct answer' },
    { name: 'Word Order', icon: '🔀', description: 'Arrange words correctly' },
    { name: 'Article Selection', icon: '🔤', description: 'Choose der/die/das' },
    { name: 'Error Correction', icon: '🔍', description: 'Find and fix mistakes' },
    { name: 'Conjugation', icon: '🔄', description: 'Verb conjugation' },
    { name: 'Case Selection', icon: '📦', description: 'Identify grammar case' },
    { name: 'Translation', icon: '🌐', description: 'Translate sentences' },
    { name: 'Matching', icon: '🔗', description: 'Match pairs' }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">9 Exercise Types Available</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {exerciseTypes.map((type) => (
          <div
            key={type.name}
            className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-2xl" role="img">{type.icon}</span>
            <div>
              <div className="font-medium text-sm">{type.name}</div>
              <div className="text-xs text-muted-foreground">{type.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
