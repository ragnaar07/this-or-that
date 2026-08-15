// ============================================================
// Comprehensive India-First Fallback Question Pool (100+ Handcrafted Questions)
// Spanning: Everyday Life, Food & Chai, Social Habits, Family/Office,
// Entertainment, Digital Habits, Money & Ambition, Friendship, Crazy Scenarios
// Designed across 4 depth tiers for progressive gameplay
// ============================================================

import { Question } from './types';

export const FALLBACK_QUESTIONS: Question[] = [
  // --- TIER 1: VERY EASY, FUN, LOW PRESSURE (ROUNDS 1-5) ---
  // Food & Chai
  { category: 'Food & Chai', optionA: 'Roadside Tapri Chai', optionB: 'Cafe Aesthetic Coffee' },
  { category: 'Food & Chai', optionA: 'Ghar Ka Khana', optionB: 'Late Night Swiggy' },
  { category: 'Food & Chai', optionA: 'Crispy Samosa', optionB: 'Steaming Momos' },
  { category: 'Food & Chai', optionA: 'South Indian Dosa', optionB: 'Delhi Chole Bhature' },
  { category: 'Food & Chai', optionA: 'Gulab Jamun Warm', optionB: 'Kulfi Falooda' },
  { category: 'Food & Chai', optionA: 'Extra Spicy Biryani', optionB: 'Mild Creamy Butter Chicken' },
  { category: 'Food & Chai', optionA: 'Pani Puri / Golgappa', optionB: 'Pav Bhaji Extra Butter' },
  { category: 'Food & Chai', optionA: 'Late-night Maggi', optionB: 'Proper Meal Order' },
  { category: 'Food & Chai', optionA: 'Sweet Lassi', optionB: 'Masala Chaas' },
  { category: 'Food & Chai', optionA: 'Unlimited Biryani', optionB: 'Unlimited Pizza' },

  // Everyday Indian Life
  { category: 'Everyday Life', optionA: 'Window Seat Always', optionB: 'Aisle Seat Freedom' },
  { category: 'Everyday Life', optionA: 'AC Metro Breeze', optionB: 'Auto With Music' },
  { category: 'Everyday Life', optionA: 'Early 6 AM Riser', optionB: '3 AM Night Owl' },
  { category: 'Everyday Life', optionA: 'Clean Room Daily', optionB: 'Sunday Deep Clean' },
  { category: 'Everyday Life', optionA: 'Phone Battery at 100%', optionB: 'Living on 3% Danger' },
  { category: 'Everyday Life', optionA: 'Monsoon Chai & Pakora', optionB: 'Cozy Winter Blanket' },
  { category: 'Everyday Life', optionA: 'Train Sleeper Window', optionB: 'Flight Window View' },
  { category: 'Everyday Life', optionA: 'Sunglasses Everywhere', optionB: 'Cap & Hoodie' },
  { category: 'Everyday Life', optionA: 'Morning Walk Vibes', optionB: 'Late Night Stroll' },
  { category: 'Everyday Life', optionA: 'Always 10 Mins Early', optionB: 'Exact Time Entry' },

  // --- TIER 2: MORE PERSONAL PREFERENCES & SOCIAL HABITS (ROUNDS 6-10) ---
  // Indian Social Behaviour
  { category: 'Social Behaviour', optionA: 'Shaadi: Dance Floor', optionB: 'Shaadi: Food Section' },
  { category: 'Social Behaviour', optionA: 'Believe "5 Mins Mein"', optionB: 'Add 30 Mins Mentally 😂' },
  { category: 'Social Behaviour', optionA: 'Family Party: Talk to All', optionB: 'Find 1 Corner Buddy' },
  { category: 'Social Behaviour', optionA: 'Guests Come: Clean Rush', optionB: 'Jo Hoga Dekha Jayega' },
  { category: 'Social Behaviour', optionA: 'Bargain With Pride', optionB: 'Pay Whatever They Say' },
  { category: 'Social Behaviour', optionA: 'House Party Host', optionB: 'Guest Who Eats & Leaves' },
  { category: 'Social Behaviour', optionA: 'Wave at Strangers', optionB: 'Pretend on Phone' },
  { category: 'Social Behaviour', optionA: 'Call First Always', optionB: '"Can I Call?" Text First' },
  { category: 'Social Behaviour', optionA: 'Burst Into Laughter', optionB: 'Deadpan Sarcastic Smile' },
  { category: 'Social Behaviour', optionA: 'Group Chat Admin', optionB: 'Silent Group Observer' },

  // Indian Digital Habits
  { category: 'Digital Life', optionA: 'Listen to 3-Min Voice Note', optionB: '"Bhai Text Kar" Reply' },
  { category: 'Digital Life', optionA: 'UPI Processing: Wait Calmly', optionB: 'Check Bank App 7 Times' },
  { category: 'Digital Life', optionA: 'Send 20 Reels Daily', optionB: 'Send Meaningful Texts' },
  { category: 'Digital Life', optionA: 'Zero Unread Emails', optionB: '4,000 Unread Badges' },
  { category: 'Digital Life', optionA: 'Binge Entire Series Overnight', optionB: 'One Episode Per Day' },
  { category: 'Digital Life', optionA: 'Phone on Full Volume', optionB: 'Permanent Silent Mode' },
  { category: 'Digital Life', optionA: 'Scroll Reels Till 2 AM', optionB: 'Put Phone Away at 11 PM' },
  { category: 'Digital Life', optionA: 'Front Camera Confidence', optionB: 'Behind the Camera Always' },
  { category: 'Digital Life', optionA: 'Fast 2x Voice Note Speed', optionB: 'Normal 1x Listener' },
  { category: 'Digital Life', optionA: 'Instant Double Tick Reply', optionB: 'Read in Notification Bar' },

  // Entertainment & Culture
  { category: 'Entertainment', optionA: 'High Energy Bollywood', optionB: 'South Action Blockbuster' },
  { category: 'Entertainment', optionA: 'Cricket Match Stadium Live', optionB: 'Sofa + Snacks at Home' },
  { category: 'Entertainment', optionA: 'Comfort Sitcom Reruns', optionB: 'Dark Crime Thriller' },
  { category: 'Entertainment', optionA: 'Live Standup Show', optionB: 'Music Concert Chaos' },
  { category: 'Entertainment', optionA: 'Arijit Singh Heartbreak', optionB: 'Diljit Dosanjh High Energy' },
  { category: 'Entertainment', optionA: 'Plot Twist Cinema', optionB: 'Feel Good Rom-Com' },
  { category: 'Entertainment', optionA: 'YouTube Rabbit Hole', optionB: 'OTT Web Series' },
  { category: 'Entertainment', optionA: 'Old 90s Nostalgia Music', optionB: 'Latest Trending Beats' },
  { category: 'Entertainment', optionA: 'Board Games With Chai', optionB: 'Multiplayer Mobile Gaming' },
  { category: 'Entertainment', optionA: 'Horror Movie Alone at 12 AM', optionB: 'Never in a Million Years' },

  // --- TIER 3: SCENARIOS, TRAVEL & LIFESTYLE (ROUNDS 11-15) ---
  // Indian Family / PG / Work Life
  { category: 'Lifestyle', optionA: 'Work From Bed in Pyjamas', optionB: 'Dress Up for Office Vibes' },
  { category: 'Lifestyle', optionA: 'Hostel / PG Freedom', optionB: 'Ghar Ki Comfort & Pampering' },
  { category: 'Lifestyle', optionA: 'Fixed Morning Routine', optionB: 'Chaos & Pure Spontaneity' },
  { category: 'Lifestyle', optionA: 'Chai Break With Colleagues', optionB: 'Finish Early & Dash Home' },
  { category: 'Lifestyle', optionA: 'Diwali Crackers & Lights', optionB: 'Holi Colors & Chaos' },
  { category: 'Lifestyle', optionA: 'Cook Complex New Recipe', optionB: 'Order in 2 Minutes' },
  { category: 'Lifestyle', optionA: 'AC at 18°C Freezing', optionB: 'Fan at 5 Speed + Window' },
  { category: 'Lifestyle', optionA: 'Metro Smart Card Pro', optionB: 'UPI Token Line Hopeful' },
  { category: 'Lifestyle', optionA: 'Buy First Day of Sale', optionB: 'Wait for End of Season Sale' },
  { category: 'Lifestyle', optionA: 'All Bags Packed 2 Days Early', optionB: 'Pack 30 Mins Before Cab' },

  // Travel & Adventure
  { category: 'Travel', optionA: 'Misty Himachal Mountains', optionB: 'Sunny Goa Beach Breeze' },
  { category: 'Travel', optionA: '₹50,000 Luxury for 3 Days', optionB: '₹50,000 Budget for 10 Days' },
  { category: 'Travel', optionA: 'Minute-by-Minute Excel Plan', optionB: 'No Plan, Reach & Explore' },
  { category: 'Travel', optionA: 'Big Squad Road Trip', optionB: 'Solo Peaceful Journey' },
  { category: 'Travel', optionA: 'Heritage Temples & Palaces', optionB: 'Modern Neon Cyber City' },
  { category: 'Travel', optionA: 'Street Food Crawl in Amritsar', optionB: 'Houseboat in Kerala Backwaters' },
  { category: 'Travel', optionA: 'Trek in High Altitude', optionB: 'Poolside Resort Sunbed' },
  { category: 'Travel', optionA: 'Car Road Trip With Dhabas', optionB: 'Overnight Rajdhani Express' },
  { category: 'Travel', optionA: 'Camp Under Open Stars', optionB: '5-Star Hotel King Bed' },
  { category: 'Travel', optionA: 'Take 500 Photos for Insta', optionB: 'Take 2 Photos and Live It' },

  // Money & Ambition
  { category: 'Money & Ambition', optionA: 'Save & Invest in Mutual Funds', optionB: 'Spend on Dream Bucket List' },
  { category: 'Money & Ambition', optionA: 'High Income, High Pressure', optionB: 'Moderate Income, Max Freedom' },
  { category: 'Money & Ambition', optionA: '₹1 Lakh Received: Gold / Stocks', optionB: '₹1 Lakh Received: Shopping & Trip' },
  { category: 'Money & Ambition', optionA: 'Startup Hustle & High Risk', optionB: 'Solid Stable 9-to-5 Job' },
  { category: 'Money & Ambition', optionA: 'Buy Latest Flagship Phone', optionB: 'Use Current Phone Till Death' },
  { category: 'Money & Ambition', optionA: 'Own Cozy Suburban House', optionB: 'Rent Anywhere in the World' },
  { category: 'Money & Ambition', optionA: 'Extravagant Royal Wedding', optionB: 'Intimate Court + Grand Trip' },
  { category: 'Money & Ambition', optionA: 'Treat Friends on First Salary', optionB: 'Gift Something to Parents' },
  { category: 'Money & Ambition', optionA: 'Premium Branded Wear', optionB: 'Budget Street Smart Fashion' },
  { category: 'Money & Ambition', optionA: 'Fly Business Class Once', optionB: 'Take 4 Extra Vacations' },

  // --- TIER 4: DEEPER PREFERENCES, FRIENDSHIP & CRAZY SCENARIOS (ROUNDS 16-20) ---
  // Love, Friendship & Relationships
  { category: 'Friendship & Love', optionA: 'Best Friend Crying: Give Advice', optionB: 'Best Friend Crying: Just Listen' },
  { category: 'Friendship & Love', optionA: 'Takes 6 Hours to Reply: Normal', optionB: 'Takes 6 Hours: "Interesting..." 😂' },
  { category: 'Friendship & Love', optionA: 'Perfect Weekend: Deep 1-on-1 Talk', optionB: 'Perfect Weekend: Squad Chaos' },
  { category: 'Friendship & Love', optionA: 'Brutally Honest Feedback', optionB: 'Kind Gentle White Lie' },
  { category: 'Friendship & Love', optionA: 'Win Every Argument', optionB: 'Keep Peace & Eat Snacks' },
  { category: 'Friendship & Love', optionA: 'Remember Every Anniversary', optionB: 'Forget Dates But Give Gifts' },
  { category: 'Friendship & Love', optionA: 'Confront Problem Right Away', optionB: 'Sleep on It and Reset' },
  { category: 'Friendship & Love', optionA: 'Share Food Off Your Plate', optionB: '"Joey Doesn’t Share Food!"' },
  { category: 'Friendship & Love', optionA: 'Forgive and Forget Fast', optionB: 'Forgive But Keep the Screenshot' },
  { category: 'Friendship & Love', optionA: 'Roast Each Other 24/7', optionB: 'Constant Wholesome Hype' },

  // Crazy / Superpowers / Wild Choices
  { category: 'Crazy & Superpowers', optionA: '₹10 Crore: No Internet 1 Year', optionB: 'Keep Internet, Reject Deal' },
  { category: 'Crazy & Superpowers', optionA: 'Read Minds for 24 Hours', optionB: 'Never: Sounds Terrifying 😂' },
  { category: 'Crazy & Superpowers', optionA: 'Teleport Anywhere in India', optionB: 'Pause Time for 10 Minutes' },
  { category: 'Crazy & Superpowers', optionA: 'Talk Fluently to Animals', optionB: 'Speak Every Human Language' },
  { category: 'Crazy & Superpowers', optionA: 'Never Feel Sleepy Again', optionB: 'Never Gain Weight from Food' },
  { category: 'Crazy & Superpowers', optionA: 'Live 200 Years in Past India', optionB: 'Live in India in Year 2150' },
  { category: 'Crazy & Superpowers', optionA: 'Eat Only 1 Favorite Dish Forever', optionB: 'Eat Random Mystery Dish Daily' },
  { category: 'Crazy & Superpowers', optionA: 'Unlimited Free Flights', optionB: 'Unlimited Free 5-Star Food' },
  { category: 'Crazy & Superpowers', optionA: 'Know Your Future Life', optionB: 'Keep Life a Total Mystery' },
  { category: 'Crazy & Superpowers', optionA: 'Become Super Famous Overnight', optionB: 'Stay Rich & Completely Anonymous' },
];

