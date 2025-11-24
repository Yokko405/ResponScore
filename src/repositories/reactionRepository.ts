import type { Reaction } from '../types';
import type { IReactionRepository } from './interfaces';
import { getFromStorage, setToStorage, deepCopy } from './storage';
import { mockReactions } from '../utils/mockData';

const REACTIONS_STORAGE_KEY = 'ResponScore_Reactions';

/**
 * Reaction Repository 実装
 * localStorage をバックエンドとする
 * 将来的に API に置き換え可能
 */
export class ReactionRepository implements IReactionRepository {
  constructor() {
    this.initializeIfNeeded();
  }

  /**
   * 初回初期化
   */
  private initializeIfNeeded(): void {
    const existing = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY);
    if (!existing || existing.length === 0) {
      setToStorage(REACTIONS_STORAGE_KEY, mockReactions);
    }
  }

  /**
   * すべてのリアクションを取得
   */
  async findAll(): Promise<Reaction[]> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    return deepCopy(reactions);
  }

  /**
   * IDでリアクションを取得
   */
  async findById(id: string): Promise<Reaction | null> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const reaction = reactions.find((r) => r.id === id);
    return reaction ? deepCopy(reaction) : null;
  }

  /**
   * リアクションを作成
   */
  async create(entity: Reaction): Promise<Reaction> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const newReaction = deepCopy(entity);
    reactions.push(newReaction);
    setToStorage(REACTIONS_STORAGE_KEY, reactions);
    return deepCopy(newReaction);
  }

  /**
   * リアクションを更新
   */
  async update(id: string, partial: Partial<Reaction>): Promise<Reaction | null> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const index = reactions.findIndex((r) => r.id === id);

    if (index === -1) {
      return null;
    }

    const updated = { ...reactions[index], ...partial };
    reactions[index] = updated;
    setToStorage(REACTIONS_STORAGE_KEY, reactions);

    return deepCopy(updated);
  }

  /**
   * リアクションを削除
   */
  async delete(id: string): Promise<boolean> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const index = reactions.findIndex((r) => r.id === id);

    if (index === -1) {
      return false;
    }

    reactions.splice(index, 1);
    setToStorage(REACTIONS_STORAGE_KEY, reactions);

    return true;
  }

  /**
   * taskId でリアクションを検索
   */
  async findByTaskId(taskId: string): Promise<Reaction[]> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const filtered = reactions.filter((r) => r.taskId === taskId);
    return deepCopy(filtered);
  }

  /**
   * userId でリアクションを検索
   */
  async findByUserId(userId: string): Promise<Reaction[]> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const filtered = reactions.filter((r) => r.userId === userId);
    return deepCopy(filtered);
  }

  /**
   * 特定タスクの最初のリアクションを取得（時刻が最も早いもの）
   */
  async findFirstReactionByTaskId(taskId: string): Promise<Reaction | null> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const taskReactions = reactions
      .filter((r) => r.taskId === taskId && r.isFirstReactionForTask)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return taskReactions.length > 0 ? deepCopy(taskReactions[0]) : null;
  }

  /**
   * 特定タスクで特定ユーザーのリアクションを検索
   */
  async findByTaskAndUser(taskId: string, userId: string): Promise<Reaction[]> {
    const reactions = getFromStorage<Reaction[]>(REACTIONS_STORAGE_KEY) || [];
    const filtered = reactions.filter((r) => r.taskId === taskId && r.userId === userId);
    return deepCopy(filtered);
  }
}

// シングルトンインスタンス
export const reactionRepository = new ReactionRepository();
