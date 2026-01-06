"use client";

import confetti from "canvas-confetti";

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  startVelocity?: number;
  decay?: number;
  scalar?: number;
}

/**
 * Fire confetti with custom options
 */
export const fireConfetti = (options: ConfettiOptions = {}) => {
  const {
    particleCount = 100,
    spread = 70,
    origin = { x: 0.5, y: 0.5 },
    colors,
    startVelocity = 30,
    decay = 0.9,
    scalar = 1,
  } = options;

  confetti({
    particleCount,
    spread,
    origin,
    colors,
    startVelocity,
    decay,
    scalar,
  });
};

/**
 * Celebrate completion with a big confetti burst
 */
export const celebrateCompletion = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fire confetti from two sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};
