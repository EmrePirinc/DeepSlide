# WBS.md — DeepSlide Faz 2B
**Kaynak:** SPEC.md (FR-001 → FR-019, 13 NFR)  
**Tarih:** 2026-04-09  
**Toplam Atomik Görev:** 42  
**Quality Gate:** 11  
**Paralel Grup:** 3  

---

## İÇİNDEKİLER

1. [Bağımsızlık Haritası](#bağımsızlık-haritası)  
2. [WBS Ağacı](#wbs-ağacı)  
3. [Quality Gate Tanımları](#quality-gate-tanımları)  
4. [Context Yönetimi Planı](#context-yönetimi-planı)  
5. [AI Prompt Templates](#ai-prompt-templates)  

---

## BAĞIMSIZLIK HARİTASI

```
GRUP A — Paralel Başlangıç (FR-001, 002, 003 aynı anda):
  [1.1.1.1.1] recordingService.ts ─┐
  [1.1.2.1.1] IndexedDB buffer    ─┤─ Birbirinden bağımsız, aynı anda başla
  [1.1.3.1.1] codecDetector.ts   ─┘

GRUP B — FR-006 tamamlanınca paralel:
  [1.2.1.1.1] transcriptStore.ts ─┐
  [1.3.1.1.1] useSubtitles.ts    ─┘─ transcriptStore bağımlı ama farklı dosya

GRUP C — Tüm Faz 2A bittikten sonra:
  [1.4.1.1.1] quiz/generate API  ─┐
  [1.4.2.1.1] liveStreamService  ─┘─ Birbirinden bağımsız

SİRALI ZİNCİRLER:
  FR-001 → FR-002 → FR-004 → FR-005
  FR-006 → FR-007 → FR-008 → FR-009
  FR-011 → FR-012 → FR-013
  FR-014 → FR-015 → FR-016
  FR-018 → FR-017 → FR-019
```

---

## WBS AĞACI

```
1.0 DEEPSLIDE FAZ 2B
├── 1.1 FAZ 2A — Video Kayıt (FR-001, 002, 003, 004, 005)
│   ├── 1.1.1 Kayıt Servisi (FR-001, FR-003)
│   │   ├── 1.1.1.1 Backend Kayıt Motoru
│   │   │   ├── 1.1.1.1.1 recordingService.ts — MediaRecorder soyutlaması
│   │   │   └── 1.1.1.1.2 codecDetector.ts — Tarayıcı codec tespiti
│   │   └── 1.1.1.2 Kayıt UI
│   │       ├── 1.1.1.2.1 RecordingButton.tsx — Başlat/durdur butonu
│   │       └── 1.1.1.2.2 RecordingTimer.tsx — Süre + kırmızı gösterge
│   ├── 1.1.2 Offline-First Altyapı (FR-002)
│   │   ├── 1.1.2.1 IndexedDB Tampon
│   │   │   ├── 1.1.2.1.1 recordingBuffer.ts — IndexedDB chunk yöneticisi
│   │   │   └── 1.1.2.1.2 uploadOrchestrator.ts — R2 yükleme orkestrasyonu
│   │   └── 1.1.2.2 API ve UI
│   │       ├── 1.1.2.2.1 /api/recording/upload route — Signed URL oluşturucu
│   │       └── 1.1.2.2.2 UploadProgress.tsx — Yükleme ilerleme göstergesi
│   ├── 1.1.3 Paylaşım Linki (FR-004, FR-005)
│   │   └── 1.1.3.1 Link ve Freemium
│   │       ├── 1.1.3.1.1 /api/recording/share route — Signed URL + TTL
│   │       ├── 1.1.3.1.2 ShareLinkModal.tsx — "Linki Kopyala" UI
│   │       └── 1.1.3.1.3 qualityGate.ts — 480p/1080p freemium kontrol
│   └── ── QUALITY GATE 1 — Video Kayıt ─────────────────────────────────
│
├── 1.2 FAZ 2A — AI Özet & E-posta (FR-006, 007, 008, 009, 010)
│   ├── 1.2.1 Transkript Store (FR-006)
│   │   └── 1.2.1.1 Store
│   │       └── 1.2.1.1.1 transcriptStore.ts — Zustand transkript + zaman damgası
│   ├── 1.2.2 Gemini Özet (FR-007)
│   │   ├── 1.2.2.1 API Route
│   │   │   └── 1.2.2.1.1 /api/summary/generate route — Gemini API entegrasyonu
│   │   └── 1.2.2.2 UI
│   │       └── 1.2.2.2.1 SummaryModal.tsx — Düzenlenebilir özet önizleme
│   ├── 1.2.3 E-posta Gönderimi (FR-008, FR-009)
│   │   ├── 1.2.3.1 Backend
│   │   │   ├── 1.2.3.1.1 /api/email/send route — Resend entegrasyonu
│   │   │   └── 1.2.3.1.2 SummaryEmail.tsx — React Email şablonu
│   │   └── 1.2.3.2 UI
│   │       └── 1.2.3.2.1 RecipientManager.tsx — Alıcı listesi yönetimi
│   ├── 1.2.4 Klip Üretici (FR-010)
│   │   └── 1.2.4.1 Klip
│   │       ├── 1.2.4.1.1 /api/clip/generate route — FFmpeg clip API
│   │       └── 1.2.4.1.2 ClipButton.tsx — "Klip Oluştur" UI
│   └── ── QUALITY GATE 2 — AI Özet & E-posta ───────────────────────────
│
├── 1.3 FAZ 2B — Canlı Alt Yazı (FR-011, 012, 013)
│   ├── 1.3.1 Alt Yazı Motoru (FR-011)
│   │   ├── 1.3.1.1 Hook
│   │   │   └── 1.3.1.1.1 useSubtitles.ts — WebSpeech/Deepgram adapter hook
│   │   └── 1.3.1.2 UI
│   │       └── 1.3.1.2.1 SubtitleStrip.tsx — Alt yazı şerit bileşeni
│   ├── 1.3.2 Deepgram Adapter (FR-011 Pro)
│   │   └── 1.3.2.1 Adapter
│   │       └── 1.3.2.1.1 deepgramAdapter.ts — WebSocket transkripsiyon
│   ├── 1.3.3 Çok Dilli (FR-012)
│   │   └── 1.3.3.1 Dil Seçici
│   │       └── 1.3.3.1.1 LanguageSelector.tsx — TR/EN/DE/FR dropdown
│   ├── 1.3.4 SRT Export (FR-013)
│   │   └── 1.3.4.1 Export
│   │       └── 1.3.4.1.1 srtExporter.ts — Transkript → SRT dönüşümü
│   └── ── QUALITY GATE 3 — Canlı Alt Yazı ────────────────────────────────
│
├── 1.4 FAZ 2B — Canlı Yarışma (FR-014, 015, 016)
│   ├── 1.4.1 Soru Üretimi (FR-014)
│   │   ├── 1.4.1.1 API
│   │   │   └── 1.4.1.1.1 /api/quiz/generate route — Gemini soru üretici
│   │   └── 1.4.1.2 UI
│   │       └── 1.4.1.2.1 QuizEditor.tsx — Soru düzenleme arayüzü
│   ├── 1.4.2 QR Katılım (FR-015)
│   │   └── 1.4.2.1 QR
│   │       ├── 1.4.2.1.1 QRCodeDisplay.tsx — 150x150px QR gösterici
│   │       └── 1.4.2.1.2 /app/join/[sessionId] page — Katılımcı sayfası
│   ├── 1.4.3 Firebase Realtime Cevap (FR-016)
│   │   ├── 1.4.3.1 Schema ve Hook
│   │   │   ├── 1.4.3.1.1 quizSchema.ts — Firebase RTDB şema tanımı
│   │   │   └── 1.4.3.1.2 useQuizRealtime.ts — Realtime cevap hook
│   │   └── 1.4.3.2 UI
│   │       └── 1.4.3.2.1 LiveLeaderboard.tsx — Gerçek zamanlı puan tablosu
│   └── ── QUALITY GATE 4 — Canlı Yarışma ─────────────────────────────────
│
├── 1.5 FAZ 2C — Canlı Yayın (FR-017, 018, 019)
│   ├── 1.5.1 Bağlantı Testi (FR-018)
│   │   └── 1.5.1.1 Test
│   │       ├── 1.5.1.1.1 /api/livestream/test route — 5sn test akışı
│   │       └── 1.5.1.1.2 ConnectionTestModal.tsx — Test UI + sonuç
│   ├── 1.5.2 LiveKit Yayın (FR-017)
│   │   ├── 1.5.2.1 Servis
│   │   │   ├── 1.5.2.1.1 liveStreamService.ts — LiveKit Ingress yöneticisi
│   │   │   └── 1.5.2.1.2 /api/livestream/token route — LiveKit JWT token
│   │   └── 1.5.2.2 UI
│   │       ├── 1.5.2.2.1 LiveStreamPanel.tsx — Stream key + başlat/durdur
│   │       └── 1.5.2.2.2 LiveStatusBadge.tsx — "CANLI" göstergesi
│   ├── 1.5.3 Yayın Arşivi (FR-019)
│   │   └── 1.5.3.1 Arşiv
│   │       ├── 1.5.3.1.1 /app/archive page — Arşiv liste sayfası
│   │       └── 1.5.3.1.2 /app/r/[id] page — Sunum portal sayfası
│   └── ── QUALITY GATE 5 — Canlı Yayın ────────────────────────────────────
│
└── ── QUALITY GATE 11 — FAZ 2B FULL REGRESSION ────────────────────────────
```

---

## ATOMIK GÖREV LİSTESİ (42 Görev)

### 1.1 FAZ 2A — Video Kayıt

#### 1.1.1.1 Kayıt Servisi

```
[WBS-1.1.1.1.1] recordingService.ts — MediaRecorder soyutlaması
  FR: FR-001, FR-003 | NFR: NFR-PERF-001, NFR-USE-001
  Sürüm: Faz 2A
  Bağımlılık: Yok (ilk görev)
  Paralel?: Evet — Grup A (1.1.2.1.1 ve 1.1.3.1.1 ile)
  Tahmini Süre: 6 saat

[WBS-1.1.1.1.2] codecDetector.ts — Tarayıcı codec tespiti
  FR: FR-003 | NFR: NFR-PERF-001
  Sürüm: Faz 2A
  Bağımlılık: 1.1.1.1.1 (recordingService içinde kullanılır)
  Paralel?: Hayır
  Tahmini Süre: 4 saat
```

#### 1.1.1.2 Kayıt UI

```
[WBS-1.1.1.2.1] RecordingButton.tsx — Başlat/durdur butonu
  FR: FR-001 | NFR: NFR-USE-001
  Sürüm: Faz 2A
  Bağımlılık: 1.1.1.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.1.1.2.2] RecordingTimer.tsx — Süre + kırmızı gösterge
  FR: FR-001 | NFR: NFR-USE-001
  Sürüm: Faz 2A
  Bağımlılık: 1.1.1.2.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat
```

**QUALITY GATE 1A — Kayıt Servisi**
```
Seviye: UNIT
☐ MediaRecorder başlatma ≤ 3sn (NFR-PERF-001)
☐ VP9+WebM Chrome'da çalışıyor
☐ AAC+MP4 Safari'de çalışıyor, banner görünüyor (FR-003)
☐ Kayıt butonu kırmızı yanıp sönüyor
☐ Timer doğru sayıyor
Checkpoint: git commit → "feat: recording service + UI"
```

#### 1.1.2.1 IndexedDB Tampon

```
[WBS-1.1.2.1.1] recordingBuffer.ts — IndexedDB chunk yöneticisi
  FR: FR-002 | NFR: NFR-REL-001, NFR-PERF-002
  Sürüm: Faz 2A
  Bağımlılık: Yok (Grup A)
  Paralel?: Evet — Grup A
  Tahmini Süre: 8 saat

[WBS-1.1.2.1.2] uploadOrchestrator.ts — R2 yükleme orkestrasyonu
  FR: FR-002 | NFR: NFR-PERF-002, NFR-SEC-002, NFR-REL-001
  Sürüm: Faz 2A
  Bağımlılık: 1.1.2.1.1
  Paralel?: Hayır
  Tahmini Süre: 8 saat
```

#### 1.1.2.2 API ve UI

```
[WBS-1.1.2.2.1] /api/recording/upload route — Signed URL oluşturucu
  FR: FR-002 | NFR: NFR-SEC-002
  Sürüm: Faz 2A
  Bağımlılık: 1.1.2.1.2
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.1.2.2.2] UploadProgress.tsx — Yükleme ilerleme göstergesi
  FR: FR-002 | NFR: NFR-USE-001
  Sürüm: Faz 2A
  Bağımlılık: 1.1.2.2.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat
```

**QUALITY GATE 1B — Offline-First Altyapı**
```
Seviye: INTEGRATION
☐ Ethernet çekilir → bağlantı gelince yükleme tamamlanır (NFR-REL-001)
☐ 500MB chunk boyutu aşılmıyor
☐ Paralel 3 chunk upload çalışıyor
☐ Signed URL 7 gün TTL doğru
☐ Anonim erişim 403 döner (NFR-SEC-002)
Checkpoint: git commit → "feat: offline-first R2 upload"
```

#### 1.1.3.1 Paylaşım Linki ve Freemium

```
[WBS-1.1.3.1.1] /api/recording/share route — Signed URL + TTL
  FR: FR-004 | NFR: NFR-SEC-002, NFR-COMP-002
  Sürüm: Faz 2A
  Bağımlılık: 1.1.2.2.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.1.3.1.2] ShareLinkModal.tsx — "Linki Kopyala" UI
  FR: FR-004 | NFR: NFR-USE-001
  Sürüm: Faz 2A
  Bağımlılık: 1.1.3.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.1.3.1.3] qualityGate.ts — 480p/1080p freemium kontrol
  FR: FR-005 | NFR: NFR-USE-001
  Sürüm: Faz 2A
  Bağımlılık: 1.1.1.1.1
  Paralel?: Evet — 1.1.3.1.1 ile paralel
  Tahmini Süre: 4 saat
```

**QUALITY GATE 1 — Video Kayıt (Faz 2A Sprint 1)**
```
Seviye: E2E
☐ Sunum modu → Kayıt başlat → R2 yükle → Link paylaş tam akış
☐ Ücretsiz kullanıcı 480p limit görüyor
☐ Pro kullanıcı 1080p indirebiliyor
☐ 7 gün TTL sonrası link 403 döner
☐ Tarayıcılar: Chrome ✓ Firefox ✓ Safari (banner) ✓
Checkpoint: git commit → "feat: video recording complete"
/clear → Faz 2A Email'e geç
```

---

### 1.2 FAZ 2A — AI Özet & E-posta

#### 1.2.1.1 Transkript Store

```
[WBS-1.2.1.1.1] transcriptStore.ts — Zustand transkript + zaman damgası
  FR: FR-006 | NFR: NFR-COMP-001
  Sürüm: Faz 2A
  Bağımlılık: Yok (speechStore'u genişletir)
  Paralel?: Evet — Grup B (1.3.1.1.1 ile)
  Tahmini Süre: 4 saat
```

**QUALITY GATE 2A — Transkript Store**
```
Seviye: UNIT
☐ Her cümle timestamp + text tuple olarak store'da
☐ Zustand devtools'da görünüyor
☐ 100 kelime eşiği doğru çalışıyor
Checkpoint: git commit → "feat: transcript store"
```

#### 1.2.2 Gemini Özet

```
[WBS-1.2.2.1.1] /api/summary/generate route — Gemini API entegrasyonu
  FR: FR-007 | NFR: NFR-PERF-004, NFR-MAINT-001, NFR-COMP-001
  Sürüm: Faz 2A
  Bağımlılık: 1.2.1.1.1
  Paralel?: Hayır
  Tahmini Süre: 6 saat

[WBS-1.2.2.2.1] SummaryModal.tsx — Düzenlenebilir özet önizleme
  FR: FR-007 | NFR: NFR-PERF-004
  Sürüm: Faz 2A
  Bağımlılık: 1.2.2.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat
```

**QUALITY GATE 2B — Gemini Özet**
```
Seviye: INTEGRATION
☐ 1 saatlik transkript → özet ≤ 30sn (NFR-PERF-004)
☐ Timeout → "Tekrar dene" butonu görünür
☐ "Onayla ve Gönder" adımı zorunlu, atlatılamıyor
☐ KVKK onay modalı bulut API öncesi çıkıyor (NFR-COMP-001)
☐ Özet düzenlenebiliyor
Checkpoint: git commit → "feat: gemini summary"
```

#### 1.2.3 E-posta Gönderimi

```
[WBS-1.2.3.1.1] /api/email/send route — Resend entegrasyonu
  FR: FR-008 | NFR: NFR-MAINT-001
  Sürüm: Faz 2A
  Bağımlılık: 1.2.2.1.1, 1.1.3.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.2.3.1.2] SummaryEmail.tsx — React Email şablonu
  FR: FR-008
  Sürüm: Faz 2A
  Bağımlılık: 1.2.3.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.2.3.2.1] RecipientManager.tsx — Alıcı listesi yönetimi
  FR: FR-009
  Sürüm: Faz 2A
  Bağımlılık: 1.2.3.1.1
  Paralel?: Evet — 1.2.3.1.2 ile paralel
  Tahmini Süre: 4 saat
```

**QUALITY GATE 2C — E-posta**
```
Seviye: INTEGRATION
☐ Onay → 60sn içinde tüm alıcılara mail gidiyor (FR-008)
☐ RFC 5322 geçersiz email → hata mesajı
☐ 0 alıcı → "Gönder" butonu devre dışı
☐ Resend API key .env'de, grep kontrolü geçiyor (NFR-MAINT-001)
Checkpoint: git commit → "feat: email sending"
```

#### 1.2.4 Klip Üretici

```
[WBS-1.2.4.1.1] /api/clip/generate route — FFmpeg clip API
  FR: FR-010 | NFR: NFR-PERF-002
  Sürüm: Faz 2B
  Bağımlılık: 1.1.2.2.1, 1.2.2.1.1
  Paralel?: Hayır
  Tahmini Süre: 8 saat

[WBS-1.2.4.1.2] ClipButton.tsx — "Klip Oluştur" UI
  FR: FR-010
  Sürüm: Faz 2B
  Bağımlılık: 1.2.4.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat
```

**QUALITY GATE 2 — AI Özet & E-posta (Faz 2A Sprint 2)**
```
Seviye: E2E
☐ Sunum biter → transkript → özet → alıcı → e-posta tam akış
☐ Klip ≤ 5dk içinde hazır (FR-010)
☐ KVKK onay reddi → özellik devre dışı, uygulama kilitlenmiyor
☐ Tarayıcılar: Chrome ✓ Firefox ✓
☐ REGRESSION: Video kayıt özellikleri hâlâ çalışıyor
Checkpoint: git commit → "feat: ai summary + email complete"
/clear → Faz 2B'ye geç
```

---

### 1.3 FAZ 2B — Canlı Alt Yazı

#### 1.3.1 Alt Yazı Motoru

```
[WBS-1.3.1.1.1] useSubtitles.ts — WebSpeech/Deepgram adapter hook
  FR: FR-011 | NFR: NFR-PERF-003, NFR-MAINT-001
  Sürüm: Faz 2B
  Bağımlılık: 1.2.1.1.1 (transcriptStore)
  Paralel?: Evet — Grup B
  Tahmini Süre: 6 saat

[WBS-1.3.1.2.1] SubtitleStrip.tsx — Alt yazı şerit bileşeni
  FR: FR-011 | NFR: NFR-PERF-003
  Sürüm: Faz 2B
  Bağımlılık: 1.3.1.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat
```

**QUALITY GATE 3A — Alt Yazı Motoru**
```
Seviye: UNIT
☐ Web Speech API ≤ 800ms gecikme (NFR-PERF-003)
☐ SubtitleStrip ekran altında görünüyor
☐ Mikrofon izni yoksa hata mesajı görünüyor
Checkpoint: git commit → "feat: subtitle hook + strip"
```

#### 1.3.2 Deepgram Adapter

```
[WBS-1.3.2.1.1] deepgramAdapter.ts — WebSocket transkripsiyon
  FR: FR-011 Pro | NFR: NFR-PERF-003, NFR-MAINT-001, NFR-COMP-001
  Sürüm: Faz 2B
  Bağımlılık: 1.3.1.1.1
  Paralel?: Hayır
  Tahmini Süre: 6 saat
```

**QUALITY GATE 3B — Deepgram**
```
Seviye: INTEGRATION
☐ Deepgram WebSocket ≤ 500ms (NFR-PERF-003)
☐ Pro kullanıcı Deepgram, ücretsiz WebSpeech alıyor
☐ KVKK onayı zorunlu (NFR-COMP-001)
☐ API key grep kontrolü (NFR-MAINT-001)
Checkpoint: git commit → "feat: deepgram adapter"
```

#### 1.3.3 Çok Dilli

```
[WBS-1.3.3.1.1] LanguageSelector.tsx — TR/EN/DE/FR dropdown
  FR: FR-012
  Sürüm: Faz 2B
  Bağımlılık: 1.3.1.1.1
  Paralel?: Evet — 1.3.2.1.1 ile paralel
  Tahmini Süre: 4 saat
```

#### 1.3.4 SRT Export

```
[WBS-1.3.4.1.1] srtExporter.ts — Transkript → SRT dönüşümü
  FR: FR-013
  Sürüm: Faz 2B
  Bağımlılık: 1.2.1.1.1 (transcriptStore)
  Paralel?: Evet — 1.3.3.1.1 ile paralel
  Tahmini Süre: 4 saat
```

**QUALITY GATE 3 — Canlı Alt Yazı (Faz 2B Sprint 3)**
```
Seviye: E2E
☐ Mikrofon izni → alt yazı görünür → dil değiştir → SRT indir tam akış
☐ Dil değişince önceki satırlar değişmiyor (FR-012)
☐ SRT geçerli SubRip formatında (FR-013)
☐ REGRESSION: Kayıt + özet hâlâ çalışıyor
Checkpoint: git commit → "feat: live subtitle complete"
/clear → Yarışma moduna geç
```

---

### 1.4 FAZ 2B — Canlı Yarışma

#### 1.4.1 Soru Üretimi

```
[WBS-1.4.1.1.1] /api/quiz/generate route — Gemini soru üretici
  FR: FR-014 | NFR: NFR-PERF-004, NFR-MAINT-001
  Sürüm: Faz 2B
  Bağımlılık: 1.2.2.1.1 (/api/summary yapısına benzer)
  Paralel?: Evet — Grup C (1.5.2.1.1 ile)
  Tahmini Süre: 5 saat

[WBS-1.4.1.2.1] QuizEditor.tsx — Soru düzenleme arayüzü
  FR: FR-014
  Sürüm: Faz 2B
  Bağımlılık: 1.4.1.1.1
  Paralel?: Hayır
  Tahmini Süre: 5 saat
```

**QUALITY GATE 4A — Soru Üretimi**
```
Seviye: UNIT
☐ Slayt analizi tamamlanmış görselden ≤ 10sn soru üretiliyor (FR-014)
☐ 4 şık doğru formatta
☐ Kullanıcı soruları düzenleyebiliyor
Checkpoint: git commit → "feat: quiz generation"
```

#### 1.4.2 QR Katılım

```
[WBS-1.4.2.1.1] QRCodeDisplay.tsx — 150x150px QR gösterici
  FR: FR-015
  Sürüm: Faz 2B
  Bağımlılık: 1.4.3.1.1 (session ID gerekir)
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.4.2.1.2] /app/join/[sessionId] page — Katılımcı sayfası
  FR: FR-015
  Sürüm: Faz 2B
  Bağımlılık: 1.4.3.1.2
  Paralel?: Evet — 1.4.2.1.1 ile paralel
  Tahmini Süre: 5 saat
```

#### 1.4.3 Firebase Realtime Cevap

```
[WBS-1.4.3.1.1] quizSchema.ts — Firebase RTDB şema tanımı
  FR: FR-016 | NFR: NFR-SCALE-001
  Sürüm: Faz 2B
  Bağımlılık: Yok
  Paralel?: Evet — ilk görev
  Tahmini Süre: 4 saat

[WBS-1.4.3.1.2] useQuizRealtime.ts — Realtime cevap hook
  FR: FR-016 | NFR: NFR-SCALE-001
  Sürüm: Faz 2B
  Bağımlılık: 1.4.3.1.1
  Paralel?: Hayır
  Tahmini Süre: 6 saat

[WBS-1.4.3.2.1] LiveLeaderboard.tsx — Gerçek zamanlı puan tablosu
  FR: FR-016 | NFR: NFR-SCALE-001
  Sürüm: Faz 2B
  Bağımlılık: 1.4.3.1.2
  Paralel?: Hayır
  Tahmini Süre: 5 saat
```

**QUALITY GATE 4 — Canlı Yarışma (Faz 2B Sprint 4)**
```
Seviye: E2E + LOAD
☐ QR taran → katılım sayfası < 2sn (FR-015)
☐ 200 bot simülasyonu → p99 gecikme < 1sn (NFR-SCALE-001)
☐ Leaderboard gerçek zamanlı güncelleniyor
☐ REGRESSION: Alt yazı + kayıt hâlâ çalışıyor
Checkpoint: git commit → "feat: live quiz complete"
/clear → Canlı yayına geç
```

---

### 1.5 FAZ 2C — Canlı Yayın

#### 1.5.1 Bağlantı Testi

```
[WBS-1.5.1.1.1] /api/livestream/test route — 5sn test akışı
  FR: FR-018 | NFR: NFR-SCALE-002, NFR-SEC-001
  Sürüm: Faz 2C
  Bağımlılık: Yok
  Paralel?: Hayır
  Tahmini Süre: 5 saat

[WBS-1.5.1.1.2] ConnectionTestModal.tsx — Test UI + sonuç
  FR: FR-018
  Sürüm: Faz 2C
  Bağımlılık: 1.5.1.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat
```

**QUALITY GATE 5A — Bağlantı Testi**
```
Seviye: INTEGRATION
☐ Geçersiz stream key → hata kodu + çözüm önerisi (FR-018)
☐ Başarılı test → yeşil onay
☐ RTMP key AES-256 şifreli DB'de (NFR-SEC-001)
☐ API response masked key gösteriyor (NFR-SEC-001)
Checkpoint: git commit → "feat: connection test"
```

#### 1.5.2 LiveKit Yayın

```
[WBS-1.5.2.1.1] liveStreamService.ts — LiveKit Ingress yöneticisi
  FR: FR-017 | NFR: NFR-SCALE-002, NFR-SEC-001, NFR-MAINT-001
  Sürüm: Faz 2C
  Bağımlılık: 1.5.1.1.1
  Paralel?: Hayır
  Tahmini Süre: 8 saat

[WBS-1.5.2.1.2] /api/livestream/token route — LiveKit JWT token
  FR: FR-017 | NFR: NFR-SEC-001
  Sürüm: Faz 2C
  Bağımlılık: 1.5.2.1.1
  Paralel?: Hayır
  Tahmini Süre: 4 saat

[WBS-1.5.2.2.1] LiveStreamPanel.tsx — Stream key + başlat/durdur
  FR: FR-017
  Sürüm: Faz 2C
  Bağımlılık: 1.5.2.1.2
  Paralel?: Hayır
  Tahmini Süre: 5 saat

[WBS-1.5.2.2.2] LiveStatusBadge.tsx — "CANLI" göstergesi
  FR: FR-017
  Sürüm: Faz 2C
  Bağımlılık: 1.5.2.2.1
  Paralel?: Hayır
  Tahmini Süre: 3 saat
```

**QUALITY GATE 5B — LiveKit Yayın**
```
Seviye: INTEGRATION
☐ ≤ 15sn içinde yayın aktif (FR-017)
☐ Kopma → otomatik kayda geçiş (FR-017)
☐ 60 dakikalık test yayını → kopma < %0.5 (NFR-SCALE-002)
☐ grep "sk_live\|api_key" src/ → 0 sonuç (NFR-MAINT-001)
Checkpoint: git commit → "feat: livekit streaming"
```

#### 1.5.3 Yayın Arşivi

```
[WBS-1.5.3.1.1] /app/archive page — Arşiv liste sayfası
  FR: FR-019
  Sürüm: Faz 2C
  Bağımlılık: 1.1.3.1.1, 1.2.2.1.1
  Paralel?: Hayır
  Tahmini Süre: 5 saat

[WBS-1.5.3.1.2] /app/r/[id] page — Sunum portal sayfası
  FR: FR-019 | NFR: NFR-SEC-002, NFR-COMP-002
  Sürüm: Faz 2C
  Bağımlılık: 1.5.3.1.1
  Paralel?: Hayır
  Tahmini Süre: 5 saat
```

**QUALITY GATE 5 — Canlı Yayın (Faz 2C Sprint 5-6)**
```
Seviye: E2E
☐ Stream key gir → test → yayın başlat → arşivde görün tam akış
☐ Arşiv başlık/tarih/süre filtresi çalışıyor
☐ Portal sayfası şifresiz erişim, TTL sonrası 403
☐ REGRESSION: Tüm Faz 2A+2B özellikleri hâlâ çalışıyor
Checkpoint: git commit → "feat: live streaming complete"
```

---

## QUALITY GATE TANIMLARI

### QG-1: Video Kayıt E2E
```
Seviye: E2E
Test: Sunum modu → kayıt başlat → R2 yükle → link paylaş
☐ Kayıt ≤ 3sn başlıyor (NFR-PERF-001)
☐ Offline → online → kayıp yok (NFR-REL-001)
☐ Signed URL 7 gün TTL (NFR-SEC-002)
☐ Ücretsiz 480p / Pro 1080p (FR-005)
☐ Chrome ✓ Firefox ✓ Safari (banner) ✓
⛔ GEÇEMEZSEN: Duzelt ve tekrar dene — atlama yok
```

### QG-2: AI Özet & E-posta E2E
```
Seviye: E2E + REGRESSION
Test: Transkript → Gemini → onay → Resend → alıcı
☐ Özet ≤ 30sn (NFR-PERF-004)
☐ KVKK onayı zorunlu (NFR-COMP-001)
☐ 60sn içinde mail (FR-008)
☐ REGRESSION QG-1 yeniden çalışır
⛔ GEÇEMEZSEN: Duzelt ve tekrar dene — atlama yok
```

### QG-3: Canlı Alt Yazı E2E
```
Seviye: E2E + REGRESSION
Test: Mikrofon → alt yazı → dil değiştir → SRT indir
☐ Web Speech ≤ 800ms / Deepgram ≤ 500ms (NFR-PERF-003)
☐ Dil değişince önceki satırlar korunuyor
☐ SRT geçerli SubRip formatı
☐ REGRESSION QG-1 + QG-2 yeniden çalışır
⛔ GEÇEMEZSEN: Duzelt ve tekrar dene — atlama yok
```

### QG-4: Canlı Yarışma E2E + LOAD
```
Seviye: E2E + LOAD
Test: QR → katılım → cevap → leaderboard
☐ QR okuma → sayfa < 2sn (FR-015)
☐ 200 bot → p99 < 1sn (NFR-SCALE-001)
☐ REGRESSION QG-1+2+3 yeniden çalışır
⛔ GEÇEMEZSEN: Duzelt ve tekrar dene — atlama yok
```

### QG-5: Canlı Yayın E2E
```
Seviye: E2E + REGRESSION
Test: Key gir → test → yayın → arşiv
☐ ≤ 15sn yayın aktif (FR-017)
☐ 60dk yayın kopma < %0.5 (NFR-SCALE-002)
☐ AES-256 şifreli key (NFR-SEC-001)
☐ REGRESSION tüm QG'ler yeniden çalışır
⛔ GEÇEMEZSEN: Duzelt ve tekrar dene — atlama yok
```

### QG-11: FAZ 2B FULL REGRESSION
```
Seviye: REGRESSION
Test: Tüm 19 FR kabul kriteri
☐ Her FR Given/When/Then geçiyor
☐ TypeScript strict sıfır hata
☐ ESLint sıfır hata
☐ grep "sk_live\|api_key" src/ → 0 sonuç (NFR-MAINT-001)
☐ DoD checklist tam olarak işaretlendi
⛔ GEÇEMEZSEN: Duzelt ve tekrar dene — atlama yok
Checkpoint: git tag faz-2b-complete
```

---

## CONTEXT YÖNETİMİ PLANI

### /clear Noktaları

```
/clear NE ZAMAN KULLANILIR:
  ✅ Her Quality Gate sonrası (yeni faza geçince)
  ✅ Faz 2A → 2B geçişinde
  ✅ Aynı hata 2 denemede düzeltilemezse
  ✅ Konu değişince (backend route → React bileşen)
  ✅ 1.1 (Video) → 1.2 (Email) geçişinde
  ✅ 1.2 (Email) → 1.3 (Alt Yazı) geçişinde

SUBAGENT NE ZAMAN KULLANILIR:
  ✅ Grup A paralel görevler (1.1.1.1.1 + 1.1.2.1.1 aynı anda)
  ✅ Grup C paralel görevler (1.4.1.1.1 + 1.5.2.1.1 aynı anda)
  ✅ Büyük dosya aramaları (SRT format araştırması)
  ✅ LiveKit dokümantasyon araştırması
```

### Paralel Uygulama Planı

```
SPRINT 1 — Paralel Başlangıç:
  Terminal 1: WBS-1.1.1.1.1 (recordingService)
  Terminal 2: WBS-1.1.2.1.1 (recordingBuffer)
  → Her ikisi bitince: WBS-1.1.1.1.2, WBS-1.1.2.1.2 sıralı

SPRINT 2 — Paralel:
  Terminal 1: WBS-1.2.1.1.1 (transcriptStore)
  Terminal 2: WBS-1.3.1.1.1 (useSubtitles) — bağımsız başlayabilir

SPRINT 3 — Paralel:
  Terminal 1: WBS-1.4.1.1.1 (quiz/generate)
  Terminal 2: WBS-1.5.2.1.1 (liveStreamService) — bağımsız
```

---

## AI PROMPT TEMPLATES

### PROMPT: WBS-1.1.1.1.1 — recordingService.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] recordingService.ts — MediaRecorder soyutlaması
GÖREV: WBS-1.1.1.1.1
FR: FR-001, FR-003 | NFR: NFR-PERF-001

DOSYA: src/lib/recording/recordingService.ts
ARAYÜZ:
  interface RecordingService {
    start(options: RecordingOptions): Promise<void>
    stop(): Promise<Blob>
    getState(): RecordingState
  }
  type RecordingOptions = { quality: '480p' | '1080p'; includeScreen: boolean }
  type RecordingState = 'idle' | 'recording' | 'stopping'

BAĞIMLILIKLAR: codecDetector.ts (oluşturulacak)

GİRİŞ: RecordingOptions
ÇIKIŞ: Blob (WebM/MP4)

KABUL KRİTERİ:
  VERİLDİĞİ DURUMDA: Chrome'da kayıt başlatılırsa
  NE ZAMAN: start() çağrılır
  O ZAMAN: ≤ 3sn MediaRecorder aktif olur (NFR-PERF-001)

KISITLAR:
  - Chrome/Edge: VP9+WebM | Safari: AAC+MP4
  - Safari'de ekran kaydı yoksa banner fırlat
  - Tüm API key'ler .env'de

ÖNCE OKU:
  - src/stores/speechStore.ts — mevcut ses yönetimi yapısı
  - src/hooks/ — mevcut hook yapısı

[SONA TEKRAR]
HEDEF: Tarayıcı-agnostik MediaRecorder servisi, 3sn içinde kayıt
BAŞARI: Unit test geçiyor, Chrome VP9 / Safari banner doğru
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.1.1.2 — codecDetector.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] codecDetector.ts — Tarayıcı codec tespiti
GÖREV: WBS-1.1.1.1.2
FR: FR-003 | NFR: NFR-PERF-001

DOSYA: src/lib/recording/codecDetector.ts
ARAYÜZ:
  function detectSupportedCodec(): 'vp9+webm' | 'h264+mp4' | 'aac+mp4'

BAĞIMLILIKLAR: Yok (saf tarayıcı API'si)

GİRİŞ: void
ÇIKIŞ: codec string

KABUL KRİTERİ:
  Safari → 'aac+mp4' | Chrome → 'vp9+webm' | Firefox → 'h264+mp4'

KISITLAR:
  - MediaRecorder.isTypeSupported() kullan
  - Öncelik sırası: VP9 > H.264 > AAC

[SONA TEKRAR]
HEDEF: Senkron codec tespiti, kayıt başlamadan önce çalışır
BAŞARI: Safari'de 'aac+mp4' döner, Chrome'da 'vp9+webm'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.1.2.1 — RecordingButton.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] RecordingButton.tsx — Başlat/Durdur butonu
GÖREV: WBS-1.1.1.2.1
FR: FR-001 | NFR: NFR-USE-001

DOSYA: src/components/recording/RecordingButton.tsx
ARAYÜZ:
  interface RecordingButtonProps {
    onStart: () => void
    onStop: () => void
    state: 'idle' | 'recording' | 'stopping'
  }

BAĞIMLILIKLAR:
  - src/lib/recording/recordingService.ts
  - shadcn/ui Button bileşeni

GİRİŞ: RecordingButtonProps
ÇIKIŞ: JSX.Element

KABUL KRİTERİ:
  state==='recording' → buton kırmızı yanıp söner (CSS animation)
  state==='idle' → "● REC" metni, gri
  state==='stopping' → devre dışı, spinner

KISITLAR:
  - Tailwind CSS, shadcn/ui
  - Framer Motion kullanma (gereksiz)

ÖNCE OKU:
  - src/components/presentation/ — mevcut UI kalıbı

[SONA TEKRAR]
HEDEF: Tek tıkla kayıt başlat/durdur, görsel durum göstergesi
BAŞARI: Kırmızı yanıp sönen buton görünüyor, tıkla → state değişiyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.1.2.2 — RecordingTimer.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] RecordingTimer.tsx — Kayıt süresi + gösterge
GÖREV: WBS-1.1.1.2.2
FR: FR-001

DOSYA: src/components/recording/RecordingTimer.tsx
ARAYÜZ:
  interface RecordingTimerProps { isRecording: boolean }

ÇIKIŞ: "00:00:00" formatında süre göstergesi

KABUL KRİTERİ:
  isRecording=true → saniye bazında sayar, kırmızı nokta yanıp söner
  isRecording=false → "00:00:00" sıfırlanır

[SONA TEKRAR]
HEDEF: Gerçek zamanlı kayıt süresi göstergesi
BAŞARI: Doğru sayıyor, kırmızı nokta animasyonu var
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.2.1.1 — recordingBuffer.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] recordingBuffer.ts — IndexedDB chunk yöneticisi
GÖREV: WBS-1.1.2.1.1
FR: FR-002 | NFR: NFR-REL-001, NFR-PERF-002

DOSYA: src/lib/recording/recordingBuffer.ts
ARAYÜZ:
  interface RecordingBuffer {
    appendChunk(chunk: Blob): Promise<void>
    getAllChunks(): Promise<Blob[]>
    clear(): Promise<void>
    getSize(): Promise<number>
  }

BAĞIMLILIKLAR: idb (mevcut package.json'da)

GİRİŞ: Blob chunk'ları
ÇIKIŞ: IndexedDB CRUD operasyonları

KABUL KRİTERİ:
  Internet kesilir → chunk'lar IndexedDB'de korunur
  Bağlantı gelince → tüm chunk'lar eksiksiz döner

KISITLAR:
  - idb kütüphanesi kullan (mevcut)
  - Chunk boyutu ≤ 500MB
  - DB adı: 'deepslide-recording'

ÖNCE OKU:
  - package.json — idb version

[SONA TEKRAR]
HEDEF: Offline-first kayıt tampon katmanı, 0 veri kaybı
BAŞARI: Internet kesilip gelince chunk'lar kayıpsız döner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.2.1.2 — uploadOrchestrator.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] uploadOrchestrator.ts — R2 yükleme orkestrasyonu
GÖREV: WBS-1.1.2.1.2
FR: FR-002 | NFR: NFR-PERF-002, NFR-SEC-002, NFR-REL-001

DOSYA: src/lib/recording/uploadOrchestrator.ts
ARAYÜZ:
  interface UploadOrchestrator {
    startUpload(recordingId: string): Promise<void>
    getProgress(): number // 0-100
    onComplete(cb: (url: string) => void): void
    onError(cb: (err: Error) => void): void
  }

BAĞIMLILIKLAR:
  - recordingBuffer.ts (WBS-1.1.2.1.1)
  - /api/recording/upload (WBS-1.1.2.2.1)

KABUL KRİTERİ:
  Paralel 3 chunk upload
  1 saatlik 1080p ≤ 15dk (NFR-PERF-002)
  "Yükleme tamamlandı" event fırlatır

KISITLAR:
  - Multipart upload protokolü
  - Max 3 paralel chunk
  - Retry: 3 deneme, exponential backoff

[SONA TEKRAR]
HEDEF: Güvenilir R2 multipart upload, retry mantığı dahil
BAŞARI: 8GB video ≤ 15dk yükleniyor, internet kesintisinde devam ediyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.2.2.1 — /api/recording/upload

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/recording/upload — Cloudflare R2 Signed URL
GÖREV: WBS-1.1.2.2.1
FR: FR-002 | NFR: NFR-SEC-002

DOSYA: src/app/api/recording/upload/route.ts
ARAYÜZ:
  POST /api/recording/upload
  Body: { recordingId: string; chunkIndex: number; totalChunks: number }
  Response: { uploadUrl: string; key: string }

BAĞIMLILIKLAR: Cloudflare R2 SDK (aws4fetch veya @aws-sdk/client-s3)

KABUL KRİTERİ:
  Signed URL döner, 1 saat TTL
  Anonim erişim yok (403)
  recordingId Firebase Auth UID ile doğrulanır

KISITLAR:
  - R2 credentials .env'de: R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY
  - BSL 1.1 copyright header

ÖNCE OKU:
  - src/app/api/billing/checkout/route.ts — mevcut API route yapısı
  - .env.example

[SONA TEKRAR]
HEDEF: Güvenli R2 upload URL üreticisi
BAŞARI: Signed URL çalışıyor, anonim erişim 403 veriyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.2.2.2 — UploadProgress.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] UploadProgress.tsx — Yükleme ilerleme göstergesi
GÖREV: WBS-1.1.2.2.2
FR: FR-002

DOSYA: src/components/recording/UploadProgress.tsx
ARAYÜZ:
  interface UploadProgressProps { progress: number; status: 'uploading' | 'done' | 'error' }

KABUL KRİTERİ:
  Yükleniyor → progress bar % gösterir
  Tamamlandı → "Yükleme tamamlandı ✓" + "Linki Kopyala" butonu çıkar
  Hata → "Tekrar Dene" butonu

[SONA TEKRAR]
HEDEF: Upload durumu görsel gösterimi
BAŞARI: Progress bar doğru %, done → link butonu görünür
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.3.1.1 — /api/recording/share

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/recording/share — Paylaşım Linki Oluşturucu
GÖREV: WBS-1.1.3.1.1
FR: FR-004 | NFR: NFR-SEC-002, NFR-COMP-002

DOSYA: src/app/api/recording/share/route.ts
ARAYÜZ:
  POST /api/recording/share
  Body: { recordingId: string }
  Response: { shareUrl: string; expiresAt: string }

KABUL KRİTERİ:
  deepslide.com/r/[id] formatında URL
  7 gün TTL, sonrası 403
  Firestore'da {recordingId, shareToken, expiresAt, ownerId} kayıt

KISITLAR:
  - Ücretsiz: 30 gün saklama (NFR-COMP-002)
  - Pro: 1 yıl saklama
  - Silme öncesi 7 gün e-posta uyarısı

[SONA TEKRAR]
HEDEF: Güvenli 7-günlük paylaşım linki
BAŞARI: TTL sonrası 403, başka kullanıcı erişemiyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.3.1.2 — ShareLinkModal.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] ShareLinkModal.tsx — Paylaşım Linki UI
GÖREV: WBS-1.1.3.1.2
FR: FR-004

DOSYA: src/components/recording/ShareLinkModal.tsx

KABUL KRİTERİ:
  Modal açılır → URL gösterilir → "Linki Kopyala" → panoya kopyalanır
  Toast: "Kopyalandı!" 2sn görünür

ÖNCE OKU:
  - src/components/ — mevcut modal kalıbı

[SONA TEKRAR]
HEDEF: Tek tıkla link kopyalama modalı
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.1.3.1.3 — qualityGate.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] qualityGate.ts — Freemium kalite kontrolü
GÖREV: WBS-1.1.3.1.3
FR: FR-005

