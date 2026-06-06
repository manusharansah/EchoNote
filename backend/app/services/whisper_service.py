import os
from app.core.config import settings


def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe an audio file and return the full transcript as a string.
    Raises on failure — the pipeline will catch and set status=FAILED.
    """
    if settings.WHISPER_MODE == "local":
        return _transcribe_local(audio_path)
    return _transcribe_via_api(audio_path)


# ── Option 1: OpenAI Whisper API (your existing SajiloSewa approach) ──────────
# Requires: pip install openai
# Set OPENAI_API_KEY and WHISPER_MODE=api in .env

def _transcribe_via_api(audio_path: str) -> str:
    """
    Transcribe using OpenAI Whisper API.
    Mirrors the logic in SajiloSewa's RAGService.upload_voice_transcription():

        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        return transcription.text

    Supports all formats MediaRecorder produces: webm, mp4, ogg, wav, mp3.
    Max file size: 25 MB (OpenAI limit). For longer meetings you may need to
    split the audio — see _split_audio_if_needed() below.
    """
    try:
        from openai import OpenAI  # type: ignore
    except ImportError:
        raise RuntimeError(
            "openai package not installed. Run: pip install openai"
        )

    if not settings.OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set in .env — required for WHISPER_MODE=api"
        )

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    # Check file size — OpenAI Whisper API limit is 25 MB
    file_size_mb = os.path.getsize(audio_path) / (1024 * 1024)

    if file_size_mb > 24:
        # For long recordings (>~30 min), split and join transcripts
        return _transcribe_large_file(client, audio_path)

    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text",
        )

    # OpenAI SDK returns a plain string when response_format="text"
    return str(transcription).strip()


def _transcribe_large_file(client, audio_path: str) -> str:
    """
    Split audio into ~20 MB chunks and transcribe each segment.
    Joins all transcripts in order.

    Requires: pip install pydub
    ffmpeg must be installed on the system (brew install ffmpeg / apt install ffmpeg).
    """
    try:
        from pydub import AudioSegment  # type: ignore
    except ImportError:
        raise RuntimeError(
            "pydub not installed — needed for files >24 MB. "
            "Run: pip install pydub  (and install ffmpeg on your system)"
        )

    import tempfile

    audio = AudioSegment.from_file(audio_path)

    # 20-minute chunks (safe for the 25 MB API limit at typical bitrates)
    chunk_ms = 20 * 60 * 1000
    chunks = [audio[i : i + chunk_ms] for i in range(0, len(audio), chunk_ms)]

    transcripts = []
    for idx, chunk in enumerate(chunks):
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            chunk.export(tmp.name, format="mp3")
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as f:
                result = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f,
                    response_format="text",
                )
            transcripts.append(str(result).strip())
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    return " ".join(transcripts)


# ── Option 2: Local Whisper model (no API key needed) ─────────────────────────
# Requires: pip install openai-whisper torch
# First run downloads model weights (~150 MB for "tiny", ~1.5 GB for "base")

def _transcribe_local(audio_path: str) -> str:
    """
    Run Whisper locally using the openai-whisper library.
    Slower but free — useful if you don't want to use the API.

    Model size tradeoff:
      tiny   → fastest, least accurate (~150 MB)
      base   → good balance (~140 MB + 75 MB)
      small  → better accuracy (~460 MB)
      medium → best for Nepali/multilingual (~1.5 GB)
    """
    try:
        import whisper  # type: ignore
    except ImportError:
        raise RuntimeError(
            "openai-whisper not installed. Run: pip install openai-whisper"
        )

    model_name = getattr(settings, "WHISPER_LOCAL_MODEL", "base")
    model = whisper.load_model(model_name)

    # fp16=False avoids warnings on CPU-only machines
    result = model.transcribe(audio_path, fp16=False)
    return result["text"].strip()