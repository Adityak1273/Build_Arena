import pytest
from httpx import AsyncClient, ASGITransport
from backend.app import app

@pytest.mark.asyncio
async def test_browser_preview_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Request hacker news or mock preview
        resp = await client.get("/api/browser/preview?url=https://news.ycombinator.com")
        assert resp.status_code == 200
        assert "X-Frame-Options" in resp.headers
        assert resp.headers["X-Frame-Options"] == "ALLOWALL"
        assert resp.headers.get("Content-Security-Policy") == "frame-ancestors *;"

@pytest.mark.asyncio
async def test_browser_preview_ax_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/browser/preview/ax?url=https://news.ycombinator.com")
        assert resp.status_code == 200
        data = resp.json()
        assert "nodes" in data
        assert data["mode"] == "HTML_PARSER_PREVIEW"
        assert isinstance(data["nodes"], list)
