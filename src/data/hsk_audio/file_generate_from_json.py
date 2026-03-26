"""
HSK 音频批量生成脚本
使用 Google Cloud TTS 批量生成 JSON 文件中的所有词汇音频
"""

import json
import os
import time
from google.cloud import texttospeech
from pathlib import Path

# ==================== 配置区域 ====================

# Google Cloud 密钥文件路径（改成你的路径）
KEY_FILE = r".\google-tts-key.json"

# JSON 文件路径（改成你的路径）
JSON_FILE = r".\hsk-level-3.json"

# 输出目录（音频文件保存位置）
OUTPUT_DIR = r".\hsk_audio_3"

# 语音选择（可选值见下方）
VOICE_NAME = "cmn-CN-Wavenet-B"  # 女声A（推荐）

# 语速（0.5 到 4.0，1.0 为正常速度）
# 处理语速：-50 到 +50 转为 0.5 到 1.5 倍速
SPEAKING_RATE_tmp = 1.0 + (int(-40) / 100)
SPEAKING_RATE = max(0.25, min(4.0, SPEAKING_RATE_tmp))
        

# 每个请求之间的延迟（秒）
DELAY_SECONDS = 0.5

# ==================== 可选语音列表 ====================
# "cmn-CN-Wavenet-A" - 女声A（推荐）
# "cmn-CN-Wavenet-B" - 男声B（推荐）
# "cmn-CN-Wavenet-C" - 男声C
# "cmn-CN-Wavenet-D" - 女声D
# ===================================================


def setup():
    """初始化设置"""
    # 设置 Google Cloud 密钥
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = KEY_FILE
    
    # 创建输出目录
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("HSK 音频批量生成脚本")
    print("=" * 60)
    print(f"JSON 文件: {JSON_FILE}")
    print(f"输出目录: {OUTPUT_DIR}")
    print(f"语音: {VOICE_NAME}")
    print(f"语速: {SPEAKING_RATE}x")
    print("=" * 60)
    print()


def load_json(json_file):
    """读取 JSON 文件"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✓ 成功加载 {len(data)} 个词汇")
        return data
    except Exception as e:
        print(f"✗ 读取 JSON 文件失败: {e}")
        return None


def generate_audio(client, text, output_path, voice_name, speaking_rate):
    """生成单个音频文件"""
    try:
        # 设置要合成的文本
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # 选择语音
        voice = texttospeech.VoiceSelectionParams(
            language_code="cmn-CN",
            name=voice_name
        )
        
        # 音频配置
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=speaking_rate
        )
        
        # 合成语音
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # 保存音频文件
        with open(output_path, 'wb') as f:
            f.write(response.audio_content)
        
        return True
    except Exception as e:
        print(f"  ✗ 错误: {e}")
        return False


def main():
    """主函数"""
    # 初始化
    setup()
    
    # 读取 JSON
    data = load_json(JSON_FILE)
    if not data:
        return
    
    # 创建 TTS 客户端
    try:
        client = texttospeech.TextToSpeechClient()
        print("✓ Google TTS 客户端初始化成功\n")
    except Exception as e:
        print(f"✗ 初始化失败: {e}")
        print("请检查密钥文件路径是否正确")
        return
    
    # 统计
    total = len(data)
    success = 0
    failed = 0
    skipped = 0
    
    print(f"开始生成音频...\n")
    start_time = time.time()
    
    # 遍历每个词汇
    for i, item in enumerate(data, 1):
        char = item.get('char', '')
        pinyin = item.get('pinyin', '')
        meaning = item.get('meaning', '')
        
        # 生成文件名（使用汉字作为文件名）
        filename = f"{char}.mp3"
        output_path = os.path.join(OUTPUT_DIR, filename)
        
        # 检查文件是否已存在
        if os.path.exists(output_path):
            print(f"[{i}/{total}] ⊙ {char} ({pinyin}) - 已存在，跳过")
            skipped += 1
            continue
        
        # 生成音频
        print(f"[{i}/{total}] ⏳ {char} ({pinyin}) ...", end=' ')
        
        if generate_audio(client, char, output_path, VOICE_NAME, SPEAKING_RATE):
            print(f"✓")
            success += 1
        else:
            failed += 1
        
        # 延迟，避免请求过快
        if i < total:
            time.sleep(DELAY_SECONDS)
    
    # 完成
    elapsed_time = time.time() - start_time
    
    print("\n" + "=" * 60)
    print("生成完成！")
    print("=" * 60)
    print(f"总数: {total}")
    print(f"成功: {success}")
    print(f"失败: {failed}")
    print(f"跳过: {skipped}")
    print(f"耗时: {elapsed_time:.1f} 秒")
    print(f"输出目录: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()