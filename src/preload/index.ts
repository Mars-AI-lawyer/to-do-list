import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';
import { TaskInput, Task } from '../shared/types';

// 暴露给渲染进程的安全 API
contextBridge.exposeInMainWorld('api', {
  task: {
    list: (): Promise<Task[]> => ipcRenderer.invoke(IPC.TASK_LIST),
    create: (input: TaskInput): Promise<Task> => ipcRenderer.invoke(IPC.TASK_CREATE, input),
    update: (id: string, patch: Partial<Task>): Promise<Task> => ipcRenderer.invoke(IPC.TASK_UPDATE, id, patch),
    delete: (ids: string[]): Promise<boolean> => ipcRenderer.invoke(IPC.TASK_DELETE, ids),
    toggle: (id: string): Promise<Task> => ipcRenderer.invoke(IPC.TASK_TOGGLE, id),
    pin: (id: string): Promise<Task> => ipcRenderer.invoke(IPC.TASK_PIN, id),
  },

  window: {
    expand: (mouseX?: number, mouseY?: number) => ipcRenderer.send(IPC.WINDOW_EXPAND, mouseX, mouseY),
    collapse: () => ipcRenderer.send(IPC.WINDOW_COLLAPSE),
    dragMove: (deltaX: number, deltaY: number) => ipcRenderer.send(IPC.WINDOW_DRAG_MOVE, deltaX, deltaY),
    onExpand: (callback: (mouseX?: number, mouseY?: number) => void) => {
      ipcRenderer.on(IPC.WINDOW_EXPAND, (_e, mouseX, mouseY) => callback(mouseX, mouseY));
    },
    onCollapse: (callback: () => void) => {
      ipcRenderer.on(IPC.WINDOW_COLLAPSE, () => callback());
    },
  },

  onThemeChange: (callback: (isDark: boolean) => void) => {
    ipcRenderer.on(IPC.THEME_CHANGED, (_e, isDark) => callback(isDark));
  },
});
