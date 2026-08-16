/* ============================================================
   Tiger Interaction System
   Hover/tap reactions with pools, cooldown, and no-repeat logic.
   ============================================================ */

export type ReactionType =
  | 'look_at_cursor'
  | 'surprised'
  | 'wave'
  | 'duck'
  | 'sniff_cursor'
  | 'annoyed'
  | 'big_smile'
  | 'scratch_head'
  | 'excited'
  | 'pretend_bite'
  | 'confused'
  | 'point_at_game';

const REACTION_POOL: ReactionType[] = [
  'look_at_cursor',
  'surprised',
  'wave',
  'duck',
  'sniff_cursor',
  'annoyed',
  'big_smile',
  'scratch_head',
  'excited',
  'pretend_bite',
  'confused',
  'point_at_game',
];

const COOLDOWN_MS = 3000;
const HISTORY_SIZE = 3;

export interface InteractionState {
  lastReactionTime: number;
  reactionHistory: ReactionType[];
}

export function createInteractionState(): InteractionState {
  return {
    lastReactionTime: 0,
    reactionHistory: [],
  };
}

/**
 * Check if a reaction can be triggered (respects cooldown)
 */
export function canReact(state: InteractionState): boolean {
  return Date.now() - state.lastReactionTime >= COOLDOWN_MS;
}

/**
 * Pick a random reaction that wasn't used recently
 */
export function pickReaction(state: InteractionState): ReactionType {
  const available = REACTION_POOL.filter(r => !state.reactionHistory.includes(r));
  const pool = available.length > 0 ? available : REACTION_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Record a reaction in history
 */
export function recordReaction(state: InteractionState, reaction: ReactionType): InteractionState {
  const history = [...state.reactionHistory, reaction].slice(-HISTORY_SIZE);
  return {
    lastReactionTime: Date.now(),
    reactionHistory: history,
  };
}

/**
 * Get expression overrides for a specific reaction
 */
export function getReactionExpression(reaction: ReactionType): {
  eyeState: 'open' | 'wide' | 'squint' | 'closed' | 'happy' | 'blink';
  mouthState: 'smile' | 'open' | 'laugh' | 'surprise' | 'sad' | 'smirk' | 'teeth';
  eyebrowState: 'neutral' | 'raised' | 'furrowed' | 'asymmetric';
  pawPose: 'rest' | 'up' | 'wave' | 'chin' | 'point';
  tailState: 'idle' | 'wag' | 'excited' | 'droop' | 'alert';
  blush: boolean;
} {
  switch (reaction) {
    case 'look_at_cursor':
      return { eyeState: 'wide', mouthState: 'smile', eyebrowState: 'raised', pawPose: 'rest', tailState: 'alert', blush: false };
    case 'surprised':
      return { eyeState: 'wide', mouthState: 'surprise', eyebrowState: 'raised', pawPose: 'up', tailState: 'alert', blush: false };
    case 'wave':
      return { eyeState: 'happy', mouthState: 'laugh', eyebrowState: 'neutral', pawPose: 'wave', tailState: 'wag', blush: true };
    case 'duck':
      return { eyeState: 'squint', mouthState: 'smile', eyebrowState: 'furrowed', pawPose: 'rest', tailState: 'droop', blush: false };
    case 'sniff_cursor':
      return { eyeState: 'squint', mouthState: 'open', eyebrowState: 'furrowed', pawPose: 'rest', tailState: 'alert', blush: false };
    case 'annoyed':
      return { eyeState: 'squint', mouthState: 'sad', eyebrowState: 'furrowed', pawPose: 'rest', tailState: 'droop', blush: false };
    case 'big_smile':
      return { eyeState: 'happy', mouthState: 'teeth', eyebrowState: 'neutral', pawPose: 'rest', tailState: 'wag', blush: true };
    case 'scratch_head':
      return { eyeState: 'open', mouthState: 'smirk', eyebrowState: 'asymmetric', pawPose: 'chin', tailState: 'idle', blush: false };
    case 'excited':
      return { eyeState: 'wide', mouthState: 'laugh', eyebrowState: 'raised', pawPose: 'up', tailState: 'excited', blush: true };
    case 'pretend_bite':
      return { eyeState: 'wide', mouthState: 'open', eyebrowState: 'furrowed', pawPose: 'rest', tailState: 'alert', blush: false };
    case 'confused':
      return { eyeState: 'open', mouthState: 'surprise', eyebrowState: 'asymmetric', pawPose: 'chin', tailState: 'idle', blush: false };
    case 'point_at_game':
      return { eyeState: 'wide', mouthState: 'teeth', eyebrowState: 'raised', pawPose: 'point', tailState: 'excited', blush: false };
    default:
      return { eyeState: 'open', mouthState: 'smile', eyebrowState: 'neutral', pawPose: 'rest', tailState: 'idle', blush: false };
  }
}

/**
 * Duration of each reaction animation in ms
 */
export function getReactionDuration(reaction: ReactionType): number {
  switch (reaction) {
    case 'excited':
    case 'pretend_bite':
      return 1800;
    case 'wave':
    case 'point_at_game':
      return 2000;
    case 'duck':
      return 1200;
    case 'look_at_cursor':
    case 'sniff_cursor':
      return 1500;
    default:
      return 1400;
  }
}
