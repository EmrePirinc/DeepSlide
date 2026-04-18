# TASKS.md — DeepSlide Mikro-Görev Bağımlılık Zinciri
**Kaynak:** WBS.md v1.0 + Pazar Araştırması (10 Nisan 2026)
**Kural:** Her görev 1-2 saat | Tek dosya | Tek sorumluluk
**Toplam Faz 1 Mikro-Görev:** 74 adet

---

## PAZAR ARAŞTIRMASI BULGULARI (Görevlere Entegre)

> Bu bulgular araştırma ajanlarından elde edildi. Her ilgili göreve uygulandı.

| Bulgu | Kaynak | Etkilenen Görev |
|-------|--------|-----------------|
| Dashboard kart hover: `•••` (üç nokta) context menu pattern, 4 aksiyon üst sınır | Prezi, Canva, Notion UX araştırması | T-1111-x |
| Klasör sistemi: 3 seviyeli hiyerarşi (Root → Klasör → Alt Klasör) en iyi pratik | Prezi/Gamma analizi | T-1121-x |
| Arama: Küçük veri setlerinde (<500 kayıt) client-side filtre Firestore query'den 10x hızlı | Hybrid search pattern analizi | T-1131-x |
| Thumbnail standartı: 1280×720px, WebP formatı, lazy-load | Canva/Gamma thumbnail sistemi | T-1171-x |
| Presenter Notes senkronizasyonu: WebSocket > long-polling (latency: 50ms vs 500ms) | WebSocket vs polling benchmark | T-1143-x |
| QR boyutu: Sunum ekranında min 10×10cm → 1m mesafeden taranabilir | QR erişilebilirlik standardı | T-1161-x |
| Ses onboarding: Seslendirme adımı içeren onboarding tamamlanma oranı %340 artıyor | Voice onboarding araştırması | T-1133-x |
| Kayıt codec: Loom yaklaşımı — VP9 tercih, Safari'de H264 fallback | Loom codec analizi | T-1151-x |
| AI sunum pazarı: $4.7B, ortalama deck oluşturma <30 saniye | AI presentation market 2025 | Faz 2 AI spike |
| Per-slide analytics: Pitch.com modeli — her slayta harcanan süre + eşleşme oranı | Pitch.com analytics incelemesi | T-1261-x (Faz 2) |

---

## KRİTİK YOL (Critical Path — En Uzun Zincir)

```
T-1121-1 → T-1121-2 → T-1121-3 → T-1121-4 (Klasör Şeması)
    ↓
T-1122-1 → T-1122-2 → T-1122-3 → T-1122-4 (Klasör UI)
    ↓
T-1123-1 → T-1123-2 → T-1123-3 (Klasöre Taşıma)
    ↓
QG-1 ──────────────────────────────────────────────── QG-9 (Faz 1 Tamamlama)
```

**Sprint 1 Paralel Başlangıç (3 iş parçacığı):**
```
İş Parçacığı A: T-1111-x → T-1112-x → T-1121-x → T-1122-x → T-1123-x → T-1131-x
İş Parçacığı B: T-1151-x → T-1152-x (bağımsız)
İş Parçacığı C: T-1171-x → T-1172-x (bağımsız)
```

---

## BAĞIMLILIK ZİNCİRİ (DAG — Directed Acyclic Graph)

```
SPRINT 1 — PARALEL BAŞLANGIÇ
┌─────────────────────────────────────────────────────────┐
│ [T-1111-1..5]  PresentationCard TypeScript + hover      │
│ [T-1151-1..3]  Codec otomatik seçim (bağımsız)         │
│ [T-1171-1..4]  Thumbnail panel (bağımsız)               │
└─────────────────────────────────────────────────────────┘
          │                    │                │
          ▼                    ▼                ▼
[T-1112-1..2]          [T-1152-1..2]    [T-1172-1..3]
Mobil long-press        Upload+link      Scroll sync
          │
          ▼
[T-1121-1..4]  Firestore klasör şeması (kritik yol)
          │
     ┌────┴────┐
     ▼         ▼
[T-1122-1..4]  [T-1161-1..4] QR overlay (paralel)
Klasör UI       
     │
     ▼
[T-1123-1..3]  Klasöre taşıma
     │
     ▼
[T-1131-1..3]  Dashboard arama
     │
     └──── QG-1 ──── git commit ──── /clear

[T-1211-1..2]  Klonlama deep copy (T-1111 bitmeli)
[T-1181-1..4]  Pre-check UI (bağımsız)
[T-1182-1..2]  Hazırlık skoru (T-1181 bitmeli)
     └──── QG-2,5,6,7,8 ──── git commit ──── /clear

SPRINT 2 — SIRALI ZİNCİR
[T-1311-1..2]  Onboarding tetikleme (bağımsız)
     ↓
[T-1321-1..5]  Onboarding modal UI
     ↓
[T-1331-1..4]  Ses testi adımı
     ↓
[T-1341-1..2]  Pro trial tetikleme
     └──── QG-3

[T-1411-1..3]  Notes CRUD servisi (bağımsız)
     ↓
[T-1421-1..4]  Not paneli UI
     ↓
[T-1431-1..5]  /notes presenter sayfası
     ↓
[T-1441-1..2]  Presenter view butonu
     └──── QG-4

     └──── QG-9 (Faz 1 Tamamlama E2E + Regression)
```

---

## FAZ 1 MİKRO-GÖREV KATALOĞU

> **Okuma Kılavuzu:**
> - `Bağımlılık: —` → bağımsız, hemen başlanabilir
> - `Bağımlılık: T-XXXX-N` → o görev tamamlanmadan başlama
> - `⚡ Paralel` → başka bir görevle aynı anda farklı oturumda çalışabilir

---

### BÖLÜM 1.1.1 — Dashboard Modernizasyonu

#### WBS-1.1.1.1.1: Kart Hover Aksiyonları (5 mikro-görev)

---

**[T-1111-1] PresentationCard TypeScript arayüzü tanımla**
```
Süre: 1 saat
Bağımlılık: —
⚡ Paralel: T-1151-1, T-1171-1 ile aynı anda
Dosya: app/src/types/presentation.ts (veya mevcut types)
```
Yapılacak: `PresentationCardProps` interface'ini tanımla.
- `id`, `title`, `imageCount`, `createdAt`, `folderId?`, `thumbnailUrl?` alanları
- `PresentationCardActions` tipi: `onEdit`, `onShare`, `onClone`, `onDelete` callback'leri
- `useLongPress` için `TouchEventHandlers` tip ihracatı

Başarı: `tsc --noEmit` sıfır hata, interface'ler `/components` ve `/hooks` den import edilebiliyor.

---

**[T-1111-2] PresentationCard temel bileşen iskeleti**
```
Süre: 1 saat
Bağımlılık: T-1111-1
Dosya: app/src/components/cards/PresentationCard.tsx (YENİ)
```
Yapılacak: `PresentationCard` bileşeni oluştur.
- Mevcut `ImageCard.tsx` pattern'ını incele — yeni bileşen ona benzer
- Sadece görüntüleme kısmı (hover state henüz yok)
- Tailwind: grid card, shadow-sm, rounded-lg, thumbnail alanı
- Pazar Araştırması: Thumbnail alanı `aspect-video` (16:9) — Canva/Gamma standardı

Başarı: Bileşen render oluyor, TypeScript hata yok, görsel doğru boyutlarda.

---

**[T-1111-3] Hover state + Framer Motion overlay animasyonu**
```
Süre: 1.5 saat
Bağımlılık: T-1111-2
Dosya: app/src/components/cards/PresentationCard.tsx
```
Yapılacak: Hover state ile overlay animasyonu ekle.
- `motion/react` `AnimatePresence` + `motion.div` ile overlay
- Hover'da: `opacity: 0 → 1`, `backdropFilter: blur(4px)`, 200ms
- Pazar Araştırması: Prezi/Canva pattern — overlay `rgba(0,0,0,0.5)` arka plan
- `isHovered` state: `onMouseEnter`/`onMouseLeave` ile

Başarı: Kart üzerine gelinince overlay 200ms'de belirir, mouse çıkınca kaybolur.

---

**[T-1111-4] 4 aksiyon butonu + onClick handler'ları**
```
Süre: 1.5 saat
Bağımlılık: T-1111-3
Dosyalar: app/src/components/cards/PresentationCard.tsx
         app/src/lib/db/presentations.ts (deletePresentation kontrolü)
```
Yapılacak: Overlay içine 4 aksiyon butonu ekle.
- Düzenle ✏️ → `onEdit(id)` çağır
- Paylaş 📤 → `onShare(id)` çağır
- Klonla 📋 → `onClone(id)` çağır (henüz stub)
- Sil 🗑️ → shadcn `AlertDialog` ile onay sor → `onDelete(id)` çağır
- Pazar Araştırması: 4 aksiyon üst sınır — daha fazlası `•••` menüsüne taşınmalı
- Tailwind: `gap-3`, `flex`, ikonlar `lucide-react`

