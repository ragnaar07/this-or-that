// ============================================================
// Automated Presence, Anti-Abuse & Auto-Result Test Suite
// ============================================================

import {
  hashIp,
  checkSameRoomIpCollision,
  registerPlayerPresence,
  handleHeartbeat,
  handlePlayerReconnect,
  handleExplicitDisconnect,
  handleVoluntaryLeave,
  checkInactivityAndFinalize,
  checkRateLimit,
} from './presenceService';
import {
  getRoom,
  setRoom,
  deleteRoom,
  getGameResult,
} from './store';
import { Room } from './types';

async function runPresenceTestSuite() {
  console.log('🧪 Starting Sync Mind Presence & Anti-Abuse Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- TEST 1: Salted SHA-256 IP Hashing ---
  console.log('--- TEST 1: IP Hashing ---');
  const ip1 = '192.168.1.100';
  const hash1 = hashIp(ip1);
  const hash2 = hashIp(ip1);
  const hashOther = hashIp('192.168.1.101');
  assert(hash1.length === 64, 'SHA-256 hash length is 64 hex characters');
  assert(hash1 === hash2, 'Identical IPs yield deterministic hashes');
  assert(hash1 !== hashOther, 'Different IPs yield different hashes');
  assert(hashIp('::1') === hashIp('127.0.0.1'), 'IPv6 localhost normalizes to 127.0.0.1');

  function createTestRoom(code: string, hostId: string, hostName: string, hostIp: string): Room {
    const now = Date.now();
    return {
      code,
      hostPlayerId: hostId,
      hostPlayerName: hostName,
      hostGender: 'other',
      hostLastSeenAt: now,
      hostIpHash: hostIp,
      hostSessionId: 'sess_' + hostId,
      guestPlayerId: null,
      guestPlayerName: null,
      guestGender: 'other',
      guestLastSeenAt: null,
      guestIpHash: null,
      guestSessionId: null,
      deepPsychology: true,
      status: 'WAITING',
      roundNumber: 0,
      totalRounds: 10,
      currentQuestion: null,
      currentRoundType: 'NORMAL',
      currentTimeLimit: 10,
      currentQuestionFormat: 'QUICK',
      roundStartedAt: null,
      roundDeadline: null,
      matches: 0,
      total: 0,
      score: 0,
      streak: 0,
      lastResult: null,
      lastHostChoice: null,
      lastGuestChoice: null,
      recentQuestions: [],
      recentCategories: [],
      history: [],
      finalReport: null,
      gameMode: 'INDIA',
      aiTone: 'fun',
      stateVersion: 1,
      createdAt: now,
      updatedAt: now,
    };
  }

  // --- TEST 2: 1 Player Per IP in Same Room Collision ---
  console.log('\n--- TEST 2: Same Room IP Collision & Different Rooms Allowance ---');
  const testRoomCode = 'TEST';
  const dummyRoom = createTestRoom(testRoomCode, 'host_p1', 'Host Player', hash1);
  setRoom(dummyRoom);

  const collisionResult = checkSameRoomIpCollision(testRoomCode, hash1);
  assert(!collisionResult.allowed, 'Same IP rejected in the same room');
  assert(collisionResult.error === 'Ek device/network se already ek player game mein hai.', 'Returns exact Hindi error message');

  const otherIpCheck = checkSameRoomIpCollision(testRoomCode, hashOther);
  assert(otherIpCheck.allowed, 'Different IP allowed in the same room');

  const differentRoomCollision = checkSameRoomIpCollision('ROOM2', hash1);
  assert(differentRoomCollision.allowed, 'Same IP allowed in a different room');

  // --- TEST 3: Player Presence Registration & Heartbeat ---
  console.log('\n--- TEST 3: Player Presence Registration & Heartbeat ---');
  dummyRoom.hostSessionId = 'session_h1';
  const hostPres = registerPlayerPresence(testRoomCode, 'host_p1', 'session_h1', 'Host Player', 'host', hash1);
  assert(hostPres.status === 'CONNECTED', 'Presence registers with CONNECTED status');
  assert(hostPres.sessionId === 'session_h1', 'Presence records sessionId correctly');

  const guestPres = registerPlayerPresence(testRoomCode, 'guest_p2', 'session_g1', 'Guest Player', 'guest', hashOther);
  dummyRoom.guestPlayerId = 'guest_p2';
  dummyRoom.guestPlayerName = 'Guest Player';
  dummyRoom.guestIpHash = hashOther;
  dummyRoom.guestSessionId = 'session_g1';
  dummyRoom.status = 'PLAYING';
  dummyRoom.roundNumber = 1;
  setRoom(dummyRoom);

  const hbResult = handleHeartbeat(testRoomCode, 'host_p1', 'session_h1');
  assert(hbResult.success === true, 'Heartbeat successfully processed for active session');

  // --- TEST 4: Duplicate Session / Tab Detection ---
  console.log('\n--- TEST 4: Duplicate Session / Tab Detection ---');
  const dupResult = handleHeartbeat(testRoomCode, 'host_p1', 'different_tab_session');
  assert(dupResult.success === false, 'Blocked heartbeat from duplicate tab session');
  assert(dupResult.error === 'Game already open in another tab.', 'Returns duplicate tab error message');

  // --- TEST 5: Explicit Disconnect Beacon & 30s Grace Period ---
  console.log('\n--- TEST 5: Explicit Disconnect Beacon & 30s Grace Window ---');
  handleExplicitDisconnect(testRoomCode, 'host_p1', 'session_h1');
  const roomAfterBeacon = getRoom(testRoomCode);
  assert(roomAfterBeacon?.status === 'PLAYER_DISCONNECTED', 'Room moves to PLAYER_DISCONNECTED on fast tab close');
  assert(roomAfterBeacon?.disconnectedPlayerName === 'Host Player', 'Disconnected player name recorded');
  assert(roomAfterBeacon?.disconnectGraceRemaining === 30, 'Grace period starts with 30s remaining');

  // --- TEST 6: Reconnection Within Grace Period ---
  console.log('\n--- TEST 6: Reconnection Within Grace Period ---');
  const reconResult = handlePlayerReconnect(testRoomCode, 'host_p1', 'session_h1');
  assert(reconResult.success === true, 'Player reconnected within grace period');
  const roomAfterRecon = getRoom(testRoomCode);
  assert(roomAfterRecon?.status === 'PLAYING', 'Room restored to PLAYING after reconnection');
  assert(roomAfterRecon?.disconnectedPlayerName === null, 'Disconnect flags cleared upon reconnection');

  // --- TEST 7: Inactivity Timeout & Grace Expiry (Auto Win by Default) ---
  console.log('\n--- TEST 7: Inactivity Timeout & Auto Default Win on Grace Expiry ---');
  // Mark host inactive > 30s ago
  hostPres.lastHeartbeat = Date.now() - 35_000;
  hostPres.status = 'DISCONNECTED';
  roomAfterRecon!.status = 'PLAYER_DISCONNECTED';
  roomAfterRecon!.disconnectStartedAt = Date.now() - 31_000; // grace expired
  setRoom(roomAfterRecon!);

  await checkInactivityAndFinalize();

  const roomAfterGrace = getRoom(testRoomCode);
  assert(roomAfterGrace?.status === 'COMPLETED', 'Room marked COMPLETED after grace expiration');
  assert(roomAfterGrace?.resultType === 'WIN_BY_DEFAULT', 'Result type set to WIN_BY_DEFAULT');
  assert(roomAfterGrace?.winnerPlayerId === 'guest_p2', 'Active guest player awarded winnerId');
  assert(roomAfterGrace?.loserPlayerId === 'host_p1', 'Disconnected host marked as loserId');
  assert(roomAfterGrace?.completionReason === 'PLAYER_DISCONNECTED', 'Completion reason is PLAYER_DISCONNECTED');

  const savedResult = getGameResult(testRoomCode);
  assert(savedResult !== undefined, 'Game result record persisted in store');
  assert(savedResult?.winnerName === 'Guest Player', 'Winner name persisted accurately');

  // --- TEST 8: Voluntary Leave (Immediate Default Win) ---
  console.log('\n--- TEST 8: Voluntary Leave (Instant Win) ---');
  const roomCode2 = 'VOL1';
  const volRoom = createTestRoom(roomCode2, 'vol_host', 'Alice', hash1);
  volRoom.guestPlayerId = 'vol_guest';
  volRoom.guestPlayerName = 'Bob';
  volRoom.guestLastSeenAt = Date.now();
  volRoom.guestIpHash = hashOther;
  volRoom.status = 'PLAYING';
  volRoom.roundNumber = 3;
  setRoom(volRoom);

  const leaveResult = await handleVoluntaryLeave(roomCode2, 'vol_host');
  assert(leaveResult.success === true, 'Voluntary leave executed');
  assert(leaveResult.room?.status === 'COMPLETED', 'Room immediately marked COMPLETED');
  assert(leaveResult.room?.resultType === 'WIN_BY_DEFAULT', 'Result type is WIN_BY_DEFAULT');
  assert(leaveResult.room?.completionReason === 'PLAYER_LEFT', 'Completion reason is PLAYER_LEFT');
  assert(leaveResult.room?.winnerName === 'Bob', 'Bob immediately declared winner');
  assert(leaveResult.room?.loserName === 'Alice', 'Alice recorded as loser');

  // --- TEST 9: Double Disconnect -> ABANDONED / DRAW ---
  console.log('\n--- TEST 9: Double Disconnect (Abandoned / Draw) ---');
  const roomCode3 = 'DRAW';
  const drawRoom = createTestRoom(roomCode3, 'draw_host', 'Player A', hash1);
  drawRoom.hostLastSeenAt = Date.now() - 40_000;
  drawRoom.guestPlayerId = 'draw_guest';
  drawRoom.guestPlayerName = 'Player B';
  drawRoom.guestLastSeenAt = Date.now() - 40_000;
  drawRoom.guestIpHash = hashOther;
  drawRoom.status = 'PLAYER_DISCONNECTED';
  drawRoom.disconnectStartedAt = Date.now() - 32_000;
  drawRoom.roundNumber = 2;
  setRoom(drawRoom);
  const pA = registerPlayerPresence(roomCode3, 'draw_host', 's1', 'Player A', 'host', hash1);
  const pB = registerPlayerPresence(roomCode3, 'draw_guest', 's2', 'Player B', 'guest', hashOther);
  pA.lastHeartbeat = Date.now() - 40_000;
  pB.lastHeartbeat = Date.now() - 40_000;

  await checkInactivityAndFinalize();
  const finalizedDraw = getRoom(roomCode3);
  assert(finalizedDraw?.status === 'ABANDONED', 'Double disconnect marks room as ABANDONED');
  assert(finalizedDraw?.resultType === 'ABANDONED', 'Result type is ABANDONED');
  assert(finalizedDraw?.completionReason === 'BOTH_DISCONNECTED', 'Completion reason is BOTH_DISCONNECTED');
  assert(finalizedDraw?.winnerPlayerId === null, 'No winner awarded when both players disconnect');

  // --- TEST 10: Rate Limiter ---
  console.log('\n--- TEST 10: Rate Limiter ---');
  const testKey = 'test_user_rate_limit';
  let allowedCount = 0;
  for (let i = 0; i < 15; i++) {
    if (checkRateLimit(testKey, 10, 60_000)) {
      allowedCount++;
    }
  }
  assert(allowedCount === 10, 'Rate limiter allows up to 10 requests and rejects subsequent ones');

  // Clean up test rooms
  deleteRoom(testRoomCode);
  deleteRoom(roomCode2);
  deleteRoom(roomCode3);

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPresenceTestSuite().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
