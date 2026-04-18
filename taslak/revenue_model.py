#!/usr/bin/env python3
"""
DeepSlide — Gelir Modeli Dokümanı
fpdf2 ile Türkçe karakter destekli PDF
Sayfa 1: Ürün Tanıtımı
Sayfa 2: Yalın Kanvas (Lean Canvas)
Sayfa 3: Gelir Modeli
Sayfa 4: Kullanıcı Akış Diyagramı
"""
from fpdf import FPDF
from fpdf.enums import XPos, YPos
import os

FONT_REG  = '/System/Library/Fonts/Supplemental/Arial.ttf'
FONT_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FLOW_IMG  = '/Users/emrepirinc/Documents/DeepSlide/DeepSlide_UserFlow.png'
OUT_PATH  = '/Users/emrepirinc/Documents/DeepSlide/DeepSlide_GelirModeli.pdf'

NAVY    = (13,  33,  55)
BLUE    = (21, 101, 192)
BLUE_L  = (227, 242, 253)
BLUE_M  = (100, 149, 210)
GREEN   = (46, 125, 50)
GREEN_L = (232, 245, 233)
RED     = (183, 28, 28)
ORANGE  = (230, 81, 0)
ORANGE_L= (255, 243, 224)
TEAL    = (0, 105, 92)
GRAY_L  = (245, 245, 245)
GRAY    = (96, 125, 139)
WHITE   = (255, 255, 255)
BLACK   = (33,  33,  33)

