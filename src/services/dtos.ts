import type { Task, Reaction, ScoreRecord, User } from '../types';

/**
 * Task DTO（UIが扱いやすい形に整形）
 */
export interface TaskDTO extends Task {
  assignerName: string;
  assigneeName: string;
  reactionCount: number;
  latestReactionTime?: string;
}

/**
 * Reaction DTO
 */
export interface ReactionDTO extends Reaction {
  userName: string;
  taskTitle: string;
}

/**
 * ScoreRecord DTO
 */
export interface ScoreRecordDTO extends ScoreRecord {
  userName: string;
  taskTitle: string;
}

/**
 * User DTO
 */
export interface UserDTO extends User {
  totalScore: number;
  averageFirstReactionTimeMinutes: number;
  reactionCount: number;
  completedTaskCount: number;
}

/**
 * ランキング統計 DTO
 */
export interface RankingStatsDTO {
  userId: string;
  userName: string;
  totalScore: number;
  previousWeekScore: number;
  scoreChangePercent: number;
  averageFirstReactionTimeMinutes: number;
  monthlyRank?: 1 | 2 | 3;
}

/**
 * ダッシュボード概要 DTO
 */
export interface DashboardOverviewDTO {
  currentUser: UserDTO;
  assignedTasks: TaskDTO[];
  createdTasks: TaskDTO[];
  rankingTop3: RankingStatsDTO[];
  totalUsers: number;
  totalTasks: number;
}

/**
 * リアクション追加の結果 DTO
 */
export interface ReactionResultDTO {
  reaction: ReactionDTO;
  scoresAdded: ScoreRecordDTO[];
  taskUpdated: TaskDTO;
}
