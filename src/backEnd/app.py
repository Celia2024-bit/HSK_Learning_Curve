import asyncio
import io
import json
import os
import edge_tts
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 模拟数据库：现在每个文件都存储所有用户的数据
USERS_DB = 'users_db.json'       # 格式: {"username": {"password": "..."}}
PROGRESS_DB = 'progress_db.json'   # 格式: {"username": {"level": 1, ...}}
MASTERY_DB = 'mastery_db.json'     # 格式: {"username": {"爱": {...}}}

# --- 辅助函数 ---
def load_db(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try: return json.load(f)
            except: return {}
    return {}

def save_db(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# --- 1. 账号相关 ---

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username, password = data.get('username'), data.get('password')
    users = load_db(USERS_DB)
    if username in users: return jsonify({"message": "User exists"}), 400
    users[username] = {"password": password}
    save_db(USERS_DB, users)
    return jsonify({"status": "success"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username, password = data.get('username'), data.get('password')
    users = load_db(USERS_DB)
    if username in users and users[username]['password'] == password:
        return jsonify({"status": "success", "username": username}), 200
    return jsonify({"status": "error"}), 401

# --- 2. 数据获取 (你关心的接口都在这里) ---

# 新增的综合接口：App.js 登录后首选调用这个
@app.route('/get_user_data', methods=['GET'])
def get_user_data():
    username = request.args.get('username')
    progress = load_db(PROGRESS_DB).get(username, {"level": 1, "index": 0, "quizCount": 20})
    mastery = load_db(MASTERY_DB).get(username, {})
    return jsonify({"progress": progress, "mastery": mastery})

# 保留原有的 get_progress 接口 (适配多用户)
@app.route('/get_progress', methods=['GET'])
def get_progress():
    username = request.args.get('username')
    db = load_db(PROGRESS_DB)
    return jsonify(db.get(username, {"level": 1, "index": 0}))

# 保留原有的 get_mastery 接口 (适配多用户)
@app.route('/get_mastery', methods=['GET'])
def get_mastery():
    username = request.args.get('username')
    db = load_db(MASTERY_DB)
    return jsonify(db.get(username, {}))

# --- 3. 数据保存 ---

@app.route('/save_progress', methods=['POST'])
def save_progress():
    data = request.json
    username = data.get('username')
    db = load_db(PROGRESS_DB)
    db[username] = {
        "level": data.get('level', 1),
        "index": data.get('index', 0),
        "quizCount": data.get('quizCount', 20)
    }
    save_db(PROGRESS_DB, db)
    return {"status": "success"}

@app.route('/save_mastery', methods=['POST'])
def save_mastery():
    data = request.json
    username = data.get('username')
    char, record = data.get('char'), data.get('record')
    db = load_db(MASTERY_DB)
    if username not in db: db[username] = {}
    db[username][char] = record
    save_db(MASTERY_DB, db)
    return {"status": "success"}

# --- 4. 语音合成 ---
@app.route('/tts')
def tts():
    text = request.args.get('text')
    voice = request.args.get('voice', 'zh-CN-YunjianNeural')
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        communicate = edge_tts.Communicate(text, voice)
        audio_stream = io.BytesIO()
        async def stream_audio():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio": audio_stream.write(chunk["data"])
        loop.run_until_complete(stream_audio())
        audio_stream.seek(0)
        loop.close()
        return send_file(audio_stream, mimetype="audio/mpeg")
    except Exception as e: return str(e), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)