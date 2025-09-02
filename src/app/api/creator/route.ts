import zora from '@/lib/adapters/zora';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Address is missing in request query' }, { status: 400 });
  }

  const profile = await zora.getProfile(address);
  return NextResponse.json({ data: profile }, { status: 200 });
}
