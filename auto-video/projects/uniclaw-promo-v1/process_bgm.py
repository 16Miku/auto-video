#!/usr/bin/env python3
"""
BGM 处理脚本：将 BGM 与配音混合，输出最终音频。

用法：
  python process_bgm.py --bgm <bgm文件> --voiceover <配音文件> --output <输出文件>

示例：
  python process_bgm.py --bgm bgm.mp3 --voiceover uniclaw-voiceover-v1.mp3 --output final-audio.mp3
"""
import argparse
import os
import subprocess

FFMPEG = r"A:\study\AI\LLM\browser-use-cli-test\remotion-app\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe"
VIDEO_DURATION = 66.2  # 秒
FADE_DURATION = 3.0     # 淡入淡出秒数
BGM_VOLUME = 0.06       # 配音密集段 BGM 音量


def process_bgm(bgm_path: str, voiceover_path: str, output_path: str):
    """处理 BGM：循环到视频时长、淡入淡出、与配音混合。"""
    fade_out_start = VIDEO_DURATION - FADE_DURATION

    filter_complex = (
        f"[1:a]aloop=loop=-1:size=2e+09,atrim=0:{VIDEO_DURATION},"
        f"volume={BGM_VOLUME},"
        f"afade=t=in:st=0:d={FADE_DURATION},"
        f"afade=t=out:st={fade_out_start:.1f}:d={FADE_DURATION}[bgm];"
        f"[0:a][bgm]amix=inputs=2:duration=first[out]"
    )

    result = subprocess.run([
        FFMPEG, "-y",
        "-i", voiceover_path,
        "-i", bgm_path,
        "-filter_complex", filter_complex,
        "-map", "[out]",
        output_path
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    else:
        print(f"✓ 混合音频输出: {output_path}")


def normalize_audio(input_path: str, output_path: str):
    """音量标准化到 -16 LUFS。"""
    cmd = [FFMPEG, "-y", "-i", input_path, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", output_path]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✓ 标准化输出: {output_path}")
    else:
        print(f"Normalization error: {result.stderr}")


def main():
    parser = argparse.ArgumentParser(description="处理 BGM 并与配音混合")
    parser.add_argument("--bgm", required=True, help="BGM 文件路径")
    parser.add_argument("--voiceover", required=True, help="配音文件路径")
    parser.add_argument("--output", required=True, help="输出文件路径")
    parser.add_argument("--normalize", action="store_true", help="是否做音量标准化")
    args = parser.parse_args()

    if not os.path.exists(args.bgm):
        print(f"BGM 文件不存在: {args.bgm}")
        return
    if not os.path.exists(args.voiceover):
        print(f"配音文件不存在: {args.voiceover}")
        return

    # 混合
    temp_output = args.output.replace(".mp3", "_mixed.mp3")
    process_bgm(args.bgm, args.voiceover, temp_output)

    # 标准化
    if args.normalize and os.path.exists(temp_output):
        normalize_audio(temp_output, args.output)
        try:
            os.remove(temp_output)
        except:
            pass
    else:
        if os.path.exists(temp_output):
            os.rename(temp_output, args.output)


if __name__ == "__main__":
    main()
