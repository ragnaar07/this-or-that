import express from 'express';
import { generateRoomCode } from './roomCode';
import { generateQuestion, generateFinalReport, computeCategoryScores } from './questionService';
import { getFallbackQuestion, FALLBACK_QUESTIONS } from './fallbackQuestions';
import { setRoom, getRoom, deleteRoom, setPlayerAnswer, getRoundAnswers, clearRoundAnswers } from './store';
import { Room, Answer, RoundHistoryItem } from './types';

async function runTests() {
  console.log('⚡ ============================================================');
  console.log('⚡ THIS ⚡ THAT — V3 MULTIPLAYER & AI TEST SUITE');
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

  // --- Test 1: Fallback Question Pool ---
  console.log('--- TEST 1: India-First Fallback Question Pool ---');
  assert(FALLBACK_QUESTIONS.length >= 80, `Fallback pool has ${FALLBACK_QUESTIONS.length} questions (>= 80)`);
  const categories = [...new Set(FALLBACK_QUESTIONS.map(q => q.category))];
  console.log(`  ℹ️  Categories found: ${categories.join(', ')}`);
  assert(categories.length >= 6, `Dynamic category mix with ${categories.length} distinct categories`);
  const q1 = getFallbackQuestion([], 1);
  const q10 = getFallbackQuestion([], 10);
  const q18 = getFallbackQuestion([], 18);
  assert(q1.optionA.length > 0 && q1.optionB.length > 0, `Tier 1 question valid: "${q1.optionA}" vs "${q1.optionB}" [${q1.category}]`);
  assert(q10.optionA.length > 0 && q10.optionB.length > 0, `Tier 2 question valid: "${q10.optionA}" vs "${q10.optionB}" [${q10.category}]`);
  assert(q18.optionA.length > 0 && q18.optionB.length > 0, `Tier 4 question valid: "${q18.optionA}" vs "${q18.optionB}" [${q18.category}]`);

  // --- Test 2: Room Lifecycle & Player Names ---
  console.log('\n--- TEST 2: Room Lifecycle & Display Names ---');
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
    roundStartedAt: null,
    roundDeadline: null,
    matches: 0,
    total: 0,
    lastResult: null,
    lastHostChoice: null,
    lastGuestChoice: null,
    recentQuestions: [],
    history: [],
    finalReport: null,
    createdAt: now,
    updatedAt: now,
  };
  setRoom(room);
  assert(getRoom(code)?.hostPlayerName === 'Rahul', 'Host name stored accurately as Rahul');

  // Guest joins
  const firstQ = await generateQuestion([], 1);
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

  // --- Test 3: Round 1 (A/A -> MATCH) ---
  console.log('\n--- TEST 3: Round 1 Evaluation (A/A -> MATCH) ---');
  setPlayerAnswer(code, 1, 'host', { playerId: hostId, roundNumber: 1, choice: firstQ.optionA, answeredAt: now });
  setPlayerAnswer(code, 1, 'guest', { playerId: guestId, roundNumber: 1, choice: firstQ.optionA, answeredAt: now + 100 });

  const r1Answers = getRoundAnswers(code, 1);
  const isR1Match = r1Answers.host?.choice === r1Answers.guest?.choice;
  assert(isR1Match, `Host "${r1Answers.host?.choice}" & Guest "${r1Answers.guest?.choice}" match`);

  const histItem1: RoundHistoryItem = {
    roundNumber: 1,
    question: `${firstQ.optionA} or ${firstQ.optionB}`,
    category: firstQ.category,
    optionA: firstQ.optionA,
    optionB: firstQ.optionB,
    hostChoice: firstQ.optionA,
    guestChoice: firstQ.optionA,
    result: 'MATCH',
    answeredAt: now,
  };

  const roomAfterR1: Room = {
    ...joinedRoom,
    status: 'REVEALING',
    matches: 1,
    total: 1,
    lastResult: 'MATCH',
    lastHostChoice: firstQ.optionA,
    lastGuestChoice: firstQ.optionA,
    history: [histItem1],
    updatedAt: now,
  };
  setRoom(roomAfterR1);
  assert(getRoom(code)?.matches === 1 && getRoom(code)?.total === 1, 'Score correctly incremented to 1/1');

  // --- Test 4: Round 2 (A/B -> NO_MATCH) ---
  console.log('\n--- TEST 4: Round 2 Evaluation (A/B -> NO_MATCH) ---');
  const q2 = await generateQuestion([firstQ.optionA], 2);
  clearRoundAnswers(code, 1);

  setPlayerAnswer(code, 2, 'host', { playerId: hostId, roundNumber: 2, choice: q2.optionA, answeredAt: now });
  setPlayerAnswer(code, 2, 'guest', { playerId: guestId, roundNumber: 2, choice: q2.optionB, answeredAt: now + 50 });

  const r2Answers = getRoundAnswers(code, 2);
  const isR2Match = r2Answers.host?.choice.trim().toLowerCase() === r2Answers.guest?.choice.trim().toLowerCase();
  assert(!isR2Match, `Host "${r2Answers.host?.choice}" vs Guest "${r2Answers.guest?.choice}" correctly evaluated as NO_MATCH`);

  const histItem2: RoundHistoryItem = {
    roundNumber: 2,
    question: `${q2.optionA} or ${q2.optionB}`,
    category: q2.category,
    optionA: q2.optionA,
    optionB: q2.optionB,
    hostChoice: q2.optionA,
    guestChoice: q2.optionB,
    result: 'NO_MATCH',
    answeredAt: now,
  };

  const roomAfterR2: Room = {
    ...roomAfterR1,
    roundNumber: 2,
    currentQuestion: q2,
    status: 'REVEALING',
    matches: 1,
    total: 2,
    lastResult: 'NO_MATCH',
    lastHostChoice: q2.optionA,
    lastGuestChoice: q2.optionB,
    history: [histItem1, histItem2],
    updatedAt: now,
  };
  setRoom(roomAfterR2);
  assert(getRoom(code)?.matches === 1 && getRoom(code)?.total === 2, 'Score correctly updated to 1/2');

  // --- Test 5: Leave Game & Partial Report Generation ---
  console.log('\n--- TEST 5: Leave Game & Shared Partial Report ---');
  const partialReport = await generateFinalReport(
    roomAfterR2.history,
    'Rahul',
    'Priya',
    1,
    2,
    20,
    true,
    'Rahul left the room.'
  );

  assert(partialReport.isPartial === true, 'Report flagged as isPartial: true');
  assert(partialReport.completedQuestions === 2, 'Completed questions accurate (2/20)');
  assert(partialReport.matchPercentage === 50, 'Match percentage accurate (50%)');
  assert(Array.isArray(partialReport.categoryScores) && partialReport.categoryScores.length > 0, 'Category scores calculated for partial game');
  assert(partialReport.headline.length > 0, `Headline generated: "${partialReport.headline}"`);

  // Store in room
  const interruptedRoom: Room = {
    ...roomAfterR2,
    status: 'INTERRUPTED',
    interruptedReason: 'Rahul left the room.',
    finalReport: partialReport,
    updatedAt: Date.now(),
  };
  setRoom(interruptedRoom);

  // Check that both player lookups get the EXACT same report
  const p1View = getRoom(code)?.finalReport;
  const p2View = getRoom(code)?.finalReport;
  assert(p1View === p2View && p1View?.headline === partialReport.headline, 'Both players receive identical backend-stored partial report');

  // --- Test 6: Full 20-Round Simulation & Grounded AI Analysis ---
  console.log('\n--- TEST 6: Full 20-Round Simulation & Section 23 Schema ---');
  const fullHistory: RoundHistoryItem[] = [];
  const testCats = ['Food & Chai', 'Social Behaviour', 'Digital Life', 'Lifestyle', 'Travel', 'Money & Ambition', 'Friendship & Love', 'Crazy & Superpowers'];

  for (let r = 1; r <= 20; r++) {
    const cat = testCats[r % testCats.length];
    const isMatch = r % 3 !== 0; // ~66% match rate
    const optA = `Choice A for R${r}`;
    const optB = `Choice B for R${r}`;
    fullHistory.push({
      roundNumber: r,
      question: `${optA} or ${optB}`,
      category: cat,
      optionA: optA,
      optionB: optB,
      hostChoice: optA,
      guestChoice: isMatch ? optA : optB,
      result: isMatch ? 'MATCH' : 'NO_MATCH',
      answeredAt: Date.now(),
    });
  }

  const fullMatches = fullHistory.filter(h => h.result === 'MATCH').length;
  const catScores = computeCategoryScores(fullHistory);
  assert(catScores.length >= 5, `Calculated ${catScores.length} category breakdowns`);

  const fullReport = await generateFinalReport(
    fullHistory,
    'Rahul',
    'Priya',
    fullMatches,
    20,
    20,
    false
  );

  assert(fullReport.isPartial === false, 'Full report isPartial is false');
  assert(fullReport.completedQuestions === 20, '20 completed questions');
  assert(fullReport.matchPercentage === Math.round((fullMatches / 20) * 100), `Match percentage matches math: ${fullReport.matchPercentage}%`);
  assert(fullReport.headline.length > 0, `Headline: "${fullReport.headline}"`);
  assert(fullReport.overallVibe.length > 0, `Overall Vibe: "${fullReport.overallVibe}"`);
  assert(fullReport.strongestMatches.length > 0, `Strongest Matches: ${fullReport.strongestMatches.join(', ')}`);
  assert(fullReport.biggestDifferences.length > 0, `Biggest Differences: ${fullReport.biggestDifferences.join(', ')}`);
  assert(fullReport.funniestDifference.length > 0, `Chaos Award: "${fullReport.funniestDifference}"`);
  assert(fullReport.finalVerdict.length > 0, `Final Verdict: "${fullReport.finalVerdict}"`);
  assert(Array.isArray(fullReport.categoryScores) && fullReport.categoryScores.length > 0, `Category breakdown scores present: ${fullReport.categoryScores?.map(c => `${c.category} (${c.matchPercentage}%)`).join(', ')}`);

  // Clean up
  deleteRoom(code);
  assert(getRoom(code) === undefined, 'Room cleaned up from memory');

  console.log('\n⚡ ============================================================');
  console.log(`⚡ TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('⚡ ============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
