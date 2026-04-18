# DeepSlide - Is Analizi Plani (BABOK Tabanli) v1.1

**Proje:** DeepSlide - AI Destekli Sunum Uygulamasi
**Tarih:** 2026-04-05
**Versiyon:** v1.1
**Is Analisti Kadrosu:** Elif Karaca (Kidemli), Murat Demir (Orta), Selin Yilmaz (Junior)

---

## FAZ 1: BRAINSTORM CIKTI ANALIZI (Affinity Diagram)

```
KATEGORI A: SES & KONTROL MEKANIZMASI (5 ozellik)
+-- #1  Sesle Gorsel Navigasyon (Faz 1 - RICE: 8.50) Must-have
+-- #19 Adaptif UI (Faz 1 - RICE: 5.25) Performance
+-- #5  Spotlight Modu (Faz 1 - RICE: 4.80) Performance
+-- #4  Sunum Provasi & Guven Skoru (Faz 1 - RICE: 3.27) Performance
+-- #9  Jest Kontrolu (Parking Lot - Faz 3)

KATEGORI B: GORSEL YONETIMI & AI ANALIZ (4 ozellik)
+-- #7  Tek Tikla Sunum Olusturma (Faz 1 - RICE: 13.50) Must-have
+-- #2  Akilli Grid & Kumeleme (Faz 1 - RICE: 4.00) Performance
+-- [YENi] Coklu AI Provider Destegi (Gemini + Qwen + secilebilir)
+-- #11 Sablon Marketi (Parking Lot - Faz 2)

KATEGORI C: SUNUM DENEYIMI & CIKTI (4 ozellik)
+-- #13 Sinematik Gecisler (Faz 1-2 - RICE: 2.45) Delighter
+-- #3  Cevrimdisi Sunum Modu (Faz 1 - RICE: 6.40) Must-have
+-- [YENi] PDF/PPT Disa Aktarma (Premium)
+-- [YENi] Bulut Depolama (AWS/GCP + IndexedDB hibrit)

KATEGORI D: PAYLASIM & KURUMSAL (Parking Lot - Faz 2-3)
+-- #8  Paylasalabilir Link
+-- #12 Kurumsal Lisans & Takim
+-- #20 Izleyici-Gudumlu Sunum
```

---

## FAZ 2: LEAN CANVAS (Guncellemis)

```
+------------------------------------------------------------------------------+
|                     LEAN CANVAS - DeepSlide v1.1                             |
+---------------------+---------------------+----------------------------------+
| PROBLEM             | COZUM               | TEMEL METRIKLER                  |
|                     |                     |                                  |
| 1. Sunum sirasinda  | 1. AI Gorsel Analizi| 1. Basariyla tamamlanan          |
|    kumandaya/PC'ye  |    (Qwen / Gemini   |    otonom sunum sayisi            |
|    bagimli kalarak  |    secilebilir)     | 2. Ortalama gorsel yukleme       |
|    vakit kaybetmek  |    min. 3 keyword   |    hacmi                         |
| 2. Yuzlerce gorsel  | 2. AI Ses Analizi   | 3. API ses algilama ve slayt     |
|    arasindan konusma|    (Gemini / Web    |    gecis hizi (gecikme ms)       |
|    aninda istenilen |    Speech secilebilir| 4. Ucretsizden premium'a         |
|    slayti bulamama  |    ses-metin ceviri) |    donusum orani                |
| 3. Dogal konusma    | 3. Dinamik          |                                  |
|    akisinin         |    Olceklendirme:   |                                  |
|    teknolojik       |    kelime soylenir ->|                                  |
|    kisitlamalarla   |    slayt buyur      |                                  |
|    bozulmasi        |                     |                                  |
|                     |                     |                                  |
| MEVCUT ALTERNATIFLER|                     |                                  |
| PowerPoint, Keynote |                     |                                  |
| Prezi (kati sirali  |                     |                                  |
| ve manuel mudahale) |                     |                                  |
+---------------------+---------------------+----------------------------------+
| BENZERSIZ DEGER     | HAKSIZ AVANTAJ      | KANALLAR                         |
| ONERISI             |                     |                                  |
|                     |                     |                                  |
| "Siz konusun,       | 1. Akilli Cakisma   | 1. Product Hunt & teknoloji      |
|  sunumunuz sizi     |    Cozumleyici      |    bloglari                      |
|  takip etsin."      | 2. Dogrusal olmayan | 2. LinkedIn B2B pazarlama        |
|                     |    (non-linear)     |    (ozellikle satis ekipleri)    |
| KONSEPT:            |    konusma odakli   | 3. Girisimcilik etkinlikleri     |
| "Slaytlar icin      |    sunum motoru     |    (startup pitch) canli demo    |
|  Shazam"            | 3. Patent           |                                  |
|                     |    potansiyeli      | ERKEN BENIMSEYENLER              |
|                     |                     | Startup kuruculari ve            |
|                     |                     | saha satis ekipleri              |
+---------------------+---------------------+----------------------------------+
| MUSTERI             | GELIR AKISLARI      | MALIYET YAPISI                   |
| SEGMENTLERI         |                     |                                  |
|                     |                     | DEGISKEN GIDERLER:               |
| 1. Is Adamlari &   | FREEMIUM:           | - Gemini API (Ses-Metin)         |
|    Yoneticiler      | Max 100 resim       |   kullanim token maliyeti        |
| 2. Start-up         | yukleme kapasitesi  | - Qwen API (Gorsel Analiz)       |
|    Kuruculari       | ile ucretsiz temel  |   istek maliyetleri              |
| 3. Satis            | kullanim            |                                  |
|    Profesyonelleri  |                     | SABIT GIDERLER:                  |
| 4. Profesyonel      | SAAS ABONELIK:      | - Optimizasyon ve AR-GE          |
|    Tanitim Uzmanlari| Sinirsiz resim,     |   maliyeti                       |
| 5. Akademisyenler   | AI DeepNote         | - Bulut sunucu ve medya          |
|                     | entegrasyonu,       |   depolama (AWS/GCP)             |
|                     | PDF/PPT disa        |                                  |
|                     | aktarma.            |                                  |
|                     | Aylik/Yillik        |                                  |
|                     | premium plan.       |                                  |
+---------------------+---------------------+----------------------------------+
```

