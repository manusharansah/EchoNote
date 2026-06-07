"""
Step 4a — Transcription
Takes audio file path → calls OpenAI Whisper API → returns raw transcript string.
Handles files >25MB by splitting into chunks using ffmpeg directly (no pydub).
Compatible with Python 3.13+.
"""

import os
import math
import subprocess
import tempfile
from pathlib import Path

from openai import OpenAI
from app.config import get_settings

settings = get_settings()

WHISPER_MAX_BYTES = 24 * 1024 * 1024  # 24MB — safely under Whisper's 25MB limit
MAX_RETRIES = 3
CHUNK_MINUTES = 10  # split into 10-minute chunks


def transcribe_audio(audio_path: str) -> str:
    """
    Main entry point for Step 4a.
    Returns the full transcript as a plain string.
    Raises RuntimeError on failure after retries.
    """
    client = OpenAI(api_key=settings.openai_api_key)
    file_size = os.path.getsize(audio_path)

    print(f"[transcribe] File size: {file_size / (1024*1024):.1f} MB")

    if file_size <= WHISPER_MAX_BYTES:
        return _transcribe_single(client, audio_path)
    else:
        print(f"[transcribe] File exceeds 24MB — chunking with ffmpeg")
        return _transcribe_chunked(client, audio_path)


def _transcribe_single(client: OpenAI, audio_path: str) -> str:
    """Transcribe a single file that fits within Whisper's size limit."""
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with open(audio_path, "rb") as f:
                response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f,
                    response_format="text",
                )
            return str(response).strip()
        except Exception as e:
            last_error = e
            print(f"[transcribe] Attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                import time
                time.sleep(2 ** attempt)
    raise RuntimeError(
        f"Whisper transcription failed after {MAX_RETRIES} attempts: {last_error}"
    )


def _transcribe_chunked(client: OpenAI, audio_path: str) -> str:
    """
    Get audio duration via ffprobe, split into chunks via ffmpeg,
    transcribe each chunk, join results.
    """
    _check_ffmpeg()

    duration_seconds = _get_duration(audio_path)
    chunk_seconds = CHUNK_MINUTES * 60
    total_chunks = math.ceil(duration_seconds / chunk_seconds)

    print(f"[transcribe] Audio duration: {duration_seconds:.0f}s — splitting into {total_chunks} chunks")

    transcripts = []
    with tempfile.TemporaryDirectory() as tmpdir:
        for i in range(total_chunks):
            start = i * chunk_seconds
            chunk_path = os.path.join(tmpdir, f"chunk_{i}.mp3")

            # ffmpeg: extract chunk starting at `start` for `chunk_seconds` duration
            cmd = [
                "ffmpeg", "-y",
                "-ss", str(start),
                "-i", audio_path,
                "-t", str(chunk_seconds),
                "-vn",                   # no video
                "-acodec", "libmp3lame",
                "-q:a", "4",             # quality level
                chunk_path,
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise RuntimeError(f"ffmpeg chunk {i} failed: {result.stderr[-500:]}")

            print(f"[transcribe] Transcribing chunk {i + 1}/{total_chunks}...")
            chunk_transcript = _transcribe_single(client, chunk_path)
            transcripts.append(chunk_transcript)

    return "\n".join(transcripts)


def _get_duration(audio_path: str) -> float:
    """Use ffprobe to get audio duration in seconds."""
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        audio_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")
    try:
        return float(result.stdout.strip())
    except ValueError:
        raise RuntimeError(f"Could not parse duration from ffprobe: {result.stdout}")


def _check_ffmpeg():
    """Verify ffmpeg is available on the system."""
    result = subprocess.run(["ffmpeg", "-version"], capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(
            "ffmpeg is not installed or not in PATH. "
            "Install it with: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)"
        )