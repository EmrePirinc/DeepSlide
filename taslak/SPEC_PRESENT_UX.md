# DeepSlide — Present UX Redesign + Keyword Hint Sistemi

**Proje:** DeepSlide Present Page v2
**Tarih:** 2026-04-12
**Kaynak:** /bb toplantı tutanağı (2026-04-12, 19 katılımcı, 130dk)
**Hedef:** Konferans konuşmacısı birincil persona için UI/UX + hint sistemi MVP

---

## 1. Kapsam Özeti

MVP Faz 1'de kabul edilen 7 özellik (RICE sıralı):

| # | Öneri | RICE | Kano | FR Aralığı |
|---|---|:-:|:-:|---|
| #3 | Fullscreen Slide + Gaussian Blur | 20.0 | Must | FR-001, FR-002 |
| #1 | Voice Semantic Jump Engine | 12.0 | Must | FR-003..FR-006 |
| #6 | Slide Position Indicator | 10.0 | Perf | FR-007, FR-008 |
| #2 | Unified PresenterBottomBar + Auto-hide | 9.0 | Must | FR-009..FR-013 |
| #7 | Keyword Hint Toggle (⭐ editor) | 7.2 | Perf | FR-014, FR-015 |
| #8 | Max 3 Hint + Smart Default | 8.0 | Perf | FR-016, FR-017 |
| #4 | Corner Hint Chips (sol-üst + sağ-üst) | 6.4 | Perf | FR-018..FR-020 |

**Reddedilen:** #14 TikTok Scrubber, #15 Hint-Only Mode, #5 Current Slide Hint, #13 Smart Hint Strip
**Parking Lot (Faz 2):** #9 Keyboard Overlay, #10 Accessibility Extreme, #16 Pro Kayıt ayarı, #11 Mic Noise, #12 Long-press Kayıt

---

## 2. Hedef Kullanıcı (JTBD)

### JTBD-1: Random Access Voice Navigation
> "Ben konferans konuşmacısı olarak, 80 slaytlık sunumumda herhangi bir anda, aklımdaki görselin içeriğini tarif eden bir kelime söyleyip o slayta anında zıplamak istiyorum, böylece seyirci sorusu veya konuşma akışım beni slayt sırasından bağımsız bırakabilsin."

### JTBD-2: Senkronize Manuel Fallback
> "Ses tanıma arızalanırsa, klavye ok tuşlarıyla ya da butonlarla slayt akışımı anında devralmak istiyorum, böylece teknik bir sorun konuşmamı bölmesin."

### JTBD-3: Bağlam Farkındalığı (Hint)
> "Şu anda hangi slaytta olduğumu, bir sonraki ve önceki slaytın ne hakkında olduğunu bir göz atışıyla görmek istiyorum, böylece seyirciye bakmaya devam ederken bir sonra ne söyleyeceğimi hatırlayabileyim."

### JTBD-4: Görünmez UI (Dinleyici Deneyimine Saygı)
> "Slayt ekranı seyirci için saf bir görsel deneyim olsun, DeepSlide'ın UI'ı dinleyicilere görünmesin ya da minimal görünsün, böylece sunum ürüne değil bana ve içeriğe odaklansın."

---

## 3. Fonksiyonel Gereksinimler (20 FR)

### 3.1 Fullscreen Slide Rendering

**FR-001 — Tam Ekran Slayt Rendering** `[Must]`
Sistem, focused moduna geçen bir slaytı 100vw × 100vh alanında `object-contain` ile render ETMELİDİR.
- **Given:** Kullanıcı overview mode'da grid görüyor
- **When:** Bir görsele odaklanılır
- **Then:** Slayt 100vh × 100vw'da object-contain, UI bileşenleri absolute overlay, kırpma yok
- **Bağımlılık:** FR-002

**FR-002 — Pillarbox Gaussian Blur Arka Plan** `[Must]`
Slayt oranı ekran oranından farklıysa, boş alana aynı görselin `scale(1.5) + blur(40px)` versiyonu render EDİLMELİDİR.
- **Given:** 16:9 ekranda 4:3 slayt
- **When:** Fullscreen render
- **Then:** Kenarlarda yumuşak blur arka plan, siyah şerit yok
- **NFR:** NFR-PERF-001 (FPS ≥30)

