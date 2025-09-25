'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getMarkets } from './actions';
// import MarketSkeleton from '@/components/global/MarketSkeleton';
import MarketCard from '@/components/global/MarketCard';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { Loader } from '@/components/global/Loader';
import { IconBinaryTree } from '@tabler/icons-react';

type Props = {
  filter: 'trending' | 'ending-soon' | 'newest';
};

export default function RenderMarkets({ filter }: Props) {
  const { ref, inView } = useInView();
  const account = useAccount();
  const { user } = usePrivy();
  // --
  const address = React.useMemo(
    () => (account.address || user?.wallet?.address)?.toLowerCase(),
    [account.address, user?.wallet]
  );

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['markets', filter, address],
    initialPageParam: 1,
    enabled: !!filter,
    queryFn: async ({ pageParam }) => await getMarkets(filter, pageParam, { userAddress: address }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.length === 0 ? undefined : lastPageParam + 1;
    },
  });

  const markets = (data?.pages.flatMap((page) => page) ?? []).filter((p) => !!p);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, inView, hasNextPage]);

  if (isLoading) {
    // return (
    //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-3">
    //     {Array.from({ length: 6 }, (_, i) => (
    //       <MarketSkeleton key={`skeleton-${i}`} />
    //     ))}
    //   </div>
    // );
    return (
      <div className="flex flex-col text-center items-center justify-center h-80">
        <Loader />
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="flex flex-col text-center items-center justify-center h-80">
        <IconBinaryTree className="size-12 opacity-50 mb-3" strokeWidth={1} />
        <h5 className="text-lg font-semibold mb-0.5">Nothing to see here</h5>
        <p className="opacity-70 text-sm">Try other options, might be a filter issue</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-3">
        {markets.map((market, idx) => (
          <MarketCard
            ref={idx === markets.length ? ref : undefined} // intentional!
            market={market}
            key={idx}
            isTrending={filter === 'trending'}
          />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-15">
          <Loader />
        </div>
      )}
    </div>
  );
}
