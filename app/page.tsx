import { getAllSeasons, buildAllTimeStats } from '@/lib/data';
import { CURRENT_YEAR } from '@/lib/constants';
import ChampionsWall from '@/components/ChampionsWall';
import AllTimeTable from '@/components/AllTimeTable';
import StandingsTable from '@/components/StandingsTable';
import PointsChart from '@/components/PointsChart';
import InProgressBadge from '@/components/InProgressBadge';

export const revalidate = 3600;

export default async function DashboardPage() {
  const seasons = await getAllSeasons();
  const allTimeStats = buildAllTimeStats(seasons);
  const currentSeason = seasons.find(s => s.year === CURRENT_YEAR);
  const mostChamps = allTimeStats.reduce((a, b) => (b.championships > a.championships ? b : a), allTimeStats[0]);
  const bestWinPct = allTimeStats.reduce((a, b) => (b.winPct > a.winPct ? b : a), allTimeStats[0]);
  const topScorer = allTimeStats.reduce((a, b) => (b.totalPointsFor > a.totalPointsFor ? b : a), allTimeStats[0]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section>
        <div className="flex items-end gap-4 mb-2">
          <h1 className="text-4xl font-bold tracking-tight">The League</h1>
          <span className="text-pitch-muted text-lg mb-1">7 seasons · {seasons.reduce((s, se) => s + se.standings.length, 0)} manager-seasons</span>
        </div>
        <p className="text-pitch-muted">Fantasy Soccer history from 2019 – 2025. All the glory, none of the mercy.</p>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Seasons', value: seasons.length, sub: '2019 – 2025' },
          { label: 'Most Titles', value: mostChamps ? `${mostChamps.championships}x ${mostChamps.ownerName}` : '—', sub: 'All-time champion' },
          { label: 'Best Win%', value: bestWinPct ? `${(bestWinPct.winPct * 100).toFixed(1)}%` : '—', sub: bestWinPct?.ownerName },
          { label: 'Top Scorer', value: topScorer ? `${topScorer.totalPointsFor.toFixed(0)} pts` : '—', sub: topScorer?.ownerName },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-pitch-muted text-xs uppercase tracking-widest">{s.label}</p>
            <p className="text-xl font-bold mt-1 text-white leading-tight">{s.value}</p>
            <p className="text-pitch-muted text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Champions */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🏆</span> Champions History
        </h2>
        <ChampionsWall seasons={seasons} />
      </section>

      {/* Points over time chart */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📈</span> Points For – Season by Season
        </h2>
        <div className="card">
          <PointsChart seasons={seasons} />
        </div>
      </section>

      {/* Current season standings */}
      {currentSeason && currentSeason.standings.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📊</span> {CURRENT_YEAR} Standings
            </h2>
            <InProgressBadge year={CURRENT_YEAR} />
          </div>
          <InProgressBadge year={CURRENT_YEAR} variant="banner" />
          <div className="mt-3">
            <StandingsTable standings={currentSeason.standings} />
          </div>
        </section>
      )}

      {/* All-time table */}
      {allTimeStats.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>👑</span> All-Time Manager Rankings
            </h2>
            <InProgressBadge year={CURRENT_YEAR} />
          </div>
          <AllTimeTable stats={allTimeStats} />
        </section>
      )}
    </div>
  );
}
