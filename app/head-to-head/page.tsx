'use client';

import { useState, useEffect, useMemo } from 'react';
import type { SeasonData } from '@/lib/types';
import HeadToHeadMatrix from '@/components/HeadToHeadMatrix';
import H2HDetail from '@/components/H2HDetail';
import RankChart from '@/components/RankChart';

export default function HeadToHeadPage() {
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/all-seasons')
      .then(r => r.json())
      .then(d => { setSeasons(d.seasons ?? []); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const owners = useMemo(() => {
    const set = new Set<string>();
    for (const s of seasons) for (const t of s.standings) set.add(t.ownerName);
    return Array.from(set).sort();
  }, [seasons]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Head to Head</h1>
        <p className="text-pitch-muted mt-1">All-time records between every manager pair.</p>
      </div>

      {loading && (
        <div className="card text-center py-16 text-pitch-muted animate-pulse">Loading matchup data…</div>
      )}
      {error && (
        <div className="card text-center py-8 text-red-400">Error: {error}</div>
      )}

      {!loading && !error && (
        <>
          <section>
            <h2 className="text-xl font-bold mb-4">All-Time H2H Matrix</h2>
            <div className="card overflow-x-auto">
              <HeadToHeadMatrix seasons={seasons} />
            </div>
            <p className="text-pitch-muted text-xs mt-2">
              Read row vs. column. Green = winning record, red = losing record.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Manager vs Manager</h2>
            <H2HDetail seasons={seasons} owners={owners} />
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Season Finish – All Managers</h2>
            <div className="card">
              <RankChart seasons={seasons} />
              <p className="text-pitch-muted text-xs mt-3">Lower rank = better finish. #1 = champion.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
