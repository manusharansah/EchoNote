"""
Step 4b — Summarisation
Takes raw transcript → sends to local Ollama LLM with a structured prompt
→ returns structured minutes as a markdown string with fixed section headers.
Uses /api/chat endpoint (compatible with all recent Ollama versions).
"""

import httpx
from app.config import get_settings

settings = get_settings()

OLLAMA_TIMEOUT = 300.0  # 5 minutes — large transcripts need time

SYSTEM_PROMPT = """You are a professional meeting minutes writer.
Your job is to read a meeting transcript and produce clean, structured meeting minutes.
You MUST respond using ONLY the exact markdown structure below — no extra commentary, no preamble.
Every section heading must appear exactly as written, even if the section is empty.

## Summary
(2-4 sentence overview of what the meeting was about and what was accomplished)

## Attendees
(List each identified attendee on a new line starting with - )

## Agenda Items
(List each agenda item discussed on a new line starting with - )

## Key Decisions
(List each decision made on a new line starting with - )

## Action Items
(List each action item in this exact format, one per line:
- [Owner Name]: task description (Due: date or "TBD"))

## Next Steps
(List each next step on a new line starting with - )
"""


def summarise_transcript(transcript: str) -> str:
    """
    Main entry point for Step 4b.
    Sends transcript to Ollama and returns structured markdown minutes.
    Raises RuntimeError on failure.
    """
    if not transcript or not transcript.strip():
        raise RuntimeError("Cannot summarise empty transcript")

    print(f"[summarise] Sending transcript ({len(transcript)} chars) to Ollama model: {settings.ollama_model}")

    # Try /api/chat first (newer Ollama), fall back to /api/generate
    try:
        return _call_chat(transcript)
    except Exception as e:
        if "404" in str(e):
            print(f"[summarise] /api/chat not found, trying /api/generate...")
            return _call_generate(transcript)
        raise


def _call_chat(transcript: str) -> str:
    """Use Ollama /api/chat endpoint (Ollama >= 0.1.14)."""
    response = httpx.post(
        f"{settings.ollama_base_url}/api/chat",
        json={
            "model": settings.ollama_model,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_predict": 2048,
            },
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Here is the meeting transcript:\n\n{transcript}\n\nPlease write the meeting minutes.",
                },
            ],
        },
        timeout=OLLAMA_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    markdown = data.get("message", {}).get("content", "").strip()
    if not markdown:
        raise RuntimeError("Ollama /api/chat returned empty content")
    print(f"[summarise] Received {len(markdown)} chars from Ollama")
    return markdown


def _call_generate(transcript: str) -> str:
    """Fallback: use Ollama /api/generate endpoint (older Ollama versions)."""
    prompt = f"Here is the meeting transcript:\n\n{transcript}\n\nPlease write the meeting minutes."
    response = httpx.post(
        f"{settings.ollama_base_url}/api/generate",
        json={
            "model": settings.ollama_model,
            "prompt": prompt,
            "system": SYSTEM_PROMPT,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_predict": 2048,
            },
        },
        timeout=OLLAMA_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    markdown = data.get("response", "").strip()
    if not markdown:
        raise RuntimeError("Ollama /api/generate returned empty response")
    print(f"[summarise] Received {len(markdown)} chars from Ollama")
    return markdown