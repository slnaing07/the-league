import type { TeamStanding } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  standings: TeamStanding[];
  showOwner?: boolean;
}

export default function StandingsTable({ standings, showOwner = true }: Props) {
  if (!standings.length) {
    return (
      <div className="card text-center py-12 text-pitch-muted">
        No standings data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-pitch-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-pitch-card border-b border-pitch-border">
            <th className="px-2 sm:px-4 py-3 text-left text-pitch-muted font-medium w-10">#</th>
            <th className="px-2 sm:px-4 py-3 text-left text-pitch-muted font-medium">Team</th>
            {showOwner && (
              <th className="hidden sm:table-cell px-4 py-3 text-left text-pitch-muted font-medium">Manager</th>
            )}
            <th className="px-2 sm:px-4 py-3 text-right text-pitch-muted font-medium">W</th>
            <th className="px-2 sm:px-4 py-3 text-right text-pitch-muted font-medium">L</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted font-medium">T</th>
            <th className="px-2 sm:px-4 py-3 text-right text-pitch-muted font-medium">PF</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted font-medium">PA</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted font-medium">+/-</th>
            <th className="px-2 sm:px-4 py-3 text-right text-pitch-muted font-medium">Win%</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => {
            const diff = team.pointsFor - team.pointsAgainst;
            const isTop4 = idx < 4;
            const isFirst = idx === 0;
            return (
              <tr
                key={team.teamId}
                className={clsx(
                  'border-b border-pitch-border/50 transition-colors hover:bg-white/3',
                  isFirst && 'bg-gold-500/5'
                )}
              >
                <td className="px-2 sm:px-4 py-3">
                  <span
                    className={clsx(
                      'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold',
                      isFirst
                        ? 'bg-gold-500 text-black'
                        : isTop4
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-pitch-muted'
                    )}
                  >
                    {team.rank || idx + 1}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 font-medium">
                  {isFirst && <span className="mr-1">🏆</span>}
                  {team.teamName}
                </td>
                {showOwner && (
                  <td className="hidden sm:table-cell px-4 py-3 text-pitch-muted">{team.ownerName}</td>
                )}
                <td className="px-2 sm:px-4 py-3 text-right text-emerald-400 font-semibold">{team.wins}</td>
                <td className="px-2 sm:px-4 py-3 text-right text-red-400">{team.losses}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted">{team.ties}</td>
                <td className="px-2 sm:px-4 py-3 text-right">{team.pointsFor.toFixed(1)}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted">{team.pointsAgainst.toFixed(1)}</td>
                <td className={clsx('hidden sm:table-cell px-4 py-3 text-right font-medium', diff >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                </td>
                <td className="px-2 sm:px-4 py-3 text-right text-pitch-muted">
                  {(team.winPct * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
