/**
 * 2つの日時の差分を分単位で計算
 */
export function calculateTimeDiffMinutes(from: Date, to: Date): number {
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * 2つの日時の差分を時間単位で計算
 */
export function calculateTimeDiffHours(from: Date, to: Date): number {
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
}

/**
 * 2つの日時の差分を日単位で計算
 */
export function calculateTimeDiffDays(from: Date, to: Date): number {
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * ISO形式の日時文字列をフォーマット
 * @param isoString - ISO形式の日時文字列
 * @param format - フォーマット形式（例："YYYY-MM-DD HH:mm"）
 */
export function formatDate(isoString: string, format: string = 'YYYY-MM-DD HH:mm'): string {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 現在の日時をISO形式で取得
 */
export function getCurrentISODateTime(): string {
  return new Date().toISOString();
}

/**
 * 指定日数後の日付をISO形式で取得
 */
export function getDateAfterDays(days: number, fromDate?: Date): string {
  const date = fromDate ? new Date(fromDate) : new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * 今週の開始日（月曜日）を取得
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * 今週の終了日（日曜日）を取得
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff));
}

/**
 * 先週の開始日を取得
 */
export function getPreviousWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return getWeekStart(d);
}

/**
 * 先週の終了日を取得
 */
export function getPreviousWeekEnd(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return getWeekEnd(d);
}

/**
 * 月初めの日付を取得
 */
export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 月末の日付を取得
 */
export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
