/**
 * Toast 通知ユーティリティ
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// イベントリスナー用のコールバック
let toastCallback: ((toast: Toast) => void) | null = null;

/**
 * Toast 表示関数
 */
export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const toast: Toast = {
    id: `toast_${Date.now()}`,
    message,
    type,
    duration,
  };

  if (toastCallback) {
    toastCallback(toast);
  }
}

/**
 * Toast コンポーネント向けのコールバック登録
 */
export function registerToastCallback(callback: (toast: Toast) => void) {
  toastCallback = callback;
}

/**
 * 成功メッセージ
 */
export function showSuccess(message: string) {
  showToast(message, 'success');
}

/**
 * エラーメッセージ
 */
export function showError(message: string) {
  showToast(message, 'error');
}

/**
 * 警告メッセージ
 */
export function showWarning(message: string) {
  showToast(message, 'warning');
}

/**
 * 情報メッセージ
 */
export function showInfo(message: string) {
  showToast(message, 'info');
}
