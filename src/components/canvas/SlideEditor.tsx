// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { EditorToolbar } from './EditorToolbar';
import { TextFormatToolbar } from './TextFormatToolbar';
import { ShapeStylePanel } from './ShapeStylePanel';
import { LineStylePanel } from './LineStylePanel';
import { BackgroundModal } from './BackgroundModal';
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
  const [showBgModal, setShowBgModal] = useState(false);

  // Görseli IndexedDB'den yükle
  const fullImageUrl = useFullImage(image.blobKey);
  const imageSrc = fullImageUrl ?? image.thumbnailDataUrl;

  useEditorKeyboard();
  useUndoRedo();

  const activeSlide = slides.find(s => s.id === slideId);
  const selectedObject = selectedIds.length === 1
    ? activeSlide?.objects.find(o => o.id === selectedIds[0])
    : null;

  const handleShapeSelect = useCallback((shapeType: ShapeType) => {
    const obj = createDefaultShapeObject({
      id: nanoid(10), x: 200, y: 150, width: 150, height: 150, shapeType,
    });
    useCanvasStore.getState().addObject(obj);
    useCanvasStore.getState().setActiveTool('select');
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const tool = useCanvasStore.getState().activeTool;
    if (tool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const obj = createDefaultTextObject({
        id: nanoid(10), x, y, width: 300, height: 60,
        fontSize: 24, content: '',
      });
      useCanvasStore.getState().addObject(obj);
      useCanvasStore.getState().setActiveTool('select');
    } else {
      useCanvasStore.getState().deselectAll();
    }
  }, []);

  // Nesneleri render
  const objects = activeSlide?.objects ?? [];
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Üst Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/60 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-sm font-bold">
          <MaterialIcon icon="arrow_back" size={20} />
          Kanvasa Dön
        </button>
        <span className="text-sm font-bold text-white truncate max-w-xs">{image.fileName}</span>
        <button onClick={() => setShowBgModal(!showBgModal)} className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all" title="Arka Plan">
          <MaterialIcon icon="palette" size={20} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="shrink-0">
        <EditorToolbar onShapeSelect={handleShapeSelect} onImageUpload={() => {}} />
      </div>

      {/* Nesne bazlı stil toolbar */}
      <div className="shrink-0">
        {selectedObject?.type === 'text' && (
          <TextFormatToolbar textObject={selectedObject as TextObject} onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates)} />
        )}
        {selectedObject?.type === 'shape' && (
          <ShapeStylePanel shapeObject={selectedObject as ShapeObject} onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates)} />
        )}
        {selectedObject?.type === 'line' && (
          <LineStylePanel lineObject={selectedObject as LineObject} onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates as Partial<SlideObject>)} />
        )}
      </div>

      {/* Canvas Alanı — Görsel + Nesneler */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-8"
        style={{
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundColor: '#070D1F',
        }}
      >
        <div
          ref={canvasRef}
          className="relative shadow-2xl rounded-xl overflow-hidden cursor-crosshair"
          onClick={handleCanvasClick}
          style={{ maxWidth: '90vw', maxHeight: '75vh' }}
        >
          {/* Arka plan görsel */}
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={image.fileName}
              className="block w-auto h-auto max-w-full max-h-[75vh] object-contain"
              draggable={false}
            />
          ) : (
            <div className="w-[960px] h-[540px] bg-surface flex items-center justify-center">
              <div className="text-center text-on-surface-variant">
                <MaterialIcon icon="image" size={64} className="opacity-20 mb-2" />
                <p className="text-sm">Görsel yükleniyor...</p>
              </div>
            </div>
          )}

          {/* Canvas nesneleri overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {sortedObjects.map(obj => (
              <div
                key={obj.id}
                className="pointer-events-auto"
                style={{
                  position: 'absolute',
                  left: obj.x,
                  top: obj.y,
                  width: obj.type !== 'line' ? obj.width : undefined,
                  height: obj.type !== 'line' ? obj.height : undefined,
                  transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
                  zIndex: obj.zIndex,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  useCanvasStore.getState().selectObject(obj.id);
                }}
              >
                {/* Seçim çerçevesi */}
                {selectedIds.includes(obj.id) && obj.type !== 'line' && (
                  <div className="absolute inset-0 border-2 border-primary rounded pointer-events-none z-50" />
                )}

                {/* Nesne içeriği */}
                {obj.type === 'text' && (
                  <div
                    className="w-full h-full p-2 cursor-text"
                    style={{
                      fontFamily: obj.fontFamily,
                      fontSize: obj.fontSize,
                      fontWeight: obj.fontWeight,
                      fontStyle: obj.fontStyle,
                      color: obj.color,
                      textAlign: obj.textAlign,
                      lineHeight: obj.lineHeight,
                      backgroundColor: obj.highlightColor !== 'transparent' ? obj.highlightColor : 'rgba(255,255,255,0.05)',
                      borderRadius: 4,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {obj.content || 'Metin yazın...'}
                  </div>
                )}

                {obj.type === 'shape' && (
                  <svg width="100%" height="100%" viewBox={`0 0 ${obj.width} ${obj.height}`}>
                    {obj.shapeType === 'rectangle' && <rect x="2" y="2" width={obj.width - 4} height={obj.height - 4} fill={obj.fill.type === 'solid' ? obj.fill.color : 'none'} stroke={obj.stroke.color} strokeWidth={obj.stroke.width} />}
                    {obj.shapeType === 'circle' && <ellipse cx={obj.width / 2} cy={obj.height / 2} rx={obj.width / 2 - 2} ry={obj.height / 2 - 2} fill={obj.fill.type === 'solid' ? obj.fill.color : 'none'} stroke={obj.stroke.color} strokeWidth={obj.stroke.width} />}
                    {obj.shapeType === 'triangle' && <polygon points={`${obj.width / 2},2 ${obj.width - 2},${obj.height - 2} 2,${obj.height - 2}`} fill={obj.fill.type === 'solid' ? obj.fill.color : 'none'} stroke={obj.stroke.color} strokeWidth={obj.stroke.width} />}
                    {obj.shapeType === 'star5' && <polygon points={`${obj.width / 2},2 ${obj.width * 0.62},${obj.height * 0.38} ${obj.width - 2},${obj.height * 0.38} ${obj.width * 0.68},${obj.height * 0.6} ${obj.width * 0.8},${obj.height - 2} ${obj.width / 2},${obj.height * 0.72} ${obj.width * 0.2},${obj.height - 2} ${obj.width * 0.32},${obj.height * 0.6} 2,${obj.height * 0.38} ${obj.width * 0.38},${obj.height * 0.38}`} fill={obj.fill.type === 'solid' ? obj.fill.color : 'none'} stroke={obj.stroke.color} strokeWidth={obj.stroke.width} />}
                    {/* Diğer şekiller için varsayılan dikdörtgen */}
                    {!['rectangle', 'circle', 'triangle', 'star5'].includes(obj.shapeType) && <rect x="2" y="2" width={obj.width - 4} height={obj.height - 4} rx="8" fill={obj.fill.type === 'solid' ? obj.fill.color : 'none'} stroke={obj.stroke.color} strokeWidth={obj.stroke.width} />}
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arka plan modal */}
      {showBgModal && activeSlide && (
        <div className="absolute right-4 top-32 z-50">
          <BackgroundModal background={activeSlide.background} onChange={(bg) => useCanvasStore.getState().updateSlideBackground(activeSlide.id, bg)} onClose={() => setShowBgModal(false)} />
        </div>
      )}
    </motion.div>
  );
}
