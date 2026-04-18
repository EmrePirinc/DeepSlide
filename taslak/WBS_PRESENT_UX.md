# WBS — DeepSlide Present UX Redesign + Keyword Hint Sistemi

**Kaynak SPEC:** `/Users/emrepirinc/Documents/DeepSlide/SPEC_PRESENT_UX.md`
**Proje:** DeepSlide Present Page v2
**Kapsam:** 20 FR + 12 NFR, 7 MVP özelliği, ~14 gün iş (2 sprint)
**Proje dizini:** `/Users/emrepirinc/Documents/DeepSlide/app/src/`
**Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, Framer Motion, Vitest
**Korunan:** `useKeywordMatch` MVP (Aho-Corasick + Turkish NLP, 37/37 test yeşil)

---

## Hedefler

- **Faz 1 MVP — Sprint 1 + Sprint 2**, toplam 22 atomic task
- Her task 4-8 saat = 1 AI oturumu = 1 dosya/modül
- Sıfır NPM dependency eklemesi (bundle minimize)
- 2 Quality Gate (her sprint sonu)
- Paralel çalışabilir gruplar tanımlı

---

# 📐 WBS Ağacı (5 Seviye)

```
1.0 DeepSlide Present UX v2
│
├── 1.1 Sprint 1 — Altyapı + Quick Wins (5 gün)
│   ├── 1.1.1 Fullscreen Slide Rendering
│   │   ├── 1.1.1.1 Focused Slide Layout
│   │   │   └── T-1.1.1.1.1 FocusedSlide refactor 100vh + object-contain
│   │   └── 1.1.1.2 Pillarbox Background
│   │       └── T-1.1.1.2.1 Gaussian blur arka plan overlay
│   │
│   ├── 1.1.2 Slide Position Indicator
│   │   └── 1.1.2.1 Position Bar Component
│   │       ├── T-1.1.2.1.1 SlidePositionBar 2px bar render
│   │       └── T-1.1.2.1.2 Hover reveal tooltip
│   │
│   ├── 1.1.3 Unified PresenterBottomBar
│   │   ├── 1.1.3.1 Visibility Hook
│   │   │   └── T-1.1.3.1.1 usePresenterUIVisibility custom hook
│   │   ├── 1.1.3.2 Bar Component
│   │   │   └── T-1.1.3.2.1 PresenterBottomBar 4 button floating pill
│   │   ├── 1.1.3.3 Present Page Integration
│   │   │   └── T-1.1.3.3.1 AdaptiveControls/SpeechControls kaldır, PresenterBottomBar entegre
│   │   └── 1.1.3.4 Touch + ESC Behavior
│   │       └── T-1.1.3.4.1 Touch tap toggle + ESC emergency reveal
│   │
│   └── 1.1.4 Keyword.isHint Temel Altyapı
│       ├── 1.1.4.1 Type + Schema
│       │   └── T-1.1.4.1.1 types/presentation.ts isHint alanı + backward compat
│       └── 1.1.4.2 Editor Toggle UI
│           └── T-1.1.4.2.1 KeywordBadge click toggle + yellow ring visual
│
│   ### QUALITY GATE 1 — Sprint 1 Integration
│
├── 1.2 Sprint 2 — Voice Jump + Hint Sistemi (5 gün)
│   ├── 1.2.1 Voice Jump Engine
│   │   ├── 1.2.1.1 Jump Hook Skeleton
│   │   │   └── T-1.2.1.1.1 useVoiceJump hook yaratma (useKeywordMatch wrapper)
│   │   ├── 1.2.1.2 Multi-Word Priority
│   │   │   └── T-1.2.1.2.1 keywordMatcher.ts longest-match kazanır kuralı
│   │   ├── 1.2.1.3 Recency Prior
│   │   │   └── T-1.2.1.3.1 Son 60sn gösterilmiş slayt deprioritize
│   │   └── 1.2.1.4 ARIA Announcement
│   │       └── T-1.2.1.4.1 aria-live region + slayt geçiş duyurusu
│   │
│   ├── 1.2.2 Gemini Smart Default
│   │   ├── 1.2.2.1 Prompt Update
│   │   │   └── T-1.2.2.1.1 lib/ai/prompts.ts top-2 isHint autoselect
│   │   └── 1.2.2.2 Parser + Propagation
│   │       └── T-1.2.2.2.1 parser.ts + analyzeBatch.ts isHint field propagate
│   │
│   ├── 1.2.3 Corner Hint Chips
│   │   ├── 1.2.3.1 Chip Component
│   │   │   └── T-1.2.3.1.1 CornerHintChip (prev/next prop + null render)
│   │   ├── 1.2.3.2 Max 3 Overflow Logic
│   │   │   └── T-1.2.3.2.1 "+N daha" overflow chip + popover
│   │   └── 1.2.3.3 Present Page Integration
│   │       └── T-1.2.3.3.1 CornerHintChip'leri sol-üst + sağ-üst render
│   │
│   └── 1.2.4 Accessibility + Motion
│       ├── 1.2.4.1 Reduced Motion Support
│       │   └── T-1.2.4.1.1 prefers-reduced-motion global handling
│       └── 1.2.4.2 WCAG Kontrast Doğrulama
│           └── T-1.2.4.2.1 Tüm text öğelerini 4.5:1 kontrast test et
│
│   ### QUALITY GATE 2 — Sprint 2 Integration + E2E
│
└── 1.3 Faz Sonu — QA + Deploy (1 gün)
    ├── 1.3.1 Regression Testing
    │   └── T-1.3.1.1.1 Mevcut 37 test + yeni test suite run
    ├── 1.3.2 Manual Browser Test
    │   └── T-1.3.2.1.1 Chrome/Safari/Firefox smoke test, production
    └── 1.3.3 Production Deploy
        └── T-1.3.3.1.1 Final commit + push → Vercel auto-deploy + smoke test

    ### QUALITY GATE 3 — Production Smoke
```

---

# 🎯 Atomic Task Kataloğu (22 Task)

Her task `[WBS-ID] [Görev Adı]` formatında. FR + NFR referansları, paralel çalışma haritası, AI Prompt Template ekli.

---

## SPRINT 1 — Altyapı + Quick Wins

### T-1.1.1.1.1 — FocusedSlide Refactor (100vh + object-contain)

- **FR:** FR-001 | **NFR:** NFR-PERF-001
- **Sprint:** 1
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.1.2.1.1, T-1.1.3.1.1, T-1.1.4.1.1 ile)
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/components/presentation/FocusedSlide.tsx`

##### AI PROMPT: T-1.1.1.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.1.1.1 — FocusedSlide fullscreen render
FR: FR-001 | NFR: NFR-PERF-001 (FPS ≥30)

HEDEF: FocusedSlide component'inin slayt görseli render eden kısmını
100vh × 100vw alanında object-contain ile göster. Mevcut max-h-[85vh]
kırpmasını kaldır.

DOSYA: app/src/components/presentation/FocusedSlide.tsx

DEĞIŞIKLIK:
  - Container: fixed inset-0 h-screen w-screen
  - Image: max-h-screen max-w-screen object-contain
  - UI overlay absolute positioning korunsun (PresenterBottomBar, Corner chips)

KABUL KRİTERİ:
  VERİLDİĞİ DURUMDA: Overview mode'da kullanıcı grid görüyor
  NE ZAMAN: Bir görsele odaklanılır (focusedImageId set edilir)
  O ZAMAN: Slayt 100vh × 100vw alanında görünür
  AND: object-contain ile kırpma yok
  AND: UI overlay'leri (alt bar, corner chips) slayt üstünde absolute görünür
  AND: Framer Motion layoutId animasyonu bozulmaz

KISITLAR:
  - Mevcut layoutId animasyonunu KORU
  - Tailwind class'lar, custom CSS yok
  - TypeScript strict: 0 hata

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/components/presentation/FocusedSlide.tsx — mevcut yapı
  - app/src/app/presentation/[id]/present/page.tsx L44 — layoutId usage

HEDEF: Slayt tam ekranda, kırpma yok, animasyon bozulmadan.
BAŞARI: Chrome DevTools'ta slayt 100vh × 100vw rect ölçülür, kırpma/letterbox yok
        (pillarbox için T-1.1.1.2.1 bir sonraki task).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.1.2.1 — Gaussian Blur Pillarbox Background

- **FR:** FR-002 | **NFR:** NFR-PERF-001
- **Bağımlılık:** T-1.1.1.1.1
- **Paralel?:** Hayır (aynı dosya)
- **Süre:** 4-5 saat
- **Dosyalar:**
  - `app/src/components/presentation/FocusedSlide.tsx`

##### AI PROMPT: T-1.1.1.2.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.1.2.1 — Gaussian blur pillarbox background
FR: FR-002 | NFR: NFR-PERF-001 (FPS ≥30)

HEDEF: Slayt oranı ekran oranından farklı olduğunda kenarlarda oluşan
boş alanı siyah bırakma; aynı görselin scale(1.5) + blur(40px) uygulanmış
versiyonu arka plan olarak göster.

DOSYA: app/src/components/presentation/FocusedSlide.tsx

DEĞİŞİKLİK:
  - Container'ın arkasına absolute inset-0 div ekle:
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img
        src={image.url}
        className="w-full h-full object-cover scale-150 blur-3xl opacity-80"
        aria-hidden="true"
      />
    </div>
  - Ön plandaki slayt görseli mevcut (T-1.1.1.1.1)
  - CSS backdrop-filter YERINE sadece filter: blur kullan (performans)

KABUL KRİTERİ:
  GIVEN: 16:9 ekranda 4:3 görsel
  WHEN: Focused mode render
  THEN: Slayt ortada contain, yanlarda scale(1.5) + blur(40px) arka plan
  AND: Chrome Performance tool ile ölçüldüğünde FPS ≥30 (NFR-PERF-001)
  AND: aria-hidden="true" — screen reader blur arkaplanı okumaz

KISITLAR:
  - Tailwind: blur-3xl = 24px (yeterli değil, custom blur-[40px] kullan)
  - Image load lazy değil — zaten ana görselle aynı URL, cache hit
  - TypeScript strict: 0 hata

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/components/presentation/FocusedSlide.tsx (T-1.1.1.1.1 sonrası hali)

HEDEF: Siyah şerit/letterbox görünmesin, Spotify artist-page tarzı sinematik.
BAŞARI: 4:3 görsel 16:9 ekranda iki yanı aynı görsel blur ile dolu,
        FPS Chrome Perf'te 30+ ölçülür.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.2.1.1 — SlidePositionBar 2px Progress Render

- **FR:** FR-007 | **NFR:** NFR-PERF-004
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.1.1.1.1, T-1.1.3.1.1, T-1.1.4.1.1)
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/components/presentation/SlidePositionBar.tsx` (YENİ)

