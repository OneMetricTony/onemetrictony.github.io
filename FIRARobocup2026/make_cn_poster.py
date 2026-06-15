# -*- coding: utf-8 -*-
"""Localize the FIRA booth-recruit poster into Chinese."""
from PIL import Image, ImageDraw, ImageFont

SRC = r'G:/My Drive/FIRA/Booth/382bebd1e14fe5dbf98055c7200076.jpg'
OUT_FULL = r'G:/My Drive/FIRA/Booth/booth-recruit-cn.jpg'
OUT_OPT = r'C:/Users/7humi/Documents/ghio_work/FIRARobocup2026/assets/booth-recruit-cn.jpg'

BD = 'C:/Windows/Fonts/msyhbd.ttc'   # YaHei Bold
RG = 'C:/Windows/Fonts/msyh.ttc'     # YaHei Regular

img = Image.open(SRC).convert('RGB')
W, H = img.size
d = ImageDraw.Draw(img)

# ---- colors ----
RED = (210, 22, 28)          # bright accent red used in headlines
RED_BAR = (255, 255, 255)
WHITE = (248, 248, 246)
GOLD = (233, 172, 0)
FEAT_RED = (208, 20, 26)     # red used for feature titles/icons text

def font(path, size):
    return ImageFont.truetype(path, size)

def fit_font(path, text, max_w, start, min_size=12):
    s = start
    while s > min_size:
        f = font(path, s)
        if d.textlength(text, font=f) <= max_w:
            return f
        s -= 1
    return font(path, min_size)

def draw_center(cx, y, text, f, fill, anchor='mm'):
    d.text((cx, y), text, font=f, fill=fill, anchor=anchor)

def measure(text, f):
    bb = d.textbbox((0, 0), text, font=f)
    return bb[2] - bb[0], bb[3] - bb[1]

# Draw a run of [(text, color)] segments centered on cx at baseline-mid y
def draw_runs_center(cx, y, segs, f, anchor_v='m'):
    total = sum(d.textlength(t, font=f) for t, _ in segs)
    x = cx - total / 2
    for t, c in segs:
        d.text((x, y), t, font=f, fill=c, anchor='l' + anchor_v)
        x += d.textlength(t, font=f)

def fit_runs(path, segs, max_w, start, min_size=12):
    s = start
    while s > min_size:
        f = font(path, s)
        if sum(d.textlength(t, font=f) for t, _ in segs) <= max_w:
            return f
        s -= 1
    return font(path, min_size)

# ============================================================
# 1. HEADLINE: BE PART OF THE WORLD CUP  -> 成为世界杯的一员
#    Top-left, over dark arena. White with red emphasis on 世界杯.
#    Original occupies approx x 30..640, y 10..300 (3 lines).
# ============================================================
# Cover the original headline by sampling dark background to the right/below.
# The headline sits on near-black sky; fill with a soft dark gradient panel.
def dark_panel(box, base=(8, 10, 16)):
    x0, y0, x1, y1 = box
    for yy in range(y0, y1):
        # sample a representative dark pixel far right at same row (sky)
        d.line([(x0, yy), (x1, yy)], fill=base)

# Build headline as 2 lines to mirror the bold stacked look.
# Line1: 成为世界杯  Line2: 的一员  -- but keep it punchy: stack as
#   成为世界杯
#   的一员
# Emphasize 世界杯 in red.
# First, paint over old English headline region with sampled sky.
# Sample sky colors along left edge to rebuild gradient.
sky_cols = [img.getpixel((5, y)) for y in range(8, 300)]
for i, yy in enumerate(range(8, 300)):
    # use the pixel from far area that is clean sky: take column x=5 already cleanish? It's logo-free on left.
    pass

# --- Erase the original English headline (BE PART OF / THE WORLD / CUP) ---
# Top portion (pure dark sky) y6..330, x18..662 -> flat dark sky.
for yy in range(6, 330):
    c = img.getpixel((3, yy))
    c = (min(c[0], 16), min(c[1], 18), min(c[2], 30))
    d.line([(18, yy), (662, yy)], fill=c)

