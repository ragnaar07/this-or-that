// ============================================================
// Room Code Generator — 4 uppercase chars, no ambiguous chars
// ============================================================

// Remove ambiguous chars: O, 0, I, 1, L
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function isValidRoomCode(code: string): boolean {
  if (typeof code !== 'string') return false;
  const upper = code.toUpperCase().trim();
  if (upper.length !== CODE_LENGTH) return false;
  return /^[A-Z0-9]+$/.test(upper);
}