DOSYA: src/lib/recording/qualityGate.ts
ARAYÜZ:
  function getMaxResolution(isPro: boolean): '480p' | '1080p'
  function shouldShowUpgradePrompt(isPro: boolean): boolean

KABUL KRİTERİ:
  Ücretsiz → 480p + "HD için Pro'ya geç" prompt
  Pro → 1080p, prompt yok

ÖNCE OKU:
  - src/lib/billing/plans.ts — mevcut plan mantığı

[SONA TEKRAR]
HEDEF: Saf fonksiyon, plan bazlı çözünürlük limiti
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.1.1.1 — transcriptStore.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] transcriptStore.ts — Zustand transkript + zaman damgası
GÖREV: WBS-1.2.1.1.1
FR: FR-006 | NFR: NFR-COMP-001

DOSYA: src/stores/transcriptStore.ts
ARAYÜZ:
  interface TranscriptEntry { timestamp: number; text: string }
  interface TranscriptStore {
    entries: TranscriptEntry[]
    addEntry(text: string): void
    clear(): void
    getWordCount(): number
    hasKvkkConsent: boolean
    setKvkkConsent(value: boolean): void
  }

BAĞIMLILIKLAR: zustand

KABUL KRİTERİ:
  Sunum modunda her cümle → addEntry() çağrılır
  getWordCount() ≥ 100 → özet tetiklenebilir
  hasKvkkConsent=false → bulut API çağrısı engellenir (NFR-COMP-001)

