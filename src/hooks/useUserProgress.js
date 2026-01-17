import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchUserProgress, 
  fetchUserMastery, 
  fetchWordsByLevel,
  fetchSaveMastery, 
  fetchSaveProgress
} from '../utils/fetchUtils';

const DEFAULT_QUIZ_COUNT = 20; // 从你的 constants 导入
const DEFAULT_PROGRESS = {
  quiz_count: DEFAULT_QUIZ_COUNT,
  current_index: 0,
  reading_index: 0,
  quiz_remove_correct: false,
  speaking_lang: 'zh',
};


export function useUserProgress(currentUser, level) {
  const [allWords, setAllWords] = useState([]);
  const [mastery, setMastery] = useState({});
  const [progressByLevel, setProgressByLevel] = useState({});

  // 计算已学单词列表
  const masteredWordsList = useMemo(() => {
    if (!allWords.length) return [];
    return allWords
      .filter(word => {
        const key = `${level}_${word.char}`;
        return mastery[key] !== undefined;
      })
      .map(word => ({
        ...word,
        masteryInfo: mastery[`${level}_${word.char}`]
      }));
  }, [allWords, mastery, level]);

  // 获取用户所有数据（进度 + 熟练度）
  const fetchUserData = useCallback(async (username) => {
    try {
      // 1. 获取进度
      const progressMap = await fetchUserProgress(username);
      setProgressByLevel(progressMap || {});

      // 2. 获取熟练度
      const masteryData = await fetchUserMastery(username);
      setMastery(masteryData || {});
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  }, []);

  // 加载当前 level 的词库
  const loadWords = useCallback(async () => {
    try {
      const words = await fetchWordsByLevel(level, currentUser);
      setAllWords(words);
    } catch (e) {
      console.error("Words load error:", e);
      setAllWords([]);
    }
  }, [level, currentUser]);

  // 监听 level 变化加载词库
  useEffect(() => {
    if (currentUser) {
      loadWords();
    } else {
      setAllWords([]);
    }
  }, [currentUser, loadWords]);

  // 更新熟练度记录
  const updateMasteryRecord = useCallback(async (char, newFields) => {
    const key = `${level}_${char}`;
    const current = mastery[key] || { score: 1, lastQuiz: null, mistakeCount: 0 };
    const updated = { ...current, ...newFields };
    
    // 更新本地 state
    setMastery(prevMap => ({
      ...prevMap,
      [key]: { ...prevMap[key], ...newFields }
    }));
    
    try {
      await fetchSaveMastery(currentUser, char, level, updated);
    } catch (e) {
      console.error("保存失败:", e);
    }
  }, [currentUser, level, mastery]);

  // 保存进度
  const saveProgress = useCallback(async (overrides = {}) => {
    if (!currentUser) return;

    const targetLevel = (overrides.level !== undefined ? overrides.level : level);
    const key = String(targetLevel);

    const prevRecord = progressByLevel?.[key] || DEFAULT_PROGRESS;

    const record = {
      quiz_count:
        overrides.quizCount ?? prevRecord.quiz_count ?? DEFAULT_PROGRESS.quiz_count,
      current_index:
        overrides.index ?? prevRecord.current_index ?? DEFAULT_PROGRESS.current_index,
      reading_index:
        overrides.readingIndex ?? prevRecord.reading_index ?? DEFAULT_PROGRESS.reading_index,
      quiz_remove_correct:
        overrides.quizRemoveCorrect ?? prevRecord.quiz_remove_correct ?? DEFAULT_PROGRESS.quiz_remove_correct,
      speaking_lang: overrides.speakingLang ?? prevRecord.speaking_lang ?? DEFAULT_PROGRESS.speaking_lang
    };

    // 本地更新
    setProgressByLevel(prev => ({
      ...prev,
      [key]: { ...record },
    }));

    // 发到后端
    await fetchSaveProgress({
      username: currentUser,
      level: targetLevel,
      record,
    });
  }, [currentUser, level, progressByLevel]);

  // 获取当前 level 的进度数据
  const getCurrentProgress = useCallback(() => {
    const key = String(level);
    return progressByLevel?.[key] || DEFAULT_PROGRESS;
  }, [level, progressByLevel]);

  return {
    // 数据
    allWords,
    mastery,
    progressByLevel,
    masteredWordsList,
    
    // 方法
    fetchUserData,
    loadWords,
    updateMasteryRecord,
    saveProgress,
    getCurrentProgress,
    
    // 重置方法（登出时用）
    resetData: () => {
      setMastery({});
      setProgressByLevel({});
      setAllWords([]);
    }
  };
}