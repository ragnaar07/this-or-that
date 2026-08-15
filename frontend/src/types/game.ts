// ============================================================
// Client-side game types — mirrors server types
// ============================================================

export interface Question {
  category: string;
  optionA: string;
  optionB: string;
}

export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING';
export type GameResult = 'MATCH' | 'NO_MATCH';
export type PlayerRole = 'host' | 'guest';

export interface RoomState {
  code: string;
  hostPlayerName: string;
  guestPlayerName: string | null;
  status: RoomStatus;
  roundNumber: number;
  currentQuestion: Question | null;
  roundStartedAt: number | null;
  roundDeadline: number | null;
  matches: number;
  total: number;
  lastResult: GameResult | null;
  lastHostChoice: string | null;
  lastGuestChoice: string | null;
  updatedAt: number;
}

export type AppScreen = 'HOME' | 'LOBBY' | 'GAME' | 'ERROR';

export interface PlayerSession {
  playerId: string;
  role: PlayerRole;
  roomCode: string;
  playerName: string;
}
