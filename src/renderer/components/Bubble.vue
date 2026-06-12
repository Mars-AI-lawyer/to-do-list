<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'expand', mouseX: number, mouseY: number): void;
}>();

const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const lastMouseX = ref(0);
const lastMouseY = ref(0);

const DRAG_THRESHOLD = 3; // 像素阈值，超过视为拖拽

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = false;
  dragStartX.value = e.screenX;
  dragStartY.value = e.screenY;
  lastMouseX.value = e.screenX;
  lastMouseY.value = e.screenY;

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  const deltaX = e.screenX - lastMouseX.value;
  const deltaY = e.screenY - lastMouseY.value;

  // 一旦移动超过阈值，标记为拖拽状态
  if (!isDragging.value) {
    const totalDeltaX = Math.abs(e.screenX - dragStartX.value);
    const totalDeltaY = Math.abs(e.screenY - dragStartY.value);
    if (totalDeltaX > DRAG_THRESHOLD || totalDeltaY > DRAG_THRESHOLD) {
      isDragging.value = true;
    }
  }

  if (isDragging.value) {
    window.api.window.dragMove(deltaX, deltaY);
    lastMouseX.value = e.screenX;
    lastMouseY.value = e.screenY;
  }
};

const handleMouseUp = (e: MouseEvent) => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);

  // 如果没有进入拖拽状态，视为点击
  if (!isDragging.value) {
    emit('expand', e.screenX, e.screenY);
  }

  isDragging.value = false;
};
</script>

<template>
  <div class="bubble-wrapper">
    <div
      class="bubble"
      @mousedown.prevent="handleMouseDown"
      title="按住拖拽移动，点击展开任务列表"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.bubble-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
}

.bubble {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  /* 干净的纯白底色 + 极淡蓝灰渐变，任何背景下都可见 */
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #f8f9fc 60%,
    #f0f2f7 100%
  );

  /* 蓝色主色调阴影 + 深色辅助阴影，确保在深浅背景下都有轮廓 */
  box-shadow:
    0 0 0 1px rgba(0, 122, 255, 0.18),
    0 6px 20px rgba(0, 122, 255, 0.12),
    0 3px 10px rgba(0, 0, 0, 0.08);

  color: #007aff;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
  -webkit-app-region: no-drag;
}

.bubble:hover {
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #f5f7ff 60%,
    #ecefff 100%
  );
  box-shadow:
    0 0 0 1.5px rgba(0, 122, 255, 0.25),
    0 10px 28px rgba(0, 122, 255, 0.18),
    0 4px 12px rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
  color: #0051d4;
}

.bubble:active {
  transform: scale(0.95);
  transition: transform 0.08s ease;
}
</style>
