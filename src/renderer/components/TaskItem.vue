<script setup lang="ts">
import type { Task } from '@shared/types';
import { useTaskStore } from '../stores/taskStore';
import { ref, nextTick } from 'vue';

const props = defineProps<{
  task: Task;
}>();

const taskStore = useTaskStore();
const isEditing = ref(false);
const editTitle = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

const handleToggle = () => {
  taskStore.toggleTask(props.task.id);
};

const handleDelete = () => {
  taskStore.deleteTasks([props.task.id]);
};

const handlePin = () => {
  taskStore.pinTask(props.task.id);
};

const handleTitleClick = () => {
  // 已完成任务不允许编辑
  if (props.task.completed) return;
  isEditing.value = true;
  editTitle.value = props.task.title;
  nextTick(() => {
    editInputRef.value?.focus();
    editInputRef.value?.select();
  });
};

const handleSave = async () => {
  if (isEditing.value) {
    const trimmed = editTitle.value.trim();
    if (trimmed && trimmed !== props.task.title) {
      await taskStore.updateTask(props.task.id, { title: trimmed });
    }
    isEditing.value = false;
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSave();
  } else if (e.key === 'Escape') {
    isEditing.value = false;
  }
};
</script>

<template>
  <div class="task-item" :class="{ completed: task.completed, pinned: task.pinned }">
    <button class="checkbox" @click="handleToggle">
      <svg v-if="!task.completed" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="10" cy="10" r="8"/>
      </svg>
      <svg v-else viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
        <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1.5 11.5l-3-3 1.06-1.06L8.5 11.38l4.44-4.44L14 8l-5.5 5.5z"/>
      </svg>
    </button>

    <div v-if="isEditing" class="edit-wrapper">
      <input
        ref="editInputRef"
        v-model="editTitle"
        class="edit-input"
        @blur="handleSave"
        @keydown="handleKeydown"
      />
    </div>
    <span v-else class="task-title" :class="{ 'line-through': task.completed }" @click="handleTitleClick">
      {{ task.title }}
    </span>

    <div class="task-actions">
      <button class="action-btn pin" @click="handlePin" :title="task.pinned ? '取消置顶' : '置顶'">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" :class="{ active: task.pinned }">
          <path d="M13.33 10V3.33h.84V1.67H5.83v1.67h.84V10l-1.67 1.67v1.66h4.35v5h.84v-5h4.35v-1.66L13.33 10z"/>
        </svg>
      </button>
      <button class="action-btn delete" @click="handleDelete" title="删除">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
          <path d="M5 15.83c0 .92.75 1.67 1.67 1.67h6.67c.92 0 1.67-.75 1.67-1.67V5.83H5v10zM15.83 3.33h-2.91l-.42-.42h-5l-.42.42H4.17v1.67h11.67V3.33z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  transition: background 0.15s ease;
  user-select: none;
}

.task-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.task-item.completed {
  opacity: 0.5;
}

.task-item.pinned {
  background: rgba(0, 122, 255, 0.05);
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: #007aff;
  transition: all 0.15s ease;
}

.checkbox:hover {
  opacity: 0.7;
}

.task-item.completed .checkbox {
  color: #34c759;
}

.task-title {
  flex: 1;
  font-size: 14px;
  color: #1d1d1f;
  cursor: text;
  word-break: break-word;
  line-height: 1.4;
}

.task-title:hover {
  background: rgba(0, 122, 255, 0.06);
  border-radius: 4px;
  margin: -2px -4px;
  padding: 2px 4px;
}

.task-title.line-through {
  text-decoration: line-through;
  color: #aeaeb2;
}

.edit-wrapper {
  flex: 1;
  min-width: 0;
}

.edit-input {
  width: 100%;
  padding: 2px 4px;
  border: 1px solid #007aff;
  border-radius: 4px;
  font-size: 14px;
  color: #1d1d1f;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.12);
}

.task-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: #6e6e73;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}

.action-btn.pin .active {
  color: #ff9500;
}

.action-btn.delete:hover {
  color: #ff3b30;
}

/* 深色模式 */
:root.dark .task-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

:root.dark .task-item.pinned {
  background: rgba(10, 132, 255, 0.1);
}

:root.dark .checkbox {
  color: #0a84ff;
}

:root.dark .task-item.completed .checkbox {
  color: #30d158;
}

:root.dark .task-title {
  color: #f5f5f7;
}

:root.dark .task-title.line-through {
  color: #636366;
}

:root.dark .action-btn {
  color: #a1a1a6;
}

:root.dark .action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f5f5f7;
}

:root.dark .action-btn.pin .active {
  color: #ff9f0a;
}

:root.dark .action-btn.delete:hover {
  color: #ff453a;
}
</style>
