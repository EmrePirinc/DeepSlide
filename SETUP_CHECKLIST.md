# DeepSlide Kurulum Checklist

## 1. Firebase Admin Key (HEMEN YAPILABILIR)
1. https://console.firebase.google.com → deepslide-74660 projesi
2. Proje Ayarlari (dis ikonu) → Hizmet Hesaplari
3. "Yeni ozel anahtar olustur" tikla → JSON dosyasi indirilir
4. JSON'dan `client_email` ve `private_key` degerlerini al
5. `.env.local`'a ekle:
   ```
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@deepslide-74660.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
6. Test: `npm run dev` → kayit ol → Firestore'da profiles koleksiyonunu kontrol et

## 2. Iyzico (PANEL ACILINCA)
1. merchant.iyzipay.com → Ayarlar → API Anahtarlari
2. IYZICO_API_KEY ve IYZICO_SECRET_KEY'i .env.local'a ekle
3. Panel → Abonelik → Urun + Plan olustur
4. Plan ref kodlarini .env.local'a ekle
5. Panel → Ayarlar → Bildirimler → Webhook URL ekle

## 3. Email (OPSIYONEL - Resend.com)
1. https://resend.com → kayit ol (free: 100 email/gun)
2. API key al → RESEND_API_KEY .env.local'a ekle
3. Domain dogrulama (opsiyonel, yoksa onboarding@resend.dev'den gider)

## 4. Vercel Deployment
1. Vercel'e push et
2. Environment Variables'a tum .env.local key'leri ekle
3. IYZICO_URI'yi https://api.iyzipay.com olarak degistir (prod)
