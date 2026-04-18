# DeepSlide - Sanal Yonetim Kurulu Beyin Firtinasi Raporu

**Tarih:** 2026-04-05
**Katilimcilar:** 19 (18 sanal + 1 Kurucu Uye)
**Sure:** ~130dk

---

## ASAMA 1: ACILIS VE KESIF - Jobs-to-be-Done

### Kurucu Uye (Emre) Vizyonu:
1. Slayt ile sunum yapan kisiler bir gorsel gostermek istiyor ama onun sayfasini hatirlamayinca oraya gitmek icin ileri geri bir suru ugrasiyorlar ve elinde hep kumandaya bagli kaliyor, orada sorun cikinca beklemek ve sorunu cozmek ile ugrasiyorlar.
2. Hedef kitle: universitelere sunuma gelenler, zirve sunumlari, profesyonel kisilerin pazarlama sunumlari veya startup sunumlari, universite hocalari.

### Tanimlanan Kullanici Isleri (JTBD)

| # | JTBD |
|---|------|
| J1 | Ben bir **sunumcu** olarak, sahne ustundeyken bir gorseli gostermek istedigimde, slayt numarasini hatirlamak veya elle aramak zorunda kalmadan **sadece bahsederek o gorsele ulasmak** istiyorum, boylece **akisim ve izleyiciyle bagim kopmasin**. |
| J2 | Ben bir **konferans konusmacisi** olarak, sunum sirasinda beklenmedik bir soru geldiginde, ilgili gorseli aninda bulup gostermek istiyorum, boylece **profesyonel ve hazirlikli goruneyim**. |
| J3 | Ben bir **akademisyen** olarak, yuzlerce gorsel iceren ders materyallerini sunarken, kumanda veya bilgisayara bagimli olmadan **sesimle sunumu yonetmek** istiyorum, boylece **ogrencilerle etkilesimime odaklanabileyim**. |
| J4 | Ben bir **startup kurucusu** olarak, yatirimci pitch'i sirasinda, sunumumun teknik aksakliklarla kesilmemesini istiyorum, boylece **hikayemin gucu kaybolmasin**. |
| J5 | Ben bir **pazarlama profesyoneli** olarak, sunum hazirligina minimum zaman harcayip gorsellerimi yukleyerek hizlica sunum olusturmak istiyorum, boylece **icerege degil formata vakit kaybetmeyeyim**. |

---

## ASAMA 2: HMW CERCELEME

| # | HMW Sorusu | Bagli JTBD |
|---|-----------|-------------|
| HMW1 | Sunumcunun sadece konusarak istdigi gorsele ulamasini nasil saglayabiliriz - yanlis esleme korkusu yaratmadan? | J1, J2 |
| HMW2 | Kumanda/bilgisayar bagimliligini nasil ortadan kaldirabiliriz - sunumcunun sahne ozgurlugunu artirarak? | J3, J4 |
| HMW3 | Yuzlerce gorseli organize etmeyi nasil otomatiklestirebiliriz - sunumcunun hazirlik suresini minimuma indirerek? | J5 |
| HMW4 | Sunum sirasinda beklenmedik sorulara nasil aninda gorsel yanit verilmesini saglayabiliriz? | J2, J3 |
| HMW5 | Geleneksel slayt sirasi paradigmasini nasil kirabiliriz - sunumcunun dogal konusma akisina uyum saglayarak? | J1, J5 |

---

## ASAMA 3: ANONIM IDEATION - Delphi Turu 1

### Yazilimcilar Grubu (Can, Deniz, Berk, Arda, Kagan)

**ONERI #1: Sesle Gorsel Navigasyon Motoru**
- Cozulen HMW: HMW1, HMW2 | JTBD: J1, J3
- Web Speech API ile gercek zamanli ses tanima, fuzzy matching, spring animasyonla zoom. Temporal decay ile konu degisince otomatik geri donus.
- Kano: **Must-have**

**ONERI #2: Akilli Gorsel Grid & Otomatik Kumeleme**
- Cozulen HMW: HMW3, HMW5 | JTBD: J5
- Gemini API ile analiz, kategorilere ayirma, benzer gorselleri otomatik kumeleme. Surukle-birak duzenleme.
- Kano: **Performance**

**ONERI #3: Cevrimdisi Sunum Modu**
- Cozulen HMW: HMW2 | JTBD: J4
- IndexedDB'de tum veriler, analiz bir kere yapilir. Sunum sirasinda internet gerekmez.
- Kano: **Must-have**

### Is Analistleri Grubu (Elif, Murat, Selin)

**ONERI #4: Sunum Provasi & Guven Skoru**
- Cozulen HMW: HMW1 | JTBD: J1, J4
- Sahneye cikmadan ses navigasyonu test etme. Hangi kelimelerin hangi gorselleri tetikledigini gosterme, guven skoru verme.
- Kano: **Performance**

