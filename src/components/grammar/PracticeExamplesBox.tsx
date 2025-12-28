'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { PracticeExample } from '@/types/grammar.types';

interface PracticeExamplesProps {
  examples: PracticeExample[];
}

export function PracticeExamplesBox({ examples }: PracticeExamplesProps) {
  if (!examples || examples.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border-2 border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-violet-100 dark:bg-violet-900/40 px-6 py-4 border-b border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-violet-900 dark:text-violet-300">
              Practice Examples
            </h3>
            <p className="text-sm text-violet-700 dark:text-violet-400">
              Apply what you've learned
            </p>
          </div>
        </div>
      </div>

      {/* Examples List */}
      <div className="p-6 space-y-4">
        {examples.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-5 rounded-xl bg-white dark:bg-card border border-violet-200 dark:border-violet-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* German */}
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">
                    🇩🇪 German
                  </span>
                  <p className="text-lg font-medium text-foreground">
                    {example.german}
                  </p>
                </div>
                {/* English */}
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                    🇬🇧 English
                  </span>
                  <p className="text-muted-foreground">
                    {example.english}
                  </p>
                </div>
              </div>
              {/* Example Number */}
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400 flex-shrink-0">
                {index + 1}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
