import prisma from '@/lib/adapters/prisma';
import zora from '@/lib/adapters/zora';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: Promise<{ address: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  const identifier = req.cookies.get('identifier')?.value;
  const { address } = await params;
  const user = identifier ? await prisma.user.findFirst({ where: { id: identifier } }) : null;

  const userAddressFilter = user
    ? {
        where: {
          userAddress: user.address,
        },
      }
    : false;

  const fns = [];
  fns.push(zora.getCoin(address));
  fns.push(
    prisma.priceMarket.findMany({
      where: {
        tokenAddress: address,
        resolved: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        token: true,
        bettingToken: true,
        creator: true,
        claims: userAddressFilter,
        shares: userAddressFilter,
      },
    })
  );

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
    {
      data: {
        coin,
        chart,
        markets: response[1],
        alert: response[2],
        inWatchlist: (response[3] as number) > 0,
      },
    },
    { status: 200 }
  );
}
