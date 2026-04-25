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

export default function PointsChart({ seasons: rawSeasons }: Props) {
  // Collect all unique owners across all seasons
  const ownerSet = new Set<string>();
  for (const s of rawSeasons) {
    for (const t of s.standings) {
      if (t.ownerName && t.ownerName !== 'Unknown') ownerSet.add(t.ownerName);
    }
  }
  const owners = Array.from(ownerSet).sort();

  // Build chart data: one entry per year
  const data = rawSeasons.map(s => {
    const entry: Record<string, number | string> = { year: s.year };
    for (const t of s.standings) {
      if (t.ownerName && t.ownerName !== 'Unknown') {
        entry[t.ownerName] = parseFloat(t.pointsFor.toFixed(1));
      }
    }
    return entry;
  });

  if (!owners.length || !data.length) {
    return (
      <div className="card text-center py-12 text-pitch-muted">
        No points data to chart yet.
      </div>
    );
  }

  return (
    <div className="h-56 sm:h-[360px]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
        <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 12 }} />
        <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
          labelStyle={{ color: '#e6edf3' }}
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
