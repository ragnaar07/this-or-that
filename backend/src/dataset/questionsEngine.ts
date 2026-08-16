// ============================================================
// Ultra-Fast 10,000 Questions In-Memory Engine (O(1) Instant Retrieval)
// Pre-indexed for Sub-Millisecond (<0.01ms) Performance
// ============================================================

import questionsData from './questionsData.json';
import { Question, QuestionFormat, QuestionType, RoundType } from '../types';

export interface RawDatasetQuestion {
  id: string;
  rawId: number;
  optionA: string;
  optionB: string;
  category: string;
  format: QuestionFormat;
  type: QuestionType;
  timeLimit: number;
  roundType: RoundType;
  gameModes: string[];
}

// In-memory typed store
const ALL_QUESTIONS: RawDatasetQuestion[] = questionsData as RawDatasetQuestion[];

// O(1) Pre-calculated Multi-dimensional Index Maps
const MODE_FORMAT_POOLS = new Map<string, RawDatasetQuestion[]>();
const MODE_ROUND_POOLS = new Map<string, RawDatasetQuestion[]>();
const MODE_TYPE_POOLS = new Map<string, RawDatasetQuestion[]>();
const MODE_ALL_POOLS = new Map<string, RawDatasetQuestion[]>();

// Initialize indexes once on server boot
(() => {
  for (const q of ALL_QUESTIONS) {
    const modes = q.gameModes && q.gameModes.length > 0 ? q.gameModes : ['RANDOM'];

    for (const m of modes) {
      // 1. Mode All Pool
      let allList = MODE_ALL_POOLS.get(m);
      if (!allList) {
        allList = [];
        MODE_ALL_POOLS.set(m, allList);
      }
      allList.push(q);

      // 2. Mode + Format Pool
      const fmtKey = `${m}___${q.format}`;
      let fmtList = MODE_FORMAT_POOLS.get(fmtKey);
      if (!fmtList) {
        fmtList = [];
        MODE_FORMAT_POOLS.set(fmtKey, fmtList);
      }
      fmtList.push(q);

      // 3. Mode + RoundType Pool
      if (q.roundType && q.roundType !== 'NORMAL') {
        const rtKey = `${m}___${q.roundType}`;
        let rtList = MODE_ROUND_POOLS.get(rtKey);
        if (!rtList) {
          rtList = [];
          MODE_ROUND_POOLS.set(rtKey, rtList);
        }
        rtList.push(q);
      }

      // 4. Mode + Type Pool
      const typeKey = `${m}___${q.type}`;
      let typeList = MODE_TYPE_POOLS.get(typeKey);
      if (!typeList) {
        typeList = [];
        MODE_TYPE_POOLS.set(typeKey, typeList);
      }
      typeList.push(q);
    }
  }

  // Pre-seed CHAOS, PREDICTION, and DOUBLE_POINTS for modes where they might be sparse
  const allChaos = ALL_QUESTIONS.filter(q => q.category === 'Crazy & Superpowers' || q.type === 'CHAOS' || q.roundType === 'CHAOS');
  const allPrediction = ALL_QUESTIONS.filter(q => q.category === 'Friendship & Relationships' || q.category === 'Digital & Memes' || q.type === 'EDGE' || q.type === 'FUNNY');
  const allDoublePoints = ALL_QUESTIONS.filter(q => q.category === 'Money & Career' || q.category === 'Deep & Philosophy' || q.type === 'EDGE');

  for (const m of ['RANDOM', 'INDIA', 'ENTERTAINMENT', 'FOOD', 'CHAOS', 'DEEP']) {
    if (!MODE_ROUND_POOLS.has(`${m}___CHAOS`)) {
      MODE_ROUND_POOLS.set(`${m}___CHAOS`, allChaos);
    }
    if (!MODE_ROUND_POOLS.has(`${m}___PREDICTION`)) {
      MODE_ROUND_POOLS.set(`${m}___PREDICTION`, allPrediction);
    }
    if (!MODE_ROUND_POOLS.has(`${m}___DOUBLE_POINTS`)) {
      MODE_ROUND_POOLS.set(`${m}___DOUBLE_POINTS`, allDoublePoints);
    }
  }

  console.log(`⚡ [QUESTIONS ENGINE] Pre-indexed ${ALL_QUESTIONS.length} questions into fast pools.`);
})();

