'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { PlayerEntry } from '@/lib/types';

type SortKey = 'fpts' | 'gamesPlayed' | 'fptsPerGame' | 'name';

interface AggregatedPlayer {
  playerId: string;
  name: string;
  shortName: string;
  position: string;
  eplTeam: string;
  headshotUrl: string;
  totalFpts: number;
  totalGames: number;
  fptsPerGame: number;
  seasons: number;
  managers: string[];
  entries: PlayerEntry[];
}

function aggregate(entries: PlayerEntry[]): AggregatedPlayer[] {
  const map = new Map<string, AggregatedPlayer>();
  for (const e of entries) {
    const existing = map.get(e.playerId);
    if (!existing) {
      map.set(e.playerId, {
        playerId: e.playerId,
        name: e.name,
        shortName: e.shortName,
        position: e.position,
        eplTeam: e.eplTeam,
        headshotUrl: e.headshotUrl,
        totalFpts: e.fpts,
        totalGames: e.gamesPlayed,
        fptsPerGame: 0,
        seasons: 1,
        managers: [e.ownerName],
        entries: [e],
      });
    } else {
      existing.totalFpts += e.fpts;
      existing.totalGames += e.gamesPlayed;
      existing.seasons++;
      if (!existing.managers.includes(e.ownerName)) existing.managers.push(e.ownerName);
      existing.entries.push(e);
      existing.eplTeam = e.eplTeam || existing.eplTeam;
    }
  }
  return Array.from(map.values()).map(p => ({
    ...p,
    fptsPerGame: p.totalGames > 0 ? p.totalFpts / p.totalGames : 0,
  }));
}

const POS_COLOR: Record<string, string> = {
  G: 'text-yellow-400 bg-yellow-400/10',
  D: 'text-blue-400 bg-blue-400/10',
  M: 'text-emerald-400 bg-emerald-400/10',
  F: 'text-red-400 bg-red-400/10',
};

interface Props {
  entries: PlayerEntry[];
  managers: string[];
  seasons: number[];
}

