// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * 20 temel şeklin SVG path tanımları.
 * Her şekil viewBox="0 0 100 100" standardında.
 */

import type { ShapeType } from '@/types/slide-object';

export interface ShapeDefinition {
  id: ShapeType;
  name: string;
  category: 'basic' | 'arrows' | 'callouts';
  /** SVG path veya element string */
  svgContent: string;
}

export const SHAPE_DEFINITIONS: ShapeDefinition[] = [
  // ─── Temel Şekiller ────────────────────
  {
    id: 'rectangle',
    name: 'Dikdörtgen',
    category: 'basic',
    svgContent: '<rect x="5" y="15" width="90" height="70" rx="0"/>',
  },
  {
    id: 'roundedRect',
    name: 'Yuvarlatılmış',
    category: 'basic',
    svgContent: '<rect x="5" y="15" width="90" height="70" rx="12"/>',
  },
  {
    id: 'circle',
    name: 'Daire',
    category: 'basic',
    svgContent: '<circle cx="50" cy="50" r="45"/>',
  },
  {
    id: 'ellipse',
    name: 'Elips',
    category: 'basic',
    svgContent: '<ellipse cx="50" cy="50" rx="45" ry="30"/>',
  },
  {
    id: 'triangle',
    name: 'Üçgen',
    category: 'basic',
    svgContent: '<polygon points="50,5 95,95 5,95"/>',
  },
  {
    id: 'rightTriangle',
    name: 'Dik Üçgen',
    category: 'basic',
    svgContent: '<polygon points="5,5 95,95 5,95"/>',
  },
  {
    id: 'diamond',
    name: 'Eşkenar Dörtgen',
    category: 'basic',
    svgContent: '<polygon points="50,5 95,50 50,95 5,50"/>',
  },
  {
    id: 'pentagon',
    name: 'Beşgen',
    category: 'basic',
    svgContent: '<polygon points="50,5 97,38 79,95 21,95 3,38"/>',
  },
  {
    id: 'hexagon',
    name: 'Altıgen',
    category: 'basic',
    svgContent: '<polygon points="25,5 75,5 100,50 75,95 25,95 0,50"/>',
  },
  {
    id: 'star5',
    name: 'Yıldız (5)',
    category: 'basic',
    svgContent: '<polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"/>',
  },
  {
    id: 'star6',
    name: 'Yıldız (6)',
    category: 'basic',
    svgContent: '<polygon points="50,5 62,30 95,30 70,50 95,70 62,70 50,95 38,70 5,70 30,50 5,30 38,30"/>',
  },
  {
    id: 'plus',
    name: 'Artı',
    category: 'basic',
    svgContent: '<polygon points="35,5 65,5 65,35 95,35 95,65 65,65 65,95 35,95 35,65 5,65 5,35 35,35"/>',
  },

  // ─── Oklar ─────────────────────────────
  {
    id: 'arrowRight',
    name: 'Sağ Ok',
    category: 'arrows',
    svgContent: '<polygon points="5,30 60,30 60,10 95,50 60,90 60,70 5,70"/>',
  },
  {
    id: 'arrowLeft',
    name: 'Sol Ok',
    category: 'arrows',
    svgContent: '<polygon points="95,30 40,30 40,10 5,50 40,90 40,70 95,70"/>',
  },
  {
    id: 'arrowUp',
    name: 'Yukarı Ok',
    category: 'arrows',
    svgContent: '<polygon points="30,95 30,40 10,40 50,5 90,40 70,40 70,95"/>',
  },
  {
    id: 'arrowDown',
    name: 'Aşağı Ok',
    category: 'arrows',
    svgContent: '<polygon points="30,5 30,60 10,60 50,95 90,60 70,60 70,5"/>',
  },
  {
    id: 'chevron',
    name: 'Chevron',
    category: 'arrows',
    svgContent: '<polygon points="5,5 70,5 95,50 70,95 5,95 30,50"/>',
  },

  // ─── Belirtme / Özel ───────────────────
  {
    id: 'heart',
    name: 'Kalp',
    category: 'callouts',
    svgContent: '<path d="M50,88 C15,60 0,30 25,15 C40,7 50,20 50,20 C50,20 60,7 75,15 C100,30 85,60 50,88Z"/>',
  },
  {
    id: 'lightning',
    name: 'Yıldırım',
    category: 'callouts',
    svgContent: '<polygon points="60,5 25,50 45,50 35,95 75,45 55,45"/>',
  },
  {
    id: 'cloud',
    name: 'Bulut',
    category: 'callouts',
    svgContent: '<path d="M25,70 C10,70 5,58 15,50 C10,40 20,30 32,32 C35,20 50,15 60,22 C68,15 82,18 85,30 C95,32 98,45 90,55 C98,62 92,75 80,70Z"/>',
  },
  {
    id: 'speechBubble',
    name: 'Konuşma Balonu',
    category: 'callouts',
    svgContent: '<path d="M10,10 L90,10 C93,10 95,12 95,15 L95,60 C95,63 93,65 90,65 L40,65 L20,85 L25,65 L10,65 C7,65 5,63 5,60 L5,15 C5,12 7,10 10,10Z"/>',
  },
];

/** Kategoriye göre şekilleri filtrele */
export function getShapesByCategory(category: 'basic' | 'arrows' | 'callouts'): ShapeDefinition[] {
  return SHAPE_DEFINITIONS.filter(s => s.category === category);
}

/** ID ile şekil tanımı bul */
export function getShapeDefinition(id: ShapeType): ShapeDefinition | undefined {
  return SHAPE_DEFINITIONS.find(s => s.id === id);
}
