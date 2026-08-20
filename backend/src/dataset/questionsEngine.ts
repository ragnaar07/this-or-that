// ============================================================
// Ultra-Fast Questions In-Memory Engine (O(1) Instant Retrieval)
// Pre-indexed for Sub-Millisecond (<0.01ms) Performance
// ============================================================

import questionsData from './questionsData.json';
import { Question, QuestionFormat, QuestionType, RoundType } from '../types';

export interface RawDatasetQuestion {
  id: string;
  rawId: number;
  optionA: string;
  optionB: string;
  category: string;
  format: QuestionFormat;
  type: QuestionType;
  timeLimit: number;
  roundType: RoundType;
  gameModes: string[];
}

// In-memory typed store
const ALL_QUESTIONS: RawDatasetQuestion[] = questionsData as RawDatasetQuestion[];

// Dedicated Deep Psychology Dilemmas (Unfiltered Real Nature, Indian Nuance & Psychology)
export const RAW_DEEP_PSYCHOLOGY_QUESTIONS: RawDatasetQuestion[] = [
  {
    id: 'dp_1',
    rawId: 90001,
    category: 'Moral Compass & Ethics',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Give a fake alibi to save your best friend',
    optionB: 'Refuse and urge them to surrender to police',
  },
  {
    id: 'dp_2',
    rawId: 90002,
    category: 'Relationships & Red Flags',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Tell your friend with proof immediately',
    optionB: 'Stay silent and stay out of their relationship',
  },
  {
    id: 'dp_3',
    rawId: 90003,
    category: 'Money & Integrity',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Withdraw ₹50 Lakhs quietly & invest secretly',
    optionB: 'Report the glitch to the bank immediately',
  },
  {
    id: 'dp_4',
    rawId: 90004,
    category: 'Career vs Roots',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Move abroad for 5x salary away from aging parents',
    optionB: 'Stay in hometown with modest pay to care for parents',
  },
  {
    id: 'dp_5',
    rawId: 90005,
    category: 'Friendship & Loyalty',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: '100% Blind, unconditional loyalty in public',
    optionB: '100% Brutal, unfiltered honesty on the spot',
  },
  {
    id: 'dp_6',
    rawId: 90006,
    category: 'Social Insecurity & Defense',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Step in and fiercely defend friend publicly',
    optionB: 'Stay silent to avoid escalating the drama',
  },
  {
    id: 'dp_7',
    rawId: 90007,
    category: 'Trust & Privacy',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Check partner\'s phone if gut says something is wrong',
    optionB: 'Never check partner\'s phone no matter the suspicion',
  },
  {
    id: 'dp_8',
    rawId: 90008,
    category: 'Conflict Resolution',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Cut them off in complete silence (Ghost forever)',
    optionB: 'Confront them face-to-face in brutal detail',
  },
  {
    id: 'dp_9',
    rawId: 90009,
    category: 'Ambition & Corporate Ethics',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Take the credit for team\'s idea to secure promotion',
    optionB: 'Give full team credit and risk getting overlooked',
  },
  {
    id: 'dp_10',
    rawId: 90010,
    category: 'Honesty & Temptation',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Keep the ₹25,000 cash dropped by a stranger',
    optionB: 'Chase and return the cash to stranger immediately',
  },
  {
    id: 'dp_11',
    rawId: 90011,
    category: 'Love & Family Expectations',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Marry someone your parents adore but you have 0 spark with',
    optionB: 'Fight family for love marriage with high risk of conflict',
  },
  {
    id: 'dp_12',
    rawId: 90012,
    category: 'Ego & Vulnerability',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Apologize first to save the bond even if you are right',
    optionB: 'Hold your ground on principle until they apologize',
  },
  {
    id: 'dp_13',
    rawId: 90013,
    category: 'Financial Boundaries',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Lend ₹50,000 to best friend with 0 expectation of return',
    optionB: 'Politely refuse money to protect the friendship from ruin',
  },
  {
    id: 'dp_14',
    rawId: 90014,
    category: 'Jealousy & Success',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Celebrate your best friend\'s huge win while you are failing',
    optionB: 'Take a break from them because the comparison hurts',
  },
  {
    id: 'dp_15',
    rawId: 90015,
    category: 'Relationship Reality',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Stay in a comfortable 4-year relationship without passion',
    optionB: 'Break up and risk being lonely for years to find real spark',
  },
  {
    id: 'dp_16',
    rawId: 90016,
    category: 'Social Validation',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Be deeply understood by only 1 person who truly knows you',
    optionB: 'Be widely admired and respected by 50,000 strangers',
  },
  {
    id: 'dp_17',
    rawId: 90017,
    category: 'Past Traumas & Vulnerability',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Reveal your deepest insecurities & flaws on early dates',
    optionB: 'Keep your emotional walls up until marriage/long-term proof',
  },
  {
    id: 'dp_18',
    rawId: 90018,
    category: 'Indian Family Boundaries',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Cut ties with toxic relatives who constantly mock your life',
    optionB: 'Tolerate them politely to keep family peace and respect',
  },
  {
    id: 'dp_19',
    rawId: 90019,
    category: 'Mental Peace vs Wealth',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: '₹80 LPA high-stress corporate job with chronic burnout',
    optionB: '₹15 LPA relaxed 9-to-5 job with peaceful sleep & hobbies',
  },
  {
    id: 'dp_20',
    rawId: 90020,
    category: 'Forgiveness vs Revenge',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Forgive completely someone who publicly humiliated you',
    optionB: 'Never forgive and wait patiently for karma/retaliation',
  },
  {
    id: 'dp_21',
    rawId: 90021,
    category: 'Exes & Boundaries',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Block your ex everywhere immediately to heal clean',
    optionB: 'Stay casual friends on Instagram & WhatsApp',
  },
  {
    id: 'dp_22',
    rawId: 90022,
    category: 'Dating Standards',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Marry someone wealthy with average emotional compatibility',
    optionB: 'Marry your broke soulmate and struggle together for years',
  },
  {
    id: 'dp_23',
    rawId: 90023,
    category: 'Inner Instincts',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Know the exact date and cause of your death',
    optionB: 'Live in complete suspense until your final second',
  },
  {
    id: 'dp_24',
    rawId: 90024,
    category: 'Social Masks',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Speak 100% unfiltered thoughts to everyone for 24 hours',
    optionB: 'Stay completely mute and communicate only through notes',
  },
  {
    id: 'dp_25',
    rawId: 90025,
    category: 'Loyalty in Crime',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Support your partner even when you know they are guilty',
    optionB: 'Distance yourself to uphold your personal moral code',
  },
  {
    id: 'dp_26',
    rawId: 90026,
    category: 'Ambition vs Contentment',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Die young as a legendary history-maker',
    optionB: 'Live till 90 as an ordinary, peacefully forgotten soul',
  },
  {
    id: 'dp_27',
    rawId: 90027,
    category: 'Modern Relationships',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Post your relationship publicly on social media',
    optionB: 'Keep your relationship 100% private and hidden online',
  },
  {
    id: 'dp_28',
    rawId: 90028,
    category: 'Friendship Limits',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Confront your best friend when they date someone toxic',
    optionB: 'Stay silent and let them make their own painful mistakes',
  },
  {
    id: 'dp_29',
    rawId: 90029,
    category: 'Self Image & Ego',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Always be the smartest person in the room',
    optionB: 'Always be the most loved & charming person in the room',
  },
  {
    id: 'dp_30',
    rawId: 90030,
    category: 'Life Philosophy',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'A life driven by relentless ambition and competition',
    optionB: 'A life driven by simple gratitude, art and peace',
  },
  {
    id: 'dp_31',
    rawId: 90031,
    category: 'Moral Instincts',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Take the blame for a junior colleague to save their job',
    optionB: 'Let them face the consequence of their own mistake',
  },
  {
    id: 'dp_32',
    rawId: 90032,
    category: 'Relationships & Loyalty',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Forgive a one-time emotional betrayal if they confess',
    optionB: 'Zero tolerance: immediate breakup with no second chances',
  },
  {
    id: 'dp_33',
    rawId: 90033,
    category: 'Friendship & Money',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Split the bill 50-50 strictly even if one earned less',
    optionB: 'Offer to pay more based on who has higher income',
  },
  {
    id: 'dp_34',
    rawId: 90034,
    category: 'Indian Family vs Self',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Live with in-laws / joint family to preserve tradition',
    optionB: 'Insist on living separately to maintain mental privacy',
  },
  {
    id: 'dp_35',
    rawId: 90035,
    category: 'Social Conscience',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Confront a line-cutter or rule-breaker in public',
    optionB: 'Ignore it and avoid unnecessary public confrontation',
  },
  {
    id: 'dp_36',
    rawId: 90036,
    category: 'Dating & Red Flags',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Prioritize intense physical & emotional chemistry',
    optionB: 'Prioritize financial stability & emotional maturity',
  },
  {
    id: 'dp_37',
    rawId: 90037,
    category: 'Authenticity & Masks',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Show your true weird self from day 1 to filter people',
    optionB: 'Put on a polished social mask until you trust them fully',
  },
  {
    id: 'dp_38',
    rawId: 90038,
    category: 'Friendship Truths',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Tell your friend their dream startup idea is doomed',
    optionB: 'Support and encourage them even if you doubt it',
  },
  {
    id: 'dp_39',
    rawId: 90039,
    category: 'Ego & Regret',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Reach out to an old friend you had a falling out with',
    optionB: 'Never look back and let the past stay buried',
  },
  {
    id: 'dp_40',
    rawId: 90040,
    category: 'Survival & Ethics',
    format: 'SITUATIONAL',
    type: 'DEEP_PSYCHOLOGY',
    timeLimit: 18,
    roundType: 'DEEP_PSYCHOLOGY',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Tell a white lie to prevent hurting someone\'s feelings',
    optionB: 'Tell the harsh truth and let them handle the pain',
  }
];

