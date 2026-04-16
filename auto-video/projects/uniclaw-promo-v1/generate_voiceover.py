#!/usr/bin/env python3
"""Generate Chinese voiceover audio for UniClaw promo video using edge-tts."""
import asyncio
import os
import subprocess

from edge_tts import Communicate

# 6 段旁白文本
segments = [
    (0, 150, "UniClaw，让 AI 以更高效、更可见的方式完成真实任务。"),
    (150, 420, "它不是只用来聊天的 AI 界面，而是把任务理解、能力调用和执行过程组织在同一个工作流里。"),
    (420, 840, "用户可以直接从自然语言输入开始，快速发起任务，并在统一界面中持续获得响应与后续推进。"),
    (840, 1446, "除了对话入口，UniClaw 还提供结构化能力模块和实例化组织方式，让复杂流程更容易管理，真实的业务反馈也能被直接呈现。"),
    (1446, 1806, "在执行过程中，任务输入、子步骤和结果反馈都可以被直观查看，帮助团队真正理解 AI 完成了什么。"),
    (1806, 1986, "UniClaw，帮助团队构建更高效、更可见的 AI 执行工作流。"),
]

OUTPUT_DIR = r"A:\study\AI\LLM\browser-use-cli-test\remotion-app\public"
FFMPEG = r"A:\study\AI\LLM\browser-use-cli-test\remotion-app\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
SEGMENT_FILES = []


async def generate_segment(index: int, start_frame: int, end_frame: int, text: str):
    """Generate audio for one segment."""
    duration_sec = (end_frame - start_frame) / 30.0
    print(f"Segment {index+1}: frames {start_frame}-{end_frame} (~{duration_sec:.1f}s)")
    print(f"  Text: {text}")

    voice = "zh-CN-XiaoxiaoNeural"
    rate = "+0%"
    pitch = "+0Hz"

    temp_mp3 = os.path.join(OUTPUT_DIR, f"temp_vo_s{index+1}.mp3")

    communicate = Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(temp_mp3)
    print(f"  Saved: {temp_mp3}")

    SEGMENT_FILES.append(temp_mp3)


async def main():
    print("Generating voiceover segments...")
    tasks = [
        generate_segment(i, start, end, text)
        for i, (start, end, text) in enumerate(segments)
    ]
    await asyncio.gather(*tasks)

    # 合并所有音频段
    print("\nMerging segments into single track...")
    concat_list = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for seg_file in SEGMENT_FILES:
            f.write(f"file '{seg_file}'\n")

    final_output = os.path.join(OUTPUT_DIR, "uniclaw-voiceover-v1.mp3")

    result = subprocess.run([
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-acodec", "libmp3lame", "-q:a", "2",
        final_output
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print(f"FFmpeg error: {result.stderr}")
    else:
        print(f"\nFinal voiceover: {final_output}")

    # 清理临时文件
    for seg_file in SEGMENT_FILES:
        try:
            os.remove(seg_file)
        except:
            pass
    try:
        os.remove(concat_list)
    except:
        pass


if __name__ == "__main__":
    asyncio.run(main())
