import os
import pytest
import asyncio
from verifier import (
    HTMLMetadataParser,
    LiveWebpageExtractor,
    OutcomeVerifier,
    STARTUP_CRAWL_TARGETS
)

def test_html_metadata_parser():
    html = """
    <!DOCTYPE html>
    <html>
      <head>
        <title>   AutoForge Frontier Systems  </title>
        <meta name="description" content="AI-native browser infrastructure and verification.">
      </head>
      <body><h1>Content</h1></body>
    </html>
    """
    parser = HTMLMetadataParser()
    parser.feed(html)
    assert parser.title == "AutoForge Frontier Systems"
    assert parser.description == "AI-native browser infrastructure and verification."

@pytest.mark.asyncio
async def test_live_webpage_extractor_offline_error():
    import httpx
    async with httpx.AsyncClient(verify=True, timeout=1.5) as client:
        res = await LiveWebpageExtractor.extract_metadata(client, "http://unreachable-test-node-1.invalid")
        # Ensure failure is honestly reported, not filled with fake fallback text
        assert res["fetch_status"] in ("CONNECT_ERROR", "FETCH_FAILED")
        assert res["title"] == "NOT_EXTRACTED"
        assert res["description"] == "NOT_EXTRACTED"
        assert res["error"] is not None

@pytest.mark.asyncio
async def test_verifier_benchmark_roundtrip():
    outcome = await OutcomeVerifier.run_benchmark("LIVE_SCRAPED")
    assert outcome.disk_integrity_verified is True
    assert outcome.status == "VERIFIED_DISK_SYNC"
    assert len(outcome.rows) == len(STARTUP_CRAWL_TARGETS)
    assert os.path.exists(outcome.artifact_path)
    assert len(outcome.disk_hash) == 64 # SHA-256

    # Verify every row has provenance
    for row in outcome.rows:
        assert "retrieval_timestamp" in row
        assert "fetch_status" in row
        assert "data_provenance" in row
        assert row["data_provenance"] in ("LIVE_HTML_CRAWL", "CONFIGURED_TARGET_UNREACHED")

@pytest.mark.asyncio
async def test_verifier_fault_injection_offline():
    outcome = await OutcomeVerifier.run_benchmark("OFFLINE_HOST_FAILURE")
    assert outcome.status == "FAILED_UNREACHABLE_HOSTS"
    assert outcome.disk_integrity_verified is False
    assert outcome.failed_fetches > 0
    assert "FAILED_UNREACHABLE_HOSTS" in outcome.error_message

@pytest.mark.asyncio
async def test_verifier_fault_injection_corruption():
    outcome = await OutcomeVerifier.run_benchmark("CORRUPTION_DETECTION")
    assert outcome.status == "FAILED_CORRUPTION_DETECTED"
    assert outcome.disk_integrity_verified is False
    assert "FAILED_CORRUPTION_DETECTED" in outcome.error_message

def test_verifier_cached_snapshot():
    cached = OutcomeVerifier.get_latest_cached_outcome()
    assert cached is not None
    assert cached.status == "CACHED_SNAPSHOT"
    assert cached.is_cached_snapshot is True
    assert cached.disk_integrity_verified is True
    assert cached.source_data_verified is False
