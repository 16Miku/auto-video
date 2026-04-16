#!/usr/bin/env python3
"""
Generate Chinese voiceover audio for UniClaw promo video using edge-tts.
每段配音后面自动填充静音，对齐目标帧时长。
"""
import asyncio
import os
import subprocess

from edge_tts import Communicate

# 6 段旁白文本 + 目标帧数
segments = [
    (0, 150, "UniClaw，让 AI 以更高效、更可见的方式完成真实任务。"),
    (150, 420, "它不是用来聊天的 AI 界面，而是把任务理解、能力调用和执行过程组织在同一个工作流里。"),
    (420, 840, "用户可以直接从自然语言输入开始，快速发起任务，并在统一界面中持续获得响应与后续推进。"),
    (840, 1446, "除了对话入口，UniClaw 还提供结构化能力模块和实例化组织方式，让复杂流程更容易管理，真实的业务反馈也能被直接呈现。"),
    (1446, 1806, "在执行过程中，任务输入、子步骤和结果反馈都可以被直观查看，帮助团队真正理解 AI 完成了什么。"),
    (1806, 1986, "UniClaw，帮助团队构建更高效、更可见的 AI 执行工作流。"),
]

OUTPUT_DIR = r"A:\study\AI\LLM\browser-use-cli-test\remotion-app\public"
FFMPEG = r"A:\study\AI\LLM\browser-use-cli-test\remotion-app\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
FINAL_OUTPUT = os.path.join(OUTPUT_DIR, "uniclaw-voiceover-v1.mp3")

FPS = 30


async def generate_segment_audio(index: int, start_frame: int, end_frame: int, text: str) -> str:
    """生成单段配音（不含静音）。"""
    temp_mp3 = os.path.join(OUTPUT_DIR, f"temp_vo_s{index+1}.mp3")
    voice = "zh-CN-XiaoxiaoNeural"
    communicate = Communicate(text, voice, rate="+0%", pitch="+0Hz")
    await communicate.save(temp_mp3)
    print(f"  Segment {index+1}: 配音 {len(text)} 字 -> {temp_mp3}")
    return temp_mp3


async def main():
    print("=== Step 1: 生成各段配音 ===")
    tasks = [
        generate_segment_audio(i, start, end, text)
        for i, (start, end, text) in enumerate(segments)
    ]
    segment_files = await asyncio.gather(*tasks)

    print("\n=== Step 2: 测量每段配音实际时长 ===")
    segment_durations = []
    for i, fpath in enumerate(segment_files):
        result = subprocess.run([
            FFMPEG, "-i", fpath, "-hide_banner"
        ], capture_output=True, text=True)
        # 解析 Duration: 00:00:04.23
        for line in result.stderr.split("\n"):
            if "Duration:" in line and "Duration: N/A" not in line:
                dur_str = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = dur_str.split(":")
                dur = float(h) * 3600 + float(m) * 60 + float(s)
                start_frame = segments[i][0]
                end_frame = segments[i][1]
                target_sec = (end_frame - start_frame) / FPS
                segment_durations.append({
                    "index": i,
                    "start": start_frame,
                    "end": end_frame,
                    "target": target_sec,
                    "actual": dur,
                    "file": fpath,
                    "silence_needed": target_sec - dur
                })
                print(f"  Segment {chr(65+i)}: 目标 {target_sec:.2f}s, 实际 {dur:.2f}s, 需静音 {target_sec-dur:.2f}s")
                break

    print("\n=== Step 3: 生成合并列表（配音+静音填充） ===")
    concat_entries = []
    for seg in segment_durations:
        concat_entries.append(f"file '{seg['file']}'")
        silence_needed = seg["silence_needed"]
        if silence_needed > 0.05:
            silence_file = os.path.join(OUTPUT_DIR, f"temp_silence_{seg['index']}.mp3")
            # 生成指定时长的静音
            result = subprocess.run([
                FFMPEG, "-y",
                "-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono",
                "-t", f"{silence_needed:.3f}",
                "-q:a", "9",
                silence_file
            ], capture_output=True, text=True)
            if result.returncode == 0:
                concat_entries.append(f"file '{silence_file}'")
                print(f"  Segment {chr(65+seg['index'])}: +{silence_needed:.2f}s 静音填充")
            else:
                print(f"  静音生成失败: {result.stderr[-200:]}")
        else:
            print(f"  Segment {chr(65+seg['index'])}: 无需静音 (实际比目标长 {-silence_needed:.2f}s)")

    concat_list = os.path.join(OUTPUT_DIR, "concat_list.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for entry in concat_entries:
            f.write(entry + "\n")

    print(f"\n=== Step 4: 合并所有段 ===")
    result = subprocess.run([
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-acodec", "libmp3lame", "-q:a", "2",
        FINAL_OUTPUT
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print(f"FFmpeg error: {result.stderr[-400:]}")
        return

    # 验证总时长
    result2 = subprocess.run([
        FFMPEG, "-i", FINAL_OUTPUT, "-hide_banner"
    ], capture_output=True, text=True)
    for line in result2.stderr.split("\n"):
        if "Duration:" in line and "Duration: N/A" not in line:
            print(f"  最终配音总时长: {line.split('Duration:')[1].split(',')[0].strip()}")
            break

    print(f"  输出: {FINAL_OUTPUT}")

    # 清理临时文件
    print("\n=== 清理临时文件 ===")
    for f in segment_files:
        try:
            os.remove(f)
            print(f"  删: {f}")
        except:
            pass
    for seg in segment_durations:
        silence_file = os.path.join(OUTPUT_DIR, f"temp_silence_{seg['index']}.mp3")
        try:
            os.remove(silence_file)
            print(f"  删: {silence_file}")
        except:
            pass
    try:
        os.remove(concat_list)
        print(f"  删: {concat_list}")
    except:
        pass


if __name__ == "__main__":
    asyncio.run(main())
