import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

import { generateRoomCode, isValidRoomCode } from './roomCode';
import { generateQuestion, generateFinalReport, generateLiveReaction } from './questionService';
import { isGeminiEnabled } from './geminiService';
import { getRoundTypeForRound } from './fallbackQuestions';
import {
  getRoom,
  setRoom,
  deleteRoom,
  getRoundAnswers,
  setPlayerAnswer,
  clearRoundAnswers,
  clearAllRoomAnswers,
  getAllRooms,
  getGameResult,
  saveGameResult,
  cleanupExpiredGameResults,
} from './store';
import {
  getIpHash,
  checkSameRoomIpCollision,
  checkRateLimit,
  registerPlayerPresence,
  handleHeartbeat,
  HEARTBEAT_INTERVAL_MS,
  handlePlayerReconnect,
  handleExplicitDisconnect,
  handleVoluntaryLeave,
  finalizeGameResult,
  checkInactivityAndFinalize,
  cleanupTransientPresenceState,
} from './presenceService';
import { Room, Answer, RoundHistoryItem, RoundType, QuestionType, QuestionFormat, Question, FinalReport } from './types';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const DEFAULT_TOTAL_ROUNDS = 20;
const PREFETCHED_QUESTION_TTL_MS = 10 * 60_000;

interface PrefetchedNextQuestion {
  roomCode: string;
  revealStateVersion: number;
  createdAt: number;
  promise: Promise<Question>;
}

const prefetchedNextQuestions = new Map<string, PrefetchedNextQuestion>();
const finalReportGenerations = new Set<string>();

// ---- Middleware ----

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGIN || '').split(','),
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
]
  .map(origin => origin?.trim().replace(/\/$/, ''))
  .filter(Boolean) as string[];

function isAllowedCorsOrigin(origin: string): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  if (allowedOrigins.includes('*')) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');
  return (
    allowedOrigins.includes(normalizedOrigin) ||
    normalizedOrigin.endsWith('.vercel.app') ||
    normalizedOrigin.endsWith('.onrender.com') ||
    normalizedOrigin.endsWith('.pages.dev')
  );
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isAllowedCorsOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Start periodic presence & disconnect watcher (runs every 2.5 seconds)
setInterval(() => {
  checkInactivityAndFinalize().catch((err) => {
    console.error('[PRESENCE CHECK ERROR]', err);
  });
}, 2500);

// ---- Visitor Counter (10,000+ Base, Increments on every visit) ----
let visitorCount = 10482;

// ---- Health & Stats Endpoints ----

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', ok: true, timestamp: Date.now() });
});

app.get('/api/stats', (_req: Request, res: Response) => {
  visitorCount += 1;
  res.json({
    success: true,
    data: {
      visitorCount,
      totalMatchesSynced: Math.floor(visitorCount * 1.6) + 420,
      activeRooms: getAllRooms().size,
      timestamp: Date.now(),
    },
  });
});

app.post('/api/visitors/increment', (_req: Request, res: Response) => {
  visitorCount += 1;
  res.json({
    success: true,
    visitorCount,
  });
});

app.get('/api/visitors', (_req: Request, res: Response) => {
  res.json({ visitorCount });
});

app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    geminiEnabled: isGeminiEnabled(),
    timestamp: Date.now(),
  });
});

// ============================================================
// Presence & Heartbeat API Endpoints
// ============================================================

