// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { TextFormatToolbar } from './TextFormatToolbar';
import { ShapeStylePanel } from './ShapeStylePanel';
import { LineStylePanel } from './LineStylePanel';
import { SHAPE_DEFINITIONS } from '@/lib/canvas/shapes';
import { useCanvasStore } from '@/stores/canvasStore';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useEditorKeyboard } from '@/hooks/useEditorKeyboard';
import { useFullImage } from '@/hooks/useFullImage';
import { nanoid } from 'nanoid';
import { createDefaultTextObject, createDefaultShapeObject } from '@/types/slide-object';
import type { TextObject, ShapeObject, LineObject, SlideObject, ShapeType } from '@/types/slide-object';
import type { PresentationImage } from '@/types/presentation';

interface SlideEditorProps {
  image: PresentationImage;
  slideId: string;
  onClose: () => void;
}

export function SlideEditor({ image, slideId, onClose }: SlideEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedIds = useCanvasStore(s => s.selectedIds);
  const slides = useCanvasStore(s => s.slides);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showShapes, setShowShapes] = useState(false);
  const [zoom, setZoom] = useState(1);

  const fullImageUrl = useFullImage(image.blobKey);
  const imageSrc = fullImageUrl ?? image.thumbnailDataUrl;

  // slideId'yi aktif slayt olarak ayarla
  useEffect(() => {
    useCanvasStore.getState().setActiveSlide(slideId);
  }, [slideId]);

  useEditorKeyboard();
  useUndoRedo();

  const activeSlide = slides.find(s => s.id === slideId);
  const selectedObject = selectedIds.length === 1
    ? activeSlide?.objects.find(o => o.id === selectedIds[0])
    : null;
  const objects = activeSlide?.objects ?? [];
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  // ─── Aksiyonlar ─────────────────────────────

  const addText = useCallback(() => {
    const obj = createDefaultTextObject({
      id: nanoid(10), x: 80, y: 60, width: 280, height: 50,
      fontSize: 22, content: '', color: '#FFFFFF',
    });
    useCanvasStore.getState().addObject(obj);
    setEditingTextId(obj.id);
    setShowShapes(false);
  }, []);

  const addShape = useCallback((shapeType: ShapeType) => {
    const obj = createDefaultShapeObject({
      id: nanoid(10), x: 120, y: 100, width: 140, height: 140, shapeType,
    });
    useCanvasStore.getState().addObject(obj);
    setShowShapes(false);
  }, []);

  const handleTextSave = useCallback((objectId: string, content: string) => {
    useCanvasStore.getState().updateObject(objectId, { content } as Partial<SlideObject>);
    setEditingTextId(null);
  }, []);

  const deleteSelected = useCallback(() => {
    selectedIds.forEach(id => useCanvasStore.getState().deleteObject(id));
  }, [selectedIds]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* ═══ ÜST BAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/60 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-sm font-bold">
          <MaterialIcon icon="arrow_back" size={20} />
          Kanvasa Dön
        </button>

        {/* Araçlar — ORTADA */}
        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-xl border border-white/5">
          {/* Metin Ekle */}
          <button
            onClick={addText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
            title="Metin Ekle"
          >
            <MaterialIcon icon="title" size={18} />
            Metin
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Şekil Ekle */}
          <button
            onClick={() => setShowShapes(!showShapes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${showShapes ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white hover:bg-white/10'}`}
            title="Şekil Ekle"
          >
            <MaterialIcon icon="hexagon" size={18} />
            Şekil
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Sil */}
          {selectedIds.length > 0 && (
            <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-bold" title="Sil (Delete)">
              <MaterialIcon icon="delete" size={18} />
            </button>
          )}
        </div>

        {/* Zoom kontrolleri */}
        <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-xl border border-white/5">
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="p-1 text-on-surface-variant hover:text-white rounded transition-colors">
            <MaterialIcon icon="remove" size={16} />
          </button>
          <span className="text-[11px] font-black text-white w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 text-on-surface-variant hover:text-white rounded transition-colors">
            <MaterialIcon icon="add" size={16} />
          </button>
          <button onClick={() => setZoom(1)} className="p-1 text-on-surface-variant hover:text-white rounded transition-colors text-[10px] font-bold">
            Sığdır
          </button>
        </div>
      </div>

      {/* ═══ STİL TOOLBAR (seçime göre) ═══ */}
      {selectedObject?.type === 'text' && !editingTextId && (
        <div className="shrink-0">
          <TextFormatToolbar textObject={selectedObject as TextObject} onUpdate={(u) => useCanvasStore.getState().updateObject(selectedObject.id, u)} />
        </div>
      )}
      {selectedObject?.type === 'shape' && (
        <div className="shrink-0">
          <ShapeStylePanel shapeObject={selectedObject as ShapeObject} onUpdate={(u) => useCanvasStore.getState().updateObject(selectedObject.id, u)} />
        </div>
      )}

      {/* ═══ ANA ALAN ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Şekil Galerisi — SOL PANEL (görselin üstüne binmez) */}
        {showShapes && (
          <div className="w-56 bg-surface/40 border-r border-white/5 overflow-y-auto shrink-0 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Şekiller</h3>
              <button onClick={() => setShowShapes(false)} className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5">
                <MaterialIcon icon="close" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SHAPE_DEFINITIONS.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => addShape(shape.id)}
                  className="aspect-square flex items-center justify-center p-2 rounded-xl border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all group"
                  title={shape.name}
                >
                  <svg viewBox="0 0 100 100" className="w-7 h-7 fill-on-surface-variant group-hover:fill-white transition-colors" stroke="none"
                    dangerouslySetInnerHTML={{ __html: shape.svgContent }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6" style={{ backgroundColor: '#070D1F' }}>
          <div
            ref={canvasRef}
            className="relative shadow-2xl rounded-xl overflow-visible transition-transform duration-200"
            style={{ maxWidth: '85vw', maxHeight: '75vh', transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            onClick={() => {
              if (!editingTextId) {
                useCanvasStore.getState().deselectAll();
                setEditingTextId(null);
              }
            }}
          >
            {/* Görsel */}
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt={image.fileName} className="block max-w-full max-h-[75vh] object-contain select-none rounded-xl" draggable={false} />
            ) : (
              <div className="w-[800px] h-[450px] bg-surface rounded-xl flex items-center justify-center">
                <MaterialIcon icon="image" size={64} className="text-on-surface-variant/20" />
              </div>
            )}

            {/* ═══ NESNELER ═══ */}
            <div className="absolute inset-0 rounded-xl">
              {sortedObjects.map(obj => (
                <div
                  key={obj.id}
                  style={{
                    position: 'absolute', left: obj.x, top: obj.y,
                    width: obj.type !== 'line' ? obj.width : undefined,
                    height: obj.type !== 'line' ? obj.height : undefined,
                    transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
                    zIndex: obj.zIndex,
                  }}
                >
                  {/* Metin */}
                  {obj.type === 'text' && (
                    editingTextId === obj.id ? (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        autoFocus
                        className="w-full h-full outline-none ring-2 ring-primary rounded"
                        style={{
                          fontFamily: obj.fontFamily, fontSize: obj.fontSize, fontWeight: obj.fontWeight,
                          fontStyle: obj.fontStyle, color: obj.color, textAlign: obj.textAlign,
                          lineHeight: obj.lineHeight, padding: 6,
                          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: 30, cursor: 'text',
                        }}
                        onBlur={(e) => handleTextSave(obj.id, e.currentTarget.innerText)}
                        onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Escape') handleTextSave(obj.id, e.currentTarget.innerText); }}
                        onClick={(e) => e.stopPropagation()}
                      >{obj.content}</div>
                    ) : (
                      <div
                        className={`w-full h-full cursor-pointer rounded transition-all ${selectedIds.includes(obj.id) ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-white/40'}`}
                        style={{
                          fontFamily: obj.fontFamily, fontSize: obj.fontSize, fontWeight: obj.fontWeight,
                          fontStyle: obj.fontStyle, color: obj.color, textAlign: obj.textAlign,
                          lineHeight: obj.lineHeight, padding: 6,
                          textDecoration: obj.textDecoration !== 'none' ? obj.textDecoration : undefined,
                          backgroundColor: obj.content ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}
                        onClick={(e) => { e.stopPropagation(); useCanvasStore.getState().selectObject(obj.id); }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingTextId(obj.id); }}
                      >
                        {obj.content || <span className="opacity-40 italic">Çift tıkla yazın...</span>}
                      </div>
                    )
                  )}

                  {/* Şekil */}
                  {obj.type === 'shape' && (
                    <div
                      className={`w-full h-full cursor-pointer transition-all ${selectedIds.includes(obj.id) ? 'ring-2 ring-primary rounded' : ''}`}
                      onClick={(e) => { e.stopPropagation(); useCanvasStore.getState().selectObject(obj.id); }}
                    >
                      <svg width="100%" height="100%" viewBox={`0 0 ${obj.width} ${obj.height}`}>
                        <ShapeSVG shape={obj} />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Şekil SVG ──────────────────────────────────

function ShapeSVG({ shape }: { shape: ShapeObject }) {
  const w = shape.width, h = shape.height, pad = Math.max(shape.stroke.width, 2);
  const fill = shape.fill.type === 'solid' ? shape.fill.color : 'none';
  const stroke = shape.stroke.width > 0 ? shape.stroke.color : '#FFFFFF';
  const sw = Math.max(shape.stroke.width, 1);
  const dash = shape.stroke.style === 'dashed' ? '8 4' : shape.stroke.style === 'dotted' ? '3 3' : undefined;
  const p = { fill, stroke, strokeWidth: sw, strokeDasharray: dash };

  switch (shape.shapeType) {
    case 'rectangle': return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} {...p} />;
    case 'roundedRect': return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} rx={12} {...p} />;
    case 'circle': case 'ellipse': return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - pad} ry={h / 2 - pad} {...p} />;
    case 'triangle': return <polygon points={`${w / 2},${pad} ${w - pad},${h - pad} ${pad},${h - pad}`} {...p} />;
    case 'diamond': return <polygon points={`${w / 2},${pad} ${w - pad},${h / 2} ${w / 2},${h - pad} ${pad},${h / 2}`} {...p} />;
    case 'star5': return <polygon points={`${w / 2},${pad} ${w * 0.62},${h * 0.38} ${w - pad},${h * 0.38} ${w * 0.68},${h * 0.58} ${w * 0.8},${h - pad} ${w / 2},${h * 0.72} ${w * 0.2},${h - pad} ${w * 0.32},${h * 0.58} ${pad},${h * 0.38} ${w * 0.38},${h * 0.38}`} {...p} />;
    case 'pentagon': return <polygon points={`${w / 2},${pad} ${w - pad},${h * 0.4} ${w * 0.8},${h - pad} ${w * 0.2},${h - pad} ${pad},${h * 0.4}`} {...p} />;
    case 'hexagon': return <polygon points={`${w * 0.25},${pad} ${w * 0.75},${pad} ${w - pad},${h / 2} ${w * 0.75},${h - pad} ${w * 0.25},${h - pad} ${pad},${h / 2}`} {...p} />;
    case 'plus': return <polygon points={`${w * 0.35},${pad} ${w * 0.65},${pad} ${w * 0.65},${h * 0.35} ${w - pad},${h * 0.35} ${w - pad},${h * 0.65} ${w * 0.65},${h * 0.65} ${w * 0.65},${h - pad} ${w * 0.35},${h - pad} ${w * 0.35},${h * 0.65} ${pad},${h * 0.65} ${pad},${h * 0.35} ${w * 0.35},${h * 0.35}`} {...p} />;
    case 'arrowRight': return <polygon points={`${pad},${h * 0.3} ${w * 0.6},${h * 0.3} ${w * 0.6},${pad} ${w - pad},${h / 2} ${w * 0.6},${h - pad} ${w * 0.6},${h * 0.7} ${pad},${h * 0.7}`} {...p} />;
    case 'arrowLeft': return <polygon points={`${w - pad},${h * 0.3} ${w * 0.4},${h * 0.3} ${w * 0.4},${pad} ${pad},${h / 2} ${w * 0.4},${h - pad} ${w * 0.4},${h * 0.7} ${w - pad},${h * 0.7}`} {...p} />;
    case 'heart': return <path d={`M ${w / 2} ${h * 0.85} C ${w * 0.15} ${h * 0.55}, ${pad} ${h * 0.2}, ${w / 2} ${h * 0.35} C ${w - pad} ${h * 0.2}, ${w * 0.85} ${h * 0.55}, ${w / 2} ${h * 0.85} Z`} {...p} />;
    case 'lightning': return <polygon points={`${w * 0.6},${pad} ${w * 0.25},${h * 0.5} ${w * 0.45},${h * 0.5} ${w * 0.35},${h - pad} ${w * 0.75},${h * 0.45} ${w * 0.55},${h * 0.45}`} {...p} />;
    case 'speechBubble': return <><rect x={pad} y={pad} width={w - pad * 2} height={h * 0.7} rx={8} {...p} /><polygon points={`${w * 0.2},${h * 0.7} ${w * 0.35},${h - pad} ${w * 0.4},${h * 0.7}`} {...p} /></>;
    case 'chevron': return <polygon points={`${pad},${pad} ${w * 0.7},${pad} ${w - pad},${h / 2} ${w * 0.7},${h - pad} ${pad},${h - pad} ${w * 0.3},${h / 2}`} {...p} />;
    default: return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} rx={8} {...p} />;
  }
}