##### AI PROMPT: T-1.1.2.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.2.1.1 — SlidePositionBar component
FR: FR-007 | NFR: NFR-PERF-004 (300ms animation)

HEDEF: Ekranın üst kenarında 2 piksel ince bir progress bar göster.
currentIndex / totalSlides oranını bar'ın dolu genişliği olarak yansıt.

DOSYA: app/src/components/presentation/SlidePositionBar.tsx (YENİ)

API:
  interface SlidePositionBarProps {
    currentIndex: number;
    totalSlides: number;
  }
  export function SlidePositionBar({ currentIndex, totalSlides }: SlidePositionBarProps)

RENDER:
  - Container: fixed top-0 left-0 right-0 h-[2px] z-40 bg-white/10
  - Fill: absolute h-full bg-primary transition-all duration-300 ease-out
  - Width: ((currentIndex + 1) / totalSlides * 100) + '%'
  - Hover handling için grup class ekle (T-1.1.2.1.2'de detay)

KABUL KRİTERİ:
  GIVEN: totalSlides=15, currentIndex=5
  WHEN: Component render
  THEN: Top kenarda 2px yüksek bar, %40 primary renk dolu (6/15 = %40)
  AND: currentIndex değişirse 300ms cubic-bezier animasyon
  AND: Dark ve light temada kontrast 4.5:1+ (NFR-ACC-001)

KISITLAR:
  - Sadece Tailwind class'lar (custom CSS yok)
  - Framer Motion kullanma — basit CSS transition yeterli
  - TypeScript strict

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/components/presentation/SlideNavigator.tsx — mevcut navigation pattern

HEDEF: Konuşmacı "şu an neredeyim?" sorusunu 100ms'de çözebilsin, dinleyici farkına varmasın.
BAŞARI: Ekranın en üstünde sadece 2px bar, progress akıcı, kontrast AA.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.2.1.2 — SlidePositionBar Hover Reveal Tooltip

- **FR:** FR-008 | **NFR:** NFR-ACC-001
- **Bağımlılık:** T-1.1.2.1.1
- **Paralel?:** Hayır (aynı dosya)
- **Süre:** 3 saat
- **Dosyalar:**
  - `app/src/components/presentation/SlidePositionBar.tsx`

##### AI PROMPT: T-1.1.2.1.2

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.2.1.2 — Hover reveal tooltip on position bar
FR: FR-008 | NFR: NFR-ACC-001

HEDEF: Cursor progress bar üzerine gelince bar 2px→6px kalınlaşır ve
"6/15" tooltip görünür. Cursor uzaklaşınca geri 2px.

DOSYA: app/src/components/presentation/SlidePositionBar.tsx

DEĞİŞİKLİK:
  - onMouseEnter → setIsHovered(true)
  - onMouseLeave → setIsHovered(false)
  - Bar height: isHovered ? 'h-[6px]' : 'h-[2px]'
  - Tooltip: isHovered && <div className="absolute top-[8px] ...">
  - Tooltip içeriği: `${currentIndex + 1}/${totalSlides}`
  - Tooltip arka plan bg-black/80, text-white text-xs padding-x-2 py-1 rounded

KABUL KRİTERİ:
  GIVEN: Progress bar render edildi, currentIndex=5, totalSlides=15
  WHEN: Cursor bar üzerine gelir
  THEN: Bar 200ms içinde 6px'e kalınlaşır
  AND: Bar'ın hemen altında "6/15" tooltip görünür (pozisyon: cursor'a yakın)
  AND: Cursor uzaklaşınca bar 2px'e döner, tooltip kaybolur
  AND: Tooltip kontrast 4.5:1+ (beyaz metin koyu zemin)

KISITLAR:
  - React state useState
  - Transition: transition-all duration-200

BAĞLAM İÇİN ÖNCE OKU:
  - T-1.1.2.1.1'deki bar implementasyonu

HEDEF: Konuşmacı isteyince pozisyon bilgisini görebilir, normalde görünmez.
BAŞARI: Mouse hover → tooltip 200ms'de çıkar, leave → kaybolur.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.3.1.1 — usePresenterUIVisibility Custom Hook

- **FR:** FR-010, FR-011, FR-012 | **NFR:** NFR-PERF-004, NFR-ACC-003
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.1.1.1.1, T-1.1.2.1.1, T-1.1.4.1.1)
- **Süre:** 4-5 saat
- **Dosyalar:**
  - `app/src/hooks/usePresenterUIVisibility.ts` (YENİ)

##### AI PROMPT: T-1.1.3.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.3.1.1 — usePresenterUIVisibility hook
FR: FR-010, FR-011, FR-012 | NFR: NFR-PERF-004, NFR-ACC-003

HEDEF: Alt bar'ın görünürlük state'ini yönet. Auto-hide 3sn idle,
cursor/arrow/ESC ile fade-in, touch tap toggle. Tüm component'ler bu
hook'a subscribe olur, event listener tek yerden.

DOSYA: app/src/hooks/usePresenterUIVisibility.ts (YENİ)

API:
  export function usePresenterUIVisibility(): {
    isVisible: boolean;
    reveal: () => void;    // Manuel trigger (ESC, touch)
    hide: () => void;      // Force hide (overview'e geçiş vs.)
  }

DAVRANIŞ:
  1. İlk render: isVisible=true, 3sn timer başlat
  2. Timer dolarsa isVisible=false
  3. mousemove event → timer reset, isVisible=true
  4. keydown ArrowLeft/ArrowRight → timer reset, isVisible=true, 2sn'de tekrar auto-hide
  5. keydown Escape → reveal() çağrılır, isVisible=true, timer 2sn
  6. touchstart → toggle (görünürse gizle, değilse göster + 2sn)

GLOBAL EVENTS:
  useEffect içinde:
  - window.addEventListener('mousemove', resetTimer)
  - window.addEventListener('keydown', handleKey)
  - window.addEventListener('touchstart', handleTouch)
  - Cleanup return function'da removeEventListener

REDUCED MOTION (NFR-ACC-003):
  window.matchMedia('(prefers-reduced-motion: reduce)') → matches=true
  ise fade duration 100ms, değilse 300ms (component tarafında kullan)

KABUL KRİTERİ:
  GIVEN: Hook mount edildi
  WHEN: 3sn hiçbir event yok
  THEN: isVisible=false olur
  AND: mousemove → isVisible=true + 3sn timer reset
  AND: Escape → isVisible=true + 2sn
  AND: touchstart → toggle
  AND: Unmount'ta tüm event listener cleanup

KISITLAR:
  - useRef for timer ID (re-render tetiklemesin)
  - useEffect cleanup EKSIKSIZ (memory leak bu tür hook'ların #1 bug'ı)
  - TypeScript strict

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/components/presentation/AdaptiveControls.tsx L36-72 — mevcut auto-hide pattern

HEDEF: Tek yerden yönetilen UI visibility, event leak yok.
BAŞARI: 3 component (bar, corner chips, progress bar) bu hook'a subscribe olur,
        tüm cleanup doğru, TypeScript 0 hata.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.3.2.1 — PresenterBottomBar Floating Pill Component

- **FR:** FR-009 | **NFR:** NFR-ACC-001, NFR-ACC-005
- **Bağımlılık:** T-1.1.3.1.1
- **Paralel?:** Hayır
- **Süre:** 5-6 saat
- **Dosyalar:**
  - `app/src/components/presentation/PresenterBottomBar.tsx` (YENİ)

##### AI PROMPT: T-1.1.3.2.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.3.2.1 — PresenterBottomBar component
FR: FR-009 | NFR: NFR-ACC-001 (4.5:1), NFR-ACC-005 (keyboard nav)

HEDEF: Alt kenarda floating pill, 4 buton: ← mikrofon ✕ →. Mevcut
AdaptiveControls + SpeechControls + RecordingButton üçlüsünün yerini alır.

DOSYA: app/src/components/presentation/PresenterBottomBar.tsx (YENİ)

API:
  interface PresenterBottomBarProps {
    onPrev: () => void;          // goPrev
    onNext: () => void;          // goNext
    onExit: () => void;          // handleExit
    onToggleMic: () => void;     // startSpeech/stopSpeech wrapper
    isListening: boolean;        // mic state
    canPrev: boolean;            // disabled state
    canNext: boolean;
  }

LAYOUT:
  - Fixed bottom-6 left-1/2 -translate-x-1/2 z-50
  - max-w-[400px] bg-black/70 backdrop-blur-xl border border-white/10
    rounded-full shadow-2xl
  - Flex, gap-2, px-3 py-2
  - 4 buton:
    1. ← ChevronLeft (disabled if !canPrev)
    2. 🎤 Mic (minimal renk: kırmızı=aktif, gri=pasif — C şıkkı NFR kararı)
    3. ✕ X (exit)
    4. → ChevronRight (disabled if !canNext)

BUTON STYLING:
  - Tüm butonlar: w-10 h-10 rounded-full flex items-center justify-center
  - Hover: bg-white/10
  - Active: scale-95
  - Mic: isListening ? 'text-red-500' : 'text-white/60'
  - Disabled: opacity-40 cursor-not-allowed
  - Keyboard focus: ring-2 ring-primary focus-visible

