import type { Task, Reaction, ScoreRecord } from '../types';
import { calculateTimeDiffMinutes } from './dateUtils';
import { generateId } from './idGenerator';

/**
 * 初回リアクション時のスコアを計算（純粋関数）
 * 指示作成時刻から初回リアクションまでの時間でスコアを決定
 * @param taskCreatedAt - タスク作成時刻（ISO形式）
 * @param reactionCreatedAt - リアクション時刻（ISO形式）
 * @returns スコア値（-5 ～ +5）
 */
export function calcReactionScore(taskCreatedAt: string, reactionCreatedAt: string): number {
  const timeDiffMinutes = calculateTimeDiffMinutes(
    new Date(taskCreatedAt),
    new Date(reactionCreatedAt)
  );

  // スコアリングルール
  if (timeDiffMinutes <= 1) return 5; // 1分以内
  if (timeDiffMinutes <= 5) return 4; // 5分以内
  if (timeDiffMinutes <= 30) return 3; // 30分以内
  if (timeDiffMinutes <= 120) return 2; // 2時間以内
  if (timeDiffMinutes <= 1440) return 1; // 当日中（24時間以内）
  return -5; // 24時間以上リアクションなし
}

/**
 * 初回リアクション押下時のスコア記録を生成（純粋関数）
 * @param task - タスク
 * @param reaction - リアクション
 * @returns スコア記録（ID、createdAtは含まない）、初回でなければnull
 */
export function applyFirstReactionScore(
  task: Task,
  reaction: Reaction
): Omit<ScoreRecord, 'id' | 'createdAt'> | null {
  // 初回リアクションのみスコア対象
  if (!reaction.isFirstReactionForTask) {
    return null;
  }

  const score = calcReactionScore(task.createdAt, reaction.createdAt);

  return {
    userId: reaction.userId,
    taskId: task.id,
    value: score,
    reason: `初回リアクション (${reaction.type}) - ${score > 0 ? '+' : ''}${score}`,
  };
}

/**
 * 完了スタンプ（✔done）押下時のスコア記録を生成（純粋関数）
 * @param task - タスク
 * @param reaction - リアクション
 * @returns スコア記録（ID、createdAtは含まない）、doneでなければnull
 */
export function applyDoneScore(
  task: Task,
  reaction: Reaction
): Omit<ScoreRecord, 'id' | 'createdAt'> | null {
  // done スタンプのみボーナス対象
  if (reaction.type !== 'done') {
    return null;
  }

  const doneBonus = 3;

  return {
    userId: reaction.userId,
    taskId: task.id,
    value: doneBonus,
    reason: `完了ボーナス (+${doneBonus})`,
  };
}

/**
 * リアクション発生時のスコア記録を生成する関数
 * (初回リアクション or 完了スタンプ)
 * @param task - タスク
 * @param reaction - リアクション
 * @returns 生成すべきスコア記録の配列
 */
export function generateScoreRecordsForReaction(
  task: Task,
  reaction: Reaction
): Array<Omit<ScoreRecord, 'id' | 'createdAt'>> {
  const records: Array<Omit<ScoreRecord, 'id' | 'createdAt'>> = [];

  // 初回リアクションスコア
  const firstReactionScore = applyFirstReactionScore(task, reaction);
  if (firstReactionScore) {
    records.push(firstReactionScore);
  }

  // 完了ボーナス
  const doneScore = applyDoneScore(task, reaction);
  if (doneScore) {
    records.push(doneScore);
  }

  return records;
}

/**
 * スコア記録（DTO版）を生成
 * @param scoreData - スコアデータ（idなし）
 * @returns 完全なScoreRecord
 */
export function createScoreRecord(
  scoreData: Omit<ScoreRecord, 'id' | 'createdAt'>
): ScoreRecord {
  return {
    ...scoreData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * 平均初回リアクション時間を計算（分単位）
 * @param tasks - タスク配列
 * @param reactions - リアクション配列
 * @returns 平均値（分）、データなしの場合は0
 */
export function calculateAverageFirstReactionTime(
  tasks: Task[],
  reactions: Reaction[]
): number {
  const firstReactionTimes = tasks
    .map((task) => {
      const firstReaction = reactions
        .filter((r) => r.taskId === task.id && r.isFirstReactionForTask)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

      if (!firstReaction) return null;
      return calculateTimeDiffMinutes(
        new Date(task.createdAt),
        new Date(firstReaction.createdAt)
      );
    })
    .filter((time) => time !== null) as number[];

  if (firstReactionTimes.length === 0) return 0;
  return Math.round(
    (firstReactionTimes.reduce((a, b) => a + b, 0) / firstReactionTimes.length) * 10
  ) / 10; // 小数第1位まで
}

/**
 * ユーザーの平均初回リアクション時間を計算
 * @param userId - ユーザーID
 * @param tasks - タスク配列
 * @param reactions - リアクション配列
 * @returns 平均値（分）
 */
export function calculateUserAverageFirstReactionTime(
  userId: string,
  tasks: Task[],
  reactions: Reaction[]
): number {
  const userReactionTimes = tasks
    .filter((task) => task.assigneeId === userId) // ユーザーが割り当てられたタスク
    .map((task) => {
      const firstReaction = reactions
        .filter((r) => r.taskId === task.id && r.userId === userId && r.isFirstReactionForTask)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

      if (!firstReaction) return null;
      return calculateTimeDiffMinutes(
        new Date(task.createdAt),
        new Date(firstReaction.createdAt)
      );
    })
    .filter((time) => time !== null) as number[];

  if (userReactionTimes.length === 0) return 0;
  return Math.round(
    (userReactionTimes.reduce((a, b) => a + b, 0) / userReactionTimes.length) * 10
  ) / 10;
}
