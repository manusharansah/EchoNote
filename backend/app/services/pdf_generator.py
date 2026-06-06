"""
PDF Generator — converts Markdown meeting minutes to a styled PDF using ReportLab.

Handles these Markdown elements:
  - # H1  → Title (large, bold, blue)
  - ## H2 → Section heading
  - ### H3 → Sub-heading
  - **bold** and *italic* inline text
  - - bullet lists  and  - [ ] / - [x] checkboxes (action items)
  - --- horizontal rule
  - Plain paragraphs
  - *italics* footer lines
"""

import os
import re
import uuid
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

from app.core.config import settings


# ── Color palette ─────────────────────────────────────────────────────────────
BRAND_BLUE   = colors.HexColor("#2563EB")
BRAND_GRAY   = colors.HexColor("#6B7280")
LIGHT_GRAY   = colors.HexColor("#F3F4F6")
DARK_TEXT    = colors.HexColor("#111827")
CHECK_GREEN  = colors.HexColor("#16A34A")
UNCHECK_GRAY = colors.HexColor("#9CA3AF")


def _build_styles() -> dict:
    base = getSampleStyleSheet()

    def s(name, **kwargs):
        return ParagraphStyle(name=name, **kwargs)

    return {
        "title": s(
            "DocTitle",
            fontSize=22, fontName="Helvetica-Bold",
            textColor=BRAND_BLUE, spaceAfter=6,
            alignment=TA_LEFT,
        ),
        "h2": s(
            "H2", fontSize=14, fontName="Helvetica-Bold",
            textColor=DARK_TEXT, spaceBefore=14, spaceAfter=4,
            borderPad=2,
        ),
        "h3": s(
            "H3", fontSize=12, fontName="Helvetica-Bold",
            textColor=DARK_TEXT, spaceBefore=8, spaceAfter=2,
        ),
        "body": s(
            "Body", fontSize=10, fontName="Helvetica",
            textColor=DARK_TEXT, spaceAfter=4, leading=14,
        ),
        "bullet": s(
            "Bullet", fontSize=10, fontName="Helvetica",
            textColor=DARK_TEXT, leftIndent=16, spaceAfter=2, leading=13,
        ),
        "checkbox_done": s(
            "CheckDone", fontSize=10, fontName="Helvetica",
            textColor=BRAND_GRAY, leftIndent=16, spaceAfter=2, leading=13,
        ),
        "checkbox_todo": s(
            "CheckTodo", fontSize=10, fontName="Helvetica",
            textColor=DARK_TEXT, leftIndent=16, spaceAfter=2, leading=13,
        ),
        "italic": s(
            "Italic", fontSize=9, fontName="Helvetica-Oblique",
            textColor=BRAND_GRAY, spaceAfter=2,
        ),
        "footer": s(
            "Footer", fontSize=8, fontName="Helvetica-Oblique",
            textColor=BRAND_GRAY, alignment=TA_CENTER,
        ),
    }


def _md_inline(text: str) -> str:
    """Convert inline Markdown (bold/italic) to ReportLab XML tags."""
    # Bold+italic: ***text***
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'<b><i>\1</i></b>', text)
    # Bold: **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    # Italic: *text*
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    # Escape bare & that aren't already entities
    text = re.sub(r'&(?!#?\w+;)', '&amp;', text)
    return text


def generate_pdf_from_markdown(markdown_text: str, meeting_id: int, title: str) -> str:
    """
    Convert Markdown minutes to a PDF file.
    Returns the absolute path to the saved PDF.
    """
    os.makedirs(settings.PDF_STORAGE_PATH, exist_ok=True)
    pdf_filename = f"meeting_{meeting_id}_{uuid.uuid4().hex[:8]}.pdf"
    pdf_path = os.path.join(settings.PDF_STORAGE_PATH, pdf_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    styles = _build_styles()
    story  = []

    # ── Parse Markdown lines ──────────────────────────────────────────────────
    lines = markdown_text.split("\n")
    bullet_buffer: list[str] = []

    def flush_bullets():
        nonlocal bullet_buffer
        if bullet_buffer:
            items = [
                ListItem(Paragraph(_md_inline(b), styles["bullet"]), leftIndent=20)
                for b in bullet_buffer
            ]
            story.append(ListFlowable(items, bulletType="bullet", leftIndent=10))
            bullet_buffer = []

    for raw_line in lines:
        line = raw_line.rstrip()

        # H1
        if line.startswith("# ") and not line.startswith("## "):
            flush_bullets()
            story.append(Paragraph(_md_inline(line[2:]), styles["title"]))
            story.append(Spacer(1, 4))
            continue

        # H2
        if line.startswith("## "):
            flush_bullets()
            story.append(Spacer(1, 6))
            story.append(Paragraph(_md_inline(line[3:]), styles["h2"]))
            story.append(HRFlowable(width="100%", thickness=0.5, color=BRAND_BLUE, spaceAfter=4))
            continue

        # H3
        if line.startswith("### "):
            flush_bullets()
            story.append(Paragraph(_md_inline(line[4:]), styles["h3"]))
            continue

        # Horizontal rule
        if line.strip() in ("---", "***", "___"):
            flush_bullets()
            story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_GRAY, spaceBefore=6, spaceAfter=6))
            continue

        # Checkbox todo: - [ ] text
        if re.match(r'^- \[ \]\s+', line):
            flush_bullets()
            text = line[6:].strip()
            story.append(Paragraph(f"☐  {_md_inline(text)}", styles["checkbox_todo"]))
            continue

        # Checkbox done: - [x] text
        if re.match(r'^- \[x\]\s+', re.sub(r'^- \[X\]', '- [x]', line)):
            flush_bullets()
            text = re.sub(r'^- \[[xX]\]\s+', '', line)
            story.append(Paragraph(f"<font color='#16A34A'>☑</font>  <strike>{_md_inline(text)}</strike>", styles["checkbox_done"]))
            continue

        # Bullet: - text or * text
        if re.match(r'^[-*]\s+', line):
            bullet_buffer.append(line[2:].strip())
            continue

        # Blank line
        if not line.strip():
            flush_bullets()
            story.append(Spacer(1, 4))
            continue

        # Pure italic line (e.g. footer note)
        if line.strip().startswith("*") and line.strip().endswith("*") and not line.strip().startswith("**"):
            flush_bullets()
            story.append(Paragraph(_md_inline(line.strip()), styles["italic"]))
            continue

        # Regular paragraph
        flush_bullets()
        story.append(Paragraph(_md_inline(line), styles["body"]))

    flush_bullets()

    # ── Page footer ───────────────────────────────────────────────────────────
    def add_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(BRAND_GRAY)
        footer_text = f"{title}  ·  Generated {datetime.now().strftime('%B %d, %Y')}  ·  Page {doc.page}"
        canvas.drawCentredString(A4[0] / 2, 1.2 * cm, footer_text)
        canvas.restoreState()

    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    return pdf_path