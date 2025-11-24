import type { Task } from '../types';
import type { ITaskRepository } from './interfaces';
import { getFromStorage, setToStorage, deepCopy } from './storage';
import { mockTasks, migrateTaskData } from '../utils/mockData';

const TASKS_STORAGE_KEY = 'ResponScore_Tasks';

/**
 * Task Repository 実装
 * localStorage をバックエンドとする
 * 将来的に API に置き換え可能
 */
export class TaskRepository implements ITaskRepository {
  constructor() {
    // 初回のみモックデータで初期化
    this.initializeIfNeeded();
  }

  /**
   * 初回初期化（マイグレーション処理含む）
   */
  private initializeIfNeeded(): void {
    const existing = getFromStorage<any[]>(TASKS_STORAGE_KEY);
    if (!existing || existing.length === 0) {
      setToStorage(TASKS_STORAGE_KEY, mockTasks);
    } else {
      // 既存データをマイグレーション
      const migrated = migrateTaskData(existing);
      setToStorage(TASKS_STORAGE_KEY, migrated);
    }
  }

  /**
   * すべてのタスクを取得
   */
  async findAll(): Promise<Task[]> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    return deepCopy(tasks);
  }

  /**
   * IDでタスクを取得
   */
  async findById(id: string): Promise<Task | null> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    const task = tasks.find((t) => t.id === id);
    return task ? deepCopy(task) : null;
  }

  /**
   * タスクを作成
   */
  async create(entity: Task): Promise<Task> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    const newTask = deepCopy(entity);
    tasks.push(newTask);
    setToStorage(TASKS_STORAGE_KEY, tasks);
    return deepCopy(newTask);
  }

  /**
   * タスクを更新
   */
  async update(id: string, partial: Partial<Task>): Promise<Task | null> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    const updated = { ...tasks[index], ...partial };
    tasks[index] = updated;
    setToStorage(TASKS_STORAGE_KEY, tasks);

    return deepCopy(updated);
  }

  /**
   * タスクを削除
   */
  async delete(id: string): Promise<boolean> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return false;
    }

    tasks.splice(index, 1);
    setToStorage(TASKS_STORAGE_KEY, tasks);

    return true;
  }

  /**
   * assigneeIds でタスクを検索（複数担当者対応）
   */
  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    const filtered = tasks.filter((t) => 
      t.assigneeIds.includes(assigneeId) || t.assigneeIds.includes('all')
    );
    return deepCopy(filtered);
  }

  /**
   * assignerId でタスクを検索
   */
  async findByAssignerId(assignerId: string): Promise<Task[]> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    const filtered = tasks.filter((t) => t.assignerId === assignerId);
    return deepCopy(filtered);
  }

  /**
   * ステータスでタスクを検索
   */
  async findByStatus(status: Task['status']): Promise<Task[]> {
    const tasks = getFromStorage<Task[]>(TASKS_STORAGE_KEY) || [];
    const filtered = tasks.filter((t) => t.status === status);
    return deepCopy(filtered);
  }
}

// シングルトンインスタンス
export const taskRepository = new TaskRepository();