VISIBILITY INTEGRATION:
  - Hook: const { isVisible } = usePresenterUIVisibility()
  - Container opacity: isVisible ? opacity-100 : opacity-0 pointer-events-none
  - Transition: transition-opacity duration-300
  - prefers-reduced-motion → duration-100 (CSS media query veya Framer)

KABUL KRİTERİ:
  GIVEN: Present mode render
  WHEN: İlk açılış
  THEN: Alt kenarda floating pill görünür, 4 buton
  AND: Mic icon gri (not listening) veya kırmızı (listening)
  AND: 3sn sonra opacity 0
  AND: Tab tuşu ile butonlar arasında focus
  AND: Kontrast 4.5:1+ (WCAG AA)

KISITLAR:
  - aria-label her butonda ("Önceki slayt", "Mikrofonu aç/kapa", "Çıkış", "Sonraki slayt")
  - lucide-react icon library (zaten mevcut)
  - Sıfır yeni NPM dep

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/hooks/usePresenterUIVisibility.ts (T-1.1.3.1.1 çıktısı)
  - app/src/components/presentation/AdaptiveControls.tsx — style referansı

HEDEF: Tek unified bar, dinleyiciye görünmez, konuşmacıya erişilebilir.
BAŞARI: Present page'de tek bottom bar var, event'ler çalışır, screen reader
        aria-label'ları okur.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.3.3.1 — Present Page Bar Integration + Eski Component Cleanup

- **FR:** FR-009 (I-001 bug fix) | **NFR:** NFR-MAINT-001
- **Bağımlılık:** T-1.1.3.2.1, T-1.1.1.1.1
- **Paralel?:** Hayır
- **Süre:** 4-5 saat
- **Dosyalar:**
  - `app/src/app/presentation/[id]/present/page.tsx`
  - `app/src/components/presentation/AdaptiveControls.tsx` (sil)
  - `app/src/components/speech/SpeechControls.tsx` (sil, başka yerde kullanılıyor mu kontrol)

##### AI PROMPT: T-1.1.3.3.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.3.3.1 — Present page bar integration + cleanup
FR: FR-009 (I-001 double render bug fix)

HEDEF: Mevcut dağınık kontrolleri kaldır (AdaptiveControls + SpeechControls
compact ve non-compact + RecordingButton alt bar kullanımı), tek
PresenterBottomBar yerleştir.

DOSYALAR:
  MODIFIED: app/src/app/presentation/[id]/present/page.tsx
  DELETED:  app/src/components/presentation/AdaptiveControls.tsx
  CHECK:    app/src/components/speech/SpeechControls.tsx (başka yerde import var mı?)

ADIM 1: SpeechControls kontrolü
  grep -rn "SpeechControls" app/src | grep -v node_modules
  Başka dosyada kullanım varsa SpeechControls DOSYASI silinmez, sadece
  present page'den import kaldırılır.

ADIM 2: present page.tsx değişiklikleri
  - import'ları güncelle:
    ✖ import { AdaptiveControls } from '@/components/presentation/AdaptiveControls'
    ✖ import { SpeechControls } from '@/components/speech/SpeechControls' (present içinde)
    ✓ import { PresenterBottomBar } from '@/components/presentation/PresenterBottomBar'

  - mevcut render bloklarını kaldır:
    ✖ <AdaptiveControls ... /> (L~610 civarı)
    ✖ <SpeechControls compact ... /> (L78-84 civarı, double render kaynak)

  - Yerine tek:
    ✓ <PresenterBottomBar
        onPrev={goPrev}
        onNext={goNext}
        onExit={handleExit}
        onToggleMic={isListening ? stopSpeech : () => startSpeech(...)}
        isListening={isListening}
        canPrev={currentIndex > 0}
        canNext={currentIndex < totalSlides - 1}
      />

  - RecordingButton ayrı kalır (sağ üst overlay zaten mevcut, dokunma)

ADIM 3: AdaptiveControls.tsx sil
  rm app/src/components/presentation/AdaptiveControls.tsx

KABUL KRİTERİ:
  GIVEN: Present mode render
  WHEN: Sayfa açılır
  THEN: Ekranda yalnızca 1 alt bar var (PresenterBottomBar)
  AND: SpeechControls 0 kez render edilir (double render bug fixed)
  AND: AdaptiveControls dosyası silinmiş
  AND: goPrev/goNext/handleExit hâlâ çalışır
  AND: Mic toggle çalışır
  AND: npx tsc --noEmit: 0 hata

KISITLAR:
  - Eski DoD: Tüm testler yeşil kalmalı
  - Recording state tamamen kalır (sağ üst overlay mevcut)

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/app/presentation/[id]/present/page.tsx (tam oku, bar render bölümü)
  - T-1.1.3.2.1 PresenterBottomBar API

HEDEF: Present page'de çakışan kontroller elimine, tek bar.
BAŞARI: tsc 0 hata, build success, hard refresh sonrası tek alt bar görünür.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.3.4.1 — Touch Tap Toggle + ESC Emergency (integration test)

