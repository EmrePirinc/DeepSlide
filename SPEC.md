<!-- Copyright (c) 2026 Emre Pirinc. All rights reserved. -->
<!-- Licensed under the Business Source License 1.1 -->

# SPEC.md — DeepSlide Faz 2B
**Proje:** DeepSlide  
**Tarih:** 2026-04-09  
**Kaynak:** BB#4 Toplantı Tutanağı (2026-04-08)  
**Durum:** /bap çıktısı — /wbs girdi belgesi

---

## KABUL EDİLEN ÖZELLİKLER (BB#4 Sıralaması)

| # | Özellik | RICE | Faz | Kano |
|---|---------|------|-----|------|
| C | Basit Kayıt UI | 16.2 | 2A | Must-have |
| A | Offline Kayıt Altyapısı | 6.4 | 2A | Must-have |
| B | Otopilot Özet + Mail | 8.5 | 2A | Delighter |
| D | Paylaşım Linki | 4.3 | 2A | Performance |
| H | Özet+Klip+Mail Paketi | 3.3 | 2B | Delighter |
| G | Yarışma Modu | 2.2 | 2B | Delighter |
| I | Otomatik Klip Üretici | 1.3 | 2B | Delighter |
| E | Canlı Alt Yazı | 1.4 | 2B | Performance |
| F | Canlı Yayın RTMP | 1.2 | 2C | Performance |
| J | Yayın Arşivi | 1.0 | 2C | Performance |

---

## FONKSİYONEL GEREKSİNİMLER

### GRUP 1 — Video Kayıt

**FR-001: Kayıt Başlat/Durdur Kontrolü**
- Öncelik: Must
- Kaynak: BB Öneri C, JTBD-2
- Açıklama: Sistem, sunum modunda kullanıcıya tek tıkla kayıt başlatma
  ve durdurma kontrolü SAĞLAMALIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Kullanıcı sunum modundayken
  - NE ZAMAN: "● REC" butonuna tıklar
  - O ZAMAN: Kayıt 3 saniye içinde başlar, buton kırmızı yanıp söner,
    kayıt süresi (00:00:00) görünür
- Bağımlılıklar: FR-002

**FR-002: Tarayıcı-Yerel Offline-First Kayıt Altyapısı**
- Öncelik: Must
- Kaynak: BB Öneri A, JTBD-2
- Açıklama: Sistem, sunum kaydını önce IndexedDB/blob olarak lokalde
  saklayıp sunum bittikten sonra Cloudflare R2'ye yüklemek ZORUNDADIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Kayıt devam ederken internet bağlantısı kesilirse
  - NE ZAMAN: Bağlantı geri geldiğinde
  - O ZAMAN: Kayıt eksiksiz R2'ye yüklenir, kullanıcı
    "Yükleme tamamlandı" bildirimi alır; kayıp = 0 saniye
- Bağımlılıklar: FR-001, FR-003

**FR-003: Kayıt Formatı ve Codec Seçimi**
- Öncelik: Must
- Kaynak: BB Öneri A, JTBD-2
- Açıklama: Sistem, Chrome/Edge'de VP9+WebM veya H.264+MP4, Safari'de
  mikrofon-only AAC+MP4 formatında kayıt YAPABİLMELİDİR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Safari kullanıcısı kayıt başlatırsa
  - NE ZAMAN: Kayıt başlar
  - O ZAMAN: "Chrome'da tam deneyim için Chrome kullanın" banner görünür;
    sadece mikrofon sesi kaydedilir
- Bağımlılıklar: FR-001

**FR-004: Anında Paylaşım Linki Oluşturma**
- Öncelik: Should
- Kaynak: BB Öneri D, JTBD-2
- Açıklama: Sistem, R2 yükleme tamamlanınca benzersiz bir paylaşım URL'i
  (deepslide.com/r/[id]) OLUŞTURMALIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: R2 yüklemesi %100 tamamlanınca
  - NE ZAMAN: Kullanıcı "Linki Kopyala" butonuna basar
  - O ZAMAN: URL panoya kopyalanır, 7 gün geçerli, şifresiz erişim
