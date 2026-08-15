// ============================================================
// AI Question & Final Analysis Service — Google Gemini & OpenAI (V4)
// Dynamic 30+ Genres, Predictions, Chaos, Achievements, Tone Modes
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
} from './types';
import { getFallbackQuestion, getRoundTypeForRound } from './fallbackQuestions';

const QUESTION_SYSTEM_PROMPT = `You are the viral question design engine for THIS ⚡ THAT, a multiplayer social game designed for a broad Indian audience (Metros, Tier-2, Tier-3 cities across North, South, East, West).

CORE PRINCIPLE: QUESTION QUALITY > QUANTITY.
Every question must make players think: "Bro, this is actually difficult 😂" or "Wait... what will they pick?!".
Avoid boring generic word pairs like "Tea or coffee?" or "Beach or mountains?".
Instead, ALWAYS create relatable SITUATIONS & DILEMMAS where both choices are tempting!

CATEGORIES TO DYNAMICALLY MIX:
1. Food & Chai (comfort food vs fancy dining, late-night Swiggy, biryani vs pizza, street food rules)
2. Indian Everyday Life (late friend with chai, 5 min rule, UPI processing panic, family functions)
3. Bollywood & Regional Cinema (family movie pick, biopic comedy vs drama, theatre front row vs middle)
4. Cricket & Sports (last over stress, match banter, stadium vs sofa)
5. Public Life & Culture (hosting podcast with Modi vs Rahul Gandhi, watching interview vs skipping to viral clips, asking leader non-political questions)
6. Digital & Memes (3-min voice note vs "text kar", 2 AM meme replies, Instagram reels spiral)
7. Money & Career (₹10k unexpected bonus, 60-hr work vs 4-day week, startup risk vs 9-to-5)
8. Friendship & Relationships (best friend moving away, crush reply delay, splitting bills)
9. Crazy & Superpowers (superpower only in India, ₹10 crore with 1% battery, deleting traffic vs spam calls)
10. Childhood Nostalgia (school half-day, summer vacation memories)

RULES:
- Both options MUST be genuinely tempting and create playful disagreement.
- Keep options punchy, short (1-5 words max).
- Include a 1-sentence situational context in "scenario" (e.g. "Your friend arrives 45 mins late with chai:").
- Never ask divisive political loyalty questions ("who is better leader?"). Keep public figures strictly playful.
- Return valid JSON ONLY:
{
  "category": "...",
  "subcategory": "...",
  "scenario": "...",
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
  roundType: RoundType = 'NORMAL',
  gameMode = 'RANDOM'
): Promise<Question> {
  const genAI = new GoogleGenerativeAI(apiKey);

  let themeGuidance = 'Dynamic Indian cultural dilemma or situational quirk';
  if (roundType === 'CHAOS') {
    themeGuidance = 'Absurd, crazy superpower dilemmas or high-stakes deals (e.g. ₹10 crore with 1% battery, teleportation vs pausing traffic)';
  } else if (roundType === 'PREDICTION') {
    themeGuidance = 'Revealing social quirks, digital habits (WhatsApp/UPI/Crushes), or friendship dilemmas where guessing opponent choice is hilarious';
  } else if (roundType === 'DOUBLE_POINTS') {
    themeGuidance = 'High-stakes lifestyle, career vs freedom choices, or core relationship dilemmas';
  } else if (gameMode === 'FOOD') {
    themeGuidance = 'Indian street food, sweets, regional breakfast, late-night chai/Maggi dilemmas';
  } else if (gameMode === 'ENTERTAINMENT') {
    themeGuidance = 'Bollywood, regional cinema, cricket thrillers, viral memes, music vibes';
  } else if (roundNumber <= 4) {
    themeGuidance = 'Low-pressure, relatable Indian everyday situational warm-up';
  }

  const recentList = recentQuestions.slice(-15).join(', ');
  const recentCatList = recentCategories.slice(-3).join(', ');

  const prompt = `Generate one high-quality, situational India-first choice pair.
