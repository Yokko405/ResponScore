import { Link } from 'react-router-dom';
import './NotFound.css';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <h1 className="not-found__title">404</h1>
        <p className="not-found__message">ページが見つかりません</p>
        <p className="not-found__description">
          申し訳ありません。お探しのページは存在しません。
        </p>
        <Link to="/" className="not-found__button">
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
