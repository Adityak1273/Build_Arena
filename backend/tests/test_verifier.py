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
    import tempfile
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_csv = os.path.join(tmp_dir, "test_startups.csv")
        outcome = await OutcomeVerifier.run_benchmark("LIVE_SCRAPED", output_csv_path=tmp_csv)
        assert outcome.disk_integrity_verified is True
        assert outcome.status == "VERIFIED_DISK_SYNC"
        assert len(outcome.rows) == len(STARTUP_CRAWL_TARGETS)
        assert os.path.exists(tmp_csv)
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

@pytest.mark.asyncio
async def test_verifier_corruption_detection_preserves_canonical_csv():
    """
    P1 Regression Test: Proves that running CORRUPTION_DETECTION fault-injection
    operates entirely against an isolated temporary directory and leaves both
    the canonical CSV artifact and manifest.json 100% byte-for-byte unchanged.
    """
    canonical_csv = OutcomeVerifier.get_csv_path()
    manifest_path = OutcomeVerifier.get_manifest_path()
    assert os.path.exists(canonical_csv), "Canonical CSV artifact must exist"
    assert os.path.exists(manifest_path), "Canonical manifest must exist"

    # Capture complete pre-test bytes
    pre_csv_bytes = open(canonical_csv, "rb").read()
    pre_manifest_bytes = open(manifest_path, "rb").read()

    assert b"InjectedRogueCorp" not in pre_csv_bytes, "Pre-condition violated: canonical file already has rogue corp"

    # Run corruption fault injection
    outcome = await OutcomeVerifier.run_benchmark("CORRUPTION_DETECTION")
    assert outcome.status == "FAILED_CORRUPTION_DETECTED"
    assert outcome.disk_integrity_verified is False

    # Capture post-test bytes
    post_csv_bytes = open(canonical_csv, "rb").read()
    post_manifest_bytes = open(manifest_path, "rb").read()

    # Exact byte-for-byte preservation assertion
    assert pre_csv_bytes == post_csv_bytes, "Regression! Canonical CSV bytes were mutated during CORRUPTION_DETECTION!"
    assert pre_manifest_bytes == post_manifest_bytes, "Regression! Canonical manifest.json bytes were mutated during CORRUPTION_DETECTION!"
    assert b"InjectedRogueCorp" not in post_csv_bytes

    # Verify exactly 10 genuine records + 1 header
    lines = post_csv_bytes.decode("utf-8").strip().splitlines()
    assert len(lines) == 11, f"Expected 1 header + 10 startup rows, got {len(lines)}"

    # Check manifest integrity
    import json, hashlib
    manifest_obj = json.loads(post_manifest_bytes.decode("utf-8"))
    assert manifest_obj["csv_sha256"] == hashlib.sha256(post_csv_bytes).hexdigest()

def test_verifier_cached_snapshot():
    cached = OutcomeVerifier.get_latest_cached_outcome()
    assert cached is not None
    assert cached.status == "CACHED_SNAPSHOT"
    assert cached.is_cached_snapshot is True
    assert cached.disk_integrity_verified is True
    assert cached.source_data_verified is False

def test_verifier_cached_snapshot_manifest_validation():
    """
    P0 Integrity Test: Ensures disk_integrity_verified requires matching
    trusted baseline manifest.json rather than blindly trusting disk bytes.
    """
    # 1. Normal validation succeeds when manifest matches
    cached = OutcomeVerifier.get_latest_cached_outcome()
    assert cached is not None
    assert cached.disk_integrity_verified is True

    # 2. When manifest does not match or is absent, disk_integrity_verified is False
    manifest_path = OutcomeVerifier.get_manifest_path()
    assert os.path.exists(manifest_path)

    with open(manifest_path, "r", encoding="utf-8") as f:
        orig_manifest = f.read()

    try:
        # Write corrupted manifest hash
        with open(manifest_path, "w", encoding="utf-8") as f:
            f.write('{"csv_sha256": "bad_hash_00000000000000000000000000000000000000000000000000000000"}')

        tampered_cached = OutcomeVerifier.get_latest_cached_outcome()
        assert tampered_cached is not None
        assert tampered_cached.disk_integrity_verified is False
    finally:
        # Restore valid manifest
        with open(manifest_path, "w", encoding="utf-8") as f:
            f.write(orig_manifest)