// Signature normalization for fast duplicate checks
export function normalizeSignature(textA: string, textB: string): string {
  const normA = (textA || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normB = (textB || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return [normA, normB].sort().join('___');
}

export interface RoundConfig {
  format: QuestionFormat;
  type: QuestionType;
  timeLimit: number;
  roundType: RoundType;
  isSpecial?: boolean;
}

export function getRoundConfiguration(roundNumber: number): RoundConfig {
  if (roundNumber === 1) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 2) return { format: 'SITUATIONAL', type: 'SITUATIONAL', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 3) return { format: 'QUICK', type: 'FUNNY', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 4) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 5) return { format: 'SITUATIONAL', type: 'CURRENT', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 6) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 7) return { format: 'SITUATIONAL', type: 'EDGE', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 8) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 9) return { format: 'SITUATIONAL', type: 'CHAOS', timeLimit: 16, roundType: 'CHAOS', isSpecial: true };
  if (roundNumber === 10) return { format: 'SITUATIONAL', type: 'PREDICTION', timeLimit: 16, roundType: 'PREDICTION', isSpecial: true };
  if (roundNumber === 11) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 12) return { format: 'SITUATIONAL', type: 'FUNNY', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 13) return { format: 'SITUATIONAL', type: 'EDGE', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 14) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 15) return { format: 'SITUATIONAL', type: 'DOUBLE_POINTS', timeLimit: 16, roundType: 'DOUBLE_POINTS', isSpecial: true };
  if (roundNumber === 16) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 17) return { format: 'SITUATIONAL', type: 'CHAOS', timeLimit: 16, roundType: 'CHAOS', isSpecial: true };
  if (roundNumber === 18) return { format: 'SITUATIONAL', type: 'PREDICTION', timeLimit: 16, roundType: 'PREDICTION', isSpecial: true };
  if (roundNumber === 19) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber >= 20) return { format: 'SITUATIONAL', type: 'DOUBLE_POINTS', timeLimit: 16, roundType: 'DOUBLE_POINTS', isSpecial: true };

  const isEven = roundNumber % 2 === 0;
  return {
    format: isEven ? 'SITUATIONAL' : 'QUICK',
    type: isEven ? 'SITUATIONAL' : 'QUICK',
    timeLimit: isEven ? 16 : 10,
    roundType: 'NORMAL',
  };
}

export function getRoundTypeForRound(roundNumber: number): RoundType {
  return getRoundConfiguration(roundNumber).roundType;
}

// Global fast rotation pointer
let cursor = Math.floor(Math.random() * 5000);

