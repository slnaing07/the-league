'use client';

import { useState, useEffect } from 'react';
import { SEASONS, CURRENT_YEAR } from '@/lib/constants';
import type { SeasonData } from '@/lib/types';
import StandingsTable from '@/components/StandingsTable';
import InProgressBadge from '@/components/InProgressBadge';

export default function SeasonsPage() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [allSeasons, setAllSeasons] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/all-seasons')
      .then(r => r.json())
      .then(d => { setAllSeasons(d.seasons ?? []); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const season = allSeasons.find(s => s.year === selectedYear);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Season Standings</h1>
        <p className="text-pitch-muted mt-1">Browse final standings for every season.</p>
      </div>

      {/* Season selector */}
      <div className="flex flex-wrap gap-2">
        {SEASONS.map(({ year }) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              year === selectedYear
                ? 'bg-emerald-500 text-black'
                : 'bg-pitch-card border border-pitch-border text-pitch-muted hover:text-white'
            }`}
          >
            {year}
            {year === CURRENT_YEAR && (
              <span className="ml-1.5 text-gold-400 text-xs">⏳</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="card text-center py-16 text-pitch-muted animate-pulse">
          Loading season data…
        </div>
      )}

      {error && (
        <div className="card text-center py-8 text-red-400">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold">
              {selectedYear} – {season?.leagueName ?? 'The League'}
            </h2>
            <InProgressBadge year={selectedYear} />
            {season && (
              <span className="text-pitch-muted text-sm sm:ml-auto">
                {season.standings.length} managers
              </span>
            )}
          </div>

          {selectedYear === CURRENT_YEAR && (
            <InProgressBadge year={CURRENT_YEAR} variant="banner" />
          )}

          {season && season.standings.length > 0 ? (
            <StandingsTable standings={season.standings} />
          ) : (
            <div className="card text-center py-12 text-pitch-muted">
              No standings data available for {selectedYear}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
