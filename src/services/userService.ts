import type { IUserRepository } from '../repositories';
import type { UserDTO } from './dtos';
import { userRepository } from '../repositories';
import { calculateUserAverageFirstReactionTime } from '../utils/scoreCalculator';
import { taskRepository } from '../repositories/taskRepository';
import { reactionRepository } from '../repositories/reactionRepository';
import { scoreRepository } from '../repositories/scoreRepository';

/**
 * User Service
 * ユーザー情報とスコア統計を管理
 */
export class UserService {
  private userRepo: IUserRepository;

  constructor(userRepo: IUserRepository = userRepository) {
    this.userRepo = userRepo;
  }

  /**
   * すべてのユーザーを取得（DTO形式）
   */
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.userRepo.findAll();
    const tasks = await taskRepository.findAll();
    const reactions = await reactionRepository.findAll();
    const scoresByUser = await scoreRepository.getTotalScoreByUser();

    return Promise.all(
      users.map(async (user) => {
        const totalScore = scoresByUser.find((s) => s.userId === user.id)?.total || 0;
        const averageFirstReactionTime = calculateUserAverageFirstReactionTime(
          user.id,
          tasks,
          reactions
        );
        const userReactions = reactions.filter((r) => r.userId === user.id);
        const completedTasks = reactions.filter((r) => r.userId === user.id && r.type === 'done');

        return {
          ...user,
          totalScore,
          averageFirstReactionTimeMinutes: averageFirstReactionTime,
          reactionCount: userReactions.length,
          completedTaskCount: completedTasks.length,
        };
      })
    );
  }

  /**
   * 特定ユーザーの詳細情報を取得（DTO形式）
   */
  async getUserById(userId: string): Promise<UserDTO | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;

    const tasks = await taskRepository.findAll();
    const reactions = await reactionRepository.findAll();
    const scoresByUser = await scoreRepository.getTotalScoreByUser();

    const totalScore = scoresByUser.find((s) => s.userId === user.id)?.total || 0;
    const averageFirstReactionTime = calculateUserAverageFirstReactionTime(
      user.id,
      tasks,
      reactions
    );
    const userReactions = reactions.filter((r) => r.userId === user.id);
    const completedTasks = reactions.filter((r) => r.userId === user.id && r.type === 'done');

    return {
      ...user,
      totalScore,
      averageFirstReactionTimeMinutes: averageFirstReactionTime,
      reactionCount: userReactions.length,
      completedTaskCount: completedTasks.length,
    };
  }

  /**
   * ユーザー名でユーザーを検索
   */
  async findUserByName(name: string): Promise<UserDTO | null> {
    const user = await this.userRepo.findByName(name);
    if (!user) return null;

    return this.getUserById(user.id);
  }

  /**
   * 新規ユーザーを作成
   */
  async createUser(name: string): Promise<UserDTO> {
    const newUser = await this.userRepo.create({
      id: `user_${Date.now()}`,
      name,
    });

    return {
      ...newUser,
      totalScore: 0,
      averageFirstReactionTimeMinutes: 0,
      reactionCount: 0,
      completedTaskCount: 0,
    };
  }
}

// シングルトンインスタンス
export const userService = new UserService();