- Bağımlılıklar: FR-002

**FR-005: Kayıt Kalite Kademesi (Freemium)**
- Öncelik: Should
- Kaynak: BB Öneri 8, JTBD-2
- Açıklama: Sistem, ücretsiz kullanıcıya 480p, Pro kullanıcıya 1080p
  kayıt kalitesi SUNMALIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Ücretsiz kullanıcı kayıt yaparsa
  - NE ZAMAN: Kayıt tamamlanır
  - O ZAMAN: Video 480p max çözünürlükte indirilir,
    "HD için Pro'ya geç" prompt görünür
- Bağımlılıklar: FR-001, FR-004

---

### GRUP 2 — AI Özet & E-posta

**FR-006: Sunum Transkript Kaydı**
- Öncelik: Must
- Kaynak: BB Öneri B, JTBD-4
- Açıklama: Sistem, sunum boyunca ses tanıma çıktısını zaman damgasıyla
  (transcript[]) KAYDETMELIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Sunum modu aktifken
  - NE ZAMAN: Kullanıcı konuşur
  - O ZAMAN: Her cümle timestamp + text olarak store'da tutulur
- Bağımlılıklar: FR-007

**FR-007: Gemini ile AI Özet Üretimi**
- Öncelik: Should
- Kaynak: BB Öneri B, JTBD-4
- Açıklama: Sistem, sunum bittikten sonra transkript + slayt geçiş
  zaman damgalarını Gemini API'ye göndererek 3-5 maddelik özet +
  aksiyon listesi ÜRETMELIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Sunum kapanır ve transkript ≥ 100 kelimedir
  - NE ZAMAN: Sistem Gemini'ye istek atar (maks 30 sn)
  - O ZAMAN: Kullanıcıya düzenlenebilir özet önizlemesi sunulur;
    "Onayla ve Gönder" adımı ZORUNLU
- Bağımlılıklar: FR-006

**FR-008: Özet E-posta Gönderimi (Resend)**
- Öncelik: Should
- Kaynak: BB Öneri B+H, JTBD-4
- Açıklama: Sistem, kullanıcının onayından sonra alıcı listesine AI özet
  + paylaşım linki içeren e-postayı Resend ile GÖNDERMELİDİR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Kullanıcı özeti onaylar, alıcı listesi ≥ 1 e-posta
  - NE ZAMAN: "Gönder" butonuna basar
  - O ZAMAN: 60 saniye içinde tüm alıcılara mail ulaşır
- Bağımlılıklar: FR-007, FR-004

**FR-009: Alıcı Listesi Yönetimi**
- Öncelik: Should
- Kaynak: BB Öneri B, JTBD-4
- Açıklama: Sistem, kullanıcının alıcı e-postalarını ekleyip
  kaydedebileceği liste yönetimi SAĞLAMALIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Kullanıcı alıcı listesi ekranındaysa
  - NE ZAMAN: E-posta adresi girilip "Ekle" denir
  - O ZAMAN: RFC 5322 ile validate edilir, kaydedilir,
    sonraki sunumlarda önerilir
- Bağımlılıklar: FR-008

**FR-010: Otomatik Klip Üretici**
- Öncelik: Could
- Kaynak: BB Öneri H+I, JTBD-2
- Açıklama: Sistem, sunum kaydından en güçlü 3 anı tespit edip
  60 saniyelik sosyal medya klibi oluşturabilmelidir.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Kayıt yüklemesi tamamlanmış
  - NE ZAMAN: "Klip Oluştur" butonuna basılır
  - O ZAMAN: ≤ 5 dakika içinde MP4 klip hazır,
    1080x1920 (Reels) veya 1920x1080 (YouTube) seçilebilir
- Bağımlılıklar: FR-002, FR-007

---

### GRUP 3 — Canlı Alt Yazı

