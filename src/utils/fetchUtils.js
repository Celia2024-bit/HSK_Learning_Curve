// src/fetchUtils.js
import { API_BASE, DEFAULT_TTS_VOICE, DEFAULT_TTS_SPEED_SLOW, DEFAULT_TTS_SPEED_NORMAL } from './constants';

// 新增：定义自定义级别常量（和 App.js/Menu.js 保持一致）
const CUSTOM_LEVEL = 0;

// 1. 获取用户数据
export const fetchUserProgress = async (username) => {
  try {
    const res = await fetch(`${API_BASE}/get_user_data?username=${username}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to load user data:", e);
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
export const fetchSaveMastery = async (username, char, record) => {
  await fetch(`${API_BASE}/save_mastery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, char, record })
  });
};

// 4. 保存进度
export const fetchSaveProgress = async (payload) => {
  await fetch(`${API_BASE}/save_progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
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
}; // 关键修复：补充函数闭合的 }

// --- 3. 自定义单词库（新增：适配后端 CRUD 接口）---
/**
 * 添加自定义单词
 * @param {string} username - 用户名
 * @param {object} word - 单词对象 { char, pinyin, meaning, explanation }
 * @returns {boolean} 是否添加成功
 */
export const addCustomWord = async (username, word) => {
  try {
    const res = await fetch(`${API_BASE}/custom/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        char: word.char,         // 汉字
        pinyin: word.pinyin || '', // 拼音（可选）
        meaning: word.definition,  // 后端字段为 meaning（对应前端 definition）
        explanation: word.explanation || '' // 额外解释（可选）
      })
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to add custom word:", e);
    return false;
  }
};

/**
 * 获取用户所有自定义单词（管理页面用）
 * @param {string} username - 用户名
 * @returns {array} 自定义单词列表
 */
export const fetchCustomWords = async (username) => {
  try {
    const res = await fetch(`${API_BASE}/custom/cards/list/${encodeURIComponent(username)}`);
    const data = await res.json();
    // 格式转换：后端 meaning → 前端 definition，保持和 HSK 单词格式一致
    return data.map(card => ({
      id: card.id,               // 卡片 ID（用于修改/删除）
      char: card.char,           // 汉字
      pinyin: card.pinyin || '', // 拼音
      definition: card.meaning,  // 释义
      explanation: card.explanation || '', // 额外解释
      mastery: card.mastery || 1, // 熟练度（默认 1）
      last_reviewed_at: card.last_reviewed_at // 最后复习时间
    }));
  } catch (e) {
    console.error("Failed to load custom words:", e);
    return [];
  }
};

/**
 * 获取自定义单词复习列表（按记忆曲线优先级）
 * @param {string} username - 用户名
 * @param {number} limit - 数量限制（默认 20）
 * @returns {array} 复习列表
 */
export const fetchCustomReviewList = async (username, limit = 20) => {
  try {
    const res = await fetch(`${API_BASE}/custom/cards/review/${encodeURIComponent(username)}?limit=${limit}`);
    const data = await res.json();
    // 格式转换，保持和 HSK 单词一致
    return data.map(card => ({
      char: card.char,
      pinyin: card.pinyin || '',
      definition: card.meaning,
      mastery: card.mastery || 1
    }));
  } catch (e) {
    console.error("Failed to load custom review list:", e);
    return [];
  }
};

/**
 * 修改自定义单词
 * @param {number} cardId - 卡片 ID
 * @param {object} data - 要更新的字段 { pinyin, meaning, explanation, mastery }
 * @returns {boolean} 是否更新成功
 */
export const updateCustomWord = async (cardId, data) => {
  try {
    const res = await fetch(`${API_BASE}/custom/cards/item/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to update custom word:", e);
    return false;
  }
};

/**
 * 删除自定义单词
 * @param {number} cardId - 卡片 ID
 * @returns {boolean} 是否删除成功
 */
export const deleteCustomWord = async (cardId) => {
  try {
    const res = await fetch(`${API_BASE}/custom/cards/item/${cardId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to delete custom word:", e);
    return false;
  }
};

// --- 4. 单词加载统一入口（原有逻辑修改）---
export const fetchWordsByLevel = async (level, username) => {
  if (level === CUSTOM_LEVEL) {
    // 自定义库：获取复习列表（按记忆曲线）
    return await fetchCustomReviewList(username);
  } else {
    // HSK 库：加载本地静态文件（原有逻辑）
    try {
      // 注意：本地 JSON 加载路径需根据实际项目结构调整
      const res = await import(`../data/hsk-level-${level}.json`); // 修复路径：从 utils → 上级目录的 data
      return res.default;
    } catch (e) {
      console.error("Failed to load HSK words:", e);
      return [];
    }
  }
};