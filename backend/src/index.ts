// ============================================================
// THIS ⚡ THAT — Express API Server (V2 Full Feature Set)
// Full multiplayer lifecycle, disconnect detection, shared AI report,
// partial results, room history, and periodic cleanup.
// ============================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { generateRoomCode, isValidRoomCode } from './roomCode';
import { generateQuestion, generateFinalReport } from './questionService';
import {
  getRoom,
  setRoom,
  deleteRoom,
  getRoundAnswers,
  setPlayerAnswer,
  clearRoundAnswers,
  getAllRooms,
} from './store';
import { Room, Answer, RoundHistoryItem, RoomStatus } from './types';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const DEFAULT_TOTAL_ROUNDS = 20;   // 20 questions per game
const ROUND_DURATION_MS = 10_000;  // 10 seconds per round
const DISCONNECT_TIMEOUT_MS = 25_000; // 25s without polling = disconnected

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
// Body: { playerName?: string, totalRounds?: number }
// ============================================================
app.post('/api/rooms', (req: Request, res: Response) => {
  try {
    const playerName = (req.body?.playerName as string | undefined)?.trim() || 'Player 1';
    const totalRounds = typeof req.body?.totalRounds === 'number' && req.body.totalRounds > 0
      ? Math.min(req.body.totalRounds, 50)
      : DEFAULT_TOTAL_ROUNDS;

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
    console.log(`[ROOM CREATED] Code: ${code}, Host: "${playerName}" (${playerId}), Total Rounds: ${totalRounds}`);

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

    const playerName = (req.body?.playerName as string | undefined)?.trim() || 'Player 2';
    const playerId = generatePlayerId();

    // Generate first question (Tier 1: Fun & Easy)
    const question = await generateQuestion(room.recentQuestions, 1);
    const now = Date.now();

    const updatedRoom: Room = {
      ...room,
      guestPlayerId: playerId,
      guestPlayerName: playerName,
      guestLastSeenAt: now,
      status: 'PLAYING',
      roundNumber: 1,
      currentQuestion: question,
      roundStartedAt: now,
      roundDeadline: now + ROUND_DURATION_MS,
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      updatedAt: now,
    };

    setRoom(updatedRoom);
    console.log(`[GUEST JOINED] Room: ${code}, Guest: "${playerName}" (${playerId}) -> Round 1: "${question.optionA}" vs "${question.optionB}"`);

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
// Query: ?playerId=xxx
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
        console.warn(`[DISCONNECT DETECTED] Room ${code}: ${missingPlayer} has been inactive > ${DISCONNECT_TIMEOUT_MS / 1000}s`);

        // Trigger partial result generation if not already generated
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
// POST /api/rooms/:code/answer — Submit a player's answer
// Body: { playerId, role, roundNumber, choice }
// ============================================================
app.post('/api/rooms/:code/answer', (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId, role, roundNumber, choice } = req.body ?? {};

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

    // Validate role
    if (role !== 'host' && role !== 'guest') {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    // Validate player identity
    const expectedId = role === 'host' ? room.hostPlayerId : room.guestPlayerId;
    if (playerId !== expectedId) {
      return res.status(403).json({ error: 'Player identity mismatch.' });
    }

    // Update presence
    const now = Date.now();
    if (role === 'host') room.hostLastSeenAt = now;
    if (role === 'guest') room.guestLastSeenAt = now;

    // Validate round number
    if (typeof roundNumber !== 'number' || roundNumber !== room.roundNumber) {
      return res.status(409).json({ error: 'Round number mismatch.' });
    }

    // Validate choice string
    if (typeof choice !== 'string' || choice.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid choice.' });
    }

    const trimmedChoice = choice.trim();
    const answer: Answer = {
      playerId,
      roundNumber,
      choice: trimmedChoice,
      answeredAt: now,
    };

    setPlayerAnswer(code, roundNumber, role, answer);

    const roundAnswers = getRoundAnswers(code, roundNumber);
    const hostChoice = roundAnswers.host?.choice ?? null;
    const guestChoice = roundAnswers.guest?.choice ?? null;

    console.log(`[ANSWER] Room: ${code} R${roundNumber}: ${role} ("${trimmedChoice}") | Host: "${hostChoice ?? 'waiting'}", Guest: "${guestChoice ?? 'waiting'}"`);

    // Case 1: Room is currently PLAYING
    if (room.status === 'PLAYING') {
      const bothAnswered = hostChoice !== null && guestChoice !== null;
      if (bothAnswered) {
        console.log(`[EARLY REVEAL] Both answered for room ${code} round ${roundNumber}`);
        const resolved = resolveRound(code);
        return res.json({ success: true, room: sanitizeRoom(resolved || room) });
      }
    }

    // Case 2: Room was already set to REVEALING (e.g. deadline grace period)
    if (room.status === 'REVEALING') {
      const isMatch =
        hostChoice !== null &&
        guestChoice !== null &&
        hostChoice.trim().toLowerCase() === guestChoice.trim().toLowerCase();

      const wasMatch = room.lastResult === 'MATCH';
      let matches = room.matches;
      if (isMatch && !wasMatch) {
        matches += 1;
      }

      const updated: Room = {
        ...room,
        lastHostChoice: hostChoice,
        lastGuestChoice: guestChoice,
        lastResult: isMatch ? 'MATCH' : 'NO_MATCH',
        matches,
        updatedAt: Date.now(),
      };

      // Update history item
      const histIdx = updated.history.findIndex(h => h.roundNumber === roundNumber);
      if (histIdx !== -1) {
        updated.history[histIdx].hostChoice = hostChoice;
        updated.history[histIdx].guestChoice = guestChoice;
        updated.history[histIdx].result = isMatch ? 'MATCH' : 'NO_MATCH';
      }

      setRoom(updated);
      return res.json({ success: true, room: sanitizeRoom(updated) });
    }

    const latest = getRoom(code)!;
    res.json({ success: true, room: sanitizeRoom(latest) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/answer] Error:', err);
    res.status(500).json({ error: 'Could not submit answer.' });
  }
});

// ============================================================
// POST /api/rooms/:code/next-round — Advance to next round or finish game
// Body: { playerId }
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

    // Check if game reached total rounds (e.g. 20 rounds completed)
    if (room.roundNumber >= room.totalRounds) {
      console.log(`[GAME COMPLETE] Room ${code} completed all ${room.totalRounds} rounds! Generating final AI analysis...`);
      await finishGame(room);
      const finished = getRoom(code)!;
      return res.json({ success: true, room: sanitizeRoom(finished) });
    }

    // Generate next dynamic question based on difficulty curve
    const nextRound = room.roundNumber + 1;
    const question = await generateQuestion(room.recentQuestions, nextRound);
    const now = Date.now();

    clearRoundAnswers(code, room.roundNumber);

    const updatedRoom: Room = {
      ...room,
      status: 'PLAYING',
      roundNumber: nextRound,
      currentQuestion: question,
      roundStartedAt: now,
      roundDeadline: now + ROUND_DURATION_MS,
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      updatedAt: now,
    };

    setRoom(updatedRoom);
    console.log(`[NEXT ROUND] Room ${code} -> Round ${nextRound}/${room.totalRounds}: "${question.optionA}" vs "${question.optionB}"`);

    res.json({ success: true, room: sanitizeRoom(updatedRoom) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/next-round] Error:', err);
    res.status(500).json({ error: 'Could not advance round.' });
  }
});

// ============================================================
// DELETE /api/rooms/:code/leave — Player leaves (generates partial result)
// Body: { playerId }
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

    // If game has not started yet (in lobby)
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

    // Active game in progress: Freeze & generate Partial Result
    console.log(`[PLAYER LEFT] ${leaverName} left room ${code} during active game. Generating partial report...`);
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

  const isMatch =
    hostChoice !== null &&
    guestChoice !== null &&
    hostChoice.trim().toLowerCase() === guestChoice.trim().toLowerCase();

  const newMatches = current.matches + (isMatch ? 1 : 0);
  const newTotal = current.total + 1;

  // Add to round history
  const historyItem: RoundHistoryItem = {
    roundNumber: current.roundNumber,
    question: `${current.currentQuestion?.optionA} or ${current.currentQuestion?.optionB}`,
    category: current.currentQuestion?.category || 'General',
    optionA: current.currentQuestion?.optionA || '',
    optionB: current.currentQuestion?.optionB || '',
    hostChoice,
    guestChoice,
    result: isMatch ? 'MATCH' : 'NO_MATCH',
    answeredAt: Date.now(),
  };

  const updated: Room = {
    ...current,
    status: 'REVEALING',
    matches: newMatches,
    total: newTotal,
    lastResult: isMatch ? 'MATCH' : 'NO_MATCH',
    lastHostChoice: hostChoice,
    lastGuestChoice: guestChoice,
    history: [...current.history, historyItem],
    updatedAt: Date.now(),
  };

  console.log(`[EVALUATION] Room ${code} R${current.roundNumber}: ${updated.lastResult} | Host: "${hostChoice ?? '—'}" | Guest: "${guestChoice ?? '—'}" | Score: ${updated.matches}/${updated.total}`);

  setRoom(updated);
  return updated;
}

