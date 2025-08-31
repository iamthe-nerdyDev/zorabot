'use client';

import { Loader } from '@/components/global/Loader';
import { formatNumber, toQueryString } from '@/lib/helpers';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowRightLeft, Filter } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Skeleton from 'react-loading-skeleton';
import React from 'react';
import TimeAgo from '@/components/global/TimeAgo';
import Basescan from '@/components/icons/Basescan';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CoinSwapsResponse = {
  data: null | {
    total: number;
    swaps: CoinSwap[];
    cursor: string | null;
  };
};

const toAmount = (balance: string) => {
  return (BigInt(balance) / BigInt(10 ** 18)).toString();
};

export default function CoinSwaps({ coin }: { coin: Coin }) {
  const { ref, inView } = useInView();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<CoinSwapsResponse>({
      queryKey: ['swaps', coin.id],
      initialPageParam: null,
      refetchInterval: 2000,
      getNextPageParam: (lastPage) => lastPage.data?.cursor ?? undefined,
      queryFn: async ({ pageParam = null }) => {
        const query = toQueryString({ address: coin.address, cursor: pageParam });
        const res = await fetch(`/api/coins/swaps?${query}`);
        // --
        if (!res.ok) return null;
        return res.json();
      },
    });

  const swaps = (data?.pages.flatMap((page) => page.data?.swaps) ?? []).filter((c) => !!c);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, inView, hasNextPage]);

  return (
    <div className="mb-5">
      {swaps.length === 0 && !isLoading ? (
        <div className="py-15 flex flex-col items-center justify-center gap-2.5">
          <ArrowRightLeft className="size-10 opacity-60" strokeWidth={1} />
          <p className="text-xl opacity-80">No swaps yet!</p>
          <Link href={'?tab=trade'}>
            <Button variant={'link'}>
              <span>Make a trade</span>
              <ArrowRight className="opacity-50 size-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <React.Fragment>
          <table className="min-w-full border-collapse">
            <thead className="bg-secondary sticky top-15 lg:top-[44.5px] z-20">
              <tr>
                <th className="text-xs font-medium select-none whitespace-nowrap text-gray-400 p-2.5 text-start">
                  Time Ago
                </th>
                <th className="text-xs font-medium select-none whitespace-nowrap text-gray-400 p-2.5 text-start">
                  Type
                </th>
                <th className="text-xs font-medium select-none whitespace-nowrap text-gray-400 p-2.5 text-start">
                  Price <span className="text-green-400">USD</span>
                </th>
                <th className="text-xs font-medium select-none whitespace-nowrap text-gray-400 p-2.5 text-start">
                  <p className="w-full max-w-20 md:max-w-max lg:max-w-20 truncate">
                    Amount {coin.symbol}
                  </p>
                </th>
                <th className="text-xs font-medium select-none whitespace-nowrap text-gray-400 p-2.5 text-start">
                  <p className="flex items-center gap-1.5">
                    <Filter className="size-3" strokeWidth={2.5} />
                    <span>Maker</span>
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 12 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className={cn('px-3 py-1.5', idx === 0 && 'pt-3')}>
                        <Skeleton baseColor="#333" highlightColor="#444" height={8} width={30} />
                      </td>
                      <td className={cn('px-3 py-1.5', idx === 0 && 'pt-3')}>
                        <Skeleton baseColor="#333" highlightColor="#444" height={8} width={30} />
                      </td>
                      <td className={cn('px-3 py-1.5', idx === 0 && 'pt-3')}>
                        <Skeleton baseColor="#333" highlightColor="#444" height={8} width={30} />
                      </td>
                      <td className={cn('px-3 py-1.5', idx === 0 && 'pt-3')}>
                        <Skeleton baseColor="#333" highlightColor="#444" height={8} width={50} />
                      </td>
                      <td className={cn('px-3 py-1.5', idx === 0 && 'pt-3')}>
                        <Skeleton baseColor="#333" highlightColor="#444" height={8} width={30} />
                      </td>
                    </tr>
                  ))
                : swaps.map((swap, idx) => (
                    <tr
                      key={swap.id}
                      ref={idx === swaps.length - 1 ? ref : undefined}
                      className="hover:bg-secondary/60"
                    >
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            target="_blank"
                            href={`https://basescan.org/transaction/${swap.transactionHash}`}
                          >
                            <Basescan className="size-[13px] dark:text-[#555] #eee" />
                          </Link>
                          <TimeAgo
                            className="text-gray-400 font-semibold text-xs opacity-100"
                            date={swap.blockTimestamp}
                          />
                        </div>
                      </td>
                      <td className="p-2.5">
                        <p
                          className={cn(
                            'text-xs font-medium',
                            swap.activityType === 'BUY' ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {swap.activityType}
                        </p>
                      </td>
                      <td className="p-2.5">
                        <p className="text-xs font-medium">
                          $
                          {formatNumber(
                            Number(swap.currencyAmountWithPrice.priceUsdc) *
                              swap.currencyAmountWithPrice.currencyAmount.amountDecimal
                          )}
                        </p>
                      </td>
                      <td className="p-2.5">
                        <p className="text-xs font-medium">
                          {formatNumber(Number(toAmount(swap.coinAmount)))}
                        </p>
                      </td>
                      <td className="p-2.5">
                        <p className="flex items-center gap-1.5">
                          <Filter className="size-3" />
                          <span className="text-xs font-medium opacity-60 border-b border-white border-dotted">
                            {swap.senderAddress.slice(-5)}
                          </span>
                        </p>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {isFetchingNextPage ? (
            <div className="flex items-center justify-center py-5">
              <Loader />
            </div>
          ) : null}
        </React.Fragment>
      )}
    </div>
  );
}
