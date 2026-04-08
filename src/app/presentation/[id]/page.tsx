'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { use, useEffect, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PresentationCanvas } from '@/components/canvas/PresentationCanvas';
import { PresentationToolbar } from '@/components/presentation/PresentationToolbar';
import { KeywordEditor } from '@/components/keywords/KeywordEditor';
import {
  ProviderSelector,
  IMAGE_PROVIDER_OPTIONS,
} from '@/components/settings/AIProviderSelector';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { TRANSITION_OPTIONS } from '@/lib/animation/transitions/factory';
import { Button } from '@/components/ui/button';
import { RehearsalView } from '@/components/rehearsal/RehearsalView';
import { usePresentationStore } from '@/stores/presentationStore';
import { useUIStore } from '@/stores/uiStore';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { FullResImage } from '@/components/canvas/FullResImage';
import { clusterImagesByKeywords } from '@/lib/utils/clustering';
import { exportToPDF, downloadBlob } from '@/lib/export/pdfExport';
import { exportToPPT } from '@/lib/export/pptExport';
import type { PresentationImage, AIProviderType } from '@/types/presentation';
import { ExportGate } from '@/components/billing/ExportGate';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function PresentationEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    currentPresentation,
    loadPresentation,
    isLoading,
    updateSettings,
    reorderImages,
    updateKeyword,
    deleteKeyword,
    addKeyword,
    addSynonym,
  } = usePresentationStore();
  const { selectedImageProvider, setSelectedImageProvider } = useUIStore();
  const { isAnalyzing, total, completed, startAnalysis, stopAnalysis, retryFailed, reanalyzeAll } =
    useAIAnalysis();
  const [selectedImage, setSelectedImage] = useState<PresentationImage | null>(
    null
  );
  const [showRehearsal, setShowRehearsal] = useState(false);
  const [showExportGate, setShowExportGate] = useState(false);
  const { isPremium } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadPresentation(id);
  }, [id, loadPresentation]);

  const columnCount = currentPresentation?.settings.columnCount ?? 4;

  const handleColumnCountChange = useCallback(
    (count: 3 | 4 | 5) => {
      updateSettings({ columnCount: count });
    },
    [updateSettings]
  );

  const handleAutoArrange = useCallback(() => {
    if (!currentPresentation) return;
    const sorted = clusterImagesByKeywords(currentPresentation.images);
    reorderImages(sorted.map((img) => img.id));
  }, [currentPresentation, reorderImages]);

  const handleReorder = useCallback(
    (imageIds: string[]) => {
      reorderImages(imageIds);
    },
    [reorderImages]
  );

  const analysisLang = currentPresentation?.settings.analysisLanguage ?? 'tr';
  const handleStartAnalysis = () => startAnalysis(selectedImageProvider, analysisLang);
  const handleRetry = () => retryFailed(selectedImageProvider, analysisLang);
  const handleReanalyze = () => reanalyzeAll(selectedImageProvider, analysisLang);

  const pendingCount =
    currentPresentation?.images.filter(
      (img) =>
        img.analysisStatus === 'pending' || img.analysisStatus === 'failed'
    ).length ?? 0;

  const completedCount =
    currentPresentation?.images.filter(
      (img) => img.analysisStatus === 'completed'
    ).length ?? 0;

  const failedCount =
    currentPresentation?.images.filter(
      (img) => img.analysisStatus === 'failed'
    ).length ?? 0;

  // selectedImage'i güncel tutmak için store'daki versiyonu kullan
  const liveSelectedImage = selectedImage
    ? currentPresentation?.images.find((img) => img.id === selectedImage.id) ??
      null
    : null;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-4">
        {isLoading ? (
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        ) : currentPresentation ? (
          <>
            {/* Başlık */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {currentPresentation.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentPresentation.images.length} görsel —{' '}
                  {completedCount} analiz edildi
                  {failedCount > 0 && ` — ${failedCount} başarısız`}
                </p>
              </div>
              {currentPresentation.images.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!isPremium) { setShowExportGate(true); return; }
                      const blob = await exportToPDF(currentPresentation);
                      downloadBlob(blob, `${currentPresentation.title}.html`);
                    }}
                  >
                    PDF Export {!isPremium && <span className="ml-1 text-xs text-primary">Pro</span>}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!isPremium) { setShowExportGate(true); return; }
                      exportToPPT(currentPresentation);
                    }}
                  >
                    PPT Export {!isPremium && <span className="ml-1 text-xs text-primary">Pro</span>}
                  </Button>
                  <ExportGate
                    open={showExportGate}
                    onClose={() => setShowExportGate(false)}
                    onUpgrade={() => router.push('/billing')}
                  />
                </div>
              )}
            </div>

            {/* API + Dil Seçimi */}
            <Card className="p-4 space-y-4">
              <ProviderSelector
                label="Görsel Analiz API"
                value={selectedImageProvider}
                options={IMAGE_PROVIDER_OPTIONS}
                onChange={(v) =>
                  setSelectedImageProvider(v as AIProviderType)
                }
              />
              {(selectedImageProvider === 'qwen' || selectedImageProvider === 'gemma') && (
                <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  {selectedImageProvider === 'qwen' ? 'Qwen 3.5' : 'Gemma 4'} yerel olarak Ollama ile çalışır. Ollama uygulamasının açık olduğundan emin olun. Sınırsız ve ücretsiz.
                </p>
              )}
              <ProviderSelector
                label="Analiz Dili"
                value={analysisLang}
                options={[
                  { value: 'tr', label: 'Türkçe', description: 'Keyword\'ler Türkçe çıkarılır' },
                  { value: 'en', label: 'English', description: 'Keywords extracted in English' },
                  { value: 'de', label: 'Deutsch', description: 'Schlüsselwörter auf Deutsch' },
                  { value: 'fr', label: 'Français', description: 'Mots-clés en français' },
                ]}
                onChange={(v) => updateSettings({ analysisLanguage: v as 'tr' | 'en' | 'de' | 'fr' })}
              />
            </Card>

            {/* Tema + Efekt Seçimi */}
            <Card className="p-4 space-y-4">
              <ThemeSelector
                value={currentPresentation.settings.selectedTheme ?? 'dark'}
                onChange={(v) => updateSettings({ selectedTheme: v })}
              />
              <ProviderSelector
                label="Geçiş Efekti"
                value={currentPresentation.settings.transitionType ?? 'zoom'}
                options={TRANSITION_OPTIONS}
                onChange={(v) => updateSettings({ transitionType: v as 'zoom' | 'fade' | 'pan' })}
              />
            </Card>

            {/* Analiz İlerleme */}
            {isAnalyzing && (
              <Card className="p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Analiz ediliyor...</span>
                  <span>
                    {completed}/{total}
                  </span>
                </div>
                <Progress value={total > 0 ? (completed / total) * 100 : 0} />
              </Card>
            )}

            {/* Toolbar */}
            <PresentationToolbar
              presentationId={id}
              columnCount={columnCount}
              onColumnCountChange={handleColumnCountChange}
              onAutoArrange={handleAutoArrange}
              onStartAnalysis={handleStartAnalysis}
              onRetryFailed={handleRetry}
              onReanalyze={handleReanalyze}
              onStopAnalysis={stopAnalysis}
              imageCount={currentPresentation.images.length}
              pendingCount={pendingCount}
              failedCount={failedCount}
              isAnalyzing={isAnalyzing}
              analysisCompleted={completed}
              analysisTotal={total}
              completedCount={completedCount}
            />

            {/* Prova Butonu */}
            {completedCount > 0 && !showRehearsal && (
              <Button
                variant="outline"
                onClick={() => setShowRehearsal(true)}
              >
                🎤 Prova Modu
              </Button>
            )}

            {/* Prova Modu */}
            {showRehearsal && (
              <RehearsalView
                speechProvider={currentPresentation.settings.speechProvider}
                lang={currentPresentation.settings.language}
                threshold={currentPresentation.settings.matchThreshold}
                onAddSynonym={addSynonym}
                onClose={() => setShowRehearsal(false)}
              />
            )}

            {/* Grid Canvas */}
            <PresentationCanvas
              images={currentPresentation.images}
              columnCount={columnCount}
              showKeywords={currentPresentation.settings.showKeywordBadges}
              onImageClick={setSelectedImage}
              onReorder={handleReorder}
            />

            {/* Görsel Detay Dialog */}
            <Dialog
              open={liveSelectedImage !== null}
              onOpenChange={(open) => !open && setSelectedImage(null)}
            >
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {liveSelectedImage && (
                  <>
                    <DialogHeader>
                      <DialogTitle>{liveSelectedImage.fileName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <FullResImage
                        blobKey={liveSelectedImage.blobKey}
                        thumbnailUrl={liveSelectedImage.thumbnailDataUrl}
                        alt={liveSelectedImage.fileName}
                        className="w-full rounded-md"
                      />
                      <KeywordEditor
                        keywords={liveSelectedImage.keywords}
                        imageId={liveSelectedImage.id}
                        onUpdate={updateKeyword}
                        onDelete={deleteKeyword}
                        onAdd={addKeyword}
                        onAddSynonym={addSynonym}
                      />
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <p className="text-muted-foreground">Sunum bulunamadı.</p>
        )}
      </div>
    </AppShell>
  );
}
