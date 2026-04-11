// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { TextFormatToolbar } from './TextFormatToolbar';
import { ShapeStylePanel } from './ShapeStylePanel';
import { LineStylePanel } from './LineStylePanel';
import { ShapeGallery } from './ShapeGallery';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useCanvasStore, type ActiveTool } from '@/stores/canvasStore';
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
  const activeTool = useCanvasStore(s => s.activeTool);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showShapeGallery, setShowShapeGallery] = useState(false);

  const fullImageUrl = useFullImage(image.blobKey);
  const imageSrc = fullImageUrl ?? image.thumbnailDataUrl;

  useEditorKeyboard();
  useUndoRedo();

  const activeSlide = slides.find(s => s.id === slideId);
  const selectedObject = selectedIds.length === 1
    ? activeSlide?.objects.find(o => o.id === selectedIds[0])
    : null;

  const objects = activeSlide?.objects ?? [];
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  const setActiveTool = useCanvasStore(s => s.setActiveTool);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (editingTextId) return; // Metin düzenleniyorsa canvas tıklamasını yoksay
    const tool = useCanvasStore.getState().activeTool;
    if (tool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const obj = createDefaultTextObject({
        id: nanoid(10),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: 280, height: 50,
        fontSize: 22, content: '',
        color: '#FFFFFF',
      });
      useCanvasStore.getState().addObject(obj);
      useCanvasStore.getState().setActiveTool('select');
      setEditingTextId(obj.id);
    } else if (tool === 'select') {
      useCanvasStore.getState().deselectAll();
      setEditingTextId(null);
    }
  }, [editingTextId]);

  const handleShapeSelect = useCallback((shapeType: ShapeType) => {
    const obj = createDefaultShapeObject({
      id: nanoid(10), x: 150, y: 120, width: 140, height: 140, shapeType,
    });
    useCanvasStore.getState().addObject(obj);
    useCanvasStore.getState().setActiveTool('select');
    setShowShapeGallery(false);
  }, []);

  const handleTextSave = useCallback((objectId: string, content: string) => {
    useCanvasStore.getState().updateObject(objectId, { content } as Partial<SlideObject>);
    setEditingTextId(null);
  }, []);

  // ─── Toolbar araçları ─────────────────────────
  const TOOLS: { id: ActiveTool; icon: string; label: string }[] = [
    { id: 'select', icon: 'arrow_selector_tool', label: 'Seçim' },
    { id: 'text', icon: 'title', label: 'Metin' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* ═══ Üst Bar ═══ */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/60 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-sm font-bold">
          <MaterialIcon icon="arrow_back" size={20} />
          Kanvasa Dön
        </button>
        <span className="text-sm font-bold text-white truncate max-w-[200px]">{image.fileName}</span>
        <div className="w-24" /> {/* spacer */}
      </div>

      {/* ═══ Toolbar ═══ */}
      <div className="flex items-center gap-1 px-4 py-1.5 bg-surface/60 backdrop-blur-xl border-b border-white/5 shrink-0">
        {/* Araçlar */}
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); setShowShapeGallery(false); }}
            className={`p-2 rounded-lg transition-all ${activeTool === tool.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
            title={tool.label}
          >
            <MaterialIcon icon={tool.icon} size={20} />
          </button>
        ))}

        {/* Şekil — galeri toggle */}
        <div className="relative">
          <button
            onClick={() => setShowShapeGallery(!showShapeGallery)}
            className={`p-2 rounded-lg transition-all ${activeTool === 'shape' || showShapeGallery ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
            title="Şekil Ekle"
          >
            <MaterialIcon icon="hexagon" size={20} />
          </button>
          {showShapeGallery && (
            <div className="absolute top-full left-0 mt-2 z-[60]">
              <ShapeGallery onSelect={handleShapeSelect} onClose={() => setShowShapeGallery(false)} />
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* Undo/Redo */}
        <button onClick={() => { /* undo handled by hook */ }} className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all" title="Geri Al (⌘Z)">
          <MaterialIcon icon="undo" size={20} />
        </button>
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all" title="Yinele (⌘⇧Z)">
          <MaterialIcon icon="redo" size={20} />
        </button>

        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* Seçili nesneyi sil */}
        {selectedIds.length > 0 && (
          <button
            onClick={() => { selectedIds.forEach(id => useCanvasStore.getState().deleteObject(id)); }}
            className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            title="Sil (Delete)"
          >
            <MaterialIcon icon="delete" size={20} />
          </button>
        )}
      </div>

      {/* ═══ Nesne Stil Toolbar (seçime göre) ═══ */}
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
      {selectedObject?.type === 'line' && (
        <div className="shrink-0">
          <LineStylePanel lineObject={selectedObject as LineObject} onUpdate={(u) => useCanvasStore.getState().updateObject(selectedObject.id, u as Partial<SlideObject>)} />
        </div>
      )}

      {/* ═══ Canvas ═══ */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6" style={{ backgroundColor: '#070D1F' }}>
        <div
          ref={canvasRef}
          className="relative shadow-2xl rounded-xl overflow-hidden"
          style={{ maxWidth: '85vw', maxHeight: '72vh', cursor: activeTool === 'text' ? 'text' : activeTool === 'shape' ? 'crosshair' : 'default' }}
          onClick={handleCanvasClick}
        >
          {/* Görsel */}
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={image.fileName} className="block max-w-full max-h-[72vh] object-contain select-none" draggable={false} />
          ) : (
            <div className="w-[800px] h-[450px] bg-surface flex items-center justify-center">
              <MaterialIcon icon="image" size={64} className="text-on-surface-variant/20" />
            </div>
          )}

          {/* ═══ Nesneler ═══ */}
          <div className="absolute inset-0">
            {sortedObjects.map(obj => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute',
                  left: obj.x, top: obj.y,
                  width: obj.type !== 'line' ? obj.width : undefined,
                  height: obj.type !== 'line' ? obj.height : undefined,
                  transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
                  zIndex: obj.zIndex,
                }}
              >
                {/* ── Metin ── */}
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
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        minHeight: 30, cursor: 'text',
                      }}
                      onBlur={(e) => handleTextSave(obj.id, e.currentTarget.innerText)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                          handleTextSave(obj.id, e.currentTarget.innerText);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {obj.content}
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full cursor-pointer rounded ${selectedIds.includes(obj.id) ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-white/30'}`}
                      style={{
                        fontFamily: obj.fontFamily, fontSize: obj.fontSize, fontWeight: obj.fontWeight,
                        fontStyle: obj.fontStyle, color: obj.color, textAlign: obj.textAlign,
                        lineHeight: obj.lineHeight, padding: 6,
                        textDecoration: obj.textDecoration !== 'none' ? obj.textDecoration : undefined,
                        backgroundColor: obj.content ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}
                      onClick={(e) => { e.stopPropagation(); useCanvasStore.getState().selectObject(obj.id); }}
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingTextId(obj.id); }}
                    >
                      {obj.content || <span className="opacity-40">Çift tıkla yazın...</span>}
                    </div>
                  )
                )}

                {/* ── Şekil ── */}
                {obj.type === 'shape' && (
                  <div
                    className={`w-full h-full cursor-pointer ${selectedIds.includes(obj.id) ? 'ring-2 ring-primary rounded' : ''}`}
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
    </motion.div>
  );
}

