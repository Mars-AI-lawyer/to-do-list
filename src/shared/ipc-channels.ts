// IPC 通道名称枚举
export const IPC = {
  // 任务
  TASK_LIST: 'task:list',
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_TOGGLE: 'task:toggle',
  TASK_PIN: 'task:pin',

  // 窗口
  WINDOW_EXPAND: 'window:expand',
  WINDOW_COLLAPSE: 'window:collapse',
  WINDOW_TOGGLE: 'window:toggle',
  WINDOW_DRAG_MOVE: 'window:drag-move',

  // 主题
  THEME_CHANGED: 'theme:changed',
} as const;
