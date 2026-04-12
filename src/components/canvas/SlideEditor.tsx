// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { TextFormatToolbar } from './TextFormatToolbar';
import { ShapeStylePanel } from './ShapeStylePanel';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { SHAPE_DEFINITIONS } from '@/lib/canvas/shapes';
import { useCanvasStore } from '@/stores/canvasStore';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useEditorKeyboard } from '@/hooks/useEditorKeyboard';
import { useFullImage } from '@/hooks/useFullImage';
import { getUndoManager, createAddObjectCommand, createDeleteObjectCommand } from '@/lib/canvas/undo-manager';
import { nanoid } from 'nanoid';
import { createDefaultTextObject, createDefaultShapeObject } from '@/types/slide-object';
import type { TextObject, ShapeObject, LineObject, SlideObject, ShapeType, ImageObject } from '@/types/slide-object';
import type { PresentationImage } from '@/types/presentation';

interface SlideEditorProps {
  image: PresentationImage;
  slideId: string;
  onClose: () => void;
}

type DragMode = 'move' | 'resize-se' | 'resize-e' | 'resize-s' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-w' | 'resize-n' | 'rotate';

export function SlideEditor({ image, slideId, onClose }: SlideEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedIds = useCanvasStore(s => s.selectedIds);
  const slides = useCanvasStore(s => s.slides);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showShapes, setShowShapes] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rightPanel, setRightPanel] = useState<'none' | 'style'>('style'); // Her zaman açık
  const dragRef = useRef<{ mode: DragMode; id: string; startX: number; startY: number; objX: number; objY: number; objW: number; objH: number; objR: number } | null>(null);

  const fullImageUrl = useFullImage(image.blobKey);
  const imageSrc = fullImageUrl ?? image.thumbnailDataUrl;

  useEffect(() => { useCanvasStore.getState().setActiveSlide(slideId); }, [slideId]);
  useEditorKeyboard();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const undoManager = getUndoManager();

  const activeSlide = slides.find(s => s.id === slideId);
  const selectedObject = selectedIds.length === 1 ? activeSlide?.objects.find(o => o.id === selectedIds[0]) : null;
  const objects = activeSlide?.objects ?? [];
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  // Panel her zaman açık — seçim değiştiğinde içerik güncellenir

  // ─── Aksiyonlar ─────────────────────────────
  const addText = useCallback(() => {
    const obj = createDefaultTextObject({ id: nanoid(10), x: 80, y: 60, width: 280, height: 50, fontSize: 22, content: '', color: '#FFFFFF' });
    undoManager.execute(createAddObjectCommand(obj));
    setEditingTextId(obj.id);
    setShowShapes(false);
  }, [undoManager]);

  const addShape = useCallback((shapeType: ShapeType) => {
    const obj = createDefaultShapeObject({ id: nanoid(10), x: 120, y: 100, width: 140, height: 140, shapeType });
    undoManager.execute(createAddObjectCommand(obj));
    setShowShapes(false);
  }, [undoManager]);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const maxW = 300; const scale = maxW / img.width;
        const obj: ImageObject = {
          id: nanoid(10), type: 'image', x: 100, y: 80, width: maxW, height: img.height * scale,
          rotation: 0, zIndex: 0, locked: false, visible: true, opacity: 1,
          blobKey: '', thumbnailUrl: url, originalWidth: img.width, originalHeight: img.height,
          brightness: 100, contrast: 100, blur: 0, borderRadius: 0,
          stroke: { color: '#FFFFFF', width: 0, style: 'solid' },
        };
        undoManager.execute(createAddObjectCommand(obj));
      };
      img.src = url;
    };
    input.click();
  }, [undoManager]);

  const deleteSelected = useCallback(() => {
    const slide = useCanvasStore.getState().slides.find(s => s.id === slideId);
    if (!slide) return;
    selectedIds.forEach(id => {
      const obj = slide.objects.find(o => o.id === id);
      if (obj) undoManager.execute(createDeleteObjectCommand(obj));
    });
  }, [selectedIds, slideId, undoManager]);

  const handleTextSave = useCallback((objectId: string, content: string) => {
    useCanvasStore.getState().updateObject(objectId, { content } as Partial<SlideObject>);
    setEditingTextId(null);
  }, []);

  // ─── Nesne tıklama = seç ─────────────────
  const handleObjectClick = useCallback((e: React.MouseEvent, objId: string) => {
    e.stopPropagation();
    useCanvasStore.getState().selectObject(objId);
  }, []);

  // ─── Drag: move + resize + rotate (mouseDown ile) ──────────
  const startDrag = useCallback((e: React.MouseEvent, objId: string, mode: DragMode) => {
    if (editingTextId === objId && mode === 'move') return;
    e.stopPropagation(); e.preventDefault();
    // Seçimi hemen yap
    useCanvasStore.getState().selectObject(objId);
    const obj = activeSlide?.objects.find(o => o.id === objId);
    if (!obj) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;
    const THRESHOLD = 3; // 3px hareket eşiği

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      // Eşiği aşana kadar drag başlatma
      if (!isDragging && Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;

      if (!isDragging) {
        isDragging = true;
        dragRef.current = { mode, id: objId, startX, startY, objX: obj.x, objY: obj.y, objW: obj.width, objH: obj.height, objR: obj.rotation };
      }

      const d = dragRef.current; if (!d) return;
      const ddx = (ev.clientX - d.startX) / zoom;
      const ddy = (ev.clientY - d.startY) / zoom;
      const store = useCanvasStore.getState();

      if (d.mode === 'move') {
        store.moveObject(d.id, d.objX + ddx, d.objY + ddy);
      } else if (d.mode === 'rotate') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = d.objX + d.objW / 2; const cy = d.objY + d.objH / 2;
        const mx = (ev.clientX - rect.left) / zoom; const my = (ev.clientY - rect.top) / zoom;
        let angle = Math.atan2(my - cy, mx - cx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        if (ev.shiftKey) angle = Math.round(angle / 15) * 15;
        store.rotateObject(d.id, angle);
      } else {
        let newW = d.objW, newH = d.objH, newX = d.objX, newY = d.objY;
        if (d.mode.includes('e')) newW = Math.max(30, d.objW + ddx);
        if (d.mode.includes('s')) newH = Math.max(30, d.objH + ddy);
        if (d.mode.includes('w')) { newW = Math.max(30, d.objW - ddx); newX = d.objX + ddx; }
        if (d.mode.includes('n')) { newH = Math.max(30, d.objH - ddy); newY = d.objY + ddy; }
        if (ev.shiftKey && d.objW > 0) { const ratio = d.objW / d.objH; newH = newW / ratio; }
        store.moveObject(d.id, newX, newY);
        store.resizeObject(d.id, newW, newH);
      }
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [editingTextId, zoom, activeSlide]);

  // ─── Nesne stili güncelle (kısayol) ─────────
  const updateObj = useCallback((updates: Partial<SlideObject>) => {
    if (selectedObject) useCanvasStore.getState().updateObject(selectedObject.id, updates);
  }, [selectedObject]);

  return (
    <motion.div className="fixed inset-0 z-50 bg-background flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* ═══ ÜST BAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/60 backdrop-blur-xl border-b border-white/5 shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-white/5 transition-all text-sm font-bold">
          <MaterialIcon icon="arrow_back" size={20} /> Kanvasa Dön
        </button>
        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-xl border border-white/5">
          <ToolBtn icon="title" label="Metin" onClick={addText} />
          <div className="h-4 w-px bg-white/10" />
          <ToolBtn icon="hexagon" label="Şekil" onClick={() => setShowShapes(!showShapes)} active={showShapes} />
          <div className="h-4 w-px bg-white/10" />
          <ToolBtn icon="image" label="Resim" onClick={addImage} />
          <div className="h-4 w-px bg-white/10" />
          <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded-lg text-on-surface-variant hover:text-white disabled:opacity-30 transition-all" title="Geri Al"><MaterialIcon icon="undo" size={18} /></button>
          <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded-lg text-on-surface-variant hover:text-white disabled:opacity-30 transition-all" title="İleri Al"><MaterialIcon icon="redo" size={18} /></button>
          {selectedIds.length > 0 && (<><div className="h-4 w-px bg-white/10" /><button onClick={deleteSelected} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all" title="Sil"><MaterialIcon icon="delete" size={18} /></button></>)}
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-xl border border-white/5">
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.15))} className="p-1 text-on-surface-variant hover:text-white"><MaterialIcon icon="remove" size={16} /></button>
          <span className="text-[11px] font-black text-white w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.15))} className="p-1 text-on-surface-variant hover:text-white"><MaterialIcon icon="add" size={16} /></button>
          <button onClick={() => setZoom(1)} className="px-2 py-0.5 text-[10px] font-bold text-on-surface-variant hover:text-white rounded">Sığdır</button>
        </div>
      </div>


      {/* ═══ ANA ALAN ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Şekil Paneli — SOL */}
        {showShapes && (
          <div className="w-52 bg-surface/40 border-r border-white/5 overflow-y-auto shrink-0 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Şekiller</h3>
              <button onClick={() => setShowShapes(false)} className="p-1 text-on-surface-variant hover:text-white"><MaterialIcon icon="close" size={14} /></button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SHAPE_DEFINITIONS.map(s => (
                <button key={s.id} onClick={() => addShape(s.id)} className="aspect-square flex items-center justify-center p-1.5 rounded-lg border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all group" title={s.name}>
                  <svg viewBox="0 0 100 100" className="w-6 h-6 fill-on-surface-variant group-hover:fill-white" dangerouslySetInnerHTML={{ __html: s.svgContent }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative" style={{ backgroundColor: '#070D1F' }}
          onWheel={(e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.max(0.25, Math.min(3, z - e.deltaY * 0.001))); } }}>

          {/* ═══ FLOATING CONTEXTUAL TOOLBAR (Canva tarzı) ═══ */}
          {selectedObject && !editingTextId && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-2 py-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {selectedObject.type === 'text' && (
                <TextFloatingTools textObject={selectedObject as TextObject} onUpdate={updateObj} />
              )}
              {selectedObject.type === 'shape' && (
                <ShapeFloatingTools shape={selectedObject as ShapeObject} onUpdate={updateObj} />
              )}
              {selectedObject.type === 'image' && (
                <ImageFloatingTools image={selectedObject as ImageObject} onUpdate={updateObj} />
              )}
              {/* Ortak aksiyonlar */}
              <div className="h-5 w-px bg-white/10 mx-1" />
              <button onClick={() => useCanvasStore.getState().bringForward(selectedObject.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 transition-all" title="Öne getir">
                <MaterialIcon icon="flip_to_front" size={16} />
              </button>
              <button onClick={() => useCanvasStore.getState().sendBackward(selectedObject.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 transition-all" title="Arkaya gönder">
                <MaterialIcon icon="flip_to_back" size={16} />
              </button>
              <button onClick={() => useCanvasStore.getState().duplicateSelected()} className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 transition-all" title="Çoğalt">
                <MaterialIcon icon="content_copy" size={16} />
              </button>
              <button onClick={deleteSelected} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all" title="Sil">
                <MaterialIcon icon="delete" size={16} />
              </button>
            </div>
          )}

          <div ref={canvasRef} className="relative shadow-2xl rounded-xl transition-transform duration-100"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            onMouseDown={(e) => {
              // Sadece doğrudan canvas'a (arka plana) tıklanınca seçimi kaldır
              if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'IMG') {
                if (!editingTextId) {
                  useCanvasStore.getState().deselectAll();
                  setEditingTextId(null);
                }
              }
            }}>
            {/* Arka plan görsel */}
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt={image.fileName} className="block max-w-[80vw] max-h-[72vh] object-contain select-none rounded-xl" draggable={false} />
            ) : (
              <div className="w-[800px] h-[450px] bg-surface rounded-xl flex items-center justify-center"><MaterialIcon icon="image" size={64} className="text-on-surface-variant/20" /></div>
            )}

            {/* ═══ NESNELER ═══ */}
            <div className="absolute inset-0 rounded-xl">
              {sortedObjects.map(obj => (
                <div key={obj.id} style={{ position: 'absolute', left: obj.x, top: obj.y, width: obj.type !== 'line' ? obj.width : undefined, height: obj.type !== 'line' ? obj.height : undefined, transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined, zIndex: obj.zIndex, opacity: obj.opacity }}
                  onMouseDown={(e) => startDrag(e, obj.id, 'move')}
                  onClick={(e) => e.stopPropagation()}>

                  {/* Metin */}
                  {obj.type === 'text' && (editingTextId === obj.id ? (
                    <div contentEditable suppressContentEditableWarning autoFocus className="w-full h-full outline-none ring-2 ring-primary rounded"
                      style={{ fontFamily: obj.fontFamily, fontSize: obj.fontSize, fontWeight: obj.fontWeight, fontStyle: obj.fontStyle, color: obj.color, textAlign: obj.textAlign, lineHeight: obj.lineHeight, padding: 6, backgroundColor: 'rgba(0,0,0,0.4)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', cursor: 'text' }}
                      onBlur={(e) => handleTextSave(obj.id, e.currentTarget.innerText)}
                      onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Escape') handleTextSave(obj.id, e.currentTarget.innerText); }}
                      onClick={(e) => e.stopPropagation()}>{obj.content}</div>
                  ) : (
                    <div className={`w-full h-full rounded cursor-move ${selectedIds.includes(obj.id) ? '' : 'hover:ring-1 hover:ring-white/30'}`}
                      style={{ fontFamily: obj.fontFamily, fontSize: obj.fontSize, fontWeight: obj.fontWeight, fontStyle: obj.fontStyle, color: obj.color, textAlign: obj.textAlign, lineHeight: obj.lineHeight, padding: 6, textDecoration: obj.textDecoration !== 'none' ? obj.textDecoration : undefined, backgroundColor: obj.content ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.06)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingTextId(obj.id); }}>
                      {obj.content || <span className="opacity-30 italic">Çift tıkla yazın...</span>}
                    </div>
                  ))}

                  {/* Şekil */}
                  {obj.type === 'shape' && (
                    <svg width="100%" height="100%" viewBox={`0 0 ${obj.width} ${obj.height}`} className="cursor-move">
                      <ShapeSVG shape={obj} />
                    </svg>
                  )}

                  {/* Resim */}
                  {obj.type === 'image' && (
                    <div className="w-full h-full overflow-hidden cursor-move" style={{ borderRadius: obj.borderRadius }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={obj.thumbnailUrl} alt="" className="w-full h-full object-cover" draggable={false}
                        style={{ filter: [obj.brightness !== 100 ? `brightness(${obj.brightness}%)` : '', obj.contrast !== 100 ? `contrast(${obj.contrast}%)` : '', obj.blur > 0 ? `blur(${obj.blur}px)` : ''].filter(Boolean).join(' ') || undefined }} />
                    </div>
                  )}

                  {/* ═══ SEÇİM TUTAMAKLARI ═══ */}
                  {selectedIds.includes(obj.id) && obj.type !== 'line' && !editingTextId && (
                    <>
                      {/* Çerçeve */}
                      <div className="absolute inset-0 border-2 border-primary rounded pointer-events-none" />
                      {/* 8 Resize Handle */}
                      <Handle pos="nw" x={-4} y={-4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-nw')} />
                      <Handle pos="n" x={obj.width / 2 - 4} y={-4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-n')} />
                      <Handle pos="ne" x={obj.width - 4} y={-4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-ne')} />
                      <Handle pos="e" x={obj.width - 4} y={obj.height / 2 - 4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-e')} />
                      <Handle pos="se" x={obj.width - 4} y={obj.height - 4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-se')} />
                      <Handle pos="s" x={obj.width / 2 - 4} y={obj.height - 4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-s')} />
                      <Handle pos="sw" x={-4} y={obj.height - 4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-sw')} />
                      <Handle pos="w" x={-4} y={obj.height / 2 - 4} onMouseDown={(e) => startDrag(e, obj.id, 'resize-w')} />
                      {/* Döndürme */}
                      <div className="absolute w-3 h-3 rounded-full bg-white border-2 border-primary cursor-grab"
                        style={{ left: obj.width / 2 - 6, top: -22 }} onMouseDown={(e) => startDrag(e, obj.id, 'rotate')} />
                      <div className="absolute w-px h-4 bg-primary pointer-events-none" style={{ left: obj.width / 2, top: -18 }} />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SAĞ PANEL — Stil Özelleştirme ═══ */}
        {rightPanel === 'style' && (
          <div className="w-64 bg-surface/40 border-l border-white/5 overflow-y-auto shrink-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">
                {selectedObject ? 'Özellikler' : 'Slayt'}
              </h3>
              <button onClick={() => setRightPanel(rightPanel === 'style' ? 'none' : 'style')} className="p-1 text-on-surface-variant hover:text-white">
                <MaterialIcon icon="close" size={14} />
              </button>
            </div>

            {selectedObject ? (
              <>
                {/* Konum + Boyut */}
                <section className="space-y-2">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Konum & Boyut</p>
                  <div className="grid grid-cols-2 gap-2">
                    <NumInput label="X" value={Math.round(selectedObject.x)} onChange={v => updateObj({ x: v } as Partial<SlideObject>)} />
                    <NumInput label="Y" value={Math.round(selectedObject.y)} onChange={v => updateObj({ y: v } as Partial<SlideObject>)} />
                    <NumInput label="W" value={Math.round(selectedObject.width)} onChange={v => updateObj({ width: v } as Partial<SlideObject>)} />
                    <NumInput label="H" value={Math.round(selectedObject.height)} onChange={v => updateObj({ height: v } as Partial<SlideObject>)} />
                  </div>
                  <NumInput label="Döndürme" value={Math.round(selectedObject.rotation)} onChange={v => updateObj({ rotation: v } as Partial<SlideObject>)} suffix="°" />
                </section>

                {/* Opacity */}
                <section>
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider mb-1">Opaklık: {Math.round(selectedObject.opacity * 100)}%</p>
                  <input type="range" min={0} max={100} value={Math.round(selectedObject.opacity * 100)}
                    onChange={e => updateObj({ opacity: Number(e.target.value) / 100 } as Partial<SlideObject>)} className="w-full accent-primary" />
                </section>

                {/* Şekil Stili */}
                {selectedObject.type === 'shape' && (
                  <ShapeProperties shape={selectedObject as ShapeObject} onUpdate={updateObj} />
                )}

                {/* Resim Filtreleri */}
                {selectedObject.type === 'image' && (
                  <ImageProperties image={selectedObject as ImageObject} onUpdate={updateObj} />
                )}

                {/* Metin Stili */}
                {selectedObject.type === 'text' && (
                  <section className="space-y-2">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Metin Rengi</p>
                    <ColorPicker value={(selectedObject as TextObject).color} onChange={c => updateObj({ color: c } as Partial<SlideObject>)} />
                  </section>
                )}

              </>
            ) : (
              /* Nesne seçilmemişken genel bilgi */
              <div className="space-y-4">
                <section className="text-center py-6">
                  <MaterialIcon icon="touch_app" size={32} className="text-on-surface-variant/30 mb-2" />
                  <p className="text-xs text-on-surface-variant">Düzenlemek için bir nesneye tıklayın</p>
                  <p className="text-[10px] text-on-surface-variant/50 mt-1">veya üst bardan yeni nesne ekleyin</p>
                </section>

                <section>
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider mb-2">Slayt Bilgisi</p>
                  <div className="space-y-1 text-xs text-on-surface-variant">
                    <p>{objects.length} nesne</p>
                    <p>{objects.filter(o => o.type === 'text').length} metin</p>
                    <p>{objects.filter(o => o.type === 'shape').length} şekil</p>
                    <p>{objects.filter(o => o.type === 'image').length} resim</p>
                  </div>
                </section>

                <section>
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider mb-2">Kısayollar</p>
                  <div className="space-y-1 text-[10px] text-on-surface-variant/70">
                    <p>⌘Z — Geri al</p>
                    <p>⌘⇧Z — İleri al</p>
                    <p>Delete — Sil</p>
                    <p>⌘D — Çoğalt</p>
                    <p>⌘A — Tümünü seç</p>
                    <p>Shift+Sürükle — Oran koru</p>
                    <p>Ctrl+Scroll — Zoom</p>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Floating Contextual Toolbars (Canva Modeli) ──────────

const FONTS = [
  // Sans-serif (en popüler)
  'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins',
  'Raleway', 'Nunito', 'Source Sans 3', 'Ubuntu', 'Work Sans',
  'Quicksand', 'Fira Sans', 'Rubik',
  // Serif
  'Playfair Display', 'Merriweather', 'Libre Baskerville', 'Abril Fatface',
  // Display / Bold
  'Oswald', 'Bebas Neue', 'Anton', 'Righteous',
  // Handwriting / Script
  'Dancing Script', 'Pacifico', 'Lobster', 'Caveat', 'Satisfy',
  'Permanent Marker', 'Shadows Into Light', 'Indie Flower',
  // Fun
  'Comfortaa',
];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96, 120];

function TextFloatingTools({ textObject, onUpdate }: { textObject: TextObject; onUpdate: (u: Partial<SlideObject>) => void }) {
  return (
    <>
      <select value={textObject.fontFamily} onChange={e => onUpdate({ fontFamily: e.target.value } as Partial<SlideObject>)}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer max-w-[110px]">
        {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
      </select>
      <select value={textObject.fontSize} onChange={e => onUpdate({ fontSize: Number(e.target.value) } as Partial<SlideObject>)}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer w-14">
        {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="h-5 w-px bg-white/10 mx-0.5" />
      <FloatBtn icon="format_bold" active={textObject.fontWeight >= 700} onClick={() => onUpdate({ fontWeight: textObject.fontWeight >= 700 ? 400 : 700 } as Partial<SlideObject>)} title="Kalın" />
      <FloatBtn icon="format_italic" active={textObject.fontStyle === 'italic'} onClick={() => onUpdate({ fontStyle: textObject.fontStyle === 'italic' ? 'normal' : 'italic' } as Partial<SlideObject>)} title="İtalik" />
      <FloatBtn icon="format_underlined" active={textObject.textDecoration === 'underline'} onClick={() => onUpdate({ textDecoration: textObject.textDecoration === 'underline' ? 'none' : 'underline' } as Partial<SlideObject>)} title="Altı çizili" />
      <div className="h-5 w-px bg-white/10 mx-0.5" />
      <ColorPicker value={textObject.color} onChange={c => onUpdate({ color: c } as Partial<SlideObject>)} />
      <div className="h-5 w-px bg-white/10 mx-0.5" />
      <FloatBtn icon="format_align_left" active={textObject.textAlign === 'left'} onClick={() => onUpdate({ textAlign: 'left' } as Partial<SlideObject>)} title="Sola" />
      <FloatBtn icon="format_align_center" active={textObject.textAlign === 'center'} onClick={() => onUpdate({ textAlign: 'center' } as Partial<SlideObject>)} title="Ortala" />
      <FloatBtn icon="format_align_right" active={textObject.textAlign === 'right'} onClick={() => onUpdate({ textAlign: 'right' } as Partial<SlideObject>)} title="Sağa" />
    </>
  );
}

function ShapeFloatingTools({ shape, onUpdate }: { shape: ShapeObject; onUpdate: (u: Partial<SlideObject>) => void }) {
  return (
    <>
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold text-on-surface-variant px-1">Dolgu</span>
        <ColorPicker value={shape.fill.type === 'solid' ? shape.fill.color : '#6366F1'}
          onChange={c => onUpdate({ fill: { ...shape.fill, type: 'solid', color: c } } as Partial<SlideObject>)} />
        <button onClick={() => onUpdate({ fill: { ...shape.fill, type: 'none' } } as Partial<SlideObject>)}
          className={`p-1 rounded ${shape.fill.type === 'none' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-white'}`} title="Dolgu yok">
          <MaterialIcon icon="format_color_reset" size={14} />
        </button>
      </div>
      <div className="h-5 w-px bg-white/10 mx-0.5" />
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold text-on-surface-variant px-1">Kenar</span>
        <ColorPicker value={shape.stroke.color} onChange={c => onUpdate({ stroke: { ...shape.stroke, color: c } } as Partial<SlideObject>)} />
        <input type="number" min={0} max={20} value={shape.stroke.width}
          onChange={e => onUpdate({ stroke: { ...shape.stroke, width: Number(e.target.value) } } as Partial<SlideObject>)}
          className="w-10 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white outline-none" />
      </div>
    </>
  );
}

function ImageFloatingTools({ image, onUpdate }: { image: ImageObject; onUpdate: (u: Partial<SlideObject>) => void }) {
  return (
    <>
      <span className="text-[10px] font-bold text-on-surface-variant px-1">Parlaklık</span>
      <input type="range" min={0} max={200} value={image.brightness}
        onChange={e => onUpdate({ brightness: Number(e.target.value) } as Partial<SlideObject>)}
        className="w-16 accent-primary" />
      <div className="h-5 w-px bg-white/10 mx-0.5" />
      <span className="text-[10px] font-bold text-on-surface-variant px-1">Köşe</span>
      <input type="range" min={0} max={50} value={image.borderRadius}
        onChange={e => onUpdate({ borderRadius: Number(e.target.value) } as Partial<SlideObject>)}
        className="w-16 accent-primary" />
    </>
  );
}

function FloatBtn({ icon, active, onClick, title }: { icon: string; active?: boolean; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 rounded-lg transition-all ${active ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-white hover:bg-white/10'}`}>
      <MaterialIcon icon={icon} size={16} />
    </button>
  );
}

// ─── Yardımcı Bileşenler ──────────────────────

function ToolBtn({ icon, label, onClick, active }: { icon: string; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${active ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white hover:bg-white/10'}`}>
      <MaterialIcon icon={icon} size={18} /> {label}
    </button>
  );
}

function Handle({ pos, x, y, onMouseDown }: { pos: string; x: number; y: number; onMouseDown: (e: React.MouseEvent) => void }) {
  const cursors: Record<string, string> = { nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize' };
  return (
    <div className="absolute w-2 h-2 bg-white border-2 border-primary z-50" style={{ left: x, top: y, cursor: cursors[pos] ?? 'pointer' }}
      onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }} />
  );
}

function NumInput({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] font-bold text-on-surface-variant w-3">{label}</span>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none focus:ring-1 ring-primary w-full" />
      {suffix && <span className="text-[9px] text-on-surface-variant">{suffix}</span>}
    </div>
  );
}

function ShapeProperties({ shape, onUpdate }: { shape: ShapeObject; onUpdate: (u: Partial<SlideObject>) => void }) {
  return (
    <>
      <section className="space-y-2">
        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Dolgu</p>
        <div className="flex items-center gap-2">
          <select value={shape.fill.type} onChange={e => onUpdate({ fill: { ...shape.fill, type: e.target.value as 'solid' | 'gradient' | 'none' } } as Partial<SlideObject>)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none flex-1">
            <option value="none">Yok</option><option value="solid">Düz Renk</option><option value="gradient">Gradient</option>
          </select>
          {shape.fill.type === 'solid' && <ColorPicker value={shape.fill.color} onChange={c => onUpdate({ fill: { ...shape.fill, color: c } } as Partial<SlideObject>)} />}
        </div>
      </section>
      <section className="space-y-2">
        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Kenarlık</p>
        <div className="flex items-center gap-2">
          <ColorPicker value={shape.stroke.color} onChange={c => onUpdate({ stroke: { ...shape.stroke, color: c } } as Partial<SlideObject>)} />
          <input type="number" min={0} max={20} value={shape.stroke.width}
            onChange={e => onUpdate({ stroke: { ...shape.stroke, width: Number(e.target.value) } } as Partial<SlideObject>)}
            className="w-14 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none" />
          <span className="text-[9px] text-on-surface-variant">px</span>
        </div>
      </section>
      <section>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={shape.shadow.enabled}
            onChange={e => onUpdate({ shadow: { ...shape.shadow, enabled: e.target.checked } } as Partial<SlideObject>)}
            className="accent-primary" />
          <span className="text-[10px] font-bold text-white">Gölge</span>
        </label>
      </section>
    </>
  );
}

function ImageProperties({ image, onUpdate }: { image: ImageObject; onUpdate: (u: Partial<SlideObject>) => void }) {
  return (
    <>
      <section className="space-y-2">
        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Parlaklık: {image.brightness}%</p>
        <input type="range" min={0} max={200} value={image.brightness} onChange={e => onUpdate({ brightness: Number(e.target.value) } as Partial<SlideObject>)} className="w-full accent-primary" />
      </section>
      <section className="space-y-2">
        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Kontrast: {image.contrast}%</p>
        <input type="range" min={0} max={200} value={image.contrast} onChange={e => onUpdate({ contrast: Number(e.target.value) } as Partial<SlideObject>)} className="w-full accent-primary" />
      </section>
      <section className="space-y-2">
        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Bulanıklık: {image.blur}px</p>
        <input type="range" min={0} max={20} value={image.blur} onChange={e => onUpdate({ blur: Number(e.target.value) } as Partial<SlideObject>)} className="w-full accent-primary" />
      </section>
      <section className="space-y-2">
        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Köşe Yuvarlaklığı: {image.borderRadius}px</p>
        <input type="range" min={0} max={50} value={image.borderRadius} onChange={e => onUpdate({ borderRadius: Number(e.target.value) } as Partial<SlideObject>)} className="w-full accent-primary" />
      </section>
    </>
  );
}

// ─── Şekil SVG ──────────────────────────────

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
