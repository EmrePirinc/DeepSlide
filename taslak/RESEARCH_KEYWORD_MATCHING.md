# DeepSlide — Türkçe Konuşma→Keyword Eşleştirme Derinlemesine Araştırma

> Üretim tarihi: 2026-04-12
> Kaynak: 3 paralel derin araştırma + kullanıcı fikirleri
> Hedef: Sentetik gold set F1 = 1.00'dan gerçek dünya F1 = ~0.94+ bandına çıkarmak,
> <30 ms ortalama latency bütçesinde kalmak, browser-only çalışmak, Türkçe'yi birinci öncelik tutmak.

---

## 0. Mevcut Durum (Baseline)

Son commit (f2ae3dd): Tam ensemble + benzersiz-parça partial trigger.

**Pipeline:**
```
WebSpeech interim transcript
  → normalizePhrase (lowercase + asciify + whitespace)
  → Snowball Turkish stem
  → N-gram (1-3 kelime)
  → Index lookup:
      1. normalized exact
      2. stemmed exact
      3. partial trigger exact (benzersiz parça)
      4. ensemble fuzzy fallback
         = 0.40·JW + 0.30·trigramCosine + 0.20·confusableDamerau + 0.10·(1-lenPen)
  → Dinamik threshold (keyword uzunluğu + confusability)
  → Multi-word min-aware scoring (0.6·min + 0.4·avg, floor 0.60)
  → orchestrator.focusImage()
```

**Gold set:** 30/30 vaka geçiyor, F1 = 1.000. Ama sentetik — gerçek dünyada ~0.85-0.88 tahmin ediliyor (ASR noise, aksan, speaker adaptasyon eksik).

**Bilinen çatlaklar:**
1. **Zoom flicker** — decay interval'da skor düşüp tekrar fırlayınca focus null ↔ id oynaması (geçici gözlem raporlandı).
2. **Streaming early-commit yok** — kullanıcı kelimeyi bitirmeden tetiklenemiyor, her zaman tam kelime/cümle beklenmeli.
3. **Semantic sinonim zayıf** — "otomobil" → "araba" gibi string benzerliği sıfır ama anlam aynı durumları yakalayamıyor.
4. **Sahne bağlamı yok** — aktif slayt, son tetiklenen keyword, sunum akışı gibi prior sinyalleri kullanılmıyor.

---

## 1. Araştırma Bulgularının Konsolide Özeti

### 1.1 Streaming & Prefix Early-Commit (Ajan 1)

**Temel teorik dayanak:** Kullanıcının fikri ("ilk 3 harf eşleşiyorsa ve başka hiçbir keyword'de yoksa, kelime bitmeden tetikle") iki köklü literatür hattının kesişimi:

- **CTC Prefix Beam Search with Early Termination** (Hannun 2014 → streaming varyantları 2023)
- **Trie + Unique-Prefix Routing** (klasik veri yapısı)

**Önerilen teknikler:**

| # | Teknik | Kaynak | Zorluk | ΔF1 | Bundle | Latency |
|---|--------|--------|--------|-----|--------|---------|
| 1 | **Trie + Unique-Prefix Early Commit** — her node'a "unique-descendant count", count==1 olan en sığ node → erken tetik | Aho & Corasick 1975 + klasik trie | Kolay | +6-9% recall | ~2 KB | <1 ms |
| 2 | **Partial Hypothesis Stability** — WebSpeech interim'de aynı token 2 ardışık event'te kalırsa erken commit | Google Shangguan 2021-23, Interspeech | Kolay | +4% recall, -1% FP | ~0.5 KB | ~0 ms |
| 3 | **Context-Aware Prior** — aktif slayttaki keyword'lere log-prior +0.3, log-space füzyon | Google USM 2023, Meta SeamlessM4T 2023 | Orta | +5% precision | ~1 KB | <1 ms |
| 4 | **Aho-Corasick Streaming** — mevcut ensemble'ı karakter-bazlı stream moduna çevir | Aho-Corasick klasik, `aho-corasick` npm | Orta | +3% recall | ~4 KB | ~1 ms |
| 5 | **Speaker-Adaptive Threshold** — son 20 sn rolling confidence ortalaması ile dinamik eşik kaydır | Rose & Paul 1990, 2024 nöral varyantlar | Orta | +2-3% F1 | ~1 KB | ~0 ms |

**Toplam tahmini kazanç:** +15-20% F1, ~8 KB bundle, negligible latency.

