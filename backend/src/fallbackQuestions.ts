// ============================================================
// Comprehensive Question Pool (V5: Quick vs Situational vs Current)
// 120+ Curated India-First Questions with 10s & 16s Timers
// ============================================================

import { Question, RoundType, QuestionFormat, QuestionType } from './types';

export const FALLBACK_QUESTIONS: Question[] = [
  // ============================================================
  // FORMAT A: QUICK THIS / THAT (TIMER: 10 SECONDS)
  // ============================================================
  {
    id: 'quick_tea_coffee',
    category: 'Food & Chai',
    subcategory: 'beverages',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Tea / Chai',
    optionB: 'Coffee',
    tags: ['quick', 'food'],
  },
  {
    id: 'quick_mountains_beach',
    category: 'Travel & Adventure',
    subcategory: 'destination',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Mountains',
    optionB: 'Beach',
    tags: ['quick', 'travel'],
  },
  {
    id: 'quick_pizza_biryani',
    category: 'Food & Chai',
    subcategory: 'cravings',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Dum Biryani',
    optionB: 'Cheesy Pizza',
    tags: ['quick', 'food'],
  },
  {
    id: 'quick_bollywood_ott',
    category: 'Bollywood & Cinema',
    subcategory: 'entertainment_format',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Bollywood Theatre',
    optionB: 'OTT Streaming',
    tags: ['quick', 'cinema'],
  },
  {
    id: 'quick_cricket_football',
    category: 'Cricket & Sports',
    subcategory: 'sports_choice',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Cricket',
    optionB: 'Football',
    tags: ['quick', 'sports'],
  },
  {
    id: 'quick_morning_night',
    category: 'Indian Everyday Life',
    subcategory: 'routine',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Early Morning Person',
    optionB: 'Late Night Owl',
    tags: ['quick', 'lifestyle'],
  },
  {
    id: 'quick_upi_cash',
    category: 'Digital & Memes',
    subcategory: 'payments',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'UPI Scan & Pay',
    optionB: 'Hard Cash in Wallet',
    tags: ['quick', 'money', 'tech'],
  },
  {
    id: 'quick_reels_youtube',
    category: 'Digital & Memes',
    subcategory: 'content_format',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Instagram Reels',
    optionB: 'Long YouTube Videos',
    tags: ['quick', 'digital'],
  },
  {
    id: 'quick_train_flight',
    category: 'Travel & Adventure',
    subcategory: 'transit',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Scenic Train Journey',
    optionB: 'Fast Flight',
    tags: ['quick', 'travel'],
  },
  {
    id: 'quick_sweet_spicy',
    category: 'Food & Chai',
    subcategory: 'flavor_profile',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Sweet Dishes / Mithai',
    optionB: 'Extra Spicy / Masaledar',
    tags: ['quick', 'food'],
  },
  {
    id: 'quick_call_text',
    category: 'Digital & Memes',
    subcategory: 'communication',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Quick Phone Call',
    optionB: 'Text Message / Chat',
    tags: ['quick', 'digital'],
  },
  {
    id: 'quick_home_party',
    category: 'Indian Everyday Life',
    subcategory: 'weekend_vibe',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Chill at Home',
    optionB: 'Loud Weekend Party',
    tags: ['quick', 'lifestyle'],
  },
  {
    id: 'quick_street_finedine',
    category: 'Food & Chai',
    subcategory: 'dining_style',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Roadside Street Food',
    optionB: 'Fine Dining Restaurant',
    tags: ['quick', 'food'],
  },
  {
    id: 'quick_android_iphone',
    category: 'Digital & Memes',
    subcategory: 'ecosystem',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Android Freedom',
    optionB: 'Apple iPhone',
    tags: ['quick', 'tech'],
  },
  {
    id: 'quick_plan_spontaneous',
    category: 'Values & Priorities',
    subcategory: 'mindset',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Strict Plan in Advance',
    optionB: '100% Spontaneous Vibes',
    tags: ['quick', 'personality'],
  },
  {
    id: 'quick_solo_group',
    category: 'Travel & Adventure',
    subcategory: 'social_travel',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Solo Exploration',
    optionB: 'Big Squad Group Trip',
    tags: ['quick', 'travel'],
  },
  {
    id: 'quick_oldsongs_newsongs',
    category: 'Bollywood & Cinema',
    subcategory: 'music_taste',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Classic 90s/2000s Nostalgia',
    optionB: 'Latest Modern Hits',
    tags: ['quick', 'music'],
  },
  {
    id: 'quick_introvert_extrovert',
    category: 'Indian Everyday Life',
    subcategory: 'personality_vibe',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Quiet Introvert Space',
    optionB: 'Social Extrovert Energy',
    tags: ['quick', 'personality'],
  },
  {
    id: 'quick_samosa_momos',
    category: 'Food & Chai',
    subcategory: 'snack_battle',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Crispy Aloo Samosa',
    optionB: 'Steaming Momos with Chutney',
    tags: ['quick', 'food'],
  },
  {
    id: 'quick_dosa_paratha',
    category: 'Regional India',
    subcategory: 'breakfast_clash',
    format: 'QUICK',
    type: 'QUICK',
    timeLimit: 10,
    difficulty: 1,
    optionA: 'Ghee Roast Crispy Dosa',
    optionB: 'Stuffed Butter Aloo Paratha',
    tags: ['quick', 'regional', 'food'],
  },

  // ============================================================
  // FORMAT B: SITUATIONAL THIS / THAT (TIMER: 16 SECONDS)
  // ============================================================
  {
    id: 'sit_job_family_city',
    category: 'Money & Career',
    subcategory: 'family_career_tradeoff',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You get a dream job offer in another city with 40% higher salary, but you can only visit your family 2–3 times a year.',
    optionA: 'Take the big career leap',
    optionB: 'Stay close to family & friends',
    tags: ['situational', 'career', 'family'],
  },
  {
    id: 'sit_10_lakh_choice',
    category: 'Money & Career',
    subcategory: 'wealth_allocation',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You suddenly receive ₹10 Lakh tax-free cash today. You can only use it for ONE path:',
    optionA: 'Invest all of it for your future wealth',
    optionB: 'Spend 6 months travelling across India freely',
    tags: ['situational', 'money', 'travel'],
  },
  {
    id: 'sit_friend_late_chai',
    category: 'Food & Chai',
    subcategory: 'chai_habits',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 1,
    scenario: 'Your friend arrives 45 minutes late, but shows up holding two hot cups of cutting chai.',
    optionA: 'Forgive them instantly because chai',
    optionB: 'Make them explain themselves first 😂',
    tags: ['situational', 'food', 'friendship'],
  },
  {
    id: 'sit_friend_cant_afford_trip',
    category: 'Friendship & Love',
    subcategory: 'trip_loyalty',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You planned a squad trip for 3 months. One day before leaving, your closest friend says they cannot afford it anymore.',
    optionA: 'Cover their share secretly & take them along',
    optionB: 'Tell them to skip this one and plan a cheaper trip later',
    tags: ['situational', 'friendship', 'money'],
  },
  {
    id: 'sit_celeb_accountability',
    category: 'Bollywood & Cinema',
    subcategory: 'art_vs_artist',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You discover that your all-time favorite actor behaves completely opposite to their humble public persona in real life.',
    optionA: 'Separate the art from the artist & keep watching',
    optionB: 'Stop supporting their movies & unfollow',
    tags: ['situational', 'cinema', 'values'],
  },
  {
    id: 'sit_boss_promo_stress',
    category: 'Money & Career',
    subcategory: 'promotion_dilemma',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You are offered a promotion that doubles your salary, but also doubles your work stress and wipes out your personal life.',
    optionA: 'Accept the grind & double salary',
    optionB: 'Decline and protect your peace of mind',
    tags: ['situational', 'career', 'lifestyle'],
  },
  {
    id: 'sit_bad_day_dinner',
    category: 'Food & Chai',
    subcategory: 'comfort_food',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 1,
    scenario: 'You just survived a thoroughly exhausting, terrible day at work/college. Dinner time arrives:',
    optionA: 'Ghar Ka Khana / Comfort Meal',
    optionB: 'Order Fancy Late-Night Swiggy Feast',
    tags: ['situational', 'food'],
  },
  {
    id: 'sit_crush_reply_delay',
    category: 'Friendship & Love',
    subcategory: 'ego_vs_chill',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 2,
    scenario: 'Someone you really like takes 8 hours to reply to your message without any explanation.',
    optionA: 'Reply normally when you see it without ego',
    optionB: 'Wait exactly 8 hours to reply back 😂',
    tags: ['situational', 'relationships'],
  },
  {
    id: 'sit_friend_bad_decision',
    category: 'Friendship & Love',
    subcategory: 'intervention',
    format: 'SITUATIONAL',
    type: 'SITUATIONAL',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Your best friend is clearly about to make a disastrous life/relationship decision despite warnings.',
    optionA: 'Intervene brutally and stop them directly',
    optionB: 'Give your opinion once, then let them learn from mistakes',
    tags: ['situational', 'friendship'],
  },

  // ============================================================
  // FORMAT C: CURRENT INDIA TOPICS & PUBLIC DEBATES (TIMER: 16 SECONDS)
  // ============================================================
  {
    id: 'current_bollywood_controversy',
    category: 'Bollywood & Cinema',
    subcategory: 'public_debate',
    format: 'SITUATIONAL',
    type: 'CURRENT',
    isCurrent: true,
    currentTopic: 'Movie Discourse & Boycotts',
    timeLimit: 16,
    difficulty: 2,
    scenario: 'A major Bollywood film becomes the center of heated social media controversy before release.',
    optionA: 'Watch it in theatre & judge for yourself',
    optionB: 'Skip it because the negativity ruined the vibe',
    tags: ['current', 'cinema', 'debate'],
  },
  {
    id: 'current_podcast_leader',
    category: 'Public Life & Culture',
    subcategory: 'conversation',
    format: 'SITUATIONAL',
    type: 'CURRENT',
    isCurrent: true,
    currentTopic: 'Leader Podcasts & Interviews',
    timeLimit: 16,
    difficulty: 2,
    scenario: 'You are hosting a 30-minute informal, non-political podcast with ONE major Indian public leader:',
    optionA: 'Narendra Modi',
    optionB: 'Rahul Gandhi',
    tags: ['current', 'public_life'],
  },
  {
    id: 'current_interview_watching_mode',
    category: 'Public Life & Culture',
    subcategory: 'media_habits',
    format: 'SITUATIONAL',
    type: 'CURRENT',
    isCurrent: true,
    currentTopic: 'Long-form Interviews vs Viral Clips',
    timeLimit: 16,
    difficulty: 2,
    scenario: 'A major national public figure gives a 2-hour long exclusive deep-dive interview:',
    optionA: 'Watch the full discussion with all nuance',
    optionB: 'Wait for the 30-second viral clips & memes online 😂',
    tags: ['current', 'public_life', 'digital'],
  },
  {
    id: 'current_ai_creativity_debate',
    category: 'Digital & Memes',
    subcategory: 'ai_future',
    format: 'SITUATIONAL',
    type: 'CURRENT',
    isCurrent: true,
    currentTopic: 'AI Music & Cinema Generation',
    timeLimit: 16,
    difficulty: 2,
    scenario: 'AI generates a chartbuster Bollywood song and viral movie script in 30 seconds:',
    optionA: 'Embrace it: If it sounds good, it is good!',
    optionB: 'Resist it: Keep Indian art & music 100% human',
    tags: ['current', 'tech', 'ai'],
  },
  {
    id: 'current_brand_ad_debate',
    category: 'Public Life & Culture',
    subcategory: 'ad_controversy',
    format: 'SITUATIONAL',
    type: 'CURRENT',
    isCurrent: true,
    currentTopic: 'Viral Commercials & Backlash',
    timeLimit: 16,
    difficulty: 2,
    scenario: 'A bold festive brand advertisement sparks trending debates across social media:',
    optionA: 'Appreciate creative freedom in storytelling',
    optionB: 'Think brands should avoid polarizing themes',
    tags: ['current', 'culture'],
  },
  {
    id: 'current_cricket_banter_culture',
    category: 'Cricket & Sports',
    subcategory: 'trolling_vs_passion',
    format: 'SITUATIONAL',
    type: 'CURRENT',
    isCurrent: true,
    currentTopic: 'Social Media Cricket Fan Wars',
    timeLimit: 16,
    difficulty: 2,
    scenario: 'After a heartbreaking cricket loss, social media erupts with intense fan debates and memes:',
    optionA: 'Stay online, read all memes & join banter',
    optionB: 'Uninstall social apps for 2 days for mental peace 😂',
    tags: ['current', 'cricket', 'digital'],
  },

  // ============================================================
  // FORMAT D: CHAOS ROUNDS (TIMER: 16 SECONDS)
  // ============================================================
  {
    id: 'chaos_superpower_india',
    category: 'Crazy & Superpowers',
    subcategory: 'desi_powers',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You receive ONE superpower, but it only functions within India:',
    optionA: 'Instantly teleport to any city/village',
    optionB: 'Pause all road traffic whenever you are running late',
    roundType: 'CHAOS',
    tags: ['chaos', 'superpower'],
  },
  {
    id: 'chaos_crore_battery',
    category: 'Crazy & Superpowers',
    subcategory: 'wild_deals',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You are offered ₹10 Crore cash, BUT your phone stays permanently on 1% battery forever:',
    optionA: 'Take the money immediately',
    optionB: 'Reject the deal: 1% battery anxiety is deadly 😂',
    roundType: 'CHAOS',
    tags: ['chaos', 'money'],
  },
  {
    id: 'chaos_delete_one_thing',
    category: 'Crazy & Superpowers',
    subcategory: 'life_wish',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You can permanently erase ONE daily annoyance from Indian everyday life:',
    optionA: 'City Traffic Jams',
    optionB: 'Spam Phone Calls & Fraud Messages',
    roundType: 'CHAOS',
    tags: ['chaos', 'lifestyle'],
  },
  {
    id: 'chaos_unlimited_pass',
    category: 'Crazy & Superpowers',
    subcategory: 'golden_ticket',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You win one magical golden card that never expires:',
    optionA: '100% Free Food & Dining Anywhere Forever',
    optionB: '100% Free Flights & Train Travel Worldwide',
    roundType: 'CHAOS',
    tags: ['chaos', 'travel', 'food'],
  },

  // ============================================================
  // FORMAT E: PREDICTION ROUNDS (MIND READER, TIMER: 16 SECONDS)
  // ============================================================
  {
    id: 'pred_voice_note_reaction',
    category: 'Digital & Memes',
    subcategory: 'chat_etiquette',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Someone sends a 3-minute, 45-second rambling audio voice note on WhatsApp:',
    optionA: 'Listen attentively at 1.5x / 2x speed',
    optionB: 'Reply: "Bhai short mein text kar de" 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'digital'],
  },
  {
    id: 'pred_insta_spiral',
    category: 'Digital & Memes',
    subcategory: 'screen_time',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You open Instagram / YouTube at 11 PM saying "just 5 minutes":',
    optionA: 'Actually close the app in 5 minutes',
    optionB: 'Suddenly it is 2:30 AM watching street food videos 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'digital'],
  },
  {
    id: 'pred_future_plan_relative',
    category: 'Indian Everyday Life',
    subcategory: 'relative_interrogation',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Nosy relative at a wedding asks: "Beta, aage ka kya future plan hai?"',
    optionA: 'Give the polite, prepared scripted answer',
    optionB: 'Awkwardly laugh and excuse yourself to the food counter 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'family'],
  },

  // ============================================================
  // FORMAT F: DOUBLE POINTS ROUNDS (TIMER: 16 SECONDS)
  // ============================================================
  {
    id: 'double_rent_vs_buy',
    category: 'Money & Career',
    subcategory: 'life_philosophy',
    format: 'SITUATIONAL',
    type: 'DOUBLE_POINTS',
    timeLimit: 16,
    difficulty: 4,
    scenario: 'Long-term living philosophy: Which path feels right for your life?',
    optionA: 'Own a cozy dream house in your home city',
    optionB: 'Rent freely and keep freedom to relocate anywhere',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'money'],
  },
  {
    id: 'double_fame_vs_wealth',
    category: 'Values & Priorities',
    subcategory: 'ultimate_ambition',
    format: 'SITUATIONAL',
    type: 'DOUBLE_POINTS',
    timeLimit: 16,
    difficulty: 4,
    scenario: 'If you had to pick ONE life outcome:',
    optionA: 'Ultra-wealthy, but completely private and anonymous',
    optionB: 'Nationally famous and respected icon with comfortable money',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'ambition'],
  },
  {
    id: 'double_peace_vs_adventure',
    category: 'Values & Priorities',
    subcategory: 'core_vibe',
    format: 'SITUATIONAL',
    type: 'DOUBLE_POINTS',
    timeLimit: 16,
    difficulty: 4,
    scenario: 'What is the fundamental goal of your 20s and 30s?',
    optionA: 'Thrilling adventures, taking huge risks and making memories',
    optionB: 'Rock-solid peace of mind, high stability and security',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'values'],
  },
];

