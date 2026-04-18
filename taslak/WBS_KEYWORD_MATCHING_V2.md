# WBS — DeepSlide Türkçe Keyword Matching v2

> **Kaynak SPEC:** `RESEARCH_KEYWORD_MATCHING.md` — 13 FR + 8 NFR + 4 sprint öneri + bağımlılık grafiği
> **Proje dizini:** `/Users/emrepirinc/Documents/DeepSlide/app/src/`
> **Stack:** Next.js 16, React 19, TypeScript strict, Tailwind 4, Vitest, Snowball-tr, Talisman JW, custom ensemble
> **Baseline commit:** `f2ae3dd` — partial trigger eklendi, sentetik gold set F1 = 1.000
> **Hedef:** Gerçek dünya F1 ≥ 0.92, <30 ms ortalama latency, zero zoom-flicker

---

## WBS AĞACI — 5 SEVİYE

```
1.0 DeepSlide Keyword Matching v2
│
├── 1.1 SPRINT 1 — Zero-Cost Quick Wins & Flicker Fix
│   ├── 1.1.1 FR-013 — Zoom Flicker Root Cause Analysis
│   │   ├── 1.1.1.1 Instrumentation & RCA
│   │   │   └── 1.1.1.1.1 [T-1.1.1.1.1] Debug logger + flicker repro
│   │   └── 1.1.1.2 Fix Verification
│   │       └── 1.1.1.2.1 [T-1.1.1.2.1] 5-min silent test + regression
│   │
│   ├── 1.1.2 FR-010 — Flicker Mitigation (Decay Inertia)
│   │   └── 1.1.2.1 Orchestrator Gate
│   │       └── 1.1.2.1.1 [T-1.1.2.1.1] notifyChange throttling + focus hysteresis
│   │
│   ├── 1.1.3 FR-003 — Context-Aware Prior
│   │   ├── 1.1.3.1 Cooldown Mechanism
│   │   │   └── 1.1.3.1.1 [T-1.1.3.1.1] Last-focus cooldown + inertia bias
│   │   └── 1.1.3.2 Slide-Locality Prior
│   │       └── 1.1.3.2.1 [T-1.1.3.2.1] Active-slide keyword boost
│   │
│   └── 1.1.4 FR-001 — Trie + Unique-Prefix Early Commit
│       ├── 1.1.4.1 Trie Data Structure
│       │   └── 1.1.4.1.1 [T-1.1.4.1.1] lib/speech/trie.ts — build & unique-count
│       ├── 1.1.4.2 Matcher Integration
│       │   └── 1.1.4.2.1 [T-1.1.4.2.1] keywordMatcher.ts — prefix streaming hook
│       └── 1.1.4.3 Test Coverage
│           └── 1.1.4.3.1 [T-1.1.4.3.1] Gold set J category — 6 prefix early cases
│
│   ### QUALITY GATE 1 — Sprint 1 Regression & Flicker Bar
│
├── 1.2 SPRINT 2 — Semantic Layer Temelleri
│   ├── 1.2.1 FR-004 — Negative Keyword List
│   │   ├── 1.2.1.1 Gemini Prompt Enrichment
│   │   │   └── 1.2.1.1.1 [T-1.2.1.1.1] prompts.ts + parser.ts — negatives field
│   │   ├── 1.2.1.2 Match-Time Penalty
│   │   │   └── 1.2.1.2.1 [T-1.2.1.2.1] keywordMatcher.ts — negative penalty
│   │   └── 1.2.1.3 Types & Migration
│   │       └── 1.2.1.3.1 [T-1.2.1.3.1] Keyword.negatives type + backward compat
│   │
│   ├── 1.2.2 FR-005 — MiniSearch + RRF Fusion
│   │   ├── 1.2.2.1 BM25 Wrapper
│   │   │   └── 1.2.2.1.1 [T-1.2.2.1.1] lib/speech/bm25.ts — MiniSearch + Snowball hook
│   │   └── 1.2.2.2 RRF Fusion
│   │       └── 1.2.2.2.1 [T-1.2.2.2.1] keywordMatcher.ts — reciprocal rank fusion
│   │
│   ├── 1.2.3 FR-008 — TF-IDF Keyword Weighting
│   │   └── 1.2.3.1 Buildtime Computation
│   │       └── 1.2.3.1.1 [T-1.2.3.1.1] keywordMatcher.ts — buildIndex TF-IDF
│   │
│   ├── 1.2.4 FR-011 — Genişletilmiş Gold Set
│   │   ├── 1.2.4.1 Real Transcript Collection
│   │   │   └── 1.2.4.1.1 [T-1.2.4.1.1] 10 gerçek kayıt + annotation
│   │   └── 1.2.4.2 Fixture Integration
│   │       └── 1.2.4.2.1 [T-1.2.4.2.1] goldset.ts — 20+ yeni case + CI report
│   │
│   └── 1.2.5 FR-012 — Ensemble Grid Search
│       └── 1.2.5.1 Weight Optimization
│           └── 1.2.5.1.1 [T-1.2.5.1.1] grid-search.test.ts + similarity.ts commit
│
│   ### QUALITY GATE 2 — Sprint 2 Semantic Floor
│
├── 1.3 SPRINT 3 — Embedding Retrieval
│   ├── 1.3.1 FR-006 — mE5 Embedder Integration
│   │   ├── 1.3.1.1 Transformers.js Setup
│   │   │   └── 1.3.1.1.1 [T-1.3.1.1.1] lib/speech/embedder.ts — lazy init + q4
│   │   ├── 1.3.1.2 WebGPU Fallback
│   │   │   └── 1.3.1.2.1 [T-1.3.1.2.1] device detection + WASM graceful degrade
│   │   └── 1.3.1.3 Cascaded Rerank Hook
│   │       └── 1.3.1.3.1 [T-1.3.1.3.1] keywordMatcher.ts — rerank in uncertainty band
│   │
│   ├── 1.3.2 FR-007 — Description Embedding Cache
│   │   ├── 1.3.2.1 IndexedDB Schema
│   │   │   └── 1.3.2.1.1 [T-1.3.2.1.1] lib/speech/embeddingCache.ts — put/get/invalidate
│   │   └── 1.3.2.2 Buildtime Precomputation
│   │       └── 1.3.2.2.1 [T-1.3.2.2.1] useKeywordMatch — sunum başında prefetch
│   │
│   ├── 1.3.3 FR-002 — Partial Hypothesis Stability
│   │   └── 1.3.3.1 Interim Dedup Upgrade
│   │       └── 1.3.3.1.1 [T-1.3.3.1.1] useKeywordMatch — 2-event stability check
│   │
│   └── 1.3.4 FR-009 — Speaker-Adaptive Threshold
│       ├── 1.3.4.1 Rolling EMA Buffer
│       │   └── 1.3.4.1.1 [T-1.3.4.1.1] speechStore — rolling confidence
│       └── 1.3.4.2 Dynamic Base Threshold
│           └── 1.3.4.2.1 [T-1.3.4.2.1] useKeywordMatch — EMA → threshold shift
│
│   ### QUALITY GATE 3 — Sprint 3 Semantic Rerank Stability
│
└── 1.4 SPRINT 4 — Real-World Validation & Deploy
    ├── 1.4.1 Re-Calibration
    │   └── 1.4.1.1 Grid Search v2 (Embedding dahil)
    │       └── 1.4.1.1.1 [T-1.4.1.1.1] grid-search.test.ts — 5-weight optimize
    │
    ├── 1.4.2 E2E Real-World Test
    │   └── 1.4.2.1 Manual Presentation Run
    │       └── 1.4.2.1.1 [T-1.4.2.1.1] 3 gerçek sunum × 5 dk şecere
    │
    ├── 1.4.3 Performance Profiling
    │   └── 1.4.3.1 DevTools Trace
    │       └── 1.4.3.1.1 [T-1.4.3.1.1] Chrome profile + Vitest bench rapor
    │
    └── 1.4.4 Production Deploy & Metrics
        └── 1.4.4.1 Vercel + A/B
            └── 1.4.4.1.1 [T-1.4.4.1.1] Deploy + 7-day user telemetry

    ### QUALITY GATE 4 — Faz Sonu E2E
```

---

## ATOMİK GÖREV KATALOĞU (25 Task)

Her atomik görev 4-8 saat paket. FR ve NFR referansları, paralel çalışma işareti, ve AI prompt template'i içerir.

---

### SPRINT 1 — QUICK WINS & FLICKER FIX

#### [T-1.1.1.1.1] Zoom Flicker — Debug Logger & Repro

- **FR:** FR-013 | **NFR:** NFR-QUAL-002, NFR-PERF-001
- **Sprint:** 1
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.1.4.1.1 ile aynı anda)
- **Süre:** 4-6 saat
- **Dosyalar:**
  - `app/src/lib/animation/orchestrator.ts` (log instrumentation)
  - `app/src/hooks/useKeywordMatch.ts` (log instrumentation)
  - `app/src/app/presentation/[id]/present/page.tsx` (render counter)

##### AI PROMPT: T-1.1.1.1.1 — Zoom Flicker Root Cause

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.1.1.1 — Zoom Flicker Debug Logger + Repro
FR: FR-013 | NFR: NFR-QUAL-002

HEDEF: Sunum modundayken görseller kendiliğinden zoom'layıp kapanıyor. Kök neden?
3 olası kaynak var (RESEARCH_KEYWORD_MATCHING.md §1.1):
  (a) Decay loop → skor düşüp notifyChange tetikleme
  (b) WebSpeech onend/start race condition
  (c) Interim dedup başarısızlığı

DOSYALAR:
  - app/src/lib/animation/orchestrator.ts — her notifyChange'te şunları logla:
      console.debug('[orch]', { reason, focusedId, scores, tickCount })
  - app/src/hooks/useKeywordMatch.ts — her effect run'da şunları logla:
      console.debug('[match]', { text, phrase, deduped, effectiveThreshold, matchCount, topScore })
  - app/src/app/presentation/[id]/present/page.tsx — render count + focusedImage değişim logu

ARAYUZ DEĞİŞİKLİĞİ YOK — sadece console.debug ekle, process.env.NODE_ENV !== 'production' ile gate.

KABUL KRİTERİ:
  VERILDIGI DURUMDA: Present mode açık, 5 dk sessiz beklenti
  NE ZAMAN: Kullanıcı tek kelime söyler
  O ZAMAN: Console'da tam sebep zinciri görünür (focus değişim event'leri + decay tick'leri)
  AND: notifyChange hangi koşulda 2+ kez tetiklendiği görülebilir
  AND: WebSpeech onend/start event'leri timeline'da yer alır

KISITLAR:
  - Production build'de sıfır log output (gate with NODE_ENV)
  - Latency etkisi <1 ms (console.debug sync)
  - Type check: 0 hata

