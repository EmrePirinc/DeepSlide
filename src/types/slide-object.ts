// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Canvas nesne veri modeli — SlideCanvas üzerindeki tüm nesnelerin type tanımları.
 * Her nesne: konum, boyut, döndürme, z-index, stil ve içerik bilgisi taşır.
 */

// ─── Temel Nesne Arayüzü ─────────────────────────────

export interface BaseObject {
  id: string;
  type: SlideObjectType;
  x: number;          // px (slayt sol kenarından)
  y: number;          // px (slayt üst kenarından)
  width: number;      // px
  height: number;     // px
  rotation: number;   // derece (0-360)
  zIndex: number;     // katman sırası
  locked: boolean;    // kilitli nesneler taşınamaz/boyutlandırılamaz
  visible: boolean;   // görünürlük
  opacity: number;    // 0-1
}

export type SlideObjectType = 'text' | 'shape' | 'line' | 'image';

// ─── Metin Nesnesi ─────────────────────────────────────

export interface TextObject extends BaseObject {
  type: 'text';
  content: string;           // HTML veya plain text
  fontFamily: string;        // ör: 'Inter'
  fontSize: number;          // px
  fontWeight: FontWeight;
  fontStyle: 'normal' | 'italic';
  textDecoration: TextDecoration;
  color: string;             // hex: #RRGGBB
  highlightColor: string;    // hex veya 'transparent'
  textAlign: TextAlign;
  lineHeight: number;        // ör: 1.5
  listType: ListType;
  verticalAlign: 'top' | 'middle' | 'bottom';
}

export type FontWeight = 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type TextDecoration = 'none' | 'underline' | 'line-through';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type ListType = 'none' | 'bullet' | 'numbered';

// ─── Şekil Nesnesi ─────────────────────────────────────

export interface ShapeObject extends BaseObject {
  type: 'shape';
  shapeType: ShapeType;
  fill: FillStyle;
  stroke: StrokeStyle;
  shadow: ShadowStyle;
  /** Şekil içine metin ekleme (opsiyonel) */
  textContent?: string;
  textColor?: string;
  textFontSize?: number;
  textAlign?: TextAlign;
}

export type ShapeType =
  | 'rectangle' | 'roundedRect' | 'circle' | 'ellipse'
  | 'triangle' | 'rightTriangle' | 'diamond'
  | 'pentagon' | 'hexagon'
  | 'star5' | 'star6'
  | 'plus'
  | 'arrowRight' | 'arrowLeft' | 'arrowUp' | 'arrowDown'
  | 'chevron'
  | 'heart' | 'lightning' | 'cloud'
  | 'speechBubble';

// ─── Çizgi Nesnesi ─────────────────────────────────────

export interface LineObject extends BaseObject {
  type: 'line';
  lineType: LineType;
  /** Çizgi başlangıç noktası (nesne koordinatlarına göre) */
  startX: number;
  startY: number;
  /** Çizgi bitiş noktası */
  endX: number;
  endY: number;
  stroke: StrokeStyle;
  startArrow: ArrowType;
  endArrow: ArrowType;
}

export type LineType = 'straight' | 'arrow' | 'doubleArrow' | 'elbow';
export type ArrowType = 'none' | 'triangle' | 'circle' | 'square' | 'diamond';

// ─── Görsel Nesnesi ────────────────────────────────────

export interface ImageObject extends BaseObject {
  type: 'image';
  blobKey: string;           // IndexedDB key
  thumbnailUrl: string;      // data URL
  originalWidth: number;     // orijinal piksel genişliği
  originalHeight: number;    // orijinal piksel yüksekliği
  /** Kırpma alanı (opsiyonel) */
  cropRect?: CropRect;
  /** Filtreler */
  brightness: number;        // 0-200 (100 = normal)
  contrast: number;          // 0-200 (100 = normal)
  blur: number;              // 0-20 px
  borderRadius: number;      // px
  stroke: StrokeStyle;
}

export interface CropRect {
  x: number;       // % (0-100)
  y: number;       // % (0-100)
  width: number;   // % (0-100)
  height: number;  // % (0-100)
}

