// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { SlideCanvas } from './SlideCanvas';
import { EditorToolbar } from './EditorToolbar';
import { TextFormatToolbar } from './TextFormatToolbar';
import { ShapeStylePanel } from './ShapeStylePanel';
import { LineStylePanel } from './LineStylePanel';
import { ShapeGallery } from './ShapeGallery';
import { BackgroundModal } from './BackgroundModal';
import { useCanvasStore } from '@/stores/canvasStore';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useEditorKeyboard } from '@/hooks/useEditorKeyboard';
import { nanoid } from 'nanoid';
import { createDefaultTextObject, createDefaultShapeObject, createDefaultLineObject } from '@/types/slide-object';
import type { TextObject, ShapeObject, LineObject, SlideObject, ShapeType } from '@/types/slide-object';
import type { PresentationImage } from '@/types/presentation';

interface SlideEditorProps {
  image: PresentationImage;
  slideId: string;
  onClose: () => void;
}

/**
 * SlideEditor — Tam ekran slayt düzenleme modu.
 * Görsele tıklandığında açılır. Metin/şekil/çizgi ekleme, arka plan düzenleme.
 */
export function SlideEditor({ image, slideId, onClose }: SlideEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedIds = useCanvasStore(s => s.selectedIds);
  const slides = useCanvasStore(s => s.slides);
  const activeTool = useCanvasStore(s => s.activeTool);
  const [showBgModal, setShowBgModal] = useState(false);

  // Kısayolları aktif et
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

  const handleCanvasClick = useCallback(() => {
    const tool = useCanvasStore.getState().activeTool;
    if (tool === 'text') {
      const obj = createDefaultTextObject({
        id: nanoid(10), x: 200, y: 200, width: 300, height: 60,
        fontSize: 24, content: '',
      });
      useCanvasStore.getState().addObject(obj);
      useCanvasStore.getState().setActiveTool('select');
    }
  }, []);

  const handleObjectClick = useCallback((objectId: string) => {
    useCanvasStore.getState().selectObject(objectId);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Üst Bar — Kapat + Araçlar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/60 backdrop-blur-xl border-b border-white/5">
        {/* Sol — Kapat */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
        >
          <MaterialIcon icon="arrow_back" size={20} />
          Kanvasa Dön
        </button>

        {/* Orta — Dosya adı */}
        <span className="text-sm font-bold text-white truncate max-w-xs">{image.fileName}</span>

        {/* Sağ — Arka plan + kaydet */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBgModal(!showBgModal)}
            className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
            title="Arka Plan"
          >
            <MaterialIcon icon="palette" size={20} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        onShapeSelect={handleShapeSelect}
        onImageUpload={() => {}}
      />

      {/* Nesne bazlı stil toolbar */}
      {selectedObject?.type === 'text' && (
        <TextFormatToolbar
          textObject={selectedObject as TextObject}
          onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates)}
        />
      )}
      {selectedObject?.type === 'shape' && (
        <ShapeStylePanel
          shapeObject={selectedObject as ShapeObject}
          onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates)}
        />
      )}
      {selectedObject?.type === 'line' && (
        <LineStylePanel
          lineObject={selectedObject as LineObject}
          onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates as Partial<SlideObject>)}
        />
      )}

      {/* Canvas Alanı */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto flex items-center justify-center bg-background p-8"
        style={{
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div className="relative shadow-2xl rounded-xl overflow-hidden">
          {/* Arka plan görsel */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumbnailDataUrl}
            alt={image.fileName}
            className="max-w-full max-h-[70vh] object-contain"
            draggable={false}
          />

          {/* Canvas overlay — nesneler burada render */}
          <div
            className="absolute inset-0"
            onClick={handleCanvasClick}
          >
            {activeSlide && (
              <SlideCanvas
                slideId={slideId}
                className="w-full h-full"
                onObjectClick={handleObjectClick}
                onCanvasClick={() => useCanvasStore.getState().deselectAll()}
              />
            )}
          </div>
        </div>
      </div>

      {/* Arka plan modal */}
      {showBgModal && activeSlide && (
        <div className="absolute right-4 top-32 z-50">
          <BackgroundModal
            background={activeSlide.background}
            onChange={(bg) => useCanvasStore.getState().updateSlideBackground(activeSlide.id, bg)}
            onClose={() => setShowBgModal(false)}
          />
        </div>
      )}
    </motion.div>
  );
}
