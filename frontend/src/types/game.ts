// ============================================================
// Client-side game types — mirrors server V4 types
// ============================================================

export type RoundType = 'NORMAL' | 'CHAOS' | 'PREDICTION' | 'DOUBLE_POINTS' | 'WILDCARD';

export interface Question {
  id?: string;
  category: string;
  subcategory?: string;
  difficulty?: number;
  scenario?: string;
  question?: string;
  optionA: string;
  optionB: string;
  roundType?: RoundType;
  tags?: string[];
}

export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING' | 'FINISHED' | 'INTERRUPTED';
export type GameResult = 'MATCH' | 'NO_MATCH';
export type PlayerRole = 'host' | 'guest';

export interface RoundHistoryItem {
  roundNumber: number;
  question: string;
  scenario?: string;
  category: string;
  optionA: string;
  optionB: string;
  roundType?: RoundType;
  hostChoice: string | null;
  guestChoice: string | null;
  hostPrediction?: string | null;
  guestPrediction?: string | null;
  hostPredictionResult?: 'CORRECT' | 'WRONG' | null;
  guestPredictionResult?: 'CORRECT' | 'WRONG' | null;
  result: GameResult;
  pointsAwarded: number;
  answeredAt: number;
}

export interface CategoryScore {
  category: string;
  matchPercentage: number;
  totalQuestions: number;
  matchedQuestions: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedFor?: 'both' | 'host' | 'guest';
}

export interface PredictionScore {
  hostCorrect: number;
  guestCorrect: number;
  totalPredictions: number;
  hostName: string;
  guestName: string;
  summary: string;
}

export interface FinalReport {
  headline: string;
  overallVibe: string;
  matchPercentage: number;
  completedQuestions: number;
  totalQuestions: number;
  totalScore?: number;
  maxPossibleScore?: number;
  categoryScores?: CategoryScore[];
  achievements?: Achievement[];
  predictionScore?: PredictionScore;
  strongestMatches: string[];
  biggestDifferences: string[];
  surprisingPatterns?: string[];
  contradictions?: string[];
  funniestDifference: string;
  mostUnexpectedMatch: string;
  sharedTendencies: string[];
  conversationStarters: string[];
  player1Insight?: string;
  player2Insight?: string;
  player1Profile?: string;
  player2Profile?: string;
  finalVerdict: string;
  isPartial: boolean;
  interruptedReason?: string;
  gameMode?: string;
  aiTone?: 'nice' | 'fun' | 'brutal';
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
  currentRoundType: RoundType;
  roundStartedAt: number | null;
  roundDeadline: number | null;
  matches: number;
  total: number;
  score: number;
  streak: number;
  lastResult: GameResult | null;
  lastHostChoice: string | null;
  lastGuestChoice: string | null;
  lastHostPrediction?: string | null;
  lastGuestPrediction?: string | null;
  lastHostPredictionResult?: 'CORRECT' | 'WRONG' | null;
  lastGuestPredictionResult?: 'CORRECT' | 'WRONG' | null;
  lastLiveReaction?: string | null;
  history: RoundHistoryItem[];
  finalReport: FinalReport | null;
  interruptedReason?: string;
  gameMode?: string;
  aiTone?: 'nice' | 'fun' | 'brutal';
  updatedAt: number;
}

export type AppScreen = 'HOME' | 'LOBBY' | 'GAME' | 'RESULT' | 'ABOUT' | 'HOW_TO_PLAY' | 'ERROR';

export interface PlayerSession {
  playerId: string;
  role: PlayerRole;
  roomCode: string;
  playerName: string;
}