// POST /api/game/heartbeat — Heartbeat from client every 6-8s
app.post('/api/game/heartbeat', (req: Request, res: Response) => {
  try {
    const { roomCode, playerId, sessionId } = req.body ?? {};
    if (!roomCode || !playerId) {
      return res.status(400).json({ error: 'Missing roomCode or playerId.' });
    }

    const ipHash = getIpHash(req);
    if (!checkRateLimit(`hb_${ipHash}`, 120, 60_000)) {
      return res.status(429).json({ error: 'Too many heartbeat requests.' });
    }

    const result = handleHeartbeat(String(roomCode), String(playerId), String(sessionId || ''));
    if (!result.success || !result.room) {
      return res.status(result.error === 'Game already open in another tab.' ? 409 : 404).json({
        error: result.error || 'Could not update heartbeat.',
        room: result.room ? sanitizeRoom(result.room) : undefined,
      });
    }

    res.json({
      success: true,
      room: sanitizeRoom(result.room),
    });
  } catch (err) {
    console.error('[POST /api/game/heartbeat] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/game/reconnect — Player reconnects with existing session ID
app.post('/api/game/reconnect', (req: Request, res: Response) => {
  try {
    const { roomCode, playerId, sessionId } = req.body ?? {};
    if (!roomCode || !playerId) {
      return res.status(400).json({ error: 'Missing roomCode or playerId.' });
    }

    const ipHash = getIpHash(req);
    if (!checkRateLimit(`recon_${ipHash}`, 40, 60_000)) {
      return res.status(429).json({ error: 'Too many reconnect requests.' });
    }

    const result = handlePlayerReconnect(String(roomCode), String(playerId), String(sessionId || ''));
    if (!result.success || !result.room) {
      // Check if game has a completed result record
      const savedResult = getGameResult(String(roomCode));
      if (savedResult) {
        return res.json({
          success: true,
          completedResult: savedResult,
        });
      }
      return res.status(404).json({ error: result.error || 'Room not found.' });
    }

    res.json({
      success: true,
      room: sanitizeRoom(result.room),
    });
  } catch (err) {
    console.error('[POST /api/game/reconnect] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/game/disconnect — Fast beacon notification on browser/tab close
app.post('/api/game/disconnect', (req: Request, res: Response) => {
  try {
    const { roomCode, playerId, sessionId } = req.body ?? {};
    if (roomCode && playerId) {
      handleExplicitDisconnect(String(roomCode), String(playerId), sessionId ? String(sessionId) : undefined);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[POST /api/game/disconnect] Error:', err);
    res.json({ success: true }); // Always return 200 for beacon
  }
});

// ============================================================
// POST /api/rooms — Create a new room
// ============================================================
app.post('/api/rooms', (req: Request, res: Response) => {
  try {
    const ipHash = getIpHash(req);

    // Rate Limiting Check
    if (!checkRateLimit(`create_${ipHash}`, 20, 60_000)) {
      return res.status(429).json({
        error: 'Too many rooms created. Please wait a minute before creating another.',
      });
    }

    const rawName = (req.body?.playerName as string | undefined)?.trim();
    const playerName = rawName && rawName.length > 0 ? rawName.slice(0, 20) : 'Player 1';
    const rawGender = req.body?.gender;
    const hostGender = (['male', 'female', 'other'].includes(rawGender) ? rawGender : 'other') as 'male' | 'female' | 'other';
    const deepPsychology = req.body?.deepPsychology !== false;
    const totalRounds = typeof req.body?.totalRounds === 'number' && req.body.totalRounds > 0
      ? Math.min(req.body.totalRounds, 50)
      : DEFAULT_TOTAL_ROUNDS;
    const gameMode = String(req.body?.gameMode || 'INDIA').toUpperCase();
    const aiTone = (['nice', 'fun', 'brutal'].includes(req.body?.aiTone) ? req.body.aiTone : 'fun') as 'nice' | 'fun' | 'brutal';
    const sessionId = String(req.body?.sessionId || crypto.randomUUID());

    const playerId = generatePlayerId();

    let code = generateRoomCode();
    let attempts = 0;
    while (getRoom(code) && attempts < 20) {
      code = generateRoomCode();
      attempts++;
    }

    const now = Date.now();
    const room: Room = {
      code,
      hostPlayerId: playerId,
      hostPlayerName: playerName,
      hostGender,
      hostLastSeenAt: now,
      hostSessionId: sessionId,
      hostIpHash: ipHash,
      guestPlayerId: null,
      guestPlayerName: null,
      guestGender: 'other',
      guestLastSeenAt: null,
      guestSessionId: null,
      guestIpHash: null,
      deepPsychology,
      status: 'WAITING',
      roundNumber: 0,
      totalRounds,
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
      lastHostPrediction: null,
      lastGuestPrediction: null,
      lastHostPredictionResult: null,
      lastGuestPredictionResult: null,
      lastLiveReaction: null,
      recentQuestions: [],
      recentCategories: [],
      history: [],
      finalReport: null,
      gameMode,
      aiTone,
      stateVersion: 1,
      createdAt: now,
      updatedAt: now,
    };

    setRoom(room);
    registerPlayerPresence(code, playerId, sessionId, playerName, 'host', ipHash);
    console.log(`[ROOM CREATED] Code: ${code}, Host: "${playerName}" (${hostGender}), Mode: ${gameMode}, DeepPsy: ${deepPsychology}, Tone: ${aiTone}`);

    res.json({
      success: true,
      room: sanitizeRoom(room),
      playerId,
      sessionId,
      role: 'host',
    });
  } catch (err) {
    console.error('[POST /api/rooms] Error:', err);
    res.status(500).json({ error: 'Could not create room.' });
  }
});

// ============================================================
// POST /api/rooms/:code/join — Guest joins a room
// ============================================================
app.post('/api/rooms/:code/join', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'ENTER A 4-CHARACTER ROOM CODE.' });
    }

    const ipHash = getIpHash(req);

    // Rate Limiting Check
    if (!checkRateLimit(`join_${ipHash}`, 30, 60_000)) {
      return res.status(429).json({ error: 'Too many join attempts. Please wait a minute.' });
    }

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }
    if (room.status === 'FINISHED' || room.status === 'COMPLETED' || room.status === 'INTERRUPTED' || room.status === 'ABANDONED') {
      return res.status(409).json({ error: 'THIS GAME HAS ALREADY ENDED.' });
    }
    if (room.guestPlayerId && room.status !== 'WAITING') {
      return res.status(409).json({ error: 'THAT ROOM IS ALREADY FULL.' });
    }

    // 1 Active Player Per IP in the SAME Room Anti-Abuse Check
    const ipCheck = checkSameRoomIpCollision(code, ipHash);
    if (!ipCheck.allowed) {
      return res.status(409).json({ error: ipCheck.error });
    }

    const rawName = (req.body?.playerName as string | undefined)?.trim();
    const playerName = rawName && rawName.length > 0 ? rawName.slice(0, 20) : 'Player 2';
    const rawGender = req.body?.gender;
    const guestGender = (['male', 'female', 'other'].includes(rawGender) ? rawGender : 'other') as 'male' | 'female' | 'other';
    const sessionId = String(req.body?.sessionId || crypto.randomUUID());
    const playerId = generatePlayerId();

    // Round 1 Setup
    const roundType = getRoundTypeForRound(1, room.deepPsychology !== false);
    const question = await generateQuestion(
      room.recentQuestions,
      room.recentCategories || [],
      1,
      roundType,
      room.gameMode,
      room.hostPlayerName,
      playerName,
      room.hostGender || 'other',
      guestGender,
      room.deepPsychology !== false
    );
    const now = Date.now();
    const timeLimit = question.timeLimit || (question.format === 'QUICK' ? 10 : 16);
    const durationMs = timeLimit * 1000;

    const updatedRoom: Room = {
      ...room,
      guestPlayerId: playerId,
      guestPlayerName: playerName,
      guestGender,
      guestLastSeenAt: now,
      guestSessionId: sessionId,
      guestIpHash: ipHash,
      status: 'PLAYING',
      roundNumber: 1,
      currentQuestion: question,
      currentRoundType: roundType,
      currentTimeLimit: timeLimit,
      currentQuestionFormat: question.format || 'QUICK',
      roundStartedAt: now,
      roundDeadline: now + durationMs,
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      recentCategories: [...(room.recentCategories || []), question.category].slice(-10),
      stateVersion: (room.stateVersion || 1) + 1,
      updatedAt: now,
    };

    setRoom(updatedRoom);
    registerPlayerPresence(code, playerId, sessionId, playerName, 'guest', ipHash);
    console.log(`[GUEST JOINED] Room ${code}: "${playerName}" (${guestGender}) joined! Round 1 (${roundType}, ${question.format || 'QUICK'} - ${timeLimit}s): "${question.optionA}" vs "${question.optionB}"`);

    res.json({
      success: true,
      room: sanitizeRoom(updatedRoom),
      playerId,
      sessionId,
      role: 'guest',
    });
  } catch (err) {
    console.error('[POST /api/rooms/:code/join] Error:', err);
    res.status(500).json({ error: 'Could not join room.' });
  }
});

// ============================================================
// GET /api/rooms/:code — Poll room state & update presence
// ============================================================
app.get('/api/rooms/:code', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const playerId = String(req.query.playerId || '').trim();
    const sessionId = String(req.query.sessionId || '').trim();

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'Invalid room code.' });
    }

    const room = getRoom(code);
    if (!room) {
      // Check if room was completed and stored in gameResults
      const savedResult = getGameResult(code);
      if (savedResult) {
        return res.json({
          success: true,
          completedResult: savedResult,
        });
      }
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    // 1. Polling is the gameplay presence signal; throttle writes to heartbeat cadence.
    if (playerId) {
      const heartbeat = handleHeartbeat(code, playerId, sessionId, HEARTBEAT_INTERVAL_MS);
      if (!heartbeat.success) {
        return res.status(heartbeat.error === 'Game already open in another tab.' ? 409 : 404).json({
          error: heartbeat.error || 'Could not update heartbeat.',
          room: heartbeat.room ? sanitizeRoom(heartbeat.room) : undefined,
        });
      }
    }

    const now = Date.now();

    // 2. Host-Authoritative Timeout Check
    if (
      room.status === 'PLAYING' &&
      room.roundDeadline !== null &&
      now > room.roundDeadline
    ) {
      const resolved = resolveRound(code);
      return res.json({ success: true, room: sanitizeRoom(resolved || room) });
    }

    res.json({ success: true, room: sanitizeRoom(room) });
  } catch (err) {
    console.error('[GET /api/rooms/:code] Error:', err);
    res.status(500).json({ error: 'Could not load room.' });
  }
});

