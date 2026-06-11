import { Tray, Menu, nativeImage, app } from 'electron';
import * as path from 'path';
import { showMainWindow } from './mainWindow';

let tray: Tray | null = null;

export function createTray(): Tray {
  // 创建托盘图标（Template image 自动适配深浅色）
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('TodoList');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => showMainWindow(),
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // 点击托盘图标切换窗口显隐
  tray.on('click', () => {
    showMainWindow();
  });

  return tray;
}

export function getTray(): Tray | null {
  return tray;
}
