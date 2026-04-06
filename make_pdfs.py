"""
Professional PDF generator for TARE documents.
Uses ReportLab with custom styles matching an academic/enterprise look.
"""
import re
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether, Preformatted
)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

# ── Colour palette ─────────────────────────────────────────────────────────────
NAVY      = HexColor('#0d1b2a')
DARK_BLUE = HexColor('#1a3a5c')
MID_BLUE  = HexColor('#2563a8')
ACCENT    = HexColor('#0ea5e9')
GREY_DARK = HexColor('#374151')
GREY_MID  = HexColor('#6b7280')
GREY_LIGHT= HexColor('#f3f4f6')
WHITE     = colors.white
BLACK     = colors.black
RED       = HexColor('#dc2626')
GREEN     = HexColor('#16a34a')

W, H = A4  # 595.27 x 841.89 points
MARGIN_L = 2.5 * cm
MARGIN_R = 2.5 * cm
MARGIN_T = 2.5 * cm
MARGIN_B = 2.5 * cm

# ── Styles ─────────────────────────────────────────────────────────────────────
def make_styles():
    s = {}

    s['doc_title'] = ParagraphStyle('doc_title',
        fontName='Helvetica-Bold', fontSize=18, leading=24,
        textColor=NAVY, alignment=TA_LEFT, spaceAfter=6)

    s['doc_subtitle'] = ParagraphStyle('doc_subtitle',
        fontName='Helvetica', fontSize=11, leading=15,
        textColor=DARK_BLUE, alignment=TA_LEFT, spaceAfter=4)

    s['doc_meta'] = ParagraphStyle('doc_meta',
        fontName='Helvetica', fontSize=9, leading=13,
        textColor=GREY_MID, alignment=TA_LEFT, spaceAfter=2)

    s['h1'] = ParagraphStyle('h1',
        fontName='Helvetica-Bold', fontSize=14, leading=18,
        textColor=NAVY, spaceBefore=18, spaceAfter=6,
        borderPad=0)

    s['h2'] = ParagraphStyle('h2',
        fontName='Helvetica-Bold', fontSize=11, leading=15,
        textColor=DARK_BLUE, spaceBefore=14, spaceAfter=4)

    s['h3'] = ParagraphStyle('h3',
        fontName='Helvetica-BoldOblique', fontSize=10, leading=14,
        textColor=MID_BLUE, spaceBefore=10, spaceAfter=3)

    s['h4'] = ParagraphStyle('h4',
        fontName='Helvetica-Bold', fontSize=9.5, leading=13,
        textColor=GREY_DARK, spaceBefore=8, spaceAfter=2)

    s['body'] = ParagraphStyle('body',
        fontName='Helvetica', fontSize=9.5, leading=14.5,
        textColor=GREY_DARK, alignment=TA_JUSTIFY,
        spaceAfter=6, firstLineIndent=0)

    s['body_bold'] = ParagraphStyle('body_bold',
        fontName='Helvetica-Bold', fontSize=9.5, leading=14,
        textColor=GREY_DARK, spaceAfter=4)

    s['blockquote'] = ParagraphStyle('blockquote',
        fontName='Helvetica-Oblique', fontSize=9, leading=13.5,
        textColor=GREY_DARK, leftIndent=18, rightIndent=18,
        borderColor=ACCENT, borderWidth=0, spaceAfter=8,
        backColor=HexColor('#f0f9ff'))

    s['code'] = ParagraphStyle('code',
        fontName='Courier', fontSize=8, leading=12,
        textColor=GREY_DARK, backColor=GREY_LIGHT,
        leftIndent=10, rightIndent=10,
        spaceBefore=4, spaceAfter=8)

    s['bullet'] = ParagraphStyle('bullet',
        fontName='Helvetica', fontSize=9.5, leading=14,
        textColor=GREY_DARK, leftIndent=16, firstLineIndent=-10,
        spaceAfter=3)

    s['ref'] = ParagraphStyle('ref',
        fontName='Helvetica', fontSize=8.5, leading=12.5,
        textColor=GREY_MID, leftIndent=20, firstLineIndent=-16,
        spaceAfter=3)

    s['table_header'] = ParagraphStyle('table_header',
        fontName='Helvetica-Bold', fontSize=8.5, leading=11,
        textColor=WHITE, alignment=TA_CENTER)

    s['table_cell'] = ParagraphStyle('table_cell',
        fontName='Helvetica', fontSize=8.5, leading=11.5,
        textColor=GREY_DARK, alignment=TA_LEFT)

    s['caption'] = ParagraphStyle('caption',
        fontName='Helvetica-Oblique', fontSize=8, leading=11,
        textColor=GREY_MID, alignment=TA_CENTER, spaceAfter=6)

    s['confidential'] = ParagraphStyle('confidential',
        fontName='Helvetica-Bold', fontSize=8, leading=10,
        textColor=RED, alignment=TA_CENTER)

    return s