// ============================================================
// POST /api/rooms/:code/answer — Submit player choice & prediction
// ============================================================
app.post('/api/rooms/:code/answer', (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId, role, roundNumber, choice, prediction, sessionId } = req.body ?? {};

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'Invalid room code.' });
    }

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    if (room.status === 'FINISHED' || room.status === 'INTERRUPTED' || room.status === 'COMPLETED' || room.status === 'ABANDONED') {
      return res.status(409).json({ error: 'Game has already ended.', room: sanitizeRoom(room) });
    }

    if (role !== 'host' && role !== 'guest') {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const playerRole = role as 'host' | 'guest';

    const expectedId = playerRole === 'host' ? room.hostPlayerId : room.guestPlayerId;
    if (playerId !== expectedId) {
      return res.status(403).json({ error: 'Player identity mismatch.' });
    }

    const sessionCheck = validatePlayerSession(room, playerRole, sessionId);
    if (!sessionCheck.success) {
      return res.status(sessionCheck.status).json({ error: sessionCheck.error, room: sanitizeRoom(room) });
    }

    if (typeof roundNumber !== 'number' || roundNumber !== room.roundNumber) {
      return res.status(409).json({ error: 'Round number mismatch.' });
    }

    if (typeof choice !== 'string' || choice.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid choice.' });
    }

    const now = Date.now();
    const trimmedChoice = choice.trim();
    const trimmedPrediction = typeof prediction === 'string' && prediction.trim().length > 0
      ? prediction.trim()
      : undefined;

    const answer: Answer = {
      playerId,
      roundNumber,
      choice: trimmedChoice,
      prediction: trimmedPrediction,
      answeredAt: now,
    };

    const existingAnswers = getRoundAnswers(code, roundNumber);
    const existingAnswer = existingAnswers[playerRole];

    if (room.status !== 'PLAYING') {
      const isDuplicateRetry =
        existingAnswer?.choice === answer.choice &&
        existingAnswer?.prediction === answer.prediction;

      return res.status(isDuplicateRetry ? 200 : 409).json({
        success: isDuplicateRetry,
        error: isDuplicateRetry ? undefined : 'This round is no longer accepting answers.',
        room: sanitizeRoom(room),
      });
    }

    if (playerRole === 'host') room.hostLastSeenAt = now;
    if (playerRole === 'guest') room.guestLastSeenAt = now;

    const answerWriteResult = setPlayerAnswer(code, roundNumber, playerRole, answer);
    if (answerWriteResult === 'conflict') {
      return res.status(409).json({
        error: 'Answer already locked for this round.',
        room: sanitizeRoom(room),
      });
    }
    if (answerWriteResult === 'duplicate') {
      return res.json({ success: true, room: sanitizeRoom(room) });
    }

    const roundAnswers = getRoundAnswers(code, roundNumber);
    const hostChoice = roundAnswers.host?.choice ?? null;
    const guestChoice = roundAnswers.guest?.choice ?? null;

    console.log(`[ANSWER] Room ${code} R${roundNumber}: ${role} ("${trimmedChoice}" | Pred: "${trimmedPrediction || 'none'}")`);

    // If both answered, evaluate early
    if (room.status === 'PLAYING') {
      const bothAnswered = hostChoice !== null && guestChoice !== null;
      if (bothAnswered) {
        const resolved = resolveRound(code);
        return res.json({ success: true, room: sanitizeRoom(resolved || room) });
      }
    }

    room.stateVersion = (room.stateVersion || 1) + 1;
    room.updatedAt = now;
    setRoom(room);

    const latest = getRoom(code)!;
    res.json({ success: true, room: sanitizeRoom(latest) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/answer] Error:', err);
    res.status(500).json({ error: 'Could not submit answer.' });
  }
});

