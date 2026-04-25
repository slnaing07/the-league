import type {
  FantraxLeagueInfoResponse,
  FantraxStandingsRow,
  MatchupResult,
  TeamStanding,
} from './types';
import { getFantraxBrowserSession } from './browser-auth';

const BASE_GET = 'https://www.fantrax.com/fxea/general';
const BASE_POST = 'https://www.fantrax.com/fxpa/req';

async function getAuthCookie(): Promise<string> {
  // 1. Manually-supplied cookie takes top priority (escape hatch)
  const manual = process.env.FANTRAX_SESSION_COOKIE;
  if (manual) return manual;

  // 2. Use headless browser to do a real login (handles WebSocket session establishment)
  const browserSession = await getFantraxBrowserSession();
  if (browserSession) return browserSession;

  return '';
}

const SHARED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json, text/javascript, */*',
  Referer: 'https://www.fantrax.com/',
};

async function fantraxGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const cookie = await getAuthCookie();
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_GET}/${path}?${qs}`, {
    headers: { ...SHARED_HEADERS, ...(cookie ? { Cookie: cookie } : {}) },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function fantraxPost<T>(
  leagueId: string,
  method: string,
  data: Record<string, unknown> = {}
): Promise<T> {
  const cookie = await getAuthCookie();
  const res = await fetch(`${BASE_POST}?leagueId=${leagueId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...SHARED_HEADERS,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({ msgs: [{ method, data: { leagueId, ...data } }] }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`POST ${method} → ${res.status}`);
  const json = await res.json();
  const resp = json?.responses?.[0];
  if (resp?.pageError && resp.pageError.code !== 'OK') {
    throw new Error(`Fantrax ${method}: ${resp.pageError.code}`);
  }
  return (resp?.data ?? json) as T;
}

// ─── Public fetchers ──────────────────────────────────────────────────────────

export async function fetchLeagueInfo(leagueId: string): Promise<FantraxLeagueInfoResponse> {
  return fantraxGet<FantraxLeagueInfoResponse>('getLeagueInfo', { leagueId });
}

export async function fetchRawStandings(leagueId: string): Promise<unknown> {
  return fantraxGet<unknown>('getStandings', { leagueId });
}

export async function fetchTeamRosters(leagueId: string, period?: number): Promise<unknown> {
  const params: Record<string, string> = { leagueId };
  if (period !== undefined) params.period = String(period);
  return fantraxGet<unknown>('getTeamRosters', params);
}

// Fetch season-total roster stats for all teams in a league in a single batched request.
// Returns a map of teamId → raw table data, or null if unauthenticated.
export async function fetchAllTeamRosterStats(
  leagueId: string,
  teamIds: string[]
): Promise<Record<string, unknown> | null> {
  if (!teamIds.length) return null;
  try {
    const cookie = await getAuthCookie();
    if (!cookie) return null;
    const res = await fetch(`${BASE_POST}?leagueId=${leagueId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...SHARED_HEADERS, Cookie: cookie },
      body: JSON.stringify({
        msgs: teamIds.map(teamId => ({
          method: 'getTeamRosterInfo',
          data: { leagueId, teamId },
        })),
      }),
      next: { revalidate: 86400 }, // past seasons don't change
    });
    if (!res.ok) return null;
    const json = await res.json();
    const responses = json?.responses as Array<{ data?: unknown }> | undefined;
    if (!Array.isArray(responses)) return null;
    return Object.fromEntries(teamIds.map((id, i) => [id, responses[i]?.data ?? null]));
  } catch {
    return null;
  }
}

// Fetch all per-gameweek matchup scores (requires browser session cookie).
// Returns null when unauthenticated so callers can degrade gracefully.
export async function fetchScheduleResults(leagueId: string): Promise<unknown | null> {
  try {
    return await fantraxPost<unknown>(leagueId, 'getStandings', { view: 'SCHEDULE' });
  } catch {
    return null;
  }
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

// Parse Fantrax "W-T-L" points string, e.g. "25-0-8"
function parsePointsString(s: string): [number, number, number] {
  const parts = s.split('-').map(Number);
  if (parts.length === 3) return [parts[0], parts[1], parts[2]]; // W-T-L
  if (parts.length === 2) return [parts[0], 0, parts[1]]; // W-L
  return [0, 0, 0];
}

export function normalizeStandings(raw: unknown): TeamStanding[] {
  if (!raw) return [];

  // Direct array from GET /getStandings
  if (Array.isArray(raw)) {
    return raw.map((row: FantraxStandingsRow, i) => {
      let wins = row.win ?? row.wins ?? 0;
      let losses = row.loss ?? row.losses ?? 0;
      let ties = row.tie ?? row.ties ?? 0;

      if (typeof row.points === 'string') {
        [wins, ties, losses] = parsePointsString(row.points);
      }

      const played = wins + losses + ties;
      return {
        teamId: row.teamId ?? row.id ?? String(i),
        teamName: row.teamName ?? row.name ?? 'Unknown',
        ownerName: row.ownerName ?? 'Unknown',
        rank: row.rank ?? row.pos ?? i + 1,
        wins,
        losses,
        ties,
        pointsFor:
          row.totalPointsFor ?? row.ptsFor ?? row.ptsFors ?? row.pointsFor ?? row.pts ?? 0,
        pointsAgainst: row.totalPointsAgainst ?? row.ptsAgainst ?? row.pointsAgainst ?? 0,
        winPct: row.winPercentage ?? row.winPct ?? (played > 0 ? wins / played : 0),
        streak: row.streak,
      };
    });
  }

  // Object-style responses (POST)
  if (typeof raw === 'object' && raw !== null) {
    const r = raw as Record<string, unknown>;
    const rows: FantraxStandingsRow[] =
      (r.standings as { tableList?: FantraxStandingsRow[] })?.tableList ??
      (r.tableList as FantraxStandingsRow[]) ??
      (r.teams as FantraxStandingsRow[]) ??
      [];
    return normalizeStandings(rows);
  }

  return [];
}

export function normalizeLeagueName(raw: FantraxLeagueInfoResponse): string {
  return raw?.leagueName ?? raw?.name ?? 'The League';
}

export function normalizeOwnerNames(info: FantraxLeagueInfoResponse): Record<string, string> {
  const map: Record<string, string> = {};
  if (info?.teamInfo) {
    for (const [id, team] of Object.entries(info.teamInfo)) {
      map[id] = team.ownerName ?? team.name ?? id;
    }
  }
  if (info?.teams) {
    for (const t of info.teams) {
      map[t.id] = t.ownerName ?? t.name ?? t.id;
    }
  }
  return map;
}

// Extract team-name → teamId map from league info
export function normalizeTeamNames(info: FantraxLeagueInfoResponse): Record<string, string> {
  const map: Record<string, string> = {};
  if (info?.teamInfo) {
    for (const [id, team] of Object.entries(info.teamInfo)) {
      map[id] = team.name ?? id;
    }
  }
  return map;
}

// Parse the matchup schedule out of getLeagueInfo (gives us who plays whom by period, no scores)
export function normalizeMatchups(info: FantraxLeagueInfoResponse): MatchupResult[] {
  const raw = info as unknown as Record<string, unknown>;
  const periods = raw?.matchups as Array<{
    period: number;
    matchupList: Array<{
      away: { id: string; name: string };
      home: { id: string; name: string };
    }>;
  }>;

  if (!Array.isArray(periods)) return [];

  const results: MatchupResult[] = [];
  for (const p of periods) {
    for (const m of p.matchupList ?? []) {
      results.push({
        period: p.period,
        awayTeamId: m.away.id,
        awayTeamName: m.away.name,
        awayScore: 0,
        homeTeamId: m.home.id,
        homeTeamName: m.home.name,
        homeScore: 0,
      });
    }
  }
  return results;
}

// Parse getStandings view=SCHEDULE response — all gameweeks with FPts scores per matchup.
// Cells with teamId are team cells; the cell immediately after each is the score.
// Different seasons use different row widths (4 or 8 cells), so we detect positions dynamically.
export function normalizeScheduleResults(raw: unknown): MatchupResult[] {
  if (!raw || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;

  type TableCell = { content?: string; teamId?: string };
  type TableRow = { cells?: TableCell[] };
  type TableEntry = { rows?: TableRow[] };
  const tableList = r.tableList as TableEntry[] | undefined;
  if (!Array.isArray(tableList)) return [];

  const results: MatchupResult[] = [];
  for (let i = 0; i < tableList.length; i++) {
    const period = i + 1;
    for (const row of tableList[i].rows ?? []) {
      const cells = row.cells ?? [];
      // Find team cells (cells with teamId) and pair each with the following score cell
      const teamCells: { idx: number; teamId: string; name: string }[] = [];
      for (let j = 0; j < cells.length; j++) {
        if (cells[j]?.teamId) {
          teamCells.push({ idx: j, teamId: cells[j].teamId!, name: cells[j].content ?? '' });
        }
      }
      if (teamCells.length !== 2) continue; // need exactly away + home
      const [away, home] = teamCells;
      const awayScore = parseFloat(cells[away.idx + 1]?.content ?? '0') || 0;
      const homeScore = parseFloat(cells[home.idx + 1]?.content ?? '0') || 0;
      results.push({
        period,
        awayTeamId: away.teamId,
        awayTeamName: away.name,
        awayScore,
        homeTeamId: home.teamId,
        homeTeamName: home.name,
        homeScore,
      });
    }
  }
  return results;
}
