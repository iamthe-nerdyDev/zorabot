import React from 'react';
import { notFound } from 'next/navigation';
import { BASE_URL } from '@/lib/constants';
import RenderCoin from './_components/render-coin';

const Coin = async ({ params }: any) => {
  const { address } = await params;
  const res = await fetch(`${BASE_URL}/api/coin/${address}`);
  // --
  if (!res.ok) notFound();
  const data = (await res.json()).data as {
    coin: Coin;
    chart: ZoraChart;
  };

  return <RenderCoin data={data} />;
};

export default Coin;