# ── Page template (header + footer) ────────────────────────────────────────────
def make_page_template(doc_title_short, doc_type):
    def on_page(canvas, doc):
        canvas.saveState()
        page = doc.page

        # Header bar
        canvas.setFillColor(NAVY)
        canvas.rect(MARGIN_L, H - MARGIN_T + 4*mm, W - MARGIN_L - MARGIN_R, 8*mm, fill=1, stroke=0)
        canvas.setFont('Helvetica-Bold', 8)
        canvas.setFillColor(WHITE)
        canvas.drawString(MARGIN_L + 3*mm, H - MARGIN_T + 6.5*mm, 'TARE — Trusted Access Response Engine')
        canvas.setFont('Helvetica', 8)
        canvas.drawRightString(W - MARGIN_R - 3*mm, H - MARGIN_T + 6.5*mm, doc_title_short)

        # Footer line
        canvas.setStrokeColor(GREY_MID)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN_L, MARGIN_B - 4*mm, W - MARGIN_R, MARGIN_B - 4*mm)

        # Footer text
        canvas.setFont('Helvetica', 7.5)
        canvas.setFillColor(GREY_MID)
        canvas.drawString(MARGIN_L, MARGIN_B - 8*mm, doc_type)
        canvas.drawCentredString(W/2, MARGIN_B - 8*mm, 'CONFIDENTIAL — Internal Use Only')
        canvas.drawRightString(W - MARGIN_R, MARGIN_B - 8*mm, f'Page {page}')

        canvas.restoreState()
    return on_page


