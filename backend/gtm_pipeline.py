"""
AutoForge Multimodal GTM Video & Audio Pipeline
ElevenLabs Voiceover with SHA-256 Disk Caching, Pillow 1080p Canvas, and FFmpeg Compositing
"""

import os
import wave
import math
import struct
import hashlib
import shutil
import subprocess
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from PIL import Image, ImageDraw, ImageFont

try:
    import imageio_ffmpeg
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_PATH = shutil.which("ffmpeg") or "ffmpeg"

class GTMPipeline:
    ARTIFACT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")
    CACHE_DIR = os.path.join(ARTIFACT_DIR, "cache")

    @classmethod
    def setup_directories(cls):
        os.makedirs(cls.ARTIFACT_DIR, exist_ok=True)
        os.makedirs(cls.CACHE_DIR, exist_ok=True)

    @classmethod
    def _generate_synthetic_narration_audio(cls, output_wav_path: str, duration_sec: float = 6.0):
        """Generates a clean synthetic PCM audio file with gentle voice-frequency modulation."""
        sample_rate = 44100
        total_samples = int(sample_rate * duration_sec)
        
        with wave.open(output_wav_path, 'wb') as wav:
            wav.setnchannels(1) # mono
            wav.setsampwidth(2) # 16-bit
            wav.setframerate(sample_rate)

            raw_bytes = bytearray()
            # Voice fundamentals (around 220Hz - 440Hz harmonic mixture)
            for i in range(total_samples):
                t = float(i) / sample_rate
                # Harmonic cadence representing vocalized technical pitch
                f1 = 220.0 + 35.0 * math.sin(2.0 * math.pi * 1.5 * t)
                f2 = 440.0 + 20.0 * math.sin(2.0 * math.pi * 2.2 * t)
                envelope = min(1.0, t * 4.0) * min(1.0, (duration_sec - t) * 4.0)
                sample_val = 0.5 * math.sin(2.0 * math.pi * f1 * t) + 0.3 * math.sin(2.0 * math.pi * f2 * t)
                final_val = int(sample_val * envelope * 12000.0)
                raw_bytes.extend(struct.pack('<h', max(-32767, min(32767, final_val))))
            
            wav.writeframes(raw_bytes)

    @classmethod
    async def synthesize_voiceover(cls, script: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> Dict[str, Any]:
        """
        Synthesizes script with ElevenLabs API, guarded by SHA-256 disk caching.
        Falls back cleanly to local audio generation if API key is not present.
        """
        cls.setup_directories()
        script_hash = hashlib.sha256(script.strip().encode('utf-8')).hexdigest()
        cache_filename = f"voiceover_{script_hash[:16]}.wav"
        cached_path = os.path.join(cls.CACHE_DIR, cache_filename)
        public_audio_path = os.path.join(cls.ARTIFACT_DIR, "latest_gtm_audio.wav")

        if os.path.exists(cached_path):
            shutil.copyfile(cached_path, public_audio_path)
            return {
                "source": "DISK_CACHE_HIT",
                "sha256": script_hash,
                "cached": True,
                "audio_path": public_audio_path,
                "script": script
            }

        api_key = os.environ.get("ELEVENLABS_API_KEY")
        if api_key:
            try:
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                headers = {
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg"
                }
                body = {
                    "text": script,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
                }
                async with httpx.AsyncClient() as client:
                    resp = await client.post(url, json=body, headers=headers, timeout=20.0)
                    if resp.status_code == 200:
                        mp3_cache = os.path.join(cls.CACHE_DIR, f"voiceover_{script_hash[:16]}.mp3")
                        with open(mp3_cache, "wb") as f:
                            f.write(resp.content)
                        shutil.copyfile(mp3_cache, os.path.join(cls.ARTIFACT_DIR, "latest_gtm_audio.mp3"))
                        return {
                            "source": "ELEVENLABS_LIVE_API",
                            "sha256": script_hash,
                            "cached": False,
                            "audio_path": os.path.join(cls.ARTIFACT_DIR, "latest_gtm_audio.mp3"),
                            "script": script
                        }
            except Exception as e:
                pass # Fall back to synthetic audio

        # Synthesize fallback voice narration
        cls._generate_synthetic_narration_audio(cached_path, duration_sec=5.0)
        shutil.copyfile(cached_path, public_audio_path)

        return {
            "source": "SYNTHETIC_OFFLINE_AUDIO",
            "sha256": script_hash,
            "cached": False,
            "audio_path": public_audio_path,
            "script": script
        }

    @classmethod
    def render_1080p_frames(cls, title: str, headline: str, frame_count: int = 15) -> List[str]:
        """Renders 1080p (1920x1080) high-fidelity frames with animated camera zoom & telemetry."""
        cls.setup_directories()
        frames_dir = os.path.join(cls.ARTIFACT_DIR, "frames")
        os.makedirs(frames_dir, exist_ok=True)
        frame_paths = []

        width, height = 1920, 1080

        for frame_idx in range(frame_count):
            progress = frame_idx / max(1, frame_count - 1)
            # Create dark luxury canvas
            img = Image.new("RGB", (width, height), color=(10, 13, 20))
            draw = ImageDraw.Draw(img)

            # Draw background grid & glowing accents
            for x in range(0, width, 60):
                draw.line([(x, 0), (x, height)], fill=(23, 28, 43), width=1)
            for y in range(0, height, 60):
                draw.line([(0, y), (width, y)], fill=(23, 28, 43), width=1)

            # Center Card with zoom simulation
            zoom = 1.0 + progress * 0.08
            card_w = int(1400 * zoom)
            card_h = int(720 * zoom)
            card_x1 = (width - card_w) // 2
            card_y1 = (height - card_h) // 2
            card_x2 = card_x1 + card_w
            card_y2 = card_y1 + card_h

            # Draw card surface
            draw.rounded_rectangle([card_x1, card_y1, card_x2, card_y2], radius=24, fill=(17, 21, 32), outline=(59, 130, 246), width=3)

            # Header Top Bar
            draw.rectangle([card_x1, card_y1, card_x2, card_y1 + 80], fill=(23, 28, 43))
            draw.ellipse([card_x1 + 30, card_y1 + 30, card_x1 + 50, card_y1 + 50], fill=(244, 63, 94))
            draw.ellipse([card_x1 + 65, card_y1 + 30, card_x1 + 85, card_y1 + 50], fill=(245, 158, 11))
            draw.ellipse([card_x1 + 100, card_y1 + 30, card_x1 + 120, card_y1 + 50], fill=(16, 185, 129))

            # Title & Telemetry text
            draw.text((card_x1 + 150, card_y1 + 25), "AUTOFORGE 1080p MULTIMODAL COMPOSITOR", fill=(142, 155, 181))
            draw.text((card_x1 + 80, card_y1 + 140), title.upper(), fill=(241, 245, 249))
            draw.text((card_x1 + 80, card_y1 + 220), headline, fill=(96, 165, 250))

            # Visualized Telemetry Badges
            badge_y = card_y1 + 320
            badges = [
                ("CDP AXTree Attach", "100% Attached", (16, 185, 129)),
                ("Anti-Boilerplate Council", "7 Critics Active", (59, 130, 246)),
                ("Outcome Verifier", "Physical Disk Parity", (139, 92, 246)),
                ("ArmorIQ Gate", "Fail-Closed Active", (245, 158, 11))
            ]

            for b_idx, (b_title, b_val, color) in enumerate(badges):
                bx = card_x1 + 80 + b_idx * 310
                draw.rounded_rectangle([bx, badge_y, bx + 280, badge_y + 110], radius=12, fill=(23, 28, 43), outline=color, width=2)
                draw.text((bx + 20, badge_y + 20), b_title, fill=(142, 155, 181))
                draw.text((bx + 20, badge_y + 55), b_val, fill=color)

            # Animated Audio Waveform Spectrum at bottom
            for bar_i in range(40):
                bx = card_x1 + 80 + bar_i * 30
                bar_h = int(12 + 50 * abs(math.sin(progress * 8.0 + bar_i * 0.4)))
                y_top = card_y2 - 70 - bar_h
                y_bottom = card_y2 - 70
                draw.rectangle([bx, y_top, bx + 16, y_bottom], fill=(59, 130, 246))

            frame_file = os.path.join(frames_dir, f"frame_{frame_idx:04d}.png")
            img.save(frame_file, format="PNG")
            frame_paths.append(frame_file)

        return frame_paths

    @classmethod
    async def composite_gtm_video(
        cls,
        title: str = "AutoForge Launch Campaign",
        headline: str = "Eliminate Boilerplate with AI-Native Chromium Automation",
        script: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Runs full multimodal pipeline:
        1. ElevenLabs voiceover synthesis with SHA-256 caching
        2. 1080p Pillow frame generation
        3. Subprocess FFmpeg rendering of 1080p MP4
        """
        cls.setup_directories()
        video_script = script or (
            f"Introducing AutoForge. {headline}. "
            "Powered by native CDP accessibility trees, a seven agent anti boilerplate council, "
            "and independent outcome verification."
        )

        # 1. Synthesize Audio
        audio_info = await cls.synthesize_voiceover(video_script)
        audio_path = audio_info["audio_path"]

        # 2. Render Frames
        frame_paths = cls.render_1080p_frames(title, headline, frame_count=30)
        frames_pattern = os.path.join(cls.ARTIFACT_DIR, "frames", "frame_%04d.png")
        output_video_path = os.path.join(cls.ARTIFACT_DIR, "autoforge_gtm_1080p.mp4")

        # 3. Composite Video via FFmpeg
        cmd = [
            FFMPEG_PATH,
            "-y",
            "-framerate", "10",
            "-i", frames_pattern,
            "-i", audio_path,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            output_video_path
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        video_exists = os.path.exists(output_video_path) and os.path.getsize(output_video_path) > 0

        return {
            "success": video_exists,
            "video_path": output_video_path if video_exists else None,
            "audio_path": audio_path,
            "audio_source": audio_info["source"],
            "sha256": audio_info["sha256"],
            "resolution": "1920x1080",
            "title": title,
            "headline": headline,
            "script": video_script,
            "returncode": process.returncode
        }
