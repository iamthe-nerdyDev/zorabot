'use server';

import prisma from '@/lib/adapters/prisma';
import type { CustomPriceMarket } from '@/types';

export async function getActivity(marketId: string, page = 1) {
  const limit = 12;
  const skip = (page - 1) * limit;

  return await prisma.shares.findMany({
    where: {
      marketId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: limit,
    include: {
      user: true,
      market: {
        include: {
          bettingToken: true,
        },
      },
    },
  });
}

export async function getMarkets(
  filter: 'trending' | 'ending-soon' | 'newest',
  page = 1,
  opts?: { tokenAddress?: string; userAddress?: string }
): Promise<CustomPriceMarket[]> {
  const limit = 12;
  const skip = (page - 1) * limit;

  let orderBy: any = {};
  let where: any = {};

  if (opts?.tokenAddress) {
    where.tokenAddress = opts.tokenAddress;
  }

  const userAddressFilter = opts?.userAddress
    ? {
        where: {
          userAddress: opts?.userAddress,
        },
      }
    : false;

  if (filter === 'trending') {
    const totals: Array<{ marketId: string; shares_count: number }> = await prisma.$queryRaw`
        SELECT s.marketId, COUNT(*) as shares_count
        FROM shares s
        JOIN priceMarkets pm ON s.marketId = pm.id
        WHERE pm.resolved = false
        GROUP BY s.marketId
        ORDER BY COUNT(*) DESC
        LIMIT ${limit} OFFSET ${skip}
    `;

    console.log(totals);

    const marketIds = totals.map((t) => t.marketId);
    if (marketIds.length === 0) return [];

    const markets = await prisma.priceMarket.findMany({
      where: {
        id: {
          in: marketIds,
        },
      },
      include: {
        token: true,
        bettingToken: true,
        creator: true,
        claims: userAddressFilter,
        shares: userAddressFilter,
      },
    });

    return marketIds.map((id) => markets.find((m) => m.id === id)!);
  }

  // where.resolved = false;

  if (filter === 'ending-soon') {
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

    where.endTs = {
      lte: twentyFourHoursFromNow,
      gte: new Date(),
    };

    orderBy = {
      endTs: 'asc',
    };
  }

  if (filter === 'newest') {
    orderBy = {
      createdAt: 'desc',
    };
  }

  const markets = await prisma.priceMarket.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      token: true,
      bettingToken: true,
      creator: true,
      claims: userAddressFilter,
      shares: userAddressFilter,
    },
  });

  return markets;
}
