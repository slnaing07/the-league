export interface TeamStanding {
  teamId: string;
  teamName: string;
  ownerName: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  winPct: number;
  streak?: string;
}

export interface SeasonData {
  year: number;
  leagueId: string;
  leagueName: string;
  standings: TeamStanding[];
  matchups: MatchupResult[];
}

export interface MatchupResult {
  period: number;
  awayTeamId: string;
  awayTeamName: string;
  awayScore: number;
  homeTeamId: string;
  homeTeamName: string;
  homeScore: number;
}

export interface H2HRecord {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface AllTimeStats {
  ownerName: string;
  seasons: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  totalPointsFor: number;
  totalPointsAgainst: number;
  championships: number;
  regularSeasonTitles: number;
  winPct: number;
  avgPointsFor: number;
  bestSeasonRank: number;
  worstSeasonRank: number;
}

export interface FantraxLeagueInfoResponse {
  leagueName?: string;
  name?: string;
  teamInfo?: Record<string, { name: string; ownerName?: string; ownerId?: string }>;
  teams?: Array<{ id: string; name: string; ownerName?: string }>;
}

export interface PlayerEntry {
  playerId: string;
  name: string;
  shortName: string;
  position: string;
  eplTeam: string;
  headshotUrl: string;
  year: number;
  ownerName: string;
  fantasyTeamName: string;
  fpts: number;
  gamesPlayed: number;
}

export interface FantraxStandingsRow {
  teamId?: string;
  id?: string;
  name?: string;
  teamName?: string;
  ownerName?: string;
  rank?: number;
  pos?: number;
  // W-L / W-T-L string format e.g. "25-0-8"
  points?: string;
  win?: number;
  wins?: number;
  loss?: number;
  losses?: number;
  tie?: number;
  ties?: number;
  pts?: number;
  ptsFors?: number;
  ptsFor?: number;
  totalPointsFor?: number;
  totalPointsAgainst?: number;
  ptsAgainst?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  winPercentage?: number;
  winPct?: number;
  gamesBack?: number;
  streak?: string;
}
