'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Target,
  Trophy,
  Zap,
  HelpCircle,
  RotateCcw,
  Home,
  BookOpen,
  Sparkles,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { grammarService } from '@/services/grammar.service';
import { ExerciseSet, Exercise, GradedAnswer, ExerciseSubmissionResult } from '@/types/grammar.types';
import {
  FillBlankExercise,
  MultipleChoiceExerciseComponent,
  WordOrderExerciseComponent,
  ArticleSelectionExerciseComponent,
  ErrorCorrectionExerciseComponent
} from '@/components/grammar/ExerciseComponents';
import { ExerciseSkeleton } from '@/components/grammar/GrammarSkeletons';

// ============================================================================
// EXERCISE RENDERER
// ============================================================================

interface ExerciseRendererProps {
  exercise: Exercise;
  onAnswer: (answer: string | string[]) => void;
  isSubmitted: boolean;
  gradedAnswer?: GradedAnswer;
  showHint: boolean;
}

function ExerciseRenderer({
  exercise,
  onAnswer,
  isSubmitted,
  gradedAnswer,
  showHint
}: ExerciseRendererProps) {
  switch (exercise.type) {
    case 'fill-blank':
      return (
        <FillBlankExercise
          exercise={exercise}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          gradedAnswer={gradedAnswer}
          showHint={showHint}
        />
      );
    case 'multiple-choice':
      return (
        <MultipleChoiceExerciseComponent
          exercise={exercise}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          gradedAnswer={gradedAnswer}
        />
      );
    case 'word-order':
      return (
        <WordOrderExerciseComponent
          exercise={exercise}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          gradedAnswer={gradedAnswer}
        />
      );
    case 'article-selection':
      return (
        <ArticleSelectionExerciseComponent
          exercise={exercise}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          gradedAnswer={gradedAnswer}
        />
      );
    case 'error-correction':
      return (
        <ErrorCorrectionExerciseComponent
          exercise={exercise}
          onAnswer={onAnswer}
          isSubmitted={isSubmitted}
          gradedAnswer={gradedAnswer}
        />
      );
    default:
      return (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Exercise type "{(exercise as Exercise).type}" coming soon...
          </p>
        </Card>
      );
  }
}

// ============================================================================
// RESULT SCREEN
// ============================================================================

interface ResultScreenProps {
  result: ExerciseSubmissionResult;
  totalExercises: number;
  onRetry: () => void;
  onGoToLesson: () => void;
  onGoToTopics: () => void;
}