ÖNCE OKU:
  - src/stores/speechStore.ts — mevcut Zustand kalıbı
  - src/stores/presentationStore.ts

[SONA TEKRAR]
HEDEF: Zaman damgalı transkript store, KVKK onay durumu dahil
BAŞARI: Zustand devtools'da entries[] görünüyor, wordCount doğru
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.2.1.1 — /api/summary/generate

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/summary/generate — Gemini Özet API
GÖREV: WBS-1.2.2.1.1
FR: FR-007 | NFR: NFR-PERF-004, NFR-MAINT-001, NFR-COMP-001

DOSYA: src/app/api/summary/generate/route.ts
ARAYÜZ:
  POST /api/summary/generate
  Body: { transcript: TranscriptEntry[]; slideTimestamps: number[] }
  Response: { summary: string[]; actionItems: string[] }

BAĞIMLILIKLAR: @google/generative-ai (mevcut package.json'da)

KABUL KRİTERİ:
  1 saatlik transkript → özet ≤ 30sn (NFR-PERF-004)
  Timeout (30sn) → 408 status → frontend "Tekrar dene" gösterir
  3-5 madde özet + aksiyon listesi

KISITLAR:
  - GEMINI_API_KEY .env'de (NFR-MAINT-001)
  - Transkript < 100 kelime → 400 "Yetersiz içerik"
  - KVKK onayı frontend'de alınmalı, API kimliği doğrular

ÖNCE OKU:
  - src/app/api/analyze/route.ts — mevcut Gemini kullanım kalıbı

[SONA TEKRAR]
HEDEF: Gemini tabanlı yapılandırılmış özet üretici
BAŞARI: 30sn altında 3-5 madde özet döner, timeout 408 veriyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.2.2.1 — SummaryModal.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] SummaryModal.tsx — Düzenlenebilir özet önizleme
GÖREV: WBS-1.2.2.2.1
FR: FR-007

