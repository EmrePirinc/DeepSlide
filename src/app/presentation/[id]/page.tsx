'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { use, useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// ─── Mevcut bileşenler (korunan) ─────────────
import { PresentationCanvas } from '@/components/canvas/PresentationCanvas';
import { KeywordEditor } from '@/components/keywords/KeywordEditor';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { RehearsalView } from '@/components/rehearsal/RehearsalView';
import { FullResImage } from '@/components/canvas/FullResImage';
import { ExportGate } from '@/components/billing/ExportGate';
import { Skeleton } from '@/components/ui/skeleton';
import { TextOverlayEditor } from '@/components/canvas/TextOverlayEditor';
// ─── Yeni canvas bileşenleri ──────────────────
import { SlideCanvas } from '@/components/canvas/SlideCanvas';
import { EditorToolbar } from '@/components/canvas/EditorToolbar';
import { EditorSidebar } from '@/components/canvas/EditorSidebar';
import { AnalyzeButton } from '@/components/canvas/AnalyzeButton';
import { TextFormatToolbar } from '@/components/canvas/TextFormatToolbar';
import { ShapeStylePanel } from '@/components/canvas/ShapeStylePanel';
import { LineStylePanel } from '@/components/canvas/LineStylePanel';
import { BackgroundModal } from '@/components/canvas/BackgroundModal';
import { ThemeGallery } from '@/components/canvas/ThemeGallery';
import { LayoutGallery } from '@/components/canvas/LayoutGallery';
import { TransitionPanel } from '@/components/canvas/TransitionPanel';
// ─── Hooks ────────────────────────────────────
import { usePresentationStore } from '@/stores/presentationStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useUIStore } from '@/stores/uiStore';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAI } from '@/hooks/useLocalAI';
import { useRouter } from 'next/navigation';
import { useVerticalExport } from '@/hooks/useVerticalExport';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useEditorKeyboard } from '@/hooks/useEditorKeyboard';
// ─── Lib ──────────────────────────────────────
import { clusterImagesByKeywords } from '@/lib/utils/clustering';
import { exportToPDF, downloadBlob } from '@/lib/export/pdfExport';
import { exportToPPT } from '@/lib/export/pptExport';
import { initializeCanvasSlides, saveCanvasSlides } from '@/lib/db/canvas-objects';
import { getLayout } from '@/lib/canvas/layouts';
import { nanoid } from 'nanoid';
// ─── Types ────────────────────────────────────
import type { PresentationImage, AIProviderType } from '@/types/presentation';
import type { ThemeId } from '@/lib/themes/types';
import type { TransitionType, TransitionSpeed } from '@/lib/animation/transitions/types';
import type { TextObject, ShapeObject, LineObject, SlideObject } from '@/types/slide-object';
import { createDefaultTextObject, createDefaultShapeObject } from '@/types/slide-object';

type EditorTab = 'canvas' | 'settings';
type RightPanel = 'none' | 'background' | 'theme' | 'transition' | 'layout';

