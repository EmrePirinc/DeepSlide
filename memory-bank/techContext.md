# Technical Context

## Tech Stack

### Frontend
- **Next.js 15** App Router (NOT Pages Router)
- **TypeScript** strict mode
- **Tailwind CSS v4** (new config format, not tailwind.config.js)
- **shadcn/ui** components
- **Framer Motion / Motion** for animations
- **Zustand** for global state
- **React Virtuoso** for virtualized image grids

### Backend / Services
- **Firebase Auth** — Google OAuth + email/password
- **Firestore** — User profiles, presentation metadata
- **Firebase Admin SDK** — Server-side (API routes, webhooks)
- **IndexedDB (idb)** — Local presentation storage (images, keywords)

### AI Providers
- **Google Gemini API** (cloud) — gemini-2.0-flash-exp, 10 RPM free tier
- **Ollama** (local) — Qwen3.5 9B, Gemma4 E2B (fastest: ~23s/image)
- Adapter pattern: `src/lib/ai/providers/`

### Voice Recognition
- **Web Speech API** (primary, browser native)
- **Gemini Speech** adapter (optional)
- **Whisper WASM** adapter (optional, offline)
- Fuzzy matching: Levenshtein distance for keyword matching

### Payment
- **iyzico** — Turkish payment gateway, subscription API

## Key Environment Variables (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=deepslide-74660.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=deepslide-74660
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=deepslide-74660.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=deepslide-74660
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
GEMINI_API_KEY=
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

## Important Patterns

### Firebase Lazy Init (CRITICAL)
Firebase crashes at build time if env vars missing. Use lazy init:
```ts
let app: FirebaseApp | null = null;
export function getFirebaseApp() {
  if (!app && typeof window !== 'undefined') {
    app = initializeApp(firebaseConfig);
  }
  return app;
}
```

### AI Rate Limiting (Gemini)
Free tier: 10 RPM. Use concurrency=2, delay=4000ms between batches.
```ts
const CONCURRENCY = 2;
const DELAY_MS = 4000;
```

### Prezi Zoom Pattern
Use Framer Motion `layoutId` matching between grid card and fullscreen view:
```tsx
// In grid: <motion.div layoutId={image.id}>
// In fullscreen: <motion.div layoutId={image.id}>
// AnimatePresence wraps both
```

### Firestore User Profile Structure
```
users/{uid}/
  email: string
  displayName: string
  plan: 'free' | 'premium'
  presentationCount: number
  trialStartedAt: Timestamp
  subscriptionId?: string
  subscriptionExpiresAt?: Timestamp
```

## Development Commands
```bash
cd /Users/emrepirinc/Documents/DeepSlide/app
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint check
```

## Known Gotchas
- `useSearchParams` requires `<Suspense>` wrapper (Next.js 15)
- Gemini 429 errors = rate limit, reduce concurrency
- Ollama needs to be running locally (`ollama serve`)
- `gemma4:27b` doesn't exist → use `gemma4:e2b` or `gemma4:26b`
- Firebase Google popup generates COOP warnings in dev (normal, not blocking)
- Firestore security rules must allow `users/{uid}` read/write for auth user