**ONERI #5: Coklu Esleme Cozucu (Disambiguation Panel)**
- Cozulen HMW: HMW1, HMW4 | JTBD: J2
- Bir keyword birden fazla gosel ile eslestiginde, kucuk panel ile en olasi 2-3 gorseli gosterme. Sesle veya dokunarak secim.
- Kano: **Performance**

**ONERI #6: Sunum Analitik Raporu**
- Cozulen HMW: HMW5 | JTBD: J5
- Sunum sonrasi detayli rapor: gorseller ne kadar gosterildi, hangi kelimeler tetikledi, kacirilan eslesmeler.
- Kano: **Delighter**

### Pazarlamacilar Grubu (Zeynep, Ayse)

**ONERI #7: Tek Tikla Sunum Olusturma**
- Cozulen HMW: HMW3 | JTBD: J5
- Surukle-birak yukle -> AI analiz -> sunum hazir. 3 adimda sunum.
- Kano: **Must-have**

**ONERI #8: Paylasalibilir Sunum Linki**
- Cozulen HMW: HMW5 | JTBD: J4, J5
- Link ile paylasim, izleyici kendi cihazindan takip, gercek zamanli zoom gorme.
- Kano: **Delighter**

### Hedef Kitle Grubu (Fatma, Ali)

**ONERI #9: Sesle + Jestle Hibrit Kontrol**
- Cozulen HMW: HMW2 | JTBD: J3
- Ses + el hareketleri. Sessiz kalmak istediginde jest ile devam. Kamera tabanli.
- Kano: **Delighter**

**ONERI #10: Baglamsal Soru-Cevap Modu**
- Cozulen HMW: HMW4 | JTBD: J2
- "Soru-cevap" deyince Q&A moduna gecis. Izleyici sorusuna gore ilgili gorseli otomatik bulma.
- Kano: **Performance**

### Paydaslar Grubu (Burak, Emre D., Mehmet)

**ONERI #11: Sunum Sablonlari Marketi**
- Cozulen HMW: HMW3 | JTBD: J5
- Sektore ozel hazir sablonlar: Startup Pitch, Akademik Ders, Satis Sunumu.
- Kano: **Delighter**

**ONERI #12: Kurumsal Lisans & Takim Sunumlari**
- Cozulen HMW: HMW5 | JTBD: J4
- Sirketler kendi gorsel kutuphanelerini yukler, takim uyeleri ortak havuzdan sunum olusturur.
- Kano: **Performance**

### Wildcard + Kurucu (Defne)

**ONERI #13: Sinematik Sunum Modu**
- Cozulen HMW: HMW5 | JTBD: J1
- Ken Burns, paralaks, fade-through efektleri. Sunum gorsel bir hikaye anlatimi olur.
- Kano: **Delighter**

---

## ASAMA 4: SCAMPER LENS

| Lens | Grup | Yeni Oneri |
|------|------|-----------|
| **S** Substitute | Yazilimcilar | **#14:** Whisper WASM tabanli ses tanima (Web Speech yerine, cevrimdisi, her tarayicida) |
| **C** Combine | Is Analistleri | **#15:** Prova + Analitik = Sunum Kocu (prova sirasinda koculuk onerileri) |
| **A** Adapt | Pazarlamacilar | **#16:** Netflix tarzi oneri sistemi (gecmis sunumlardan ogrenme) |
| **M** Modify | CEO'lar | **#17:** Mikro-Sunum Formati (ayni havuzdan farkli uzunlukta sunumlar) |
| **P** Put to Other Use | Hedef Kitle | **#18:** Egitim/Quiz Modu (sunum araci -> egitim araci) |
| **E** Eliminate | Paydaslar | **#19:** Sifir-UI Sunum → Revize: Adaptif UI (UI kaybolur, dokunmayla geri gelir) |
| **R** Reverse | Wildcard | **#20:** Izleyici-Gudumlu Sunum (izleyiciler kontrol eder) |

---

## ASAMA 5: RICE + KANO SKORLAMA

| # | Ozellik | Kano | Reach | Impact | Confidence | Effort | RICE | Sira |
|---|---------|------|:-----:|:------:|:----------:|:------:|:----:|:----:|
| 7 | Tek Tikla Sunum | Must-have | 10 | 3 | 90% | 2 | **13.50** | 1 |
| 1 | Sesle Gorsel Navigasyon | Must-have | 10 | 3 | 85% | 3 | **8.50** | 2 |
| 3 | Cevrimdisi Mod | Must-have | 8 | 2 | 80% | 2 | **6.40** | 3 |
| 19 | Adaptif UI | Performance | 7 | 2 | 75% | 2 | **5.25** | 4 |
| 5 | Spotlight Modu | Performance | 6 | 2 | 80% | 2 | **4.80** | 5 |
| 2 | Akilli Grid & Kumeleme | Performance | 8 | 2 | 75% | 3 | **4.00** | 6 |
| 4 | Sunum Provasi | Performance | 7 | 2 | 70% | 3 | **3.27** | 7 |
| 13 | Sinematik Gecisler | Delighter | 7 | 1 | 70% | 2 | **2.45** | 8 |