export default function PlayersTable({ entries, managers, seasons }: Props) {
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('fpts');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = entries;
    if (selectedManager) result = result.filter(e => e.ownerName === selectedManager);
    if (selectedSeason) result = result.filter(e => e.year === selectedSeason);
    return result;
  }, [entries, selectedManager, selectedSeason]);

  const aggregated = useMemo(() => aggregate(filtered), [filtered]);

  const searched = useMemo(() => {
    if (!search.trim()) return aggregated;
    const q = search.toLowerCase();
    return aggregated.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.eplTeam.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q)
    );
  }, [aggregated, search]);

  const sorted = useMemo(() => {
    return [...searched].sort((a, b) => {
      if (sortKey === 'fpts') return b.totalFpts - a.totalFpts;
      if (sortKey === 'gamesPlayed') return b.totalGames - a.totalGames;
      if (sortKey === 'fptsPerGame') return b.fptsPerGame - a.fptsPerGame;
      return a.name.localeCompare(b.name);
    });
  }, [searched, sortKey]);

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    return (
      <button
        onClick={() => setSortKey(k)}
        className={clsx(
          'px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap',
          sortKey === k ? 'bg-emerald-500 text-black' : 'bg-pitch-card border border-pitch-border text-pitch-muted hover:text-white'
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        {/* Season filter */}
        <select
          value={selectedSeason}
          onChange={e => { setSelectedSeason(Number(e.target.value)); setExpanded(null); }}
          className="flex-1 sm:flex-none bg-pitch-card border border-pitch-border text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value={0}>All seasons</option>
          {seasons.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Manager filter */}
        <select
          value={selectedManager}
          onChange={e => { setSelectedManager(e.target.value); setExpanded(null); }}
          className="flex-1 sm:flex-none bg-pitch-card border border-pitch-border text-sm rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none sm:min-w-44"
        >
          <option value="">All managers</option>
          {managers.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search player or team…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-auto sm:min-w-48 bg-pitch-card border border-pitch-border text-sm rounded-lg px-3 py-2 text-white placeholder:text-pitch-muted focus:border-emerald-500 focus:outline-none"
        />

        {/* Sort */}
        <div className="flex gap-1.5 w-full sm:w-auto sm:ml-auto flex-wrap">
          <SortBtn k="fpts" label="Total FPts" />
          <SortBtn k="fptsPerGame" label="FPts/Game" />
          <SortBtn k="gamesPlayed" label="Games" />
          <SortBtn k="name" label="Name" />
        </div>
      </div>

      {/* Count */}
      <p className="text-pitch-muted text-sm">
        {sorted.length} player{sorted.length !== 1 ? 's' : ''}
        {selectedSeason > 0 && <span> · <span className="text-white">{selectedSeason}</span> season</span>}
        {selectedManager && <span> · <span className="text-white">{selectedManager}</span></span>}
      </p>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-pitch-muted border-b border-pitch-border text-xs uppercase tracking-wider">
              <th className="py-2 pr-3 w-6">#</th>
              <th className="py-2 pr-3">Player</th>
              <th className="py-2 pr-3">Pos</th>
              <th className="hidden sm:table-cell py-2 pr-4">EPL Team</th>
              <th className="py-2 pr-3 sm:pr-6 text-right">Total FPts</th>
              <th className="hidden md:table-cell py-2 pr-6 text-right">FPts/Game</th>
              <th className="hidden md:table-cell py-2 pr-6 text-right">Games</th>
              <th className="hidden sm:table-cell py-2 text-right">Seasons</th>
              {!selectedManager && <th className="hidden lg:table-cell py-2 pl-4">Managers</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const isExpanded = expanded === p.playerId;
              const posStyle = POS_COLOR[p.position] ?? 'text-pitch-muted bg-pitch-muted/10';
              return (
                <>
                  <tr
                    key={p.playerId}
                    onClick={() => setExpanded(isExpanded ? null : p.playerId)}
                    className="border-b border-pitch-border/30 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-3 text-pitch-muted tabular-nums">{i + 1}</td>
                    <td className="py-2.5 pr-3 font-medium text-white whitespace-nowrap">{p.name}</td>
                    <td className="py-2.5 pr-3">
                      <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded', posStyle)}>
                        {p.position}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell py-2.5 pr-4 text-pitch-muted whitespace-nowrap">{p.eplTeam}</td>
                    <td className="py-2.5 pr-3 sm:pr-6 text-right font-bold text-emerald-400 tabular-nums">
                      {p.totalFpts % 1 === 0 ? p.totalFpts : p.totalFpts.toFixed(2)}
                    </td>
                    <td className="hidden md:table-cell py-2.5 pr-6 text-right text-pitch-muted tabular-nums">
                      {p.fptsPerGame.toFixed(1)}
                    </td>
                    <td className="hidden md:table-cell py-2.5 pr-6 text-right text-pitch-muted tabular-nums">{p.totalGames}</td>
                    <td className="hidden sm:table-cell py-2.5 text-right text-pitch-muted tabular-nums">{p.seasons}</td>
                    {!selectedManager && (
                      <td className="hidden lg:table-cell py-2.5 pl-4">
                        <div className="flex flex-wrap gap-1">
                          {p.managers.map(m => (
                            <span key={m} className="text-xs bg-pitch-bg border border-pitch-border/50 rounded px-1.5 py-0.5 text-pitch-muted">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Expanded season breakdown */}
                  {isExpanded && (
                    <tr key={`${p.playerId}-exp`} className="border-b border-pitch-border/30 bg-pitch-bg/50">
                      <td />
                      <td colSpan={selectedManager ? 7 : 8} className="py-3 pr-4">
                        <div className="space-y-1">
                          <p className="text-xs text-pitch-muted uppercase tracking-widest mb-2">Season breakdown</p>
                          <div className="flex flex-wrap gap-2">
                            {[...p.entries]
                              .sort((a, b) => b.year - a.year)
                              .map(e => (
                                <div key={`${e.year}-${e.ownerName}`} className="bg-pitch-card border border-pitch-border/50 rounded-lg px-3 py-2 text-xs min-w-32">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-gold-400 font-bold">{e.year}</span>
                                    <span className="text-emerald-400 font-bold tabular-nums">
                                      {e.fpts % 1 === 0 ? e.fpts : e.fpts.toFixed(2)} FPts
                                    </span>
                                  </div>
                                  <p className="text-pitch-muted">{e.ownerName}</p>
                                  <p className="text-pitch-muted/70 text-xs mt-0.5">{e.fantasyTeamName}</p>
                                  <p className="text-pitch-muted/70 text-xs">{e.gamesPlayed} games</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="text-center py-12 text-pitch-muted">No players found.</div>
        )}
      </div>
    </div>
  );
}
