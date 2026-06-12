import { BrowserWindow, shell, nativeImage, screen, ipcMain } from 'electron';
import * as path from 'path';
import { IPC } from '../../shared/ipc-channels';

let mainWindow: BrowserWindow | null = null;
let isExpanded = false;

// 收起时的尺寸
const COLLAPSED_SIZE = { width: 48, height: 48 };
// 展开时的尺寸
const EXPANDED_SIZE = { width: 320, height: 480 };

export function createMainWindow(): BrowserWindow {
  // 应用图标
  const iconPath = path.join(__dirname, '../../resources/icon.png');
  const appIcon = nativeImage.createFromPath(iconPath);

  // 获取鼠标位置，在附近创建窗口
  const cursorPos = screen.getCursorScreenPoint();

  mainWindow = new BrowserWindow({
    x: cursorPos.x - COLLAPSED_SIZE.width / 2,
    y: cursorPos.y - COLLAPSED_SIZE.height / 2,
    width: COLLAPSED_SIZE.width,
    height: COLLAPSED_SIZE.height,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 开发环境加载 Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 开发模式打开 DevTools（注释掉则不打开）
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 外部链接用浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 注册窗口控制 IPC
  registerWindowIpc();

  return mainWindow;
}

function registerWindowIpc() {
  // 展开窗口
  ipcMain.on(IPC.WINDOW_EXPAND, (_e, mouseX?: number, mouseY?: number) => {
    if (!mainWindow) return;
    if (isExpanded) return;

    let x: number;
    let y: number;

    if (mouseX !== undefined && mouseY !== undefined) {
      // 以鼠标位置为中心展开
      x = mouseX - EXPANDED_SIZE.width / 2;
      y = mouseY - EXPANDED_SIZE.height / 2;
    } else {
      const currentBounds = mainWindow.getBounds();
      x = currentBounds.x - (EXPANDED_SIZE.width - COLLAPSED_SIZE.width) / 2;
      y = currentBounds.y - (EXPANDED_SIZE.height - COLLAPSED_SIZE.height) / 2;
    }

    // 确保不超出屏幕边界
    const display = screen.getDisplayNearestPoint({ x: x + EXPANDED_SIZE.width / 2, y: y + EXPANDED_SIZE.height / 2 });
    const bounds = display.workArea;

    if (x + EXPANDED_SIZE.width > bounds.x + bounds.width) {
      x = bounds.x + bounds.width - EXPANDED_SIZE.width - 10;
    }
    if (x < bounds.x) {
      x = bounds.x + 10;
    }
    if (y + EXPANDED_SIZE.height > bounds.y + bounds.height) {
      y = bounds.y + bounds.height - EXPANDED_SIZE.height - 10;
    }
    if (y < bounds.y) {
      y = bounds.y + 10;
    }

    mainWindow.setBounds({
      x: Math.round(x),
      y: Math.round(y),
      width: EXPANDED_SIZE.width,
      height: EXPANDED_SIZE.height,
    }, true); // true = animate

    isExpanded = true;
  });

  // 收起窗口
  ipcMain.on(IPC.WINDOW_COLLAPSE, () => {
    if (!mainWindow || !isExpanded) return;

    const currentBounds = mainWindow.getBounds();
    const x = Math.round(currentBounds.x + (EXPANDED_SIZE.width - COLLAPSED_SIZE.width) / 2);
    const y = Math.round(currentBounds.y + (EXPANDED_SIZE.height - COLLAPSED_SIZE.height) / 2);

    mainWindow.setBounds({
      x,
      y,
      width: COLLAPSED_SIZE.width,
      height: COLLAPSED_SIZE.height,
    }, true);

    isExpanded = false;
  });

  // 切换展开/收起
  ipcMain.on(IPC.WINDOW_TOGGLE, (_e, mouseX?: number, mouseY?: number) => {
    if (isExpanded) {
      mainWindow?.webContents.send(IPC.WINDOW_COLLAPSE);
    } else {
      mainWindow?.webContents.send(IPC.WINDOW_EXPAND, mouseX, mouseY);
    }
  });

  // 拖拽移动窗口
  ipcMain.on(IPC.WINDOW_DRAG_MOVE, (_e, deltaX: number, deltaY: number) => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    mainWindow.setBounds({
      x: Math.round(bounds.x + deltaX),
      y: Math.round(bounds.y + deltaY),
      width: bounds.width,
      height: bounds.height,
    });
  });
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function showMainWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
}
