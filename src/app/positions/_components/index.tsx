'use client';

import { getUserActivePositions } from '@/app/predictions/_components/actions/metrics';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import React from 'react';
import MarketCard from '@/components/global/MarketCard';

export default function PositionsComponent() {
  const { address } = useAccount();
  const { authenticated, user, getAccessToken, logout } = usePrivy();
  // --
  const addr = React.useMemo(
    () => (address || user?.wallet?.address)?.toLowerCase(),
    [address, user?.wallet]
  );

  const { isLoading, data: markets } = useQuery({
    enabled: !!addr,
    queryKey: ['metrics', addr],
    queryFn: async () => (addr ? await getUserActivePositions(addr) : []),
  });

  return (
    <div>
      {/* <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-3">
          {markets?.map((market, idx) => (
            <MarketCard market={market} key={idx} />
          ))}
        </div>
      </div>

      <div></div> */}
    </div>
  );
}
