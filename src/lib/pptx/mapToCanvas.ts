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
  LineObject,
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

    // Slide elemanları (layoutElements kasıtlı olarak atlandı —
    // master placeholder kutuları gürültü yaratıyor ve asıl içeriği perdeliyor)
    for (const el of slide.elements ?? []) {
      const mapped = mapElement(el, ctx, false);
      if (mapped) objects.push(...mapped);
    }

    // Background: önce slide.fill, yoksa layoutElements içindeki tam-slayt
    // boyutlu Shape'in fill'inden türet, yoksa neutral beyaz
    const background = deriveBackground(slide, sourceSize);

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

  // FINAL NORMALIZE PASS: tüm nesnelerin w/h pozitif, x/y sonlu olsun
  for (const slide of result) {
    for (const obj of slide.objects) {
      if (!Number.isFinite(obj.x)) obj.x = 0;
      if (!Number.isFinite(obj.y)) obj.y = 0;
      obj.width = Math.max(1, Math.abs(obj.width));
      obj.height = Math.max(1, Math.abs(obj.height));
      // Line nesnesi için start/end koordinatları da clamp
      if (obj.type === 'line') {
        const line = obj as LineObject;
        if (!Number.isFinite(line.startX)) line.startX = 0;
        if (!Number.isFinite(line.startY)) line.startY = 0;
        if (!Number.isFinite(line.endX)) line.endX = line.width;
        if (!Number.isFinite(line.endY)) line.endY = 0;
      }
    }
  }

  if (typeof console !== 'undefined') {
    // Summary + ilk 2 slaytın mapped objects'leri
    const summary = {
      slideCount: result.length,
      totalObjects: result.reduce((n, s) => n + s.objects.length, 0),
      imageCount: allImages.length,
      skippedCount: allSkipped.length,
    };
    // eslint-disable-next-line no-console
    console.log('[PPTX MAP] ' + JSON.stringify(summary));
    for (let i = 0; i < Math.min(2, result.length); i++) {
      const slide = result[i];
      const obj = slide.objects.slice(0, 8).map((o) => {
        const r: Record<string, unknown> = {
          type: o.type,
          x: Math.round(o.x),
          y: Math.round(o.y),
          w: Math.round(o.width),
          h: Math.round(o.height),
          z: o.zIndex,
        };
        if (o.type === 'text') {
          const t = o as { content: string; color: string; fontSize: number };
          r.text = (t.content || '').slice(0, 60);
          r.color = t.color;
          r.size = t.fontSize;
        }
        if (o.type === 'shape') {
          const sh = o as { shapeType: string; fill: { type: string; color: string }; textContent?: string };
          r.shape = sh.shapeType;
          r.fill = `${sh.fill.type}:${sh.fill.color}`;
          if (sh.textContent) r.txt = sh.textContent.slice(0, 40);
        }
        return r;
      });
      // eslint-disable-next-line no-console
      console.log(`[PPTX MAP] slide[${i}] bg=${JSON.stringify(slide.background)} objects=\n` + obj.map((x) => JSON.stringify(x)).join('\n'));
    }
  }

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
    case 'shape': {
      // 1) Shape + image fill → ImageObject (profil fotoğrafları)
      if (el.fill && el.fill.type === 'image') {
        const imgObj = mapShapeAsImage(el, ctx, isLayout);
        if (imgObj) return [imgObj];
      }
      // 2) shapType 'line' (çizgi) + height 0 → LineObject
      if (el.shapType === 'line' || (el.height ?? 0) === 0) {
        return [mapShapeAsLine(el, ctx, isLayout)];
      }
      // 3) Shape'in content'i varsa ve fill boş/yok → bu aslında metin kutusu.
      //    PPTX'te metin kutusu teknik olarak "shape with content" olarak encode edilir.
      const hasText = !!el.content && el.content.trim().length > 0;
      const hasVisibleFill =
        el.fill &&
        ((el.fill.type === 'color' && el.fill.value && el.fill.value !== '') ||
          el.fill.type === 'gradient');
      if (hasText && !hasVisibleFill) {
        return [mapShapeAsText(el, ctx, isLayout)];
      }
      return [mapShape(el, ctx, isLayout)];
    }
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

/**
 * Shape + HTML content + fill yok → TextObject'e çevir.
 * PPTX metin kutuları teknik olarak "shape" tipinde saklanır.
 */
function mapShapeAsText(shape: PptxShape, ctx: MapContext, isLayout: boolean): TextObject {
  const style = parseHtmlText(shape.content);
  const base = baseTransform(shape, ctx);
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
    fontSize: scaleFontSize(style.fontSize, ctx),
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: 'none',
    color: style.color,
    highlightColor: 'transparent',
    textAlign: style.textAlign,
    lineHeight: 1.3,
    listType: style.listType,
    verticalAlign: mapVAlign(shape.vAlign),
  };
}

/**
 * Shape (line veya height=0) → LineObject'e çevir.
 */