### PARKING LOT

| # | Ozellik | Sebep | Faz | Sahip |
|---|---------|-------|-----|-------|
| 8 | Paylasalabilir Link | WebSocket altyapisi gerekli | Faz 2 | Berk |
| 9 | Jest Kontrolu | Kamera dogruluk riski | Faz 3 | Deniz |
| 11 | Sablon Marketi | Icerik uretimi gerekli | Faz 2 | Zeynep |
| 12 | Kurumsal Lisans | B2B altyapisi erken | Faz 2 | Mehmet |
| 16 | Netflix Oneri | Yeterli veri yok | Faz 3 | Ayse |
| 18 | Egitim/Quiz | Farkli urun hatti | Faz 3 | Ali |
| 20 | Izleyici-Gudumlu | WebSocket gerekli | Faz 2 | Can |

---

## ASAMA 6: SUB-GROUP SAPKA TARTISMALARI

### Tur 1 - Siyah Sapka (Risk/Elestiri)
- **Ses tanima**: Gurultulu ortamda dogruluk %40-60'a dusebilir. Turkce teknik terim tanima yetersiz. Yanlis tetikleme riski.
- **Tek tikla sunum**: AI yanlis keyword cikarirsa kullanici hatayi fark etmeden sahneye cikar. KVKK/GDPR uyumu.
- **Cevrimdisi mod**: Web Speech API cevrimdisi calismaz. Whisper WASM 200MB. Bagimlilik.
- **Kilit Icgoru**: #3 ve #14 birbirine bagimli. Ses tanima icin fallback mekanizmasi sart.

### Tur 2 - Beyaz Sapka (Veri/Gercekler)
- Sunum yazilimi pazari $15.2B, %12 CAGR. Hicbir rakip sesle kontrol sunmuyor.
- Web Speech API: Chrome Turkce %85, Ingilizce %95. Gurultude %60-70.
- Whisper large-v3 Turkce %92. WASM versiyonu ~200MB.
- Gamma.app, Beautiful.ai, Prezi — hicbirinde ses+AI gorsel eslestirme yok.
- **Kilit Icgoru**: Pazar boslugu var. Mikrofon kalitesi onemli degisken.

### Tur 3 - Yesil Sapka (Yaraticilik)
- **Adaptif UI** (Sifir-UI yerine): UI yavasca kaybolur, dokunmayla geri gelir.
- **Hibrit ses stratejisi**: Cevrimiciyken Web Speech, cevrimdisiyken Whisper WASM fallback.
- **Bluetooth yaka mikrofonu** yonlendirmesi: Ortam gurultusu %90 filtrelenir.
- **Spotlight Modu**: Panel yerine gorseller parlaklasar, sunumcu "evet"/"bu" diyerek onaylar.
- **Kilit Icgoru**: Adaptif UI > Sifir UI. Hibrit ses stratejisi en pragmatik cozum.

---

## ASAMA 7: PLENARY SIX HATS + REVERSE BRAINSTORM

Her oneri icin Reverse Brainstorm ("Bu ozellik nasil BASARISIZ olur?") yapildi:

### #7 Tek Tikla Sunum
- Basarisizlik 1: AI yanlis keyword → kullanici kontrol etmeden sahneye cikar
- Basarisizlik 2: 500 gorsel analizi 30dk surer → "tek tikla" vaadi bos
- **Cozum**: Onizleme adimi zorunlu + progressive analiz UI

### #1 Sesle Navigasyon
- Basarisizlik 1: Konferans salonu yankisi, tanima bozulur
- Basarisizlik 2: Turkce teknik terimler taninmaz
- **Cozum**: Yaka mik yonlendirme + prova modu + ozel sozluk

### #3 Cevrimdisi Mod
- Basarisizlik 1: Whisper modeli hic indirilmemis → sunum yapilamaz
- Basarisizlik 2: IndexedDB kapasitesi dolmus → sunumlar kaybolur
- **Cozum**: Arkaplan model indirme + kapasite uyarisi

---

## ASAMA 8: DELPHI OYLAMA

### Oylama Sonuclari