// Dedicated Mind Read Prediction Questions (Testing Telepathy & Human Psychology)
export const RAW_PREDICTION_QUESTIONS: RawDatasetQuestion[] = [
  {
    id: 'mr_1',
    rawId: 80001,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Go completely silent & isolate to cool down',
    optionB: 'Vent loudly and confront the issue on the spot',
  },
  {
    id: 'mr_2',
    rawId: 80002,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Invest and lock it away quietly for the future',
    optionB: 'Splurge on luxury gadgets, shopping & dream trip',
  },
  {
    id: 'mr_3',
    rawId: 80003,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Career dominance, high status and massive wealth',
    optionB: 'True love, peaceful home and unconditional loyalty',
  },
  {
    id: 'mr_4',
    rawId: 80004,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Stalking people & doomscrolling reels till 3 AM',
    optionB: 'Ordering late-night food & binge-watching shows',
  },
  {
    id: 'mr_5',
    rawId: 80005,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Text or call immediately to clear the air',
    optionB: 'Wait stubbornly for the other person to apologize',
  },
  {
    id: 'mr_6',
    rawId: 80006,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Read every single chat quietly without them knowing',
    optionB: 'Never open it to preserve personal boundaries',
  },
  {
    id: 'mr_7',
    rawId: 80007,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Life of the party: talks to everyone and stays late',
    optionB: 'Sticks to 1-2 close friends and leaves as early as possible',
  },
  {
    id: 'mr_8',
    rawId: 80008,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Give a quick, polite fake excuse to get out of it',
    optionB: 'Say a direct, blunt "No I don\'t want to come"',
  },
  {
    id: 'mr_9',
    rawId: 90009,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Check reviews obsessively before making any purchase',
    optionB: 'Buy impulsively based on pure gut feeling & aesthetic',
  },
  {
    id: 'mr_10',
    rawId: 80010,
    category: 'Mind Reading & Telepathy',
    format: 'SITUATIONAL',
    type: 'PREDICTION',
    timeLimit: 20,
    roundType: 'PREDICTION',
    gameModes: ['INDIA', 'RANDOM', 'DEEP'],
    optionA: 'Laugh it off and immediately admit you got caught',
    optionB: 'Double down with more confidence to defend yourself',
  }
];

