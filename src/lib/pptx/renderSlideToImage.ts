'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * CanvasSlide → PNG Blob thumbnail renderer.
 * Main thread (OffscreenCanvas + DOM image decode).
 *
 * Not: Bu renderer PPTX import akışında PresentationImage için thumbnail +
 * /present mode için static background image üretmek amacıyla kullanılır.
 * Editör içindeki zengin DOM rendering'den ayrıdır.
 */

import type {
  CanvasSlide,
  SlideObject,
  TextObject,
  ShapeObject,
  ImageObject,
  LineObject,
} from '@/types/slide-object';

interface RenderOptions {
  width: number;
  height: number;
  /** data URL → main thread dışarıdan verilir (Worker base64) */
  imageMap: Map<string, string>;
}

export async function renderCanvasSlideToBlob(
  slide: CanvasSlide,
  opts: RenderOptions,
): Promise<Blob> {
  const canvas = new OffscreenCanvas(opts.width, opts.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2D context alınamadı');

  drawBackground(ctx, slide, opts);

  // Z-index sırasına göre çiz
  const sorted = [...slide.objects].sort((a, b) => a.zIndex - b.zIndex);

  for (const obj of sorted) {
    if (!obj.visible || obj.opacity === 0) continue;
    ctx.save();
    ctx.globalAlpha = obj.opacity;

    if (obj.rotation) {
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    switch (obj.type) {
      case 'text':
        drawTextObject(ctx, obj);
        break;
      case 'shape':
        drawShapeObject(ctx, obj);
        break;
      case 'image':
        await drawImageObject(ctx, obj, opts);
        break;
      case 'line':
        drawLineObject(ctx, obj);
        break;
    }

    ctx.restore();
  }

  return canvas.convertToBlob({ type: 'image/png' });
}

// ═══════════════════════════════════════════════════════════════════════════

type Ctx2D = OffscreenCanvasRenderingContext2D;

function drawBackground(ctx: Ctx2D, slide: CanvasSlide, opts: RenderOptions): void {
  const bg = slide.background;
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, opts.width, opts.height);
  } else if (bg.type === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, opts.width, opts.height);
    g.addColorStop(0, bg.gradientStart ?? bg.color);
    g.addColorStop(1, bg.gradientEnd ?? bg.color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, opts.width, opts.height);
  } else {
    ctx.fillStyle = bg.color || '#FFFFFF';
    ctx.fillRect(0, 0, opts.width, opts.height);
  }
}

function drawShapeObject(ctx: Ctx2D, obj: ShapeObject): void {
  // Fill
  if (obj.fill.type === 'solid') {
    ctx.fillStyle = obj.fill.color;
  } else if (obj.fill.type === 'gradient') {
    const g = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
    g.addColorStop(0, obj.fill.gradientStart ?? obj.fill.color);
    g.addColorStop(1, obj.fill.gradientEnd ?? obj.fill.color);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0)';
  }

  // Shape path
  if (obj.shapeType === 'ellipse' || obj.shapeType === 'circle') {
    ctx.beginPath();
    ctx.ellipse(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (obj.stroke.width > 0) {
      ctx.strokeStyle = obj.stroke.color;
      ctx.lineWidth = obj.stroke.width;
      ctx.stroke();
    }
  } else if (obj.shapeType === 'roundedRect') {
    const r = Math.min(obj.width, obj.height) * 0.1;
    roundRectPath(ctx, obj.x, obj.y, obj.width, obj.height, r);
    ctx.fill();
    if (obj.stroke.width > 0) {
      ctx.strokeStyle = obj.stroke.color;
      ctx.lineWidth = obj.stroke.width;
      ctx.stroke();
    }
  } else {
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    if (obj.stroke.width > 0) {
      ctx.strokeStyle = obj.stroke.color;
      ctx.lineWidth = obj.stroke.width;
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    }
  }

  // Shape içindeki metin
  if (obj.textContent) {
    drawText(ctx, obj.textContent, obj.x, obj.y, obj.width, obj.height, {
      color: obj.textColor ?? '#000000',
      fontSize: obj.textFontSize ?? 14,
      fontFamily: 'Inter',
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: obj.textAlign ?? 'center',
      verticalAlign: 'middle',
    });
  }
}

function drawTextObject(ctx: Ctx2D, obj: TextObject): void {
  if (obj.highlightColor && obj.highlightColor !== 'transparent') {
    ctx.fillStyle = obj.highlightColor;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }
  drawText(ctx, obj.content, obj.x, obj.y, obj.width, obj.height, {
    color: obj.color,
    fontSize: obj.fontSize,
    fontFamily: obj.fontFamily,
    fontWeight: obj.fontWeight,
    fontStyle: obj.fontStyle,
    textAlign: obj.textAlign,
    verticalAlign: obj.verticalAlign,
  });
}

interface TextDrawOpts {
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: string;
  textAlign: string;
  verticalAlign: string;
}

function drawText(
  ctx: Ctx2D,
  content: string,
  x: number, y: number, w: number, h: number,
  opts: TextDrawOpts,
): void {
  if (!content) return;
  const lines = content.split('\n');
  const lineHeight = opts.fontSize * 1.3;

  ctx.font = `${opts.fontStyle} ${opts.fontWeight} ${opts.fontSize}px "${opts.fontFamily}", Inter, sans-serif`;
  ctx.fillStyle = opts.color;
  ctx.textBaseline = 'top';
  ctx.textAlign = (opts.textAlign === 'center' ? 'center'
    : opts.textAlign === 'right' ? 'right'
    : 'left') as CanvasTextAlign;

  const totalHeight = lines.length * lineHeight;
  let startY = y + 4;
  if (opts.verticalAlign === 'middle') startY = y + Math.max(0, (h - totalHeight) / 2);
  else if (opts.verticalAlign === 'bottom') startY = y + h - totalHeight - 4;

  let textX = x + 6;
  if (opts.textAlign === 'center') textX = x + w / 2;
  else if (opts.textAlign === 'right') textX = x + w - 6;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], textX, startY + i * lineHeight, w - 12);
  }
  ctx.restore();
}

async function drawImageObject(ctx: Ctx2D, obj: ImageObject, opts: RenderOptions): Promise<void> {
  const src = opts.imageMap.get(obj.blobKey) ?? obj.thumbnailUrl;
  if (!src) {
    // eslint-disable-next-line no-console
    console.warn('[PPTX render] image src boş:', obj.blobKey);
    return;
  }
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    ctx.drawImage(bitmap, obj.x, obj.y, obj.width, obj.height);
    bitmap.close();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[PPTX render] image decode hatası:', obj.blobKey, err);
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }
}

function drawLineObject(ctx: Ctx2D, obj: LineObject): void {
  ctx.strokeStyle = obj.stroke.color;
  ctx.lineWidth = obj.stroke.width;
  ctx.beginPath();
  ctx.moveTo(obj.x + obj.startX, obj.y + obj.startY);
  ctx.lineTo(obj.x + obj.endX, obj.y + obj.endY);
  ctx.stroke();
}

function roundRectPath(ctx: Ctx2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
