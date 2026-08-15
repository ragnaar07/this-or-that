// ============================================================
// AI Question Service — Google Gemini & OpenAI with Fallback
// Generates questions server-side
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { Question } from './types';
import { getFallbackQuestion } from './fallbackQuestions';

const SYSTEM_PROMPT = `You are a fun "This or That" question generator for a fast-paced two-player party game.
Generate ONE pair of short choices per request.
Each option MUST be short (1–3 words max), e.g. "Beach" vs "Mountains", "Netflix" vs "YouTube", "Pancake" vs "Waffle".
Rotate across categories: food, lifestyle, travel, entertainment, hypotheticals, everyday choices, weird preferences.
Return ONLY a valid JSON object. No preamble, no explanation, no markdown.
Format: {"category": "...", "optionA": "...", "optionB": "..."}`;

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

async function generateWithGemini(apiKey: string, recentQuestions: string[]): Promise<Question> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 800,
    },
    systemInstruction: SYSTEM_PROMPT,
  });

  const recentList = recentQuestions.slice(-15).join(', ');
  const prompt = `Generate one fun "this or that" choice pair.
Keep each option very punchy and short (1-3 words each).
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

  throw new Error('Invalid Gemini response structure');
}

async function generateWithOpenAI(apiKey: string, recentQuestions: string[]): Promise<Question> {
  const openai = new OpenAI({ apiKey });
  const recentList = recentQuestions.slice(-15).join(', ');
  const userPrompt = `Generate one fun "this or that" choice pair.
Keep each option very punchy and short (1-3 words each).
Recently used (avoid repeating): ${recentList || 'none yet'}.
Requirements: fun, short (1-3 words each), meaningfully different, not fact-based, not offensive.
Return JSON only: {"category":"...","optionA":"...","optionB":"..."}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 200,
    temperature: 0.9,
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

  throw new Error('Invalid OpenAI response structure');
}

export async function generateQuestion(recentQuestions: string[]): Promise<Question> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini first if key exists
  if (geminiKey && geminiKey !== 'your_gemini_key_here') {
    try {
      const q = await generateWithGemini(geminiKey, recentQuestions);
      console.log(`[AI:Gemini] ✨ Live Generated: "${q.optionA}" vs "${q.optionB}" (${q.category})`);
      return q;
    } catch (err) {
      console.error('[AI:Gemini] Failed:', err instanceof Error ? err.message : err);
    }
  }

  // 2. Try OpenAI if key exists and looks like sk-...
  if (openAiKey && openAiKey.startsWith('sk-')) {
    try {
      const q = await generateWithOpenAI(openAiKey, recentQuestions);
      console.log(`[AI:OpenAI] ✨ Live Generated: "${q.optionA}" vs "${q.optionB}" (${q.category})`);
      return q;
    } catch (err) {
      console.error('[AI:OpenAI] Failed:', err instanceof Error ? err.message : err);
    }
  }

  // 3. Fallback pool
  return getFallbackQuestion(recentQuestions);
}
