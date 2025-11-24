import type { IScoreRepository } from '../repositories';
import type { ScoreRecordDTO, RankingStatsDTO } from './dtos';
import { scoreRepository } from '../repositories';
import { taskRepository } from '../repositories/taskRepository';
import { reactionRepository } from '../repositories/reactionRepository';
import { userRepository } from '../repositories/userRepository';
import { calculateUserAverageFirstReactionTime } from '../utils/scoreCalculator';
import { getPreviousWeekStart, getPreviousWeekEnd } from '../utils/dateUtils';

/**
 * Score Service
 * スコア記録の管理とランキング集計
 */
export class ScoreService {
  private scoreRepo: IScoreRepository;

  constructor(scoreRepo: IScoreRepository = scoreRepository) {
    this.scoreRepo = scoreRepo;
  }

  /**
   * すべてのスコア記録を取得（DTO形式）
   */
  async getAllScores(): Promise<ScoreRecordDTO[]> {
    const scores = await this.scoreRepo.findAll();
    return Promise.all(scores.map((score) => this.enrichScoreWithDTO(score)));
  }

  /**
   * ユーザーのスコア記録を取得（DTO形式）
   */
  async getScoresByUserId(userId: string): Promise<ScoreRecordDTO[]> {
    const scores = await this.scoreRepo.findByUserId(userId);
    return Promise.all(scores.map((score) => this.enrichScoreWithDTO(score)));
  }

  /**
   * タスクのスコア記録を取得（DTO形式）
   */
  async getScoresByTaskId(taskId: string): Promise<ScoreRecordDTO[]> {
    const scores = await this.scoreRepo.findByTaskId(taskId);
    return Promise.all(scores.map((score) => this.enrichScoreWithDTO(score)));
  }

  /**
   * ユーザーの合計スコアを取得
   */
  async getUserTotalScore(userId: string): Promise<number> {
    return this.scoreRepo.sumByUserId(userId);
  }

  /**
   * 全期間ランキングを取得（DTO形式）
   */
  async getOverallRanking(): Promise<RankingStatsDTO[]> {
    const users = await userRepository.findAll();
    const scoresByUser = await this.scoreRepo.getTotalScoreByUser();
    const tasks = await taskRepository.findAll();
    const reactions = await reactionRepository.findAll();

    const ranking: RankingStatsDTO[] = scoresByUser.map((scoreData, index) => {
      const user = users.find((u) => u.id === scoreData.userId);
      const averageFirstReactionTime = calculateUserAverageFirstReactionTime(
        scoreData.userId,
        tasks,
        reactions
      );

      return {
        userId: scoreData.userId,
        userName: user?.name || '不明なユーザー',
        totalScore: scoreData.total,
        previousWeekScore: 0, // TODO: 先週のスコアを計算
        scoreChangePercent: 0, // TODO: 変動率を計算
        averageFirstReactionTimeMinutes: averageFirstReactionTime,
        monthlyRank: index < 3 ? ((index + 1) as 1 | 2 | 3) : undefined,
      };
    });

    return ranking;
  }

  /**
   * 月間トップ3を取得
   */
  async getMonthlyTop3(): Promise<RankingStatsDTO[]> {
    const ranking = await this.getOverallRanking();
    return ranking.slice(0, 3).map((item, index) => ({
      ...item,
      monthlyRank: (index + 1) as 1 | 2 | 3,
    }));
  }

  /**
   * 先週比較データを計算
   * @private
   */
  private async calculatePreviousWeekScore(userId: string): Promise<number> {
    const scores = await this.scoreRepo.findByUserId(userId);
    const weekStart = getPreviousWeekStart();
    const weekEnd = getPreviousWeekEnd();

    const weekScores = scores.filter((score) => {
      const scoreDate = new Date(score.createdAt);
      return scoreDate >= weekStart && scoreDate <= weekEnd;
    });

    return weekScores.reduce((sum, score) => sum + score.value, 0);
  }

  /**
   * ユーザーのランキング統計を取得
   */
  async getUserRankingStats(userId: string): Promise<RankingStatsDTO | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    const totalScore = await this.scoreRepo.sumByUserId(userId);
    const previousWeekScore = await this.calculatePreviousWeekScore(userId);
    const scoreChangePercent =
      previousWeekScore === 0 ? 0 : Math.round(((totalScore - previousWeekScore) / previousWeekScore) * 100);

    const tasks = await taskRepository.findAll();
    const reactions = await reactionRepository.findAll();
    const averageFirstReactionTime = calculateUserAverageFirstReactionTime(userId, tasks, reactions);

    // 月間ランキングを取得して順位を確認
    const monthlyRanking = await this.getMonthlyTop3();
    const monthlyRank = monthlyRanking.find((r) => r.userId === userId)?.monthlyRank;

    return {
      userId,
      userName: user.name,
      totalScore,
      previousWeekScore,
      scoreChangePercent,
      averageFirstReactionTimeMinutes: averageFirstReactionTime,
      monthlyRank,
    };
  }

  /**
   * スコア記録をDTOに変換
   */
  private async enrichScoreWithDTO(score: any): Promise<ScoreRecordDTO> {
    const user = await userRepository.findById(score.userId);
    const task = await taskRepository.findById(score.taskId);

    return {
      ...score,
      userName: user?.name || '不明なユーザー',
      taskTitle: task?.title || '不明なタスク',
    };
  }
}

// シングルトンインスタンス
export const scoreService = new ScoreService();