---

## FAZ 3: FONKSIYONEL GEREKSINIMLER

### Is Gereksinimleri (BR)

| ID | Gereksinim | Basari Metrigi |
|----|-----------|----------------|
| BR-001 | Sunumcularin dogal konusma akisiyla sunum kontrolu | Otonom tamamlanan sunum >%80 |
| BR-002 | Sunum hazirlik suresinin %80 azaltilmasi | 100 gorsel icin <5dk |
| BR-003 | Donanim bagimliliginun ortadan kaldirilmasi | %70 sesle sunum tamamlama |
| BR-004 | Cevrimdisi ortamlarda kesintisiz sunum | Teknik kesinti <%2 |

### Fonksiyonel Gereksinimler (FR)

#### MODUL: Gorsel Yukleme & Depolama

**FR-001: Coklu Gorsel Yukleme**
- Oncelik: Must | Kaynak: Oneri #7, JTBD J5
- Sistem, kullanicinin surukle-birak veya dosya secici ile tek seferde 1-500 arasi gorsel (JPG, PNG, GIF, WebP) yuklemesini SAGLAMALIDIR.
- Kabul Kriteri: 200 JPEG suruklendiginde tumu kuyuga alinir, ilerleme cubugu gosterilir, gecersiz dosyalar uyariyla atlanir
- Test: TC-UAT-001

**FR-002: Otomatik Thumbnail Olusturma**
- Oncelik: Must | Kaynak: Oneri #7, #2
- Sistem, yuklenen her gorsel icin istemci tarafinda 200px thumbnail (grid icin) ve 1024px versiyon (AI analiz icin) OLUSTURMALIDIR.
- Kabul Kriteri: 3 versiyon olusturulur (orijinal, 1024px, 200px), thumbnail grid'de gosterilir
- Test: TC-UAT-002

**FR-003: Hibrit Depolama (IndexedDB + Bulut)**
- Oncelik: Must | Kaynak: Oneri #3, Canvas (AWS/GCP)
- Sistem, gorselleri varsayilan olarak IndexedDB'de DEPOLAMALIDIR. Premium kullanicilar icin AWS/GCP bulut depolama secenegi SUNMALIDIR.
- Kabul Kriteri: Yerel modda IndexedDB'ye kaydedilir, bulut modunda (premium) AWS S3/GCP'ye yuklenir
- Test: TC-UAT-003

#### MODUL: AI Gorsel Analizi (Coklu Provider)

**FR-004: Secilebilir AI Gorsel Analiz Provider'i**
- Oncelik: Must | Kaynak: Canvas (Qwen + Gemini)
- Sistem, gorsel analiz icin birden fazla AI provider DESTEKLEMELDDIR (Qwen API, Gemini API). Kullanici ayarlardan tercih edilen provider'i SECEBILMELIDIR.
- Kabul Kriteri: Ayarlarda "Qwen" veya "Gemini" secildiginde sonraki analizler secilen provider ile yapilir
- Test: TC-UAT-004

**FR-005: Otomatik Anahtar Kelime Cikarma**
- Oncelik: Must | Kaynak: Oneri #7, Canvas (min. 3 keyword)
- Sistem, secilen AI provider'i kullanarak her gorsel icin en az 3, en fazla 15 anahtar kelime CIKARMALIDIR. Her keyword: text, confidence (0-1), category ICERMELIDIR.
- Kabul Kriteri: Her gorselde 3-15 keyword, confidence 0-1 arasi, kategori atanmis
- Test: TC-UAT-005

**FR-006: Batch Analiz & Eszamanlilik Kontrolu**
- Oncelik: Must | Kaynak: Oneri #7
- Sistem, birden fazla gorseli en fazla 5 paralel API istegi ile analiz ETMELI, basarisiz istekleri 3 denemeye kadar exponential backoff ile YENIDEN DENEMLIDIR.
- Kabul Kriteri: Ayni anda max 5 istek, her tamamlanan durumu aninda gunceller
- Test: TC-UAT-006

**FR-007: Analiz Ilerleme Gostergesi**
- Oncelik: Should | Kaynak: Oneri #7
- Sistem, batch analiz sirasinda her gorselin durumunu (pending/analyzing/completed/failed) gercek zamanli GOSTERMELIDIR.
- Kabul Kriteri: Durum aninda guncellenir, tamamlanma yuzdesi gosterilir
- Test: TC-UAT-007

