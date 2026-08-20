const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\25282f35-0b3f-48ab-b986-d4e7a464822d\\.user_uploaded\\media_1786879130635.json';
const outputPath = path.join(__dirname, 'questionsData.json');

console.log('Loading questions from:', inputPath);
const rawItems = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
console.log(`Loaded ${rawItems.length} items from source.`);

function categorize(a, b) {
  const text = (a + ' ' + b).toLowerCase();

  // 1. Food & Chai
  const foodKeywords = [
    'pizza', 'burger', 'coffee', 'tea', 'chai', 'breakfast', 'spicy', 'chocolate',
    'peanut butter', 'sushi', 'tacos', 'wine', 'beer', 'dining', 'ice cream',
    'ketchup', 'cereal', 'milk', 'buffet', 'restaurant', 'street food', 'soda', 'juice',
    'meals', 'snacks', 'dessert', 'grilling', 'baking', 'maggi', 'pani puri', 'golgappa',
    'bhel', 'butter chicken', 'paneer', 'dosa', 'idli', 'biryani', 'achaar', 'pickle',
    'lassi', 'roti', 'rice', 'samosa', 'kachori', 'jalebi', 'gulab jamun', 'dhaba',
    'momos', 'vada pav', 'rajma', 'chole', 'kaapi', 'sugarcane', 'kulfi', 'pav bhaji',
    'misal', 'litti chokha', 'dhokla', 'tapri', 'puffs', 'paratha', 'mango'
  ];
  if (foodKeywords.some(k => text.includes(k))) {
    return { category: 'Food & Chai', gameModes: ['FOOD', 'INDIA', 'RANDOM'] };
  }

  // 2. Bollywood, Cinema, Shows & Anime
  const cinemaKeywords = [
    'movie', 'tv show', 'binge-watch', 'documentar', 'drama', 'subtitles', 'spoiler',
    'marvel', 'dc', 'bollywood', 'hollywood', 'anime', 'naruto', 'one piece', 'netflix',
    'prime video', 'theater', 'theatre', 'nolan', 'tarantino', 'star wars', 'star trek',
    'lord of the rings', 'harry potter', 'cgi', 'barbie', 'oppenheimer', 'sequel',
    'james bond', 'bourne', 'godfather', 'goodfellas', 'pixar', 'dreamworks', 'matrix',
    'inception', 'interstellar', 'martian', 'jurassic', 'avatar', 'fight club', 'american psycho',
    'la la land', 'whiplash', 'mad max', 'dune', 'kill bill', 'disney', 'breaking bad',
    'better call saul', 'game of thrones', 'house of the dragon', 'friends', 'the office',
    'succession', 'crown', 'stranger things', 'dark', 'sherlock', 'doctor who', 'sopranos',
    'wire', 'black mirror', 'love, death', 'fleabag', 'the bear', 'mindhunter', 'true detective',
    'narcos', 'peaky blinders', 'parks and recreation', 'brooklyn nine-nine', 'the boys',
    'invincible', 'modern family', 'how i met your mother', 'sitcom', 'euphoria', 'white lotus',
    'last of us', 'fallout', 'rick and morty', 'south park', 'severance', 'squid game',
    'shah rukh', 'aamir', 'sacred games', 'mirzapur', 'amitabh', 'rajinikanth',
    'gangs of wasseypur', 'sholay', 'ddlj', 'dilwale dulhania', 'kuch kuch hota hai',
    'satyajit ray', 'rajamouli', 'panchayat', 'gullak', '3 idiots', 'dangal', 'znmd',
    'zindagi na milegi', 'yeh jawaani', 'yjhd', 'family man', 'farzi', 'masala', 'ranbir',
    'ranveer', 'andhadhun', 'drishyam', 'kgf', 'pushpa', 'bhansali', 'anurag kashyap',
    'jawan', 'pathaan', 'delhi crime', 'paatal lok', 'tumbbad', 'stree', 'attack on titan',
    'death note', 'dragon ball', 'bleach', 'demon slayer', 'jujutsu kaisen', 'ghibli',
    'shinkai', 'fullmetal', 'hunter x hunter', 'my hero academia', 'black clover', 'chainsaw man',
    'hell\'s paradise', 'steins;gate', 'monster', 'evangelion', 'code geass', 'haikyu',
    'blue lock', 'cowboy bebop', 'samurai champloo', 'vinland saga', 'berserk', 'cyberpunk',
    'arcane', 'frieren', 'apothecary', 'your name', 'silent voice', 'solo leveling',
    'tower of god', 'heroes', 'villains', 'mockumentary', 'cliffhanger', 'scam 1992',
    'kantara', 'kahaani', 'lagaan', 'pk', 'queen', 'vikram', 'jailer', 'rockstar', 'baahubali'
  ];
  if (cinemaKeywords.some(k => text.includes(k))) {
    return { category: 'Bollywood & Cinema', gameModes: ['ENTERTAINMENT', 'INDIA', 'RANDOM'] };
  }

  // 3. Music & Pop Culture
  const musicKeywords = [
    'concert', 'music festival', 'karaoke', 'vinyl', 'streaming music', 'soundtrack',
    'arijit singh', 'ar rahman', 'a. r. rahman', 'punjabi music', 'hindi hits', 'coke studio',
    'lyrics', 'melody', 'diljit', 'sidhu moose', 'pop', 'rap', 'hip hop', 'classical music',
    'sufi', 'qawwali', 'playlist', 'shreya ghoshal', 'sonu nigam', 'lucky ali', 'badshah',
    'amit trivedi', 'neha kakkar', 'ed sheeran', 'eminem', 'drake', 'bruno mars', 'taylor swift',
    'coldplay', 'billie eilish', 'kendrick', 'kishore kumar', 'lata mangeshkar', 'mohammed rafi',
    'asha bhosle', 'atif aslam', 'prateek kuhad', 'seedhe maut', 'divine', 'ap dhillon',
    'the local train', 'jubin nautiyal', 'vishal-shekhar', 'sunidhi chauhan', 'mohit chauhan',
    'rahat fateh ali', 'linkin park', 'anuv jain', 'karan aujla'
  ];
  if (musicKeywords.some(k => text.includes(k))) {
    return { category: 'Bollywood & Cinema', gameModes: ['ENTERTAINMENT', 'INDIA', 'RANDOM'] };
  }

  // 4. Cricket & Sports
  const sportsKeywords = [
    'sport', 'cricket', 'football', 'soccer', 'basketball', 'kabaddi', 'wrestling',
    'badminton', 'table tennis', 'tennis', 'gym', 'workout', 'running', 'swimming',
    'yoga', 'weightlifting', 'cardio', 'strength', 'crossfit', 'marathon', 'sprint',
    'ipl', 'test cricket', 'virat kohli', 'rohit sharma', 'sachin', 'dhoni', 'messi',
    'ronaldo', 'pv sindhu', 'saina nehwal', 'olympics', 'world cup', 'pitch', 'f1',
    'motogp', 'boxing', 'mma', 'chess', 'poker', 'neeraj chopra', 'milkha singh'
  ];
  if (sportsKeywords.some(k => text.includes(k))) {
    return { category: 'Cricket & Sports', gameModes: ['ENTERTAINMENT', 'INDIA', 'RANDOM'] };
  }

  // 5. Crazy, Superpowers, Spooky & Sci-Fi
  const chaosKeywords = [
    'superpower', 'fly', 'invisible', 'shrink', 'grow', 'teleport', 'read mind', 'pause button',
    'rewind', 'superhero', 'supervillain', 'duck-sized', 'horse-sized', 'taste color', 'hear smell',
    'winter powers', 'fire powers', 'simulation', 'matrix', 'alien', 'ghost', 'haunted',
    'ouija', 'tarot', 'curse', 'ufo', 'sixth sense', 'multiverse', 'terraform', 'mars',
    'astronaut', 'upload consciousness', 'ai rights', 'time travel', 'cybernetic', 'vampire',
    'werewolf', 'skinwalker', 'mothman', 'bloody mary', 'slender man', 'asylum', 'graveyard',
    'bermuda triangle', 'area 51', 'poltergeist', 'doppelganger', 'bhangarh', 'kuldhara',
    'chudail', 'pishacha', 'betaal', 'vetala', 'nagin', 'yeti', 'black magic', 'evil eye',
    'nazar', 'radio signal', 'sleep paralysis', 'near-death', 'possession', 'creature', 'charm',
    'forest spirit', 'time slip'
  ];
  if (chaosKeywords.some(k => text.includes(k))) {
    return { category: 'Crazy & Superpowers', gameModes: ['CHAOS', 'RANDOM'] };
  }

  // 6. Deep & Philosophy
  const deepKeywords = [
    'future', 'past', 'live forever', 'wise', 'happy', 'happiness', 'fail', 'succeed',
    'honesty', 'feared', 'forgotten', 'freedom', 'security', 'ambition', 'contentment',
    'memory', 'intuition', 'meaning', 'fate', 'free will', 'head', 'heart', 'god',
    'karma', 'reincarnation', 'soul', 'afterlife', 'suffering', 'truth', 'objective',
    'subjective', 'consciousness', 'monotheism', 'polytheism', 'faith', 'reason',
    'asceticism', 'hedonism', 'advaita', 'dvaita', 'jnana', 'dharma', 'nirguna', 'saguna',
    'purusha', 'prakriti', 'carvaka', 'meaningful', 'regret', 'virtue', 'destiny', 'certainty',
    'randomness', 'solitude', 'mercy', 'justice'
  ];
  if (deepKeywords.some(k => text.includes(k))) {
    return { category: 'Deep & Philosophy', gameModes: ['DEEP', 'RANDOM'] };
  }

  // 7. Money, Career, Work
  const careerKeywords = [
    'work', 'job', 'salary', 'boss', 'promotion', 'office', 'retire', 'money', 'save',
    'budget', 'cash', 'card', 'invest', 'stocks', 'real estate', 'debt', 'startup',
    'corporate', 'freelance', 'side hustle', 'networking', 'fire', 'tax', 'income',
    'trade', 'college', 'degree', 'internship', 'entrepreneurship', 'coaching', 'exam',
    'iit', 'engineering', 'medicine', 'elon musk', 'bezos', 'steve jobs', 'bill gates',
    'ambani', 'tata', 'unicorn', 'fortune 500', 'bootstrapped', 'vc-funded', 'rent', 'buying a house'
  ];
  if (careerKeywords.some(k => text.includes(k))) {
    return { category: 'Money & Career', gameModes: ['INDIA', 'DEEP', 'RANDOM'] };
  }

  // 8. Friendship & Dating & Relationships
  const relKeywords = [
    'marriage', 'wedding', 'relationship', 'dating', 'exes', 'ex', 'love', 'kids', 'pet', 'dog', 'cat',
    'friend', 'friendship', 'partner', 'pda', 'affection', 'date', 'surprises', 'family',
    'arranged marriage', 'love marriage', 'joint family', 'nuclear family', 'live-in', 'divorce',
    'soulmate', 'love language', 'prenup', 'propose', 'anniversary', 'cheating', 'flirt',
    'talking every day', 'replying instantly', 'taking time to reply', 'first move', 'chemistry',
    'posting the relationship', 'meeting the family', 'sharing passwords'
  ];
  if (relKeywords.some(k => text.includes(k))) {
    return { category: 'Friendship & Relationships', gameModes: ['INDIA', 'DEEP', 'RANDOM'] };
  }

  // 9. Public Life & Culture
  const indiaKeywords = [
    'capitalism', 'socialism', 'government', 'free speech', 'nationalism', 'globalism',
    'reservation', 'caste', 'uniform civil code', 'ucc', 'collegium', 'nrc', 'hindi',
    'culture', 'firecrackers', 'farmers', 'msp', 'democracy', 'dictatorship', 'left-wing',
    'right-wing', 'nehru', 'modi', 'rahul gandhi', 'nda', 'india alliance', 'ramayana',
    'mahabharata', 'ram', 'krishna', 'arjuna', 'karna', 'duryodhana', 'shiva', 'vishnu',
    'bhakti', 'ravana', 'gandhi', 'bhagat singh', 'akbar', 'aurangzeb', 'ashoka', 'shivaji',
    'maharana pratap', 'subhas chandra', 'british raj', 'partition', 'kumbh mela', 'char dham',
    'ganesh chaturthi', 'navratri', 'eid', 'diwali', 'holi', 'mumbai', 'delhi', 'bangalore',
    'auto-rickshaw', 'ola', 'uber', 'whatsapp', 'punjabi culture', 'bengali culture', 'durga puja'
  ];
  if (indiaKeywords.some(k => text.includes(k))) {
    return { category: 'Public Life & Culture', gameModes: ['INDIA', 'RANDOM'] };
  }

  // 10. Digital & Memes
  const techKeywords = [
    'iphone', 'android', 'mac', 'pc', 'social media', 'ai', 'smart home', 'earbuds',
    'dark mode', 'light mode', 'notifications', 'cloud', 'playstation', 'xbox', 'gta',
    'pubg', 'bgmi', 'free fire', 'minecraft', 'roblox', 'elden ring', 'smartwatch',
    'e-reader', 'foldable', 'touchscreen', 'reels', 'youtube', 'twitter', 'reddit',
    'influencer', 'chatgpt', 'doomscrolling', 'digital detox', 'anonymity', 'screen time'
  ];
  if (techKeywords.some(k => text.includes(k))) {
    return { category: 'Digital & Memes', gameModes: ['ENTERTAINMENT', 'RANDOM'] };
  }

  return { category: 'Indian Everyday Life', gameModes: ['INDIA', 'RANDOM'] };
}

