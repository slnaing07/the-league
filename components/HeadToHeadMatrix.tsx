'use client';

import clsx from 'clsx';
import type { SeasonData, MatchupResult } from '@/lib/types';

interface H2H {
  wins: number;
  losses: number;
  ties: number;
}

function ownerLabel(owner: string): string {
  // Shorten long names for column headers
  const first = owner.split(' ')[0];
  return first.length > 10 ? first.slice(0, 10) + '…' : first;
}

function buildH2H(seasons: SeasonData[]): {
  owners: string[];
  matrix: Record<string, Record<string, H2H>>;
  matchupCount: Record<string, Record<string, number>>;
} {
  // Build teamId -> ownerName lookup per season
  const teamOwner: Record<number, Record<string, string>> = {};
  const ownerSet = new Set<string>();

  for (const s of seasons) {
    teamOwner[s.year] = {};
    for (const t of s.standings) {
      teamOwner[s.year][t.teamId] = t.ownerName;
      ownerSet.add(t.ownerName);
    }
  }

  const owners = Array.from(ownerSet).sort();

  // Initialize matrix
  const matrix: Record<string, Record<string, H2H>> = {};
  const matchupCount: Record<string, Record<string, number>> = {};
  for (const o of owners) {
    matrix[o] = {};
    matchupCount[o] = {};
    for (const o2 of owners) {
      if (o !== o2) {
        matrix[o][o2] = { wins: 0, losses: 0, ties: 0 };
        matchupCount[o][o2] = 0;
      }
    }
  }

  // Score matchups using ownerName (cross-season consistent)
  for (const s of seasons) {
    const ownerMap = teamOwner[s.year] ?? {};
    for (const m of s.matchups as MatchupResult[]) {
      const homeOwner = ownerMap[m.homeTeamId];
      const awayOwner = ownerMap[m.awayTeamId];
      if (!homeOwner || !awayOwner || homeOwner === awayOwner) continue;
      if (!matrix[homeOwner]?.[awayOwner]) continue;

      matchupCount[homeOwner][awayOwner]++;
      matchupCount[awayOwner][homeOwner]++;

      if (m.homeScore > m.awayScore) {
        matrix[homeOwner][awayOwner].wins++;
        matrix[awayOwner][homeOwner].losses++;
      } else if (m.awayScore > m.homeScore) {
        matrix[homeOwner][awayOwner].losses++;
        matrix[awayOwner][homeOwner].wins++;
      } else if (m.homeScore > 0) {
        matrix[homeOwner][awayOwner].ties++;
        matrix[awayOwner][homeOwner].ties++;
      }
    }
  }

  return { owners, matrix, matchupCount };
}

interface Props {
  seasons: SeasonData[];
}

export default function HeadToHeadMatrix({ seasons }: Props) {
  const { owners, matrix, matchupCount } = buildH2H(seasons);

  if (owners.length < 2) {
    return (
      <div className="text-center py-12 text-pitch-muted">
        Fill in <code className="text-emerald-400 bg-pitch-bg px-1 rounded">lib/managers.ts</code> with real manager names to enable the H2H matrix.
      </div>
    );
  }

  const hasAnyScores = owners.some(o =>
    owners.some(o2 => o !== o2 && (matrix[o]?.[o2]?.wins ?? 0) + (matrix[o]?.[o2]?.losses ?? 0) > 0)
  );

  return (
    <div className="space-y-3">
      {!hasAnyScores && (
        <p className="text-pitch-muted text-sm">
          Matchup schedule loaded — individual scores require authenticated API access.
          The matrix shows encounter counts (games played between each pair).
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse min-w-max">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-pitch-muted font-medium w-40 sticky left-0 bg-pitch-card z-10">
                ↓ vs →
              </th>
              {owners.map(o => (
                <th
                  key={o}
                  className="px-2 py-2 text-center text-pitch-muted font-medium w-20"
                  title={o}
                >
                  {ownerLabel(o)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {owners.map(row => (
              <tr key={row} className="border-t border-pitch-border/30">
                <td
                  className="px-3 py-2 font-medium text-sm text-white/90 whitespace-nowrap sticky left-0 bg-pitch-card z-10"
                  title={row}
                >
                  {row.length > 18 ? row.slice(0, 18) + '…' : row}
                </td>
                {owners.map(col => {
                  if (row === col) {
                    return (
                      <td key={col} className="px-2 py-2 text-center bg-pitch-card/30">
                        <span className="text-pitch-border">—</span>
                      </td>
                    );
                  }
                  const rec = matrix[row]?.[col];
                  const played = matchupCount[row]?.[col] ?? 0;
                  if (!rec) return <td key={col} className="px-2 py-2" />;

                  const total = rec.wins + rec.losses + rec.ties;
                  const winPct = total > 0 ? rec.wins / total : 0;

                  if (total === 0 && played === 0) {
                    return (
                      <td key={col} className="px-2 py-2 text-center text-pitch-border text-xs">
                        —
                      </td>
                    );
                  }

                  if (total === 0 && played > 0) {
                    // Schedule known but no scores
                    return (
                      <td key={col} className="px-2 py-2 text-center text-pitch-muted">
                        {played}g
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col}
                      className={clsx(
                        'px-2 py-2 text-center font-semibold rounded',
                        winPct > 0.5
                          ? 'text-emerald-400'
                          : winPct < 0.5
                          ? 'text-red-400'
                          : 'text-gold-400'
                      )}
                    >
                      {rec.wins}-{rec.losses}{rec.ties ? `-${rec.ties}` : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-pitch-muted text-xs">
        Read row vs column. Format: W-L. Green = winning record. Red = losing record.
      </p>
    </div>
  );
}
