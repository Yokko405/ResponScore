import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userService } from '../../services';
import type { UserDTO } from '../../services/dtos';
import './MainLayout.css';

interface MainLayoutProps {
  currentUserId: string;
  onUserChange: (userId: string) => void;
  children: React.ReactNode;
}

export function MainLayout({ currentUserId, onUserChange, children }: MainLayoutProps) {
  const location = useLocation();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isUsersLoaded, setIsUsersLoaded] = useState(false);

  // ユーザー一覧を初回ロード
  if (!isUsersLoaded) {
    userService.getAllUsers().then((data) => {
      setUsers(data);
      setIsUsersLoaded(true);
    });
  }

  const currentUser = users.find((u) => u.id === currentUserId);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="layout">
      {/* ヘッダー */}
      <header className="header">
        <div className="header__content">
          <h1 className="header__title">ResponScore</h1>
          <div className="header__user-selector">
            <label htmlFor="user-select" className="header__label">
              ユーザー:
            </label>
            <select
              id="user-select"
              className="header__select"
              value={currentUserId}
              onChange={(e) => onUserChange(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {currentUser && (
              <span className="header__score">スコア: {currentUser.totalScore}</span>
            )}
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav className="nav">
        <Link
          to="/"
          className={`nav__link ${isActive('/') && location.pathname !== '/ranking' ? 'nav__link--active' : ''}`}
        >
          📋 タスク
        </Link>
        <Link
          to="/ranking"
          className={`nav__link ${isActive('/ranking') ? 'nav__link--active' : ''}`}
        >
          🏆 ランキング
        </Link>
      </nav>

      {/* メインコンテンツ */}
      <div className="layout__body">
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