BAGLAM ICIN ÖNCE OKU:
  - app/src/lib/animation/orchestrator.ts — decay + notifyChange mantığı
  - app/src/lib/speech/adapters/webSpeechAdapter.ts — onend + auto-restart
  - RESEARCH_KEYWORD_MATCHING.md §0 "Bilinen çatlaklar 1" + Agent raporu

BAŞARI: `npm run dev` + present mode açık tut → console'da flicker'ın tam zincirini görebilmek.
Sonuç bir yorum bloğu olarak T-1.1.2.1.1'de referanslanacak.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.1.1.2.1] Flicker Fix Verification

- **FR:** FR-013 | **NFR:** NFR-QUAL-002
- **Bağımlılık:** T-1.1.2.1.1, T-1.1.3.1.1 tamamlanmalı
- **Paralel?:** Hayır (zincir sonu)
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/lib/speech/__tests__/flicker.test.ts` (YENİ — synthetic)
  - Manuel: Chrome DevTools performance trace

##### AI PROMPT: T-1.1.1.2.1 — Flicker Regression Test

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.1.2.1 — Flicker regresyon testi ve manuel doğrulama
FR: FR-013 | NFR: NFR-QUAL-002

ÖN KOŞUL: T-1.1.2.1.1 (orchestrator throttle) ve T-1.1.3.1.1 (cooldown) tamamlanmış olmalı.

DOSYA YAZ: app/src/lib/speech/__tests__/flicker.test.ts
  Senaryolar:
  1. Tek focusImage çağrısından sonra 10 sn decay tick simulate et
     → currentFocusedId değişmemeli (hysteresis)
  2. Aynı imageId'ye 50 kez focusImage çağrısı (interim dedup başarısız varyasyon)
     → notifyChange yalnızca 1-2 kez (re-render sayısı)
  3. Focus A (0.9) → 1sn sonra focus B (0.75) skorlu gelince
     → B'nin değişmemesi (inertia), A cooldown süresi içinde
  4. 3 sn sonra A (0.3'e düşmüş) + B (0.8 taze) → B devralmalı

MANUEL DOĞRULAMA (npm run dev):
  - 3 görselli sunum aç, present mode'a gir
  - 5 dk sessiz kal → zoom değişikliği YOK
  - "dağ" de → img-mountain zoom'lar ve stabil kalır
  - 10 sn bekle → overview'a dönüş normal
  - "bulut" de → smooth geçiş, flicker yok

KABUL KRİTERİ:
  - flicker.test.ts 4/4 pass
  - Manuel 5 dk sessizlikte sıfır otomatik zoom
  - E2E test notu: RESEARCH_KEYWORD_MATCHING.md §4 NFR-QUAL-002 satisfied

KISITLAR:
  - Test latency <500 ms toplam
  - Sync setInterval mock (vi.useFakeTimers())

BAŞARI: F1 regresyon yok + flicker count = 0.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.1.2.1.1] Orchestrator Focus Hysteresis

- **FR:** FR-010 | **NFR:** NFR-QUAL-002, NFR-PERF-001
- **Bağımlılık:** T-1.1.1.1.1 (debug logger görülmüş olmalı)
- **Paralel?:** Hayır
- **Süre:** 4-5 saat
- **Dosya:** `app/src/lib/animation/orchestrator.ts`

##### AI PROMPT: T-1.1.2.1.1 — Decay Hysteresis

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.2.1.1 — Orchestrator focus hysteresis (flicker önleme)
FR: FR-010 | NFR: NFR-QUAL-002

HEDEF: notifyChange sadece (a) currentFocusedId GERÇEKTEN değiştiğinde veya
(b) aktif focus null'dan bir image'a geçtiğinde tetiklenmeli. Decay tick'te
aynı ID için skor düşüşü → notifyChange YOK.

DOSYA: app/src/lib/animation/orchestrator.ts

MEVCUT KOD (satır ~107):
  this.decayInterval = setInterval(() => {
    let changed = false;
    for (...) {
      if (newScore < DEACTIVATE_THRESHOLD) { delete; changed = true; }
      else { set; changed = true; }
    }
    if (changed) { this.updateFocus(); this.notifyChange(); }
  }, 500);

DEĞİŞİKLİK:
  1. `changed` flag'i sadece TOPOLOJİK değişimlerde true olacak (entry silinme,
     focus değişimi). Skor refresh'i değil.
  2. updateFocus() çağrısından sonra currentFocusedId prevFocusedId'den
     farklıysa notifyChange.
  3. focusImage() içindeki skor-delta kontrolü (son commit'te eklendi) korunsun.
  4. Yeni: minimum focus hold time = 1000 ms. Eğer focus A yakınsa (< 1 sn önce
     set edildi) yeni B skor 0.9'dan büyük olmadıkça devralmaz.

YENİ ALANLAR:
  private focusSetAt: number = 0;  // Date.now() of last focus change
  private readonly MIN_FOCUS_HOLD_MS = 1000;
  private readonly FOCUS_OVERRIDE_BAR = 0.9;

KABUL KRİTERİ:
  GIVEN focus A, 500 ms sonra
  WHEN B için score 0.78 gelirse
  THEN focus değişmez (hold süresi dolmadı + bar altı)
  AND 1500 ms sonra B için score 0.78 tekrar gelirse
  THEN focus B olur (hold süresi doldu)

TEST: app/src/lib/speech/__tests__/flicker.test.ts (T-1.1.1.2.1'de yazılacak)

KISITLAR:
  - Mevcut tests 13/13 yeşil kalmalı (vitest run src/lib/speech/__tests__/keywordMatcher.test.ts)
  - Type check: 0 hata
  - focusImage API imzası değişmez (geriye uyumlu)

BAŞARI: Sprint 1 flicker fix kökünde burada, testler bu dosyadan geçerse tamam.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.1.3.1.1] Last-Focus Cooldown

- **FR:** FR-003 | **NFR:** NFR-QUAL-002
- **Bağımlılık:** T-1.1.2.1.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/hooks/useKeywordMatch.ts`
  - `app/src/lib/animation/orchestrator.ts` (read-only API için getter)

##### AI PROMPT: T-1.1.3.1.1 — Cooldown Prior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.3.1.1 — Last-focus cooldown + inertia bias
FR: FR-003 | NFR: NFR-QUAL-002

HEDEF: Son 3 sn içinde zaten tetiklenmiş bir keyword'ün skorunu yapay olarak
+0.05 boost et (kullanıcı aynı konudan bahsediyor). Ama son 1 sn içinde
yeni bir keyword'e geçmek için skor farkı en az 0.15 olmalı.

DOSYA: app/src/hooks/useKeywordMatch.ts

YENİ STATE:
  const recentFocusRef = useRef<Map<string, number>>(new Map());  // imageId → lastTriggeredAt
  // Map size auto-clean old entries (>5 sn eski)

match pipeline DAHA:
  const matches = matcher.match(recentWords, effectiveThreshold);
  // SONRASINDA — cooldown boost:
  const now = Date.now();
  const boosted = matches.map(m => {
    const lastAt = recentFocusRef.current.get(m.imageIds[0]);
    if (lastAt && now - lastAt < 3000) {
      return { ...m, score: Math.min(1, m.score + 0.05) };
    }
    return m;
  });
  boosted.sort((a, b) => b.score - a.score);
  const topMatch = boosted[0];
  // ... mevcut focusImage çağrısı

  // Trigger sonrası recordet:
  recentFocusRef.current.set(topMatch.imageIds[0], now);
  // GC: 5 sn üstü entry'leri temizle
  for (const [id, t] of recentFocusRef.current) {
    if (now - t > 5000) recentFocusRef.current.delete(id);
  }

KABUL KRİTERİ:
  - Kullanıcı "dağ" derken img-mountain zoom'ladı
  - 2 sn sonra tekrar "dağ manzarası" derse skor hafif boost ile img-mountain
    kalır (flicker önlenir)
  - 5 sn sonra "bulut" derse smooth geçiş (cooldown'dan çıktı)

KISITLAR:
  - Rebuild edilmiş matcher'ı etkileme (buildIndex değişmiyor)
  - Latency etkisi <1 ms
  - Cleanup GC (5 sn üstü entry) memory leak önlesin

BAŞARI: Gerçek dünyada aynı konuda kullanıcı konuşmasını sürdürürken görsel stabil kalır.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.1.3.2.1] Active-Slide Keyword Boost

- **FR:** FR-003 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** T-1.1.3.1.1
- **Paralel?:** Hayır (aynı dosya)
- **Süre:** 3-4 saat
- **Dosya:** `app/src/hooks/useKeywordMatch.ts` + `app/src/stores/presentationStore.ts`

##### AI PROMPT: T-1.1.3.2.1 — Slide Locality Prior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.3.2.1 — Aktif slaydın keyword'lerine locality boost
FR: FR-003

HEDEF: Sunum akışı içinde, şu anda gösterilen slaydın keyword'leri daha
yüksek prior alır. Kullanıcı slayt atlatırken aynı sahnenin bağlamı
içinde kalır.

PRESENTATION STORE'DA:
  Mevcut: currentSlideIndex, focusedImageId
  Yeni getter: getActiveSlideImageIds(): string[]
    → currentSlideIndex çevresindeki ±1 slaytların görsel ID'leri

useKeywordMatch.ts İÇİNDE:
  const activeIds = usePresentationStore(s => s.getActiveSlideImageIds());

  // match sonrası, cooldown boost SONRASINDA:
  const localityBoosted = boosted.map(m => {
    const isActive = activeIds.some(id => m.imageIds.includes(id));
    if (isActive) return { ...m, score: Math.min(1, m.score + 0.03) };
    return m;
  });
  localityBoosted.sort(...);

KABUL KRİTERİ:
  GIVEN current slide shows img-path ve img-fog
  WHEN kullanıcı "dağ" derse (img-mountain başka slaytta)
  THEN dağ skoru 0.82, yürüyüş yolu (locality boost ile) 0.80 → dağ kazanır
    (locality sadece tie-break, dominant değil)
  AND kullanıcı "yolu" derse (tie-break)
  THEN locality boost ile img-path kazanır

KISITLAR:
  - Presentation store'da yeni getter seçici (Zustand) — memoization
  - Boost değeri 0.03 (agresif değil, tie-break amaçlı)
  - Re-render kontrolü: store selector stabilite

BAŞARI: Slayt akışı içinde komşu görseller öncelikli, uzak ama eşit skorlu
görseller geri planda kalır.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.1.4.1.1] Trie Data Structure — Unique-Prefix Count

- **FR:** FR-001 | **NFR:** NFR-PERF-002, NFR-SIZE-001
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.1.1.1.1 ile aynı anda)
- **Süre:** 5-7 saat
- **Dosya:** `app/src/lib/speech/trie.ts` (YENİ)

