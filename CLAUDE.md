@AGENTS.md

# DeepSlide — CLAUDE.md

## 🎯 Keyword Matching v2 — Aktif WBS

> **Kaynaklar:**
> - Araştırma: `/Users/emrepirinc/Documents/DeepSlide/RESEARCH_KEYWORD_MATCHING.md`
> - WBS:       `/Users/emrepirinc/Documents/DeepSlide/WBS_KEYWORD_MATCHING_V2.md`
> - Baseline:  commit `f2ae3dd` (gold set F1 = 1.000 / 30 case)

**Durum:** Planning tamamlandı. İlk görev seçimi bekliyor.
**Önerilen ilk görev (paralel başlangıç):**
- `T-1.1.1.1.1` — Zoom flicker debug logger (Sprint 1, flicker RCA)
- `T-1.1.4.1.1` — Trie + unique-prefix data structure (Sprint 1, bağımsız)

**Sprint özeti:**
- Sprint 1: 8 task, ~35 saat — Quick wins + flicker fix (QG1)
- Sprint 2: 8 task, ~32 saat — Semantic floor (negatives, BM25, TF-IDF, real gold set) (QG2)
- Sprint 3: 8 task, ~35 saat — Embedding rerank (mE5-small, cache, adaptive threshold) (QG3)
- Sprint 4: 4 task, ~15 saat — Validation, grid search v2, deploy, telemetry (QG4)

**Hedefler:**
- Sentetik gold set F1 ≥ 0.95 (mevcut 1.000)
- Gerçek dünya F1 ≥ 0.92 (başlangıç ~0.85 tahmin)
- Zoom flicker count = 0
- Latency p95 <50 ms
- Ana bundle artışı ≤15 KB, lazy embedding chunk 45 MB

---



