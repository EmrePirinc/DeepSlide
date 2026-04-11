// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import React, { useCallback, useRef } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import type {
  SlideObject,
  TextObject,
  ShapeObject,
  LineObject,
  ImageObject,
  SlideBackground,
} from '@/types/slide-object';

interface SlideCanvasProps {
  slideId: string;
  width?: number;
  height?: number;
  className?: string;
  /** Nesne tıklandığında */
  onObjectClick?: (objectId: string) => void;
  /** Boş alana tıklandığında */
  onCanvasClick?: () => void;
  /** Nesne çift tıklandığında (metin düzenleme) */
  onObjectDoubleClick?: (objectId: string) => void;
}

/**
 * SlideCanvas — Tek bir slaytın tüm nesnelerini render eder.
 * Canvas altyapısı: HTML div katmanı + SVG overlay (şekil/çizgi).
 */
export const SlideCanvas = React.memo(function SlideCanvas({
  slideId,
  width = 960,
  height = 540,
  className = '',
  onObjectClick,
  onCanvasClick,
  onObjectDoubleClick,
}: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const slides = useCanvasStore(s => s.slides);
  const selectedIds = useCanvasStore(s => s.selectedIds);
  const zoom = useCanvasStore(s => s.zoom);

  const slide = slides.find(s => s.id === slideId);
  if (!slide) return null;

  const objects = [...slide.objects].sort((a, b) => a.zIndex - b.zIndex);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onCanvasClick?.();
    }
  }, [onCanvasClick]);

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width * zoom,
        height: height * zoom,
        ...getBackgroundStyle(slide.background),
      }}
      onClick={handleCanvasClick}
    >
      {/* Nesneler */}
      {objects.map(obj => (
        <CanvasObject
          key={obj.id}
          object={obj}
          isSelected={selectedIds.includes(obj.id)}
          zoom={zoom}
          onClick={() => onObjectClick?.(obj.id)}
          onDoubleClick={() => onObjectDoubleClick?.(obj.id)}
        />
      ))}

      {/* Seçim tutamakları (seçili nesneler için) */}
      {selectedIds.map(id => {
        const obj = objects.find(o => o.id === id);
        if (!obj) return null;
        return <SelectionHandles key={`handles-${id}`} object={obj} zoom={zoom} />;
      })}
    </div>
  );
});

// ─── Arka Plan Stil Hesaplama ─────────────────────────

function getBackgroundStyle(bg: SlideBackground): React.CSSProperties {
  switch (bg.type) {
    case 'solid':
      return { backgroundColor: bg.color };
    case 'gradient':
      return {
        background: bg.gradientType === 'radial'
          ? `radial-gradient(circle, ${bg.gradientStart}, ${bg.gradientEnd})`
          : `linear-gradient(${bg.gradientAngle ?? 180}deg, ${bg.gradientStart}, ${bg.gradientEnd})`,
      };
    case 'image':
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: bg.imageFit ?? 'cover',
        backgroundPosition: 'center',
        filter: bg.imageBlur ? `blur(${bg.imageBlur}px)` : undefined,
      };
    default:
      return { backgroundColor: '#070D1F' };
  }
}

// ─── Nesne Renderer ───────────────────────────────────

interface CanvasObjectProps {
  object: SlideObject;
  isSelected: boolean;
  zoom: number;
  onClick: () => void;
  onDoubleClick: () => void;
}

