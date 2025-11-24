/**
 * ユーザー型
 */
export interface User {
  id: string;
  name: string;
}

/**
 * タスク型
 */
export interface Task {
  id: string;
  title: string;
  detail: string;
  assignerId: string;
  assigneeId: string;
  createdAt: string; // ISO形式
  deadline?: string; // ISO形式（任意）
  status: 'unread' | 'in_progress' | 'done';
}

/**
 * リアクション型
 */
export interface Reaction {
  id: string;
  taskId: string;
  userId: string;
  type: 'ack' | 'later' | 'working' | 'done';
  createdAt: string; // ISO形式
  isFirstReactionForTask: boolean;
}

/**
 * スコア記録型
 */
export interface ScoreRecord {
  id: string;
  userId: string;
  taskId: string;
  value: number;
  reason: string;
  createdAt: string; // ISO形式
}

/**
 * ランキング用の統計型
 */
export interface UserRankStats {
  userId: string;
  userName: string;
  totalScore: number;
  previousWeekScore: number;
  scoreChangePercent: number;
  averageFirstReactionTimeMinutes: number;
  monthlyRank?: 1 | 2 | 3; // トップ3の場合のみ
}

/**
 * スコア推移型
 */
export interface ScoreTimeSeries {
  week: string; // "Week 1", "Week 2" など
  score: number;
}

/**
 * ユーザーのスコア履歴型
 */
export interface UserScoreHistory {
  userId: string;
  userName: string;
  timeSeries: ScoreTimeSeries[];
}
