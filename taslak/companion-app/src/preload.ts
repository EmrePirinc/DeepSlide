import { contextBridge, ipcRenderer } from 'electron';

// Renderer'a güvenli şekilde açılan API
contextBridge.exposeInMainWorld('deepslideAI', {
  // Ollama durumu
  getStatus: () => ipcRenderer.invoke('ollama:status'),

  // Kurulu modelleri listele
  listModels: () => ipcRenderer.invoke('ollama:list-models'),

  // Model indir (streaming ilerleme)
  pullModel: (modelId: string) => ipcRenderer.invoke('ollama:pull-model', modelId),

  // İndirme ilerlemesini dinle
  onPullProgress: (
    callback: (data: {
      modelId: string;
      status: string;
      percent?: number;
      digest?: string;
    }) => void
  ) => {
    ipcRenderer.on('ollama:pull-progress', (_event, data) => callback(data));
    // Cleanup fonksiyonu döndür
    return () => ipcRenderer.removeAllListeners('ollama:pull-progress');
  },

  // Model sil
  deleteModel: (modelId: string) => ipcRenderer.invoke('ollama:delete-model', modelId),

  // Önerilen modelleri al
  getRecommendedModels: () => ipcRenderer.invoke('app:get-recommended-models'),

  // Dış link aç
  openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
});