- **FR:** FR-012, FR-013 | **NFR:** NFR-ACC-005
- **Bağımlılık:** T-1.1.3.3.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/hooks/usePresenterUIVisibility.ts` (güçlendirme)

##### AI PROMPT: T-1.1.3.4.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.3.4.1 — Touch tap toggle + ESC emergency behavior
FR: FR-012, FR-013 | NFR: NFR-ACC-005

HEDEF: T-1.1.3.1.1'de eklenen hook'u doğrula ve ESC + touch davranışlarını
gerçek browser'da test et. Eksik davranışları ekle.

DOSYA: app/src/hooks/usePresenterUIVisibility.ts (polish)

DOĞRULAMA CHECKLIST:
  ☐ ESC tuşu: isVisible false → true 100ms içinde
  ☐ ESC tuşu timer reset yapıyor (2sn sonra tekrar auto-hide)
  ☐ ESC double-press: overview'e dönüş Present page logic'iyle çakışıyor mu?
    → Eğer present page ESC handler'ı varsa (overview'e dönüş), hook
      preventDefault YAPMAMALI. Bar reveal + varsayılan behavior.
  ☐ Touch: iPad'de simülasyon — ekrana tap → bar görünür
  ☐ Touch: bar görünürken tap → bar gizlenir (toggle)
  ☐ Touch: bar üzerindeki butona tap → button onClick çalışır, toggle YAPMAZ
    → event.target === buton check gerekli

KOD İÇİN EKLENECEKLER:
  handleTouch:
    const target = e.target as HTMLElement;
    if (target.closest('button')) return; // butona tap yapıldıysa toggle yok
    setVisible((v) => !v);
    if (!visible) resetHideTimer(2000);

KABUL KRİTERİ:
  GIVEN: iPad Safari simulator, present mode aktif
  WHEN: Ekrana tap
  THEN: Bar fade-in (isVisible true)
  AND: Bar üzerindeki next butonuna tap → slayt ilerler, bar toggle yok
  AND: ESC bas → bar anında görünür, 2sn sonra tekrar idle

KISITLAR:
  - TypeScript strict
  - Touch handler'ı hook'ta zaten mevcut olmalı (T-1.1.3.1.1 çıktısı)
  - Event propagation doğru yönetilsin

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/hooks/usePresenterUIVisibility.ts
  - app/src/app/presentation/[id]/present/page.tsx Escape handler

HEDEF: Touch ve ESC edge case'leri temiz çalışsın.
BAŞARI: Manuel iPad test + Chrome DevTools ESC test — her ikisi de doğru.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.4.1.1 — Keyword.isHint Type + Backward Compat

- **FR:** FR-014 | **NFR:** NFR-COMPAT-001
- **Bağımlılık:** —
- **Paralel?:** Evet (diğer Sprint 1 ilk task'leriyle)
- **Süre:** 2-3 saat
- **Dosyalar:**
  - `app/src/types/presentation.ts`
  - `app/src/lib/ai/types.ts`

##### AI PROMPT: T-1.1.4.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.4.1.1 — Keyword.isHint alanı + backward compat
FR: FR-014 | NFR: NFR-COMPAT-001

HEDEF: Keyword interface'ine opsiyonel isHint: boolean alanı ekle.
Eski veri (undefined) false olarak davranmalı, IndexedDB migration yok.

DOSYA 1: app/src/types/presentation.ts

DEĞİŞİKLİK:
  interface Keyword {
    id: string;
    text: string;
    confidence: number;
    category?: KeywordCategory;
    isUserEdited: boolean;
    synonyms: string[];
    forms?: string[];
    confusability?: number;
    negatives?: string[];
    /**
     * Kullanıcı bu keyword'ü "ekranda ipucu olarak göster" diye
     * işaretlediyse true. Present mode'da CornerHintChip render edilir.
     * Gemini smart default: analiz sonrası top-2 confidence keyword
     * otomatik isHint=true olarak gelir (FR-016, T-1.2.2.1.1).
     * undefined → false olarak davranılır (backward compat).
     */
    isHint?: boolean;
  }

DOSYA 2: app/src/lib/ai/types.ts
  Aynı alanı AnalyzedKeyword'e ekle:
    isHint?: boolean;

KABUL KRİTERİ:
  GIVEN: Eski IndexedDB sunum (isHint alanı yok)
  WHEN: Sunum yüklenir
  THEN: Hata olmaz, tüm keyword'ler için isHint undefined
  AND: Match sırasında undefined === false gibi davranır
  AND: Yeni keyword oluşturma sırasında isHint default undefined

KISITLAR:
  - Migration dosyası yazılmaz
  - TypeScript strict: 0 hata
  - Mevcut tüm testler yeşil kalsın (useKeywordMatch.test.ts 37 test)

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/types/presentation.ts (mevcut Keyword interface)
  - app/src/lib/ai/types.ts (AnalyzedKeyword)

HEDEF: Type system genişletme, veri geriye uyumlu.
BAŞARI: Eski sunumlar hata vermeden yüklenir, tsc 0 hata.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.1.4.2.1 — KeywordBadge Click Toggle + Yellow Ring Visual

- **FR:** FR-015 | **NFR:** NFR-USE-002
- **Bağımlılık:** T-1.1.4.1.1
- **Paralel?:** Hayır
- **Süre:** 4-5 saat
- **Dosyalar:**
  - `app/src/components/keywords/KeywordBadge.tsx`
  - `app/src/components/keywords/KeywordEditor.tsx`
  - `app/src/stores/presentationStore.ts` (updateKeyword kullanımı)

##### AI PROMPT: T-1.1.4.2.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.4.2.1 — KeywordBadge tıklanır hint toggle
FR: FR-015 | NFR: NFR-USE-002

HEDEF: Editör'de her keyword badge'e tıklanınca isHint toggle olur.
İşaretli badge'ler sarı ring ile vurgulanır.

DOSYA 1: app/src/components/keywords/KeywordBadge.tsx

DEĞİŞİKLİK:
  interface KeywordBadgeProps {
    keyword: Keyword;
    isMatched?: boolean;
    onClick?: (id: string) => void;  // YENİ — toggle handler
  }

  Render:
  - Mevcut className'e ekle:
    ${keyword.isHint ? 'ring-2 ring-yellow-400' : ''}
  - onClick prop varsa tıklanabilir:
    className={...} + cursor-pointer
    onClick={() => onClick?.(keyword.id)}

DOSYA 2: app/src/components/keywords/KeywordEditor.tsx

DEĞİŞİKLİK:
  - KeywordBadge'e onClick ekle:
    const handleToggleHint = (keywordId: string) => {
      const current = keywords.find(k => k.id === keywordId);
      if (!current) return;
      onUpdate(keywordId, { isHint: !current.isHint });
    };
    ...
    <KeywordBadge
      keyword={kw}
      onClick={handleToggleHint}
    />

  - onUpdate prop'u zaten var (parent'tan gelen).

DOSYA 3: app/src/stores/presentationStore.ts (varsa updateKeyword reducer)
  Dokunma eğer zaten partial<Keyword> kabul ediyorsa. Kontrol et.

KABUL KRİTERİ:
  GIVEN: Editor'de "dağ" keyword'ü görünüyor, isHint=false
  WHEN: Kullanıcı badge'e tıklar
  THEN: isHint true olur
  AND: Badge'in etrafında 2px sarı ring görünür
  AND: Tekrar tıkla → isHint false, ring kaybolur
  AND: Değişiklik IndexedDB'ye kaydedilir (presentationStore.updateKeyword)

KISITLAR:
  - Mevcut isMatched ring'i ile çakışmasın (farklı renk)
  - Click sonrası UI re-render olsun (state update)
  - Keyboard navigation için button role + tabindex

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/components/keywords/KeywordBadge.tsx (mevcut stil)
  - app/src/components/keywords/KeywordEditor.tsx (onUpdate kullanımı)

HEDEF: Kullanıcı tek tıkla hint işaretlemesi yapsın, görsel feedback anlık.
BAŞARI: Editör'de badge'e click → sarı ring görünür, unclick → kaybolur,
       IndexedDB'ye persist.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### ⛩️ QUALITY GATE 1 — Sprint 1 Integration

**Seviye:** INTEGRATION + REGRESSION
**Test:** Sprint 1'in tüm 8 task'i birlikte çalışıyor mu

- [ ] `npx tsc --noEmit` → 0 hata
- [ ] `npx vitest run src/lib/speech/__tests__/` → 37/37 mevcut testler yeşil
- [ ] Manuel: present mode açılır, tek alt bar görünür (double render YOK)
- [ ] Manuel: slayt fullscreen + gaussian blur pillarbox (4:3 test görsel)
- [ ] Manuel: üstte 2px progress bar görünür, hover'da tooltip 6/15
- [ ] Manuel: 3sn idle → alt bar fade-out, cursor → fade-in, ESC → anında geri
- [ ] Manuel: Editör'de keyword'e tıkla → sarı ring, kaydet/yükle persist
- [ ] `npm run build` → 28 sayfa success
- [ ] `git commit` → rollback noktası

**⛔ Geçemezsen:** `/clear` yap, hatalı task'a odaklan, düzelt, re-test.

---

## SPRINT 2 — Voice Jump + Hint Sistemi

### T-1.2.1.1.1 — useVoiceJump Hook Skeleton

- **FR:** FR-003 | **NFR:** NFR-PERF-002
- **Bağımlılık:** QG1 tamamlandı
- **Paralel?:** Evet (T-1.2.2.1.1 ile)
- **Süre:** 4-5 saat
- **Dosyalar:**
  - `app/src/hooks/useVoiceJump.ts` (YENİ)

##### AI PROMPT: T-1.2.1.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.1.1.1 — useVoiceJump hook skeleton
FR: FR-003 | NFR: NFR-PERF-002 (latency ≤200ms p95)

HEDEF: Mevcut useKeywordMatch'i genişleten bir wrapper hook yaratma.
Final transcript geldiğinde keyword match yap + slayta zıpla. Interim
transcript'te zıplama YOK.

DOSYA: app/src/hooks/useVoiceJump.ts (YENİ)

API:
  export function useVoiceJump(): void  // Side-effect hook, dönen değer yok

MANTIK:
  const { transcript } = useSpeechStore();  // final only
  const { currentPresentation, setFocusedImage } = usePresentationStore();
  const matcherRef = useRef(new KeywordMatcher());

  // Index build
  useEffect(() => {
    if (!currentPresentation?.images) return;
    matcherRef.current.buildIndex(currentPresentation.images);
  }, [currentPresentation?.images]);

  // Final transcript → jump
  useEffect(() => {
    if (!transcript) return;
    const words = transcript.split(/\s+/);
    const matches = matcherRef.current.match(words, 0.7);
    if (matches.length === 0) return;
    const topImageId = matches[0].imageIds[0];
    if (topImageId) setFocusedImage(topImageId);
  }, [transcript]);

  // Interim dinlenmiyor — flicker sıfır

NOT: Mevcut useKeywordMatch zaten benzer davranışa sahip. Bu hook kopyası
DEĞİL, Voice Jump için multi-word + recency özelliklerinin eklenmesi
için ayrı bir wrapper. İkinci iterasyonda (T-1.2.1.2.1 ve T-1.2.1.3.1)
bu hook'un içi genişletilir.

KABUL KRİTERİ:
  GIVEN: Present mode açık, mic aktif
  WHEN: Final transcript "dağ manzarası" gelir, sahnede slayt 42'de bu keyword
  THEN: setFocusedImage("img-42") 200ms içinde çağrılır
  AND: Match latency <50ms (p95)
  AND: Interim transcript değişiklikleri jump tetiklemez

KISITLAR:
  - Mevcut useKeywordMatch'i SİLME — hook zaten çalışıyor
  - Bu hook useKeywordMatch'in BESİLMESİ, Voice Jump için özel davranış
    ekler (T-1.2.1.2, T-1.2.1.3'te genişletilir)
  - Alternatif: useKeywordMatch'i genişlet ve useVoiceJump'ı ondan
    türet. Karar: YENİ dosya ayrı, useKeywordMatch'i yok sayma.

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/hooks/useKeywordMatch.ts — mevcut mantık (referans)
  - app/src/lib/speech/keywordMatcher.ts — match() API

HEDEF: Voice Jump için iskeleton hook, sonraki task'lar multi-word +
       recency ekleyecek.
BAŞARI: Present page'de bu hook çağrılır + basit keyword match zıpla,
       tsc 0 hata.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.1.2.1 — Multi-Word Priority (longest wins)

- **FR:** FR-004 | **NFR:** NFR-PERF-003
- **Bağımlılık:** T-1.2.1.1.1
- **Paralel?:** Hayır (aynı dosya)
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/lib/speech/keywordMatcher.ts` (zaten longest match var)
  - `app/src/hooks/useVoiceJump.ts`

##### AI PROMPT: T-1.2.1.2.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.1.2.1 — Multi-word longest-match önceliği
FR: FR-004 | NFR: NFR-PERF-003

HEDEF: keywordMatcher.ts'de mevcut `patternLength` metadata'sı zaten var
(longest pattern wins). Bunu useVoiceJump'ta kullan ve explicit test yaz.

DOSYA 1: app/src/lib/speech/keywordMatcher.ts (gerekirse güncelle)

DOĞRULAMA:
  - match() fonksiyonu OutputMatch[] döner, her match'te patternLength var
  - match() sonucu sıralı (longest first) mi? Mevcut davranışı kontrol et.
  - Değilse sıralama eklenmeli:
    matches.sort((a, b) => b.patternLength - a.patternLength);

DOSYA 2: app/src/hooks/useVoiceJump.ts

DEĞİŞİKLİK:
  - Match sonucu: const sorted = [...matches].sort((a, b) =>
      b.patternLength - a.patternLength || b.endIndex - a.endIndex
    );
  - Top = sorted[0]
  - setFocusedImage(top.imageIds[0])

TEST:
  app/src/lib/speech/__tests__/voiceJump.test.ts (YENİ)
  - Gold case: "dağ" (slayt 5), "dağ manzarası" (slayt 42)
  - Input: "dağ manzarası çok güzel" → slayt 42 kazanır
  - Input: "dağ çok güzel" → slayt 5 kazanır (multi-word yok)

KABUL KRİTERİ:
  GIVEN: Sahnede "dağ" ve "dağ manzarası" keyword'leri
  WHEN: Final transcript "dağ manzarası çok güzel"
  THEN: Sorted matches[0] = dağ manzarası (patternLength=12)
  AND: setFocusedImage slayt 42'nin ID'si ile çağrılır
  AND: Slayt 5 (tek kelime match) tetiklenmez