const CanvasObject = React.memo(function CanvasObject({
  object,
  isSelected,
  zoom,
  onClick,
  onDoubleClick,
}: CanvasObjectProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: object.x * zoom,
    top: object.y * zoom,
    width: object.type === 'line' ? undefined : object.width * zoom,
    height: object.type === 'line' ? undefined : object.height * zoom,
    transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
    opacity: object.opacity,
    zIndex: object.zIndex,
    cursor: object.locked ? 'not-allowed' : 'move',
    pointerEvents: object.locked ? 'none' : 'auto',
  };

  return (
    <div
      style={style}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      className={`canvas-object ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      {object.type === 'text' && <TextRenderer object={object} zoom={zoom} />}
      {object.type === 'shape' && <ShapeRenderer object={object} zoom={zoom} />}
      {object.type === 'line' && <LineRenderer object={object} zoom={zoom} />}
      {object.type === 'image' && <ImageRenderer object={object} zoom={zoom} />}
    </div>
  );
});

// ─── Metin Renderer ───────────────────────────────────

function TextRenderer({ object, zoom }: { object: TextObject; zoom: number }) {
  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        fontFamily: object.fontFamily,
        fontSize: object.fontSize * zoom,
        fontWeight: object.fontWeight,
        fontStyle: object.fontStyle,
        textDecoration: object.textDecoration,
        color: object.color,
        backgroundColor: object.highlightColor !== 'transparent' ? object.highlightColor : undefined,
        textAlign: object.textAlign,
        lineHeight: object.lineHeight,
        display: 'flex',
        alignItems: object.verticalAlign === 'middle' ? 'center' : object.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
        padding: 4 * zoom,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      <div className="w-full">{object.content || 'Metin eklemek için tıklayın'}</div>
    </div>
  );
}

// ─── Şekil Renderer ───────────────────────────────────

function ShapeRenderer({ object, zoom }: { object: ShapeObject; zoom: number }) {
  const w = object.width * zoom;
  const h = object.height * zoom;

  const fillColor = object.fill.type === 'solid' ? object.fill.color : 'none';
  const fillGradient = object.fill.type === 'gradient';
  const gradientId = `grad-${object.id}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-full"
      style={{
        filter: object.shadow.enabled
          ? `drop-shadow(${object.shadow.offsetX}px ${object.shadow.offsetY}px ${object.shadow.blur}px ${object.shadow.color})`
          : undefined,
      }}
    >
      {fillGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={object.fill.gradientStart} />
            <stop offset="100%" stopColor={object.fill.gradientEnd} />
          </linearGradient>
        </defs>
      )}
      <ShapePath
        shapeType={object.shapeType}
        width={w}
        height={h}
        fill={fillGradient ? `url(#${gradientId})` : fillColor}
        stroke={object.stroke.color}
        strokeWidth={object.stroke.width}
        strokeDasharray={object.stroke.style === 'dashed' ? '8 4' : object.stroke.style === 'dotted' ? '2 2' : undefined}
      />
      {object.textContent && (
        <text
          x={w / 2}
          y={h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={object.textColor ?? '#FFFFFF'}
          fontSize={object.textFontSize ?? 14}
        >
          {object.textContent}
        </text>
      )}
    </svg>
  );
}

function ShapePath({ shapeType, width: w, height: h, ...props }: {
  shapeType: string;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
}) {
  const pad = props.strokeWidth / 2;

  switch (shapeType) {
    case 'rectangle':
      return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} {...props} />;
    case 'roundedRect':
      return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} rx={8} ry={8} {...props} />;
    case 'circle':
    case 'ellipse':
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - pad} ry={h / 2 - pad} {...props} />;
    case 'triangle':
      return <polygon points={`${w / 2},${pad} ${w - pad},${h - pad} ${pad},${h - pad}`} {...props} />;
    case 'rightTriangle':
      return <polygon points={`${pad},${pad} ${w - pad},${h - pad} ${pad},${h - pad}`} {...props} />;
    case 'diamond':
      return <polygon points={`${w / 2},${pad} ${w - pad},${h / 2} ${w / 2},${h - pad} ${pad},${h / 2}`} {...props} />;
    case 'pentagon':
      return <polygon points={pentagonPoints(w, h, pad)} {...props} />;
    case 'hexagon':
      return <polygon points={hexagonPoints(w, h, pad)} {...props} />;
    case 'star5':
      return <polygon points={starPoints(w, h, 5, pad)} {...props} />;
    case 'star6':
      return <polygon points={starPoints(w, h, 6, pad)} {...props} />;
    case 'plus':
      return <polygon points={`${w * 0.33},${pad} ${w * 0.67},${pad} ${w * 0.67},${h * 0.33} ${w - pad},${h * 0.33} ${w - pad},${h * 0.67} ${w * 0.67},${h * 0.67} ${w * 0.67},${h - pad} ${w * 0.33},${h - pad} ${w * 0.33},${h * 0.67} ${pad},${h * 0.67} ${pad},${h * 0.33} ${w * 0.33},${h * 0.33}`} {...props} />;
    case 'heart':
      return <path d={heartPath(w, h)} {...props} />;
    case 'arrowRight':
      return <polygon points={`${pad},${h * 0.25} ${w * 0.6},${h * 0.25} ${w * 0.6},${pad} ${w - pad},${h / 2} ${w * 0.6},${h - pad} ${w * 0.6},${h * 0.75} ${pad},${h * 0.75}`} {...props} />;
    case 'arrowLeft':
      return <polygon points={`${w - pad},${h * 0.25} ${w * 0.4},${h * 0.25} ${w * 0.4},${pad} ${pad},${h / 2} ${w * 0.4},${h - pad} ${w * 0.4},${h * 0.75} ${w - pad},${h * 0.75}`} {...props} />;
    case 'arrowUp':
      return <polygon points={`${w * 0.25},${h - pad} ${w * 0.25},${h * 0.4} ${pad},${h * 0.4} ${w / 2},${pad} ${w - pad},${h * 0.4} ${w * 0.75},${h * 0.4} ${w * 0.75},${h - pad}`} {...props} />;
    case 'arrowDown':
      return <polygon points={`${w * 0.25},${pad} ${w * 0.25},${h * 0.6} ${pad},${h * 0.6} ${w / 2},${h - pad} ${w - pad},${h * 0.6} ${w * 0.75},${h * 0.6} ${w * 0.75},${pad}`} {...props} />;
    default:
      return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} {...props} />;
  }
}

// ─── Şekil Yardımcı Fonksiyonlar ──────────────────────