##### AI PROMPT: T-1.1.4.1.1 — Build Trie with Unique Descendant Count

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.4.1.1 — Char-level trie + unique-descendant count
FR: FR-001 | NFR: NFR-PERF-002 (<5ms/sahne) | NFR-SIZE-001

HEDEF: Her keyword (normalized + stemmed) char-level trie'ya insert edilir.
Her iç node "uniqueImageId" değerini tutar — eğer bu node'un tüm alt-dalları
tek bir imageId'ye aitse, uniqueImageId=that id, else null. Böylece prefix
lookup sırasında en sığ benzersiz nokta tespit edilir.

DOSYA: app/src/lib/speech/trie.ts (YENİ)

API TANIMI:
  export interface TrieNode {
    children: Map<string, TrieNode>;
    terminalImageIds?: Set<string>;  // tam kelime bittiyse
    uniqueImageId: string | null;    // bu node'dan aşağı tüm yollar bu image'a aitse
    depth: number;
  }

  export class KeywordTrie {
    private root: TrieNode;
    build(entries: Array<{ text: string; imageId: string }>): void;
    findUniquePrefix(prefix: string): { imageId: string; depth: number } | null;
    // prefix harfleri tek tek tüket, ilk uniqueImageId != null olan node'u döndür
  }

BUILD ALGORITMASI:
  1. Her entry için char char traverse et, node yoksa yarat, son node'a terminalImageIds ekle.
  2. Post-order DFS: her node için uniqueImageId'yi hesapla:
     - Terminal node + tek imageId → uniqueImageId = o id
     - Non-terminal: tüm children'ın uniqueImageId'leri aynı ve null değilse → set
     - Aksi halde → null

FIND ALGORITMASI:
  - prefix'i char char tüket
  - Her adımda current node'un uniqueImageId'si varsa dön
  - En az depth >= 3 (minimum prefix) şartı

KABUL KRİTERİ (gold set J):
  GIVEN keywords: "yürüyüş yolu", "saman balyası", "sis"
  WHEN findUniquePrefix("yürü") → { imageId: img-path, depth: 4 }
  WHEN findUniquePrefix("sam")  → { imageId: img-hay, depth: 3 }
  WHEN findUniquePrefix("si")   → null (sadece 2 char, minimum 3)
  WHEN findUniquePrefix("sis")  → { imageId: img-fog, depth: 3 }

  AND ek case — ambiguous:
  GIVEN keywords: "yürüyüş yolu", "yürüyüş parkuru"
  WHEN findUniquePrefix("yürü") → null (iki image paylaşıyor)

KISITLAR:
  - Build süresi <5 ms / 50 keyword (NFR-PERF-002)
  - Bundle etkisi ≤2 KB (saf JS, bağımlılık yok)
  - Normalize edilmiş (asciified) stringler üzerinde çalışır
  - Minimum prefix depth = 3 (2 char çok agresif)

BAGLAM:
  - app/src/lib/speech/normalize.ts — asciify için
  - app/src/lib/speech/stemmer.ts — stemmed form eklenecek

TEST: app/src/lib/speech/__tests__/trie.test.ts (YENİ — 10 case)

BAŞARI: 50 keyword'lük sahnede build <5 ms + findUniquePrefix doğru node'u bulur.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.1.4.2.1] Matcher — Prefix Streaming Hook

- **FR:** FR-001 | **NFR:** NFR-PERF-001
- **Bağımlılık:** T-1.1.4.1.1
- **Paralel?:** Hayır
- **Süre:** 4-6 saat
- **Dosyalar:**
  - `app/src/lib/speech/keywordMatcher.ts`
  - `app/src/hooks/useKeywordMatch.ts`

##### AI PROMPT: T-1.1.4.2.1 — Integrate Trie Early-Commit

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.4.2.1 — KeywordMatcher'a prefix early-commit entegrasyonu
FR: FR-001 | NFR: NFR-PERF-001

ÖN KOŞUL: T-1.1.4.1.1 tamamlandı — lib/speech/trie.ts çalışır durumda.

DOSYA: app/src/lib/speech/keywordMatcher.ts

DEĞİŞİKLİKLER:
  1. private trie = new KeywordTrie();
  2. buildIndex'te (mevcut PASS 1 + PASS 2 sonrası) PASS 3 ekle:
     - Her keyword.text ve keyword.forms için entry oluştur
     - trie.build(allEntries)
  3. Yeni public method:
     matchStreamingPrefix(partialWord: string, baseThreshold: number): MatchResult | null
       - trie.findUniquePrefix(asciify(partialWord))
       - Bulursa score 0.82 ile MatchResult döndür (normal 1.0'dan düşük ama
         threshold'dan yüksek, böylece trigger eder)
       - depth < 3 → null

useKeywordMatch.ts İÇİNDE:
  - Mevcut effect'ten ÖNCE yeni effect:
    useEffect(() => {
      if (!interimTranscript) return;
      const tail = interimTranscript.split(/\s+/).pop() || '';
      if (tail.length < 3) return;
      const prefixMatch = matcherRef.current.matchStreamingPrefix(tail, threshold);
      if (prefixMatch) {
        orchestratorRef.current.focusImage(prefixMatch.imageIds[0], prefixMatch.score);
      }
    }, [interimTranscript]);

  - Ancak partial hypothesis stability (T-1.3.3.1.1) henüz yoksa
    aynı prefix için art arda tetikleme olabilir. Şimdilik lastPrefixRef
    ile dedup:
    const lastPrefixRef = useRef<string>('');
    if (tail === lastPrefixRef.current) return;
    lastPrefixRef.current = tail;

KABUL KRİTERİ (T-1.1.4.3.1 gold set J ile):
  GIVEN sahne: yürüyüş yolu, saman balyası, sis
  WHEN interim "yürü" gelirse
  THEN orchestrator.focusImage('img-path', 0.82) çağrılır
  AND tam kelime "yürüyüş" beklenmeden tetiklenme gerçekleşir

KISITLAR:
  - Prefix streaming mevcut n-gram match ile ÇELİŞMEMELİ (önce streaming, sonra full match)
  - lastPhraseRef dedup ayrı, lastPrefixRef ayrı
  - Type check: 0 hata
  - Mevcut 13 test yeşil kalmalı

BAGLAM:
  - T-1.1.4.1.1 API (findUniquePrefix)
  - app/src/lib/speech/keywordMatcher.ts mevcut match() akışı
  - app/src/hooks/useKeywordMatch.ts mevcut effect

BAŞARI: İnterim transcript'in ilk 3 harfi bile benzersiz keyword'ü tanımlıyorsa
kullanıcı kelimeyi bitirmeden zoom başlar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.1.4.3.1] Gold Set J Kategori — Prefix Early Cases

- **FR:** FR-001, FR-011 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** T-1.1.4.2.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat
- **Dosya:** `app/src/lib/speech/__tests__/goldset.ts`, `keywordMatcher.test.ts`

##### AI PROMPT: T-1.1.4.3.1 — J Category Prefix Tests

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.1.4.3.1 — Gold set J kategori (streaming prefix)
FR: FR-001 | NFR: NFR-QUAL-001

DOSYA: app/src/lib/speech/__tests__/goldset.ts

YENİ KATEGORİ: 'J' — Streaming prefix early commit

EKLE (6 yeni case):
  J1: scene=[yürüyüş yolu, saman balyası, sis], spoken='yürü'
      expected=img-path, rationale='yürü unique prefix, 4 char yeterli'
  J2: scene=SCENE_LANDSCAPE, spoken='sam'
      expected=img-hay, rationale='sam unique, saman balyası parent'
  J3: scene=[yürüyüş yolu, yürüyüş parkuru], spoken='yürü'
      expected=null, rationale='yürü ambiguous → null'
  J4: scene=SCENE_LANDSCAPE, spoken='sis'
      expected=img-fog, rationale='tam kelime, prefix path değil normal exact'
  J5: scene=SCENE_LANDSCAPE, spoken='sa'
      expected=null, rationale='2 char çok kısa (minimum depth 3)'
  J6: scene=SCENE_LANDSCAPE, spoken='bal'
      expected=img-hay, rationale='bal → saman balyası stem match + unique'

DOSYA: app/src/lib/speech/__tests__/keywordMatcher.test.ts

matchScene() fonksiyonunu güncelle:
  - Eğer gold case spoken tek kelime VE çok kısa (<4 char) ise matchStreamingPrefix
    dene, sonra fallback normal match()
  - Veya ayrı matchSceneStreaming helper

YENİ TEST:
  describe('keywordMatcher — streaming prefix', () => {
    it('unique prefix triggers early', () => {...});
    it('ambiguous prefix returns null', () => {...});
    it('minimum depth enforced', () => {...});
  });

KABUL KRİTERİ:
  - J1-J6 hepsi pass
  - Toplam gold set 36 case, F1 ≥ 0.95 (streaming dahil)

KISITLAR:
  - Mevcut 30 case'in skoru düşmemeli

BAŞARI: Sprint 1'in quality gate'i burada geçiliyor.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### QUALITY GATE 1 — Sprint 1 Regression & Flicker

- **Seviye:** INTEGRATION + REGRESSION
- **Test:** Tüm Sprint 1 görevleri birleşimi
- ☐ `npx tsc --noEmit` → 0 hata
- ☐ `npx vitest run src/lib/speech/__tests__/` → hepsi yeşil (36+ case)
- ☐ Manuel: Present mode açık, 5 dk sessiz → sıfır otomatik zoom değişimi
- ☐ Manuel: "yürü" partial dedikten sonra img-path zoom'ladı (tam "yürüyüş" beklenmedi)
- ☐ Manuel: Aynı keyword'ü 3 kez tekrarlama → focus stabil, flicker yok
- ☐ `git commit` → rollback noktası
- **⛔ GECEMEZSEN:** Hangi test düştüyse oraya /clear ile odaklan, fix kısmı

---

### SPRINT 2 — SEMANTIC LAYER TEMELLERİ

#### [T-1.2.1.1.1] Gemini Prompt — Negatives Field

- **FR:** FR-004 | **NFR:** —
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.2.2.1.1, T-1.2.3.1.1 ile)
- **Süre:** 3-4 saat
- **Dosyalar:**
  - `app/src/lib/ai/prompts.ts`
  - `app/src/lib/ai/parser.ts`
  - `app/src/lib/ai/types.ts`

##### AI PROMPT: T-1.2.1.1.1 — Add Negatives to Gemini Pipeline

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.1.1.1 — Gemini prompt 'negatives' alanı + parser + tip
FR: FR-004

HEDEF: Her keyword için Gemini karıştırılabilecek Türkçe kelimelerin listesini
(0-5 öğe) üretir. Match sırasında kullanıcı bu listedeki bir kelimeyi söylerse
final skor penalize edilir.

