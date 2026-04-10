# Active Context

## Current Session Focus (2026-04-09)

### What Was Completed This Session
- `.clinerules` Memory Bank system created and configured
- `memory-bank/` directory initialized with all 6 required files:
  - `projectbrief.md` — project foundation
  - `productContext.md` — why it exists, user experience goals
  - `activeContext.md` — this file
  - `systemPatterns.md` — architecture patterns from real codebase
  - `techContext.md` — tech stack, env vars, gotchas
  - `progress.md` — completed/in-progress/backlog
- Memory bank verified against actual source files (stores, providers, types)
- Corrected API route paths: `/api/analyze`, `/api/analyze-qwen`, `/api/analyze-gemma`

### Previously Completed (Faz 1 + Faz 2 partial)
- Firebase Auth integration (Google OAuth + email/password)
- Firestore user profiles with plan data (free/premium)
- UserMenu dropdown (avatar, profile, billing, sign out)
- Modern SaaS profile page (gradient header, stats, iyzico cancel)
- BSL 1.1 license added to all 114 source files (copyright headers)
- Prezi-style zoom presentation mode (overview ↔ fullscreen)
- 3 AI provider adapters (Gemini, Qwen, Gemma4) — adapter pattern
- 3 Speech provider adapters (WebSpeech, Gemini, Whisper) — adapter pattern
- Voice latency optimized: exact match 0ms, overview→focused 200ms
- iyzico payment integration (replaced Stripe for Turkish market)
- Freemium enforcement: PaywallBanner, WatermarkOverlay, UpgradeDialog
- Rehearsal mode (RehearsalView, RehearsalScore hooks)
- Analytics session recorder (src/lib/analytics/sessionRecorder.ts)
- Analytics page (src/app/presentation/[id]/analytics/page.tsx)
- Transition types: zoom, fade, pan (src/lib/animation/transitions/)

### Recent Decisions
- **Firebase over Supabase**: Supabase caused build failures (invalid URL at build time). Firebase lazy init pattern solves this.
- **iyzico over Stripe**: Turkish market priority, Stripe has higher fees in TR.
- **BSL 1.1**: Protects commercial IP while keeping code visible. Auto-converts to MIT in 2030.
- **Gemma4 E2B over 27B**: 4x faster (23s vs 92s per image), sufficient quality.
- **layoutId for zoom**: Framer Motion layoutId enables smooth grid→fullscreen transition without complex calculations.
- **Functional Zustand updates**: All mutations use `set((state) => ...)` to prevent race conditions during batch AI analysis.
- **IndexedDB for images**: Images never leave browser (privacy-first). Blobs in `imageBlobs` store, thumbnails as base64 on `PresentationImage`.

### Open Questions / Blockers
- Firebase Firestore security rules need production hardening
- iyzico webhook signature verification needs testing with real payments
- Ollama models require user to have Ollama running locally (no graceful error UX yet)
- Analytics page is present but not wired to real data yet

### BB#4 + /bap + /wbs Tamamlandı (2026-04-09)
- **BB#4**: 10 özellik oylama ile sıralandı, tümü onaylandı
- **/bap → SPEC.md**: 19 FR + 13 NFR + DoR/DoD yazıldı
- **/wbs → WBS.md**: 42 atomik görev, 11 Quality Gate, AI Prompt Template
- **CLAUDE.md**: Proje yapısı, standartlar, WBS durumu güncellendi
- **Premium fiyat**: 99 TL → 200 TL/ay, 888 TL → 1800 TL/yıl

### Mevcut WBS Durumu
Aktif Görev: WBS-1.1.1.1.1 (recordingService.ts) — BAŞLANMADI
Faz: 2A Sprint 1 — Video Kayıt
Paralel başlangıç: WBS-1.1.1.1.1 + WBS-1.1.2.1.1

### Next Steps (Faz 2B Kodlama)
1. WBS-1.1.1.1.1: `src/lib/recording/recordingService.ts` — MediaRecorder
2. WBS-1.1.2.1.1: `src/lib/recording/recordingBuffer.ts` — IndexedDB (paralel)
3. Paketleri yükle: `npm install @aws-sdk/client-s3 resend @deepgram/sdk`
4. `.env.local`'a R2, Resend, Deepgram, LiveKit key'lerini ekle

### Important File Corrections (verified from source)
- AI API routes: `/api/analyze` (Gemini), `/api/analyze-qwen`, `/api/analyze-gemma`
- Stores: `src/stores/` (not `src/store/`)
- Has `src/stores/uiStore.ts` and `src/stores/speechStore.ts` in addition to presentationStore
- Has `src/lib/analytics/sessionRecorder.ts` (analytics already started)
- Has `src/hooks/useRehearsalMode.ts` (rehearsal feature complete)
- Transitions: `src/lib/animation/transitions/` with zoom.ts, fade.ts, pan.ts, factory.ts
