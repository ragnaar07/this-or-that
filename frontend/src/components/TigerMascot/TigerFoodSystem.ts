/* ============================================================
   Tiger Food System
   Random food spawning, chase/catch/miss sequences.
   ============================================================ */

const FOOD_POOL = ['🍕', '🍔', '🍗', '🍩', '🍟', '🍜', '🍉', '🍦', '🍛', '🥭'];

export interface FoodItem {
  emoji: string;
  x: number;          // 0 to 1 within mascot area
  visible: boolean;
  phase: 'appearing' | 'idle' | 'vanishing' | 'caught' | 'gone';
}

/**
 * Pick a random food emoji
 */
export function randomFood(): string {
  return FOOD_POOL[Math.floor(Math.random() * FOOD_POOL.length)];
}

/**
 * Get a random X position for food spawn.
 * Avoids spawning right where the tiger is.
 */
export function randomFoodPosition(tigerX: number): number {
  // Spawn food at least 0.25 away from tiger
  let pos: number;
  let attempts = 0;
  do {
    pos = 0.1 + Math.random() * 0.8;
    attempts++;
  } while (Math.abs(pos - tigerX) < 0.25 && attempts < 10);
  return pos;
}

/**
 * Generate a random spawn interval in ms (15-40 seconds)
 */
export function randomSpawnInterval(): number {
  return 15000 + Math.random() * 25000;
}

/**
 * Create a new food item
 */
export function createFood(tigerX: number): FoodItem {
  return {
    emoji: randomFood(),
    x: randomFoodPosition(tigerX),
    visible: true,
    phase: 'appearing',
  };
}
