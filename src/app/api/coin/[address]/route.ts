import zora from '@/lib/adapters/zora';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: Promise<{ address: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { address } = await params;
  const coin = await zora.getCoin(address);
  const chart = coin ? await zora.getCoinMCDataPoints(coin.id) : null;
  return NextResponse.json({ data: { coin, chart } }, { status: 200 });
}
