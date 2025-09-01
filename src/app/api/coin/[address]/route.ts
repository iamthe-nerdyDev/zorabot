import prisma from '@/lib/adapters/prisma';
import zora from '@/lib/adapters/zora';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: Promise<{ address: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  const identifier = req.cookies.get('identifier')?.value;
  const { address } = await params;

  const fns = [];
  fns.push(zora.getCoin(address));
  // --
  if (identifier) {
    fns.push(
      prisma.alert.findMany({
        where: {
          userId: identifier,
          coinAddress: address,
        },
      })
    );
    // --
    fns.push(
      prisma.watchlist.count({
        where: {
          userId: identifier,
          items: {
            some: {
              coinAddress: address,
            },
          },
        },
      })
    );
  }

  const response = await Promise.all(fns);
  const coin = response[0];
  const chart = coin ? await zora.getCoinMCDataPoints((coin as Coin).id) : null;
  return NextResponse.json(
    { data: { coin, chart, alert: response[1], inWatchlist: (response[2] as number) > 0 } },
    { status: 200 }
  );
}