**FR-008: Anahtar Kelime Duzenleme**
- Oncelik: Must | Kaynak: Brainstorm #5
- Sistem, AI tarafindan cikarilan anahtar kelimeleri inline DUZENLEMEYI, SILMEYI, yeni keyword EKLEMEYI ve esanlamli (synonym) EKLEMEYI SAGLAMALIDIR.
- Kabul Kriteri: Inline editor acilir, kelime duzenlenebilir, silinebilir, synonym eklenebilir
- Test: TC-UAT-008

#### MODUL: Grid Canvas & Duzenleme

**FR-009: Grid Canvas Goruntuleme**
- Oncelik: Must | Kaynak: Oneri #2, JTBD J1
- Sistem, tum gorselleri ayarlanabilir sutun sayisiyla (3/4/5) virtualized grid duzeninde GOSTERMELIDIR. DOM'da en fazla 20 oge render edilmelidir.
- Kabul Kriteri: 200 gorsel grid'de, kaydirma 60fps, DOM'da max 20 element
- Test: TC-UAT-009

**FR-010: AI Tabanli Gorsel Kumeleme**
- Oncelik: Should | Kaynak: Oneri #2
- Sistem, anahtar kelime benzerligine gore gorselleri otomatik GRUPLAMAL ve benzer gorselleri grid'de yan yana YERLESTIRMELIDIR.
- Kabul Kriteri: "Otomatik Duzenle" butonuyla gorseller kumelenir
- Test: TC-UAT-010

**FR-011: Surukle-Birak Yeniden Duzenleme**
- Oncelik: Should | Kaynak: Oneri #2
- Sistem, kullanicinin grid uzerinde gorselleri surukle-birak ile yeniden SIRALAYABILMESINI SAGLAMALIDIR.
- Kabul Kriteri: Gorsel yeni konuma yerlesir, siralama kaydedilir
- Test: TC-UAT-011

#### MODUL: Ses Tanima & Eslestirme

**FR-012: Secilebilir Ses Tanima Provider'i**
- Oncelik: Must | Kaynak: Canvas (Gemini ses-metin), Brainstorm #1
- Sistem, ses tanima icin birden fazla provider DESTEKLEMELDIR: Web Speech API (tarayici, ucretsiz), Gemini API (yuksek dogruluk, ucretli), Whisper WASM (cevrimdisi). Kullanici SECEBILMELIDIR.
- Kabul Kriteri: Provider secildikten sonra ses tanima o provider ile calisir. Cevrimdisiysa Whisper'a fallback
- Test: TC-UAT-012

**FR-013: Gercek Zamanli Ses-Metin Cevirisi**
- Oncelik: Must | Kaynak: Oneri #1, JTBD J1, J3
- Sistem, sunum modunda kullanicinin konusmasini secilen provider ile surekli dinleyerek metne CEVIRMELI ve interim sonuclari ISLEMLIDIR.
- Kabul Kriteri: Konusma 500ms icinde metne donusur, interim sonuclar islenir
- Test: TC-UAT-013

**FR-014: Dil Secimi**
- Oncelik: Should | Kaynak: Brainstorm (coklu dil)
- Sistem, ses tanima dilini BCP-47 formatinda SECEBILMEYI SAGLAMALIDIR (en az: tr-TR, en-US, en-GB, de-DE).
- Test: TC-UAT-014

**FR-015: Anahtar Kelime Eslestirme Motoru**
- Oncelik: Must | Kaynak: Oneri #1, Canvas (Akilli Cakisma Cozumleyici)
- Sistem, konusmadan gelen kelimeleri inverted index uzerinden exact match + Levenshtein fuzzy matching ile ESLESTIRMELIDIR. Threshold ayarlanabilir (varsayilan: 0.7).
- Kabul Kriteri: Esleme 300ms icinde, threshold ustu sonuclar aktif isaretlenir
- Test: TC-UAT-015

**FR-016: Dinamik Olceklendirme (Zoom/Scale)**
- Oncelik: Must | Kaynak: Oneri #1, Canvas
- Sistem, eslesen gorseli spring animasyonla ayarlanabilir olcege (varsayilan 1.8x) BUYUTMELI, eslesemyenleri KARARTMALIDIR (brightness: 0.7). GPU-accelerated.
- Kabul Kriteri: Gorsel 500ms'de 1.8x buyur, FPS 60 altina dusmez
- Test: TC-UAT-016

**FR-017: Temporal Decay (Zamansal Azalma)**
- Oncelik: Must | Kaynak: Oneri #1
- Sistem, esleme tetiklenmezse her 2 saniyede relevance skorunu 0.1 azaltmali, 0.3 altinda varsayilan boyutuna GERI DONDURMELIDIR.
- Kabul Kriteri: 10 saniye sessizlikten sonra gorsel normal boyuta doner
- Test: TC-UAT-017

**FR-018: Spotlight Modu (Coklu Esleme Cozucu)**
- Oncelik: Should | Kaynak: Oneri #5, Canvas (Akilli Cakisma Cozumleyici)
- Sistem, bir keyword birden fazla gosel ile eslstiginde tum eslsenleri parlakLastirarak VURGULAMALI, sunumcunun sesli ("birinci") veya dokunarak birini SECMESINE izin VERMALIDIR.
- Kabul Kriteri: Coklu esleme'de gorseller parlaklasr, secim yapilir
- Test: TC-UAT-018

#### MODUL: Sunum Modu

**FR-019: Fullscreen Sunum Modu**
- Oncelik: Must | Kaynak: Oneri #19
- Sistem, sunum moduna gecildiginde tam ekran YAPMALI, tum UI ogelerini GIZLEMELI, ses tanimayi otomatik BASLATMALIDIR.
- Kabul Kriteri: Fullscreen aktif, toolbar/sidebar kaybolur, ses tanima baslar
- Test: TC-UAT-019

