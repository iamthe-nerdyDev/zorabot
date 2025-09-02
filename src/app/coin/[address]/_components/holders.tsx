'use client';

import { Loader } from '@/components/global/Loader';
import SmartImage from '@/components/global/SmartImage';
import { Separator } from '@/components/ui/separator';
import { copyToClipboard, formatNumber, toNumber, toQueryString } from '@/lib/helpers';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Copy, UserRoundCog } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Skeleton from 'react-loading-skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IconCircleSquare } from '@tabler/icons-react';
import React from 'react';

type CoinHoldersResponse = {
  data: null | {
    total: number;
    holders: CoinHolder[];
    cursor: string | null;
  };
};

const holderPercent = (balance: string) => {
  return (toNumber(balance) * 100) / 10 ** 9;
};

export default function CoinHolders({ coin }: { coin: Coin }) {
  const { ref, inView } = useInView();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<CoinHoldersResponse>({
      queryKey: ['holders', coin.id],
      initialPageParam: null,
      refetchInterval: 2000,
      getNextPageParam: (lastPage) => lastPage.data?.cursor ?? undefined,
      queryFn: async ({ pageParam = null }) => {
        const query = toQueryString({ address: coin.address, cursor: pageParam });
        const res = await fetch(`/api/coins/holders?${query}`);
        // --
        if (!res.ok) return null;
        return res.json();
      },
    });

  const total = data?.pages[0].data?.total ?? 0;
  const holders = (data?.pages.flatMap((page) => page.data?.holders) ?? []).filter((c) => !!c);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, inView, hasNextPage]);

  if (isLoading || !data) {
    return (
      <div className="p-3.5 space-y-5">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Skeleton baseColor="#333" highlightColor="#444" circle height={39} width={39} />
              <div>
                <Skeleton baseColor="#333" highlightColor="#444" height={10} width={80} />
                <Skeleton baseColor="#333" highlightColor="#444" height={8} width={36} />
              </div>
            </div>

            <Skeleton baseColor="#333" highlightColor="#444" height={8} width={40} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 p-4">
        <p className="text-sm">Holders</p>
        <div className="w-6">
          <Separator />
        </div>
        <p className="font-medium text-sm">{formatNumber(total)}</p>
      </div>

      <ol className="p-3.5 pt-1 space-y-5.5">
        {holders.map((holder, idx) => (
          <li
            key={holder.ownerAddress}
            ref={idx === holders.length - 1 ? ref : undefined}
            className="flex items-center gap-3.5"
          >
            <p className="text-[13px] min-w-6 font-medium opacity-60 lg:hidden">
              {(idx + 1).toLocaleString()}
            </p>
            <div className="flex items-start justify-between w-full">
              <div className="flex items-center gap-2.5">
                <SmartImage
                  src={holder.ownerProfile.avatar?.previewImage.medium ?? '/avatar.png'}
                  alt={holder.ownerAddress}
                  className="size-9 rounded-full"
                  loaderClassName="size-9 rounded-full bg-secondary"
                />
                <div className="space-y-[3px]">
                  <p className="flex items-center gap-1.5">
                    <span className="text-sm flex items-center gap-1.5">
                      <span>{holder.ownerProfile.handle}</span>
                      {holder.ownerAddress == coin.creator.address ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <UserRoundCog className="size-3.5 stroke-yellow-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">Creator</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : holder.ownerAddress == coin.uniswapPoolAddress ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <IconCircleSquare className="size-[15px] stroke-indigo-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">Market</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </span>
                    <button onClick={() => copyToClipboard(holder.ownerAddress)}>
                      <Copy className="size-3 opacity-50" />
                    </button>
                  </p>
                  <p className="text-green-400 text-xs font-medium">
                    {holderPercent(holder.balance).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <p className="text-[13px] font-medium">
                  ${formatNumber(toNumber(holder.balance) * Number(coin.price.priceInUsdc))}
                </p>
                <div className="h-4">
                  <Separator orientation="vertical" />
                </div>
                <p className="text-xs font-medium opacity-60">
                  {formatNumber(toNumber(holder.balance))} units
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {isFetchingNextPage ? (
        <div className="flex items-center justify-center py-5">
          <Loader />
        </div>
      ) : null}
    </div>
  );
}
