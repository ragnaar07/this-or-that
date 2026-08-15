// ============================================================
// Comprehensive India-First Fallback Question Pool (115+ Handcrafted Questions)
// 30+ Genres: Bollywood, Regional Cinema, Cricket, Food Universe,
// Social Quirks, Memes, Tech, Travel, Money, PG/Office, Chaos, Predictions
// ============================================================

import { Question, RoundType } from './types';

export const FALLBACK_QUESTIONS: (Question & { preferredRoundType?: RoundType; tags?: string[] })[] = [
  // ============================================================
  // TIER 1: WARM-UP & LOW PRESSURE (ROUNDS 1–4)
  // ============================================================
  // Food & Chai
  { category: 'Food & Chai', optionA: 'Roadside Tapri Chai', optionB: 'Cafe Aesthetic Coffee', tags: ['food', 'beverage'] },
  { category: 'Food & Chai', optionA: 'Chai + Biscuit', optionB: 'Chai + Samosa', tags: ['food', 'snacks'] },
  { category: 'Food & Chai', optionA: 'Ghar Ka Khana', optionB: 'Late Night Swiggy', tags: ['food', 'lifestyle'] },
  { category: 'Food & Chai', optionA: 'Crispy Samosa', optionB: 'Steaming Momos', tags: ['food', 'street'] },
  { category: 'Food & Chai', optionA: 'Pani Puri / Golgappa', optionB: 'Pav Bhaji Extra Butter', tags: ['food', 'street'] },
  { category: 'Food & Chai', optionA: 'Unlimited Biryani', optionB: 'Unlimited Pizza', tags: ['food', 'meal'] },
  { category: 'Food & Chai', optionA: 'Sweet After Dinner: Mandatory', optionB: 'Sweet After Dinner: Skip', tags: ['food', 'habits'] },
  { category: 'Food & Chai', optionA: 'Street Food Momos', optionB: 'Fancy Restaurant Starters', tags: ['food', 'lifestyle'] },
  { category: 'Food & Chai', optionA: 'Late-Night Maggi at 2 AM', optionB: 'Order Proper Swiggy Feast', tags: ['food', 'midnight'] },
  { category: 'Food & Chai', optionA: 'Sweet Lassi Tall Glass', optionB: 'Spicy Masala Chaas', tags: ['food', 'drinks'] },
  { category: 'Food & Chai', optionA: 'Warm Gulab Jamun', optionB: 'Cold Kulfi Falooda', tags: ['food', 'dessert'] },
  { category: 'Food & Chai', optionA: 'Extra Spicy Schezwan', optionB: 'Mild Creamy Butter Garlic', tags: ['food', 'taste'] },

  // Everyday Indian Quirks
  { category: 'Indian Everyday Life', optionA: 'Train: Window Seat', optionB: 'Train: Sleep Anywhere', tags: ['travel', 'life'] },
  { category: 'Indian Everyday Life', optionA: 'AC Metro Breeze', optionB: 'Auto With Music', tags: ['transport', 'commute'] },
  { category: 'Indian Everyday Life', optionA: 'Early 6 AM Riser', optionB: '3 AM Night Owl', tags: ['routine', 'habits'] },
  { category: 'Indian Everyday Life', optionA: 'Phone Battery at 100%', optionB: 'Living on 3% Danger', tags: ['tech', 'digital'] },
  { category: 'Indian Everyday Life', optionA: 'Monsoon Chai & Pakora', optionB: 'Cozy Winter Blanket', tags: ['weather', 'comfort'] },
  { category: 'Indian Everyday Life', optionA: 'Always 15 Mins Early', optionB: 'Exact Time Entry', tags: ['habits', 'time'] },
  { category: 'Indian Everyday Life', optionA: 'Clean Room Every Sunday', optionB: 'Clean As You Go Daily', tags: ['routine', 'home'] },
  { category: 'Indian Everyday Life', optionA: 'Sunglasses Everywhere', optionB: 'Cap & Hoodie Chill', tags: ['style', 'everyday'] },
  { category: 'Indian Everyday Life', optionA: 'Morning Walk Vibes', optionB: 'Late Night Stroll Peace', tags: ['habits', 'routine'] },

  // ============================================================
  // TIER 2: PREFERENCES & ENTERTAINMENT (ROUNDS 5–8)
  // ============================================================
  // Bollywood & Indian Cinema
  { category: 'Bollywood & Cinema', optionA: 'Classic Bollywood Romance', optionB: 'Modern Quirky Rom-Com', tags: ['bollywood', 'cinema'] },
  { category: 'Bollywood & Cinema', optionA: 'Rajkumar Hirani Comedy', optionB: 'Dark Intense Thriller', tags: ['bollywood', 'movies'] },
  { category: 'Bollywood & Cinema', optionA: 'Rewatch Favourite Movie', optionB: 'Watch Something New', tags: ['cinema', 'ott'] },
  { category: 'Bollywood & Cinema', optionA: 'Bollywood Wedding Song', optionB: 'Punjabi High-Energy Track', tags: ['music', 'party'] },
  { category: 'Bollywood & Cinema', optionA: 'Cinema Hall: First Row', optionB: 'Cinema Hall: Perfect Middle', tags: ['cinema', 'habits'] },
  { category: 'Bollywood & Cinema', optionA: 'Your Biopic: Comedy Version', optionB: 'Your Biopic: Serious Drama', tags: ['cinema', 'imagination'] },
  { category: 'Bollywood & Cinema', optionA: 'High Voltage Masala Action', optionB: 'Subtle Realistic Cinema', tags: ['cinema', 'movies'] },
  { category: 'Bollywood & Cinema', optionA: '90s SRK Charm Romance', optionB: 'Modern High-Concept OTT', tags: ['bollywood', 'romance'] },
  { category: 'Bollywood & Cinema', optionA: 'Horror Movie at Midnight Alone', optionB: 'Never in a Million Years', tags: ['cinema', 'thriller'] },

  // Regional Cinema & Culture
  { category: 'Regional India', optionA: 'South Indian Breakfast', optionB: 'North Indian Paratha', tags: ['regional', 'food'] },
  { category: 'Regional India', optionA: 'Regional Cinema Classic', optionB: 'Big Pan-India Blockbuster', tags: ['regional', 'cinema'] },
  { category: 'Regional India', optionA: 'Amritsar Kulcha Crawl', optionB: 'Hyderabad Biryani Trail', tags: ['regional', 'food'] },
  { category: 'Regional India', optionA: 'Misty Himachal Mountains', optionB: 'Sunny Goa Beach Breeze', tags: ['travel', 'regional'] },
  { category: 'Regional India', optionA: 'Kerala Backwater Houseboat', optionB: 'Rajasthan Heritage Fort', tags: ['travel', 'culture'] },
  { category: 'Regional India', optionA: 'Kolkata Kathi Rolls', optionB: 'Mumbai Vada Pav Chutney', tags: ['regional', 'streetfood'] },
  { category: 'Regional India', optionA: 'Darjeeling Tea Gardens', optionB: 'Coorg Coffee Plantations', tags: ['regional', 'travel'] },

  // Cricket & Sports
  { category: 'Cricket & Sports', optionA: 'Watch Every Single Ball', optionB: 'Check Score Occasionally', tags: ['cricket', 'sports'] },
  { category: 'Cricket & Sports', optionA: 'Last Over: Watch Calmly', optionB: 'Last Over: Leave the Room 😂', tags: ['cricket', 'habits'] },
  { category: 'Cricket & Sports', optionA: 'Match With Friends: Serious', optionB: 'Match With Friends: Snacks & Jokes', tags: ['cricket', 'social'] },
  { category: 'Cricket & Sports', optionA: 'Stadium Live Atmosphere', optionB: 'AC Living Room Sofa', tags: ['cricket', 'entertainment'] },
  { category: 'Cricket & Sports', optionA: 'IPL Night Match Chaos', optionB: 'Test Match Peaceful Vibe', tags: ['cricket', 'sports'] },

  // Music & Vibe
  { category: 'Music & Vibes', optionA: 'One Playlist For Whole Drive', optionB: 'Skip Song Every 30 Seconds', tags: ['music', 'travel'] },
  { category: 'Music & Vibes', optionA: 'Party: Full Dance Floor', optionB: 'Party: DJ From the Phone', tags: ['music', 'social'] },
  { category: 'Music & Vibes', optionA: 'Old 90s Nostalgia Songs', optionB: 'Trending Latest Releases', tags: ['music', 'nostalgia'] },
  { category: 'Music & Vibes', optionA: 'Soulful Arijit Singh', optionB: 'Electrifying Diljit Dosanjh', tags: ['music', 'bollywood'] },
  { category: 'Music & Vibes', optionA: 'Coke Studio Indie Tracks', optionB: 'Loud EDM Drops', tags: ['music', 'indie'] },

  // ============================================================
  // TIER 3: CHAOS ROUND (ROUND 9 SPECIAL)
  // ============================================================
  { category: 'Crazy & Superpowers', optionA: '₹10 Crore: No Internet 1 Year', optionB: 'Keep Internet, Reject Deal', preferredRoundType: 'CHAOS', tags: ['chaos', 'money'] },
  { category: 'Crazy & Superpowers', optionA: 'Read Minds for 24 Hours', optionB: 'Never: Too Dangerous 😂', preferredRoundType: 'CHAOS', tags: ['chaos', 'superpower'] },
  { category: 'Crazy & Superpowers', optionA: 'Teleport Anywhere in India', optionB: 'Pause Time for 10 Minutes', preferredRoundType: 'CHAOS', tags: ['chaos', 'superpower'] },
  { category: 'Crazy & Superpowers', optionA: 'Eat 1 Favorite Dish Forever', optionB: 'Random Mystery Dish Daily', preferredRoundType: 'CHAOS', tags: ['chaos', 'food'] },
  { category: 'Crazy & Superpowers', optionA: 'Talk Fluently to Animals', optionB: 'Speak Every Human Language', preferredRoundType: 'CHAOS', tags: ['chaos', 'superpower'] },
  { category: 'Crazy & Superpowers', optionA: 'Never Feel Sleepy Again', optionB: 'Never Gain Weight from Food', preferredRoundType: 'CHAOS', tags: ['chaos', 'lifestyle'] },
  { category: 'Crazy & Superpowers', optionA: 'Know Your Future Story', optionB: 'Keep Life a Total Surprise', preferredRoundType: 'CHAOS', tags: ['chaos', 'values'] },
  { category: 'Crazy & Superpowers', optionA: 'Live in 1920s Royal India', optionB: 'Live in India in Year 2150', preferredRoundType: 'CHAOS', tags: ['chaos', 'history'] },
  { category: 'Crazy & Superpowers', optionA: 'Invisible for 1 Full Week', optionB: 'Fly Anywhere Anytime', preferredRoundType: 'CHAOS', tags: ['chaos', 'superpower'] },
  { category: 'Crazy & Superpowers', optionA: 'Win ₹50 Lakh Right Now', optionB: '₹5 Crore When You Are 60', preferredRoundType: 'CHAOS', tags: ['chaos', 'money'] },

  // ============================================================
  // TIER 4: PREDICTION ROUND (ROUNDS 10 & 19 SPECIAL)
  // ============================================================
  { category: 'Social Behaviour', optionA: 'Believe "5 Mins Mein"', optionB: 'Add 30 Mins Mentally 😂', preferredRoundType: 'PREDICTION', tags: ['prediction', 'social'] },
  { category: 'Social Behaviour', optionA: 'Shaadi: Dance Floor Energy', optionB: 'Shaadi: Food Corner Mode', preferredRoundType: 'PREDICTION', tags: ['prediction', 'social'] },
  { category: 'Digital Life', optionA: 'Listen to 3-Min Voice Note', optionB: '"Bhai Text Mein Bata" 😂', preferredRoundType: 'PREDICTION', tags: ['prediction', 'digital'] },
  { category: 'Digital Life', optionA: 'UPI Processing: Wait Calmly', optionB: 'Check Bank App 7 Times', preferredRoundType: 'PREDICTION', tags: ['prediction', 'digital'] },
  { category: 'Friendship & Love', optionA: 'Takes 6 Hours to Reply: Normal', optionB: 'Takes 6 Hours: "Interesting..." 😂', preferredRoundType: 'PREDICTION', tags: ['prediction', 'friendship'] },
  { category: 'Friendship & Love', optionA: 'Best Friend Crying: Give Advice', optionB: 'Best Friend Crying: Just Listen', preferredRoundType: 'PREDICTION', tags: ['prediction', 'friendship'] },
  { category: 'Money & Ambition', optionA: '₹50,000 Luxury for 3 Days', optionB: '₹50,000 Budget for 10 Days', preferredRoundType: 'PREDICTION', tags: ['prediction', 'travel'] },
  { category: 'Social Behaviour', optionA: 'Bargain With Full Pride', optionB: 'Pay Whatever They Ask', preferredRoundType: 'PREDICTION', tags: ['prediction', 'social'] },
  { category: 'Social Behaviour', optionA: 'Wave at Strangers First', optionB: 'Pretend Busy on Phone', preferredRoundType: 'PREDICTION', tags: ['prediction', 'social'] },
  { category: 'Digital Life', optionA: 'Reply in 2 Seconds', optionB: 'Read in Notification Bar', preferredRoundType: 'PREDICTION', tags: ['prediction', 'habits'] },

  // ============================================================
  // TIER 5: REVEALING SCENARIOS (ROUNDS 11–14)
  // ============================================================
  // Internet & Memes Culture
  { category: 'Digital Life', optionA: 'Meme at 2 AM: Reply Instantly', optionB: 'Meme at 2 AM: Save & Forget', tags: ['memes', 'digital'] },
  { category: 'Digital Life', optionA: 'Group Chat: Active Chatterbox', optionB: 'Group Chat: Silent Observer', tags: ['chat', 'social'] },
  { category: 'Digital Life', optionA: 'Instagram Reels: 5 Minutes', optionB: 'Reels: Suddenly It’s 2 AM 😂', tags: ['digital', 'habits'] },
  { category: 'Digital Life', optionA: 'Permanent Silent Mode', optionB: 'Loud Notification Chimes', tags: ['tech', 'habits'] },
  { category: 'Digital Life', optionA: '2x Voice Note Speed', optionB: 'Normal 1x Listener', tags: ['digital', 'habits'] },
  { category: 'Digital Life', optionA: 'Zero Unread Badges', optionB: '5,000 Unread Badges Chaos', tags: ['digital', 'habits'] },
  { category: 'Digital Life', optionA: 'Front Camera Confident', optionB: 'Behind the Camera Always', tags: ['digital', 'photos'] },
  { category: 'Digital Life', optionA: 'Binge Entire Series Overnight', optionB: 'One Episode Per Day Patiently', tags: ['digital', 'ott'] },

  // PG / College / Office Life
  { category: 'Lifestyle & Career', optionA: 'Work From Bed in Pyjamas', optionB: 'Dress Up For Office Energy', tags: ['work', 'lifestyle'] },
  { category: 'Lifestyle & Career', optionA: 'Hostel / PG Pure Freedom', optionB: 'Ghar Ki Comfort & Food', tags: ['lifestyle', 'pg'] },
  { category: 'Lifestyle & Career', optionA: 'Chai Break With Colleagues', optionB: 'Finish Early & Dash Home', tags: ['office', 'habits'] },
  { category: 'Lifestyle & Career', optionA: 'Startup Chaos & High Risk', optionB: 'Stable 9-to-5 Peace of Mind', tags: ['career', 'money'] },
  { category: 'Lifestyle & Career', optionA: 'Minute-by-Minute Daily Plan', optionB: 'Pure Chaos & Spontaneity', tags: ['routine', 'habits'] },
  { category: 'Lifestyle & Career', optionA: 'Cook New Recipe at Home', optionB: 'Order Delivery in 10s', tags: ['food', 'pg'] },
  { category: 'Lifestyle & Career', optionA: 'Pack Bags 2 Days Early', optionB: 'Pack 20 Mins Before Cab', tags: ['travel', 'habits'] },
  { category: 'Lifestyle & Career', optionA: 'AC at 18°C Freezing', optionB: 'Fan at 5 Speed + Open Window', tags: ['home', 'comfort'] },

  // ============================================================
  // TIER 6: DOUBLE POINTS ROUND (ROUND 15 SPECIAL)
  // ============================================================
  { category: 'Money & Ambition', optionA: 'High Income, High Pressure', optionB: 'Moderate Income, Max Freedom', preferredRoundType: 'DOUBLE_POINTS', tags: ['double_points', 'money'] },
  { category: 'Money & Ambition', optionA: 'Save & Invest in Stocks', optionB: 'Spend on Dream Bucket List', preferredRoundType: 'DOUBLE_POINTS', tags: ['double_points', 'money'] },
  { category: 'Money & Ambition', optionA: '₹1 Lakh: Gold & Investments', optionB: '₹1 Lakh: Shopping & Mega Trip', preferredRoundType: 'DOUBLE_POINTS', tags: ['double_points', 'money'] },
  { category: 'Values & Priorities', optionA: 'Thrilling Wild Adventure', optionB: 'Peaceful Rock-Solid Stability', preferredRoundType: 'DOUBLE_POINTS', tags: ['double_points', 'values'] },
  { category: 'Values & Priorities', optionA: 'Win Every Argument', optionB: 'Keep Peace & Order Food', preferredRoundType: 'DOUBLE_POINTS', tags: ['double_points', 'relationships'] },
  { category: 'Money & Ambition', optionA: 'Own Cozy Home In Hometown', optionB: 'Rent Anywhere in the World', preferredRoundType: 'DOUBLE_POINTS', tags: ['double_points', 'lifestyle'] },

  // ============================================================
  // TIER 7: DEEPER PREFERENCES & DILEMMAS (ROUNDS 16–18, 20)
  // ============================================================
  // Friendship, Love & Values
  { category: 'Friendship & Love', optionA: 'Perfect Weekend: 1-on-1 Deep Talk', optionB: 'Perfect Weekend: Squad Chaos', tags: ['friendship', 'social'] },
  { category: 'Friendship & Love', optionA: 'Brutally Honest Truth', optionB: 'Kind Gentle White Lie', tags: ['values', 'friendship'] },
  { category: 'Friendship & Love', optionA: 'Confront Problem Right Away', optionB: 'Sleep On It & Reset', tags: ['relationships', 'conflict'] },
  { category: 'Friendship & Love', optionA: 'Share Food Off Your Plate', optionB: '"Joey Doesn’t Share Food!" 😂', tags: ['food', 'friendship'] },
  { category: 'Friendship & Love', optionA: 'Forgive & Forget Fast', optionB: 'Forgive But Keep Screenshot', tags: ['friendship', 'humor'] },
  { category: 'Friendship & Love', optionA: 'Roast Each Other 24/7', optionB: 'Constant Wholesome Hype', tags: ['friendship', 'social'] },
  { category: 'Friendship & Love', optionA: 'Split Bill Down to ₹1', optionB: 'Round Off & Alternate Paying', tags: ['money', 'friendship'] },
  { category: 'Friendship & Love', optionA: 'Remember Every Special Date', optionB: 'Forget Dates But Surprise Anytime', tags: ['love', 'habits'] },

  // Social Situations & Family
  { category: 'Social Behaviour', optionA: 'Family Function: Talk to Everyone', optionB: 'Find 1 Corner Buddy & Stay', tags: ['family', 'social'] },
  { category: 'Social Behaviour', optionA: 'Guests Arrive: Panic Clean', optionB: 'Jo Hoga Dekha Jayega', tags: ['family', 'home'] },
  { category: 'Social Behaviour', optionA: 'House Party Host', optionB: 'Guest Who Eats & Leaves', tags: ['social', 'party'] },
  { category: 'Social Behaviour', optionA: 'Direct Phone Call Always', optionB: '"Can I Call?" Text First', tags: ['communication', 'habits'] },
  { category: 'Social Behaviour', optionA: 'Traffic: Patient Music', optionB: 'Traffic: Commentary on Drivers 😂', tags: ['commute', 'habits'] },
  { category: 'Social Behaviour', optionA: 'Diwali Lights & Fireworks', optionB: 'Holi Colors & Wild Rain Dance', tags: ['festivals', 'culture'] },

  // Travel & Adventure
  { category: 'Travel & Adventure', optionA: 'Minute-by-Minute Excel Sheet', optionB: 'No Plan, Reach & Explore', tags: ['travel', 'habits'] },
  { category: 'Travel & Adventure', optionA: 'Big Squad Road Trip', optionB: 'Peaceful Solo Journey', tags: ['travel', 'friendship'] },
  { category: 'Travel & Adventure', optionA: 'Take 500 Photos for Insta', optionB: 'Take 2 Photos & Live It', tags: ['travel', 'digital'] },
  { category: 'Travel & Adventure', optionA: 'Camp Under Open Stars', optionB: '5-Star Hotel King Bed', tags: ['travel', 'lifestyle'] },
  { category: 'Travel & Adventure', optionA: 'Car Road Trip With Dhabas', optionB: 'Overnight Rajdhani Express', tags: ['travel', 'commute'] },

  // The Grand Finale Choices (Round 20)
  { category: 'Values & Priorities', optionA: 'Be Super Famous Overnight', optionB: 'Be Ultra Rich & Anonymous', tags: ['finale', 'values'] },
  { category: 'Values & Priorities', optionA: 'Live Your Passion on Low Pay', optionB: 'Corporate Grind on High Pay', tags: ['finale', 'career'] },
  { category: 'Values & Priorities', optionA: 'Know the Secrets of Universe', optionB: 'Know Yourself 100% Fully', tags: ['finale', 'philosophy'] },
  { category: 'Values & Priorities', optionA: 'Leave a Historic Legacy', optionB: 'Live a Peaceful Joyful Life', tags: ['finale', 'values'] },
];

