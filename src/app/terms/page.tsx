// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
      <h1>Kullanim Kosullari</h1>
      <p className="text-muted-foreground">Son guncelleme: 7 Nisan 2026</p>

      <h2>1. Hizmet Tanimi</h2>
      <p>
        DeepSlide, gorselleri analiz ederek anahtar kelimeler cikartan ve ses
        kontrolu ile sunum yapmanizi saglayan bir web uygulamasidir.
      </p>

      <h2>2. Hesap Olusturma</h2>
      <ul>
        <li>Hesap olusturmak icin gecerli bir e-posta adresi gereklidir.</li>
        <li>Hesabinizin guvenliginden siz sorumlusunuz.</li>
        <li>13 yasindan kucuklerin hesap olusturmasi yasaktir.</li>
      </ul>

      <h2>3. Planlar ve Odeme</h2>
      <h3>Ucretsiz Plan</h3>
      <ul>
        <li>Sunum basina 15 gorsele kadar tam deneyim</li>
        <li>Ayda 2 sunum hakki (16+ gorsel iceren sunumlar)</li>
        <li>Ilk 3 sunum tam Pro deneyimi (trial)</li>
        <li>Sunumlarda &quot;Powered by DeepSlide&quot; watermark</li>
      </ul>

      <h3>Pro Plan</h3>
      <ul>
        <li>Sunum basina 500 gorsele kadar</li>
        <li>Sinursiz sunum</li>
        <li>Tum slaytlarda ses kontrolu</li>
        <li>PDF/PPT export</li>
        <li>Watermark yok</li>
      </ul>

      <h3>Odeme Kosullari</h3>
      <ul>
        <li>Odemeler Iyzico uzerinden islenir.</li>
        <li>Abonelik otomatik olarak yenilenir.</li>
        <li>Iptal, mevcut donem sonuna kadar gecerlidir; donem sonunda ucretsiz plana dusulur.</li>
        <li>Iade: Satin alma tarihinden itibaren 14 gun icinde iade talep edilebilir.</li>
      </ul>

      <h2>4. Kabul Edilebilir Kullanim</h2>
      <p>Asagidaki davranislar yasaktir:</p>
      <ul>
        <li>Hizmeti yasadisi amaclarla kullanmak</li>
        <li>Telif hakki ihlal eden icerik yuklemek</li>
        <li>Sistemi kotu niyetle kullanmak (DDoS, brute-force vb.)</li>
        <li>Baska kullanicilarin hesaplarina erismeye calismak</li>
        <li>API limitlerini kasitli olarak asmaya calismak</li>
      </ul>

      <h2>5. Fikri Mulkiyet</h2>
      <ul>
        <li>DeepSlide markasl, logosu ve yazilimi bize aittir.</li>
        <li>Yuklediginiz gorseller size aittir; biz uzerinde hak talep etmeyiz.</li>
        <li>AI analiz sonuclari (anahtar kelimeler) serbestce kullanilabilir.</li>
      </ul>

      <h2>6. Sorumluluk Siniri</h2>
      <p>
        DeepSlide &quot;oldugu gibi&quot; sunulur. Ses tanima dogrulugu, AI analiz
        kalitesi veya hizmet surekliligi konusunda garanti verilmez. Canli sunum
        sirasinda olusabilecek teknik aksakliklardan sorumluluk kabul edilmez.
      </p>

      <h2>7. Hesap Silme</h2>
      <p>
        Hesabinizi istediginiz zaman profil sayfanizdan silebilirsiniz.
        Silme islemi geri alinamaz. Yerel verileriniz (IndexedDB) tarayicinizda
        kalir, sunucudaki verileriniz 30 gun icinde silinir.
      </p>

      <h2>8. Degisiklikler</h2>
      <p>
        Bu kosullar guncellenebilir. Onemli degisikliklerde e-posta ile
        bilgilendirilirsiniz. Kullanmaya devam etmeniz guncel kosullari
        kabul ettiginiz anlamina gelir.
      </p>

      <h2>9. Iletisim</h2>
      <p>E-posta: support@deepslide.app</p>
    </div>
  );
}