DOSYA: src/components/summary/SummaryModal.tsx
ARAYÜZ:
  interface SummaryModalProps {
    summary: string[]
    actionItems: string[]
    onApprove: (edited: { summary: string[]; actionItems: string[] }) => void
    onClose: () => void
  }

KABUL KRİTERİ:
  Özet maddeleri düzenlenebilir textarea'da
  "Onayla ve Gönder" → onApprove çağrılır
  "İptal" → modal kapanır, e-posta gönderilmez

[SONA TEKRAR]
HEDEF: Kullanıcı onayı zorunlu özet önizleme modalı
BAŞARI: Düzenleme çalışıyor, "Onayla" olmadan gönderilmiyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.3.1.1 — /api/email/send

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/email/send — Resend E-posta Gönderici
GÖREV: WBS-1.2.3.1.1
FR: FR-008 | NFR: NFR-MAINT-001

DOSYA: src/app/api/email/send/route.ts
ARAYÜZ:
  POST /api/email/send
  Body: { to: string[]; summary: string[]; shareUrl: string; presentationTitle: string }
  Response: { sent: number; failed: string[] }

BAĞIMLILIKLAR: resend (eklenecek package)

KABUL KRİTERİ:
  ≤ 60sn içinde tüm alıcılara mail (FR-008)
  RFC 5322 geçersiz email → 400 + hata listesi
  0 alıcı → 400 "Alıcı gerekli"

