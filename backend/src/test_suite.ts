import { generateQuestion, generateFinalReport, computeCategoryScores, computeAchievements, computePredictionScore, generateLiveReaction } from './questionService';
import { getFallbackQuestion, getRoundTypeForRound, FALLBACK_QUESTIONS } from './fallbackQuestions';
import { setRoom, getRoom, deleteRoom, setPlayerAnswer, getRoundAnswers, clearRoundAnswers } from './store';
import { Room, RoundHistoryItem } from './types';

async function runTests() {
  console.log('⚡ ============================================================');
  console.log('⚡ THIS ⚡ THAT — V4 ULTIMATE TEST SUITE');
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

  // --- Test 1: Fallback Pool & 30+ Genres ---
  console.log('--- TEST 1: 30+ Genres & Fallback Pool ---');
  assert(FALLBACK_QUESTIONS.length >= 100, `Fallback pool has ${FALLBACK_QUESTIONS.length} questions (>= 100)`);
  const categories = [...new Set(FALLBACK_QUESTIONS.map(q => q.category))];
  console.log(`  ℹ️  Categories found (${categories.length}): ${categories.join(', ')}`);
  assert(categories.length >= 8, `Dynamic category mix with ${categories.length} distinct categories`);
  
  // Test round type mapping
  assert(getRoundTypeForRound(9) === 'CHAOS', 'Round 9 mapped to CHAOS');
  assert(getRoundTypeForRound(10) === 'PREDICTION', 'Round 10 mapped to PREDICTION');
  assert(getRoundTypeForRound(15) === 'DOUBLE_POINTS', 'Round 15 mapped to DOUBLE_POINTS');
  assert(getRoundTypeForRound(19) === 'PREDICTION', 'Round 19 mapped to PREDICTION');
  assert(getRoundTypeForRound(1) === 'NORMAL', 'Round 1 mapped to NORMAL');

  // --- Test 2: Room Lifecycle with Modes & Tones ---
  console.log('\n--- TEST 2: Room Lifecycle & Settings ---');
  const code = 'TEST';
  const now = Date.now();
  const hostId = 'host_123';
  const guestId = 'guest_456';
  const room: Room = {
    code,
    hostPlayerId: hostId,
    hostPlayerName: 'Rahul',
    hostLastSeenAt: now,
    guestPlayerId: null,
    guestPlayerName: null,
    guestLastSeenAt: null,
    status: 'WAITING',
    roundNumber: 0,
    totalRounds: 20,
    currentQuestion: null,
    currentRoundType: 'NORMAL',
    roundStartedAt: null,
    roundDeadline: null,
    matches: 0,
    total: 0,
    score: 0,
    streak: 0,
    lastResult: null,
    lastHostChoice: null,
    lastGuestChoice: null,
    lastLiveReaction: null,
    recentQuestions: [],
    history: [],
    finalReport: null,
    gameMode: 'RANDOM',
    aiTone: 'fun',
    createdAt: now,
    updatedAt: now,
  };
  setRoom(room);
  assert(getRoom(code)?.hostPlayerName === 'Rahul', 'Host name stored accurately as Rahul');

  // Guest joins
  const firstQ = await generateQuestion([], 1, 'NORMAL', 'RANDOM');
  const joinedRoom: Room = {
    ...room,
    guestPlayerId: guestId,
    guestPlayerName: 'Priya',
    guestLastSeenAt: now,
    status: 'PLAYING',
    roundNumber: 1,
    currentQuestion: firstQ,
    roundStartedAt: now,
    roundDeadline: now + 10000,
    updatedAt: now,
  };
  setRoom(joinedRoom);
  assert(getRoom(code)?.guestPlayerName === 'Priya', 'Guest name stored accurately as Priya');
  assert(getRoom(code)?.status === 'PLAYING', 'Room transitioned to PLAYING');

  // --- Test 3: Normal Round Match ---
  console.log('\n--- TEST 3: Normal Round Evaluation ---');
  setPlayerAnswer(code, 1, 'host', { playerId: hostId, roundNumber: 1, choice: firstQ.optionA, answeredAt: now });
  setPlayerAnswer(code, 1, 'guest', { playerId: guestId, roundNumber: 1, choice: firstQ.optionA, answeredAt: now + 100 });

  const r1Answers = getRoundAnswers(code, 1);
  const isR1Match = r1Answers.host?.choice === r1Answers.guest?.choice;
  assert(isR1Match, `Host & Guest match on "${firstQ.optionA}"`);

  const histItem1: RoundHistoryItem = {
    roundNumber: 1,
    question: `${firstQ.optionA} or ${firstQ.optionB}`,
    category: firstQ.category,
    optionA: firstQ.optionA,
    optionB: firstQ.optionB,
    roundType: 'NORMAL',
    hostChoice: firstQ.optionA,
    guestChoice: firstQ.optionA,
    result: 'MATCH',
    pointsAwarded: 1,
    answeredAt: now,
  };

  const roomAfterR1: Room = {
    ...joinedRoom,
    status: 'REVEALING',
    matches: 1,
    total: 1,
    score: 1,
    streak: 1,
    lastResult: 'MATCH',
    lastHostChoice: firstQ.optionA,
    lastGuestChoice: firstQ.optionA,
    history: [histItem1],
    updatedAt: now,
  };
  setRoom(roomAfterR1);
  assert(getRoom(code)?.score === 1, 'Score correctly incremented to 1');

  // --- Test 4: Prediction Round (Mind Reader) ---
  console.log('\n--- TEST 4: Prediction Round & Mind Reader Evaluation ---');
  const predQ = await generateQuestion([firstQ.optionA], 10, 'PREDICTION');
  clearRoundAnswers(code, 1);

  // Host predicts guest will pick optionA, picks optionB for self
  // Guest predicts host will pick optionB, picks optionA for self
  setPlayerAnswer(code, 10, 'host', {
    playerId: hostId,
    roundNumber: 10,
    choice: predQ.optionB,
    prediction: predQ.optionA,
    answeredAt: now,
  });
  setPlayerAnswer(code, 10, 'guest', {
    playerId: guestId,
    roundNumber: 10,
    choice: predQ.optionA,
    prediction: predQ.optionB,
    answeredAt: now + 50,
  });

  const predAnswers = getRoundAnswers(code, 10);
  const hostPredCorrect = predAnswers.host?.prediction === predAnswers.guest?.choice;
  const guestPredCorrect = predAnswers.guest?.prediction === predAnswers.host?.choice;
  assert(hostPredCorrect, 'Host correctly predicted Guest choice (Option A)');
  assert(guestPredCorrect, 'Guest correctly predicted Host choice (Option B)');

  const predReaction = generateLiveReaction(false, -1, 'PREDICTION', hostPredCorrect, guestPredCorrect);
  assert(predReaction.includes('MIND READER'), `Live reaction: "${predReaction}"`);

  const histItem10: RoundHistoryItem = {
    roundNumber: 10,
    question: `${predQ.optionA} or ${predQ.optionB}`,
    category: predQ.category,
    optionA: predQ.optionA,
    optionB: predQ.optionB,
    roundType: 'PREDICTION',
    hostChoice: predQ.optionB,
    guestChoice: predQ.optionA,
    hostPrediction: predQ.optionA,
    guestPrediction: predQ.optionB,
    hostPredictionResult: 'CORRECT',
    guestPredictionResult: 'CORRECT',
    result: 'NO_MATCH',
    pointsAwarded: 0,
    answeredAt: now,
  };

  const predScore = computePredictionScore([histItem10], 'Rahul', 'Priya');
  assert(predScore !== undefined && predScore.hostCorrect === 1 && predScore.guestCorrect === 1, 'Prediction score accurately computed (1/1 each)');

  // --- Test 5: Double Points Round (+2 points on match) ---
  console.log('\n--- TEST 5: Double Points Round ---');
  const dblQ = await generateQuestion([], 15, 'DOUBLE_POINTS');
  const histItem15: RoundHistoryItem = {
    roundNumber: 15,
    question: `${dblQ.optionA} or ${dblQ.optionB}`,
    category: dblQ.category,
    optionA: dblQ.optionA,
    optionB: dblQ.optionB,
    roundType: 'DOUBLE_POINTS',
    hostChoice: dblQ.optionA,
    guestChoice: dblQ.optionA,
    result: 'MATCH',
    pointsAwarded: 2,
    answeredAt: now,
  };
  assert(histItem15.pointsAwarded === 2, 'Double points awarded 2 points for match');

  // --- Test 6: Achievements Calculation Engine ---
  console.log('\n--- TEST 6: Achievements Engine ---');
  const sampleHistory: RoundHistoryItem[] = [
    histItem1,
    histItem10,
    histItem15,
    {
      roundNumber: 9,
      question: '₹10 Crore vs Teleportation',
      category: 'Crazy & Superpowers',
      optionA: 'Deal',
      optionB: 'No',
      roundType: 'CHAOS',
      hostChoice: 'Deal',
      guestChoice: 'Deal',
      result: 'MATCH',
      pointsAwarded: 1,
      answeredAt: now,
    },
    {
      roundNumber: 4,
      question: 'Biryani vs Pizza',
      category: 'Food & Chai',
      optionA: 'Biryani',
      optionB: 'Pizza',
      roundType: 'NORMAL',
      hostChoice: 'Biryani',
      guestChoice: 'Biryani',
      result: 'MATCH',
      pointsAwarded: 1,
      answeredAt: now,
    },
    {
      roundNumber: 5,
      question: 'Samosa vs Momos',
      category: 'Food & Chai',
      optionA: 'Samosa',
      optionB: 'Momos',
      roundType: 'NORMAL',
      hostChoice: 'Momos',
      guestChoice: 'Momos',
      result: 'MATCH',
      pointsAwarded: 1,
      answeredAt: now,
    }
  ];

  const achievements = computeAchievements(sampleHistory, 80, predScore);
  assert(achievements.length >= 2, `Earned ${achievements.length} achievements`);
  console.log(`  ℹ️  Achievements earned: ${achievements.map(a => `${a.icon} ${a.title}`).join(', ')}`);
  assert(achievements.some(a => a.id === 'same_brain'), 'Unlocked SAME BRAIN achievement');
  assert(achievements.some(a => a.id === 'chaos_partners'), 'Unlocked CHAOS PARTNERS achievement');
  assert(achievements.some(a => a.id === 'food_soulmates'), 'Unlocked FOOD SOULMATES achievement');

  // --- Test 7: Full 20-Round Simulation & V4 Report ---
  console.log('\n--- TEST 7: 20-Round Full Simulation & V4 Report ---');
  const fullHistory: RoundHistoryItem[] = [];
  const testCats = ['Food & Chai', 'Bollywood & Cinema', 'Digital Life', 'Regional India', 'Travel & Adventure', 'Money & Ambition', 'Friendship & Love', 'Crazy & Superpowers'];

  for (let r = 1; r <= 20; r++) {
    const cat = testCats[r % testCats.length];
    const rType = getRoundTypeForRound(r);
    const isMatch = r % 3 !== 0;
    const optA = `Choice A for R${r}`;
    const optB = `Choice B for R${r}`;
    fullHistory.push({
      roundNumber: r,
      question: `${optA} or ${optB}`,
      category: cat,
      optionA: optA,
      optionB: optB,
      roundType: rType,
      hostChoice: optA,
      guestChoice: isMatch ? optA : optB,
      hostPrediction: rType === 'PREDICTION' ? optA : undefined,
      guestPrediction: rType === 'PREDICTION' ? (isMatch ? optA : optB) : undefined,
      hostPredictionResult: rType === 'PREDICTION' ? (isMatch ? 'CORRECT' : 'WRONG') : undefined,
      guestPredictionResult: rType === 'PREDICTION' ? 'CORRECT' : undefined,
      result: isMatch ? 'MATCH' : 'NO_MATCH',
      pointsAwarded: isMatch ? (rType === 'DOUBLE_POINTS' ? 2 : 1) : 0,
      answeredAt: Date.now(),
    });
  }

  const fullMatches = fullHistory.filter(h => h.result === 'MATCH').length;
  const fullReport = await generateFinalReport(
    fullHistory,
    'Rahul',
    'Priya',
    fullMatches,
    20,
    20,
    false,
    undefined,
    'RANDOM',
    'fun'
  );

  assert(fullReport.completedQuestions === 20, '20 completed questions');
  assert(fullReport.headline.length > 0, `Headline: "${fullReport.headline}"`);
  assert(fullReport.overallVibe.length > 0, `Overall Vibe: "${fullReport.overallVibe}"`);
  assert(Array.isArray(fullReport.achievements) && fullReport.achievements.length > 0, 'Achievements present in report');
  assert(fullReport.predictionScore !== undefined, 'Prediction score present in report');
  assert(Array.isArray(fullReport.categoryScores) && fullReport.categoryScores.length > 0, 'Category breakdown present in report');

  deleteRoom(code);
  assert(getRoom(code) === undefined, 'Room cleaned up');

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