export function getInstantQuestion(
  recentQuestions: string[] = [],
  recentCategories: string[] = [],
  roundNumber = 1,
  targetRoundType: RoundType = 'NORMAL',
  gameMode = 'RANDOM'
): Question {
  const config = getRoundConfiguration(roundNumber);
  const targetFormat = config.format;
  const targetType = config.type;
  const timeLimit = config.timeLimit;
  const actualRoundType = targetRoundType !== 'NORMAL' ? targetRoundType : config.roundType;

  // Build exclusion signatures
  const recentSigSet = new Set<string>();
  for (let i = 0; i < recentQuestions.length; i++) {
    const qStr = recentQuestions[i];
    recentSigSet.add(normalizeSignature(qStr, ''));
  }

  // Prevent 3-in-a-row category clusters
  const lastCat1 = recentCategories[recentCategories.length - 1];
  const lastCat2 = recentCategories[recentCategories.length - 2];
  const forbiddenCat = lastCat1 && lastCat2 && lastCat1 === lastCat2 ? lastCat1 : null;

  const mode = (gameMode || 'RANDOM').toUpperCase();

  // Mode pool check
  const modePool = MODE_ALL_POOLS.get(mode) || ALL_QUESTIONS;

  // 1. Specific Round Type Pool (CHAOS, PREDICTION, DOUBLE_POINTS)
  if (actualRoundType !== 'NORMAL') {
    const rtPool = MODE_ROUND_POOLS.get(`${mode}___${actualRoundType}`) || MODE_ROUND_POOLS.get(`RANDOM___${actualRoundType}`);
    if (rtPool && rtPool.length > 0) {
      for (let i = 0; i < Math.min(25, rtPool.length); i++) {
        const item = rtPool[(cursor + i) % rtPool.length];
        if ((!forbiddenCat || item.category !== forbiddenCat) && !recentSigSet.has(normalizeSignature(item.optionA, ''))) {
          cursor = (cursor + i + 1) % rtPool.length;
          return formatOutputQuestion(item, targetFormat, (actualRoundType as QuestionType), 16, actualRoundType);
        }
      }
    }
  }

  // 2. Specific Type Pool (EDGE, FUNNY)
  if (targetType === 'EDGE' || targetType === 'FUNNY') {
    const typePool = MODE_TYPE_POOLS.get(`${mode}___${targetType}`) || MODE_TYPE_POOLS.get(`RANDOM___${targetType}`);
    if (typePool && typePool.length > 0) {
      for (let i = 0; i < Math.min(25, typePool.length); i++) {
        const item = typePool[(cursor + i) % typePool.length];
        if ((!forbiddenCat || item.category !== forbiddenCat) && !recentSigSet.has(normalizeSignature(item.optionA, ''))) {
          cursor = (cursor + i + 1) % typePool.length;
          return formatOutputQuestion(item, item.format || targetFormat, targetType, item.timeLimit || timeLimit, actualRoundType);
        }
      }
    }
  }

  // 3. Format Pool within Mode (QUICK vs SITUATIONAL)
  const fmtPool = MODE_FORMAT_POOLS.get(`${mode}___${targetFormat}`) || (mode === 'RANDOM' ? MODE_FORMAT_POOLS.get(`RANDOM___${targetFormat}`) : modePool);
  if (fmtPool && fmtPool.length > 0) {
    for (let i = 0; i < Math.min(25, fmtPool.length); i++) {
      const item = fmtPool[(cursor + i) % fmtPool.length];
      if ((!forbiddenCat || item.category !== forbiddenCat) && !recentSigSet.has(normalizeSignature(item.optionA, ''))) {
        cursor = (cursor + i + 1) % fmtPool.length;
        return formatOutputQuestion(item, targetFormat, targetType, timeLimit, actualRoundType);
      }
    }
  }

  // 4. Any item from Mode Pool
  for (let i = 0; i < Math.min(25, modePool.length); i++) {
    const item = modePool[(cursor + i) % modePool.length];
    if (!recentSigSet.has(normalizeSignature(item.optionA, ''))) {
      cursor = (cursor + i + 1) % modePool.length;
      return formatOutputQuestion(item, targetFormat, targetType, timeLimit, actualRoundType);
    }
  }

  // 5. Ultimate Fallback
  const fallback = ALL_QUESTIONS[cursor % ALL_QUESTIONS.length];
  cursor = (cursor + 1) % ALL_QUESTIONS.length;
  return formatOutputQuestion(fallback, targetFormat, targetType, timeLimit, actualRoundType);
}

function formatOutputQuestion(
  raw: RawDatasetQuestion,
  format: QuestionFormat,
  type: QuestionType,
  timeLimit: number,
  roundType: RoundType
): Question {
  return {
    id: raw.id,
    category: raw.category,
    format: format || raw.format || 'QUICK',
    type: type || raw.type || 'QUICK',
    timeLimit: timeLimit || raw.timeLimit || (format === 'QUICK' ? 10 : 16),
    optionA: raw.optionA,
    optionB: raw.optionB,
    roundType,
    difficulty: 1,
  };
}

export function getTotalQuestionCount(): number {
  return ALL_QUESTIONS.length;
}
