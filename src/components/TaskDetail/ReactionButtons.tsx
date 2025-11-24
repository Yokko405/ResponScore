import { useState } from 'react';
import type { Reaction } from '../../types';
import { showSuccess, showError } from '../../utils/toast';
import { reactionService } from '../../services';
import './ReactionButtons.css';

interface ReactionButtonsProps {
  taskId: string;
  userId: string;
  onReactionAdded?: (result: any) => void;
  disabled?: boolean;
}

const reactionTypes: Array<{
  type: Reaction['type'];
  emoji: string;
  label: string;
}> = [
  { type: 'ack', emoji: '👍', label: '了解' },
  { type: 'later', emoji: '🟡', label: '後で確認' },
  { type: 'working', emoji: '🔴', label: '対応中' },
  { type: 'done', emoji: '✔', label: '完了' },
];

export function ReactionButtons({
  taskId,
  userId,
  onReactionAdded,
  disabled = false,
}: ReactionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<Reaction['type'] | null>(null);

  const handleReaction = async (type: Reaction['type']) => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    setSelectedType(type);

    try {
      const result = await reactionService.addReaction(taskId, userId, type);

      // スコア情報を表示
      if (result.scoresAdded.length > 0) {
        const totalScore = result.scoresAdded.reduce((sum, s) => sum + s.value, 0);
        showSuccess(`${totalScore > 0 ? '+' : ''}${totalScore} ポイント獲得！`);
      }

      if (onReactionAdded) {
        onReactionAdded(result);
      }

      // 3秒後に選択状態をリセット
      setTimeout(() => {
        setSelectedType(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      showError('リアクション追加に失敗しました');
      setSelectedType(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reaction-buttons">
      <div className="reaction-buttons__label">リアクション:</div>
      <div className="reaction-buttons__group">
        {reactionTypes.map((reaction) => (
          <button
            key={reaction.type}
            className={`reaction-button ${
              selectedType === reaction.type ? 'reaction-button--active' : ''
            }`}
            onClick={() => handleReaction(reaction.type)}
            disabled={isLoading || disabled}
            title={reaction.label}
          >
            <span className="reaction-button__emoji">{reaction.emoji}</span>
            <span className="reaction-button__label">{reaction.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