| # | Ozellik | Oy | Sonuc |
|---|---------|:--:|:-----:|
| 7 | Tek Tikla Sunum Olusturma | 18/18 (oybirligi) | **KABUL** |
| 1 | Sesle Gorsel Navigasyon | 17/18 (1 cekimser) | **KABUL** |
| 3 | Cevrimdisi Sunum Modu | 16/18 (1 ret, 1 cekimser) | **KABUL** |
| 19 | Adaptif UI | 18/18 (oybirligi) | **KABUL** |
| 5 | Spotlight Modu | 16/18 (1 ret, 1 cekimser) | **KABUL** |
| 2 | Akilli Grid & Kumeleme | 17/18 (1 cekimser) | **KABUL** |
| 13 | Sinematik Gecisler (Temel) | 12/18 (4 ret, 3 cekimser) | **KABUL** (dar farkla, Faz 2 onerisiyle) |
| 4 | Sunum Provasi & Guven Skoru | 18/18 (oybirligi) | **KABUL** |

### Minority Reports
- **#7**: Burak — AI dogrulugu bagimliligi. Onizleme + keyword duzelt zorunlu. Izleme: Day-7 retention.
- **#1**: Burak — Gurultulu ortam riski, Turkce teknik terim. Izleme: Ses tanima dogruluk orani.
- **#3**: Burak — Whisper WASM 200MB indirme. Izleme: Model indirme tamamlanma orani.

---

## ASAMA 9: IMPACT/EFFORT + RAID + SENTEZ

### Impact/Effort Matrisi

```
                    YUKSEK ETKI
                        |
     BIG BETS (Faz 2)   |   QUICK WINS (Faz 1 - MVP)
                        |
     - Paylasalabilir    |   - #7  Tek Tikla Sunum
       Link              |   - #1  Sesle Navigasyon
     - Izleyici-Gudumlu  |   - #19 Adaptif UI
     - Kurumsal Lisans   |   - #5  Spotlight Modu
     - Sinematik (Full)  |   - #2  Akilli Grid
                        |   - #4  Sunum Provasi
    --------------------+----------------------------
                        |
     MONEY PIT (Reddet)  |   FILL-INS (Faz 3)
                        |
     - Jest Kontrolu     |   - #13 Sinematik (Temel)
     - Netflix Oneri     |   - Egitim/Quiz Modu
                        |   - Sablon Marketi
                    DUSUK ETKI
     YUKSEK EFOR              DUSUK EFOR
```

### RAID LOG

**RISKLER:**
- R-001: Ses tanima gurultude dusuk dogruluk | Azaltma: Yaka mik + prova modu
- R-002: Turkce teknik terim tanima yetersizligi | Azaltma: Ozel sozluk + synonym
- R-003: Gemini API hatali keyword cikrma | Azaltma: Onizleme + duzenleme
- R-004: IndexedDB kapasite siniri | Azaltma: Gorsel sikistirma + uyari
- R-005: Whisper WASM model boyutu (200MB) | Azaltma: Arkaplan indirme + hibrit
- R-006: KVKK/GDPR uyumlulugu | Azaltma: Istemci tarafi isleme

**VARSAYIMLAR:**
- A-001: Hedef kullanicilar yaka mikrofonu kullanmaya istekli
- A-002: Gemini 2.5 Flash keyword dogrulugu yeterli (%80+)
- A-003: Web Speech API Turkce destegi yeterli (>%80)
- A-004: Kullanicilar "slayt sirasi" paradigmasini birakmaya hazir

**SORUNLAR:**
- I-001: Cevrimdisi ses tanima icin Whisper WASM olgunlugu belirsiz | P1
- I-002: Web Speech API tarayici uyumlulugu (Firefox eksik) | P2

**KARARLAR:**
- D-001: Platform: Web-first (Next.js + TypeScript)
- D-002: AI: Google Gemini API
- D-003: Ses: Hibrit strateji (Web Speech + Whisper fallback)
- D-004: UI: Adaptif UI (Sifir-UI yerine)
- D-005: Disambiguation: Spotlight Modu (panel yerine)

### YOL HARITASI

**Faz 1 (MVP):**
- #7 Tek Tikla Sunum Olusturma
- #1 Sesle Gorsel Navigasyon
- #3 Cevrimdisi Mod
- #19 Adaptif UI
- #5 Spotlight Modu
- #2 Akilli Grid & Kumeleme
- #4 Sunum Provasi & Guven Skoru
- #13 Sinematik Temel (Ken Burns)

**Faz 2 (Buyume):**
- Paylasalabilir Sunum Linki
- Kurumsal Lisans & Takim
- Sablon Marketi
- Sinematik Gelismis
- Izleyici-Gudumlu Sunum

**Faz 3 (Vizyon):**
- Jest Kontrolu
- Netflix Tarzi Oneri
- Egitim/Quiz Modu
- Sunum Kocu AI

### KAPASITE DAGILIMI
- Must-have: %37.5 (3/8)
- Performance: %37.5 (3/8)
- Delighter: %25.0 (2/8) - korundu
