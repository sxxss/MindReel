"""voice agent —— 逐 beat 调 TTS 合成旁白，落地 mp3 并测真实时长。

每个 beat 一段音频，真实时长（ffprobe 测量）回填进 VoiceCue，供 timeline-solver
做音画对齐。NARRATION_SPEED=1.0：自然语速最清楚，宁可成片长一点也要听得懂。
"""
from __future__ import annotations

import asyncio
import json
import subprocess
from pathlib import Path

from ..config import settings
from ..models import Project, Script, ProviderEntry, VoiceTrack
from ..providers import ProviderError, synthesize_speech
from .runner import Emit

NARRATION_SPEED = 1.0


def _audio_dir(project_id: str) -> Path:
    return settings.projects_dir / project_id / "audio"


def _probe_duration_ms(path: Path) -> int:
    """用 ffprobe 测音频时长。ffprobe 随 ffmpeg 一起装。"""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    seconds = float(out)
    if seconds <= 0:
        raise ValueError(f"ffprobe 返回了非法时长：{out}")
    return round(seconds * 1000)


async def _synthesize_with_retries(cfg: ProviderEntry, *, text: str, voice: str,
                                   out_path: Path, beat_id: str, emit: Emit | None) -> None:
    last: Exception | None = None
    for attempt in range(3):
        try:
            audio = await synthesize_speech(cfg, text=text, voice=voice, fmt="mp3",
                                            speed=NARRATION_SPEED)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(audio)
            return
        except (ProviderError, OSError) as e:
            last = e
            if emit:
                lvl_msg = (f"第 {attempt + 1} 次合成 beat {beat_id} 失败，准备重试。"
                           if attempt < 2 else f"beat {beat_id} 连续 3 次合成失败。")
                res = emit("voice.retry", lvl_msg)
                if res is not None:
                    await res
            await asyncio.sleep(0.4 * (attempt + 1))
    raise last or RuntimeError(f"beat {beat_id} 合成失败")


async def run_voice(project: Project, script: Script, tts: ProviderEntry,
                    emit: Emit | None = None) -> VoiceTrack:
    voice = tts.voice or "alloy"
    provider = tts.model or "tts"
    cues = []
    for segment in script.segments:
        for beat in segment.beats:
            out_path = _audio_dir(project.id) / f"{beat.id}.mp3"
            await _synthesize_with_retries(
                tts, text=beat.text, voice=voice, out_path=out_path,
                beat_id=beat.id, emit=emit,
            )
            # 存【相对 data 目录】的路径（projects/<id>/audio/<beat>.mp3），
            # 这样渲染/导出/媒体服务在 host 与 Docker、以及 data 目录变动后都能解析。
            rel_path = f"projects/{project.id}/audio/{beat.id}.mp3"
            cues.append({
                "beatId": beat.id,
                "audioPath": rel_path,
                "actualDurationMs": _probe_duration_ms(out_path),
                "provider": provider,
                "voice": voice,
                "mimeType": "audio/mpeg",
            })
    return VoiceTrack.model_validate({"cues": cues})
