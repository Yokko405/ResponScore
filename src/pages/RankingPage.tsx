import { useState, useEffect } from 'react';
import { scoreService } from '../services';
import type { RankingStatsDTO } from '../services/dtos';
import { RankingTable } from '../components/Ranking/RankingTable';
import { SkeletonTable } from '../components/Loading';
import { showError } from '../utils/toast';
import './RankingPage.css';

export function RankingPage() {
  const [rankings, setRankings] = useState<RankingStatsDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadRankings();
  }, [period]);

  const loadRankings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // v0: 全期間のみ対応。後で期間フィルタリング実装可能
      const data = await scoreService.getOverallRanking();
      setRankings(data);
    } catch (err) {
      console.error('Failed to load rankings:', err);
      setError('ランキング読み込みに失敗しました');
      showError('ランキング読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const top3 = rankings.slice(0, 3);

  return (
    <div className="ranking-page">
      <h1>ランキング</h1>

      {/* 期間タブ */}
      <div className="ranking-page__tabs">
        <button
          className={`ranking-page__tab ${period === 'all' ? 'ranking-page__tab--active' : ''}`}
          onClick={() => setPeriod('all')}
        >
          全期間
        </button>
        <button
          className={`ranking-page__tab ${period === 'week' ? 'ranking-page__tab--active' : ''}`}
          onClick={() => setPeriod('week')}
          disabled
        >
          今週
        </button>
        <button
          className={`ranking-page__tab ${period === 'month' ? 'ranking-page__tab--active' : ''}`}
          onClick={() => setPeriod('month')}
          disabled
        >
          今月
        </button>
      </div>

      {/* トップ3ハイライト */}
      {!isLoading && top3.length > 0 && (
        <div className="ranking-page__top3">
          <h2>月間トップ3</h2>
          <div className="ranking-page__podium">
            {/* 2位 */}
            {top3[1] && (
              <div className="ranking-page__podium-item ranking-page__podium-item--silver">
                <div className="ranking-page__medal">🥈</div>
                <p className="ranking-page__name">{top3[1].userName}</p>
                <p className="ranking-page__podium-score">{top3[1].totalScore}</p>
                <span className="ranking-page__podium-label">2位</span>
              </div>
            )}

            {/* 1位 */}
            {top3[0] && (
              <div className="ranking-page__podium-item ranking-page__podium-item--gold">
                <div className="ranking-page__medal">🥇</div>
                <p className="ranking-page__name">{top3[0].userName}</p>
                <p className="ranking-page__podium-score">{top3[0].totalScore}</p>
                <span className="ranking-page__podium-label">1位</span>
              </div>
            )}

            {/* 3位 */}
            {top3[2] && (
              <div className="ranking-page__podium-item ranking-page__podium-item--bronze">
                <div className="ranking-page__medal">🥉</div>
                <p className="ranking-page__name">{top3[2].userName}</p>
                <p className="ranking-page__podium-score">{top3[2].totalScore}</p>
                <span className="ranking-page__podium-label">3位</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ランキングテーブル */}
      {error && <div className="ranking-page__error">{error}</div>}

      {isLoading ? (
        <SkeletonTable />
      ) : rankings.length === 0 ? (
        <div className="ranking-page__empty">
          <p>ランキングデータがまだありません</p>
        </div>
      ) : (
        <RankingTable rankings={rankings} />
      )}
    </div>
  );
}
