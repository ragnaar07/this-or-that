// ============================================================
// AI Question & Final Analysis Service — Google Gemini & OpenAI
// Generates questions and comprehensive shared post-game reports
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { Question, RoundHistoryItem, FinalReport } from './types';
import { getFallbackQuestion } from './fallbackQuestions';

const QUESTION_SYSTEM_PROMPT = `You are a fun "This or That" question generator for a fast-paced two-player party game.
Generate ONE pair of short choices per request.
Each option MUST be short (1–3 words max), punchy, and instantly understandable.
Rotate across categories: Everyday, Fun, Crazy / Chaotic, Entertainment, Travel, Food, Social, Lifestyle, Imagination, Values.
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

// ---- Question Generation ----

async function generateQuestionWithGemini(apiKey: string, recentQuestions: string[]): Promise<Question> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      temperature: 0.95,
      maxOutputTokens: 500,
    },
    systemInstruction: QUESTION_SYSTEM_PROMPT,
  });

  const recentList = recentQuestions.slice(-15).join(', ');
  const prompt = `Generate one fun "this or that" choice pair.
Keep each option short (1-3 words).
Recently used (do NOT repeat): ${recentList || 'none yet'}.
Return JSON only: {"category":"...","optionA":"...","optionB":"..."}`;

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

  throw new Error('Invalid Gemini question JSON structure');
}

async function generateQuestionWithOpenAI(apiKey: string, recentQuestions: string[]): Promise<Question> {
  const openai = new OpenAI({ apiKey });
  const recentList = recentQuestions.slice(-15).join(', ');
  const userPrompt = `Generate one fun "this or that" choice pair.
Keep each option short (1-3 words each).
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