Başarı: 4 buton tıklanabilir, Sil butonu önce dialog açıyor, dialog onayı ile silme çağrısı yapılıyor.

---

**[T-1111-5] page.tsx'e PresentationCard entegrasyonu**
```
Süre: 1 saat
Bağımlılık: T-1111-4
Dosya: app/src/app/page.tsx
```
Yapılacak: Dashboard'da mevcut kart render'ını yeni `PresentationCard` ile değiştir.
- Mevcut `ImageCard` kullanımını `PresentationCard` ile değiştir
- `onEdit` → router.push ile editöre yönlendir
- `onDelete` → Firestore `deletePresentation` çağır + state güncelle
- `onShare` → mevcut share link mantığını bağla (stub yeterli şimdilik)
- Vitest unit test: hover, delete flow

Başarı: Dashboard'da kartlar yeni bileşenle render oluyor, hover'da overlay görünüyor, silme çalışıyor.

---

#### WBS-1.1.1.1.2: Mobil Long-Press Hook (2 mikro-görev)

---

**[T-1112-1] useLongPress hook implementasyonu**
```
Süre: 1.5 saat
Bağımlılık: T-1111-1 (TypeScript arayüzleri)
Dosya: app/src/hooks/useLongPress.ts (YENİ)
```
Yapılacak: `useLongPress` React hook'u yaz.
- Parametre: `(callback: () => void, ms = 500): TouchEventHandlers`
- `useRef` ile timer yönetimi
- `onTouchStart`: timer başlat
- `onTouchEnd` / `onTouchCancel`: timer temizle
- `onTouchMove`: >10px hareket → timer iptal (kaydırma koruması)
- TypeScript strict, React 19 compatible

Başarı: Hook import edilip bir butona bağlandığında 500ms basışta callback tetikleniyor, 499ms'de tetiklenmiyor.

---

