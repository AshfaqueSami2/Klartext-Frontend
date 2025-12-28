'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { 
  FillBlankExercise as FillBlankExerciseType,
  MultipleChoiceExercise,
  WordOrderExercise,
  ArticleSelectionExercise,
  ErrorCorrectionExercise,
  GradedAnswer
} from '@/types/grammar.types';

// ============================================================================
// FILL IN THE BLANK EXERCISE
// ============================================================================

interface FillBlankProps {
  exercise: FillBlankExerciseType;
  onAnswer: (answer: string) => void;
  isSubmitted: boolean;
  gradedAnswer?: GradedAnswer;
  showHint: boolean;
}

export function FillBlankExercise({ 
  exercise, 
  onAnswer, 
  isSubmitted, 
  gradedAnswer,
  showHint 
}: FillBlankProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onAnswer(e.target.value);
  };

  const parts = exercise.sentence.split('___');

  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        {exercise.instruction}
      </p>
      
      <div className="flex flex-wrap items-center gap-2 text-xl font-medium mb-4">
        <span>{parts[0]}</span>
        <div className="relative">
          <Input
            value={value}
            onChange={handleChange}
            disabled={isSubmitted}
            placeholder="..."
            className={cn(
              "w-32 text-center text-lg font-semibold",
              isSubmitted && gradedAnswer?.isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
              isSubmitted && !gradedAnswer?.isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30"
            )}
          />
          {isSubmitted && (
            <div className="absolute -right-6 top-1/2 -translate-y-1/2">
              {gradedAnswer?.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        <span>{parts[1]}</span>
      </div>

      <p className="text-sm text-muted-foreground italic">
        {exercise.sentenceTranslation}
      </p>

      {/* Hint */}
      {showHint && !isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span>Hint: The answer starts with "{exercise.correctAnswer[0]}"</span>
          </div>
        </motion.div>
      )}

      {/* Explanation after submission */}
      {isSubmitted && gradedAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 p-4 rounded-lg",
            gradedAnswer.isCorrect 
              ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          )}
        >
          {!gradedAnswer.isCorrect && (
            <p className="text-sm mb-2">
              <span className="font-medium">Correct answer:</span>{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {gradedAnswer.correctAnswer}
              </span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            💡 {gradedAnswer.explanation}
          </p>
        </motion.div>
      )}
    </Card>
  );
}

// ============================================================================
// MULTIPLE CHOICE EXERCISE
// ============================================================================

interface MultipleChoiceProps {
  exercise: MultipleChoiceExercise;
  onAnswer: (answer: string) => void;
  isSubmitted: boolean;
  gradedAnswer?: GradedAnswer;
}

