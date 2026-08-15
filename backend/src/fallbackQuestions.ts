// ============================================================
// Comprehensive Situational Evergreen Question Pool (V4.1 Viral Engine)
// 100+ High-Quality, Situational, Relatable Indian Scenarios
// ============================================================

import { Question, RoundType } from './types';

export const FALLBACK_QUESTIONS: Question[] = [
  // ============================================================
  // TIER 1: WARM-UP & RELATABLE DAILY LIFE (DIFFICULTY 1, ROUNDS 1–4)
  // ============================================================
  {
    id: 'food_late_chai',
    category: 'Food & Chai',
    subcategory: 'chai_habits',
    difficulty: 1,
    scenario: 'Your friend arrives 45 minutes late, but shows up holding two hot cups of cutting chai.',
    optionA: 'Forgive them instantly because chai',
    optionB: 'Make them explain themselves first 😂',
    tags: ['food', 'friendship', 'chai'],
  },
  {
    id: 'food_bad_day',
    category: 'Food & Chai',
    subcategory: 'comfort_food',
    difficulty: 1,
    scenario: 'You just survived a thoroughly exhausting, terrible day. Dinner time arrives:',
    optionA: 'Ghar Ka Khana / Comfort Meal',
    optionB: 'Order Fancy Late-Night Swiggy Feast',
    tags: ['food', 'lifestyle'],
  },
  {
    id: 'food_street_stall',
    category: 'Food & Chai',
    subcategory: 'street_food',
    difficulty: 1,
    scenario: 'You are travelling and spot a famous, crowded local street food stall:',
    optionA: 'Try it immediately without thinking',
    optionB: 'Check Google reviews & ratings first',
    tags: ['food', 'travel', 'hygiene'],
  },
  {
    id: 'food_sweet_habit',
    category: 'Food & Chai',
    subcategory: 'dessert',
    difficulty: 1,
    scenario: 'You just finished a heavy, spicy dinner:',
    optionA: 'Sweet dish is 100% mandatory',
    optionB: 'Totally fine skipping sweets',
    tags: ['food', 'habits'],
  },
  {
    id: 'food_unlimited_dilemma',
    category: 'Food & Chai',
    subcategory: 'favorites',
    difficulty: 1,
    scenario: 'You get an unlimited free lifetime coupon for ONE:',
    optionA: 'Unlimited Dum Biryani',
    optionB: 'Unlimited Cheesy Pizza',
    tags: ['food', 'cravings'],
  },
  {
    id: 'food_momos_vs_fancy',
    category: 'Food & Chai',
    subcategory: 'street_vs_fine',
    difficulty: 1,
    scenario: 'Evening hunger hits hard with your friends:',
    optionA: 'Roadside Steaming Momos with Spicy Chutney',
    optionB: 'Fancy Cafe Platter with Aesthetic Seating',
    tags: ['food', 'social'],
  },
  {
    id: 'food_maggi_midnight',
    category: 'Food & Chai',
    subcategory: 'midnight_cravings',
    difficulty: 1,
    scenario: '2:30 AM hunger strike at home or hostel:',
    optionA: 'Cook 2-minute spicy Maggi with cheese',
    optionB: 'Scroll Zomato for 45 minutes and sleep hungry 😂',
    tags: ['food', 'midnight'],
  },
  {
    id: 'food_spicy_tolerance',
    category: 'Food & Chai',
    subcategory: 'spice_level',
    difficulty: 1,
    scenario: 'Ordering food at an authentic Andhra/Kolhapuri restaurant:',
    optionA: 'Give me full authentic extra spicy heat',
    optionB: 'Request mild spice + extra cold curd / lassi',
    tags: ['food', 'taste'],
  },
  {
    id: 'food_samosa_crust',
    category: 'Food & Chai',
    subcategory: 'snack_style',
    difficulty: 1,
    scenario: 'Eating a piping hot samosa with mint & tamarind chutney:',
    optionA: 'Crispy crunchy corner crust first',
    optionB: 'Directly into the spiced potato filling center',
    tags: ['food', 'habits'],
  },
  {
    id: 'life_5_min_rule',
    category: 'Indian Everyday Life',
    subcategory: 'time_perception',
    difficulty: 1,
    scenario: 'Friend calls: "Bhai bas 5 minute mein pahunch raha hoon!"',
    optionA: 'Believe them & get ready',
    optionB: 'Automatically add 30 minutes in your head 😂',
    tags: ['life', 'habits', 'humor'],
  },
  {
    id: 'life_upi_processing',
    category: 'Digital & Memes',
    subcategory: 'upi_panic',
    difficulty: 1,
    scenario: 'UPI payment screen has been stuck on "Processing..." for 25 seconds:',
    optionA: 'Wait patiently for the tick mark',
    optionB: 'Panic & check bank balance 4 times 😂',
    tags: ['tech', 'digital', 'money'],
  },
  {
    id: 'life_sunday_energy',
    category: 'Indian Everyday Life',
    subcategory: 'weekend_vibe',
    difficulty: 1,
    scenario: 'You have a completely free, unscheduled Sunday ahead:',
    optionA: 'Stay home in pyjamas & recharge',
    optionB: 'Someone must make an outing plan!',
    tags: ['lifestyle', 'routine'],
  },
  {
    id: 'life_traffic_reaction',
    category: 'Indian Everyday Life',
    subcategory: 'commute_habits',
    difficulty: 1,
    scenario: 'You are stuck in a massive, bumper-to-bumper city traffic jam:',
    optionA: 'Put on music and stay zen',
    optionB: 'Full live commentary on every bad driver around you 😂',
    tags: ['commute', 'habits'],
  },
  {
    id: 'life_family_function',
    category: 'Indian Everyday Life',
    subcategory: 'social_energy',
    difficulty: 1,
    scenario: 'You walk into a huge family function with 150 relatives:',
    optionA: 'Socialize & meet everyone',
    optionB: 'Find one familiar person and glue yourself there',
    tags: ['family', 'social'],
  },
  {
    id: 'life_unexpected_guests',
    category: 'Indian Everyday Life',
    subcategory: 'home_chaos',
    difficulty: 1,
    scenario: 'Unexpected guests call saying they are 5 minutes away from your house:',
    optionA: 'Speedrun cleaning the house like a tornado',
    optionB: 'Act completely normal and pretend the house is clean',
    tags: ['home', 'family'],
  },
  {
    id: 'life_phone_battery',
    category: 'Indian Everyday Life',
    subcategory: 'battery_anxiety',
    difficulty: 1,
    scenario: 'Leaving house for the whole day:',
    optionA: 'Phone must be at 95%+ charged',
    optionB: 'Leave with 14% battery and live on hope 😂',
    tags: ['digital', 'habits'],
  },
  {
    id: 'life_train_seat',
    category: 'Indian Everyday Life',
    subcategory: 'railway_journey',
    difficulty: 1,
    scenario: 'Daytime train journey across the countryside:',
    optionA: 'Window seat with headphones on full blast',
    optionB: 'Sleep peacefully on the upper berth throughout',
    tags: ['travel', 'train'],
  },
  {
    id: 'life_morning_alarm',
    category: 'Indian Everyday Life',
    subcategory: 'sleep_discipline',
    difficulty: 1,
    scenario: 'Your alarm rings at 6:30 AM:',
    optionA: 'Wake up on the very first ring',
    optionB: 'Set 7 sequential snooze alarms every 5 minutes 😂',
    tags: ['routine', 'habits'],
  },

  // ============================================================
  // TIER 2: ENTERTAINMENT, BOLLYWOOD, CRICKET & REGIONAL (DIFFICULTY 2, ROUNDS 5–8)
  // ============================================================
  {
    id: 'cinema_family_choice',
    category: 'Bollywood & Cinema',
    subcategory: 'movie_picking',
    difficulty: 2,
    scenario: 'You are picking a movie for movie-night with family:',
    optionA: 'Safe family comedy everyone enjoys',
    optionB: 'Risk an intense thriller because YOU want to watch it',
    tags: ['cinema', 'bollywood'],
  },
  {
    id: 'cinema_biopic_genre',
    category: 'Bollywood & Cinema',
    subcategory: 'imagination',
    difficulty: 2,
    scenario: 'A Bollywood director decides to make a biopic on your life story:',
    optionA: 'Hilarious comedy with crazy chaotic drama',
    optionB: 'Intense, serious masterpiece that wins national awards',
    tags: ['cinema', 'entertainment'],
  },
  {
    id: 'cinema_remake_reaction',
    category: 'Bollywood & Cinema',
    subcategory: 'nostalgia',
    difficulty: 2,
    scenario: 'Your all-time favorite classic film is getting a modern mega-remake:',
    optionA: 'Give the new version an open-minded chance',
    optionB: 'Boycott it: "Don\'t touch the original masterpiece!" 😂',
    tags: ['cinema', 'nostalgia'],
  },
  {
    id: 'cinema_party_track',
    category: 'Bollywood & Cinema',
    subcategory: 'music_vibe',
    difficulty: 2,
    scenario: 'Dance floor is ready at a wedding. Which track do you demand from the DJ?',
    optionA: 'Iconic Bollywood Nostalgia Anthem',
    optionB: 'High-Bass Punjabi Banger with Dhol Beats',
    tags: ['music', 'party'],
  },
  {
    id: 'cinema_theatre_seat',
    category: 'Bollywood & Cinema',
    subcategory: 'theatre_habits',
    difficulty: 2,
    scenario: 'Booking cinema tickets on opening weekend:',
    optionA: 'Front rows: Whistling and crowd energy',
    optionB: 'Middle / Back row: Perfect viewing angle & peace',
    tags: ['cinema', 'habits'],
  },
  {
    id: 'cinema_ott_binge',
    category: 'Bollywood & Cinema',
    subcategory: 'ott_habits',
    difficulty: 2,
    scenario: 'A gripping 8-episode crime web series drops on Friday night:',
    optionA: 'Binge all 8 episodes until 5 AM in one sitting',
    optionB: 'Discipline: Watch 1 episode per night peacefully',
    tags: ['cinema', 'ott'],
  },
  {
    id: 'cinema_spoiler_reaction',
    category: 'Bollywood & Cinema',
    subcategory: 'spoilers',
    difficulty: 2,
    scenario: 'Friend accidentally reveals the big climax twist of a thriller you planned to watch tonight:',
    optionA: 'Still watch it and enjoy the cinematography',
    optionB: 'Cancel plan & hold an eternal grudge against the friend 😂',
    tags: ['cinema', 'friendship'],
  },
  {
    id: 'cricket_last_over',
    category: 'Cricket & Sports',
    subcategory: 'match_tension',
    difficulty: 2,
    scenario: 'India needs 12 runs to win from the final 6 balls of the match:',
    optionA: 'Watch every single ball with full heart rate',
    optionB: 'Leave the room because you literally cannot handle the tension 😂',
    tags: ['cricket', 'sports'],
  },
  {
    id: 'cricket_expert_friend',
    category: 'Cricket & Sports',
    subcategory: 'banter',
    difficulty: 2,
    scenario: 'A friend starts giving wildly wrong analysis about match tactics:',
    optionA: 'Debate them passionately with stats',
    optionB: 'Nod peacefully and let them stay delusional 😂',
    tags: ['cricket', 'friendship'],
  },
  {
    id: 'cricket_viewing_mode',
    category: 'Cricket & Sports',
    subcategory: 'atmosphere',
    difficulty: 2,
    scenario: 'Big tournament final match day:',
    optionA: 'Live screaming crowd inside the stadium',
    optionB: 'AC living room couch with snacks and close friends',
    tags: ['cricket', 'entertainment'],
  },
  {
    id: 'cricket_ipl_vs_test',
    category: 'Cricket & Sports',
    subcategory: 'cricket_style',
    difficulty: 2,
    scenario: 'Ideal cricket watching day:',
    optionA: 'High-voltage last-ball IPL thriller',
    optionB: 'Classic Day 5 Test Match masterclass',
    tags: ['cricket', 'sports'],
  },
  {
    id: 'regional_breakfast_crawl',
    category: 'Regional India',
    subcategory: 'breakfast_battle',
    difficulty: 2,
    scenario: 'You wake up starving on a holiday morning:',
    optionA: 'Crispy Dosa, Ghee Idli & Filter Coffee',
    optionB: 'Stuffed Aloo Paratha, White Butter & Lassi',
    tags: ['regional', 'food'],
  },
  {
    id: 'regional_city_vibe',
    category: 'Regional India',
    subcategory: 'city_dynamics',
    difficulty: 2,
    scenario: 'You get a one-month fully paid work-from-anywhere pass:',
    optionA: 'Misty mountain cottage in Himachal / Northeast',
    optionB: 'Sunny coastal beach town in Goa / Kerala',
    tags: ['travel', 'regional'],
  },
  {
    id: 'regional_movie_taste',
    category: 'Regional India',
    subcategory: 'cinema_diversity',
    difficulty: 2,
    scenario: 'Friday night movie pick:',
    optionA: 'Grounded, realistic regional storytelling',
    optionB: 'Massive high-budget Pan-India spectacle',
    tags: ['regional', 'cinema'],
  },
  {
    id: 'regional_street_war',
    category: 'Regional India',
    subcategory: 'street_feud',
    difficulty: 2,
    scenario: 'Late afternoon snack showdown:',
    optionA: 'Kolkata Kathi Roll with Spicy Green Sauce',
    optionB: 'Mumbai Hot Vada Pav with Fried Green Chutney',
    tags: ['regional', 'streetfood'],
  },
  {
    id: 'public_podcast_leader',
    category: 'Public Life & Culture',
    subcategory: 'conversation',
    difficulty: 2,
    scenario: 'You are hosting a 30-minute informal podcast with ONE major Indian leader:',
    optionA: 'Narendra Modi',
    optionB: 'Rahul Gandhi',
    tags: ['public_life', 'culture'],
  },
  {
    id: 'public_interview_style',
    category: 'Public Life & Culture',
    subcategory: 'media_habits',
    difficulty: 2,
    scenario: 'A major leader gives a 2-hour long exclusive interview:',
    optionA: 'Listen to the deep, nuanced discussion',
    optionB: 'Skip straight to the viral 30-second meme clips 😂',
    tags: ['public_life', 'digital'],
  },
  {
    id: 'public_non_political_q',
    category: 'Public Life & Culture',
    subcategory: 'curiosity',
    difficulty: 2,
    scenario: 'You get to ask a top Indian public figure ONE strictly non-political question:',
    optionA: '"What is your actual favourite cheat meal?"',
    optionB: '"What do you honestly do on a private Sunday?"',
    tags: ['public_life', 'curiosity'],
  },
  {
    id: 'public_event_organizer',
    category: 'Public Life & Culture',
    subcategory: 'event_hosting',
    difficulty: 2,
    scenario: 'You are organizing a huge cultural youth summit in your city. You want a chief guest who:',
    optionA: 'Delivers a roaring, electrifying stadium speech',
    optionB: 'Engages in an unscripted, candid Q&A with students',
    tags: ['public_life', 'youth'],
  },

  // ============================================================
  // TIER 3: CHAOS ROUNDS (DIFFICULTY 3, SPECIAL ROUND 9)
  // ============================================================
  {
    id: 'chaos_superpower_india',
    category: 'Crazy & Superpowers',
    subcategory: 'desi_powers',
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
    difficulty: 3,
    scenario: 'You can permanently erase ONE inconvenience from Indian everyday life:',
    optionA: 'City Traffic Jams',
    optionB: 'Spam Phone Calls & Fraud Messages',
    roundType: 'CHAOS',
    tags: ['chaos', 'lifestyle'],
  },
  {
    id: 'chaos_unlimited_pass',
    category: 'Crazy & Superpowers',
    subcategory: 'golden_ticket',
    difficulty: 3,
    scenario: 'You win one magical golden card that never expires:',
    optionA: '100% Free Food & Dining Anywhere Forever',
    optionB: '100% Free Flights & Train Travel Worldwide',
    roundType: 'CHAOS',
    tags: ['chaos', 'travel', 'food'],
  },
  {
    id: 'chaos_future_reveal',
    category: 'Crazy & Superpowers',
    subcategory: 'destiny',
    difficulty: 3,
    scenario: 'You are allowed to look into a magical mirror and see ONE guaranteed truth:',
    optionA: 'Exactly how wealthy you will become',
    optionB: 'Exactly who you will spend your life with',
    roundType: 'CHAOS',
    tags: ['chaos', 'values'],
  },
  {
    id: 'chaos_10_crore_no_net',
    category: 'Crazy & Superpowers',
    subcategory: 'digital_detox',
    difficulty: 3,
    scenario: '₹10 Crore wired to your bank account, but zero internet & social media for 1 whole year:',
    optionA: 'Sign me up: Easy money',
    optionB: 'Impossible: I will lose my mind in 3 days 😂',
    roundType: 'CHAOS',
    tags: ['chaos', 'money', 'tech'],
  },
  {
    id: 'chaos_mind_read_24h',
    category: 'Crazy & Superpowers',
    subcategory: 'telepathy',
    difficulty: 3,
    scenario: 'You can hear the unfiltered internal thoughts of everyone you meet for 24 hours:',
    optionA: 'Activate it: I want to know the whole truth',
    optionB: 'Decline: Some secrets will destroy my peace 😂',
    roundType: 'CHAOS',
    tags: ['chaos', 'superpower'],
  },
  {
    id: 'chaos_time_travel_pass',
    category: 'Crazy & Superpowers',
    subcategory: 'time_machine',
    difficulty: 3,
    scenario: 'You get a one-way ticket in a time machine with return guarantee:',
    optionA: 'Travel 100 years into the future to see tech',
    optionB: 'Travel back to Mughal / Ancient India era to see history',
    roundType: 'CHAOS',
    tags: ['chaos', 'imagination'],
  },

  // ============================================================
  // TIER 4: PREDICTION ROUNDS (DIFFICULTY 3, SPECIAL ROUNDS 10 & 19)
  // ============================================================
  {
    id: 'pred_voice_note_reaction',
    category: 'Digital & Memes',
    subcategory: 'chat_etiquette',
    difficulty: 3,
    scenario: 'Someone sends a 3-minute, 45-second rambling audio voice note:',
    optionA: 'Listen attentively at 1.5x / 2x speed',
    optionB: 'Reply: "Bhai short mein text kar de" 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'digital'],
  },
  {
    id: 'pred_insta_spiral',
    category: 'Digital & Memes',
    subcategory: 'screen_time',
    difficulty: 3,
    scenario: 'You open Instagram / YouTube at 11 PM saying "just 5 minutes":',
    optionA: 'Actually close the app in 5 minutes',
    optionB: 'Suddenly it is 2:30 AM and you are watching street food in Japan 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'digital'],
  },
  {
    id: 'pred_meme_late_night',
    category: 'Digital & Memes',
    subcategory: 'meme_loyalty',
    difficulty: 3,
    scenario: 'Your best friend sends a hilarious meme at 2:15 AM:',
    optionA: 'Reply immediately with laughter or another meme',
    optionB: 'See notification, leave it for morning',
    roundType: 'PREDICTION',
    tags: ['prediction', 'friendship'],
  },
  {
    id: 'pred_crush_reply_time',
    category: 'Friendship & Love',
    subcategory: 'ego_vs_chill',
    difficulty: 3,
    scenario: 'Someone you really like takes 8 hours to reply to your text message:',
    optionA: 'Reply normally when you see it without games',
    optionB: 'Wait exactly 8 hours to reply back 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'relationships'],
  },
  {
    id: 'pred_group_chat_role',
    category: 'Digital & Memes',
    subcategory: 'social_style',
    difficulty: 3,
    scenario: 'In a 10-person close friends WhatsApp group chat:',
    optionA: 'Hyperactive member sending 40 messages daily',
    optionB: 'Silent observer who reads everything but never types',
    roundType: 'PREDICTION',
    tags: ['prediction', 'social'],
  },
  {
    id: 'pred_friend_bad_idea',
    category: 'Friendship & Love',
    subcategory: 'intervention',
    difficulty: 3,
    scenario: 'Your best friend is clearly about to make an awful personal decision:',
    optionA: 'Intervene brutally and tell them to stop immediately',
    optionB: 'Warn them gently, but let them learn on their own',
    roundType: 'PREDICTION',
    tags: ['prediction', 'friendship'],
  },
  {
    id: 'pred_future_plan_relative',
    category: 'Indian Everyday Life',
    subcategory: 'relative_interrogation',
    difficulty: 3,
    scenario: 'Nosy relative at a wedding asks: "Beta, aage ka kya future plan hai?"',
    optionA: 'Give the polite, prepared scripted answer',
    optionB: 'Awkwardly laugh and excuse yourself to the food counter 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'family'],
  },
  {
    id: 'pred_bargain_skill',
    category: 'Indian Everyday Life',
    subcategory: 'bargain_culture',
    difficulty: 3,
    scenario: 'Shopping for souvenirs or clothes at a lively street market:',
    optionA: 'Bargain aggressively with 100% pride',
    optionB: 'Pay the quoted price to avoid awkwardness',
    roundType: 'PREDICTION',
    tags: ['prediction', 'shopping'],
  },
  {
    id: 'pred_hotel_buffet_strategy',
    category: 'Food & Chai',
    subcategory: 'buffet_tactics',
    difficulty: 3,
    scenario: 'Approaching a luxury hotel unlimited breakfast buffet:',
    optionA: 'Take multiple small healthy plates in rounds',
    optionB: 'Stack one giant plate with 12 items piled high 😂',
    roundType: 'PREDICTION',
    tags: ['prediction', 'food'],
  },

  // ============================================================
  // TIER 5: REVEALING SCENARIOS (DIFFICULTY 3, ROUNDS 11–14)
  // ============================================================
  {
    id: 'money_bonus_splurge',
    category: 'Money & Career',
    subcategory: 'spending_instinct',
    difficulty: 3,
    scenario: 'An unexpected ₹10,000 festive bonus hits your bank account today:',
    optionA: 'Put it directly into savings / investments',
    optionB: 'Treat yourself to something you have wanted for months',
    tags: ['money', 'lifestyle'],
  },
  {
    id: 'money_salary_lifestyle',
    category: 'Money & Career',
    subcategory: 'lifestyle_creep',
    difficulty: 3,
    scenario: 'You get a massive 40% salary hike in your job:',
    optionA: 'Maintain current budget & supercharge your investments',
    optionB: 'Upgrade your apartment, gadgets, and dining lifestyle',
    tags: ['money', 'career'],
  },
  {
    id: 'career_work_hours_money',
    category: 'Money & Career',
    subcategory: 'work_life_balance',
    difficulty: 3,
    scenario: 'You can permanently choose ONE career path:',
    optionA: '₹2 Lakh extra monthly salary, but 60-hour intense work weeks',
    optionB: 'Comfortable normal salary with a relaxed 4-day work week',
    tags: ['career', 'money', 'values'],
  },
  {
    id: 'career_city_choice',
    category: 'Money & Career',
    subcategory: 'city_tradeoff',
    difficulty: 3,
    scenario: 'Two job offers: One in Delhi/Gurugram with ₹20k more salary, or one in Mumbai/Bengaluru with your dream lifestyle & friends:',
    optionA: 'Follow the higher salary',
    optionB: 'Follow the dream lifestyle & social circle',
    tags: ['career', 'lifestyle'],
  },
  {
    id: 'career_boss_ping',
    category: 'Money & Career',
    subcategory: 'office_panic',
    difficulty: 3,
    scenario: 'At 5:45 PM on a Friday, your boss pings: "Quick 5 min call?"',
    optionA: 'Join immediately with zero fear',
    optionB: 'Heart skips a beat: "Did I do something wrong?!" 😂',
    tags: ['office', 'career'],
  },
  {
    id: 'travel_trip_planning',
    category: 'Travel & Adventure',
    subcategory: 'planner_vs_chaos',
    difficulty: 3,
    scenario: 'Planning a 5-day vacation with your friends:',
    optionA: 'Detailed hour-by-hour itinerary with booked spots',
    optionB: 'Book hotel only: Reach there and figure out the vibes',
    tags: ['travel', 'habits'],
  },
  {
    id: 'travel_train_vs_flight',
    category: 'Travel & Adventure',
    subcategory: 'journey_style',
    difficulty: 3,
    scenario: 'A 14-hour domestic journey across India:',
    optionA: 'Scenic overnight Rajdhani train with snacks & window seat',
    optionB: 'Quick 2-hour flight with airport security hassle',
    tags: ['travel', 'lifestyle'],
  },
  {
    id: 'travel_packing_habit',
    category: 'Travel & Adventure',
    subcategory: 'packing_style',
    difficulty: 3,
    scenario: 'Catching a 6 AM morning flight:',
    optionA: 'Bags packed neatly 2 days in advance',
    optionB: 'Throw clothes into bag 25 minutes before the cab arrives 😂',
    tags: ['travel', 'habits'],
  },
  {
    id: 'travel_photo_mode',
    category: 'Travel & Adventure',
    subcategory: 'memories',
    difficulty: 3,
    scenario: 'Reaching a breathtaking mountain sunrise viewpoint:',
    optionA: 'Take 100 photos & aesthetic reels for Instagram',
    optionB: 'Keep phone in pocket and soak in the view quietly',
    tags: ['travel', 'lifestyle'],
  },
  {
    id: 'friend_moving_away',
    category: 'Friendship & Love',
    subcategory: 'emotional_loyalty',
    difficulty: 3,
    scenario: 'Your closest best friend gets their dream job offer in London / Canada:',
    optionA: 'Cheer for them with full enthusiasm to pack their bags',
    optionB: 'Be happy, but secretly feel crushed and wish they would stay 😂',
    tags: ['friendship', 'values'],
  },
  {
    id: 'friend_bill_splitting',
    category: 'Friendship & Love',
    subcategory: 'split_culture',
    difficulty: 3,
    scenario: 'Dinner bill of ₹3,420 arrives after hanging out with close friends:',
    optionA: 'Calculate exact ₹ per person on Splitwise down to the rupee',
    optionB: 'One person pays now, alternate on the next outing',
    tags: ['money', 'friendship'],
  },
  {
    id: 'friend_secret_sharing',
    category: 'Friendship & Love',
    subcategory: 'trust',
    difficulty: 3,
    scenario: 'A friend tells you a spicy secret with "kisi ko mat batana":',
    optionA: 'Lock it away forever: zero humans will ever know',
    optionB: 'Tell only your one other best friend with "tujhe bata raha hoon" 😂',
    tags: ['friendship', 'trust'],
  },

  // ============================================================
  // TIER 6: DOUBLE POINTS ROUNDS (DIFFICULTY 4, SPECIAL ROUND 15)
  // ============================================================
  {
    id: 'double_rent_vs_buy',
    category: 'Money & Career',
    subcategory: 'life_philosophy',
    difficulty: 4,
    scenario: 'Long-term living philosophy: Which path feels right for your life?',
    optionA: 'Own a cozy dream house in your home city',
    optionB: 'Rent freely and keep the freedom to move anywhere in the world',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'money'],
  },
  {
    id: 'double_fame_vs_wealth',
    category: 'Values & Priorities',
    subcategory: 'ultimate_ambition',
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
    difficulty: 4,
    scenario: 'What is the fundamental goal of your 20s and 30s?',
    optionA: 'Thrilling adventures, taking huge risks and making memories',
    optionB: 'Rock-solid peace of mind, high stability and security',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'values'],
  },
  {
    id: 'double_argument_rule',
    category: 'Values & Priorities',
    subcategory: 'conflict_style',
    difficulty: 4,
    scenario: 'In an intense debate with someone you deeply love:',
    optionA: 'Prove your logical point and win the debate',
    optionB: 'Surrender the argument, keep the peace and order dessert',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'relationships'],
  },
  {
    id: 'double_startup_vs_corp',
    category: 'Money & Career',
    subcategory: 'career_identity',
    difficulty: 4,
    scenario: 'Your ideal professional adventure:',
    optionA: 'Build your own chaotic startup from scratch with high risk',
    optionB: 'Climb the corporate ladder in a prestigious global firm',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'career'],
  },
  {
    id: 'double_passion_vs_security',
    category: 'Values & Priorities',
    subcategory: 'life_choice',
    difficulty: 4,
    scenario: 'Choosing your life calling:',
    optionA: 'Pursue your deepest creative passion with uncertain income',
    optionB: 'Build a high-paying secure career and keep passion as a hobby',
    roundType: 'DOUBLE_POINTS',
    tags: ['double_points', 'career'],
  },

  // ============================================================
  // TIER 7: DEEP DILEMMAS & FINALE (DIFFICULTY 4, ROUNDS 16–18, 20)
  // ============================================================
  {
    id: 'deep_truth_vs_kindness',
    category: 'Values & Priorities',
    subcategory: 'honesty',
    difficulty: 4,
    scenario: 'When someone close asks for your honest opinion on something they made:',
    optionA: 'Brutally honest critique because real friends tell the truth',
    optionB: 'Kind, supportive white lie to protect their confidence',
    tags: ['values', 'friendship'],
  },
  {
    id: 'deep_forgiveness_style',
    category: 'Values & Priorities',
    subcategory: 'grudges',
    difficulty: 4,
    scenario: 'When a close friend makes a genuine mistake and apologizes:',
    optionA: 'Forgive & completely forget within 24 hours',
    optionB: 'Forgive on the outside, but internally keep the memory active 😂',
    tags: ['friendship', 'values'],
  },
  {
    id: 'nostalgia_school_bell',
    category: 'Childhood Nostalgia',
    subcategory: 'school_memories',
    difficulty: 2,
    scenario: 'School unexpectedly declared a half-day at 11 AM during monsoons:',
    optionA: 'Rush straight home to eat hot lunch and watch cartoons',
    optionB: 'Rendezvous with school gang outside to make spontaneous plans',
    tags: ['nostalgia', 'childhood'],
  },
  {
    id: 'nostalgia_vacation_memory',
    category: 'Childhood Nostalgia',
    subcategory: 'summer_break',
    difficulty: 2,
    scenario: '2-month childhood summer vacations arrive:',
    optionA: 'Pack bags for Nani\'s house with all cousins',
    optionB: 'Stay home, play video games / cricket all day in society',
    tags: ['nostalgia', 'childhood'],
  },
  {
    id: 'nostalgia_school_tiffin',
    category: 'Childhood Nostalgia',
    subcategory: 'tiffin_sharing',
    difficulty: 2,
    scenario: 'During 10-minute school lunch break:',
    optionA: 'Eat your own tiffin peacefully at your desk',
    optionB: 'Join the chaotic tiffin raid on everyone else\'s lunchbox 😂',
    tags: ['nostalgia', 'childhood'],
  },
  {
    id: 'finale_life_legacy',
    category: 'Values & Priorities',
    subcategory: 'the_grand_finale',
    difficulty: 4,
    scenario: 'THE GRAND FINALE: Looking back at your entire journey from the end:',
    optionA: 'Having built something legendary that people remember for generations',
    optionB: 'Having lived a peaceful, genuinely happy life surrounded by loved ones',
    tags: ['finale', 'values'],
  },
];

