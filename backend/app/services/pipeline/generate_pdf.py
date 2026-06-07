"""
Step 4d — PDF Generation
Takes the separated sections dict from Step 4c → builds a minimalist,
professionally formatted PDF using ReportLab → saves to disk → returns pdf_path.

Layout:
  • Centred title block  (MEETING MINUTES label · title · date)
  • Thick rule separator
  • Sections in reading order:
      Attendees  →  Summary  →  Main Points Discussed  →
      Key Decisions  →  Action Items  →  Conclusion & Next Steps
  • Hairline rule under each section label
  • Centred page number footer
"""

import os
import re
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ── Palette (monochrome / minimalist) ─────────────────────
INK       = colors.HexColor("#111827")   # near-black — headings & body
INK_LIGHT = colors.HexColor("#6B7280")   # muted — labels, meta, due dates
RULE      = colors.HexColor("#E5E7EB")   # light hairline dividers
ACCENT    = colors.HexColor("#F3F4F6")   # very light grey — attendee chips bg


# ── Public entry points ───────────────────────────────────

def generate_pdf(meeting_id: int, title: str, sections: dict, storage_dir: str) -> str:
    """Main entry point. Returns path to the generated PDF."""
    os.makedirs(storage_dir, exist_ok=True)
    pdf_path = os.path.join(storage_dir, f"{meeting_id}.pdf")
    _build_pdf(pdf_path, title, sections)
    print(f"[generate_pdf] PDF saved → {pdf_path}")
    return pdf_path


def generate_version_pdf(
    meeting_id: int,
    version_number: int,
    title: str,
    sections: dict,
    storage_dir: str,
) -> str:
    """Generate a versioned PDF for a saved edit."""
    os.makedirs(storage_dir, exist_ok=True)
    pdf_path = os.path.join(storage_dir, f"{meeting_id}_v{version_number}.pdf")
    _build_pdf(pdf_path, title, sections)
    print(f"[generate_pdf] Version PDF saved → {pdf_path}")
    return pdf_path


# ── Core builder ─────────────────────────────────────────

