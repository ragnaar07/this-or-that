// ============================================================
// THIS ⚡ THAT — Express API Server (V4 Ultimate Engagement)
// Dynamic Round Types, Predictions, Chaos, Double Points, Live Reactions
// ============================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { generateRoomCode, isValidRoomCode } from './roomCode';
import { generateQuestion, generateFinalReport, generateLiveReaction } from './questionService';
import { getRoundTypeForRound } from './fallbackQuestions';
import {
  getRoom,
  setRoom,
  deleteRoom,
  getRoundAnswers,
  setPlayerAnswer,
  clearRoundAnswers,
  getAllRooms,
} from './store';
import { Room, Answer, RoundHistoryItem, RoundType } from './types';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const DEFAULT_TOTAL_ROUNDS = 20;
const ROUND_DURATION_MS = 10_000;
const DISCONNECT_TIMEOUT_MS = 25_000;

// ---- Middleware ----

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.some(a => a && origin.startsWith(a.replace(/\/$/, ''))) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.pages.dev') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// ---- Health Check Endpoints ----

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', ok: true, timestamp: Date.now() });
});

// ============================================================
// POST /api/rooms — Create a new room
// Body: { playerName?: string, totalRounds?: number, gameMode?: string, aiTone?: string }
// ============================================================
app.post('/api/rooms', (req: Request, res: Response) => {
  try {
    const rawName = (req.body?.playerName as string | undefined)?.trim();
    const playerName = rawName && rawName.length > 0 ? rawName.slice(0, 20) : 'Player 1';
    const totalRounds = typeof req.body?.totalRounds === 'number' && req.body.totalRounds > 0
      ? Math.min(req.body.totalRounds, 50)
      : DEFAULT_TOTAL_ROUNDS;
    const gameMode = String(req.body?.gameMode || 'RANDOM').toUpperCase();
    const aiTone = (['nice', 'fun', 'brutal'].includes(req.body?.aiTone) ? req.body.aiTone : 'fun') as 'nice' | 'fun' | 'brutal';

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
      hostLastSeenAt: now,
      guestPlayerId: null,
      guestPlayerName: null,
      guestLastSeenAt: null,
      status: 'WAITING',
      roundNumber: 0,
      totalRounds,
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
      recentCategories: [],
      history: [],
      finalReport: null,
      gameMode,
      aiTone,
      createdAt: now,
      updatedAt: now,
    };

    setRoom(room);
    console.log(`[ROOM CREATED] Code: ${code}, Host: "${playerName}", Mode: ${gameMode}, Tone: ${aiTone}`);

    res.json({
      success: true,
      room: sanitizeRoom(room),
      playerId,
      role: 'host',
    });
  } catch (err) {
    console.error('[POST /api/rooms] Error:', err);
    res.status(500).json({ error: 'Could not create room.' });
  }
});

// ============================================================
// POST /api/rooms/:code/join — Guest joins a room
// Body: { playerName?: string }
// ============================================================
app.post('/api/rooms/:code/join', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'ENTER A 4-CHARACTER ROOM CODE.' });
    }

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }
    if (room.status === 'FINISHED' || room.status === 'INTERRUPTED') {
      return res.status(409).json({ error: 'THIS GAME HAS ALREADY ENDED.' });
    }
    if (room.guestPlayerId && room.status !== 'WAITING') {
      return res.status(409).json({ error: 'THAT ROOM IS ALREADY FULL.' });
    }

    const rawName = (req.body?.playerName as string | undefined)?.trim();
    const playerName = rawName && rawName.length > 0 ? rawName.slice(0, 20) : 'Player 2';
    const playerId = generatePlayerId();

    // Round 1 Setup
    const roundType = getRoundTypeForRound(1);
    const question = await generateQuestion(room.recentQuestions, room.recentCategories || [], 1, roundType, room.gameMode);
    const now = Date.now();

    const updatedRoom: Room = {
      ...room,
      guestPlayerId: playerId,
      guestPlayerName: playerName,
      guestLastSeenAt: now,
      status: 'PLAYING',
      roundNumber: 1,
      currentQuestion: question,
      currentRoundType: roundType,
      roundStartedAt: now,
      roundDeadline: now + ROUND_DURATION_MS,
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      recentCategories: [...(room.recentCategories || []), question.category].slice(-10),
      updatedAt: now,
    };

    setRoom(updatedRoom);
    console.log(`[GUEST JOINED] Room ${code}: "${playerName}" joined! Round 1 (${roundType}): "${question.optionA}" vs "${question.optionB}"`);

    res.json({
      success: true,
      room: sanitizeRoom(updatedRoom),
      playerId,
      role: 'guest',
    });
  } catch (err) {
    console.error('[POST /api/rooms/:code/join] Error:', err);
    res.status(500).json({ error: 'Could not join room.' });
  }
});

