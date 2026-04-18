# DeepSlide - WBS (Work Breakdown Structure) + Quality Gates

**Proje:** DeepSlide - AI Destekli Sunum Uygulamasi
**Tarih:** 2026-04-05
**Versiyon:** v1.0

---

## OZET

| Metrik | Deger |
|--------|-------|
| Toplam Bolum (Seviye 2) | 10 |
| Toplam Is Paketi (Seviye 3) | 35 |
| Toplam Gorev (Seviye 4-5) | 127 |
| Quality Gate Sayisi | 10 |
| Tahmini Toplam Sure | ~784 saat |

---

## WBS AGACI

```
1.0 DEEPSLIDE - AI DESTEKLI SUNUM UYGULAMASI
|
+-- 1.1 PROJE KURULUMU & ALTYAPI
|   +-- 1.1.1 Gelistirme Ortami
|   |   +-- 1.1.1.1 Next.js 15 Proje Olusturma
|   |   |   +-- 1.1.1.1.1 create-next-app (TypeScript + App Router) (4s)
|   |   |   +-- 1.1.1.1.2 Tailwind CSS 4 + shadcn/ui entegrasyonu (4s)
|   |   +-- 1.1.1.2 Bagimliliklarin Kurulumu
|   |   |   +-- 1.1.1.2.1 Core: zustand, motion, react-virtuoso, idb, react-dropzone (4s)
|   |   |   +-- 1.1.1.2.2 AI: @google/genai, openai (Qwen uyumlu) (4s)
|   |   +-- 1.1.1.3 Proje Yapilandirmasi
|   |       +-- 1.1.1.3.1 ESLint + Prettier + TS strict mode (4s)
|   |       +-- 1.1.1.3.2 Klasor yapisi olusturma (4s)
|   |
|   +-- 1.1.2 Temel Veri Katmani
|   |   +-- 1.1.2.1 TypeScript Tip Tanimlari
|   |   |   +-- 1.1.2.1.1 types/presentation.ts (6s)
|   |   |   +-- 1.1.2.1.2 types/gemini.ts (4s)
|   |   |   +-- 1.1.2.1.3 types/speech.ts (4s)
|   |   +-- 1.1.2.2 IndexedDB Kurulumu
|   |   |   +-- 1.1.2.2.1 lib/db/index.ts - DB sema (6s)
|   |   |   +-- 1.1.2.2.2 lib/db/presentations.ts - CRUD (6s)
|   |   |   +-- 1.1.2.2.3 lib/db/images.ts - Blob + metadata (6s)
|   |   +-- 1.1.2.3 Zustand Store'lari
|   |       +-- 1.1.2.3.1 stores/presentationStore.ts (8s)
|   |       +-- 1.1.2.3.2 stores/speechStore.ts (6s)
|   |       +-- 1.1.2.3.3 stores/uiStore.ts (4s)
|   |
|   +-- 1.1.3 Temel Layout & Navigasyon
|       +-- 1.1.3.1 Root Layout
|       |   +-- 1.1.3.1.1 app/layout.tsx (4s)
|       |   +-- 1.1.3.1.2 app/globals.css (4s)
|       +-- 1.1.3.2 Layout Bilesenleri
|       |   +-- 1.1.3.2.1 components/layout/AppShell.tsx (4s)
|       |   +-- 1.1.3.2.2 components/layout/Header.tsx (6s)
|       |   +-- 1.1.3.2.3 components/layout/Sidebar.tsx (6s)
|       +-- 1.1.3.3 Sayfalar (Bos Kabuklar)
|           +-- 1.1.3.3.1 app/page.tsx - Dashboard (4s)
|           +-- 1.1.3.3.2 app/presentation/[id]/page.tsx - Editor (4s)
|           +-- 1.1.3.3.3 app/presentation/[id]/present/page.tsx - Sunum (4s)
|
|   QUALITY GATE 1 - PROJE ALTYAPISI (INTEGRATION)
|   [ ] npm run dev basarili acar
|   [ ] TypeScript strict 0 error
|   [ ] ESLint 0 error
|   [ ] IndexedDB CRUD calisiyor
|   [ ] Zustand store'lar initialize oluyor
|   [ ] Tum sayfalar aciyor (404 yok)
|   [ ] shadcn/ui bilesenleri renderlanir
|   GECEMEZSEN: Konfigurasyonu duzelt
|
|
+-- 1.2 GORSEL YUKLEME & ISLEME
|   +-- 1.2.1 Surukle-Birak Yukleme
|   |   +-- 1.2.1.1 DropZone Bileseni
|   |   |   +-- 1.2.1.1.1 components/upload/DropZone.tsx (6s)
|   |   |   +-- 1.2.1.1.2 DropZone.test.tsx (4s)
|   |   +-- 1.2.1.2 Yukleme Ilerleme
|   |       +-- 1.2.1.2.1 components/upload/UploadProgress.tsx (6s)
|   |       +-- 1.2.1.2.2 components/upload/ImagePreview.tsx (4s)
|   |
|   +-- 1.2.2 Gorsel Isleme Pipeline
|   |   +-- 1.2.2.1 Istemci Tarafi Isleme
|   |   |   +-- 1.2.2.1.1 lib/utils/imageProcessing.ts - Resize (6s)
|   |   |   +-- 1.2.2.1.2 imageProcessing - base64 + blob (4s)
|   |   |   +-- 1.2.2.1.3 imageProcessing.test.ts (4s)
|   |   +-- 1.2.2.2 IndexedDB Kayit
|   |       +-- 1.2.2.2.1 hooks/useImageUpload.ts (8s)
|   |       +-- 1.2.2.2.2 useImageUpload.test.ts (4s)
|   |
|   +-- 1.2.3 Yukleme Sayfasi Entegrasyonu
|       +-- 1.2.3.1 Yeni Sunum Sayfasi
|       |   +-- 1.2.3.1.1 app/presentation/new/page.tsx (6s)
|       |   +-- 1.2.3.1.2 Sunum olusturma akisi (4s)
|       +-- 1.2.3.2 Dashboard
|           +-- 1.2.3.2.1 app/page.tsx - Sunum listesi (6s)
|           +-- 1.2.3.2.2 Sunum karti bileseni (4s)
|
|   QUALITY GATE 2 - GORSEL YUKLEME (INTEGRATION)
|   [ ] 50 gorsel surukle-birak ile yuklenir
|   [ ] Gecersiz format reddedilir
|   [ ] 20MB ustu reddedilir
|   [ ] Thumbnail + analiz versiyonu olusturulur
|   [ ] IndexedDB kayit + okuma calisiyor
|   [ ] Dashboard sunum listesi gosterir
|   [ ] Sayfa yenilendikten sonra veriler korunur
|   GECEMEZSEN: imageProcessing + IndexedDB debug et
|   REGRESSION: QG-1
|
|
+-- 1.3 AI GORSEL ANALIZ (COKLU PROVIDER)
|   +-- 1.3.1 API Provider Adapter Katmani
|   |   +-- 1.3.1.1 Adapter Interface
|   |   |   +-- 1.3.1.1.1 lib/ai/types.ts - Provider interface (4s)
|   |   |   +-- 1.3.1.1.2 lib/ai/providerFactory.ts (4s)
|   |   +-- 1.3.1.2 Gemini Adapter
|   |   |   +-- 1.3.1.2.1 lib/ai/geminiAdapter.ts (8s)
|   |   |   +-- 1.3.1.2.2 lib/ai/prompts.ts (4s)
|   |   |   +-- 1.3.1.2.3 app/api/analyze/route.ts (6s)
|   |   +-- 1.3.1.3 Qwen Adapter
|   |       +-- 1.3.1.3.1 lib/ai/qwenAdapter.ts (8s)
|   |       +-- 1.3.1.3.2 app/api/analyze-qwen/route.ts (6s)
|   |
|   +-- 1.3.2 Batch Analiz Sistemi
|   |   +-- 1.3.2.1 Batch Orchestrator
|   |   |   +-- 1.3.2.1.1 lib/ai/analyzeBatch.ts - Kuyruk + paralellik (8s)
|   |   |   +-- 1.3.2.1.2 analyzeBatch - Progress callback (4s)
|   |   |   +-- 1.3.2.1.3 analyzeBatch.test.ts (6s)
|   |   +-- 1.3.2.2 Analiz Hook
|   |       +-- 1.3.2.2.1 hooks/useGeminiAnalysis.ts (6s)
|   |       +-- 1.3.2.2.2 useGeminiAnalysis.test.ts (4s)
|   |
|   +-- 1.3.3 Keyword Yonetimi
|   |   +-- 1.3.3.1 Badge Bileseni
|   |   |   +-- 1.3.3.1.1 components/keywords/KeywordBadge.tsx (6s)
|   |   |   +-- 1.3.3.1.2 KeywordBadge.test.tsx (4s)
|   |   +-- 1.3.3.2 Editor
|   |   |   +-- 1.3.3.2.1 components/keywords/KeywordEditor.tsx (8s)
|   |   |   +-- 1.3.3.2.2 KeywordEditor.test.tsx (4s)
|   |   +-- 1.3.3.3 Store Entegrasyonu
|   |       +-- 1.3.3.3.1 presentationStore keyword CRUD (6s)
|   |
|   +-- 1.3.4 API Secim UI
|       +-- 1.3.4.1 Ayarlar Paneli
|       |   +-- 1.3.4.1.1 components/presentation/PresentationSettings.tsx (8s)
|       |   +-- 1.3.4.1.2 .env.local sablonu (4s)
|       +-- 1.3.4.2 Provider Gecisi
|           +-- 1.3.4.2.1 uiStore API secim state (4s)
|
|   QUALITY GATE 3 - AI ANALIZ (INTEGRATION)
|   [ ] Gemini ile 5 gorsel analiz, 3-15 keyword
|   [ ] Qwen ile ayni test, ayni format
|   [ ] API secimi dogru provider kullanir
|   [ ] Batch: 20 gorsel, max 5 paralel, ilerleme cubugu
|   [ ] Basarisiz -> "failed" + "Tekrar Dene"
|   [ ] Keyword badge'leri gorunur
|   [ ] Keyword CRUD calisiyor
|   [ ] API key istemcide gizli
|   GECEMEZSEN: API entegrasyonu + prompt debug et
|   REGRESSION: QG-1, QG-2
|
|
+-- 1.4 GRID CANVAS & DUZENLEME
|   +-- 1.4.1 Virtualized Grid
|   |   +-- 1.4.1.1 Grid Container
|   |   |   +-- 1.4.1.1.1 components/canvas/PresentationCanvas.tsx (6s)
|   |   |   +-- 1.4.1.1.2 components/canvas/CanvasControls.tsx (4s)
|   |   |   +-- 1.4.1.1.3 PresentationCanvas.test.tsx (4s)
|   |   +-- 1.4.1.2 Image Card
|   |       +-- 1.4.1.2.1 components/canvas/ImageCard.tsx (8s)
|   |       +-- 1.4.1.2.2 ImageCard.test.tsx (4s)
|   |
|   +-- 1.4.2 Gorsel Siralama
|   |   +-- 1.4.2.1 Surukle-Birak
|   |   |   +-- 1.4.2.1.1 Grid'e DnD ekleme (8s)
|   |   |   +-- 1.4.2.1.2 Siralama kaydetme (4s)
|   |   +-- 1.4.2.2 AI Kumeleme
|   |       +-- 1.4.2.2.1 lib/utils/clustering.ts (8s)
|   |       +-- 1.4.2.2.2 "Otomatik Duzenle" butonu (4s)
|   |
|   +-- 1.4.3 Editor Sayfa Entegrasyonu
|       +-- 1.4.3.1 Editor Sayfasi
|       |   +-- 1.4.3.1.1 app/presentation/[id]/page.tsx (8s)
|       |   +-- 1.4.3.1.2 components/presentation/PresentationToolbar.tsx (6s)
|       +-- 1.4.3.2 Gorsel Detay
|           +-- 1.4.3.2.1 Gorsel detay modali (6s)
|
|   QUALITY GATE 4 - GRID CANVAS (INTEGRATION)
|   [ ] 200 gorsel grid, kaydirma 60fps
|   [ ] DOM'da max 25 element
|   [ ] Sutun sayisi degistirilebilir (3/4/5)
|   [ ] Surukle-birak siralama + kaydetme
|   [ ] Editor sayfasi: grid + toolbar + keyword editor
|   [ ] Gorsel detay modali calisiyor
|   GECEMEZSEN: Virtualization + performans profiling
|   REGRESSION: QG-1, QG-2, QG-3
|
|
+-- 1.5 SES TANIMA & ESLESTIRME (COKLU MOTOR)
|   +-- 1.5.1 Ses Tanima Adapter Katmani
|   |   +-- 1.5.1.1 Adapter Interface
|   |   |   +-- 1.5.1.1.1 lib/speech/types.ts (4s)
|   |   |   +-- 1.5.1.1.2 lib/speech/providerFactory.ts (4s)
|   |   +-- 1.5.1.2 Web Speech Adapter
|   |   |   +-- 1.5.1.2.1 lib/speech/webSpeechAdapter.ts (8s)
|   |   |   +-- 1.5.1.2.2 webSpeechAdapter.test.ts (4s)
|   |   +-- 1.5.1.3 Gemini Ses Adapter
|   |   |   +-- 1.5.1.3.1 lib/speech/geminiSpeechAdapter.ts (8s)
|   |   |   +-- 1.5.1.3.2 app/api/speech/route.ts (6s)
|   |   +-- 1.5.1.4 Whisper WASM Adapter
|   |       +-- 1.5.1.4.1 lib/speech/whisperAdapter.ts (8s)
|   |       +-- 1.5.1.4.2 whisperAdapter - arkaplan indirme (4s)
|   |
|   +-- 1.5.2 Keyword Eslestirme Motoru
|   |   +-- 1.5.2.1 Inverted Index
|   |   |   +-- 1.5.2.1.1 lib/speech/keywordMatcher.ts - buildIndex (6s)
|   |   |   +-- 1.5.2.1.2 keywordMatcher - match + fuzzy (8s)
|   |   +-- 1.5.2.2 Levenshtein
|   |   |   +-- 1.5.2.2.1 lib/utils/levenshtein.ts (4s)
|   |   |   +-- 1.5.2.2.2 levenshtein.test.ts (4s)
|   |   +-- 1.5.2.3 Eslestirme Hook
|   |       +-- 1.5.2.3.1 hooks/useKeywordMatch.ts (8s)
|   |       +-- 1.5.2.3.2 useKeywordMatch.test.ts (4s)
|   |
|   +-- 1.5.3 Temporal Decay & Orchestration
|   |   +-- 1.5.3.1 Orchestrator
|   |   |   +-- 1.5.3.1.1 lib/animation/orchestrator.ts (8s)
|   |   |   +-- 1.5.3.1.2 orchestrator.test.ts (4s)
|   |   +-- 1.5.3.2 Ses Hook
|   |       +-- 1.5.3.2.1 hooks/useSpeechRecognition.ts (8s)
|   |       +-- 1.5.3.2.2 useSpeechRecognition.test.ts (4s)
|   |
|   +-- 1.5.4 Ses UI Bilesenleri
|       +-- 1.5.4.1 components/speech/SpeechControls.tsx (8s)
|       +-- 1.5.4.1.2 SpeechControls.test.tsx (4s)
|       +-- 1.5.4.2 components/speech/TranscriptOverlay.tsx (4s)
|       +-- 1.5.4.3 components/speech/MatchIndicator.tsx (4s)
|
|   QUALITY GATE 5 - SES TANIMA (INTEGRATION)
|   [ ] Web Speech API konusma -> metin (Turkce)
|   [ ] Gemini ses API calisiyor
|   [ ] Provider degisimi basarili
|   [ ] Exact match calisiyor
|   [ ] Fuzzy match: "inovasyIn" eslsir, "navigasyon" eslsmez
|   [ ] Esleme < 300ms
|   [ ] Temporal decay: 10sn sonra kuculme
|   [ ] SpeechControls UI calisiyor
|   GECEMEZSEN: Esleme algoritmasini debug et
|   REGRESSION: QG-1 ~ QG-4
|
|
+-- 1.6 ANIMASYON & SUNUM MODU
|   +-- 1.6.1 Motion Animasyon
|   |   +-- 1.6.1.1 Tanimlar
|   |   |   +-- 1.6.1.1.1 lib/animation/variants.ts (4s)
|   |   |   +-- 1.6.1.1.2 lib/animation/transitions.ts (4s)
|   |   +-- 1.6.1.2 Animasyonlu Kart
|   |       +-- 1.6.1.2.1 components/canvas/ImageCardAnimated.tsx (8s)
|   |       +-- 1.6.1.2.2 Progressive image loading (6s)
|   |       +-- 1.6.1.2.3 ImageCardAnimated.test.tsx (4s)
|   |
|   +-- 1.6.2 Spotlight Modu
|   |   +-- 1.6.2.1 Spotlight
|   |   |   +-- 1.6.2.1.1 components/canvas/SpotlightOverlay.tsx (8s)
|   |   |   +-- 1.6.2.1.2 Spotlight 3sn timeout otomatik secim (4s)
|   |   +-- 1.6.2.2 Entegrasyon
|   |       +-- 1.6.2.2.1 useKeywordMatch + orchestrator spotlight (6s)
|   |
|   +-- 1.6.3 Sunum Modu
|   |   +-- 1.6.3.1 Fullscreen
|   |   |   +-- 1.6.3.1.1 app/presentation/[id]/present/page.tsx (8s)
|   |   |   +-- 1.6.3.1.2 hooks/usePresentationMode.ts (8s)
|   |   |   +-- 1.6.3.1.3 usePresentationMode.test.ts (4s)
|   |   +-- 1.6.3.2 Adaptif UI
|   |   |   +-- 1.6.3.2.1 components/presentation/AdaptiveControls.tsx (8s)
|   |   |   +-- 1.6.3.2.2 AdaptiveControls.test.tsx (4s)
|   |   +-- 1.6.3.3 Klavye Kisayollari
|   |       +-- 1.6.3.3.1 Space/Escape/ok tuslari (4s)
|   |
|   +-- 1.6.4 Ken Burns Efekti
|       +-- 1.6.4.1.1 lib/animation/kenBurns.ts (6s)
|       +-- 1.6.4.1.2 ImageCardAnimated'a Ken Burns ekleme (4s)
|
|   QUALITY GATE 6 - ANIMASYON & SUNUM (E2E)
|   [ ] Fullscreen acar, UI gizlenir
|   [ ] Ses tanima otomatik baslar
|   [ ] Keyword -> gorsel zoom 500ms icinde
|   [ ] Eslesmeyen gorseller kararir
|   [ ] Temporal decay calisiyor
|   [ ] Spotlight: parlaklas + secim
|   [ ] Adaptif UI: gizle/goster
|   [ ] Klavye: Space/Escape
|   [ ] 60fps animasyon
|   [ ] Ken Burns efekti
|   GECEMEZSEN: Animasyon performansini profil et
|   REGRESSION: QG-1 ~ QG-5
|
|
+-- 1.7 PROVA MODU & GUVEN SKORU
|   +-- 1.7.1 Prova Sistemi
|   |   +-- 1.7.1.1 Prova Hook
|   |   |   +-- 1.7.1.1.1 hooks/useRehearsalMode.ts (8s)
|   |   |   +-- 1.7.1.1.2 useRehearsalMode.test.ts (4s)
|   |   +-- 1.7.1.2 Prova UI
|   |       +-- 1.7.1.2.1 components/rehearsal/RehearsalView.tsx (8s)
|   |       +-- 1.7.1.2.2 components/rehearsal/RehearsalScore.tsx (6s)
|   |       +-- 1.7.1.2.3 components/rehearsal/SynonymSuggestion.tsx (4s)
|   |
|   +-- 1.7.2 Entegrasyon
|       +-- 1.7.2.1.1 Editor toolbar "Prova" butonu (4s)
|
|   QUALITY GATE 7 - PROVA MODU (INTEGRATION)
|   [ ] Prova baslar, ses tanima aktive olur
|   [ ] Yesil/kirmizi renklendirme dogru
|   [ ] Guven skoru % dogru hesaplanir
|   [ ] Synonym onerisi sunulur ve eklenebilir
|   [ ] Synonym sonrasi esleme calisiyor
|   GECEMEZSEN: Eslestirme + UI debug et
|   REGRESSION: QG-1 ~ QG-6
|
|
+-- 1.8 CEVRIMDISI MOD & PREMIUM
|   +-- 1.8.1 Cevrimdisi Destek
|   |   +-- 1.8.1.1 Algilama
|   |   |   +-- 1.8.1.1.1 lib/utils/networkStatus.ts (4s)
|   |   |   +-- 1.8.1.1.2 Bildirim + fallback tetikleme (4s)
|   |   +-- 1.8.1.2 Whisper WASM
|   |       +-- 1.8.1.2.1 Arkaplan model indirme + cache (8s)
|   |       +-- 1.8.1.2.2 "Cevrimdisi Hazir" badge (4s)
|   |       +-- 1.8.1.2.3 Cevrimdisi sunum akisi (6s)
|   |
|   +-- 1.8.2 PDF/PPT Export
|   |   +-- 1.8.2.1 PDF
|   |   |   +-- 1.8.2.1.1 lib/export/pdfExport.ts (8s)
|   |   |   +-- 1.8.2.1.2 pdfExport.test.ts (4s)
|   |   +-- 1.8.2.2 PPT
|   |       +-- 1.8.2.2.1 lib/export/pptExport.ts (8s)
|   |       +-- 1.8.2.2.2 pptExport.test.ts (4s)
|   |
|   +-- 1.8.3 Bulut Depolama (Premium)
|   |   +-- 1.8.3.1 Bulut
|   |   |   +-- 1.8.3.1.1 lib/cloud/cloudStorage.ts (8s)
|   |   |   +-- 1.8.3.1.2 app/api/upload/route.ts (6s)
|   |   |   +-- 1.8.3.1.3 IndexedDB <-> Bulut senkronizasyon (6s)
|   |   +-- 1.8.3.2 Premium
|   |       +-- 1.8.3.2.1 100 gorsel siniri + upsell UI (4s)
|   |
|   +-- 1.8.4 Loglama
|       +-- 1.8.4.1.1 lib/utils/logger.ts (6s)
|       +-- 1.8.4.1.2 Log export (4s)
|
|   QUALITY GATE 8 - CEVRIMDISI & PREMIUM (E2E)
|   [ ] Internet kesildiginde sunum devam eder
|   [ ] Whisper model arkaplanda indirilir
|   [ ] Whisper ile cevrimdisi ses tanima calisiyor
|   [ ] Whisper yokken manuel mod onerisi
|   [ ] PDF export duzgun cikti
|   [ ] PPT export duzgun cikti
|   [ ] 101. gorsel reddedilir (ucretsiz)
|   [ ] Log JSON export calisiyor
|   GECEMEZSEN: Whisper + export debug et
|   REGRESSION: QG-1 ~ QG-7
|
|
+-- 1.9 PERFORMANS & POLISH
|   +-- 1.9.1 Performans
|   |   +-- 1.9.1.1 Gorsel Optimizasyonu
|   |   |   +-- 1.9.1.1.1 Lazy loading (4s)
|   |   |   +-- 1.9.1.1.2 will-change yonetimi (4s)
|   |   +-- 1.9.1.2 Render Optimizasyonu
|   |   |   +-- 1.9.1.2.1 Zustand selectors (4s)
|   |   |   +-- 1.9.1.2.2 React.memo + useMemo (4s)
|   |   +-- 1.9.1.3 Lighthouse
|   |       +-- 1.9.1.3.1 Lighthouse >= 90 hedefi (6s)
|   |
|   +-- 1.9.2 Hata Yonetimi
|   |   +-- 1.9.2.1 Error boundary (4s)
|   |   +-- 1.9.2.2 Tarayici uyumluluk kontrolu (4s)
|   |   +-- 1.9.2.3 Skeleton loader'lar (6s)
|   |
|   +-- 1.9.3 Responsive
|       +-- 1.9.3.1 Tablet uyumu (6s)
|       +-- 1.9.3.2 Mobil temel (6s)
|
|   QUALITY GATE 9 - PERFORMANS (E2E)
|   [ ] Lighthouse >= 90
|   [ ] 500 gorsel 60fps kaydirma
|   [ ] Animasyon frame drop < %5
|   [ ] FCP < 1.5s
|   [ ] Kelime -> zoom < 500ms (p95)
|   [ ] Error boundary calisiyor
|   [ ] Tarayici uyari gosteriliyor
|   [ ] Tablet duzgun gorunuyor
|   GECEMEZSEN: Profiling + optimize et
|   REGRESSION: QG-1 ~ QG-8
|
|
+-- 1.10 FINAL TEST & YAYIN
    +-- 1.10.1 E2E Testler
    |   +-- 1.10.1.1.1 Playwright kurulumu (4s)
    |   +-- 1.10.1.2.1 E2E: Sunum olusturma (6s)
    |   +-- 1.10.1.2.2 E2E: Cevrimdisi sunum (6s)
    |   +-- 1.10.1.2.3 E2E: Gurultulu ortam (6s)
    |
    +-- 1.10.2 Yayin
        +-- 1.10.2.1.1 Vercel deployment (4s)
        +-- 1.10.2.1.2 Env variables (4s)
        +-- 1.10.2.1.3 Domain + HTTPS (4s)
        +-- 1.10.2.2.1 KVKK/GDPR sayfasi (4s)
        +-- 1.10.2.2.2 Meta taglar + favicon (4s)

    QUALITY GATE 10 - FINAL (FULL REGRESSION + UAT)
    [ ] TC-UAT-001: 200 gorsel yukleme
    [ ] TC-UAT-002: Gemini keyword cikarma
    [ ] TC-UAT-003: Qwen keyword cikarma
    [ ] TC-UAT-004: Sesle navigasyon (Web Speech)
    [ ] TC-UAT-005: Sesle navigasyon (Gemini)
    [ ] TC-UAT-006: Fuzzy matching dogrulugu
    [ ] TC-UAT-007: Spotlight modu
    [ ] TC-UAT-008: Prova modu + guven skoru
    [ ] TC-UAT-009: Cevrimdisi sunum
    [ ] TC-UAT-010: Adaptif UI
    [ ] TC-UAT-011: PDF export
    [ ] TC-UAT-012: API secimi degistirme
    [ ] Playwright E2E: 3 senaryo gecti
    [ ] QG-1 ~ QG-9: TUM regression gecti
    [ ] Lighthouse >= 90
    [ ] Vercel canli, URL erisilebilir
    GECEMEZSEN: Basarisiz testi bul, duzelt, tum QG tekrar calistir
```

