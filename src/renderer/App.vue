<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTaskStore } from './stores/taskStore';
import Bubble from './components/Bubble.vue';
import TaskPanel from './components/TaskPanel.vue';

const taskStore = useTaskStore();
const isExpanded = ref(false);

const handleBubbleClick = (mouseX: number, mouseY: number) => {
  // 先更新本地状态，再通知主进程调整窗口大小
  isExpanded.value = true;
  window.api.window.expand(mouseX, mouseY);
};

const handleCollapse = () => {
  isExpanded.value = false;
  window.api.window.collapse();
};

onMounted(async () => {
  await taskStore.fetchTasks();
});
</script>

<template>
  <div class="app-container">
    <Bubble v-if="!isExpanded" @expand="handleBubbleClick" />
    <TaskPanel v-else @collapse="handleCollapse" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}
</style>