class PDF(FPDF):
    def header(self): pass
    def footer(self):
        self.set_y(-12)
        self.set_font('Arial', size=8)
        self.set_text_color(*GRAY)
        self.cell(0, 6, 'DeepSlide  ·  Gelir Modeli & Ürün Tanıtımı',
                  align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf = PDF()
pdf.add_font('Arial',      fname=FONT_REG)
pdf.add_font('Arial', 'B', fname=FONT_BOLD)
pdf.set_auto_page_break(auto=True, margin=15)
pdf.set_margins(18, 18, 18)

# ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────
def section_title(t):
    pdf.set_font('Arial', 'B', 13)
    pdf.set_text_color(*NAVY)
    pdf.set_fill_color(*BLUE_L)
    pdf.cell(0, 8, t, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

def body(t, indent=0):
    pdf.set_x(18 + indent)
    pdf.set_font('Arial', size=10)
    pdf.set_text_color(*BLACK)
    pdf.multi_cell(174 - indent, 5.5, t, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def bullet(t, color=BLUE):
    pdf.set_x(22)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(*color)
    pdf.cell(6, 6, '-')
    pdf.set_font('Arial', size=10)
    pdf.set_text_color(*BLACK)
    pdf.multi_cell(162, 5.5, t, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

def kv(key, val, key_color=NAVY):
    pdf.set_x(22)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(*key_color)
    pdf.cell(52, 6, key)
    pdf.set_font('Arial', size=10)
    pdf.set_text_color(*BLACK)
    pdf.multi_cell(120, 6, val, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

# ─────────────────────────────────────────────────────────────────────────────
# SAYFA 1 — Kapak + Ürün Tanıtımı
# ─────────────────────────────────────────────────────────────────────────────
pdf.add_page()

pdf.set_fill_color(*NAVY)
pdf.rect(0, 0, 210, 52, 'F')
pdf.set_xy(18, 12)
pdf.set_font('Arial', 'B', 28)
pdf.set_text_color(*WHITE)
pdf.cell(0, 11, 'DeepSlide', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_x(18)
pdf.set_font('Arial', size=13)
pdf.set_text_color(187, 222, 251)
pdf.cell(0, 7, 'Gelir Modeli & Ürün Tanıtım Dokümanı', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_x(18)
pdf.set_font('Arial', size=9)
pdf.set_text_color(144, 164, 174)
pdf.cell(0, 6, 'Nisan 2026  ·  v1.0  ·  Gizli', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_y(58)

section_title('  Ürün Nedir?')
body(
    'DeepSlide, yapay zeka destekli bir sunum platformudur. Kullanıcı görsellerini yükler; '
    'platform her görseli analiz ederek bir anahtar kelime belirler. Sunum sırasında '
    'konuşmacı o kelimeyi söylediğinde ilgili slayt otomatik açılır. Kumanda, bilgisayar '
    'veya asistan olmadan yalnızca sesiyle sunumunu yönetir.'
)
pdf.ln(2)
body(
    'Piyasada sesli/kelime kontrolü sunan başka bir sunum aracı bulunmamaktadır. '
    'DeepSlide bu boşluğu doldururken Gemini API ve yerel AI modelleri (Gemma, Qwen) ile '
    'güçlü bir analiz altyapısı sunar.'
)

pdf.ln(4)
section_title('  Temel Özellikler')
bullet('Görsel yükleme: JPG, PNG, WEBP desteği')
bullet('AI analiz: Lokal model (Gemma/Qwen) — kurulum gerekir; veya Gemini API (kendi key\'i ile)')
bullet('Çok dilli analiz: Türkçe, İngilizce ve diğer diller')
bullet('Anahtar kelimeye göre otomatik slayt geçişi — piyasada tek')
bullet('Prova modu: kelime algılama testi, güven skoru, sinonim önerisi')
bullet('Web tabanlı: Tarayıcıdan erişim; Gemini için Google API key kurulumu gerekir')

pdf.ln(4)
section_title('  Hedef Kitle')
bullet('TEDx konuşmacıları')
bullet('Üniversite öğretim üyeleri ve akademisyenler')
bullet('Startup kurucuları (yatırımcı sunumları)')
bullet('Zirve ve konferans konuşmacıları')
bullet('Profesyonel sunum yapan her kesim')

# ─────────────────────────────────────────────────────────────────────────────
# SAYFA 2 — Yalin Kanvas — Landscape, kategori renk sistemi
# ─────────────────────────────────────────────────────────────────────────────
pdf.add_page(orientation='L')   # A4 landscape: 297x210mm

# Tasarim sabitleri
LIGHTBG  = (247, 250, 252)
BORDER_C = (226, 232, 240)
SLATE    = (45,  55,  72)
DEBLUE   = (43, 108, 176)
FORGREEN = (39, 103, 73)
AMBER    = (116, 66,  16)
PURPLEH  = (85,  60, 154)
NUMCLR   = (160, 174, 192)
HDR_H    = 9.0
PAD      = 3.5

# Grid boyutlari
GX   = 8
GY   = 20
CW   = 56
R1   = 62
R2   = 55
R3   = 48
UVPH = R1 + R2

def lc(x, y, w, h, num, title, content_lines, hdr_c):
    # Zemin
    pdf.set_fill_color(*LIGHTBG)
    pdf.set_draw_color(*BORDER_C)
    pdf.set_line_width(0.4)
    pdf.rect(x, y, w, h, 'FD')
    # Header bar
    pdf.set_fill_color(*hdr_c)
    pdf.set_draw_color(*hdr_c)
    pdf.rect(x, y, w, HDR_H, 'F')
    # Baslik
    pdf.set_xy(x + PAD, y + 2)
    pdf.set_font('Arial', 'B', 7.5)
    pdf.set_text_color(*WHITE)
    pdf.cell(w - PAD*2 - 8, 5, title.upper())
    # Kose numara
    if num:
        pdf.set_xy(x + w - 10, y + h - 7)
        pdf.set_font('Arial', 'B', 9)
        pdf.set_text_color(*NUMCLR)
        pdf.cell(8, 6, num, align='R')
    # Ayirici
    pdf.set_draw_color(*BORDER_C)
    pdf.set_line_width(0.25)
    pdf.line(x+1, y+HDR_H, x+w-1, y+HDR_H)
    # Icerik
    cy = y + HDR_H + 2
    pdf.set_font('Arial', size=7.5)
    pdf.set_text_color(*SLATE)
    for line in content_lines:
        if cy > y + h - 5:
            break
        if line == '---':
            pdf.set_draw_color(203, 213, 224)
            pdf.set_line_width(0.2)
            pdf.line(x+PAD, cy+1, x+w-PAD, cy+1)
            cy += 3.5
        elif line.startswith('##'):
            pdf.set_xy(x+PAD, cy)
            pdf.set_font('Arial', 'B', 7)
            pdf.set_text_color(*hdr_c)
            pdf.cell(w-PAD*2, 4.5, line[2:].strip(),
                     new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            cy = pdf.get_y()
            pdf.set_font('Arial', size=7.5)
            pdf.set_text_color(*SLATE)
        elif line == '':
            cy += 1.5
        else:
            pdf.set_xy(x+PAD, cy)
            pdf.multi_cell(w-PAD*2, 4.2, line, align='L',
                           new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            cy = pdf.get_y()

# Dis cerceve
pdf.set_draw_color(*NAVY)
pdf.set_line_width(1.2)
pdf.rect(GX, GY, CW*5, R1+R2+R3, 'D')
pdf.set_line_width(0.4)

# Baslik
pdf.set_fill_color(*NAVY)
pdf.rect(0, 0, 297, 18, 'F')
pdf.set_xy(10, 3)
pdf.set_font('Arial', 'B', 13)
pdf.set_text_color(*WHITE)
pdf.cell(200, 12, 'AI Destekli Sunum Uygulaması   Yalın Kanvas (Lean Canvas) İş Modeli')
pdf.set_xy(235, 3)
pdf.set_font('Arial', size=9)
pdf.set_text_color(187, 222, 251)
pdf.cell(55, 12, '8 Nisan 2026', align='R')

# 1. PROBLEM
lc(GX, GY, CW, R1, '1', 'Problem', [
    '- Sunum sırasında kumandaya/bilgisayara',
    '  bağlı kalarak vakit kaybetmek.',
    '- Yüzlerce görsel arasında istenilen slaytı',
    '  anında bulamamak.',
    '- Doğal konuşma akışının teknolojik',
    '  kısıtlamalarla bozulması.',
    '- Sunum sonrası manuel özet ve takip',
    '  maillerini göndermek zorunda kalmak.',
    '---',
    '## Mevcut Alternatifler',
    'PowerPoint, Keynote, Prezi, Zoom',
    '(entegre olmayan, parça parça çözümler)',
], SLATE)

# 8. TEMEL METRIKLER
lc(GX, GY+R1, CW, R2, '8', 'Temel Metrikler', [
    '- Tamamlanan otonom sunum sayısı.',
    '- Düzenlenen canlı yayın ve',
    '  kaydedilen video dakikası.',
    '- API ses algılama & slayt geçiş hızı.',
    '- Ücretsizden premiuma dönüşüm oranı.',
    '---',
    '## Hedef (18-24. Ay)',
    '1.000 ücretli kullanıcı',
    '~200.000 TL MRR',
], DEBLUE)

# 4. COZUM
lc(GX+CW, GY, CW, UVPH, '4', 'Çözüm', [
    '## AI Görsel & Ses Analizi',
    'Ses-metin çevirisi ve slaytlara',
    'otomatik anahtar kelime atama.',
    '',
    '## Canlı Yayın & Video Kaydı',
    'YouTube/LinkedIn canlı aktarım,',
    'buluta HD kayıt & indirme.',
    '',
    '## AI Kayıt Analizi',
    'Otomatik sunum özeti & görev listesi.',
    '',
    '## AI Soru Üretimi (Faz 2)',
    'Slayttan soru üretme + canlı yarışma.',
    '',
    '## Canlı Alt Yazı',
    'Anlık alt yazı, çok dilli çeviri.',
    '',
    '## Otomatik E-posta',
    'Sunum biter bitmez özet + kayıt.',
    '',
    '## Desteklenen Modeller',
    'Gemini   Qwen   Gemma',
], DEBLUE)

# 3. UVP (ozel mor kutu)
pdf.set_fill_color(*PURPLEH)
pdf.set_draw_color(*PURPLEH)
pdf.set_line_width(0)
pdf.rect(GX+CW*2, GY, CW, UVPH, 'F')
pdf.set_fill_color(107, 76, 184)
pdf.rect(GX+CW*2, GY, CW, HDR_H, 'F')
pdf.set_draw_color(147, 112, 219)
pdf.set_line_width(1.5)
pdf.rect(GX+CW*2, GY, CW, UVPH, 'D')
pdf.set_line_width(0.4)
# Baslik
pdf.set_xy(GX+CW*2+PAD, GY+2)
pdf.set_font('Arial', 'B', 7.5)
pdf.set_text_color(*WHITE)
pdf.cell(CW-PAD*2, 5, '3. BENZERSİZ DEĞER TEKLİFİ')
# Slogan
pdf.set_xy(GX+CW*2+PAD, GY+HDR_H+5)
pdf.set_font('Arial', 'B', 10)
pdf.set_text_color(*WHITE)
pdf.multi_cell(CW-PAD*2, 6.5,
    '"Siz konuşun,\nsunumunuz sizi\ntakip etsin ve\ndünyaya yayılsın."',
    align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.ln(3)
# Aciklama
pdf.set_x(GX+CW*2+PAD)
pdf.set_font('Arial', size=7.5)
pdf.set_text_color(209, 196, 233)
pdf.multi_cell(CW-PAD*2, 4.3,
    'Önceden belirlenmiş katı slayt sıralarından kurtulun. '
    'Yapay zeka sesinizi dinler, anlattığınız konuya en uygun '
    'görseli anında ekranda büyütür. Bir yayın stüdyosu gibi '
    'canlı yayınlar ve kaydeder.',
    align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.ln(5)
# Alt etiket
pdf.set_x(GX+CW*2+PAD)
pdf.set_font('Arial', 'B', 7)
pdf.set_text_color(179, 157, 219)
pdf.cell(CW-PAD*2, 4.5, 'YÜKSEK SEVİYE KONSEPT', align='C',
         new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_x(GX+CW*2+PAD)
pdf.set_font('Arial', size=7.5)
pdf.set_text_color(209, 196, 233)
pdf.multi_cell(CW-PAD*2, 4.3,
    'Slaytlar için "Shazam" buluşuyor entegre bir "Yayın & Arşiv Stüdyosu" ile.',
    align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
# Kose numara
pdf.set_xy(GX+CW*2+CW-10, GY+UVPH-7)
pdf.set_font('Arial', 'B', 9)
pdf.set_text_color(147, 112, 219)
pdf.cell(8, 6, '3', align='R')

# 9. HAKSIZ AVANTAJ
lc(GX+CW*3, GY, CW, R1, '9', 'Haksız Avantaj', [
    '## Piyasada İlk',
    'Konuşma sırasında algılanan',
    'anahtar kelimeyle slayt/görsele',
    'otomatik geçiş yapan ilk ticari',
    'ürün.',
    '---',
    '## Kurucunun Bizzat Kullanımı',
    'Ürün kendi sunumlarında canlı',
    'test edilmektedir.',
    '---',
    '## Üniversite Beta Ağı',
    'İlk geri bildirim üniversitede',
    'aktif sunum yapan hocalardan',
    'geliyor: hızlı iterasyon.',
], FORGREEN)

# 5. KANALLAR
lc(GX+CW*3, GY+R1, CW, R2, '5', 'Kanallar', [
    '- Product Hunt & Teknoloji blogları.',
    '- LinkedIn B2B Pazarlama',
    '  (satış ekipleri, akademisyenler).',
    '- Girişimcilik etkinliklerinde',
    '  canlı demolar.',
], FORGREEN)

# 2. MUSTERI SEGMENTLERI
lc(GX+CW*4, GY, CW, R1, '2', 'Müşteri Segmentleri', [
    '- İş Adamları & Yöneticiler',
    '- Start-up Kurucuları',
    '- Satış Profesyonelleri',
    '- Profesyonel Tanıtım Uzmanları',
    '- Akademisyenler ve Eğitmenler',
], FORGREEN)

# ERKEN BENIMSEYENLER
lc(GX+CW*4, GY+R1, CW, R2, '', 'Erken Benimseyenler', [
    'Sahnede yenilikçi ve kusursuz',
    'görünmek isteyen, sık sık Pitch',
    'Deck sunan start-up kurucuları',
    've saha satış ekipleri.',
], FORGREEN)

# 7. MALIYET YAPISI
lc(GX, GY+R1+R2, CW*2+1, R3, '7', 'Maliyet Yapısı', [
    '## Değişken Giderler',
    '- AI API token maliyetleri (Gemini, Qwen, Gemma)',
    '- Canlı yayın/video işleme bant genişliği',
    '---',
    '## Sabit Giderler',
    '- Optimizasyon ve AR-GE maliyeti',
    '- Bulut sunucu ve medya depolama (AWS/GCP)',
], AMBER)

# 6. GELIR AKISLARI
lc(GX+CW*2+1, GY+R1+R2, CW*3-1, R3, '6', 'Gelir Akışları', [
    '## Freemium Model',
    'Temel AI sunum özellikleri, kısıtlı resim kapasitesi (max 15 resim).',
    '---',
    '## SaaS Abonelik (Pro / Teams)',
    'Sınırsız resim  canlı yayın  video kayıt/indirme  AI özet/görev listesi',
    'soru üretimi  oyunlaştırma  otomatik e-posta gönderimi.',
], AMBER)


# ─────────────────────────────────────────────────────────────────────────────
# SAYFA 3 — Kullanıcı Akış Diyagramı (tam sayfa)
# ─────────────────────────────────────────────────────────────────────────────
pdf.add_page()

# Minimal başlık bandı
pdf.set_fill_color(*NAVY)
pdf.rect(0, 0, 210, 12, 'F')
pdf.set_xy(8, 2)
pdf.set_font('Arial', 'B', 10)
pdf.set_text_color(*WHITE)
pdf.cell(150, 8, 'DeepSlide  —  Kullanıcı Akış Diyagramı')
pdf.set_xy(160, 2)
pdf.set_font('Arial', size=8)
pdf.set_text_color(187, 222, 251)
pdf.cell(42, 8, '8 Nisan 2026', align='R')

if os.path.exists(FLOW_IMG):
    from PIL import Image as PILImage
    img = PILImage.open(FLOW_IMG)
    iw, ih = img.size
    aspect = ih / iw          # ~2.127 (çok uzun görsel)
    # Sayfa: 210x297mm — başlık 12mm, alt boşluk 5mm → kullanılabilir yükseklik 280mm
    usable_h = 285.0          # 297 - 8mm üst(başlık) - 4mm alt
    usable_w = 200.0          # 210 - 5mm sol - 5mm sağ
    draw_h = usable_h
    draw_w = draw_h / aspect
    if draw_w > usable_w:
        draw_w = usable_w
        draw_h = draw_w * aspect
    x_img = (210 - draw_w) / 2
    y_img = 10
    pdf.image(FLOW_IMG, x=x_img, y=y_img, w=draw_w, h=draw_h)
else:
    pdf.set_y(20)
    body('[Akis diyagrami gorseli bulunamadi: DeepSlide_UserFlow.png]')

# ─────────────────────────────────────────────────────────────────────────────
# SAYFA 4 — Gelir Modeli
# ─────────────────────────────────────────────────────────────────────────────
pdf.add_page()
pdf.set_y(18)

section_title('  Gelir Modeli: Freemium')
body(
    'DeepSlide freemium modeli benimser. Temel işlevsellik ücretsiz sunulur; '
    'yoğun ve profesyonel kullanım için aylık veya yıllık Pro aboneliği mevcuttur. '
    'Tüm fiyatlar KDV dahildir. Ödeme altyapısı olarak İyzico kullanılır.'
)
pdf.ln(2)

# ── Free vs Premium Karşılaştırma Tablosu ────────────────────────────────────
section_title('  Ücretsiz ve Premium Paket Karşılaştırması')

col_widths = [90, 42, 42]
headers = ['Özellik', 'Ücretsiz (Free)', 'Premium (Pro)']
rows_data = [
    ('Görsel Yükleme Kapasitesi',                   'Max 15 Resim',  'Sınırsız'),
    ('AI Ses & Slayt Eşleştirme',                   'VAR',           'VAR'),
    ('Canlı Yayın (RTMP)',                           'YOK',           'VAR'),
    ('Sunum Videosu Kaydetme ve İndirme',            'YOK',           'VAR (HD)'),
    ('Çok Dilli Canlı Alt Yazı',                     'YOK',           'VAR'),
    ('AI Özet & Görev Listesi',                      'YOK',           'VAR'),
    ('AI Soru Üretimi & Yarışma (Faz 2)',            'YOK',           'VAR'),
    ('Sunum Sonrası Özet & Görev Listesi Maili',     'YOK',           'VAR'),
]

# Başlık satırı
pdf.set_fill_color(*NAVY)
x0 = 18
for h, w in zip(headers, col_widths):
    pdf.set_xy(x0, pdf.get_y())
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(*WHITE)
    pdf.cell(w, 7, h, border=0, fill=True, align='C')
    x0 += w
pdf.ln(7)

for i, (feat, free_v, pro_v) in enumerate(rows_data):
    row_bg = GRAY_L if i % 2 == 0 else WHITE
    pdf.set_fill_color(*row_bg)
    x0 = 18
    pdf.set_xy(x0, pdf.get_y())
    pdf.set_font('Arial', size=9)
    pdf.set_text_color(*BLACK)
    pdf.cell(col_widths[0], 6, feat, border=1, fill=True)
    x0 += col_widths[0]
    pdf.set_xy(x0, pdf.get_y())
    clr = GREEN if free_v == 'VAR' else (RED if free_v == 'YOK' else BLUE)
    pdf.set_font('Arial', 'B' if free_v in ('VAR','YOK') else '', 9)
    pdf.set_text_color(*clr)
    pdf.cell(col_widths[1], 6, free_v, border=1, fill=True, align='C')
    x0 += col_widths[1]
    pdf.set_xy(x0, pdf.get_y())
    clr = GREEN if 'VAR' in pro_v else (RED if pro_v == 'YOK' else BLUE)
    pdf.set_font('Arial', 'B' if pro_v in ('VAR','YOK') else '', 9)
    pdf.set_text_color(*clr)
    pdf.cell(col_widths[2], 6, pro_v, border=1, fill=True, align='C')
    pdf.ln(6)

pdf.ln(3)
pdf.set_fill_color(*ORANGE_L)
pdf.set_draw_color(*ORANGE)
pdf.rect(18, pdf.get_y(), 174, 9, 'FD')
pdf.set_xy(18, pdf.get_y() + 1.5)
pdf.set_font('Arial', 'B', 9)
pdf.set_text_color(*ORANGE)
pdf.cell(174, 6,
    'Yıllık plan: 1.800 TL/yıl  (%25 indirim — 2.400 TL yerine)  ·  İyzico ile güvenli ödeme',
    align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.ln(3)

section_title('  Abonelik & İptal Politikası')
kv('Aylık abonelik:', 'İptal sonrası kalan süre sonuna kadar Pro erişim devam eder. Para iadesi yapılmaz.')
kv('Yıllık abonelik:', 'İptal sonrası tam para iadesi yapılır.')
kv('KDV:', 'Tüm fiyatlar %20 KDV dahildir.')
kv('Ödeme:', 'İyzico — kredi kartı ve banka kartı desteği')

pdf.ln(3)
section_title('  Kullanıcı Edinme Stratejisi')
bullet('Sosyal medya içerikleri (LinkedIn, Instagram, X) — ürünü bizzat kullanarak içerik üretimi')
bullet('Google ve Instagram reklamları — hedef: sunum yapan profesyoneller')
bullet('SEO — "yapay zeka sunum", "sesli sunum kontrolü" long-tail anahtar kelimeler')
bullet('Topluluklar — TEDx ağı, startup ekosistemleri, üniversite grupları')
bullet('Üniversite hocalarına ücretsiz Pro erişim — akademik yayılım için')

pdf.ln(3)
section_title('  Hedefler')
kv('18-24. ayda:', '1.000 kişi aylık ödeme yapıyor → aylık 200.000 TL gelir')
kv('Ücretsiz → Ücretli:', 'Her 100 ücretsiz kullanıcıdan 3-5 tanesi ödemeye geçer')
kv('Kullanıcı kaybı:', 'Her ay kullanıcıların %3\'ünden azı iptal eder')

pdf.ln(3)
section_title('  Gelecek Fazlar (Kurumsal)')
bullet('Takım / Kurumsal plan — çoklu kullanıcı, merkezi yönetim')
bullet('Sunum canlı yayını — QR kod ile izleyicilere yayın')
bullet('AI ile otomatik sunum oluşturma (prompt → slayt)')
bullet('Sunum düzenleme — sıralama, tema, görsel kırpma')

# ─────────────────────────────────────────────────────────────────────────────
pdf.output(OUT_PATH)
print('Kaydedildi:', OUT_PATH)
