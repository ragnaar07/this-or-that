// ============================================================
// Game Types — shared between all server modules
// ============================================================

export interface Question {
  category: string;
  optionA: string;
  optionB: string;
}

export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING' | 'FINISHED' | 'INTERRUPTED';

export interface RoundHistoryItem {
  roundNumber: number;
  question: string;
  category: string;
  optionA: string;
  optionB: string;
  hostChoice: string | null;
  guestChoice: string | null;
  result: 'MATCH' | 'NO_MATCH';
  answeredAt: number;
}

export interface FinalReport {
  headline: string;
  overallVibe: string;
  matchPercentage: number;
  completedQuestions: number;
  totalQuestions: number;
  strongestMatches: string[];
  biggestDifferences: string[];
  sharedTendencies: string[];
  funniestDifference: string;
  mostUnexpectedMatch: string;
  conversationStarters: string[];
  player1Profile: string;
  player2Profile: string;
  finalVerdict: string;
  isPartial: boolean;
  interruptedReason?: string;
  generatedAt: number;
}

export interface Room {
  code: string;
  hostPlayerId: string;
  hostPlayerName: string;
  hostLastSeenAt: number;
  guestPlayerId: string | null;
  guestPlayerName: string | null;
  guestLastSeenAt: number | null;
  status: RoomStatus;
  roundNumber: number;
  totalRounds: number; // default 20
  currentQuestion: Question | null;
  roundStartedAt: number | null;
  roundDeadline: number | null;
  matches: number;
  total: number;
  lastResult: 'MATCH' | 'NO_MATCH' | null;
  lastHostChoice: string | null;
  lastGuestChoice: string | null;
  recentQuestions: string[];
  history: RoundHistoryItem[];
  finalReport: FinalReport | null;
  interruptedReason?: string;
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