KISITLAR:
  - Mevcut 37 test yeşil kalmalı
  - Match latency <50ms (mevcut performans korunmalı)

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/lib/speech/keywordMatcher.ts (match fonksiyonu)
  - app/src/lib/speech/__tests__/keywordMatch.test.ts (mevcut test yapısı)

HEDEF: Tek kelime vs multi-word çakışmasında en spesifik kazanır.
BAŞARI: Yeni test yeşil, mevcut 37 test yeşil, tsc 0 hata.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.1.3.1 — Recency Prior (60sn Tekrar Engeli)

- **FR:** FR-005 | **NFR:** NFR-PERF-003
- **Bağımlılık:** T-1.2.1.2.1
- **Paralel?:** Hayır
- **Süre:** 5-6 saat
- **Dosyalar:**
  - `app/src/hooks/useVoiceJump.ts`

##### AI PROMPT: T-1.2.1.3.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.1.3.1 — Recency prior 60sn tekrar engeli
FR: FR-005 | NFR: NFR-PERF-003

HEDEF: Son 60 saniye içinde gösterilmiş bir slayt, yeni jump
adaylarında skor açısından deprioritize edilmelidir.

DOSYA: app/src/hooks/useVoiceJump.ts

MANTIK:
  const recentShownRef = useRef<Map<string, number>>(new Map());
  // imageId → lastShownTimestamp

  // Match sonrası:
  const now = Date.now();
  const RECENCY_WINDOW_MS = 60_000;

  const deprioritized = matches.map(m => {
    const lastShown = recentShownRef.current.get(m.imageIds[0]) || 0;
    const elapsed = now - lastShown;
    const penalty = elapsed < RECENCY_WINDOW_MS
      ? -2  // patternLength'ten -2 düş
      : 0;
    return { ...m, effectivePriority: m.patternLength + penalty };
  });

  deprioritized.sort((a, b) =>
    b.effectivePriority - a.effectivePriority || b.endIndex - a.endIndex
  );

  const top = deprioritized[0];
  if (top && top.effectivePriority > 0) {
    setFocusedImage(top.imageIds[0]);
    recentShownRef.current.set(top.imageIds[0], now);
  }

  // GC: 120sn üstü entry'leri temizle
  for (const [id, ts] of recentShownRef.current) {
    if (now - ts > 120_000) recentShownRef.current.delete(id);
  }

TEST:
  voiceJump.test.ts ek senaryo:
  - Slayt 5 ve 42 ikisinde de "dağ" var
  - t=0: "dağ" der → slayt 5 gösterilir (recency clean)
  - t=30000 (30sn sonra): "dağ" tekrar der
  - Beklenti: slayt 42 gösterilir (slayt 5 penalty -2 aldı)
  - t=70000 (70sn sonra): "dağ" der
  - Beklenti: slayt 5 tekrar aday olabilir (recency window expired)

KABUL KRİTERİ:
  GIVEN: İki slayt aynı keyword'e sahip, slayt 5 30sn önce gösterildi
  WHEN: Kullanıcı aynı keyword'ü der
  THEN: Slayt 42'ye jump
  AND: 70sn sonra tekrar derse slayt 5 de tekrar aday

KISITLAR:
  - Map cleanup her match'te çalışmalı (memory leak önleme)
  - TypeScript strict

BAĞLAM İÇİN ÖNCE OKU:
  - T-1.2.1.2.1 sonrası useVoiceJump.ts
  - T-1.2.1.2.1 sonrası voiceJump.test.ts

HEDEF: Aynı slayta tekrar tekrar zıplamak yerine alternatif keşfetme.
BAŞARI: Test senaryosu yeşil, manuel test başarılı.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.1.4.1 — ARIA Live Region Announcement

- **FR:** FR-006 | **NFR:** NFR-ACC-004
- **Bağımlılık:** T-1.2.1.3.1
- **Paralel?:** Hayır
- **Süre:** 3 saat
- **Dosyalar:**
  - `app/src/hooks/useVoiceJump.ts`
  - `app/src/app/presentation/[id]/present/page.tsx` (aria-live div)

##### AI PROMPT: T-1.2.1.4.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.1.4.1 — ARIA live region voice jump announcement
FR: FR-006 | NFR: NFR-ACC-004

HEDEF: Voice Jump tetiklendiğinde yeni slayt bilgisi bir aria-live region'a
yazılır, ekran okuyucular duyurur.

DOSYA 1: app/src/app/presentation/[id]/present/page.tsx

EKLE:
  // Near the top of the rendered JSX
  <div
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
    id="voice-jump-announcer"
  />

DOSYA 2: app/src/hooks/useVoiceJump.ts

DEĞİŞİKLİK:
  // Jump sonrası:
  if (top && top.effectivePriority > 0) {
    setFocusedImage(top.imageIds[0]);
    recentShownRef.current.set(top.imageIds[0], now);

    // ARIA announce
    const announcer = document.getElementById('voice-jump-announcer');
    if (announcer) {
      const slideIndex = images.findIndex(i => i.id === top.imageIds[0]);
      const slideLabel = images[slideIndex]?.fileName || `Slayt ${slideIndex + 1}`;
      announcer.textContent = `Slayt ${slideIndex + 1}'e geçildi — ${slideLabel}`;
    }
  }

KABUL KRİTERİ:
  GIVEN: Screen reader (VoiceOver/NVDA) aktif
  WHEN: Voice Jump tetiklenir → slayt 25'e geçiş
  THEN: aria-live region textContent "Slayt 25'e geçildi — [isim]"
  AND: Screen reader 500ms içinde bu metni duyurur
  AND: sr-only class ile görsel olarak gizli

KISITLAR:
  - Tailwind'de sr-only var (globals.css'te @tailwind base zaten ekliyor)
  - document.getElementById erişimi — SSR'da undefined olabilir, guard ekle

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/app/presentation/[id]/present/page.tsx
  - T-1.2.1.3.1 sonrası useVoiceJump.ts

HEDEF: Erişilebilirlik NFR-ACC-004 karşılanır.
BAŞARI: VoiceOver testi ile duyuru alınır.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.2.1.1 — Gemini Prompt Top-2 Smart Default

- **FR:** FR-016 | **NFR:** NFR-COMPAT-001
- **Bağımlılık:** T-1.1.4.1.1 (isHint alanı)
- **Paralel?:** Evet (T-1.2.1.x ile)
- **Süre:** 2-3 saat
- **Dosyalar:**
  - `app/src/lib/ai/prompts.ts`

##### AI PROMPT: T-1.2.2.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.2.1.1 — Gemini prompt isHint smart default
FR: FR-016

HEDEF: Gemini'nin döndürdüğü keyword listesinde her slayt için en yüksek
confidence'lı 2 keyword'ün isHint=true olarak işaretlendiğinden emin ol.
Ya prompt direktifi ya da response'u post-process et.

DOSYA: app/src/lib/ai/prompts.ts

SEÇENEK A — Prompt direktifi:
  Mevcut prompt'a ekle:
  "Return keywords sorted by confidence desc. Mark isHint: true for
   top 2 keywords, rest isHint: false. Example:
   [{text:'dağ', confidence:0.9, isHint:true},
    {text:'yol', confidence:0.85, isHint:true},
    {text:'ağaç', confidence:0.7, isHint:false}]"