// O(1) Pre-calculated Multi-dimensional Index Maps
const MODE_FORMAT_POOLS = new Map<string, RawDatasetQuestion[]>();
const MODE_ROUND_POOLS = new Map<string, RawDatasetQuestion[]>();
const MODE_TYPE_POOLS = new Map<string, RawDatasetQuestion[]>();
const MODE_ALL_POOLS = new Map<string, RawDatasetQuestion[]>();

const MODE_ALIASES: Record<string, string[]> = {
  INDIA: ['RANDOM'],
  FUN: ['CLASSIC', 'RANDOM'],
  ENTERTAINMENT: ['CLASSIC', 'RANDOM'],
  FOOD: ['CLASSIC', 'RANDOM'],
  DEEP: ['DEBATE', 'RANDOM'],
  STANDARD: ['CLASSIC', 'RANDOM'],
};

const DEFAULT_MODE_SEEDS = ['RANDOM', 'CLASSIC', 'INDIA', 'ENTERTAINMENT', 'FOOD', 'CHAOS', 'DEEP', 'DEBATE'];
const RANDOM_SAMPLE_SIZE = 24;

// Initialize indexes once on server boot
(() => {
  for (const q of ALL_QUESTIONS) {
    const modes = q.gameModes && q.gameModes.length > 0 ? q.gameModes : ['RANDOM'];

    for (const m of modes) {
      // 1. Mode All Pool
      let allList = MODE_ALL_POOLS.get(m);
      if (!allList) {
        allList = [];
        MODE_ALL_POOLS.set(m, allList);
      }
      allList.push(q);

      // 2. Mode + Format Pool
      const fmtKey = `${m}___${q.format}`;
      let fmtList = MODE_FORMAT_POOLS.get(fmtKey);
      if (!fmtList) {
        fmtList = [];
        MODE_FORMAT_POOLS.set(fmtKey, fmtList);
      }
      fmtList.push(q);

      // 3. Mode + RoundType Pool
      if (q.roundType && q.roundType !== 'NORMAL') {
        const rtKey = `${m}___${q.roundType}`;
        let rtList = MODE_ROUND_POOLS.get(rtKey);
        if (!rtList) {
          rtList = [];
          MODE_ROUND_POOLS.set(rtKey, rtList);
        }
        rtList.push(q);
      }

      // 4. Mode + Type Pool
      const typeKey = `${m}___${q.type}`;
      let typeList = MODE_TYPE_POOLS.get(typeKey);
      if (!typeList) {
        typeList = [];
        MODE_TYPE_POOLS.set(typeKey, typeList);
      }
      typeList.push(q);
    }
  }

  // Pre-seed CHAOS, PREDICTION, DOUBLE_POINTS, and DEEP_PSYCHOLOGY for all known modes.
  const allChaos = ALL_QUESTIONS.filter(q => q.category === 'Crazy & Superpowers' || q.type === 'CHAOS' || q.roundType === 'CHAOS');
  const allPrediction = [
    ...RAW_PREDICTION_QUESTIONS,
    ...ALL_QUESTIONS.filter(q =>
      q.category === 'Friendship & Relationships' ||
      q.category.includes('Relationships') ||
      q.category.includes('Communication') ||
      q.category.includes('Emotional') ||
      q.category.includes('Boundaries') ||
      q.type === 'EDGE' ||
      q.type === 'FUNNY'
    )
  ];
  const allDoublePoints = ALL_QUESTIONS.filter(q =>
    q.category === 'Money & Career' ||
    q.category.includes('Money') ||
    q.category.includes('Financial') ||
    q.category.includes('Career') ||
    q.category.includes('Risk') ||
    q.category.includes('Philosophy') ||
    q.type === 'EDGE' ||
    q.type === 'DEBATE'
  );
  const allDeepPsychology = [
    ...RAW_DEEP_PSYCHOLOGY_QUESTIONS,
    ...ALL_QUESTIONS.filter(q =>
      q.category === 'Deep & Philosophy' ||
      q.category === 'Friendship & Relationships' ||
      q.category.includes('Philosophy') ||
      q.category.includes('Morality') ||
      q.category.includes('Relationships') ||
      q.type === 'EDGE' ||
      q.type === 'DEEP' ||
      q.type === 'DILEMMA'
    )
  ];

  for (const m of DEFAULT_MODE_SEEDS) {
    if (allChaos.length > 0) MODE_ROUND_POOLS.set(`${m}___CHAOS`, allChaos);
    if (allPrediction.length > 0) MODE_ROUND_POOLS.set(`${m}___PREDICTION`, allPrediction);
    if (allDoublePoints.length > 0) MODE_ROUND_POOLS.set(`${m}___DOUBLE_POINTS`, allDoublePoints);
    if (allDeepPsychology.length > 0) {
      MODE_ROUND_POOLS.set(`${m}___DEEP_PSYCHOLOGY`, allDeepPsychology);
      MODE_TYPE_POOLS.set(`${m}___DEEP_PSYCHOLOGY`, allDeepPsychology);
    }
    if (allPrediction.length > 0) MODE_TYPE_POOLS.set(`${m}___PREDICTION`, allPrediction);
  }

  console.log(`⚡ [QUESTIONS ENGINE] Pre-indexed ${ALL_QUESTIONS.length + RAW_DEEP_PSYCHOLOGY_QUESTIONS.length + RAW_PREDICTION_QUESTIONS.length} questions into fast pools.`);
})();

