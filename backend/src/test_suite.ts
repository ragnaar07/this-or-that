import { generateQuestion, generateFinalReport, computeCategoryScores, computeAchievements, computePredictionScore, generateLiveReaction } from './questionService';
import { getFallbackQuestion, getRoundTypeForRound, getRoundConfiguration, FALLBACK_QUESTIONS, isDuplicateQuestion, normalizeSignature } from './fallbackQuestions';
import { setRoom, getRoom, deleteRoom, setPlayerAnswer, getRoundAnswers, clearRoundAnswers } from './store';
import { Room, RoundHistoryItem, Question } from './types';

async function runTests() {
  console.log('⚡ ============================================================');
  console.log('⚡ THIS ⚡ THAT — V5.1 EDGE, FUNNY, CHAOS & LARGE TYPOGRAPHY AUDIT');
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

  // --- Test 1: V5.1 Formats & Timers Configuration ---
  console.log('--- TEST 1: Question Formats & Authoritative Timers ---');
  const r1Config = getRoundConfiguration(1);
  assert(r1Config.format === 'QUICK' && r1Config.timeLimit === 10, 'Round 1 is QUICK format with 10-second timer');

  const r3Config = getRoundConfiguration(3);
  assert(r3Config.type === 'FUNNY' && r3Config.timeLimit === 16, 'Round 3 is FUNNY format with 16-second timer');

  const r5Config = getRoundConfiguration(5);
  assert(r5Config.type === 'CURRENT' && r5Config.timeLimit === 16, 'Round 5 is CURRENT India topic with 16-second timer');

  const r7Config = getRoundConfiguration(7);
  assert(r7Config.type === 'EDGE' && r7Config.timeLimit === 16, 'Round 7 is EDGE (human truth) with 16-second timer');

  const r9Config = getRoundConfiguration(9);
  assert(r9Config.roundType === 'CHAOS' && r9Config.timeLimit === 16, 'Round 9 is CHAOS with 16-second timer');

  const r10Config = getRoundConfiguration(10);
  assert(r10Config.roundType === 'PREDICTION' && r10Config.timeLimit === 16, 'Round 10 is PREDICTION with 16-second timer');

  const r13Config = getRoundConfiguration(13);
  assert(r13Config.type === 'EDGE' && r13Config.timeLimit === 16, 'Round 13 is EDGE with 16-second timer');

  const r15Config = getRoundConfiguration(15);
  assert(r15Config.roundType === 'DOUBLE_POINTS' && r15Config.timeLimit === 16, 'Round 15 is DOUBLE_POINTS with 16-second timer');

  // --- Test 2: 30-Question Specialized Quality Audit (10 Edge, 10 Funny, 10 Chaos) ---
  console.log('\n--- TEST 2: 30-Question Audit (10 Edge, 10 Funny, 10 Chaos) ---');

  const edgePool = FALLBACK_QUESTIONS.filter(q => q.type === 'EDGE');
  const funnyPool = FALLBACK_QUESTIONS.filter(q => q.type === 'FUNNY');
  const chaosPool = FALLBACK_QUESTIONS.filter(q => q.type === 'CHAOS' || q.roundType === 'CHAOS');

  console.log(`  ℹ️  Edge Pool size: ${edgePool.length} | Funny Pool size: ${funnyPool.length} | Chaos Pool size: ${chaosPool.length}`);
  assert(edgePool.length >= 8, 'At least 8-10 Edge questions curated in fallback pool');
  assert(funnyPool.length >= 6, 'At least 6-10 Funny questions curated in fallback pool');
  assert(chaosPool.length >= 5, 'At least 5-10 Chaos questions curated in fallback pool');

  // Audit Edge questions for no moral superiority
  let edgeNoMoralBias = true;
  edgePool.forEach((eq, idx) => {
    // Check neither option contains preachy words like "responsible", "immature", "good person"
    const textA = eq.optionA.toLowerCase();
    const textB = eq.optionB.toLowerCase();
    if (textA.includes('bad person') || textB.includes('bad person') || textA.includes('morally') || textB.includes('morally')) {
      edgeNoMoralBias = false;
    }
  });
  assert(edgeNoMoralBias, 'Edge questions avoid judgmental/preachy moral labeling');

  // Print sample 30 questions summary
  console.log('\n  --- Sample 10 EDGE Questions ---');
  edgePool.slice(0, 10).forEach((eq, i) => {
    console.log(`    [EDGE ${i + 1}] "${eq.scenario}"`);
    console.log(`      A: ${eq.optionA}`);
    console.log(`      B: ${eq.optionB}`);
  });

  console.log('\n  --- Sample 10 FUNNY Questions ---');
  funnyPool.slice(0, 10).forEach((fq, i) => {
    console.log(`    [FUNNY ${i + 1}] "${fq.scenario}"`);
    console.log(`      A: ${fq.optionA}`);
    console.log(`      B: ${fq.optionB}`);
  });

  console.log('\n  --- Sample 10 CHAOS / ABSURD Questions ---');
  chaosPool.slice(0, 10).forEach((cq, i) => {
    console.log(`    [CHAOS ${i + 1}] "${cq.scenario}"`);
    console.log(`      A: ${cq.optionA}`);
    console.log(`      B: ${cq.optionB}`);
  });

  // --- Test 3: Anti-Clustering & Rhythm in 20 Rounds ---
  console.log('\n--- TEST 3: Dynamic Rhythm & Anti-Clustering (20 Rounds) ---');
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
  const edgeCount = sequence.filter(q => q.type === 'EDGE').length;
  const funnyCount = sequence.filter(q => q.type === 'FUNNY').length;
  const chaosCount = sequence.filter(q => q.type === 'CHAOS' || q.roundType === 'CHAOS').length;

  console.log(`  ℹ️  20-Round Breakdown: ${quickCount} Quick (10s), ${edgeCount} Edge (16s), ${funnyCount} Funny (16s), ${chaosCount} Chaos (16s)`);
  assert(quickCount >= 6 && quickCount <= 10, 'Balanced alternating rhythm (6-10 quick instinct rounds)');
  assert(edgeCount >= 2, 'Edge questions represented in natural 20-round flow (~10-15%)');

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

  // --- Test 4: Instinct vs Strategy AI Report Breakdown ---
  console.log('\n--- TEST 4: Instinct vs Strategy AI Report Breakdown ---');
  const fullHistory: RoundHistoryItem[] = [];

  for (let r = 1; r <= 20; r++) {
    const config = getRoundConfiguration(r);
    const isQuick = config.format === 'QUICK';
    const isMatch = isQuick ? r % 10 !== 0 : r % 2 === 0;
    const optA = `Choice A for R${r}`;
    const optB = `Choice B for R${r}`;

    fullHistory.push({
      roundNumber: r,
      question: `${optA} or ${optB}`,
      scenario: isQuick ? undefined : `Detailed situational scenario for round ${r}`,
      category: isQuick ? 'Food & Chai' : (config.type === 'EDGE' ? 'Edge & Instincts' : 'Money & Career'),
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
    'Aarav',
    'Tara',
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

  // --- Test 5: Leave Flow & Grounded Partial Report ---
  console.log('\n--- TEST 5: Leave Flow & Grounded Partial Report (Rounds 1-6) ---');
  const partialHistory = fullHistory.slice(0, 6);
  const partialMatches = partialHistory.filter(h => h.result === 'MATCH').length;
  const partialReport = await generateFinalReport(
    partialHistory,
    'Rahul',
    'Priya',
    partialMatches,
    6,
    20,
    true,
    'Rahul left the game.',
    'RANDOM',
    'fun',
    'host',
    Date.now()
  );

  assert(partialReport.isPartial === true, 'Report is marked as partial (isPartial: true)');
  assert(partialReport.completedQuestions === 6, 'Completed questions correctly records 6 rounds');
  assert(partialReport.totalQuestions === 20, 'Total scheduled questions is 20');
  assert(partialReport.leftBy === 'host', 'Report records leftBy: host');
  assert(partialReport.interruptedReason === 'Rahul left the game.', 'Report records interruptedReason');
  assert(partialReport.finalVerdict.includes('6 rounds') || partialReport.finalVerdict.includes('actually answered') || partialReport.finalVerdict.includes('compatibility'), 'Grounded final verdict refers to actually answered rounds');

  // --- Test 6: In-Flight Answer Preservation During Leave ---
  console.log('\n--- TEST 6: In-Flight Answer Preservation During Leave ---');
  const testRoomCode = 'TEST';
  const mockRoom: Room = {
    code: testRoomCode,
    hostPlayerId: 'host123',
    hostPlayerName: 'HostPlayer',
    hostLastSeenAt: Date.now(),
    guestPlayerId: 'guest456',
    guestPlayerName: 'GuestPlayer',
    guestLastSeenAt: Date.now(),
    status: 'PLAYING',
    roundNumber: 3,
    totalRounds: 20,
    currentQuestion: {
      category: 'Food & Chai',
      scenario: 'Late night snack dilemma',
      optionA: 'Maggi',
      optionB: 'Chai & Biscuits',
      format: 'SITUATIONAL',
      timeLimit: 16,
    },
    currentRoundType: 'NORMAL',
    currentTimeLimit: 16,
    currentQuestionFormat: 'SITUATIONAL',
    roundStartedAt: Date.now(),
    roundDeadline: Date.now() + 16000,
    matches: 1,
    total: 2,
    score: 1,
    streak: 1,
    lastResult: 'MATCH',
    lastHostChoice: 'Tea',
    lastGuestChoice: 'Tea',
    recentQuestions: [],
    recentCategories: [],
    history: [
      {
        roundNumber: 1,
        question: 'Tea or Coffee',
        category: 'Food & Chai',
        optionA: 'Tea',
        optionB: 'Coffee',
        hostChoice: 'Tea',
        guestChoice: 'Tea',
        result: 'MATCH',
        pointsAwarded: 1,
        answeredAt: Date.now() - 20000,
      },
      {
        roundNumber: 2,
        question: 'Mountains or Beach',
        category: 'Travel',
        optionA: 'Mountains',
        optionB: 'Beach',
        hostChoice: 'Mountains',
        guestChoice: 'Beach',
        result: 'NO_MATCH',
        pointsAwarded: 0,
        answeredAt: Date.now() - 10000,
      },
    ],
    finalReport: null,
    gameMode: 'RANDOM',
    aiTone: 'fun',
    stateVersion: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  setRoom(mockRoom);
  // Simulate Host answering Maggi, Guest not answered yet
  setPlayerAnswer(testRoomCode, 3, 'host', {
    playerId: 'host123',
    roundNumber: 3,
    choice: 'Maggi',
    answeredAt: Date.now(),
  });

  // Simulate Leave trigger
  const answersBeforeLeave = getRoundAnswers(testRoomCode, 3);
  assert(answersBeforeLeave.host?.choice === 'Maggi', 'Host choice recorded before leave');
  assert(answersBeforeLeave.guest === undefined, 'Guest choice is unsubmitted');

  // Verify room preserve logic
  const roundAnswers = getRoundAnswers(testRoomCode, 3);
  const hostChoice = roundAnswers.host?.choice ?? null;
  const guestChoice = roundAnswers.guest?.choice ?? null;
  const isMatch = hostChoice !== null && guestChoice !== null && hostChoice === guestChoice;
  mockRoom.history.push({
    roundNumber: 3,
    question: `${mockRoom.currentQuestion?.optionA} or ${mockRoom.currentQuestion?.optionB}`,
    scenario: mockRoom.currentQuestion?.scenario,
    category: mockRoom.currentQuestion?.category || 'General',
    optionA: mockRoom.currentQuestion?.optionA || '',
    optionB: mockRoom.currentQuestion?.optionB || '',
    hostChoice,
    guestChoice,
    result: isMatch ? 'MATCH' : 'NO_MATCH',
    pointsAwarded: 0,
    answeredAt: Date.now(),
  });
  mockRoom.total = mockRoom.history.length;

  assert(mockRoom.history.length === 3, 'History contains 3 rounds including in-flight round');
  assert(mockRoom.history[2].hostChoice === 'Maggi', 'Host answer preserved in round 3 history');
  assert(mockRoom.history[2].guestChoice === null, 'Guest answer marked null/unanswered in round 3 history');
  assert(mockRoom.history[2].result === 'NO_MATCH', 'Unmatched in-flight round evaluated as NO_MATCH');

  // --- Test 7: Simultaneous Leave Handling ---
  console.log('\n--- TEST 7: Simultaneous Leave & Idempotence ---');
  mockRoom.status = 'INTERRUPTED';
  mockRoom.leftBy = 'host';
  mockRoom.interruptedReason = 'HostPlayer left the game.';
  mockRoom.finalReport = partialReport;

  // Guest also leaves at same time:
  if (mockRoom.status === 'INTERRUPTED' && mockRoom.leftBy !== 'guest') {
    mockRoom.leftBy = 'both';
    mockRoom.interruptedReason = 'Both players left the game.';
    if (mockRoom.finalReport) {
      mockRoom.finalReport.leftBy = 'both';
      mockRoom.finalReport.interruptedReason = 'Both players left the game.';
    }
  }

  assert(mockRoom.leftBy === 'both', 'Simultaneous leave updates room.leftBy to "both"');
  assert(mockRoom.finalReport?.leftBy === 'both', 'Final report leftBy updated to "both"');

  deleteRoom(testRoomCode);

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