def _build_pdf(pdf_path: str, title: str, sections: dict) -> None:
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=2.8 * cm,
        rightMargin=2.8 * cm,
        topMargin=3.0 * cm,
        bottomMargin=2.5 * cm,
    )

    S = _build_styles()
    story: list = []

    # ── Title block ──────────────────────────────────────────
    now = datetime.now().strftime("%B %d, %Y")
    story += [
        Spacer(1, 0.5 * cm),
        Paragraph("MEETING MINUTES", S["meeting_label"]),
        Spacer(1, 0.15 * cm),
        Paragraph(title, S["title"]),
        Spacer(1, 0.2 * cm),
        Paragraph(now, S["meta"]),
        Spacer(1, 0.6 * cm),
        HRFlowable(width="100%", thickness=1.5, color=INK, spaceAfter=0),
        Spacer(1, 0.4 * cm),
    ]

    # ── Attendees ────────────────────────────────────────────
    attendees = sections.get("attendees") or []
    if attendees:
        story.append(_section_label("Attendees", S))
        story.append(Spacer(1, 0.1 * cm))
        # Each attendee on a left-aligned line with a subtle bullet
        for name in attendees:
            story.append(Paragraph(f"<font color='#6B7280'>●</font>  {name}", S["attendee"]))
        story.append(Spacer(1, 0.3 * cm))

    # ── Summary ──────────────────────────────────────────────
    summary_text = sections.get("summary") or ""
    if summary_text:
        story.append(_section_label("Summary", S))
        story.append(Spacer(1, 0.1 * cm))
        # Split on double-newlines or single newlines to preserve paragraph breaks
        for para in _split_paragraphs(summary_text):
            story.append(Paragraph(para, S["body"]))
        story.append(Spacer(1, 0.25 * cm))

    # ── Main Points Discussed ─────────────────────────────────
    agenda = sections.get("agenda_items") or []
    if agenda:
        story.append(_section_label("Main Points Discussed", S))
        story.append(Spacer(1, 0.1 * cm))
        for i, item in enumerate(agenda, 1):
            # Clean leading dashes/bullets the LLM might have added
            clean = _clean_list_item(item)
            story.append(Paragraph(f"<b>{i}.</b>  {clean}", S["numbered"]))
            story.append(Spacer(1, 0.08 * cm))
        story.append(Spacer(1, 0.2 * cm))

    # ── Key Decisions ─────────────────────────────────────────
    decisions = sections.get("key_decisions") or []
    if decisions:
        story.append(_section_label("Key Decisions", S))
        story.append(Spacer(1, 0.1 * cm))
        for d in decisions:
            clean = _clean_list_item(d)
            story.append(Paragraph(f"<font color='#111827'>–</font>  {clean}", S["bullet"]))
            story.append(Spacer(1, 0.08 * cm))
        story.append(Spacer(1, 0.2 * cm))

    # ── Action Items ──────────────────────────────────────────
    actions = sections.get("action_items") or []
    if actions:
        ROW_H    = 1.0 * cm
        HEADER_H = 0.80 * cm
        LABEL_H  = 1.10 * cm
        USABLE_H = A4[1] - 5.5 * cm

        estimated_h = LABEL_H + HEADER_H + len(actions) * ROW_H

        action_block = (
            [_section_label("Action Items", S), Spacer(1, 0.1 * cm), _action_header(S)]
            + [
                _action_row(
                    item.get("owner", "TBD"),
                    item.get("task", ""),
                    item.get("due", "TBD"),
                    S,
                )
                for item in actions
            ]
            + [Spacer(1, 0.35 * cm)]
        )

        if estimated_h > USABLE_H:
            story.append(PageBreak())
            story.extend(action_block)
        else:
            story.append(KeepTogether(action_block))

    # ── Conclusion & Next Steps ───────────────────────────────
    next_steps = sections.get("next_steps") or []
    if next_steps:
        story.append(_section_label("Conclusion & Next Steps", S))
        story.append(Spacer(1, 0.1 * cm))
        for step in next_steps:
            clean = _clean_list_item(step)
            story.append(Paragraph(f"<font color='#6B7280'>→</font>  {clean}", S["bullet"]))
            story.append(Spacer(1, 0.08 * cm))

    story.append(Spacer(1, 1.5 * cm))

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)


# ── Styles ────────────────────────────────────────────────