function mapShapeAsLine(shape: PptxShape, ctx: MapContext, isLayout: boolean): LineObject {
  const base = baseTransform(shape, ctx);
  return {
    id: newId('l', ctx),
    type: 'line',
    x: base.x,
    y: base.y,
    width: Math.max(1, base.width),
    height: Math.max(1, base.height),
    rotation: base.rotation,
    zIndex: nextZ(ctx),
    locked: isLayout,
    visible: true,
    opacity: 1,
    lineType: 'straight',
    startX: 0,
    startY: 0,
    endX: Math.max(1, base.width),
    endY: 0,
    stroke: {
      color: shape.borderColor || '#9CA3AF',
      width: Math.max(1, shape.borderWidth || 2),
      style: shape.borderType === 'dashed' || shape.borderType === 'dotted' ? shape.borderType : 'solid',
    },
    startArrow: 'none',
    endArrow: 'none',
  };
}

/**
 * Şekil + image fill → ImageObject'e çevir. Şekil tipi circle/ellipse ise
 * borderRadius ile yuvarlat (kullanıcının profil fotoğrafları bu desendedir).
 */
function mapShapeAsImage(shape: PptxShape, ctx: MapContext, isLayout: boolean): ImageObject | null {
  if (shape.fill.type !== 'image') return null;
  const base = baseTransform(shape, ctx);
  const blobKey = `${ctx.presentationId}_pptx_${ctx.slideIndex}_${ctx.images.length}`;
  const dataUrl = shape.fill.value.base64 || shape.fill.value.blob || '';
  if (!dataUrl) return null;
  const mimeType = dataUrl.startsWith('data:') ? dataUrl.split(';')[0].slice(5) : 'image/png';
  ctx.images.push({ blobKey, dataUrl, mimeType });

  const isCircular =
    shape.shapType === 'ellipse' ||
    shape.shapType === 'oval' ||
    shape.shapType === 'circle';

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
    originalWidth: base.width,
    originalHeight: base.height,
    brightness: 100,
    contrast: 100,
    blur: 0,
    borderRadius: isCircular ? Math.min(base.width, base.height) / 2 : 0,
    stroke: {
      color: shape.borderColor || 'transparent',
      width: shape.borderWidth || 0,
      style: 'solid',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Text

function scaleFontSize(rawPt: number, ctx: MapContext): number {
  // Raw PPTX pt → canvas pixel. Kare slide için scaleX=scaleY, değilse ortalama.
  const scale = (ctx.scaleX + ctx.scaleY) / 2;
  const px = Math.round(rawPt * scale);
  return Math.max(8, Math.min(200, px));
}

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
    fontSize: scaleFontSize(style.fontSize, ctx),
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
    // Boş value ise transparent kabul et (pptxtojson theme color resolve edemedi)
    if (!fill.value || fill.value === '') {
      return { type: 'none', color: '#6366F1' };
    }
    return { type: 'solid', color: fill.value };
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
  // image fill buraya gelirse bile shape dispatch'te yakalanmış olmalı
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
          fontSize: Math.max(8, Math.min(Math.round(rowHeight * 0.4), 14)),
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

/**
 * Slayt arka planını türet:
 * 1) slide.fill set edilmişse direkt
 * 2) layoutElements içinde slide boyutunda full-cover Shape varsa onun fill'i
 * 3) elements içinde (0,0) başlayan tam kaplayıcı Shape varsa onun fill'i
 * 4) Neutral beyaz
 */
function deriveBackground(slide: PptxSlide, sourceSize: { width: number; height: number }): SlideBackground {
  if (slide.fill) {
    const bg = mapBackground(slide.fill);
    if (bg.type !== 'solid' || bg.color !== '#FFFFFF') return bg;
  }

  const coversSlide = (el: PptxElement): boolean => {
    if (el.type !== 'shape') return false;
    const tol = Math.max(sourceSize.width, sourceSize.height) * 0.05;
    return (
      Math.abs(el.left) < tol &&
      Math.abs(el.top) < tol &&
      el.width >= sourceSize.width * 0.9 &&
      el.height >= sourceSize.height * 0.9
    );
  };

  const candidates = [...(slide.elements ?? []), ...(slide.layoutElements ?? [])];
  for (const el of candidates) {
    if (coversSlide(el) && el.type === 'shape' && el.fill) {
      const bg = mapBackground(el.fill);
      if (bg.type !== 'solid' || bg.color !== '#FFFFFF') return bg;
    }
  }

  return { type: 'solid', color: '#FFFFFF' };
}

function mapBackground(fill: PptxFill): SlideBackground {
  if (!fill) return { type: 'solid', color: '#FFFFFF' };
  if (fill.type === 'color') {
    // Boş value → resolve edilemedi, beyaz fallback
    const val = fill.value && fill.value !== '' ? fill.value : '#FFFFFF';
    return { type: 'solid', color: val };
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
  // Negatif width/height (flip veya mirrored shape) → abs, çünkü DeepSlide
  // canvas ve SVG rect negatif boyut kabul etmez
  const w = Math.max(1, Math.abs((el.width ?? 0) * ctx.scaleX));
  const h = Math.max(1, Math.abs((el.height ?? 0) * ctx.scaleY));
  return {
    x: ((el.left ?? 0) + ctx.offsetX) * ctx.scaleX,
    y: ((el.top ?? 0) + ctx.offsetY) * ctx.scaleY,
    width: w,
    height: h,
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