KISITLAR:
  - RESEND_API_KEY .env'de (NFR-MAINT-001)
  - Rate limit: 100 mail/gün (ücretsiz Resend)

[SONA TEKRAR]
HEDEF: Güvenilir toplu e-posta gönderimi
BAŞARI: 60sn altında tüm alıcılara ulaşıyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.3.1.2 — SummaryEmail.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] SummaryEmail.tsx — React Email Şablonu
GÖREV: WBS-1.2.3.1.2
FR: FR-008

DOSYA: src/emails/SummaryEmail.tsx
BAĞIMLILIKLAR: @react-email/components (eklenecek)

KABUL KRİTERİ:
  Özet maddeler + aksiyon listesi + "Sunumu İzle" butonu (shareUrl)
  DeepSlide marka renkleri
  Gmail/Outlook/Apple Mail render uyumlu

[SONA TEKRAR]
HEDEF: Güzel, markalı özet e-posta şablonu
BAŞARI: Gmail'de doğru render oluyor, buton tıklanabiliyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.3.2.1 — RecipientManager.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] RecipientManager.tsx — Alıcı listesi yönetimi
GÖREV: WBS-1.2.3.2.1
FR: FR-009

DOSYA: src/components/email/RecipientManager.tsx
ARAYÜZ:
  interface RecipientManagerProps {
    onRecipientsChange: (emails: string[]) => void
  }

