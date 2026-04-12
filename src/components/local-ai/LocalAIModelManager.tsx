'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Trash2, Download, CheckCircle, Loader2, HardDrive, X } from 'lucide-react';
import { ollamaClient, type OllamaModel } from '@/lib/localAI/client';

interface RecommendedModel {
  id: string;
  name: string;
  size: string;
  speed: string;
  description: string;
  minRamGb: number;
}

const RECOMMENDED: RecommendedModel[] = [
  {
    id: 'gemma4:e2b-it-q4_K_M',
    name: 'Gemma 4 E2B',
    size: '2.6 GB',
    speed: 'Hızlı',
    description: 'Google Gemma 4 — 128K context, instruct',
    minRamGb: 6,
  },
  {
    id: 'qwen3.5:9b',
    name: 'Qwen 3.5 9B',
    size: '6.6 GB',
    speed: 'Güçlü',
    description: 'En güncel Qwen — 256K context',
    minRamGb: 8,
  },
];

interface PullState {
  status: string;
  percent: number;
  speedMBps?: number;
  completedMB?: number;
  totalMB?: number;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec >= 1_000_000) return `${(bytesPerSec / 1_000_000).toFixed(1)} MB/s`;
  if (bytesPerSec >= 1_000) return `${(bytesPerSec / 1_000).toFixed(0)} KB/s`;
  return `${bytesPerSec} B/s`;
}

function readableStatus(raw: string): string {
  if (raw.startsWith('pulling')) return 'İndiriliyor';
  if (raw === 'verifying sha256 digest') return 'Doğrulanıyor';
  if (raw === 'writing manifest') return 'Kaydediliyor';
  if (raw === 'removing any unused layers') return 'Temizleniyor';
  if (raw === 'success') return 'Tamamlandı ✓';
  return raw;
}

interface LocalAIModelManagerProps {
  onModelInstalled?: () => void;
}

export function LocalAIModelManager({ onModelInstalled }: LocalAIModelManagerProps = {}) {
  const [installed, setInstalled] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState<Map<string, PullState>>(new Map());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  // modelId → AbortController (iptal için)
  const abortRefs = useRef<Map<string, AbortController>>(new Map());

  const loadModels = useCallback(async () => {
    const models = await ollamaClient.listModels();
    setInstalled(models);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  function isInstalled(modelId: string): boolean {
    const base = modelId.split(':')[0];
    return installed.some((m) => m.name.startsWith(base));
  }

  async function handlePull(modelId: string) {
    const abort = new AbortController();
    abortRefs.current.set(modelId, abort);
    setPulling((prev) => new Map(prev).set(modelId, { status: 'Başlatılıyor...', percent: 0 }));

    let lastCompleted = 0;
    let lastTimestamp = Date.now();

    try {
      for await (const progress of ollamaClient.pullModel(modelId, abort.signal)) {
        if (abort.signal.aborted) break;

        const percent =
          progress.total && progress.completed
            ? Math.round((progress.completed / progress.total) * 100)
            : 0;

        // Hız hesapla
        let speedMBps: number | undefined;
        if (progress.completed && progress.completed !== lastCompleted) {
          const now = Date.now();
          const elapsedSec = (now - lastTimestamp) / 1000;
          const deltaBytes = progress.completed - lastCompleted;
          if (elapsedSec > 0) speedMBps = deltaBytes / elapsedSec / 1_000_000;
          lastCompleted = progress.completed;
          lastTimestamp = now;
        }

        setPulling((prev) => new Map(prev).set(modelId, {
          status: progress.status,
          percent,
          speedMBps,
          completedMB: progress.completed ? Math.round(progress.completed / 1_000_000) : undefined,
          totalMB: progress.total ? Math.round(progress.total / 1_000_000) : undefined,
        }));

        if (progress.status === 'success') {
          await loadModels();
          onModelInstalled?.();
          break;
        }
      }
    } catch {
      // AbortError — iptal edildi, sessizce geç
    } finally {
      abortRefs.current.delete(modelId);
      setPulling((prev) => {
        const next = new Map(prev);
        next.delete(modelId);
        return next;
      });
    }
  }

  function handleCancel(modelId: string) {
    abortRefs.current.get(modelId)?.abort();
  }

  async function handleDelete(modelName: string) {
    setDeleting((prev) => new Set(prev).add(modelName));
    await ollamaClient.deleteModel(modelName);
    await loadModels();
    setDeleting((prev) => {
      const next = new Set(prev);
      next.delete(modelName);
      return next;
    });
  }

  const speedColor: Record<string, string> = {
    Hızlı: 'bg-green-500/15 text-green-400',
    Dengeli: 'bg-blue-500/15 text-blue-400',
    Güçlü: 'bg-orange-500/15 text-orange-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {RECOMMENDED.map((model) => {
        const installed_ = isInstalled(model.id);
        const pullState = pulling.get(model.id);
        const isPulling = !!pullState;
        const installedModel = installed.find((m) => m.name.startsWith(model.id.split(':')[0]));
        const isDeleting = installedModel ? deleting.has(installedModel.name) : false;

        return (
          <div
            key={model.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600"
          >
            {/* İkon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700 text-xl">
              🤖
            </div>

            {/* Bilgi */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{model.name}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${speedColor[model.speed] ?? ''}`}
                >
                  {model.speed}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <HardDrive className="h-3 w-3" />
                <span>{model.size}</span>
                <span>·</span>
                <span>{model.description}</span>
              </div>

              {/* İndirme progress */}
              {isPulling && (
                <div className="mt-2 space-y-1.5">
                  {/* Progress bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${pullState.percent}%` }}
                    />
                  </div>
                  {/* Durum satırı */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {readableStatus(pullState.status)}
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      {pullState.completedMB !== undefined && pullState.totalMB !== undefined && (
                        <span>{pullState.completedMB} / {pullState.totalMB} MB</span>
                      )}
                      {pullState.speedMBps !== undefined && pullState.speedMBps > 0 && (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatSpeed(pullState.speedMBps * 1_000_000)}
                        </span>
                      )}
                      {pullState.percent > 0 && (
                        <span className="font-bold text-slate-800 dark:text-slate-200">{pullState.percent}%</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Aksiyon */}
            {!isPulling && (
              <div className="flex-shrink-0">
                {installed_ ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Kurulu
                    </span>
                    <button
                      onClick={() => installedModel && handleDelete(installedModel.name)}
                      disabled={isDeleting}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40"
                      title="Modeli sil"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePull(model.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    <Download className="h-3.5 w-3.5" />
                    İndir
                  </button>
                )}
              </div>
            )}

            {isPulling && (
              <button
                onClick={() => handleCancel(model.id)}
                className="flex-shrink-0 rounded-lg border border-red-400 p-1.5 text-red-500 transition-colors hover:bg-red-500/10 dark:border-red-500/30 dark:text-red-400"
                title="İptal et"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