DOSYA 1: app/src/lib/ai/prompts.ts
  Mevcut Türkçe prompt'a EKLE (JSON example'a + kurallar'a):

  "negatives": ["siz", "his", "sus"]

  Kurallar eki:
  - "negatives": Bu keyword'le karıştırılabilecek AMA KASTEDİLMEYEN Türkçe kelimeler.
    0-5 öğe. Yüksek confusability keyword'lerinde 3-5, düşükte 0-1.
    Örnek: "sis" için ["siz", "his"]; "bal" için ["bel", "bil"]; "dağ" için boş.

DOSYA 2: app/src/lib/ai/parser.ts
  Mevcut map içine ekle:
    const negatives = Array.isArray(kw.negatives)
      ? (kw.negatives as unknown[])
          .filter((s): s is string => typeof s === 'string' && s.length > 0)
          .map((s) => s.toLowerCase().trim())
          .slice(0, 5)
      : undefined;
    ...
    return { ...existing, negatives };

DOSYA 3: app/src/lib/ai/types.ts
  AnalyzedKeyword interface'e ekle:
    negatives?: string[];

DOSYA 4: app/src/types/presentation.ts
  Keyword interface'e ekle:
    negatives?: string[];

DOSYA 5: app/src/lib/ai/analyzeBatch.ts
  analysisResultToKeywords içine:
    negatives: kw.negatives,

KABUL KRİTERİ:
  - Gemini real API call → keyword'lerin en az %80'inde confusability > 0.5 ise
    negatives dolu gelsin (manuel test, 5 örnek)
  - Parser: Dict uyumluluğu eski verilerde kırılmasın (negatives undefined olabilir)
  - Type check 0 hata

KISITLAR:
  - Backward compat: eski keyword'lerde negatives olmadığında fallback
  - Gemini prompt uzunluğu +100 token kabul edilebilir

BAŞARI: Gerçek sunum analizinde homofonlarda negatives dolu geliyor.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.1.2.1] Match — Negative Penalty

- **FR:** FR-004 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** T-1.2.1.1.1
- **Paralel?:** Hayır (aynı dosya)
- **Süre:** 4-5 saat
- **Dosya:** `app/src/lib/speech/keywordMatcher.ts`

##### AI PROMPT: T-1.2.1.2.1 — Negative Keyword Penalty

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.1.2.1 — Match sırasında negative keyword penalty
FR: FR-004

ÖN KOŞUL: T-1.2.1.1.1 tamam → Keyword.negatives tipi mevcut.

DOSYA: app/src/lib/speech/keywordMatcher.ts

DEĞİŞİKLİK:
  1. addKeywordToIndex'te: kw.negatives her biri için de index eklenmez
     ama entry'nin negatives listesi IndexEntry'de tutulur:
       interface IndexEntry { ... negatives?: string[] }
  2. match() içinde en sona: sonuçları dolaşıp, her result için:
     - Söylenen kelimelerde (normalizedWords) entry.negatives'ten herhangi biri
       EXACT eşleşiyorsa penalty uygula:
         result.score -= 0.40 * maxNegativeMatch
     - Skor 0'a düşerse result'u at
     - Tekrar sırala

  const NEGATIVE_PENALTY = 0.40;

  results = results.map(r => {
    const entry = allEntries bulup negatives'i al
    if (!entry?.negatives) return r;
    let maxNeg = 0;
    for (const neg of entry.negatives) {
      const negNorm = normalizePhrase(neg);
      for (const sw of normalizedWords) {
        if (sw === negNorm) maxNeg = 1;
      }
    }
    return { ...r, score: Math.max(0, r.score - NEGATIVE_PENALTY * maxNeg) };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);

KABUL KRİTERİ (gold set C güncelle):
  - "siz de gelin" → 'sis' keyword için score 0.85 - 0.40 = 0.45 → threshold 0.85
    altında → reddedilir ✓
  - "sabahki sis" → 'sis' keyword score 1.0 (exact) → penalty yok (sis negatives listesinde değil)

KISITLAR:
  - Mevcut 30 gold case yeşil kalsın
  - Latency etkisi <2 ms
  - Penalty sadece exact neg word match'te (fuzzy değil — kesin olmalı)

BAGLAM:
  - IndexEntry tanımı (keywordMatcher.ts)
  - C kategori gold case'ler (goldset.ts)

BAŞARI: Homofon trap'leri negatives ile kesin reddedilir.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.1.3.1] Keyword.negatives — Backward Compat Migration

- **FR:** FR-004 | **NFR:** NFR-COMPAT-001
- **Bağımlılık:** T-1.2.1.2.1
- **Paralel?:** Hayır
- **Süre:** 2-3 saat
- **Dosya:** `app/src/lib/db/canvas-objects.ts`, `presentationStore.ts`

##### AI PROMPT: T-1.2.1.3.1 — IndexedDB Migration

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.1.3.1 — Mevcut IndexedDB verilerinde negatives undefined fallback
FR: FR-004 | NFR: NFR-COMPAT-001

HEDEF: Eski sunumlar negatives field'ı olmadan kaydedildi. Load edilirken
kırılmasın, sessizce undefined kabul edilsin.

DOSYA: app/src/lib/db/canvas-objects.ts
  (eğer keyword ayrı depolanmıyorsa, presentations tablosunda)

DOSYA: app/src/stores/presentationStore.ts
  Keyword load eden reducer'a:
    keywords: raw.keywords.map(kw => ({
      ...kw,
      negatives: kw.negatives,  // undefined ok
      forms: kw.forms,
      confusability: kw.confusability,
    }))

YOKSA: bu adım zaten parser'da halledildi, sadece store'da kontrol et.

KABUL KRİTERİ:
  - Eski sunum (negatives olmadan) load edilince hata yok
  - Yeni sunum negatives ile load edilir ve match'te kullanılır
  - IndexedDB schema version değiştirme gerekmesin (opsiyonel alanlar)

KISITLAR:
  - Zero-downtime migration
  - Eski veriler yeniden analiz edilmek zorunda değil

BAŞARI: Eski ve yeni sunumlar aynı sistemde koşar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.2.1.1] BM25 Wrapper — MiniSearch + Snowball-tr

- **FR:** FR-005 | **NFR:** NFR-SIZE-001, NFR-PERF-001
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.2.1.1.1 ile)
- **Süre:** 4-6 saat
- **Dosya:** `app/src/lib/speech/bm25.ts` (YENİ)

##### AI PROMPT: T-1.2.2.1.1 — MiniSearch Turkish BM25

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.2.1.1 — MiniSearch wrapper with Snowball Turkish tokenizer
FR: FR-005 | NFR: NFR-SIZE-001, NFR-PERF-001

HEDEF: MiniSearch BM25 indeksi, Türkçe stemmer + asciify pre-process ile.
Mevcut ensemble'a paralel ikinci sinyal olarak kullanılacak.

DEPS (npm):
  npm install minisearch

DOSYA: app/src/lib/speech/bm25.ts (YENİ)

API:
  import MiniSearch from 'minisearch';
  import { normalizePhrase } from './normalize';
  import { stemPhrase } from './stemmer';

  export interface BM25Entry {
    id: string;      // unique id (keyword id veya image-kw pair)
    imageId: string;
    text: string;    // ana keyword + synonyms + forms birleşik
  }

  export class BM25Matcher {
    private index: MiniSearch<BM25Entry>;

    constructor() {
      this.index = new MiniSearch({
        fields: ['text'],
        storeFields: ['imageId'],
        processTerm: (term) => {
          const norm = normalizePhrase(term);
          return stemPhrase(norm);
        },
        searchOptions: {
          boost: { text: 1 },
          fuzzy: 0.2,
          prefix: true,
          combineWith: 'OR',
        },
      });
    }

    build(entries: BM25Entry[]): void {
      this.index.removeAll();
      this.index.addAll(entries);
    }

    search(query: string): Array<{ id: string; imageId: string; score: number }> {
      const normalized = normalizePhrase(query);
      const stemmed = stemPhrase(normalized);
      const results = this.index.search(stemmed);
      return results.map(r => ({ id: String(r.id), imageId: String(r.imageId), score: r.score }));
    }
  }

KABUL KRİTERİ:
  GIVEN sahne 5 keyword
  WHEN build(entries) çağrılır
  THEN <5 ms'de tamam
  AND search("yürüyüş") → en üstte img-path

KISITLAR:
  - Bundle etkisi: minisearch ~10 KB gzipped
  - build <5 ms (50 keyword)
  - search <2 ms

TEST: app/src/lib/speech/__tests__/bm25.test.ts (YENİ — 5 case)

BAŞARI: MiniSearch Türkçe stemming doğru çalışıyor, ensemble'dan ayrı sinyal üretiyor.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.2.2.1] RRF Fusion

- **FR:** FR-005 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** T-1.2.2.1.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat
- **Dosya:** `app/src/lib/speech/keywordMatcher.ts`

##### AI PROMPT: T-1.2.2.2.1 — Reciprocal Rank Fusion

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.2.2.1 — Ensemble + BM25 RRF fusion
FR: FR-005

HEDEF: keywordMatcher.match() sonuçlarını BM25 sonuçlarıyla reciprocal rank
fusion formülüyle birleştir:
  score = 1/(k + rank_ensemble) + 1/(k + rank_bm25), k=60

DOSYA: app/src/lib/speech/keywordMatcher.ts

DEĞİŞİKLİK:
  1. private bm25 = new BM25Matcher();
  2. buildIndex sonunda: bm25.build(entries)
  3. match() sonuç listesinden ÖNCE ensembleResults, SONRA bm25Results
  4. rrfMerge(ensemble, bm25) → birleşik sıralı liste
  5. Top match'ler buradan alınacak

  function rrfMerge(a: MatchResult[], b: MatchResult[], k = 60): MatchResult[] {
    const combined = new Map<string, { result: MatchResult; score: number }>();
    a.forEach((r, rank) => {
      const key = r.imageIds[0];
      combined.set(key, { result: r, score: 1 / (k + rank) });
    });
    b.forEach((r, rank) => {
      const key = r.imageIds[0];
      const existing = combined.get(key);
      if (existing) existing.score += 1 / (k + rank);
      else combined.set(key, { result: r, score: 1 / (k + rank) });
    });
    return Array.from(combined.values())
      .sort((x, y) => y.score - x.score)
      .map(c => c.result);
  }

KABUL KRİTERİ:
  - Mevcut 30 gold case yeşil kalır (en azından 28+)
  - BM25'in bulduğu ama ensemble'ın kaçırdığı case'lerde fusion recall'ı artırır
  - Threshold filtreleme hala çalışır (dinamik threshold)

KISITLAR:
  - Latency <10 ms (ensemble 5 + BM25 2 + RRF 1 ≈ 8 ms)
  - Ensemble tek başına %80 katkıda bulunur, BM25 tie-break