KABUL KRİTERİ:
  E-posta gir + "Ekle" → RFC 5322 validate → listeye ekle
  Geçersiz → kırmızı hata altında
  Sonraki sunumlarda Firestore'dan öneriler

ÖNCE OKU:
  - src/lib/billing/ — Firestore kullanım kalıbı

[SONA TEKRAR]
HEDEF: RFC 5322 ile doğrulanmış, saklanabilen alıcı listesi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.4.1.1 — /api/clip/generate

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/clip/generate — FFmpeg Klip Üretici
GÖREV: WBS-1.2.4.1.1
FR: FR-010

DOSYA: src/app/api/clip/generate/route.ts
ARAYÜZ:
  POST /api/clip/generate
  Body: { recordingId: string; format: 'reels' | 'youtube' }
  Response: { clipUrl: string; duration: number }

KABUL KRİTERİ:
  ≤ 5dk içinde MP4 klip hazır
  Reels: 1080x1920 | YouTube: 1920x1080
  En güçlü 3 an: transkript keyword yoğunluğu bazında seçim

KISITLAR:
  - FFmpeg server-side (Vercel edge'de çalışmaz → Node.js route)
  - R2'den kaynak, R2'ye hedef

[SONA TEKRAR]
HEDEF: Otomatik 60sn sosyal medya klibi
BAŞARI: ≤5dk, doğru aspect ratio, R2'de erişilebilir
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.2.4.1.2 — ClipButton.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] ClipButton.tsx — Klip Oluştur UI
GÖREV: WBS-1.2.4.1.2
FR: FR-010