export async function generateQuestion(recentQuestions: string[]): Promise<Question> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey !== 'your_gemini_key_here') {
    try {
      const q = await generateQuestionWithGemini(geminiKey, recentQuestions);
      return q;
    } catch (err) {
      console.warn('[AI:Gemini] Question generation fallback:', err instanceof Error ? err.message : err);
    }
  }

  if (openAiKey && openAiKey.startsWith('sk-')) {
    try {
      const q = await generateQuestionWithOpenAI(openAiKey, recentQuestions);
      return q;
    } catch (err) {
      console.warn('[AI:OpenAI] Question generation fallback:', err instanceof Error ? err.message : err);
    }
  }

  return getFallbackQuestion(recentQuestions);
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
  isPartial: boolean,
  interruptedReason?: string
): Promise<FinalReport> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1200,
    },
  });

  const historySummary = history.map((item) => {
    const p1 = item.hostChoice ?? 'No answer';
    const p2 = item.guestChoice ?? 'No answer';
    return `Round ${item.roundNumber} [${item.category}]: Question: "${item.question}". ${hostName} chose "${p1}", ${guestName} chose "${p2}". Outcome: ${item.result}`;
  }).join('\n');

  const prompt = `You are a witty, fun game-show host analyzing the results of a 2-player synchronization game called "THIS ⚡ THAT".
Player 1: ${hostName}
Player 2: ${guestName}
Game Status: ${isPartial ? `PARTIAL (${totalCompleted} of ${totalRounds} questions completed)` : `COMPLETE (${totalCompleted} of ${totalRounds} questions completed)`}
Total Matches: ${matches} / ${totalCompleted} (${matchPercentage}% Match Rate)

Game History:
${historySummary || 'No completed rounds recorded.'}

CRITICAL RULES:
1. Be entertaining, witty, and playful. Never mean or judgmental.
2. DO NOT make psychological diagnoses, psychiatric assessments, or clinical claims about hidden personalities.
3. Use observational phrasing like: "You both seem to...", "Your answers suggest...", "One fun pattern is...", "You appear aligned on...".
4. Return ONLY valid JSON with no markdown wrapping.

JSON Structure required:
{
  "headline": "A short, punchy, witty headline in CAPS (e.g., 'SAME BRAIN, DIFFERENT CHAOS' or 'ACCIDENTAL TELEPATHS')",
  "overallVibe": "A 2-4 word vibe tag (e.g., 'Chaos Partners', 'Twin Flames', 'Friendly Opposites')",
  "matchPercentage": ${matchPercentage},
  "completedQuestions": ${totalCompleted},
  "totalQuestions": ${totalRounds},
  "strongestMatches": ["2-3 specific category/choice areas where they were 100% in sync"],
  "biggestDifferences": ["2-3 specific topics where their instincts clashed most"],
  "sharedTendencies": ["2 playful insights about what they have in common"],
  "funniestDifference": "A 1-2 sentence witty observation about their most hilarious disagreement",
  "mostUnexpectedMatch": "A 1-2 sentence highlight about an unexpected or quirky choice they both picked",
  "conversationStarters": ["2 fun provocative questions they should debate right now"],
  "player1Profile": "A playful 1-sentence persona for ${hostName} based strictly on their choices",
  "player2Profile": "A playful 1-sentence persona for ${guestName} based strictly on their choices",
  "finalVerdict": "A 2-3 sentence fun conclusion celebrating their dynamic."
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = extractJson(text);

  return {
    headline: String(parsed.headline || 'SAME BRAIN, DIFFERENT CHAOS').trim(),
    overallVibe: String(parsed.overallVibe || 'Cosmic Sync').trim(),
    matchPercentage,
    completedQuestions: totalCompleted,
    totalQuestions: totalRounds,
    strongestMatches: Array.isArray(parsed.strongestMatches) ? parsed.strongestMatches.map(String) : ['Food & Dining', 'Travel Instincts'],
    biggestDifferences: Array.isArray(parsed.biggestDifferences) ? parsed.biggestDifferences.map(String) : ['Morning Routine', 'Planning Habits'],
    sharedTendencies: Array.isArray(parsed.sharedTendencies) ? parsed.sharedTendencies.map(String) : ['You both prioritize comfort and good food', 'Spontaneous adventures appeal to both of you'],
    funniestDifference: String(parsed.funniestDifference || 'One of you plans every second while the other believes in pure improvisation! 😂'),
    mostUnexpectedMatch: String(parsed.mostUnexpectedMatch || 'You both locked in the exact same wild choice without hesitation!'),
    conversationStarters: Array.isArray(parsed.conversationStarters) ? parsed.conversationStarters.map(String) : ['Who actually decides where to eat when you hang out?', 'Would your road trip survive without a GPS?'],
    player1Profile: String(parsed.player1Profile || `${hostName} follows their instincts with fearless enthusiasm.`),
    player2Profile: String(parsed.player2Profile || `${guestName} brings the energy and keeps things interesting.`),
    finalVerdict: String(parsed.finalVerdict || `You scored ${matchPercentage}% synchronization! Whether you match on everything or disagree on the fun stuff, your dynamic is certified gold.`),
    isPartial,
    interruptedReason,
    generatedAt: Date.now(),
  };
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
    ? `You both picked "${matchingItems[0].hostChoice}" on ${matchingItems[0].category}!`
    : 'You found surprising moments of agreement throughout the game.';

  const sampleDiff = differingItems[0]
    ? `${hostName} chose "${differingItems[0].hostChoice ?? '—'}" while ${guestName} picked "${differingItems[0].guestChoice ?? '—'}"!`
    : 'You barely had any disagreements!';

  return {
    headline,
    overallVibe,
    matchPercentage,
    completedQuestions: totalCompleted,
    totalQuestions: totalRounds,
    strongestMatches: topMatchCats.length > 0 ? topMatchCats.map((c) => `Aligned on ${c}`) : ['Shared general instincts', 'Common tastes'],
    biggestDifferences: topDiffCats.length > 0 ? topDiffCats.map((c) => `Debatable on ${c}`) : ['Subtle lifestyle preferences'],
    sharedTendencies: [
      `You agreed on ${matches} out of ${totalCompleted} rounds`,
      matchingItems.length > 0 ? `Strong alignment on ${topMatchCats.join(', ') || 'everyday choices'}` : 'You both bring unique perspectives to every situation',
    ],
    funniestDifference: sampleDiff,
    mostUnexpectedMatch: sampleMatch,
    conversationStarters: [
      differingItems[0] ? `Would you ever compromise on ${differingItems[0].category}?` : 'What is one thing you will never agree on?',
      'Who is more likely to change their mind in an argument?',
    ],
    player1Profile: `${hostName} made bold, decisive choices throughout the rounds.`,
    player2Profile: `${guestName} brought unique flavor and distinct preferences.`,
    finalVerdict: `You reached a ${matchPercentage}% match rate across ${totalCompleted} rounds! Your choices show a vibrant dynamic full of fun discussions.`,
    isPartial,
    interruptedReason,
    generatedAt: Date.now(),
  };
}