// ============================================================
// POST /api/rooms/:code/next-round — Advance to next round or finish
// ============================================================
app.post('/api/rooms/:code/next-round', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId, sessionId } = req.body ?? {};

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    if (playerId !== room.hostPlayerId) {
      return res.status(403).json({ error: 'Only the host can advance rounds.' });
    }

    const sessionCheck = validatePlayerSession(room, 'host', sessionId);
    if (!sessionCheck.success) {
      return res.status(sessionCheck.status).json({ error: sessionCheck.error, room: sanitizeRoom(room) });
    }

    if (room.status !== 'REVEALING') {
      return res.json({ success: true, room: sanitizeRoom(room) });
    }

    // Check if game complete
    if (room.roundNumber >= room.totalRounds) {
      console.log(`[GAME COMPLETE] Room ${code} completed all ${room.totalRounds} rounds! Starting final report generation...`);
      const generatingRoom = startFinalReportGeneration(room);
      return res.json({ success: true, room: sanitizeRoom(generatingRoom) });
    }

    const nextRound = room.roundNumber + 1;
    const nextRoundType = getRoundTypeForRound(nextRound, room.deepPsychology !== false);
    const question = await getNextRoundQuestion(room, nextRound, nextRoundType);
    const now = Date.now();
    const timeLimit = question.timeLimit || (question.format === 'QUICK' ? 10 : 16);
    const durationMs = timeLimit * 1000;

    clearRoundAnswers(code, room.roundNumber);

    const updatedRoom: Room = {
      ...room,
      status: 'PLAYING',
      roundNumber: nextRound,
      currentQuestion: question,
      currentRoundType: nextRoundType,
      currentTimeLimit: timeLimit,
      currentQuestionFormat: question.format || 'QUICK',
      roundStartedAt: now,
      roundDeadline: now + durationMs,
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      recentCategories: [...(room.recentCategories || []), question.category].slice(-10),
      stateVersion: (room.stateVersion || 1) + 1,
      updatedAt: now,
    };

    setRoom(updatedRoom);
    console.log(`[NEXT ROUND] Room ${code} -> R${nextRound}/${room.totalRounds} (${nextRoundType}, ${question.format || 'QUICK'} - ${timeLimit}s): "${question.optionA}" vs "${question.optionB}"`);

    res.json({ success: true, room: sanitizeRoom(updatedRoom) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/next-round] Error:', err);
    res.status(500).json({ error: 'Could not advance round.' });
  }
});

