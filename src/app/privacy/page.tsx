// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
      <h1>Gizlilik Politikasi</h1>
      <p className="text-muted-foreground">Son guncelleme: 7 Nisan 2026</p>

      <h2>1. Toplanan Veriler</h2>
      <p>DeepSlide asagidaki kisisel verileri toplar:</p>
      <ul>
        <li><strong>Hesap bilgileri:</strong> Ad, e-posta adresi, sifre (hashli)</li>
        <li><strong>Odeme bilgileri:</strong> Iyzico uzerinden islenir, kart bilgileri sunucumuzda saklanmaz</li>
        <li><strong>Kullanim verileri:</strong> Sunum sayisi, gorsel sayisi, oturum suresi</li>
        <li><strong>Gorseller:</strong> Yuklenen gorseller cihazinizda (IndexedDB) saklanir. AI analizi icin Gemini API&apos;ye gecici olarak gonderilir.</li>
        <li><strong>Ses verileri:</strong> Ses tanima icin islenir, kayit edilmez.</li>
        <li><strong>IP adresi:</strong> Bolgesel fiyatlandirma icin kullanilir, saklanmaz.</li>
      </ul>

      <h2>2. Verilerin Kullanim Amaci</h2>
      <ul>
        <li>Hesap olusturma ve kimlik dogrulama</li>
        <li>Odeme isleme ve abonelik yonetimi</li>
        <li>Gorsel analizi (anahtar kelime cikarma)</li>
        <li>Ses tanima ile sunum kontrolu</li>
        <li>Bolgesel fiyatlandirma (IP bazli)</li>
        <li>Hizmet iyilestirme ve analitik</li>
      </ul>

      <h2>3. Veri Paylasimi</h2>
      <p>Kisisel verileriniz asagidaki ucuncu taraflarla paylasilir:</p>
      <ul>
        <li><strong>Firebase (Google):</strong> Kimlik dogrulama ve profil saklama</li>
        <li><strong>Iyzico:</strong> Odeme isleme</li>
        <li><strong>Google Gemini API:</strong> Gorsel analizi (gorseller gecici olarak islenir)</li>
      </ul>
      <p>Verileriniz reklam amaciyla ucuncu taraflarla paylasilmaz.</p>

      <h2>4. Veri Saklama</h2>
      <ul>
        <li>Gorseller: Yalnizca cihazinizda (IndexedDB), sunucuda saklanmaz</li>
        <li>Hesap verileri: Hesap silinene kadar Firebase&apos;de saklanir</li>
        <li>Odeme gecmisi: Yasal zorunluluk geregi 10 yil saklanir</li>
      </ul>

      <h2>5. Haklariniz (KVKK Madde 11)</h2>
      <p>6698 sayili KVKK kapsaminda asagidaki haklara sahipsiniz:</p>
      <ul>
        <li>Kisisel verilerinizin islenip islenmedigini ogrenme</li>
        <li>Islenmisse bilgi talep etme</li>
        <li>Isleme amacini ve amaca uygun kullanilip kullanilmadigini ogrenme</li>
        <li>Yurt ici/yurt disi aktarilip aktarilmadigini ogrenme</li>
        <li>Eksik/yanlis islenmisse duzeltilmesini isteme</li>
        <li>Silinmesini veya yok edilmesini isteme</li>
        <li>Islenen verilerin otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya cikmasina itiraz etme</li>
      </ul>

      <h2>6. Iletisim</h2>
      <p>Veri sorumlusu: DeepSlide</p>
      <p>E-posta: privacy@deepslide.app</p>

      <h2>7. Degisiklikler</h2>
      <p>Bu politika guncellenebilir. Degisiklikler bu sayfada yayinlanir.</p>
    </div>
  );
}
