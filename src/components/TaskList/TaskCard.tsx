import type { TaskDTO } from '../../services/dtos';
import { formatDate } from '../../utils/dateUtils';
import './TaskCard.css';

interface TaskCardProps {
  task: TaskDTO;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'unread';
      case 'in_progress':
        return 'in-progress';
      case 'done':
        return 'done';
      default:
        return 'unread';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unread':
        return '未読';
      case 'in_progress':
        return '進行中';
      case 'done':
        return '完了';
      default:
        return status;
    }
  };

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card__header">
        <h3 className="task-card__title">{task.title}</h3>
        <span className={`task-card__status task-card__status--${getStatusColor(task.status)}`}>
          {getStatusLabel(task.status)}
        </span>
      </div>

      <p className="task-card__detail">{task.detail}</p>

      <div className="task-card__meta">
        <div className="task-card__info">
          <span className="task-card__info-label">指示者:</span>
          <span className="task-card__info-value">{task.assignerName}</span>
        </div>
        <div className="task-card__info">
          <span className="task-card__info-label">担当者:</span>
          <span className="task-card__info-value">{task.assigneeNames.join(', ')}</span>
        </div>
      </div>

      <div className="task-card__footer">
        <span className="task-card__date">{formatDate(task.createdAt, 'YYYY-MM-DD HH:mm')}</span>
        {task.reactionCount > 0 && (
          <span className="task-card__reactions">
            リアクション: {task.reactionCount}
          </span>
        )}
      </div>
    </div>
  );
}