let fallbackIndex = 0;

/**
 * Determine dynamic round type and format for alternating rhythm.
 */
export function getRoundConfiguration(roundNumber: number): {
  roundType: RoundType;
  format: QuestionFormat;
  type: QuestionType;
  timeLimit: number;
} {
  if (roundNumber === 9) {
    return { roundType: 'CHAOS', format: 'SITUATIONAL', type: 'CHAOS', timeLimit: 16 };
  }
  if (roundNumber === 10 || roundNumber === 19) {
    return { roundType: 'PREDICTION', format: 'SITUATIONAL', type: 'PREDICTION', timeLimit: 16 };
  }
  if (roundNumber === 15) {
    return { roundType: 'DOUBLE_POINTS', format: 'SITUATIONAL', type: 'DOUBLE_POINTS', timeLimit: 16 };
  }
  if (roundNumber === 5 || roundNumber === 12) {
    return { roundType: 'NORMAL', format: 'SITUATIONAL', type: 'CURRENT', timeLimit: 16 };
  }

  // Alternating Quick vs Situational rhythm
  // R1, R2, R4, R6, R8, R11, R14, R17 are Quick (10s)
  const isQuickRound = [1, 2, 4, 6, 8, 11, 14, 17].includes(roundNumber);
  if (isQuickRound) {
    return { roundType: 'NORMAL', format: 'QUICK', type: 'QUICK', timeLimit: 10 };
  }

  return { roundType: 'NORMAL', format: 'SITUATIONAL', type: 'SITUATIONAL', timeLimit: 16 };
}

