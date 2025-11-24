import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services';
import type { TaskDTO } from '../services/dtos';
import { TaskCard } from '../components/TaskList/TaskCard';
import { SkeletonCard } from '../components/Loading';
import { showSuccess, showError } from '../utils/toast';
import './TaskListPage.css';

interface TaskListPageProps {
  currentUserId: string;
}

export function TaskListPage({ currentUserId }: TaskListPageProps) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    assigneeId: '',
  });

  useEffect(() => {
    loadTasks();
  }, [currentUserId]);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('タスク読み込みに失敗しました');
      showError('タスク読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showError('タイトルは必須です');
      return;
    }

    if (!formData.assigneeId) {
      showError('担当者を選択してください');
      return;
    }

    try {
      await taskService.createTask(
        formData.title,
        formData.detail,
        currentUserId,
        formData.assigneeId
      );
      showSuccess('タスクを作成しました');
      setFormData({ title: '', detail: '', assigneeId: '' });
      setShowForm(false);
      await loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
      showError('タスク作成に失敗しました');
    }
  };

  return (
    <div className="task-list-page">
      <div className="task-list-page__header">
        <h1>タスク一覧</h1>
        <button className="task-list-page__add-button" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'キャンセル' : '+ 新規タスク'}
        </button>
      </div>

      {showForm && (
        <form className="task-list-page__form" onSubmit={handleCreateTask}>
          <div className="task-list-page__form-group">
            <label>タイトル</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="タスクのタイトルを入力"
              maxLength={100}
            />
          </div>

          <div className="task-list-page__form-group">
            <label>詳細</label>
            <textarea
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              placeholder="タスクの詳細を入力"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="task-list-page__form-group">
            <label>担当者</label>
            <select
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
            >
              <option value="">選択してください</option>
              <option value="user1">田中太郎</option>
              <option value="user2">佐藤花子</option>
              <option value="user3">鈴木次郎</option>
              <option value="user4">伊藤美咲</option>
              <option value="user5">渡辺健一</option>
            </select>
          </div>

          <button type="submit" className="task-list-page__form-submit">
            作成
          </button>
        </form>
      )}

      {error && <div className="task-list-page__error">{error}</div>}

      <div className="task-list-page__content">
        {isLoading ? (
          <div className="task-list-page__skeleton">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : tasks.length === 0 ? (
          <div className="task-list-page__empty">
            <p>タスクがまだ登録されていません</p>
          </div>
        ) : (
          <div className="task-list-page__list">
            {tasks.map((task) => (
              <div key={task.id} onClick={() => navigate(`/task/${task.id}`)}>
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
