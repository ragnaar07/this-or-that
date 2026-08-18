// ============================================================
// Store — in-memory state for rooms and isolated player answers
// ============================================================

import { Room, RoundAnswers, Answer } from './types';

// Primary room map
const rooms = new Map<string, Room>();

// Answers keyed by "roomCode::roundNumber"
const answers = new Map<string, RoundAnswers>();

// ---- Room CRUD ----

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function setRoom(room: Room): void {
  rooms.set(room.code.toUpperCase(), { ...room, updatedAt: Date.now() });
}

export function getAllRooms(): Map<string, Room> {
  return rooms;
}

export function deleteRoom(code: string): void {
  const upper = code.toUpperCase();
  rooms.delete(upper);
  // Clean related answers
  for (const key of answers.keys()) {
    if (key.startsWith(upper + '::')) {
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
  answer: Answer
): boolean {
  const key = answerKey(roomCode, roundNumber);
  const current = answers.get(key) ?? {};

  // Idempotent: If player already submitted this exact choice, return true
  if (current[role]) {
    return current[role]?.choice === answer.choice;
  }

  answers.set(key, { ...current, [role]: answer });
  return true;
}

export function clearRoundAnswers(roomCode: string, roundNumber: number): void {
  answers.delete(answerKey(roomCode, roundNumber));
}

export function clearAllRoomAnswers(roomCode: string): void {
  const upper = roomCode.toUpperCase();
  for (const key of answers.keys()) {
    if (key.startsWith(upper + '::')) {
      answers.delete(key);
    }
  }
}

