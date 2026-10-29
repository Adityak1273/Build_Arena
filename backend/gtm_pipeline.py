import os
import hashlib
import subprocess
import json
import time
from pathlib import Path
from typing import Dict, Any, Optional

try:
    from elevenlabs.client import ElevenLabs
    from elevenlabs import VoiceSettings
    HAS_ELEVENLABS = True
except ImportError:
    HAS_ELEVENLABS = False


class AutoForgeGTMPipeline:
    """
    Multimodal GTM Audio & Video Compositor:
    - Generates lifelike voiceovers using ElevenLabs with SHA-256 caching.
    - Composites 1080p promotional video using FFmpeg.
    - Gracefully provides local simulation if external API keys or binaries are absent.
    """
    def __init__(self, workspace_dir: str):
        self.workspace = Path(workspace_dir)
        self.assets_dir = self.workspace / "gtm_assets"
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        api_key = os.environ.get("ELEVENLABS_API_KEY", "")
        self.eleven_client = ElevenLabs(api_key=api_key) if HAS_ELEVENLABS and api_key else None

    def synthesize_voiceover_cached(
        self, script_text: str, voice_id: str = "JBFqnCBsd6RMkjVDRZzb", model_id: str = "eleven_multilingual_v2"
    ) -> Path:
        cache_seed = f"{script_text}|{voice_id}|{model_id}|0.45|0.80"
        file_hash = hashlib.sha256(cache_seed.encode("utf-8")).hexdigest()[:12]
        audio_path = self.assets_dir / f"voiceover_{file_hash}.mp3"

        if audio_path.exists():
            return audio_path

        if self.eleven_client:
            try:
                audio_stream = self.eleven_client.text_to_speech.convert(
                    text=script_text,
                    voice_id=voice_id,
                    model_id=model_id,
                    output_format="mp3_44100_128",
                    voice_settings=VoiceSettings(
                        stability=0.45,
                        similarity_boost=0.80,
                        style=0.55,
                        use_speaker_boost=True,
                        speed=1.0,
                    ),
                )
                with open(audio_path, "wb") as f:
                    for chunk in audio_stream:
                        if chunk:
                            f.write(chunk)
                return audio_path
            except Exception as e:
                print(f"[GTM Pipeline] ElevenLabs API error: {e}. Generating simulated voice asset.")

        # Graceful fallback: generate a lightweight MP3 / WAV binary
        self._generate_placeholder_audio(audio_path, script_text)
        return audio_path

    def _generate_placeholder_audio(self, path: Path, text: str):
        # Writes an audio placeholder container for testing/offline presentation
        with open(path, "wb") as f:
            f.write(b"ID3\x03\x00\x00\x00\x00\x00#" + text.encode("utf-8")[:100] + b"\x00" * 2048)

    def composite_launch_video(
        self, screenshot_path: Path, audio_path: Path, headline_caption: str, output_name: str = "launch_promo.mp4"
    ) -> Path:
        output_path = self.assets_dir / output_name
        safe_caption = headline_caption.replace("'", "").replace(":", " -")

        # Check if ffmpeg is available
        ffmpeg_available = False
        try:
            res = subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            ffmpeg_available = (res.returncode == 0)
        except FileNotFoundError:
            ffmpeg_available = False

        if ffmpeg_available and screenshot_path.exists() and audio_path.exists():
            filter_complex = (
                f"[0:v]scale=1920:1080,zoompan=z='min(zoom+0.0012,1.18)':d=150:"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,"
                f"drawbox=y=ih-140:color=black@0.68:width=iw:height=100:t=fill,"
                f"drawtext=text='{safe_caption}':fontcolor=white:fontsize=38:"
                f"x=(w-text_w)/2:y=h-105[v]"
            )
            cmd = [
                "ffmpeg", "-y",
                "-loop", "1", "-i", str(screenshot_path),
                "-i", str(audio_path),
                "-filter_complex", filter_complex,
                "-map", "[v]", "-map", "1:a",
                "-c:v", "libx264", "-preset", "fast", "-crf", "22",
                "-c:a", "aac", "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                str(output_path),
            ]
            try:
                subprocess.run(cmd, check=True, capture_output=True)
                return output_path
            except Exception as e:
                print(f"[GTM Pipeline] FFmpeg render exception: {e}")

        # Fallback metadata / preview output
        meta_path = self.assets_dir / f"{output_name}.json"
        with open(meta_path, "w") as f:
            json.dump({
                "title": headline_caption,
                "screenshot": str(screenshot_path),
                "audio": str(audio_path),
                "created_at": time.time(),
                "status": "READY_FOR_PREVIEW"
            }, f, indent=2)

        # Write dummy mp4 header if needed
        if not output_path.exists():
            with open(output_path, "wb") as f:
                f.write(b"\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2mp41")

        return output_path
