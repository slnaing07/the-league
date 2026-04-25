'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { SeasonData } from '@/lib/types';

interface MatchupRow {
  year: number;
  period: number;
  aScore: number;
  bScore: number;
  aTeam: string;
  bTeam: string;
  result: 'a' | 'b' | 'tie';
}

function buildMatchups(seasons: SeasonData[], ownerA: string, ownerB: string): MatchupRow[] {
  const rows: MatchupRow[] = [];

  for (const s of seasons) {
    const teamOwner: Record<string, string> = {};
    const teamName: Record<string, string> = {};
    for (const t of s.standings) {
      teamOwner[t.teamId] = t.ownerName;
      teamName[t.teamId] = t.teamName;
    }

    for (const m of s.matchups) {
      const homeOwner = teamOwner[m.homeTeamId];
      const awayOwner = teamOwner[m.awayTeamId];
      if (!homeOwner || !awayOwner) continue;

      const isMatch =
        (homeOwner === ownerA && awayOwner === ownerB) ||
        (homeOwner === ownerB && awayOwner === ownerA);
      if (!isMatch) continue;

      // Normalise so 'a' is always ownerA
      const aIsHome = homeOwner === ownerA;
      const aScore = aIsHome ? m.homeScore : m.awayScore;
      const bScore = aIsHome ? m.awayScore : m.homeScore;
      const aTeam = teamName[aIsHome ? m.homeTeamId : m.awayTeamId] ?? ownerA;
      const bTeam = teamName[aIsHome ? m.awayTeamId : m.homeTeamId] ?? ownerB;

      let result: 'a' | 'b' | 'tie' = 'tie';
      if (aScore > bScore) result = 'a';
      else if (bScore > aScore) result = 'b';

      rows.push({ year: s.year, period: m.period, aScore, bScore, aTeam, bTeam, result });
    }
  }

  return rows.sort((a, b) => a.year - b.year || a.period - b.period);
}

interface Props {
  seasons: SeasonData[];
  owners: string[];
}

export default function H2HDetail({ seasons, owners }: Props) {
  const [ownerA, setOwnerA] = useState('');
  const [ownerB, setOwnerB] = useState('');

  const matchups = useMemo(
    () => (ownerA && ownerB && ownerA !== ownerB ? buildMatchups(seasons, ownerA, ownerB) : []),
    [seasons, ownerA, ownerB]
  );

  const summary = useMemo(() => {
    const wins = matchups.filter(m => m.result === 'a').length;
    const losses = matchups.filter(m => m.result === 'b').length;
    const ties = matchups.filter(m => m.result === 'tie').length;
    return { wins, losses, ties };
  }, [matchups]);

  // Group by year
  const byYear = useMemo(() => {
    const map = new Map<number, MatchupRow[]>();
    for (const m of matchups) {
      if (!map.has(m.year)) map.set(m.year, []);
      map.get(m.year)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b - a);
  }, [matchups]);

  return (
    <div className="space-y-6">
      {/* Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={ownerA} onChange={setOwnerA} options={owners} placeholder="Select manager…" exclude={ownerB} />
        <span className="text-pitch-muted font-bold">vs</span>
        <Select value={ownerB} onChange={setOwnerB} options={owners} placeholder="Select manager…" exclude={ownerA} />
      </div>

      {ownerA && ownerB && ownerA !== ownerB && (
        <>
          {/* Summary banner */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-lg sm:text-xl font-bold leading-tight">
                  <span className="text-emerald-400">{ownerA}</span>
                  <span className="text-pitch-muted mx-2">vs</span>
                  <span className="text-emerald-400">{ownerB}</span>
                </p>
                <p className="text-pitch-muted text-sm mt-0.5">{matchups.length} meetings across all seasons</p>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{summary.wins}</p>
                  <p className="text-xs text-pitch-muted uppercase tracking-widest">{ownerA} wins</p>
                </div>
                {summary.ties > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-gold-400">{summary.ties}</p>
                    <p className="text-xs text-pitch-muted uppercase tracking-widest">Draws</p>
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-red-400">{summary.losses}</p>
                  <p className="text-xs text-pitch-muted uppercase tracking-widest">{ownerB} wins</p>
                </div>
              </div>
            </div>
          </div>

          {matchups.length === 0 ? (
            <div className="card text-center py-10 text-pitch-muted">These managers have never faced each other.</div>
          ) : (
            <div className="space-y-4">
              {byYear.map(([year, rows]) => {
                const yearWins = rows.filter(m => m.result === 'a').length;
                const yearLosses = rows.filter(m => m.result === 'b').length;
                const yearTies = rows.filter(m => m.result === 'tie').length;
                return (
                  <div key={year} className="card">
                    {/* Season header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gold-400 font-bold text-lg">{year}</span>
                      <div className="flex gap-1 text-sm font-semibold">
                        <span className="text-emerald-400">{yearWins}W</span>
                        {yearTies > 0 && <><span className="text-pitch-muted">–</span><span className="text-gold-400">{yearTies}D</span></>}
                        <span className="text-pitch-muted">–</span>
                        <span className="text-red-400">{yearLosses}L</span>
                        <span className="text-pitch-muted text-xs font-normal ml-1">({ownerA})</span>
                      </div>
                    </div>

                    {/* Per-gameweek rows */}
                    <div className="space-y-1.5">
                      {rows.map(m => (
                        <div
                          key={`${m.year}-${m.period}`}
                          className={clsx(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                            m.result === 'a' ? 'bg-emerald-500/5' : m.result === 'b' ? 'bg-red-500/5' : 'bg-gold-500/5'
                          )}
                        >
                          {/* GW label */}
                          <span className="text-pitch-muted text-xs shrink-0 w-9">GW{m.period}</span>

                          {/* Manager A side */}
                          <div className="flex-1 min-w-0 text-right">
                            <span className={clsx('font-medium truncate block', m.result === 'a' ? 'text-white' : 'text-pitch-muted')}>
                              {m.aTeam}
                            </span>
                            <span className="hidden sm:block text-pitch-muted text-xs">({ownerA})</span>
                          </div>

                          {/* Scoreline */}
                          <div className="shrink-0 text-center whitespace-nowrap font-bold tabular-nums px-1">
                            <span className={m.result === 'a' ? 'text-emerald-400' : m.result === 'tie' ? 'text-gold-400' : 'text-pitch-muted'}>
                              {m.aScore % 1 === 0 ? m.aScore : m.aScore.toFixed(2)}
                            </span>
                            <span className="text-pitch-border mx-1">–</span>
                            <span className={m.result === 'b' ? 'text-emerald-400' : m.result === 'tie' ? 'text-gold-400' : 'text-pitch-muted'}>
                              {m.bScore % 1 === 0 ? m.bScore : m.bScore.toFixed(2)}
                            </span>
                          </div>

                          {/* Manager B side */}
                          <div className="flex-1 min-w-0">
                            <span className={clsx('font-medium truncate block', m.result === 'b' ? 'text-white' : 'text-pitch-muted')}>
                              {m.bTeam}
                            </span>
                            <span className="hidden sm:block text-pitch-muted text-xs">({ownerB})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Select({
  value, onChange, options, placeholder, exclude,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  exclude: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-pitch-card border border-pitch-border text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none min-w-40"
    >
      <option value="">{placeholder}</option>
      {options.filter(o => o !== exclude).map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
