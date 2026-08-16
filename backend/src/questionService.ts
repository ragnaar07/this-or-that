// ============================================================
// AI Question & Final Analysis Service — Google Gemini & OpenAI (V5)
// Quick (10s) vs Situational (16s) vs Current India Topics
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import {
  Question,
  RoundHistoryItem,
  FinalReport,
  CategoryScore,
  Achievement,
  PredictionScore,
  RoundType,
  QuestionFormat,
  QuestionType,
} from './types';
import { getFallbackQuestion, getRoundTypeForRound, getRoundConfiguration } from './fallbackQuestions';

const QUESTION_SYSTEM_PROMPT = `You are the viral question design engine for THIS ⚡ THAT, an India-first multiplayer social game (Metros, Tier-2, Tier-3 cities across North, South, East, West).

FORMATS & TYPES:
1. FORMAT A: "QUICK" (Fast instinct, 10-second timer).
   - Very short options (1-3 words max, e.g. "Tea" vs "Coffee", "Mountains" vs "Beach", "UPI" vs "Cash", "Bollywood" vs "OTT").
   - Leave "scenario" empty/null.
2. FORMAT B: "SITUATIONAL" (Dilemmas & deeper decisions, 16-second timer).
   - Include a 1-2 sentence dramatic scenario in "scenario".
   - Two genuinely tempting choices in "optionA" and "optionB".

CRITICAL RULE FOR ALL QUESTIONS & EDGE QUESTIONS:
- NO MORALLY SUPERIOR ANSWERS. NEVER make Option A = good person vs Option B = bad person.
- Both options MUST be understandable, tempting, defensible, and slightly uncomfortable.
- Ask: "What would you ACTUALLY do?", NOT "What SHOULD you do?".
- Human Truths to reveal playfully: curiosity, ego, jealousy, FOMO, comfort, status, small greed, people-pleasing, friendship dynamics.

CATEGORIES & THEMES:
- Edge & Instincts, Funny & Relatable, Food & Chai, Indian Everyday Life, Bollywood & Cinema, Cricket & Sports, Public Life & Culture, Digital & Memes, Money & Career, Friendship & Relationships, Crazy Superpowers.

CURRENT TOPIC GUIDELINES:
- Use current cultural, Bollywood, social media, technology/AI, and public conversations neutrally without stating unverified rumors as facts or asking for political party loyalty.

RULES:
- Return valid JSON ONLY:
{
  "category": "...",
  "format": "QUICK" | "SITUATIONAL",
  "type": "QUICK" | "SITUATIONAL" | "EDGE" | "FUNNY" | "CHAOS" | "PREDICTION" | "CURRENT" | "DOUBLE_POINTS",
  "timeLimit": 10 | 16,
  "scenario": "..." (or null if QUICK),
  "optionA": "...",
  "optionB": "..."
}`;

function extractJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) cleaned = match[1].trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

// ---- Question Generation ----