BAGLAM:
  - T-1.2.2.1.1 BM25Matcher API
  - Mevcut match() pipeline

BAŞARI: BM25 sinyal fusion gerçek dünyada kaçırılan keyword'leri yakalar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.3.1.1] TF-IDF Keyword Weighting

- **FR:** FR-008 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.2.1.x, T-1.2.2.x ile)
- **Süre:** 3-4 saat
- **Dosya:** `app/src/lib/speech/keywordMatcher.ts`

##### AI PROMPT: T-1.2.3.1.1 — TF-IDF Buildtime Weighting

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.3.1.1 — Sahne içi TF-IDF keyword weights
FR: FR-008

HEDEF: buildIndex'te her keyword için sahne içindeki nadir kelimeler boost alır.
"otomobil" (1 kez) > "nesne" (5 kez). Match threshold'u keyword başına
TF-IDF'e göre kaydırılır.

DOSYA: app/src/lib/speech/keywordMatcher.ts

IndexEntry'ye ekle:
  tfIdfWeight: number;  // 0.5 - 1.5 arası, 1.0 nötr

BuildIndex içinde (PASS 1 sonrası):
  1. Document frequency hesapla (her stem kaç IMAGE'da geçiyor)
     - DF[stem] = Set<imageId> size
  2. IDF = log(N / DF) (N = toplam image sayısı)
  3. Her entry için: tfIdfWeight = clamp(idf / log(N), 0.5, 1.5)

Match'te dynamic threshold hesabı yanında:
  th = dynamicThreshold(...) / entry.tfIdfWeight;
  // nadir keyword → daha düşük threshold → kolay tetik
  // yaygın keyword → yüksek threshold → daha zor tetik

KABUL KRİTERİ:
  GIVEN sahne: "otomobil" (1 image), "manzara" (3 image), "sis" (1 image)
  WHEN TF-IDF hesaplanır
  THEN otomobil.weight > 1.0, manzara.weight < 1.0
  AND otomobil için effective threshold 0.7/1.2 = ~0.58 (daha kolay)
  AND manzara için 0.7/0.8 = 0.875 (daha zor)

KISITLAR:
  - clamp [0.5, 1.5] — aşırı shift'i önle
  - TF-IDF precision 2 decimal (IndexEntry'ye yazılır)
  - Mevcut 30 gold case yeşil kalır

BAŞARI: Ayırt edici keyword'ler sahne bağlamında öncelikli seçilir.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.4.1.1] Real Transcript Collection (10 gerçek kayıt)

- **FR:** FR-011 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** —
- **Paralel?:** Evet (manuel veri toplama)
- **Süre:** 4-6 saat
- **Dosya:** `app/src/lib/speech/__tests__/fixtures/real-transcripts/*.json`

##### AI PROMPT: T-1.2.4.1.1 — Gather Real Presentation Transcripts

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.4.1.1 — Gerçek sunum transkriptlerinden fixture üret
FR: FR-011 | NFR: NFR-QUAL-001

HEDEF: 10+ gerçek DeepSlide sunum senaryosu. Her biri için:
  - WebSpeech ile kaydedilen ham transkript (interim + final serisi)
  - Sahnedeki keyword seti (JSON)
  - Her cümle için el ile annotation: "bu cümlede hangi görsel focus olmalıydı"

DİZİN: app/src/lib/speech/__tests__/fixtures/real-transcripts/
  case-01-landscape.json
  case-02-city.json
  case-03-product.json
  ...

JSON SCHEMA:
  {
    "id": "case-01",
    "title": "Dağ manzarası sunumu",
    "scene": [
      { "id": "img-1", "keywords": [{ "text": "yürüyüş yolu", ... }] },
      ...
    ],
    "transcript": [
      {
        "interim": "yürüyüş",
        "final": null,
        "timestamp": 0,
        "confidence": 0.87
      },
      {
        "interim": "yürüyüş yolunda",
        "final": null,
        "timestamp": 300,
        "confidence": 0.92
      },
      {
        "interim": null,
        "final": "yürüyüş yolunda yürüyoruz",
        "timestamp": 1200,
        "confidence": 0.95
      }
    ],
    "expected": [
      { "atTimestamp": 400, "imageId": "img-1", "rationale": "stem match yol" }
    ]
  }

NASIL TOPLANIR:
  1. npm run dev, yerel olarak DeepSlide'ı çalıştır
  2. 10 farklı konuda sahne yükle
  3. Chrome dev tools'ta WebSpeech onresult event'lerini yakalayan script:

     window._recording = [];
     const _orig = SpeechRecognition.prototype.start;
     // ... veya adapter'da log + export

  4. 5-10 sn konuşma, durdur, JSON olarak kaydet
  5. Transkripti el ile annotation yap (hangi cümlede hangi image?)

NOT: Kullanıcı yardımıyla gerçekleşir. Eğer manuel toplama yapılamıyorsa:
  - Sentetik generator kullan: TTS (open source Turkish TTS) ile transcript üret
  - noise injection (karakter değişimi %5-10)
  - Gold set'e H kategori olarak ekle

KABUL KRİTERİ:
  - En az 10 JSON fixture dosyası
  - Her birinin annotate edilmiş expected'i var
  - Runner (T-1.2.4.2.1) bu dosyaları tüketebilir

BAŞARI: Gerçek dünya gold set temeli atılır.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.4.2.1] Fixture Integration + CI

- **FR:** FR-011 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** T-1.2.4.1.1
- **Paralel?:** Hayır
- **Süre:** 4-5 saat
- **Dosya:** `app/src/lib/speech/__tests__/realWorld.test.ts` (YENİ)

##### AI PROMPT: T-1.2.4.2.1 — Real-World Test Runner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.4.2.1 — Real-world fixture runner + CI reporter
FR: FR-011 | NFR: NFR-QUAL-001

DOSYA: app/src/lib/speech/__tests__/realWorld.test.ts (YENİ)

AKIŞ:
  1. glob ile fixtures/real-transcripts/*.json yükle
  2. Her fixture için:
     a. KeywordMatcher oluştur, scene ile buildIndex
     b. Transcript array'ini replay et — her interim/final için match çalıştır
     c. expected array'indeki her tuple için doğrulama:
        atTimestamp sırasında focusedImageId === expected.imageId
  3. Precision/Recall/F1 metrikleri birleşik rapor

const EXPECTED_MIN_F1 = 0.80;  // gerçek dünya baseline

describe('real-world gold set', () => {
  const fixtures = loadFixtures();
  fixtures.forEach(f => {
    it(`fixture ${f.id}: ${f.title}`, () => {
      const result = runFixture(f);
      expect(result.matchedExpected).toBe(f.expected.length);
    });
  });

  it(`aggregate F1 ≥ ${EXPECTED_MIN_F1}`, () => {
    const agg = aggregateF1(fixtures);
    console.log('Real-world F1:', agg.f1);
    expect(agg.f1).toBeGreaterThanOrEqual(EXPECTED_MIN_F1);
  });
});

KABUL KRİTERİ:
  - Runner tüm 10+ fixture'ı işler
  - Aggregate F1 ≥ 0.80 (Sprint 2 sonunda)
  - CI raporu: her fixture için pass/fail + overall F1

KISITLAR:
  - Total runtime <30 sn (10 fixture × 3 sn)
  - Fail gracefully — bir fixture bozuksa diğerleri çalışsın

BAŞARI: Gerçek dünya metrikleri CI'da izleniyor, regresyon engelleniyor.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.2.5.1.1] Grid Search Kalibrasyon

- **FR:** FR-012 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** T-1.2.4.2.1 (gerçek gold set)
- **Paralel?:** Hayır (kalibrasyon sonuçları hard-code edilir)
- **Süre:** 4-5 saat
- **Dosya:** `app/src/lib/speech/__tests__/grid-search.test.ts` (YENİ)

##### AI PROMPT: T-1.2.5.1.1 — Ensemble Weight Grid Search

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.2.5.1.1 — Ensemble ağırlık grid search
FR: FR-012

HEDEF: similarity.ts'deki 4 ağırlığı (jw, trigram, confusable, length)
gold set üzerinde grid search ile optimize et. En iyi F1 veren kombinasyonu
similarity.ts'e hard-code et.

DOSYA: app/src/lib/speech/__tests__/grid-search.test.ts (YENİ)

AKIŞ:
  1. GOLD_SET + realWorldFixtures birleşimi (36+ case)
  2. Ağırlık grid'i:
     w1 ∈ [0.25, 0.30, 0.35, 0.40, 0.45, 0.50]
     w2 ∈ [0.20, 0.25, 0.30, 0.35, 0.40]
     w3 ∈ [0.10, 0.15, 0.20, 0.25, 0.30]
     w4 ∈ [0.05, 0.10, 0.15]
     constraint: w1+w2+w3+w4 = 1.0 (tolerance 0.01)
  3. Her kombinasyon için:
     - ensembleSimilarity'yi override et (module-level mutation yok, parameterize et)
     - Gold set'e karşı F1 hesapla
     - Log: (w1, w2, w3, w4) → F1
  4. En yüksek F1 → bastır
  5. Manuel: similarity.ts'teki ENSEMBLE_WEIGHTS objesini güncelle

NOT: similarity.ts'i parameterize etmek için:
  export function ensembleScoreWithWeights(a, b, weights): number

RUNTIME: 6*5*5*3 = 450 × 36 case × ~0.5 ms = ~8 sn. Vitest `--timeout 30000`.

KABUL KRİTERİ:
  - En iyi F1, mevcut (0.40/0.30/0.20/0.10) bazında en az +0.01
  - Yeni ağırlıklar similarity.ts'e commit edildi
  - gold set F1 arttı veya aynı kaldı (gerçek dünya F1 arttı)

KISITLAR:
  - Grid search >30 sn sürerse daraltma: sadece real-world fixtures
  - Reproducibility: seed random değil (deterministik)

BAŞARI: Ensemble empirik olarak optimize edildi.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### QUALITY GATE 2 — Sprint 2 Semantic Floor

- **Seviye:** INTEGRATION + REGRESSION
- ☐ `npx tsc --noEmit` → 0 hata
- ☐ Sentetik gold set (36 case) F1 ≥ 0.95
- ☐ Real-world gold set (10+ fixture) F1 ≥ 0.80
- ☐ Negative penalty C4/C5 case'lerinde çalışıyor
- ☐ BM25 + RRF regression yok
- ☐ TF-IDF weighting gözlemleniyor (log)
- ☐ Grid search ağırlıkları commit edildi
- ☐ Bundle size report: ana bundle +<15 KB
- ☐ `git commit` → rollback noktası

---

### SPRINT 3 — EMBEDDING RETRIEVAL

#### [T-1.3.1.1.1] Transformers.js Embedder Init

- **FR:** FR-006 | **NFR:** NFR-PERF-003, NFR-SIZE-001
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.3.3.1.1, T-1.3.4.1.1 ile)
- **Süre:** 6-8 saat
- **Dosya:** `app/src/lib/speech/embedder.ts` (YENİ)

##### AI PROMPT: T-1.3.1.1.1 — Transformers.js mE5 Encoder

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.1.1.1 — multilingual-e5-small via Transformers.js v3
FR: FR-006 | NFR: NFR-PERF-003, NFR-SIZE-001

HEDEF: Xenova/multilingual-e5-small modelini lazy-load + q4 quantize + WebGPU
ivmesi ile başlat. Embed fonksiyonu cosine için normalized vektör döndürür.

DEPS:
  npm install @xenova/transformers

DOSYA: app/src/lib/speech/embedder.ts (YENİ)

API:
  import { pipeline, env, type FeatureExtractionPipeline } from '@xenova/transformers';

  // CDN cache için (offline-first): env.allowRemoteModels = true
  env.useBrowserCache = true;

  let pipelineInstance: FeatureExtractionPipeline | null = null;
  let loadPromise: Promise<FeatureExtractionPipeline> | null = null;

  /**
   * Lazy initialization. First call triggers download (30-45 MB q4).
   * Subsequent calls reuse.
   */
  export async function ensureEmbedder(): Promise<FeatureExtractionPipeline> {
    if (pipelineInstance) return pipelineInstance;
    if (loadPromise) return loadPromise;

    loadPromise = pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
      dtype: 'q4',
      device: 'webgpu',  // fallback: 'wasm'
    });
    pipelineInstance = await loadPromise;
    return pipelineInstance;
  }

  /**
   * E5 modelinin convention'ı: query için 'query: ', passage için 'passage: ' prefix.
   */
  export async function embedQuery(text: string): Promise<Float32Array> {
    const pipe = await ensureEmbedder();
    const output = await pipe(`query: ${text}`, { pooling: 'mean', normalize: true });
    return output.data as Float32Array;
  }

  export async function embedPassage(text: string): Promise<Float32Array> {
    const pipe = await ensureEmbedder();
    const output = await pipe(`passage: ${text}`, { pooling: 'mean', normalize: true });
    return output.data as Float32Array;
  }

  export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;  // already normalized
  }

