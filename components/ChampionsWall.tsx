import type { SeasonData } from '@/lib/types';
import { CURRENT_YEAR } from '@/lib/constants';
import clsx from 'clsx';

interface Props {
  seasons: SeasonData[];
}

export default function ChampionsWall({ seasons }: Props) {
  const champions = seasons
    .map(s => {
      const champ = s.standings.find(t => t.rank === 1) ?? s.standings[0];
      return { year: s.year, team: champ };
    })
    .filter(c => c.team)
    .reverse();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {champions.map(({ year, team }) => {
        const inProgress = year === CURRENT_YEAR;
        return (
          <div
            key={year}
            className={clsx(
              'rounded-xl p-4 text-center transition-colors border',
              inProgress
                ? 'bg-gradient-to-b from-gold-500/5 to-pitch-card border-gold-500/20 hover:border-gold-500/40'
                : 'bg-gradient-to-b from-gold-500/10 to-pitch-card border-gold-500/30 hover:border-gold-500/60'
            )}
          >
            <div className="text-3xl mb-1">{inProgress ? '⏳' : '🏆'}</div>
            <div className="text-gold-400 font-bold text-lg">{year}</div>
            {inProgress && (
              <div className="text-gold-400/70 text-xs font-medium -mt-0.5 mb-1">In Progress</div>
            )}
            <div className="text-white font-semibold text-sm mt-1 leading-tight">
              {team.teamName}
            </div>
            <div className="text-pitch-muted text-xs mt-0.5">{team.ownerName}</div>
            <div className="mt-2 text-xs font-medium text-emerald-400">
              {team.wins}W – {team.losses}L
            </div>
          </div>
        );
      })}
    </div>
  );
}