**[T-1112-2] PresentationCard'a useLongPress entegrasyonu**
```
Süre: 1 saat
Bağımlılık: T-1112-1, T-1111-5
Dosya: app/src/components/cards/PresentationCard.tsx
```
Yapılacak: Mobil long-press ile overlay açma.
- `useLongPress(() => setIsHovered(true))` bağla
- `onTouchEnd` ile overlay kapanma
- Masaüstü hover + mobil long-press birlikte çalışmalı (ayrı state branch'leri değil, aynı `isHovered` state)
- iOS Safari `touchstart` passive event warning'i önle

Başarı: Mobil emülatörde 500ms basışta overlay açılıyor, kaydırma hareketi overlay'i tetiklemiyor.

---

#### WBS-1.1.1.2.1: Firestore Klasör Şeması + Migration (4 mikro-görev)

---

**[T-1121-1] Klasör TypeScript tipleri + Firestore şema tasarımı**
```
Süre: 1 saat
Bağımlılık: —
⚡ Paralel: T-1151-1, T-1171-1 ile aynı anda
Dosya: app/src/types/folder.ts (YENİ)
```
Yapılacak: Klasör veri modelini tasarla ve tiplendir.
- `Folder` interface: `id`, `userId`, `name`, `parentId?` (3 seviye), `createdAt`, `presentationCount`
- Presentation güncellemesi: mevcut tipe `folderId?: string | null` ekle
- Firestore koleksiyon yolu: `users/{userId}/folders/{folderId}`
- Pazar Araştırması: 3 seviyeli hiyerarşi (Root → Klasör → Alt Klasör) — Gamma/Prezi standardı

Başarı: Tipler doğru, `tsc --noEmit` sıfır hata.

---

**[T-1121-2] createFolder / deleteFolder / getFolder Firestore fonksiyonları**
```
Süre: 1.5 saat
Bağımlılık: T-1121-1
Dosya: app/src/lib/db/folders.ts (YENİ)
```
Yapılacak: Klasör CRUD fonksiyonları.
- `createFolder(userId, name, parentId?)`: Firestore'a yaz, Free limit kontrolü (max 3)
- `deleteFolder(userId, folderId)`: Klasör silinince sunumların `folderId` null yapılır (cascade null)
- `getUserFolders(userId)`: Real-time listener döner
- `getPresentationCount(folderId)`: Hesaplama

Başarı: `createFolder` Firestore'a yazıyor, `deleteFolder` sonrası sunumlar kaybolmuyor.

---

**[T-1121-3] movePresentationToFolder + Firestore security rules güncellemesi**
```
Süre: 1.5 saat
Bağımlılık: T-1121-2
Dosyalar: app/src/lib/db/folders.ts
         app/src/lib/db/presentations.ts
         firestore.rules (veya firebase console)
```
Yapılacak: Taşıma fonksiyonu + güvenlik kuralları.
- `movePresentationToFolder(presentationId, folderId, userId)`: `folderId` alanını güncelle
- Firestore rules: `folders/{folderId}` → sadece `request.auth.uid == userId`
- ⚠️ RAID R-001: Mevcut sunumlar `folderId: null` — rules null'ı da izin vermeli

Başarı: Farklı kullanıcı klasörlerine erişemiyor (403), aynı kullanıcı erişebiliyor.

---

**[T-1121-4] Migration kontrolü + mevcut sunum sayısı doğrulama**
```
Süre: 1 saat
Bağımlılık: T-1121-3
Dosya: app/src/lib/db/migrations/addFolderIdToPresentation.ts (YENİ)
```
Yapılacak: Migration script + doğrulama.
- Migration: Mevcut tüm sunumlara `folderId: null` ekle (batch update)
- Önce sunum sayısını logla: `console.log('[MIGRATION] Before:', count)`
- Migration sonrası tekrar logla: `console.log('[MIGRATION] After:', count)` — eşleşmeli
- ⚠️ RAID R-001 kontrolü: sayılar eşleşmezse migration'ı rollback et (log uyarısı)
- Script tek seferlik çalıştırılmak üzere tasarla

Başarı: `[MIGRATION] Before: N` === `[MIGRATION] After: N`, hiçbir sunum kaybolmadı.

---

#### WBS-1.1.1.2.2: Klasör UI + Sidebar (4 mikro-görev)

---

**[T-1122-1] Sidebar klasör listesi bileşeni**
```
Süre: 1.5 saat
Bağımlılık: T-1121-3
Dosya: app/src/components/layout/Sidebar.tsx (GÜNCELLE)
```
Yapılacak: Sidebar'a klasör listesi ekle.
- `getUserFolders` listener ile klasör listesini dinle
- Her klasör: klasör ikonu + isim + presentationCount badge
- Aktif klasör: mavi highlight
- "Tüm Sunumlar" seçeneği (folderId: null filtre)
- Tailwind, shadcn bileşenleri

Başarı: Sidebar'da klasörler listeleniyor, tıklayınca filtre state güncelleniyor.

---

**[T-1122-2] "Yeni Klasör" butonu + dialog**
```
Süre: 1 saat
Bağımlılık: T-1122-1
Dosya: app/src/components/layout/Sidebar.tsx
```
Yapılacak: Klasör oluşturma dialog'u.
- Sidebar'a "Yeni Klasör +" butonu
- shadcn `Dialog`: isim input + oluştur butonu
- Boş isim validasyonu
- Free plan: 3'ten fazlasında paywall toast göster
- Optimistic update: dialog kapanırken liste güncelleniyor gibi göster

Başarı: Dialog açılır, isim girilip oluşturulunca sidebar'da anında görünür.

---

**[T-1122-3] Dashboard klasör filtresi state yönetimi**
```
Süre: 1 saat
Bağımlılık: T-1122-1
Dosya: app/src/app/page.tsx
```
Yapılacak: Seçili klasöre göre sunum filtreleme.
- `activeFolderId: string | null` state → null = tüm sunumlar
- Sidebar'dan seçim değişince `presentations` listesi filtrele
- URL query param: `?folder=xxx` (link paylaşımına izin ver)
- `useMemo` ile filtreli liste hesapla

Başarı: Klasöre tıklayınca sadece o klasördeki sunumlar grid'de görünüyor.

---

**[T-1122-4] Klasör silme + içindeki sunumları taşıma dialog'u**
```
Süre: 1 saat
Bağımlılık: T-1122-2
Dosya: app/src/components/layout/Sidebar.tsx
```
Yapılacak: Klasör sağ tık / hover menüsüne sil seçeneği.
- Klasör hover'da `•••` menüsü: "Yeniden Adlandır" + "Sil"
- Sil: "İçindeki sunumlar 'Tüm Sunumlar'a taşınacak" uyarısı olan `AlertDialog`
- Onayda `deleteFolder` çağrısı

Başarı: Klasör silince içindeki sunumlar kaybolmuyor, "Tüm Sunumlar"da görünüyor.

---

#### WBS-1.1.1.2.3: Sunum → Klasör Taşıma (3 mikro-görev)

---

**[T-1123-1] Kart menüsüne "Klasöre Taşı" seçeneği**
```
Süre: 1 saat
Bağımlılık: T-1111-4, T-1121-3
Dosya: app/src/components/cards/PresentationCard.tsx
```
Yapılacak: 4. aksiyon butonuna "Taşı" ekle (ya da `•••` altına).
- Pazar Araştırması: 4 buton üst sınır → 5. aksiyon `•••` menüsüne gider
- "Klasöre Taşı" seçeneği `DropdownMenuItem` olarak `•••` altına

Başarı: Kart menüsünde "Klasöre Taşı" seçeneği görünüyor, tıklanabiliyor.

---

**[T-1123-2] Klasör seçim sub-menu / modal**
```
Süre: 1.5 saat
Bağımlılık: T-1123-1, T-1122-1
Dosya: app/src/components/cards/FolderPickerModal.tsx (YENİ)
```
Yapılacak: Klasör seçim arayüzü.
- Modal ya da `DropdownMenuSub` → mevcut klasörleri listele
- "Klasörsüz bırak" seçeneği (folderId: null)
- Seçim yapınca `movePresentationToFolder` çağır

Başarı: Modalda klasörler listeleniyor, seçim yapılınca Firestore güncelleniyor.

---

**[T-1123-3] Taşıma sonrası dashboard optimistic update**
```
Süre: 1 saat
Bağımlılık: T-1123-2
Dosya: app/src/app/page.tsx
```
Yapılacak: Taşıma sonrası UI güncellemesi.
- Sunum taşınınca aktif klasör filtresinden çıkmalı (optimistic)
- Hata olursa geri al (revert)
- "Klasöre taşındı ✓" toast mesajı

Başarı: Sunum taşınınca dashboard'dan anında kayboluyor (aktif klasör filtresi varsa), toast görünüyor.

---

#### WBS-1.1.1.3.1: Dashboard Arama (3 mikro-görev)

---

**[T-1131-1] Arama input bileşeni + state**
```
Süre: 1 saat
Bağımlılık: T-1111-5
Dosya: app/src/app/page.tsx
```
Yapılacak: Dashboard header'ına arama kutusu ekle.
- shadcn `Input` + `Search` ikonu (lucide-react)
- `searchQuery` state
- Pazar Araştırması: Client-side filtre — 500 kayıt altında Firestore'a istek atmak gereksiz
- Placeholder: "Sunum ara..."

Başarı: Input bileşeni render oluyor, yazmaya başlayınca state güncelleniyor.

---

**[T-1131-2] 300ms debounce + başlık bazlı filtresi**
```
Süre: 1.5 saat
Bağımlılık: T-1131-1
Dosya: app/src/app/page.tsx
```
Yapılacak: Debounce + filtre mantığı.
- `useCallback` + `setTimeout` ile 300ms debounce
- `useMemo`: presentations'ı `searchQuery` ve `activeFolderId`'ye göre filtrele (ikisi birlikte çalışmalı)
- Arama: `title.toLowerCase().includes(query.toLowerCase())`
- 2 karakter minimum (tek karakter çok geniş sonuç)

Başarı: "proje" yazınca 300ms sonra sadece başlığında "proje" geçenler görünüyor.

---

**[T-1131-3] Eşleşen metin highlight + "Bulunamadı" empty state**
```
Süre: 1 saat
Bağımlılık: T-1131-2
Dosya: app/src/components/cards/PresentationCard.tsx
```
Yapılacak: Arama sonucu görsel geri bildirim.
- Başlıkta eşleşen metni `<mark>` ile sarla (Tailwind `bg-yellow-200 dark:bg-yellow-800`)
- Sonuç yoksa: "Sunum bulunamadı" empty state — ikon + açıklama metni
- `searchQuery` prop olarak `PresentationCard`'a ilet

Başarı: "proje" yazılınca başlıktaki "proje" kelimesi highlight'lanıyor, eşleşme yoksa empty state görünüyor.

---

#### 🚧 QG-1 — Dashboard Modernizasyonu
```
git commit "feat: dashboard card actions + folder system + search"
/clear → 1.1.2'ye geç
```

---

### BÖLÜM 1.1.2 — Sunum Klonlama

#### WBS-1.1.2.1.1: Deep Copy Servis Fonksiyonu (4 mikro-görev)

---

**[T-1211-1] clonePresentation Firestore fonksiyonu**
```
Süre: 1.5 saat
Bağımlılık: T-1111-5 (kart menüsü var olmalı)
Dosya: app/src/lib/db/presentations.ts
```
Yapılacak: `clonePresentation(id: string): Promise<string>` fonksiyonu.
- Orijinal dökümanı oku
- Yeni Firestore dökümanı oluştur: `title: "${original.title} — Kopya"`
- **Önemli:** Firebase Storage dosyaları kopyalama YASAK — sadece `imageUrls[]` ve `keywords[]` referansları kopyala
- `createdAt: serverTimestamp()`, `folderId: null` (klonlar root'ta başlar)
- `presentationId` döndür (yeni ID)

Başarı: `clonePresentation` çağrısı yeni Firestore dökümanı oluşturuyor, orijinal değişmiyor.

---

**[T-1211-2] Kart "Klonla" butonunu servise bağla**
```
Süre: 1 saat
Bağımlılık: T-1211-1, T-1111-4
Dosya: app/src/app/page.tsx
```
Yapılacak: `onClone` handler implementasyonu.
- `clonePresentation(id)` çağır
- Çağrı süresince: "Klonla" butonuna `spinner` ekle (disabled state)
- Başarıda: dashboard'da yeni kartı state'e ekle (optimistic)
- Hata: "Kopyalama başarısız" toast

Başarı: "Klonla" tıklanınca spinner görünüyor, 5sn içinde yeni kart dashboard'da beliriyor.

---

**[T-1211-3] Klonlama loading state bileşeni**
```
Süre: 1 saat
Bağımlılık: T-1211-2
Dosya: app/src/components/cards/PresentationCard.tsx
```
Yapılacak: Loading durumu için skeleton kart.
- Klonlama sürerken dashboard'da "ghost" kart: shimmer animasyonu
- Framer Motion ile belirir/kaybolur

Başarı: Klonlama sırasında dashboard'da yarı şeffaf ghost kart görünüyor.

---

**[T-1211-4] Klonlama Vitest testi**
```
Süre: 1 saat
Bağımlılık: T-1211-1
Dosya: app/src/lib/db/__tests__/presentations.test.ts
```
Yapılacak: `clonePresentation` için unit test.
- Mock Firestore ile test
- Senaryo 1: Başarılı klonlama — orijinal değişmedi mi?
- Senaryo 2: Orijinal bulunamadı — hata fırlatıyor mu?
- Senaryo 3: Yeni döküman doğru başlık ve `folderId: null` ile oluştu mu?

Başarı: 3 senaryo geçiyor, `tsc --noEmit` sıfır hata.

---

#### 🚧 QG-2 — Sunum Klonlama
```
git commit "feat: presentation clone"
/clear → 1.1.3 veya paralel gruba geç
```

---

### BÖLÜM 1.1.3 — Onboarding "İlk Sunum" Akışı (Sprint 2)

#### WBS-1.1.3.1.1: Onboarding Tetikleme Mantığı (2 mikro-görev)

---

**[T-1311-1] useOnboarding hook**
```
Süre: 1.5 saat
Bağımlılık: —
⚡ Paralel: T-1411-1 ile aynı anda (farklı oturum)
Dosya: app/src/hooks/useOnboarding.ts (YENİ)
```
Yapılacak: `useOnboarding` hook.
- `shouldShow: boolean` ve `markCompleted: () => void` döndür
- Koşul: `presentations.length === 0` VE `localStorage`'da `deepslide_onboarding_v1_${userId}` yok
- `markCompleted`: localStorage'a flag yaz
- `userId` değişince flag sıfırlanmamalı (prefix ile izolasyon)
- Pazar Araştırması: Ses adımı içeren onboarding %340 daha yüksek tamamlama — bu hook ses adımını tetikleyecek

Başarı: İlk girişte `shouldShow: true`, `markCompleted` çağrısı sonrası `shouldShow: false`, sayfa yenileme sonrası da `false`.

---

**[T-1311-2] useOnboarding page.tsx entegrasyonu**
```
Süre: 1 saat
Bağımlılık: T-1311-1
Dosya: app/src/app/page.tsx
```
Yapılacak: Hook'u dashboard sayfasına bağla.
- `const { shouldShow, markCompleted } = useOnboarding(userId, presentations)`
- `shouldShow` true ise `OnboardingModal` render et (henüz placeholder)
- 500ms gecikme ile göster (dashboard yüklendikten sonra)

Başarı: 0 sunumlu ilk girişte 500ms sonra modal placeholder görünüyor.

---

#### WBS-1.1.3.2.1: 3-Adım Onboarding Modal UI (5 mikro-görev)

---

**[T-1321-1] OnboardingModal iskelet + adım state yönetimi**
```
Süre: 1.5 saat
Bağımlılık: T-1311-2
Dosya: app/src/components/onboarding/OnboardingModal.tsx (YENİ)
```
Yapılacak: Modal iskeleti ve adım navigasyonu.
- shadcn `Dialog` base
- `currentStep: 1 | 2 | 3` state
- İlerleme göstergesi: "1/3", "2/3", "3/3" — filled dots
- "Geri" / "İleri" / "Tamamla" butonları
- ESC ile kapanma (WCAG: `DialogClose`)
- Props: `{ isOpen, onComplete, onSkip }`

Başarı: Modal açılıyor, adım butonları çalışıyor, ESC kapıyor.

---

**[T-1321-2] Adım 1: Hoş Geldiniz içerik ve animasyon**
```
Süre: 1 saat
Bağımlılık: T-1321-1
Dosya: app/src/components/onboarding/OnboardingStep1Welcome.tsx (YENİ)
```
Yapılacak: Hoş geldiniz adımı içeriği.
- DeepSlide logosu + kısa açıklama metni
- "Ses ile sunum yapın, dünyaya yayın" başlığı
- Framer Motion: `slideX` ile girişte soldan kayar
- Renk kontrastı ≥ 4.5:1 (WCAG AA)

Başarı: Adım 1 içeriği 60fps animasyonla giriyor, axe 0 kritik hata.

---

**[T-1321-3] Adım 2: Ses testi placeholder bağlantısı**
```
Süre: 1 saat
Bağımlılık: T-1321-1
Dosya: app/src/components/onboarding/OnboardingModal.tsx
```
Yapılacak: Adım 2'ye `OnboardingVoiceStep` placeholder bağla.
- Adım 2 alanı: `<OnboardingVoiceStep />` bileşenini render et (T-1331 serisi oluşturacak)
- Şimdilik: "Mikrofon Testi Yükleniyor..." placeholder
- Adım 2'den adım 3'e geçiş: ses adımı tamamlandığında tetiklenir

Başarı: Adım 2'de placeholder görünüyor, "İleri" ile adım 3'e geçilebiliyor.

---

**[T-1321-4] Adım 3: İlk sunum oluştur içerik**
```
Süre: 1 saat
Bağımlılık: T-1321-1
Dosya: app/src/components/onboarding/OnboardingStep3Create.tsx (YENİ)
```
Yapılacak: Adım 3 içeriği.
- "İlk Sunumunuzu Oluşturun" başlığı
- Yeni sunum oluştur butonu (mevcut flow'u açar)
- Pro trial teklif alanı (T-1341 dolduracak — şimdilik placeholder)

Başarı: Adım 3 render oluyor, "Sunum Oluştur" butonuna tıklayınca yeni sunum akışı başlıyor.

---

**[T-1321-5] Tab navigasyonu + focus trap (WCAG)**
```
Süre: 1 saat
Bağımlılık: T-1321-2, T-1321-3, T-1321-4
Dosya: app/src/components/onboarding/OnboardingModal.tsx
```
Yapılacak: Erişilebilirlik gereksinimleri.
- `aria-label="Onboarding adımı N/3"` her adımda
- `aria-describedby` içerik description için
- `focus-trap-react` veya shadcn Dialog'un yerleşik focus trap'i
- Tab sırası: içerik → İleri → Geri → Kapat

Başarı: axe DevTools 0 kritik hata, Tab ile tüm butonlara ulaşılıyor, modal dışına focus kaçmıyor.

---

#### WBS-1.1.3.3.1: Onboarding Ses Testi Adımı (4 mikro-görev)

---

**[T-1331-1] OnboardingVoiceStep bileşen iskeleti**
```
Süre: 1 saat
Bağımlılık: T-1321-3
Dosya: app/src/components/onboarding/OnboardingVoiceStep.tsx (YENİ)
```
Yapılacak: Ses testi adımı iskeleti.
- "Mikrofon Testi" başlığı
- "Şimdi Dene" butonu
- Mikrofon ikonu (animate: pulse when active)
- Props: `{ onSuccess: () => void, onSkip: () => void }`

Başarı: Bileşen render oluyor, butonlar tıklanabilir (henüz mantık yok).

---

**[T-1331-2] Mikrofon izni + WebSpeech dinleme**
```
Süre: 1.5 saat
Bağımlılık: T-1331-1
Dosya: app/src/components/onboarding/OnboardingVoiceStep.tsx
```
Yapılacak: Mikrofon izni akışı.
- "Şimdi Dene" tıklanınca: `navigator.mediaDevices.getUserMedia({ audio: true })`
- İzin verildi → `useSpeechRecognition` hook'u başlat
- İzin reddedildi → "Mikrofonsuz Devam Et" butonu göster
- NFR-COMP-002: WebSpeech API — ses verisi client-side'da kalıyor

Başarı: "Şimdi Dene" tıklanınca tarayıcı mikrofon izni soruyor.

---

**[T-1331-3] "deepslide" kelime eşleştirme + yeşil onay animasyonu**
```
Süre: 1.5 saat
Bağımlılık: T-1331-2
Dosya: app/src/components/onboarding/OnboardingVoiceStep.tsx
```
Yapılacak: Kelime eşleştirme mantığı.
- `keywordMatcher.ts` ile "deepslide" hedef kelimesini eşleştir
- Eşleşme: Framer Motion ile yeşil onay animasyonu (scale: 0 → 1, 300ms)
- Eşleşme sonrası 1sn bekle → `onSuccess()` çağır
- Pazar Araştırması: Ses adımının tamamlanması kritik (görmezden gelinen kullanıcılar %70 daha düşük retention)

Başarı: "deepslide" söylenince yeşil tik animasyonu çıkıyor, 1sn sonra adım 3'e geçiyor.

---

**[T-1331-4] Mikrofon reddi fallback akışı**
```
Süre: 1 saat
Bağımlılık: T-1331-2
Dosya: app/src/components/onboarding/OnboardingVoiceStep.tsx
```
Yapılacak: Mikrofon olmadan devam akışı.
- İzin reddedilince: "Mikrofonsuz Devam Et" butonu + açıklama
- "Ses kontrolü nasıl çalışır?" detay linki (sonradan doldurulacak)
- "Mikrofonsuz Devam Et" → `onSkip()` çağırır

Başarı: Mikrofon reddedilince kullanıcı onboarding'i tamamlayabiliyor, hata ekranında takılmıyor.

---

#### WBS-1.1.3.4.1: Pro Trial Tetikleme (2 mikro-görev)

---

**[T-1341-1] Pro trial Firestore yazma fonksiyonu**
```
Süre: 1 saat
Bağımlılık: T-1321-4
Dosya: app/src/lib/billing/trial.ts (YENİ)
```
Yapılacak: Trial aktivasyon fonksiyonu.
- `activateTrial(userId: string): Promise<void>`
- Firestore: `users/{userId}` → `trialEndDate: now + 3 gün`, `plan: "trial"`
- Sadece Free kullanıcıya çalışır (plan kontrolü yap)
- Trial bitiş tarihi kontrolü için `isTrialActive(userId)` helper

Başarı: `activateTrial` çağrısı sonrası Firestore'da `trialEndDate` belirleniyor.

---

**[T-1341-2] Adım 3'e Pro trial UI entegrasyonu**
```
Süre: 1 saat
Bağımlılık: T-1341-1, T-1321-4
Dosya: app/src/components/onboarding/OnboardingStep3Create.tsx
```
Yapılacak: Trial teklif UI.
- Free kullanıcı ise: "3 Gün Ücretsiz Pro Dene" kartı + özellik listesi
- "Başla" → `activateTrial` çağrısı → toast "Pro aktif! 3 gün"
- "Hayır Teşekkürler" → modal kapanır
- Pro kullanıcıya bu kart gösterilmez

Başarı: Free kullanıcı "Başla" tıklayınca Pro özelliklere erişiyor; Pro kullanıcı adım 3'te teklif görmüyor.

---

#### 🚧 QG-3 — Onboarding
```
git commit "feat: onboarding flow + voice test + pro trial"
/clear → 1.1.4'e geç
```

---

### BÖLÜM 1.1.4 — Presenter Notes (Sprint 2, Sıralı Zincir)

#### WBS-1.1.4.1.1: Firestore Notlar CRUD (3 mikro-görev)

---

**[T-1411-1] Note TypeScript tipi + Firestore yolu tasarımı**
```
Süre: 1 saat
Bağımlılık: —
⚡ Paralel: T-1311-1 ile aynı anda
Dosya: app/src/types/note.ts (YENİ)
```
Yapılacak: Not veri modelini tasarla.
- `SlideNote` interface: `slideId`, `presentationId`, `text` (max 1000kr), `updatedAt`
- Firestore yolu: `presentations/{presentationId}/notes/{slideId}`
- Güvenlik kuralı tasarımı (kod değil, yorum olarak belirt): sadece sunum sahibi erişebilir

Başarı: Tip tanımı doğru, Firestore yol yapısı comment'ta açıklanmış.

---

**[T-1411-2] saveNote + getNote fonksiyonları**
```
Süre: 1.5 saat
Bağımlılık: T-1411-1
Dosya: app/src/lib/db/notes.ts (YENİ)
```
Yapılacak: Not CRUD fonksiyonları.
- `saveNote(presentationId, slideId, text)`: `setDoc` ile yaz, `text.substring(0, 1000)` limit
- `getNote(presentationId, slideId)`: `getDoc` ile oku
- `subscribeToNote(presentationId, slideId, callback)`: `onSnapshot` real-time listener
- Pazar Araştırması: WebSocket yaklaşımı Firestore RTDB için, 50ms vs 500ms latency — `onSnapshot` Firestore'da WebSocket kullanıyor, tercih et

Başarı: `saveNote` yazıyor, `getNote` doğru notu döndürüyor.

---

**[T-1411-3] Firestore security rules — notes koleksiyonu**
```
Süre: 1 saat
Bağımlılık: T-1411-2
Dosya: firestore.rules
```
Yapılacak: Notes için güvenlik kuralı.
- `presentations/{presentationId}/notes/{slideId}` → sadece `presentations/{presentationId}` sahibi okuyup yazabilir
- NFR-SEC-001: Başka kullanıcı 403 almalı
- Test: Firebase emülatörü ile kural testi (varsa)

Başarı: Farklı userId ile `getNote` çağrısı 403/permission-denied fırlatıyor.

---

#### WBS-1.1.4.2.1: Editörde Not Paneli UI (4 mikro-görev)

---

**[T-1421-1] SlideNotePanel bileşen iskeleti**
```
Süre: 1 saat
Bağımlılık: T-1411-2
Dosya: app/src/components/notes/SlideNotePanel.tsx (YENİ)
```
Yapılacak: Not paneli iskeleti.
- Props: `{ slideId: string, presentationId: string }`
- Textarea (max 1000kr sayacı: "750/1000")
- "Kaydet" butonu
- Panel açık/kapalı toggle (chevron ikonu)
- Min font size 18px (NFR-USE-003)

Başarı: Panel render oluyor, textarea karakter sayacı çalışıyor.

---

**[T-1421-2] Not yükleme + kaydetme mantığı**
```
Süre: 1.5 saat
Bağımlılık: T-1421-1
Dosya: app/src/components/notes/SlideNotePanel.tsx
```
Yapılacak: CRUD entegrasyonu.
- `slideId` değişince: `getNote` çağrısı → textarea'ya yükle
- `useEffect` dependency: `[slideId, presentationId]`
- "Kaydet" → `saveNote` → "Kaydedildi ✓" toast (3sn)
- Autosave: 2sn debounce ile kayıt (kullanıcı yazmayı bırakınca)

Başarı: Slayt değişince not otomatik yükleniyor, yazıp 2sn bekleyince otomatik kaydediliyor.

---

**[T-1421-3] Editör sayfasına not paneli entegrasyonu**
```
Süre: 1 saat
Bağımlılık: T-1421-2
Dosya: app/src/app/presentation/[id]/page.tsx
```
Yapılacak: Editör layout'una not paneli ekle.
- Alt panel olarak: editörün altında açılır/kapanır bölüm
- Aktif slayt ID'sini `SlideNotePanel`'e geç
- Not paneli hiçbir şekilde canvas veya sunum ekranına sızmaz (sadece editörde)

Başarı: Editörde "Not Ekle" toggle'a tıklayınca not paneli açılıyor, slayt değişince farklı not yükleniyor.

---

**[T-1421-4] Not paneli izolasyon testi (not sunum moduna sızmaz)**
```
Süre: 1 saat
Bağımlılık: T-1421-3
Dosya: app/src/app/presentation/[id]/present/page.tsx (kontrol)
```
Yapılacak: Sunum modunda not görünmediğini doğrula.
- `/present/[id]` sayfasını aç, not alanı DOM'da yok mu kontrol et
- Playwright veya manual: Editörde not kaydet → sunum modunu aç → not görünmüyor
- Ekran paylaşımı veya kayıt sırasında notun görünmediğini belgeye not olarak ekle

Başarı: Sunum modu açıkken hiçbir not metni ekranda görünmüyor, DOM'da not bileşeni yok.

---

#### WBS-1.1.4.3.1: /present/[id]/notes Sayfası (5 mikro-görev)

---

**[T-1431-1] /notes route + sayfa iskeleti**
```
Süre: 1 saat
Bağımlılık: T-1411-3
Dosya: app/src/app/presentation/[id]/notes/page.tsx (YENİ)
```
Yapılacak: Presenter View sayfası iskeleti.
- Route: `/presentation/[id]/notes`
- Mobil odaklı: header/navbar YOK, sadece içerik
- Auth kontrolü: `currentUser.uid !== presentation.userId` → redirect 403
- Tailwind: sade, büyük font, koyu tema (gece ortamı için)

Başarı: URL açılıyor, auth kontrolü çalışıyor, başka kullanıcı erişemiyor.

---

**[T-1431-2] RTDB aktif slayt dinleyicisi**
```
Süre: 1.5 saat
Bağımlılık: T-1431-1
Dosya: app/src/app/presentation/[id]/notes/page.tsx
```
Yapılacak: Firebase RTDB ile aktif slayt senkronizasyonu.
- RTDB yolu: mevcut `/presentations/${id}/activeSlide` (present modundaki yolun aynısı)
- `onValue` listener ile aktif slayt ID'si değişince notu güncelle
- Pazar Araştırması: WebSocket/RTDB latency <50ms — 500ms NFR hedefi kolaylıkla karşılanacak

Başarı: Sunum modunda slayt değişince /notes sayfası 500ms içinde güncelleniyor.

---

**[T-1431-3] Aktif slayt notu gösterimi**
```
Süre: 1 saat
Bağımlılık: T-1431-2, T-1411-2
```
Yapılacak: Not içeriğini mobil ekranda göster.
- `getNote(presentationId, activeSlideId)` çağır
- Font: `text-xl` minimum (NFR-USE-003: min 18px)
- Scroll: not uzunsa scroll edilebilir
- Boş not: "Bu slayt için not yok" placeholder

Başarı: Telefon ekranında not okunabilir büyüklükte görünüyor.

---

**[T-1431-4] Sonraki slayt önizlemesi + geçen süre sayacı**
```
Süre: 1 saat
Bağımlılık: T-1431-3
Dosya: app/src/app/presentation/[id]/notes/page.tsx
```
Yapılacak: Ek presenter bilgileri.
- Sonraki slayt thumbnail (küçük, sağ üst köşe)
- Geçen süre sayacı: sunum başladığında başlar (RTDB'deki `startedAt` timestamp'ten)
- Format: `MM:SS`

Başarı: Sayfa üstte geçen süre, yan tarafta sonraki slayt önizlemesi gösteriyor.

---

**[T-1431-5] Responsive test + 375px mobil kontrol**
```
Süre: 1 saat
Bağımlılık: T-1431-4
Dosya: app/src/app/presentation/[id]/notes/page.tsx
```
Yapılacak: Mobil responsive düzeltmeleri.
- Chrome DevTools 375px iPhone SE boyutunda test
- Overflow, text truncation, scroll sorunlarını düzelt
- Landscape modu test: not metni hâlâ okunabilir
- Pazar Araştırması: Minimum 10×10cm QR → bu sayfada QR de gösterilecekse (T-1161 bağlantısı)

Başarı: 375px genişlikte sayfa tamamen kullanılabilir, overflow sorunu yok.

---

#### WBS-1.1.4.4.1: Presenter View Butonu (2 mikro-görev)

---

**[T-1441-1] Sunum toolbar'ına "Presenter View" butonu**
```
Süre: 1.5 saat
Bağımlılık: T-1431-1
Dosya: app/src/app/presentation/[id]/present/page.tsx
```
Yapılacak: Toolbar butonu ekle.
- Lucide `Monitor` ikonu + "Presenter View" etiketi
- Tıklanınca: `window.open('/presentation/${id}/notes', '_blank')` yeni sekme

Başarı: Buton toolbar'da görünüyor, tıklanınca /notes yeni sekmede açılıyor.

---

**[T-1441-2] QR ile /notes URL paylaşımı**
```
Süre: 1 saat
Bağımlılık: T-1441-1, T-1161-1 (QR bileşeni mevcut olmalı)
Dosya: app/src/app/presentation/[id]/present/page.tsx
```
Yapılacak: Presenter View'u QR ile paylaş.
- "QR ile Aç" seçeneği → `/presentation/${id}/notes` URL'li QR kodu
- Mevcut QR bileşenini yeniden kullan (T-1161 serisi)
- Telefon QR tarayınca /notes sayfası açılmalı

Başarı: QR tarındığında telefonda /notes sayfası açılıyor.

---

#### 🚧 QG-4 — Presenter Notes
```
git commit "feat: presenter notes + view"
/clear → sprint 2 tamamlandı
```

---

### BÖLÜM 1.1.5 — Tek Tık Kayıt (Sprint 1, Paralel Grup A)

#### WBS-1.1.5.1.1: Otomatik Codec Seçimi (3 mikro-görev)

---

**[T-1511-1] codecDetector.ts'i incele + otomatik seçim fonksiyonu**
```
Süre: 1 saat
Bağımlılık: —
⚡ Paralel: T-1111-1, T-1171-1 ile aynı anda
Dosya: app/src/lib/recording/codecDetector.ts (SADECE OKU, değiştirme)
       app/src/lib/recording/recordingService.ts
```
Yapılacak: Mevcut `codecDetector.ts`'i oku, `getBestCodec()` wrapper ekle.
- `getBestCodec(): 'vp9' | 'h264' | 'vp8'` → VP9 → H264 → VP8 sırasıyla dene
- Pazar Araştırması: Loom yaklaşımı — VP9 tercih (küçük dosya), Safari H264 fallback
- `codecDetector.ts`'e DOKUNMA — sadece `recordingService.ts`'ten çağır

Başarı: `getBestCodec()` Chrome'da "vp9", Safari'de "h264" döndürüyor (console.log ile doğrula).

---

**[T-1511-2] RecordingButton codec UI kaldır**
```
Süre: 1.5 saat
Bağımlılık: T-1511-1
Dosya: app/src/components/recording/RecordingButton.tsx
```
Yapılacak: Codec seçim UI'ını kaldır, otomatik seçime geç.
- Mevcut codec seçim dropdown/modal/step → KALDIR
- "REC" tıklanınca → `getBestCodec()` → kayıt başlar
- Tek bildirim: "Kayıt başladı" toast
- Safari'de H264 seçildiğinde ek uyarı VERME (kullanıcı görmemeli)

Başarı: REC butonuna tıklanınca sıfır codec dialog — kayıt hemen başlıyor.

---

**[T-1511-3] Codec seçim loglama (debug için)**
```
Süre: 0.5 saat (30dk)
Bağımlılık: T-1511-2
Dosya: app/src/lib/recording/recordingService.ts
```
Yapılacak: Sessiz debug logu ekle.
- `console.debug('[Codec] Selected:', codec, 'Browser:', navigator.userAgent)`
- Production'da log çalışır ama kullanıcıya gösterilmez
- QG-5 testinde bu logu kullanarak doğrulama yapılacak

Başarı: Tarayıcı konsolunda `[Codec] Selected: vp9` veya `h264` görünüyor.

---

#### WBS-1.1.5.2.1: Upload Sonrası Otomatik Link Kopyalama (2 mikro-görev)

---

**[T-1521-1] Upload tamamlanma event + clipboard API**
```
Süre: 1.5 saat
Bağımlılık: T-1511-2
Dosya: app/src/components/recording/UploadProgress.tsx
```
Yapılacak: Upload %100 tamamlanınca clipboard'a yaz.
- Upload completion callback'i bul (S3 upload %100)
- `navigator.clipboard.writeText(shareUrl)` çağır
- "Link Kopyalandı ✓" toast 3sn göster
- Ek modal AÇILMAZ (mevcut ShareLinkModal açılıyorsa kaldır/bypass et)

Başarı: Upload %100'de toast görünüyor, `navigator.clipboard.writeText` çağrısı gözlemlenebiliyor.

---

**[T-1521-2] Clipboard izin reddedildi fallback**
```
Süre: 1 saat
Bağımlılık: T-1521-1
Dosya: app/src/components/recording/UploadProgress.tsx
```
Yapılacak: Clipboard erişilemezse fallback.
- `clipboard.writeText` hata fırlatırsa: "Link kopyalanamadı — [URL]" toast ile linki göster
- Kullanıcı manuel kopyalayabilmeli
- HTTPS dışı ortamda (localhost) `clipboard` API çalışmayabilir — kontrol et

Başarı: HTTP ortamında veya izin reddedilince link toast'ta görünüyor, kopyalanamadı hatası kullanıcıyı engellemez.

---

#### 🚧 QG-5 — Tek Tık Kayıt
```
git commit "feat: one-click recording"
/clear → QR bölümüne geç
```

---

### BÖLÜM 1.1.6 — QR Kod Paylaşım (Sprint 1, Paralel Grup B)

#### WBS-1.1.6.1.1: Sunum Toolbar QR Butonu + Overlay (4 mikro-görev)

---

**[T-1611-1] QRShareOverlay bileşen iskeleti**
```
Süre: 1 saat
Bağımlılık: —
⚡ Paralel: T-1211-1, T-1181-1 ile aynı anda
Dosya: app/src/components/presentation/QRShareOverlay.tsx (YENİ)
```
Yapılacak: QR overlay bileşen iskeleti.
- Mevcut `QRCodeDisplay.tsx`'i incele — pattern'ı kopyala
- Props: `{ url: string, isOpen: boolean, onClose: () => void }`
- Tam ekran overlay: `fixed inset-0 bg-black/90`
- QR kodu merkez, altında URL metni
- 10sn timer ile otomatik kapanma
- Pazar Araştırması: min 10×10cm ekranda → 1024px ekranda ~380px QR boyutu

Başarı: Overlay açılıyor, URL prop'una göre QR render oluyor.

---

**[T-1611-2] qrcode.react entegrasyonu + boyut hesabı**
```
Süre: 1.5 saat
Bağımlılık: T-1611-1
Dosya: app/src/components/presentation/QRShareOverlay.tsx
```
Yapılacak: Gerçek QR kodunu render et.
- `qrcode.react` (zaten yüklü) ile `/r/${shareKey}` URL'li QR
- Boyut: `size={380}` (NFR-PERF-003: <200ms render)
- Level: `"M"` (hata düzeltme dengesi)
- Pazar Araştırması: Minimum 10cm×10cm at 1m — 380px bu koşulu karşılıyor
- `renderTime` ölç: `performance.now()` ile

Başarı: QR <200ms'de render oluyor, `performance.now()` logu bunu gösteriyor.

---

**[T-1611-3] KVKK bildirimi first-time akışı**
```
Süre: 1.5 saat
Bağımlılık: T-1611-2
Dosya: app/src/components/presentation/QRShareOverlay.tsx
```
Yapılacak: İlk kullanımda KVKK bildirimi.
- localStorage'da `deepslide_qr_kvkk_v1_${userId}` flag kontrolü
- Flag yoksa: QR öncesi küçük bildirim: "İzleyici verisi toplanmaz — KVKK uyumlu"
- "Anladım" → flag yaz → QR göster
- Flag varsa: direkt QR göster (bir daha sorma)
- NFR-COMP-001: İzleyici IP/cihaz verisi ASLA loglanmaz

Başarı: İlk kullanımda KVKK bildirimi çıkıyor, ikincisinde çıkmıyor, network tab'da izleyici verisi isteği yok.

---

**[T-1611-4] QR butonu sunum toolbar'ına entegre**
```
Süre: 1 saat
Bağımlılık: T-1611-3
Dosya: app/src/app/presentation/[id]/present/page.tsx
```
Yapılacak: Toolbar'a QR butonu ekle.
- Lucide `QrCode` ikonu
- Pro kullanıcı → QRShareOverlay aç
- Free kullanıcı → "Pro özelliği" badge + upgrade yönlendirme
- 10sn timer için `useEffect` cleanup (unmount'ta timer temizle)

Başarı: QR buton toolbar'da görünüyor, Pro'da overlay açılıyor, Free'de badge gösteriliyor.

---

#### 🚧 QG-6 — QR Kod
```
git commit "feat: qr share + kvkk"
/clear → thumbnail navigasyona geç
```

---

### BÖLÜM 1.1.7 — Thumbnail Navigasyon (Sprint 1, Paralel Grup A)

#### WBS-1.1.7.1.1: Sol Panel Thumbnail Listesi (4 mikro-görev)

---

**[T-1711-1] SlideThumbnailPanel bileşen iskeleti**
```
Süre: 1 saat
Bağımlılık: —
⚡ Paralel: T-1111-1, T-1511-1 ile aynı anda
Dosya: app/src/components/canvas/SlideThumbnailPanel.tsx (YENİ)
```
Yapılacak: Thumbnail panel iskeleti.
- Props: `{ images: Image[], activeSlideId: string, onSlideSelect: (id) => void }`
- Dikey liste container: `w-24 flex flex-col gap-1 overflow-y-auto`
- Pazar Araştırması: Prezi 80×60px thumbnail standardı → kullan
- "Zoom to Frame" etiketi: her thumb altında `text-xs truncate`

Başarı: Panel render oluyor, props geçilince liste oluşuyor.

---

**[T-1711-2] Thumbnail görsel render + lazy-load**
```
Süre: 1 saat
Bağımlılık: T-1711-1
Dosya: app/src/components/canvas/SlideThumbnailPanel.tsx
```
Yapılacak: Her thumbnail'i göster.
- `<img>` veya Next.js `<Image>` ile thumbnail
- `loading="lazy"` attribute
- `object-fit: cover`, 80×60px, `rounded-sm`
- Pazar Araştırması: 1280×720px kaynak görsel WebP → 80×60 thumbnail optimize
- Mevcut görsel URL'lerini kullan (yeni upload yok)

Başarı: Görseller lazy-load ile yükleniyor, layout shift yok.

---

**[T-1711-3] Aktif slayt vurgusu + Framer Motion**
```
Süre: 1 saat
Bağımlılık: T-1711-2
Dosya: app/src/components/canvas/SlideThumbnailPanel.tsx
```
Yapılacak: Aktif slayt görsel vurgusu.
- Aktif slayt: `ring-2 ring-blue-500 scale-105` (Tailwind)
- `layoutId` ile Framer Motion ring animasyonu
- Slayt numarası: `text-xs text-center` altında (1, 2, 3...)

Başarı: Aktif slayt mavi çerçeve ile vurgulanıyor, slayt değişince animasyonlu geçiş.

---

**[T-1711-4] react-virtuoso entegrasyonu (50+ slayt)**
```
Süre: 1.5 saat
Bağımlılık: T-1711-3
Dosya: app/src/components/canvas/SlideThumbnailPanel.tsx
```
Yapılacak: Büyük listeler için sanallaştırma.
- `react-virtuoso` (zaten yüklü) ile `VList` veya `Virtuoso`
- 50+ slayta sahip test sunumu oluştur (veya mock array)
- 10 slayt: normal render | 50+ slayt: virtualize
- Kaydırma sırasında aktif slayt görünür alanda kalmalı (`scrollIntoView`)

Başarı: 100 slaytla panelde scroll pürüzsüz, FPS düşmüyor (Chrome DevTools perf profil).

---

#### WBS-1.1.7.2.1: Thumbnail → Canvas Scroll Senkronizasyonu (3 mikro-görev)

---

**[T-1721-1] Thumbnail tıklama → canvas scroll**
```
Süre: 1.5 saat
Bağımlılık: T-1711-4
Dosya: app/src/app/presentation/[id]/page.tsx
```
Yapılacak: Thumbnail'a tıklayınca canvas'ta o slayd scroll et.
- Her slayt DOM elementine `id="slide-${slideId}"` ekle (zaten varsa kontrol et)
- Thumbnail tıklanınca: `document.getElementById('slide-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })`
- 300ms smooth scroll (NFR-USE-002)

Başarı: Thumbnail tıklanınca canvas 300ms smooth scroll ile o slayda geliyor.

---

**[T-1721-2] URL hash güncelleme + klavye navigasyonu**
```
Süre: 1 saat
Bağımlılık: T-1721-1
Dosya: app/src/app/presentation/[id]/page.tsx
```
Yapılacak: URL ve klavye desteği.
- Thumbnail seçilince: `history.pushState(null, '', '#slide-' + slideId)`
- Thumbnail panelinde klavye ok tuşları: `↑` önceki, `↓` sonraki slayt
- `onKeyDown` event handler, `tabIndex={0}` panel wrapper'a

Başarı: URL'de `#slide-3` güncelleniyor, ok tuşlarıyla thumbnail paneli navigate edilebiliyor.

---

**[T-1721-3] Editör layout'una SlideThumbnailPanel entegrasyonu**
```
Süre: 1 saat
Bağımlılık: T-1721-2
Dosya: app/src/app/presentation/[id]/page.tsx
```
Yapılacak: Paneli editör sol tarafına yerleştir.
- Editör layout: `flex flex-row` → `[SlideThumbnailPanel | Canvas]`
- Panel genişliği: `w-24` sabit
- Mobil: panel gizli (sadece masaüstü)
- Prezi pattern: panel her zaman görünür (toggle yok)

Başarı: Editör açılınca sol tarafta thumbnail panel, sağda canvas, mobilde panel yok.

---

#### 🚧 QG-7 — Thumbnail Navigasyon
```
git commit "feat: thumbnail panel navigation"
/clear → pre-check bölümüne geç
```

---

### BÖLÜM 1.1.8 — Sunum Öncesi Check (Sprint 1, Paralel Grup B)

#### WBS-1.1.8.1.1: Pre-Sunum Check Ekranı UI (4 mikro-görev)

---

**[T-1811-1] PrePresentationCheck bileşen iskeleti**
```
Süre: 1 saat
Bağımlılık: —
⚡ Paralel: T-1211-1, T-1611-1 ile aynı anda
Dosya: app/src/components/presentation/PrePresentationCheck.tsx (YENİ)
```
Yapılacak: Pre-check ekranı iskeleti.
- Route/Modal: Sunum başlatma butonu → pre-check → sunum modu
- Props: `{ presentation: Presentation, onStart: () => void, onSkip: () => void }`
- Başlık: "Sunuma Hazır mısınız?"
- "Başla" + "Atla" butonları (her zaman görünür)

Başarı: Bileşen render oluyor, "Atla" ile direkt sunuma geçiliyor.

---

**[T-1811-2] İlk 3 slayt keyword listesi**
```
Süre: 1 saat
Bağımlılık: T-1811-1
Dosya: app/src/components/presentation/PrePresentationCheck.tsx
```
Yapılacak: Keyword listesini göster.
- `presentation.images[0..2]` → her slaytın keyword array'ini al
- Her keyword için: `{ text: string, matched: boolean }` state
- Başlangıçta tüm `matched: false` (beyaz badge)
- Eşleşince: `matched: true` (yeşil badge)

Başarı: İlk 3 slaytın keyword'leri listeleniyor, başlangıçta hepsi beyaz.

---

**[T-1811-3] useSpeechRecognition entegrasyonu + keyword eşleştirme**
```
Süre: 1.5 saat
Bağımlılık: T-1811-2
Dosya: app/src/components/presentation/PrePresentationCheck.tsx
```
Yapılacak: Ses eşleştirme mantığı.
- `useSpeechRecognition` hook'u başlat
- Tanınan kelimeler → `keywordMatcher.ts` ile eşleştir
- Eşleşen keyword state'i `matched: true` yap + Framer Motion renk geçişi
- Max 2 dakika timeout → "Hazırsın!" mesajı

Başarı: Bir keyword söylenince badge yeşile dönüyor.

---

**[T-1811-4] Max 2 dakika timer + otomatik "Hazırsın"**
```
Süre: 1 saat
Bağımlılık: T-1811-3
Dosya: app/src/components/presentation/PrePresentationCheck.tsx
```
Yapılacak: Timer ve tamamlama mantığı.
- `useEffect` ile 120sn sayaç (ekranda gösterilebilir: "1:45 kaldı")
- 120sn dolunca: "Hazırsın! Sunuma geçildi." toast → `onStart()` çağır
- Tüm keyword'ler eşleşince de: "Hazırsın!" → `onStart()` otomatik çağır

Başarı: 120sn sonra veya tüm keyword'ler yeşil olunca otomatik sunum başlıyor.

---

#### WBS-1.1.8.2.1: Hazırlık Skoru (2 mikro-görev)

---

**[T-1821-1] Skor hesaplama fonksiyonu**
```
Süre: 1 saat
Bağımlılık: T-1811-3
Dosya: app/src/components/presentation/PrePresentationCheck.tsx
```
Yapılacak: Hazırlık yüzdesi hesapla.
- `matchedCount / totalKeywordCount * 100` → tamsayı yüzde
- `≥80%` → yeşil | `60-79%` → sarı | `<60%` → turuncu
- Format: "%85 hazırsın — 17/20 keyword eşleşti"

Başarı: Skor doğru hesaplanıyor, renk eşiği değerleri çalışıyor.

---

**[T-1821-2] Skor gösterim UI + renk kodlama**
```
Süre: 1 saat
Bağımlılık: T-1821-1
Dosya: app/src/components/presentation/PrePresentationCheck.tsx
```
Yapılacak: Skor gösterimi.
- Büyük yüzde sayısı: Framer Motion count-up animasyonu
- Renk: Tailwind `text-green-500` / `text-yellow-500` / `text-orange-500`
- Alt metin: "X/Y keyword eşleşti"
- Tamamlanınca: "Sunuma Başla" butonu belirginleşir (yeşil)

Başarı: "%85 hazırsın" yeşil, "%55 hazırsın" turuncu, count-up animasyonu çalışıyor.

---

#### 🚧 QG-8 — Pre-Check
```
git commit "feat: pre-presentation check"
/clear → QG-9 (Faz 1 Final) için hazırlık
```

---

### 🚧 QG-9 — FAZ 1 TAMAMLAMA (E2E + REGRESSION) ⭐ KRİTİK

```
Test sırası:
1. Dashboard: Hover butonlar → edit, share, klonla, sil
2. Klasör: Oluştur → sunumu taşı → arama filtresi
3. Klonlama: Kart menüsünden → 5sn → yeni kart
4. Onboarding: İlk giriş → 3 adım → ses testi → Pro teklifi
5. Presenter Notes: Editörde not yaz → /notes'da görünür (500ms)
6. Tek Tık Kayıt: REC → kayıt → upload → link panoya
7. QR: Sunum sırasında QR overlay → KVKK onayı → taranabilir
8. Thumbnail Nav: Sol panel → tıkla → smooth scroll
9. Pre-Check: Sunum öncesi → keyword → skor

REGRESYON:
- Ses kontrollü sunum çalışıyor
- AI analiz (Gemini) çalışıyor
- Mevcut kayıt sistemi çalışıyor
- Canlı yayın toggle çalışıyor
- Quiz QR çalışıyor

PERFORMANS:
- Dashboard p95 < 1.5sn
- QR render < 200ms

→ Geçince: git tag faz-1-complete
```

---

## FAZ 2 MİKRO-GÖREV ANAHATLAR (Sprint 3-6)

> Faz 2 görevleri Faz 1 tamamlanınca detaylanacak. Aşağıdaki anahatlar öncelik sırası içindir.

| WBS-ID | Özellik | Pazar Araştırması Bağlamı | Tahmini Mikro-Görev |
|--------|---------|--------------------------|---------------------|
| WBS-1.2.1.1 | AI Spike — Vektör embedding | Gamma: modular "card" yaklaşımı, <30sn deck oluşturma | 3 (araştırma+POC) |
| WBS-1.2.1.2 | AI Sihirbazı MVP (keyword-only) | $4.7B AI sunum pazarı | 4 |
| WBS-1.2.1.3 | AI Wizard UI | Gamma wizard pattern | 3 |
| WBS-1.2.2.1 | Şablon veritabanı | Canva template marketplace | 3 |
| WBS-1.2.2.2 | Şablon seçim UI | Beautiful.ai auto-layout | 3 |
| WBS-1.2.3.1 | Privacy Shield ayarları | Password protection, TTL | 4 |
| WBS-1.2.3.2 | Şifre doğrulama sayfası | — | 3 |
| WBS-1.2.4.1 | Viral Rozet (LinkedIn/X) | LinkedIn carousel 6.60% engagement | 3 |
| WBS-1.2.5.1 | Ses Koçu Pro (prova modu) | Microsoft Speaker Coach analizi | 5 |
| WBS-1.2.6.1 | Analytics — slayt bazlı | Pitch.com per-slide time tracking | 4 |
| WBS-1.2.7.1 | QR + Anket birleşimi | — | 5 |
| WBS-1.2.8.1 | Analytics raporu PDF | — | 3 |
| WBS-1.2.9.1 | Yıllık Konuşmacı Raporu | Wrapped format | 4 |

---

## ÖZET TABLO

```
MİKRO-GÖREV ÖZETİ (FAZ 1)
===========================
Toplam mikro-görev:          74
Paralel başlanabilecek:      8 grup (Sprint 1'de 3 paralel iş parçacığı)
Sıralı zincir:               Onboarding (4) + Presenter Notes (4) = 8 zorunlu sıralı
Quality Gate:                9 adet
Context temizleme noktası:   Her QG = /clear = 9 nokta
Tahmini toplam süre:         ~80-90 saat (çoğu paralel çalışılırsa 40-50 saat net)

SPRINT DAĞILIMI:
Sprint 1 (Paralel 3 iş parçacığı):
  - Grup A: T-1111-x + T-1112-x + T-1121-x + T-1122-x + T-1123-x + T-1131-x
  - Grup B: T-1511-x + T-1521-x
  - Grup C: T-1711-x + T-1721-x
  - Ek bağımsız: T-1211-x, T-1611-x, T-1811-x, T-1821-x

Sprint 2 (Sıralı zincirler):
  - Zincir A: T-1311-x → T-1321-x → T-1331-x → T-1341-x (Onboarding)
  - Zincir B: T-1411-x → T-1421-x → T-1431-x → T-1441-x (Presenter Notes)
  - QG-9 (Faz 1 Final E2E)

KRITIK YOL (en uzun sıralı zincir):
T-1121-1 → T-1121-2 → T-1121-3 → T-1121-4 → T-1122-1 → T-1122-2 →
T-1122-3 → T-1122-4 → T-1123-1 → T-1123-2 → T-1123-3 → T-1131-1 →
T-1131-2 → T-1131-3 → QG-1
```

---

## BAĞIMLILIK HIZLI BAŞVURU

```
T-1111-1 → T-1111-2 → T-1111-3 → T-1111-4 → T-1111-5
                                              ↓
                              T-1112-1 → T-1112-2
                              
T-1121-1 → T-1121-2 → T-1121-3 → T-1121-4
                                    ↓
           T-1122-1 → T-1122-2 → T-1122-3 → T-1122-4
                                                ↓
T-1111-4 + T-1121-3 → T-1123-1 → T-1123-2 → T-1123-3
                                                ↓
T-1111-5 + T-1123-3 → T-1131-1 → T-1131-2 → T-1131-3 → QG-1

T-1211-1 → T-1211-2 → T-1211-3 
T-1211-1 → T-1211-4 (test, paralel)
[T-1111-5 + T-1211-x tamamlanınca] → QG-2

T-1311-1 → T-1311-2 → T-1321-1 → T-1321-2 → T-1321-3 → T-1321-4 → T-1321-5
                                  → T-1331-1 → T-1331-2 → T-1331-3 → T-1331-4
                                  → T-1341-1 → T-1341-2 → QG-3

T-1411-1 → T-1411-2 → T-1411-3
                         ↓
           T-1421-1 → T-1421-2 → T-1421-3 → T-1421-4
                                               ↓
           T-1431-1 → T-1431-2 → T-1431-3 → T-1431-4 → T-1431-5
                                                           ↓
                               T-1441-1 → T-1441-2 → QG-4

T-1511-1 → T-1511-2 → T-1511-3
T-1511-2 → T-1521-1 → T-1521-2 → QG-5

T-1611-1 → T-1611-2 → T-1611-3 → T-1611-4 → QG-6

T-1711-1 → T-1711-2 → T-1711-3 → T-1711-4
                                    ↓
           T-1721-1 → T-1721-2 → T-1721-3 → QG-7

T-1811-1 → T-1811-2 → T-1811-3 → T-1811-4
                                    ↓
           T-1821-1 → T-1821-2 → QG-8

[QG-1 + QG-2 + QG-3 + QG-4 + QG-5 + QG-6 + QG-7 + QG-8] → QG-9 (Faz 1 Tam)
```
