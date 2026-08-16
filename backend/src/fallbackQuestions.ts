// ============================================================
// Fallback & Dataset Bridge (V6)
// Connected to the 10,000 Questions Dataset Engine
// ============================================================

import { Question, RoundType, QuestionFormat, QuestionType } from './types';
import {
  getInstantQuestion,
  getRoundTypeForRound,
  getRoundConfiguration,
  normalizeSignature,
  getTotalQuestionCount,
  RawDatasetQuestion,
} from './dataset/questionsEngine';
import questionsData from './dataset/questionsData.json';

export const FALLBACK_QUESTIONS: Question[] = (questionsData as RawDatasetQuestion[]).map(q => ({
  id: q.id,
  category: q.category,
  format: q.format,
  type: q.type,
  timeLimit: q.timeLimit,
  optionA: q.optionA,
  optionB: q.optionB,
  roundType: q.roundType,
  difficulty: 1,
}));

export {
  getRoundTypeForRound,
  getRoundConfiguration,
  normalizeSignature,
  getTotalQuestionCount,
};

export function isDuplicateQuestion(q: Question, recentSignatures: Set<string>): boolean {
  const sig = normalizeSignature(q.optionA, q.optionB);
  const sigA = normalizeSignature(q.optionA, '');
  const sigB = normalizeSignature(q.optionB, '');
  return recentSignatures.has(sig) || recentSignatures.has(sigA) || recentSignatures.has(sigB);
}

export function getFallbackQuestion(
  recentQuestions: string[] = [],
  recentCategories: string[] = [],
  roundNumber = 1,
  targetRoundType: RoundType = 'NORMAL',
  gameMode = 'RANDOM'
): Question {
  return getInstantQuestion(recentQuestions, recentCategories, roundNumber, targetRoundType, gameMode);
}
