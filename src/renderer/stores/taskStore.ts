import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Task, TaskInput } from '@shared/types';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);

  // 获取任务列表
  async function fetchTasks() {
    loading.value = true;
    try {
      tasks.value = await window.api.task.list();
    } finally {
      loading.value = false;
    }
  }

  // 创建任务
  async function createTask(input: TaskInput) {
    const task = await window.api.task.create(input);
    tasks.value.unshift(task);
    return task;
  }

  // 更新任务
  async function updateTask(id: string, patch: Partial<Task>) {
    const updated = await window.api.task.update(id, patch);
    if (updated) {
      const idx = tasks.value.findIndex(t => t.id === id);
      if (idx !== -1) tasks.value[idx] = updated;
    }
    return updated;
  }

  // 删除任务
  async function deleteTasks(ids: string[]) {
    await window.api.task.delete(ids);
    const idSet = new Set(ids);
    tasks.value = tasks.value.filter(t => !idSet.has(t.id));
  }

  // 切换完成状态
  async function toggleTask(id: string) {
    const updated = await window.api.task.toggle(id);
    if (updated) {
      const idx = tasks.value.findIndex(t => t.id === id);
      if (idx !== -1) tasks.value[idx] = updated;
    }
    return updated;
  }

  // 置顶/取消置顶
  async function pinTask(id: string) {
    const updated = await window.api.task.pin(id);
    if (updated) {
      const idx = tasks.value.findIndex(t => t.id === id);
      if (idx !== -1) tasks.value[idx] = updated;
    }
    return updated;
  }

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTasks,
    toggleTask,
    pinTask,
  };
});
