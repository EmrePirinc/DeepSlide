# BB#4 + BAP#4 + WBS#4 — Gelir Modeli: Freemium + Odeme Altyapisi
# Tarih: 2026-04-07
# Kapsam: Gelir modeli arastirmasi + BB degerlendirmesi + BABOK analizi + WBS

---

## OZET

| Metrik | Deger |
|--------|-------|
| BB Kabul Edilen Ozellik | 7 |
| FR (Fonksiyonel Gereksinim) | 15 (11 Must + 4 Should) |
| NFR (Non-Fonksiyonel) | 20 (8 Kritik + 9 Yuksek + 3 Orta) |
| BRL (Is Kurali) | 14 |
| UC (Use Case) | 12 |
| US (User Story) | 21 (64 SP) |
| TC (Test Senaryosu) | 19 |
| WBS Alt Gorev | 76 |
| Quality Gate | 9 |
| Tahmini Sprint | 5 (2 haftalik) |
| Tahmini Sure | ~320 saat |

---

## GELIR MODELI KARARLARI

| Karar | Deger |
|-------|-------|
| Free tier | 15 gorsel tam deneyim |
| Sunum sayaci | Ayda 2 sunum (16+ gorsel) |
| Paywall | 2 slayt ses kontrolu, sonra degrade |
| Trial | Ilk 3 sunum full Pro (sure siniri yok) |
| Pro fiyat (TR) | ₺99/ay, ₺74/ay (yillik) |
| Pro fiyat (US) | $12/ay, $9/ay (yillik) |
| Odeme | Stripe (global) + Iyzico (TR fallback) |
| Watermark | Free'de "Powered by DeepSlide", Pro'da yok |
| Export | PDF/PPT Pro-only |
| Team plani | Faz 2 |

---

## BB KABUL EDILEN OZELLIKLER

| # | Ozellik | RICE | Kano | Faz |
|---|---------|------|------|-----|
| 15 | Seffaf Fiyatlandirma Sayfasi | 38.00 | Must-have | 1 |
| 4 | Watermark Viral Loop | 16.20 | Performance | 1 |
| 8 | Freemium Sunum Sayaci | 15.30 | Must-have | 1 |
| 10 | Stripe + Iyzico Odeme | 13.50 | Must-have | 1 |
| 1 | Akilli Paywall Zamanlama | 10.80 | Must-have | 1 |
| 13 | Offline-Free + Cloud Pro | 8.40 | Must-have | 2 |
| C1 | Ilk Sunum + ROI Combo | 7.20 | Performance | 1 |

---

## JTBD'LER

1. Satisci → Sesle sunum kontrol → Musteriye odaklan
2. Akademisyen → 200+ gorsel kesintisiz → Ders akisi
3. Startup Kurucusu → Profesyonel yatirmci sunumu
4. Icerik Ureticisi → Haftalik tekrarlayan sunum
5. Ogrenci → Dusuk butceyle sunum

---

## WBS SPRINT PLANI

| Sprint | Bolum | QG |
|--------|-------|----|
| 1 | Auth & Kullanici (1.1) | QG-1 |
| 2 | Odeme (1.2) + Pricing (1.3) | QG-2, QG-3 |
| 3 | Paywall (1.4) + Trial/ROI (1.5) | QG-4, QG-5 |
| 4 | Watermark/Export (1.6) + Entegrasyon (1.7) | QG-6, QG-7 |
| 5 | Lansman Hazirligi (1.8) + Final Test | QG-8, QG-9 |

---

## RAID LOG OZETI

### Riskler (6)
- R-001: Stripe TR kart reddi → Iyzico fallback
- R-002: VPN fiyat arbitraji → Faz 2 kart ulke dogrulama
- R-003: Client-side sayac bypass → Auth ile cozum
- R-004: Canli sunumda paywall UX → Rehearsal'da uyar
- R-005: Safari Web Speech API buglari → Whisper fallback
- R-006: Free tier kannibalizasyonu → Donusum orani izle

### Varsayimlar (6)
- A-001: ₺99/ay uygun fiyat → A/B test
- A-002: Paywall %8-15 donusum → A/B test
- A-003: Watermark %20+ organik trafik → UTM tracking
- A-004: Gemini API <$0.005/gorsel → Fatura takibi
- A-005: Free kullanicilarin %60+'i ayda 2+ sunum → Analitik
- A-006: 15 gorsel "aha moment" icin yeterli → NPS

### Kararlar (7)
- D-001: Free = 15 gorsel tam deneyim
- D-002: Pro = ₺99/ay (TR), $12/ay (GL)
- D-003: MVP = Free + Pro. Team = Faz 2
- D-004: Paywall = 2 slayt ses, sonra degrade
- D-005: Cloud sync = Faz 2
- D-006: Ilk 3 sunum full Pro trial
- D-007: Odeme = Stripe + Iyzico fallback

---

## PARKING LOT

| # | Ozellik | Kontrol |
|---|---------|---------|
| 1 | Pay-Per-Presentation ₺19 | Faz 2 |
| 2 | Team Plani ₺79/kisi/ay | Pro >500 kullanici |
| 3 | API & Webhook | Pro >500 kullanici |
| 4 | Kurumsal Kredi Paketi | Team lansmani |
| 5 | Gunluk Pass ₺9 | Faz 2 |
| 6 | Streak Gamification | Faz 2 |
| 7 | Izleyici Reklam Monet. | MAU >50K |
| 8 | Sunum Analytics | Faz 2 |
| 9 | Kampus Ambassador | Ogrenci plani +3ay |
| 10 | Ogrenci Plani ₺49/ay | Faz 1 sonu |

---

## DETAYLAR

Tum detaylar (FR, NFR, UC, US, TC, BRL, SWOT, Balik Kilcigi, Storyboard, RTM, DoR/DoD)
konusma gecmisinde mevcuttur. Bu dosya ozet referanstir.