DOSYA: src/components/recording/ClipButton.tsx

KABUL KRİTERİ:
  "Klip Oluştur" → format seç (Reels/YouTube) → progress göster
  Tamamlanınca → "İndir" butonu

[SONA TEKRAR]
HEDEF: Klip oluşturma tetikleyicisi ve indirme UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.3.1.1.1 — useSubtitles.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] useSubtitles.ts — WebSpeech/Deepgram adapter hook
GÖREV: WBS-1.3.1.1.1
FR: FR-011 | NFR: NFR-PERF-003, NFR-MAINT-001

DOSYA: src/hooks/useSubtitles.ts
ARAYÜZ:
  function useSubtitles(options: { language: string; provider: 'webspeech' | 'deepgram' }):
    { currentText: string; isListening: boolean; start(): void; stop(): void }

BAĞIMLILIKLAR:
  - transcriptStore.ts (WBS-1.2.1.1.1)
  - deepgramAdapter.ts (WBS-1.3.2.1.1 — lazy import)

KABUL KRİTERİ:
  WebSpeech → ≤ 800ms gecikme
  Deepgram → ≤ 500ms gecikme (Pro)
  provider geçişi runtime'da çalışıyor

ÖNCE OKU:
  - src/stores/speechStore.ts — mevcut adapter kalıbı

[SONA TEKRAR]
HEDEF: Factory pattern ile iki provider'ı soyutlayan hook
BAŞARI: Her iki provider gecikme kriterini karşılıyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.3.1.2.1 — SubtitleStrip.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] SubtitleStrip.tsx — Alt yazı şerit bileşeni
GÖREV: WBS-1.3.1.2.1
FR: FR-011

DOSYA: src/components/subtitle/SubtitleStrip.tsx
ARAYÜZ:
  interface SubtitleStripProps { text: string; isActive: boolean }

KABUL KRİTERİ:
  Sunum ekranının altında sabit konumda
  Büyük, okunabilir font (min 24px)
  isActive=false → görünmez

[SONA TEKRAR]
HEDEF: Ekran altı sabit alt yazı şeridi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.3.2.1.1 — deepgramAdapter.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] deepgramAdapter.ts — WebSocket transkripsiyon
GÖREV: WBS-1.3.2.1.1
FR: FR-011 Pro | NFR: NFR-PERF-003, NFR-MAINT-001, NFR-COMP-001

DOSYA: src/lib/speech/deepgramAdapter.ts
ARAYÜZ: (mevcut adapter pattern ile uyumlu)
  interface SpeechAdapter {
    start(): void
    stop(): void
    onResult(cb: (text: string) => void): void
  }

BAĞIMLILIKLAR: @deepgram/sdk (eklenecek)

KABUL KRİTERİ:
  WebSocket bağlantısı ≤ 500ms gecikmeyle sonuç döner
  KVKK onayı olmadan Deepgram çağrısı yapılmaz

KISITLAR:
  - DEEPGRAM_API_KEY .env'de
  - Mevcut WebSpeech adapter ile aynı interface

ÖNCE OKU:
  - src/lib/speech/ — mevcut adapter dosyaları
  - src/stores/speechStore.ts

[SONA TEKRAR]
HEDEF: Factory pattern uyumlu Deepgram adapter
BAŞARI: ≤500ms gecikme, mevcut interface ile çalışıyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.3.3.1.1 — LanguageSelector.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] LanguageSelector.tsx — Dil seçici dropdown
GÖREV: WBS-1.3.3.1.1
FR: FR-012

DOSYA: src/components/subtitle/LanguageSelector.tsx
ARAYÜZ:
  interface LanguageSelectorProps {
    value: 'tr' | 'en' | 'de' | 'fr'
    onChange: (lang: string) => void
  }

KABUL KRİTERİ:
  Dil değişince önceki satırlar değişmiyor
  Sonraki cümle yeni dilde geliyor

[SONA TEKRAR]
HEDEF: 4 dil seçeneği, anlık geçiş
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.3.4.1.1 — srtExporter.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] srtExporter.ts — Transkript → SRT
GÖREV: WBS-1.3.4.1.1
FR: FR-013

DOSYA: src/lib/subtitle/srtExporter.ts
ARAYÜZ:
  function exportToSRT(entries: TranscriptEntry[]): string
  function downloadSRT(entries: TranscriptEntry[], filename: string): void

KABUL KRİTERİ:
  SubRip formatı: "1\n00:00:01,000 --> 00:00:03,000\nMetin\n\n"
  ≥ 50 kelime yoksa 400

[SONA TEKRAR]
HEDEF: Geçerli SRT formatında dosya üretici
BAŞARI: VLC ile açılıyor, timestamp'ler doğru
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.4.1.1.1 — /api/quiz/generate

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/quiz/generate — Gemini Soru Üretici
GÖREV: WBS-1.4.1.1.1
FR: FR-014 | NFR: NFR-PERF-004, NFR-MAINT-001

DOSYA: src/app/api/quiz/generate/route.ts
ARAYÜZ:
  POST /api/quiz/generate
  Body: { imageId: string; keywords: string[] }
  Response: { questions: Array<{ text: string; options: string[]; correct: number }> }

KABUL KRİTERİ:
  ≤ 10sn 1-3 soru üretilir
  4 seçenek, 1 doğru
  Kullanıcı düzenleyebilir

ÖNCE OKU:
  - src/app/api/analyze/route.ts — Gemini kullanım kalıbı

[SONA TEKRAR]
HEDEF: Slayt bazlı çoktan seçmeli soru üretici
BAŞARI: ≤10sn, 4 şık, doğru formatında
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.4.1.2.1 — QuizEditor.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] QuizEditor.tsx — Soru düzenleme arayüzü
GÖREV: WBS-1.4.1.2.1
FR: FR-014

DOSYA: src/components/quiz/QuizEditor.tsx

KABUL KRİTERİ:
  Soru metni + 4 şık düzenlenebilir
  Doğru şık seçilebilir
  "Kaydet" → soruları yarışma oturumuna ekler

[SONA TEKRAR]
HEDEF: Kullanıcı dostu soru düzenleme formu
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.4.2.1.1 — QRCodeDisplay.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] QRCodeDisplay.tsx — QR Kod Gösterici
GÖREV: WBS-1.4.2.1.1
FR: FR-015

DOSYA: src/components/quiz/QRCodeDisplay.tsx
BAĞIMLILIKLAR: qrcode.react (eklenecek)

KABUL KRİTERİ:
  150x150px
  QR → deepslide.com/join/[sessionId]
  < 2sn render

[SONA TEKRAR]
HEDEF: Hızlı render eden QR kod bileşeni
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.4.2.1.2 — /app/join/[sessionId]

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /app/join/[sessionId] — Katılımcı Sayfası
GÖREV: WBS-1.4.2.1.2
FR: FR-015

DOSYA: src/app/join/[sessionId]/page.tsx

KABUL KRİTERİ:
  QR tarandıktan < 2sn sayfa yüklendiğinde soru görünür
  Cevap gönder → Firebase RTDB güncellenir
  Sonuçlar: "X/Y doğru" ekranda

[SONA TEKRAR]
HEDEF: Mobil uyumlu katılımcı cevap sayfası
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.4.3.1.1 — quizSchema.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] quizSchema.ts — Firebase RTDB Şema Tanımı
GÖREV: WBS-1.4.3.1.1
FR: FR-016 | NFR: NFR-SCALE-001

DOSYA: src/lib/quiz/quizSchema.ts

ŞEMA:
  /quiz/{sessionId}/
    questions/{qId}: { text, options[], correct }
    responses/{userId}/{qId}: { answer, timestamp }
    leaderboard/{userId}: { score, rank }

KABUL KRİTERİ:
  200 eş zamanlı yazma → p99 < 1sn (NFR-SCALE-001)
  Firebase güvenlik kuralları: auth zorunlu

[SONA TEKRAR]
HEDEF: Ölçeklenebilir Firebase RTDB şema tasarımı
BAŞARI: 200 bot testi p99 < 1sn geçiyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.4.3.1.2 — useQuizRealtime.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] useQuizRealtime.ts — Realtime cevap hook
GÖREV: WBS-1.4.3.1.2
FR: FR-016 | NFR: NFR-SCALE-001