SEÇENEK B — Post-process (prompt değiştirmeden):
  DOSYA: app/src/lib/ai/analyzeBatch.ts veya parser.ts
  Keyword parse sonrası:
    const sorted = [...keywords].sort((a, b) => b.confidence - a.confidence);
    sorted.slice(0, 2).forEach(k => k.isHint = true);
    // Rest undefined (false)

  KARAR: Seçenek B daha güvenilir (Gemini bazen isHint field'ı atlar).
  Seçenek A'yı ek olarak prompt'a koy, parser'da Seçenek B fallback olarak uygula.

DOSYA 1: app/src/lib/ai/prompts.ts
  Prompt'a Seçenek A eklemesi yap.

DOSYA 2: app/src/lib/ai/parser.ts (veya analyzeBatch.ts)
  Keyword array'i parse sonrası Seçenek B fallback uygula.

KABUL KRİTERİ:
  GIVEN: Yeni sunum yüklendi, Gemini 5 keyword döndürdü
  WHEN: Parse tamamlandı
  THEN: İlk 2 keyword (confidence desc sıralı) isHint=true
  AND: Kalan 3 keyword isHint undefined
  AND: Eğer Gemini zaten isHint döndürmüşse, override edilmez (Gemini guvenilirse)

KISITLAR:
  - Backward compat: eski sunumlar parse edildiğinde hata yok
  - Gemini response format değişikliği varsa testleri kır

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/lib/ai/prompts.ts (mevcut prompt)
  - app/src/lib/ai/parser.ts (response parse)
  - app/src/lib/ai/analyzeBatch.ts (batch processing)

HEDEF: Kullanıcı hiç ⭐ işaretlemese bile hint sistemi default ile çalışsın.
BAŞARI: Yeni sunum yükle → 2 keyword sarı ring'li görünür, görüntü testi.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.2.2.1 — analyzeBatch.ts + parser.ts isHint Propagation

- **FR:** FR-016 | **NFR:** NFR-COMPAT-001
- **Bağımlılık:** T-1.2.2.1.1
- **Paralel?:** Hayır (aynı feature)
- **Süre:** 3 saat
- **Dosyalar:**
  - `app/src/lib/ai/parser.ts`
  - `app/src/lib/ai/analyzeBatch.ts`

##### AI PROMPT: T-1.2.2.2.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.2.2.1 — isHint propagation parser → store
FR: FR-016

HEDEF: AI response'tan gelen isHint alanının keyword nesnesine kadar
doğru propagate olduğundan emin ol. Eksik noktaları tamamla.

DOSYALAR:
  - app/src/lib/ai/parser.ts (AnalyzedKeyword çıkışı)
  - app/src/lib/ai/analyzeBatch.ts (Keyword'e dönüştürme)

DOĞRULAMA:
  1. parser.ts: JSON parse sonucu isHint okuyup AnalyzedKeyword'a yaz
  2. analyzeBatch.ts: analysisResultToKeywords fonksiyonunda
     isHint: kw.isHint şeklinde propagate et

GEREKLİ DEĞİŞİKLİKLER:
  parser.ts parseAnalysisResponse içinde:
    const isHint = typeof kw.isHint === 'boolean' ? kw.isHint : undefined;
    return { ...existing, isHint } satisfies AnalyzedKeyword;

  analyzeBatch.ts analysisResultToKeywords içinde:
    return result.keywords.map((kw) => ({
      id: crypto.randomUUID(),
      text: kw.text,
      confidence: kw.confidence,
      category: kw.category,
      isUserEdited: false,
      synonyms: kw.synonyms ?? [],
      forms: kw.forms,
      confusability: kw.confusability,
      negatives: kw.negatives,
      isHint: kw.isHint,  // YENİ
    }));

  Eğer T-1.2.2.1.1'deki post-process henüz burada yapılmıyorsa burada yap:
    // Fallback smart default
    const sortedByConf = [...keywords].sort((a, b) => b.confidence - a.confidence);
    sortedByConf.slice(0, 2).forEach((k) => {
      if (k.isHint === undefined) k.isHint = true;
    });

KABUL KRİTERİ:
  GIVEN: Gemini response içeriyor {text, confidence, isHint: true}
  WHEN: parseAnalysisResponse çağrılır
  THEN: Dönen keyword'de isHint=true
  AND: analysisResultToKeywords → Keyword.isHint=true
  AND: presentationStore.updatePresentation → IndexedDB'ye yazılır
  AND: Yeniden yükle → isHint persist

KISITLAR:
  - Backward compat (eski response'ta isHint yok → undefined)
  - Mevcut 37 test yeşil

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/lib/ai/parser.ts
  - app/src/lib/ai/analyzeBatch.ts
  - app/src/lib/ai/types.ts AnalyzedKeyword interface

HEDEF: AI → Storage propagation tam.
BAŞARI: Yeni sunum yükle → IndexedDB'de keyword[].isHint true/false, persist.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.3.1.1 — CornerHintChip Component

- **FR:** FR-018, FR-019, FR-020 | **NFR:** NFR-ACC-001, NFR-ACC-002
- **Bağımlılık:** T-1.1.4.1.1 (isHint)
- **Paralel?:** Evet (T-1.2.1.x, T-1.2.2.x ile)
- **Süre:** 4-5 saat
- **Dosyalar:**
  - `app/src/components/presentation/CornerHintChip.tsx` (YENİ)

##### AI PROMPT: T-1.2.3.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.3.1.1 — CornerHintChip component
FR: FR-018, FR-019, FR-020 | NFR: NFR-ACC-001 (4.5:1), NFR-ACC-002 (16px)

HEDEF: Önceki veya sonraki slaytın isHint=true keyword'lerini gösteren
floating pill. Keyword yoksa component null döner.

DOSYA: app/src/components/presentation/CornerHintChip.tsx (YENİ)

API:
  interface CornerHintChipProps {
    direction: 'prev' | 'next';
    keywords: string[];  // Sadece isHint=true olanlar, max 3 render edilir
  }
  export function CornerHintChip({ direction, keywords }: CornerHintChipProps)

LOGIC:
  if (keywords.length === 0) return null;  // FR-020 null render
  const displayed = keywords.slice(0, 3);
  const overflow = keywords.length - 3;

RENDER:
  - Position: direction === 'prev' ? 'left-4 top-4' : 'right-4 top-4'
  - fixed position, z-40
  - Container: bg-black/70 backdrop-blur-md border border-white/10
    rounded-full px-4 py-2 shadow-lg
  - Layout: flex items-center gap-2
  - Prefix: direction === 'prev' ? '←' : ''
  - Keywords: displayed.join(', ')
  - Overflow chip: overflow > 0 && <span className="opacity-70">+{overflow} daha</span>
  - Suffix: direction === 'next' ? '→' : ''
  - Font: text-base (16px min per NFR-ACC-002)
  - Color: text-white (contrast 4.5:1+ on bg-black/70)

REDUCED MOTION:
  Fade-in animation duration prefers-reduced-motion'a göre 100ms/300ms.

KABUL KRİTERİ:
  GIVEN: direction="prev", keywords=["saman", "balya"]
  WHEN: Component render
  THEN: Sol-üst köşede "← saman, balya" pill görünür
  AND: Font 16px, contrast 4.5:1+
  AND: keywords boşsa null (render edilmez)
  AND: 4 keyword'de "saman, balya, dağ, +1 daha" görünür

KISITLAR:
  - Pure function component, prop drilling
  - Framer Motion kullanma (CSS transition yeterli)
  - Component sabit pozisyon, kontrolü parent'a bırakma

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/types/presentation.ts (Keyword)

HEDEF: Minimal peripheral vision hint, dinleyici görmez.
BAŞARI: Standalone render test, 16px font, contrast test.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.3.2.1 — "+N Daha" Overflow Chip + Popover

- **FR:** FR-017 | **NFR:** NFR-USE-002
- **Bağımlılık:** T-1.2.3.1.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/components/presentation/CornerHintChip.tsx`

##### AI PROMPT: T-1.2.3.2.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.3.2.1 — Overflow chip + popover
FR: FR-017 | NFR: NFR-USE-002

HEDEF: "+N daha" chip tıklanınca popover aç, gizli kalan keyword'leri
listele. Popover 3sn sonra otomatik kapanır.

DOSYA: app/src/components/presentation/CornerHintChip.tsx

DEĞİŞİKLİK:
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const overflow = keywords.slice(3);

  // "+N daha" tıklanabilir button
  <button
    onClick={() => setIsPopoverOpen(true)}
    className="opacity-70 hover:opacity-100 cursor-pointer"
  >
    +{overflow.length} daha
  </button>

  // Popover (AnimatePresence ile)
  {isPopoverOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute top-full mt-2 bg-black/85 border rounded-xl p-3"
    >
      <div className="text-xs text-white/70 mb-1">Diğer hint'ler:</div>
      {overflow.map(k => <div key={k}>{k}</div>)}
    </motion.div>
  )}

  // Auto-close 3sn
  useEffect(() => {
    if (!isPopoverOpen) return;
    const t = setTimeout(() => setIsPopoverOpen(false), 3000);
    return () => clearTimeout(t);
  }, [isPopoverOpen]);

KABUL KRİTERİ:
  GIVEN: 5 hint keyword var, chip "saman, balya, dağ, +2 daha"
  WHEN: "+2 daha" tıklanır
  THEN: Popover açılır, "bulut, sis" listesi görünür
  AND: 3sn sonra popover kapanır
  AND: Tekrar tıklanırsa tekrar açılır

KISITLAR:
  - Framer Motion import'u mevcut mu kontrol et
  - Cleanup timeout unmount'ta

BAĞLAM İÇİN ÖNCE OKU:
  - T-1.2.3.1.1 sonrası CornerHintChip.tsx

HEDEF: Fazla hint'leri de erişilebilir yap ama çoğu zaman gizle.
BAŞARI: Popover aç/kapa, otomatik kapanma çalışır.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.3.3.1 — Corner Chips Present Page Integration

- **FR:** FR-018, FR-019 | **NFR:** —
- **Bağımlılık:** T-1.2.3.2.1, QG1
- **Paralel?:** Hayır
- **Süre:** 3 saat
- **Dosyalar:**
  - `app/src/app/presentation/[id]/present/page.tsx`

##### AI PROMPT: T-1.2.3.3.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.3.3.1 — CornerHintChip present page integration
FR: FR-018, FR-019

HEDEF: Present page'de önceki ve sonraki slaytın hint keyword'lerini
hesapla, CornerHintChip'leri sol-üst ve sağ-üst köşelere yerleştir.

DOSYA: app/src/app/presentation/[id]/present/page.tsx

HESAPLAMA:
  const currentIdx = images.findIndex(i => i.id === focusedImageId);
  const prevImage = currentIdx > 0 ? images[currentIdx - 1] : null;
  const nextImage = currentIdx < images.length - 1 ? images[currentIdx + 1] : null;

  const prevHints = prevImage?.keywords
    .filter(k => k.isHint)
    .map(k => k.text) ?? [];
  const nextHints = nextImage?.keywords
    .filter(k => k.isHint)
    .map(k => k.text) ?? [];

RENDER (focused mode içinde):
  {mode === 'focused' && (
    <>
      <CornerHintChip direction="prev" keywords={prevHints} />
      <CornerHintChip direction="next" keywords={nextHints} />
    </>
  )}

KABUL KRİTERİ:
  GIVEN: Kullanıcı slayt 5'te, slayt 4 ve 6'da hint keyword'ler var
  WHEN: Focused mode render
  THEN: Sol-üst "← saman, balya" chip
  AND: Sağ-üst "dağ →" chip
  AND: Slayt 1'de (önceki yok) sol-üst chip render edilmez
  AND: Son slaytta (sonraki yok) sağ-üst chip render edilmez

KISITLAR:
  - Overview mode'da chip'ler render edilmez (mode check)
  - Performance: useMemo ile prevHints/nextHints hesapla (images dependency)

BAĞLAM İÇİN ÖNCE OKU:
  - app/src/app/presentation/[id]/present/page.tsx
  - T-1.2.3.1.1 CornerHintChip API

HEDEF: Sol-üst ve sağ-üst hint'leri focused mode'da göster.
BAŞARI: Present mode manuel test — slayt arası geçişlerde hint'ler güncellenir.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.4.1.1 — prefers-reduced-motion Global Handling

- **FR:** FR-010, FR-011 | **NFR:** NFR-ACC-003
- **Bağımlılık:** T-1.1.3.1.1
- **Paralel?:** Hayır (polish)
- **Süre:** 2-3 saat
- **Dosyalar:**
  - `app/src/hooks/usePresenterUIVisibility.ts`
  - `app/src/components/presentation/CornerHintChip.tsx`
  - `app/src/components/presentation/PresenterBottomBar.tsx`

##### AI PROMPT: T-1.2.4.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.4.1.1 — prefers-reduced-motion global handling
FR: FR-010, FR-011 | NFR: NFR-ACC-003

HEDEF: Tüm UI bileşenlerinin animation süreleri OS-level "Reduce Motion"
tercihine uygun şekilde 100ms'e düşsün, scale/translate animasyonları
tamamen kapansın.

YAKLAŞIM: CSS media query (Tailwind motion-reduce: variant)

DOSYA 1: app/src/components/presentation/PresenterBottomBar.tsx
  Fade animation için:
    className="transition-opacity duration-300 motion-reduce:duration-100"

DOSYA 2: app/src/components/presentation/CornerHintChip.tsx
  Popover için:
    className="transition-all duration-200 motion-reduce:duration-100
               motion-reduce:transform-none"

DOSYA 3: app/src/components/presentation/FocusedSlide.tsx
  (T-1.1.1.1.1 + T-1.1.1.2.1 çıktısı)
  Framer Motion animasyonu:
    transition={{
      duration: prefersReducedMotion ? 0.1 : 0.3,
      ease: 'easeOut',
    }}

  (prefersReducedMotion = useReducedMotion() hook from framer-motion)

DOSYA 4: app/src/hooks/usePresenterUIVisibility.ts
  (T-1.1.3.1.1 çıktısı)
  Zaten hook'ta matchMedia('(prefers-reduced-motion)') logic'i vardı,
  doğrula ve kullanıldığını kontrol et.

TEST:
  macOS Settings → Accessibility → Display → Reduce Motion ON
  Chrome → present mode → animasyonlar 100ms, scale yok
  OFF → normal 300ms

KABUL KRİTERİ:
  GIVEN: OS Reduce Motion ON
  WHEN: Present mode açık, alt bar fade-out
  THEN: Duration 100ms (normal 300ms yerine)
  AND: CornerHintChip popover scale animasyonu kapalı
  AND: Slayt geçiş fade'i hızlı

KISITLAR:
  - Tailwind motion-reduce: variant zaten built-in
  - Framer Motion useReducedMotion hook kullanılabilir

BAĞLAM İÇİN ÖNCE OKU:
  - Tailwind config — motion-reduce variant default mi?
  - Framer Motion dokümantasyonu (useReducedMotion)

HEDEF: Erişilebilirlik NFR-ACC-003 karşılanır.
BAŞARI: macOS Reduce Motion test ile doğrulanır.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.2.4.2.1 — WCAG Kontrast Doğrulama

- **FR:** — | **NFR:** NFR-ACC-001
- **Bağımlılık:** Sprint 2'nin tüm UI task'leri
- **Paralel?:** Hayır (polish)
- **Süre:** 2 saat
- **Dosyalar:**
  - Tüm UI component'leri (doğrulama, gerekirse stil update)

##### AI PROMPT: T-1.2.4.2.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.4.2.1 — WCAG AA kontrast doğrulama
NFR: NFR-ACC-001 (min 4.5:1 contrast)

HEDEF: Sprint 2'de eklenen tüm UI öğelerinin WCAG AA kontrast oranını
karşıladığını doğrula ve gerekirse stil güncelle.

KONTROL EDİLECEK ÖĞELER:
  ☐ PresenterBottomBar butonları (text white on black/70)
  ☐ CornerHintChip (text white on black/70)
  ☐ SlidePositionBar tooltip (text white on black/80)
  ☐ KeywordBadge yellow ring (isHint state)
  ☐ Voice jump ARIA announcer (sr-only, kontrast önemsiz)

ARAÇ:
  - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
  - Chrome DevTools → Inspect → Accessibility → Contrast
  - Stark Chrome extension (otomatik scan)

HEDEF ORANLAR:
  - Normal text (16px): ≥ 4.5:1 (AA)
  - Large text (18.66px+ bold, 24px+): ≥ 3:1
  - UI components (border, focus): ≥ 3:1

DÜZELTME ÖRNEKLERİ:
  - text-white/70 (opacity 0.7) → 4.5:1 karşılamayabilir
    → text-white/90 veya bg daha koyu
  - bg-black/70 → underlying white text ile 4.5:1 ise tamam

KABUL KRİTERİ:
  GIVEN: Present mode açık, tüm yeni UI render edildi
  WHEN: Chrome DevTools Accessibility Contrast scan
  THEN: Tüm text öğeleri 4.5:1+ raporlanır
  AND: WebAIM Contrast Checker manuel test başarılı
  AND: Hata olan yerler düzeltilir

KISITLAR:
  - Tasarım dili korunsun (çok fazla opacity değişikliği yapma)
  - Gerekirse shadow ekle (glow effect) kontrast yerine

BAĞLAM İÇİN ÖNCE OKU:
  - Sprint 2 sonrası tüm bileşen dosyaları

HEDEF: NFR-ACC-001 karşılanır, erişilebilirlik kayıt altında.
BAŞARI: Stark/WebAIM scan sonucu tüm öğeler pass.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### ⛩️ QUALITY GATE 2 — Sprint 2 Integration + E2E

**Seviye:** INTEGRATION + E2E + REGRESSION

- [ ] `npx tsc --noEmit` → 0 hata
- [ ] `npx vitest run` → Sprint 2 yeni testleri yeşil (voiceJump.test.ts)
- [ ] `npx vitest run` → Mevcut 37 test + yeni testler, toplam 40+ yeşil
- [ ] Manuel: "dağ" de → slayt açılır (voice jump basic)
- [ ] Manuel: Aynı slayta tekrar "dağ" → 60sn içinde alternatif gelir (recency)
- [ ] Manuel: "dağ manzarası" → uzun keyword match (multi-word priority)
- [ ] Manuel: VoiceOver/NVDA ile slayt geçiş duyurulur
- [ ] Manuel: Editör'de keyword'e tıkla → hint işaretle → Present'ta sol-üst/sağ-üst chip görünür
- [ ] Manuel: 5 hint olan slaytta "+2 daha" popover çalışır
- [ ] Manuel: macOS Reduce Motion → animasyonlar 100ms
- [ ] WebAIM kontrast scan → tüm öğeler 4.5:1+
- [ ] `npm run build` → success
- [ ] `git commit` → rollback noktası

---

## FAZ SONU — QA + Deploy

### T-1.3.1.1.1 — Regression Test Run

- **FR:** — | **NFR:** NFR-MAINT-001
- **Bağımlılık:** QG2
- **Paralel?:** Hayır
- **Süre:** 2 saat

##### AI PROMPT: T-1.3.1.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.1.1.1 — Regression test run
NFR: NFR-MAINT-001 (test coverage ≥80%)

HEDEF: Tüm test suite'leri çalıştır, kapsama raporunu kontrol et,
eksik yerleri tamamla.

KOMUTLAR:
  cd /Users/emrepirinc/Documents/DeepSlide/app
  npx tsc --noEmit          # Tip check 0 hata
  npx vitest run            # Tüm testler yeşil
  npx vitest run --coverage # Coverage raporu

HEDEF:
  - useKeywordMatch.test.ts: 37/37 yeşil (regression)
  - voiceJump.test.ts: Sprint 2 yeni testleri yeşil (5-10 case)
  - Yeni bileşenler için test: CornerHintChip, SlidePositionBar snap
    (varsa)
  - Overall coverage ≥80% (hedef yeni kod için)

EKSİK TESTLER VARSA:
  - CornerHintChip: null render, 3 keyword, overflow case
  - SlidePositionBar: progress %0, %50, %100
  - usePresenterUIVisibility: 3sn idle, ESC reveal, touch toggle

KABUL KRİTERİ:
  GIVEN: Sprint 2 tüm task'ler tamam
  WHEN: vitest run
  THEN: 0 test fail, mevcut 37 + yeni testler = 40+ toplam
  AND: Coverage %80+ yeni kod için
  AND: tsc 0 hata
  AND: npm run build başarılı

BAĞLAM İÇİN ÖNCE OKU:
  - package.json test script'leri
  - vitest.config.ts (varsa)

HEDEF: Production-ready quality bar.
BAŞARI: Tüm testler yeşil, coverage hedef.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.3.2.1.1 — Cross-Browser Manuel Smoke Test

- **FR:** — | **NFR:** NFR-COMPAT-002
- **Bağımlılık:** T-1.3.1.1.1
- **Paralel?:** Hayır
- **Süre:** 3 saat

##### AI PROMPT: T-1.3.2.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.2.1.1 — Cross-browser manuel smoke test
NFR: NFR-COMPAT-002 (Chrome 120+, Safari 17+, Edge 120+)

HEDEF: 3 tarayıcıda present mode + voice jump + UI davranışlarını manuel
olarak doğrula.

TEST MATRİSİ:
  Chrome 120+ (macOS):
    ☐ Fullscreen render + gaussian blur
    ☐ Alt bar auto-hide 3sn
    ☐ Voice jump "dağ manzarası" → slayt geçiş
    ☐ Corner hint chip sol-üst + sağ-üst
    ☐ ESC emergency reveal
    ☐ Progress bar hover tooltip

  Safari 17+ (macOS):
    ☐ Aynı kontrol listesi
    ☐ WebSpeech API farklılık kontrol (Webkit)
    ☐ prefers-reduced-motion doğru uygulama

  Firefox (Degraded mode):
    ☐ Fullscreen render çalışıyor mu
    ☐ WebSpeech YOK → klavye-only navigation
    ☐ Alt bar + ok tuşları çalışıyor
    ☐ "mic not supported" uyarı görünür mü

BİLİNEN SORUNLAR:
  - Firefox WebSpeech desteği yok — graceful degradation şart
  - Safari Reduced Motion matchMedia bazen güncel değil
  - iOS Safari touch tap toggle farklı davranabilir

KABUL KRİTERİ:
  GIVEN: 3 tarayıcı × 7 test adımı = 21 test
  WHEN: Her biri manuel çalıştırılır
  THEN: Chrome %100 pass, Safari %100 pass, Firefox degraded mode pass
  AND: Herhangi bir visual glitch yok
  AND: Console hata yok

HEDEF: Production'a çıkmadan önce son sanity check.
BAŞARI: 21/21 test manual pass.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### T-1.3.3.1.1 — Production Deploy + Post-Deploy Smoke

- **FR:** — | **NFR:** Tümü
- **Bağımlılık:** T-1.3.2.1.1
- **Paralel?:** Hayır (final step)
- **Süre:** 1-2 saat

##### AI PROMPT: T-1.3.3.1.1

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.3.1.1 — Production deploy + smoke test
FR: — | Tüm NFR'ler doğrulanmalı

HEDEF: Final commit, git push, Vercel auto-deploy, production smoke test.

ADIM:
  1. git status — stage edilmemiş dosya kaldı mı kontrol
  2. git add -A
  3. git commit -m "feat(present): UX redesign + keyword hint system

     WBS Sprint 1+2 tamamlandı. 22 atomic task → production-ready.

     ## Ana değişiklikler

     - Fullscreen slide (100vh + gaussian blur pillarbox)
     - Voice Semantic Jump (multi-word priority + recency prior + ARIA)
     - Unified PresenterBottomBar (auto-hide + ESC + touch)
     - Slide Position Indicator (2px bar + hover reveal)
     - Keyword isHint toggle (editor ⭐ + visual ring)
     - Gemini Smart Default (top-2 confidence auto-select)
     - Corner Hint Chips (sol-üst prev + sağ-üst next + null render)
     - prefers-reduced-motion + WCAG AA kontrast

     ## Silinen

     - AdaptiveControls.tsx
     - (varsa) SpeechControls double render

     ## Test

     - 40+ test yeşil
     - Chrome/Safari/Firefox cross-browser pass
     - Coverage %80+ yeni kod
     - Type check 0 hata
     - Build 28 sayfa success"
  4. git push origin main
  5. Vercel auto-deploy (1-2 dk)
  6. https://deepslide.1takimstartuplar.com hard refresh
  7. Manuel smoke (T-1.3.2.1.1 test listesinin kritik kısmı)
  8. Production'da 1-2 sunum aç, voice jump dene

KABUL KRİTERİ:
  GIVEN: Deploy tamamlandı
  WHEN: Production URL açılır
  THEN: Present mode çalışır
  AND: Voice jump basic test başarılı
  AND: Console 0 hata
  AND: Hiçbir özellik eski moda dönmemiş

KISITLAR:
  - Push öncesi son check: tsc, vitest, build
  - Commit mesajı açıklayıcı (yukarıdaki örnek kullan)
  - Vercel deploy süresi ~2dk bekle

HEDEF: Faz 1 MVP canlıda.
BAŞARI: deepslide.1takimstartuplar.com'da yeni UX çalışıyor.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### ⛩️ QUALITY GATE 3 — Production Smoke (Faz Sonu)

**Seviye:** E2E + PRODUCTION REGRESSION

- [ ] Vercel deploy başarılı (zaman: <3dk)
- [ ] Production URL açılıyor, 0 console hata
- [ ] Present mode açılıyor, alt bar tek, fullscreen çalışır
- [ ] Voice jump manuel test: "dağ" → slayt geçiş
- [ ] Hint chip'leri sol-üst + sağ-üst görünür
- [ ] Keyword editöründe toggle persistent
- [ ] Chrome + Safari kritik path geçer
- [ ] Mevcut 37 test hâlâ yeşil (regression)
- [ ] Bundle size artışı <20 KB gzipped

---

# 🗺️ Bağımsızlık Haritası + Paralel Gruplar

```
SPRINT 1 PARALLEL START (Grup A):
  T-1.1.1.1.1 (FocusedSlide)         ┐
  T-1.1.2.1.1 (SlidePositionBar)     ┼── Paralel çalışabilir
  T-1.1.3.1.1 (usePresenterUIVisibility) ┤
  T-1.1.4.1.1 (Keyword.isHint type)  ┘

SPRINT 1 ZINCIRI 1 (Fullscreen):
  T-1.1.1.1.1 → T-1.1.1.2.1

SPRINT 1 ZINCIRI 2 (PresenterBottomBar):
  T-1.1.3.1.1 → T-1.1.3.2.1 → T-1.1.3.3.1 → T-1.1.3.4.1

SPRINT 1 ZINCIRI 3 (Position Bar):
  T-1.1.2.1.1 → T-1.1.2.1.2

SPRINT 1 ZINCIRI 4 (Keyword hint UI):
  T-1.1.4.1.1 → T-1.1.4.2.1

⛩️ QG1

SPRINT 2 PARALLEL START (Grup B):
  T-1.2.1.1.1 (useVoiceJump skeleton)  ┐
  T-1.2.2.1.1 (Gemini smart default)   ┼── Paralel çalışabilir
  T-1.2.3.1.1 (CornerHintChip)         ┘

SPRINT 2 ZINCIRI 1 (Voice Jump):
  T-1.2.1.1.1 → T-1.2.1.2.1 → T-1.2.1.3.1 → T-1.2.1.4.1

SPRINT 2 ZINCIRI 2 (Smart Default):
  T-1.2.2.1.1 → T-1.2.2.2.1

SPRINT 2 ZINCIRI 3 (Corner Chips):
  T-1.2.3.1.1 → T-1.2.3.2.1 → T-1.2.3.3.1

SPRINT 2 POLISH (sequential, QG2 öncesi):
  T-1.2.4.1.1 (reduced motion) → T-1.2.4.2.1 (contrast)

⛩️ QG2

FAZ SONU (tek zincir):
  T-1.3.1.1.1 → T-1.3.2.1.1 → T-1.3.3.1.1

⛩️ QG3 (production)
```

---

# 🧠 Context Yönetimi

```
CONTEXT KURALLARI:

/clear NE ZAMAN:
  ✅ Her Quality Gate sonrası (QG1, QG2, QG3)
  ✅ Sprint 1 → Sprint 2 geçişinde
  ✅ Aynı hata 2 denemede çözülemezse
  ✅ Konu değişince (frontend → ai/prompts.ts geçişinde)

SUBAGENT NE ZAMAN:
  ✅ Sprint 1 paralel grubu (4 task aynı anda)
  ✅ Sprint 2 paralel grubu (3 task aynı anda)
  ✅ Büyük dosya taraması (örn. present/page.tsx 700 satır)
  ✅ Cross-browser test koordinasyonu

AYNI OTURUMDA KALI:
  ✅ T-1.1.3.1.1 → T-1.1.3.2.1 → T-1.1.3.3.1 (BottomBar zinciri)
  ✅ T-1.2.1.1.1 → T-1.2.1.2.1 → T-1.2.1.3.1 (Voice Jump zinciri)
  ✅ T-1.2.3.1.1 → T-1.2.3.2.1 → T-1.2.3.3.1 (Corner Chips zinciri)
```

---

# 📦 WBS Özet

```
TOPLAM ATOMIK GÖREV: 22
  Sprint 1: 9 task
  Sprint 2: 10 task
  Faz Sonu: 3 task

PARALEL ÇALIŞABİLİR: 7 (4 Sprint 1 start + 3 Sprint 2 start)
SIRALI ZİNCİR: 15

QUALITY GATE: 3 adet (QG1, QG2, QG3)
CONTEXT TEMİZLEME NOKTASI: 3 (her QG sonrası)
AI PROMPT TEMPLATE: 22

TAHMİNİ SÜRE:
  Sprint 1: 9 task × 4 saat = ~36 saat = ~5 gün
  Sprint 2: 10 task × 4 saat = ~40 saat = ~5 gün
  Faz Sonu: 3 task × 2 saat = ~6 saat = ~1 gün
  TOPLAM: ~82 saat = ~11-14 gün (buffer dahil)

FAZ 1 MVP BAŞLANGIC:
  İlk paralel grup: [T-1.1.1.1.1, T-1.1.2.1.1, T-1.1.3.1.1, T-1.1.4.1.1]
  İlk sıralı zincir: T-1.1.3.1.1 → T-1.1.3.2.1 → T-1.1.3.3.1
```

---

# 🔥 Faz 2 (MVP Sonrası — Parking Lot)

Bu task'lar MVP'ye girmiyor, Faz 2 iterasyonuna erteleniyor:

| # | Öneri | Kontrol Tarihi |
|---|---|---|
| #9 | Keyboard Shortcut Overlay | 2026-05-15 |
| #10 | Accessibility Extreme Mode | 2026-06-01 |
| #16 | Kayıt Butonu Pro Ayar | 2026-05-15 |
| #12 | Long-press Kayıt Menüsü | 2026-06-01 |
| #11 | Mic Noise Gate | 2026-07-01 |

---

# ℹ️ Kritik Notlar

1. **useKeywordMatch korunuyor** — mevcut Aho-Corasick + Turkish NLP (37/37 test yeşil) bozulmayacak. useVoiceJump onun bir wrapper'ı.

2. **SpeechControls silinmiyor** (belki) — T-1.1.3.3.1'de başka yerde kullanılıp kullanılmadığı grep ile kontrol edilecek.

3. **Framer Motion layoutId** — FR-001 fullscreen refactoring sırasında bu animasyonun bozulmadığı manuel test edilmelidir.

4. **IndexedDB migration yok** — Keyword.isHint opsiyonel alan, eski sunumlar undefined ile yüklenir.

5. **Commit noktaları** — Her QG sonrası commit. Toplam 3+ commit bekleniyor (+ opsiyonel ara commit'ler).

---

**Hazır. CLAUDE.md güncellemesi için ayrı görev (opsiyonel).**
