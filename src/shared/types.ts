// 任务
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
}
