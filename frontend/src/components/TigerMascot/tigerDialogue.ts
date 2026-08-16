/* ============================================================
   Tiger Dialogue System
   Curated witty speech pools for all moods + behaviours.
   ============================================================ */

export type TigerMood =
  | 'idle'
  | 'curious'
  | 'focused'
  | 'countdown'
  | 'waiting'
  | 'match'
  | 'noMatch'
  | 'funny'
  | 'edge'
  | 'chaos'
  | 'timeout'
  | 'opponentLeft'
  | 'resultHigh'
  | 'resultMedium'
  | 'resultLow'
  | 'celebrate'
  // Homepage behaviour moods
  | 'wandering'
  | 'hungry'
  | 'foodDetected'
  | 'disappointed'
  | 'sniffing'
  | 'lookingAtUser'
  | 'lookingAtCard'
  | 'scratching'
  | 'sitting';

export const DIALOGUE_POOLS: Record<TigerMood, string[]> = {
  idle: [
    'Ready to test your telepathy? 🐯⚡',
    'Pick fast, no overthinking! 🐾',
    'Same brain or complete opposites? ✨',
    'Trust your instincts... or don\'t 😂',
    '*yawns* ...any games happening? 🎮',
  ],
  curious: [
    'Okay... let\'s see what you pick 👀',
    'Ooh, this is an interesting one...',
    'Watching closely! 🐾',
    'No pressure... okay, a little 😂',
  ],
  focused: [
    'Focus mode activated 🎯',
    'Think fast! ⚡',
    'What would they pick? 🤔',
  ],
  countdown: [
    '3... get ready! ⚡',
    '2... lock in! 🎯',
    '1... GO! 🔥',
  ],
  waiting: [
    'Come on, don\'t leave them hanging! ⏳',
    'Still calculating the universe? 😂',
    'Tick tock... one of you is fast! 🐾',
    'Waiting on you, legend! 👀',
  ],
  match: [
    'SAME BRAIN! 🔥⚡',
    'Okayyy, suspiciously similar! 😂',
    'That was TOO easy! 🎯',
    'Telepathy confirmed! 🧠✨',
    'Pure sync energy! 💯',
  ],
  noMatch: [
    'Wait... what just happened?! 😂',
    'Different planets, same game! 🪐',
    'I did NOT see that coming 💀',
    'Opposite energy detected! ⚡',
    'That debate is going to last all night 😂',
  ],
  edge: [
    'Ohhh spicy... truth time 👀',
    'No judging... okay maybe a little 😂',
    'Real friendship test begins now 🤫',
    'This is where secrets break! ⚡',
  ],
  funny: [
    'I CANNOT with this question 🤣',
    'What kind of choice is this?! 😂',
    'The absolute chaos! 💀',
    'My whiskers are tingling 🐯',
  ],
  chaos: [
    'PURE UNHINGED CHAOS! 🌪️😂',
    'No right answers here lmao 💀',
    'Whoever wrote this is a villain 🤣',
  ],
  timeout: [
    '3 SECONDS LEFT! ⏰⚡',
    'PANIC PICK TIME! 😂',
    'LOCK IT IN FAST! 🐾',
  ],
  opponentLeft: [
    'Aww... game ended early! 🐾',
    'Someone tapped out! 🚪👀',
    'Your match score is safe with me! ⚡',
  ],
  resultHigh: [
    'Basically sharing one brain cell! 😂🔥',
    '99% telepathic sync! 🧠⚡',
    'Terrifyingly in sync! 🏆',
  ],
  resultMedium: [
    'Solid sync! Spicy debates ahead 👀',
    '50% identical, 50% chaotic! ⚡',
    'Not bad at all... you two vibe! 🐾',
  ],
  resultLow: [
    'Two completely different species! 🪐😂',
    'Opposites attract, right? ...right? 💀',
    'Zero telepathy, 100% comedy! 🤣',
  ],
  celebrate: [
    'LETS GOOOO! 🎉⚡',
    'UNSTOPPABLE SYNC! 🏆',
    'CHAMPION ENERGY! 🔥',
  ],
  // Homepage behaviour moods
  wandering: [
    '♪ walking around, looking for snacks ♪ 🐾',
    'Where\'s the food at? 👀',
    'Just vibing... 🐯',
  ],
  hungry: [
    'I\'m SO hungry rn 😭🍕',
    'My tummy is rumbling... 🐾',
    'Food? Anyone? Hello?? 😂',
    'Haven\'t eaten in like... 5 minutes 💀',
  ],
  foodDetected: [
    'WAIT... IS THAT FOOD?! 👀',
    'I SMELL SOMETHING! 🐯',
    'MINE MINE MINE! 🍗',
  ],
  disappointed: [
    'It\'s gone... just like my dreams 😔',
    'Why does the food always disappear 💀',
    'This is my villain origin story 😤',
    '*sad tiger noises* 🐾',
  ],
  sniffing: [
    '*sniff sniff* 👃',
    'I smell... possibilities 🐯',
    'Something smells interesting... 🐾',
  ],
  lookingAtUser: [
    'Oh hey! You\'re still here! 👋',
    'Play a game yet? 🎮⚡',
    '*stares at you cutely* 🐯',
    'You gonna play or just watch me? 😂',
  ],
  lookingAtCard: [
    'Psst... try the game! ⚡',
    'That button right there 👆🎮',
    'THIS ⚡ THAT awaits! 🐯',
  ],
  scratching: [
    '*scratch scratch* 🐾',
    'Ahh that\'s the spot 😌',
  ],
  sitting: [
    '*sits down dramatically* 🐯',
    'Taking a small break... 🐾',
    'Don\'t mind me, just chilling ✨',
  ],
};

/**
 * Pick a dialogue from a pool (deterministic seed or random)
 */
export function getTigerDialogue(mood: TigerMood, seed?: number | string): string {
  const pool = DIALOGUE_POOLS[mood] || DIALOGUE_POOLS.idle;
  if (seed !== undefined) {
    const numSeed = typeof seed === 'number'
      ? seed
      : seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = Math.abs(numSeed) % pool.length;
    return pool[index];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