function pentagonPoints(w: number, h: number, pad: number): string {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - pad;
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

function hexagonPoints(w: number, h: number, pad: number): string {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - pad;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

function starPoints(w: number, h: number, points: number, pad: number): string {
  const cx = w / 2, cy = h / 2;
  const outerR = Math.min(w, h) / 2 - pad;
  const innerR = outerR * 0.4;
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

function heartPath(w: number, h: number): string {
  return `M ${w / 2} ${h * 0.85} C ${w * 0.1} ${h * 0.5}, ${w * 0.0} ${h * 0.15}, ${w / 2} ${h * 0.3} C ${w} ${h * 0.15}, ${w * 0.9} ${h * 0.5}, ${w / 2} ${h * 0.85} Z`;
}

// ─── Çizgi Renderer ──────────────────────────────────

function LineRenderer({ object, zoom }: { object: LineObject; zoom: number }) {
  const x1 = (object.startX - object.x) * zoom;
  const y1 = (object.startY - object.y) * zoom;
  const x2 = (object.endX - object.x) * zoom;
  const y2 = (object.endY - object.y) * zoom;
  const svgW = Math.abs(x2 - x1) + 20;
  const svgH = Math.abs(y2 - y1) + 20;

  const markerId = `arrow-${object.id}`;

  return (
    <svg
      width={svgW}
      height={svgH}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}
    >
      <defs>
        {(object.endArrow !== 'none' || object.startArrow !== 'none') && (
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={object.stroke.color} />
          </marker>
        )}
      </defs>
      <line
        x1={x1 + 10}
        y1={y1 + 10}
        x2={x2 + 10}
        y2={y2 + 10}
        stroke={object.stroke.color}
        strokeWidth={object.stroke.width * zoom}
        strokeDasharray={
          object.stroke.style === 'dashed' ? '8 4' :
          object.stroke.style === 'dotted' ? '2 2' : undefined
        }
        markerEnd={object.endArrow !== 'none' ? `url(#${markerId})` : undefined}
        markerStart={object.startArrow !== 'none' ? `url(#${markerId})` : undefined}
      />
    </svg>
  );
}

// ─── Görsel Renderer ─────────────────────────────────

function ImageRenderer({ object, zoom }: { object: ImageObject; zoom: number }) {
  return (
    <div className="w-full h-full overflow-hidden" style={{ borderRadius: object.borderRadius * zoom }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={object.thumbnailUrl}
        alt=""
        className="w-full h-full object-cover"
        style={{
          filter: [
            object.brightness !== 100 ? `brightness(${object.brightness}%)` : '',
            object.contrast !== 100 ? `contrast(${object.contrast}%)` : '',
            object.blur > 0 ? `blur(${object.blur}px)` : '',
          ].filter(Boolean).join(' ') || undefined,
        }}
        draggable={false}
      />
    </div>
  );
}

// ─── Seçim Tutamakları ───────────────────────────────

function SelectionHandles({ object, zoom }: { object: SlideObject; zoom: number }) {
  if (object.type === 'line') return null;

  const x = object.x * zoom;
  const y = object.y * zoom;
  const w = object.width * zoom;
  const h = object.height * zoom;
  const handleSize = 8;
  const hs = handleSize / 2;

  const handles = [
    { cx: x - hs, cy: y - hs, cursor: 'nw-resize' },           // sol üst
    { cx: x + w / 2 - hs, cy: y - hs, cursor: 'n-resize' },    // üst orta
    { cx: x + w - hs, cy: y - hs, cursor: 'ne-resize' },        // sağ üst
    { cx: x + w - hs, cy: y + h / 2 - hs, cursor: 'e-resize' }, // sağ orta
    { cx: x + w - hs, cy: y + h - hs, cursor: 'se-resize' },    // sağ alt
    { cx: x + w / 2 - hs, cy: y + h - hs, cursor: 's-resize' }, // alt orta
    { cx: x - hs, cy: y + h - hs, cursor: 'sw-resize' },        // sol alt
    { cx: x - hs, cy: y + h / 2 - hs, cursor: 'w-resize' },     // sol orta
  ];

  return (
    <>
      {/* Seçim çerçevesi */}
      <div
        className="absolute border-2 border-primary pointer-events-none"
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          transform: object.rotation ? `rotate(${object.rotation}deg)` : undefined,
          transformOrigin: 'center center',
          zIndex: 9999,
        }}
      />
      {/* 8 tutamak */}
      {handles.map((handle, i) => (
        <div
          key={i}
          className="absolute bg-white border-2 border-primary"
          style={{
            left: handle.cx,
            top: handle.cy,
            width: handleSize,
            height: handleSize,
            cursor: handle.cursor,
            zIndex: 10000,
          }}
        />
      ))}
      {/* Döndürme tutamağı */}
      <div
        className="absolute w-3 h-3 rounded-full bg-white border-2 border-primary cursor-grab"
        style={{
          left: x + w / 2 - 6,
          top: y - 24,
          zIndex: 10000,
        }}
      />
      {/* Döndürme çizgisi */}
      <div
        className="absolute w-px bg-primary"
        style={{
          left: x + w / 2,
          top: y - 20,
          height: 20,
          zIndex: 9999,
        }}
      />
    </>
  );
}
