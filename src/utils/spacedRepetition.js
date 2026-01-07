/**
 * Spaced Repetition Algorithm (Simplified SM-2 / Mastery Hybrid)
 * Calculates which words need the most attention.
 */

const calculateUrgency = (record) => {
  // Case 1: Brand new word (never studied or tested)
  if (!record || (!record.lastRead && !record.lastQuiz)) {
    return 100; // Maximum urgency for new content
  }

  const now = new Date();
  const lastTime = new Date(record.lastQuiz || record.lastRead);
  const hoursSinceLast = (now - lastTime) / (1000 * 60 * 60);
  
  // 1. Base Score from Mastery Level (1-5)
  // Level 1 = 50 pts, Level 5 = 10 pts
  let scoreBase = (6 - (record.score || 1)) * 10;

  // 2. Penalty for persistent mistakes
  // Each mistake adds 5 points to urgency
  const mistakePenalty = (record.mistakeCount || 0) * 5;

  // 3. Penalty for the most recent result
  // If the last quiz was failed, add a flat 20 points
  const lastResultPenalty = record.lastResult === false ? 20 : 0;

  // 4. Time Decay (Forgetting Curve)
  // We use a logarithmic-ish growth: urgency increases as time passes.
  // This ensures even Level 5 words eventually reappear.
  const timeFactor = Math.log10(hoursSinceLast + 1) * 15;

  return scoreBase + mistakePenalty + lastResultPenalty + timeFactor;
};

/**
 * Smart Selection for Quiz
 * @param {Array} allWords - All words for the current level
 * @param {Object} masteryData - The mastery.json content from backend
 * @param {number} count - How many words to pick (e.g., 20)
 * @param {number} currentLevel - 当前选中的级别（新增参数）
 */
export const getSmartQuizWords = (allWords, masteryData, count, currentLevel) => {
  if (!allWords || allWords.length === 0) return [];

  // 核心修改：过滤出当前级别的单词
  const levelFilteredWords = allWords.filter(word => {
    // 从熟练度数据中获取单词级别，无则使用默认（当前级别）
    const wordLevel = masteryData[word.char]?.level || currentLevel;
    return wordLevel === currentLevel;
  });

  // 1. Calculate urgency for every word (仅计算当前级别单词)
  const scoredWords = levelFilteredWords.map(word => ({
    word,
    urgency: calculateUrgency(masteryData[word.char])
  }));

  // 2. Sort by urgency (highest first)
  scoredWords.sort((a, b) => b.urgency - a.urgency);

  // 3. Selection Strategy:
  // To keep the quiz interesting, we take the top 'count * 2' most urgent words
  // and then randomly pick 'count' from that pool. 
  // This prevents the quiz from being IDENTICAL every time if you don't study.
  const poolSize = Math.min(count * 2, scoredWords.length);
  const topPool = scoredWords.slice(0, poolSize);
  
  // Random shuffle the pool and take the required count
  const finalSelection = topPool
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(item => item.word);

  return finalSelection;
};