### 3.2 Voice Semantic Jump Engine

**FR-003 — Final Transcript Tabanlı Voice Jump** `[Must]`
Sistem sadece `isFinal=true` WebSpeech eventi'nde voice jump tetiklemelidir; interim transcript zıplamayı tetiklemez.
- **Given:** Kullanıcı slayt 20'de
- **When:** Final transcript "dağ manzarası" + slayt 42'de bu keyword
- **Then:** 1000ms içinde slayt 42'ye geçiş
- **NFR:** NFR-PERF-002 (latency ≤200ms p95)

**FR-004 — Multi-Word Keyword Önceliği** `[Must]`
Eş zamanlı eşleşmelerde en uzun (en spesifik) keyword kazanır.
- **Given:** "dağ" (slayt 5) + "dağ manzarası" (slayt 42)
- **When:** "dağ manzarası çok güzel" dinlenir
- **Then:** Slayt 42 (multi-word öncelik)

**FR-005 — Recency Prior (60sn Tekrar Engeli)** `[Must]`
Son 60 saniyede gösterilmiş slayt yeni jump adaylarında deprioritize edilir.
- **Given:** Slayt 5 ve 42'de "dağ", slayt 5 30sn önce gösterildi
- **When:** "dağ" derse
- **Then:** Slayt 42'ye (slayt 5 recency penalty)

**FR-006 — ARIA Live Region Voice Jump Duyurusu** `[Must]`
Jump tetiklendiğinde `aria-live="polite"` div'e slayt bilgisi yazılır.
- **Given:** Screen reader aktif
- **When:** Voice Jump ile slayt 25'e geçiş
- **Then:** "Slayt 25'e geçildi — [başlık]" 500ms'de duyurulur
- **NFR:** NFR-ACC-004

### 3.3 Slide Position Indicator

**FR-007 — Üstte 2px Progress Bar** `[Should]`
Ekranın üst kenarında 2px yüksekliğinde progress bar render edilir.
- **Given:** 15 slayt, kullanıcı 6'da
- **When:** Sayfa render
- **Then:** Bar %40 dolu, 300ms cubic-bezier animasyon

**FR-008 — Hover Reveal Tooltip** `[Should]`
Cursor bar üzerine gelince bar 6px'e kalınlaşır, "6/15" tooltip gösterir.

### 3.4 Unified PresenterBottomBar

**FR-009 — Floating Pill Alt Bar (4 ikon)** `[Must]`
Alt kenarda tek floating pill: `← 🎤 ✕ →`. SpeechControls, AdaptiveControls, RecordingButton AYRI RENDER EDİLMEZ (double render bug fix).
- **Given:** Present mode
- **When:** Sayfa render
- **Then:** Yatay ortalı pill, maks 400px genişlik, sadece 4 buton
- **Kapsam dışı:** Eski SpeechControls, AdaptiveControls, RecordingButton kullanımı — hepsi silinecek

**FR-010 — Auto-hide 3sn Idle** `[Must]`
3sn boyunca mousemove/keydown/touchstart eventi yoksa bar fade-out.
- **Then:** 300ms fade, pointer-events:none
- **NFR:** NFR-PERF-004

**FR-011 — Cursor/Ok Tuşu Fade-in Reveal** `[Must]`
Mousemove veya `←`/`→` tuşu bar'ı 200ms fade-in ile gösterir, 2sn görünür kalır.

**FR-012 — ESC Emergency Bar Reveal** `[Must]`
ESC tuşu koşulsuz olarak bar'ı 100ms'de gösterir, timer'ı resetler.

**FR-013 — Touch Tap Toggle** `[Should]`
Touch cihazlarda ekrana tek dokunuş bar'ı toggle eder.

### 3.5 Keyword Hint Toggle (⭐ Editor)

**FR-014 — Keyword Interface `isHint` Alanı** `[Must]`
Keyword tipine opsiyonel `isHint: boolean` alanı eklenir. Backward compat — eski veri undefined=false olarak davranır.
- **NFR:** NFR-COMPAT-001

