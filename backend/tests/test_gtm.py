import pytest
import os
from gtm_pipeline import GTMPipeline

@pytest.mark.asyncio
async def test_gtm_audio_synthesis_tone_fallback():
    # Without ELEVENLABS_API_KEY in env, should return honest synthetic tone placeholder
    res = await GTMPipeline.synthesize_voiceover("Test AutoForge script")
    assert res["source"] in ("SYNTHETIC_TONE_PLACEHOLDER", "DISK_CACHE_HIT")
    assert os.path.exists(res["audio_path"])
    assert len(res["sha256"]) == 64

def test_gtm_frame_rendering():
    frames = GTMPipeline.render_1080p_frames(
        title="Test Campaign",
        headline="AI-Native Browser Engine",
        audio_source="SYNTHETIC_TONE_PLACEHOLDER",
        frame_count=3
    )
    assert len(frames) == 3
    for f in frames:
        assert os.path.exists(f)