async function generateQuestionWithGemini(
  apiKey: string,
  recentQuestions: string[],
  recentCategories: string[] = [],
  roundNumber = 1,
  targetRoundType: RoundType = 'NORMAL',
  gameMode = 'RANDOM'
): Promise<Question> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const roundConfig = getRoundConfiguration(roundNumber);
  const targetFormat: QuestionFormat = roundConfig.format;
  const targetType: QuestionType = roundConfig.type;
  const timeLimit = roundConfig.timeLimit;

  let themeGuidance = 'Dynamic Indian cultural dilemma or fast choice';
  if (targetType === 'EDGE') {
    themeGuidance = 'Edge dilemma revealing natural human behaviour (curiosity, FOMO, ego, secrets, money) with NO obvious good/bad choice (16s timer)';
  } else if (targetType === 'FUNNY') {
    themeGuidance = 'Funny, highly relatable desi human habit or quirk (5 min promise, panic text, front camera) (16s timer)';
  } else if (targetRoundType === 'CHAOS') {
    themeGuidance = 'Absurd, crazy superpower dilemmas or high-stakes deals (16s timer)';
  } else if (targetRoundType === 'PREDICTION') {
    themeGuidance = 'Revealing social quirks, WhatsApp habits, or friendship situations where guessing opponent choice is fun (16s timer)';
  } else if (targetRoundType === 'DOUBLE_POINTS') {
    themeGuidance = 'High-stakes lifestyle, career vs freedom choices, or core relationship dilemmas (16s timer)';
  } else if (targetType === 'CURRENT') {
    themeGuidance = 'Current Indian entertainment, social media debates, AI, or public conversation (16s timer)';
  } else if (targetFormat === 'QUICK') {
    themeGuidance = 'Fast, punchy 1-2 word instinct pair (e.g. Tea vs Coffee, Train vs Flight) (10s timer)';
  } else {
    themeGuidance = 'Relatable Indian everyday situational dilemma with a 1-2 sentence scenario (16s timer)';
  }

  const recentList = recentQuestions.slice(-15).join(', ');
  const recentCatList = recentCategories.slice(-3).join(', ');

  const prompt = `Generate ONE India-first question.
Round number: ${roundNumber} of 20.
Round Type: ${targetRoundType}.
Required Format: ${targetFormat} (${targetFormat === 'QUICK' ? '10 seconds, 1-2 words per option, no scenario' : '16 seconds, 1-2 sentence scenario'}).
Theme focus: ${themeGuidance}.
Mode: ${gameMode}.
Avoid recent categories: ${recentCatList || 'none'}.
Avoid recently used choices: ${recentList || 'none yet'}.
Return JSON only:
{"category":"...","format":"${targetFormat}","type":"${targetType}","timeLimit":${timeLimit},"scenario":${targetFormat === 'QUICK' ? 'null' : '"..."'},"optionA":"...","optionB":"..."}`;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.95,
          maxOutputTokens: 450,
        },
        systemInstruction: QUESTION_SYSTEM_PROMPT,
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = extractJson(text);

      if (
        typeof parsed.category === 'string' &&
        typeof parsed.optionA === 'string' &&
        typeof parsed.optionB === 'string' &&
        parsed.optionA.trim().length > 0 &&
        parsed.optionB.trim().length > 0
      ) {
        return {
          category: parsed.category.trim(),
          subcategory: parsed.subcategory?.trim(),
          format: targetFormat,
          type: targetType,
          timeLimit: targetFormat === 'QUICK' ? 10 : 16,
          scenario: targetFormat === 'QUICK' ? undefined : parsed.scenario?.trim(),
          optionA: parsed.optionA.trim(),
          optionB: parsed.optionB.trim(),
          roundType: targetRoundType,
        };
      }
    } catch {
      continue;
    }
  }

  throw new Error('Gemini question generation model attempts failed');
}

export async function generateQuestion(
  recentQuestions: string[],
  recentCategories: string[] = [],
  roundNumber = 1,
  roundType?: RoundType,
  gameMode = 'RANDOM'
): Promise<Question> {
  const targetRoundType = roundType || getRoundTypeForRound(roundNumber);
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey !== 'your_gemini_key_here') {
    try {
      const q = await generateQuestionWithGemini(
        geminiKey,
        recentQuestions,
        recentCategories,
        roundNumber,
        targetRoundType,
        gameMode
      );
      return q;
    } catch (err) {
      console.warn('[AI:Gemini] Question fallback:', err instanceof Error ? err.message : err);
    }
  }

  return getFallbackQuestion(recentQuestions, recentCategories, roundNumber, targetRoundType, gameMode);
}

// ============================================================
// Mathematical Category & Score Calculator
// ============================================================

export function computeCategoryScores(history: RoundHistoryItem[]): CategoryScore[] {
  const catMap = new Map<string, { total: number; matched: number }>();

  for (const item of history) {
    const cat = item.category || 'General';
    const current = catMap.get(cat) ?? { total: 0, matched: 0 };
    current.total += 1;
    if (item.result === 'MATCH') {
      current.matched += 1;
    }
    catMap.set(cat, current);
  }

  const scores: CategoryScore[] = [];
  for (const [category, stats] of catMap.entries()) {
    const matchPercentage = stats.total > 0 ? Math.round((stats.matched / stats.total) * 100) : 0;
    scores.push({
      category,
      matchPercentage,
      totalQuestions: stats.total,
      matchedQuestions: stats.matched,
    });
  }

  return scores.sort((a, b) => b.totalQuestions - a.totalQuestions);
}

// ============================================================
// Dynamic Prediction Score Calculator
// ============================================================

