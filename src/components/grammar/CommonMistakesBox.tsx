'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { CommonMistake } from '@/types/grammar.types';

interface CommonMistakesBoxProps {
  mistakes: CommonMistake[];
}

export function CommonMistakesBox({ mistakes }: CommonMistakesBoxProps) {
  if (!mistakes || mistakes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-amber-100 dark:bg-amber-900/40 px-6 py-4 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">
              Common Mistakes to Avoid
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Watch out for these typical errors
            </p>
          </div>
        </div>
      </div>

      {/* Mistakes List */}
      <div className="p-6 space-y-4">
        {mistakes.map((mistake, index) => (
          <MistakeItem key={index} mistake={mistake} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

function MistakeItem({ mistake, index }: { mistake: CommonMistake; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-xl bg-white dark:bg-card p-5 border border-amber-200 dark:border-amber-800"
    >
      {/* Wrong vs Correct */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Wrong */}
        <div className="flex-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Wrong</span>
          </div>
          <p className="text-red-700 dark:text-red-300 font-medium line-through decoration-red-400">
            {mistake.mistake}
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Correct */}
        <div className="flex-1 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Correct</span>
          </div>
          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
            {mistake.correction}
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="text-sm text-muted-foreground leading-relaxed">
        💡 {mistake.explanation}
      </div>
    </motion.div>
  );
}
