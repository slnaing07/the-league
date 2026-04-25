import type { SeasonData, AllTimeStats } from './types';

export function buildAllTimeStats(seasons: SeasonData[]): AllTimeStats[] {
  const map = new Map<string, AllTimeStats>();

  for (const s of seasons) {
    for (const t of s.standings) {
      const key = t.ownerName;
      if (!key) continue;

      const existing = map.get(key) ?? {
        ownerName: key,
        seasons: 0,
        totalWins: 0,
        totalLosses: 0,
        totalTies: 0,
        totalPointsFor: 0,
        totalPointsAgainst: 0,
        championships: 0,
        regularSeasonTitles: 0,
        winPct: 0,
        avgPointsFor: 0,
        bestSeasonRank: Infinity,
        worstSeasonRank: 0,
      };

      existing.seasons++;
      existing.totalWins += t.wins;
      existing.totalLosses += t.losses;
      existing.totalTies += t.ties;
      existing.totalPointsFor += t.pointsFor;
      existing.totalPointsAgainst += t.pointsAgainst;
      if ((t.rank ?? 0) === 1) existing.championships++;
      if ((t.rank ?? 99) <= 4) existing.regularSeasonTitles++;
      if ((t.rank ?? 99) < existing.bestSeasonRank) existing.bestSeasonRank = t.rank ?? 99;
      if ((t.rank ?? 0) > existing.worstSeasonRank) existing.worstSeasonRank = t.rank ?? 0;

      map.set(key, existing);
    }
  }

  return Array.from(map.values()).map(s => {
    const played = s.totalWins + s.totalLosses + s.totalTies;
    return {
      ...s,
      winPct: played > 0 ? s.totalWins / played : 0,
      avgPointsFor: s.seasons > 0 ? s.totalPointsFor / s.seasons : 0,
      bestSeasonRank: s.bestSeasonRank === Infinity ? 0 : s.bestSeasonRank,
    };
  });
}