// ============================================================
// POST /api/rooms/:code/restart — Rematch / Play Again in same room
// ============================================================
app.post('/api/rooms/:code/restart', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId, sessionId } = req.body ?? {};

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    if (playerId !== room.hostPlayerId && playerId !== room.guestPlayerId) {
      return res.status(403).json({ error: 'Only players in this room can restart the game.' });
    }

    const playerRole = playerId === room.hostPlayerId ? 'host' : 'guest';
    const sessionCheck = validatePlayerSession(room, playerRole, sessionId);
    if (!sessionCheck.success) {
      return res.status(sessionCheck.status).json({ error: sessionCheck.error, room: sanitizeRoom(room) });
    }

    if (room.status === 'GENERATING_REPORT') {
      return res.status(409).json({ error: 'Final report is still being generated.', room: sanitizeRoom(room) });
    }

    clearAllRoomAnswers(code);

    const now = Date.now();
    // If guest is present, restart immediately into round 1
    if (room.guestPlayerId) {
      const roundType = getRoundTypeForRound(1, room.deepPsychology !== false);
      const question = await generateQuestion(
        [],
        [],
        1,
        roundType,
        room.gameMode,
        room.hostPlayerName,
        room.guestPlayerName || 'Player 2',
        room.hostGender || 'other',
        room.guestGender || 'other',
        room.deepPsychology !== false
      );
      const timeLimit = question.timeLimit || (question.format === 'QUICK' ? 10 : 16);
      const durationMs = timeLimit * 1000;

      const restartedRoom: Room = {
        ...room,
        status: 'PLAYING',
        roundNumber: 1,
        currentQuestion: question,
        currentRoundType: roundType,
        currentTimeLimit: timeLimit,
        currentQuestionFormat: question.format || 'QUICK',
        roundStartedAt: now,
        roundDeadline: now + durationMs,
        matches: 0,
        total: 0,
        score: 0,
        streak: 0,
        lastResult: null,
        lastHostChoice: null,
        lastGuestChoice: null,
        lastHostPrediction: null,
        lastGuestPrediction: null,
        lastHostPredictionResult: null,
        lastGuestPredictionResult: null,
        lastLiveReaction: null,
        recentQuestions: [question.optionA],
        recentCategories: [question.category],
        history: [],
        finalReport: null,
        interruptedReason: undefined,
        leftBy: undefined,
        leftAt: undefined,
        disconnectedPlayerName: undefined,
        disconnectedRole: undefined,
        disconnectStartedAt: undefined,
        disconnectGraceRemaining: undefined,
        winnerPlayerId: undefined,
        loserPlayerId: undefined,
        winnerName: undefined,
        loserName: undefined,
        resultType: undefined,
        completionReason: undefined,
        stateVersion: (room.stateVersion || 1) + 1,
        updatedAt: now,
      };

      setRoom(restartedRoom);
      console.log(`[RESTART GAME] Room ${code} restarted by ${playerId === room.hostPlayerId ? room.hostPlayerName : room.guestPlayerName}! Round 1 started.`);
      return res.json({ success: true, room: sanitizeRoom(restartedRoom) });
    } else {
      // Guest is not present, reset to waiting
      const waitingRoom: Room = {
        ...room,
        status: 'WAITING',
        roundNumber: 0,
        currentQuestion: null,
        matches: 0,
        total: 0,
        score: 0,
        streak: 0,
        lastResult: null,
        history: [],
        finalReport: null,
        interruptedReason: undefined,
        leftBy: undefined,
        leftAt: undefined,
        disconnectedPlayerName: undefined,
        disconnectedRole: undefined,
        disconnectStartedAt: undefined,
        disconnectGraceRemaining: undefined,
        winnerPlayerId: undefined,
        loserPlayerId: undefined,
        winnerName: undefined,
        loserName: undefined,
        resultType: undefined,
        completionReason: undefined,
        stateVersion: (room.stateVersion || 1) + 1,
        updatedAt: now,
      };
      setRoom(waitingRoom);
      return res.json({ success: true, room: sanitizeRoom(waitingRoom) });
    }
  } catch (err) {
    console.error('[POST /api/rooms/:code/restart] Error:', err);
    res.status(500).json({ error: 'Could not restart game.' });
  }
});

// ============================================================
// Unified Authoritative Leave Handler (Supports DELETE & POST)
// ============================================================
async function handleLeaveRoom(req: Request, res: Response) {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId, sessionId } = req.body ?? {};

    const room = getRoom(code);
    if (!room) {
      return res.json({ success: true });
    }

    if (playerId !== room.hostPlayerId && playerId !== room.guestPlayerId) {
      return res.status(403).json({ error: 'Player identity mismatch.' });
    }

    const playerRole = playerId === room.hostPlayerId ? 'host' : 'guest';
    const sessionCheck = validatePlayerSession(room, playerRole, sessionId);
    if (!sessionCheck.success) {
      return res.status(sessionCheck.status).json({ error: sessionCheck.error, room: sanitizeRoom(room) });
    }

    // 1. Idempotent check: if already finished, return finished room
    if (room.status === 'FINISHED' || room.status === 'COMPLETED' || room.status === 'GENERATING_REPORT') {
      return res.json({ success: true, room: sanitizeRoom(room) });
    }

    // 2. Idempotent check: if already interrupted, handle simultaneous or duplicate leave
    if (room.status === 'INTERRUPTED') {
      const leaverRole: 'host' | 'guest' = playerId === room.guestPlayerId ? 'guest' : 'host';
      if (room.leftBy && room.leftBy !== leaverRole && room.leftBy !== 'both') {
        room.leftBy = 'both';
        room.interruptedReason = 'Both players left the game.';
        if (room.finalReport) {
          room.finalReport.leftBy = 'both';
          room.finalReport.interruptedReason = 'Both players left the game.';
        }
        room.stateVersion = (room.stateVersion || 1) + 1;
        room.updatedAt = Date.now();
        setRoom(room);
        console.log(`[SIMULTANEOUS LEAVE] Room ${code}: Both players marked as left.`);
      }
      return res.json({ success: true, room: sanitizeRoom(room) });
    }

    // 3. Leaving before game starts (Lobby or Waiting)
    if (room.status === 'WAITING' || room.roundNumber === 0) {
      if (playerId === room.hostPlayerId) {
        deleteRoom(code);
      } else {
        setRoom({
          ...room,
          guestPlayerId: null,
          guestPlayerName: null,
          status: 'WAITING',
          stateVersion: (room.stateVersion || 1) + 1,
          updatedAt: Date.now(),
        });
      }
      return res.json({ success: true, reason: 'left_before_start' });
    }

    // 4. Active game leave (PLAYING, REVEALING, or PLAYER_DISCONNECTED) -> Immediate forfeit award
    const result = await handleVoluntaryLeave(code, playerId);
    if (!result.success) {
      return res.status(result.error === 'Player identity mismatch.' ? 403 : 404).json({
        error: result.error || 'Could not leave room.',
      });
    }
    return res.json({ success: true, room: result.room ? sanitizeRoom(result.room) : undefined });
  } catch (err) {
    console.error('[handleLeaveRoom] Error:', err);
    res.status(500).json({ error: 'Could not leave room.' });
  }
}

app.delete('/api/rooms/:code/leave', handleLeaveRoom);
app.post('/api/rooms/:code/leave', handleLeaveRoom);