Round number: ${roundNumber} of 20.
Round Type: ${roundType}.
Theme focus: ${themeGuidance}.
Mode: ${gameMode}.
Recently used categories (avoid repeating last): ${recentCatList || 'none'}.
Recently used choices (do NOT repeat): ${recentList || 'none yet'}.
Return JSON only:
{"category":"...","subcategory":"...","scenario":"...","optionA":"...","optionB":"..."}`;

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
          scenario: parsed.scenario?.trim(),
          optionA: parsed.optionA.trim(),
          optionB: parsed.optionB.trim(),
          roundType,
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
  const catScores = computeCategoryScores(history);

  // 1. Same Brain
  if (matchPercentage >= 75) {
    achievements.push({
      id: 'same_brain',
      title: '⚡ SAME BRAIN',
      icon: '⚡',
      description: `Incredible ${matchPercentage}% overall telepathic synchronization!`,
      unlockedFor: 'both',
    });
  }

  // 2. Complete Opposites
  if (matchPercentage <= 40 && history.length >= 5) {
    achievements.push({
      id: 'opposites',
      title: '💀 COMPLETE OPPOSITES',
      icon: '💀',
      description: 'Zero common logic, pure entertaining chaos duo.',
      unlockedFor: 'both',
    });
  }

  // 3. Mind Reader
  if (predictionScore && (predictionScore.hostCorrect >= 2 || predictionScore.guestCorrect >= 2)) {
    const leader = predictionScore.hostCorrect >= predictionScore.guestCorrect
      ? predictionScore.hostName
      : predictionScore.guestName;
    achievements.push({
      id: 'mind_reader',
      title: '🧠 MIND READER',
      icon: '🧠',
      description: `${leader} nailed mind reading predictions like a psychic!`,
      unlockedFor: 'both',
    });
  }

  // 4. Food Soulmates
  const foodScore = catScores.find(c => c.category.toLowerCase().includes('food'));
  if (foodScore && foodScore.matchPercentage >= 75 && foodScore.totalQuestions >= 2) {
    achievements.push({
      id: 'food_soulmates',
      title: '🍜 FOOD SOULMATES',
      icon: '🍜',
      description: `${foodScore.matchPercentage}% agreement on street food, chai, and dinner tastes.`,
      unlockedFor: 'both',
    });
  }

  // 5. Cinema Twins
  const cinemaScore = catScores.find(c => c.category.toLowerCase().includes('cinema') || c.category.toLowerCase().includes('bollywood'));
  if (cinemaScore && cinemaScore.matchPercentage >= 75) {
    achievements.push({
      id: 'cinema_twins',
      title: '🎬 CINEMA TWINS',
      icon: '🎬',
      description: `${cinemaScore.matchPercentage}% sync on Bollywood, movies, and entertainment.`,
      unlockedFor: 'both',
    });
  }

  // 6. Chaos Partners
  const chaosMatches = history.filter(h => h.roundType === 'CHAOS' && h.result === 'MATCH');
  if (chaosMatches.length > 0) {
    achievements.push({
      id: 'chaos_partners',
      title: '😂 CHAOS PARTNERS',
      icon: '😂',
      description: 'Matched on wild, absurd superpower dilemmas without hesitation.',
      unlockedFor: 'both',
    });
  }

  // 7. Travel Twins
  const travelScore = catScores.find(c => c.category.toLowerCase().includes('travel'));
  if (travelScore && travelScore.matchPercentage >= 75) {
    achievements.push({
      id: 'travel_twins',
      title: '✈️ TRAVEL TWINS',
      icon: '✈️',
      description: 'Ready to pack bags on the exact same holiday wavelength.',
      unlockedFor: 'both',
    });
  }

  // 8. Cricket Connection
  const cricketScore = catScores.find(c => c.category.toLowerCase().includes('cricket'));
  if (cricketScore && cricketScore.matchPercentage >= 75) {
    achievements.push({
      id: 'cricket_connection',
      title: '🏏 CRICKET CONNECTION',
      icon: '🏏',
      description: 'Unified cricket watching & match thriller philosophy.',
      unlockedFor: 'both',
    });
  }

  // Ensure at least 2 fun achievements are awarded
  if (achievements.length < 2) {
    achievements.push({
      id: 'plot_twist',
      title: '🌀 PLOT TWIST',
      icon: '🌀',
      description: 'Surprised each other with wildly unpredictable answer combinations.',
      unlockedFor: 'both',
    });
  }

  return achievements.slice(0, 4);
}

// ============================================================
// Live Game Reaction Engine
// ============================================================

export function generateLiveReaction(
  isMatch: boolean,
  streak: number,
  roundType: RoundType,
  hostPredictionCorrect?: boolean,
  guestPredictionCorrect?: boolean
): string {
  if (roundType === 'PREDICTION') {
    if (hostPredictionCorrect && guestPredictionCorrect) {
      return '🎯 DOUBLE MIND READERS! Both predicted each other accurately!';
    }
    if (hostPredictionCorrect || guestPredictionCorrect) {
      return '🎯 MIND READER! One of you guessed the other’s mind!';
    }
    return '❌ YOU THOUGHT YOU KNEW THEM 😂';
  }

  if (roundType === 'CHAOS' && isMatch) {
    return '😂 CHAOS HARMONY! How on earth did you both pick that?!';
  }

  if (roundType === 'DOUBLE_POINTS' && isMatch) {
    return '🔥 DOUBLE POINTS SECURED! +2 To Score!';
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

  // Mismatch
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
// Final AI Game Analysis Engine (V4)
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
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun'
): Promise<FinalReport> {
  const matchPercentage = totalCompleted > 0 ? Math.round((matches / totalCompleted) * 100) : 0;
  const categoryScores = computeCategoryScores(history);
  const predictionScore = computePredictionScore(history, hostName, guestName);
  const achievements = computeAchievements(history, matchPercentage, predictionScore);

  const totalScore = history.reduce((acc, h) => acc + (h.pointsAwarded || (h.result === 'MATCH' ? 1 : 0)), 0);
  const maxPossible = history.reduce((acc, h) => acc + (h.roundType === 'DOUBLE_POINTS' ? 2 : 1), 0);

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'your_gemini_key_here') {
    try {
      const report = await generateReportWithGemini(
        geminiKey,
        history,
        hostName,
        guestName,
        matches,
        totalCompleted,
        totalRounds,
        matchPercentage,
        categoryScores,
        achievements,
        predictionScore,
        totalScore,
        maxPossible,
        isPartial,
        interruptedReason,
        gameMode,
        aiTone
      );
      console.log(`[AI:Gemini] ✨ Generated V4 Report: "${report.headline}" (${report.matchPercentage}% match) [Tone: ${aiTone}]`);
      return report;
    } catch (err) {
      console.error('[AI:Gemini] Final report fallback:', err);
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
    categoryScores,
    achievements,
    predictionScore,
    totalScore,
    maxPossible,
    isPartial,
    interruptedReason,
    gameMode,
    aiTone
  );
}

async function generateReportWithGemini(
  apiKey: string,
  history: RoundHistoryItem[],
  hostName: string,
  guestName: string,
  matches: number,
  totalCompleted: number,
  totalRounds: number,
  matchPercentage: number,
  categoryScores: CategoryScore[],
  achievements: Achievement[],
  predictionScore: PredictionScore | undefined,
  totalScore: number,
  maxPossible: number,
  isPartial: boolean,
  interruptedReason?: string,
  gameMode = 'RANDOM',
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun'
): Promise<FinalReport> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const historySummary = history.map((item) => {
    const p1 = item.hostChoice ?? 'No answer';
    const p2 = item.guestChoice ?? 'No answer';
    const predNote = item.hostPrediction || item.guestPrediction
      ? ` | Predictions: ${hostName} predicted "${item.hostPrediction || '—'}" (${item.hostPredictionResult || '—'}), ${guestName} predicted "${item.guestPrediction || '—'}" (${item.guestPredictionResult || '—'})`
      : '';
    return `Round ${item.roundNumber} [${item.category}] (${item.roundType || 'NORMAL'}): "${item.question}". ${hostName}: "${p1}", ${guestName}: "${p2}". Result: ${item.result}${predNote}`;
  }).join('\n');

  const catSummary = categoryScores.map(c => `- ${c.category}: ${c.matchPercentage}% (${c.matchedQuestions}/${c.totalQuestions})`).join('\n');
  const achSummary = achievements.map(a => `- ${a.title}: ${a.description}`).join('\n');

  const prompt = `You are the clever, witty entertainment insight engine for THIS ⚡ THAT, an India-first multiplayer social game.
