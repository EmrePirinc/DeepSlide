'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DropZone } from '@/components/upload/DropZone';
import { UploadProgress } from '@/components/upload/UploadProgress';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { usePresentationStore } from '@/stores/presentationStore';
import { useImageUpload } from '@/hooks/useImageUpload';

export default function NewPresentationPage() {
  const router = useRouter();
  const {
    createPresentation,
    currentPresentation,
    loadPresentation,
  } = usePresentationStore();
  const { uploadFiles, progress, isUploading } = useImageUpload();
  const [title, setTitle] = useState('');
  const [step, setStep] = useState<'title' | 'upload' | 'done'>('title');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePresentation = async () => {
    if (!title.trim() || isCreating) return;
    setIsCreating(true);
    const id = await createPresentation(title.trim());
    await loadPresentation(id);
    setStep('upload');
  };

  const handleFilesSelected = async (files: File[]) => {
    await uploadFiles(files);
  };

  const handleContinue = () => {
    if (currentPresentation) {
      router.push(`/presentation/${currentPresentation.id}`);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Sunum Oluştur</h1>

        {step === 'title' && (
          <Card className="p-6 space-y-4">
            <div>
              <label
                htmlFor="title"
                className="text-sm font-medium mb-2 block"
              >
                Sunum Başlığı
              </label>
              <Input
                id="title"
                placeholder="Ör: Q1 Satış Sunumu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleCreatePresentation()
                }
                autoFocus
              />
            </div>
            <Button
              onClick={handleCreatePresentation}
              disabled={!title.trim() || isCreating}
            >
              Devam Et
            </Button>
          </Card>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <DropZone
              onFilesSelected={handleFilesSelected}
              disabled={isUploading}
            />

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
                  <p className="text-sm text-muted-foreground">
                    {currentPresentation.images.length} görsel yüklendi
                  </p>
                  <Button onClick={handleContinue} disabled={isUploading}>
                    Devam Et →
                  </Button>
                </div>
                <ImagePreview images={currentPresentation.images} />
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