let fallbackIndex = 0;

export function getRoundTypeForRound(roundNumber: number): RoundType {
  if (roundNumber === 9) return 'CHAOS';
  if (roundNumber === 10 || roundNumber === 19) return 'PREDICTION';
  if (roundNumber === 15) return 'DOUBLE_POINTS';
  return 'NORMAL';
}

export function getFallbackQuestion(
  recentQuestions: string[],
  roundNumber = 1,
  targetRoundType: RoundType = 'NORMAL',
  gameMode = 'RANDOM'
): Question {
  const recentSet = new Set(recentQuestions.map((q) => q.toLowerCase().trim()));

  let modePool = FALLBACK_QUESTIONS;
  if (gameMode === 'FOOD') {
    modePool = FALLBACK_QUESTIONS.filter(q => q.category.includes('Food'));
  } else if (gameMode === 'ENTERTAINMENT') {
    modePool = FALLBACK_QUESTIONS.filter(q => q.category.includes('Cinema') || q.category.includes('Music') || q.category.includes('Cricket'));
  } else if (gameMode === 'CHAOS') {
    modePool = FALLBACK_QUESTIONS.filter(q => q.category.includes('Crazy') || q.preferredRoundType === 'CHAOS');
  } else if (gameMode === 'INDIA') {
    modePool = FALLBACK_QUESTIONS.filter(q => q.category.includes('Regional') || q.category.includes('Everyday') || q.category.includes('Social'));
  } else if (gameMode === 'DEEP') {
    modePool = FALLBACK_QUESTIONS.filter(q => q.category.includes('Values') || q.category.includes('Friendship') || q.category.includes('Money'));
  }

  if (modePool.length === 0) modePool = FALLBACK_QUESTIONS;

  if (targetRoundType !== 'NORMAL') {
    const specialCandidates = modePool.filter(
      q => q.preferredRoundType === targetRoundType && !recentSet.has(q.optionA.toLowerCase().trim())
    );
    if (specialCandidates.length > 0) {
      const selected = specialCandidates[fallbackIndex % specialCandidates.length];
      fallbackIndex++;
      return {
        category: selected.category,
        optionA: selected.optionA,
        optionB: selected.optionB,
        roundType: targetRoundType,
      };
    }
  }

  let pool = modePool;
  if (roundNumber <= 4) {
    pool = modePool.slice(0, 30);
  } else if (roundNumber <= 8) {
    pool = modePool.slice(15, 60);
  } else if (roundNumber <= 14) {
    pool = modePool.slice(40, 100);
  } else {
    pool = modePool.slice(70);
  }

  if (pool.length === 0) pool = modePool;

  for (let i = 0; i < pool.length; i++) {
    const candidate = pool[(fallbackIndex + i) % pool.length];
    if (!recentSet.has(candidate.optionA.toLowerCase().trim())) {
      fallbackIndex = (fallbackIndex + i + 1) % pool.length;
      return {
        category: candidate.category,
        optionA: candidate.optionA,
        optionB: candidate.optionB,
        roundType: targetRoundType,
      };
    }
  }

  for (let i = 0; i < modePool.length; i++) {
    const candidate = modePool[(fallbackIndex + i) % modePool.length];
    if (!recentSet.has(candidate.optionA.toLowerCase().trim())) {
      fallbackIndex = (fallbackIndex + i + 1) % modePool.length;
      return {
        category: candidate.category,
        optionA: candidate.optionA,
        optionB: candidate.optionB,
        roundType: targetRoundType,
      };
    }
  }

  const q = modePool[fallbackIndex % modePool.length];
  fallbackIndex = (fallbackIndex + 1) % modePool.length;
  return {
    category: q.category,
    optionA: q.optionA,
    optionB: q.optionB,
    roundType: targetRoundType,
  };
}
