// ============================================================
// THIS ⚡ THAT — High-Speed Question & Entertainment Analysis Engine (V6)
// 10,000 Questions Dataset, Instant (<1ms) Processing, Rich Engagement
// ============================================================

import {
  Question,
  RoundHistoryItem,
  FinalReport,
  CategoryScore,
  Achievement,
  PredictionScore,
  RoundType,
} from './types';
import { getInstantQuestion, getRoundTypeForRound, getRoundConfiguration } from './dataset/questionsEngine';
import { enhanceFinalReportWithGemini, generateGeminiMindReadQuestion } from './geminiService';

export async function generateQuestion(
  recentQuestions: string[] = [],
  recentCategories: string[] = [],
  roundNumber = 1,
  roundType?: RoundType,
  gameMode = 'INDIA',
  hostName = 'Player 1',
  guestName = 'Player 2',
  hostGender: 'male' | 'female' | 'other' = 'other',
  guestGender: 'male' | 'female' | 'other' = 'other',
  deepPsychology = true
): Promise<Question> {
  const targetRoundType = roundType || getRoundTypeForRound(roundNumber, deepPsychology);
  const baseQuestion = getInstantQuestion(recentQuestions, recentCategories, roundNumber, targetRoundType, gameMode);

  // If this is a PREDICTION / Mind Read round, optionally enhance with Gemini AI if available
  if (targetRoundType === 'PREDICTION') {
    try {
      const aiMindRead = await generateGeminiMindReadQuestion(hostName, guestName, hostGender, guestGender);
      if (aiMindRead && aiMindRead.optionA && aiMindRead.optionB) {
        return {
          ...baseQuestion,
          scenario: aiMindRead.scenario || baseQuestion.scenario,
          optionA: aiMindRead.optionA,
          optionB: aiMindRead.optionB,
          category: aiMindRead.category || baseQuestion.category || 'Mind Reading & Telepathy',
          timeLimit: 20, // ample time for splash + 2-step prediction
        };
      }
    } catch {
      // Graceful fallback to base instant question
    }
  }

  return baseQuestion;
}

