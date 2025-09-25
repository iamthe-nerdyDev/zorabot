'use server';

import prisma from '@/lib/adapters/prisma';

export async function getUserActivePositions(userAddress: string) {
  const activeMarkets = await prisma.priceMarket.findMany({
    where: {
      shares: {
        some: {
          userAddress: userAddress,
        },
      },
      OR: [
        // Market is still unresolved (ongoing)
        {
          outcome: 'UNRESOLVED',
        },
        // Market is resolved but user hasn't claimed
        {
          AND: [
            {
              outcome: {
                not: 'UNRESOLVED',
              },
            },
            {
              claims: {
                none: {
                  userAddress: userAddress,
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      token: true,
      bettingToken: true,
      creator: true,
      shares: {
        where: {
          userAddress: userAddress,
        },
      },
      claims: {
        where: {
          userAddress: userAddress,
        },
      },
    },
    orderBy: {
      endTs: 'desc',
    },
  });

  return activeMarkets;
}

export async function getUserMarketHistory(
  userAddress: string,
  options?: {
    includeActive?: boolean;
    limit?: number;
    offset?: number;
  }
) {
  const { includeActive = true, limit, offset } = options || {};

  const whereCondition: any = {
    OR: [
      // Markets where user has shares
      {
        shares: {
          some: {
            userAddress: userAddress,
          },
        },
      },
      // Markets where user has made claims
      {
        claims: {
          some: {
            userAddress: userAddress,
          },
        },
      },
    ],
  };

  // If we don't want active markets, filter them out
  if (!includeActive) {
    whereCondition.AND = [
      {
        outcome: {
          not: 'UNRESOLVED',
        },
      },
      // Only include markets where user has claimed
      {
        claims: {
          some: {
            userAddress: userAddress,
          },
        },
      },
    ];
  }

  const marketHistory = await prisma.priceMarket.findMany({
    where: whereCondition,
    include: {
      token: true,
      bettingToken: true,
      creator: true,
      shares: {
        where: {
          userAddress: userAddress,
        },
      },
      claims: {
        where: {
          userAddress: userAddress,
        },
      },
    },
    orderBy: [
      {
        resolved: 'desc', // Show resolved markets first in history
      },
      {
        endTs: 'desc',
      },
    ],
    ...(limit && { take: limit }),
    ...(offset && { skip: offset }),
  });

  return marketHistory;
}
