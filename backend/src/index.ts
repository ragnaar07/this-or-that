// ============================================================
// THIS ⚡ THAT — Express API Server
// All game logic is authoritative here. Frontend is display-only.
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
const ROUND_DURATION_MS = 10_000; // 10 seconds
const REVEAL_HOLD_MS = 2_200;     // 2.2 seconds reveal

// ---- Middleware ----

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
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

    // Generate unique code
    let code = generateRoomCode();
    let attempts = 0;
    while (getRoom(code) && attempts < 10) {
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

    res.json({
      success: true,
      room: sanitizeRoom(room),
      playerId,
      role: 'host',
    });
  } catch (err) {
    console.error('[POST /api/rooms]', err);
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

    const updatedRoom: Room = {
      ...room,
      guestPlayerId: playerId,
      guestPlayerName: playerName,
      status: 'PLAYING',
      updatedAt: Date.now(),
    };

    // Generate first question immediately when guest joins
    const question = await generateQuestion(room.recentQuestions);
    const now = Date.now();

    updatedRoom.currentQuestion = question;
    updatedRoom.roundNumber = 1;
    updatedRoom.roundStartedAt = now;
    updatedRoom.roundDeadline = now + ROUND_DURATION_MS;
    updatedRoom.recentQuestions = [...room.recentQuestions, question.optionA].slice(-15);

    setRoom(updatedRoom);

    res.json({
      success: true,
      room: sanitizeRoom(updatedRoom),
      playerId,
      role: 'guest',
    });
  } catch (err) {
    console.error('[POST /api/rooms/:code/join]', err);
    res.status(500).json({ error: 'Could not join room.' });
  }
});

// ============================================================
// GET /api/rooms/:code — Poll room state
// Query: ?playerId=xxx
// Returns full room state for polling
// ============================================================
app.get('/api/rooms/:code', async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase().trim();
    const playerId = (req.query.playerId as string | undefined) ?? '';

    if (!isValidRoomCode(code)) {
      return res.status(400).json({ error: 'Invalid room code.' });
    }

    const room = getRoom(code);
    if (!room) {
      return res.status(404).json({ error: 'ROOM NOT FOUND.' });
    }

    // ---- Host-authoritative timeout check ----
    // Only the first request after deadline triggers resolution
    // to avoid both clients trying to resolve simultaneously.
    // Server is authoritative — this runs server-side.
    if (
      room.status === 'PLAYING' &&
      room.roundDeadline !== null &&
      Date.now() > room.roundDeadline
    ) {
      await resolveRound(room);
      const updated = getRoom(code)!;
      return res.json({ success: true, room: sanitizeRoom(updated) });
    }

    res.json({ success: true, room: sanitizeRoom(room) });
  } catch (err) {
    console.error('[GET /api/rooms/:code]', err);
    res.status(500).json({ error: 'Could not load room.' });
  }
});

// ============================================================
// POST /api/rooms/:code/answer — Submit a player's answer
// Body: { playerId, role, roundNumber, choice }
// ============================================================
app.post('/api/rooms/:code/answer', async (req: Request, res: Response) => {
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
      return res.status(403).json({ error: 'Player identity mismatch.' });
    }

    // Validate round still active
    if (room.status !== 'PLAYING') {
      return res.status(409).json({ error: 'Round is not active.' });
    }
    if (roundNumber !== room.roundNumber) {
      return res.status(409).json({ error: 'Round number mismatch.' });
    }

    // Validate choice
    if (
      typeof choice !== 'string' ||
      (choice !== room.currentQuestion?.optionA && choice !== room.currentQuestion?.optionB)
    ) {
      return res.status(400).json({ error: 'Invalid choice.' });
    }

    const answer: Answer = {
      playerId,
      roundNumber,
      choice,
      answeredAt: Date.now(),
    };

    const stored = setPlayerAnswer(code, roundNumber, role, answer);
    if (!stored) {
      return res.status(409).json({ error: 'Answer already submitted.' });
    }

    // Check if both players have answered → early reveal
    const roundAnswers = getRoundAnswers(code, roundNumber);
    const bothAnswered =
      roundAnswers.host !== undefined && roundAnswers.guest !== undefined;

    if (bothAnswered) {
      await resolveRound(room);
    }

    const updated = getRoom(code)!;
    res.json({ success: true, room: sanitizeRoom(updated) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/answer]', err);
    res.status(500).json({ error: 'Could not submit answer.' });
  }
});

// ============================================================
// POST /api/rooms/:code/next-round — Advance to next round
// Only the host should call this after reveal period ends
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

    // Must be in REVEALING state
    if (room.status !== 'REVEALING') {
      return res.json({ success: true, room: sanitizeRoom(room) });
    }

    // Generate next question
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
      lastResult: room.lastResult, // preserve for display
      recentQuestions: [...room.recentQuestions, question.optionA].slice(-15),
      updatedAt: Date.now(),
    };

    setRoom(updatedRoom);
    res.json({ success: true, room: sanitizeRoom(updatedRoom) });
  } catch (err) {
    console.error('[POST /api/rooms/:code/next-round]', err);
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
      return res.json({ success: true }); // Already gone
    }

    // If host leaves — delete room (game ends for V1)
    if (playerId === room.hostPlayerId) {
      deleteRoom(code);
      return res.json({ success: true, reason: 'host_left' });
    }

    // If guest leaves — reset to waiting (host stays)
    if (playerId === room.guestPlayerId) {
      setRoom({
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
      });
      return res.json({ success: true, reason: 'guest_left' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/rooms/:code/leave]', err);
    res.status(500).json({ error: 'Could not leave room.' });
  }
});

// ============================================================
// Internal: Resolve a round (server-authoritative)
// ============================================================
async function resolveRound(room: Room): Promise<void> {
  const code = room.code;

  // Avoid double-resolution
  const current = getRoom(code);
  if (!current || current.status !== 'PLAYING') return;

  const roundAnswers = getRoundAnswers(code, room.roundNumber);
  const hostChoice = roundAnswers.host?.choice ?? null;
  const guestChoice = roundAnswers.guest?.choice ?? null;

  const isMatch = hostChoice !== null && guestChoice !== null && hostChoice === guestChoice;
  const newMatches = room.matches + (isMatch ? 1 : 0);
  const newTotal = room.total + 1;

  setRoom({
    ...current,
    status: 'REVEALING',
    matches: newMatches,
    total: newTotal,
    lastResult: isMatch ? 'MATCH' : 'NO_MATCH',
    lastHostChoice: hostChoice,
    lastGuestChoice: guestChoice,
    updatedAt: Date.now(),
  });
}

// ============================================================
// Helpers
// ============================================================

function generatePlayerId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Return room without internal-only fields */
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

// ---- Error handler ----
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled]', err);
  res.status(500).json({ error: 'Something went wrong. Try again.' });
});

// ---- Start ----
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