**FR-011: Gerçek Zamanlı Alt Yazı Şeridi**
- Öncelik: Should
- Kaynak: BB Öneri E, JTBD-3
- Açıklama: Sistem, sunum sırasında konuşmacının sesini Web Speech API
  (ücretsiz) veya Deepgram (Pro) ile gerçek zamanlı transkribe edip
  ekran altında GÖSTERMELIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Alt yazı modu açık, mikrofon izni var
  - NE ZAMAN: Kullanıcı konuşur
  - O ZAMAN: Web Speech API ≤ 800ms | Deepgram ≤ 500ms gecikmede görünür
- Bağımlılıklar: FR-006

**FR-012: Çok Dilli Alt Yazı Seçimi**
- Öncelik: Could
- Kaynak: BB Öneri E+6, JTBD-3
- Açıklama: Sistem, alt yazı dilini TR/EN/DE/FR arasından seçmeye
  izin vermelidir.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Alt yazı aktif
  - NE ZAMAN: Kullanıcı dil değiştirir
  - O ZAMAN: Sonraki cümle yeni dilde transkribe edilir;
    önceki satırlar değişmez
- Bağımlılıklar: FR-011

**FR-013: SRT Altyazı Dosyası İndirme**
- Öncelik: Could
- Kaynak: BB Öneri H, JTBD-3
- Açıklama: Sistem, transkripti zaman damgalı SRT formatına dönüştürüp
  indirilebilir dosya olarak SUNMALIDİR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Sunum tamamlandı, transkript ≥ 50 kelime
  - NE ZAMAN: "SRT İndir" butonuna basılır
  - O ZAMAN: Geçerli SubRip formatında dosya indirilir
- Bağımlılıklar: FR-006

---

### GRUP 4 — Canlı Yarışma

**FR-014: AI Soru Üretimi (Slayttan)**
- Öncelik: Could
- Kaynak: BB Öneri G+5, JTBD-5
- Açıklama: Sistem, analiz tamamlanmış her slayt için Gemini ile
  1-3 çoktan seçmeli soru ÜRETEBİLMELİDİR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Slayt AI analizi tamamlanmış
  - NE ZAMAN: "Soru Üret" butonuna basılır
  - O ZAMAN: 4 seçenekli 1-3 soru ≤ 10 sn üretilir, kullanıcı düzenleyebilir
- Bağımlılıklar: FR-007

**FR-015: QR Kod İzleyici Katılımı**
- Öncelik: Could
- Kaynak: BB Öneri G+12, JTBD-5
- Açıklama: Sistem, sunum ekranında izleyicilerin okutabileceği
  QR kod GÖSTERMELİDİR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Yarışma modu aktif
  - NE ZAMAN: Sunum başlar
  - O ZAMAN: 150x150px QR kod görünür, telefon tarandığında
    katılım sayfası < 2sn açılır
- Bağımlılıklar: FR-016

**FR-016: Gerçek Zamanlı Cevap Toplama**
- Öncelik: Could
- Kaynak: BB Öneri G, JTBD-5
- Açıklama: Sistem, izleyicilerin cevaplarını Firebase Realtime DB
  üzerinden gerçek zamanlı TOPLAMALIDIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: ≤ 200 eş zamanlı katılımcı
  - NE ZAMAN: İzleyici cevap gönderir
  - O ZAMAN: Konuşmacı ekranında ≤ 1sn gecikmede grafik güncellenir
- Bağımlılıklar: FR-014, FR-015

---

### GRUP 5 — Canlı Yayın

**FR-017: WebRTC→RTMP Canlı Yayın Köprüsü**
- Öncelik: Could
- Kaynak: BB Öneri F+10, JTBD-1
- Açıklama: Sistem, RTMP stream key ile tarayıcıdan YouTube/LinkedIn
  canlı yayın başlatılabilmesine izin vermelidir (LiveKit Ingress).
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Geçerli RTMP stream key girilmiş
  - NE ZAMAN: "Yayını Başlat" butonuna basılır
  - O ZAMAN: ≤ 15 saniyede yayın aktif; kopma halinde
    otomatik kayda geçiş yapılır