export function computePredictionScore(
  history: RoundHistoryItem[],
  hostName: string,
  guestName: string
): PredictionScore | undefined {
  const predictionRounds = history.filter(h => h.roundType === 'PREDICTION' || h.hostPrediction || h.guestPrediction);
  if (predictionRounds.length === 0) return undefined;

  let hostCorrect = 0;
  let guestCorrect = 0;
  const total = predictionRounds.length;

  for (const r of predictionRounds) {
    if (r.hostPredictionResult === 'CORRECT') hostCorrect++;
    if (r.guestPredictionResult === 'CORRECT') guestCorrect++;
  }

  let summary = 'You both tested your telepathic intuition!';
  if (hostCorrect > guestCorrect) {
    summary = `${hostName} knew ${guestName} better (${hostCorrect}/${total}) than ${guestName} knew ${hostName} (${guestCorrect}/${total})!`;
  } else if (guestCorrect > hostCorrect) {
    summary = `${guestName} knew ${hostName} better (${guestCorrect}/${total}) than ${hostName} knew ${guestName} (${hostCorrect}/${total})!`;
  } else if (hostCorrect === total && total > 0) {
    summary = `Twin Telepaths! Both ${hostName} and ${guestName} predicted each other with 100% accuracy (${hostCorrect}/${total})! 🎯`;
  } else {
    summary = `Both scored ${hostCorrect}/${total} in predicting each other's instincts.`;
  }

  return {
    hostCorrect,
    guestCorrect,
    totalPredictions: total,
    hostName,
    guestName,
    summary,
  };
}

// ============================================================
// Achievements Engine (Evidence-Based from Actual Data)
// ============================================================

export function computeAchievements(
  history: RoundHistoryItem[],
  matchPercentage: number,
  predictionScore?: PredictionScore
): Achievement[] {
  const achievements: Achievement[] = [];

  if (matchPercentage >= 75) {
    achievements.push({
      id: 'same_brain',
      title: '⚡ SAME BRAIN',
      icon: '⚡',
      description: `${matchPercentage}% total synchronization! Uncanny telepathic alignment.`,
      unlockedFor: 'both',
    });
  } else if (matchPercentage <= 40 && history.length >= 5) {
    achievements.push({
      id: 'opposites_attract',
      title: '💀 COMPLETE OPPOSITES',
      icon: '💀',
      description: `Only ${matchPercentage}% match rate! Two completely different universes.`,
      unlockedFor: 'both',
    });
  }

  if (predictionScore) {
    if (predictionScore.hostCorrect >= 2 && predictionScore.guestCorrect >= 2) {
      achievements.push({
        id: 'mind_readers',
        title: '🧠 TWIN MIND READERS',
        icon: '🧠',
        description: 'Both predicted each other with razor-sharp intuition!',
        unlockedFor: 'both',
      });
    } else if (predictionScore.hostCorrect >= 2) {
      achievements.push({
        id: 'host_mind_reader',
        title: `🧠 ${predictionScore.hostName.toUpperCase()} THE MIND READER`,
        icon: '🧠',
        description: `${predictionScore.hostName} predicted ${predictionScore.guestName}'s choices effortlessly!`,
        unlockedFor: 'host',
      });
    } else if (predictionScore.guestCorrect >= 2) {
      achievements.push({
        id: 'guest_mind_reader',
        title: `🧠 ${predictionScore.guestName.toUpperCase()} THE MIND READER`,
        icon: '🧠',
        description: `${predictionScore.guestName} read ${predictionScore.hostName}'s mind like a book!`,
        unlockedFor: 'guest',
      });
    }
  }

  const foodRounds = history.filter(h => h.category.toLowerCase().includes('food') || h.category.toLowerCase().includes('chai'));
  if (foodRounds.length >= 2) {
    const foodMatches = foodRounds.filter(h => h.result === 'MATCH').length;
    if (foodMatches / foodRounds.length >= 0.75) {
      achievements.push({
        id: 'food_soulmates',
        title: '🍜 FOOD SOULMATES',
        icon: '🍜',
        description: 'Identical cravings on street food, chai, and comfort meals!',
        unlockedFor: 'both',
      });
    }
  }

  const cinemaRounds = history.filter(h => h.category.toLowerCase().includes('cinema') || h.category.toLowerCase().includes('bollywood'));
  if (cinemaRounds.length >= 2) {
    const cinemaMatches = cinemaRounds.filter(h => h.result === 'MATCH').length;
    if (cinemaMatches / cinemaRounds.length >= 0.75) {
      achievements.push({
        id: 'cinema_twins',
        title: '🎬 CINEMA TWINS',
        icon: '🎬',
        description: '100% in sync on movie choices, theatres, and entertainment!',
        unlockedFor: 'both',
      });
    }
  }

  const chaosRounds = history.filter(h => h.roundType === 'CHAOS' || h.category.toLowerCase().includes('crazy'));
  if (chaosRounds.length >= 1) {
    const chaosMatches = chaosRounds.filter(h => h.result === 'MATCH').length;
    if (chaosMatches > 0) {
      achievements.push({
        id: 'chaos_partners',
        title: '😂 CHAOS PARTNERS',
        icon: '😂',
        description: 'Agreed on wild superpower dilemmas and absurd choices!',
        unlockedFor: 'both',
      });
    }
  }

  const travelRounds = history.filter(h => h.category.toLowerCase().includes('travel') || h.category.toLowerCase().includes('regional'));
  if (travelRounds.length >= 2) {
    const travelMatches = travelRounds.filter(h => h.result === 'MATCH').length;
    if (travelMatches / travelRounds.length >= 0.75) {
      achievements.push({
        id: 'travel_twins',
        title: '✈️ TRAVEL TWINS',
        icon: '✈️',
        description: 'Same wavelength on holidays, itineraries, and mountain vs beach!',
        unlockedFor: 'both',
      });
    }
  }

  const cricketRounds = history.filter(h => h.category.toLowerCase().includes('cricket') || h.category.toLowerCase().includes('sports'));
  if (cricketRounds.length >= 1) {
    const cricketMatches = cricketRounds.filter(h => h.result === 'MATCH').length;
    if (cricketMatches === cricketRounds.length) {
      achievements.push({
        id: 'cricket_connection',
        title: '🏏 CRICKET CONNECTION',
        icon: '🏏',
        description: 'Shared match-watching philosophy and last-over tension!',
        unlockedFor: 'both',
      });
    }
  }

  return achievements;
}

