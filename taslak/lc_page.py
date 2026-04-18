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
            pdf.multi_cell(w-PAD*2, 4.2, line,
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
pdf.cell(200, 12, 'AI Destekli Sunum Uygulamasi   Yalin Kanvas (Lean Canvas) Is Modeli')
pdf.set_xy(235, 3)
pdf.set_font('Arial', size=9)
pdf.set_text_color(187, 222, 251)
pdf.cell(55, 12, '8 Nisan 2026', align='R')

# 1. PROBLEM
lc(GX, GY, CW, R1, '1', 'Problem', [
    '- Sunum sirasinda kumandaya/bilgisayara',
    '  bagli kalarak vakit kaybetmek.',
    '- Yuzlerce gorsel arasinda istenilen slaytı',
    '  anında bulamamak.',
    '- Dogal konusma akisinin teknolojik',
    '  kisitlamalarla bozulmasi.',
    '- Sunum sonrasi manuel ozet ve takip',
    '  maillerini gondermek zorunda kalmak.',
    '---',
    '## Mevcut Alternatifler',
    'PowerPoint, Keynote, Prezi, Zoom',
    '(entegre olmayan, parca parca cozumler)',
], SLATE)

# 8. TEMEL METRIKLER
lc(GX, GY+R1, CW, R2, '8', 'Temel Metrikler', [
    '- Tamamlanan otonom sunum sayisi.',
    '- Duzenlenen canli yayin ve',
    '  kaydedilen video dakikasi.',
    '- API ses algilama & slayt gecis hizi.',
    '- Ucretsizden premiuma donusum orani.',
    '---',
    '## Hedef (12. Ay)',
    '1.000 ucretli kullanici',
    '~200.000 TL MRR',
], DEBLUE)

# 4. COZUM
lc(GX+CW, GY, CW, UVPH, '4', 'Cozum', [
    '## AI Gorsel & Ses Analizi',
    'Ses-metin cevirisi ve slaytlara',
    'otomatik anahtar kelime atama.',
    '',
    '## Canli Yayin & Video Kaydi',
    'YouTube/LinkedIn canli aktarim,',
    'buluta HD kayit & indirme.',
    '',
    '## AI Kayit Analizi',
    'Otomatik sunum ozeti & gorev listesi.',
    '',
    '## AI Soru Uretimi (Faz 2)',
    'Slayttan soru uretme + canli yarisma.',
    '',
    '## Canli Alt Yazi',
    'Anlik alt yazi, cok dilli ceviri.',
    '',
    '## Otomatik E-posta',
    'Sunum biter bitmez ozet + kayit.',
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
pdf.cell(CW-PAD*2, 5, '3. BENZERSIZ DEGER TEKLIFI')
# Slogan
pdf.set_xy(GX+CW*2+PAD, GY+HDR_H+5)
pdf.set_font('Arial', 'B', 10)
pdf.set_text_color(*WHITE)
pdf.multi_cell(CW-PAD*2, 6.5,
    '"Siz konusun,\nsunumunuz sizi\ntakip etsin ve\ndunyaya yayilsin."',
    align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.ln(3)
# Aciklama
pdf.set_x(GX+CW*2+PAD)
pdf.set_font('Arial', size=7.5)
pdf.set_text_color(209, 196, 233)
pdf.multi_cell(CW-PAD*2, 4.3,
    'Onceden belirlenmis kati slayt siralarindan kurtulun. '
    'Yapay zeka sesinizi dinler, anlattığınız konuya en uygun '
    'gorseli aninda ekranda buyutur. Bir yayin studyosu gibi '
    'canli yayinlar ve kaydeder.',
    align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.ln(5)
# Alt etiket
pdf.set_x(GX+CW*2+PAD)
pdf.set_font('Arial', 'B', 7)
pdf.set_text_color(179, 157, 219)
pdf.cell(CW-PAD*2, 4.5, 'YUKSEK SEVIYE KONSEPT', align='C',
         new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.set_x(GX+CW*2+PAD)
pdf.set_font('Arial', size=7.5)
pdf.set_text_color(209, 196, 233)
pdf.multi_cell(CW-PAD*2, 4.3,
    'Slaytlar icin "Shazam" bulusuyor entegre bir "Yayin & Arsiv Studyosu" ile.',
    align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
# Kose numara
pdf.set_xy(GX+CW*2+CW-10, GY+UVPH-7)
pdf.set_font('Arial', 'B', 9)
pdf.set_text_color(147, 112, 219)
pdf.cell(8, 6, '3', align='R')

# 9. HAKSIZ AVANTAJ
lc(GX+CW*3, GY, CW, R1, '9', 'Haksiz Avantaj', [
    '## Piyasada Ilk',
    'Konusma sirasinda algilanan',
    'anahtar kelimeyle slayt/gorsele',
    'otomatik gecis yapan ilk ticari',
    'urun. (Konsept akademide 2016da',
    'kanitlandi, hicbir sirket',
    'urun haline getirmedi.)',
    '---',
    '## Kurucunun Bizzat Kullanimi',
    'Urun kendi sunumlarinda canli',
    'test edilmektedir.',
    '---',
    '## Universite Beta Agi',
    'Ilk geri bildirim universitede',
    'aktif sunum yapan hocalardan',
    'geliyor: hizli iterasyon.',
], FORGREEN)

# 5. KANALLAR
lc(GX+CW*3, GY+R1, CW, R2, '5', 'Kanallar', [
    '- Product Hunt & Teknoloji blogları.',
    '- LinkedIn B2B Pazarlama',
    '  (satis ekipleri, akademisyenler).',
    '- Girisimcilik etkinliklerinde',
    '  canli demolar.',
], FORGREEN)

# 2. MUSTERI SEGMENTLERI
lc(GX+CW*4, GY, CW, R1, '2', 'Musteri Segmentleri', [
    '- Is Adamlari & Yoneticiler',
    '- Start-up Kuruculari',
    '- Satis Profesyonelleri',
    '- Profesyonel Tanitim Uzmanlari',
    '- Akademisyenler ve Egitmenler',
], FORGREEN)

# ERKEN BENIMSEYENLER
lc(GX+CW*4, GY+R1, CW, R2, '', 'Erken Benimseyenler', [
    'Sahnede yenilikci ve kusursuz',
    'gorunmek isteyen, sik sik Pitch',
    'Deck sunan start-up kuruculari',
    've saha satis ekipleri.',
], FORGREEN)

# 7. MALIYET YAPISI
lc(GX, GY+R1+R2, CW*2+1, R3, '7', 'Maliyet Yapisi', [
    '## Degisken Giderler',
    '- AI API token maliyetleri (Gemini, Qwen, Gemma)',
    '- Canli yayin/video isleme bant genisligi',
    '---',
    '## Sabit Giderler',
    '- Optimizasyon ve AR-GE maliyeti',
    '- Bulut sunucu ve medya depolama (AWS/GCP)',
], AMBER)

# 6. GELIR AKISLARI
lc(GX+CW*2+1, GY+R1+R2, CW*3-1, R3, '6', 'Gelir Akislari', [
    '## Freemium Model',
    'Temel AI sunum ozellikleri, kisitli resim kapasitesi (max 15 resim).',
    '---',
    '## SaaS Abonelik (Pro / Teams)',
    'Sinırsız resim  canli yayin  video kayit/indirme  AI ozet/gorev listesi',
    'soru uretimi  oyunlastirma  otomatik e-posta gonderimi.',
], AMBER)

