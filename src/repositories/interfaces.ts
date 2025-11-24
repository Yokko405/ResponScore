import type { Task, Reaction, ScoreRecord, User } from '../types';

/**
 * 汎用 CRUD Repository インターフェース
 * 将来的に Kintone/Supabase 等への切り替えを容易にする
 */
export interface IRepository<T> {
  /**
   * すべてのエンティティを取得
   */
  findAll(): Promise<T[]>;

  /**
   * IDでエンティティを取得
   * @returns 見つかった場合はエンティティ、見つからない場合はnull
   */
  findById(id: string): Promise<T | null>;

  /**
   * エンティティを作成
   * @param entity - 作成するエンティティ
   */
  create(entity: T): Promise<T>;

  /**
   * エンティティを更新
   * @param id - 更新対象のID
   * @param partial - 更新内容（部分更新）
   */
  update(id: string, partial: Partial<T>): Promise<T | null>;

  /**
   * エンティティを削除
   * @param id - 削除対象のID
   */
  delete(id: string): Promise<boolean>;
}

/**
 * Task 専用 Repository インターフェース
 */
export interface ITaskRepository extends IRepository<Task> {
  /**
   * assigneeId で Task を検索
   */
  findByAssigneeId(assigneeId: string): Promise<Task[]>;

  /**
   * assignerId で Task を検索
   */
  findByAssignerId(assignerId: string): Promise<Task[]>;

  /**
   * ステータスで Task を検索
   */
  findByStatus(status: Task['status']): Promise<Task[]>;
}

/**
 * Reaction 専用 Repository インターフェース
 */
export interface IReactionRepository extends IRepository<Reaction> {
  /**
   * taskId でリアクションを検索
   */
  findByTaskId(taskId: string): Promise<Reaction[]>;

  /**
   * userId でリアクションを検索
   */
  findByUserId(userId: string): Promise<Reaction[]>;

  /**
   * 特定タスクの最初のリアクションを取得
   * @returns 見つかった場合はリアクション、見つからない場合はnull
   */
  findFirstReactionByTaskId(taskId: string): Promise<Reaction | null>;

  /**
   * 特定タスクで特定ユーザーのリアクションを検索
   */
  findByTaskAndUser(taskId: string, userId: string): Promise<Reaction[]>;
}

/**
 * ScoreRecord 専用 Repository インターフェース
 */
export interface IScoreRepository extends IRepository<ScoreRecord> {
  /**
   * userId でスコア記録を検索
   */
  findByUserId(userId: string): Promise<ScoreRecord[]>;

  /**
   * taskId でスコア記録を検索
   */
  findByTaskId(taskId: string): Promise<ScoreRecord[]>;

  /**
   * userId のスコア記録合計を計算
   */
  sumByUserId(userId: string): Promise<number>;

  /**
   * ユーザーごとのスコア合計を集計
   * @returns { userId, total } の配列（降順）
   */
  getTotalScoreByUser(): Promise<Array<{ userId: string; total: number }>>;
}

/**
 * User 専用 Repository インターフェース
 */
export interface IUserRepository extends IRepository<User> {
  /**
   * ユーザー名でユーザーを検索
   */
  findByName(name: string): Promise<User | null>;
}
