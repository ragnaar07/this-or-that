// ============================================================
// Fallback question pool — used when AI generation fails
// ============================================================

import { Question } from './types';

export const FALLBACK_QUESTIONS: Question[] = [
  { category: 'food', optionA: 'Pizza', optionB: 'Tacos' },
  { category: 'nature', optionA: 'Beach', optionB: 'Mountains' },
  { category: 'drinks', optionA: 'Tea', optionB: 'Coffee' },
  { category: 'time', optionA: 'Morning', optionB: 'Night' },
  { category: 'communication', optionA: 'Text', optionB: 'Call' },
  { category: 'pets', optionA: 'Cats', optionB: 'Dogs' },
  { category: 'seasons', optionA: 'Summer', optionB: 'Winter' },
  { category: 'taste', optionA: 'Sweet', optionB: 'Spicy' },
  { category: 'living', optionA: 'City', optionB: 'Village' },
  { category: 'entertainment', optionA: 'Movies', optionB: 'Series' },
  { category: 'tech', optionA: 'Android', optionB: 'iPhone' },
  { category: 'media', optionA: 'Books', optionB: 'Podcasts' },
  { category: 'weather', optionA: 'Rain', optionB: 'Snow' },
  { category: 'food', optionA: 'Burger', optionB: 'Sandwich' },
  { category: 'sky', optionA: 'Sunrise', optionB: 'Sunset' },
  { category: 'lifestyle', optionA: 'Travel', optionB: 'Stay Home' },
  { category: 'audio', optionA: 'Music', optionB: 'Silence' },
  { category: 'social', optionA: 'Party', optionB: 'Chill' },
  { category: 'social media', optionA: 'Instagram', optionB: 'YouTube' },
  { category: 'food', optionA: 'Chocolate', optionB: 'Vanilla' },
  { category: 'transport', optionA: 'Car', optionB: 'Bike' },
  { category: 'nature', optionA: 'Forest', optionB: 'Desert' },
  { category: 'hypothetical', optionA: 'Fly', optionB: 'Teleport' },
  { category: 'sleep', optionA: 'Early Bird', optionB: 'Night Owl' },
  { category: 'weekend', optionA: 'Indoors', optionB: 'Outdoors' },
  { category: 'food', optionA: 'Ice Cream', optionB: 'Cake' },
  { category: 'fashion', optionA: 'Sneakers', optionB: 'Sandals' },
  { category: 'watch', optionA: 'Netflix', optionB: 'YouTube' },
  { category: 'sport', optionA: 'Swim', optionB: 'Run' },
  { category: 'hypothetical', optionA: 'Time Travel', optionB: 'Mind Reading' },
];

let fallbackIndex = 0;

/**
 * Pick a fallback question that hasn't been used recently.
 */
export function getFallbackQuestion(recentQuestions: string[]): Question {
  const recentSet = new Set(recentQuestions.map((q) => q.toLowerCase()));

  // Try to find one not in recent list
  for (let i = 0; i < FALLBACK_QUESTIONS.length; i++) {
    const candidate = FALLBACK_QUESTIONS[(fallbackIndex + i) % FALLBACK_QUESTIONS.length];
    if (!recentSet.has(candidate.optionA.toLowerCase())) {
      fallbackIndex = (fallbackIndex + i + 1) % FALLBACK_QUESTIONS.length;
      return candidate;
    }
  }

  // If all are recent (shouldn't happen), just return current
  const q = FALLBACK_QUESTIONS[fallbackIndex % FALLBACK_QUESTIONS.length];
  fallbackIndex = (fallbackIndex + 1) % FALLBACK_QUESTIONS.length;
  return q;
}