---

## AI ILE KODLAMA STRATEJISI

### Yaklasim: Vertical Slicing + Spec-Driven Development

Her WBS gorevi icin AI prompt yapisi:
1. Dosya yolunu belirt
2. Bagimli dosyalari referans goster
3. Fonksiyon/sinif imzasini ver
4. Giris/cikis formatini acikla
5. Kabul kriterini belirt (Given/When/Then)

### Optimum Gorev Boyutu
- Tek dosya, 100-500 satir kod
- 4-8 saat is (8/80 kurali)
- Tek sorumluluk (1 dosya = 1 fonksiyon grubu)
- Test edilebilir (her gorev icin test dosyasi)

### Uygulama Sirasi

| Sira | Bolum | Gorev | QG |
|:----:|-------|:-----:|:--:|
| 1 | 1.1 Proje Kurulumu & Altyapi | 21 | QG-1 |
| 2 | 1.2 Gorsel Yukleme & Isleme | 14 | QG-2 |
| 3 | 1.3 AI Gorsel Analiz | 19 | QG-3 |
| 4 | 1.4 Grid Canvas & Duzenleme | 13 | QG-4 |
| 5 | 1.5 Ses Tanima & Eslestirme | 20 | QG-5 |
| 6 | 1.6 Animasyon & Sunum Modu | 18 | QG-6 |
| 7 | 1.7 Prova Modu & Guven | 7 | QG-7 |
| 8 | 1.8 Cevrimdisi & Premium | 15 | QG-8 |
| 9 | 1.9 Performans & Polish | 10 | QG-9 |
| 10 | 1.10 Final Test & Yayin | 10 | QG-10 |
| **TOPLAM** | | **147** | **10** |

### Anti-Pattern'lardan Kacin
- Ayni prompt'ta plan + kod isteme
- Birden fazla dosyayi ayni anda degistirme
- Context window'u gereksiz kodla doldurma
- Test olmadan sonraki goreve gecme
- Quality Gate atlamadan ilerleme