# ── Table builder ───────────────────────────────────────────────────────────────
def build_table(rows, styles_map, col_widths=None):
    """rows[0] = header row. Remaining = data rows."""
    S = styles_map

    def cell(txt, is_header=False):
        st = S['table_header'] if is_header else S['table_cell']
        return Paragraph(str(txt).strip(), st)

    tdata = []
    for i, row in enumerate(rows):
        tdata.append([cell(c, i == 0) for c in row])

    avail = W - MARGIN_L - MARGIN_R - 0.5*cm
    if col_widths is None:
        ncols = len(rows[0])
        col_widths = [avail / ncols] * ncols
    else:
        # scale proportionally to fill width
        total = sum(col_widths)
        col_widths = [cw / total * avail for cw in col_widths]

    ts = TableStyle([
        # Header
        ('BACKGROUND',  (0,0), (-1,0), NAVY),
        ('TEXTCOLOR',   (0,0), (-1,0), WHITE),
        ('FONTNAME',    (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',    (0,0), (-1,0), 8.5),
        ('TOPPADDING',  (0,0), (-1,0), 5),
        ('BOTTOMPADDING',(0,0),(-1,0), 5),
        ('ALIGN',       (0,0), (-1,0), 'CENTER'),
        # Data rows
        ('FONTNAME',    (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE',    (0,1), (-1,-1), 8.5),
        ('TOPPADDING',  (0,1), (-1,-1), 4),
        ('BOTTOMPADDING',(0,1),(-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING',(0,0), (-1,-1), 5),
        ('VALIGN',      (0,0), (-1,-1), 'MIDDLE'),
        # Alternating rows
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, HexColor('#f8fafc')]),
        # Grid
        ('GRID',        (0,0), (-1,-1), 0.4, HexColor('#d1d5db')),
        ('LINEBELOW',   (0,0), (-1,0), 1.2, NAVY),
        ('ROWBACKGROUNDS', (0,0), (0,0), [NAVY]),
    ])

    t = Table(tdata, colWidths=col_widths, repeatRows=1)
    t.setStyle(ts)
    return t


# ── Markdown parser → ReportLab flowables ──────────────────────────────────────
def parse_md(text, S):
    """
    Converts markdown to a list of ReportLab flowables.
    Handles: # ## ### ####, **, *, ```, |table|, >, - bullets, [n] refs
    """
    flowables = []
    lines = text.split('\n')
    i = 0

    def inline(txt):
        """Convert inline markdown (**bold**, *italic*, `code`) to ReportLab XML."""
        # Escape existing XML chars first
        txt = txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        # Bold-italic
        txt = re.sub(r'\*\*\*(.+?)\*\*\*', r'<b><i>\1</i></b>', txt)
        # Bold
        txt = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', txt)
        # Italic
        txt = re.sub(r'\*(.+?)\*', r'<i>\1</i>', txt)
        # Inline code
        txt = re.sub(r'`([^`]+)`', r'<font name="Courier" size="8.5" color="#374151"><b>\1</b></font>', txt)
        # Subscript refs like [1], [2]
        txt = re.sub(r'\[(\d+(?:,\s*\d+)*)\]', r'<super><font size="7">[\1]</font></super>', txt)
        return txt

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip horizontal rules
        if re.match(r'^-{3,}$', stripped) or re.match(r'^\*{3,}$', stripped):
            flowables.append(HRFlowable(width='100%', thickness=0.5, color=HexColor('#d1d5db'), spaceAfter=4))
            i += 1
            continue

        # Headings
        h4_match = re.match(r'^####\s+(.*)', stripped)
        h3_match = re.match(r'^###\s+(.*)', stripped)
        h2_match = re.match(r'^##\s+(.*)', stripped)
        h1_match = re.match(r'^#\s+(.*)', stripped)

        if h1_match and not h2_match and not h3_match and not h4_match:
            flowables.append(Spacer(1, 4))
            flowables.append(HRFlowable(width='100%', thickness=2, color=NAVY, spaceAfter=3))
            flowables.append(Paragraph(inline(h1_match.group(1)), S['h1']))
            i += 1; continue

        if h2_match and not h3_match and not h4_match:
            flowables.append(Paragraph(inline(h2_match.group(1)), S['h2']))
            i += 1; continue

        if h3_match and not h4_match:
            flowables.append(Paragraph(inline(h3_match.group(1)), S['h3']))
            i += 1; continue

        if h4_match:
            flowables.append(Paragraph(inline(h4_match.group(1)), S['h4']))
            i += 1; continue

        # Code block
        if stripped.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i].rstrip())
                i += 1
            i += 1  # skip closing ```
            code_text = '\n'.join(code_lines)
            flowables.append(Preformatted(code_text, S['code']))
            continue

        # Blockquote
        if stripped.startswith('> '):
            quote = stripped[2:]
            # Collect multi-line
            i += 1
            while i < len(lines) and lines[i].strip().startswith('> '):
                quote += ' ' + lines[i].strip()[2:]
                i += 1
            flowables.append(Spacer(1, 2))
            flowables.append(Table(
                [[Paragraph(inline(quote), S['blockquote'])]],
                colWidths=[W - MARGIN_L - MARGIN_R - 0.5*cm],
                style=TableStyle([
                    ('LEFTPADDING',  (0,0), (-1,-1), 10),
                    ('RIGHTPADDING', (0,0), (-1,-1), 10),
                    ('TOPPADDING',   (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING',(0,0), (-1,-1), 6),
                    ('BACKGROUND',   (0,0), (-1,-1), HexColor('#f0f9ff')),
                    ('LINEONSIDES',  (0,0), (0,-1), 3, ACCENT),
                ])
            ))
            flowables.append(Spacer(1, 4))
            continue

        # Table (| col | col |)
        if stripped.startswith('|'):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                row = lines[i].strip()
                # Skip separator rows (|---|---|)
                if re.match(r'^\|[\s\-:|]+\|', row):
                    i += 1; continue
                cols = [c.strip() for c in row.strip('|').split('|')]
                table_rows.append(cols)
                i += 1
            if table_rows:
                # Normalize column count
                max_cols = max(len(r) for r in table_rows)
                for r in table_rows:
                    while len(r) < max_cols:
                        r.append('')
                flowables.append(Spacer(1, 4))
                flowables.append(build_table(table_rows, S))
                flowables.append(Spacer(1, 6))
            continue

        # Bullet / list
        bullet_match = re.match(r'^[-*]\s+(.*)', stripped)
        numbered_match = re.match(r'^\d+\.\s+(.*)', stripped)
        if bullet_match or numbered_match:
            content = (bullet_match or numbered_match).group(1)
            prefix = '•  ' if bullet_match else re.match(r'^(\d+\.)\s+', stripped).group(1) + '  '
            flowables.append(Paragraph(prefix + inline(content), S['bullet']))
            i += 1; continue

        # Reference lines [1] Author ...
        if re.match(r'^\[\d+\]', stripped):
            flowables.append(Paragraph(inline(stripped), S['ref']))
            i += 1; continue

        # Bold-only lines (signal names, section labels)
        if stripped.startswith('**') and stripped.endswith('**') and stripped.count('**') == 2:
            flowables.append(Paragraph(inline(stripped), S['body_bold']))
            i += 1; continue

        # Empty line
        if not stripped:
            flowables.append(Spacer(1, 5))
            i += 1; continue

        # Regular paragraph
        flowables.append(Paragraph(inline(stripped), S['body']))
        i += 1

    return flowables


# ── Cover page ─────────────────────────────────────────────────────────────────
def cover_page(title, subtitle, meta_lines, S, doc_type='Research Paper'):
    els = []

    # Top accent bar (drawn via a coloured table)
    els.append(Table(
        [['']],
        colWidths=[W - MARGIN_L - MARGIN_R],
        rowHeights=[8],
        style=TableStyle([('BACKGROUND', (0,0), (-1,-1), NAVY), ('GRID', (0,0), (-1,-1), 0, NAVY)])
    ))
    els.append(Spacer(1, 1.2*cm))

    # Document type label
    els.append(Paragraph(doc_type.upper(), ParagraphStyle('dt',
        fontName='Helvetica-Bold', fontSize=9, leading=12,
        textColor=ACCENT, spaceAfter=8, letterSpacing=2)))

    # Main title
    els.append(Paragraph(title, ParagraphStyle('ct',
        fontName='Helvetica-Bold', fontSize=20, leading=26,
        textColor=NAVY, spaceAfter=10)))

    # Subtitle
    if subtitle:
        els.append(Paragraph(subtitle, ParagraphStyle('cs',
            fontName='Helvetica', fontSize=12, leading=17,
            textColor=DARK_BLUE, spaceAfter=20)))

    # Divider
    els.append(HRFlowable(width='100%', thickness=1.5, color=ACCENT, spaceAfter=16))

    # Meta lines
    for line in meta_lines:
        els.append(Paragraph(line, ParagraphStyle('cm',
            fontName='Helvetica', fontSize=9.5, leading=14,
            textColor=GREY_MID, spaceAfter=4)))

    els.append(Spacer(1, 1.5*cm))

    # Confidential notice
    els.append(Table(
        [[Paragraph('CONFIDENTIAL — INTERNAL USE ONLY', ParagraphStyle('conf',
            fontName='Helvetica-Bold', fontSize=8.5, leading=12,
            textColor=RED, alignment=TA_CENTER))]],
        colWidths=[W - MARGIN_L - MARGIN_R],
        style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), HexColor('#fff1f2')),
            ('BOX',        (0,0), (-1,-1), 1, RED),
            ('TOPPADDING',  (0,0), (-1,-1), 6),
            ('BOTTOMPADDING',(0,0),(-1,-1), 6),
        ])
    ))

    els.append(PageBreak())
    return els


