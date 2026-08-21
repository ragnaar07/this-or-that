import { Room, RoundAnswers, Answer, GameResultRecord } from './types';

// Primary room map
const rooms = new Map<string, Room>();

// Answers keyed by "roomCode::roundNumber"
const answers = new Map<string, RoundAnswers>();

// Completed game results persistence map keyed by "roomCode" or "gameId"
const gameResults = new Map<string, GameResultRecord>();

// Atomic finalization locks to prevent race conditions on simultaneous disconnects/leaves
const finalizingLocks = new Set<string>();

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
  finalizingLocks.delete(upper);
  // Clean related answers
  for (const key of answers.keys()) {
    if (key.startsWith(upper + '::')) {
      answers.delete(key);
    }
  }
}

// ---- Atomic Finalization Lock ----

export function tryAcquireFinalizeLock(roomCode: string): boolean {
  const upper = roomCode.toUpperCase();
  if (finalizingLocks.has(upper)) {
    return false; // already locked/finalized
  }
  finalizingLocks.add(upper);
  return true;
}

export function releaseFinalizeLock(roomCode: string): void {
  finalizingLocks.delete(roomCode.toUpperCase());
}

// ---- Game Results Persistence ----

export function saveGameResult(record: GameResultRecord): void {
  gameResults.set(record.roomCode.toUpperCase(), record);
  gameResults.set(record.gameId, record);
}

export function getGameResult(roomCodeOrId: string): GameResultRecord | undefined {
  return gameResults.get(roomCodeOrId.toUpperCase()) || gameResults.get(roomCodeOrId);
}

export function cleanupExpiredGameResults(now = Date.now(), ttlMs = 24 * 60 * 60_000): number {
  const expiredKeys = new Set<string>();

  for (const [key, record] of gameResults.entries()) {
    if (now - record.completedAt > ttlMs) {
      expiredKeys.add(key);
      expiredKeys.add(record.roomCode.toUpperCase());
      expiredKeys.add(record.gameId);
    }
  }

  for (const key of expiredKeys) {
    gameResults.delete(key);
  }

  return expiredKeys.size;
}

// ---- Answer CRUD ----

export type AnswerWriteResult = 'created' | 'duplicate' | 'conflict';

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
): AnswerWriteResult {
  const key = answerKey(roomCode, roundNumber);
  const current = answers.get(key) ?? {};

  const existing = current[role];
  if (existing) {
    const isSameAnswer =
      existing.choice === answer.choice &&
      existing.prediction === answer.prediction;

    return isSameAnswer ? 'duplicate' : 'conflict';
  }

  answers.set(key, { ...current, [role]: answer });
  return 'created';
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
