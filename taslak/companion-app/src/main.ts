import { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { ElectronOllama } from 'electron-ollama';
import { autoUpdater } from 'electron-updater';

// DeepSlide'ın erişimine izin verilen origin'ler
const ALLOWED_ORIGINS = [
  'https://app.deepslide.com',
  'https://www.deepslide.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

const OLLAMA_PORT = 11434;
const OLLAMA_VERSION = 'latest';

// DeepSlide için önerilen modeller
const RECOMMENDED_MODELS = [
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

let tray: Tray | null = null;
let managerWindow: BrowserWindow | null = null;
let ollamaInstance: ElectronOllama | null = null;
let currentStatus: 'starting' | 'running' | 'stopped' | 'downloading' = 'stopped';
let downloadProgress = '';

// Electron tek instance zorlaması
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

// İkinci instance açılırsa mevcut pencereyi öne getir
app.on('second-instance', () => {
  if (managerWindow) {
    if (managerWindow.isMinimized()) managerWindow.restore();
    managerWindow.focus();
  }
});

// macOS: dock'ta görünme (sadece tray app)
app.dock?.hide();

async function initOllama(): Promise<void> {
  ollamaInstance = new ElectronOllama({
    basePath: app.getPath('userData'),
    directory: 'ollama-binaries',
  });

  // Zaten çalışıyorsa (sistem genelinde Ollama kurulu) skip et
  if (await ollamaInstance.isRunning()) {
    currentStatus = 'running';
    updateTray();
    return;
  }

  currentStatus = 'downloading';
  updateTray();

  try {
    // En güncel Ollama versiyonunu al
    const metadata = await ollamaInstance.getMetadata(OLLAMA_VERSION);

    await ollamaInstance.serve(metadata.version, {
      serverLog: (message: string) => {
        console.log('[Ollama]', message);
      },
      downloadLog: (percent: number, message: string) => {
        downloadProgress = `${percent}%`;
        console.log('[Ollama İndirme]', `${percent}%`, message);
        updateTray();
      },
      timeoutSec: 30,
    });

    currentStatus = 'running';
    downloadProgress = '';
    updateTray();
  } catch (err) {
    console.error('Ollama başlatılamadı:', err);
    currentStatus = 'stopped';
    updateTray();
  }
}

function getTrayLabel(): string {
  switch (currentStatus) {
    case 'downloading':
      return `DeepSlide Local AI — İndiriliyor ${downloadProgress}`;
    case 'starting':
      return 'DeepSlide Local AI — Başlatılıyor...';
    case 'running':
      return 'DeepSlide Local AI — Çalışıyor ✓';
    case 'stopped':
      return 'DeepSlide Local AI — Durduruldu';
  }
}

function updateTray(): void {
  if (!tray) return;

  const statusItems: Electron.MenuItemConstructorOptions[] = [
    { label: getTrayLabel(), enabled: false },
    { type: 'separator' },
  ];

  const actionItems: Electron.MenuItemConstructorOptions[] =
    currentStatus === 'running'
      ? [
          {
            label: 'Model Yöneticisi...',
            click: openManagerWindow,
          },
          {
            label: 'DeepSlide\'ı Aç',
            click: () => shell.openExternal('https://app.deepslide.com'),
          },
          { type: 'separator' },
          {
            label: 'Ollama\'yı Yeniden Başlat',
            click: restartOllama,
          },
        ]
      : [
          {
            label: 'Yeniden Dene',
            click: initOllama,
            enabled: currentStatus === 'stopped',
          },
        ];

  const bottomItems: Electron.MenuItemConstructorOptions[] = [
    { type: 'separator' },
    {
      label: 'Logları Göster',
      click: () => shell.openPath(app.getPath('logs')),
    },
    {
      label: 'Hakkında',
      click: showAbout,
    },
    { type: 'separator' },
    { label: 'Çıkış', role: 'quit' },
  ];

  const menu = Menu.buildFromTemplate([...statusItems, ...actionItems, ...bottomItems]);
  tray.setContextMenu(menu);
  tray.setToolTip(getTrayLabel());
}

async function restartOllama(): Promise<void> {
  currentStatus = 'starting';
  updateTray();

  const server = ollamaInstance?.getServer();
  if (server) {
    await server.stop();
  }

  await initOllama();
}

function showAbout(): void {
  dialog.showMessageBox({
    type: 'info',
    title: 'DeepSlide Local AI',
    message: 'DeepSlide Local AI',
    detail: `Sürüm: ${app.getVersion()}\nOllama tabanlı yerel AI motoru\n\nDeepSlide sunumlarınız için\nözel AI asistanı.`,
    buttons: ['Tamam'],
  });
}

function openManagerWindow(): void {
  if (managerWindow && !managerWindow.isDestroyed()) {
    managerWindow.focus();
    return;
  }

  managerWindow = new BrowserWindow({
    width: 640,
    height: 580,
    resizable: false,
    title: 'DeepSlide — Model Yöneticisi',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    backgroundColor: '#0f172a',
  });

  managerWindow.loadFile(path.join(__dirname, '../src/windows/manager.html'));

  managerWindow.once('ready-to-show', () => {
    managerWindow?.show();
  });

  managerWindow.on('closed', () => {
    managerWindow = null;
  });

  // Dış linkleri tarayıcıda aç
  managerWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC handlers — renderer'dan gelen istekler
ipcMain.handle('ollama:status', async () => {
  const running = await ollamaInstance?.isRunning() ?? false;
  return { running, status: currentStatus };
});

ipcMain.handle('ollama:list-models', async () => {
  if (!ollamaInstance || !(await ollamaInstance.isRunning())) {
    return { models: [] };
  }
  try {
    const res = await fetch(`http://localhost:${OLLAMA_PORT}/api/tags`);
    const data = await res.json() as { models: { name: string; size: number; modified_at: string }[] };
    return { models: data.models ?? [] };
  } catch {
    return { models: [] };
  }
});

ipcMain.handle('ollama:pull-model', async (event, modelId: string) => {
  const res = await fetch(`http://localhost:${OLLAMA_PORT}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelId, stream: true }),
  });

  if (!res.body) throw new Error('Stream body yok');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const chunk = JSON.parse(line) as {
          status: string;
          total?: number;
          completed?: number;
          digest?: string;
        };
        const percent =
          chunk.total && chunk.completed
            ? Math.round((chunk.completed / chunk.total) * 100)
            : undefined;

        // Renderer'a ilerleme gönder
        event.sender.send('ollama:pull-progress', {
          modelId,
          status: chunk.status,
          percent,
          digest: chunk.digest,
        });
      } catch {
        // JSON parse hatası — satırı atla
      }
    }
  }

  return { success: true };
});

ipcMain.handle('ollama:delete-model', async (_event, modelId: string) => {
  const res = await fetch(`http://localhost:${OLLAMA_PORT}/api/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: modelId }),
  });
  return { success: res.ok };
});

ipcMain.handle('app:get-recommended-models', () => RECOMMENDED_MODELS);

ipcMain.handle('app:open-external', (_event, url: string) => {
  shell.openExternal(url);
});

// Otomatik güncelleme kurulumu
function setupAutoUpdater(): void {
  autoUpdater.checkForUpdatesAndNotify().catch(() => {
    // Güncelleme sunucusu yoksa sessizce geç
  });

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Güncelleme Hazır',
        message: 'Yeni sürüm indirildi.',
        detail: 'Uygulamayı güncellemek için yeniden başlatmak ister misiniz?',
        buttons: ['Şimdi Yeniden Başlat', 'Daha Sonra'],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
  });
}

// CORS ayarları — Ollama'nın web app'tan erişilebilir olması için
function setOllamaEnv(): void {
  process.env['OLLAMA_ORIGINS'] = ALLOWED_ORIGINS.join(',');
  process.env['OLLAMA_HOST'] = `127.0.0.1:${OLLAMA_PORT}`;
}

// Uygulama başlangıcı
app.whenReady().then(async () => {
  setOllamaEnv();

  // System tray ikonu oluştur
  // Üretimde gerçek icon dosyası kullanılır; geliştirmede nativeTheme'e göre
  const iconPath = path.join(__dirname, '../assets/icons/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('DeepSlide Local AI');

  // Çift tıkla model yöneticisini aç
  tray.on('double-click', openManagerWindow);

  updateTray();

  // Ollama'yı başlat
  await initOllama();

  // Otomatik güncelleme — sadece üretimde
  if (app.isPackaged) {
    setupAutoUpdater();
  }
});

// macOS'ta tüm pencereler kapanınca uygulamayı kapatma (tray app)
app.on('window-all-closed', () => {
  // Tray app olduğu için çalışmaya devam et
});

// Uygulama kapatılırken Ollama'yı temizle
app.on('before-quit', async () => {
  const server = ollamaInstance?.getServer();
  if (server) {
    await server.stop();
  }
});
