// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Genişletilmiş geçiş efektleri — mevcut zoom/fade/pan'a ek 7 efekt.
 */

import type { TransitionProvider } from './types';

/** Yok — anında geçiş */
export const noneTransition: TransitionProvider = {
  name: 'Yok',
  type: 'none',
  enter: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
  },
  exit: {
    initial: { opacity: 1 },
    animate: { opacity: 0, transition: { duration: 0.05 } },
  },
};

/** Karart — siyah üzerinden geçiş */
export const fadeBlackTransition: TransitionProvider = {
  name: 'Karart',
  type: 'fadeBlack',
  enter: {
    initial: { opacity: 0, backgroundColor: '#000000' },
    animate: {
      opacity: 1,
      backgroundColor: 'transparent',
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  },
  exit: {
    initial: { opacity: 1 },
    animate: {
      opacity: 0,
      backgroundColor: '#000000',
      transition: { duration: 0.4, ease: 'easeIn' },
    },
  },
};

/** Sağdan kayma */
export const slideRightTransition: TransitionProvider = {
  name: 'Sağdan Kayma',
  type: 'slideRight',
  enter: {
    initial: { x: '100%', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    initial: { x: 0, opacity: 1 },
    animate: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

/** Soldan kayma */
export const slideLeftTransition: TransitionProvider = {
  name: 'Soldan Kayma',
  type: 'slideLeft',
  enter: {
    initial: { x: '-100%', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    initial: { x: 0, opacity: 1 },
    animate: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

/** 3D Çevir (Flip) */
export const flipTransition: TransitionProvider = {
  name: 'Çevir',
  type: 'flip',
  enter: {
    initial: { rotateY: 90, opacity: 0 },
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    initial: { rotateY: 0, opacity: 1 },
    animate: {
      rotateY: -90,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' },
    },
  },
};

/** 3D Küp */
export const cubeTransition: TransitionProvider = {
  name: 'Küp',
  type: 'cube',
  enter: {
    initial: { rotateY: 90, x: '50%', opacity: 0, scale: 0.8 },
    animate: {
      rotateY: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    initial: { rotateY: 0, x: 0, opacity: 1, scale: 1 },
    animate: {
      rotateY: -90,
      x: '-50%',
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.5, ease: 'easeIn' },
    },
  },
};

/** Galeri */
export const galleryTransition: TransitionProvider = {
  name: 'Galeri',
  type: 'gallery',
  enter: {
    initial: { scale: 0.8, opacity: 0, y: 30 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    initial: { scale: 1, opacity: 1, y: 0 },
    animate: {
      scale: 0.8,
      opacity: 0,
      y: -30,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  },
};