export function MultipleChoiceExerciseComponent({ 
  exercise, 
  onAnswer, 
  isSubmitted, 
  gradedAnswer 
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (isSubmitted) return;
    setSelected(option);
    onAnswer(option);
  };

  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-muted-foreground mb-2">
        {exercise.instruction}
      </p>
      
      <p className="text-xl font-medium mb-6">{exercise.question}</p>
      <p className="text-sm text-muted-foreground italic mb-4">
        {exercise.questionTranslation}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {exercise.options.map((option, index) => {
          const isSelected = selected === option.text;
          const isCorrect = option.isCorrect;
          const showCorrect = isSubmitted && isCorrect;
          const showWrong = isSubmitted && isSelected && !isCorrect;

          return (
            <motion.button
              key={index}
              whileHover={!isSubmitted ? { scale: 1.02 } : {}}
              whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option.text)}
              disabled={isSubmitted}
              className={cn(
                "p-4 rounded-xl border-2 text-left font-medium transition-all",
                "hover:border-primary/50",
                isSelected && !isSubmitted && "border-primary bg-primary/5",
                showCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                showWrong && "border-red-500 bg-red-50 dark:bg-red-950/30",
                !isSelected && !showCorrect && "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{option.text}</span>
                {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      {isSubmitted && gradedAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-lg bg-muted/50"
        >
          <p className="text-sm text-muted-foreground">
            💡 {gradedAnswer.explanation}
          </p>
        </motion.div>
      )}
    </Card>
  );
}

// ============================================================================
// WORD ORDER EXERCISE
// ============================================================================

interface WordOrderProps {
  exercise: WordOrderExercise;
  onAnswer: (answer: string[]) => void;
  isSubmitted: boolean;
  gradedAnswer?: GradedAnswer;
}

export function WordOrderExerciseComponent({ 
  exercise, 
  onAnswer, 
  isSubmitted, 
  gradedAnswer 
}: WordOrderProps) {
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>(
    [...exercise.words].sort(() => Math.random() - 0.5)
  );

  const handleAddWord = (word: string) => {
    if (isSubmitted) return;
    const newOrdered = [...orderedWords, word];
    const newAvailable = availableWords.filter(w => w !== word);
    setOrderedWords(newOrdered);
    setAvailableWords(newAvailable);
    onAnswer(newOrdered);
  };

  const handleRemoveWord = (index: number) => {
    if (isSubmitted) return;
    const word = orderedWords[index];
    const newOrdered = orderedWords.filter((_, i) => i !== index);
    setOrderedWords(newOrdered);
    setAvailableWords([...availableWords, word]);
    onAnswer(newOrdered);
  };

  const handleReset = () => {
    setOrderedWords([]);
    setAvailableWords([...exercise.words].sort(() => Math.random() - 0.5));
    onAnswer([]);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          {exercise.instruction}
        </p>
        {!isSubmitted && orderedWords.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Ordered Words (Answer Area) */}
      <div className={cn(
        "min-h-[60px] p-4 rounded-xl border-2 border-dashed mb-4 flex flex-wrap gap-2",
        orderedWords.length === 0 && "items-center justify-center",
        isSubmitted && gradedAnswer?.isCorrect && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
        isSubmitted && !gradedAnswer?.isCorrect && "border-red-500 bg-red-50/50 dark:bg-red-950/20"
      )}>
        {orderedWords.length === 0 ? (
          <span className="text-muted-foreground text-sm">Click words below to build your sentence</span>
        ) : (
          orderedWords.map((word, index) => (
            <motion.button
              key={`${word}-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => handleRemoveWord(index)}
              disabled={isSubmitted}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              {word}
            </motion.button>
          ))
        )}
      </div>

      {/* Available Words */}
      <div className="flex flex-wrap gap-2">
        {availableWords.map((word, index) => (
          <motion.button
            key={`${word}-${index}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddWord(word)}
            disabled={isSubmitted}
            className="px-3 py-2 rounded-lg bg-muted font-medium text-sm hover:bg-muted/80 transition-colors"
          >
            {word}
          </motion.button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground italic mt-4">
        Translation: {exercise.translation}
      </p>

      {/* Explanation */}
      {isSubmitted && gradedAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 p-4 rounded-lg",
            gradedAnswer.isCorrect 
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : "bg-red-50 dark:bg-red-950/30"
          )}
        >
          {!gradedAnswer.isCorrect && (
            <p className="text-sm mb-2">
              <span className="font-medium">Correct order:</span>{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {(gradedAnswer.correctAnswer as string[]).join(' ')}
              </span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            💡 {gradedAnswer.explanation}
          </p>
        </motion.div>
      )}
    </Card>
  );
}

// ============================================================================
// ARTICLE SELECTION EXERCISE
// ============================================================================

interface ArticleSelectionProps {
  exercise: ArticleSelectionExercise;
  onAnswer: (answer: string) => void;
  isSubmitted: boolean;
  gradedAnswer?: GradedAnswer;
}

export function ArticleSelectionExerciseComponent({ 
  exercise, 
  onAnswer, 
  isSubmitted, 
  gradedAnswer 
}: ArticleSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (article: string) => {
    if (isSubmitted) return;
    setSelected(article);
    onAnswer(article);
  };

  const parts = exercise.sentence.split('___');

  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        {exercise.instruction}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xl font-medium mb-4">
        <span>{parts[0]}</span>
        <span className={cn(
          "px-3 py-1 rounded-lg border-2 font-bold",
          selected && !isSubmitted && "border-primary bg-primary/10",
          isSubmitted && gradedAnswer?.isCorrect && "border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
          isSubmitted && !gradedAnswer?.isCorrect && "border-red-500 bg-red-100 dark:bg-red-900/30",
          !selected && "border-dashed border-muted-foreground/50"
        )}>
          {selected || '___'}
        </span>
        <span>{parts[1]}</span>
      </div>

      <p className="text-sm text-muted-foreground italic mb-6">
        {exercise.sentenceTranslation}
      </p>

      {/* Article Options */}
      <div className="flex flex-wrap gap-2">
        {exercise.options.map((article) => {
          const isSelected = selected === article;
          const isCorrect = article === exercise.correctAnswer;
          const showCorrect = isSubmitted && isCorrect;
          const showWrong = isSubmitted && isSelected && !isCorrect;

          return (
            <motion.button
              key={article}
              whileHover={!isSubmitted ? { scale: 1.05 } : {}}
              whileTap={!isSubmitted ? { scale: 0.95 } : {}}
              onClick={() => handleSelect(article)}
              disabled={isSubmitted}
              className={cn(
                "px-4 py-2 rounded-lg border-2 font-semibold transition-all",
                isSelected && !isSubmitted && "border-primary bg-primary text-primary-foreground",
                showCorrect && "border-emerald-500 bg-emerald-500 text-white",
                showWrong && "border-red-500 bg-red-500 text-white",
                !isSelected && !showCorrect && "border-border hover:border-primary/50"
              )}
            >
              {article}
            </motion.button>
          );
        })}
      </div>

      {/* Noun Info */}
      <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
        <span className="text-muted-foreground">Noun: </span>
        <span className="font-semibold">{exercise.noun}</span>
        <span className="text-muted-foreground"> ({exercise.nounGender}, {exercise.caseUsed})</span>
      </div>

      {/* Explanation */}
      {isSubmitted && gradedAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-lg bg-muted/50"
        >
          <p className="text-sm text-muted-foreground">
            💡 {gradedAnswer.explanation}
          </p>
        </motion.div>
      )}
    </Card>
  );
}

// ============================================================================
// ERROR CORRECTION EXERCISE
// ============================================================================

interface ErrorCorrectionProps {
  exercise: ErrorCorrectionExercise;
  onAnswer: (answer: string) => void;
  isSubmitted: boolean;
  gradedAnswer?: GradedAnswer;
}

export function ErrorCorrectionExerciseComponent({ 
  exercise, 
  onAnswer, 
  isSubmitted, 
  gradedAnswer 
}: ErrorCorrectionProps) {
  const [correction, setCorrection] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCorrection(e.target.value);
    onAnswer(e.target.value);
  };

  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-muted-foreground mb-4">
        {exercise.instruction}
      </p>

      {/* Incorrect Sentence */}
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">
            Incorrect
          </span>
        </div>
        <p className="text-lg font-medium text-red-700 dark:text-red-300">
          {exercise.incorrectSentence}
        </p>
      </div>

      {/* Correction Input */}
      <div className="mb-4">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Write the correct sentence:
        </label>
        <Input
          value={correction}
          onChange={handleChange}
          disabled={isSubmitted}
          placeholder="Type the corrected sentence..."
          className={cn(
            "text-base",
            isSubmitted && gradedAnswer?.isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
            isSubmitted && !gradedAnswer?.isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30"
          )}
        />
      </div>

      <p className="text-sm text-muted-foreground italic">
        Translation: {exercise.translation}
      </p>

      {/* Explanation */}
      {isSubmitted && gradedAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 p-4 rounded-lg",
            gradedAnswer.isCorrect 
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : "bg-amber-50 dark:bg-amber-950/30"
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                Correct
              </span>
              <p className="text-base font-medium text-emerald-700 dark:text-emerald-300">
                {exercise.correctSentence}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            💡 {gradedAnswer.explanation}
          </p>
        </motion.div>
      )}
    </Card>
  );
}