KABUL KRİTERİ:
  - İlk load <3 sn (WebGPU, q4)
  - embedQuery("merhaba") → Float32Array(384)
  - cosine(embed("araba"), embed("otomobil")) > 0.85 (semantic benzerlik)
  - Browser cache → ikinci yüklemede 0 network

KISITLAR:
  - Next.js SSR'da çalışmaz — 'use client' gerekebilir
  - Bundle etkisi: @xenova/transformers ~2 MB + model 45 MB (ayrı chunk)
  - WebGPU yoksa WASM'a düşer (otomatik)

TEST: app/src/lib/speech/__tests__/embedder.test.ts
  Vitest + jsdom/happy-dom ortamında çalışmayabilir — headless browser gerekli.
  Alternatif: node-ortam mock veya manuel test.

BAŞARI: Tarayıcıda mE5 ilk encode <100 ms (WebGPU) / <300 ms (WASM).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.3.1.2.1] Device Detection & WASM Fallback

- **FR:** FR-006 | **NFR:** NFR-COMPAT-001
- **Bağımlılık:** T-1.3.1.1.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat
- **Dosya:** `app/src/lib/speech/embedder.ts`

##### AI PROMPT: T-1.3.1.2.1 — Device Fallback Chain

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.1.2.1 — WebGPU → WASM graceful degradation
FR: FR-006 | NFR: NFR-COMPAT-001

HEDEF: WebGPU yoksa (Firefox stable, Safari TP) otomatik WASM'a düş.
Kullanıcıya görünmez.

DOSYA: app/src/lib/speech/embedder.ts

async function detectDevice(): Promise<'webgpu' | 'wasm'> {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) return 'webgpu';
    } catch {
      // ignore
    }
  }
  return 'wasm';
}

export async function ensureEmbedder() {
  if (pipelineInstance) return pipelineInstance;
  const device = await detectDevice();
  loadPromise = pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
    dtype: device === 'webgpu' ? 'q4' : 'q8',  // WASM'da q8 daha hızlı
    device,
  });
  pipelineInstance = await loadPromise;
  return pipelineInstance;
}

KABUL KRİTERİ:
  - Chrome/Edge (WebGPU) → q4 + webgpu
  - Firefox (no WebGPU) → q8 + wasm
  - Model download tek sefer, cache
  - İlk encode Chrome <150 ms, Firefox <400 ms

BAŞARI: Safari/Firefox kullanıcıları da embedding'den faydalanır.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.3.1.3.1] Cascaded Rerank

- **FR:** FR-006 | **NFR:** NFR-PERF-001
- **Bağımlılık:** T-1.3.1.2.1, T-1.3.2.1.1
- **Paralel?:** Hayır
- **Süre:** 4-6 saat
- **Dosya:** `app/src/lib/speech/keywordMatcher.ts`

##### AI PROMPT: T-1.3.1.3.1 — Embedding Cascaded Rerank

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.1.3.1 — Belirsizlik band'ında embedding rerank
FR: FR-006 | NFR: NFR-PERF-001

HEDEF: Ensemble sonucu [0.55, 0.78] aralığındaysa (belirsiz), mE5 embedding
rerank devreye girer. Dışarıdaki skorlar direkt kullanılır.

DOSYA: app/src/lib/speech/keywordMatcher.ts

DEĞİŞİKLİK:
  1. match() async olur (rerank için await gerekli)
  2. useKeywordMatch hook'u Promise handling yapar (effect içinde IIFE)
  3. Cascaded logic:
     if (topResult.score >= 0.78) return results;  // yeterli
     if (topResult.score < 0.55) return results;   // çok düşük, rerank bir şey değiştirmez
     // belirsiz band:
     const embeddingResults = await rerankWithEmbedding(results, spokenPhrase);
     return embeddingResults;

YARDIMCI: rerankWithEmbedding
  async function rerankWithEmbedding(
    candidates: MatchResult[],
    spokenPhrase: string,
  ): Promise<MatchResult[]> {
    const queryVec = await embedQuery(spokenPhrase);
    const scored = await Promise.all(candidates.map(async c => {
      const descVec = await getCachedEmbedding(c.imageIds[0]); // T-1.3.2.x
      if (!descVec) return c;
      const embSim = cosineSimilarity(queryVec, descVec);
      // Blend: 0.6 ensemble + 0.4 embedding
      return { ...c, score: 0.6 * c.score + 0.4 * embSim };
    }));
    return scored.sort((a, b) => b.score - a.score);
  }

KABUL KRİTERİ:
  GIVEN kullanıcı "otomobil" dedi ve keyword "araba" var
  WHEN ensemble skoru 0.60 (düşük, string eşleşmesi zayıf)
  AND embedding cosine "otomobil"↔"araba" ≈ 0.88
  THEN blend = 0.6*0.60 + 0.4*0.88 = 0.71 → threshold geçebilir

KISITLAR:
  - Embedding model henüz yüklenmemişse rerank atla (graceful)
  - Sadece belirsizlik band'ında → ortalama latency <30 ms korunur
  - Top 3 candidate'ı rerank, gerisi olduğu gibi

BAGLAM:
  - T-1.3.1.1.1 embedder API
  - T-1.3.2.1.1 embedding cache
  - Mevcut match() sync akışı

BAŞARI: Sinonim/parafraz vakalarında embedding kurtarma yapar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.3.2.1.1] IndexedDB Embedding Cache

- **FR:** FR-007 | **NFR:** NFR-PERF-001
- **Bağımlılık:** T-1.3.1.1.1
- **Paralel?:** Evet (T-1.3.1.2.1 ile)
- **Süre:** 4-5 saat
- **Dosya:** `app/src/lib/speech/embeddingCache.ts` (YENİ)

##### AI PROMPT: T-1.3.2.1.1 — Embedding Cache Storage

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.2.1.1 — IndexedDB ile embedding cache (idb-keyval)
FR: FR-007 | NFR: NFR-PERF-001

HEDEF: Bir kez encode edilen keyword description embedding'leri IndexedDB'ye
yazılır. Sunum tekrar açıldığında model yükleme dışında hesap yapılmaz.

DEPS:
  (idb-keyval zaten kullanılıyorsa, yoksa npm install idb-keyval)

DOSYA: app/src/lib/speech/embeddingCache.ts (YENİ)

API:
  import { get, set, del } from 'idb-keyval';

  const DB_PREFIX = 'deepslide-emb-v1:';

  /**
   * Cache key: imageId + text hash (text değişirse invalidate).
   */
  function keyFor(imageId: string, text: string): string {
    return `${DB_PREFIX}${imageId}:${hashString(text)}`;
  }

  function hashString(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  }

  export async function getCachedEmbedding(
    imageId: string,
    text: string,
  ): Promise<Float32Array | null> {
    const raw = await get<number[]>(keyFor(imageId, text));
    if (!raw) return null;
    return new Float32Array(raw);
  }

  export async function setCachedEmbedding(
    imageId: string,
    text: string,
    vec: Float32Array,
  ): Promise<void> {
    await set(keyFor(imageId, text), Array.from(vec));
  }

  export async function invalidateImage(imageId: string): Promise<void> {
    // idb-keyval doesn't expose prefix delete, iterate keys
    // Implementation: keys() fn + filter + del each
  }

KABUL KRİTERİ:
  - set + get round-trip doğru Float32Array döndürür
  - Aynı text için tekrar set → overwrite
  - Text değişirse yeni cache entry
  - getCachedEmbedding <5 ms

KISITLAR:
  - IndexedDB quota: 384 dim × 4 bytes × 100 keyword = 154 KB (ihmal edilebilir)
  - Graceful: fail sessizce null döndürür

BAŞARI: Sunum reload'da embedding tekrar hesaplanmıyor.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.3.2.2.1] Buildtime Precomputation

- **FR:** FR-007 | **NFR:** NFR-PERF-003
- **Bağımlılık:** T-1.3.2.1.1, T-1.3.1.3.1
- **Paralel?:** Hayır
- **Süre:** 3-5 saat
- **Dosya:** `app/src/hooks/useKeywordMatch.ts`

##### AI PROMPT: T-1.3.2.2.1 — Prefetch Embeddings on Presentation Load

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.2.2.1 — Sunum yüklendiğinde embedding prefetch
FR: FR-007 | NFR: NFR-PERF-003

HEDEF: useKeywordMatch'in buildIndex effect'inde, cache'te yoksa her keyword
description'ı embed edip cache'e yaz. Asenkron, background, blocking değil.

DOSYA: app/src/hooks/useKeywordMatch.ts

