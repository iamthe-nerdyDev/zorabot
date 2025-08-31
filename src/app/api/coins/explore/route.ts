import zora from '@/lib/adapters/zora';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listType = searchParams.get('listType');
  const cursor = searchParams.get('cursor');
  if (!listType) {
    return NextResponse.json({ error: 'listType is missing in request query' }, { status: 400 });
  }

  const arr = [
    'TOP_GAINERS',
    'TOP_VOLUME_24H',
    'MOST_VALUABLE',
    'OLD',
    'LAST_TRADED_UNIQUE',
    'NEW_CREATORS',
    'MOST_VALUABLE_CREATORS',
  ];
  // --
  if (!arr.includes(listType)) {
    return NextResponse.json(
      { error: `listType must be one of ${arr.join(', ')}` },
      { status: 400 }
    );
  }

  const response = await zora.getCoinsExplore(listType, cursor);
  return NextResponse.json({ data: response }, { status: 200 });
}