let fallbackIndex = 0;

/**
 * Pick a fallback question matching current round difficulty tier and avoiding recent repeats.
 */
export function getFallbackQuestion(recentQuestions: string[], roundNumber = 1): Question {
  const recentSet = new Set(recentQuestions.map((q) => q.toLowerCase().trim()));

  // Map round to preferred slice of questions (progressive depth curve)
  let pool = FALLBACK_QUESTIONS;
  if (roundNumber <= 5) {
    pool = FALLBACK_QUESTIONS.slice(0, 30); // Tier 1 (Everyday, Food)
  } else if (roundNumber <= 10) {
    pool = FALLBACK_QUESTIONS.slice(20, 60); // Tier 2 (Social, Digital, Entertainment)
  } else if (roundNumber <= 15) {
    pool = FALLBACK_QUESTIONS.slice(45, 85); // Tier 3 (Lifestyle, Travel, Money)
  } else {
    pool = FALLBACK_QUESTIONS.slice(70); // Tier 4 (Friendship, Deep, Crazy)
  }

  for (let i = 0; i < pool.length; i++) {
    const candidate = pool[(fallbackIndex + i) % pool.length];
    if (!recentSet.has(candidate.optionA.toLowerCase().trim())) {
      fallbackIndex = (fallbackIndex + i + 1) % pool.length;
      return candidate;
    }
  }

  // Fallback to entire list if preferred slice is exhausted
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