// ============================================================
// Internal: Mutation Session Authorization
// ============================================================
function validatePlayerSession(
  room: Room,
  role: 'host' | 'guest',
  sessionId: unknown
): { success: true } | { success: false; status: number; error: string } {
  const suppliedSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
  if (!suppliedSessionId) {
    return { success: false, status: 400, error: 'Missing sessionId.' };
  }

  const expectedSessionId = role === 'host' ? room.hostSessionId : room.guestSessionId;
  if (!expectedSessionId || expectedSessionId !== suppliedSessionId) {
    return { success: false, status: 403, error: 'Player session mismatch.' };
  }

  return { success: true };
}

// ============================================================
// Internal: Next-Round Question Prefetch
// ============================================================
function nextQuestionPrefetchKey(room: Room, nextRound: number): string {
  return `${room.code.toUpperCase()}::${nextRound}::${room.stateVersion || 1}`;
}

function generateNextRoundQuestion(room: Room, nextRound: number, nextRoundType: RoundType): Promise<Question> {
  return generateQuestion(
    room.recentQuestions,
    room.recentCategories || [],
    nextRound,
    nextRoundType,
    room.gameMode,
    room.hostPlayerName,
    room.guestPlayerName || 'Player 2',
    room.hostGender || 'other',
    room.guestGender || 'other',
    room.deepPsychology !== false
  );
}

function prefetchNextRoundQuestion(room: Room): void {
  if (room.roundNumber >= room.totalRounds) return;

  const nextRound = room.roundNumber + 1;
  const key = nextQuestionPrefetchKey(room, nextRound);
  if (prefetchedNextQuestions.has(key)) return;

  const nextRoundType = getRoundTypeForRound(nextRound, room.deepPsychology !== false);
  const promise = generateNextRoundQuestion(room, nextRound, nextRoundType);
  const entry: PrefetchedNextQuestion = {
    roomCode: room.code.toUpperCase(),
    revealStateVersion: room.stateVersion || 1,
    createdAt: Date.now(),
    promise,
  };

  prefetchedNextQuestions.set(key, entry);
  promise.catch((err) => {
    if (prefetchedNextQuestions.get(key) === entry) {
      prefetchedNextQuestions.delete(key);
    }
    console.warn(`[QUESTION PREFETCH] Room ${room.code} R${nextRound} failed:`, err);
  });
}

async function getNextRoundQuestion(room: Room, nextRound: number, nextRoundType: RoundType): Promise<Question> {
  const key = nextQuestionPrefetchKey(room, nextRound);
  const prefetched = prefetchedNextQuestions.get(key);

  if (prefetched) {
    prefetchedNextQuestions.delete(key);
    try {
      return await prefetched.promise;
    } catch {
      return generateNextRoundQuestion(room, nextRound, nextRoundType);
    }
  }

  return generateNextRoundQuestion(room, nextRound, nextRoundType);
}

function cleanupPrefetchedNextQuestions(now = Date.now()): number {
  let removed = 0;

  for (const [key, entry] of prefetchedNextQuestions.entries()) {
    const room = getRoom(entry.roomCode);
    const isExpired = now - entry.createdAt > PREFETCHED_QUESTION_TTL_MS;
    const isStale =
      !room ||
      room.stateVersion !== entry.revealStateVersion ||
      (room.status !== 'REVEALING' && room.status !== 'PLAYING');

    if (isExpired || isStale) {
      prefetchedNextQuestions.delete(key);
      removed++;
    }
  }

  return removed;
}

// ============================================================
// Internal: Synchronous Round Evaluation
// ============================================================
function resolveRound(code: string): Room | null {
  const current = getRoom(code);
  if (!current || current.status !== 'PLAYING') return current ?? null;

  const roundAnswers = getRoundAnswers(code, current.roundNumber);
  const hostChoice = roundAnswers.host?.choice ?? null;
  const guestChoice = roundAnswers.guest?.choice ?? null;
  const hostPred = roundAnswers.host?.prediction ?? null;
  const guestPred = roundAnswers.guest?.prediction ?? null;

  const isMatch =
    hostChoice !== null &&
    guestChoice !== null &&
    hostChoice.trim().toLowerCase() === guestChoice.trim().toLowerCase();

  // Prediction accuracy
  let hostPredResult: 'CORRECT' | 'WRONG' | null = null;
  let guestPredResult: 'CORRECT' | 'WRONG' | null = null;

  if (hostPred && guestChoice) {
    hostPredResult = hostPred.trim().toLowerCase() === guestChoice.trim().toLowerCase() ? 'CORRECT' : 'WRONG';
  }
  if (guestPred && hostChoice) {
    guestPredResult = guestPred.trim().toLowerCase() === hostChoice.trim().toLowerCase() ? 'CORRECT' : 'WRONG';
  }

  // Scoring
  const roundType = current.currentRoundType;
  let pointsAwarded = 0;
  if (isMatch) {
    pointsAwarded = roundType === 'DOUBLE_POINTS' ? 2 : 1;
  }

  const newMatches = current.matches + (isMatch ? 1 : 0);
  const newTotal = current.total + 1;
  const newScore = (current.score || current.matches) + pointsAwarded;

  // Streak
  let newStreak = current.streak || 0;
  if (isMatch) {
    newStreak = newStreak > 0 ? newStreak + 1 : 1;
  } else {
    newStreak = newStreak < 0 ? newStreak - 1 : -1;
  }

  // Live reaction
  const liveReaction = generateLiveReaction(
    isMatch,
    newStreak,
    roundType,
    hostPredResult === 'CORRECT',
    guestPredResult === 'CORRECT'
  );

  const historyItem: RoundHistoryItem = {
    roundNumber: current.roundNumber,
    question: `${current.currentQuestion?.optionA} or ${current.currentQuestion?.optionB}`,
    scenario: current.currentQuestion?.scenario,
    category: current.currentQuestion?.category || 'General',
    format: current.currentQuestion?.format || current.currentQuestionFormat,
    questionType: current.currentQuestion?.type || (roundType as QuestionType),
    timeLimit: current.currentTimeLimit || (current.currentQuestion?.format === 'QUICK' ? 10 : 16),
    optionA: current.currentQuestion?.optionA || '',
    optionB: current.currentQuestion?.optionB || '',
    roundType,
    hostChoice,
    guestChoice,
    hostPrediction: hostPred,
    guestPrediction: guestPred,
    hostPredictionResult: hostPredResult,
    guestPredictionResult: guestPredResult,
    result: isMatch ? 'MATCH' : 'NO_MATCH',
    pointsAwarded,
    answeredAt: Date.now(),
  };

  const updated: Room = {
    ...current,
    status: 'REVEALING',
    matches: newMatches,
    total: newTotal,
    score: newScore,
    streak: newStreak,
    lastResult: isMatch ? 'MATCH' : 'NO_MATCH',
    lastHostChoice: hostChoice,
    lastGuestChoice: guestChoice,
    lastHostPrediction: hostPred,
    lastGuestPrediction: guestPred,
    lastHostPredictionResult: hostPredResult,
    lastGuestPredictionResult: guestPredResult,
    lastLiveReaction: liveReaction,
    history: [...current.history, historyItem],
    stateVersion: (current.stateVersion || 1) + 1,
    updatedAt: Date.now(),
  };

  console.log(`[EVALUATION] Room ${code} R${current.roundNumber} (${roundType}): ${updated.lastResult} | Reaction: "${liveReaction}" | Score: ${newScore}`);

  setRoom(updated);
  prefetchNextRoundQuestion(updated);
  return updated;
}