# ── Build a PDF from a markdown file ──────────────────────────────────────────
def build_pdf(md_path, out_path, title, subtitle, meta_lines, doc_type, header_short):
    S = make_styles()

    doc = SimpleDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T + 1*cm,   # extra room for header bar
        bottomMargin=MARGIN_B + 0.5*cm,
        title=title,
        author='TARE Project Team',
        subject=doc_type,
    )

    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Strip the first H1 (used in cover) and any leading author/date lines
    lines = md_text.split('\n')
    start = 0
    for j, l in enumerate(lines):
        if l.strip().startswith('## ') or l.strip().startswith('# ') and j > 0:
            start = j
            break
    body_md = '\n'.join(lines[start:])

    story = []
    story += cover_page(title, subtitle, meta_lines, S, doc_type)
    story += parse_md(body_md, S)

    doc.build(story, onFirstPage=make_page_template(header_short, doc_type),
                     onLaterPages=make_page_template(header_short, doc_type))
    print(f'  OK  {out_path}')


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    BASE = os.path.dirname(os.path.abspath(__file__))

    print('\nGenerating TARE PDFs...\n')
    import sys; sys.stdout.reconfigure(encoding='utf-8', errors='replace') if hasattr(sys.stdout, 'reconfigure') else None

    # ── Research Paper ─────────────────────────────────────────────────────────
    build_pdf(
        md_path  = os.path.join(BASE, 'TARE_RESEARCH_PAPER.md'),
        out_path = os.path.join(BASE, 'TARE_Research_Paper.pdf'),
        title    = 'TARE: A Post-Grant Behavioural Monitoring and Graduated Response Engine for Autonomous AI Agents in Critical Infrastructure',
        subtitle = 'Trusted Access Response Engine · Energy & Utilities AI Security Platform',
        meta_lines = [
            'Authors: [Author Name] · [Co-Author Name]',
            'Affiliation: [Institution]',
            'Target Venue: IEEE S&P / ACM CCS / ACSAC',
            'Date: April 2026',
            'Classification: Confidential — Pre-Submission Draft',
        ],
        doc_type     = 'Technical Research Paper',
        header_short = 'Research Paper — Pre-Submission Draft',
    )

    # ── IPR Strategy ───────────────────────────────────────────────────────────
    build_pdf(
        md_path  = os.path.join(BASE, 'TARE_IPR_STRATEGY.md'),
        out_path = os.path.join(BASE, 'TARE_IPR_Strategy.pdf'),
        title    = 'TARE — Intellectual Property Rights Strategy',
        subtitle = 'Two-Track Protection: Technical Paper + Patent (Non-Provisional)',
        meta_lines = [
            'Energy & Utilities AI Security Platform',
            'Document Type: Internal IPR Strategy',
            'Version: 1.0 · April 2026',
            'Classification: Confidential — Internal Use Only',
            'Distribution: Project Leads & Legal Counsel Only',
        ],
        doc_type     = 'IPR Strategy Document',
        header_short = 'IPR Strategy — Internal Use Only',
    )

    print('\nDone. PDFs saved to:', BASE)