**FR-020: Adaptif UI**
- Oncelik: Should | Kaynak: Oneri #19 (revize)
- Sistem, sunum modunda 3 saniye etkilesim olmazsa UI'i GIZLEMELI, ekranin alt %10'una dokunuldigunda kontrol panelini 200ms'de GERI GETIRMELIDIR.
- Kabul Kriteri: UI gizlenir, dokunmayla geri gelir, 5sn sonra tekrar kaybolur
- Test: TC-UAT-020

**FR-021: Sunum Provasi Modu**
- Oncelik: Should | Kaynak: Oneri #4, JTBD J4
- Sistem, kullanicinin sunum oncesi konusarak keyword esLesmelerini TEST EDEBILECEGI bir prova modu SAGLAMALIDIR. Guven skoru verilmelidir.
- Kabul Kriteri: Eslesen kelimeler yesil, eslesmeyenler kirmizi, prova sonunda guven skoru %
- Test: TC-UAT-021

**FR-022: Cevrimdisi Sunum Destegi**
- Oncelik: Must | Kaynak: Oneri #3, JTBD J4
- Sistem, gorseller ve anahtar kelimeler analiz edildikten sonra internet olmadan sunum YAPILMASINI SAGLAMALIDIR. Ses tanima Whisper WASM'a fallback yapar.
- Kabul Kriteri: Sunum cevrimdisi kesintisiz calisir
- Test: TC-UAT-022

**FR-023: Klavye Kisayollari**
- Oncelik: Should | Kaynak: Sunum deneyimi
- Sistem, sunum modunda klavye kisayollarini DESTEKLEMELDIR: Space (duraklat/devam), Escape (cikis), ok tuslari (manuel navigasyon).
- Test: TC-UAT-023

**FR-024: Canli Transkript Gosterimi**
- Oncelik: Could | Kaynak: Brainstorm #8
- Sistem, sunum modunda konusmanin canli transkriptini ekranin alt kisminda GOSTEREBILMELIDIR (acilip kapanabilir).
- Test: TC-UAT-024

#### MODUL: Cikti & Paylasim

**FR-025: PDF/PPT Disa Aktarma**
- Oncelik: Should (Premium) | Kaynak: Canvas gelir modeli
- Sistem, sunumu PDF ve PowerPoint formatlarinda DISA AKTARABILMELIDIR.
- Kabul Kriteri: Grid duzeni, keyword'ler ve gorsel siralamasi korunarak dosya olusturulur
- Test: TC-UAT-025

**FR-026: Sinematik Gecis Efektleri**
- Oncelik: Could | Kaynak: Oneri #13
- Sistem, gorseller arasi gecislerde temel Ken Burns zoom efekti SAGLAMALIDIR.
- Test: TC-UAT-026

### FR Ozet Tablosu

| ID | Baslik | MoSCoW | Modul |
|----|--------|--------|-------|
| FR-001 | Coklu Gorsel Yukleme | Must | Yukleme |
| FR-002 | Otomatik Thumbnail | Must | Yukleme |
| FR-003 | Hibrit Depolama | Must | Yukleme |
| FR-004 | Coklu Gorsel Analiz API | Must | AI Analiz |
| FR-005 | Otomatik Keyword Cikarma | Must | AI Analiz |
| FR-006 | Batch Analiz Eszamanlilik | Must | AI Analiz |
| FR-007 | Analiz Ilerleme Gostergesi | Should | AI Analiz |
| FR-008 | Keyword Duzenleme | Must | AI Analiz |
| FR-009 | Grid Canvas (Virtualized) | Must | Grid |
| FR-010 | AI Gorsel Kumeleme | Should | Grid |
| FR-011 | Surukle-Birak Duzenleme | Should | Grid |
| FR-012 | Coklu Ses Tanima Motor | Must | Ses |
| FR-013 | Gercek Zamanli Ses-Metin | Must | Ses |
| FR-014 | Dil Secimi | Should | Ses |
| FR-015 | Keyword Eslestirme Motoru | Must | Ses |
| FR-016 | Dinamik Olceklendirme | Must | Ses |
| FR-017 | Temporal Decay | Must | Ses |
| FR-018 | Spotlight Modu | Should | Ses |
| FR-019 | Fullscreen Sunum Modu | Must | Sunum |
| FR-020 | Adaptif UI | Should | Sunum |
| FR-021 | Sunum Provasi | Should | Sunum |
| FR-022 | Cevrimdisi Sunum | Must | Sunum |
| FR-023 | Klavye Kisayollari | Should | Sunum |
| FR-024 | Canli Transkript | Could | Sunum |
| FR-025 | PDF/PPT Export | Should | Cikti |
| FR-026 | Sinematik Gecisler | Could | Cikti |

**Must: 14 | Should: 8 | Could: 4**

---

## FAZ 4: NON-FONKSIYONEL GEREKSINIMLER

