// ============================================================
// Comprehensive Question Pool (V5.1: Edge, Funny, Absurd, Quick & Situational)
// 140+ Curated India-First Questions with No Morally Superior Answers
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
  // FORMAT B: EDGE QUESTIONS (HUMAN TRUTH, NO MORAL BIAS, 16s)
  // ============================================================
  {
    id: 'edge_job_far_friend',
    category: 'Edge & Instincts',
    subcategory: 'friendship_jealousy',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Your best friend gets a life-changing job opportunity abroad, but moving away means you will rarely meet anymore.',
    optionA: "Tell them to take it, even though I'll hate losing them",
    optionB: "Secretly hope they stay because I don't want to lose them",
    tags: ['edge', 'friendship', 'human_truth'],
  },
  {
    id: 'edge_phone_unlocked_chat',
    category: 'Edge & Instincts',
    subcategory: 'curiosity_vs_boundary',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: "You see your friend's phone unlocked on the table and notice a private conversation that clearly isn't meant for you.",
    optionA: 'Look for 5 seconds because curiosity wins',
    optionB: "Put the phone down because I don't want to know",
    tags: ['edge', 'curiosity', 'human_truth'],
  },
  {
    id: 'edge_disliked_person_success',
    category: 'Edge & Instincts',
    subcategory: 'ego_and_success',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Someone you secretly dislike achieves massive, visible success and recognition.',
    optionA: 'Genuinely congratulate them and move on',
    optionB: 'Say congratulations while secretly feeling jealous',
    tags: ['edge', 'ego', 'human_truth'],
  },
  {
    id: 'edge_secret_beneficial_info',
    category: 'Edge & Instincts',
    subcategory: 'opportunism',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Your friend confides a secret to you, but knowing this information could directly benefit your career or finances.',
    optionA: 'Keep the secret 100% even if I could gain from it',
    optionB: 'I would probably use the information if the opportunity was too good',
    tags: ['edge', 'money', 'human_truth'],
  },
  {
    id: 'edge_credit_at_work',
    category: 'Edge & Instincts',
    subcategory: 'workplace_credit',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You accidentally receive high praise and credit from seniors for a project your teammate mostly finished.',
    optionA: 'Correct everyone immediately in the room',
    optionB: 'Enjoy the credit quietly unless directly asked',
    tags: ['edge', 'career', 'human_truth'],
  },
  {
    id: 'edge_friend_disappears_relationship',
    category: 'Edge & Instincts',
    subcategory: 'relationship_jealousy',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Your best friend gets into a new relationship and starts completely disappearing from the squad.',
    optionA: 'Call them out directly and tell them they are changing',
    optionB: 'Let them disappear and wait for them to come back on their own',
    tags: ['edge', 'friendship', 'human_truth'],
  },
  {
    id: 'edge_50k_phone_temptation',
    category: 'Edge & Instincts',
    subcategory: 'impulse_spending',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You have ₹50,000 saved up. Your current phone is 3 years old, but still works fine.',
    optionA: 'Keep the ₹50k safely in savings for future',
    optionB: 'Buy the new phone because I really want it now',
    tags: ['edge', 'money', 'human_truth'],
  },
  {
    id: 'edge_rejected_person_glowup',
    category: 'Edge & Instincts',
    subcategory: 'past_regret',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'Someone who rejected you in the past becomes wildly successful, famous and attractive later.',
    optionA: 'Feel genuinely happy for their journey',
    optionB: "Quietly wonder why they didn't choose me 😂",
    tags: ['edge', 'relationships', 'human_truth'],
  },
  {
    id: 'edge_group_bill_extra_order',
    category: 'Edge & Instincts',
    subcategory: 'splitwise_conflict',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'At a big squad dinner, two friends ordered expensive drinks, but the bill comes as an equal Splitwise split.',
    optionA: 'Pay the equal split quietly without awkwardness',
    optionB: 'Speak up and say people should pay for what they ordered',
    tags: ['edge', 'money', 'social'],
  },
  {
    id: 'edge_crush_with_friend',
    category: 'Edge & Instincts',
    subcategory: 'secret_crush',
    format: 'SITUATIONAL',
    type: 'EDGE',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You realize your good friend has started dating someone you secretly had a huge crush on for months.',
    optionA: 'Smile, support them and keep feelings buried forever',
    optionB: 'Distance yourself from both of them for a few months',
    tags: ['edge', 'relationships', 'human_truth'],
  },

  // ============================================================
  // FORMAT C: FUNNY & REAL HUMAN BEHAVIOUR (TIMER: 16 SECONDS)
  // ============================================================
  {
    id: 'funny_5min_friend_promise',
    category: 'Funny & Relatable',
    subcategory: 'desi_habits',
    format: 'SITUATIONAL',
    type: 'FUNNY',
    timeLimit: 16,
    difficulty: 1,
    scenario: "Your friend calls: 'Bhai bas 5 minute mein pahunch raha hoon!'",
    optionA: 'Believe them & get ready immediately',
    optionB: 'Automatically add 30 minutes in my head 😂',
    tags: ['funny', 'relatable', 'lifestyle'],
  },
  {
    id: 'funny_we_need_to_talk',
    category: 'Funny & Relatable',
    subcategory: 'panic_texts',
    format: 'SITUATIONAL',
    type: 'FUNNY',
    timeLimit: 16,
    difficulty: 1,
    scenario: "Someone sends a text: 'We need to talk.'",
    optionA: "Reply instantly: 'Haan bolo?'",
    optionB: 'Mentally investigate every mistake I made since childhood 😂',
    tags: ['funny', 'relatable', 'digital'],
  },
  {
    id: 'funny_front_camera_public',
    category: 'Funny & Relatable',
    subcategory: 'public_embarrassment',
    format: 'SITUATIONAL',
    type: 'FUNNY',
    timeLimit: 16,
    difficulty: 1,
    scenario: 'You accidentally open the front camera at an unflattering double-chin angle in a crowded place.',
    optionA: 'Pretend nothing happened with a straight poker face',
    optionB: 'Immediately look around to check who saw me 😂',
    tags: ['funny', 'relatable'],
  },
  {
    id: 'funny_regret_message_sent',
    category: 'Funny & Relatable',
    subcategory: 'digital_regret',
    format: 'SITUATIONAL',
    type: 'FUNNY',
    timeLimit: 16,
    difficulty: 1,
    scenario: 'You send a risky message and immediately regret it within 1 second.',
    optionA: 'Delete for everyone before they can see',
    optionB: 'Stare at the screen hoping the universe fixes it 😂',
    tags: ['funny', 'digital'],
  },
  {
    id: 'funny_swiggy_2min_delay',
    category: 'Funny & Relatable',
    subcategory: 'food_delivery',
    format: 'SITUATIONAL',
    type: 'FUNNY',
    timeLimit: 16,
    difficulty: 1,
    scenario: "Your food delivery status says 'arriving in 2 mins' for the last 15 minutes.",
    optionA: 'Refresh the app every 10 seconds',
    optionB: 'Stare at the delivery rider map icon moving backward 😂',
    tags: ['funny', 'food'],
  },
  {
    id: 'funny_wifi_disconnect_game',
    category: 'Funny & Relatable',
    subcategory: 'tech_rage',
    format: 'SITUATIONAL',
    type: 'FUNNY',
    timeLimit: 16,
    difficulty: 1,
    scenario: 'Your home WiFi cuts off right in the middle of a crucial online match or meeting.',
    optionA: 'Calmly restart the router and wait',
    optionB: 'Hit the router once like it owes you money 😂',
    tags: ['funny', 'tech'],
  },

  // ============================================================
  // FORMAT D: ABSURD / JAAHIL & CHAOTIC (TIMER: 16 SECONDS)
  // ============================================================
  {
    id: 'absurd_uncle_investment_10cr',
    category: 'Crazy & Superpowers',
    subcategory: 'absurd_deals',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: "You receive ₹10 Crore cash, BUT every time you spend money, a random uncle appears and asks: 'Beta, investment kya hai?'",
    optionA: 'Take the ₹10 Crore cash',
    optionB: 'Reject the deal: I cannot live like this 😂',
    roundType: 'CHAOS',
    tags: ['chaos', 'absurd', 'money'],
  },
  {
    id: 'absurd_teleport_arey_bhai',
    category: 'Crazy & Superpowers',
    subcategory: 'absurd_superpowers',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: "You can instantly teleport anywhere in the world, BUT every teleport makes a loud 'AREY BHAI!' echo sound.",
    optionA: 'Take the superpower',
    optionB: 'Keep walking normally 😂',
    roundType: 'CHAOS',
    tags: ['chaos', 'absurd'],
  },
  {
    id: 'absurd_biryani_vs_pizza_lifetime',
    category: 'Food & Chai',
    subcategory: 'food_ultimatum',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You get 100% free unlimited Biryani for life, BUT you can never eat Pizza ever again.',
    optionA: 'Biryani wins forever',
    optionB: 'Pizza is non-negotiable',
    roundType: 'CHAOS',
    tags: ['chaos', 'food'],
  },
  {
    id: 'absurd_invisible_nobody_looking',
    category: 'Crazy & Superpowers',
    subcategory: 'useless_powers',
    format: 'SITUATIONAL',
    type: 'CHAOS',
    timeLimit: 16,
    difficulty: 3,
    scenario: 'You receive the power of invisibility, but it only works when absolutely nobody is looking at you.',
    optionA: 'Take the superpower',
    optionB: 'That is literally just being normal 😂',
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

  // ============================================================
  // FORMAT E: CURRENT INDIA TOPICS & PUBLIC DEBATES (TIMER: 16 SECONDS)
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

  // ============================================================
  // FORMAT F: PREDICTION & DOUBLE POINTS (TIMER: 16 SECONDS)
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
  if (roundNumber === 7 || roundNumber === 13) {
    return { roundType: 'NORMAL', format: 'SITUATIONAL', type: 'EDGE', timeLimit: 16 };
  }
  if (roundNumber === 3 || roundNumber === 16) {
    return { roundType: 'NORMAL', format: 'SITUATIONAL', type: 'FUNNY', timeLimit: 16 };
  }

  // Alternating Quick vs Situational rhythm (40% quick)
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
    modePool = FALLBACK_QUESTIONS.filter((q) => q.category.includes('Values') || q.category.includes('Edge') || q.category.includes('Money'));
  }

  if (modePool.length === 0) modePool = FALLBACK_QUESTIONS;

  // 1. Specific roundType match (CHAOS, PREDICTION, DOUBLE_POINTS)
  if (targetRoundType !== 'NORMAL') {
    const candidates = modePool.filter(
      (q) => q.roundType === targetRoundType &&
             (!forbiddenCat || q.category !== forbiddenCat) &&
             !isDuplicateQuestion(q, recentSigSet)
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

  // 2. Exact type match (EDGE, FUNNY, CURRENT, QUICK)
  if (targetType === 'EDGE' || targetType === 'FUNNY' || targetType === 'CURRENT') {
    const typePool = modePool.filter(
      (q) => q.type === targetType &&
             (!forbiddenCat || q.category !== forbiddenCat) &&
             !isDuplicateQuestion(q, recentSigSet)
    );
    if (typePool.length > 0) {
      const selected = typePool[fallbackIndex % typePool.length];
      fallbackIndex++;
      return {
        ...selected,
        format: selected.format || targetFormat,
        type: targetType,
        timeLimit: selected.timeLimit || timeLimit,
        roundType: targetRoundType,
      };
    }
  }

  // 3. Format match (QUICK vs SITUATIONAL)
  const formatPool = modePool.filter((q) => {
    if (forbiddenCat && q.category === forbiddenCat) return false;
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

  // 4. General pool fallback (respect forbiddenCat if possible)
  for (let i = 0; i < modePool.length; i++) {
    const candidate = modePool[(fallbackIndex + i) % modePool.length];
    if (forbiddenCat && candidate.category === forbiddenCat) continue;
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