YENİ EFFECT (buildIndex'ten SONRA):
  useEffect(() => {
    if (!currentPresentation?.images) return;
    let cancelled = false;

    (async () => {
      for (const image of currentPresentation.images) {
        if (cancelled) return;
        for (const kw of image.keywords) {
          if (cancelled) return;
          const text = kw.text + (kw.synonyms?.join(' ') ?? '');
          const cached = await getCachedEmbedding(image.id, text);
          if (cached) continue;
          try {
            const vec = await embedPassage(text);
            await setCachedEmbedding(image.id, text, vec);
          } catch (err) {
            console.debug('[embed prefetch]', err);
            // graceful: model henüz yüklenmemişse atla
          }
        }
      }
    })();

    return () => { cancelled = true; };
  }, [currentPresentation?.images]);

KABUL KRİTERİ:
  - Sunum açıldığında prefetch background'da başlar
  - 50 keyword × ~50 ms = ~2.5 sn total (WebGPU)
  - Match sırasında rerank çağrısı → cache hit (sıfır latency)
  - Graceful: embedder init edilmemişse console.debug, hata fırlatma

KISITLAR:
  - UI block etmez (setTimeout veya requestIdleCallback)
  - Cancelled flag ile component unmount'ta durur
  - Cache miss durumunda rerank fallback: ensemble only

BAŞARI: İlk sunum açılışında ~3 sn background prefetch, sonraki match'lerde sıfır embedding latency.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.3.3.1.1] Partial Hypothesis Stability

- **FR:** FR-002 | **NFR:** NFR-PERF-001
- **Bağımlılık:** —
- **Paralel?:** Evet (T-1.3.1.1.1 ile)
- **Süre:** 3-4 saat
- **Dosya:** `app/src/hooks/useKeywordMatch.ts`

##### AI PROMPT: T-1.3.3.1.1 — Interim Stability Check

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.3.1.1 — Partial hypothesis stability (2-event check)
FR: FR-002 | NFR: NFR-PERF-001

HEDEF: WebSpeech interim'i her ~150 ms'de bir güncellenir, son token
değişebilir. "yolu" → "yolun" → "yolunda" gibi. Prefix early commit'i
daha stabil yapmak için: bir tail token'ı en az 2 ardışık interim event'te
aynı kalmalıdır.

DOSYA: app/src/hooks/useKeywordMatch.ts

YENİ REF:
  const interimHistoryRef = useRef<string[]>([]);  // son 3 interim snapshot

STABİL TAIL HESABI:
  useEffect(() => {
    if (!interimTranscript) return;

    // History'ye push (last 3)
    interimHistoryRef.current.push(interimTranscript);
    if (interimHistoryRef.current.length > 3) interimHistoryRef.current.shift();

    // En az 2 ardışık interim aynı tail token'a sahipse stabil kabul et
    const history = interimHistoryRef.current;
    if (history.length < 2) return;

    const lastTail = history[history.length - 1].trim().split(/\s+/).pop() ?? '';
    const prevTail = history[history.length - 2].trim().split(/\s+/).pop() ?? '';

    const isStable = lastTail === prevTail && lastTail.length >= 3;
    if (!isStable) return;

    // Stabil tail ile streaming prefix match
    const prefixMatch = matcherRef.current.matchStreamingPrefix(lastTail, threshold);
    if (prefixMatch) {
      orchestratorRef.current.focusImage(prefixMatch.imageIds[0], prefixMatch.score);
    }
  }, [interimTranscript]);

  // isFinal'da history reset
  useEffect(() => {
    if (!transcript) return;
    interimHistoryRef.current = [];
  }, [transcript]);

KABUL KRİTERİ:
  - Interim1 "yürü", Interim2 "yürü" → stable, trigger
  - Interim1 "yürü", Interim2 "yürüyüş" → değişti, bekle
  - Interim3 "yürüyüş", Interim4 "yürüyüş" → stable, trigger (full word artık exact match)

KISITLAR:
  - T-1.1.4.2.1 (streaming prefix) ile çakışmasın
  - History maksimum 3 entry (memory sınırı)
  - Final transcript event'inde history temizlenir

BAGLAM:
  - T-1.1.4.2.1 matcherRef.matchStreamingPrefix
  - Mevcut interim effect

BAŞARI: Noisy interim stream spekülatif trigger'ları tetiklemez.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.3.4.1.1] Rolling EMA Confidence Buffer

- **FR:** FR-009 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** —
- **Paralel?:** Evet
- **Süre:** 3-4 saat
- **Dosya:** `app/src/stores/speechStore.ts`

##### AI PROMPT: T-1.3.4.1.1 — Rolling Confidence EMA

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.4.1.1 — Son 20 sn rolling confidence EMA
FR: FR-009

HEDEF: Konuşmacının gürültülü/net olduğunu sürekli güncel tut.
Exponential Moving Average (α=0.1) ile pürüzsüz skor.

DOSYA: app/src/stores/speechStore.ts

YENİ STATE:
  rollingConfidence: number;  // EMA, 0.5 başlangıç

  updateRollingConfidence: (newValue: number) => void;

REDUCER:
  updateRollingConfidence: (newValue) => set((state) => ({
    rollingConfidence: state.rollingConfidence * 0.9 + newValue * 0.1,
  })),

setInterimTranscript / setTranscript İÇİNDE:
  // Confidence parametresi varsa updateRollingConfidence çağır
  if (confidence !== undefined && confidence > 0) {
    get().updateRollingConfidence(confidence);
  }

KABUL KRİTERİ:
  - 10 confidence örneği (0.9 × 10) → rollingConfidence → 0.5 → 0.54 → 0.58 → ... 0.85
  - Initial değer 0.5 (nötr)
  - Threshold ayarlaması T-1.3.4.2.1'de yapılır

KISITLAR:
  - EMA sadece ileri yönlü, tarihçe saklanmaz
  - Re-render etkisi: sadece rollingConfidence değiştiğinde kullanan component'ler

BAŞARI: Konuşmacı kalite sinyali mevcut.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.3.4.2.1] Speaker-Adaptive Dynamic Threshold

- **FR:** FR-009 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** T-1.3.4.1.1
- **Paralel?:** Hayır
- **Süre:** 2-3 saat
- **Dosya:** `app/src/hooks/useKeywordMatch.ts`

##### AI PROMPT: T-1.3.4.2.1 — EMA Threshold Shift

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.3.4.2.1 — Rolling EMA'dan threshold shift
FR: FR-009

DOSYA: app/src/hooks/useKeywordMatch.ts

DEĞİŞİKLİK:
  const { rollingConfidence, interimConfidence } = useSpeechStore();

  const effectiveThreshold = useMemo(() => {
    // Kullanıcı net konuşuyorsa threshold düşük (kolay tetik)
    // Gürültü/aksan varsa yüksek
    let t = threshold;
    if (rollingConfidence > 0.85) t = Math.max(0.6, t - 0.05);
    else if (rollingConfidence < 0.55) t = Math.min(0.85, t + 0.08);
    // Interim anlık low confidence → ek boost
    if (interimConfidence < 0.5) t += 0.05;
    return t;
  }, [rollingConfidence, interimConfidence, threshold]);

  // match çağrısında effectiveThreshold kullan

KABUL KRİTERİ:
  - rollingConfidence = 0.90 → effective 0.65 (agresif)
  - rollingConfidence = 0.45 → effective 0.78 (korumacı)
  - interim dip → ek +0.05

KISITLAR:
  - Threshold clamp [0.55, 0.95]
  - Mevcut dedup logic'i etkilemez

BAŞARI: Gerçek dünyada farklı speaker'lara adaptasyon.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### QUALITY GATE 3 — Sprint 3 Semantic Rerank Stability

- **Seviye:** INTEGRATION + REGRESSION
- ☐ Sentetik gold set F1 ≥ 0.95
- ☐ Real-world gold set F1 ≥ 0.88 (sinonim testleriyle sıçrama)
- ☐ Embedding model WebGPU'da <150 ms ilk encode
- ☐ Cache hit rate ≥ %95 (ikinci sunum açılışından sonra)
- ☐ WASM fallback Firefox'ta çalışıyor
- ☐ Streaming prefix + partial hypothesis çakışması yok
- ☐ Speaker-adaptive threshold gözlenebilir (debug log)
- ☐ Bundle: ana bundle artışı ≤15 KB, embedding chunk ayrı (45 MB lazy)
- ☐ `git commit`

---

### SPRINT 4 — REAL-WORLD VALIDATION

#### [T-1.4.1.1.1] Grid Search v2 — 5-Weight Optimize

- **FR:** FR-012 | **NFR:** NFR-QUAL-001
- **Bağımlılık:** Sprint 3 tamamlandı
- **Paralel?:** Hayır
- **Süre:** 4-5 saat
- **Dosya:** `app/src/lib/speech/__tests__/grid-search.test.ts`

##### AI PROMPT: T-1.4.1.1.1 — Re-Calibration with Embedding

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.4.1.1.1 — Embedding dahil 5. ağırlıkla grid search
FR: FR-012

HEDEF: Şimdi ensemble'a embedding de dahil. 5 ağırlık optimize:
  w_jw, w_trigram, w_confusable, w_length, w_embedding

NOT: Cascaded rerank yapısında embedding final blend (0.6 ensemble + 0.4 embedding)
olarak uygulanıyor, ama bu blend oranını da grid search'e dahil et.

DOSYA: grid-search.test.ts genişlet

YENİ GRID:
  blend ∈ [0.2, 0.3, 0.4, 0.5, 0.6]
  diğer 4 ağırlık aynı (6×5×5×3 = 450) × 5 blend = 2250 kombinasyon
  × 50 case × ~1 ms = 112 sn. Vitest timeout yükselt.

KABUL:
  - Real-world F1 en az +0.02 (0.88 → 0.90)
  - Yeni ağırlık similarity.ts + keywordMatcher.ts'e commit
  - Sentetik gold set F1 ≥ 0.95 korundu

BAŞARI: Production'a hazır ağırlıklar.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.4.2.1.1] Manual E2E — 3 Gerçek Sunum

- **FR:** FR-013 | **NFR:** Tüm NFR
- **Bağımlılık:** T-1.4.1.1.1
- **Paralel?:** Hayır
- **Süre:** 4-6 saat (manuel)

##### AI PROMPT: T-1.4.2.1.1 — Manual Real-World Test

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.4.2.1.1 — Manuel 3 sunum E2E test
FR: FR-013

ADIM:
  1. 3 farklı sunum hazırla (teknoloji, doğa, ürün)
  2. Her biri için 5 dk konuşma planı yaz
  3. npm run dev + mikrofon + present mode
  4. Konuş → her görsel zoom gerçekleşmeli (expected)
  5. Aynı keyword tekrarlama → stabil focus
  6. 3 sn sessizlik → overview
  7. Hızlı keyword değişimi (smooth geçiş, flicker yok)
  8. Chrome DevTools performance trace kaydet