**FR-015 — KeywordBadge Tıklanır Toggle + Visual State** `[Must]`
Editor'de badge tıklanınca isHint toggle, işaretli keyword'ler `ring-yellow-400` ile çerçevelenir.

### 3.6 Max 3 Hint + Smart Default

**FR-016 — Gemini Smart Default Top-2 Auto-Select** `[Must]`
Yeni sunum analizinde her slayt için confidence en yüksek 2 keyword otomatik `isHint=true`.
- **Given:** Gemini analizi tamamlandı
- **Then:** Her slayt için top-2 confidence keyword işaretli

**FR-017 — Yumuşak Max 3 Kuralı + "+N daha"** `[Should]`
Sınırsız keyword işaretlenebilir, ama ekranda maks 3 görünür + "+N daha" overflow chip.

### 3.7 Corner Hint Chips

**FR-018 — Sol-Üst Önceki Slayt Hint Chip** `[Should]`
Sol-üst köşede önceki slaytın isHint keyword'leri pill olarak görünür.
- **Then:** `top: 16px, left: 16px`, font 16px+, 4.5:1 kontrast
- **NFR:** NFR-ACC-001, NFR-ACC-002

**FR-019 — Sağ-Üst Sonraki Slayt Hint Chip** `[Should]`
Sağ-üst köşede sonraki slaytın isHint keyword'leri.
- **Then:** `top: 16px, right: 16px`, son slaytta render edilmez

**FR-020 — Corner Hint Null Render Logic** `[Must]`
Gösterilecek keyword sayısı 0 ise component null döner — boş pill dahi render edilmez.

---

## 4. Non-Functional Gereksinimler (12 NFR)

### 4.1 Performans (4)

| Kod | Metrik | Öncelik |
|---|---|---|
| **NFR-PERF-001** | Fullscreen FPS ≥30 median, ≥24 p95 | Kritik |
| **NFR-PERF-002** | Voice Jump E2E latency ≤200ms p95, ≤100ms p50 | Kritik |
| **NFR-PERF-003** | Aho-Corasick match ≤50ms p95 | Yüksek |
| **NFR-PERF-004** | BottomBar fade-in 200ms, fade-out 300ms (reduced: ≤100ms) | Yüksek |

### 4.2 Erişilebilirlik (5)

| Kod | Metrik | Öncelik |
|---|---|---|
| **NFR-ACC-001** | WCAG 2.1 AA kontrast min 4.5:1 tüm metin | Kritik |
| **NFR-ACC-002** | Corner hint font ≥16px, line-height ≥1.4 | Yüksek |
| **NFR-ACC-003** | `prefers-reduced-motion` desteği (durations ≤100ms) | Yüksek |
| **NFR-ACC-004** | ARIA live region polite voice jump duyurusu | Yüksek |
| **NFR-ACC-005** | Klavye ile tam navigasyon (←/→/ESC/Tab) — mic olmadan çalışır | Kritik |

### 4.3 Kullanılabilirlik (2)

