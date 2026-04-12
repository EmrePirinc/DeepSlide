// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface PresentationTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  suggestedSlides: TemplateSlide[];
  theme: 'dark' | 'light' | 'corporate';
  columnCount: 3 | 4 | 5;
}

export interface TemplateSlide {
  order: number;
  title: string;
  keywords: string[];
  notes: string;
}

export const PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: 'startup-pitch',
    title: 'Startup Pitch',
    description: 'Yatırımcılara yönelik sunum iskeleti',
    category: 'İş',
    emoji: '🚀',
    theme: 'dark',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Problem', keywords: ['sorun', 'problem', 'acı nokta', 'ihtiyaç'], notes: 'Çözdüğünüz sorunu açıklayın.' },
      { order: 1, title: 'Çözüm', keywords: ['çözüm', 'ürün', 'hizmet', 'yaklaşım'], notes: 'Ürününüzü tanıtın.' },
      { order: 2, title: 'Pazar', keywords: ['pazar', 'büyüklük', 'tam adreslenebilir pazar', 'fırsat'], notes: 'Pazar büyüklüğünü gösterin.' },
      { order: 3, title: 'İş Modeli', keywords: ['gelir', 'monetizasyon', 'fiyatlandırma', 'abonelik'], notes: 'Nasıl para kazandığınızı açıklayın.' },
      { order: 4, title: 'Traksiyon', keywords: ['büyüme', 'kullanıcı', 'gelir', 'metrik'], notes: 'Mevcut büyüme verilerini paylaşın.' },
      { order: 5, title: 'Ekip', keywords: ['kurucu', 'ekip', 'deneyim', 'uzman'], notes: 'Ekibinizi tanıtın.' },
    ],
  },
  {
    id: 'quarterly-review',
    title: 'Çeyrek Dönem Değerlendirme',
    description: 'Q1/Q2/Q3/Q4 iş performans sunumu',
    category: 'İş',
    emoji: '📊',
    theme: 'corporate',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Yönetici Özeti', keywords: ['özet', 'sonuçlar', 'hedefler', 'başarılar'], notes: '' },
      { order: 1, title: 'Finansal Sonuçlar', keywords: ['gelir', 'kar', 'büyüme', 'bütçe'], notes: '' },
      { order: 2, title: 'Temel Metrikler', keywords: ['KPI', 'metrik', 'oran', 'performans'], notes: '' },
      { order: 3, title: 'Ürün Güncellemeleri', keywords: ['özellik', 'lansман', 'sürüm', 'geliştirme'], notes: '' },
      { order: 4, title: 'Sonraki Dönem Planı', keywords: ['hedef', 'plan', 'öncelik', 'yol haritası'], notes: '' },
    ],
  },
  {
    id: 'product-demo',
    title: 'Ürün Tanıtımı',
    description: 'Ürün demo ve özellik sunumu',
    category: 'Ürün',
    emoji: '💻',
    theme: 'dark',
    columnCount: 3,
    suggestedSlides: [
      { order: 0, title: 'Karşılaşılan Zorluk', keywords: ['zorluk', 'engel', 'vakit', 'maliyet'], notes: '' },
      { order: 1, title: 'Demo', keywords: ['demo', 'gösterim', 'canlı', 'ekran'], notes: '' },
      { order: 2, title: 'Özellikler', keywords: ['özellik', 'avantaj', 'fayda', 'benzersiz'], notes: '' },
      { order: 3, title: 'Entegrasyon', keywords: ['entegrasyon', 'bağlantı', 'API', 'platform'], notes: '' },
      { order: 4, title: 'Fiyatlandırma', keywords: ['fiyat', 'plan', 'ücretsiz', 'premium'], notes: '' },
      { order: 5, title: 'Sonraki Adım', keywords: ['deneme', 'kayıt', 'iletişim', 'satın al'], notes: '' },
    ],
  },
  {
    id: 'sales-proposal',
    title: 'Satış Teklifi',
    description: 'Müşteriye özel satış sunumu',
    category: 'Satış',
    emoji: '🤝',
    theme: 'corporate',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Müşteri Sorunları', keywords: ['sorun', 'ihtiyaç', 'hedef', 'beklenti'], notes: '' },
      { order: 1, title: 'Önerilen Çözüm', keywords: ['çözüm', 'strateji', 'yaklaşım', 'metodoloji'], notes: '' },
      { order: 2, title: 'Neden Biz', keywords: ['farklılık', 'avantaj', 'uzman', 'kanıt'], notes: '' },
      { order: 3, title: 'Referanslar', keywords: ['müşteri', 'vaka', 'başarı hikayesi', 'ROI'], notes: '' },
      { order: 4, title: 'Teklif', keywords: ['fiyat', 'paket', 'kapsam', 'süre'], notes: '' },
      { order: 5, title: 'Sonraki Adımlar', keywords: ['imzala', 'başlayalım', 'toplantı', 'demo'], notes: '' },
    ],
  },
  {
    id: 'training-workshop',
    title: 'Eğitim / Workshop',
    description: 'Eğitim ve atölye sunumu şablonu',
    category: 'Eğitim',
    emoji: '🎓',
    theme: 'light',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Giriş ve Amaç', keywords: ['amaç', 'öğrenme', 'hedef', 'kapsam'], notes: '' },
      { order: 1, title: 'Temel Kavramlar', keywords: ['kavram', 'tanım', 'teori', 'ilke'], notes: '' },
      { order: 2, title: 'Pratik Uygulama', keywords: ['uygulama', 'alıştırma', 'örnek', 'pratik'], notes: '' },
      { order: 3, title: 'Vaka Çalışması', keywords: ['vaka', 'gerçek dünya', 'örnek', 'analiz'], notes: '' },
      { order: 4, title: 'Alıştırmalar', keywords: ['alıştırma', 'görev', 'grup çalışması', 'tartışma'], notes: '' },
      { order: 5, title: 'Özet ve Soru-Cevap', keywords: ['özet', 'kilit nokta', 'soru', 'sonraki adım'], notes: '' },
    ],
  },
  {
    id: 'research-report',
    title: 'Araştırma Raporu',
    description: 'Akademik / analitik araştırma sunumu',
    category: 'Akademik',
    emoji: '🔬',
    theme: 'light',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Özet', keywords: ['özet', 'araştırma sorusu', 'bulgular', 'öneri'], notes: '' },
      { order: 1, title: 'Giriş / Arka Plan', keywords: ['bağlam', 'literatür', 'geçmiş', 'motivasyon'], notes: '' },
      { order: 2, title: 'Metodoloji', keywords: ['yöntem', 'veri', 'örnek', 'çerçeve'], notes: '' },
      { order: 3, title: 'Bulgular', keywords: ['bulgular', 'sonuçlar', 'analiz', 'istatistik'], notes: '' },
      { order: 4, title: 'Tartışma', keywords: ['yorum', 'etki', 'kısıtlar', 'karşılaştırma'], notes: '' },
      { order: 5, title: 'Sonuç ve Öneriler', keywords: ['sonuç', 'öneri', 'gelecek çalışma', 'uygulama'], notes: '' },
    ],
  },
  {
    id: 'marketing-campaign',
    title: 'Pazarlama Kampanyası',
    description: 'Kampanya briefi ve strateji sunumu',
    category: 'Pazarlama',
    emoji: '📣',
    theme: 'dark',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Kampanya Özeti', keywords: ['amaç', 'mesaj', 'hedef kitle', 'bütçe'], notes: '' },
      { order: 1, title: 'Pazar Analizi', keywords: ['pazar', 'rekabet', 'trend', 'analiz'], notes: '' },
      { order: 2, title: 'Hedef Kitle', keywords: ['persona', 'demografik', 'davranış', 'segment'], notes: '' },
      { order: 3, title: 'Yaratıcı Strateji', keywords: ['mesaj', 'görsel', 'içerik', 'kanal'], notes: '' },
      { order: 4, title: 'Medya Planı', keywords: ['kanal', 'zaman çizelgesi', 'bütçe', 'dönüşüm'], notes: '' },
      { order: 5, title: 'Başarı Kriterleri', keywords: ['KPI', 'ölçüm', 'ROI', 'raporlama'], notes: '' },
    ],
  },
  {
    id: 'project-kickoff',
    title: 'Proje Kickoff',
    description: 'Proje başlangıç toplantısı sunumu',
    category: 'Proje',
    emoji: '🏁',
    theme: 'corporate',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Proje Genel Bakış', keywords: ['proje', 'amaç', 'kapsam', 'paydaş'], notes: '' },
      { order: 1, title: 'Ekip ve Roller', keywords: ['ekip', 'rol', 'sorumluluk', 'RACI'], notes: '' },
      { order: 2, title: 'Zaman Çizelgesi', keywords: ['takvim', 'kilometre taşı', 'sprint', 'teslim'], notes: '' },
      { order: 3, title: 'Riskler', keywords: ['risk', 'bağımlılık', 'engel', 'azaltma'], notes: '' },
      { order: 4, title: 'Başarı Kriterleri', keywords: ['başarı', 'tamamlama', 'kabul kriteri', 'test'], notes: '' },
    ],
  },
  {
    id: 'annual-review',
    title: 'Yıllık Değerlendirme',
    description: 'Yıl sonu performans ve strateji sunumu',
    category: 'Strateji',
    emoji: '🗓️',
    theme: 'corporate',
    columnCount: 4,
    suggestedSlides: [
      { order: 0, title: 'Yılın Öne Çıkanları', keywords: ['başarı', 'öne çıkan', 'kilometre taşı', 'büyüme'], notes: '' },
      { order: 1, title: 'Finansal Performans', keywords: ['gelir', 'karlılık', 'büyüme', 'maliyet'], notes: '' },
      { order: 2, title: 'Ürün ve Müşteri', keywords: ['ürün', 'müşteri', 'memnuniyet', 'pazar payı'], notes: '' },
      { order: 3, title: 'Operasyonel Metrikler', keywords: ['verimlilik', 'kalite', 'süreç', 'ekip'], notes: '' },
      { order: 4, title: 'Gelecek Yıl Stratejisi', keywords: ['hedef', 'öncelik', 'vizyon', 'strateji'], notes: '' },
    ],
  },
  {
    id: 'team-update',
    title: 'Ekip Güncellemesi',
    description: 'Haftalık/Aylık ekip durum güncellemesi',
    category: 'Dahili',
    emoji: '👥',
    theme: 'light',
    columnCount: 3,
    suggestedSlides: [
      { order: 0, title: "Bu Hafta Tamamlananlar", keywords: ['tamamlandı', 'gönderildi', 'kapatıldı', 'teslimat'], notes: '' },
      { order: 1, title: "Devam Edenler", keywords: ['devam ediyor', 'süreçte', 'geliştiriliyor', 'test'], notes: '' },
      { order: 2, title: "Engelleyiciler", keywords: ['engel', 'sorun', 'bağımlılık', 'risk'], notes: '' },
      { order: 3, title: "Önümüzdeki Hafta", keywords: ['plan', 'hedef', 'öncelik', 'yaklaşan'], notes: '' },
    ],
  },
];