// Signature normalization for fast duplicate checks
export function normalizeSignature(textA: string, textB: string): string {
  const normA = (textA || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normB = (textB || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return [normA, normB].sort().join('___');
}

export interface RoundConfig {
  format: QuestionFormat;
  type: QuestionType;
  timeLimit: number;
  roundType: RoundType;
  isSpecial?: boolean;
}

export function getRoundConfiguration(roundNumber: number, deepPsychology = true): RoundConfig {
  if (roundNumber === 1) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 2) return { format: 'SITUATIONAL', type: 'SITUATIONAL', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 3) return { format: 'QUICK', type: 'FUNNY', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 4) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 5) return { format: 'SITUATIONAL', type: 'CURRENT', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 6) {
    return deepPsychology
      ? { format: 'SITUATIONAL', type: 'DEEP_PSYCHOLOGY', timeLimit: 18, roundType: 'DEEP_PSYCHOLOGY', isSpecial: true }
      : { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  }
  if (roundNumber === 7) return { format: 'SITUATIONAL', type: 'EDGE', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 8) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 9) return { format: 'SITUATIONAL', type: 'CHAOS', timeLimit: 16, roundType: 'CHAOS', isSpecial: true };
  if (roundNumber === 10) return { format: 'SITUATIONAL', type: 'PREDICTION', timeLimit: 20, roundType: 'PREDICTION', isSpecial: true };
  if (roundNumber === 11) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 12) return { format: 'SITUATIONAL', type: 'FUNNY', timeLimit: 16, roundType: 'NORMAL' };
  if (roundNumber === 13) {
    return deepPsychology
      ? { format: 'SITUATIONAL', type: 'DEEP_PSYCHOLOGY', timeLimit: 18, roundType: 'DEEP_PSYCHOLOGY', isSpecial: true }
      : { format: 'SITUATIONAL', type: 'EDGE', timeLimit: 16, roundType: 'NORMAL' };
  }
  if (roundNumber === 14) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 15) return { format: 'SITUATIONAL', type: 'DOUBLE_POINTS', timeLimit: 16, roundType: 'DOUBLE_POINTS', isSpecial: true };
  if (roundNumber === 16) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber === 17) return { format: 'SITUATIONAL', type: 'CHAOS', timeLimit: 16, roundType: 'CHAOS', isSpecial: true };
  if (roundNumber === 18) return { format: 'SITUATIONAL', type: 'PREDICTION', timeLimit: 20, roundType: 'PREDICTION', isSpecial: true };
  if (roundNumber === 19) return { format: 'QUICK', type: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  if (roundNumber >= 20) return { format: 'SITUATIONAL', type: 'DOUBLE_POINTS', timeLimit: 16, roundType: 'DOUBLE_POINTS', isSpecial: true };

  const isEven = roundNumber % 2 === 0;
  return {
    format: isEven ? 'SITUATIONAL' : 'QUICK',
    type: isEven ? 'SITUATIONAL' : 'QUICK',
    timeLimit: isEven ? 16 : 10,
    roundType: 'NORMAL',
  };
}

