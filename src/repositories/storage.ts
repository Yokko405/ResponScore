/**
 * localStorage への低レベルアクセスAPI
 * 実装の詳細を隔離し、Kintone/Supabase等への切り替えを容易にする
 */

/**
 * ストレージからデータを取得
 * @param key - ストレージキー
 * @returns パースされたデータ、またはnull
 */
export function getFromStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to get item from storage: ${key}`, error);
    return null;
  }
}

/**
 * ストレージにデータを保存
 * @param key - ストレージキー
 * @param data - 保存するデータ
 */
export function setToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Failed to set item in storage: ${key}`, error);
  }
}

/**
 * ストレージからデータを削除
 * @param key - ストレージキー
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove item from storage: ${key}`, error);
  }
}

/**
 * ストレージをクリア
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage', error);
  }
}

/**
 * 深いコピーを作成（参照の副作用を防ぐ）
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