// ============================================================
// GET /api/rooms/:code — Poll room state & heartbeat
// ============================================================
app.get('/api/rooms/:code', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const playerId = String(req.query.playerId || '').trim();

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'Invalid room code.' });
    }

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    const now = Date.now();

    // 1. Update presence heartbeat
    if (playerId === room.hostPlayerId) {
      room.hostLastSeenAt = now;
    } else if (playerId === room.guestPlayerId) {
      room.guestLastSeenAt = now;
    }

    // 2. Disconnect detection for active games
    if ((room.status === 'PLAYING' || room.status === 'REVEALING') && room.guestPlayerId) {
      const hostInactive = now - room.hostLastSeenAt > DISCONNECT_TIMEOUT_MS;
      const guestInactive = room.guestLastSeenAt ? now - room.guestLastSeenAt > DISCONNECT_TIMEOUT_MS : false;

      if (hostInactive || guestInactive) {
        const missingPlayer = hostInactive ? room.hostPlayerName : (room.guestPlayerName || 'Opponent');
        console.warn(`[DISCONNECT] Room ${code}: ${missingPlayer} disconnected.`);

        await interruptGame(room, `${missingPlayer} lost connection.`);
        const updated = getRoom(code)!;
        return res.json({ success: true, room: sanitizeRoom(updated) });
      }
    }

    // 3. Host-Authoritative Timeout Check
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
// Body: { playerId, role, roundNumber, choice, prediction }
// ============================================================
app.post('/api/rooms/:code/answer', (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId, role, roundNumber, choice, prediction } = req.body ?? {};

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'Invalid room code.' });
    }

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    if (room.status === 'FINISHED' || room.status === 'INTERRUPTED') {
      return res.status(409).json({ error: 'Game has already ended.' });
    }

    if (role !== 'host' && role !== 'guest') {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const expectedId = role === 'host' ? room.hostPlayerId : room.guestPlayerId;
    if (playerId !== expectedId) {
      return res.status(403).json({ error: 'Player identity mismatch.' });
    }

    const now = Date.now();
    if (role === 'host') room.hostLastSeenAt = now;
    if (role === 'guest') room.guestLastSeenAt = now;

    if (typeof roundNumber !== 'number' || roundNumber !== room.roundNumber) {
      return res.status(409).json({ error: 'Round number mismatch.' });
    }

    if (typeof choice !== 'string' || choice.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid choice.' });
    }

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

    setPlayerAnswer(code, roundNumber, role, answer);

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
    const { playerId } = req.body ?? {};

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    if (playerId !== room.hostPlayerId) {
      return res.status(403).json({ error: 'Only the host can advance rounds.' });
    }

    if (room.status !== 'REVEALING') {
      return res.json({ success: true, room: sanitizeRoom(room) });
    }

    // Check if game complete
    if (room.roundNumber >= room.totalRounds) {
      console.log(`[GAME COMPLETE] Room ${code} completed all ${room.totalRounds} rounds! Generating AI analysis...`);
      await finishGame(room);
      const finished = getRoom(code)!;
      return res.json({ success: true, room: sanitizeRoom(finished) });
    }

    const nextRound = room.roundNumber + 1;
    const nextRoundType = getRoundTypeForRound(nextRound);
    const question = await generateQuestion(room.recentQuestions, room.recentCategories || [], nextRound, nextRoundType, room.gameMode);
    const now = Date.now();

    clearRoundAnswers(code, room.roundNumber);

    const updatedRoom: Room = {
      ...room,
      status: 'PLAYING',
      roundNumber: nextRound,
      currentQuestion: question,
      currentRoundType: nextRoundType,
      roundStartedAt: now,
      roundDeadline: now + ROUND_DURATION_MS,
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      recentCategories: [...(room.recentCategories || []), question.category].slice(-10),
      updatedAt: now,
    };

    setRoom(updatedRoom);
    console.log(`[NEXT ROUND] Room ${code} -> R${nextRound}/${room.totalRounds} (${nextRoundType}): "${question.optionA}" vs "${question.optionB}"`);

    res.json({ success: true, room: sanitizeRoom(updatedRoom) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/next-round] Error:', err);
    res.status(500).json({ error: 'Could not advance round.' });
  }
});