function determineTypeAndFormat(a, b, category) {
  const wordsA = a.split(/\s+/).length;
  const wordsB = b.split(/\s+/).length;
  const isShort = wordsA <= 3 && wordsB <= 3;
  const text = (a + ' ' + b).toLowerCase();

  if (category === 'Crazy & Superpowers') {
    return { type: 'CHAOS', format: 'SITUATIONAL', timeLimit: 16, roundType: 'CHAOS' };
  }
  if (text.includes('ex') || text.includes('dating') || text.includes('marriage') || text.includes('caste') || text.includes('money') || text.includes('rent') || text.includes('truth')) {
    return { type: 'EDGE', format: 'SITUATIONAL', timeLimit: 16, roundType: 'NORMAL' };
  }
  if (text.includes('reels') || text.includes('whatsapp') || text.includes('photo') || text.includes('ice cream') || text.includes('chai') || text.includes('maggi')) {
    return { type: 'FUNNY', format: isShort ? 'QUICK' : 'SITUATIONAL', timeLimit: isShort ? 10 : 16, roundType: 'NORMAL' };
  }
  if (isShort) {
    return { type: 'QUICK', format: 'QUICK', timeLimit: 10, roundType: 'NORMAL' };
  }
  return { type: 'SITUATIONAL', format: 'SITUATIONAL', timeLimit: 16, roundType: 'NORMAL' };
}

const processed = rawItems.map(item => {
  const a = String(item.a || '').trim();
  const b = String(item.b || '').trim();
  const { category, gameModes } = categorize(a, b);
  const { type, format, timeLimit, roundType } = determineTypeAndFormat(a, b, category);

  return {
    id: `q_${item.id}`,
    rawId: item.id,
    optionA: a,
    optionB: b,
    category,
    format,
    type,
    timeLimit,
    roundType,
    gameModes,
  };
});

fs.writeFileSync(outputPath, JSON.stringify(processed, null, 2), 'utf-8');
console.log(`✨ Successfully generated ${processed.length} questions into ${outputPath}!`);

// Print distribution stats
const catStats = {};
const typeStats = {};
const formatStats = {};

processed.forEach(q => {
  catStats[q.category] = (catStats[q.category] || 0) + 1;
  typeStats[q.type] = (typeStats[q.type] || 0) + 1;
  formatStats[q.format] = (formatStats[q.format] || 0) + 1;
});

console.log('\n--- Category Distribution ---');
console.table(catStats);
console.log('\n--- Format Distribution ---');
console.table(formatStats);
console.log('\n--- Type Distribution ---');
console.table(typeStats);