function ResultScreen({ 
  result, 
  totalExercises, 
  onRetry, 
  onGoToLesson,
  onGoToTopics 
}: ResultScreenProps) {
  const percentage = Math.round((result.correctCount / totalExercises) * 100);
  const isPerfect = result.correctCount === totalExercises;
  const isPassing = percentage >= 70;

  useEffect(() => {
    if (isPerfect) {
      // Epic confetti for perfect score
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#10b981', '#34d399']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#10b981', '#34d399']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (isPassing) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isPerfect, isPassing]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[70vh] flex items-center justify-center p-4"
    >
      <Card className="max-w-lg w-full p-8 text-center">
        {/* Trophy/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className={cn(
            "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
            isPerfect && "bg-gradient-to-br from-yellow-400 to-orange-500",
            isPassing && !isPerfect && "bg-gradient-to-br from-emerald-400 to-teal-500",
            !isPassing && "bg-gradient-to-br from-amber-400 to-orange-500"
          )}
        >
          {isPerfect ? (
            <Trophy className="w-12 h-12 text-white" />
          ) : isPassing ? (
            <CheckCircle2 className="w-12 h-12 text-white" />
          ) : (
            <Target className="w-12 h-12 text-white" />
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2"
        >
          {isPerfect ? "Perfect Score! 🎉" : isPassing ? "Great Job! 👏" : "Keep Practicing! 💪"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6"
        >
          {isPerfect
            ? "You've mastered this lesson!"
            : isPassing
            ? "You're making excellent progress!"
            : "Review the lesson and try again."}
        </motion.p>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {percentage}%
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="font-medium">{result.correctCount}</span>
            <span>of</span>
            <span className="font-medium">{totalExercises}</span>
            <span>correct</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">XP Earned</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              +{result.xpEarned}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Mastery</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {result.newMasteryLevel}
            </div>
          </div>
        </motion.div>

        {/* Mastery Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Mastery Progress</span>
            <span className="font-medium">{result.masteryProgress}%</span>
          </div>
          <Progress value={result.masteryProgress} className="h-3" />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          {!isPassing && (
            <Button onClick={onRetry} size="lg" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          <Button
            onClick={onGoToLesson}
            variant={isPassing ? "default" : "outline"}
            size="lg"
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Review Lesson
          </Button>
          <Button
            onClick={onGoToTopics}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Topics
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MAIN EXERCISES PAGE
// ============================================================================

export default function ExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const topicSlug = params.topicSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [exerciseSet, setExerciseSet] = useState<ExerciseSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [hintsUsed, setHintsUsed] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExerciseSubmissionResult | null>(null);
  const [gradedAnswers, setGradedAnswers] = useState<Record<string, GradedAnswer>>({});

  // Fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        // In real app, get lessonId from slug
        const exercises = await grammarService.getExercisesByLesson(lessonSlug);
        setExerciseSet(exercises);
      } catch (err) {
        console.error('Failed to fetch exercises:', err);
        setError('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [lessonSlug]);

  const currentExercise = exerciseSet?.exercises[currentIndex];
  const totalExercises = exerciseSet?.exercises.length || 0;
  const progress = totalExercises > 0 ? ((currentIndex + 1) / totalExercises) * 100 : 0;
  const allAnswered = totalExercises > 0 && Object.keys(answers).length === totalExercises;

  const handleAnswer = (exerciseId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [exerciseId]: answer }));
  };

  const handleHint = (exerciseId: string) => {
    setHintsUsed(prev => new Set(prev).add(exerciseId));
  };

  const handleNext = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!exerciseSet || !allAnswered) return;

    try {
      setSubmitting(true);

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([exerciseId, answer]) => ({
        exerciseId,
        answer,
        hintUsed: hintsUsed.has(exerciseId)
      }));

      // Get exercise IDs in order for proper indexing
      const exerciseIds = exerciseSet.exercises.map(e => e._id);

      const submitResult = await grammarService.submitExercises(
        exerciseSet._id,
        formattedAnswers,
        exerciseIds
      );

      console.log('Submit Result:', submitResult);

      // Cast to any to handle different API response formats
      const apiResult = submitResult as any;

      // Normalize the result to handle different API response formats
      const normalizedResult: ExerciseSubmissionResult = {
        score: apiResult.score ?? apiResult.percentage ?? 0,
        correctCount: apiResult.correctCount ?? apiResult.correct ?? 0,
        totalCount: apiResult.totalCount ?? apiResult.total ?? totalExercises,
        isPassed: apiResult.isPassed ?? apiResult.passed ?? false,
        timeSpent: apiResult.timeSpent ?? 0,
        xpEarned: apiResult.xpEarned ?? apiResult.xp ?? 0,
        newMasteryLevel: apiResult.newMasteryLevel ?? apiResult.masteryLevel ?? 'beginner',
        masteryProgress: apiResult.masteryProgress ?? 0,
        gradedAnswers: apiResult.gradedAnswers ?? [],
        masteryUpdate: apiResult.masteryUpdate
      };

      setResult(normalizedResult);

      // Build graded answers map
      const graded: Record<string, GradedAnswer> = {};
      normalizedResult.gradedAnswers?.forEach((ga, index) => {
        // Use exerciseId if available, otherwise use the exercise _id from exerciseSet
        const exerciseId = ga.exerciseId || exerciseIds[ga.exerciseIndex ?? index];
        if (exerciseId) {
          graded[exerciseId] = ga;
        }
      });
      setGradedAnswers(graded);
    } catch (err) {
      console.error('Failed to submit exercises:', err);
      setError('Failed to submit exercises');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setHintsUsed(new Set());
    setResult(null);
    setGradedAnswers({});
  };

  // Loading State
  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <ExerciseSkeleton />
      </div>
    );
  }

  // Error State
  if (error || !exerciseSet) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-8">{error || 'Exercises not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Result Screen
  if (result) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <ResultScreen
          result={result}
          totalExercises={totalExercises}
          onRetry={handleRetry}
          onGoToLesson={() => router.push(`/grammar/${topicSlug}/${lessonSlug}`)}
          onGoToTopics={() => router.push('/grammar')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                {exerciseSet.totalXP} XP
              </Badge>
              <Badge variant="secondary">
                {currentIndex + 1} / {totalExercises}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Exercise Content */}
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentExercise && (
              <>
                {/* Difficulty Badge */}
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      currentExercise.difficulty === 'easy' && "border-emerald-500 text-emerald-600",
                      currentExercise.difficulty === 'medium' && "border-amber-500 text-amber-600",
                      currentExercise.difficulty === 'hard' && "border-red-500 text-red-600"
                    )}
                  >
                    {currentExercise.difficulty}
                  </Badge>
                  {!result && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHint(currentExercise._id)}
                      disabled={hintsUsed.has(currentExercise._id)}
                      className="gap-1 text-muted-foreground"
                    >
                      <HelpCircle className="w-4 h-4" />
                      {hintsUsed.has(currentExercise._id) ? 'Hint Used' : 'Get Hint'}
                    </Button>
                  )}
                </div>

                {/* Exercise */}
                <ExerciseRenderer
                  exercise={currentExercise}
                  onAnswer={(answer) => handleAnswer(currentExercise._id, answer)}
                  isSubmitted={!!result}
                  gradedAnswer={gradedAnswers[currentExercise._id]}
                  showHint={hintsUsed.has(currentExercise._id)}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentIndex === totalExercises - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              size="lg"
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit All Answers
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Exercise Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {exerciseSet.exercises.map((ex, idx) => {
            const isAnswered = !!answers[ex._id];
            const isCurrent = idx === currentIndex;
            const isGraded = !!gradedAnswers[ex._id];
            const isCorrect = isGraded && gradedAnswers[ex._id]?.isCorrect;

            return (
              <button
                key={ex._id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  isCurrent && "w-6 bg-primary",
                  !isCurrent && isAnswered && !isGraded && "bg-primary/50",
                  !isCurrent && !isAnswered && "bg-muted-foreground/30",
                  isGraded && isCorrect && "bg-emerald-500",
                  isGraded && !isCorrect && "bg-red-500"
                )}
              />
            );
          })}
        </div>

        {/* Answer Progress Indicator */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          {Object.keys(answers).length} of {totalExercises} answered
        </div>
      </div>
    </div>
  );
}
