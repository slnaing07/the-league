import { NextResponse } from 'next/server';
import { getAllPlayerStats } from '@/lib/player-data';

// Historical seasons never change; current season updates at most weekly
export const revalidate = 3600;

export async function GET() {
  const players = await getAllPlayerStats();
  return NextResponse.json({ players });
}