Player 1: ${hostName}
Player 2: ${guestName}
Game Status: ${isPartial ? `PARTIAL (${totalCompleted} of ${totalRounds} rounds completed)` : `COMPLETE (${totalCompleted} of ${totalRounds} rounds completed)`}
Overall Match Rate: ${matchPercentage}% (${matches} of ${totalCompleted} matched) | Score: ${totalScore}/${maxPossible}
Requested Tone: ${aiTone.toUpperCase()} (Nice = wholesome, Fun = witty friend, Brutal = playfully sharp & roasted with zero mercy, but NEVER abusive or clinically diagnosing).

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
2. GROUND EVERY OBSERVATION in their actual answers above. No generic horoscope fluff.
3. Catch hilarious contradictions (e.g. Save money vs Luxury trip, Early riser vs 2 AM reels).
4. Tone should be sharp, witty, and grounded. Never clinical, medical, or diagnostic.
5. Return JSON ONLY matching this structure:

{
  "headline": "A short, punchy witty headline in CAPS",
  "overallVibe": "A 2-4 word vibe tag",
  "matchPercentage": ${matchPercentage},
  "completedQuestions": ${totalCompleted},
  "totalQuestions": ${totalRounds},
  "totalScore": ${totalScore},
  "maxPossibleScore": ${maxPossible},
  "categoryScores": [
    ${categoryScores.map(c => `{"category": "${c.category}", "matchPercentage": ${c.matchPercentage}, "totalQuestions": ${c.totalQuestions}, "matchedQuestions": ${c.matchedQuestions}}`).join(', ')}
  ],
  "strongestMatches": ["2-3 specific areas where their choices were 100% in sync"],
  "biggestDifferences": ["2-3 specific topics where their instincts clashed"],
  "surprisingPatterns": ["1-2 surprising grounded observations from their answer combinations"],
  "contradictions": ["1 funny contradiction detected between their choices, if any"],
  "funniestDifference": "A 1-2 sentence witty observation about their most hilarious disagreement",
  "mostUnexpectedMatch": "A 1-2 sentence highlight about an unexpected or quirky choice they both picked",
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
  categoryScores: CategoryScore[],
  achievements: Achievement[],
  predictionScore: PredictionScore | undefined,
  totalScore: number,
  maxPossible: number,
  isPartial: boolean,
  interruptedReason?: string,
  gameMode = 'RANDOM',
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun'
): FinalReport {
  const matchingItems = history.filter((h) => h.result === 'MATCH');
  const differingItems = history.filter((h) => h.result === 'NO_MATCH');

  const topMatchCats = categoryScores.filter(c => c.matchPercentage >= 60).map(c => c.category);
  const topDiffCats = categoryScores.filter(c => c.matchPercentage < 60).map(c => c.category);

  let headline = 'SAME BRAIN, DIFFERENT CHAOS';
  let overallVibe = 'Dynamic Duo';

  if (matchPercentage >= 80) {
    headline = 'TELEPATHIC CONNECTION ⚡';
    overallVibe = 'Mind Melded';
  } else if (matchPercentage >= 60) {
    headline = 'SAME BRAIN, DIFFERENT CHAOS';
    overallVibe = 'High Voltage Sync';
  } else if (matchPercentage >= 40) {
    headline = 'BALANCED OPPOSITES ⚡';
    overallVibe = 'Yin & Yang';
  } else {
    headline = 'CHAOTIC OPPOSITE ENERGY';
    overallVibe = 'Wildly Different';
  }

  const sampleMatch = matchingItems[0]
    ? `You both picked "${matchingItems[0].hostChoice}" on ${matchingItems[0].category}!`
    : 'You found surprising moments of agreement throughout the game.';

  const sampleDiff = differingItems[0]
    ? `${hostName} chose "${differingItems[0].hostChoice ?? '—'}" while ${guestName} picked "${differingItems[0].guestChoice ?? '—'}"!`
    : 'You agreed on almost everything!';

  const surprises: string[] = [];
  if (topMatchCats.length > 0 && topDiffCats.length > 0) {
    surprises.push(`You two think almost identically when it comes to ${topMatchCats[0]}, but have completely opposite instincts on ${topDiffCats[0]}.`);
  } else {
    surprises.push(`Your match percentage remained remarkably consistent across opening rounds and deeper choices.`);
  }

  const p1Insight = `${hostName} went with bold, instinct-driven choices throughout the game.`;
  const p2Insight = `${guestName} showcased strong independent taste and clear preferences.`;

  return {
    headline,
    overallVibe,
    matchPercentage,
    completedQuestions: totalCompleted,
    totalQuestions: totalRounds,
    totalScore,
    maxPossibleScore: maxPossible,
    categoryScores,
    achievements,
    predictionScore,
    strongestMatches: topMatchCats.length > 0 ? topMatchCats.map((c) => `100% in sync on ${c}`) : ['Shared core instincts', 'Common tastes'],
    biggestDifferences: topDiffCats.length > 0 ? topDiffCats.map((c) => `Clashing instincts on ${c}`) : ['Subtle lifestyle preferences'],
    surprisingPatterns: surprises,
    contradictions: [],
    funniestDifference: sampleDiff,
    mostUnexpectedMatch: sampleMatch,
    sharedTendencies: [
      `You agreed on ${matches} out of ${totalCompleted} rounds played`,
      matchingItems.length > 0 ? `Strong mutual alignment on ${topMatchCats.join(', ') || 'everyday choices'}` : 'You both bring unique perspectives to the table',
    ],
    conversationStarters: [
      differingItems[0] ? `Would you ever compromise on ${differingItems[0].category}?` : 'What is one topic where you will never agree?',
      'Who is more likely to give in first during a friendly argument?',
    ],
    player1Insight: p1Insight,
    player2Insight: p2Insight,
    player1Profile: p1Insight,
    player2Profile: p2Insight,
    finalVerdict: `You reached a ${matchPercentage}% match rate across ${totalCompleted} rounds! Whether you are cosmic twins or entertaining opposites, your dynamic makes every decision an adventure.`,
    isPartial,
    interruptedReason,
    gameMode,
    aiTone,
    generatedAt: Date.now(),
  };
}