| ID | Baslik | Kategori | Metrik | Oncelik |
|----|--------|----------|--------|---------|
| NFR-PERF-001 | Sayfa Yukleme | Performans | FCP < 1.5s (25Mbps) | Kritik |
| NFR-PERF-002 | Grid Render | Performans | 500 gorselde 60fps, DOM < 25 | Kritik |
| NFR-PERF-003 | Animasyon | Performans | 60fps, GPU-composited only | Kritik |
| NFR-PERF-004 | Ses Esleme Gecikme | Performans | Kelime -> zoom < 500ms (p95) | Kritik |
| NFR-PERF-005 | Batch Analiz Suresi | Performans | 100 gorsel < 120s | Yuksek |
| NFR-PERF-006 | Gorsel Yukleme | Performans | 100 gorsel thumbnail < 30s | Yuksek |
| NFR-SEC-001 | API Key Gizliligi | Guvenlik | Istemcide API key yok | Kritik |
| NFR-SEC-002 | Veri Iletim | Guvenlik | TLS 1.3+ zorunlu | Kritik |
| NFR-SEC-003 | Gorsel Gizliligi | Guvenlik | Sunucuda gorsel saklanmaz | Yuksek |
| NFR-USE-001 | Onboarding | Kullanilabilirlik | Ilk sunum < 3dk (10 gorsel) | Yuksek |
| NFR-USE-002 | Erisebilirlik | Kullanilabilirlik | WCAG 2.1 AA uyumlu | Orta |
| NFR-COMP-001 | Tarayici Uyumu | Uyumluluk | Chrome 90+, Edge 90+, Safari 15+ | Yuksek |
| NFR-COMP-002 | KVKK/GDPR | Uyumluluk | Veri koruma yasalarina uygun | Yuksek |
| NFR-REL-001 | Cevrimdisi Dayaniklilik | Guvenilirlik | Internet kesildiginde sunum devam eder | Kritik |
| NFR-REL-002 | IndexedDB Kapasite | Guvenilirlik | %80 dolunca uyari | Orta |
| NFR-MAINT-001 | Kod Kalitesi | Bakilabilirlik | TS strict, ESLint 0 error, test >%70 | Yuksek |
| NFR-SCALE-001 | API Adapter Esnekligi | Olceklenebilirlik | Yeni API 1 is gununde entegre | Yuksek |

---

## FAZ 5: USE CASE DIYAGRAMLARI + USER STORY MAPPING

### Use Case Diyagramlari

```
USE CASE: SUNUM OLUSTURMA
=========================
Sunumcu --> (UC-001: Gorsel Yukle)
              |-- <<include>> --> (UC-002: Thumbnail Olustur)
              |-- <<include>> --> (UC-003: AI Gorsel Analiz)
              |       |-- <<extend>> --> (UC-003a: Gemini)
              |       |-- <<extend>> --> (UC-003b: Qwen)
Sunumcu --> (UC-004: Keyword Duzenle)
Sunumcu --> (UC-005: Grid Duzenle)
              |-- <<extend>> --> (UC-006: PDF/PPT Export)


USE CASE: SUNUM YAPMA
=====================
Sunumcu --> (UC-010: Sunum Moduna Gir)
              |-- <<include>> --> (UC-011: Ses Tanima Baslat)
              |       |-- <<extend>> --> (UC-011a: WebSpeech)
              |       |-- <<extend>> --> (UC-011b: Gemini)
              |       |-- <<extend>> --> (UC-011c: Whisper)
              |-- <<include>> --> (UC-012: Keyword Eslestir)
              |-- <<include>> --> (UC-013: Gorsel Zoom/Scale)
              |       |-- <<extend>> --> (UC-014: Spotlight Cozucu)
Sunumcu --> (UC-015: Manuel Kontrol)
              |-- <<extend>> --> (UC-016: Prova Modu)
```

### Use Case Spesifikasyonlari

**UC-001: Gorsel Yukle**
- Aktor: Sunumcu
- On Kosul: Yeni sunum olusturma ekrani acik
- Ana Akis: Surukle-birak -> format dogrula -> ilerleme goster -> thumbnail olustur -> IndexedDB kaydet -> grid olustur
- Hata Akisi: Desteklenmeyen format -> hata mesaji | IndexedDB dolu -> kapasite uyarisi
- Ilgili FR: FR-001, FR-002

**UC-003: AI Gorsel Analiz**
- Aktor: Sunumcu (tetikler), Sistem (otomatik)
- On Kosul: Gorseller yuklenmis, API secilmis
- Ana Akis: Secilen API ile analiz baslat -> 1024px'e kucult -> API'ye gonder -> JSON keyword al -> badge goster
- Hata Akisi: API hatasi (429/503) -> 3 deneme backoff | Basarisiz -> "failed" isaretle + manuel keyword ekleme
- Ilgili FR: FR-005, FR-006, FR-004

**UC-011: Ses Tanima Baslat**
- Aktor: Sunumcu
- On Kosul: Sunum modunda, mikrofon izni verilmis
- Ana Akis: Motoru aktive et -> dinle -> interim sonuclari matcher'a gonder -> eslesen gorseli zoom yap
- Alternatif: Internet yoksa Whisper WASM fallback | Whisper yoksa manuel mod
- Ilgili FR: FR-012, FR-013, FR-015

**UC-014: Spotlight Cozucu**
- Aktor: Sunumcu
- On Kosul: Bir kelime birden fazla gosel ile eslesmis
- Ana Akis: Eslesen gorselleri parlak goster -> sunumcu secer -> secilen zoom yapar
- Alternatif: 3sn secim yapilmazsa en yuksek confidence secilir
- Ilgili FR: FR-018

**UC-016: Prova Modu**
- Aktor: Sunumcu
- On Kosul: Sunum olusturulmus, keyword'ler atanmis
- Ana Akis: Prova baslat -> konusmaya basla -> eslesen yesil/eslesmyen kirmizi -> guven skoru -> synonym onerisi
- Ilgili FR: FR-021

