// ============================================================
// Comprehensive Fallback Question Pool (80+ Handcrafted Questions)
// Spanning: Everyday, Fun, Crazy/Chaotic, Entertainment, Travel,
// Food, Social, Lifestyle, Imagination, Values/Priorities
// ============================================================

import { Question } from './types';

export const FALLBACK_QUESTIONS: Question[] = [
  // --- EVERYDAY ---
  { category: 'Everyday', optionA: 'Early Alarm', optionB: 'Snooze 5 Times' },
  { category: 'Everyday', optionA: 'Hot Shower', optionB: 'Cold Shower' },
  { category: 'Everyday', optionA: 'Clean As You Go', optionB: 'Clean All At Once' },
  { category: 'Everyday', optionA: 'Window Seat', optionB: 'Aisle Seat' },
  { category: 'Everyday', optionA: 'Text Immediately', optionB: 'Reply 3 Days Later' },
  { category: 'Everyday', optionA: 'Audio Message', optionB: 'Typing Novel' },
  { category: 'Everyday', optionA: '100 Open Tabs', optionB: 'Zero Inbox' },
  { category: 'Everyday', optionA: 'Phone at 1%', optionB: 'Charger Everywhere' },

  // --- FUN & SILLY ---
  { category: 'Fun', optionA: 'Sing in Shower', optionB: 'Car Karaoke' },
  { category: 'Fun', optionA: 'Wave at Stranger', optionB: 'Trip in Public' },
  { category: 'Fun', optionA: 'Sneak midnight snack', optionB: 'Order midnight feast' },
  { category: 'Fun', optionA: 'Laugh at bad jokes', optionB: 'Make deadpan puns' },
  { category: 'Fun', optionA: 'Dance like nobody watching', optionB: 'Record TikTok dance' },
  { category: 'Fun', optionA: 'Pet every stray cat', optionB: 'Befriend every dog' },
  { category: 'Fun', optionA: 'Always 15m early', optionB: 'Fashionably late' },
  { category: 'Fun', optionA: 'Wear mismatched socks', optionB: 'Iron everything' },

  // --- CRAZY & CHAOTIC ---
  { category: 'Crazy / Chaotic', optionA: 'Zombie Apocalypse Leader', optionB: 'First to Get Bitten' },
  { category: 'Crazy / Chaotic', optionA: 'Fight 1 Horse-sized Duck', optionB: '100 Duck-sized Horses' },
  { category: 'Crazy / Chaotic', optionA: 'Trapped in Haunted House', optionB: 'Lost in Wild Jungle' },
  { category: 'Crazy / Chaotic', optionA: 'Speak Only in Rhymes', optionB: 'Dance Every Time You Walk' },
  { category: 'Crazy / Chaotic', optionA: 'Never Sleep Again', optionB: 'Never Eat Junk Food' },
  { category: 'Crazy / Chaotic', optionA: 'Live Underwater', optionB: 'Live on Mars' },
  { category: 'Crazy / Chaotic', optionA: 'Win $10M But Alone', optionB: '$50k With Best Friends' },
  { category: 'Crazy / Chaotic', optionA: 'Know When You Die', optionB: 'Know How You Die' },

  // --- ENTERTAINMENT & CULTURE ---
  { category: 'Entertainment', optionA: 'Netflix & Chill', optionB: 'YouTube Rabbit Hole' },
  { category: 'Entertainment', optionA: 'Binge Whole Season', optionB: 'One Episode Weekly' },
  { category: 'Entertainment', optionA: 'Plot Twist Movies', optionB: 'Comfort Rom-Coms' },
  { category: 'Entertainment', optionA: 'Sci-Fi Universe', optionB: 'Medieval Fantasy' },
  { category: 'Entertainment', optionA: 'Spotify Playlist', optionB: 'Discover Weekly' },
  { category: 'Entertainment', optionA: 'Anime Arc', optionB: 'Sitcom Reruns' },
  { category: 'Entertainment', optionA: 'Video Games', optionB: 'Board Game Night' },
  { category: 'Entertainment', optionA: 'Live Concert', optionB: 'Front Row Movie' },

  // --- TRAVEL & ADVENTURE ---
  { category: 'Travel', optionA: 'Tropical Beach', optionB: 'Misty Mountains' },
  { category: 'Travel', optionA: '5-Star Resort', optionB: 'Backpacking Camp' },
  { category: 'Travel', optionA: 'Minute-by-minute Plan', optionB: 'Wing It Completely' },
  { category: 'Travel', optionA: 'Epic Road Trip', optionB: 'Bullet Train' },
  { category: 'Travel', optionA: 'Solo Travel', optionB: 'Big Squad Trip' },
  { category: 'Travel', optionA: 'Bustling Metropolis', optionB: 'Secluded Cabin' },
  { category: 'Travel', optionA: 'Scuba Diving', optionB: 'Skydiving' },
  { category: 'Travel', optionA: 'Explore Ancient Ruins', optionB: 'Futuristic Mega-City' },

  // --- FOOD & DRINK ---
  { category: 'Food', optionA: 'Crispy Pizza', optionB: 'Street Tacos' },
  { category: 'Food', optionA: 'Flaming Spicy', optionB: 'Mild & Creamy' },
  { category: 'Food', optionA: 'Sweet Dessert First', optionB: 'Savory Snacker' },
  { category: 'Food', optionA: 'Home Cooked Feast', optionB: 'Midnight Delivery' },
  { category: 'Food', optionA: 'Burgers & Fries', optionB: 'Fresh Sushi' },
  { category: 'Food', optionA: 'Morning Coffee', optionB: 'Evening Chai' },
  { category: 'Food', optionA: 'Extra Cheese', optionB: 'Extra Garlic Sauce' },
  { category: 'Food', optionA: 'Street Food Stall', optionB: 'Rooftop Fine Dining' },

  // --- SOCIAL & RELATIONSHIPS ---
  { category: 'Social', optionA: 'Rooftop Party', optionB: 'Cozy Living Room' },
  { category: 'Social', optionA: 'Heart-to-Heart Talk', optionB: 'Roasting Each Other' },
  { category: 'Social', optionA: 'Big Group of 20', optionB: 'Trio of Besties' },
  { category: 'Social', optionA: 'Spontaneous 2AM Drive', optionB: 'Planned 2 Weeks Ahead' },
  { category: 'Social', optionA: 'Ghost a boring party', optionB: 'Be the last one leaving' },
  { category: 'Social', optionA: 'Extrovert Dynamo', optionB: 'Introvert Hermit' },
  { category: 'Social', optionA: 'Unfiltered Truth', optionB: 'Gentle White Lie' },
  { category: 'Social', optionA: 'Board Games with Friends', optionB: 'Clubbing Till Sunrise' },

  // --- LIFESTYLE & MONEY ---
  { category: 'Lifestyle', optionA: 'Save Everything', optionB: 'Spend on Experiences' },
  { category: 'Lifestyle', optionA: 'Unlimited Free Time', optionB: 'Unlimited Career Success' },
  { category: 'Lifestyle', optionA: 'Minimalist Studio', optionB: 'Vintage Cluttered House' },
  { category: 'Lifestyle', optionA: 'Remote Work Anywhere', optionB: 'Dream Downtown Office' },
  { category: 'Lifestyle', optionA: 'High Tech Gadgets', optionB: 'Handmade Luxury' },
  { category: 'Lifestyle', optionA: 'Living in 2050', optionB: 'Living in 1980' },
  { category: 'Lifestyle', optionA: 'Cook Gourmet Meals', optionB: 'Personal Private Chef' },
  { category: 'Lifestyle', optionA: 'Work 4 Days Hard', optionB: 'Work 7 Days Chill' },

  // --- IMAGINATION & SUPERPOWERS ---
  { category: 'Imagination', optionA: 'Fly Freely', optionB: 'Instant Teleportation' },
  { category: 'Imagination', optionA: 'Read Minds', optionB: 'Be Invisible' },
  { category: 'Imagination', optionA: 'Travel to Past', optionB: 'Travel to Future' },
  { category: 'Imagination', optionA: 'Talk to Animals', optionB: 'Speak Every Language' },
  { category: 'Imagination', optionA: 'Freeze Time', optionB: 'Rewind 10 Seconds' },
  { category: 'Imagination', optionA: 'Breathe Underwater', optionB: 'Walk Through Walls' },
  { category: 'Imagination', optionA: 'Magic Wand', optionB: 'Iron Man Armor' },
  { category: 'Imagination', optionA: 'Cure Any Illness', optionB: 'End World Hunger' },

  // --- VALUES & PRIORITIES ---
  { category: 'Values', optionA: 'Thrilling Adventure', optionB: 'Peaceful Comfort' },
  { category: 'Values', optionA: 'Total Freedom', optionB: 'Rock-Solid Stability' },
  { category: 'Values', optionA: 'Logic & Reason', optionB: 'Gut Feeling' },
  { category: 'Values', optionA: 'Follow the Rules', optionB: 'Ask for Forgiveness Later' },
  { category: 'Values', optionA: 'Be Super Famous', optionB: 'Be Rich & Anonymous' },
  { category: 'Values', optionA: 'Win Every Argument', optionB: 'Keep the Peace' },
  { category: 'Values', optionA: 'Create Great Art', optionB: 'Build Great Business' },
  { category: 'Values', optionA: 'Know the Universe', optionB: 'Know Yourself Fully' },
];

let fallbackIndex = 0;

/**
 * Pick a fallback question that hasn't been used recently.
 */
export function getFallbackQuestion(recentQuestions: string[]): Question {
  const recentSet = new Set(recentQuestions.map((q) => q.toLowerCase().trim()));

  for (let i = 0; i < FALLBACK_QUESTIONS.length; i++) {
    const candidate = FALLBACK_QUESTIONS[(fallbackIndex + i) % FALLBACK_QUESTIONS.length];
    if (!recentSet.has(candidate.optionA.toLowerCase().trim())) {
      fallbackIndex = (fallbackIndex + i + 1) % FALLBACK_QUESTIONS.length;
      return candidate;
    }
  }

  const q = FALLBACK_QUESTIONS[fallbackIndex % FALLBACK_QUESTIONS.length];
  fallbackIndex = (fallbackIndex + 1) % FALLBACK_QUESTIONS.length;
  return q;
}
