import type { AllTimeStats } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  stats: AllTimeStats[];
}

export default function AllTimeTable({ stats }: Props) {
  const sorted = [...stats].sort((a, b) => b.championships - a.championships || b.winPct - a.winPct);

  return (
    <div className="overflow-x-auto rounded-xl border border-pitch-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-pitch-card border-b border-pitch-border">
            <th className="px-2 sm:px-4 py-3 text-left text-pitch-muted font-medium">#</th>
            <th className="px-2 sm:px-4 py-3 text-left text-pitch-muted font-medium">Manager</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted font-medium">Seasons</th>
            <th className="px-2 sm:px-4 py-3 text-right text-pitch-muted font-medium">🏆</th>
            <th className="px-2 sm:px-4 py-3 text-right text-pitch-muted font-medium">W</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted font-medium">L</th>
            <th className="px-2 sm:px-4 py-3 text-right text-pitch-muted font-medium">Win%</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted font-medium">Avg PF</th>
            <th className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted font-medium">Total PF</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => (
            <tr key={s.ownerName} className="border-b border-pitch-border/50 hover:bg-white/3 transition-colors">
              <td className="px-2 sm:px-4 py-3 text-pitch-muted">{i + 1}</td>
              <td className="px-2 sm:px-4 py-3 font-semibold">
                {i === 0 && <span className="mr-1">👑</span>}
                {s.ownerName}
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted">{s.seasons}</td>
              <td className="px-2 sm:px-4 py-3 text-right">
                {s.championships > 0 ? (
                  <span className="text-gold-400 font-bold">{s.championships}</span>
                ) : (
                  <span className="text-pitch-muted">—</span>
                )}
              </td>
              <td className="px-2 sm:px-4 py-3 text-right text-emerald-400 font-semibold">{s.totalWins}</td>
              <td className="hidden sm:table-cell px-4 py-3 text-right text-red-400">{s.totalLosses}</td>
              <td className={clsx('px-2 sm:px-4 py-3 text-right font-medium', s.winPct >= 0.5 ? 'text-emerald-400' : 'text-pitch-muted')}>
                {(s.winPct * 100).toFixed(1)}%
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-right">{s.avgPointsFor.toFixed(1)}</td>
              <td className="hidden sm:table-cell px-4 py-3 text-right text-pitch-muted">{s.totalPointsFor.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