### User Story Map

```
BACKBONE: [Gorsel Yukle] -> [AI Analiz] -> [Duzenle] -> [Prova] -> [Sun] -> [Export]

FAZ 1 (MVP) - 17 Story:
US-001: Surukle-birak ile 500'e kadar gorsel yukleme
US-002: Grid'de gorselleri goruntuleme (3/4/5 sutun)
US-003: Gorsel analiz API secimi (Gemini/Qwen)
US-004: Secili API ile otomatik keyword cikarma
US-005: Analiz ilerlemesini gorme ve basarisiz olanlari tekrar deneme
US-006: Gemini veya Qwen arasinda secim yapabilme
US-007: Keyword badge'ine tiklayip duzenleme
US-008: Keyword'e synonym ekleyerek esleme oranini artirma
US-009: Grid'de gorselleri surukle-birakla yeniden siralama
US-010: Sunum moduna girip sesle gorsel kontrol etme
US-011: Eslsen gorselin spring animasyonla buyumesi
US-012: Konu degisince gorsellerin kademeli kuculmesi
US-013: Ses tanima motorunu secebilme (WebSpeech/Gemini/Whisper)
US-014: Prova modunda keyword eslemelerini test etme
US-015: Coklu eslemede spotlight ile secim yapma
US-016: Adaptif UI - UI gizlenip dokunmayla geri gelmeli
US-017: Cevrimdisiyken sunum yapabilme

FAZ 2 (BUYUME) - 6 Story:
US-020: PDF/PPT export
US-021: Bulut depolama ile cihazlar arasi erisim
US-022: Link ile sunum paylasimi
US-023: AI otomatik gorsel kumeleme
US-024: Sinematik gecis efektleri
US-025: Sunum sonrasi analitik rapor

FAZ 3 (VIZYON) - 5 Story:
US-030: El hareketleriyle sunum kontrol
US-031: Izleyicilerin sunum akisini etkilemesi
US-032: AI sunum sirasi onerme
US-033: Ayni gorsellerden farkli uzunlukta sunumlar
US-034: Hazir sektorel sablonlar
```

---

## FAZ 6: BALIK KILCIGI + SWOT + IS KURALLARI

### Balik Kilcigi (Ishikawa)

```
PROBLEM: "Sunumcu dogru gorseli zamaninda bulamiyor"

  Insan                Teknoloji            Surec               Veri
    |                    |                    |                    |
    +- Slayt numarasini  +- Kumanda sinyal    +- Slaytlar         +- Yuzlerce
    |  hatirlayamiyor    |  kaybi/pil bitimi  |  dogrusal         |  gorsel arasinda
    +- Stres altinda     +- HDMI/VGA baglanti |  siralanmis       |  indeksleme yok
    |  dusunme kapasi-   |  sorunlari         +- Her slayt ayri   +- Gorsellere
    |  tesi dusuyor      +- Laptop/sunum      |  dosya, arama yok |  metadata yok
    +- Izleyicilerle     |  yazilimi uyum-    |                    |
    |  goz temasi        |  suzlugu           |                    |
    |  kopuyor           |                    |                    |

5 Neden -> KOK NEDEN:
Gercek zamanli ses tanima + AI gorsel anlama teknolojisi ilk kez
yeterli dogruluk ve hiza ulasti — dogrusal olmayan sunum artik
teknik olarak mumkun.
```

### SWOT Analizi

| | Olumlu | Olumsuz |
|---|--------|---------|
| **Ic** | **GUCLU:** First mover, coklu API esnekligi, istemci-first gizlilik, "Shazam for slides" positioning, non-linear paradigma | **ZAYIF:** Ses tanima ortama bagimli, coklu API karmasikligi, tek kisilik ekip, Turkce tanima dusuk, ogrenme egrisi riski |
| **Dis** | **FIRSAT:** AI sunum pazari $15B+ %12 CAGR, uzaktan calisma talebi, ses tanima gelisiyor, universite/konferans pazari bos, patent firsati | **TEHDIT:** Google/MS ayni ozelligi ekleyebilir, API fiyat degisikligi, tarayici API deprecation, Canva/Gamma rakipleri, gizlilik endiseleri |

### Is Kurallari

| ID | Kategori | Kural | Ilgili FR |
|----|----------|-------|-----------|
| BR-001 | Kisit | Ucretsiz kullanicilar max 100 gorsel/sunum | FR-001 |
| BR-002 | Hesaplama | Fuzzy match: 1 - (Levenshtein/max_uzunluk), esik: 0.7 | FR-015 |
| BR-003 | Tetikleyici | Temporal decay: her 2sn'de -0.1, <0.3'te geri kucul | FR-017 |
| BR-004 | Kisit | API anahtarlari istemciye gonderilmez | FR-004 |
| BR-005 | Karar | Batch: max 5 paralel, backoff 1s/2s/4s, max 3 deneme | FR-006 |
| BR-006 | Tetikleyici | Spotlight: 3sn secim yapilmazsa en yuksek confidence secilir | FR-018 |
| BR-007 | Kisit | Tek dosya max 20MB, formatlar: JPEG, PNG, GIF, WebP | FR-001 |

---

## FAZ 7: STORYBOARD + PROTOTIP SENARYOLARI

### Storyboard 1: Ilk Sunum Olusturma
**Kullanici:** Fatma (Is Kadini, pazarlama sunumu)
**JTBD:** J5