DOSYA: src/hooks/useQuizRealtime.ts
ARAYÜZ:
  function useQuizRealtime(sessionId: string): {
    responses: Record<string, number>
    leaderboard: Array<{ userId: string; score: number }>
    submitAnswer(qId: string, answer: number): Promise<void>
  }

BAĞIMLILIKLAR:
  - quizSchema.ts
  - Firebase Realtime Database SDK

KABUL KRİTERİ:
  Cevap gönderilince ≤ 1sn leaderboard güncellenir

[SONA TEKRAR]
HEDEF: Firebase RTDB üzerinde gerçek zamanlı cevap yönetimi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.4.3.2.1 — LiveLeaderboard.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] LiveLeaderboard.tsx — Gerçek Zamanlı Puan Tablosu
GÖREV: WBS-1.4.3.2.1
FR: FR-016

DOSYA: src/components/quiz/LiveLeaderboard.tsx
ARAYÜZ:
  interface LiveLeaderboardProps { sessionId: string }

KABUL KRİTERİ:
  Cevap gelince ≤ 1sn animasyonla güncellenir
  Top 10 listesi, sıralama değişince animate

[SONA TEKRAR]
HEDEF: Anlık güncellenen yarışma puan tablosu
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.1.1.1 — /api/livestream/test

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/livestream/test — RTMP Bağlantı Testi
GÖREV: WBS-1.5.1.1.1
FR: FR-018 | NFR: NFR-SCALE-002, NFR-SEC-001

DOSYA: src/app/api/livestream/test/route.ts
ARAYÜZ:
  POST /api/livestream/test
  Body: { streamKey: string; rtmpUrl: string }
  Response: { success: boolean; latencyMs?: number; error?: string; suggestion?: string }

KABUL KRİTERİ:
  5sn test akışı → başarı → yeşil onay
  Başarısız → hata kodu + çözüm önerisi
  streamKey AES-256 şifreli Firestore'da (NFR-SEC-001)

KISITLAR:
  - streamKey logda plain-text görünmemeli
  - API response'da masked key

[SONA TEKRAR]
HEDEF: Yayın öncesi 5sn RTMP bağlantı doğrulayıcı
BAŞARI: Geçersiz key → hata + öneri, geçerli key → yeşil ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.1.1.2 — ConnectionTestModal.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] ConnectionTestModal.tsx — Bağlantı Test UI
GÖREV: WBS-1.5.1.1.2
FR: FR-018

DOSYA: src/components/livestream/ConnectionTestModal.tsx

KABUL KRİTERİ:
  "Bağlantıyı Test Et" → spinner 5sn → başarı/hata durumu
  Başarısız → öneri metni gösterir
  Başarılı → "Yayını Başlat" butonu aktif olur

[SONA TEKRAR]
HEDEF: RTMP bağlantı test sonucu gösterici modal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.2.1.1 — liveStreamService.ts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] liveStreamService.ts — LiveKit Ingress Yöneticisi
GÖREV: WBS-1.5.2.1.1
FR: FR-017 | NFR: NFR-SCALE-002, NFR-SEC-001, NFR-MAINT-001

DOSYA: src/lib/livestream/liveStreamService.ts
ARAYÜZ:
  interface LiveStreamService {
    startStream(streamKey: string, rtmpUrl: string): Promise<void>
    stopStream(): Promise<void>
    onDisconnect(cb: () => void): void
    getStatus(): 'idle' | 'connecting' | 'live' | 'error'
  }

BAĞIMLILIKLAR: livekit-client, livekit-server-sdk (eklenecek)

KABUL KRİTERİ:
  ≤ 15sn yayın aktif (FR-017)
  Kopma → otomatik kayda geçiş (FR-001 recordingService tetiklenir)
  60dk yayın kopma < %0.5 (NFR-SCALE-002)

KISITLAR:
  - LIVEKIT_API_KEY, LIVEKIT_API_SECRET .env'de (NFR-MAINT-001)

[SONA TEKRAR]
HEDEF: Güvenilir LiveKit tabanlı RTMP yayın köprüsü
BAŞARI: ≤15sn aktif, kopunca kayda geçiyor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.2.1.2 — /api/livestream/token

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /api/livestream/token — LiveKit JWT Token
GÖREV: WBS-1.5.2.1.2
FR: FR-017 | NFR: NFR-SEC-001

DOSYA: src/app/api/livestream/token/route.ts
ARAYÜZ:
  POST /api/livestream/token
  Body: { roomName: string }
  Response: { token: string }

KABUL KRİTERİ:
  Firebase Auth doğrulama zorunlu
  JWT 1 saat TTL
  roomName kullanıcı ID'ye bağlı

[SONA TEKRAR]
HEDEF: Güvenli LiveKit erişim token üreticisi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.2.2.1 — LiveStreamPanel.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] LiveStreamPanel.tsx — Yayın Kontrol Paneli
GÖREV: WBS-1.5.2.2.1
FR: FR-017

DOSYA: src/components/livestream/LiveStreamPanel.tsx

KABUL KRİTERİ:
  RTMP URL + stream key giriş alanları (masked)
  "Bağlantıyı Test Et" → ConnectionTestModal açar
  Test başarılı → "Yayını Başlat" aktif
  Yayın başlayınca → LiveStatusBadge görünür

[SONA TEKRAR]
HEDEF: Tek sayfada yayın yapılandırma ve kontrol
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.2.2.2 — LiveStatusBadge.tsx

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] LiveStatusBadge.tsx — "CANLI" Göstergesi
GÖREV: WBS-1.5.2.2.2
FR: FR-017

DOSYA: src/components/livestream/LiveStatusBadge.tsx
ARAYÜZ:
  interface LiveStatusBadgeProps { status: 'idle' | 'connecting' | 'live' | 'error' }

KABUL KRİTERİ:
  status==='live' → kırmızı nokta + "CANLI" animasyonlu badge
  status==='connecting' → sarı "Bağlanıyor..."
  status==='error' → kırmızı "Bağlantı Hatası"

[SONA TEKRAR]
HEDEF: Görsel yayın durumu göstergesi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.3.1.1 — /app/archive page

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /app/archive — Sunum Arşivi
GÖREV: WBS-1.5.3.1.1
FR: FR-019 | NFR: NFR-COMP-002

DOSYA: src/app/archive/page.tsx

KABUL KRİTERİ:
  Başlık/tarih/süre filtresi çalışıyor
  Ücretsiz: 30 gün | Pro: 1 yıl saklama göstergesi
  Silme öncesi 7 gün uyarı etiketi

ÖNCE OKU:
  - src/app/ — mevcut route yapısı
  - Firestore şema

[SONA TEKRAR]
HEDEF: Filtrelenebilir sunum arşiv listesi
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### PROMPT: WBS-1.5.3.1.2 — /app/r/[id] page

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[BAŞLIK] /app/r/[id] — Sunum Portal Sayfası
GÖREV: WBS-1.5.3.1.2
FR: FR-019 | NFR: NFR-SEC-002, NFR-COMP-002

DOSYA: src/app/r/[id]/page.tsx

KABUL KRİTERİ:
  Signed URL TTL kontrolü: süresi geçmişse 403
  Başka kullanıcı URL'i açamaz
  Video + özet + SRT indirme

[SONA TEKRAR]
HEDEF: Güvenli sunum paylaşım portal sayfası
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## WBS ÖZETİ

```
WBS ÖZETİ
=========
Toplam atomik görev: 42
Paralel çalışabilecek: 8 görev (Grup A×3, Grup B×2, Grup C×2)
Sıralı görev: 34
Quality Gate: 11 (QG-1A, 1B, 1, 2A, 2B, 2C, 2, 3A, 3B, 3, 4A, 4, 5A, 5B, 5, 11)

FAZ BAZLI UYGULAMA SIRASI:
Faz 2A Sprint 1: FR-001,002,003 — Video Kayıt Servisi + Altyapı [14 görev]
  Paralel başlangıç: WBS-1.1.1.1.1 + WBS-1.1.2.1.1 (Grup A)
  Sıralı: 1.1.1.1.2 → 1.1.1.2.1 → 1.1.1.2.2

Faz 2A Sprint 2: FR-004,005,006,007,008,009,010 — AI Özet + Email [10 görev]
  Paralel başlangıç: WBS-1.2.1.1.1 + WBS-1.3.1.1.1 (Grup B)

Faz 2B Sprint 3: FR-011,012,013 — Canlı Alt Yazı [5 görev]

Faz 2B Sprint 4: FR-014,015,016 — Yarışma [7 görev]
  Paralel başlangıç: WBS-1.4.1.1.1 + WBS-1.4.3.1.1 (Grup C)

Faz 2C Sprint 5-6: FR-017,018,019 — Canlı Yayın [6 görev]

CLAUDE.md → proje dizininde oluşturuldu.
```
