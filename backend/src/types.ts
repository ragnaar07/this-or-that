// ============================================================
// Game Types — shared between all server modules (V4 Ultimate)
// ============================================================

export type RoundType = 'NORMAL' | 'CHAOS' | 'PREDICTION' | 'DOUBLE_POINTS';

export interface Question {
  id?: string;
  category: string;
  optionA: string;
  optionB: string;
  roundType?: RoundType;
}

export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING' | 'FINISHED' | 'INTERRUPTED';

export interface RoundHistoryItem {
  roundNumber: number;
  question: string;
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
  result: 'MATCH' | 'NO_MATCH';
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
  currentRoundType: RoundType;
  roundStartedAt: number | null;
  roundDeadline: number | null;
  matches: number;
  total: number;
  score: number; // supports double points
  streak: number; // positive for match streak, negative for mismatch
  lastResult: 'MATCH' | 'NO_MATCH' | null;
  lastHostChoice: string | null;
  lastGuestChoice: string | null;
  lastHostPrediction?: string | null;
  lastGuestPrediction?: string | null;
  lastHostPredictionResult?: 'CORRECT' | 'WRONG' | null;
  lastGuestPredictionResult?: 'CORRECT' | 'WRONG' | null;
  lastLiveReaction?: string | null;
  recentQuestions: string[];
  history: RoundHistoryItem[];
  finalReport: FinalReport | null;
  interruptedReason?: string;
  gameMode: string;
  aiTone: 'nice' | 'fun' | 'brutal';
  createdAt: number;
  updatedAt: number;
}

export interface Answer {
  playerId: string;
  roundNumber: number;
  choice: string;
  prediction?: string;
  answeredAt: number;
}

export interface RoundAnswers {
  host?: Answer;
  guest?: Answer;
}
