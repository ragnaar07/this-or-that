// ============================================================
// THIS ⚡ THAT — Express API Server (Production-Ready)
// Host-authoritative multiplayer backend with robust answer sync
// ============================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { generateRoomCode, isValidRoomCode } from './roomCode';
import { generateQuestion } from './questionService';
import {
  getRoom,
  setRoom,
  deleteRoom,
  getRoundAnswers,
  setPlayerAnswer,
  clearRoundAnswers,
} from './store';
import { Room, Answer } from './types';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const ROUND_DURATION_MS = 10_000; // 10 seconds per round
const REVEAL_HOLD_MS = 2_200;     // 2.2 seconds reveal

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
    return callback(null, true); // Fallback: allow to prevent blocked requests on mobile/Render
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
// Body: { playerName?: string }
// ============================================================
app.post('/api/rooms', async (req: Request, res: Response) => {
  try {
    const playerName = (req.body?.playerName as string | undefined)?.trim() || 'Player 1';
    const playerId = generatePlayerId();

    // Generate unique 4-character uppercase code
    let code = generateRoomCode();
    let attempts = 0;
    while (getRoom(code) && attempts < 20) {
      code = generateRoomCode();
      attempts++;
    }

    const room: Room = {
      code,
      hostPlayerId: playerId,
      hostPlayerName: playerName,
      guestPlayerId: null,
      guestPlayerName: null,
      status: 'WAITING',
      roundNumber: 0,
      currentQuestion: null,
      roundStartedAt: null,
      roundDeadline: null,
      matches: 0,
      total: 0,
      lastResult: null,
      lastHostChoice: null,
      lastGuestChoice: null,
      recentQuestions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setRoom(room);
    console.log(`[ROOM CREATED] Code: ${code}, Host: "${playerName}" (${playerId})`);

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
    if (room.guestPlayerId) {
      return res.status(409).json({ error: 'THAT ROOM IS ALREADY FULL.' });
    }

    const playerName = (req.body?.playerName as string | undefined)?.trim() || 'Player 2';
    const playerId = generatePlayerId();

    // Generate first question immediately
    const question = await generateQuestion(room.recentQuestions);
    const now = Date.now();

    const updatedRoom: Room = {
      ...room,
      guestPlayerId: playerId,
      guestPlayerName: playerName,
      status: 'PLAYING',
      roundNumber: 1,
      currentQuestion: question,
      roundStartedAt: now,
      roundDeadline: now + ROUND_DURATION_MS,
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      updatedAt: now,
    };

    setRoom(updatedRoom);
    console.log(`[GUEST JOINED] Room: ${code}, Guest: "${playerName}" (${playerId}), Round 1 Started: "${question.optionA}" vs "${question.optionB}"`);

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
// GET /api/rooms/:code — Poll room state
// Query: ?playerId=xxx
// ============================================================
app.get('/api/rooms/:code', (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'Invalid room code.' });
    }

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    // ---- Host-Authoritative Timeout Check ----
    // If round timer has expired while PLAYING, resolve immediately
    if (
      room.status === 'PLAYING' &&
      room.roundDeadline !== null &&
      Date.now() > room.roundDeadline
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

    // Validate role
    if (role !== 'host' && role !== 'guest') {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    // Validate player identity
    const expectedId = role === 'host' ? room.hostPlayerId : room.guestPlayerId;
    if (playerId !== expectedId) {
      console.warn(`[ANSWER REJECTED] Identity mismatch for room ${code}: provided=${playerId}, expected=${expectedId}`);
      return res.status(403).json({ error: 'Player identity mismatch.' });
    }

    // Validate round number
    if (typeof roundNumber !== 'number' || roundNumber !== room.roundNumber) {
      console.warn(`[ANSWER REJECTED] Round mismatch for room ${code}: submitted=${roundNumber}, current=${room.roundNumber}`);
      return res.status(409).json({ error: 'Round number mismatch.' });
    }

    // Validate choice string
    if (typeof choice !== 'string' || choice.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid choice.' });
    }

    const trimmedChoice = choice.trim();

    console.log(
      `[ANSWER RECEIVED] Room: ${code}, Round: ${roundNumber}, Player: ${role} ("${trimmedChoice}")`
    );

    const answer: Answer = {
      playerId,
      roundNumber,
      choice: trimmedChoice,
      answeredAt: Date.now(),
    };

    // Store isolated player answer
    setPlayerAnswer(code, roundNumber, role, answer);

    const roundAnswers = getRoundAnswers(code, roundNumber);
    const hostChoice = roundAnswers.host?.choice ?? null;
    const guestChoice = roundAnswers.guest?.choice ?? null;

    console.log(
      `[CURRENT ANSWERS] Room: ${code}, Round: ${roundNumber} -> Host: "${hostChoice ?? 'waiting'}", Guest: "${guestChoice ?? 'waiting'}"`
    );

    // Case 1: Room is currently PLAYING
    if (room.status === 'PLAYING') {
      const bothAnswered = hostChoice !== null && guestChoice !== null;
      if (bothAnswered) {
        // Both players locked in -> Trigger early reveal immediately!
        console.log(`[EARLY REVEAL TRIGGERED] Both players answered for room ${code} round ${roundNumber}`);
        const resolved = resolveRound(code);
        return res.json({ success: true, room: sanitizeRoom(resolved || room) });
      }
    }

    // Case 2: Room was already set to REVEALING (e.g. timeout fired slightly earlier due to network latency)
    // Update the choice in room record so reveal displays actual answer instead of '-'
    if (room.status === 'REVEALING') {
      const isMatch =
        hostChoice !== null &&
        guestChoice !== null &&
        hostChoice.trim() === guestChoice.trim();

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
// POST /api/rooms/:code/next-round — Advance to next round
// Only the host triggers this after reveal period
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

    // Only host can advance rounds
    if (playerId !== room.hostPlayerId) {
      return res.status(403).json({ error: 'Only the host can advance rounds.' });
    }

    // Must be in REVEALING state to transition
    if (room.status !== 'REVEALING') {
      return res.json({ success: true, room: sanitizeRoom(room) });
    }

    // Generate next dynamic question
    const question = await generateQuestion(room.recentQuestions);
    const now = Date.now();
    const nextRound = room.roundNumber + 1;

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
    console.log(`[NEXT ROUND STARTED] Room: ${code}, Round: ${nextRound}, Question: "${question.optionA}" vs "${question.optionB}"`);

    res.json({ success: true, room: sanitizeRoom(updatedRoom) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/next-round] Error:', err);
    res.status(500).json({ error: 'Could not advance round.' });
  }
});

// ============================================================
// DELETE /api/rooms/:code/leave — Player leaves
// Body: { playerId }
// ============================================================
app.delete('/api/rooms/:code/leave', (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const { playerId } = req.body ?? {};

    const room = getRoom(code);
    if (!room) {
      return res.json({ success: true });
    }

    // If host leaves — delete room
    if (playerId === room.hostPlayerId) {
      deleteRoom(code);
      console.log(`[ROOM CLOSED] Host left room: ${code}`);
      return res.json({ success: true, reason: 'host_left' });
    }

    // If guest leaves — reset room to WAITING state
    if (playerId === room.guestPlayerId) {
      const resetRoom: Room = {
        ...room,
        guestPlayerId: null,
        guestPlayerName: null,
        status: 'WAITING',
        roundNumber: 0,
        currentQuestion: null,
        roundStartedAt: null,
        roundDeadline: null,
        lastResult: null,
        lastHostChoice: null,
        lastGuestChoice: null,
        updatedAt: Date.now(),
      };
      setRoom(resetRoom);
      console.log(`[GUEST LEFT] Room: ${code} reset to WAITING`);
      return res.json({ success: true, reason: 'guest_left' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/rooms/:code/leave] Error:', err);
    res.status(500).json({ error: 'Could not leave room.' });
  }
});

// ============================================================
// Internal: Synchronous Round Evaluation (Host-Authoritative)
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

  const updated: Room = {
    ...current,
    status: 'REVEALING',
    matches: newMatches,
    total: newTotal,
    lastResult: isMatch ? 'MATCH' : 'NO_MATCH',
    lastHostChoice: hostChoice,
    lastGuestChoice: guestChoice,
    updatedAt: Date.now(),
  };

  console.log(
    `[ROUND EVALUATION] Room: ${code}, Round: ${current.roundNumber} -> Result: ${updated.lastResult} | Host: "${hostChoice ?? '—'}" | Guest: "${guestChoice ?? '—'}" | Score: ${updated.matches}/${updated.total}`
  );

  setRoom(updated);
  return updated;
}

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
    currentQuestion: room.currentQuestion,
    roundStartedAt: room.roundStartedAt,
    roundDeadline: room.roundDeadline,
    matches: room.matches,
    total: room.total,
    lastResult: room.lastResult,
    lastHostChoice: room.lastHostChoice,
    lastGuestChoice: room.lastGuestChoice,
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
    console.log('✨ Google Gemini AI enabled for question generation');
  } else if (process.env.OPENAI_API_KEY?.startsWith('sk-')) {
    console.log('✨ OpenAI enabled for question generation');
  } else {
    console.log('ℹ️  Using built-in question pool');
  }
});
