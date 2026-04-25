'use client';

import { useState, useEffect } from 'react';
import type { SeasonData } from '@/lib/types';
import { buildAllTimeStats } from '@/lib/stats';
import { CURRENT_YEAR } from '@/lib/constants';
import AllTimeTable from '@/components/AllTimeTable';
import InProgressBadge from '@/components/InProgressBadge';

interface Record {
  label: string;
  value: string;
  sub: string;
  icon: string;
}

function computeRecords(seasons: SeasonData[]): Record[] {
  if (!seasons.length) return [];

  const allStandings = seasons.flatMap(s =>
    s.standings.map(t => ({ ...t, year: s.year }))
  );

  if (!allStandings.length) return [];

  const byPF = [...allStandings].sort((a, b) => b.pointsFor - a.pointsFor);
  const byWins = [...allStandings].sort((a, b) => b.wins - a.wins);
  const byWinPct = [...allStandings].sort((a, b) => b.winPct - a.winPct);
  const byPA = [...allStandings].sort((a, b) => b.pointsAgainst - a.pointsAgainst);

  const allTime = buildAllTimeStats(seasons);
  const topChamps = [...allTime].sort((a, b) => b.championships - a.championships)[0];
  const topWins = [...allTime].sort((a, b) => b.totalWins - a.totalWins)[0];
  const topPF = [...allTime].sort((a, b) => b.totalPointsFor - a.totalPointsFor)[0];

  const records: Record[] = [];

  if (byPF[0]) records.push({
    icon: '💥',
    label: 'Highest Single-Season PF',
    value: byPF[0].pointsFor.toFixed(1),
    sub: `${byPF[0].ownerName || byPF[0].teamName} (${(byPF[0] as { year?: number }).year})`,
  });

  if (byWins[0]) records.push({
    icon: '📈',
    label: 'Most Wins in a Season',
    value: String(byWins[0].wins),
    sub: `${byWins[0].ownerName || byWins[0].teamName} (${(byWins[0] as { year?: number }).year})`,
  });

  if (byWinPct[0]) records.push({
    icon: '🎯',
    label: 'Best Season Win%',
    value: `${(byWinPct[0].winPct * 100).toFixed(1)}%`,
    sub: `${byWinPct[0].ownerName || byWinPct[0].teamName} (${(byWinPct[0] as { year?: number }).year})`,
  });

  if (byPA[0]) records.push({
    icon: '🔥',
    label: 'Highest PF Allowed in a Season',
    value: byPA[0].pointsAgainst.toFixed(1),
    sub: `${byPA[0].ownerName || byPA[0].teamName} (${(byPA[0] as { year?: number }).year})`,
  });

  if (topChamps) records.push({
    icon: '🏆',
    label: 'Most Championships',
    value: String(topChamps.championships),
    sub: topChamps.ownerName,
  });

  if (topWins) records.push({
    icon: '🌟',
    label: 'Most All-Time Wins',
    value: String(topWins.totalWins),
    sub: topWins.ownerName,
  });

  if (topPF) records.push({
    icon: '⚡',
    label: 'Most All-Time Points',
    value: topPF.totalPointsFor.toFixed(0),
    sub: topPF.ownerName,
  });

  // Lowest single-season wins (shame corner)
  const byWinsAsc = [...allStandings].sort((a, b) => a.wins - b.wins);
  if (byWinsAsc[0]) records.push({
    icon: '🪦',
    label: 'Fewest Wins in a Season',
    value: String(byWinsAsc[0].wins),
    sub: `${byWinsAsc[0].ownerName || byWinsAsc[0].teamName} (${(byWinsAsc[0] as { year?: number }).year})`,
  });

  return records;
}

export default function RecordsPage() {
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/all-seasons')
      .then(r => r.json())
      .then(d => { setSeasons(d.seasons ?? []); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const records = computeRecords(seasons);
  const allTimeStats = seasons.length ? buildAllTimeStats(seasons) : [];

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Records & Hall of Fame</h1>
        <p className="text-pitch-muted">Every bragging right, codified.</p>
        <InProgressBadge year={CURRENT_YEAR} variant="banner" />
      </div>

      {loading && (
        <div className="card text-center py-16 text-pitch-muted animate-pulse">Crunching the numbers…</div>
      )}
      {error && (
        <div className="card text-center py-8 text-red-400">Error: {error}</div>
      )}

      {!loading && !error && (
        <>
          {records.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Single Records</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {records.map(r => (
                  <div key={r.label} className="card hover:border-emerald-500/40 transition-colors">
                    <div className="text-3xl mb-2">{r.icon}</div>
                    <p className="text-pitch-muted text-xs uppercase tracking-widest">{r.label}</p>
                    <p className="text-2xl font-bold mt-1 text-white">{r.value}</p>
                    <p className="text-pitch-muted text-sm mt-0.5">{r.sub}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {allTimeStats.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">All-Time Standings</h2>
              <AllTimeTable stats={allTimeStats} />
            </section>
          )}

          {/* Season-by-season champion roll */}
          {seasons.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Champion Roll Call</h2>
              <div className="card divide-y divide-pitch-border/50">
                {[...seasons].reverse().map(s => {
                  const champ = s.standings.find(t => t.rank === 1) ?? s.standings[0];
                  const inProgress = s.year === CURRENT_YEAR;
                  return (
                    <div key={s.year} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gold-400 font-bold text-lg w-12">{s.year}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{champ?.teamName ?? 'N/A'}</p>
                            {inProgress && <InProgressBadge year={s.year} />}
                          </div>
                          <p className="text-pitch-muted text-sm">{champ?.ownerName}</p>
                        </div>
                      </div>
                      {champ && (
                        <div className="text-right text-sm">
                          <span className="text-emerald-400 font-semibold">{champ.wins}W</span>
                          <span className="text-pitch-muted mx-1">–</span>
                          <span className="text-red-400">{champ.losses}L</span>
                          <div className="text-pitch-muted">{champ.pointsFor.toFixed(1)} PF</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