// ─── Şekil SVG Render ─────────────────────────────────

function ShapeSVG({ shape }: { shape: ShapeObject }) {
  const w = shape.width;
  const h = shape.height;
  const pad = shape.stroke.width;
  const fill = shape.fill.type === 'solid' ? shape.fill.color : shape.fill.type === 'none' ? 'none' : shape.fill.color;
  const stroke = shape.stroke.width > 0 ? shape.stroke.color : 'none';
  const sw = shape.stroke.width;
  const dash = shape.stroke.style === 'dashed' ? '8 4' : shape.stroke.style === 'dotted' ? '3 3' : undefined;

  const props = { fill, stroke, strokeWidth: sw, strokeDasharray: dash };

  switch (shape.shapeType) {
    case 'rectangle': return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} {...props} />;
    case 'roundedRect': return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} rx={12} {...props} />;
    case 'circle': case 'ellipse': return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - pad} ry={h / 2 - pad} {...props} />;
    case 'triangle': return <polygon points={`${w / 2},${pad} ${w - pad},${h - pad} ${pad},${h - pad}`} {...props} />;
    case 'diamond': return <polygon points={`${w / 2},${pad} ${w - pad},${h / 2} ${w / 2},${h - pad} ${pad},${h / 2}`} {...props} />;
    case 'star5': return <polygon points={`${w / 2},${pad} ${w * 0.62},${h * 0.38} ${w - pad},${h * 0.38} ${w * 0.68},${h * 0.58} ${w * 0.8},${h - pad} ${w / 2},${h * 0.72} ${w * 0.2},${h - pad} ${w * 0.32},${h * 0.58} ${pad},${h * 0.38} ${w * 0.38},${h * 0.38}`} {...props} />;
    case 'pentagon': return <polygon points={`${w / 2},${pad} ${w - pad},${h * 0.4} ${w * 0.8},${h - pad} ${w * 0.2},${h - pad} ${pad},${h * 0.4}`} {...props} />;
    case 'hexagon': return <polygon points={`${w * 0.25},${pad} ${w * 0.75},${pad} ${w - pad},${h / 2} ${w * 0.75},${h - pad} ${w * 0.25},${h - pad} ${pad},${h / 2}`} {...props} />;
    case 'plus': return <polygon points={`${w * 0.35},${pad} ${w * 0.65},${pad} ${w * 0.65},${h * 0.35} ${w - pad},${h * 0.35} ${w - pad},${h * 0.65} ${w * 0.65},${h * 0.65} ${w * 0.65},${h - pad} ${w * 0.35},${h - pad} ${w * 0.35},${h * 0.65} ${pad},${h * 0.65} ${pad},${h * 0.35} ${w * 0.35},${h * 0.35}`} {...props} />;
    case 'arrowRight': return <polygon points={`${pad},${h * 0.3} ${w * 0.6},${h * 0.3} ${w * 0.6},${pad} ${w - pad},${h / 2} ${w * 0.6},${h - pad} ${w * 0.6},${h * 0.7} ${pad},${h * 0.7}`} {...props} />;
    case 'arrowLeft': return <polygon points={`${w - pad},${h * 0.3} ${w * 0.4},${h * 0.3} ${w * 0.4},${pad} ${pad},${h / 2} ${w * 0.4},${h - pad} ${w * 0.4},${h * 0.7} ${w - pad},${h * 0.7}`} {...props} />;
    case 'arrowUp': return <polygon points={`${w * 0.3},${h - pad} ${w * 0.3},${h * 0.4} ${pad},${h * 0.4} ${w / 2},${pad} ${w - pad},${h * 0.4} ${w * 0.7},${h * 0.4} ${w * 0.7},${h - pad}`} {...props} />;
    case 'arrowDown': return <polygon points={`${w * 0.3},${pad} ${w * 0.3},${h * 0.6} ${pad},${h * 0.6} ${w / 2},${h - pad} ${w - pad},${h * 0.6} ${w * 0.7},${h * 0.6} ${w * 0.7},${pad}`} {...props} />;
    case 'heart': return <path d={`M ${w / 2} ${h * 0.85} C ${w * 0.15} ${h * 0.55}, ${pad} ${h * 0.2}, ${w / 2} ${h * 0.35} C ${w - pad} ${h * 0.2}, ${w * 0.85} ${h * 0.55}, ${w / 2} ${h * 0.85} Z`} {...props} />;
    case 'cloud': return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - pad} ry={h / 2 - pad} {...props} />;
    case 'lightning': return <polygon points={`${w * 0.6},${pad} ${w * 0.25},${h * 0.5} ${w * 0.45},${h * 0.5} ${w * 0.35},${h - pad} ${w * 0.75},${h * 0.45} ${w * 0.55},${h * 0.45}`} {...props} />;
    case 'speechBubble': return <><rect x={pad} y={pad} width={w - pad * 2} height={h * 0.7} rx={8} {...props} /><polygon points={`${w * 0.2},${h * 0.7} ${w * 0.35},${h - pad} ${w * 0.4},${h * 0.7}`} {...props} /></>;
    case 'chevron': return <polygon points={`${pad},${pad} ${w * 0.7},${pad} ${w - pad},${h / 2} ${w * 0.7},${h - pad} ${pad},${h - pad} ${w * 0.3},${h / 2}`} {...props} />;
    default: return <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} rx={8} {...props} />;
  }
}
