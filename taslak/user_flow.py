#!/usr/bin/env python3
"""
DeepSlide — Standart Akış Diyagramı
Şekiller: Oval=Başlangıç/Bitiş | Dikdörtgen=İşlem | Eşkenar Dörtgen=Karar | Paralel Kenar=Girdi
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, FancyBboxPatch, Polygon
from matplotlib import font_manager

# ── Türkçe karakter desteği ───────────────────────────────────────────────────
try:
    font_manager.fontManager.addfont('/System/Library/Fonts/Supplemental/Arial.ttf')
    matplotlib.rcParams['font.family'] = 'Arial'
except Exception:
    matplotlib.rcParams['font.family'] = 'DejaVu Sans'

# ── Canvas ────────────────────────────────────────────────────────────────────
FW, FH = 18, 30
fig, ax = plt.subplots(figsize=(FW, FH))
ax.set_xlim(0, FW)
ax.set_ylim(0, FH)
ax.set_aspect('equal')
ax.axis('off')
fig.patch.set_facecolor('white')

# ── Renkler ───────────────────────────────────────────────────────────────────
NAVY   = '#0D2137'
BLUE   = '#1565C0'
BLUE2  = '#1976D2'
GREEN  = '#2E7D32'
RED    = '#B71C1C'
ORANGE = '#E65100'
PURPLE = '#4527A0'
TEAL   = '#00695C'
WHT    = 'white'
ARRC   = '#546E7A'

# ── Ölçüler ───────────────────────────────────────────────────────────────────
RW, RH = 4.2, 0.85
DW, DH = 3.4, 1.3
OW, OH = 2.8, 0.85
PW, PH = 4.2, 0.85
CX     = 9.0
CX_L   = 3.6
CX_R   = 14.4
GAP    = 0.55

# ── Şekil Çiziciler ───────────────────────────────────────────────────────────
def draw_oval(cx, cy, w, h, fc=NAVY, ec=NAVY, text='', fs=11):
    ax.add_patch(Ellipse((cx, cy), w, h, facecolor=fc, edgecolor=ec, linewidth=2.5, zorder=4))
    ax.text(cx, cy, text, ha='center', va='center', fontsize=fs, fontweight='bold', color=WHT, zorder=5)

def draw_rect(cx, cy, w, h, fc=BLUE, ec=BLUE, text='', sub='', fs=10.5):
    ax.add_patch(FancyBboxPatch((cx-w/2, cy-h/2), w, h,
        boxstyle='round,pad=0.06', facecolor=fc, edgecolor=ec, linewidth=2.2, zorder=4))
    ty = cy + (0.14 if sub else 0)
    ax.text(cx, ty, text, ha='center', va='center', fontsize=fs, fontweight='bold', color=WHT, zorder=5)
    if sub:
        ax.text(cx, cy - 0.22, sub, ha='center', va='center', fontsize=8.5, color='#BBDEFB', zorder=5)

def draw_para(cx, cy, w, h, fc=BLUE2, ec=BLUE2, text='', sub='', fs=10.5):
    skew = 0.3
    xs = [cx-w/2+skew, cx+w/2+skew, cx+w/2-skew, cx-w/2-skew]
    ys = [cy-h/2,       cy-h/2,       cy+h/2,       cy+h/2]
    ax.add_patch(Polygon(list(zip(xs, ys)), closed=True,
        facecolor=fc, edgecolor=ec, linewidth=2.2, zorder=4))
    ty = cy + (0.12 if sub else 0)
    ax.text(cx, ty, text, ha='center', va='center', fontsize=fs, fontweight='bold', color=WHT, zorder=5)
    if sub:
        ax.text(cx, cy - 0.2, sub, ha='center', va='center', fontsize=8, color='#BBDEFB', zorder=5)

def draw_diamond(cx, cy, w, h, fc=GREEN, ec=GREEN, text='', fs=9.5):
    xs = [cx,      cx+w/2, cx,      cx-w/2]
    ys = [cy+h/2,  cy,     cy-h/2,  cy    ]
    ax.add_patch(Polygon(list(zip(xs, ys)), closed=True,
        facecolor=fc, edgecolor=ec, linewidth=2.2, zorder=4))
    ax.text(cx, cy, text, ha='center', va='center', fontsize=fs,
            fontweight='bold', color=WHT, zorder=5, linespacing=1.3)

# ── Ok Çiziciler ──────────────────────────────────────────────────────────────
AP = dict(arrowstyle='->', color=ARRC, lw=2.0, mutation_scale=16)

def arr_down(x, y1, y2, c=ARRC, lbl='', lbl_side='right'):
    ax.annotate('', xy=(x, y2), xytext=(x, y1),
                arrowprops=dict(arrowstyle='->', color=c, lw=2.0, mutation_scale=16))
    if lbl:
        lx = x + 0.12 if lbl_side == 'right' else x - 0.12
        ha = 'left' if lbl_side == 'right' else 'right'
        ax.text(lx, (y1+y2)/2, lbl, fontsize=9, color=c, fontweight='bold', va='center', ha=ha)

def arr_right(x1, x2, y, c=ARRC, lbl=''):
    ax.annotate('', xy=(x2, y), xytext=(x1, y),
                arrowprops=dict(arrowstyle='->', color=c, lw=2.0, mutation_scale=16))
    if lbl:
        ax.text((x1+x2)/2, y+0.15, lbl, fontsize=9, color=c, fontweight='bold', ha='center')

def seg(x1, y1, x2, y2, c=ARRC):
    """Oksuz düz çizgi segmenti"""
    ax.plot([x1, x2], [y1, y2], color=c, lw=2.0, zorder=2, solid_capstyle='round')

def branch_left(x_diamond_left, y_diamond, x_box, y_box_top, fc, lbl=''):
    """Elmastan sola çık, aşağı in — L şekli"""
    seg(x_diamond_left, y_diamond, x_box, y_diamond, fc)
    ax.annotate('', xy=(x_box, y_box_top), xytext=(x_box, y_diamond),
                arrowprops=dict(arrowstyle='->', color=fc, lw=2.0, mutation_scale=16))
    if lbl:
        ax.text((x_diamond_left + x_box)/2, y_diamond + 0.13, lbl,
                fontsize=9, color=fc, fontweight='bold', ha='center')

def branch_right(x_diamond_right, y_diamond, x_box, y_box_top, fc, lbl=''):
    """Elmastan sağa çık, aşağı in — L şekli"""
    seg(x_diamond_right, y_diamond, x_box, y_diamond, fc)
    ax.annotate('', xy=(x_box, y_box_top), xytext=(x_box, y_diamond),
                arrowprops=dict(arrowstyle='->', color=fc, lw=2.0, mutation_scale=16))
    if lbl:
        ax.text((x_diamond_right + x_box)/2, y_diamond + 0.13, lbl,
                fontsize=9, color=fc, fontweight='bold', ha='center')

def merge_to_center(x_left, y_left_bot, x_right, y_right_bot, y_merge, x_center=None):
    if x_center is None: x_center = CX
    """İki koldan gelen çizgileri merkeze birleştir — ok yok, sadece çizgi"""
    seg(x_left,  y_left_bot,  x_left,  y_merge)
    seg(x_right, y_right_bot, x_right, y_merge)
    seg(x_left,  y_merge, x_center, y_merge)
    seg(x_right, y_merge, x_center, y_merge)

# ─────────────────────────────────────────────────────────────────────────────
# AKIŞ
# ─────────────────────────────────────────────────────────────────────────────

# ── BAŞLANGIÇ ─────────────────────────────────────────────────────────────────
y_start = 29.0
draw_oval(CX, y_start, OW, OH, NAVY, NAVY, 'BAŞLANGIÇ', fs=12)

# ── 1. Yeni Sunum ─────────────────────────────────────────────────────────────
y1 = y_start - OH/2 - GAP - RH/2
arr_down(CX, y_start - OH/2, y1 + RH/2)
draw_rect(CX, y1, RW, RH, BLUE, BLUE, 'Yeni Sunum Oluştur')

# ── 2. Başlık Gir ─────────────────────────────────────────────────────────────
y2 = y1 - RH/2 - GAP - PH/2
arr_down(CX, y1 - RH/2, y2 + PH/2)
draw_para(CX, y2, PW, PH, BLUE2, BLUE2, 'Sunum Başlığı Gir', 'Kullanıcı tarafından girilir')

# ── 3. Görsel Yükle ───────────────────────────────────────────────────────────
y3 = y2 - PH/2 - GAP - PH/2
arr_down(CX, y2 - PH/2, y3 + PH/2)
draw_para(CX, y3, PW, PH, BLUE2, BLUE2, 'Görsel Yükle', 'JPG · PNG · WEBP')

# ── 4. KARAR: Free limit ──────────────────────────────────────────────────────
y4 = y3 - PH/2 - GAP - DH/2
arr_down(CX, y3 - PH/2, y4 + DH/2)
draw_diamond(CX, y4, DW, DH, GREEN, GREEN, 'Free limit\naşıldı mı?')

# EVET → sağa (aynı y seviyesinde)
draw_rect(CX_R, y4, 3.0, RH, ORANGE, ORANGE, "Pro'ya Geç", 'TL99/ay — İyzico')
arr_right(CX + DW/2, CX_R - 3.0/2, y4, ORANGE, 'EVET')

# HAYIR → aşağı
y5 = y4 - DH/2 - GAP - DH/2
arr_down(CX, y4 - DH/2, y5 + DH/2, ARRC, 'HAYIR')

# ── 5. Analiz Aracı ───────────────────────────────────────────────────────────
draw_diamond(CX, y5, DW, DH, GREEN, GREEN, 'Analiz Aracı?')

y_lokal  = y5 - 1.5
y_gemini = y5 - 1.5
draw_rect(CX_L, y_lokal, 3.0, RH, TEAL, TEAL, 'Lokal Model', 'Gemma · Qwen')
draw_para(CX_R, y_gemini, 3.2, PH, PURPLE, PURPLE, 'Gemini API', 'API key girilir')
branch_left (CX - DW/2, y5, CX_L, y_lokal  + RH/2, TEAL,   'LOKAL')
branch_right(CX + DW/2, y5, CX_R, y_gemini + PH/2, PURPLE, 'GEMİNİ')

y6_merge = y5 - DH/2 - 2.0
merge_to_center(CX_L, y_lokal - RH/2, CX_R, y_gemini - PH/2, y6_merge)

# ── 6. Analiz Dili ────────────────────────────────────────────────────────────
y6 = y6_merge - GAP - RH/2
arr_down(CX, y6_merge, y6 + RH/2)
draw_rect(CX, y6, RW, RH, BLUE, BLUE, 'Analiz Dili Seç', 'Türkçe · İngilizce · Diğer')

# ── 7. KARAR: Anahtar Kelime? ─────────────────────────────────────────────────
y7 = y6 - RH/2 - GAP - DH/2
arr_down(CX, y6 - RH/2, y7 + DH/2)
draw_diamond(CX, y7, DW, DH, GREEN, GREEN, 'Anahtar Kelime\nnasıl belirlensin?')

y_ai  = y7 - 1.5
y_man = y7 - 1.5
draw_rect(CX_L, y_ai,  3.0, RH, TEAL,   TEAL,   'AI Analiz Et', 'Otomatik üretilir')
draw_para(CX_R, y_man, 3.0, PH, PURPLE, PURPLE, 'Manuel Gir',   'Elle yazılır')
branch_left (CX - DW/2, y7, CX_L, y_ai  + RH/2, TEAL,   'AI')
branch_right(CX + DW/2, y7, CX_R, y_man + PH/2, PURPLE, 'MANUEL')

y8_merge = y7 - DH/2 - 2.0
merge_to_center(CX_L, y_ai - RH/2, CX_R, y_man - PH/2, y8_merge)

# ── 8. KARAR: Prova / Sunum ───────────────────────────────────────────────────
y8 = y8_merge - GAP - DH/2
arr_down(CX, y8_merge, y8 + DH/2)
draw_diamond(CX, y8, DW, DH, GREEN, GREEN, 'Prova mı\nSunum mu?')

y_prova = y8 - 1.5
y_sun   = y8 - 1.5
draw_rect(CX_L, y_prova, 3.0, RH, '#00838F', '#00838F', 'Prova Yap',      'Anahtar kelime algılama testi')
draw_rect(CX_R, y_sun,   3.0, RH, '#558B2F', '#558B2F', 'Sunuma Başla',   'Canlı sunum')
branch_left (CX - DW/2, y8, CX_L, y_prova + RH/2, '#00838F', 'PROVA')
branch_right(CX + DW/2, y8, CX_R, y_sun   + RH/2, '#558B2F', 'SUNUM')

y9_merge = y8 - DH/2 - 2.0
merge_to_center(CX_L, y_prova - RH/2, CX_R, y_sun - RH/2, y9_merge)

# ── 9. Anahtar Kelimeye Göre Slayt Geçişi (vurgu kutusu) ─────────────────────
y9 = y9_merge - GAP - 1.0/2
arr_down(CX, y9_merge, y9 + 1.0/2)

ax.add_patch(FancyBboxPatch((CX - 4.6/2, y9 - 1.0/2), 4.6, 1.0,
    boxstyle='round,pad=0.08', facecolor=RED, edgecolor='#7F0000', linewidth=3, zorder=4))
ax.text(CX, y9 + 0.16, 'Anahtar Kelimeye Göre Slayt Geçişi',
        ha='center', va='center', fontsize=11.5, fontweight='bold', color=WHT, zorder=5)
ax.text(CX, y9 - 0.22,
        '"Gökyüzü" diyince o slayt açılır  ·  Her görsel bir anahtar kelimeyle eşleşir',
        ha='center', va='center', fontsize=8.5, color='#FFCDD2', zorder=5)

# ── 10. Sunum Tamamlandı ──────────────────────────────────────────────────────
y10 = y9 - 1.0/2 - GAP - RH/2
arr_down(CX, y9 - 1.0/2, y10 + RH/2)
draw_rect(CX, y10, RW, RH, BLUE, BLUE, 'Sunum Tamamlandı', 'Süre · Slayt sayısı · Özet')

# ── BİTİŞ ─────────────────────────────────────────────────────────────────────
y_end = y10 - RH/2 - GAP - OH/2
arr_down(CX, y10 - RH/2, y_end + OH/2)
draw_oval(CX, y_end, OW, OH, NAVY, NAVY, 'BİTİŞ', fs=12)

# ── BAŞLIK ────────────────────────────────────────────────────────────────────
ax.add_patch(FancyBboxPatch((0.3, 29.6), 17.4, 0.35,
    boxstyle='round,pad=0.04', facecolor=NAVY, edgecolor=NAVY, linewidth=0, zorder=2))
ax.text(CX, 29.78, 'DeepSlide  —  Ürün Akış Diyagramı  ·  Nisan 2026',
        ha='center', va='center', fontsize=11, fontweight='bold', color=WHT, zorder=3)

# ─────────────────────────────────────────────────────────────────────────────
plt.tight_layout(pad=0.2)
out = '/Users/emrepirinc/Documents/DeepSlide/DeepSlide_UserFlow.pdf'
fig.savefig(out, format='pdf', bbox_inches='tight', facecolor='white', dpi=150)
fig.savefig(out.replace('.pdf', '.png'), dpi=150, bbox_inches='tight', facecolor='white')
plt.close()
print('Kaydedildi:', out)