METRİKLER:
  - TP, FP, FN per sunum
  - Flicker count
  - Ortalama latency (ms, match + render)

KABUL:
  - 3/3 sunumda F1 ≥ 0.85
  - Flicker count = 0
  - Latency <50 ms p95

BAŞARI: Gerçek kullanıcı senaryosunda production kalitesi.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.4.3.1.1] Performance Profiling

- **FR:** — | **NFR:** NFR-PERF-001
- **Bağımlılık:** T-1.4.2.1.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat

##### AI PROMPT: T-1.4.3.1.1 — Vitest Bench + Chrome Profile

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.4.3.1.1 — Performans profili + bench report
FR: —

VITEST BENCH:
  app/src/lib/speech/__tests__/keywordMatcher.bench.ts (YENİ)
  - buildIndex: 50 kw × 100 iter, p50/p95/p99
  - match (simple): 100 iter
  - match (complex n-gram): 100 iter
  - matchStreamingPrefix: 100 iter
  - embedding rerank (cache hit): 100 iter
  - embedding rerank (cache miss): 10 iter

CHROME DEVTOOLS:
  - Present mode açık, 30 sn konuşma
  - Performance tab kayıt → JSON export
  - Flame chart analizi: en pahalı fonksiyon

KABUL:
  - buildIndex p95 <10 ms
  - match p95 <15 ms (cache hit)
  - match p95 <150 ms (cache miss cascaded)
  - Ortalama runtime <30 ms (NFR-PERF-001)

ÇIKTI: WBS_KEYWORD_MATCHING_V2.md'ye bench result tablosu eklenir.

BAŞARI: Tüm performans NFR'leri karşılandı.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### [T-1.4.4.1.1] Production Deploy + Telemetry

- **FR:** FR-013 | **NFR:** Tüm
- **Bağımlılık:** T-1.4.3.1.1
- **Paralel?:** Hayır
- **Süre:** 3-4 saat

##### AI PROMPT: T-1.4.4.1.1 — Deploy + Telemetry Setup

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GÖREV: T-1.4.4.1.1 — Production deploy + user telemetry
FR: FR-013

ADIM:
  1. Final commit + push → Vercel auto-deploy
  2. deepslide.1takimstartuplar.com hard refresh, manuel smoke test
  3. Minimal telemetry: localStorage'a anonim sayım
     - match count
     - streaming prefix trigger count
     - embedding rerank count
     - flicker count (orchestrator)
  4. 7 gün boyunca günlük istatistik kaydı

DOSYA: app/src/lib/telemetry/matchStats.ts (YENİ — opsiyonel)
  Zero-PII, sadece counter'lar

KABUL:
  - Deploy başarılı
  - Production'da ilk 10 keyword match kontrol edildi (dev tools console)
  - Telemetry kaydı çalışıyor

BAŞARI: DeepSlide v2 keyword matching canlıda.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### QUALITY GATE 4 — Faz Sonu E2E

- **Seviye:** E2E + REGRESSION + FAZ SONU
- ☐ 3 gerçek sunumda F1 ≥ 0.90
- ☐ Sentetik gold set F1 ≥ 0.95 (regression)
- ☐ Real-world fixture F1 ≥ 0.90
- ☐ Latency p95 match <50 ms
- ☐ Zero zoom flicker (manual confirmed)
- ☐ Bundle report: main +<15 KB, embedding chunk lazy 45 MB
- ☐ Cross-browser: Chrome + Firefox + Safari smoke test
- ☐ Tüm önceki QG'ler regression olarak geçer
- ☐ Production deploy + telemetry 7 gün sonra rapor
- ☐ `git tag v2-keyword-matching` + release notes

---

## BAĞIMSIZLIK HARİTASI

```
SPRINT 1:
  [T-1.1.1.1.1] ← — (debug logger, bağımsız)
       ↓
  [T-1.1.2.1.1] hysteresis ← T-1.1.1.1.1
       ↓
  [T-1.1.3.1.1] cooldown ← T-1.1.2.1.1
       ↓
  [T-1.1.3.2.1] slide locality ← T-1.1.3.1.1
       ↓
  [T-1.1.1.2.1] fix verify ← T-1.1.2.1.1 + T-1.1.3.1.1

  [T-1.1.4.1.1] trie build ← — (bağımsız, PARALEL A)
       ↓
  [T-1.1.4.2.1] matcher integ ← T-1.1.4.1.1
       ↓
  [T-1.1.4.3.1] gold set J ← T-1.1.4.2.1

PARALEL GRUP A (Sprint 1):
  {T-1.1.1.1.1, T-1.1.4.1.1} — aynı anda başlayabilir

PARALEL GRUP B (Sprint 2):
  {T-1.2.1.1.1 negatives, T-1.2.2.1.1 BM25, T-1.2.3.1.1 TF-IDF, T-1.2.4.1.1 data collect}
  — 4 görev tamamen bağımsız, paralel

PARALEL GRUP C (Sprint 3):
  {T-1.3.1.1.1 embedder, T-1.3.3.1.1 partial hyp, T-1.3.4.1.1 rolling EMA}
  — 3 görev bağımsız
```

---

## CONTEXT YÖNETİMİ

### /clear Noktaları

```
/clear KULLAN:
  ✅ Her QG'den sonra (QG1, QG2, QG3, QG4)
  ✅ Faz geçişlerinde (Sprint 1 → 2 → 3 → 4)
  ✅ Embedding model yüklemesi debug session'ı bittikten sonra
  ✅ Aynı dosyada 3'ten fazla refactor oldu
  ✅ Bağlam farkı: lib/speech/* → lib/ai/* → hooks/* geçişi
```

### Subagent Kullanımı

```
SUBAGENT KULLAN:
  ✅ PARALEL GRUP A/B/C çalışmalarında — her görev ayrı subagent
  ✅ Gerçek dünya transcript toplama (T-1.2.4.1.1) — veri odaklı, büyük bağlam
  ✅ Grid search runtime'ları (T-1.2.5.1.1, T-1.4.1.1.1) — uzun süreli
  ✅ Research görevleri (daha fazla literatür araştırması gerekirse)
```

### Aynı Oturumda Kalma

```
AYNI OTURUMDA KALI:
  ✅ T-1.1.2.1.1 → T-1.1.3.1.1 → T-1.1.3.2.1 (aynı flicker chain)
  ✅ T-1.2.1.1.1 → T-1.2.1.2.1 → T-1.2.1.3.1 (negative pipeline)
  ✅ T-1.3.1.1.1 → T-1.3.1.2.1 → T-1.3.1.3.1 (embedder chain)
```

---

## CLAUDE.md GÜNCELLEMESİ (eklenir, mevcut ezilmeden)

Mevcut `/Users/emrepirinc/Documents/DeepSlide/app/CLAUDE.md`'nin sonuna:

```markdown
## Keyword Matching v2 WBS Durumu

```
Aktif Görev: [ilk: T-1.1.1.1.1 veya T-1.1.4.1.1 — paralel başlangıç]
Tamamlanan Son QG: (v1) — Sprint 1 başlangıç
Sonraki QG: QG-1 (Sprint 1 regression + flicker bar)

SPRINT 1 — Quick Wins + Flicker Fix (8 task)
  ☐ T-1.1.1.1.1 Debug logger
  ☐ T-1.1.1.2.1 Fix verify
  ☐ T-1.1.2.1.1 Hysteresis
  ☐ T-1.1.3.1.1 Cooldown
  ☐ T-1.1.3.2.1 Slide locality
  ☐ T-1.1.4.1.1 Trie build
  ☐ T-1.1.4.2.1 Matcher integ
  ☐ T-1.1.4.3.1 Gold set J

SPRINT 2 — Semantic Floor (8 task)
SPRINT 3 — Embedding Rerank (8 task)
SPRINT 4 — Validation + Deploy (4 task)

TOPLAM: 28 atomik görev
```

> Kaynak: `WBS_KEYWORD_MATCHING_V2.md`, Research: `RESEARCH_KEYWORD_MATCHING.md`
```

---

## CIKTI ÖZETİ

```
WBS ÖZETİ
=========
Toplam atomik görev: 28
Paralel çalışabilecek görev: 11
  Grup A (Sprint 1): T-1.1.1.1.1 + T-1.1.4.1.1
  Grup B (Sprint 2): T-1.2.1.1.1 + T-1.2.2.1.1 + T-1.2.3.1.1 + T-1.2.4.1.1
  Grup C (Sprint 3): T-1.3.1.1.1 + T-1.3.3.1.1 + T-1.3.4.1.1 + T-1.3.2.1.1

Sıralı görev: 17
Quality Gate: 4 adet (QG1, QG2, QG3, QG4)
Context temizleme noktası: 4 (her QG sonrası) + 4 ara (sprint içi dosya değişimi)
AI Prompt Template: 28 (her atomik görev için)

FAZ BAZLI UYGULAMA SIRASI:
  Sprint 1 — Quick Wins & Flicker (8 görev, ~35 saat)
    İlk paralel grup: [T-1.1.1.1.1, T-1.1.4.1.1]
  Sprint 2 — Semantic Floor (8 görev, ~32 saat)
    İlk paralel grup: [T-1.2.1.1.1, T-1.2.2.1.1, T-1.2.3.1.1, T-1.2.4.1.1]
  Sprint 3 — Embedding Retrieval (8 görev, ~35 saat)
    İlk paralel grup: [T-1.3.1.1.1, T-1.3.3.1.1, T-1.3.4.1.1, T-1.3.2.1.1]
  Sprint 4 — Validation & Deploy (4 görev, ~15 saat)

TOPLAM TAHMİNİ: ~117 saat (ideal), gerçekçi ~150 saat (debug + iteration)

Ana bundle artışı hedefi: ≤15 KB (main.js)
Lazy chunk: ~45 MB (mE5 embedding model, sadece present mode'da yüklenir)

Başlangıç noktası: T-1.1.1.1.1 (debug logger — flicker kök nedenini gör) veya
paralel olarak T-1.1.4.1.1 (trie yapısı — flicker'dan bağımsız ilerleyebilir).
```

---

## KAYNAKLAR

- **SPEC:** `RESEARCH_KEYWORD_MATCHING.md` (bu dosyayla aynı dizinde)
- **Mevcut kod:** `app/src/lib/speech/` (baseline f2ae3dd)
- **Gold set:** `app/src/lib/speech/__tests__/goldset.ts`
- **Testler:** `app/src/lib/speech/__tests__/keywordMatcher.test.ts`
- **Bağımlı paketler (eklenecek):** `minisearch` (~10 KB), `@xenova/transformers` (~2 MB), `idb-keyval` (varsa zaten)
- **Model:** `Xenova/multilingual-e5-small` (q4 ~45 MB lazy chunk)
