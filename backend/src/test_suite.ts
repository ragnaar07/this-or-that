// ============================================================
// Comprehensive Test Suite — THIS ⚡ THAT V6 (Dataset & Ultra-Fast Engine)
// ============================================================

import { generateQuestion, generateFinalReport, computeCategoryScores, computeAchievements, computePredictionScore, generateLiveReaction } from './questionService';
import { getFallbackQuestion, getRoundTypeForRound, getRoundConfiguration, FALLBACK_QUESTIONS, isDuplicateQuestion, normalizeSignature, getTotalQuestionCount } from './fallbackQuestions';
import {
  setRoom,
  getRoom,
  deleteRoom,
  setPlayerAnswer,
  getRoundAnswers,
  clearRoundAnswers,
  saveGameResult,
  getGameResult,
  cleanupExpiredGameResults,
} from './store';
import { checkRateLimit, cleanupTransientPresenceState, handleExplicitDisconnect, handleVoluntaryLeave, registerPlayerPresence } from './presenceService';
import { Room, RoundHistoryItem, Question } from './types';
import questionsData from './dataset/questionsData.json';

async function runTests() {
  console.log('⚡ ============================================================');
  console.log('⚡ THIS ⚡ THAT — QUESTIONS & HIGH-SPEED ENGINE AUDIT');
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

  // --- Test 1: Questions Dataset Size & Structure ---
  console.log('--- TEST 1: Dataset Size & Structure ---');
  const totalCount = getTotalQuestionCount();
  assert(totalCount === FALLBACK_QUESTIONS.length, `Dataset count matches fallback pool (Actual: ${totalCount})`);
  assert(totalCount >= 1000, `Dataset contains a production-sized pool (Actual: ${totalCount})`);
  assert(FALLBACK_QUESTIONS[0].optionA === 'Pizza' && FALLBACK_QUESTIONS[0].optionB === 'Burgers', 'Question #1 is Pizza vs Burgers');
  const lastQuestion = FALLBACK_QUESTIONS[FALLBACK_QUESTIONS.length - 1];
  assert(Boolean(lastQuestion?.optionA && lastQuestion?.optionB && lastQuestion?.category), 'Last question has complete option/category structure');

  // --- Test 2: Sub-millisecond Generation Speed Benchmark ---
  console.log('\n--- TEST 2: Performance Benchmark (<1ms per question) ---');
  const startTime = Date.now();
  const benchmarkCount = 500;
  for (let i = 1; i <= benchmarkCount; i++) {
    generateQuestion([], [], i % 20 + 1, undefined, 'RANDOM');
  }
  const elapsed = Date.now() - startTime;
  const avgMs = (elapsed / benchmarkCount).toFixed(3);
  console.log(`  ℹ️ Generated ${benchmarkCount} questions in ${elapsed}ms (Average: ${avgMs}ms per question)`);
  assert(elapsed < 100, `500 questions generated in under 100ms (Actual: ${elapsed}ms)`);

  // --- Test 3: Round Configurations & Timers ---
  console.log('\n--- TEST 3: Question Formats & Authoritative Timers ---');
  const r1Config = getRoundConfiguration(1);
  assert(r1Config.format === 'QUICK' && r1Config.timeLimit === 10, 'Round 1 is QUICK format with 10-second timer');

  const r2Config = getRoundConfiguration(2);
  assert(r2Config.format === 'SITUATIONAL' && r2Config.timeLimit === 16, 'Round 2 is SITUATIONAL format with 16-second timer');

  const r9Config = getRoundConfiguration(9);
  assert(r9Config.roundType === 'CHAOS' && r9Config.timeLimit === 16, 'Round 9 is CHAOS with 16-second timer');

  const r10Config = getRoundConfiguration(10);
  assert(r10Config.roundType === 'PREDICTION' && r10Config.timeLimit === 20, 'Round 10 is PREDICTION with 20-second timer');

  const r15Config = getRoundConfiguration(15);
  assert(r15Config.roundType === 'DOUBLE_POINTS' && r15Config.timeLimit === 16, 'Round 15 is DOUBLE_POINTS with 16-second timer');

  // --- Test 4: Game Modes Filtering ---
  console.log('\n--- TEST 4: Game Modes Filtering ---');
  const rawQuestions = questionsData as Array<{ category: string; gameModes?: string[] }>;
  const categoriesForMode = (mode: string) =>
    new Set(rawQuestions.filter(q => (q.gameModes || []).includes(mode)).map(q => q.category));
  const classicCategories = categoriesForMode('CLASSIC');
  const debateCategories = categoriesForMode('DEBATE');
  const chaosCategories = categoriesForMode('CHAOS');

  const funQ = await generateQuestion([], [], 1, undefined, 'FUN');
  assert(classicCategories.has(funQ.category), `FUN alias returns a CLASSIC question (Got: "${funQ.category}" - ${funQ.optionA} vs ${funQ.optionB})`);

  const deepQ = await generateQuestion([], [], 1, undefined, 'DEEP');
  assert(debateCategories.has(deepQ.category), `DEEP alias returns a debate/deep question (Got: "${deepQ.category}" - ${deepQ.optionA} vs ${deepQ.optionB})`);

  const debateQ = await generateQuestion([], [], 1, undefined, 'DEBATE');
  assert(debateCategories.has(debateQ.category), `DEBATE mode returns a debate-category question (Got: "${debateQ.category}" - ${debateQ.optionA} vs ${debateQ.optionB})`);

  const chaosQ = await generateQuestion([], [], 1, undefined, 'CHAOS');
  assert(chaosCategories.has(chaosQ.category), `CHAOS mode returns chaos-category question (Got: "${chaosQ.category}")`);

  // --- Test 5: Dynamic 20-Round Non-repeating Flow ---
  console.log('\n--- TEST 5: 20-Round Flow & Anti-Clustering ---');
  const sequence: Question[] = [];
  const recentQs: string[] = [];
  const recentCats: string[] = [];

  for (let r = 1; r <= 20; r++) {
    const q = await generateQuestion(recentQs, recentCats, r, getRoundTypeForRound(r), 'RANDOM');
    sequence.push(q);
    recentQs.push(q.optionA);
    recentCats.push(q.category);
  }

  const quickCount = sequence.filter(q => q.format === 'QUICK').length;
  const uniqueOptionAs = new Set(sequence.map(q => q.optionA));
  console.log(`  ℹ️ 20-Round Summary: ${quickCount} Quick rounds, ${20 - quickCount} Situational/Chaos/Prediction rounds. ${uniqueOptionAs.size}/20 unique choices.`);
  assert(uniqueOptionAs.size === 20, 'Zero duplicate questions in 20 rounds');
  assert(quickCount >= 6 && quickCount <= 12, 'Balanced alternating pace between fast instinct and deep dilemmas');

  // --- Test 6: Fast Final Analysis Report (Nice, Fun, Brutal) ---
  console.log('\n--- TEST 6: Fast Grounded Analysis Reports (<2ms) ---');
  const history: RoundHistoryItem[] = [];

  for (let r = 1; r <= 10; r++) {
    const isQuick = r % 2 !== 0;
    const isMatch = r % 3 !== 0;
    const optA = `Option A for R${r}`;
    const optB = `Option B for R${r}`;

    history.push({
      roundNumber: r,
      question: `${optA} or ${optB}`,
      category: isQuick ? 'Food & Chai' : 'Bollywood & Cinema',
      format: isQuick ? 'QUICK' : 'SITUATIONAL',
      questionType: isQuick ? 'QUICK' : 'SITUATIONAL',
      timeLimit: isQuick ? 10 : 16,
      optionA: optA,
      optionB: optB,
      roundType: r === 9 ? 'CHAOS' : r === 10 ? 'PREDICTION' : 'NORMAL',
      hostChoice: optA,
      guestChoice: isMatch ? optA : optB,
      hostPrediction: r === 10 ? optA : undefined,
      guestPrediction: r === 10 ? optA : undefined,
      hostPredictionResult: r === 10 ? 'CORRECT' : undefined,
      guestPredictionResult: r === 10 ? 'CORRECT' : undefined,
      result: isMatch ? 'MATCH' : 'NO_MATCH',
      pointsAwarded: isMatch ? 1 : 0,
      answeredAt: Date.now(),
    });
  }

  const matches = history.filter(h => h.result === 'MATCH').length;

  const repStart = Date.now();
  const funReport = await generateFinalReport(history, 'Kabir', 'Rhea', matches, 10, 20, false, undefined, 'RANDOM', 'fun');
  const repElapsed = Date.now() - repStart;

  console.log(`  ℹ️ Final report generated in ${repElapsed}ms: "${funReport.headline}" (${funReport.matchPercentage}% match)`);
  assert(repElapsed < 10, `Report generation executed in under 10ms (Actual: ${repElapsed}ms)`);
  assert(funReport.matchPercentage === 70, `Match percentage accurately computed (70%)`);
  assert(funReport.instinctMatchPercentage !== undefined, `Instinct match percentage computed: ${funReport.instinctMatchPercentage}%`);
  assert(funReport.strategicMatchPercentage !== undefined, `Strategic match percentage computed: ${funReport.strategicMatchPercentage}%`);
  assert((funReport.achievements?.length ?? 0) > 0, `Achievements unlocked: ${(funReport.achievements || []).map(a => a.title).join(', ')}`);

  // Brutal tone check
  const brutalReport = await generateFinalReport(history, 'Kabir', 'Rhea', matches, 10, 20, false, undefined, 'RANDOM', 'brutal');
  assert(brutalReport.headline.length > 0, `Brutal headline: "${brutalReport.headline}"`);
  assert(brutalReport.finalVerdict.length > 0, `Brutal verdict: "${brutalReport.finalVerdict}"`);

  // --- Test 7: Live Reaction Engine ---
  console.log('\n--- TEST 7: Live Reaction System ---');
  const matchRx = generateLiveReaction(true, 3, 'NORMAL');
  const diffRx = generateLiveReaction(false, -3, 'NORMAL');
  const dblRx = generateLiveReaction(true, 1, 'DOUBLE_POINTS');
  const predRx = generateLiveReaction(false, 0, 'PREDICTION', true, true);

  assert(matchRx.includes('⚡') || matchRx.includes('SAME BRAIN') || matchRx.includes('sync'), `Match reaction: "${matchRx}"`);
  assert(diffRx.includes('💀') || diffRx.includes('OPPOSITE') || diffRx.includes('universe'), `Mismatch reaction: "${diffRx}"`);
  assert(dblRx.includes('2X SCORE'), `Double points reaction: "${dblRx}"`);
  assert(predRx.includes('DOUBLE MIND READERS'), `Prediction reaction: "${predRx}"`);

  // --- Test 8: Room Lifecycle & Instant Leave Flow ---
  console.log('\n--- TEST 8: Room Lifecycle & Leave Flow ---');
  const roomCode = 'TEST';
  const testRoom: Room = {
    code: roomCode,
    hostPlayerId: 'h1',
    hostPlayerName: 'HostPlayer',
    hostLastSeenAt: Date.now(),
    hostSessionId: 'host_session',
    guestPlayerId: 'g1',
    guestPlayerName: 'GuestPlayer',
    guestLastSeenAt: Date.now(),
    guestSessionId: 'guest_session',
    deepPsychology: false,
    status: 'PLAYING',
    roundNumber: 5,
    totalRounds: 20,
    currentQuestion: sequence[0],
    currentRoundType: 'NORMAL',
    currentTimeLimit: 10,
    currentQuestionFormat: 'QUICK',
    roundStartedAt: Date.now(),
    roundDeadline: Date.now() + 10000,
    matches: 3,
    total: 4,
    score: 3,
    streak: 1,
    lastResult: 'MATCH',
    lastHostChoice: 'Pizza',
    lastGuestChoice: 'Pizza',
    recentQuestions: ['Pizza'],
    recentCategories: ['Food & Chai'],
    history: history.slice(0, 4),
    finalReport: null,
    gameMode: 'RANDOM',
    aiTone: 'fun',
    stateVersion: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  setRoom(testRoom);
  const retrieved = getRoom(roomCode);
  assert(retrieved !== undefined && retrieved.code === roomCode, 'Room stored and retrieved successfully');

  const invalidLeave = await handleVoluntaryLeave(roomCode, 'intruder');
  assert(!invalidLeave.success && invalidLeave.error === 'Player identity mismatch.', 'Unknown player cannot voluntarily leave or forfeit a room');
  assert(getRoom(roomCode)?.status === 'PLAYING', 'Unknown player leave attempt does not mutate room state');

  const invalidDisconnect = handleExplicitDisconnect(roomCode, 'intruder', 'host_session');
  assert(!invalidDisconnect.success, 'Unknown player cannot disconnect a room');
  const wrongSessionDisconnect = handleExplicitDisconnect(roomCode, 'h1', 'wrong_session');
  assert(!wrongSessionDisconnect.success, 'Wrong session cannot disconnect a valid player');
  assert(getRoom(roomCode)?.status === 'PLAYING', 'Invalid disconnect attempts do not mutate room state');

  const firstAnswerWrite = setPlayerAnswer(roomCode, 5, 'host', {
    playerId: 'h1',
    roundNumber: 5,
    choice: 'Pizza',
    prediction: 'Pizza',
    answeredAt: Date.now(),
  });
  assert(firstAnswerWrite === 'created', 'First answer write is accepted');

  const duplicateAnswerWrite = setPlayerAnswer(roomCode, 5, 'host', {
    playerId: 'h1',
    roundNumber: 5,
    choice: 'Pizza',
    prediction: 'Pizza',
    answeredAt: Date.now(),
  });
  assert(duplicateAnswerWrite === 'duplicate', 'Identical answer retry is treated as idempotent duplicate');

  const conflictingAnswerWrite = setPlayerAnswer(roomCode, 5, 'host', {
    playerId: 'h1',
    roundNumber: 5,
    choice: 'Burgers',
    prediction: 'Pizza',
    answeredAt: Date.now(),
  });
  assert(conflictingAnswerWrite === 'conflict', 'Changed answer retry is rejected as conflict');
  assert(getRoundAnswers(roomCode, 5).host?.choice === 'Pizza', 'Conflicting answer does not overwrite locked answer');

  clearRoundAnswers(roomCode, 5);
  deleteRoom(roomCode);
  assert(getRoom(roomCode) === undefined, 'Room cleaned up successfully');

  saveGameResult({
    gameId: 'TEST_GAME_OLD',
    roomCode: 'OLD1',
    player1Id: 'p1',
    player2Id: 'p2',
    winnerId: null,
    loserId: null,
    winnerName: null,
    loserName: null,
    resultType: 'NORMAL',
    completionReason: 'NORMAL_COMPLETION',
    completedAt: Date.now() - 10_000,
    finalReport: funReport,
  });
  assert(getGameResult('OLD1') !== undefined, 'Completed game result can be retrieved before cleanup');
  const removedResultKeys = cleanupExpiredGameResults(Date.now(), 1_000);
  assert(removedResultKeys >= 2, 'Expired completed game result keys are removed');
  assert(getGameResult('OLD1') === undefined && getGameResult('TEST_GAME_OLD') === undefined, 'Expired game result is no longer retrievable');

  registerPlayerPresence('GONE', 'p1', 's1', 'OldPlayer', 'host', 'ip_hash');
  checkRateLimit('expired_test_limit', 1, 1);
  const transientCleanup = cleanupTransientPresenceState(Date.now() + 2);
  assert(transientCleanup.removedPresences >= 1, 'Orphaned presence records are cleaned up');
  assert(transientCleanup.removedRateLimits >= 1, 'Expired rate limit records are cleaned up');

  console.log('\n============================================================');
  console.log(`⚡ AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
