// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * pptxtojson Slide → DeepSlide CanvasSlide + SlideObject[].
 *
 * - Worker ortamında çalışır (DOM bağımlılığı yok)
 * - EMU dönüşümü pptxtojson tarafından zaten pixel'a yapılmış
 * - layoutElements → locked background objects (zIndex: -1000)
 * - Image elementleri blob olarak ayrıştırılır, MappedImageBlob döner
 */

import type {
  Slide as PptxSlide,
  Element as PptxElement,
  Text as PptxText,
  Shape as PptxShape,
  Image as PptxImage,
  Table as PptxTable,
  Fill as PptxFill,
} from 'pptxtojson';

import type {
  CanvasSlide,
  SlideObject,
  TextObject,
  ShapeObject,
  ImageObject,
  ShapeType,
  SlideBackground,
  FillStyle,
  StrokeStyle,
} from '@/types/slide-object';

import type { MappedImageBlob, SkippedElement } from './types';
import { parseHtmlText } from './textParser';

interface MapContext {
  slideIndex: number;
  scaleX: number;
  scaleY: number;
  presentationId: string;
  skipped: SkippedElement[];
  images: MappedImageBlob[];
  /** Grup ofseti (nested group handling) */
  offsetX: number;
  offsetY: number;
  /** z-index counter */
  zCounter: { value: number };
}

interface MappedPresentationResult {
  slides: CanvasSlide[];
  images: MappedImageBlob[];
  skipped: SkippedElement[];
}

export function mapPresentationToCanvas(
  slides: PptxSlide[],
  sourceSize: { width: number; height: number },
  presentationId: string,
  canvasWidth: number,
  canvasHeight: number,
): MappedPresentationResult {
  const scaleX = canvasWidth / sourceSize.width;
  const scaleY = canvasHeight / sourceSize.height;

  const allImages: MappedImageBlob[] = [];
  const allSkipped: SkippedElement[] = [];
  const result: CanvasSlide[] = [];

  slides.forEach((slide, slideIndex) => {
    const ctx: MapContext = {
      slideIndex,
      scaleX,
      scaleY,
      presentationId,
      skipped: allSkipped,
      images: allImages,
      offsetX: 0,
      offsetY: 0,
      zCounter: { value: 1 },
    };

    const objects: SlideObject[] = [];

    // 1) Master/Layout elemanları arka planda, kilitli
    const layoutCtx = { ...ctx, zCounter: { value: -1000 } };
    for (const el of slide.layoutElements ?? []) {
      const mapped = mapElement(el, layoutCtx, true);
      if (mapped) objects.push(...mapped);
    }

    // 2) Slide elemanları
    for (const el of slide.elements ?? []) {
      const mapped = mapElement(el, ctx, false);
      if (mapped) objects.push(...mapped);
    }

    const background = mapBackground(slide.fill);
    const canvasSlide: CanvasSlide = {
      id: makeId(presentationId, slideIndex),
      presentationId,
      order: slideIndex,
      objects,
      background,
      hidden: false,
    };
    result.push(canvasSlide);
  });

  return { slides: result, images: allImages, skipped: allSkipped };
}

// ═══════════════════════════════════════════════════════════════════════════
// Element dispatch

