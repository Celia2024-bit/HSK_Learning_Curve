// src/constants.js

const USE_PROD_URL = true;
//docker run -it -p 39999:10000 -v C:\workspace\Personals\AudioToPinyin:/app my_pinyin_service:v1 /bin/bash

// 基础 HSK 数据接口
export const API_BASE = USE_PROD_URL 
  ? "https://backend-all-6q0a.onrender.com/api/hsk" 
  : "http://localhost:5000/api/hsk";

// 语音转拼音服务接口
export const PINYIN_API_URL = USE_PROD_URL 
  ? "https://audio-to-text-29330024195.europe-west2.run.app/pinyin" 
  : "http://localhost:39999/pinyin";
  
     
export const DEFAULT_QUIZ_COUNT = 20;
export const DEFAULT_TTS_VOICE = "Mandarin Male (Yunjian)";
export const DEFAULT_TTS_SPEED_SLOW = -50;
export const DEFAULT_TTS_SPEED_NORMAL = 0;