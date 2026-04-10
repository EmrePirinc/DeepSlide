// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Ken Burns efekti — rastgele pan + zoom animasyon parametreleri üretir.
 * ImageCardAnimated'a Framer Motion animate prop olarak geçirilir.
 */

export interface KenBurnsConfig {
  duration: number;
  scale: [number, number];
  x: [string, string];
  y: [string, string];
}

const PRESETS: Array<{
  scale: [number, number];
  x: [number, number];
  y: [number, number];
  duration: number;
}> = [
  { duration: 8,  scale: [1,    1.15], x: [0, -5], y: [0,  -3] },
  { duration: 10, scale: [1.10, 1   ], x: [-3, 3], y: [-2,  2] },
  { duration: 9,  scale: [1,    1.12], x: [5,  0], y: [3,   0] },
  { duration: 11, scale: [1.08, 1   ], x: [0,  4], y: [0,  -4] },
  { duration: 9,  scale: [1,    1.10], x: [-4, 0], y: [0,   3] },
  { duration: 12, scale: [1.05, 1.15], x: [2, -2], y: [2,  -2] },
];

/** Seed'e göre deterministik preset seçer (aynı görsel hep aynı efekti alır). */
export function getKenBurnsConfig(seed: number): KenBurnsConfig {
  const preset = PRESETS[Math.abs(seed) % PRESETS.length];
  return {
    duration: preset.duration,
    scale: preset.scale,
    x: [`${preset.x[0]}%`, `${preset.x[1]}%`],
    y: [`${preset.y[0]}%`, `${preset.y[1]}%`],
  };
}

/** Framer Motion `animate` prop'una doğrudan geçirilebilecek obje döndürür. */
export function buildKenBurnsAnimate(config: KenBurnsConfig) {
  return {
    scale: config.scale,
    x: config.x,
    y: config.y,
    transition: {
      duration: config.duration,
      ease: 'linear' as const,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  };
}

/** Görsel ID'sinden sayısal seed üret. */
export function seedFromId(id: string): number {
  return id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}
