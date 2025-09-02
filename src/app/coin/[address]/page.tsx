import React from 'react';
import { notFound } from 'next/navigation';
import { BASE_URL } from '@/lib/constants';
import RenderCoin from './_components/render-coin';
import { Metadata } from 'next';
import { formatNumber } from '@/lib/helpers';
import { Alert } from '@/generated/prisma';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { address } = await params;
  const res = await fetch(`${BASE_URL}/api/coin/${address}`, { cache: 'no-store' });
  // --
  const data = (await res.json()).data as {
    coin: Coin;
    chart: ZoraChart;
    alerts?: Alert[];
    inWatchlist?: boolean;
  };

  return {
    title: data ? `${data.coin.symbol} $${formatNumber(Number(data.coin.price.priceInUsdc))}` : '',
    description: data.coin.description,
  };
}

const Coin = async ({ params }: any) => {
  const { address } = await params;
  const res = await fetch(`${BASE_URL}/api/coin/${address}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  // --
  if (!res.ok) notFound();
  const data = (await res.json()).data as {
    coin: Coin;
    chart: ZoraChart;
  };

  return <RenderCoin data={data} />;
};

export default Coin;