export function getRoundTypeForRound(roundNumber: number, deepPsychology = true): RoundType {
  return getRoundConfiguration(roundNumber, deepPsychology).roundType;
}

function randomIndex(length: number): number {
  return length <= 1 ? 0 : Math.floor(Math.random() * length);
}

function getCandidateModes(gameMode: string): string[] {
  const requestedMode = (gameMode || 'RANDOM').toUpperCase();
  return Array.from(new Set([requestedMode, ...(MODE_ALIASES[requestedMode] || []), 'RANDOM']));
}

function getPoolByMode(poolMap: Map<string, RawDatasetQuestion[]>, modes: string[], suffix?: string): RawDatasetQuestion[] | undefined {
  for (const mode of modes) {
    const key = suffix ? `${mode}___${suffix}` : mode;
    const pool = poolMap.get(key);
    if (pool && pool.length > 0) return pool;
  }
  return undefined;
}

function hasRecentQuestion(item: RawDatasetQuestion, recentSigSet: Set<string>): boolean {
  const sig = normalizeSignature(item.optionA, item.optionB);
  const sigA = normalizeSignature(item.optionA, '');
  const sigB = normalizeSignature(item.optionB, '');
  return recentSigSet.has(sig) || recentSigSet.has(sigA) || recentSigSet.has(sigB);
}

