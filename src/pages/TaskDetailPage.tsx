import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services';
import type { TaskDTO } from '../services/dtos';
import { ReactionButtons } from '../components/TaskDetail/ReactionButtons';
import { Loading } from '../components/Loading';
import { formatDate } from '../utils/dateUtils';
import { showError } from '../utils/toast';
import './TaskDetailPage.css';

interface TaskDetailPageProps {
  currentUserId: string;
}

export function TaskDetailPage({ currentUserId }: TaskDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    loadTask();
  }, [id]);

  const loadTask = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getTaskById(id);
      if (!data) {
        setError('タスクが見つかりません');
        navigate('/');
        return;
      }
      setTask(data);
    } catch (err) {
      console.error('Failed to load task:', err);
      setError('タスク読み込みに失敗しました');
      showError('タスク読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactionAdded = async () => {
    // リアクション追加後、タスク情報を再読み込み
    await loadTask();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !task) {
    return (
      <div className="task-detail-page__error">
        <p>{error || 'タスク情報を取得できませんでした'}</p>
        <button className="task-detail-page__back-button" onClick={() => navigate('/')}>
          タスク一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <button className="task-detail-page__back" onClick={() => navigate('/')}>
        ← 戻る
      </button>

      <div className="task-detail-page__card">
        <div className="task-detail-page__header">
          <h1 className="task-detail-page__title">{task.title}</h1>
          <div className={`task-detail-page__status task-detail-page__status--${task.status}`}>
            {task.status === 'unread' && '未読'}
            {task.status === 'in_progress' && '進行中'}
            {task.status === 'done' && '完了'}
          </div>
        </div>

        <div className="task-detail-page__meta">
          <div className="task-detail-page__info">
            <span className="task-detail-page__label">指示者:</span>
            <span className="task-detail-page__value">{task.assignerName}</span>
          </div>
          <div className="task-detail-page__info">
            <span className="task-detail-page__label">担当者:</span>
            <span className="task-detail-page__value">{task.assigneeNames.join(', ')}</span>
          </div>
        </div>

        <div className="task-detail-page__detail-section">
          <h2>詳細</h2>
          <p className="task-detail-page__detail-text">{task.detail}</p>
        </div>

        {task.deadline && (
          <div className="task-detail-page__deadline-section">
            <h2>期限</h2>
            <p className="task-detail-page__deadline-text">
              {formatDate(task.deadline, 'YYYY年MM月DD日')}
            </p>
          </div>
        )}

        <div className="task-detail-page__created-section">
          <span className="task-detail-page__created-label">作成日時:</span>
          <span className="task-detail-page__created-value">
            {formatDate(task.createdAt, 'YYYY-MM-DD HH:mm')}
          </span>
        </div>

        <div className="task-detail-page__reactions">
          <ReactionButtons
            taskId={task.id}
            userId={currentUserId}
            assigneeIds={task.assigneeIds}
            onReactionAdded={handleReactionAdded}
            disabled={task.status === 'done'}
          />
          {task.status === 'done' && (
            <p className="task-detail-page__completed-notice">
              このタスクは完了しています
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