// ============================================================
// Live Reaction Generator
// ============================================================

export function generateLiveReaction(
  isMatch: boolean,
  streak: number,
  roundType: RoundType = 'NORMAL',
  hostPredCorrect?: boolean,
  guestPredCorrect?: boolean
): string {
  if (roundType === 'PREDICTION') {
    if (hostPredCorrect && guestPredCorrect) {
      return '🎯 DOUBLE MIND READERS! Both predicted each other accurately!';
    }
    if (hostPredCorrect) {
      return '🎯 MIND READER! Predicted opponent choice correctly!';
    }
    if (guestPredCorrect) {
      return '🎯 MIND READER! Opponent predicted your choice!';
    }
    return '❌ YOU THOUGHT YOU KNEW THEM 😂 Neither predicted right!';
  }

  if (roundType === 'DOUBLE_POINTS' && isMatch) {
    return '🔥 2X SCORE UNLOCKED! Perfect match on double points round!';
  }

  if (isMatch) {
    if (streak >= 4) return '⚡⚡⚡ UNSTOPPABLE SYNC! ARE YOU TWO SHARING A BRAIN?!';
    if (streak === 3) return '⚡ 3-IN-A-ROW! Telepathic connection active!';
    const matchReactions = [
      '⚡ SAME BRAIN!',
      'Okay... that was suspiciously easy.',
      'Locked in complete sync! ⚡',
      'No hesitation. Same thought.',
      'Certified brain sync! 🎯',
    ];
    return matchReactions[Math.floor(Math.random() * matchReactions.length)];
  }

  if (streak <= -4) return '💀 4 DISAGREEMENTS IN A ROW! Do you two even know each other?! 😂';
  if (streak === -3) return '💀 OPPOSITE ENERGY OVERLOAD! Complete divergence!';
  const diffReactions = [
    '💀 OPPOSITE ENERGY',
    'Yeah... definitely two different humans.',
    'Not even in the same universe! 😂',
    'That debate is going to last a week.',
    'Different planets, same game! 🪐',
  ];
  return diffReactions[Math.floor(Math.random() * diffReactions.length)];
}

// ============================================================
// Final AI Game Analysis Engine (V5)
// ============================================================

