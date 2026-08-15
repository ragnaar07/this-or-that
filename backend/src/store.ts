// ============================================================
// Store — in-memory state. Swap this module for Supabase/Redis later.
// ============================================================

import { Room, RoundAnswers } from './types';

// Primary room map
const rooms = new Map<string, Room>();

// Answers keyed by "roomCode::roundNumber"
const answers = new Map<string, RoundAnswers>();

// ---- Room CRUD ----

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function setRoom(room: Room): void {
  rooms.set(room.code, { ...room, updatedAt: Date.now() });
}

export function deleteRoom(code: string): void {
  rooms.delete(code.toUpperCase());
  // Clean related answers
  for (const key of answers.keys()) {
    if (key.startsWith(code.toUpperCase() + '::')) {
      answers.delete(key);
    }
  }
}

// ---- Answer CRUD ----

function answerKey(roomCode: string, roundNumber: number): string {
  return `${roomCode.toUpperCase()}::${roundNumber}`;
}

export function getRoundAnswers(roomCode: string, roundNumber: number): RoundAnswers {
  return answers.get(answerKey(roomCode, roundNumber)) ?? {};
}

export function setPlayerAnswer(
  roomCode: string,
  roundNumber: number,
  role: 'host' | 'guest',
  answer: import('./types').Answer
): boolean {
  const key = answerKey(roomCode, roundNumber);
  const current = answers.get(key) ?? {};

  // Prevent overwriting an already-submitted answer
  if (current[role]) return false;

  answers.set(key, { ...current, [role]: answer });
  return true;
}

export function clearRoundAnswers(roomCode: string, roundNumber: number): void {
  answers.delete(answerKey(roomCode, roundNumber));
}
