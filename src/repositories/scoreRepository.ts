import type { ScoreRecord } from '../types';
import type { IScoreRepository } from './interfaces';
import { getFromStorage, setToStorage, deepCopy } from './storage';
import { mockScoreRecords } from '../utils/mockData';

const SCORES_STORAGE_KEY = 'ResponScore_Scores';

/**
 * ScoreRecord Repository 実装
 * localStorage をバックエンドとする
 * 将来的に API に置き換え可能
 */
export class ScoreRepository implements IScoreRepository {
  constructor() {
    this.initializeIfNeeded();
  }

  /**
   * 初回初期化
   */
  private initializeIfNeeded(): void {
    const existing = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY);
    if (!existing || existing.length === 0) {
      setToStorage(SCORES_STORAGE_KEY, mockScoreRecords);
    }
  }

  /**
   * すべてのスコア記録を取得
   */
  async findAll(): Promise<ScoreRecord[]> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    return deepCopy(scores);
  }

  /**
   * IDでスコア記録を取得
   */
  async findById(id: string): Promise<ScoreRecord | null> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    const score = scores.find((s) => s.id === id);
    return score ? deepCopy(score) : null;
  }

  /**
   * スコア記録を作成
   */
  async create(entity: ScoreRecord): Promise<ScoreRecord> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    const newScore = deepCopy(entity);
    scores.push(newScore);
    setToStorage(SCORES_STORAGE_KEY, scores);
    return deepCopy(newScore);
  }

  /**
   * スコア記録を更新
   */
  async update(id: string, partial: Partial<ScoreRecord>): Promise<ScoreRecord | null> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    const index = scores.findIndex((s) => s.id === id);

    if (index === -1) {
      return null;
    }

    const updated = { ...scores[index], ...partial };
    scores[index] = updated;
    setToStorage(SCORES_STORAGE_KEY, scores);

    return deepCopy(updated);
  }

  /**
   * スコア記録を削除
   */
  async delete(id: string): Promise<boolean> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    const index = scores.findIndex((s) => s.id === id);

    if (index === -1) {
      return false;
    }

    scores.splice(index, 1);
    setToStorage(SCORES_STORAGE_KEY, scores);

    return true;
  }

  /**
   * userId でスコア記録を検索
   */
  async findByUserId(userId: string): Promise<ScoreRecord[]> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    const filtered = scores.filter((s) => s.userId === userId);
    return deepCopy(filtered);
  }

  /**
   * taskId でスコア記録を検索
   */
  async findByTaskId(taskId: string): Promise<ScoreRecord[]> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    const filtered = scores.filter((s) => s.taskId === taskId);
    return deepCopy(filtered);
  }

  /**
   * userId のスコア記録合計を計算
   */
  async sumByUserId(userId: string): Promise<number> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];
    const userScores = scores.filter((s) => s.userId === userId);
    return userScores.reduce((sum, s) => sum + s.value, 0);
  }

  /**
   * ユーザーごとのスコア合計を集計（降順）
   */
  async getTotalScoreByUser(): Promise<Array<{ userId: string; total: number }>> {
    const scores = getFromStorage<ScoreRecord[]>(SCORES_STORAGE_KEY) || [];

    // userId でグループ化し、合計を計算
    const totals: Record<string, number> = {};
    for (const score of scores) {
      totals[score.userId] = (totals[score.userId] || 0) + score.value;
    }

    // 配列に変換して降順でソート
    const result = Object.entries(totals)
      .map(([userId, total]) => ({ userId, total }))
      .sort((a, b) => b.total - a.total);

    return result;
  }
}

// シングルトンインスタンス
export const scoreRepository = new ScoreRepository();