export async function generateFinalReport(
  history: RoundHistoryItem[],
  hostName: string,
  guestName: string,
  matches: number,
  totalCompleted: number,
  totalRounds: number,
  isPartial: boolean,
  interruptedReason?: string,
  gameMode = 'RANDOM',
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun',
  leftBy?: 'host' | 'guest' | 'both',
  leftAt?: number
): Promise<FinalReport> {
  const matchPercentage = totalCompleted > 0 ? Math.round((matches / totalCompleted) * 100) : 0;
  const categoryScores = computeCategoryScores(history);
  const predictionScore = computePredictionScore(history, hostName, guestName);
  const achievements = computeAchievements(history, matchPercentage, predictionScore);

  // Compute Quick vs Situational match stats
  const quickRounds = history.filter(h => h.format === 'QUICK' || h.questionType === 'QUICK');
  const quickMatches = quickRounds.filter(h => h.result === 'MATCH').length;
  const instinctMatchPercentage = quickRounds.length > 0
    ? Math.round((quickMatches / quickRounds.length) * 100)
    : matchPercentage;

  const sitRounds = history.filter(h => h.format !== 'QUICK' && h.questionType !== 'QUICK');
  const sitMatches = sitRounds.filter(h => h.result === 'MATCH').length;
  const strategicMatchPercentage = sitRounds.length > 0
    ? Math.round((sitMatches / sitRounds.length) * 100)
    : matchPercentage;

  let instinctVsStrategyInsight = `You matched ${instinctMatchPercentage}% on fast instincts and ${strategicMatchPercentage}% on situational decisions.`;
  if (instinctMatchPercentage >= strategicMatchPercentage + 20) {
    instinctVsStrategyInsight = `You two matched ${instinctMatchPercentage}% on instinctive quick choices, but only ${strategicMatchPercentage}% when decisions got complicated. Translation: Your fast reflexes are identical, but your actual life strategies are completely different! 😂`;
  } else if (strategicMatchPercentage >= instinctMatchPercentage + 20) {
    instinctVsStrategyInsight = `You two clashed on quick daily habits (${instinctMatchPercentage}%), but surprisingly aligned (${strategicMatchPercentage}%) on deep life dilemmas! Translation: You argue over chai, but agree on life.`;
  } else if (instinctMatchPercentage >= 75 && strategicMatchPercentage >= 75) {
    instinctVsStrategyInsight = `Uncanny telepathy across both quick instinct (${instinctMatchPercentage}%) and deep life dilemmas (${strategicMatchPercentage}%)! Certified Same Brain.`;
  }

  const totalScore = history.reduce((acc, h) => acc + (h.pointsAwarded || (h.result === 'MATCH' ? 1 : 0)), 0);
  const maxPossible = history.reduce((acc, h) => acc + (h.roundType === 'DOUBLE_POINTS' ? 2 : 1), 0);

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'your_gemini_key_here') {
    try {
      // 3.5s timeout promise race so AI never hangs or blocks the players
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini generation timeout (3.5s limit)')), 3500);
      });

      const reportPromise = generateReportWithGemini(
        geminiKey,
        history,
        hostName,
        guestName,
        matches,
        totalCompleted,
        totalRounds,
        matchPercentage,
        instinctMatchPercentage,
        strategicMatchPercentage,
        instinctVsStrategyInsight,
        categoryScores,
        achievements,
        predictionScore,
        totalScore,
        maxPossible,
        isPartial,
        interruptedReason,
        gameMode,
        aiTone,
        leftBy,
        leftAt
      );

      const report = await Promise.race([reportPromise, timeoutPromise]);
      console.log(`[AI:Gemini] ✨ Generated V5 Report: "${report.headline}" (${report.matchPercentage}% match) [Tone: ${aiTone}]`);
      return report;
    } catch (err) {
      console.warn('[AI:Gemini] Final report fast fallback triggered:', err);
    }
  }

  return generateLocalFallbackReport(
    history,
    hostName,
    guestName,
    matches,
    totalCompleted,
    totalRounds,
    matchPercentage,
    instinctMatchPercentage,
    strategicMatchPercentage,
    instinctVsStrategyInsight,
    categoryScores,
    achievements,
    predictionScore,
    totalScore,
    maxPossible,
    isPartial,
    interruptedReason,
    gameMode,
    aiTone,
    leftBy,
    leftAt
  );
}

// ---- Gemini Report Generator ----