// ============================================================
// 2. Category & Compatibility Calculator
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
// 3. Dynamic Prediction Score Calculator
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
// 4. Evidence-Based Achievements Engine
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
  } else if (matchPercentage <= 40 && history.length >= 4) {
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
    } else if (predictionScore.hostCorrect >= 1) {
      achievements.push({
        id: 'host_mind_reader',
        title: `🧠 ${predictionScore.hostName.toUpperCase()} THE MIND READER`,
        icon: '🧠',
        description: `${predictionScore.hostName} predicted ${predictionScore.guestName}'s choices effortlessly!`,
        unlockedFor: 'host',
      });
    } else if (predictionScore.guestCorrect >= 1) {
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
    if (foodMatches / foodRounds.length >= 0.7) {
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
    if (cinemaMatches / cinemaRounds.length >= 0.7) {
      achievements.push({
        id: 'cinema_twins',
        title: '🎬 CINEMA TWINS',
        icon: '🎬',
        description: '100% in sync on movie choices, theatres, and entertainment!',
        unlockedFor: 'both',
      });
    }
  }

  const chaosRounds = history.filter(h => h.roundType === 'CHAOS' || h.category.toLowerCase().includes('crazy') || h.category.toLowerCase().includes('superpower'));
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

  const careerRounds = history.filter(h => h.category.toLowerCase().includes('money') || h.category.toLowerCase().includes('career'));
  if (careerRounds.length >= 2) {
    const careerMatches = careerRounds.filter(h => h.result === 'MATCH').length;
    if (careerMatches / careerRounds.length >= 0.75) {
      achievements.push({
        id: 'career_allies',
        title: '💼 CAREER ALLIES',
        icon: '💼',
        description: 'Aligned on ambition, hustle, and financial philosophy!',
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
// 5. Dynamic Live Reaction Generator
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
      'Bro answered before even reading! 😂',
      'Identical vibes locked in! ✨',
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
    'Zero hesitation in picking the opposite 😂',
    'Who hurt you both? Complete clash! 💥',
  ];
  return diffReactions[Math.floor(Math.random() * diffReactions.length)];
}

// ============================================================
// 6. Fast In-Memory Psychological & Fun Analysis Engine (<2ms)
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
  gameMode = 'INDIA',
  aiTone: 'nice' | 'fun' | 'brutal' = 'fun',
  leftBy?: 'host' | 'guest' | 'both',
  leftAt?: number,
  hostGender: 'male' | 'female' | 'other' = 'other',
  guestGender: 'male' | 'female' | 'other' = 'other'
): Promise<FinalReport> {
  const matchPercentage = totalCompleted > 0 ? Math.round((matches / totalCompleted) * 100) : 0;
  const categoryScores = computeCategoryScores(history);
  const predictionScore = computePredictionScore(history, hostName, guestName);
  const achievements = computeAchievements(history, matchPercentage, predictionScore);

  // Compute Quick Instinct vs Situational Strategy breakdown
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
  } else if (instinctMatchPercentage <= 40 && strategicMatchPercentage <= 40) {
    instinctVsStrategyInsight = `Zero overlap on quick reflexes (${instinctMatchPercentage}%) and zero overlap on deep dilemmas (${strategicMatchPercentage}%). You two are living in completely parallel dimensions!`;
  }

  const totalScore = history.reduce((acc, h) => acc + (h.pointsAwarded || (h.result === 'MATCH' ? 1 : 0)), 0);
  const maxPossible = history.reduce((acc, h) => acc + (h.roundType === 'DOUBLE_POINTS' ? 2 : 1), 0);

  // Headlines and Vibes based on score and tone
  let headline = 'SAME BRAIN, DIFFERENT CHAOS';
  let overallVibe = 'High Voltage Sync';

  if (matchPercentage >= 85) {
    headline = aiTone === 'brutal' ? '⚡ SUSPICIOUSLY IDENTICAL ROBOTS' : '⚡ CERTIFIED TWIN MINDS';
    overallVibe = 'Cosmic Telepathy';
  } else if (matchPercentage >= 70) {
    headline = aiTone === 'brutal' ? '🔥 70% SYNC: ONE BRAIN CELL SHARED' : '🔥 HIGH-VOLTAGE HARMONY';
    overallVibe = 'Electric Alignment';
  } else if (matchPercentage >= 50) {
    headline = aiTone === 'brutal' ? '⚖️ 50-50 CHAOS: AGREE TO DISAGREE' : '⚖️ PERFECTLY BALANCED DUO';
    overallVibe = 'Dynamic Balance';
  } else if (matchPercentage >= 35) {
    headline = aiTone === 'brutal' ? '💀 STRANGERS ON THE SAME WIFI' : '🌪️ OPPOSITES WITH VIBES';
    overallVibe = 'Creative Friction';
  } else {
    headline = aiTone === 'brutal' ? '💀 ZERO COMPATIBILITY: CONTACT LAWYER' : '💀 ENTERTAINING OPPOSITE POLES';
    overallVibe = 'Parallel Universes';
  }

  const matchedItems = history.filter(h => h.result === 'MATCH');
  const diffItems = history.filter(h => h.result === 'NO_MATCH');

  const strongestMatches = matchedItems.slice(0, 3).map(m => m.question || m.category);
  const biggestDifferences = diffItems.slice(0, 3).map(d => d.question || d.category);

  // Tone-specific verdicts
  let finalVerdict = '';
  if (isPartial) {
    if (aiTone === 'brutal') {
      finalVerdict = `Based on the ${totalCompleted} rounds answered before someone bailed, you matched ${matchPercentage}%. Clearly, the debates got way too intense! 😂`;
    } else if (aiTone === 'nice') {
      finalVerdict = `Based on the ${totalCompleted} rounds played, you achieved a lovely ${matchPercentage}% alignment! Every choice showed your special bond.`;
    } else {
      finalVerdict = `Based on the ${totalCompleted} rounds you actually answered, you scored ${matchPercentage}% compatibility (${matches}/${totalCompleted} matches). Your dynamic makes every choice an adventure!`;
    }
  } else {
    if (aiTone === 'brutal') {
      if (matchPercentage >= 75) {
        finalVerdict = `You scored ${matchPercentage}%! Are you sure you are two separate people, or just one person playing on two devices? Terrifyingly synchronized.`;
      } else if (matchPercentage >= 45) {
        finalVerdict = `A chaotic ${matchPercentage}% match. You agree just enough to stay friends, but disagree enough to cause public scenes at restaurants.`;
      } else {
        finalVerdict = `At ${matchPercentage}% compatibility, science suggests you two should not be left in the same room without supervision. A recipe for pure comedy!`;
      }
    } else if (aiTone === 'nice') {
      if (matchPercentage >= 75) {
        finalVerdict = `A wonderful ${matchPercentage}% match! ${hostName} and ${guestName} share an incredible natural connection and mutual understanding.`;
      } else if (matchPercentage >= 45) {
        finalVerdict = `A harmonious ${matchPercentage}% score! You agree on core priorities while bringing exciting individuality to every conversation.`;
      } else {
        finalVerdict = `${matchPercentage}% compatibility! You bring completely complementary perspectives that make your dynamic rich, deep, and endlessly interesting.`;
      }
    } else {
      // Fun tone (default)
      if (matchPercentage >= 75) {
        finalVerdict = `Uncanny ${matchPercentage}% synchronization! ${hostName} and ${guestName} are operating on the exact same frequency. Certified Same Brain!`;
      } else if (matchPercentage >= 45) {
        finalVerdict = `At ${matchPercentage}% sync, you agree on what matters most while keeping enough different flavor to never get bored. Peak squad energy!`;
      } else {
        finalVerdict = `Only ${matchPercentage}% agreement! You two inhabit parallel universes, which guarantees zero silence and endless debates.`;
      }
    }
  }

  // Generate grounded player persona insights
  const hostChoicesText = history.map(h => h.hostChoice).filter(Boolean).slice(0, 5).join(', ');
  const guestChoicesText = history.map(h => h.guestChoice).filter(Boolean).slice(0, 5).join(', ');

  const player1Insight = aiTone === 'brutal'
    ? `${hostName} made unhinged, unapologetic choices (${hostChoicesText || 'pure instinct'}) and refuses to elaborate.`
    : `${hostName} showed decisive, instinct-driven taste with a clear personal code.`;

  const player2Insight = aiTone === 'brutal'
    ? `${guestName} brought stubborn energy and counter-intuitive logic (${guestChoicesText || 'pure chaos'}) to every round.`
    : `${guestName} brought independent flavor, sharp intuition, and distinct style.`;

  const funniestDiffText = diffItems.length > 0
    ? `You clashed directly on "${diffItems[0].question}" — ${hostName} picked "${diffItems[0].hostChoice}" while ${guestName} went with "${diffItems[0].guestChoice}"! Two completely different life philosophies. 😂`
    : 'You barely disagreed on anything throughout the game!';

  const mostUnexpectedText = matchedItems.length > 0
    ? `Both locked in "${matchedItems[0].hostChoice}" without a second of hesitation!`
    : 'Every single question was a brand new debate!';

  const conversationStarters = [
    `Who actually decides the food when you two hang out in real life?`,
    diffItems.length > 0 ? `Debate: Why did you pick "${diffItems[0].hostChoice}" vs "${diffItems[0].guestChoice}"?` : `Would your friendship survive a 10-day road trip without GPS?`,
  ];

  // Extract Real Nature insight from DEEP_PSYCHOLOGY or high-stakes dilemmas
  const deepPsyRounds = history.filter(h => h.roundType === 'DEEP_PSYCHOLOGY' || h.questionType === 'DEEP_PSYCHOLOGY' || h.category.toLowerCase().includes('psychology') || h.category.toLowerCase().includes('moral'));
  let realNatureInsight = `Your situational choices demonstrated strong personal convictions and distinct life codes.`;
  if (deepPsyRounds.length > 0) {
    const lastDeep = deepPsyRounds[deepPsyRounds.length - 1];
    if (lastDeep.result === 'MATCH') {
      realNatureInsight = `On the Deep Psychology test ("${lastDeep.question}"), you both chose "${lastDeep.hostChoice}"! You share an identical moral compass and deep-rooted authenticity.`;
    } else {
      realNatureInsight = `On the Deep Psychology test ("${lastDeep.question}"), ${hostName} chose "${lastDeep.hostChoice}" while ${guestName} chose "${lastDeep.guestChoice}". One prioritizes protective pragmatism while the other follows unbending personal code!`;
    }
  }

  const baseReport: FinalReport = {
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
    categoryScores: categoryScores.length > 0 ? categoryScores : [
      { category: 'General Instincts', matchPercentage, totalQuestions: totalCompleted, matchedQuestions: matches }
    ],
    achievements,
    predictionScore,
    strongestMatches: strongestMatches.length > 0 ? strongestMatches : ['Food & Chai', 'Cinema & Entertainment'],
    biggestDifferences: biggestDifferences.length > 0 ? biggestDifferences : ['Daily Routines', 'Travel Choices'],
    surprisingPatterns: [
      `Completed ${totalCompleted} rounds with ${matches} direct hits (${matchPercentage}% compatibility).`,
      instinctVsStrategyInsight,
    ],
    contradictions: [],
    funniestDifference: funniestDiffText,
    mostUnexpectedMatch: mostUnexpectedText,
    sharedTendencies: [
      `${hostName} and ${guestName} value authentic instincts over overthinking.`,
      `Both bring strong, unapologetic points of view to every discussion.`,
    ],
    conversationStarters,
    player1Insight,
    player2Insight,
    player1Profile: player1Insight,
    player2Profile: player2Insight,
    player1Gender: hostGender,
    player2Gender: guestGender,
    realNatureInsight,
    finalVerdict,
    isPartial,
    interruptedReason,
    leftBy,
    leftAt,
    gameMode,
    aiTone,
    generatedAt: Date.now(),
  };

  // Enhance with Google Gemini AI (with instant fallback to baseReport)
  return enhanceFinalReportWithGemini(baseReport, history, hostName, guestName, aiTone, hostGender, guestGender);
}
