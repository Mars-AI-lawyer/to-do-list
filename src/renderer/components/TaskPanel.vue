<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTaskStore } from '../stores/taskStore';
import TaskItem from './TaskItem.vue';

const emit = defineEmits<{
  (e: 'collapse'): void;
}>();

const taskStore = useTaskStore();
const newTitle = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const showArchive = ref(false);

const activeTasks = computed(() => {
  return [...taskStore.tasks]
    .filter(t => !t.completed)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.sortOrder - a.sortOrder;
    });
});

const archivedTasks = computed(() => {
  return [...taskStore.tasks]
    .filter(t => t.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
});

const activeCount = computed(() => {
  return taskStore.tasks.filter(t => !t.completed).length;
});

const archivedCount = computed(() => {
  return taskStore.tasks.filter(t => t.completed).length;
});

const handleSubmit = async () => {
  if (!newTitle.value.trim()) return;
  await taskStore.createTask({ title: newTitle.value.trim() });
  newTitle.value = '';
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
  if (e.key === 'Escape') {
    emit('collapse');
  }
};

const handleClose = () => {
  emit('collapse');
};

// 点击外部收起
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.task-panel')) {
    emit('collapse');
  }
};

onMounted(() => {
  // 延迟绑定，避免自身的点击事件触发
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
  }, 100);
  inputRef.value?.focus();
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div class="task-panel">
    <!-- 拖拽条 -->
    <div class="drag-bar" />

    <div class="panel-header">
      <h2 class="panel-title">待办事项</h2>
      <div class="header-right">
        <span class="task-count" v-if="activeCount > 0">{{ activeCount }}</span>
        <button class="close-btn" @click="handleClose" title="收起">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <svg class="input-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <input
          ref="inputRef"
          v-model="newTitle"
          class="task-input"
          placeholder="添加新任务..."
          @keydown="handleKeydown"
        />
      </div>
    </div>

    <div class="task-list">
      <!-- 活跃任务 -->
      <div v-if="activeTasks.length === 0 && archivedTasks.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #c7c7cc; margin-bottom: 8px;">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        <p>暂无任务</p>
      </div>
      <TaskItem
        v-for="task in activeTasks"
        :key="task.id"
        :task="task"
      />

      <!-- 归档区域 -->
      <div v-if="archivedTasks.length > 0" class="archive-section">
        <button class="archive-toggle" @click="showArchive = !showArchive">
          <svg :class="{ 'rotate-90': showArchive }" viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
            <path d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"/>
          </svg>
          <span>已归档</span>
          <span class="archive-count">{{ archivedCount }}</span>
        </button>
        <div v-if="showArchive" class="archive-list">
          <TaskItem
            v-for="task in archivedTasks"
            :key="task.id"
            :task="task"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 毛玻璃效果 */
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  background: rgba(250, 250, 252, 0.88);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 8px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
}

.drag-bar {
  height: 6px;
  flex-shrink: 0;
  -webkit-app-region: drag;
  cursor: move;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 8px;
  -webkit-app-region: drag;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.2px;
  -webkit-app-region: no-drag;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.task-count {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #007aff;
  padding: 1px 7px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.close-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e93;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #1d1d1f;
}

.input-area {
  padding: 4px 12px 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 0 10px;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12);
}

.input-icon {
  flex-shrink: 0;
  color: #aeaeb2;
  transition: color 0.2s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #007aff;
}

.task-input {
  flex: 1;
  padding: 9px 0;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #1d1d1f;
  outline: none;
  min-width: 0;
}

.task-input::placeholder {
  color: #c7c7cc;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 2px 0 8px;
}

.task-list::-webkit-scrollbar {
  width: 4px;
}

.task-list::-webkit-scrollbar-track {
  background: transparent;
}

.task-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 16px;
}

.empty-state p {
  font-size: 13px;
  color: #c7c7cc;
  margin: 0;
}

.archive-section {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 8px;
}

.archive-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 16px;
  font-size: 13px;
  color: #6e6e73;
  cursor: pointer;
  transition: all 0.15s ease;
}

.archive-toggle:hover {
  background: rgba(0, 0, 0, 0.03);
  color: #1d1d1f;
}

.archive-toggle svg {
  transition: transform 0.2s ease;
}

.archive-toggle .rotate-90 {
  transform: rotate(90deg);
}

.archive-count {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #8e8e93;
  padding: 1px 7px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.archive-list {
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}
</style>