export function getRoundTypeForRound(roundNumber: number): RoundType {
  return getRoundConfiguration(roundNumber).roundType;
}

export function normalizeSignature(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function isDuplicateQuestion(
  q: Question,
  recentSignatures: Set<string>
): boolean {
  const sigA = normalizeSignature(q.optionA);
  const sigB = normalizeSignature(q.optionB);
  const pairKey1 = `${sigA}__${sigB}`;
  const pairKey2 = `${sigB}__${sigA}`;

  if (q.id && recentSignatures.has(normalizeSignature(q.id))) return true;
  if (recentSignatures.has(sigA) || recentSignatures.has(sigB)) return true;
  if (recentSignatures.has(pairKey1) || recentSignatures.has(pairKey2)) return true;
  if (q.scenario && recentSignatures.has(normalizeSignature(q.scenario))) return true;

  return false;
}

export function getFallbackQuestion(
  recentQuestions: string[],
  recentCategories: string[] = [],
  roundNumber = 1,
  targetRoundType: RoundType = 'NORMAL',
  gameMode = 'RANDOM'
): Question {
  const recentSigSet = new Set<string>();
  recentQuestions.forEach((item) => {
    recentSigSet.add(normalizeSignature(item));
  });

  const config = getRoundConfiguration(roundNumber);
  const targetFormat = config.format;
  const targetType = config.type;
  const timeLimit = config.timeLimit;

  const lastCat1 = recentCategories[recentCategories.length - 1];
  const lastCat2 = recentCategories[recentCategories.length - 2];
  const forbiddenCat = lastCat1 && lastCat2 && lastCat1 === lastCat2 ? lastCat1 : null;

  let modePool = FALLBACK_QUESTIONS;
  if (gameMode === 'FOOD') {
    modePool = FALLBACK_QUESTIONS.filter((q) => q.category.includes('Food'));
  } else if (gameMode === 'ENTERTAINMENT') {
    modePool = FALLBACK_QUESTIONS.filter(
      (q) => q.category.includes('Cinema') || q.category.includes('Sports') || q.category.includes('Public')
    );
  } else if (gameMode === 'CHAOS') {
    modePool = FALLBACK_QUESTIONS.filter((q) => q.category.includes('Crazy') || q.roundType === 'CHAOS');
  } else if (gameMode === 'INDIA') {
    modePool = FALLBACK_QUESTIONS.filter((q) => q.category.includes('Regional') || q.category.includes('Everyday') || q.category.includes('Nostalgia'));
  } else if (gameMode === 'DEEP') {
    modePool = FALLBACK_QUESTIONS.filter((q) => q.category.includes('Values') || q.category.includes('Friendship') || q.category.includes('Money'));
  }

  if (modePool.length === 0) modePool = FALLBACK_QUESTIONS;

  // 1. Specific roundType match (CHAOS, PREDICTION, DOUBLE_POINTS)
  if (targetRoundType !== 'NORMAL') {
    const candidates = modePool.filter(
      (q) => q.roundType === targetRoundType && !isDuplicateQuestion(q, recentSigSet)
    );
    if (candidates.length > 0) {
      const selected = candidates[fallbackIndex % candidates.length];
      fallbackIndex++;
      return {
        ...selected,
        format: selected.format || 'SITUATIONAL',
        type: selected.type || (targetRoundType as QuestionType),
        timeLimit: selected.timeLimit || 16,
        roundType: targetRoundType,
      };
    }
  }

  // 2. Format match (QUICK vs SITUATIONAL/CURRENT)
  const formatPool = modePool.filter((q) => {
    if (forbiddenCat && q.category === forbiddenCat) return false;
    if (targetType === 'CURRENT') return q.isCurrent || q.type === 'CURRENT';
    if (targetFormat === 'QUICK') return q.format === 'QUICK';
    return q.format !== 'QUICK';
  });

  for (let i = 0; i < formatPool.length; i++) {
    const candidate = formatPool[(fallbackIndex + i) % formatPool.length];
    if (!isDuplicateQuestion(candidate, recentSigSet)) {
      fallbackIndex = (fallbackIndex + i + 1) % formatPool.length;
      return {
        ...candidate,
        format: candidate.format || targetFormat,
        type: candidate.type || targetType,
        timeLimit: candidate.timeLimit || timeLimit,
        roundType: targetRoundType,
      };
    }
  }

  // 3. General pool search
  for (let i = 0; i < modePool.length; i++) {
    const candidate = modePool[(fallbackIndex + i) % modePool.length];
    if (!isDuplicateQuestion(candidate, recentSigSet)) {
      fallbackIndex = (fallbackIndex + i + 1) % modePool.length;
      return {
        ...candidate,
        format: candidate.format || targetFormat,
        type: candidate.type || targetType,
        timeLimit: candidate.timeLimit || timeLimit,
        roundType: targetRoundType,
      };
    }
  }

  const q = modePool[fallbackIndex % modePool.length];
  fallbackIndex = (fallbackIndex + 1) % modePool.length;
  return {
    ...q,
    format: q.format || targetFormat,
    type: q.type || targetType,
    timeLimit: q.timeLimit || timeLimit,
    roundType: targetRoundType,
  };
}