// ============================================================
// Internal: Finish Game & Generate AI Analysis
// ============================================================
function buildFallbackFinalReport(room: Room, generatedAt = Date.now()): FinalReport {
  const matchPercentage = room.total > 0 ? Math.round((room.matches / room.total) * 100) : 0;

  return {
    headline: '⚡ MATCH REPORT READY',
    overallVibe: 'Report generated with core match stats.',
    matchPercentage,
    completedQuestions: room.total,
    totalQuestions: room.totalRounds,
    totalScore: room.score,
    maxPossibleScore: room.totalRounds,
    strongestMatches: room.history
      .filter((item) => item.result === 'MATCH')
      .slice(-3)
      .map((item) => item.question),
    biggestDifferences: room.history
      .filter((item) => item.result === 'NO_MATCH')
      .slice(-3)
      .map((item) => item.question),
    funniestDifference: '',
    mostUnexpectedMatch: '',
    sharedTendencies: [],
    conversationStarters: [],
    finalVerdict: `You matched on ${room.matches} of ${room.total} completed rounds.`,
    isPartial: false,
    player1Gender: room.hostGender || 'other',
    player2Gender: room.guestGender || 'other',
    resultType: 'NORMAL',
    completionReason: 'NORMAL_COMPLETION',
    gameMode: room.gameMode,
    aiTone: room.aiTone,
    generatedAt,
  };
}

function startFinalReportGeneration(room: Room): Room {
  const code = room.code.toUpperCase();
  const latest = getRoom(code) || room;

  if (latest.status === 'FINISHED' || latest.status === 'COMPLETED' || latest.status === 'INTERRUPTED' || latest.status === 'ABANDONED') {
    return latest;
  }

  if (latest.status === 'GENERATING_REPORT') {
    return latest;
  }

  const generatingRoom: Room = {
    ...latest,
    status: 'GENERATING_REPORT',
    roundDeadline: null,
    stateVersion: (latest.stateVersion || 1) + 1,
    updatedAt: Date.now(),
  };

  setRoom(generatingRoom);

  if (!finalReportGenerations.has(code)) {
    finalReportGenerations.add(code);
    setTimeout(() => {
      void finishGame(generatingRoom)
        .catch((err) => {
          console.error(`[FINAL REPORT TASK ERROR] Room ${code}:`, err);
        })
        .finally(() => {
          finalReportGenerations.delete(code);
        });
    }, 0);
  }

  return getRoom(code) || generatingRoom;
}

async function finishGame(room: Room): Promise<void> {
  const code = room.code;
  console.log(`[GENERATING FINAL REPORT] Room ${code}...`);

  let report: FinalReport;
  const now = Date.now();

  try {
    report = await generateFinalReport(
      room.history,
      room.hostPlayerName,
      room.guestPlayerName || 'Guest',
      room.matches,
      room.total,
      room.totalRounds,
      false,
      undefined,
      room.gameMode,
      room.aiTone,
      undefined,
      undefined,
      room.hostGender || 'other',
      room.guestGender || 'other'
    );
  } catch (err) {
    console.error(`[FINAL REPORT GENERATION ERROR] Room ${code}:`, err);
    report = buildFallbackFinalReport(room, now);
  }

  const latest = getRoom(code);
  if (!latest || latest.status !== 'GENERATING_REPORT') {
    console.warn(`[FINAL REPORT STALE] Room ${code}: Report finished after room moved away from GENERATING_REPORT.`);
    return;
  }

  const updated: Room = {
    ...latest,
    status: 'FINISHED',
    finalReport: report,
    resultType: 'NORMAL',
    completionReason: 'NORMAL_COMPLETION',
    stateVersion: (latest.stateVersion || 1) + 1,
    updatedAt: Date.now(),
  };

  setRoom(updated);

  saveGameResult({
    gameId: `${room.code}_${room.createdAt}`,
    roomCode: room.code,
    player1Id: room.hostPlayerId,
    player2Id: room.guestPlayerId || '',
    winnerId: null,
    loserId: null,
    winnerName: null,
    loserName: null,
    resultType: 'NORMAL',
    completionReason: 'NORMAL_COMPLETION',
    completedAt: now,
    finalReport: report,
  });

  console.log(`[GAME FINISHED] Room ${code}: Score ${room.matches}/${room.total} | Sync: ${report.matchPercentage}% | Headline: "${report.headline}"`);
}

