'use client';

import { getActivity } from '@/app/predictions/_components/actions';
import { usePrivy } from '@privy-io/react-auth';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useAccount } from 'wagmi';
import React from 'react';
import { getImageURL, toNumber, truncate } from '@/lib/helpers';
import Basescan from '../icons/Basescan';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconActivity, IconLink } from '@tabler/icons-react';
import { Loader } from './Loader';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MarketActivity({ id }: { id: string }) {
  const { ref, inView } = useInView();
  const account = useAccount();
  const { user } = usePrivy();
  // --
  const address = React.useMemo(
    () => (account.address || user?.wallet?.address)?.toLowerCase(),
    [account.address, user?.wallet]
  );

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['activity', id],
    initialPageParam: 1,
    refetchInterval: 10 * 1000,
    queryFn: async ({ pageParam }) => await getActivity(id, pageParam),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.length === 0 ? undefined : lastPageParam + 1;
    },
  });

  const activities = (data?.pages.flatMap((page) => page) ?? []).filter((p) => !!p);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, inView, hasNextPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-50 border rounded-xl">
        <Loader />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col text-center items-center justify-center h-60 border rounded-xl">
        <IconActivity className="size-10 opacity-50 mb-3" strokeWidth={1.5} />
        <h5 className="text-lg font-semibold mb-0.5">No Activity Yet</h5>
        <p className="opacity-70 text-sm">Be the first one to place a bet</p>
      </div>
    );
  }

  // TODO: make the div scrollable
  return (
    <div className="p-4 border rounded-xl">
      <div className="flex flex-col gap-5.5">
        {activities.map((activity, idx) => (
          <div
            key={activity.id}
            ref={idx === activities.length ? ref : undefined} // intentional!
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <img src={getImageURL(activity.userAddress)} className="size-9 rounded-full" />
                <div>
                  <p className="text-sm font-medium mb-0.5">
                    {truncate(activity.userAddress)}&nbsp;
                    <span className="opacity-70">
                      {address?.toLowerCase() == activity.userAddress.toLowerCase()
                        ? '(You)'
                        : null}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    <Link
                      target="_blank"
                      href={`https://basescan.org/address/${activity.userAddress}`}
                    >
                      <Basescan className="size-3 opacity-50" />
                    </Link>
                    <Link target="_blank" href={`/creator/${activity.userAddress}`}>
                      <IconLink strokeWidth={1.6} className="size-4 opacity-50" />
                    </Link>
                  </div>
                </div>
              </div>

              <p className="text-sm">
                {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
              </p>
            </div>

            <p className="text-sm">
              Placed a bet of {toNumber(activity.amount, activity.market.bettingToken.decimals)}
              &nbsp;
              {activity.market.bettingToken.symbol}
              &nbsp;on&nbsp;
              <strong className={cn('', activity.isYes ? 'text-green-500' : 'text-red-500')}>
                {activity.isYes ? 'YES' : 'NO'}
              </strong>
            </p>
          </div>
        ))}
      </div>

      {isFetchingNextPage ? (
        <p className="text-gray-500 text-center pt-6 pb-2 text-sm flex items-center gap-2 justify-center">
          <Loader2 className="animate-spin size-4" />
          <span>Fetching more...</span>
        </p>
      ) : null}
    </div>
  );
}
