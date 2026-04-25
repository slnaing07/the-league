import { NextRequest, NextResponse } from 'next/server';
import { fetchRawStandings, normalizeStandings } from '@/lib/fantrax';

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get('leagueId');
  if (!leagueId) return NextResponse.json({ error: 'leagueId required' }, { status: 400 });

  try {
    const raw = await fetchRawStandings(leagueId);
    const standings = normalizeStandings(raw);
    return NextResponse.json({ standings, raw });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