- Bağımlılıklar: FR-001, FR-018

**FR-018: Yayın Öncesi Bağlantı Testi**
- Öncelik: Should
- Kaynak: BB RAID R-001, JTBD-1
- Açıklama: Sistem, canlı yayın başlamadan önce RTMP bağlantısını
  5 saniyelik test akışıyla doğrulamak ZORUNDADIR.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: Kullanıcı stream key girer
  - NE ZAMAN: "Bağlantıyı Test Et" butonuna basar
  - O ZAMAN: Başarıysa yeşil onay, başarısızsa hata kodu + çözüm önerisi
- Bağımlılıklar: FR-017

**FR-019: Yayın Arşivi ve Sunum Portalı**
- Öncelik: Won't (Faz 2C)
- Kaynak: BB Öneri J, JTBD-2
- Açıklama: Sistem, kaydedilen sunumları aranabilir arşivde tutabilmeli;
  her sunum için benzersiz portal sayfası oluşturabilmelidir.
- Kabul Kriteri:
  - VERİLDİĞİ DURUMDA: En az 1 kayıtlı sunum var
  - NE ZAMAN: Kullanıcı arşiv sayfasına gider
  - O ZAMAN: Başlık/tarih/süreye göre filtrelenebilir liste görünür
- Bağımlılıklar: FR-004, FR-007

---

## NON-FONKSİYONEL GEREKSİNİMLER

**NFR-PERF-001: Kayıt Başlatma Gecikmesi**
- Metrik: Butona basıldıktan ≤ 3 saniye içinde MediaRecorder aktif
- Kabul Kriteri: 25 Mbps, Chrome/Edge, soğuk başlatmada
- Öncelik: Kritik | İlgili FR: FR-001

**NFR-PERF-002: R2 Upload Hızı**
- Metrik: 1 saatlik 1080p (≈ 8GB) ≤ 15 dakikada yüklenir (10 Mbps)
- Kabul Kriteri: Chunked multipart, parça ≤ 500MB, paralel 3 chunk
- Öncelik: Yüksek | İlgili FR: FR-002

**NFR-PERF-003: Alt Yazı Gecikmesi**
- Metrik: Web Speech ≤ 800ms | Deepgram ≤ 500ms (p95)
- Kabul Kriteri: 10 Mbps, Türkçe, 5 dakikalık test
- Öncelik: Yüksek | İlgili FR: FR-011

**NFR-PERF-004: Gemini Özet Süresi**
- Metrik: ≤ 30 saniye (1 saatlik transkript)
- Kabul Kriteri: Timeout'ta "Tekrar dene" sunulur
- Öncelik: Orta | İlgili FR: FR-007

**NFR-SEC-001: RTMP Stream Key Şifreleme**
- Metrik: AES-256 şifreli DB, logda plain-text yok
- Kabul Kriteri: DB dump → key görünmez; API response → masked
- Öncelik: Kritik | İlgili FR: FR-017

**NFR-SEC-002: Cloudflare R2 Erişim Kontrolü**
- Metrik: Signed URL, 7 gün TTL, anonim erişim yok
- Kabul Kriteri: TTL sonrası 403; başka kullanıcı URL'i kullanamaz
- Öncelik: Kritik | İlgili FR: FR-004

**NFR-COMP-001: KVKK Ses Verisi Onayı**
- Metrik: Bulut API çağrısından önce açık onay modalı zorunlu
- Kabul Kriteri: Onay reddi → özellik devre dışı, kullanıcı kilitlenmez
- Öncelik: Kritik | İlgili FR: FR-006, FR-007, FR-011

**NFR-COMP-002: Video Saklama Süresi Politikası**
- Metrik: Ücretsiz 30 gün | Pro 1 yıl | Sonrası otomatik silinir
- Kabul Kriteri: Silme öncesi 7 gün e-posta uyarısı
- Öncelik: Yüksek | İlgili FR: FR-004, FR-019

