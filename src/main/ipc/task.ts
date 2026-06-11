import { ipcMain } from 'electron';
import { randomUUID } from 'crypto';
import { DataStore } from '../store/dataStore';
import { Task, TaskInput } from '../../shared/types';
import { IPC } from '../../shared/ipc-channels';
import dayjs from 'dayjs';

export function registerTaskIpc(store: DataStore<Task[]>) {
  // 获取任务列表
  ipcMain.handle(IPC.TASK_LIST, () => {
    return store.getData();
  });

  // 创建任务
  ipcMain.handle(IPC.TASK_CREATE, (_e, input: TaskInput) => {
    const now = dayjs().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      completed: false,
      pinned: false,
      sortOrder: Date.now(),
      createdAt: now,
      updatedAt: now,
    };

    store.update(tasks => {
      tasks.unshift(task);
    });

    return task;
  });

  // 更新任务
  ipcMain.handle(IPC.TASK_UPDATE, (_e, id: string, patch: Partial<Task>) => {
    let updated: Task | null = null;
    store.update(tasks => {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...patch, updatedAt: dayjs().toISOString() };
        updated = tasks[idx];
      }
    });
    return updated;
  });

  // 删除任务
  ipcMain.handle(IPC.TASK_DELETE, (_e, ids: string[]) => {
    store.update(tasks => {
      const idSet = new Set(ids);
      return tasks.filter(t => !idSet.has(t.id));
    });
    return true;
  });

  // 切换完成状态
  ipcMain.handle(IPC.TASK_TOGGLE, (_e, id: string) => {
    let updated: Task | null = null;
    store.update(tasks => {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx].completed = !tasks[idx].completed;
        tasks[idx].updatedAt = dayjs().toISOString();
        updated = tasks[idx];
      }
    });
    return updated;
  });

  // 置顶/取消置顶
  ipcMain.handle(IPC.TASK_PIN, (_e, id: string) => {
    let updated: Task | null = null;
    store.update(tasks => {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx].pinned = !tasks[idx].pinned;
        tasks[idx].updatedAt = dayjs().toISOString();
        updated = tasks[idx];
      }
    });
    return updated;
  });
}
