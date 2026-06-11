import { app, nativeTheme } from 'electron';
import { DataStore } from './store/dataStore';
import { Task } from '../shared/types';
import { IPC } from '../shared/ipc-channels';
import { createMainWindow, getMainWindow } from './window/mainWindow';
import { createTray } from './window/tray';
import { registerTaskIpc } from './ipc/task';

// 数据存储实例
const taskStore = new DataStore<Task[]>('tasks.json', []);

app.whenReady().then(() => {
  // 单实例锁
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  // 初始化数据存储
  taskStore.init();

  // 注册 IPC 处理器
  registerTaskIpc(taskStore);

  // 创建窗口和托盘
  createMainWindow();
  createTray();

  // 监听系统主题变化
  nativeTheme.on('updated', () => {
    const win = getMainWindow();
    if (win) {
      win.webContents.send(IPC.THEME_CHANGED, nativeTheme.shouldUseDarkColors);
    }
  });

  // macOS: 点击 dock 图标时显示窗口
  app.on('activate', () => {
    const win = getMainWindow();
    if (win) {
      win.show();
    }
  });
});

app.on('window-all-closed', () => {
  // macOS 不在所有窗口关闭时退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 退出时清理托盘
app.on('before-quit', () => {
  const win = getMainWindow();
  if (win) {
    win.destroy();
  }
});
