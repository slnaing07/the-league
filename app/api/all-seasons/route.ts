import { NextResponse } from 'next/server';
import { getAllSeasons } from '@/lib/data';

export async function GET() {
  const seasons = await getAllSeasons();
  return NextResponse.json({ seasons });
}
