import { generateQuestion, generateFinalReport, computeCategoryScores, computeAchievements, computePredictionScore, generateLiveReaction } from './questionService';
import { getFallbackQuestion, getRoundTypeForRound, getRoundConfiguration, FALLBACK_QUESTIONS, isDuplicateQuestion, normalizeSignature } from './fallbackQuestions';
import { setRoom, getRoom, deleteRoom, setPlayerAnswer, getRoundAnswers, clearRoundAnswers } from './store';
import { Room, RoundHistoryItem, Question } from './types';

async function runTests() {
  console.log('⚡ ============================================================');
  console.log('⚡ THIS ⚡ THAT — V5 FORMAT, TIMER & CURRENT TOPICS TEST SUITE');
  console.log('⚡ ============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // --- Test 1: V5 Formats & Timers Configuration ---
  console.log('--- TEST 1: Question Formats & Authoritative Timers ---');
  const r1Config = getRoundConfiguration(1);
  assert(r1Config.format === 'QUICK' && r1Config.timeLimit === 10, 'Round 1 is QUICK format with 10-second timer');

  const r3Config = getRoundConfiguration(3);
  assert(r3Config.format === 'SITUATIONAL' && r3Config.timeLimit === 16, 'Round 3 is SITUATIONAL format with 16-second timer');

  const r5Config = getRoundConfiguration(5);
  assert(r5Config.type === 'CURRENT' && r5Config.timeLimit === 16, 'Round 5 is CURRENT India topic with 16-second timer');

  const r9Config = getRoundConfiguration(9);
  assert(r9Config.roundType === 'CHAOS' && r9Config.timeLimit === 16, 'Round 9 is CHAOS with 16-second timer');

  const r10Config = getRoundConfiguration(10);
  assert(r10Config.roundType === 'PREDICTION' && r10Config.timeLimit === 16, 'Round 10 is PREDICTION with 16-second timer');

  const r15Config = getRoundConfiguration(15);
  assert(r15Config.roundType === 'DOUBLE_POINTS' && r15Config.timeLimit === 16, 'Round 15 is DOUBLE_POINTS with 16-second timer');

  // --- Test 2: Dynamic Alternating Rhythm & Anti-Clustering ---
  console.log('\n--- TEST 2: Dynamic Rhythm & Anti-Clustering (20 Rounds) ---');
  const sequence: Question[] = [];
  const recentQs: string[] = [];
  const recentCats: string[] = [];

  for (let r = 1; r <= 20; r++) {
    const q = getFallbackQuestion(recentQs, recentCats, r, getRoundTypeForRound(r), 'RANDOM');
    sequence.push(q);
    recentQs.push(q.optionA);
    recentCats.push(q.category);
  }

  const quickCount = sequence.filter(q => q.format === 'QUICK').length;
  const sitCount = sequence.filter(q => q.format === 'SITUATIONAL').length;
  console.log(`  ℹ️  20-Round Rhythm: ${quickCount} Quick (10s) questions, ${sitCount} Situational/Chaos/Current (16s) questions`);
  assert(quickCount >= 6 && quickCount <= 10, 'Balanced alternating rhythm (6-10 quick instinct rounds)');
  assert(sitCount >= 10 && sitCount <= 14, 'Rich situational depth (10-14 deep dilemma rounds)');

  let has3InARow = false;
  for (let i = 2; i < sequence.length; i++) {
    if (
      sequence[i].category === sequence[i - 1].category &&
      sequence[i].category === sequence[i - 2].category
    ) {
      has3InARow = true;
      break;
    }
  }
  assert(!has3InARow, 'Zero 3-consecutive same category clusters in 20 rounds');

  // --- Test 3: 100 Sample Questions Audit ---
  console.log('\n--- TEST 3: 100 Sample Questions Quality & Domain Audit ---');
  const sample100: Question[] = [];
  const auditRecentQs: string[] = [];
  const auditRecentCats: string[] = [];

  for (let i = 1; i <= 100; i++) {
    const roundNumber = ((i - 1) % 20) + 1;
    const rType = getRoundTypeForRound(roundNumber);
    const q = getFallbackQuestion(auditRecentQs, auditRecentCats, roundNumber, rType, 'RANDOM');
    sample100.push(q);
    auditRecentQs.push(q.optionA);
    auditRecentCats.push(q.category);
  }

  assert(sample100.length === 100, 'Generated 100 sample questions successfully');
  const hasQuick = sample100.some(q => q.format === 'QUICK' && q.timeLimit === 10);
  const hasSituational = sample100.some(q => q.format === 'SITUATIONAL' && q.timeLimit === 16);
  const hasCurrent = sample100.some(q => q.type === 'CURRENT' || q.isCurrent);
  const hasChaos = sample100.some(q => q.roundType === 'CHAOS');
  const hasPrediction = sample100.some(q => q.roundType === 'PREDICTION');
  const hasDouble = sample100.some(q => q.roundType === 'DOUBLE_POINTS');

  assert(hasQuick, 'Quick 10s questions present in pool');
  assert(hasSituational, 'Situational 16s questions present in pool');
  assert(hasCurrent, 'Current India discussions present in pool');
  assert(hasChaos, 'Chaos rounds present in pool');
  assert(hasPrediction, 'Prediction rounds present in pool');
  assert(hasDouble, 'Double points rounds present in pool');

  // --- Test 4: Server-Authoritative Timer & Late Answer Handling ---
  console.log('\n--- TEST 4: Server-Authoritative Timer Calculation ---');
  const code = 'TEST';
  const now = Date.now();
  const hostId = 'host_123';
  const guestId = 'guest_456';

  const quickQ = getFallbackQuestion([], [], 1, 'NORMAL', 'RANDOM');
  assert(quickQ.format === 'QUICK' && quickQ.timeLimit === 10, 'Quick question has timeLimit = 10');

  const sitQ = getFallbackQuestion([], [], 3, 'NORMAL', 'RANDOM');
  assert(sitQ.format === 'SITUATIONAL' && sitQ.timeLimit === 16, 'Situational question has timeLimit = 16');

  const room: Room = {
    code,
    hostPlayerId: hostId,
    hostPlayerName: 'Rahul',
    hostLastSeenAt: now,
    guestPlayerId: guestId,
    guestPlayerName: 'Priya',
    guestLastSeenAt: now,
    status: 'PLAYING',
    roundNumber: 1,
    totalRounds: 20,
    currentQuestion: quickQ,
    currentRoundType: 'NORMAL',
    currentTimeLimit: 10,
    currentQuestionFormat: 'QUICK',
    roundStartedAt: now,
    roundDeadline: now + 10000,
    matches: 0,
    total: 0,
    score: 0,
    streak: 0,
    lastResult: null,
    lastHostChoice: null,
    lastGuestChoice: null,
    lastLiveReaction: null,
    recentQuestions: [quickQ.optionA],
    recentCategories: [quickQ.category],
    history: [],
    finalReport: null,
    gameMode: 'RANDOM',
    aiTone: 'fun',
    createdAt: now,
    updatedAt: now,
  };
  setRoom(room);

  assert(getRoom(code)?.currentTimeLimit === 10, 'Server stored currentTimeLimit = 10s for Quick Round');
  assert(getRoom(code)?.roundDeadline === now + 10000, 'Server authoritative deadline set to exactly +10000ms');

  // Advance to Round 3 (Situational)
  const roomR3: Room = {
    ...room,
    roundNumber: 3,
    currentQuestion: sitQ,
    currentTimeLimit: 16,
    currentQuestionFormat: 'SITUATIONAL',
    roundStartedAt: now,
    roundDeadline: now + 16000,
  };
  setRoom(roomR3);
  assert(getRoom(code)?.currentTimeLimit === 16, 'Server stored currentTimeLimit = 16s for Situational Round');
  assert(getRoom(code)?.roundDeadline === now + 16000, 'Server authoritative deadline set to exactly +16000ms');

  // --- Test 5: Full 20-Round Simulation & Instinct vs Strategic AI Analysis ---
  console.log('\n--- TEST 5: Instinct vs Strategy AI Report Breakdown ---');
  const fullHistory: RoundHistoryItem[] = [];

  for (let r = 1; r <= 20; r++) {
    const config = getRoundConfiguration(r);
    const isQuick = config.format === 'QUICK';
    // Let's simulate: 90% match on quick questions, 40% match on situational questions
    const isMatch = isQuick ? r % 10 !== 0 : r % 2 === 0;
    const optA = `Choice A for R${r}`;
    const optB = `Choice B for R${r}`;

    fullHistory.push({
      roundNumber: r,
      question: `${optA} or ${optB}`,
      scenario: isQuick ? undefined : `Detailed situational scenario for round ${r}`,
      category: isQuick ? 'Food & Chai' : 'Money & Career',
      format: config.format,
      questionType: config.type,
      timeLimit: config.timeLimit,
      optionA: optA,
      optionB: optB,
      roundType: config.roundType,
      hostChoice: optA,
      guestChoice: isMatch ? optA : optB,
      result: isMatch ? 'MATCH' : 'NO_MATCH',
      pointsAwarded: isMatch ? (config.roundType === 'DOUBLE_POINTS' ? 2 : 1) : 0,
      answeredAt: Date.now(),
    });
  }

  const matches = fullHistory.filter(h => h.result === 'MATCH').length;
  const report = await generateFinalReport(
    fullHistory,
    'Rahul',
    'Priya',
    matches,
    20,
    20,
    false,
    undefined,
    'RANDOM',
    'fun'
  );

  assert(report.instinctMatchPercentage !== undefined, `Instinct Match computed: ${report.instinctMatchPercentage}%`);
  assert(report.strategicMatchPercentage !== undefined, `Strategic Match computed: ${report.strategicMatchPercentage}%`);
  assert(report.instinctVsStrategyInsight !== undefined && report.instinctVsStrategyInsight.length > 0, `Insight: "${report.instinctVsStrategyInsight}"`);
  console.log(`  ℹ️  Instinct Match: ${report.instinctMatchPercentage}% | Strategic Match: ${report.strategicMatchPercentage}%`);
  console.log(`  ℹ️  AI Comparative Insight: "${report.instinctVsStrategyInsight}"`);

  deleteRoom(code);
  assert(getRoom(code) === undefined, 'Room cleaned up cleanly');

  console.log('\n⚡ ============================================================');
  console.log(`⚡ TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('⚡ ============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
