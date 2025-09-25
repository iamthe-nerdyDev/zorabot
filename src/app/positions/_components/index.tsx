'use client';

import { getUserPossitionsHistory } from '@/app/predictions/_components/actions/metrics';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import MarketCard from '@/components/global/MarketCard';
import useAddress from '@/hooks/useAddress';
import { IconScale } from '@tabler/icons-react';
import { Loader } from '@/components/global/Loader';

export default function PositionsComponent() {
  const address = useAddress();
  const { isLoading, data: markets } = useQuery({
    enabled: !!address,
    queryKey: ['positions', address],
    queryFn: async () => (address ? await getUserPossitionsHistory(address) : []),
  });

  if (!address) {
    return <p className="p-3 opacity-70">Connect your wallet..</p>;
  }

  return (
    <div className="p-3">
      <div className="border-b mb-3">
        <div className="flex items-center gap-1.5 w-fit border-b border-white pb-1 px-1">
          <IconScale className="size-5 opacity-50" strokeWidth={1.7} />
          <p>Positions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-30">
          <Loader />
        </div>
      ) : !markets || markets.length === 0 ? (
        <p className="py-2 opacity-70">Nothing to see here..</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {markets.map((market, idx) => (
            <MarketCard market={market} key={`${market.id}-${idx}`} />
          ))}
        </div>
      )}
    </div>
  );
}
