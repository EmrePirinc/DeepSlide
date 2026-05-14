# 🚀 DeepSlide: Sesinizle Yönetilen Yapay Zeka Destekli Sunum Deneyimi

**"Siz konuşun, sunumunuz sizi takip etsin."**

DeepSlide, geleneksel tıklama tabanlı sunum yöntemlerini geride bırakan, ses komutlarıyla ve yapay zeka ile dinamik olarak yönetilen yeni nesil bir sunum platformudur. Sunum yaparken slaytları manuel olarak değiştirmek yerine, sadece anlatmak istediğiniz konuyu konuşursunuz ve DeepSlide sesinizi analiz ederek ilgili slaytı otomatik olarak ekrana getirir.

---

## 🔥 Neden DeepSlide?

Geleneksel sunumlarda "bir sonraki slayta geçebilir miyiz?" cümlesi veya elinizdeki kumandaya odaklanmak akıcılığı bozar. DeepSlide, **Doğal Dil İşleme (NLP)** ve **Ses Tanıma** teknolojilerini kullanarak sunum akışını doğrudan konuşmanıza bağlar.

- **Kesintisiz Akış:** Kumanda veya klavye kullanmanıza gerek kalmaz.
- **Dinamik Geçişler:** Prezi tarzı sınırsız tuval (infinite canvas) üzerinde zoom ve pan efektleriyle etkileyici geçişler.
- **Hibrit Yapay Zeka:** İster Google Gemini gibi güçlü bulut modellerini, ister Ollama üzerinden yerel (local) modelleri (Llama, Gemma, Qwen) kullanarak tam gizlilik ve hız sağlayın.

---

## ✨ Temel Özellikler

### 🎙️ Sesle Kontrol ve Anahtar Kelime Takibi
Yüzlerce görsel yükleseniz bile, DeepSlide her bir görseli analiz eder ve otomatik olarak anahtar kelimeler atar. Sunum sırasında bu kelimeleri (veya eş anlamlılarını) söylediğinizde, ilgili slayt pürüzsüz bir animasyonla ekrana gelir.

### 🤖 Gelişmiş AI Entegrasyonu
- **Otomatik Anahtar Kelime Çıkarımı:** Görsellerinizi yükleyin, AI sizin yerinize "bu slayt ne hakkında?" sorusunu yanıtlasın.
- **3 Farklı AI Sağlayıcı:** Google Gemini API, Qwen 3.5 (Local), Gemma 4 (Local).
- **Prova Modu:** Sunumunuzu yapın, AI ses tonunuzu ve içeriğinizi analiz ederek size bir "güven skoru" (confidence score) versin.

### 🎥 Kayıt ve Otomatik Özetleme (Faz 2)
- **Offline-First Kayıt:** Sunumunuzu tarayıcı üzerinden yüksek kalitede kaydedin. İnternet kopsa bile veriniz kaybolmaz.
- **Yapay Zeka Özeti:** Sunum bittiğinde, konuşmalarınızdan otomatik olarak 3-5 maddelik bir özet ve aksiyon listesi oluşturulur, paydaşlara e-posta ile gönderilir.

### 📊 İzleyici Etkileşimi
- **Canlı Alt Yazı:** Konuşmalarınızı anlık olarak ekranın altında yazılı olarak gösterin (TR/EN desteği).
- **AI Soru Üretici:** Slaytlarınızın içeriğinden otomatik olarak yarışma soruları üretin ve QR kod ile izleyicilerin telefonlarından katılmasını sağlayın.

---

## 🛠️ Teknoloji Yığını

DeepSlide, modern ve performanslı bir deneyim için en güncel teknolojilerle inşa edilmiştir:

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Animasyon:** Framer Motion (Motion)
- **State Management:** Zustand
- **Backend & Auth:** Firebase (Auth, Firestore, Cloud Functions)
- **Local AI:** Ollama (WebGPU desteğiyle yerel modeller)
- **Bulut AI:** Google Gemini SDK
- **Video & Stream:** MediaRecorder API, Cloudflare R2, Deepgram (Subtitle)

---

## 🚀 Yol Haritası (Roadmap)

- [x] **Faz 1:** Temel sesli kontrol, görsel analizi ve pürüzsüz geçişler.
- [ ] **Faz 2A (Geliştiriliyor):** Kayıt altyapısı, Paylaşım linkleri ve AI Özetleme.
- [ ] **Faz 2B:** Canlı alt yazı, çok dilli destek ve AI tabanlı yarışma modu.
- [ ] **Faz 2C:** RTMP üzerinden canlı yayın (YouTube/LinkedIn) ve sunum arşivi.

---

## 📄 Lisans

Bu proje **Business Source License 1.1 (BSL 1.1)** ile lisanslanmıştır.

- **Kişisel kullanım ve öğrenme amacıyla kodları inceleyebilirsiniz.**
- **Ticari bir SaaS hizmeti olarak sunulması veya rakip bir ürün oluşturulması yasaktır.**

Detaylar için [LICENSE](LICENSE) dosyasına göz atabilirsiniz.

---

© 2026 Emre Pirinc. Tüm hakları saklıdır.