// ============================================================
// Internal: Interrupt Game (Player Leave or Timeout)
// ============================================================
async function interruptGame(
  room: Room,
  reason: string,
  leftBy?: 'host' | 'guest' | 'both'
): Promise<void> {
  if (room.status === 'INTERRUPTED' && room.finalReport) return;

  console.warn(`[INTERRUPTING GAME] Room ${room.code}: ${reason} (Left by: ${leftBy || 'unknown'})`);

  const now = Date.now();
  const report = await generateFinalReport(
    room.history,
    room.hostPlayerName,
    room.guestPlayerName || 'Guest',
    room.matches,
    room.total,
    room.totalRounds,
    true,
    reason,
    room.gameMode,
    room.aiTone,
    leftBy,
    now,
    room.hostGender || 'other',
    room.guestGender || 'other'
  );

  const updated: Room = {
    ...room,
    status: 'INTERRUPTED',
    interruptedReason: reason,
    leftBy: leftBy || room.leftBy,
    leftAt: now,
    finalReport: report,
    stateVersion: (room.stateVersion || 1) + 1,
    updatedAt: now,
  };

  setRoom(updated);
}

// ============================================================
// Periodic Abandoned Room Cleanup
// ============================================================
setInterval(() => {
  const now = Date.now();
  const all = getAllRooms();
  let removedRooms = 0;

  for (const [code, room] of all.entries()) {
    const isOld = now - room.createdAt > 3600_000;
    const isAbandoned =
      now - room.hostLastSeenAt > 1200_000 &&
      (!room.guestLastSeenAt || now - room.guestLastSeenAt > 1200_000);

    if (isOld || isAbandoned) {
      deleteRoom(code);
      removedRooms++;
    }
  }

  const removedGameResultKeys = cleanupExpiredGameResults(now);
  const { removedPresences, removedRateLimits } = cleanupTransientPresenceState(now);
  const removedPrefetchedQuestions = cleanupPrefetchedNextQuestions(now);

  if (
    removedRooms > 0 ||
    removedGameResultKeys > 0 ||
    removedPresences > 0 ||
    removedRateLimits > 0 ||
    removedPrefetchedQuestions > 0
  ) {
    console.log(
      `[CLEANUP] Removed rooms=${removedRooms}, gameResultKeys=${removedGameResultKeys}, presences=${removedPresences}, rateLimits=${removedRateLimits}, prefetchedQuestions=${removedPrefetchedQuestions}`
    );
  }
}, 300_000);

// ============================================================
// Helpers
// ============================================================

function generatePlayerId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function sanitizeRoom(room: Room) {
  return {
    code: room.code,
    hostPlayerName: room.hostPlayerName,
    hostGender: room.hostGender || 'other',
    guestPlayerName: room.guestPlayerName,
    guestGender: room.guestGender || 'other',
    deepPsychology: room.deepPsychology !== false,
    status: room.status,
    roundNumber: room.roundNumber,
    totalRounds: room.totalRounds,
    currentQuestion: room.currentQuestion,
    currentRoundType: room.currentRoundType,
    currentTimeLimit: room.currentTimeLimit || (room.currentQuestion?.format === 'QUICK' ? 10 : 16),
    currentQuestionFormat: room.currentQuestionFormat || (room.currentQuestion?.format || 'SITUATIONAL'),
    roundStartedAt: room.roundStartedAt,
    roundDeadline: room.roundDeadline,
    matches: room.matches,
    total: room.total,
    score: room.score,
    streak: room.streak,
    lastResult: room.lastResult,
    lastHostChoice: room.lastHostChoice,
    lastGuestChoice: room.lastGuestChoice,
    lastHostPrediction: room.lastHostPrediction,
    lastGuestPrediction: room.lastGuestPrediction,
    lastHostPredictionResult: room.lastHostPredictionResult,
    lastGuestPredictionResult: room.lastGuestPredictionResult,
    lastLiveReaction: room.lastLiveReaction,
    history: room.history,
    finalReport: room.finalReport,
    interruptedReason: room.interruptedReason,
    leftBy: room.leftBy,
    leftAt: room.leftAt,
    disconnectedPlayerName: room.disconnectedPlayerName,
    disconnectedRole: room.disconnectedRole,
    disconnectStartedAt: room.disconnectStartedAt,
    disconnectGraceRemaining: room.disconnectGraceRemaining,
    winnerPlayerId: room.winnerPlayerId,
    loserPlayerId: room.loserPlayerId,
    winnerName: room.winnerName,
    loserName: room.loserName,
    resultType: room.resultType,
    completionReason: room.completionReason,
    gameMode: room.gameMode,
    aiTone: room.aiTone,
    stateVersion: room.stateVersion || 1,
    updatedAt: room.updatedAt,
  };
}

// ---- Global Error Handler ----
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({ error: 'Something went wrong. Try again.' });
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`🎮 THIS ⚡ THAT V4 server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI Status: ${isGeminiEnabled() ? '⚡ ACTIVE & READY' : '⚪ Standby (using instant dataset engine)'}`);
});
