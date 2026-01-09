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


/**
 * 加载本地 HSK 单词数据
 * @param {number|string} level HSK等级
 */
export const fetchWordsByLevel = async (level) => {
  try {
    // 动态导入本地 JSON 文件
    const res = await import(`../data/hsk-level-${level}.json`);
    return res.default;
  } catch (e) {
    console.error(`Failed to load HSK level ${level} words:`, e);
    throw e; // 抛出错误以便组件处理
  }
}; 