**Ek gözlem:** Snowball Turkish stemmer + prefix trie kombinasyonu, morfolojik eklerin prefix match'i bozmasını engeller (yolu→yol, yolunda→yol hepsi aynı prefix dalında toplanır).

---

### 1.2 Image Generation/Edit Algoritmalarından Transfer (Ajan 2)

**Temel ilham:** Diffusion modellerinin cross-attention map'leri text token'larını image region'larına align ediyor. Bu "token→region alignment" paradigması, DeepSlide'ın "spoken-word→image slot alignment" problemine birebir transfer edilebilir.

**Somut transferler:**

| # | Kaynak teknik | DeepSlide transferi | Maliyet | Katkı |
|---|---------------|---------------------|---------|-------|
| 1 | **HyDE** (Gao 2022) — LLM'den hipotez doküman üret, embed et, retrieval yap | Gemini zaten her keyword için description üretiyor — onu `multilingual-e5-small` ile embed edip cache'le. Runtime: spoken phrase × description embeddings = cosine retrieval. **String eşleşmeyen sinonimi/parafrazı yakalar.** | Orta (Transformers.js + 45 MB lazy model) | **Çok yüksek** (+%25-40 sinonim recall) |
| 2 | **Negative Prompts / SEGA** (Brack 2023) | Her keyword için "karıştırılabilecek kelimeler" listesi (Gemini'den veya Damerau offline). Skor: `final = ensemble - λ·max(negative_match)`. **"sis"/"siz" tipi FP'leri keser.** | Kolay (Gemini prompt + yeni alan) | **Yüksek** (-%30-50 FP) |
| 3 | **Prompt-to-Prompt** (Hertz 2022) — cross-attention map | Cümle içindeki her token için N görsel üzerinden attention matrisi. Softmax normalize, toplam skor en yüksek görsele zoom. **Aynı cümlede birden fazla keyword çakışırsa doğru ayrımı sağlar.** | Kolay (saf JS) | Orta-yüksek |
| 4 | **Attend-and-Excite** (Chefer 2023) + **Compel weighting** | TF-IDF / nadir keyword'lere boost, jenerik token'lara ("şey", "bir", "olan") zayıflat. **Confusability-aware prompt weighting.** | Kolay | Orta (+%10-15 precision) |
| 5 | **FreeControl** (Mo 2024) — sunum akışı priors | Slide sırasına göre exponential decay prior: mevcut + 2 komşu slide boost. Son 5 sn'de tetiklenen keyword penalize (**flicker çözümü**). | Kolay | Orta-yüksek (-%40 yanlış-slide atlama, flicker bastırma) |
| 6 | **GroundingDINO** (Liu 2023) auto-tagging | Server-side upload sonrası her görseli OWL-ViT/GroundingDINO ile Türkçe tagla → keyword havuzunu genişlet. | Orta (server-side) | Çok yüksek recall (+%30) |
| 7 | **GLIGEN** (Li 2023) — slot-aware routing | Slayt üzerinde birden çok görsel varsa her biri ayrı "slot"; çoklu zoom/highlight. | Orta (UI değişikliği) | Orta |

---

### 1.3 Browser-First Embedding Retrieval Stack (Ajan 3)

**Temel tespit:** Mevcut ensemble (asciify+stem+JW+trigram+Damerau) **string seviyesinde doymuş**. Bir sonraki atlama **semantik seviyede (embedding retrieval)** olmalı.

**Karar matrisi — Türkçe MTEB snapshot (2025):**

| Model | MTEB-mult avg | Boyut (int8) | Türkçe kalite | Browser fit |
|-------|---------------|--------------|----------------|--------------|
| **multilingual-e5-small** | 64.4 | 120 MB (q4: **45 MB**) | İyi | ✅ Transformers.js resmi port |
| gte-multilingual-base | **66.7** | 300 MB | Çok iyi | ⚠️ Büyük |
| paraphrase-multilingual-MiniLM-L12-v2 | 51.7 | 110 MB | Orta | ✅ En yaygın |
| BGE-M3 | — | 580 MB | Çok iyi | ❌ Aşırı büyük |
| LaBSE | — | 470 MB | İyi | ❌ Eski + büyük |
| Nomic Embed v1.5 | — | 140 MB | Zayıf | ❌ TR yok |
| FastText-tr (300d → PCA 128d) | — | ~12 MB | Orta | ✅ Quick win |

**Kazanan:** `multilingual-e5-small` (int4 quantized, lazy-load, WebGPU ivmesiyle).

**Transformers.js v3 (2024 Q4):**
- WebGPU resmi destek, WASM backend.
- int4 (`dtype: 'q4'`) quantization eklendi — kalite kaybı ~%1-2, boyut %35-40 azalır.
- `@xenova/transformers` → **`Xenova/multilingual-e5-small`** port hazır.
- WebGPU encode latency: 5 cümle × 50 token ≈ **60-90 ms** (WASM: 180-280 ms).

**Hybrid BM25 + Dense (RRF):**
- **MiniSearch** (v7, ~10 KB) — `processTerm` hook ile Snowball-tr pluggable
- **wink-bm25-text-search** (~40 KB) — daha detaylı tokenizer kontrolü
- **RRF:** `score = Σ 1/(k+rank_i)`, k=60, 10 satır kod

**4 katmanlı öneri stack:**

| Katman | Teknoloji | Bundle | Latency | ΔF1 | Zaman |
|--------|-----------|--------|---------|-----|-------|
| L1 (mevcut) | ensemble (asciify+stem+JW+trigram+Damerau) | 0 | 5 ms | baseline 0.85 | ✅ hazır |
| **L2 quick** | MiniSearch + RRF fusion | +10 KB | +2 ms | +0.02 | 1 gün |
| **L3 quick** | SIF + FastText-tr (PCA 128) | +12 MB | +3 ms | +0.03 | 1 gün |
| **L4 medium** | mE5-small (q4, WebGPU, cascaded fallback) | +45 MB lazy | +70 ms (sadece belirsiz band) | +0.05 | 1 hafta |
| **L5 big bet** | BERTurk-SBERT custom fine-tune + ONNX | +50 MB | +80 ms | +0.02 | 1 ay |

**Hedef:** L1+L2+L3 = F1 ≈ **0.90**. L4 eklendiğinde **0.94**. Cascaded sayesinde ortalama latency <30 ms (sadece eşik altı belirsiz vakalar mE5'e gider).

**YAPMAYIN:** BGE-M3 / LaBSE / GTE-base (boyut), HNSW (overkill — 30-50 keyword brute force = <1 ms), HyDE runtime LLM (offline yap), Nomic Embed (Türkçe zayıf).

---

## 2. Entegre Mimari Vizyon (Tüm Araştırmaların Sentezi)

Üç ajanın bulgularını birleştirirsem DeepSlide'ın ideal v2 pipeline'ı:

```
                     ┌────────────────────────┐
                     │ Sunum yüklendi         │
                     │ — keyword'ler + images │
                     └────────────┬───────────┘
                                  │ (offline, sunum başlangıcı)
                                  ▼
          ┌──────────────────────────────────────────────┐
          │ BUILDINDEX-PLUS                              │
          │ 1. normalize + stem (mevcut)                 │
          │ 2. unique-stem partial trigger (mevcut)      │
          │ 3. Trie + unique-prefix early-commit noktası │
          │ 4. keyword confusability/negative list (Gemini)│
          │ 5. keyword description → embedding cache     │
          │    (lazy: sahne 1 opened → prefetch)         │
          │ 6. TF-IDF keyword weights (nadir=yüksek)     │
          └────────────────┬─────────────────────────────┘
                           │
                           ▼
              ┌───────────────────────────┐
              │ Canlı konuşma              │
              │ WebSpeech interim          │
              └──────────┬────────────────┘
                         │ her interim event
                         ▼
  ┌────────────────────────────────────────────────────────┐
  │ STREAMING MATCHER                                      │
  │                                                        │
  │ A. Partial hypothesis stability                        │
  │    (aynı token 2 interim geldiyse kabul et)            │
  │                                                        │
  │ B. Trie prefix early-commit                            │
  │    (ilk K harf + unique descendant → tetikle)          │
  │                                                        │
  │ C. Ensemble fuzzy (L1, mevcut)                         │
  │    total ∈ [0.7, ?]                                    │
  │                                                        │
  │ D. CASCADED RERANK                                     │
  │    total < 0.75 ise mE5 embedding cosine ile rerank    │
  │    (sadece belirsiz band)                              │
  │                                                        │
  │ E. Negative keyword penalty                            │
  │    final -= λ·max(neg_match)                           │
  │                                                        │
  │ F. Context-aware prior                                 │
  │    + mevcut slayt bonusu                               │
  │    + son 5 sn tetiklenen keyword cooldown (flicker)    │
  │    + sunum akışı exponential decay                     │
  │                                                        │
  │ G. Speaker-adaptive threshold                          │
  │    son 20 sn rolling confidence'a göre kaydır          │
  └────────────────────────┬───────────────────────────────┘
                           │
                           ▼
              ┌───────────────────────────┐
              │ orchestrator.focusImage() │
              │ + flicker mitigation      │
              └───────────────────────────┘
```

---

## 3. Fonksiyonel Gereksinim Listesi (FR)

Bu bölüm /wbs skill'inin girdisi olacak. Her FR bir WBS atomik görevine dönüşecek.

### FR-001: Trie + Unique-Prefix Early Commit
**Açıklama:** Sistem, sunum başlangıcında tüm keyword'lerden (normalized + stemmed) bir trie kurmalı ve her iç node için "unique-descendant count"u hesaplamalı. Match sırasında interim transcript'in aktif kelimesinin karakter prefix'i, unique-descendant count'u 1 olan bir node'a ulaşırsa (yani o prefix sadece bir keyword'ü benzersiz olarak tanımlıyorsa) kelime bitmeden tetikle.

**Kabul kriteri:**
- GİVEN sahnede sadece "yürüyüş yolu" keyword'ü "yür" prefix'iyle başlıyor
- WHEN kullanıcı "yürüyüş" derken daha "yürü" çıktısı interim'de göründü
- THEN `focusImage('img-path', 0.85)` çağrılıyor, tam kelimenin bitmesi beklenmiyor
- AND aynı sahnede "yurt" keyword'ü varsa prefix "yur" unique değildir → tetikleme yok

**Bağımlılıklar:** Hiçbir (lib/speech/trie.ts yeni dosya)
**Dosyalar:**
- `lib/speech/trie.ts` (YENİ)
- `lib/speech/keywordMatcher.ts` (refactor — buildIndex ve match)
- `lib/speech/__tests__/goldset.ts` (J kategori — prefix early-commit vakaları)

**Tahmini:** 4-6 saat. Kolay, self-contained.

---

### FR-002: Partial Hypothesis Stability
**Açıklama:** useKeywordMatch, WebSpeech interim event'lerinde aynı tail-token dizisinin 2 ardışık event'te stabil kaldığını görürse o token'ı "commit edilmiş" kabul eder ve match'i tetikler. Tek-event'lik tokenları spekülatif kabul eder.

**Kabul kriteri:**
- GİVEN ilk interim "yürü" geldi
- WHEN ikinci interim "yürüyüş" ile geldi ve ilk interim'e eklenmişse
- THEN ikinci interim'in "yürüyüş" kısmı stable kabul edilir, match çalışır
- AND 200 ms içinde 3. interim "yürüyüşe" ile değişirse önceki stable token downgrade olur

**Dosyalar:**
- `hooks/useKeywordMatch.ts` (interimRef ekle — son 2 interim dizisini tut)
- `lib/speech/__tests__/keywordMatcher.test.ts` (mock interim stream testi)

**Tahmini:** 3-5 saat.

---

### FR-003: Context-Aware Prior (Flicker Fix + Slide Locality)
**Açıklama:** orchestrator.focusImage çağrısında sistem, aktif slayta, son 5 sn tetiklenen keyword'lere ve sunum akışına göre log-space prior uygular. Flicker'ı bastırmak için son 3 sn içinde tetiklenen keyword'lerin skoru geçici olarak boost edilmeli (aynı keyword yeniden kolay tetiklensin ama başkaları zor devralsın).

**Kabul kriteri:**
- GİVEN img-A son 2 sn'de aktif focus'ta
- WHEN yeni bir match skoru img-B için 0.75 gelirse
- THEN img-B'nin skoru 0.90'dan az ise focus değişmez
- AND 5 sn sessizlikten sonra decay ile A pasifleşebilir

**Dosyalar:**
- `lib/animation/orchestrator.ts` (refactor — focus change inertia)
- `hooks/useKeywordMatch.ts` (prior hesaplama)

**Tahmini:** 4-6 saat. Flicker bug'ının kökü burada.

---

### FR-004: Negative Keyword List (Confusability Explicit)
**Açıklama:** Her keyword için Gemini analiz aşamasında "karıştırılabilecek Türkçe kelimeler" listesi (5 öğeye kadar) üretilmeli. Match sırasında spoken phrase bu listeyle eşleşirse skor penalize edilir (`final = ensemble - 0.4·max(neg)`).

**Kabul kriteri:**
- GİVEN "sis" keyword'ü için negatives = ["siz", "his", "sus"]
- WHEN kullanıcı "siz de gelin" derse
- THEN "siz" negatives listesine %100 eşleşiyor → final_score = 0 → tetiklenme yok

**Dosyalar:**
- `lib/ai/prompts.ts` (Gemini prompt'u "negatives" alanı iste)
- `lib/ai/parser.ts` (parse)
- `types/presentation.ts` (Keyword.negatives: string[])
- `lib/speech/keywordMatcher.ts` (match içinde negatif penaltı)

**Tahmini:** 3-4 saat.

---

### FR-005: MiniSearch + RRF Fusion (Quick Win)
**Açıklama:** Mevcut ensemble'a paralel olarak MiniSearch BM25 sonucu çalıştırılır. İki sonuç Reciprocal Rank Fusion ile birleştirilir: `score = 1/(60+rank_ensemble) + 1/(60+rank_bm25)`. Türkçe için MiniSearch `processTerm` hook'u Snowball-tr stemmer'ı kullanacak.

**Kabul kriteri:**
- GİVEN sahne 5 keyword var
- WHEN interim transcript tek kelime geldi
- THEN hem ensemble hem MiniSearch sonuçları hesaplanır ve RRF ile birleştirilir
- AND nihai sıralama en az bir sinyalden gelen recall artışını yansıtır

**Dosyalar:**
- `lib/speech/bm25.ts` (YENİ — MiniSearch wrapper)
- `lib/speech/keywordMatcher.ts` (rrfFusion helper)

**Bundle:** +10 KB (MiniSearch)
**Tahmini:** 3-5 saat.

---

### FR-006: Multilingual-e5-small Embedding Cascaded Rerank
**Açıklama:** Transformers.js v3 + `Xenova/multilingual-e5-small` modeli, `dtype: 'q4'`, `device: 'webgpu'` (fallback 'wasm'). Lazy-load: sunum ilk kez present moduna girince prefetch. Cascaded: ensemble skoru belirsiz band'daysa (`[0.55, 0.80]`) embedding rerank devreye girer.

**Kabul kriteri:**
- GİVEN sunum present mode'a açıldı
- WHEN kullanıcı mikrofonu başlattı
- THEN arka planda mE5 modeli prefetch edilir (45 MB, lazy chunk)
- AND ilk match ensemble skoru 0.65 çıkarsa mE5 rerank çalışır
- AND mE5 rerank skoru 0.85 ise final = 0.85
- AND modelin indirilmesi tamamlanmadıysa ensemble'a geri dön (graceful degradation)

**Dosyalar:**
- `lib/speech/embedder.ts` (YENİ — Transformers.js init, encode)
- `lib/speech/keywordMatcher.ts` (cascaded rerank hook)
- `app/presentation/[id]/present/page.tsx` (lazy prefetch)

**Bundle:** 45 MB ayrı chunk (ana bundle'a girmez)
**Tahmini:** 1-2 gün. Medium lift.

---

### FR-007: Keyword Description Embedding Cache (HyDE-inspired)
**Açıklama:** Gemini her keyword için zaten bir `description` üretmekte. Bu description FR-006'daki mE5 ile embed edilip IndexedDB'ye cache'lenir. Match sırasında spoken phrase da aynı modelle embed edilip tüm description embedding'leriyle cosine hesaplanır.

**Kabul kriteri:**
- GİVEN keyword "yürüyüş yolu", description "Bir yürüyüş parkurunu gösteren görsel..."
- WHEN sunum açılıyor
- THEN her keyword description'ı mE5 ile encode edilip IndexedDB'ye yazılır
- AND match sırasında interim phrase encode edilip cosine hesaplanır
- AND sinonim eşleşmelerde ensemble'dan belirgin recall artışı gözlemlenir

**Dosyalar:**
- `lib/speech/embeddingCache.ts` (YENİ — IndexedDB wrapper)
- `lib/speech/keywordMatcher.ts` (cosine ile karşılaştır)
- `lib/db/canvas-objects.ts` (cache schema)

**Bağımlılık:** FR-006 (mE5 encoder gerekli)
**Tahmini:** 1 gün.

---

### FR-008: TF-IDF Keyword Weighting (Attend-and-Excite)
**Açıklama:** Sahnedeki tüm keyword'lerin kelime frekansına göre TF-IDF ağırlıkları hesaplanır. Nadir keyword'ler boost, jenerik kelimeler ("şey", "bir", "olan") zayıflatılır. Hesaplama sunum başlangıcında bir kez yapılır.

**Kabul kriteri:**
- GİVEN sahnede 10 keyword var, biri "otomobil" (1 kez) biri "nesne" (5 kez)
- WHEN TF-IDF hesaplanır
- THEN "otomobil"in ağırlığı "nesne"ninkinden 2× yüksek
- AND match sırasında "otomobil" için daha düşük threshold kullanılır

**Dosyalar:**
- `lib/speech/keywordMatcher.ts` (tf-idf computation in buildIndex)

**Tahmini:** 2-3 saat.

---

### FR-009: Speaker-Adaptive Threshold
**Açıklama:** Sistem son 20 saniyenin ortalama WebSpeech confidence skorunu hesaplar. Kullanıcının konuşma net ise global threshold düşürülür (daha agresif tetikleme), gürültülüyse yükseltilir. EMA (exponential moving average) ile pürüzsüz.

**Kabul kriteri:**
- GİVEN son 20 sn ortalama confidence = 0.92
- WHEN sistem rolling EMA'yı günceller
- THEN effectiveBaseThreshold = base - 0.05 = 0.65
- AND confidence 0.4'e düşerse effectiveBaseThreshold = base + 0.08 = 0.78

**Dosyalar:**
- `hooks/useKeywordMatch.ts` (EMA state)
- `stores/speechStore.ts` (rolling confidence buffer)

**Tahmini:** 3-4 saat.

---

### FR-010: Flicker Mitigation (Decay Inertia)
**Açıklama:** orchestrator.decay döngüsünde, focus değişiminin minimum 1 saniye inertiya ile gerçekleşmesi gerekir. Aynı imageId skorunun süreli refresh'i notifyChange tetiklemez (zaten son commit'te kısmen implement edildi ama daha sıkı kontrol lazım).

**Kabul kriteri:**
- GİVEN img-A focus'ta, skor 0.9
- WHEN 500 ms sonra decay ile skor 0.8'e düştü
- THEN currentFocusedId hâlâ img-A (değişmedi)
- AND notifyChange çağrılmıyor (re-render yok)
- AND 3 sn sonra skor 0.3'e düştüğünde focus null olur ve notifyChange tetiklenir

**Dosyalar:**
- `lib/animation/orchestrator.ts` (notifyChange gate — focus değişmeden + skor delta < threshold)

**Tahmini:** 2-3 saat. Zoom flicker bug'ının doğrudan çözümü.

---

### FR-011: Gold Set Genişletme — Gerçek Dünya Kayıtları
**Açıklama:** Mevcut gold set sentetik. Gerçek sunum kayıtları eklenmeli: 10+ gerçek sunum transkripti, el ile annotation ile "hangi cümlede hangi keyword'e eşleşmeliydi". WebSpeech'in gerçek ASR hatalarını yansıtır.

**Kabul kriteri:**
- GİVEN 10 gerçek sunum kaydı ve keyword seti
- WHEN gold set evaluate edilir
- THEN en az 50 vaka, her kategoriden gerçek örnek
- AND CI'da F1 raporlanır

**Dosyalar:**
- `lib/speech/__tests__/goldset.ts` (real-world cases eklemesi)
- `lib/speech/__tests__/fixtures/` (YENİ — JSON kayıtlar)

**Tahmini:** 4-6 saat (veri toplama + annotation).

---

### FR-012: Grid Search Kalibrasyon
**Açıklama:** Ensemble ağırlıkları (0.40/0.30/0.20/0.10) gold set üzerinden grid search ile optimize edilir. 4 ağırlık × 5 adım = 625 kombinasyon, gold set'te F1 metriğine göre en iyisi seçilir. Hard-code similarity.ts'e yazılır.

**Kabul kriteri:**
- GİVEN genişletilmiş gold set (FR-011 sonrası)
- WHEN grid search çalıştırılır
- THEN en yüksek F1'i veren ağırlık seti similarity.ts'e commit edilir
- AND sonuç mevcut ağırlıklara göre en az +0.02 F1 iyileşme

**Dosyalar:**
- `lib/speech/__tests__/grid-search.test.ts` (YENİ)
- `lib/speech/similarity.ts` (ağırlıklar güncel)

**Bağımlılık:** FR-011
**Tahmini:** 3-4 saat.

---

### FR-013: Zoom Flicker Bug Kök Neden Analizi ve Düzeltme
**Açıklama:** Kullanıcı raporu: "sunum sırasında resim zoom efekti kendi kendine kapanıp açılıyor". Bir önceki keşifte 3 olası neden tespit edildi: (a) decay loop'un skor düşürüp notifyChange tetiklemesi, (b) WebSpeech auto-restart'ta race condition, (c) interim transcript dedup başarısızlığı. FR-003 ve FR-010 bunları kısmen çözüyor ama ayrı bir doğrulama + test koşumu gerekiyor.

**Kabul kriteri:**
- GİVEN sunum present mode, mikrofon aktif, 5 dakika sessiz kalma
- WHEN kullanıcı tek bir keyword söylüyor
- THEN görsel 1 kez zoom'luyor ve stabil kalıyor (en az 5 sn)
- AND kapanıp açılma yok (visual regression testi)

**Dosyalar:**
- `lib/animation/orchestrator.ts` (doğrulama)
- `lib/speech/adapters/webSpeechAdapter.ts` (onend race)
- `hooks/useKeywordMatch.ts` (interim dedup)
- `app/presentation/[id]/present/page.tsx` (render log instrumentation for debug)

**Bağımlılık:** FR-003, FR-010
**Tahmini:** 3-5 saat.

---

## 4. Non-Fonksiyonel Gereksinimler (NFR)

- **NFR-PERF-001:** Matcher ortalama latency <30 ms (L1+L2+L3 stack'te). L4 (embedding rerank) sadece belirsiz band'da, ortalama bütçeye dahil.
- **NFR-PERF-002:** Trie build (FR-001) süresi sahne başına <5 ms (50 keyword varsayılarak).
- **NFR-PERF-003:** Embedding model ilk yükleme <3 sn (WebGPU, q4, 45 MB lazy chunk).
- **NFR-SIZE-001:** Ana JS bundle artışı ≤15 KB (L1+L2+L3 toplamı). Embedding modeli ayrı lazy chunk'ta.
- **NFR-PRIVACY-001:** Tüm speech ve matching client-side. Sunucuya transkript veya ses gönderilmez.
- **NFR-COMPAT-001:** Safari + Chrome + Firefox desteği. WebGPU olmayan tarayıcılarda WASM fallback.
- **NFR-QUAL-001:** Genişletilmiş gold set F1 ≥ **0.92** (şu anki 1.0 sentetik'ten gerçek dünya baseline'ının 0.85 varsayımıyla).
- **NFR-QUAL-002:** Zoom flicker rate (5 dk sessizlikte kendiliğinden zoom açılıp kapanma) = 0.
- **NFR-A11Y-001:** Görsel zoom değişimleri WCAG AA motion sensitivity ayarını respekte etsin (reduce motion).

---

## 5. Bağımlılık Grafiği

```
FR-001 (Trie unique-prefix)  ───┐
FR-002 (Partial hypothesis)  ───┤
FR-003 (Context prior)       ───┼──→ FR-013 (Flicker fix doğrulama)
FR-010 (Flicker mitigation)  ───┘

FR-004 (Negative list)       ───→ bağımsız

FR-005 (MiniSearch + RRF)    ───→ bağımsız

FR-006 (mE5 embedder)        ───→ FR-007 (Description cache)
                              └─→ FR-012 (Grid search, L1+L4 kalibre)

FR-008 (TF-IDF)              ───→ bağımsız

FR-009 (Speaker-adaptive)    ───→ bağımsız

FR-011 (Gerçek gold set)     ───→ FR-012 (Grid search girdisi)
```

**Kritik yol:** FR-011 → FR-012 (ölçümsüz optimizasyon körleşir)

---

## 6. Öneri Uygulama Sırası (Öncelik + Zorluk Dengeli)

### Sprint 1: Zero-Cost Quick Wins (1-2 gün)
1. **FR-013** zoom flicker debug instrumentation → kök nedeni doğrula
2. **FR-010** decay inertia — focus change gate
3. **FR-003** context-aware prior — cooldown + slide locality
4. **FR-001** trie + unique-prefix early commit

### Sprint 2: Semantic Layer Temelleri (3-5 gün)
5. **FR-004** negative keyword list (Gemini prompt + parser + match)
6. **FR-005** MiniSearch + RRF fusion
7. **FR-008** TF-IDF keyword weighting
8. **FR-011** gold set genişletme (en az 50 vaka)
9. **FR-012** grid search kalibrasyon

### Sprint 3: Embedding Retrieval (1 hafta)
10. **FR-006** mE5 embedder (Transformers.js v3 + q4 + lazy chunk)
11. **FR-007** description embedding cache
12. **FR-002** partial hypothesis stability
13. **FR-009** speaker-adaptive threshold

### Sprint 4: Gerçek Dünya Doğrulama (2-3 gün)
14. FR-012 tekrar çalıştır (embedding dahil grid search)
15. E2E test: 3 gerçek sunum senaryosu, full pipeline
16. Performance profiling (Chrome DevTools)
17. Production deploy + A/B metric toplama

---

## 7. Kapsam Dışı (Şu an yapmayacaklarımız)

- **GroundingDINO auto-tagging** — server-side job, mevcut mimari client-only
- **BERTurk-SBERT custom fine-tune** — 1 ay iş, mE5-small yeterli olduğu kanıtlanana kadar
- **Whisper/Moonshine ASR değişimi** — WebSpeech yeterli, riskli migrasyon
- **BGE-M3 / LaBSE / Nomic Embed** — boyut veya Türkçe kalite sorunu
- **HNSW / FAISS ANN** — 30-50 keyword için overkill
- **HyDE runtime LLM** — latency 200 ms+, offline Gemini expansion yeterli

---

## 8. Açık Sorular (Karar Bekleyen)

1. **L4 (embedding rerank)** cascaded mi yoksa her match'te mi? Cascaded daha ucuz ama pretty darn'ı kaçırabilir.
2. **Negative list** Gemini'den mi (prompt mühendisliği) yoksa offline Damerau ile otomatik mi? Otomatik + Gemini hibriti olabilir.
3. **Trie early commit skoru** — sabit 0.85 mi, yoksa prefix derinliğine göre mi? (2 harf → 0.75, 4 harf → 0.9)
4. **mE5 vs MiniLM** — mE5-small 50% büyük ama MTEB +13 puan. Quick win için MiniLM, production için mE5?
5. **Gold set gerçek kayıtları nereden?** Kullanıcıdan mı toplayacağız yoksa sentetik generator mı (TTS + noise)?

---

## Kaynaklar (Doğrulanabilir)

- **CTC Prefix Beam Search** — Hannun 2014, `arxiv.org/abs/1408.2873`
- **Aho-Corasick** — Aho & Corasick 1975 (klasik)
- **Prompt-to-Prompt** — Hertz 2022, `arxiv.org/abs/2208.01626`
- **Attend-and-Excite** — Chefer 2023, `arxiv.org/abs/2301.13826`
- **SEGA** — Brack 2023, `arxiv.org/abs/2301.12247`
- **FreeControl** — Mo 2024, `arxiv.org/abs/2312.07536`
- **HyDE** — Gao 2022, `arxiv.org/abs/2212.10496`
- **CLIP** — Radford 2021, `arxiv.org/abs/2103.00020`
- **SigLIP** — Zhai 2023, `arxiv.org/abs/2303.15343`
- **LongCLIP** — 2024, `arxiv.org/abs/2403.15378`
- **GLIGEN** — Li 2023, `arxiv.org/abs/2301.07093`
- **InstructPix2Pix** — Brooks 2023, `arxiv.org/abs/2211.09800`
- **GroundingDINO** — Liu 2023, `arxiv.org/abs/2303.05499`
- **DPR** — Karpukhin 2020, `arxiv.org/abs/2004.04906`
- **Switch Transformer** — Fedus 2021, `arxiv.org/abs/2101.03961`
- **multilingual-e5-small** — `huggingface.co/intfloat/multilingual-e5-small`
- **Xenova mE5 port** — `huggingface.co/Xenova/multilingual-e5-small`
- **GTE-multilingual-base** — `huggingface.co/Alibaba-NLP/gte-multilingual-base`
- **Transformers.js v3** — `github.com/xenova/transformers.js`
- **MiniSearch** — `github.com/lucaong/minisearch`
- **aho-corasick (npm)** — `npmjs.com/package/aho-corasick`

---

**Hazır: /wbs skill'ine bu dosya girdi olarak verilip WBS oluşturulacak.**