**NFR-SCALE-001: Yarışma Eş Zamanlı Katılımcı**
- Metrik: ≤ 200 eş zamanlı katılımcı, ≤ 1sn gecikme
- Kabul Kriteri: 200 bot simülasyonu yük testi; p99 < 1sn
- Öncelik: Yüksek | İlgili FR: FR-016

**NFR-SCALE-002: Canlı Yayın Stabilite**
- Metrik: Yayın kopma oranı < %0.5 (dakika bazında)
- Kabul Kriteri: 60 dakikalık test yayını
- Öncelik: Yüksek | İlgili FR: FR-017

**NFR-USE-001: Kayıt Başlatma Görev Tamamlama**
- Metrik: İlk kullanıcının %95'i yönlendirme olmadan kaydı başlatır
- Kabul Kriteri: 10 yeni kullanıcıyla kullanılabilirlik testi
- Öncelik: Yüksek | İlgili FR: FR-001

**NFR-REL-001: Kayıt Veri Kaybı Sıfır Tolerans**
- Metrik: İnternet kesintisi = 0 saniye veri kaybı
- Kabul Kriteri: Ethernet çekilir → yeniden bağlanınca tam kayıp yok
- Öncelik: Kritik | İlgili FR: FR-002

**NFR-MAINT-001: API Anahtarı Soyutlama**
- Metrik: Tüm 3. parti anahtarlar .env'de, kodda hard-code yok
- Kabul Kriteri: grep "sk_live\|api_key" src/ → 0 sonuç
- Öncelik: Yüksek | İlgili FR: FR-011, FR-017, FR-008

---

## DEFINITION OF READY

```
☐ Bağımlı FR'ler tamamlanmış (FR-001 → FR-002 → FR-004 zinciri)
☐ 3. parti servis hesabı ve API key mevcut (Deepgram/LiveKit/Resend/R2)
☐ Given/When/Then kabul kriteri yazılı ve ölçülebilir
☐ Tarayıcı uyumluluk notu eklendi (Safari kısıtı)
☐ KVKK onay gerektiriyorsa modal tasarımı onaylandı
☐ 4-8 saat içinde tamamlanabilir boyutta
☐ NFR bağlandı (varsa performans/güvenlik kısıtı)
```

## DEFINITION OF DONE

```
GELİŞTİRME:
☐ Kod yazıldı, BSL 1.1 copyright header eklendi
☐ TypeScript strict mode — sıfır type error
☐ ESLint geçti — sıfır hata
☐ NFR metrikleri doğrulandı

TEST:
☐ Given/When/Then kabul kriteri test edildi
☐ Chrome ✓ Firefox ✓ Safari (kısıt notu) ✓
☐ Edge case: internet kesintisi, boş transkript, 0 alıcı
☐ KVKK onay akışı test edildi

İŞ ANALİZİ:
☐ FR kabul kriteri karşılandı
☐ Scope creep yok
☐ Memory bank güncellendi (activeContext.md)
```

---

## ÖZET

| Metrik | Değer |
|--------|-------|
| FR Sayısı | 19 (FR-001 → FR-019) |
| NFR Sayısı | 13 (NFR-PERF-001 → NFR-MAINT-001) |
| Must FR | 4 (FR-001, 002, 003, 006) |
| Should FR | 8 |
| Could FR | 6 |
| Won't FR | 1 (FR-019 — Faz 2C) |
| Kritik NFR | 4 (PERF-001, SEC-001, SEC-002, COMP-001, REL-001) |
| Faz 2A Sprint 1-2 | FR-001, 002, 003, 004, 005, 006, 007, 008, 009 |
| Faz 2B Sprint 3-4 | FR-010, 011, 012, 013, 014, 015, 016 |
| Faz 2C Sprint 5-6 | FR-017, 018, 019 |
