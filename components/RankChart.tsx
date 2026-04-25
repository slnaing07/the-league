'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { SeasonData } from '@/lib/types';

const COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b',
];

interface Props {
  seasons: SeasonData[];
}

export default function RankChart({ seasons: rawSeasons }: Props) {
  const ownerSet = new Set<string>();
  for (const s of rawSeasons) {
    for (const t of s.standings) {
      if (t.ownerName && t.ownerName !== 'Unknown') ownerSet.add(t.ownerName);
    }
  }
  const owners = Array.from(ownerSet).sort();

  const data = rawSeasons.map(s => {
    const entry: Record<string, number | string> = { year: s.year };
    s.standings.forEach((t, i) => {
      if (t.ownerName && t.ownerName !== 'Unknown') {
        entry[t.ownerName] = t.rank || i + 1;
      }
    });
    return entry;
  });

  const maxRank = Math.max(...rawSeasons.map(s => s.standings.length), 10);

  if (!owners.length) return null;

  return (
    <div className="h-56 sm:h-[360px]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
        <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} />
        <YAxis
          reversed
          domain={[1, maxRank]}
          tick={{ fill: '#8b949e', fontSize: 12 }}
          label={{ value: 'Rank', angle: -90, fill: '#8b949e', fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
          labelStyle={{ color: '#e6edf3' }}
          formatter={(v: number) => [`#${v}`, '']}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {owners.map((owner, i) => (
          <Line
            key={owner}
            type="monotone"
            dataKey={owner}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}
