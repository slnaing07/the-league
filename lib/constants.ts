export const SEASONS = [
  { year: 2019, leagueId: '64te0orgjxalun20' },
  { year: 2020, leagueId: 'xunzjjetkdnunjzk' },
  { year: 2021, leagueId: 'b6e7hihkkq92a9hq' },
  { year: 2022, leagueId: '1y41ohccl3jj07fo' },
  { year: 2023, leagueId: 'mjcpr1shlj3kxyv7' },
  { year: 2024, leagueId: 'qm4om93vlxnl9z24' },
  { year: 2025, leagueId: 'stcmpg3vmbts5w1a' },
] as const;

export const SEASON_BY_YEAR: Record<number, string> = Object.fromEntries(
  SEASONS.map(s => [s.year, s.leagueId])
);

export const LEAGUE_YEARS = SEASONS.map(s => s.year);
export const CURRENT_YEAR = 2025;
export const LEAGUE_NAME = 'The League';
