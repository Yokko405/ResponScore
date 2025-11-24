import './Loading.css';

export function Loading() {
  return (
    <div className="loading">
      <div className="loading__spinner"></div>
      <p className="loading__text">読み込み中...</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__header">
        <div className="skeleton-card__title"></div>
        <div className="skeleton-card__status"></div>
      </div>
      <div className="skeleton-card__detail"></div>
      <div className="skeleton-card__meta">
        <div className="skeleton-card__info"></div>
        <div className="skeleton-card__info"></div>
      </div>
      <div className="skeleton-card__footer">
        <div className="skeleton-card__date"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table__header"></div>
      <div className="skeleton-table__row"></div>
      <div className="skeleton-table__row"></div>
      <div className="skeleton-table__row"></div>
    </div>
  );
}
