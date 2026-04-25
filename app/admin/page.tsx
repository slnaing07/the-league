'use client';

import { useState, useEffect } from 'react';
import { SEASONS } from '@/lib/constants';
import { MANAGERS } from '@/lib/managers';
import type { SeasonData } from '@/lib/types';

export default function AdminPage() {
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'mapping' | 'raw'>('mapping');

  useEffect(() => {
    fetch('/api/all-seasons')
      .then(r => r.json())
      .then(d => { setSeasons(d.seasons ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // A team is unclaimed if data.ts couldn't resolve it to a manager
  // (ownerName falls back to teamName when no mapping exists)
  const unclaimedByYear: Record<number, string[]> = {};
  for (const s of seasons) {
    for (const t of s.standings) {
      if (t.ownerName === t.teamName) {
        if (!unclaimedByYear[s.year]) unclaimedByYear[s.year] = [];
        unclaimedByYear[s.year].push(t.teamName);
      }
    }
  }

  const hasTodo = MANAGERS.some(m => m.name.startsWith('TODO'));
  const unclaimedYears = Object.keys(unclaimedByYear).filter(y => unclaimedByYear[+y].length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manager Mapping</h1>
        <p className="text-pitch-muted mt-1">
          The H2H matrix is indexed by manager, not team name. Complete this mapping in{' '}
          <code className="bg-pitch-card px-1.5 py-0.5 rounded text-emerald-400 text-sm">lib/managers.ts</code>.
        </p>
      </div>

      {/* Status banner */}
      <div className={`card border ${hasTodo || unclaimedYears.length > 0 ? 'border-gold-500/40 bg-gold-500/5' : 'border-emerald-500/40 bg-emerald-500/5'}`}>
        {hasTodo || unclaimedYears.length > 0 ? (
          <div className="space-y-1">
            <p className="font-semibold text-gold-400">Action needed</p>
            {hasTodo && (
              <p className="text-sm text-pitch-muted">
                {MANAGERS.filter(m => m.name.startsWith('TODO')).length} manager entries still have placeholder names — fill in real names in managers.ts.
              </p>
            )}
            {unclaimedYears.length > 0 && (
              <p className="text-sm text-pitch-muted">
                {unclaimedYears.length} seasons have unclaimed teams — assign them to manager entries below.
              </p>
            )}
          </div>
        ) : (
          <p className="text-emerald-400 font-semibold">All teams mapped! Head-to-head is fully operational.</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['mapping', 'raw'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-emerald-500 text-black' : 'bg-pitch-card border border-pitch-border text-pitch-muted hover:text-white'}`}>
            {t === 'mapping' ? 'Manager Groups' : 'All Teams by Season'}
          </button>
        ))}
      </div>

      {tab === 'mapping' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Auto-detected Manager Groups</h2>
          <p className="text-pitch-muted text-sm">
            Groups detected by repeated team names across seasons. Replace "TODO" names with real manager names in <code className="text-emerald-400">lib/managers.ts</code>,
            and add the missing season entries for each manager.
          </p>

          <div className="grid gap-3">
            {MANAGERS.map((mgr, i) => (
              <div key={i} className="card">
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-semibold ${mgr.name.startsWith('TODO') ? 'text-gold-400' : 'text-white'}`}>
                    {mgr.name}
                  </span>
                  <span className="text-xs text-pitch-muted bg-pitch-bg rounded-full px-2 py-0.5">
                    {Object.keys(mgr.teams).length} season{Object.keys(mgr.teams).length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(mgr.teams) as [string, string][])
                    .sort(([a], [b]) => +a - +b)
                    .map(([year, team]) => (
                      <div key={year} className="text-xs bg-pitch-bg rounded px-2 py-1 border border-pitch-border/50">
                        <span className="text-gold-400 font-semibold mr-1">{year}</span>
                        <span className="text-pitch-muted">{team}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Unclaimed teams */}
          {unclaimedYears.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-3 text-gold-400">Unclaimed Teams</h2>
              <p className="text-pitch-muted text-sm mb-4">
                These teams aren&apos;t in any manager group yet. Add them to an existing entry or create a new one in managers.ts.
              </p>
              <div className="card space-y-4">
                {Object.entries(unclaimedByYear)
                  .sort(([a], [b]) => +a - +b)
                  .map(([year, teams]) => (
                    <div key={year}>
                      <p className="text-gold-400 font-semibold text-sm mb-2">{year}</p>
                      <div className="flex flex-wrap gap-2">
                        {(teams as string[]).map(t => (
                          <span key={t} className="text-xs bg-pitch-bg border border-pitch-border/50 rounded px-2 py-1 text-pitch-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'raw' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">All Teams by Season</h2>
          {loading && <div className="card text-center py-12 text-pitch-muted animate-pulse">Loading…</div>}
          {!loading && seasons.map(s => (
            <section key={s.year} className="card">
              <h3 className="text-lg font-bold mb-3">
                <span className="text-gold-400 mr-2">{s.year}</span>
                <span className="text-pitch-muted text-sm font-normal">{SEASONS.find(x => x.year === s.year)?.leagueId}</span>
              </h3>
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-left text-pitch-muted border-b border-pitch-border">
                    <th className="py-1 pr-6">Rank</th>
                    <th className="py-1 pr-6">Team Name</th>
                    <th className="py-1 pr-6">Resolved Manager</th>
                    <th className="py-1">W-L</th>
                  </tr>
                </thead>
                <tbody>
                  {s.standings.map(t => {
                    const isResolved = t.ownerName !== t.teamName;
                    return (
                      <tr key={t.teamId} className="border-b border-pitch-border/30">
                        <td className="py-1.5 pr-6 text-pitch-muted">{t.rank}</td>
                        <td className="py-1.5 pr-6 font-medium">{t.teamName}</td>
                        <td className={`py-1.5 pr-6 ${isResolved ? 'text-emerald-400' : 'text-gold-400 italic'}`}>
                          {isResolved ? t.ownerName : 'unresolved'}
                        </td>
                        <td className="py-1.5 text-pitch-muted">{t.wins}-{t.losses}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}

    </div>
  );
}
