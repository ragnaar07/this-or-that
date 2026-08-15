// ============================================================
// AI Question & Final Analysis Service — Google Gemini & OpenAI
// India-First entertainment insight engine with Section 23 schema
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { Question, RoundHistoryItem, FinalReport, CategoryScore } from './types';
import { getFallbackQuestion } from './fallbackQuestions';

const QUESTION_SYSTEM_PROMPT = `You are generating content for THIS ⚡ THAT, a multiplayer preference game primarily designed for a broad Indian audience across metros, tier-2 cities and tier-3 cities.

India is culturally, linguistically, regionally and economically diverse.
Do not assume all Indian users share one culture, religion, language, cuisine, lifestyle or socioeconomic background.
Questions should feel naturally relatable to modern Indian life while remaining inclusive across regions.

Use Indian contexts when useful:
food, chai, street food, weddings, family functions, festivals, cricket, Bollywood, regional cinema, OTT, WhatsApp, UPI, Indian travel, trains, metros, traffic, college, office life, roommates, online shopping, food delivery, Indian social situations and everyday habits.

Mix universal questions with India-specific situations.
Avoid stereotypes.
Do not infer religion, caste, political affiliation, income, sexual orientation, medical conditions or other sensitive attributes.
The goal is entertainment and observable preference patterns, not psychological diagnosis.

Generate ONE pair of short choices per request.
Each option MUST be short (1–4 words max), punchy, and instantly understandable.
Return ONLY valid JSON: {"category": "...", "optionA": "...", "optionB": "..."}`;

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

// Available Gemini models in priority order
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

// ---- Question Generation ----

async function generateQuestionWithGemini(
  apiKey: string,
  recentQuestions: string[],
  roundNumber = 1
): Promise<Question> {
  const genAI = new GoogleGenerativeAI(apiKey);

  let targetTheme = 'Everyday Indian life or Food & Chai (low pressure, fun)';
  if (roundNumber > 5 && roundNumber <= 10) {
    targetTheme = 'Indian social situations, digital habits (WhatsApp, UPI, reels), or entertainment (OTT, cinema, cricket)';
  } else if (roundNumber > 10 && roundNumber <= 15) {
    targetTheme = 'Indian lifestyle, PG/office life, travel (Goa vs mountains, trains), or money & ambition';
  } else if (roundNumber > 15) {
    targetTheme = 'Friendship & love dynamics, crazy scenarios, or unexpected superpowers';
  }

  const recentList = recentQuestions.slice(-15).join(', ');
  const prompt = `Generate one fun India-first "this or that" choice pair.
Round number: ${roundNumber} of 20 (Target theme: ${targetTheme}).
Keep each option short (1-4 words max).
Recently used (do NOT repeat): ${recentList || 'none yet'}.
Return JSON only: {"category":"...","optionA":"...","optionB":"..."}`;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.95,
          maxOutputTokens: 400,
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
          optionA: parsed.optionA.trim(),
          optionB: parsed.optionB.trim(),
        };
      }
    } catch {
      // try next model
      continue;
    }
  }

  throw new Error('All Gemini model question generation attempts failed');
}

