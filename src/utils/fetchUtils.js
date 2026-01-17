// src/fetchUtils.js
// 复用 App.js 中的 API_BASE 地址（保持一致）
//const API_BASE = "https://backend-all-6q0a.onrender.com/api/hsk";
import { API_BASE, DEFAULT_TTS_VOICE, DEFAULT_TTS_SPEED_SLOW, DEFAULT_TTS_SPEED_NORMAL } from './constants';

// 1. 获取用户数据

// 1. 获取用户进度（新结构）
export const fetchUserProgress = async (username, level = null) => {
  try {
    let url = `${API_BASE}/get_user_progress?username=${encodeURIComponent(username)}`;
    if (level) {
      url += `&level=${level}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Progress fetch failed: ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error("Failed to load user progress:", e);
    throw e;
  }
};

// 获取用户单词熟练度数据
export const fetchUserMastery = async (username, level = null) => {
  try {
    // 构建 URL，支持可选的 level 参数进行筛选
    let url = `${API_BASE}/get_user_mastery?username=${encodeURIComponent(username)}`;
    if (level) {
      url += `&level=${level}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Mastery fetch failed: ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error("Failed to load user mastery:", e);
    throw e;
  }
};

// 2. 登录请求
export const fetchLogin = async (username, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res;
};

// 3. 保存熟练度
export const fetchSaveMastery = async (username, char, level, record) => {
  await fetch(`${API_BASE}/save_mastery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, char, level, record })
  });
};

// 4. 保存进度
export const fetchSaveProgress = async ({ username, level, record }) => {
  await fetch(`${API_BASE}/save_progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, level, record })
  });
};


// 5. 获取TTS音频地址（仅拼接URL，play逻辑保留在原函数）
export const getTtsUrl = (text, isSlow = true) => {
  const speed = isSlow ? DEFAULT_TTS_SPEED_SLOW : DEFAULT_TTS_SPEED_NORMAL;
  const voice = DEFAULT_TTS_VOICE;
  const params = new URLSearchParams({
    text: text,
    speed: speed,
    voice: voice
  });
  return `${API_BASE}/tts?${params.toString()}`;
};


/** 读取用户自定义卡片列表 */
export const fetchCustomCards = async (username) => {
  if (!username) throw new Error('username is required for custom cards');
  const res = await fetch(`${API_BASE}/custom/cards/list/${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error(`Custom cards fetch failed: ${res.status}`);
  // 返回数组，每条记录大致包含：id, username, char, pinyin, meaning, explanation, created_at ...
  const rows = await res.json();
  // 为了与本地 HSK 词条结构保持一致，这里统一为 { char, pinyin, meaning, explanation, id }
  return rows.map(r => ({
    id: r.id,
    char: r.char,
    pinyin: r.pinyin || '',
    meaning: r.meaning || '',
    explanation: r.explanation || ''
  }));
};

/** 新增自定义卡片 */
export const addCustomCard = async (username, { char, pinyin = '', meaning = '', explanation = '' }) => {
  const res = await fetch(`${API_BASE}/custom/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, char, pinyin, meaning, explanation })
  });
  if (!res.ok) throw new Error(`Add custom card failed: ${res.status}`);
  return true;
};

/** 更新自定义卡片（部分字段） */
export const updateCustomCard = async (cardId, patch) => {
  const res = await fetch(`${API_BASE}/custom/cards/item/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error(`Update custom card failed: ${res.status}`);
  return true;
};

/** 删除自定义卡片 */
export const deleteCustomCard = async (cardId) => {
  const res = await fetch(`${API_BASE}/custom/cards/item/${encodeURIComponent(cardId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`Delete custom card failed: ${res.status}`);
  return true;
};


/**
 * 加载 HSK 词库
 * - level = 0：读取用户自定义卡片（需要 username）
 * - 其余：读取本地 JSON
 */
export const fetchWordsByLevel = async (level, username = null) => {
  try {
    if (Number(level) === 0) {
      if (!username) throw new Error('username is required when level = 0');
      return await fetchCustomCards(username);
    }
    // 其它 level 保持原逻辑（读取本地 JSON）
    const res = await import(`../data/hsk-level-${level}.json`);
    return res.default;
  } catch (e) {
    console.error(`Failed to load words for level ${level}:`, e);
    throw e;
  }
};

/** * 专门处理翻译类的语音比对 
 * lang: 'en-US' | 'fr-FR'
 */
export const processTranslationSpeech = async (audioFile, targetMeanings, lang) => {
  // 这里未来调用你的后端接口，比如 /api/hsk/transcribe_translate
  // 现在先模拟返回结构
  console.log(`Processing ${lang} for:`, targetMeanings);
  
  // 模拟逻辑：假设识别出的文字是 "apple"
  // const recognizedText = await yourApiCall(audioFile, lang);
  const recognizedText = "example"; 
  
  // 比对逻辑：meaning 可能包含 "apple, red fruit"
  const meaningList = targetMeanings.split(',').map(s => s.trim().toLowerCase());
  const isCorrect = meaningList.includes(recognizedText.toLowerCase());

  return {
    isCorrect,
    actual: recognizedText,
    expected: targetMeanings
  };
};