## Proje Özeti
DeepSlide: AI destekli, ses kontrolüyle çalışan Prezi-tarzı sunum uygulaması.
- Görseller Gemini ile analiz edilir → keyword çıkarılır → ses tanımayla zoom tetiklenir
- Lisans: Business Source License 1.1 (2030'a kadar ticari kullanım kısıtlı)

---

## Proje Yapısı

```
src/
├── app/                     # Next.js 15 App Router
│   ├── api/
│   │   ├── analyze/         # Gemini görsel analizi (mevcut)
│   │   ├── analyze-qwen/    # Ollama Qwen analizi (mevcut)
│   │   ├── analyze-gemma/   # Ollama Gemma analizi (mevcut)
│   │   ├── billing/         # iyzico ödeme (mevcut)
│   │   ├── recording/       # Video kayıt + R2 upload (WBS-1.1)
│   │   ├── summary/         # Gemini özet (WBS-1.2)
│   │   ├── email/           # Resend gönderim (WBS-1.2)
│   │   ├── clip/            # FFmpeg klip üretici (WBS-1.2)
│   │   ├── quiz/            # Yarışma soru üretimi (WBS-1.4)
│   │   └── livestream/      # LiveKit yayın (WBS-1.5)
│   ├── presentation/[id]/present/  # Sunum modu (mevcut)
│   ├── archive/             # Yayın arşivi (WBS-1.5)
│   ├── join/[sessionId]/    # Yarışma katılımcı sayfası (WBS-1.4)
│   └── r/[id]/              # Paylaşım portal sayfası (WBS-1.5)
├── components/
│   ├── canvas/              # ImageCardAnimated.tsx (mevcut)
│   ├── presentation/        # Sunum UI (mevcut)
│   ├── recording/           # Kayıt UI (WBS-1.1)
│   ├── summary/             # Özet modal (WBS-1.2)
│   ├── email/               # Alıcı listesi (WBS-1.2)
│   ├── subtitle/            # Alt yazı şerit (WBS-1.3)
│   ├── quiz/                # Yarışma UI (WBS-1.4)
│   └── livestream/          # Yayın paneli (WBS-1.5)
├── stores/                  # Zustand store'ları
│   ├── presentationStore.ts
│   ├── uiStore.ts
│   ├── speechStore.ts
│   └── transcriptStore.ts   # YENİ (WBS-1.2.1.1.1)
├── lib/
│   ├── recording/           # recordingService, codecDetector, buffer, uploader
│   ├── speech/              # WebSpeech + Deepgram adapter'ları
│   ├── subtitle/            # SRT exporter
│   ├── quiz/                # Firebase RTDB şeması
│   ├── livestream/          # LiveKit servisi
│   ├── billing/             # plans.ts (mevcut)
│   └── animation/           # variants.ts, orchestrator.ts (mevcut)
├── hooks/
│   ├── useKeywordMatch.ts   # (mevcut)
│   ├── useSubtitles.ts      # YENİ (WBS-1.3.1.1.1)
│   └── useQuizRealtime.ts   # YENİ (WBS-1.4.3.1.2)
└── emails/
    └── SummaryEmail.tsx     # YENİ (WBS-1.2.3.1.2)
```

---

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `src/app/api/analyze/route.ts` | Gemini görsel analizi — yeni Gemini çağrıları için referans |
| `src/stores/speechStore.ts` | Ses adapter factory pattern — useSubtitles için referans |
| `src/stores/presentationStore.ts` | Ana sunum state'i |
| `src/lib/billing/plans.ts` | Freemium/Pro plan tanımları — qualityGate için referans |
| `src/app/api/billing/checkout/route.ts` | iyzico API route yapısı — yeni API route'lar için referans |
| `src/components/canvas/ImageCardAnimated.tsx` | Sunum zoom bileşeni (layoutId) |
| `src/lib/animation/orchestrator.ts` | Keyword→görsel eşleştirme |
| `SPEC.md` | 19 FR + 13 NFR + DoR/DoD — tüm kararların kaynağı |
| `WBS.md` | Bu CLAUDE.md'nin proje planı kaynağı |

---

## Kodlama Standartları

- **Dil**: TypeScript strict mode — sıfır `any`, sıfır tip hatası
- **Framework**: Next.js 15 App Router (NOT Pages Router)
- **Stil**: Tailwind CSS + shadcn/ui — custom CSS yazmadan önce bu ikisini dene
- **State**: Zustand — yeni store için `src/stores/speechStore.ts` kalıbını izle
- **Linting**: ESLint — `npm run lint` sıfır hata
- **Copyright**: Her yeni dosya başına BSL 1.1 header:
  ```ts
  // Copyright (c) 2026 Emre Pirinc. All rights reserved.
  // Licensed under the Business Source License 1.1
  ```
- **API key'ler**: Tüm 3. parti key'ler `.env.local`'da, kodda hard-code yasak
- **Framer Motion**: Mevcut layoutId animasyonlarını bozmadan kullan
- **Singleton pattern**: Firebase Admin SDK lazy init (mevcut pattern'i izle)

---

## Yeni Paketler (Faz 2B'de eklenecek)

```bash
npm install resend @react-email/components          # WBS-1.2
npm install @deepgram/sdk                           # WBS-1.3
npm install qrcode.react                            # WBS-1.4
npm install livekit-client livekit-server-sdk       # WBS-1.5
npm install @aws-sdk/client-s3                      # WBS-1.1 (R2 upload)
```

---

## Test Komutları

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Prodüksiyon build
npm run lint         # ESLint kontrolü
npm run type-check   # TypeScript strict kontrol
```

---

## Ortam Değişkenleri (.env.local)

```
# Mevcut (Faz 1)
GEMINI_API_KEY=
NEXT_PUBLIC_FIREBASE_*=
FIREBASE_ADMIN_*=
IYZICO_API_KEY=
IYZICO_SECRET_KEY=

# Yeni (Faz 2B)
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
RESEND_API_KEY=
DEEPGRAM_API_KEY=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
```

---

## Mevcut WBS Durumu

```
Tamamlanan Son QG: QG-5 — TÜM FAZ 2B + ENTEGRASYOn TAMAMLANDI (2026-04-09)
Aktif Görev: .env.local API key yapılandırması + E2E test

TAMAMLANAN DOSYALAR:
  ✅ src/lib/recording/codecDetector.ts
  ✅ src/lib/recording/recordingBuffer.ts
  ✅ src/lib/recording/recordingService.ts
  ✅ src/lib/recording/uploadOrchestrator.ts
  ✅ src/lib/recording/qualityGate.ts
  ✅ src/stores/transcriptStore.ts
  ✅ src/hooks/useRecording.ts
  ✅ src/hooks/useTranscriptCapture.ts
  ✅ src/hooks/useSubtitles.ts
  ✅ src/hooks/useQuizRealtime.ts
  ✅ src/lib/speech/providers/deepgramAdapter.ts
  ✅ src/lib/subtitle/srtExporter.ts
  ✅ src/lib/quiz/quizSchema.ts
  ✅ src/lib/livestream/liveStreamService.ts
  ✅ src/lib/firebase/admin.ts
  ✅ src/components/recording/* (7 dosya)
  ✅ src/components/summary/SummaryModal.tsx
  ✅ src/components/email/RecipientManager.tsx
  ✅ src/components/subtitle/SubtitleStrip.tsx
  ✅ src/components/subtitle/LanguageSelector.tsx
  ✅ src/components/quiz/QuizEditor.tsx
  ✅ src/components/quiz/QRCodeDisplay.tsx (qrcode.react v4)
  ✅ src/components/quiz/LiveLeaderboard.tsx
  ✅ src/components/livestream/LiveStreamPanel.tsx
  ✅ src/components/livestream/LiveStatusBadge.tsx
  ✅ src/components/livestream/ConnectionTestModal.tsx
  ✅ src/app/api/recording/upload/route.ts
  ✅ src/app/api/recording/share/route.ts
  ✅ src/app/api/summary/generate/route.ts
  ✅ src/app/api/email/send/route.ts
  ✅ src/app/api/clip/generate/route.ts
  ✅ src/app/api/quiz/generate/route.ts
  ✅ src/app/api/livestream/test/route.ts
  ✅ src/app/api/livestream/token/route.ts
  ✅ src/app/archive/page.tsx
  ✅ src/app/r/[id]/page.tsx
  ✅ src/app/join/[sessionId]/page.tsx
  ✅ src/app/presentation/[id]/present/page.tsx (Prezi layoutId zoom dahil)
  ✅ npm build: 28 sayfa, 0 hata

SIRADAKI ADIMLAR:
  1. .env.local → R2, Resend, Deepgram, LiveKit key'lerini doldur
  2. E2E test: sunum → kayıt → yükle → paylaş tam akış
  3. Cloud Tasks / BullMQ → clip generate gerçek FFmpeg entegrasyonu
```

> **NOT:** Her Quality Gate geçilince bu bölümü güncelle:
> `Aktif Görev: [WBS-ID]` ve `Tamamlanan Son QG: [QG-N]`

---

## KVKK / Güvenlik Kuralları

- Bulut API (Gemini, Deepgram, Resend) çağrısından önce KVKK onay modalı ZORUNLU
- RTMP stream key AES-256 şifreli Firestore'da, logda plain-text yasak
- R2 Signed URL TTL: paylaşım 7 gün, upload 1 saat
- Ücretsiz kullanıcı: 30 gün video saklama | Pro: 1 yıl

---

## Context Yönetimi

```
/clear KULLAN:
  ✅ Her QG sonrası yeni bölüme geçince
  ✅ Faz 2A → 2B → 2C geçişlerinde
  ✅ Aynı hata 2 denemede düzeltilemezse
  ✅ Backend → Frontend geçişinde

SUBAGENT KULLAN:
  ✅ Paralel görevler (WBS-1.1.1.1.1 + WBS-1.1.2.1.1 aynı anda)
  ✅ Büyük dokümantasyon araştırmaları (LiveKit, Deepgram API)
```
