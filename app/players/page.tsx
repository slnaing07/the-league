'use client';

import { useState, useEffect, useMemo } from 'react';
import PlayersTable from '@/components/PlayersTable';
import type { PlayerEntry } from '@/lib/types';

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/player-stats')
      .then(r => r.json())
      .then(d => { setPlayers(d.players ?? []); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const managers = useMemo(
    () => Array.from(new Set(players.map(p => p.ownerName))).sort(),
    [players]
  );

  const seasons = useMemo(
    () => Array.from(new Set(players.map(p => p.year))).sort((a, b) => b - a),
    [players]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-pitch-muted mt-1">
          Fantasy point contributions by every real player across all 7 seasons.
        </p>
      </div>

      {loading && (
        <div className="card text-center py-16 text-pitch-muted animate-pulse">
          Loading player data across all seasons…
        </div>
      )}
      {error && (
        <div className="card text-center py-8 text-red-400">Error: {error}</div>
      )}
      {!loading && !error && (
        <PlayersTable entries={players} managers={managers} seasons={seasons} />
      )}
    </div>
  );
}
