import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

// JSON 文件存储层
// 设计原则：单例、原子写入、防崩溃
export class DataStore<T> {
  private cache: T;
  private filePath: string;
  private writeTimer: NodeJS.Timeout | null = null;
  private initialized = false;

  constructor(private fileName: string, private defaultValue: T) {
    this.cache = defaultValue;
    this.filePath = '';
  }

  // 延迟初始化，确保 app 已 ready
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    const dataDir = path.join(app.getPath('userData'), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, this.fileName);
    this.cache = this.readFromFile() ?? this.defaultValue;
  }

  getData(): T {
    return this.cache;
  }

  update(mutator: (draft: T) => void): void {
    mutator(this.cache);
    this.scheduleWrite();
  }

  private readFromFile(): T | null {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('读取数据文件失败:', err);
    }
    return null;
  }

  private scheduleWrite(): void {
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => this.writeToFile(), 300);
  }

  private async writeToFile(): Promise<void> {
    try {
      const tmp = this.filePath + '.tmp';
      await fs.promises.writeFile(tmp, JSON.stringify(this.cache, null, 2));
      await fs.promises.rename(tmp, this.filePath);
    } catch (err) {
      console.error('写入数据文件失败:', err);
    }
  }
}
