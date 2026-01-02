import asyncio
import io
import requests
import edge_tts
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from config import SUPABASE_URL, HEADERS # 导入你的配置

app = Flask(__name__)
CORS(app)

# --- 辅助函数：简化 Supabase 请求 ---
def supabase_request(method, path, json_data=None, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    response = requests.request(method, url, headers=HEADERS, json=json_data, params=params)
    return response

# --- 1. 账号相关 ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    # 检查用户是否存在
    check = supabase_request("GET", "users", params={"username": f"eq.{data['username']}"})
    if check.json():
        return jsonify({"message": "User exists"}), 400
    
    # 插入新用户
    res = supabase_request("POST", "users", json_data=data)
    return jsonify({"status": "success"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    params = {
        "username": f"eq.{data['username']}",
        "password": f"eq.{data['password']}"
    }
    res = supabase_request("GET", "users", params=params)
    if res.json():
        return jsonify({"status": "success", "username": data['username']}), 200
    return jsonify({"status": "error"}), 401

# --- 2. 数据获取 (整合接口) ---

@app.route('/get_user_data', methods=['GET'])
def get_user_data():
    username = request.args.get('username')
    
    # 获取进度
    p_res = supabase_request("GET", "user_progress", params={"username": f"eq.{username}"})
    progress = p_res.json()[0] if p_res.json() else {"level": 1, "current_index": 0, "quiz_count": 20}
    
    # 获取熟练度
    m_res = supabase_request("GET", "word_mastery", params={"username": f"eq.{username}"})
    # 将列表转为字典格式给前端： { "爱": {...}, "你": {...} }
    mastery = {item['char']: item['record'] for item in m_res.json()}
    
    return jsonify({"progress": progress, "mastery": mastery})

# --- 3. 数据保存 ---

@app.route('/save_progress', methods=['POST'])
def save_progress():
    data = request.json
    username = data.get('username')
    payload = {
        "username": username,
        "level": data.get('level'),
        "quiz_count": data.get('quizCount'),
        "current_index": data.get('index')
    }
    # 使用 upsert (存在则更新，不存在则插入)
    headers = {**HEADERS, "Prefer": "resolution=merge-duplicates"}
    requests.post(f"{SUPABASE_URL}/rest/v1/user_progress", headers=headers, json=payload)
    return {"status": "success"}

@app.route('/save_mastery', methods=['POST'])
def save_mastery():
    data = request.json
    payload = {
        "username": data.get('username'),
        "char": data.get('char'),
        "record": data.get('record')
    }
    # 使用 upsert
    headers = {**HEADERS, "Prefer": "resolution=merge-duplicates"}
    requests.post(f"{SUPABASE_URL}/rest/v1/word_mastery", headers=headers, json=payload)
    return {"status": "success"}

# --- 4. TTS 语音 (保持不变) ---
@app.route('/tts')
def tts():
    text = request.args.get('text')
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        communicate = edge_tts.Communicate(text, 'zh-CN-YunjianNeural')
        audio_stream = io.BytesIO()
        async def stream():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio": audio_stream.write(chunk["data"])
        loop.run_until_complete(stream())
        audio_stream.seek(0)
        return send_file(audio_stream, mimetype="audio/mpeg")
    except Exception as e: return str(e), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)