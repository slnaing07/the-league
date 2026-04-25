import { SEASONS } from './constants';
import { fetchTeamRosters, fetchAllTeamRosterStats } from './fantrax';
import { getAllSeasons } from './data';
import type { PlayerEntry } from './types';

type RosterItem = { id: string; position?: string; status?: string };
type RosterTeam = { teamName?: string; rosterItems?: RosterItem[] };
type RostersResponse = { rosters?: Record<string, RosterTeam> };

type TableCell = { content?: string } | string;
type TableRow = {
  scorer?: {
    scorerId?: string;
    name?: string;
    shortName?: string;
    posShortNames?: string;
    teamName?: string;
    headshotUrl?: string;
  };
  cells?: TableCell[];
};
type TableHeader = { cells?: Array<{ shortName?: string; name?: string }> };
type RosterInfoData = {
  tables?: Array<{ rows?: TableRow[]; header?: TableHeader }>;
  fantasyTeams?: Record<string, { name?: string }>;
};

function cellContent(cell: TableCell): string {
  if (!cell) return '';
  return typeof cell === 'string' ? cell : (cell.content ?? '');
}

function parseFpts(val: string): number {
  const n = parseFloat(val.replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

export async function getAllPlayerStats(): Promise<PlayerEntry[]> {
  // Fetch standings (for owner mapping) and all team rosters in parallel
  const [seasons, ...rosterResults] = await Promise.all([
    getAllSeasons(),
    ...SEASONS.map(({ leagueId }) =>
      fetchTeamRosters(leagueId).catch(() => null) as Promise<RostersResponse | null>
    ),
  ]);

  const teamOwner: Record<string, Record<string, string>> = {};
  const teamName: Record<string, Record<string, string>> = {};
  for (const s of seasons) {
    teamOwner[s.year] = {};
    teamName[s.year] = {};
    for (const t of s.standings) {
      teamOwner[s.year][t.teamId] = t.ownerName;
      teamName[s.year][t.teamId] = t.teamName;
    }
  }

  const allEntries: PlayerEntry[] = [];

  await Promise.allSettled(
    SEASONS.map(async ({ year, leagueId }, idx) => {
      const rostersRaw = rosterResults[idx];
      const teamIds = Object.keys(rostersRaw?.rosters ?? {});
      if (!teamIds.length) return;

      // Batch-fetch roster stats for all teams in one POST
      const statsMap = await fetchAllTeamRosterStats(leagueId, teamIds);
      if (!statsMap) return;

      for (const teamId of teamIds) {
        const owner = teamOwner[year]?.[teamId];
        const fantasyTeam = teamName[year]?.[teamId];
        if (!owner) continue;

        const data = statsMap[teamId] as RosterInfoData | null;
        if (!data) continue;

        for (const table of data.tables ?? []) {
          // Build column index map from header
          const headerCells = table.header?.cells ?? [];
          let fptsIdx = 1, gpIdx = 3; // sensible defaults
          headerCells.forEach((h, i) => {
            const key = (h.shortName ?? h.name ?? '').toUpperCase();
            if (key === 'FPTS') fptsIdx = i;
            if (key === 'GP') gpIdx = i;
          });

          for (const row of table.rows ?? []) {
            const scorer = row.scorer;
            if (!scorer?.scorerId) continue;
            const cells = row.cells ?? [];
            const fpts = parseFpts(cellContent(cells[fptsIdx]));
            const gamesPlayed = parseInt(cellContent(cells[gpIdx])) || 0;
            if (fpts === 0 && gamesPlayed === 0) continue;

            allEntries.push({
              playerId: scorer.scorerId,
              name: scorer.name ?? scorer.shortName ?? scorer.scorerId,
              shortName: scorer.shortName ?? scorer.name ?? scorer.scorerId,
              position: scorer.posShortNames ?? '?',
              eplTeam: scorer.teamName ?? '',
              headshotUrl: scorer.headshotUrl ?? '',
              year,
              ownerName: owner,
              fantasyTeamName: fantasyTeam ?? '',
              fpts,
              gamesPlayed,
            });
          }
        }
      }
    })
  );

  return allEntries;
}
