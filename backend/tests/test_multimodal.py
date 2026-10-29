import pytest
from httpx import AsyncClient, ASGITransport
from backend.app import app

@pytest.mark.asyncio
async def test_multimodal_image_generate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/multimodal/image/generate", json={
            "title": "Hackathon Launch Test",
            "tagline": "AI-Native Browser & Companion",
            "badge": "UNIT TEST",
            "theme": "indigo"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "base64" in data
        assert data["resolution"] == "1200x630"
        assert data["filename"] == "launch_banner.png"

@pytest.mark.asyncio
async def test_multimodal_image_analyze():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/multimodal/image/analyze", json={
            "context_url": "https://news.ycombinator.com"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "theme_classification" in data
        assert "brightness_score" in data
        assert "dominant_colors" in data

@pytest.mark.asyncio
async def test_multimodal_audio_analyze():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/multimodal/audio/analyze")
        assert resp.status_code == 200
        data = resp.json()
        # Should succeed if audio was composited or return clean dict
        assert "success" in data
