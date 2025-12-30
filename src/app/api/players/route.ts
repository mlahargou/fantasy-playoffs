import { NextResponse } from 'next/server';
import { getPlayoffPlayers } from '@/lib/sleeper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const position = searchParams.get('position');
   const search = searchParams.get('search') || '';

   if (!position || !['QB', 'WR', 'RB', 'TE'].includes(position)) {
      return NextResponse.json({ error: 'Invalid position' }, { status: 400 });
   }

   try {
      const players = await getPlayoffPlayers(position, search);
      return NextResponse.json({ players });
   } catch (error) {
      console.error('Error fetching players:', error);
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
   }
}
