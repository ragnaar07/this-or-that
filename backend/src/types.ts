// ============================================================
// Game Types — shared between all server modules (V5 Format + Timer Upgrade)
// ============================================================

export type QuestionFormat = 'QUICK' | 'SITUATIONAL';
export type QuestionType = 'QUICK' | 'SITUATIONAL' | 'EDGE' | 'FUNNY' | 'CHAOS' | 'PREDICTION' | 'CURRENT' | 'DOUBLE_POINTS' | 'DEEP_PSYCHOLOGY' | 'NORMAL';
export type RoundType = 'NORMAL' | 'CHAOS' | 'PREDICTION' | 'DOUBLE_POINTS' | 'DEEP_PSYCHOLOGY' | 'WILDCARD';

export interface Question {
  id?: string;
  category: string;
  subcategory?: string;
  format?: QuestionFormat;
  type?: QuestionType;
  timeLimit?: number; // 10s for QUICK, 16s for SITUATIONAL/CHAOS/PREDICTION/CURRENT, 18-20s for SPECIAL
  difficulty?: 1 | 2 | 3 | 4;
  scenario?: string;
  question?: string;
  optionA: string;
  optionB: string;
  roundType?: RoundType;
  isCurrent?: boolean;
  currentTopic?: string;
  tags?: string[];
}

export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING' | 'FINISHED' | 'INTERRUPTED';

export interface RoundHistoryItem {
  roundNumber: number;
  question: string;
  scenario?: string;
  category: string;
  format?: QuestionFormat;
  questionType?: QuestionType;
  timeLimit?: number;
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
  instinctMatchPercentage?: number;
  strategicMatchPercentage?: number;
  instinctVsStrategyInsight?: string;
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
  player1Gender?: 'male' | 'female' | 'other';
  player2Gender?: 'male' | 'female' | 'other';
  realNatureInsight?: string;
  finalVerdict: string;
  isPartial: boolean;
  interruptedReason?: string;
  leftBy?: 'host' | 'guest' | 'both';
  leftAt?: number;
  gameMode?: string;
  aiTone?: 'nice' | 'fun' | 'brutal';
  generatedAt: number;
}

export interface Room {
  code: string;
  hostPlayerId: string;
  hostPlayerName: string;
  hostGender?: 'male' | 'female' | 'other';
  hostLastSeenAt: number;
  guestPlayerId: string | null;
  guestPlayerName: string | null;
  guestGender?: 'male' | 'female' | 'other';
  guestLastSeenAt: number | null;
  deepPsychology: boolean;
  status: RoomStatus;
  roundNumber: number;
  totalRounds: number; // default 20
  currentQuestion: Question | null;
  currentRoundType: RoundType;
  currentTimeLimit: number; // 10 or 16
  currentQuestionFormat: QuestionFormat;
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
  recentCategories: string[];
  history: RoundHistoryItem[];
  finalReport: FinalReport | null;
  interruptedReason?: string;
  leftBy?: 'host' | 'guest' | 'both';
  leftAt?: number;
  gameMode: string;
  aiTone: 'nice' | 'fun' | 'brutal';
  stateVersion: number;
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