```
[SAHNE 1]         [SAHNE 2]         [SAHNE 3]         [SAHNE 4]
Fatma 50 urun  -> Ilerleme cubugu -> Grid'de 50     -> Birkac keyword'u
fotografini       "Analiz: 35/50"   gorsel, keyword    duzenliyor
surukle-birak     Her tamamlanan     badge'leri        "satis" yerine
ile yukluyor      gorselde keyword   gorunuyor         "kampanya" yaziyor
                  beliriyor
Duygu: Merakli    Duygu: Mutlu      Duygu: Saskin     Duygu: Mutlu
```

### Storyboard 2: Sesle Sunum Yapma
**Kullanici:** Ali (Akademisyen, 200 gorsel)
**JTBD:** J1, J3

```
[SAHNE 1]         [SAHNE 2]         [SAHNE 3]         [SAHNE 4]
Ali "Sunuma     -> "...molekulun   -> Ogrenci soruyor -> Ali "goster-
Basla"ya          yapisi..."         "enzim yapisini    iyorum" der,
tikliyor.         "molekul" gorseli  tekrar gosterir    3 gorsel parlar
Fullscreen +      zoom yapar         misiniz?"          "ikinci" der
yaka mik takili                                         -> secim yapilir
Duygu: Normal     Duygu: Mutlu      Duygu: Endiseli   Duygu: Sevinc
```

### Storyboard 3: Sunum Oncesi Prova
**Kullanici:** Emre (Startup kurucusu, pitch)
**JTBD:** J4

```
[SAHNE 1]         [SAHNE 2]         [SAHNE 3]         [SAHNE 4]
Emre prova     -> "Gelir modelimiz" -> Prova biter    -> Emre synonym
modunu           "gelir" yesil       Guven skoru: %78   ekler, skor
baslatiyor       "buyume hacmi"      Kirmizi kelimeler   %91'e cikar
                 kirmizi - esleme    listelenir          Sahneye hazir!
                 yok                 synonym onerilir
Duygu: Merakli   Duygu: Endiseli    Duygu: Merakli    Duygu: Sevinc
```

### Prototip Senaryolari

**PS-001: Ilk Kez Sunum Olusturma (Fatma)**
- Adimlar: Siteyi ac -> Yeni Sunum -> 50 gorsel surukle -> API sec (Gemini) -> Analiz baslar -> 90sn'de tamam -> 3 keyword duzenle -> Onizle -> Kaydet
- Basari: Tum surec < 5dk
- Edge Case: 5 gorsel basarisiz -> "Tekrar Dene" + manuel keyword

**PS-002: Cevrimdisi Acil Sunum (Ali)**
- Adimlar: Laptop ac -> Sunum listesi IndexedDB'den -> Sunumu sec -> "Sunuma Basla" -> Internet yok algilanir -> Whisper WASM fallback -> Konusmaya basla -> Eslesmeler calisir
- Basari: Cevrimdisi kesintisiz
- Edge Case: Whisper modeli indirilmemis -> Manuel mod onerisi

**PS-003: Gurultulu Ortam (Emre)**
- Adimlar: Yaka mik tak -> Sunum modu -> Ses tanima baslar -> Gurultuden yanlis algilanir -> Alt kenara dokun -> Adaptif UI gelir -> Threshold'u 0.8'e cikart -> Dokunarak gorsel sec (fallback)
- Basari: Yanlis gorsel <%5
- Edge Case: Ses tanima tamamen basarisiz -> Manuel mod + ok tuslari

---

## FAZ 8: UAT PLANI + RTM + DoR/DoD

### UAT Test Senaryolari

| ID | Baslik | Ilgili FR | Oncelik |
|----|--------|-----------|---------|
| TC-UAT-001 | Toplu Gorsel Yukleme (200 dosya) | FR-001 | Kritik |
| TC-UAT-002 | Gemini API ile Keyword Cikarma | FR-005, FR-004 | Kritik |
| TC-UAT-003 | Qwen API ile Keyword Cikarma | FR-005, FR-004 | Kritik |
| TC-UAT-004 | Sesle Gorsel Navigasyon (Web Speech) | FR-013, FR-015, FR-016 | Kritik |
| TC-UAT-005 | Sesle Gorsel Navigasyon (Gemini API) | FR-013, FR-012 | Yuksek |
| TC-UAT-006 | Fuzzy Matching Dogrulugu | FR-015 | Yuksek |
| TC-UAT-007 | Spotlight Modu | FR-018 | Yuksek |
| TC-UAT-008 | Prova Modu | FR-021 | Yuksek |
| TC-UAT-009 | Cevrimdisi Sunum | FR-022, FR-012 | Yuksek |
| TC-UAT-010 | Adaptif UI | FR-019, FR-020 | Yuksek |
| TC-UAT-011 | PDF Export | FR-025 | Orta |
| TC-UAT-012 | API Secimi Degistirme | FR-004, FR-012 | Yuksek |

### Gereksinim Izlenebilirlik Matrisi (RTM)