async function generateQuestionWithOpenAI(
  apiKey: string,
  recentQuestions: string[],
  roundNumber = 1
): Promise<Question> {
  const openai = new OpenAI({ apiKey });
  const recentList = recentQuestions.slice(-15).join(', ');
  const userPrompt = `Generate one fun India-first "this or that" choice pair for round ${roundNumber} of 20.
Keep each option short (1-4 words max).
Recently used (avoid repeating): ${recentList || 'none yet'}.
Return JSON only: {"category":"...","optionA":"...","optionB":"..."}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: QUESTION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 150,
    temperature: 0.95,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content ?? '';
  const parsed = extractJson(content);

  if (
    typeof parsed.category === 'string' &&
    typeof parsed.optionA === 'string' &&
    typeof parsed.optionB === 'string' &&
    parsed.optionA.trim().length > 0 &&
    parsed.optionB.trim().length > 0
  ) {
    return {
      category: parsed.category.trim(),
      optionA: parsed.optionA.trim(),
      optionB: parsed.optionB.trim(),
    };
  }

  throw new Error('Invalid OpenAI question structure');
}

export async function generateQuestion(recentQuestions: string[], roundNumber = 1): Promise<Question> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey !== 'your_gemini_key_here') {
    try {
      const q = await generateQuestionWithGemini(geminiKey, recentQuestions, roundNumber);
      return q;
    } catch (err) {
      console.warn('[AI:Gemini] Question generation fallback:', err instanceof Error ? err.message : err);
    }
  }

  if (openAiKey && openAiKey.startsWith('sk-')) {
    try {
      const q = await generateQuestionWithOpenAI(openAiKey, recentQuestions, roundNumber);
      return q;
    } catch (err) {
      console.warn('[AI:OpenAI] Question generation fallback:', err instanceof Error ? err.message : err);
    }
  }

  return getFallbackQuestion(recentQuestions, roundNumber);
}

// ============================================================
// Category Analysis & Grounded Pattern Calculator
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
    scores.push({ category, matchPercentage });
  }

  // Sort by total questions in category descending
  return scores;
}

// ============================================================
// Final AI Game Analysis Engine
// Analyzes all rounds and generates a witty, shared report
// ============================================================

export async function generateFinalReport(
  history: RoundHistoryItem[],
  hostName: string,
  guestName: string,
  matches: number,
  totalCompleted: number,
  totalRounds: number,
  isPartial: boolean,
  interruptedReason?: string
): Promise<FinalReport> {
  const matchPercentage = totalCompleted > 0 ? Math.round((matches / totalCompleted) * 100) : 0;
  const categoryScores = computeCategoryScores(history);

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
        isPartial,
        interruptedReason
      );
      console.log(`[AI:Gemini] ✨ Generated Final Report: "${report.headline}" (${report.matchPercentage}% match)`);
      return report;
    } catch (err) {
      console.error('[AI:Gemini] Final report generation failed, using local fallback:', err);
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
    isPartial,
    interruptedReason
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
  isPartial: boolean,
  interruptedReason?: string
): Promise<FinalReport> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const historySummary = history.map((item) => {
    const p1 = item.hostChoice ?? 'No answer';
    const p2 = item.guestChoice ?? 'No answer';
    return `Round ${item.roundNumber} [${item.category}]: Question: "${item.question}". ${hostName} chose "${p1}", ${guestName} chose "${p2}". Result: ${item.result}`;
  }).join('\n');

  const catScoreSummary = categoryScores
    .map((c) => `- ${c.category}: ${c.matchPercentage}% match`)
    .join('\n');

  const prompt = `You are the clever, witty entertainment insight engine for THIS ⚡ THAT, a multiplayer game for Indian users.
Player 1: ${hostName}
Player 2: ${guestName}
Game Status: ${isPartial ? `PARTIAL GAME (${totalCompleted} of ${totalRounds} questions answered before someone left)` : `COMPLETE GAME (${totalCompleted} of ${totalRounds} questions answered)`}
Overall Match Rate: ${matchPercentage}% (${matches} of ${totalCompleted} matched)

Category Breakdown:
${catScoreSummary || 'None'}

Detailed Round History:
${historySummary || 'No rounds answered.'}

PRODUCT VISION & RULES:
1. Make them say "BRO... HOW DID THIS GAME KNOW THAT? 😂" by finding genuine patterns, surprises, and subtle contradictions in their actual answers.
2. The AI is a clever, witty friend — NOT an academic, clinical psychologist, or robot.
3. GROUND EVERY OBSERVATION in the actual choices above. Never invent facts. Never claim psychological diagnoses or trauma.
4. If they had contradictions (e.g. choosing to save money but picking luxury trips, or late-night food vs morning routine), point it out playfully!
5. Mention their category differences (e.g. "Same person when it comes to food, but completely opposite on travel!").
6. Return ONLY valid JSON matching this exact structure:

{
  "headline": "A short, punchy, witty headline in CAPS (e.g. 'SAME BRAIN, DIFFERENT CHAOS', 'ACCIDENTAL TELEPATHS', 'CHAOTIC OPPOSITES')",
  "overallVibe": "A 2-4 word vibe (e.g. 'Chaos Partners', 'Twin Telepaths', 'Yin & Yang')",
  "matchPercentage": ${matchPercentage},
  "completedQuestions": ${totalCompleted},
  "totalQuestions": ${totalRounds},
  "categoryScores": [
    ${categoryScores.map((c) => `{"category": "${c.category}", "matchPercentage": ${c.matchPercentage}}`).join(', ')}
  ],
  "strongestMatches": ["2-3 specific areas where their choices were 100% in sync"],
  "biggestDifferences": ["2-3 specific topics where their instincts clashed"],
  "surprisingPatterns": ["1-2 surprising grounded observations from their answer combinations"],
  "contradictions": ["1 funny contradiction detected between early and late choices, if any"],
  "funniestDifference": "A 1-2 sentence witty observation about their most hilarious disagreement",
  "mostUnexpectedMatch": "A 1-2 sentence highlight about a wild or quirky choice they both picked",
  "sharedTendencies": ["2 playful insights about what they have in common"],
  "conversationStarters": ["2 fun provocative questions they should debate right now based on their disagreements"],
  "player1Insight": "A playful 1-sentence persona for ${hostName} based on their choices",
  "player2Insight": "A playful 1-sentence persona for ${guestName} based on their choices",
  "finalVerdict": "A 2-3 sentence fun conclusion celebrating their dynamic."
}`;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.85,
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
        categoryScores: Array.isArray(parsed.categoryScores) && parsed.categoryScores.length > 0
          ? parsed.categoryScores
          : categoryScores,
        strongestMatches: Array.isArray(parsed.strongestMatches) && parsed.strongestMatches.length > 0
          ? parsed.strongestMatches.map(String)
          : ['Food & Chai', 'Travel Instincts'],
        biggestDifferences: Array.isArray(parsed.biggestDifferences) && parsed.biggestDifferences.length > 0
          ? parsed.biggestDifferences.map(String)
          : ['Weekend Planning', 'Digital Habits'],
        surprisingPatterns: Array.isArray(parsed.surprisingPatterns)
          ? parsed.surprisingPatterns.map(String)
          : [`You matched ${matchPercentage}% overall, but showed strong mutual alignment on key priorities.`],
        contradictions: Array.isArray(parsed.contradictions)
          ? parsed.contradictions.map(String)
          : [],
        funniestDifference: String(parsed.funniestDifference || 'One of you plans every second while the other believes in pure improvisation! 😂'),
        mostUnexpectedMatch: String(parsed.mostUnexpectedMatch || 'You both locked in the exact same wild choice without hesitation!'),
        sharedTendencies: Array.isArray(parsed.sharedTendencies) && parsed.sharedTendencies.length > 0
          ? parsed.sharedTendencies.map(String)
          : ['You both value comfort and good food', 'Spontaneous plans resonate with both of you'],
        conversationStarters: Array.isArray(parsed.conversationStarters) && parsed.conversationStarters.length > 0
          ? parsed.conversationStarters.map(String)
          : ['Who actually decides where to eat when you hang out?', 'Would your road trip survive without Google Maps?'],
        player1Insight: String(parsed.player1Insight || parsed.player1Profile || `${hostName} made bold, instinct-driven choices.`),
        player2Insight: String(parsed.player2Insight || parsed.player2Profile || `${guestName} brought distinct energy and unique flavor.`),
        player1Profile: String(parsed.player1Insight || parsed.player1Profile || `${hostName} made bold, instinct-driven choices.`),
        player2Profile: String(parsed.player2Insight || parsed.player2Profile || `${guestName} brought distinct energy and unique flavor.`),
        finalVerdict: String(parsed.finalVerdict || `You scored ${matchPercentage}% synchronization! Whether you match on everything or disagree on the fun stuff, your dynamic is certified gold.`),
        isPartial,
        interruptedReason,
        generatedAt: Date.now(),
      };
    } catch {
      continue;
    }
  }

  throw new Error('All Gemini report generation model attempts failed');
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
  isPartial: boolean,
  interruptedReason?: string
): FinalReport {
  const matchingItems = history.filter((h) => h.result === 'MATCH');
  const differingItems = history.filter((h) => h.result === 'NO_MATCH');

  // Category counts
  const matchCategories = matchingItems.map((h) => h.category);
  const diffCategories = differingItems.map((h) => h.category);

  const topMatchCats = [...new Set(matchCategories)].slice(0, 3);
  const topDiffCats = [...new Set(diffCategories)].slice(0, 3);

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
    ? `You both picked "${matchingItems[0].hostChoice}" on ${matchingItems[0].category} without hesitation!`
    : 'You found surprising moments of agreement throughout the game.';

  const sampleDiff = differingItems[0]
    ? `${hostName} chose "${differingItems[0].hostChoice ?? '—'}" while ${guestName} picked "${differingItems[0].guestChoice ?? '—'}"!`
    : 'You agreed on practically everything!';

  const surprises: string[] = [];
  if (topMatchCats.length > 0 && topDiffCats.length > 0) {
    surprises.push(`You two think almost identically when it comes to ${topMatchCats[0]}, but have completely opposite philosophies on ${topDiffCats[0]}.`);
  } else if (matchPercentage > 70) {
    surprises.push(`Your sync rate remained remarkably consistent from the easy opening rounds right through the deeper choices.`);
  } else {
    surprises.push(`You both approached the scenario questions with distinctly unique instincts.`);
  }

  const p1Insight = `${hostName} went with bold, instinct-driven choices throughout the game.`;
  const p2Insight = `${guestName} showcased strong independent taste and clear preferences.`;

  return {
    headline,
    overallVibe,
    matchPercentage,
    completedQuestions: totalCompleted,
    totalQuestions: totalRounds,
    categoryScores,
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
    generatedAt: Date.now(),
  };
}
