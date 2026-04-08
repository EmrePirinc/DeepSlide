# Progress

## Completed (Faz 1 — MVP)

### Core App
- [x] Next.js 15 project setup (TypeScript, Tailwind, shadcn)
- [x] Image upload with drag & drop
- [x] IndexedDB local storage (presentations, image blobs)
- [x] Thumbnail generation
- [x] Zustand state management

### AI Analysis
- [x] Google Gemini API adapter (gemini-2.0-flash-exp)
- [x] Ollama Qwen 3.5 9B adapter
- [x] Ollama Gemma4 E2B adapter (fastest local option)
- [x] Keyword extraction (3 keywords per image)
- [x] Multi-language support (TR/EN/DE selectable)
- [x] Rate limiting (concurrency=2, delay=4s for Gemini)
- [x] Re-analysis button

### Presentation Mode
- [x] Overview mode (virtualized grid)
- [x] Focused mode (Prezi-style fullscreen zoom)
- [x] Smooth transitions (Framer Motion layoutId)
- [x] Voice control (Web Speech API)
- [x] Keyword matching (Levenshtein fuzzy)
- [x] Temporal decay (auto-return to overview after 10s silence)
- [x] Manual navigation (prev/next pointer control)
- [x] Click to focus/unfocus
- [x] 3 theme presets (dark, light, corporate)
- [x] Keyword overlay (shows which word triggered slide)

### Auth & Monetization
- [x] Firebase Auth (Google OAuth + email/password)
- [x] Firestore user profiles
- [x] Plan system (free/premium)
- [x] UserMenu dropdown
- [x] Login page with redirect
- [x] Profile page (modern SaaS UI)
- [x] iyzico checkout API
- [x] iyzico webhook handler
- [x] Freemium limits (3 presentations, watermark, no export)
- [x] PaywallBanner in presentation mode
- [x] WatermarkOverlay for free users
- [x] UpgradeDialog component

### Other
- [x] PDF/HTML export
- [x] PPT/HTML export
- [x] BSL 1.1 license
- [x] Copyright headers on all 114 source files
- [x] Memory Bank (.clinerules + memory-bank/)
- [x] Rehearsal mode (RehearsalView + RehearsalScore + useRehearsalMode)
- [x] Analytics session recorder (src/lib/analytics/sessionRecorder.ts)
- [x] Analytics page skeleton (src/app/presentation/[id]/analytics/page.tsx)
- [x] Transition types: zoom, fade, pan (src/lib/animation/transitions/)
- [x] Signup page (src/app/auth/signup/page.tsx)
- [x] Billing page (src/app/billing/page.tsx)
- [x] Middleware (src/middleware.ts — route protection)

## In Progress (Faz 2)

- [ ] Cloud sync: Save presentations to Firestore (currently IndexedDB only)
- [ ] Analytics dashboard: Wire sessionRecorder data to analytics/page.tsx
- [ ] Share link (public URL + QR code)
- [ ] BB#3 sessions 2-5 (feature prioritization)

## Backlog

- [ ] Mobile-responsive improvements
- [ ] Presentation templates
- [ ] Collaborative editing
- [ ] Export to real PPTX (pptxgenjs)
- [ ] Export to real PDF (jsPDF)
- [ ] Whisper WASM offline voice
- [ ] Gemini Speech adapter
- [ ] A/B test freemium limits

## Known Bugs / Issues
- Ollama requires user to have it running locally (no graceful error UX)
- iyzico webhook signature verification needs production testing
- Firestore rules need security audit before production
- COOP warnings from Firebase Google popup (cosmetic, not blocking)
