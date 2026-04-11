// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { TransitionType, TransitionProvider } from './types';
import { zoomTransition } from './zoom';
import { fadeTransition } from './fade';
import { panTransition } from './pan';
import {
  noneTransition,
  fadeBlackTransition,
  slideRightTransition,
  slideLeftTransition,
  flipTransition,
  cubeTransition,
  galleryTransition,
} from './extended';

const transitions: Record<TransitionType, TransitionProvider> = {
  none: noneTransition,
  zoom: zoomTransition,
  fade: fadeTransition,
  pan: panTransition,
  fadeBlack: fadeBlackTransition,
  slideRight: slideRightTransition,
  slideLeft: slideLeftTransition,
  flip: flipTransition,
  cube: cubeTransition,
  gallery: galleryTransition,
};

export function getTransition(type: TransitionType): TransitionProvider {
  return transitions[type] ?? transitions.zoom;
}

export const TRANSITION_OPTIONS = [
  { value: 'none' as TransitionType, label: 'Yok', description: 'Geçiş efekti yok — anında geçiş' },
  { value: 'zoom' as TransitionType, label: 'Zoom', description: 'Prezi tarzı — görsel büyüyerek açılır' },
  { value: 'fade' as TransitionType, label: 'Kademeli', description: 'Solarak kaybolur, belirerek açılır' },
  { value: 'fadeBlack' as TransitionType, label: 'Karart', description: 'Siyaha solar, siyahtan belirir' },
  { value: 'slideRight' as TransitionType, label: 'Sağdan Kayma', description: 'Yeni slayt sağdan kayar' },
  { value: 'slideLeft' as TransitionType, label: 'Soldan Kayma', description: 'Yeni slayt soldan kayar' },
  { value: 'pan' as TransitionType, label: 'Pan', description: 'Yatay kayma — slayt gibi geçiş' },
  { value: 'flip' as TransitionType, label: 'Çevir', description: '3D kart çevirme efekti' },
  { value: 'cube' as TransitionType, label: 'Küp', description: '3D küp dönüşü' },
  { value: 'gallery' as TransitionType, label: 'Galeri', description: 'Küçülüp büyüme efekti' },
];
