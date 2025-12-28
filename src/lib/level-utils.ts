// Shared constants for CEFR language levels

export const LEVEL_VALUES: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

export const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  A2: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  B1: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
  B2: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
  C1: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
  C2: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700",
};

export const DEFAULT_LEVEL_COLOR = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";

/**
 * Get the color classes for a CEFR difficulty level
 */
export function getLevelColor(level: string): string {
  return LEVEL_COLORS[level] || DEFAULT_LEVEL_COLOR;
}

/**
 * Get the numeric value for a CEFR level (for sorting/comparison)
 */
export function getLevelValue(level: string): number {
  return LEVEL_VALUES[level] || 0;
}

/**
 * Compare two levels for sorting
 */
export function compareLevels(a: string, b: string): number {
  return getLevelValue(a) - getLevelValue(b);
}

/**
 * Check if user level is sufficient for content level
 */
export function isLevelAccessible(userLevel: string, contentLevel: string): boolean {
  return getLevelValue(userLevel) >= getLevelValue(contentLevel);
}