| Kod | Metrik | Öncelik |
|---|---|---|
| **NFR-USE-001** | İlk kullanıcı bar keşfi ≤5sn (5 kişi testi) | Orta |
| **NFR-USE-002** | Hint toggle sezgisel (%80+ kullanıcı 10sn'de çözer) | Orta |

### 4.4 Uyumluluk & Gizlilik (3)

| Kod | Metrik | Öncelik |
|---|---|---|
| **NFR-COMPAT-001** | Keyword schema backward compat (isHint optional) | Kritik |
| **NFR-COMPAT-002** | Chrome 120+, Safari 17+, Edge 120+ destek | Kritik |
| **NFR-PRIV-001** | Transcript asla sunucuya gitmez (KVKK) | Kritik |

### 4.5 Bakılabilirlik (1)

| Kod | Metrik | Öncelik |
|---|---|---|
| **NFR-MAINT-001** | Yeni kod test kapsamı ≥%80 | Yüksek |

---

## 5. Kısıtlar (RAID'dan)

### Teknik Kısıtlar
- `useKeywordMatch` mevcut Aho-Corasick + Turkish NLP algoritması **korunmalı**
- Framer Motion layoutId animasyonları **bozulmamalı**
- Next.js 16, React 19, TypeScript strict
- Sıfır yeni NPM bağımlılığı (bundle minimize)

### Risk İzleme (RAID log)
| ID | Risk | Eşik | İzleme |
|---|---|---|---|
| R-001 | Voice Jump sessiz başarısızlık | %10 kullanıcı jump sonrası hemen geri dönüyorsa | Telemetry |
| R-002 | Auto-hide onboarding karmaşıklığı | İlk kullanıcı bar keşfi >5sn | NFR-USE-001 |
| R-003 | Hint düşük kullanım | 30 gün sonra <%50 kullanım | Production telemetry |
| R-004 | Blur performans etkisi | Fullscreen FPS <30 | NFR-PERF-001 |

### Mevcut Bug (Çözülecek)
- **I-001:** SpeechControls iki kez render ediliyor (present page L78-84 + AdaptiveControls L106-111) — FR-009 ile elimine edilir
- **I-002:** Keyword schema migration — FR-014 opsiyonel alan ile çözülür

---

## 6. Definition of Ready (DoR)

Her WBS görevi sprint'e girmeden önce:

```
☐ BAĞIMSIZ — Bağımlılık yok veya çözülmüş
☐ TARTIŞILABİLİR — Given/When/Then kabul kriterleri yazılı
☐ DEĞERLİ — FR ve JTBD'ye izlenebilir
☐ TAHMİN EDİLEBİLİR — 4-8 saat (8/80 kuralı)
☐ KÜÇÜK — Tek AI oturumunda tamamlanabilir
☐ TEST EDİLEBİLİR — Given/When/Then en az 1 adet
☐ BAĞIMLILIKLAR TANIMLI — Import edilecek dosyalar, paketler
☐ NFR BAĞLANMIŞ — İlgili performans/erişilebilirlik kısıtları
```

---

## 7. Definition of Done (DoD)

Bir task "tamamlandı" sayılması için:

```
GELİŞTİRME
☐ Kod + self-review
☐ TypeScript strict 0 hata
☐ ESLint 0 warning
☐ Unit test ≥%80 kapsam (NFR-MAINT-001)
☐ Tüm testler yeşil (vitest run)

TEST
☐ FR kabul kriterleri test edildi
☐ Edge case'ler (null, empty, race)
☐ Regresyon: mevcut 37 test yeşil
☐ Manuel browser testi

NFR
☐ Performans NFR doğrulandı (FPS, latency)
☐ WCAG AA kontrast testi (varsa)
☐ prefers-reduced-motion testi
☐ Backward compat doğrulandı

BUILD
☐ tsc --noEmit 0 hata
☐ npm run build başarılı
☐ Bundle size delta kontrol

DOCS
☐ Kod yorumları (Türkçe, "neden")
☐ BSL 1.1 copyright header
☐ AGENTS.md uyarılarına uyum

DEPLOY
☐ Git commit açıklayıcı
☐ Vercel auto-deploy başarılı
☐ Production smoke test
```

---

## 8. Sayısal Özet

```
FR SAYISI: 20
  Must:   13 (%65)
  Should:  7 (%35)

NFR SAYISI: 12
  Performans:      4
  Erişilebilirlik: 5
  Kullanılabilirlik: 2
  Uyumluluk+Gizlilik: 3
  Bakılabilirlik:  1

Tahmini Efor: ~14 gün (2 hafta, 2 sprint)
Hedef Teslim: 2026-04-26
```

---

## 9. İzlenebilirlik Matrisi (FR → JTBD → /bb Öneri)

| FR | JTBD | /bb Öneri | Kano |
|---|---|---|---|
| FR-001, FR-002 | JTBD-4 | #3 | Must |
| FR-003, FR-004, FR-005, FR-006 | JTBD-1 | #1 | Must |
| FR-007, FR-008 | JTBD-2 | #6 | Should |
| FR-009..FR-013 | JTBD-2+JTBD-4 | #2 (+#17 merge) | Must |
| FR-014, FR-015 | JTBD-3 | #7 | Must |
| FR-016, FR-017 | JTBD-3 | #8 | Must/Should |
| FR-018, FR-019, FR-020 | JTBD-3 | #4 | Should/Must |

---

**SPEC hazır — /wbs için girdi belgesi.**