# Lower portion: "WORLD CUP" red + English date chip overlay the arena band.
# KEEP the real left-side flags (x<315) and the FIRA logo (x>706).
# The area behind the text is dark arena; fill it with the per-row ambient dark
# color (matches the surrounding dark arena) so it blends seamlessly.
px = img.load()
XR = 707
def erase_band(y0, y1, xL):
    """Fill x[xL..XR), y[y0..y1) with per-row ambient dark, feathered edges."""
    for yy in range(y0, y1):
        cand = sorted((px[x, yy] for x in range(xL, XR, 3)), key=lambda p: sum(p))[:12]
        amb = tuple(sum(c[i] for c in cand) // len(cand) for i in range(3))
        amb = (min(amb[0] + 2, 16), min(amb[1] + 2, 16), min(amb[2] + 4, 34))
        for xx in range(xL, XR):
            if xx < xL + 8:
                t = (xL + 8 - xx) / 8.0
                old = px[xx, yy]
                px[xx, yy] = tuple(round(amb[i] * (1 - t) + old[i] * t) for i in range(3))
            elif xx >= XR - 7:
                t = (xx - (XR - 7)) / 7.0
                old = px[xx, yy]
                px[xx, yy] = tuple(round(amb[i] * (1 - t) + old[i] * t) for i in range(3))
            else:
                px[xx, yy] = amb

# CUP rows: keep Canada/USA/Brazil flags (x<188), erase the "C"+CUP from x190.
erase_band(326, 497, 190)
# Date-chip rows: no flags below ~y470, erase wider (from the calendar icon x86).
erase_band(497, 556, 86)

# Headline text: two stacked bold lines, left-aligned, white with red 世界杯.
def draw_runs_left(x, y, segs, f):
    for t, c in segs:
        d.text((x, y), t, font=f, fill=c, anchor='lm')
        x += d.textlength(t, font=f)
line1 = [('成为', WHITE), ('世界杯', RED)]
line2 = [('的一员', WHITE)]
f1 = font(BD, 112)
f2 = font(BD, 112)
draw_runs_left(30, 95, line1, f1)
draw_runs_left(30, 230, line2, f2)

# ============================================================
# 2. DATE CHIP:  JULY 17-21, 2026  |  CANADA
#    y approx 215..255, two white text segments with icons.
#    Keep icons, replace text.
# ============================================================
# The headline fill (above) already cleared this area. Redraw a clean date line
# just below the headline at y~310, with small drawn calendar + maple accents.
dy = 312
df = font(BD, 30)
# small red calendar square accent
d.rectangle([30, dy - 14, 58, dy + 14], outline=RED, width=3)
d.line([(30, dy - 6), (58, dy - 6)], fill=RED, width=3)
d.text((70, dy), '2026年7月17–21日', font=df, fill=WHITE, anchor='lm')
# separator + maple-leaf red dot accent before CANADA
sepx = 70 + d.textlength('2026年7月17–21日', font=df) + 26
d.text((sepx, dy), '|', font=df, fill=(120, 120, 120), anchor='lm')
d.ellipse([sepx + 26, dy - 11, sepx + 48, dy + 11], fill=RED)
d.text((sepx + 58, dy), '加拿大', font=df, fill=WHITE, anchor='lm')

# ============================================================
# 3. ICON ROW LABELS (gold/white), y approx 925..985, 5 columns
#   INTERNATIONAL TEAMS / ROBOTICS & AI / THOUSANDS OF VISITORS /
#   WORLD CHAMPIONSHIP EVENT / GLOBAL MEDIA EXPOSURE
#   Centered under each gold icon. Color = gold-ish white.
# ============================================================
ICON_LABEL = (236, 196, 70)  # warm gold/white like original
icon_centers = [122, 300, 510, 700, 905]
icon_text = ['国际参赛队伍', '机器人与\n人工智能', '数千名观众', '世界锦标赛', '全球媒体曝光']
# clear the label area (icons end ~y910; original 'WORLD' starts ~y916)
for yy in range(913, 994):
    c = img.getpixel((3, yy))
    c = (min(c[0], 8), min(c[1], 8), min(c[2], 12))
    d.line([(30, yy), (1000, yy)], fill=c)
for cx, txt in zip(icon_centers, icon_text):
    lines = txt.split('\n')
    f = font(BD, 23)
    # autofit per column width ~ 180
    while max(d.textlength(l, font=f) for l in lines) > 188 and f.size > 14:
        f = font(BD, f.size - 1)
    n = len(lines)
    lh = f.size + 4
    y0 = 954 - (n - 1) * lh / 2
    for i, l in enumerate(lines):
        d.text((cx, y0 + i * lh), l, font=f, fill=ICON_LABEL, anchor='mm')

# ============================================================
# 4. RED BANNER: LAST CALL FOR EXHIBITORS! / LIMITED BOOTHS REMAINING
#    y 1015..1280, text zone x 30..720 (photo inset x735..1005 kept).
#    Rebuild dark-red gradient over text zone, then draw Chinese.
#    参展商招募 · 最后机会！ (white, with 最后机会 emphasized lighter/red? keep white)
#    展位有限 (smaller, like LIMITED BOOTHS REMAINING)
# ============================================================
# Rebuild red gradient in text zone, sampling per-row red from a clean strip.
# PRESERVE the stopwatch icon (x ~18..176, y ~1025..1145) at the banner's left.
TX0, TX1 = 26, 726
SW = (16, 1024, 178, 1148)  # stopwatch protect box
for yy in range(1016, 1281):
    base = img.getpixel((12, yy))
    r = max(base[0], 70)
    c = (min(r, 130), 2, 1)
    if SW[1] <= yy < SW[3]:
        # fill left of icon and right of icon, skip the icon box
        d.line([(TX0, yy), (SW[0], yy)], fill=c)
        d.line([(SW[2], yy), (TX1, yy)], fill=c)
    else:
        d.line([(TX0, yy), (TX1, yy)], fill=c)

# Headline: 参展商招募 (line1) 最后机会！ (line2) -- big bold white.
# Text starts right of the stopwatch icon (~x30-160), like the original.
lc1 = '参展商招募'
lc2 = '最后机会！'
f_lc = font(BD, 74)
lcx = 178
ly1, ly2 = 1078, 1166
d.text((lcx, ly1), lc1, font=f_lc, fill=WHITE, anchor='lm')
d.text((lcx, ly2), lc2, font=f_lc, fill=WHITE, anchor='lm')

# LIMITED BOOTHS REMAINING -> 展位有限. Original is a gold-ish sub-bar near the
# banner bottom (y~1238-1278). Draw a thin darker bar + white text inside the banner.
bar_y0, bar_y1 = 1236, 1278
d.rectangle([26, bar_y0, 726, bar_y1], fill=(60, 1, 1))
f_lim = font(BD, 30)
d.text((44, (bar_y0 + bar_y1) // 2), '展位有限', font=f_lim, fill=WHITE, anchor='lm')

# ============================================================
# 5. FEATURE ROW (black band y 1290..1405), 4 columns, red text.
#    PRIME LOCATION / INTERNATIONAL FOOD FESTIVAL / HIGH VISITOR TRAFFIC / 5 DAYS OF EXPOSURE
#    Each: bold red title + smaller red sub-lines. Keep icons.
#    Columns: icon then text. Title x-start after icon.
# ============================================================
# Determine text x-starts (after each red icon). From crop: icons at left of each column.
# Column layout (text start x, title, subtitle lines)
features = [
    (108, '黄金位置', ['紧邻822座', '主场馆']),
    (372, '国际美食节', ['每日吸引', '大量观众']),
    (646, '高人流量', ['品牌曝光', '最大化']),
    (878, '连续5天曝光', ['2026年', '7月17–21日']),
]
# clear text zones (keep icons). Each zone must END before the NEXT icon:
# icons at x 40-89, 288-360, 560-627, 810-869.
text_zones = [(104, 282), (372, 554), (640, 804), (878, 1004)]
for (zx0, zx1) in text_zones:
    for yy in range(1293, 1404):
        d.line([(zx0, yy), (zx1, yy)], fill=(14, 1, 0))
for (tx, title, subs) in features:
    ft = fit_font(BD, title, (1004 - tx) if tx > 800 else 250, 27)
    d.text((tx, 1310), title, font=ft, fill=FEAT_RED, anchor='lm')
    fs = font(RG, 19)
    for i, s in enumerate(subs):
        d.text((tx, 1340 + i * 24), s, font=fs, fill=(214, 60, 60), anchor='lm')

# ============================================================
# 6. BOTTOM CTA:  RESERVE YOUR BOOTH TODAY!  -> 立即预订您的展位！
#    y 1442..1510, black band. White with gold emphasis on 您的展位.
# ============================================================
for yy in range(1418, 1536):
    d.line([(0, yy), (W, yy)], fill=(3, 1, 1))
cta = [('立即预订', WHITE), ('您的展位', GOLD), ('！', WHITE)]
f_cta = fit_runs(BD, cta, 900, 90)
draw_runs_center(W // 2, 1476, cta, f_cta, anchor_v='m')

img.save(OUT_FULL, quality=95)

# optimized version
opt = img.copy()
scale = 1400 / max(opt.size)
opt = opt.resize((round(opt.size[0] * scale), round(opt.size[1] * scale)), Image.LANCZOS)
opt.save(OUT_OPT, quality=82, optimize=True)
print('saved', img.size, '->', opt.size)
