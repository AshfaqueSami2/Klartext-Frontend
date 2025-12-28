'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Star } from 'lucide-react';
import { KeyPoint } from '@/types/grammar.types';

interface KeyPointsBoxProps {
  points: KeyPoint[];
  showGerman?: boolean;
}

export function KeyPointsBox({ points, showGerman = false }: KeyPointsBoxProps) {
  if (!points || points.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border-2 border-primary/30 bg-primary/5 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Key Points to Remember
            </h3>
            <p className="text-sm text-muted-foreground">
              Wichtige Punkte zum Merken
            </p>
          </div>
        </div>
      </div>

      {/* Points List */}
      <div className="p-6 space-y-3">
        {points.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-background/60 border border-primary/20"
          >
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">
                {showGerman && point.pointDe ? point.pointDe : point.point}
              </p>
              {!showGerman && point.pointDe && (
                <p className="text-sm text-muted-foreground/80 italic mt-1">
                  {point.pointDe}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
