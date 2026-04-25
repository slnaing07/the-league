import { NextResponse } from 'next/server';
import { getAllPlayerStats } from '@/lib/player-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const players = await getAllPlayerStats();
  return NextResponse.json({ players });
}
