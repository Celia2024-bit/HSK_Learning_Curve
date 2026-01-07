// src/fetchUtils.js
// 复用 App.js 中的 API_BASE 地址（保持一致）
//const API_BASE = "https://backend-all-6q0a.onrender.com/api/hsk";
const API_BASE = "http://localhost:5000/api/hsk";

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
  const speed = isSlow ? -50 : 0;
  const voice = "Mandarin Male (Yunjian)";
  const params = new URLSearchParams({
    text: text,
    speed: speed,
    voice: voice
  });
  return `${API_BASE}/tts?${params.toString()}`;
};