import type { User } from '../types';
import type { IUserRepository } from './interfaces';
import { getFromStorage, setToStorage, deepCopy } from './storage';
import { mockUsers } from '../utils/mockData';

const USERS_STORAGE_KEY = 'ResponScore_Users';

/**
 * User Repository 実装
 * localStorage をバックエンドとする
 * 将来的に API に置き換え可能
 */
export class UserRepository implements IUserRepository {
  constructor() {
    this.initializeIfNeeded();
  }

  /**
   * 初回初期化
   */
  private initializeIfNeeded(): void {
    const existing = getFromStorage<User[]>(USERS_STORAGE_KEY);
    if (!existing || existing.length === 0) {
      setToStorage(USERS_STORAGE_KEY, mockUsers);
    }
  }

  /**
   * すべてのユーザーを取得
   */
  async findAll(): Promise<User[]> {
    const users = getFromStorage<User[]>(USERS_STORAGE_KEY) || [];
    return deepCopy(users);
  }

  /**
   * IDでユーザーを取得
   */
  async findById(id: string): Promise<User | null> {
    const users = getFromStorage<User[]>(USERS_STORAGE_KEY) || [];
    const user = users.find((u) => u.id === id);
    return user ? deepCopy(user) : null;
  }

  /**
   * ユーザーを作成
   */
  async create(entity: User): Promise<User> {
    const users = getFromStorage<User[]>(USERS_STORAGE_KEY) || [];
    const newUser = deepCopy(entity);
    users.push(newUser);
    setToStorage(USERS_STORAGE_KEY, users);
    return deepCopy(newUser);
  }

  /**
   * ユーザーを更新
   */
  async update(id: string, partial: Partial<User>): Promise<User | null> {
    const users = getFromStorage<User[]>(USERS_STORAGE_KEY) || [];
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return null;
    }

    const updated = { ...users[index], ...partial };
    users[index] = updated;
    setToStorage(USERS_STORAGE_KEY, users);

    return deepCopy(updated);
  }

  /**
   * ユーザーを削除
   */
  async delete(id: string): Promise<boolean> {
    const users = getFromStorage<User[]>(USERS_STORAGE_KEY) || [];
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return false;
    }

    users.splice(index, 1);
    setToStorage(USERS_STORAGE_KEY, users);

    return true;
  }

  /**
   * ユーザー名でユーザーを検索
   */
  async findByName(name: string): Promise<User | null> {
    const users = getFromStorage<User[]>(USERS_STORAGE_KEY) || [];
    const user = users.find((u) => u.name === name);
    return user ? deepCopy(user) : null;
  }
}

// シングルトンインスタンス
export const userRepository = new UserRepository();
