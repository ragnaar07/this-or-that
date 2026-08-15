// ============================================================
// Client-side game types — mirrors server types
// ============================================================

export interface Question {
  category: string;
  optionA: string;
  optionB: string;
}

export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING' | 'FINISHED' | 'INTERRUPTED';
export type GameResult = 'MATCH' | 'NO_MATCH';
export type PlayerRole = 'host' | 'guest';

export interface RoundHistoryItem {
  roundNumber: number;
  question: string;
  category: string;
  optionA: string;
  optionB: string;
  hostChoice: string | null;
  guestChoice: string | null;
  result: GameResult;
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

export interface RoomState {
  code: string;
  hostPlayerName: string;
  guestPlayerName: string | null;
  status: RoomStatus;
  roundNumber: number;
  totalRounds: number;
  currentQuestion: Question | null;
  roundStartedAt: number | null;
  roundDeadline: number | null;
  matches: number;
  total: number;
  lastResult: GameResult | null;
  lastHostChoice: string | null;
  lastGuestChoice: string | null;
  history: RoundHistoryItem[];
  finalReport: FinalReport | null;
  interruptedReason?: string;
  updatedAt: number;
}

export type AppScreen = 'HOME' | 'LOBBY' | 'GAME' | 'RESULT' | 'ERROR';

export interface PlayerSession {
  playerId: string;
  role: PlayerRole;
  roomCode: string;
  playerName: string;
}
