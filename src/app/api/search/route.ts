import zora from '@/lib/adapters/zora';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  if (!query) return NextResponse.json({ data: null });
  // --
  const response = await zora.search(query);
  return NextResponse.json({ data: response });
}