// ============================================================
// Internal: Complete Game (All 20 Rounds)
// ============================================================
async function finishGame(room: Room): Promise<void> {
  if (room.finalReport) return; // Already generated

  const report = await generateFinalReport(
    room.history,
    room.hostPlayerName,
    room.guestPlayerName || 'Guest',
    room.matches,
    room.total,
    room.totalRounds,
    false // Complete
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
// Internal: Interrupt Game (Player Leaves / Disconnects)
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
    true, // Partial
    reason
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
// Periodic Abandoned Room Cleanup (Runs every 5 minutes)
// ============================================================
setInterval(() => {
  const now = Date.now();
  const all = getAllRooms();
  for (const [code, room] of all.entries()) {
    // Delete rooms older than 1 hour or inactive for > 20 mins
    const isOld = now - room.createdAt > 3600_000;
    const isAbandoned =
      now - room.hostLastSeenAt > 1200_000 &&
      (!room.guestLastSeenAt || now - room.guestLastSeenAt > 1200_000);

    if (isOld || isAbandoned) {
      deleteRoom(code);
      console.log(`[CLEANUP] Deleted inactive/expired room: ${code}`);
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
    roundStartedAt: room.roundStartedAt,
    roundDeadline: room.roundDeadline,
    matches: room.matches,
    total: room.total,
    lastResult: room.lastResult,
    lastHostChoice: room.lastHostChoice,
    lastGuestChoice: room.lastGuestChoice,
    history: room.history,
    finalReport: room.finalReport,
    interruptedReason: room.interruptedReason,
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
  console.log(`🎮 THIS ⚡ THAT server running on http://localhost:${PORT}`);
  if (process.env.GEMINI_API_KEY) {
    console.log('✨ Google Gemini AI enabled for question generation & shared analysis');
  } else if (process.env.OPENAI_API_KEY?.startsWith('sk-')) {
    console.log('✨ OpenAI enabled for question generation');
  } else {
    console.log('ℹ️  Using built-in question pool');
  }
});
