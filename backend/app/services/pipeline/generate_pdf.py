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
        Paragraph(title, S["title"]),
        Paragraph(now, S["meta"]),
        Spacer(1, 0.5 * cm),
        HRFlowable(width="100%", thickness=1.2, color=INK, spaceAfter=8),
        Spacer(1, 0.3 * cm),
    ]

    # ── Attendees ────────────────────────────────────────────
    attendees = sections.get("attendees") or []
    if attendees:
        story.append(_section_label("Attendees", S))
        story.append(Paragraph("  ·  ".join(attendees), S["meta"]))
        story.append(Spacer(1, 0.15 * cm))

    # ── Summary ──────────────────────────────────────────────
    if sections.get("summary"):
        story.append(_section_label("Summary", S))
        story.append(Paragraph(sections["summary"], S["body"]))

    # ── Main Points Discussed ─────────────────────────────────
    agenda = sections.get("agenda_items") or []
    if agenda:
        story.append(_section_label("Main Points Discussed", S))
        for i, item in enumerate(agenda, 1):
            story.append(Paragraph(f"{i}.  {item}", S["numbered"]))

    # ── Key Decisions ─────────────────────────────────────────
    decisions = sections.get("key_decisions") or []
    if decisions:
        story.append(_section_label("Key Decisions", S))
        for d in decisions:
            story.append(Paragraph(f"–  {d}", S["bullet"]))

    # ── Action Items ──────────────────────────────────────────
    # Strategy: try to keep the whole table on one page via KeepTogether.
    # If the estimated height exceeds the usable page area we emit an explicit
    # PageBreak first, so the table always starts at the top of a fresh page
    # and never splits mid-row.
    actions = sections.get("action_items") or []
    if actions:
        ROW_H    = 0.85 * cm   # conservative per-row height estimate
        HEADER_H = 0.70 * cm   # column-header row
        LABEL_H  = 0.90 * cm   # section label + hairline
        USABLE_H = A4[1] - 5.5 * cm   # page height minus top+bottom margins

        estimated_h = LABEL_H + HEADER_H + len(actions) * ROW_H

        action_block = (
            [_section_label("Action Items", S), _action_header(S)]
            + [
                _action_row(
                    item.get("owner", "TBD"),
                    item.get("task", ""),
                    item.get("due", "TBD"),
                    S,
                )
                for item in actions
            ]
            + [Spacer(1, 0.2 * cm)]
        )

        if estimated_h > USABLE_H:
            # Too tall to guarantee fitting — start on a fresh page
            story.append(PageBreak())
            story.extend(action_block)
        else:
            # Fits on one page — keep it together so it never splits mid-table
            story.append(KeepTogether(action_block))

    # ── Conclusion & Next Steps ───────────────────────────────
    next_steps = sections.get("next_steps") or []
    if next_steps:
        story.append(_section_label("Conclusion & Next Steps", S))
        for step in next_steps:
            story.append(Paragraph(f"→  {step}", S["bullet"]))

    story.append(Spacer(1, 1.2 * cm))

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
            spaceAfter=5,
        ),
        "title": ParagraphStyle(
            "Title",
            fontSize=26,
            textColor=INK,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            leading=32,
            spaceAfter=5,
        ),
        "meta": ParagraphStyle(
            "Meta",
            fontSize=9,
            textColor=INK_LIGHT,
            fontName="Helvetica",
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "section_label": ParagraphStyle(
            "SectionLabel",
            fontSize=7.5,
            textColor=INK_LIGHT,
            fontName="Helvetica-Bold",
            spaceBefore=18,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "Body",
            fontSize=10,
            textColor=INK,
            fontName="Helvetica",
            leading=17,
            spaceAfter=6,
            alignment=TA_JUSTIFY,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            fontSize=10,
            textColor=INK,
            fontName="Helvetica",
            leading=16,
            leftIndent=14,
            spaceAfter=4,
        ),
        "numbered": ParagraphStyle(
            "Numbered",
            fontSize=10,
            textColor=INK,
            fontName="Helvetica",
            leading=16,
            leftIndent=14,
            spaceAfter=4,
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
        HRFlowable(width="100%", thickness=0.4, color=RULE, spaceAfter=5),
    ])


def _col_widths() -> tuple:
    usable = A4[0] - 5.6 * cm   # page width minus left+right margins
    owner_w  = 3.2 * cm
    due_w    = 3.0 * cm
    task_w   = usable - owner_w - due_w
    return owner_w, task_w, due_w


def _action_header(S: dict) -> Table:
    ow, tw, dw = _col_widths()
    t = Table(
        [[
            Paragraph("OWNER", S["col_header"]),
            Paragraph("TASK", S["col_header"]),
            Paragraph("DUE", S["col_header"]),
        ]],
        colWidths=[ow, tw, dw],
    )
    t.setStyle(TableStyle([
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "BOTTOM"),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
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
            Paragraph(task or "",     S["action_task"]),
            Paragraph(due or "TBD",   S["action_due"]),
        ]],
        colWidths=[ow, tw, dw],
    )
    t.setStyle(TableStyle([
        ("ALIGN",         (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
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