```
BR ID  | FR ID   | NFR ID       | UC ID  | US ID  | TC ID      | MoSCoW
-------|---------|--------------|--------|--------|------------|-------
BR-002 | FR-001  | NFR-PERF-006 | UC-001 | US-001 | TC-UAT-001 | Must
BR-002 | FR-002  | NFR-PERF-006 | UC-001 | US-001 | TC-UAT-001 | Must
BR-004 | FR-003  | NFR-SEC-003  | UC-001 | US-001 | TC-UAT-001 | Must
BR-002 | FR-004  | NFR-SCALE-01 | UC-003 | US-003 | TC-UAT-012 | Must
BR-002 | FR-005  | NFR-PERF-005 | UC-003 | US-004 | TC-UAT-002 | Must
BR-002 | FR-006  | NFR-PERF-005 | UC-003 | US-005 | TC-UAT-002 | Must
BR-002 | FR-007  |              | UC-003 | US-005 | TC-UAT-002 | Should
BR-001 | FR-008  |              | UC-004 | US-007 | TC-UAT-006 | Must
BR-001 | FR-009  | NFR-PERF-002 | UC-005 | US-002 | TC-UAT-001 | Must
BR-002 | FR-010  |              | UC-005 | US-009 | TC-UAT-001 | Should
BR-002 | FR-011  |              | UC-005 | US-009 | TC-UAT-001 | Should
BR-001 | FR-012  | NFR-SCALE-01 | UC-011 | US-013 | TC-UAT-012 | Must
BR-001 | FR-013  | NFR-PERF-004 | UC-011 | US-010 | TC-UAT-004 | Must
BR-001 | FR-014  |              | UC-011 | US-013 | TC-UAT-014 | Should
BR-001 | FR-015  | NFR-PERF-004 | UC-012 | US-010 | TC-UAT-006 | Must
BR-001 | FR-016  | NFR-PERF-003 | UC-013 | US-011 | TC-UAT-004 | Must
BR-001 | FR-017  |              | UC-013 | US-012 | TC-UAT-004 | Must
BR-001 | FR-018  |              | UC-014 | US-015 | TC-UAT-007 | Should
BR-003 | FR-019  |              | UC-010 | US-010 | TC-UAT-010 | Must
BR-003 | FR-020  |              | UC-010 | US-016 | TC-UAT-010 | Should
BR-001 | FR-021  |              | UC-016 | US-014 | TC-UAT-008 | Should
BR-004 | FR-022  | NFR-REL-001  | UC-010 | US-017 | TC-UAT-009 | Must
BR-003 | FR-023  |              | UC-015 | US-010 | TC-UAT-010 | Should
BR-001 | FR-024  |              | UC-011 | US-010 |     —      | Could
BR-002 | FR-025  |              | UC-006 | US-020 | TC-UAT-011 | Should
BR-001 | FR-026  | NFR-PERF-003 | UC-013 | US-024 |     —      | Could
```

### Definition of Ready (DoR)

- [ ] Bagimsiz: Diger story'lere bagimliligi yok veya cozulmus
- [ ] Tartisalabilir: Kabul kriterleri yazili ama detaylar esnek
- [ ] Degerli: Is degeri tanimli, JTBD'ye baglanmis
- [ ] Tahmin edilebilir: Takim story point verebiliyor
- [ ] Kucuk: 3-5 gunde tamamlanabilir
- [ ] Test edilebilir: Kabul kriterleri acik ve test yazilabilir
- [ ] Mockup/wireframe ekli (UI gerektiriyorsa)
- [ ] Bagimliliklar tanimli (API, IndexedDB, 3. parti)
- [ ] NFR'ler bagli (performans, guvenlik)
- [ ] API endpoint/format belirlenmis
- [ ] Paydas onayi alinmis

### Definition of Done (DoD)

**Gelistirme:**
- [ ] Kod yazildi ve peer review yapildi
- [ ] TypeScript strict mode, 0 type error
- [ ] ESLint 0 error
- [ ] Unit testler yazildi (kapsam > %70)
- [ ] Kod ana branch'e merge edildi
- [ ] CI pipeline gecti

**Test:**
- [ ] Kabul kriterlerine gore test edildi
- [ ] Regresyon testleri gecti
- [ ] Edge case ve hata senaryolari test edildi
- [ ] NFR'ler dogrulandi
- [ ] Chrome + Safari'de test edildi

**Is Analizi:**
- [ ] Ozellik spesifikasyona uygun calisiyor
- [ ] Kabul kriterleri karsilandi
- [ ] RTM guncellendi

---

## IMZA FORMU

```
IS ANALIZI PLANI - ONAY FORMU
==============================
Proje: DeepSlide - AI Destekli Sunum Uygulamasi
Tarih: 2026-04-05
Versiyon: v1.1

TESLIMATLAR:
[x] Affinity Diagram
[x] Lean Canvas
[x] Fonksiyonel Gereksinimler (FR) - 26 adet
[x] Non-Fonksiyonel Gereksinimler (NFR) - 17 adet
[x] Use Case Diyagramlari - 2 adet (16 UC)
[x] Use Case Spesifikasyonlari - 5 adet
[x] User Story Map - 17 MVP + 6 Faz2 + 5 Faz3
[x] Balik Kilcigi Analizi - 1 adet
[x] SWOT Analizi
[x] Is Kurallari - 7 adet
[x] Storyboard - 3 adet
[x] Prototip Senaryolari - 3 adet
[x] UAT Plani - 12 test senaryosu
[x] RTM (Gereksinim Izlenebilirlik Matrisi)
[x] DoR/DoD tanimlari

ONAYLAYANLAR:
Kurucu Uye (Emre): _________________ Tarih: ___
Elif Karaca (Kidemli BA): ___________ Tarih: ___
Murat Demir (BA): ___________________ Tarih: ___
Selin Yilmaz (BA): __________________ Tarih: ___
```
