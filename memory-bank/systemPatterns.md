# System Patterns

## Architecture Overview

```
Browser
├── Next.js App Router (src/app/)
│   ├── Pages: presentation/, profile/, auth/, billing/
│   └── API Routes: /api/analyze, /api/analyze-qwen, /api/analyze-gemma, /api/billing/
├── State Layer
│   ├── Zustand: presentationStore, uiStore, speechStore
│   └── IndexedDB (idb): presentations, imageBlobs
├── Services
│   ├── Firebase Auth (client-side)
│   ├── Firestore (user profiles, plan data)
│   └── AI Providers (Gemini API / Ollama)
└── Components (src/components/)

Server (Next.js API Routes only)
├── AI proxies (prevent API key exposure in browser)
├── iyzico billing (webhook, checkout, portal)
└── Firebase Admin SDK (plan updates)
```

## Key Design Patterns

### 1. Adapter Pattern — AI Providers
All AI providers implement the same interface. Client code calls `createAnalysisProvider(type)` and gets a uniform `analyzeImage()` method.

```ts
// src/lib/ai/providerFactory.ts
export function createAnalysisProvider(provider: AIProviderType, language, keywordCount)
  → ClientAnalysisProvider (hits different /api/analyze-* endpoints)

// Endpoints:
// gemini → /api/analyze       → Google Gemini API
// qwen   → /api/analyze-qwen  → Ollama Qwen 3.5 9B
// gemma  → /api/analyze-gemma → Ollama Gemma4 E2B
```

### 2. Adapter Pattern — Speech Providers
Same pattern for voice recognition. Fallback chain: preferred → webSpeech → whisper.

```ts
// src/lib/speech/providerFactory.ts
createSpeechProvider(type: SpeechProviderType)
getSpeechProviderWithFallback(preferred)  // auto-fallback
```

### 3. Presentation Mode State Machine
Store (`presentationStore`) manages two orthogonal states:
- `viewMode: 'overview' | 'focused'`
- `focusedImageId: string | null`

Rules:
- `setFocusedImage(id)` → automatically sets `viewMode = 'focused'`
- `setFocusedImage(null)` → automatically sets `viewMode = 'overview'`
- `setViewMode('overview')` → clears `focusedImageId`

### 4. Temporal Decay Orchestrator
`AnimationOrchestrator` class (`src/lib/animation/orchestrator.ts`) manages relevance scores:
- Keyword match → `relevanceScores.set(id, 1.0)`
- Every 2s: scores decay by -0.1
- Score < 0.3 → image removed from active set
- No active images → decay timer stops (CPU efficient)
- `onChange` callback notifies store

### 5. Prezi Zoom — Framer Motion layoutId
Smooth grid→fullscreen transition uses matching `layoutId` props:
```tsx
// Grid card: <motion.div layoutId={image.id}>
// Fullscreen: <motion.div layoutId={image.id}>
// AnimatePresence wraps both mount/unmount
```
Framer Motion automatically interpolates position/size between the two elements.

### 6. Functional Zustand Updates (Race Condition Prevention)
All keyword/image mutations use functional `set()` (not value-based):
```ts
// CORRECT: functional update
set((state) => ({ currentPresentation: { ...state.currentPresentation, images: [...] }}))

// WRONG: snapshot + set (stale state in concurrent updates)
const current = get().currentPresentation;
set({ currentPresentation: { ...current, images: [...] } });
```

### 7. Firebase Lazy Init
Firebase can't initialize at build time (env vars missing). Lazy pattern:
```ts
// src/lib/firebase/config.ts
let app: FirebaseApp | null = null;
export function getFirebaseApp() {
  if (!app && typeof window !== 'undefined') {
    app = initializeApp(firebaseConfig);
  }
  return app;
}
```
All Firebase calls go through this getter, never direct `initializeApp()`.

### 8. IndexedDB Data Model
```
ObjectStore: presentations
  - keyPath: id
  - index: by-updated (updatedAt)
  - Value: Presentation (without blob data)

ObjectStore: imageBlobs
  - keyPath: id (= blobKey on PresentationImage)
  - index: by-presentation (presentationId)
  - Value: { id, presentationId, blob: Blob }
```
Images stored as Blobs, thumbnails as base64 DataURLs on PresentationImage.

## Component Relationships

```
present/page.tsx (Prezi mode controller)
├── PresentationCanvas (overview grid)
│   └── ImageCardAnimated (per-image card, layoutId)
│       └── KeywordBadge (keyword overlays)
├── FocusedSlide (fullscreen slide, layoutId matches card)
│   └── KeywordBadge
├── SpeechControls (voice start/stop)
├── TranscriptOverlay (live speech display)
├── SlideNavigator (prev/next + slide count)
├── AdaptiveControls (keyboard/pointer nav)
├── PaywallBanner (free plan banner)
└── WatermarkOverlay (free plan watermark)
```

## Data Flow: Voice → Slide

```
useSpeechRecognition
    ↓ transcript (string)
useKeywordMatch
    ↓ finds best matching image via Levenshtein
    ↓ filters by matchThreshold (default: 0.7)
AnimationOrchestrator.activateImages([imageId])
    ↓ relevanceScores.set(imageId, 1.0)
    ↓ decay timer starts
store.setFocusedImage(imageId)
    ↓ viewMode = 'focused', focusedImageId = imageId
FocusedSlide renders ← AnimatePresence detects mount
    ↓ Framer Motion layoutId animation: card → fullscreen
```

## Billing Flow

```
User clicks "Upgrade"
    ↓ UpgradeDialog → /api/billing/checkout
    ↓ iyzico creates payment form token
    ↓ Redirect to iyzico payment page
    ↓ Payment success → /api/billing/callback
    ↓ iyzico webhook → /api/billing/webhook
    ↓ Firebase Admin updates Firestore: plan = 'premium'
    ↓ useAuth hook re-fetches profile → UI updates
```

## File Naming Conventions
- Hooks: `use[Name].ts` in `src/hooks/`
- Stores: `[name]Store.ts` in `src/stores/`
- API routes: `src/app/api/[path]/route.ts`
- Lib utilities: `src/lib/[domain]/[name].ts`
- Types: `src/types/[domain].ts`
- Components: PascalCase `.tsx` in `src/components/[domain]/`
