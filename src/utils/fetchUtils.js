// src/fetchUtils.js
// 复用 App.js 中的 API_BASE 地址（保持一致）
//const API_BASE = "https://backend-all-6q0a.onrender.com/api/hsk";
import { API_BASE, Whisper_API_BASE, DEFAULT_TTS_VOICE, DEFAULT_TTS_SPEED_SLOW, DEFAULT_TTS_SPEED_NORMAL } from './constants';

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

/**
 * 新增：真正去 fetch 后端的音频数据
 * 它会返回一个 Response 对象，这样外面（App.js）才能决定是存入缓存还是直接播
 */
export const fetchTtsResponse = async (text, isSlow = true) => {
  const url = getTtsUrl(text, isSlow);
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TTS 请求失败: ${res.status}`);
  }
  
  // 注意：这里返回整个 Response 对象
  // 因为 caches.put(url, response) 需要完整的 Response
  return res; 
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

/**
 * 调用 Whisper API 进行语音转文字，并与目标意思比对
 * 
 * @param {File|Blob} audioFile - 音频文件对象
 * @param {string} targetMeanings - 目标意思，逗号分隔 (例: "apple, red fruit, 苹果")
 * @param {string} lang - 语言代码 ('en', 'fr', 'zh' 等)
 * @returns {Promise<Object>} { success, transcription, isCorrect, error }
 */
 
export const processTranslationSpeech = async (audioFile, targetMeanings, lang) => {
  try {
    console.log('开始转录...', { audioFile, targetMeanings, lang });
    
    // 1. 构建 FormData
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', lang);

    // 2. 调用 Whisper API（注意：用反引号）
    const response = await fetch(`${Whisper_API_BASE}/transcribe`, {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);

    // 3. 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API 返回:', data);

    if (!data.success) {
      throw new Error(data.error || '转录失败');
    }

    // 4. 获取识别出的文字
    const recognizedText = data.transcription.trim().toLowerCase();
    console.log('识别文字:', recognizedText);

    // 5. 比对逻辑
    const meaningList = targetMeanings.split(',').map(s => s.trim().toLowerCase());
    console.log('目标列表:', meaningList);
    
    const isCorrect = meaningList.some(meaning => 
      recognizedText.includes(meaning) || meaning.includes(recognizedText)
    );

    console.log('匹配结果:', isCorrect);

    // 6. 返回结果
    return {
      success: true,
      isCorrect: isCorrect,
      actual: recognizedText,
      expected: meaningList,
      transcription: data.transcription  // 保留原始转录
    };

  } catch (error) {
    console.error('Whisper API 错误:', error);
    return {
      success: false,
      error: error.message,
      isCorrect: false
    };
  }
};