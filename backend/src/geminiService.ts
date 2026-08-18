// ============================================================
// THIS ⚡ THAT — Google Gemini AI Service Engine
// Intelligent Compatibility Analysis, Mind-Read Generation & Dynamic Insights
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { RoundHistoryItem, FinalReport, Question } from './types';

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Timeout helper to guarantee gameplay never hangs (>2.8s max)
function withTimeout<T>(promise: Promise<T>, ms = 2800): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${ms}ms`)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function isGeminiEnabled(): boolean {
  return Boolean(API_KEY && API_KEY.length > 5);
}

/**
 * Enhanced Gemini Final Psychological & Compatibility Report
 */
export async function enhanceFinalReportWithGemini(
  baseReport: FinalReport,
  history: RoundHistoryItem[],
  hostName: string,
  guestName: string,
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun',
  hostGender: 'male' | 'female' | 'other' = 'other',
  guestGender: 'male' | 'female' | 'other' = 'other'
): Promise<FinalReport> {
  if (!genAI || !isGeminiEnabled() || history.length === 0) {
    return {
      ...baseReport,
      player1Gender: hostGender,
      player2Gender: guestGender,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format choices history summary for prompt, specially noting DEEP_PSYCHOLOGY and PREDICTION rounds
    const roundsSummary = history
      .map((h, i) => {
        const pInfo = h.roundType === 'PREDICTION'
          ? ` [MindRead: ${hostName} guessed "${h.hostPrediction || 'none'}" (${h.hostPredictionResult || 'N/A'}), ${guestName} guessed "${h.guestPrediction || 'none'}" (${h.guestPredictionResult || 'N/A'})]`
          : h.roundType === 'DEEP_PSYCHOLOGY'
          ? ' [🧠 DEEP PSYCHOLOGY - REAL NATURE TEST]'
          : '';
        return `R${i + 1} (${h.roundType || 'NORMAL'} | ${h.category || 'General'}): "${h.question}" -> ${hostName} (${hostGender}): "${h.hostChoice || 'none'}", ${guestName} (${guestGender}): "${h.guestChoice || 'none'}" -> ${h.result}${pInfo}`;
      })
      .join('\n');

    const prompt = `You are the viral, witty AI psychologist and matchmaker for "THIS ⚡ THAT" (a fast-paced choice battle game in India).
Two players just finished playing:
- Player 1 (Host): "${hostName}" (${hostGender} gender / pronouns)
- Player 2 (Guest): "${guestName}" (${guestGender} gender / pronouns)
- Match Percentage: ${baseReport.matchPercentage}% (${baseReport.completedQuestions} questions answered)
- Tone: "${aiTone.toUpperCase()}" (nice = wholesome & uplifting, fun = playful & teasing, brutal = savage comedic roast)

Here are their exact choices and match results:
${roundsSummary}

Return ONLY a valid JSON object (no markdown fences, no extra text) with these exact keys:
{
  "headline": "A short, punchy 3-7 word viral headline in ALL CAPS with emojis (e.g. '⚡ CERTIFIED TELEPATHIC DUO' or '💀 LIVING IN PARALLEL UNIVERSES')",
  "overallVibe": "2-4 word aura / vibe name (e.g. 'Cosmic Telepathy', 'Chaotic Friendship', 'Pure Opposites')",
  "finalVerdict": "2-3 sentences witty psychological verdict analyzing their dynamic, tailored to the requested ${aiTone} tone and their respective genders.",
  "player1Insight": "1-2 sentences sharp profile of ${hostName}'s personality and taste based on their specific answers.",
  "player2Insight": "1-2 sentences sharp profile of ${guestName}'s personality and taste based on their specific answers.",
  "realNatureInsight": "2-3 sentences exposing their TRUE UNFILTERED REAL NATURE & moral compass based especially on the Deep Psychology / Situational choices they made.",
  "funniestDifference": "A funny 1-2 sentence commentary highlighting their funniest clash from the game choices.",
  "sharedTendencies": [
    "One sentence on something they surprisingly think alike about.",
    "Another sentence on their shared instincts."
  ],
  "conversationStarters": [
    "A spicy debate question based on a question they disagreed on.",
    "A fun hypothetical dilemma to test them further."
  ]
}`;

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
      },
    });

    const result = await withTimeout(generatePromise, 2800);
    const text = result.response.text();
    if (!text) return baseReport;

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    return {
      ...baseReport,
      headline: parsed.headline || baseReport.headline,
      overallVibe: parsed.overallVibe || baseReport.overallVibe,
      finalVerdict: parsed.finalVerdict || baseReport.finalVerdict,
      player1Insight: parsed.player1Insight || baseReport.player1Insight,
      player2Insight: parsed.player2Insight || baseReport.player2Insight,
      player1Profile: parsed.player1Insight || baseReport.player1Profile,
      player2Profile: parsed.player2Insight || baseReport.player2Profile,
      player1Gender: hostGender,
      player2Gender: guestGender,
      realNatureInsight: parsed.realNatureInsight || baseReport.realNatureInsight,
      funniestDifference: parsed.funniestDifference || baseReport.funniestDifference,
      sharedTendencies: Array.isArray(parsed.sharedTendencies) && parsed.sharedTendencies.length > 0
        ? parsed.sharedTendencies
        : baseReport.sharedTendencies,
      conversationStarters: Array.isArray(parsed.conversationStarters) && parsed.conversationStarters.length > 0
        ? parsed.conversationStarters
        : baseReport.conversationStarters,
    };
  } catch (err: any) {
    console.warn('[GEMINI AI] Fallback to instant engine (Notice: ' + (err?.message || err) + ')');
    return baseReport;
  }
}

/**
 * Generate a dynamic Mind Read scenario using Gemini AI (with local fallback)
 */
export async function generateGeminiMindReadQuestion(
  hostName = 'Player 1',
  guestName = 'Player 2',
  hostGender = 'other',
  guestGender = 'other'
): Promise<Partial<Question> | null> {
  if (!genAI || !isGeminiEnabled()) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate a spicy, hilarious Indian cultural "This or That" dilemma for a Mind Reading round between two friends:
- Player 1: "${hostName}" (${hostGender})
- Player 2: "${guestName}" (${guestGender})
The dilemma should test how well they know each other's secret instincts, guilty pleasures, social habits, or absurd Indian daily life choices.

Return ONLY a valid JSON object:
{
  "scenario": "A vivid 1-sentence situation or dilemma (e.g. 'You find an unlabelled box in your friend's room. What do you do?')",
  "optionA": "Short option 1 (2-6 words)",
  "optionB": "Short option 2 (2-6 words)",
  "category": "Mind Reading & Telepathy"
}`;

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        responseMimeType: 'application/json',
      },
    });

    const result = await withTimeout(generatePromise, 1800);
    const text = result.response.text();
    if (!text) return null;

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    if (parsed.optionA && parsed.optionB) {
      return {
        scenario: parsed.scenario || undefined,
        optionA: parsed.optionA,
        optionB: parsed.optionB,
        category: parsed.category || 'Mind Reading & Telepathy',
      };
    }
    return null;
  } catch (err: any) {
    console.warn('[GEMINI AI MIND READ] Fallback to in-memory question:', err?.message || err);
    return null;
  }
}
