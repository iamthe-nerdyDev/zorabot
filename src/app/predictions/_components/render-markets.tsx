'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getMarkets } from './actions';
// import MarketSkeleton from '@/components/global/MarketSkeleton';
import MarketCard from '@/components/global/MarketCard';
import { Loader } from '@/components/global/Loader';
import { IconScale } from '@tabler/icons-react';
import useAddress from '@/hooks/useAddress';

type Props = {
  filter: 'trending' | 'ending-soon' | 'newest';
};

export default function RenderMarkets({ filter }: Props) {
  const { ref, inView } = useInView();
  // const address = useAddress();
  const address = '0x220cea70580da89994d708fe18732a7ac7b3ac66';

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
        <IconScale className="size-13 opacity-50 mb-2.5" strokeWidth={1} />
        <h5 className="text-xl font-semibold mb-[3px]">Nothing to see here</h5>
        <p className="opacity-70 text-sm">Check back later or try other options</p>
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