// ============================================================
// DELETE /api/rooms/:code/leave — Player leaves
// ============================================================
app.delete('/api/rooms/:code/leave', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId } = req.body ?? {};

    const room = getRoom(code);
    if (!room) {
      return res.json({ success: true });
    }

    const leaverName = playerId === room.hostPlayerId ? room.hostPlayerName : (room.guestPlayerName || 'A player');

    if (room.status === 'WAITING' || room.roundNumber === 0) {
      if (playerId === room.hostPlayerId) {
        deleteRoom(code);
      } else {
        setRoom({
          ...room,
          guestPlayerId: null,
          guestPlayerName: null,
          status: 'WAITING',
          updatedAt: Date.now(),
        });
      }
      return res.json({ success: true, reason: 'left_before_start' });
    }

    console.log(`[PLAYER LEFT] ${leaverName} left room ${code}. Freezing partial game...`);
    await interruptGame(room, `${leaverName} left the room.`);
    const updated = getRoom(code)!;

    res.json({ success: true, room: sanitizeRoom(updated) });
  } catch (err) {
    console.error('[DELETE /api/rooms/:code/leave] Error:', err);
    res.status(500).json({ error: 'Could not leave room.' });
  }
});

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
    category: current.currentQuestion?.category || 'General',
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
    updatedAt: Date.now(),
  };

  console.log(`[EVALUATION] Room ${code} R${current.roundNumber} (${roundType}): ${updated.lastResult} | Reaction: "${liveReaction}" | Score: ${newScore}`);

  setRoom(updated);
  return updated;
}

// ============================================================
// Internal: Finish Game
// ============================================================
async function finishGame(room: Room): Promise<void> {
  if (room.finalReport) return;

  const report = await generateFinalReport(
    room.history,
    room.hostPlayerName,
    room.guestPlayerName || 'Guest',
    room.matches,
    room.total,
    room.totalRounds,
    false,
    undefined,
    room.gameMode,
    room.aiTone
  );

  const updated: Room = {
    ...room,
    status: 'FINISHED',
    finalReport: report,
    updatedAt: Date.now(),
  };

  setRoom(updated);
}

// ============================================================
// Internal: Interrupt Game
// ============================================================
async function interruptGame(room: Room, reason: string): Promise<void> {
  if (room.status === 'FINISHED' || room.status === 'INTERRUPTED') return;

  const totalCompleted = room.history.length;
  const report = await generateFinalReport(
    room.history,
    room.hostPlayerName,
    room.guestPlayerName || 'Guest',
    room.matches,
    totalCompleted,
    room.totalRounds,
    true,
    reason,
    room.gameMode,
    room.aiTone
  );

  const updated: Room = {
    ...room,
    status: 'INTERRUPTED',
    interruptedReason: reason,
    finalReport: report,
    updatedAt: Date.now(),
  };

  setRoom(updated);
}

// ============================================================
// Periodic Abandoned Room Cleanup
// ============================================================
setInterval(() => {
  const now = Date.now();
  const all = getAllRooms();
  for (const [code, room] of all.entries()) {
    const isOld = now - room.createdAt > 3600_000;
    const isAbandoned =
      now - room.hostLastSeenAt > 1200_000 &&
      (!room.guestLastSeenAt || now - room.guestLastSeenAt > 1200_000);

    if (isOld || isAbandoned) {
      deleteRoom(code);
      console.log(`[CLEANUP] Deleted inactive room: ${code}`);
    }
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
    guestPlayerName: room.guestPlayerName,
    status: room.status,
    roundNumber: room.roundNumber,
    totalRounds: room.totalRounds,
    currentQuestion: room.currentQuestion,
    currentRoundType: room.currentRoundType,
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
    gameMode: room.gameMode,
    aiTone: room.aiTone,
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
});
