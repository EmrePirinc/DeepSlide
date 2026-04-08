// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface Plan {
  id: 'free' | 'pro';
  name: string;
  limits: {
    maxImagesFullExperience: number;
    maxImagesUpload: number;
    monthlyPresentations: number;
    voiceControlSlides: number;
    pdfExport: boolean;
    pptExport: boolean;
    watermark: boolean;
    cloudStorage: boolean;
    analytics: boolean;
  };
}

export interface RegionalPrice {
  currency: string;
  symbol: string;
  monthly: number;
  yearly: number;
}

export const REGIONAL_PRICES: Record<string, RegionalPrice> = {
  TR: { currency: 'TRY', symbol: '₺', monthly: 99, yearly: 888 },
  US: { currency: 'USD', symbol: '$', monthly: 12, yearly: 108 },
  EU: { currency: 'EUR', symbol: '€', monthly: 10, yearly: 90 },
  IN: { currency: 'INR', symbol: '₹', monthly: 249, yearly: 2244 },
  DEFAULT: { currency: 'USD', symbol: '$', monthly: 12, yearly: 108 },
};

export const TRIAL_PRESENTATIONS = 3;
export const FREE_VOICE_SLIDES = 2;

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Ücretsiz',
    limits: {
      maxImagesFullExperience: 15,
      maxImagesUpload: 500,
      monthlyPresentations: 2,
      voiceControlSlides: FREE_VOICE_SLIDES,
      pdfExport: false,
      pptExport: false,
      watermark: true,
      cloudStorage: false,
      analytics: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    limits: {
      maxImagesFullExperience: 500,
      maxImagesUpload: 500,
      monthlyPresentations: Infinity,
      voiceControlSlides: Infinity,
      pdfExport: true,
      pptExport: true,
      watermark: false,
      cloudStorage: true,
      analytics: true,
    },
  },
};

export function getPlan(planId: string): Plan {
  return PLANS[planId] ?? PLANS.free;
}

export function getRegionalPrice(countryCode: string): RegionalPrice {
  return REGIONAL_PRICES[countryCode] ?? REGIONAL_PRICES.DEFAULT;
}

export function isFullExperience(planId: string, imageCount: number): boolean {
  const plan = getPlan(planId);
  return imageCount <= plan.limits.maxImagesFullExperience;
}

export function canCreatePresentation(
  planId: string,
  monthlyUsed: number,
  imageCount: number,
  trialRemaining: number,
): boolean {
  if (trialRemaining > 0) return true;
  const plan = getPlan(planId);
  if (planId === 'pro') return true;
  if (imageCount <= plan.limits.maxImagesFullExperience) return true;
  return monthlyUsed < plan.limits.monthlyPresentations;
}

export function canUploadImage(planId: string, currentCount: number): boolean {
  const plan = getPlan(planId);
  return currentCount < plan.limits.maxImagesUpload;
}

export function shouldShowPaywall(
  planId: string,
  imageCount: number,
  slideIndex: number,
  trialRemaining: number,
): boolean {
  if (planId === 'pro') return false;
  if (trialRemaining > 0) return false;
  if (imageCount <= getPlan('free').limits.maxImagesFullExperience) return false;
  return slideIndex >= FREE_VOICE_SLIDES;
}

export function shouldShowWatermark(planId: string, trialRemaining: number): boolean {
  if (planId === 'pro') return false;
  if (trialRemaining > 0) return false;
  return true;
}
