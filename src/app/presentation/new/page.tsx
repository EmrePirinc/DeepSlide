'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { DropZone } from '@/components/upload/DropZone';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { AIWizardPanel } from '@/components/wizard/AIWizardPanel';
import { usePresentationStore } from '@/stores/presentationStore';
import { useImageUpload } from '@/hooks/useImageUpload';
import { PRESENTATION_TEMPLATES } from '@/lib/templates/presets';
import type { WizardSlide } from '@/app/api/wizard/generate/route';
import { saveNote } from '@/lib/db/notes';

type CreationMode = 'blank' | 'template' | 'ai';

export default function NewPresentationPage() {
  const router = useRouter();
  const {
    createPresentation,
    currentPresentation,
    loadPresentation,
    updateSettings,
  } = usePresentationStore();
  const { uploadFiles, progress, isUploading } = useImageUpload();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<CreationMode>('blank');
  const [step, setStep] = useState<'title' | 'upload' | 'done'>('title');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBlank = async () => {
    if (!title.trim() || isCreating) return;
    setIsCreating(true);
    const id = await createPresentation(title.trim());
    await loadPresentation(id);
    setIsCreating(false);
    setStep('upload');
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    const tpl = PRESENTATION_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl || isCreating) return;
    setIsCreating(true);
    const tplTitle = title.trim() || tpl.title;
    const id = await createPresentation(tplTitle);
    await loadPresentation(id);
    updateSettings({ selectedTheme: tpl.theme, columnCount: tpl.columnCount });
    setIsCreating(false);
    router.push(`/presentation/${id}`);
  };

  const handleAcceptWizard = async (slides: WizardSlide[], topic: string) => {
    if (isCreating) return;
    setIsCreating(true);
    const id = await createPresentation(topic);
    await loadPresentation(id);
    for (const slide of slides) {
      const virtualSlideId = `wizard-${id}-slide-${slide.order}`;
      const noteText = `${slide.title}\n\nKeyword'ler: ${slide.keywords.join(', ')}\n\n${slide.speakerNote}`;
      await saveNote(id, virtualSlideId, noteText);
    }
    setIsCreating(false);
    router.push(`/presentation/${id}`);
  };

  const handleFilesSelected = async (files: File[]) => {
    await uploadFiles(files);
  };

  const handleContinue = () => {
    if (currentPresentation) {
      router.push(`/presentation/${currentPresentation.id}`);
    }
  };

  const TABS: { id: CreationMode; label: string; icon: string }[] = [
    { id: 'blank', label: 'Boş Sunum', icon: 'description' },
    { id: 'template', label: 'Şablondan', icon: 'dashboard' },
    { id: 'ai', label: 'AI ile Oluştur', icon: 'auto_awesome' },
  ];

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-12">

          {/* Page Title */}
          <h1 className="text-3xl font-black tracking-tight text-white mb-8 text-center">
            Yeni Sunum Oluştur
          </h1>

          {step === 'title' && (
            <div className="space-y-6">
              {/* Mode Tabs */}
              <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMode(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-bold transition-all ${
                      mode === tab.id
                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                        : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MaterialIcon icon={tab.icon} size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Blank Mode */}
              {mode === 'blank' && (
                <div className="glass-card rounded-2xl border border-white/5 p-8 space-y-6">
                  <div>
                    <label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">
                      Sunum Başlığı
                    </label>
                    <input
                      id="title"
                      placeholder="Ör: Q1 Satış Sunumu"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateBlank()}
                      autoFocus
                      className="w-full px-4 py-3.5 text-sm bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 ring-primary/50 text-white placeholder:text-on-surface-variant/50 transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleCreateBlank}
                    disabled={!title.trim() || isCreating}
                    className="w-full bg-primary hover:bg-primary-container text-white font-bold rounded-xl py-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  >
                    {isCreating ? 'Oluşturuluyor…' : 'Devam Et'}
                  </Button>
                </div>
              )}

              {/* Template Mode */}
              {mode === 'template' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tpl-title" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3 block">
                      Sunum Başlığı (isteğe bağlı)
                    </label>
                    <input
                      id="tpl-title"
                      placeholder="Başlık girin veya boş bırakın"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3.5 text-sm bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 ring-primary/50 text-white placeholder:text-on-surface-variant/50 transition-all"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {PRESENTATION_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleCreateFromTemplate(tpl.id)}
                        className="glass-card rounded-2xl border border-white/5 p-5 text-left hover:border-primary/40 hover:-translate-y-1 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{tpl.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{tpl.title}</p>
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{tpl.description}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-[9px] font-black rounded-full bg-white/5 px-2.5 py-1 text-on-surface-variant uppercase tracking-wider">{tpl.category}</span>
                              <span className="text-[9px] text-on-surface-variant font-bold">{tpl.suggestedSlides.length} slayt</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Wizard Mode */}
              {mode === 'ai' && (
                <div className="glass-card rounded-2xl border border-white/5 p-8">
                  <AIWizardPanel onAccept={handleAcceptWizard} isCreating={isCreating} />
                </div>
              )}
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-6">
              <DropZone onFilesSelected={handleFilesSelected} disabled={isUploading} />

              <UploadProgress
                total={progress.total}
                completed={progress.completed}
                failed={progress.failed}
                errors={progress.errors}
                isUploading={isUploading}
              />

              {currentPresentation && currentPresentation.images.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-on-surface-variant font-medium">
                      {currentPresentation.images.length} görsel yüklendi
                    </p>
                    <Button
                      onClick={handleContinue}
                      disabled={isUploading}
                      className="bg-primary hover:bg-primary-container text-white font-bold rounded-xl px-6 py-2.5 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    >
                      Devam Et →
                    </Button>
                  </div>
                  <ImagePreview images={currentPresentation.images} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