// ─── Paylaşılan Stil Tipleri ───────────────────────────

export interface FillStyle {
  type: 'solid' | 'gradient' | 'none';
  color: string;                    // hex (solid için)
  gradientStart?: string;           // hex
  gradientEnd?: string;             // hex
  gradientAngle?: number;           // derece (0-360)
  gradientType?: 'linear' | 'radial';
}

export interface StrokeStyle {
  color: string;                    // hex
  width: number;                    // px (0 = kenarlık yok)
  style: 'solid' | 'dashed' | 'dotted';
}

export interface ShadowStyle {
  enabled: boolean;
  color: string;                    // hex + alpha
  blur: number;                     // px
  offsetX: number;                  // px
  offsetY: number;                  // px
}

// ─── Union Type ────────────────────────────────────────

export type SlideObject = TextObject | ShapeObject | LineObject | ImageObject;

// ─── Slayt Arka Plan ──────────────────────────────────

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image';
  color: string;                   // hex (solid)
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  gradientType?: 'linear' | 'radial';
  imageUrl?: string;               // data URL veya blob key
  imageFit?: 'cover' | 'contain';
  imageBlur?: number;              // 0-20 px
}

// ─── Slayt Tanımı (Canvas Seviyesinde) ─────────────────

export interface CanvasSlide {
  id: string;
  presentationId: string;
  order: number;
  objects: SlideObject[];
  background: SlideBackground;
  hidden: boolean;
  layoutId?: string;               // Hangi layout şablonundan oluşturuldu
  transitionType?: string;         // Slayt bazlı geçiş efekti override
  transitionSpeed?: 'slow' | 'medium' | 'fast';
}

// ─── Varsayılan Değerler ───────────────────────────────

export const DEFAULT_FILL: FillStyle = {
  type: 'none',
  color: '#6366F1',
};

export const DEFAULT_STROKE: StrokeStyle = {
  color: '#FFFFFF',
  width: 2,
  style: 'solid',
};

export const DEFAULT_SHADOW: ShadowStyle = {
  enabled: false,
  color: 'rgba(0,0,0,0.3)',
  blur: 10,
  offsetX: 0,
  offsetY: 4,
};

export const DEFAULT_BACKGROUND: SlideBackground = {
  type: 'solid',
  color: '#070D1F',
};

export function createDefaultTextObject(partial: Partial<TextObject> & { id: string; x: number; y: number; width: number; height: number }): TextObject {
  return {
    type: 'text',
    zIndex: 0,
    rotation: 0,
    locked: false,
    visible: true,
    opacity: 1,
    content: '',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 400,
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#F8FAFC',
    highlightColor: 'transparent',
    textAlign: 'left',
    lineHeight: 1.5,
    listType: 'none',
    verticalAlign: 'top',
    ...partial,
  };
}

export function createDefaultShapeObject(partial: Partial<ShapeObject> & { id: string; x: number; y: number; width: number; height: number; shapeType: ShapeType }): ShapeObject {
  return {
    type: 'shape',
    zIndex: 0,
    rotation: 0,
    locked: false,
    visible: true,
    opacity: 1,
    fill: { ...DEFAULT_FILL },
    stroke: { ...DEFAULT_STROKE },
    shadow: { ...DEFAULT_SHADOW },
    ...partial,
  };
}

export function createDefaultLineObject(partial: Partial<LineObject> & { id: string; startX: number; startY: number; endX: number; endY: number }): LineObject {
  return {
    type: 'line',
    x: Math.min(partial.startX, partial.endX),
    y: Math.min(partial.startY, partial.endY),
    width: Math.abs(partial.endX - partial.startX),
    height: Math.abs(partial.endY - partial.startY),
    zIndex: 0,
    rotation: 0,
    locked: false,
    visible: true,
    opacity: 1,
    lineType: 'straight',
    stroke: { color: '#F8FAFC', width: 2, style: 'solid' },
    startArrow: 'none',
    endArrow: 'none',
    ...partial,
  };
}
