import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Menu from './components/Menu';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import Results from './components/Results';
import ReadingMode from './components/ReadingMode';
import CardManager from './components/cardManager';
import SpeakingMode from './components/SpeakingMode';

import { getSmartQuizWords } from './utils/spacedRepetition';
import sentencesData from './data/sentences.json';
import { API_BASE, DEFAULT_QUIZ_COUNT } from './utils/constants';
import { fetchLogin, getTtsUrl } from './utils/fetchUtils';
import { useUserProgress } from './hooks/useUserProgress';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('menu');
  const [level, setLevel] = useState(1); // 0=Custom, 1-7=New HSK, 11-13=Old HSK
  
  // UI 状态
  const [quizCount, setQuizCount] = useState(DEFAULT_QUIZ_COUNT);
  const [quizRemoveCorrect, setQuizRemoveCorrect] = useState(false);

  // Flashcard 的三个独立 index
  const [flashcardIndex, setFlashcardIndex] = useState(0);           // filter = 'all'
  const [flaggedFlashcardIndex, setFlaggedFlashcardIndex] = useState(0);     // filter = 'flagged'
  const [unflaggedFlashcardIndex, setUnflaggedFlashcardIndex] = useState(0); // filter = 'unflagged'

  const [quizIndex, setQuizIndex] = useState(0);
  const [readingIndex, setReadingIndex] = useState(0);
  
  const [flashcardRandomOrder, setFlashcardRandomOrder] = useState(false);
  const [flashcardFilter, setFlashcardFilter] = useState('all'); // 'all' | 'flagged' | 'unflagged'

  // 测验相关
  const [quizQueue, setQuizQueue] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [flashcardSessionData, setFlashcardSessionData] = useState([]);
 // const [speakingLang, setSpeakingLang] = useState('zh');

  // 使用自定义 hook 管理所有数据持久化逻辑
  const {
    allWords,
    mastery,
    progressByLevel,
    masteredWordsList,
    fetchUserData,
    loadWords,
    updateMasteryRecord,
    saveProgress,
    getCurrentProgress,
    resetData,
    flaggedWords,
    toggleWordFlag
  } = useUserProgress(currentUser, level);
  const currentSpeakingLang = progressByLevel[level]?.speaking_lang || 'zh';

  // 同步当前 level 的进度到 UI
  useEffect(() => {
    const p = getCurrentProgress();
    setQuizCount(p.quiz_count ?? DEFAULT_QUIZ_COUNT);
    setFlashcardIndex(p.current_index ?? 0);
    setFlaggedFlashcardIndex(p.flagged_current_index ?? 0);
    setUnflaggedFlashcardIndex(p.unflagged_current_index ?? 0);
    setReadingIndex(p.reading_index ?? 0);
    setQuizRemoveCorrect(p.quiz_remove_correct ?? false);
    setFlashcardRandomOrder(p.flashcard_random_order ?? false);
    setFlashcardFilter(p.flashcard_filter ?? 'all');
  }, [level, progressByLevel, getCurrentProgress]);
  
  // 根据 filter 从 shuffledWords 中派生出实际展示的单词列表
  const filteredFlashcardData = useMemo(() => {
    const currentFlaggedSet = flaggedWords[String(level)] || []; // ✅ 移进来
    if (flashcardFilter === 'flagged') {
      return allWords.filter(w => currentFlaggedSet.includes(w.char));
    }
    if (flashcardFilter === 'unflagged') {
      return allWords.filter(w => !currentFlaggedSet.includes(w.char));
    }
    return allWords;
  }, [allWords, flashcardFilter, flaggedWords, level]); // ✅ flaggedWords 加入依赖

  // 根据 filter 选择对应的 index 和 setter
  const activeFlashcardIndex = 
    flashcardFilter === 'flagged'   ? flaggedFlashcardIndex :
    flashcardFilter === 'unflagged' ? unflaggedFlashcardIndex :
    flashcardIndex;

  const setActiveFlashcardIndex = (i) => {
  if (flashcardFilter === 'flagged') {
    setFlaggedFlashcardIndex(i);
    if (!flashcardRandomOrder) saveProgress({ flaggedIndex: i });
  } else if (flashcardFilter === 'unflagged') {
    setUnflaggedFlashcardIndex(i);
    if (!flashcardRandomOrder) saveProgress({ unflaggedIndex: i });
  } else {
    setFlashcardIndex(i);
    if (!flashcardRandomOrder) saveProgress({ index: i });
  }
};
  // 登录
  const handleLogin = async (username, password) => {
    const res = await fetchLogin(username, password);
    if (res.ok) {
      setCurrentUser(username);
      fetchUserData(username);
    } else {
      alert("Invalid credentials.");
    }
  };

  // 登出
  const handleLogout = () => {
    setCurrentUser(null);
    resetData();
    setMode('menu');
  };

  const safeFlashcardIndex = flashcardSessionData.length > 0
    ? Math.min(activeFlashcardIndex, flashcardSessionData.length - 1)  // ✅ 用 session 数据
    : 0;
  // 开始某个模式
  const startMode = (newMode) => {
    if (newMode === 'reading' && level === 0) {
      return;
    }
    if (newMode === 'flashcard') {
      let sessionData;
      
      if (flashcardRandomOrder) {
        sessionData = [...filteredFlashcardData].sort(() => Math.random() - 0.5);
        setFlashcardIndex(0);
        setFlaggedFlashcardIndex(0);
        setUnflaggedFlashcardIndex(0);
      } else {
        sessionData = [...filteredFlashcardData];
      }
      
      setFlashcardSessionData(sessionData);
    }
    if (newMode === 'quiz' || newMode === 'speaking') {
      // 优先用有mastery记录的词，不够时从allWords补齐
      let basePool = masteredWordsList.length > 5 ? masteredWordsList : allWords;
      const countToFetch = quizCount === 'ALL' ? allWords.length : quizCount;

      // 过滤
      let pool = basePool.filter(word => {
        const key = `${level}_${word.char}`;
        const record = mastery[key];

        if (newMode === 'quiz') {
          if (!record || record.lastQuiz === undefined) return true;
          if (quizRemoveCorrect && record.lastResult === true) return false;
          return true;
        }

        if (newMode === 'speaking') {
          if (!record) return true;
          if (currentSpeakingLang === 'zh') {
            if (record.lastSpeakingQuiz === undefined) return true;
            if (quizRemoveCorrect && record.lastSpeakingResult === true) return false;
          } else {
            if (record.lastTranslateQuiz === undefined) return true;
            if (quizRemoveCorrect && record.lastTranslateResult === true) return false;
          }
          return true;
        }
        return true;
      });

      // pool 过滤后数量不足 countToFetch，从 allWords 补充
      if (pool.length < countToFetch) {
        const poolChars = new Set(pool.map(w => w.char));
        const extras = allWords.filter(w => !poolChars.has(w.char));
        pool = [...pool, ...extras];
      }

      // 最终兜底
      if (pool.length === 0) pool = [...allWords];

      const selected = getSmartQuizWords(pool, countToFetch, newMode);
      setQuizQueue(selected);
      setScore(0);
      setQuizAnswers([]);
      setQuizIndex(0);
    }
    
    
    setMode(newMode);
  };

  // 朗读中文
  const speakChinese = async (text, isSlow = true) => {
    if (!text) return;

    const CACHE_NAME = 'hsk-audio-cache-v1'; // 缓存盒子的名字
    let targetUrl;

    // 1. 确定音频的地址 (Target URL)
    if (level === 0) {
      // Level 0: 调用 Render 后端 TTS
      targetUrl = getTtsUrl(text, isSlow);
    } else if (level >= 11) {
      // New HSK (11–17): new_hsk/hsk_audio 目录，实际 level 为 level-10
      const fileName = encodeURIComponent(text.trim());
      targetUrl = `/data/new_hsk_audio/hsk_audio_${level - 10}/${fileName}.mp3`;
    } else {
      // Old HSK (1–3): 原有音频目录不动
      const fileName = encodeURIComponent(text.trim());
      targetUrl = `/data/hsk_audio/hsk_audio_${level}/${fileName}.mp3`;
    }

    try {
      // 2. 打开浏览器的 Cache Storage
      const cache = await caches.open(CACHE_NAME);
      
      // 3. 检查缓存里有没有这个音频
      let response = await cache.match(targetUrl);

      if (!response) {
        console.log(`%c[Network] 第一次请求，存入缓存: ${text}`, "color: orange");
        // 缓存没有，发起真正的 fetch 请求
        response = await fetch(targetUrl);

        if (!response.ok) {
          throw new Error(`音频加载失败: ${response.status}`);
        }

        // 重要：把获取到的数据克隆一份存进缓存
        await cache.put(targetUrl, response.clone());
      } else {
        console.log(`%c[Cache] 命中缓存，直接播放: ${text}`, "color: green");
      }

      // 4. 将 Response (不管是来自网络还是缓存) 转为 Blob
      const audioBlob = await response.blob();
      
      // 5. 使用 URL.createObjectURL 把二进制数据变成可播放的地址
      const blobUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(blobUrl);

      // 6. 执行播放
      await audio.play();

      // 7. 播放结束后，释放内存中的 Blob 地址
     audio.onended = () => {
      URL.revokeObjectURL(blobUrl); // 应该是 revoke（撤销），不是 create
      console.log("%c[Memory] Blob URL 已释放", "color: gray");
    };

    } catch (err) {
      console.error("音频播放逻辑出错:", err);
      // 最后的保底：如果以上复杂逻辑都失败了，尝试直接用原始地址播放一次
      new Audio(targetUrl).play().catch(e => console.error("保底播放也失败:", e));
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} apiUrl={API_BASE} />;
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto px-4">
        {mode === 'menu' && (
          <Menu 
            level={level} 
            setLevel={(l) => { 
              // ✅ 新增逻辑：如果切换到 HSK 1-3 且当前是法语，强制切回中文
              let newLang = currentSpeakingLang;
              if (l !== 0 && currentSpeakingLang === 'fr') { // l=0 custom 支持法语，其他不支持
                newLang = 'zh'; 
              }
              
              setLevel(l); 
              saveProgress({ 
                level: l, 
                speakingLang: newLang // 确保进度同步更新
              }); 
            }}
            quizCount={quizCount}
            setQuizCount={(c) => { setQuizCount(c); saveProgress({ quizCount: c }); }}
            quizRemoveCorrect={quizRemoveCorrect}
            setQuizRemoveCorrect={(val) => { 
              setQuizRemoveCorrect(val); 
              saveProgress({ quizRemoveCorrect: val }); 
            }} 
            flashcardRandomOrder={flashcardRandomOrder}
            setFlashcardRandomOrder={(val) => {
              setFlashcardRandomOrder(val);
              saveProgress({ flashcard_random_order: val });
            }}
            flashcardFilter={flashcardFilter}
            // 1. setFlashcardFilter 时，重置对应 index 到 0
            setFlashcardFilter={(val) => {
              setFlashcardFilter(val);
              // 切换 filter 时重置对应 index，防止越界
              if (val === 'flagged') setFlaggedFlashcardIndex(0);
              else if (val === 'unflagged') setUnflaggedFlashcardIndex(0);
              else setFlashcardIndex(0);
              saveProgress({ flashcard_filter: val });
            }}
            speakingLang={currentSpeakingLang} 
            setSpeakingLang={(l) => saveProgress({ speakingLang: l })}
            startMode={startMode} 
            showCardManager={level === 0}
            onOpenCardManager={() => setMode('cards')}
          />
        )}

        {mode === 'cards' && (
          <CardManager
            username={currentUser}
            onClose={() => setMode('menu')}
            onUpdate={loadWords}
          />
        )}

        {mode === 'flashcard' && flashcardSessionData.length > 0 && (
          <FlashcardMode 
            data={flashcardSessionData}
            currentIndex={safeFlashcardIndex}
            setIndex={(i) => {
              const currentChar = flashcardSessionData[safeFlashcardIndex]?.char;
              if (currentChar) {
                updateMasteryRecord(currentChar, { lastUpdate: new Date().toISOString() });
              }
              setActiveFlashcardIndex(i);
            }}
            onBack={() => setMode('menu')}
            onComplete={() => {
              setActiveFlashcardIndex(0);
              setMode('menu');
            }}
            onSpeak={speakChinese}
            level={level}
            flaggedWords={flaggedWords}
            toggleWordFlag={toggleWordFlag}
            // 修改：从打乱后的列表取当前卡片的熟练度
            currentMastery={mastery[`${level}_${flashcardSessionData[safeFlashcardIndex]?.char}`]?.score}  // ✅
            onUpdateMastery={(char, score) => {
              updateMasteryRecord(char, { score });
            }}
            revealOrder={getCurrentProgress().flashcard_reveal_order ?? 'char'}
            onSaveRevealOrder={(value) =>
              saveProgress({ flashcard_reveal_order: value })
            }
          />
        )}

        {mode === 'flashcard' && flashcardSessionData.length === 0 && (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <p className="text-slate-400 font-bold text-lg">
              {flashcardFilter === 'flagged' ? 'No flagged words yet. Heart some words first! ❤️' 
               : flashcardFilter === 'unflagged' ? 'All words are flagged!'
               : 'No words available.'}
            </p>
            <button 
              onClick={() => setMode('menu')}
              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm"
            >
              Back to Menu
            </button>
          </div>
        )}

        {mode === 'quiz' && (
          <QuizMode 
            word={quizQueue[quizIndex]} 
            quizPool={allWords} 
            currentIndex={quizIndex}
            total={quizQueue.length}
            score={score}
            onSpeak={speakChinese}
            onExit={() => setMode('menu')}
            savedAnswer={quizAnswers[quizIndex]}
            onPrev={() => setQuizIndex(prev => Math.max(0, prev - 1))}
            onNext={(isCorrect, answerData, shouldMove = true) => {
              if (isCorrect) setScore(s => s + 1);
              if (answerData) {
                const newAnswers = [...quizAnswers];
                newAnswers[quizIndex] = { ...answerData, type: 'quiz' };
                setQuizAnswers(newAnswers);
              }

              const char = quizQueue[quizIndex].char;
              const key = `${level}_${char}`;
              const currentRec = mastery[key] || {};
              
              updateMasteryRecord(char, {
                lastQuiz: new Date().toISOString(),
                lastResult: isCorrect,
                mistakeCount: isCorrect ? (currentRec.mistakeCount || 0) : (currentRec.mistakeCount || 0) + 1
              });

              if (shouldMove) {
                if (quizIndex < quizQueue.length - 1) {
                  setQuizIndex(quizIndex + 1);
                } else {
                  setMode('results');
                }
              }
            }}
          />
        )}

        {mode === 'speaking' && (
          <SpeakingMode
            word={quizQueue[quizIndex]}
            currentIndex={quizIndex}
            total={quizQueue.length}
            lang={currentSpeakingLang} 
            onSpeak={speakChinese}
            onExit={() => setMode('menu')}
            onPrev={() => setQuizIndex(prev => Math.max(0, prev - 1))}
            onNext={(isCorrect, answerData, shouldMove = true) => {
              const currentWord = quizQueue[quizIndex];
              const newAnswers = [...quizAnswers];
              newAnswers[quizIndex] = {
                word: currentWord,
                isCorrect: isCorrect,
                type: 'speaking',
                lang: currentSpeakingLang 
              };
              setQuizAnswers(newAnswers);

              const char = quizQueue[quizIndex].char;
              const key = `${level}_${char}`;
              const currentRec = mastery[key] || {};

              let updateFields = {};

              if (currentSpeakingLang === 'zh') {
                updateFields = {
                  lastSpeakingQuiz: new Date().toISOString(),
                  lastSpeakingResult: isCorrect,
                  speakingMistakeCount: isCorrect 
                    ? (currentRec.speakingMistakeCount || 0) 
                    : (currentRec.speakingMistakeCount || 0) + 1
                };
              } else {
                updateFields = {
                  lastTranslateQuiz: new Date().toISOString(),
                  lastTranslateResult: isCorrect,
                  translateMistakeCount: isCorrect 
                    ? (currentRec.translateMistakeCount || 0) 
                    : (currentRec.translateMistakeCount || 0) + 1
                };
              }

              updateMasteryRecord(char, updateFields);

              if (shouldMove) {
                if (quizIndex < quizQueue.length - 1) {
                  setQuizIndex(quizIndex + 1);
                } else {
                  setMode('results');
                }
              }
            }}
          />
        )}

        {mode === 'reading' && level !== 0 && (
          <ReadingMode
            data={sentencesData[level.toString()] || []}
            currentIndex={readingIndex}
            setIndex={(i) => { setReadingIndex(i); saveProgress({ readingIndex: i }); }}
            onBack={() => setMode('menu')}
            onSpeak={speakChinese}
          />
        )}

        {mode === 'results' && (
          <Results 
            score={score} 
            total={quizQueue.length} 
            quizAnswers={quizAnswers} 
            onRetry={() => startMode(quizAnswers[0]?.type === 'speaking' ? 'speaking' : 'quiz')}
            onMenu={() => setMode('menu')}
            onSpeak={speakChinese}
          />
        )}
      </main>
    </div>
  );
}