'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface UploadProgressProps {
  total: number;
  completed: number;
  failed: number;
  errors: string[];
  isUploading: boolean;
}

export function UploadProgress({
  total,
  completed,
  failed,
  errors,
  isUploading,
}: UploadProgressProps) {
  if (total === 0 && errors.length === 0) return null;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="p-4 space-y-3">
      {isUploading && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span>
              {completed}/{total} görsel işlendi
            </span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} />
        </>
      )}

      {!isUploading && total > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600 font-medium">
            {completed - failed} görsel başarıyla yüklendi
          </span>
          {failed > 0 && (
            <span className="text-destructive">({failed} başarısız)</span>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, i) => (
            <p key={i} className="text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
