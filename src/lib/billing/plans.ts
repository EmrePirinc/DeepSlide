export interface Plan {
  id: 'free' | 'pro';
  name: string;
  price: { monthly: number; yearly: number };
  limits: {
    maxPresentations: number;
    maxImagesPerPresentation: number;
    cloudStorage: boolean;
    analytics: boolean;
    sharing: boolean;
    qrCode: boolean;
  };
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Ücretsiz',
    price: { monthly: 0, yearly: 0 },
    limits: {
      maxPresentations: 3,
      maxImagesPerPresentation: 100,
      cloudStorage: false,
      analytics: false,
      sharing: false,
      qrCode: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Premium',
    price: { monthly: 15, yearly: 144 },
    limits: {
      maxPresentations: Infinity,
      maxImagesPerPresentation: 500,
      cloudStorage: true,
      analytics: true,
      sharing: true,
      qrCode: true,
    },
  },
};

export function getPlan(planId: string): Plan {
  return PLANS[planId] ?? PLANS.free;
}

export function canCreatePresentation(planId: string, currentCount: number): boolean {
  const plan = getPlan(planId);
  return currentCount < plan.limits.maxPresentations;
}

export function canUploadImage(planId: string, currentCount: number): boolean {
  const plan = getPlan(planId);
  return currentCount < plan.limits.maxImagesPerPresentation;
}
