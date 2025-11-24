import type { User, Task, Reaction, ScoreRecord } from '../types';

/**
 * ダミーユーザーデータ
 */
export const mockUsers: User[] = [
  { id: 'user1', name: '田中太郎' },
  { id: 'user2', name: '佐藤花子' },
  { id: 'user3', name: '鈴木次郎' },
  { id: 'user4', name: '伊藤美咲' },
  { id: 'user5', name: '渡辺健一' },
];

/**
 * ダミータスクデータ
 */
export const mockTasks: Task[] = [
  {
    id: 'task1',
    title: '11月請求書作成',
    detail: '11月分の全クライアント請求書を作成し、メール送付してください。',
    assignerId: 'user1',
    assigneeIds: ['user2'],
    createdAt: new Date(2025, 10, 19, 9, 0).toISOString(),
    deadline: new Date(2025, 10, 21).toISOString(),
    status: 'done',
  },
  {
    id: 'task2',
    title: '決算報告資料の確認',
    detail: '決算報告資料をレビューし、修正箇所をリストアップしてください。',
    assignerId: 'user1',
    assigneeIds: ['user3', 'user4'], // 複数担当者
    createdAt: new Date(2025, 10, 19, 10, 30).toISOString(),
    deadline: new Date(2025, 10, 22).toISOString(),
    status: 'in_progress',
  },
  {
    id: 'task3',
    title: 'クライアントA 月次報告',
    detail: 'クライアントAの月次税務報告書を提出します。',
    assignerId: 'user2',
    assigneeIds: ['user4'],
    createdAt: new Date(2025, 10, 19, 11, 15).toISOString(),
    deadline: new Date(2025, 10, 23).toISOString(),
    status: 'unread',
  },
  {
    id: 'task4',
    title: '源泉徴収票の確認',
    detail: '従業員の源泉徴収票を確認し、不備がないか チェックしてください。',
    assignerId: 'user3',
    assigneeIds: ['user5'],
    createdAt: new Date(2025, 10, 18, 14, 45).toISOString(),
    deadline: new Date(2025, 10, 20).toISOString(),
    status: 'done',
  },
  {
    id: 'task5',
    title: '給与計算システム更新確認',
    detail: '新しい給与計算システムが正常に動作しているか確認してください。',
    assignerId: 'user2',
    assigneeIds: ['all'], // 全員担当
    createdAt: new Date(2025, 10, 19, 13, 0).toISOString(),
    status: 'in_progress',
  },
];

/**
 * ダミーリアクションデータ
 */
export const mockReactions: Reaction[] = [
  // task1 のリアクション
  {
    id: 'reaction1',
    taskId: 'task1',
    userId: 'user2',
    type: 'ack',
    createdAt: new Date(2025, 10, 19, 9, 2).toISOString(), // 2分後
    isFirstReactionForTask: true,
  },
  {
    id: 'reaction2',
    taskId: 'task1',
    userId: 'user2',
    type: 'done',
    createdAt: new Date(2025, 10, 19, 14, 30).toISOString(),
    isFirstReactionForTask: false,
  },
  // task2 のリアクション
  {
    id: 'reaction3',
    taskId: 'task2',
    userId: 'user3',
    type: 'later',
    createdAt: new Date(2025, 10, 19, 10, 45).toISOString(), // 15分後
    isFirstReactionForTask: true,
  },
  // task3 のリアクション（なし）
  // task4 のリアクション
  {
    id: 'reaction4',
    taskId: 'task4',
    userId: 'user5',
    type: 'ack',
    createdAt: new Date(2025, 10, 18, 15, 0).toISOString(), // 15分後
    isFirstReactionForTask: true,
  },
  {
    id: 'reaction5',
    taskId: 'task4',
    userId: 'user5',
    type: 'done',
    createdAt: new Date(2025, 10, 18, 16, 20).toISOString(),
    isFirstReactionForTask: false,
  },
  // task5 のリアクション
  {
    id: 'reaction6',
    taskId: 'task5',
    userId: 'user1',
    type: 'working',
    createdAt: new Date(2025, 10, 19, 13, 5).toISOString(), // 5分後
    isFirstReactionForTask: true,
  },
];

/**
 * ダミースコア記録データ
 */
export const mockScoreRecords: ScoreRecord[] = [
  // task1 - user2
  {
    id: 'score1',
    userId: 'user2',
    taskId: 'task1',
    value: 5, // 2分以内
    reason: '初回リアクション (ack) - +5',
    createdAt: new Date(2025, 10, 19, 9, 2).toISOString(),
  },
  {
    id: 'score2',
    userId: 'user2',
    taskId: 'task1',
    value: 3,
    reason: '完了ボーナス (+3)',
    createdAt: new Date(2025, 10, 19, 14, 30).toISOString(),
  },
  // task2 - user3
  {
    id: 'score3',
    userId: 'user3',
    taskId: 'task2',
    value: 4, // 15分以内
    reason: '初回リアクション (later) - +4',
    createdAt: new Date(2025, 10, 19, 10, 45).toISOString(),
  },
  // task4 - user5
  {
    id: 'score4',
    userId: 'user5',
    taskId: 'task4',
    value: 4, // 15分以内
    reason: '初回リアクション (ack) - +4',
    createdAt: new Date(2025, 10, 18, 15, 0).toISOString(),
  },
  {
    id: 'score5',
    userId: 'user5',
    taskId: 'task4',
    value: 3,
    reason: '完了ボーナス (+3)',
    createdAt: new Date(2025, 10, 18, 16, 20).toISOString(),
  },
  // task5 - user1
  {
    id: 'score6',
    userId: 'user1',
    taskId: 'task5',
    value: 5, // 5分以内
    reason: '初回リアクション (working) - +5',
    createdAt: new Date(2025, 10, 19, 13, 5).toISOString(),
  },
];
