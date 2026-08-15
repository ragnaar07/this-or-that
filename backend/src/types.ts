// ============================================================
// Game Types — shared between all server modules
// ============================================================

export interface Question {
  category: string;
  optionA: string;
  optionB: string;
}

export interface Room {
  code: string;
  hostPlayerId: string;
  hostPlayerName: string;
  guestPlayerId: string | null;
  guestPlayerName: string | null;
  status: 'WAITING' | 'PLAYING' | 'REVEALING';
  roundNumber: number;
  currentQuestion: Question | null;
  roundStartedAt: number | null;
  roundDeadline: number | null;
  matches: number;
  total: number;
  lastResult: 'MATCH' | 'NO_MATCH' | null;
  lastHostChoice: string | null;
  lastGuestChoice: string | null;
  recentQuestions: string[]; // optionA values to avoid repetition
  createdAt: number;
  updatedAt: number;
}

export interface Answer {
  playerId: string;
  roundNumber: number;
  choice: string;
  answeredAt: number;
}

export interface RoundAnswers {
  host?: Answer;
  guest?: Answer;
}