function selectRandomQuestion(
  pool: RawDatasetQuestion[] | undefined,
  recentSigSet: Set<string>,
  recentCategories: string[],
  forbiddenCat: string | null
): RawDatasetQuestion | null {
  if (!pool || pool.length === 0) return null;

  const sampleSize = Math.min(pool.length, RANDOM_SAMPLE_SIZE);
  const sampledIndexes = new Set<number>();
  const candidates: RawDatasetQuestion[] = [];

  while (sampledIndexes.size < sampleSize) {
    const index = randomIndex(pool.length);
    if (sampledIndexes.has(index)) continue;
    sampledIndexes.add(index);

    const item = pool[index];
    if (forbiddenCat && item.category === forbiddenCat) continue;
    if (hasRecentQuestion(item, recentSigSet)) continue;
    candidates.push(item);
  }

  const fallbackCandidates = candidates.length > 0
    ? candidates
    : pool.filter(item => !hasRecentQuestion(item, recentSigSet));

  if (fallbackCandidates.length === 0) return pool[randomIndex(pool.length)];

  const recentCategoryCounts = new Map<string, number>();
  for (const category of recentCategories.slice(-5)) {
    recentCategoryCounts.set(category, (recentCategoryCounts.get(category) || 0) + 1);
  }

  const weighted = fallbackCandidates.map(item => ({
    item,
    weight: 1 / Math.pow(1 + (recentCategoryCounts.get(item.category) || 0), 2),
  }));
  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const entry of weighted) {
    threshold -= entry.weight;
    if (threshold <= 0) return entry.item;
  }

  return weighted[weighted.length - 1].item;
}

