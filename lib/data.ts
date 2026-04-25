import { SEASONS } from './constants';
export { buildAllTimeStats } from './stats';
import {
  fetchLeagueInfo,
  fetchRawStandings,
  fetchScheduleResults,
  normalizeStandings,
  normalizeLeagueName,
  normalizeTeamNames,
  normalizeMatchups,
  normalizeScheduleResults,
} from './fantrax';
import { buildManagerLookup, resolveManager } from './managers';
import type { SeasonData } from './types';

const managerLookup = buildManagerLookup();

export async function getAllSeasons(): Promise<SeasonData[]> {
  const results = await Promise.allSettled(
    SEASONS.map(async ({ year, leagueId }): Promise<SeasonData> => {
      const [infoRes, standRes, scheduleRes] = await Promise.allSettled([
        fetchLeagueInfo(leagueId),
        fetchRawStandings(leagueId),
        fetchScheduleResults(leagueId),
      ]);

      const info = infoRes.status === 'fulfilled' ? infoRes.value : {};
      const teamNames = normalizeTeamNames(info);
      const scheduleRaw = scheduleRes.status === 'fulfilled' ? scheduleRes.value : null;
      // Use authenticated schedule results (with scores) when available, else public schedule (no scores)
      const matchups = scheduleRaw
        ? normalizeScheduleResults(scheduleRaw)
        : normalizeMatchups(info);

      let standings =
        standRes.status === 'fulfilled' ? normalizeStandings(standRes.value) : [];

      // Patch in canonical team name from league info, then resolve manager
      standings = standings
        .map(s => {
          const teamName = teamNames[s.teamId] ?? s.teamName;
          const ownerName = resolveManager(year, teamName, managerLookup);
          return { ...s, teamName, ownerName };
        })
        // Drop any entry that couldn't be mapped to a known manager
        .filter(s => s.ownerName !== s.teamName);

      return {
        year,
        leagueId,
        leagueName: normalizeLeagueName(info),
        standings,
        matchups,
      };
    })
  );

  return results
    .map(r => (r.status === 'fulfilled' ? r.value : null))
    .filter((s): s is SeasonData => s !== null);
}

