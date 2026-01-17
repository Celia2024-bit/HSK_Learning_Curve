/**
 * 简化后的算法：直接从 word 对象中读取合并后的 masteryInfo
 * @param {Array} wordsPool - 已经合并了 masteryInfo 的单词子表 (masteredWordsList)
 * @param {number} count - 抽取的题目数量
 */
export const getSmartQuizWords = (wordsPool, count, mode = 'quiz') => {
  if (!wordsPool || wordsPool.length === 0) return [];

  // 1. 计算每个单词的紧迫度
  const scoredWords = wordsPool.map(word => {
    // 这里的 word.masteryInfo 是你在 App.js 的 useMemo 中注入的
    const record = word.masteryInfo;

    return {
      word,
      urgency: calculateUrgency(record, mode)
    };
  });

  // 2. 按紧迫度排序 (从高到低)
  scoredWords.sort((a, b) => b.urgency - a.urgency);

  // 3. 抽题策略：
  // 先取前 count * 2 名最紧迫的词，然后从中随机抽取 count 个，增加趣味性
  const topPoolSize = Math.min(scoredWords.length, count * 2);
  const topPool = scoredWords.slice(0, topPoolSize);

  // 随机乱序
  const shuffled = topPool.sort(() => 0.5 - Math.random());

  // 返回最终题目列表
  return shuffled.slice(0, count).map(item => item.word);
};

/**
 * 计算紧迫度算法保持不变，但逻辑更清晰
 */
const calculateUrgency = (record, mode) => {
  const isSpeaking = mode === 'speaking';
  const primaryTime = isSpeaking ? record?.lastSpeakingQuiz : record?.lastQuiz;
  const lastTimeStr = primaryTime || record?.lastUpdate;
  const lastResult = isSpeaking ? record?.lastSpeakingResult : record?.lastResult;
  const mistakeCount = isSpeaking ? (record?.speakingMistakeCount || 0) : (record?.mistakeCount || 0);
  
  // 情况 1: 新词 (没有学习记录)
  if (!record || (!record.lastRead && !record.lastQuiz)) {
    return 100; 
  }

  const now = new Date();
  const lastTime = new Date(lastTimeStr);
  const hoursSinceLast = (now - lastTime) / (1000 * 60 * 60);
  
  // 熟练度越低 (1)，分值越高
  let scoreBase = (6 - (record.score || 1)) * 10;

  // 错误惩罚
  const mistakePenalty = (mistakeCount || 0) * 5;

  // 上次结果惩罚 (如果错了，加20分紧迫度)
  const lastResultPenalty = lastResult === false ? 20 : 0;

  // 时间衰减 (遗忘曲线): 距离上次练习时间越长，分值越高
  const timeFactor = Math.log10(hoursSinceLast + 1) * 15;

  return scoreBase + mistakePenalty + lastResultPenalty + timeFactor;
};