def _build_styles() -> dict:
    return {
        "meeting_label": ParagraphStyle(
            "MeetingLabel",
            fontSize=8,
            textColor=INK_LIGHT,
            fontName="Helvetica",
            alignment=TA_CENTER,
            spaceAfter=0,
            tracking=120,   # letter-spacing via wordSpace approximation
        ),
        "title": ParagraphStyle(
            "Title",
            fontSize=24,
            textColor=INK,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            leading=30,
            spaceAfter=0,
        ),
        "meta": ParagraphStyle(
            "Meta",
            fontSize=9.5,
            textColor=INK_LIGHT,
            fontName="Helvetica",
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "section_label": ParagraphStyle(
            "SectionLabel",
            fontSize=7.5,
            textColor=INK_LIGHT,
            fontName="Helvetica-Bold",
            spaceBefore=22,
            spaceAfter=4,
            wordSpace=2,
        ),
        "body": ParagraphStyle(
            "Body",
            fontSize=10.5,
            textColor=INK,
            fontName="Helvetica",
            leading=18,         # generous line-height
            spaceAfter=10,      # clear gap between paragraphs
            alignment=TA_JUSTIFY,
        ),
        "attendee": ParagraphStyle(
            "Attendee",
            fontSize=10,
            textColor=INK,
            fontName="Helvetica",
            leading=16,
            leftIndent=6,
            spaceAfter=5,       # clear gap between each name
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            fontSize=10.5,
            textColor=INK,
            fontName="Helvetica",
            leading=17,
            leftIndent=16,
            firstLineIndent=0,
            spaceAfter=6,       # breathing room between bullet items
        ),
        "numbered": ParagraphStyle(
            "Numbered",
            fontSize=10.5,
            textColor=INK,
            fontName="Helvetica",
            leading=17,
            leftIndent=20,
            firstLineIndent=-4,
            spaceAfter=6,       # breathing room between numbered items
        ),
        "col_header": ParagraphStyle(
            "ColHeader",
            fontSize=8,
            textColor=INK_LIGHT,
            fontName="Helvetica-Bold",
            leading=12,
        ),
        "action_owner": ParagraphStyle(
            "ActionOwner",
            fontSize=9,
            textColor=INK_LIGHT,
            fontName="Helvetica-Bold",
            leading=14,
        ),
        "action_task": ParagraphStyle(
            "ActionTask",
            fontSize=10,
            textColor=INK,
            fontName="Helvetica",
            leading=15,
        ),
        "action_due": ParagraphStyle(
            "ActionDue",
            fontSize=9,
            textColor=INK_LIGHT,
            fontName="Helvetica",
            leading=14,
        ),
    }


# ── Helpers ───────────────────────────────────────────────

def _section_label(text: str, S: dict) -> KeepTogether:
    """SECTION LABEL + thin hairline rule, kept together."""
    return KeepTogether([
        Paragraph(text.upper(), S["section_label"]),
        HRFlowable(width="100%", thickness=0.5, color=RULE, spaceAfter=4),
    ])


def _split_paragraphs(text: str) -> list[str]:
    """
    Split a block of text into individual paragraphs.
    Handles double-newlines, single newlines, and plain run-on text.
    Returns a list of non-empty stripped strings.
    """
    # Normalise Windows line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Split on blank lines first
    chunks = re.split(r"\n{2,}", text)
    result = []
    for chunk in chunks:
        # Within each chunk, replace remaining newlines with a space
        clean = chunk.replace("\n", " ").strip()
        if clean:
            result.append(clean)
    return result or [text.strip()]


def _clean_list_item(text: str) -> str:
    """Strip leading bullets/dashes/numbers the LLM may have added."""
    return re.sub(r"^[\s\-–—•*·▪▸►>]+\s*|\A\d+[.)]\s*", "", text).strip()


def _col_widths() -> tuple:
    usable = A4[0] - 5.6 * cm
    owner_w = 3.2 * cm
    due_w   = 3.0 * cm
    task_w  = usable - owner_w - due_w
    return owner_w, task_w, due_w


def _action_header(S: dict) -> Table:
    ow, tw, dw = _col_widths()
    t = Table(
        [[
            Paragraph("OWNER", S["col_header"]),
            Paragraph("TASK",  S["col_header"]),
            Paragraph("DUE",   S["col_header"]),
        ]],
        colWidths=[ow, tw, dw],
    )
    t.setStyle(TableStyle([
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "BOTTOM"),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.8, INK),
    ]))
    return t


def _action_row(owner: str, task: str, due: str, S: dict) -> Table:
    ow, tw, dw = _col_widths()
    t = Table(
        [[
            Paragraph(owner or "TBD", S["action_owner"]),
            Paragraph(task  or "",    S["action_task"]),
            Paragraph(due   or "TBD", S["action_due"]),
        ]],
        colWidths=[ow, tw, dw],
    )
    t.setStyle(TableStyle([
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, RULE),
    ]))
    return t


def _footer(canvas, doc) -> None:
    """Centred page number — the only footer decoration."""
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(INK_LIGHT)
    canvas.drawCentredString(A4[0] / 2, 1.2 * cm, f"— {doc.page} —")
    canvas.restoreState()