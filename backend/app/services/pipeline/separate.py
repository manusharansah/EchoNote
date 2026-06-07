"""
Step 4c — Content Separation
Takes the structured markdown string from Step 4b → parses and separates
into a Python dict with named sections.
Robust parsing — LLM output won't always be perfect, so we never crash.
"""

import re
from typing import TypedDict


class ActionItem(TypedDict):
    owner: str
    task: str
    due: str


class SeparatedContent(TypedDict):
    summary: str
    attendees: list[str]
    agenda_items: list[str]
    key_decisions: list[str]
    action_items: list[ActionItem]
    next_steps: list[str]


# Maps section heading → dict key
SECTION_MAP = {
    "summary": "summary",
    "attendees": "attendees",
    "agenda items": "agenda_items",
    "key decisions": "key_decisions",
    "action items": "action_items",
    "next steps": "next_steps",
}


def separate_content(markdown: str) -> SeparatedContent:
    """
    Main entry point for Step 4c.
    Parses markdown into a structured dict.
    Never raises — returns empty values for missing sections.
    """
    raw_sections = _split_sections(markdown)

    result: SeparatedContent = {
        "summary": "",
        "attendees": [],
        "agenda_items": [],
        "key_decisions": [],
        "action_items": [],
        "next_steps": [],
    }

    for heading, content in raw_sections.items():
        key = _match_heading(heading)
        if key is None:
            continue

        if key == "summary":
            result["summary"] = content.strip()
        elif key == "action_items":
            result["action_items"] = _parse_action_items(content)
        else:
            result[key] = _parse_bullet_list(content)

    print(f"[separate] Parsed sections: "
          f"summary={'yes' if result['summary'] else 'empty'}, "
          f"attendees={len(result['attendees'])}, "
          f"agenda_items={len(result['agenda_items'])}, "
          f"key_decisions={len(result['key_decisions'])}, "
          f"action_items={len(result['action_items'])}, "
          f"next_steps={len(result['next_steps'])}")

    return result


def _split_sections(markdown: str) -> dict[str, str]:
    """
    Split markdown on ## headings.
    Returns dict of {heading_text_lowercase: section_content}.
    """
    # Match ## Heading lines
    pattern = re.compile(r"^##\s+(.+)$", re.MULTILINE)
    matches = list(pattern.finditer(markdown))

    if not matches:
        # Fallback: treat entire content as summary
        return {"summary": markdown}

    sections = {}
    for i, match in enumerate(matches):
        heading = match.group(1).strip().lower()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(markdown)
        content = markdown[start:end].strip()
        sections[heading] = content

    return sections


def _match_heading(heading: str) -> str | None:
    """Fuzzy match a heading string to a known section key."""
    heading = heading.lower().strip()
    # Direct match
    if heading in SECTION_MAP:
        return SECTION_MAP[heading]
    # Partial match — handles slight LLM variations
    for key, value in SECTION_MAP.items():
        if key in heading or heading in key:
            return value
    return None


def _parse_bullet_list(content: str) -> list[str]:
    """
    Parse a markdown bullet list into a Python list of strings.
    Handles - , * , and numbered lists (1. 2. 3.).
    Skips empty lines and placeholder text.
    """
    items = []
    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        # Strip bullet markers
        line = re.sub(r"^[-*•]\s+", "", line)
        line = re.sub(r"^\d+\.\s+", "", line)
        line = line.strip()
        # Skip placeholder text like "(none)" or "(N/A)"
        if line and not re.match(r"^\(.*\)$", line):
            items.append(line)
    return items


def _parse_action_items(content: str) -> list[ActionItem]:
    """
    Parse action items in format:
    - [Owner Name]: task description (Due: date)
    Falls back to generic parsing if format doesn't match.
    """
    items = []
    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        # Strip bullet marker
        line = re.sub(r"^[-*•]\s+", "", line).strip()
        if not line or re.match(r"^\(.*\)$", line):
            continue

        # Try to match [Owner]: task (Due: date)
        pattern = re.compile(
            r"^\[?([^\]:]+)\]?:\s*(.+?)(?:\s*\(Due:\s*([^)]+)\))?$",
            re.IGNORECASE,
        )
        match = pattern.match(line)
        if match:
            owner = match.group(1).strip()
            task = match.group(2).strip()
            due = match.group(3).strip() if match.group(3) else "TBD"
        else:
            # Fallback — treat whole line as task, owner unknown
            owner = "TBD"
            task = line
            due = "TBD"

        items.append(ActionItem(owner=owner, task=task, due=due))

    return items