export function getInstantQuestion(
  recentQuestions: string[] = [],
  recentCategories: string[] = [],
  roundNumber = 1,
  targetRoundType: RoundType = 'NORMAL',
  gameMode = 'RANDOM'
): Question {
  const config = getRoundConfiguration(roundNumber);
  const targetFormat = config.format;
  const targetType = config.type;
  const timeLimit = config.timeLimit;
  const actualRoundType = targetRoundType !== 'NORMAL' ? targetRoundType : config.roundType;

  // Build exclusion signatures
  const recentSigSet = new Set<string>();
  for (let i = 0; i < recentQuestions.length; i++) {
    const qStr = recentQuestions[i];
    recentSigSet.add(normalizeSignature(qStr, ''));
  }

  // Prevent 3-in-a-row category clusters
  const lastCat1 = recentCategories[recentCategories.length - 1];
  const lastCat2 = recentCategories[recentCategories.length - 2];
  const forbiddenCat = lastCat1 && lastCat2 && lastCat1 === lastCat2 ? lastCat1 : null;

  const candidateModes = getCandidateModes(gameMode);

  // Mode pool check
  const modePool = getPoolByMode(MODE_ALL_POOLS, candidateModes) || ALL_QUESTIONS;

  // 1. Specific Round Type Pool (CHAOS, PREDICTION, DOUBLE_POINTS)
  if (actualRoundType !== 'NORMAL') {
    const item = selectRandomQuestion(
      getPoolByMode(MODE_ROUND_POOLS, candidateModes, actualRoundType),
      recentSigSet,
      recentCategories,
      forbiddenCat
    );
    if (item) {
      return formatOutputQuestion(item, targetFormat, (actualRoundType as QuestionType), timeLimit, actualRoundType);
    }
  }

  // 2. Specific Type Pool (EDGE, FUNNY)
  if (targetType === 'EDGE' || targetType === 'FUNNY') {
    const item = selectRandomQuestion(
      getPoolByMode(MODE_TYPE_POOLS, candidateModes, targetType),
      recentSigSet,
      recentCategories,
      forbiddenCat
    );
    if (item) {
      return formatOutputQuestion(item, item.format || targetFormat, targetType, item.timeLimit || timeLimit, actualRoundType);
    }
  }

  // 3. Format Pool within Mode (QUICK vs SITUATIONAL)
  const fmtPool = getPoolByMode(MODE_FORMAT_POOLS, candidateModes, targetFormat) || modePool;
  const formatItem = selectRandomQuestion(fmtPool, recentSigSet, recentCategories, forbiddenCat);
  if (formatItem) {
    return formatOutputQuestion(formatItem, targetFormat, targetType, timeLimit, actualRoundType);
  }

  // 4. Any item from Mode Pool
  const modeItem = selectRandomQuestion(modePool, recentSigSet, recentCategories, null);
  if (modeItem) {
    return formatOutputQuestion(modeItem, targetFormat, targetType, timeLimit, actualRoundType);
  }

  // 5. Ultimate Fallback
  const fallback = ALL_QUESTIONS[randomIndex(ALL_QUESTIONS.length)];
  return formatOutputQuestion(fallback, targetFormat, targetType, timeLimit, actualRoundType);
}

function formatOutputQuestion(
  raw: RawDatasetQuestion,
  format: QuestionFormat,
  type: QuestionType,
  timeLimit: number,
  roundType: RoundType
): Question {
  return {
    id: raw.id,
    category: raw.category,
    format: format || raw.format || 'QUICK',
    type: type || raw.type || 'QUICK',
    timeLimit: timeLimit || raw.timeLimit || (format === 'QUICK' ? 10 : 16),
    optionA: raw.optionA,
    optionB: raw.optionB,
    roundType,
    difficulty: 1,
  };
}

export function getTotalQuestionCount(): number {
  return ALL_QUESTIONS.length;
}