function mapElement(
  el: PptxElement,
  ctx: MapContext,
  isLayout: boolean,
): SlideObject[] | null {
  // Group → recursive açma
  if (el.type === 'group') {
    const groupCtx: MapContext = {
      ...ctx,
      offsetX: ctx.offsetX + (el.left ?? 0),
      offsetY: ctx.offsetY + (el.top ?? 0),
    };
    const out: SlideObject[] = [];
    for (const child of el.elements ?? []) {
      const mapped = mapElement(child, groupCtx, isLayout);
      if (mapped) out.push(...mapped);
    }
    return out;
  }

  switch (el.type) {
    case 'text':
      return [mapText(el, ctx, isLayout)];
    case 'shape':
      return [mapShape(el, ctx, isLayout)];
    case 'image':
      return [mapImage(el, ctx, isLayout)];
    case 'table':
      return mapTable(el, ctx, isLayout);
    case 'chart':
    case 'video':
    case 'audio':
    case 'diagram':
    case 'math':
      ctx.skipped.push({
        slideIndex: ctx.slideIndex,
        kind: el.type,
        reason: `${el.type} Faz 1'de placeholder olarak eklendi`,
      });
      return [makePlaceholder(el, ctx, el.type, isLayout)];
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Text

function mapText(text: PptxText, ctx: MapContext, isLayout: boolean): TextObject {
  const style = parseHtmlText(text.content);
  const base = baseTransform(text, ctx);

  return {
    id: newId('t', ctx),
    type: 'text',
    ...base,
    zIndex: nextZ(ctx),
    locked: isLayout,
    visible: true,
    opacity: 1,
    content: style.plainText || ' ',
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: 'none',
    color: style.color,
    highlightColor: 'transparent',
    textAlign: style.textAlign,
    lineHeight: 1.3,
    listType: style.listType,
    verticalAlign: mapVAlign(text.vAlign),
  };
}

function mapVAlign(v: string | undefined): 'top' | 'middle' | 'bottom' {
  if (v === 'mid' || v === 'ctr') return 'middle';
  if (v === 'b' || v === 'bot') return 'bottom';
  return 'top';
}

// ═══════════════════════════════════════════════════════════════════════════
// Shape

function mapShape(shape: PptxShape, ctx: MapContext, isLayout: boolean): ShapeObject {
  const base = baseTransform(shape, ctx);
  const shapeType = mapShapeType(shape.shapType);
  const fill = mapFillToStyle(shape.fill);
  const stroke = mapStroke(shape);

  const textStyle = shape.content ? parseHtmlText(shape.content) : null;

  return {
    id: newId('s', ctx),
    type: 'shape',
    ...base,
    zIndex: nextZ(ctx),
    locked: isLayout,
    visible: true,
    opacity: 1,
    shapeType,
    fill,
    stroke,
    shadow: {
      enabled: !!shape.shadow,
      color: shape.shadow?.color ?? 'rgba(0,0,0,0.3)',
      blur: shape.shadow?.blur ?? 10,
      offsetX: shape.shadow?.h ?? 0,
      offsetY: shape.shadow?.v ?? 4,
    },
    textContent: textStyle?.plainText || undefined,
    textColor: textStyle?.color,
    textFontSize: textStyle?.fontSize,
    textAlign: textStyle?.textAlign,
  };
}

const SHAPE_TYPE_MAP: Record<string, ShapeType> = {
  rect: 'rectangle',
  roundRect: 'roundedRect',
  round1Rect: 'roundedRect',
  round2SameRect: 'roundedRect',
  ellipse: 'ellipse',
  oval: 'ellipse',
  circle: 'circle',
  triangle: 'triangle',
  rtTriangle: 'rightTriangle',
  diamond: 'diamond',
  pentagon: 'pentagon',
  hexagon: 'hexagon',
  star5: 'star5',
  star6: 'star6',
  plus: 'plus',
  rightArrow: 'arrowRight',
  leftArrow: 'arrowLeft',
  upArrow: 'arrowUp',
  downArrow: 'arrowDown',
  chevron: 'chevron',
  heart: 'heart',
  lightningBolt: 'lightning',
  cloud: 'cloud',
  wedgeRectCallout: 'speechBubble',
};

function mapShapeType(type: string | undefined): ShapeType {
  if (!type) return 'rectangle';
  return SHAPE_TYPE_MAP[type] ?? 'rectangle';
}

function mapFillToStyle(fill: PptxFill): FillStyle {
  if (!fill) return { type: 'none', color: '#6366F1' };
  if (fill.type === 'color') {
    return { type: 'solid', color: fill.value || '#6366F1' };
  }
  if (fill.type === 'gradient') {
    const colors = fill.value.colors ?? [];
    return {
      type: 'gradient',
      color: colors[0]?.color ?? '#6366F1',
      gradientStart: colors[0]?.color ?? '#6366F1',
      gradientEnd: colors[colors.length - 1]?.color ?? '#A855F7',
      gradientAngle: fill.value.rot ?? 0,
      gradientType: fill.value.path === 'circle' || fill.value.path === 'shape' ? 'radial' : 'linear',
    };
  }
  return { type: 'none', color: '#6366F1' };
}

function mapStroke(shape: PptxShape): StrokeStyle {
  return {
    color: shape.borderColor || '#FFFFFF',
    width: shape.borderWidth || 0,
    style: (shape.borderType === 'dashed' || shape.borderType === 'dotted')
      ? shape.borderType
      : 'solid',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Image

function mapImage(img: PptxImage, ctx: MapContext, isLayout: boolean): ImageObject {
  const base = baseTransform(img, ctx);
  const blobKey = `${ctx.presentationId}_pptx_${ctx.slideIndex}_${ctx.images.length}`;
  const dataUrl = img.base64 || img.blob || '';
  const mimeType = dataUrl.startsWith('data:') ? dataUrl.split(';')[0].slice(5) : 'image/png';

  ctx.images.push({
    blobKey,
    dataUrl,
    mimeType,
  });

  return {
    id: newId('i', ctx),
    type: 'image',
    ...base,
    zIndex: nextZ(ctx),
    locked: isLayout,
    visible: true,
    opacity: 1,
    blobKey,
    thumbnailUrl: dataUrl,
    originalWidth: img.width ?? 0,
    originalHeight: img.height ?? 0,
    brightness: 100,
    contrast: 100,
    blur: 0,
    borderRadius: 0,
    stroke: {
      color: img.borderColor || 'transparent',
      width: img.borderWidth || 0,
      style: 'solid',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Table → grid of TextObjects + ShapeObjects

function mapTable(table: PptxTable, ctx: MapContext, isLayout: boolean): SlideObject[] {
  const rows = table.data?.length ?? 0;
  if (rows === 0) return [];
  const cols = table.data[0]?.length ?? 0;
  if (cols === 0) return [];

  const base = baseTransform(table, ctx);
  const out: SlideObject[] = [];
  const rowHeight = base.height / rows;
  const colWidth = base.width / cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = table.data[r][c];
      const cellX = base.x + c * colWidth;
      const cellY = base.y + r * rowHeight;

      // Hücre arkaplan dikdörtgeni
      out.push({
        id: newId('tc', ctx),
        type: 'shape',
        x: cellX,
        y: cellY,
        width: colWidth,
        height: rowHeight,
        rotation: 0,
        zIndex: nextZ(ctx),
        locked: isLayout,
        visible: true,
        opacity: 1,
        shapeType: 'rectangle',
        fill: {
          type: cell.fillColor ? 'solid' : 'none',
          color: cell.fillColor || '#FFFFFF',
        },
        stroke: { color: '#9CA3AF', width: 1, style: 'solid' },
        shadow: {
          enabled: false,
          color: 'rgba(0,0,0,0.3)',
          blur: 0,
          offsetX: 0,
          offsetY: 0,
        },
      });

      if (cell.text) {
        out.push({
          id: newId('tt', ctx),
          type: 'text',
          x: cellX + 4,
          y: cellY + 4,
          width: colWidth - 8,
          height: rowHeight - 8,
          rotation: 0,
          zIndex: nextZ(ctx),
          locked: isLayout,
          visible: true,
          opacity: 1,
          content: cell.text,
          fontFamily: 'Inter',
          fontSize: Math.max(10, Math.min(rowHeight * 0.4, 16)),
          fontWeight: cell.fontBold ? 700 : 400,
          fontStyle: 'normal',
          textDecoration: 'none',
          color: cell.fontColor || '#000000',
          highlightColor: 'transparent',
          textAlign: 'left',
          lineHeight: 1.2,
          listType: 'none',
          verticalAlign: 'middle',
        });
      }
    }
  }

  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// Placeholder

function makePlaceholder(
  el: PptxElement,
  ctx: MapContext,
  kind: string,
  isLayout: boolean,
): ShapeObject {
  const base = baseTransform(el as PptxShape, ctx);
  return {
    id: newId('ph', ctx),
    type: 'shape',
    ...base,
    zIndex: nextZ(ctx),
    locked: isLayout,
    visible: true,
    opacity: 0.6,
    shapeType: 'rectangle',
    fill: { type: 'solid', color: '#F3F4F6' },
    stroke: { color: '#9CA3AF', width: 2, style: 'dashed' },
    shadow: {
      enabled: false,
      color: 'rgba(0,0,0,0.3)',
      blur: 0,
      offsetX: 0,
      offsetY: 0,
    },
    textContent: `[${kind.toUpperCase()}]`,
    textColor: '#6B7280',
    textFontSize: 16,
    textAlign: 'center',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Background

function mapBackground(fill: PptxFill): SlideBackground {
  if (!fill) return { type: 'solid', color: '#FFFFFF' };
  if (fill.type === 'color') {
    return { type: 'solid', color: fill.value || '#FFFFFF' };
  }
  if (fill.type === 'gradient') {
    const colors = fill.value.colors ?? [];
    return {
      type: 'gradient',
      color: colors[0]?.color ?? '#FFFFFF',
      gradientStart: colors[0]?.color ?? '#FFFFFF',
      gradientEnd: colors[colors.length - 1]?.color ?? '#E5E7EB',
      gradientAngle: fill.value.rot ?? 0,
      gradientType: 'linear',
    };
  }
  if (fill.type === 'image') {
    return {
      type: 'image',
      color: '#FFFFFF',
      imageUrl: fill.value.base64 || fill.value.blob || '',
      imageFit: 'cover',
    };
  }
  return { type: 'solid', color: '#FFFFFF' };
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers

interface BaseTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

function baseTransform(
  el: { left: number; top: number; width: number; height: number; rotate?: number },
  ctx: MapContext,
): BaseTransform {
  return {
    x: (el.left + ctx.offsetX) * ctx.scaleX,
    y: (el.top + ctx.offsetY) * ctx.scaleY,
    width: el.width * ctx.scaleX,
    height: el.height * ctx.scaleY,
    rotation: el.rotate ?? 0,
  };
}

function nextZ(ctx: MapContext): number {
  ctx.zCounter.value += 1;
  return ctx.zCounter.value;
}

function newId(prefix: string, ctx: MapContext): string {
  return `${prefix}_${ctx.slideIndex}_${ctx.zCounter.value}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeId(presentationId: string, slideIndex: number): string {
  return `${presentationId}_s${slideIndex}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