export default function PresentationEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // ─── Mevcut store'lar ──────────────────────
  const {
    currentPresentation, loadPresentation, isLoading,
    updateSettings, reorderImages, updateKeyword, deleteKeyword,
    addKeyword, addSynonym, updateImage,
  } = usePresentationStore();
  const { selectedImageProvider, setSelectedImageProvider } = useUIStore();
  const { isAnalyzing, total, completed, startAnalysis, stopAnalysis, retryFailed, reanalyzeAll } = useAIAnalysis();
  const { isPremium } = useAuth();
  const { activeModel: localActiveModel } = useLocalAI();
  const router = useRouter();
  const { state: exportState, exportVertical, download: downloadVertical, reset: resetExport } = useVerticalExport();
  const { uploadFiles } = useImageUpload();

  // ─── Yeni canvas store ─────────────────────
  const slides = useCanvasStore(s => s.slides);
  const activeSlideId = useCanvasStore(s => s.activeSlideId);
  const selectedIds = useCanvasStore(s => s.selectedIds);
  const activeTool = useCanvasStore(s => s.activeTool);
  const { loadSlides, setActiveSlide, addSlide } = useCanvasStore.getState();

  // ─── Hooks ─────────────────────────────────
  useEditorKeyboard();
  const { } = useUndoRedo(); // Kısayolları aktif eder

  // ─── Local state ───────────────────────────
  const [activeTab, setActiveTab] = useState<EditorTab>('canvas');
  const [rightPanel, setRightPanel] = useState<RightPanel>('none');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PresentationImage | null>(null);
  const [showRehearsal, setShowRehearsal] = useState(false);
  const [showExportGate, setShowExportGate] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // ─── Yükleme ──────────────────────────────
  useEffect(() => {
    loadPresentation(id);
  }, [id, loadPresentation]);

  useEffect(() => {
    if (currentPresentation) {
      initializeCanvasSlides(currentPresentation.id).then(canvasSlides => {
        loadSlides(currentPresentation.id, canvasSlides);
      });
    }
  }, [currentPresentation?.id]);

  // ─── Auto-save canvas ─────────────────────
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setTimeout(() => {
      saveCanvasSlides(slides);
    }, 1500);
    return () => clearTimeout(timer);
  }, [slides]);

  // ─── Hesaplamalar ─────────────────────────
  const editorColumnCount = currentPresentation?.settings.columnCount ?? 4;
  const analysisLang = currentPresentation?.settings.analysisLanguage ?? 'tr';
  const ollamaModel = selectedImageProvider === 'ollama' ? (localActiveModel ?? undefined) : undefined;

  const pendingCount = currentPresentation?.images.filter(i => i.analysisStatus === 'pending' || i.analysisStatus === 'failed').length ?? 0;
  const completedCount = currentPresentation?.images.filter(i => i.analysisStatus === 'completed').length ?? 0;
  const failedCount = currentPresentation?.images.filter(i => i.analysisStatus === 'failed').length ?? 0;

  const handleReorder = useCallback((ids: string[]) => reorderImages(ids), [reorderImages]);
  const handleUpload = useCallback((files: File[]) => uploadFiles(files), [uploadFiles]);

  // ─── Seçili nesnenin stili ────────────────
  const activeSlide = slides.find(s => s.id === activeSlideId);
  const selectedObject = selectedIds.length === 1
    ? activeSlide?.objects.find(o => o.id === selectedIds[0])
    : null;

  const liveSelectedImage = selectedImage
    ? currentPresentation?.images.find(img => img.id === selectedImage.id) ?? null
    : null;

  const toggleRightPanel = (panel: RightPanel) => {
    setRightPanel(prev => prev === panel ? 'none' : panel);
  };

  return (
    <AppShell hideSidebar>
      {isLoading ? (
        <div className="flex-1 p-12 max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-16 w-96 mx-auto bg-white/5" />
          <Skeleton className="h-6 w-72 mx-auto bg-white/5" />
          <div className="grid grid-cols-3 gap-10 mt-14">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-[2rem] bg-white/5" />
            ))}
          </div>
        </div>
      ) : currentPresentation ? (
        <div className="flex flex-1 overflow-hidden">
          {/* ─── Sol Sidebar (toggle) ──────────── */}
          <EditorSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* ─── Ana Editor Alanı ──────────────── */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Editor Toolbar */}
            <EditorToolbar
              onShapeSelect={(shapeType) => {
                if (!activeSlideId) return;
                const obj = createDefaultShapeObject({
                  id: nanoid(10), x: 100, y: 100, width: 150, height: 150, shapeType,
                });
                useCanvasStore.getState().addObject(obj);
              }}
              onImageUpload={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files ?? []);
                  if (files.length > 0) handleUpload(files);
                };
                input.click();
              }}
            />

            {/* Metin biçimlendirme toolbar (metin seçiliyken) */}
            {selectedObject?.type === 'text' && (
              <TextFormatToolbar
                textObject={selectedObject as TextObject}
                onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates)}
              />
            )}

            {/* Şekil stil toolbar (şekil seçiliyken) */}
            {selectedObject?.type === 'shape' && (
              <ShapeStylePanel
                shapeObject={selectedObject as ShapeObject}
                onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates)}
              />
            )}

            {/* Çizgi stil toolbar (çizgi seçiliyken) */}
            {selectedObject?.type === 'line' && (
              <LineStylePanel
                lineObject={selectedObject as LineObject}
                onUpdate={(updates) => useCanvasStore.getState().updateObject(selectedObject.id, updates as Partial<SlideObject>)}
              />
            )}

            {/* Tab Bar + Analiz Butonu */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 z-30">
              {/* Sol: Sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
                title="Slayt Paneli (S)"
              >
                <MaterialIcon icon={sidebarOpen ? 'side_navigation' : 'view_sidebar'} size={20} />
              </button>

              {/* Orta: Tab bar */}
              <nav className="flex p-1 bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <button
                  onClick={() => setActiveTab('canvas')}
                  className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'canvas' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <MaterialIcon icon="dashboard" size={20} filled={activeTab === 'canvas'} />
                  Görsel Kanvas
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'settings' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <MaterialIcon icon="tune" size={20} filled={activeTab === 'settings'} />
                  Detaylar &amp; Ayarlar
                </button>
              </nav>

              {/* Sağ: Analiz butonu */}
              <AnalyzeButton
                pendingCount={pendingCount}
                completedCount={completedCount}
                totalCount={currentPresentation.images.length}
                isAnalyzing={isAnalyzing}
                onStart={() => startAnalysis(selectedImageProvider, analysisLang, ollamaModel)}
                onStop={stopAnalysis}
                onReanalyze={() => reanalyzeAll(selectedImageProvider, analysisLang, ollamaModel)}
              />
            </div>

            {/* ─── İçerik Alanı ────────────────── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
              {activeTab === 'canvas' ? (
                <div className="canvas-container min-h-full">
                  <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
                    {/* Başlık */}
                    <header className="mb-14 text-center">
                      <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 break-words">
                        {currentPresentation.title}
                      </h1>
                      <p className="text-on-surface-variant text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
                        {currentPresentation.images.length} görsel — {completedCount} analiz edildi
                        {failedCount > 0 && ` — ${failedCount} başarısız`}
                      </p>

                      {/* Sağ panel toggle butonları */}
                      <div className="flex justify-center gap-2 mt-6">
                        {([
                          { id: 'background' as RightPanel, icon: 'palette', label: 'Arka Plan' },
                          { id: 'layout' as RightPanel, icon: 'dashboard_customize', label: 'Düzen' },
                          { id: 'theme' as RightPanel, icon: 'style', label: 'Tema' },
                          { id: 'transition' as RightPanel, icon: 'animation', label: 'Geçiş' },
                        ]).map(btn => (
                          <button
                            key={btn.id}
                            onClick={() => toggleRightPanel(btn.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              rightPanel === btn.id
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'bg-white/5 text-on-surface-variant hover:text-white border border-white/5 hover:border-white/10'
                            }`}
                          >
                            <MaterialIcon icon={btn.icon} size={16} />
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </header>

                    {/* Görsel Grid */}
                    <div className="pb-20">
                      <PresentationCanvas
                        images={currentPresentation.images}
                        columnCount={editorColumnCount}
                        showKeywords={currentPresentation.settings.showKeywordBadges}
                        onImageClick={(img) => {
                          setSelectedImage(img);
                        }}
                        onReorder={handleReorder}
                        onUploadFiles={handleUpload}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Settings Tab */
                <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 pb-24">
                  {/* AI Engine */}
                  <section className="glass-card rounded-2xl border border-white/5 p-6">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-4">AI Motoru</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedImageProvider('gemini' as AIProviderType)}
                        className={`flex-1 glass-card p-4 rounded-2xl cursor-pointer transition-all ${
                          selectedImageProvider === 'gemini' ? 'border-l-[3px] border-primary ring-1 ring-primary/20 scale-[1.02]' : 'border border-white/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="material-symbols-outlined text-primary text-xl">cloud</span>
                          <span className="text-xs font-bold text-white">Gemini Ultra</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant">Bulut · Yüksek doğruluk</p>
                      </button>
                      <button
                        onClick={() => setSelectedImageProvider('ollama' as AIProviderType)}
                        className={`flex-1 glass-card p-4 rounded-2xl cursor-pointer transition-all group ${
                          selectedImageProvider === 'ollama' ? 'border-l-[3px] border-primary ring-1 ring-primary/20 scale-[1.02]' : 'border border-white/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white text-xl">computer</span>
                          <span className="text-xs font-bold text-white">Yerel AI</span>
                        </div>
                        <p className="text-[10px] text-on-surface-variant">Gizli · İnternet gereksiz</p>
                      </button>
                    </div>
                  </section>

                  {/* Quick Settings */}
                  <section className="glass-card rounded-2xl border border-white/5 p-6">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-4">Hızlı Ayarlar</h3>
                    <div className="flex gap-3">
                      <div className="flex-[1.5] glass-card h-11 flex items-center justify-between px-3 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">language</span>
                          <span className="text-xs font-semibold text-white truncate">
                            {analysisLang === 'tr' ? 'Türkçe' : analysisLang === 'en' ? 'English' : analysisLang === 'de' ? 'Deutsch' : 'Français'}
                          </span>
                        </div>
                        <select
                          value={analysisLang}
                          onChange={(e) => updateSettings({ analysisLanguage: e.target.value as 'tr' | 'en' | 'de' | 'fr' })}
                          className="absolute opacity-0 inset-0 cursor-pointer"
                        >
                          <option value="tr">Türkçe</option>
                          <option value="en">English</option>
                          <option value="de">Deutsch</option>
                          <option value="fr">Français</option>
                        </select>
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">expand_more</span>
                      </div>
                      <div className="flex-1 glass-card h-11 flex items-center justify-center gap-2 rounded-xl border border-white/5">
                        {(['dark', 'light', 'corporate'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => updateSettings({ selectedTheme: t })}
                            className={`w-3.5 h-3.5 rounded-full transition-all ${
                              t === 'dark' ? 'bg-background' : t === 'light' ? 'bg-white' : 'bg-slate-900'
                            } ${(currentPresentation.settings.selectedTheme ?? 'dark') === t ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}
                          />
                        ))}
                      </div>
                      <div className="flex-[1.2] glass-card h-11 flex items-center justify-between px-3 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">magic_button</span>
                          <span className="text-xs font-semibold text-white capitalize truncate">{currentPresentation.settings.transitionType ?? 'Zoom'}</span>
                        </div>
                        <select
                          value={currentPresentation.settings.transitionType ?? 'zoom'}
                          onChange={(e) => updateSettings({ transitionType: e.target.value as 'zoom' | 'fade' | 'pan' })}
                          className="absolute opacity-0 inset-0 cursor-pointer"
                        >
                          <option value="zoom">Zoom</option>
                          <option value="fade">Fade</option>
                          <option value="pan">Pan</option>
                          <option value="fadeBlack">Karart</option>
                          <option value="slideRight">Sağdan</option>
                          <option value="flip">Çevir</option>
                          <option value="cube">Küp</option>
                          <option value="gallery">Galeri</option>
                        </select>
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">expand_more</span>
                      </div>
                    </div>
                  </section>

                  {/* Export */}
                  <section className="glass-card rounded-2xl border border-white/5 p-6">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-4">Dışa Aktar</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={async () => {
                          if (!isPremium) { setShowExportGate(true); return; }
                          const blob = await exportToPDF(currentPresentation);
                          downloadBlob(blob, `${currentPresentation.title}.html`);
                        }}
                        className="flex-1 glass-card aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 hover:border-primary/40 hover:-translate-y-1 transition-all group"
                      >
                        <div className="relative">
                          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white text-2xl">picture_as_pdf</span>
                          {!isPremium && <span className="absolute -top-1 -right-4 px-1 py-0.5 rounded-md bg-amber-400 text-[6px] font-black text-black">PRO</span>}
                        </div>
                        <span className="text-[10px] font-black text-on-surface-variant group-hover:text-white">PDF</span>
                      </button>
                      <button
                        onClick={() => { if (!isPremium) { setShowExportGate(true); return; } exportToPPT(currentPresentation); }}
                        className="flex-1 glass-card aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 hover:border-primary/40 hover:-translate-y-1 transition-all group"
                      >
                        <div className="relative">
                          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white text-2xl">present_to_all</span>
                          {!isPremium && <span className="absolute -top-1 -right-4 px-1 py-0.5 rounded-md bg-amber-400 text-[6px] font-black text-black">PRO</span>}
                        </div>
                        <span className="text-[10px] font-black text-on-surface-variant group-hover:text-white">PPT</span>
                      </button>
                      <button
                        onClick={() => exportState === 'idle' && exportVertical(currentPresentation.images)}
                        className="flex-1 glass-card aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 hover:border-primary/40 hover:-translate-y-1 transition-all group"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white text-2xl">smartphone</span>
                        <span className="text-[10px] font-black text-on-surface-variant group-hover:text-white leading-tight text-center">Dikey Video</span>
                      </button>
                    </div>
                  </section>

                  {/* Password */}
                  <section className="glass-card rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                        <span className="text-xs font-bold text-white">Şifre Koruması</span>
                      </div>
                      <button
                        role="switch"
                        aria-checked={currentPresentation.settings.passwordProtected ?? false}
                        onClick={() => updateSettings({ passwordProtected: !currentPresentation.settings.passwordProtected })}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                          currentPresentation.settings.passwordProtected ? 'bg-primary' : 'bg-white/10'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                          currentPresentation.settings.passwordProtected ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        }`} />
                      </button>
                    </div>
                    {currentPresentation.settings.passwordProtected && (
                      <input
                        type="password"
                        placeholder="Şifrenizi belirleyin..."
                        value={currentPresentation.settings.sharePassword ?? ''}
                        onChange={(e) => updateSettings({ sharePassword: e.target.value })}
                        className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        autoComplete="new-password"
                      />
                    )}
                  </section>

                  {/* Rehearsal */}
                  {completedCount > 0 && !showRehearsal && (
                    <button
                      onClick={() => setShowRehearsal(true)}
                      className="w-full py-4 glass-card border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-xs font-black tracking-widest text-white hover:bg-primary/10 hover:border-primary/40 transition-all active:scale-[0.98] uppercase"
                    >
                      <span className="material-symbols-outlined text-[20px]">mic</span>
                      Prova Modu
                    </button>
                  )}
                  {showRehearsal && (
                    <RehearsalView
                      speechProvider={currentPresentation.settings.speechProvider}
                      lang={currentPresentation.settings.language}
                      threshold={currentPresentation.settings.matchThreshold}
                      onAddSynonym={addSynonym}
                      onClose={() => setShowRehearsal(false)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── Sağ Panel (floating) ──────────── */}
          {rightPanel !== 'none' && (
            <div className="absolute right-4 top-40 z-50">
              {rightPanel === 'background' && activeSlide && (
                <BackgroundModal
                  background={activeSlide.background}
                  onChange={(bg) => useCanvasStore.getState().updateSlideBackground(activeSlide.id, bg)}
                  onClose={() => setRightPanel('none')}
                />
              )}
              {rightPanel === 'theme' && (
                <ThemeGallery
                  activeThemeId={(currentPresentation.settings.selectedTheme ?? 'dark') as ThemeId}
                  onSelect={(themeId) => updateSettings({ selectedTheme: themeId })}
                  onClose={() => setRightPanel('none')}
                />
              )}
              {rightPanel === 'layout' && (
                <LayoutGallery
                  onSelect={(layout) => {
                    const newId = addSlide(activeSlideId ?? undefined);
                    // Layout placeholder'larını nesne olarak ekle (gelecekte)
                  }}
                  onClose={() => setRightPanel('none')}
                />
              )}
              {rightPanel === 'transition' && (
                <TransitionPanel
                  selectedType={(currentPresentation.settings.transitionType ?? 'zoom') as TransitionType}
                  selectedSpeed="medium"
                  onTypeChange={(type) => updateSettings({ transitionType: type })}
                  onSpeedChange={() => {}}
                  onApplyAll={() => {}}
                  onClose={() => setRightPanel('none')}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full flex-1">
          <p className="text-on-surface-variant text-lg">Sunum bulunamadı.</p>
        </div>
      )}

      <ExportGate open={showExportGate} onClose={() => setShowExportGate(false)} onUpgrade={() => router.push('/billing')} />

      <Dialog open={liveSelectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-variant border-white/10">
          {liveSelectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{liveSelectedImage.fileName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <FullResImage blobKey={liveSelectedImage.blobKey} thumbnailUrl={liveSelectedImage.thumbnailDataUrl} alt={liveSelectedImage.fileName} className="w-full rounded-xl" />
                <KeywordEditor keywords={liveSelectedImage.keywords} imageId={liveSelectedImage.id} onUpdate={updateKeyword} onDelete={deleteKeyword} onAdd={addKeyword} onAddSynonym={addSynonym} />
                <div className="border-t border-white/5 pt-4">
                  <p className="text-sm font-semibold text-white mb-3">Metin Katmanları</p>
                  <TextOverlayEditor overlays={liveSelectedImage.textOverlays ?? []} onChange={(overlays) => updateImage(liveSelectedImage.id, { textOverlays: overlays })} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