async function generateReportWithGemini(
  apiKey: string,
  history: RoundHistoryItem[],
  hostName: string,
  guestName: string,
  matches: number,
  totalCompleted: number,
  totalRounds: number,
  matchPercentage: number,
  instinctMatchPercentage: number,
  strategicMatchPercentage: number,
  instinctVsStrategyInsight: string,
  categoryScores: CategoryScore[],
  achievements: Achievement[],
  predictionScore: PredictionScore | undefined,
  totalScore: number,
  maxPossible: number,
  isPartial: boolean,
  interruptedReason?: string,
  gameMode = 'RANDOM',
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun',
  leftBy?: 'host' | 'guest' | 'both',
  leftAt?: number
): Promise<FinalReport> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const historySummary = history.map((item) => {
    const p1 = item.hostChoice ?? 'No answer';
    const p2 = item.guestChoice ?? 'No answer';
    const predNote = item.hostPrediction || item.guestPrediction
      ? ` | Predictions: ${hostName} predicted "${item.hostPrediction || '—'}" (${item.hostPredictionResult || '—'}), ${guestName} predicted "${item.guestPrediction || '—'}" (${item.guestPredictionResult || '—'})`
      : '';
    return `Round ${item.roundNumber} [${item.category}] [Format: ${item.format || 'SITUATIONAL'}] (${item.roundType || 'NORMAL'}): "${item.question}". ${hostName}: "${p1}", ${guestName}: "${p2}". Result: ${item.result}${predNote}`;
  }).join('\n');

  const catSummary = categoryScores.map(c => `- ${c.category}: ${c.matchPercentage}% (${c.matchedQuestions}/${c.totalQuestions})`).join('\n');
  const achSummary = achievements.map(a => `- ${a.title}: ${a.description}`).join('\n');

  const prompt = `You are the clever, witty entertainment insight engine for THIS ⚡ THAT, an India-first multiplayer social game.
Player 1: ${hostName}
Player 2: ${guestName}
Game Status: ${isPartial ? `PARTIAL (${totalCompleted} of ${totalRounds} rounds actually answered before game stopped)` : `COMPLETE (${totalCompleted} of ${totalRounds} rounds completed)`}
Overall Match Rate: ${matchPercentage}% (${matches} of ${totalCompleted} matched) | Score: ${totalScore}/${maxPossible}
Instinct Match (Quick Choices): ${instinctMatchPercentage}%
Strategic Match (Situational Dilemmas): ${strategicMatchPercentage}%
Requested Tone: ${aiTone.toUpperCase()} (Nice = wholesome, Fun = witty friend, Brutal = playfully sharp & roasted with zero mercy).

Category Match Rates:
${catSummary || 'None'}

Achievements Earned:
${achSummary || 'None'}

Mind Reader Prediction Score:
${predictionScore ? predictionScore.summary : 'No prediction rounds played.'}

Detailed Round Answers:
${historySummary}

CRITICAL RULES:
1. Make them say: "BRO... HOW DID THIS GAME KNOW THAT? 😂".
2. Compare their Quick Instinct vs Situational Strategy choices with humor.
3. GROUND EVERY OBSERVATION in their actual answers.
${isPartial ? `4. STRICT GROUNDING: Since this game ended early after ${totalCompleted} rounds, only base insights on the ${totalCompleted} rounds answered. Use phrases like "Based on the ${totalCompleted} rounds you actually answered...", "Your answers suggest...", "Your choices indicate...". Do NOT invent answers or assume unplayed rounds.` : '4. Catch hilarious contradictions.'}
5. Return JSON ONLY matching this structure:

{
  "headline": "A short, punchy witty headline in CAPS",
  "overallVibe": "A 2-4 word vibe tag",
  "matchPercentage": ${matchPercentage},
  "instinctMatchPercentage": ${instinctMatchPercentage},
  "strategicMatchPercentage": ${strategicMatchPercentage},
  "instinctVsStrategyInsight": "1-2 sentence witty observation comparing fast instincts vs situational choices",
  "completedQuestions": ${totalCompleted},
  "totalQuestions": ${totalRounds},
  "totalScore": ${totalScore},
  "maxPossibleScore": ${maxPossible},
  "categoryScores": [
    ${categoryScores.map(c => `{"category": "${c.category}", "matchPercentage": ${c.matchPercentage}, "totalQuestions": ${c.totalQuestions}, "matchedQuestions": ${c.matchedQuestions}}`).join(', ')}
  ],
  "strongestMatches": ["2-3 specific areas where their choices were in sync"],
  "biggestDifferences": ["2-3 specific topics where their instincts clashed"],
  "surprisingPatterns": ["1-2 surprising grounded observations from their answer combinations"],
  "contradictions": ["1 funny contradiction detected between their choices, if any"],
  "funniestDifference": "A 1-2 sentence witty observation about their most hilarious disagreement",
  "mostUnexpectedMatch": "A 1-2 sentence highlight about an unexpected choice they both picked",
  "sharedTendencies": ["2 playful insights about what they have in common"],
  "conversationStarters": ["2 fun provocative questions they should debate right now"],
  "player1Insight": "A playful 1-sentence persona for ${hostName} based on their choices",
  "player2Insight": "A playful 1-sentence persona for ${guestName} based on their choices",
  "finalVerdict": "A 2-3 sentence fun conclusion celebrating their dynamic."
}`;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: aiTone === 'brutal' ? 0.95 : 0.85,
          maxOutputTokens: 1400,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = extractJson(text);

      return {
        headline: String(parsed.headline || 'SAME BRAIN, DIFFERENT CHAOS').trim(),
        overallVibe: String(parsed.overallVibe || 'Cosmic Sync').trim(),
        matchPercentage,
        instinctMatchPercentage,
        strategicMatchPercentage,
        instinctVsStrategyInsight: String(parsed.instinctVsStrategyInsight || instinctVsStrategyInsight),
        completedQuestions: totalCompleted,
        totalQuestions: totalRounds,
        totalScore,
        maxPossibleScore: maxPossible,
        categoryScores: Array.isArray(parsed.categoryScores) && parsed.categoryScores.length > 0
          ? parsed.categoryScores
          : categoryScores,
        achievements,
        predictionScore,
        strongestMatches: Array.isArray(parsed.strongestMatches) && parsed.strongestMatches.length > 0
          ? parsed.strongestMatches.map(String)
          : ['Food & Chai', 'Cinema Preferences'],
        biggestDifferences: Array.isArray(parsed.biggestDifferences) && parsed.biggestDifferences.length > 0
          ? parsed.biggestDifferences.map(String)
          : ['Travel Planning', 'Digital Habits'],
        surprisingPatterns: Array.isArray(parsed.surprisingPatterns)
          ? parsed.surprisingPatterns.map(String)
          : [`You matched ${matchPercentage}% overall, showing uncanny alignment on core priorities.`],
        contradictions: Array.isArray(parsed.contradictions)
          ? parsed.contradictions.map(String)
          : [],
        funniestDifference: String(parsed.funniestDifference || 'One plans every second while the other believes in pure improvisation! 😂'),
        mostUnexpectedMatch: String(parsed.mostUnexpectedMatch || 'You both locked in the exact same wild choice without hesitation!'),
        sharedTendencies: Array.isArray(parsed.sharedTendencies) && parsed.sharedTendencies.length > 0
          ? parsed.sharedTendencies.map(String)
          : ['You both value good food and comfort', 'Spontaneous plans resonate with both of you'],
        conversationStarters: Array.isArray(parsed.conversationStarters) && parsed.conversationStarters.length > 0
          ? parsed.conversationStarters.map(String)
          : ['Who actually decides where to eat when you hang out?', 'Would your road trip survive without GPS?'],
        player1Insight: String(parsed.player1Insight || parsed.player1Profile || `${hostName} made decisive, instinct-driven choices.`),
        player2Insight: String(parsed.player2Insight || parsed.player2Profile || `${guestName} brought independent flavor and sharp preferences.`),
        player1Profile: String(parsed.player1Insight || parsed.player1Profile || `${hostName} made decisive, instinct-driven choices.`),
        player2Profile: String(parsed.player2Insight || parsed.player2Profile || `${guestName} brought independent flavor and sharp preferences.`),
        finalVerdict: String(parsed.finalVerdict || `You scored ${matchPercentage}% synchronization! Whether you are cosmic twins or entertaining opposites, your dynamic makes every decision an adventure.`),
        isPartial,
        interruptedReason,
        leftBy,
        leftAt,
        gameMode,
        aiTone,
        generatedAt: Date.now(),
      };
    } catch {
      continue;
    }
  }

  throw new Error('Gemini analysis model failover exhausted');
}

