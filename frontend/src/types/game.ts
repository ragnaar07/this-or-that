// ============================================================
// Client-side game types — mirrors server V5 types
// ============================================================

export type QuestionFormat = 'QUICK' | 'SITUATIONAL' | 'PREFERENCE' | 'LIFESTYLE' | 'FINANCIAL' | 'RELATIONAL' | 'PHILOSOPHICAL' | 'IDEOLOGICAL';
export type QuestionType = 'QUICK' | 'SITUATIONAL' | 'EDGE' | 'FUNNY' | 'CHAOS' | 'PREDICTION' | 'CURRENT' | 'DOUBLE_POINTS' | 'DEEP_PSYCHOLOGY' | 'NORMAL' | 'FUN' | 'DEEP' | 'DEBATE';
export type RoundType = 'NORMAL' | 'CHAOS' | 'PREDICTION' | 'DOUBLE_POINTS' | 'DEEP_PSYCHOLOGY' | 'WILDCARD' | 'FUN' | 'DEEP' | 'DEBATE';
export type Gender = 'male' | 'female' | 'other';

export interface Question {
  id?: string;
  category: string;
  subcategory?: string;
  format?: QuestionFormat;
  type?: QuestionType;
  timeLimit?: number; // 10s for QUICK, 16s for SITUATIONAL/CHAOS/PREDICTION/CURRENT, 18-20s for SPECIAL
  difficulty?: number;
  scenario?: string;
  question?: string;
  optionA: string;
  optionB: string;
  roundType?: RoundType;
  isCurrent?: boolean;
  currentTopic?: string;
  tags?: string[];
}

export type RoomStatus = 'WAITING' | 'PLAYING' | 'REVEALING' | 'PLAYER_DISCONNECTED' | 'FINISHED' | 'COMPLETED' | 'INTERRUPTED' | 'ABANDONED';
export type ResultType = 'NORMAL' | 'WIN_BY_DEFAULT' | 'DRAW' | 'ABANDONED';
export type CompletionReason = 'NORMAL_COMPLETION' | 'PLAYER_LEFT' | 'PLAYER_DISCONNECTED' | 'BOTH_DISCONNECTED' | 'TIMEOUT';
export type GameResult = 'MATCH' | 'NO_MATCH';
export type PlayerRole = 'host' | 'guest';

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
  player1Gender?: Gender;
  player2Gender?: Gender;
  realNatureInsight?: string;
  finalVerdict: string;
  isPartial: boolean;
  interruptedReason?: string;
  leftBy?: 'host' | 'guest' | 'both';
  leftAt?: number;
  winnerPlayerId?: string | null;
  loserPlayerId?: string | null;
  winnerName?: string | null;
  loserName?: string | null;
  resultType?: ResultType;
  completionReason?: CompletionReason;
  gameMode?: string;
  aiTone?: 'nice' | 'fun' | 'brutal';
  generatedAt: number;
}

export interface RoomState {
  code: string;
  hostPlayerName: string;
  hostGender?: Gender;
  guestPlayerName: string | null;
  guestGender?: Gender;
  deepPsychology?: boolean;
  status: RoomStatus;
  roundNumber: number;
  totalRounds: number;
  currentQuestion: Question | null;
  currentRoundType: RoundType;
  currentTimeLimit?: number;
  currentQuestionFormat?: QuestionFormat;
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
  leftBy?: 'host' | 'guest' | 'both';
  leftAt?: number;
  disconnectedPlayerName?: string | null;
  disconnectedRole?: 'host' | 'guest' | null;
  disconnectGraceRemaining?: number | null;
  disconnectStartedAt?: number | null;
  winnerPlayerId?: string | null;
  loserPlayerId?: string | null;
  winnerName?: string | null;
  loserName?: string | null;
  resultType?: ResultType;
  completionReason?: CompletionReason;
  gameMode?: string;
  aiTone?: 'nice' | 'fun' | 'brutal';
  stateVersion?: number;
  updatedAt: number;
}

export type AppScreen = 'HOME' | 'LOBBY' | 'GAME' | 'RESULT' | 'ABOUT' | 'HOW_TO_PLAY' | 'ERROR';

export interface PlayerSession {
  playerId: string;
  sessionId: string;
  role: PlayerRole;
  roomCode: string;
  playerName: string;
  gender?: Gender;
}
