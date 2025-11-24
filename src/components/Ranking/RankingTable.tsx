import type { RankingStatsDTO } from '../../services/dtos';
import './RankingTable.css';

interface RankingTableProps {
  rankings: RankingStatsDTO[];
}

const getMedalEmoji = (rank?: 1 | 2 | 3) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
};

const getTrendIcon = (changePercent: number) => {
  if (changePercent > 0) return '▲';
  if (changePercent < 0) return '▼';
  return '→';
};

const getTrendClass = (changePercent: number) => {
  if (changePercent > 0) return 'trend--up';
  if (changePercent < 0) return 'trend--down';
  return 'trend--flat';
};

export function RankingTable({ rankings }: RankingTableProps) {
  return (
    <div className="ranking-table-wrapper">
      <table className="ranking-table">
        <thead>
          <tr>
            <th className="ranking-table__col--rank">順位</th>
            <th className="ranking-table__col--name">ユーザー名</th>
            <th className="ranking-table__col--score">合計スコア</th>
            <th className="ranking-table__col--change">変動</th>
            <th className="ranking-table__col--avg-time">平均初回反応時間</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((ranking, index) => (
            <tr key={ranking.userId} className={ranking.monthlyRank ? 'ranking-table__row--highlight' : ''}>
              <td className="ranking-table__col--rank">
                {ranking.monthlyRank ? (
                  <span className="ranking-table__medal">{getMedalEmoji(ranking.monthlyRank)}</span>
                ) : (
                  <span className="ranking-table__rank-number">{index + 1}</span>
                )}
              </td>
              <td className="ranking-table__col--name">
                <span className="ranking-table__name">{ranking.userName}</span>
              </td>
              <td className="ranking-table__col--score">
                <span className="ranking-table__score">{ranking.totalScore.toLocaleString()}</span>
              </td>
              <td className={`ranking-table__col--change ${getTrendClass(ranking.scoreChangePercent)}`}>
                <span className="ranking-table__trend-icon">{getTrendIcon(ranking.scoreChangePercent)}</span>
                <span className="ranking-table__trend-value">
                  {ranking.scoreChangePercent > 0 ? '+' : ''}
                  {ranking.scoreChangePercent}%
                </span>
              </td>
              <td className="ranking-table__col--avg-time">
                <span className="ranking-table__avg-time">
                  {ranking.averageFirstReactionTimeMinutes.toFixed(1)}分
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
