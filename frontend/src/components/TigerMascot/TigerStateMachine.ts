/* ============================================================
   Tiger Behaviour State Machine
   Runs only on the homepage. Manages organic wandering,
   food hunting, idle behaviours.
   ============================================================ */

export type TigerBehaviourState =
  | 'IDLE'
  | 'WANDER'
  | 'SNIFF'
  | 'LOOK_AROUND'
  | 'HUNGRY'
  | 'FOOD_DETECTED'
  | 'CHASE_FOOD'
  | 'CATCH_FOOD'
  | 'MISS_FOOD'
  | 'DISAPPOINTED'
  | 'SIT'
  | 'LOOK_AT_USER'
  | 'LOOK_AT_CARD'
  | 'REACT'
  | 'SCRATCH';

export interface TigerStateData {
  state: TigerBehaviourState;
  x: number;             // horizontal position in mascot area (0 to 1)
  vx: number;            // velocity (-1 to 1)
  facingLeft: boolean;
  stateTimer: number;    // ms remaining in current state
  foodX: number | null;  // food position if spawned (0 to 1)
  foodEmoji: string | null;
  previousState: TigerBehaviourState;
}

// Weighted random transitions from each state
const TRANSITIONS: Record<TigerBehaviourState, { state: TigerBehaviourState; weight: number }[]> = {
  IDLE: [
    { state: 'WANDER', weight: 35 },
    { state: 'LOOK_AT_USER', weight: 12 },
    { state: 'HUNGRY', weight: 15 },
    { state: 'SIT', weight: 15 },
    { state: 'SNIFF', weight: 13 },
    { state: 'SCRATCH', weight: 10 },
  ],
  WANDER: [
    { state: 'IDLE', weight: 20 },
    { state: 'SNIFF', weight: 20 },
    { state: 'LOOK_AROUND', weight: 25 },
    { state: 'LOOK_AT_CARD', weight: 10 },
    { state: 'SIT', weight: 15 },
    { state: 'HUNGRY', weight: 10 },
  ],
  SNIFF: [
    { state: 'LOOK_AROUND', weight: 30 },
    { state: 'WANDER', weight: 35 },
    { state: 'HUNGRY', weight: 25 },
    { state: 'IDLE', weight: 10 },
  ],
  LOOK_AROUND: [
    { state: 'WANDER', weight: 40 },
    { state: 'IDLE', weight: 25 },
    { state: 'LOOK_AT_USER', weight: 15 },
    { state: 'SNIFF', weight: 20 },
  ],
  HUNGRY: [
    { state: 'SNIFF', weight: 40 },
    { state: 'WANDER', weight: 35 },
    { state: 'LOOK_AT_USER', weight: 15 },
    { state: 'SIT', weight: 10 },
  ],
  FOOD_DETECTED: [
    { state: 'CHASE_FOOD', weight: 100 },
  ],
  CHASE_FOOD: [
    { state: 'CATCH_FOOD', weight: 30 },
    { state: 'MISS_FOOD', weight: 70 },
  ],
  CATCH_FOOD: [
    { state: 'IDLE', weight: 60 },
    { state: 'SIT', weight: 40 },
  ],
  MISS_FOOD: [
    { state: 'DISAPPOINTED', weight: 100 },
  ],
  DISAPPOINTED: [
    { state: 'WANDER', weight: 50 },
    { state: 'IDLE', weight: 30 },
    { state: 'SIT', weight: 20 },
  ],
  SIT: [
    { state: 'WANDER', weight: 40 },
    { state: 'LOOK_AT_USER', weight: 20 },
    { state: 'IDLE', weight: 20 },
    { state: 'SCRATCH', weight: 20 },
  ],
  LOOK_AT_USER: [
    { state: 'WANDER', weight: 40 },
    { state: 'IDLE', weight: 40 },
    { state: 'SNIFF', weight: 20 },
  ],
  LOOK_AT_CARD: [
    { state: 'WANDER', weight: 60 },
    { state: 'IDLE', weight: 40 },
  ],
  REACT: [
    { state: 'IDLE', weight: 50 },
    { state: 'WANDER', weight: 50 },
  ],
  SCRATCH: [
    { state: 'IDLE', weight: 40 },
    { state: 'WANDER', weight: 40 },
    { state: 'SIT', weight: 20 },
  ],
};

// Duration ranges per state [min, max] in ms
const DURATIONS: Record<TigerBehaviourState, [number, number]> = {
  IDLE:          [2000, 5000],
  WANDER:        [3000, 8000],
  SNIFF:         [1500, 3000],
  LOOK_AROUND:   [2000, 4000],
  HUNGRY:        [2000, 3000],
  FOOD_DETECTED: [800, 1500],
  CHASE_FOOD:    [1000, 3000],
  CATCH_FOOD:    [1500, 1500],
  MISS_FOOD:     [1200, 1200],
  DISAPPOINTED:  [1500, 2500],
  SIT:           [3000, 6000],
  LOOK_AT_USER:  [1500, 3000],
  LOOK_AT_CARD:  [2000, 3000],
  REACT:         [600, 2000],
  SCRATCH:       [1500, 2000],
};