let fallbackIndex = 0;

export function getRoundTypeForRound(roundNumber: number): RoundType {
  if (roundNumber === 9) return 'CHAOS';
  if (roundNumber === 10 || roundNumber === 19) return 'PREDICTION';
  if (roundNumber === 15) return 'DOUBLE_POINTS';
  return 'NORMAL';
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

  if (targetRoundType !== 'NORMAL') {
    const candidates = modePool.filter(
      (q) => q.roundType === targetRoundType && !isDuplicateQuestion(q, recentSigSet)
    );
    if (candidates.length > 0) {
      const selected = candidates[fallbackIndex % candidates.length];
      fallbackIndex++;
      return {
        ...selected,
        roundType: targetRoundType,
      };
    }
  }

  let targetDifficulty: 1 | 2 | 3 | 4 = 1;
  if (roundNumber <= 4) targetDifficulty = 1;
  else if (roundNumber <= 8) targetDifficulty = 2;
  else if (roundNumber <= 14) targetDifficulty = 3;
  else targetDifficulty = 4;

  const difficultyPool = modePool.filter((q) => !forbiddenCat || q.category !== forbiddenCat);

  for (let i = 0; i < difficultyPool.length; i++) {
    const candidate = difficultyPool[(fallbackIndex + i) % difficultyPool.length];
    if (
      (candidate.difficulty === targetDifficulty || difficultyPool.length < 15) &&
      !isDuplicateQuestion(candidate, recentSigSet)
    ) {
      fallbackIndex = (fallbackIndex + i + 1) % difficultyPool.length;
      return {
        ...candidate,
        roundType: targetRoundType,
      };
    }
  }

  for (let i = 0; i < modePool.length; i++) {
    const candidate = modePool[(fallbackIndex + i) % modePool.length];
    if (!isDuplicateQuestion(candidate, recentSigSet)) {
      fallbackIndex = (fallbackIndex + i + 1) % modePool.length;
      return {
        ...candidate,
        roundType: targetRoundType,
      };
    }
  }

  const q = modePool[fallbackIndex % modePool.length];
  fallbackIndex = (fallbackIndex + 1) % modePool.length;
  return {
    ...q,
    roundType: targetRoundType,
  };
}
