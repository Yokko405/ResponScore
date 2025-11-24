import type { IReactionRepository } from '../repositories';
import type { Reaction } from '../types';
import type { ReactionDTO, ReactionResultDTO } from './dtos';
import { reactionRepository } from '../repositories';
import { taskRepository } from '../repositories/taskRepository';
import { userRepository } from '../repositories/userRepository';
import { scoreRepository } from '../repositories/scoreRepository';
import { generateScoreRecordsForReaction, createScoreRecord } from '../utils/scoreCalculator';
import { generateId } from '../utils/idGenerator';
import { getCurrentISODateTime } from '../utils/dateUtils';
import { taskService } from './taskService';

/**
 * Reaction Service
 * リアクション管理と関連するスコア付与処理
 */
export class ReactionService {
  private reactionRepo: IReactionRepository;

  constructor(reactionRepo: IReactionRepository = reactionRepository) {
    this.reactionRepo = reactionRepo;
  }

  /**
   * すべてのリアクションを取得（DTO形式）
   */
  async getAllReactions(): Promise<ReactionDTO[]> {
    const reactions = await this.reactionRepo.findAll();
    return Promise.all(reactions.map((reaction) => this.enrichReactionWithDTO(reaction)));
  }

  /**
   * IDでリアクションを取得（DTO形式）
   */
  async getReactionById(id: string): Promise<ReactionDTO | null> {
    const reaction = await this.reactionRepo.findById(id);
    if (!reaction) return null;
    return this.enrichReactionWithDTO(reaction);
  }

  /**
   * taskId でリアクションを取得（DTO形式）
   */
  async getReactionsByTaskId(taskId: string): Promise<ReactionDTO[]> {
    const reactions = await this.reactionRepo.findByTaskId(taskId);
    return Promise.all(reactions.map((reaction) => this.enrichReactionWithDTO(reaction)));
  }

  /**
   * userId でリアクションを取得（DTO形式）
   */
  async getReactionsByUserId(userId: string): Promise<ReactionDTO[]> {
    const reactions = await this.reactionRepo.findByUserId(userId);
    return Promise.all(reactions.map((reaction) => this.enrichReactionWithDTO(reaction)));
  }

  /**
   * リアクションを追加し、スコア付与処理を実行（イベントドリブン）
   * @param taskId - タスクID
   * @param userId - ユーザーID
   * @param type - リアクションタイプ
   * @returns リアクション追加結果（スコア付与を含む）
   */
  async addReaction(
    taskId: string,
    userId: string,
    type: Reaction['type']
  ): Promise<ReactionResultDTO> {
    // タスクとユーザーが存在するか確認
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // 既存のリアクションをチェック
    const existingReactions = await this.reactionRepo.findByTaskAndUser(taskId, userId);
    
    // 既存のリアクションがある場合は削除（上書き方式）
    if (existingReactions.length > 0) {
      for (const existingReaction of existingReactions) {
        await this.reactionRepo.delete(existingReaction.id);
      }
    }

    // 初回リアクションかどうか（スコア付与判定用）
    const isFirstReaction = existingReactions.length === 0;

    // 新しいリアクションを作成
    const newReaction: Reaction = {
      id: generateId(),
      taskId,
      userId,
      type,
      createdAt: getCurrentISODateTime(),
      isFirstReactionForTask: isFirstReaction,
    };

    const createdReaction = await this.reactionRepo.create(newReaction);

    // タスクステータスを自動更新
    let updatedTask = task;
    if (type === 'ack' && task.status === 'unread') {
      // 👍 ack: 未読 → 対応中
      updatedTask = (await taskRepository.update(taskId, { status: 'in_progress' })) || task;
    } else if (type === 'later' && (task.status === 'unread' || task.status === 'in_progress')) {
      // 🟡 later: 未読/対応中 → 対応中 (既に対応中なら変化なし)
      updatedTask = (await taskRepository.update(taskId, { status: 'in_progress' })) || task;
    } else if (type === 'working' && task.status === 'unread') {
      // 🔴 working: 未読 → 対応中
      updatedTask = (await taskRepository.update(taskId, { status: 'in_progress' })) || task;
    } else if (type === 'done') {
      // ✔ done: (任意) → 完了
      updatedTask = (await taskRepository.update(taskId, { status: 'done' })) || task;
    }

    // スコア付与処理（イベントドリブン）
    const scoresAdded = await this.processScoreForReaction(createdReaction, task);

    // DTO形式で返す
    const reactionDTO = await this.enrichReactionWithDTO(createdReaction);
    const taskDTO = await taskService.getTaskById(taskId);

    return {
      reaction: reactionDTO,
      scoresAdded,
      taskUpdated: taskDTO || (await this.enrichTaskWithTaskDTO(updatedTask)),
    };
  }

  /**
   * リアクション削除
   */
  async deleteReaction(id: string): Promise<boolean> {
    return this.reactionRepo.delete(id);
  }

  /**
   * リアクションに基づくスコア付与処理（イベントハンドラ）
   * @private
   */
  private async processScoreForReaction(
    reaction: Reaction,
    task: any
  ): Promise<Array<any>> {
    // スコアリング純粋関数で必要なスコアを計算
    const scoreDataArray = generateScoreRecordsForReaction(task, reaction);

    // スコア記録を作成して保存
    const createdScores = await Promise.all(
      scoreDataArray.map(async (scoreData) => {
        const scoreRecord = createScoreRecord(scoreData);
        const created = await scoreRepository.create(scoreRecord);
        return this.enrichScoreWithDTO(created);
      })
    );

    return createdScores;
  }

  /**
   * リアクションをDTOに変換
   */
  private async enrichReactionWithDTO(reaction: Reaction): Promise<ReactionDTO> {
    const user = await userRepository.findById(reaction.userId);
    const task = await taskRepository.findById(reaction.taskId);

    return {
      ...reaction,
      userName: user?.name || '不明なユーザー',
      taskTitle: task?.title || '不明なタスク',
    };
  }

  /**
   * スコアレコードをDTOに変換（内部用）
   */
  private async enrichScoreWithDTO(score: any) {
    const user = await userRepository.findById(score.userId);
    const task = await taskRepository.findById(score.taskId);

    return {
      ...score,
      userName: user?.name || '不明なユーザー',
      taskTitle: task?.title || '不明なタスク',
    };
  }

  /**
   * タスクをDTOに変換（内部用）
   */
  private async enrichTaskWithTaskDTO(task: any) {
    const assigner = await userRepository.findById(task.assignerId);
    const assignee = await userRepository.findById(task.assigneeId);
    const reactions = await this.reactionRepo.findByTaskId(task.id);

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
export const reactionService = new ReactionService();