// ---- Local Fallback Report Engine ----

function generateLocalFallbackReport(
  history: RoundHistoryItem[],
  hostName: string,
  guestName: string,
  matches: number,
  totalCompleted: number,
  totalRounds: number,
  matchPercentage: number,
  instinctMatchPercentage: number,
  strategicMatchPercentage: number,
  instinctVsStrategyInsight: string,
  categoryScores: CategoryScore[],
  achievements: Achievement[],
  predictionScore: PredictionScore | undefined,
  totalScore: number,
  maxPossible: number,
  isPartial: boolean,
  interruptedReason?: string,
  gameMode = 'RANDOM',
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun',
  leftBy?: 'host' | 'guest' | 'both',
  leftAt?: number
): FinalReport {
  let headline = 'SAME BRAIN, DIFFERENT CHAOS';
  let overallVibe = 'High Voltage Sync';
  let finalVerdict = isPartial
    ? `Based on the ${totalCompleted} rounds you actually answered, you scored ${matchPercentage}% compatibility (${matches}/${totalCompleted} matches). Your dynamic makes every choice an adventure!`
    : `${hostName} and ${guestName} achieved a ${matchPercentage}% synchronization score! Whether locking in on chai or debating wild superpowers, your dynamic is peak entertainment.`;

  if (matchPercentage >= 80) {
    headline = '⚡ CERTIFIED TWIN MINDS';
    overallVibe = 'Cosmic Telepathy';
    finalVerdict = isPartial
      ? `Based on the ${totalCompleted} rounds answered, you scored an uncanny ${matchPercentage}% telepathic match! You two are operating on the exact same frequency.`
      : `Uncanny ${matchPercentage}% synchronization! ${hostName} and ${guestName} are operating on the exact same frequency.`;
  } else if (matchPercentage >= 60) {
    headline = '🔥 BALANCED SQUAD ENERGY';
    overallVibe = 'Harmonious Vibes';
    finalVerdict = isPartial
      ? `Based on the ${totalCompleted} rounds answered, you achieved a strong ${matchPercentage}% sync rate! You agree on what matters while keeping distinct flavors.`
      : `At ${matchPercentage}% sync, you agree on what matters most while keeping enough different flavor to never get bored.`;
  } else if (matchPercentage <= 35) {
    headline = '💀 COMPLETE ENTERTAINING OPPOSITES';
    overallVibe = 'Opposite Poles';
    finalVerdict = isPartial
      ? `Based on the ${totalCompleted} rounds answered, you scored ${matchPercentage}% agreement! You two inhabit parallel universes, which guarantees endless debates.`
      : `Only ${matchPercentage}% agreement! You two inhabit parallel universes, which guarantees zero silence and endless debates.`;
  }

  const matchedItems = history.filter(h => h.result === 'MATCH');
  const diffItems = history.filter(h => h.result === 'NO_MATCH');

  const strongestMatches = matchedItems.slice(0, 3).map(m => m.question || m.category);
  const biggestDifferences = diffItems.slice(0, 3).map(d => d.question || d.category);

  return {
    headline,
    overallVibe,
    matchPercentage,
    instinctMatchPercentage,
    strategicMatchPercentage,
    instinctVsStrategyInsight,
    completedQuestions: totalCompleted,
    totalQuestions: totalRounds,
    totalScore,
    maxPossibleScore: maxPossible,
    categoryScores,
    achievements,
    predictionScore,
    strongestMatches: strongestMatches.length > 0 ? strongestMatches : ['Food & Chai', 'Cinema Preferences'],
    biggestDifferences: biggestDifferences.length > 0 ? biggestDifferences : ['Travel Planning', 'Digital Habits'],
    surprisingPatterns: [
      `Completed ${totalCompleted} rounds with ${matches} direct hits.`,
      instinctVsStrategyInsight,
    ],
    contradictions: [],
    funniestDifference: diffItems.length > 0
      ? `You clashed directly on "${diffItems[0].question}" — two distinct philosophies! 😂`
      : 'You barely disagreed on anything!',
    mostUnexpectedMatch: matchedItems.length > 0
      ? `Both locked in "${matchedItems[0].hostChoice}" without hesitation!`
      : 'Every round was a brand new revelation.',
    sharedTendencies: [
      `${hostName} and ${guestName} share a love for good food and comfort.`,
      `Both value humor and fast decisions over endless overthinking.`,
    ],
    conversationStarters: [
      `Would your road trip survive without Google Maps?`,
      `Who actually decides the restaurant when you hang out?`,
    ],
    player1Insight: `${hostName} made sharp, instinct-driven choices.`,
    player2Insight: `${guestName} brought independent taste and decisive energy.`,
    player1Profile: `${hostName} made sharp, instinct-driven choices.`,
    player2Profile: `${guestName} brought independent taste and decisive energy.`,
    finalVerdict,
    isPartial,
    interruptedReason,
    leftBy,
    leftAt,
    gameMode,
    aiTone,
    generatedAt: Date.now(),
  };
}
