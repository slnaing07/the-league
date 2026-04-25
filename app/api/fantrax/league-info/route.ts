import { NextRequest, NextResponse } from 'next/server';
import { fetchLeagueInfo, normalizeLeagueName, normalizeOwnerNames } from '@/lib/fantrax';

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get('leagueId');
  if (!leagueId) return NextResponse.json({ error: 'leagueId required' }, { status: 400 });

  try {
    const info = await fetchLeagueInfo(leagueId);
    return NextResponse.json({
      leagueName: normalizeLeagueName(info),
      ownerNames: normalizeOwnerNames(info),
      raw: info,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
