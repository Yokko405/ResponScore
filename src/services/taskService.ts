import type { ITaskRepository } from '../repositories';
import type { Task } from '../types';
import type { TaskDTO } from './dtos';
import { taskRepository } from '../repositories';
import { reactionRepository } from '../repositories/reactionRepository';
import { userRepository } from '../repositories/userRepository';
import { generateId } from '../utils/idGenerator';
import { getCurrentISODateTime } from '../utils/dateUtils';

/**
 * Task Service
 * タスク管理とタスク関連の集約ロジック
 */
export class TaskService {
  private taskRepo: ITaskRepository;

  constructor(taskRepo: ITaskRepository = taskRepository) {
    this.taskRepo = taskRepo;
  }

  /**
   * すべてのタスクを取得（DTO形式）
   */
  async getAllTasks(): Promise<TaskDTO[]> {
    const tasks = await this.taskRepo.findAll();
    return Promise.all(tasks.map((task) => this.enrichTaskWithDTO(task)));
  }

  /**
   * IDでタスクを取得（DTO形式）
   */
  async getTaskById(id: string): Promise<TaskDTO | null> {
    const task = await this.taskRepo.findById(id);
    if (!task) return null;
    return this.enrichTaskWithDTO(task);
  }

  /**
   * assigneeId でタスクを取得（DTO形式）
   */
  async getTasksByAssigneeId(assigneeId: string): Promise<TaskDTO[]> {
    const tasks = await this.taskRepo.findByAssigneeId(assigneeId);
    return Promise.all(tasks.map((task) => this.enrichTaskWithDTO(task)));
  }

  /**
   * assignerId でタスクを取得（DTO形式）
   */
  async getTasksByAssignerId(assignerId: string): Promise<TaskDTO[]> {
    const tasks = await this.taskRepo.findByAssignerId(assignerId);
    return Promise.all(tasks.map((task) => this.enrichTaskWithDTO(task)));
  }

  /**
   * ステータスでタスクを取得（DTO形式）
   */
  async getTasksByStatus(status: Task['status']): Promise<TaskDTO[]> {
    const tasks = await this.taskRepo.findByStatus(status);
    return Promise.all(tasks.map((task) => this.enrichTaskWithDTO(task)));
  }

  /**
   * 新規タスクを作成
   */
  async createTask(
    title: string,
    detail: string,
    assignerId: string,
    assigneeId: string,
    deadline?: string
  ): Promise<TaskDTO> {
    const newTask: Task = {
      id: generateId(),
      title,
      detail,
      assignerId,
      assigneeId,
      createdAt: getCurrentISODateTime(),
      deadline,
      status: 'unread',
    };

    const created = await this.taskRepo.create(newTask);
    return this.enrichTaskWithDTO(created);
  }

  /**
   * タスクのステータスを更新
   */
  async updateTaskStatus(id: string, status: Task['status']): Promise<TaskDTO | null> {
    const updated = await this.taskRepo.update(id, { status });
    if (!updated) return null;
    return this.enrichTaskWithDTO(updated);
  }

  /**
   * タスクを削除
   */
  async deleteTask(id: string): Promise<boolean> {
    return this.taskRepo.delete(id);
  }

  /**
   * タスクをDTOに変換（ユーザー名などを付加）
   */
  private async enrichTaskWithDTO(task: Task): Promise<TaskDTO> {
    const assigner = await userRepository.findById(task.assignerId);
    const assignee = await userRepository.findById(task.assigneeId);
    const reactions = await reactionRepository.findByTaskId(task.id);

    const latestReaction = reactions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return {
      ...task,
      assignerName: assigner?.name || '不明なユーザー',
      assigneeName: assignee?.name || '不明なユーザー',
      reactionCount: reactions.length,
      latestReactionTime: latestReaction?.createdAt,
    };
  }
}

// シングルトンインスタンス
export const taskService = new TaskService();