function weightedRandom<T>(items: { state: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.state;
  }
  return items[items.length - 1].state;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function getNextState(current: TigerBehaviourState): TigerBehaviourState {
  const options = TRANSITIONS[current];
  if (!options || options.length === 0) return 'IDLE';
  return weightedRandom(options);
}

export function getStateDuration(state: TigerBehaviourState): number {
  const [min, max] = DURATIONS[state];
  return randomRange(min, max);
}

export function createInitialState(): TigerStateData {
  return {
    state: 'IDLE',
    x: 0.5,
    vx: 0,
    facingLeft: false,
    stateTimer: getStateDuration('IDLE'),
    foodX: null,
    foodEmoji: null,
    previousState: 'IDLE',
  };
}

/**
 * Get expression props for TigerSVG based on behaviour state
 */
export function getExpressionForState(state: TigerBehaviourState): {
  eyeState: 'open' | 'wide' | 'squint' | 'closed' | 'happy' | 'blink';
  mouthState: 'smile' | 'open' | 'laugh' | 'surprise' | 'sad' | 'smirk' | 'teeth';
  eyebrowState: 'neutral' | 'raised' | 'furrowed' | 'asymmetric';
  pawPose: 'rest' | 'up' | 'wave' | 'chin' | 'point';
  tailState: 'idle' | 'wag' | 'excited' | 'droop' | 'alert';
  blush: boolean;
} {
  switch (state) {
    case 'IDLE':
      return { eyeState: 'open', mouthState: 'smile', eyebrowState: 'neutral', pawPose: 'rest', tailState: 'idle', blush: false };
    case 'WANDER':
      return { eyeState: 'open', mouthState: 'smile', eyebrowState: 'neutral', pawPose: 'rest', tailState: 'wag', blush: false };
    case 'SNIFF':
      return { eyeState: 'squint', mouthState: 'open', eyebrowState: 'furrowed', pawPose: 'rest', tailState: 'alert', blush: false };
    case 'LOOK_AROUND':
      return { eyeState: 'wide', mouthState: 'smile', eyebrowState: 'raised', pawPose: 'rest', tailState: 'idle', blush: false };
    case 'HUNGRY':
      return { eyeState: 'open', mouthState: 'sad', eyebrowState: 'furrowed', pawPose: 'rest', tailState: 'droop', blush: false };
    case 'FOOD_DETECTED':
      return { eyeState: 'wide', mouthState: 'surprise', eyebrowState: 'raised', pawPose: 'rest', tailState: 'alert', blush: false };
    case 'CHASE_FOOD':
      return { eyeState: 'wide', mouthState: 'teeth', eyebrowState: 'raised', pawPose: 'rest', tailState: 'excited', blush: true };
    case 'CATCH_FOOD':
      return { eyeState: 'happy', mouthState: 'laugh', eyebrowState: 'neutral', pawPose: 'up', tailState: 'excited', blush: true };
    case 'MISS_FOOD':
      return { eyeState: 'wide', mouthState: 'surprise', eyebrowState: 'raised', pawPose: 'rest', tailState: 'idle', blush: false };
    case 'DISAPPOINTED':
      return { eyeState: 'squint', mouthState: 'sad', eyebrowState: 'furrowed', pawPose: 'rest', tailState: 'droop', blush: false };
    case 'SIT':
      return { eyeState: 'open', mouthState: 'smile', eyebrowState: 'neutral', pawPose: 'rest', tailState: 'idle', blush: false };
    case 'LOOK_AT_USER':
      return { eyeState: 'open', mouthState: 'smirk', eyebrowState: 'asymmetric', pawPose: 'rest', tailState: 'wag', blush: true };
    case 'LOOK_AT_CARD':
      return { eyeState: 'wide', mouthState: 'smile', eyebrowState: 'raised', pawPose: 'point', tailState: 'excited', blush: false };
    case 'REACT':
      return { eyeState: 'wide', mouthState: 'surprise', eyebrowState: 'raised', pawPose: 'rest', tailState: 'alert', blush: false };
    case 'SCRATCH':
      return { eyeState: 'happy', mouthState: 'smile', eyebrowState: 'neutral', pawPose: 'chin', tailState: 'idle', blush: false };
    default:
      return { eyeState: 'open', mouthState: 'smile', eyebrowState: 'neutral', pawPose: 'rest', tailState: 'idle', blush: false };
  }
}

/**
 * Walking speed multiplier for the current state
 * 0 = stationary, >0 = moving
 */
export function getSpeedForState(state: TigerBehaviourState): number {
  switch (state) {
    case 'WANDER': return 0.08 + Math.random() * 0.04;  // slow walk
    case 'CHASE_FOOD': return 0.18 + Math.random() * 0.06; // run
    case 'LOOK_AT_CARD': return 0.06;
    default: return 0;
  }
}
