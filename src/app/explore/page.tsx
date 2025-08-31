'use client';

import { Loader } from '@/components/global/Loader';
import SmartImage from '@/components/global/SmartImage';
import TimeAgo from '@/components/global/TimeAgo';
import Basescan from '@/components/icons/Basescan';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFilterSidebar } from '@/hooks/useFilterSideBar';
import { copyToClipboard, formatNumber, getPercentChange, toQueryString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { IconComet, IconUserScreen } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Compass, Copy, ListFilter } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useInView } from 'react-intersection-observer';

type CoinResponse = {
  data: null | {
    coins: Coin[];
    cursor: string | null;
  };
};

const tabs = [
  { title: 'Gainers', key: 'TOP_GAINERS' },
  { title: 'Top Volume (24h)', key: 'TOP_VOLUME_24H' },
  { title: 'Most Valuable', key: 'MOST_VALUABLE' },
  { title: 'Old Tokens', key: 'OLD' },
  { title: 'Last Traded Tokens', key: 'LAST_TRADED_UNIQUE' },
  { title: 'New Creators', key: 'NEW_CREATORS' },
  { title: 'Most Valuable Creators', key: 'MOST_VALUABLE_CREATORS' },
];

const Explore = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? tabs[0].key;
  // --
  const [filters, setFilters] = React.useState<Filters>({});
  const { ref, inView } = useInView();
  const { open } = useFilterSidebar();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<CoinResponse>({
      queryKey: ['explore', tab],
      initialPageParam: null,
      refetchInterval: 3000,
      getNextPageParam: (lastPage) => lastPage.data?.cursor ?? undefined,
      queryFn: async ({ pageParam = null }) => {
        const query = toQueryString({ listType: tab, cursor: pageParam });
        const res = await fetch(`/api/coins/explore?${query}`);
        // --
        if (!res.ok) return null;
        return res.json();
      },
    });

  const coins = (data?.pages.flatMap((page) => page.data?.coins) ?? []).filter((c) => !!c);
  const creators = React.useMemo(() => {
    const map = new Map<string, Creator>();
    coins.forEach((coin) => {
      if (!map.has(coin.creator.id)) {
        map.set(coin.creator.id, coin.creator);
      }
    });

    return Array.from(map.values());
  }, [coins]);

  const filteredCoins = React.useMemo(() => {
    return coins.filter((coin) => {
      if (filters.isContentToken && coin.isCreatorToken) return false;
      if (filters.isCreatorToken && !coin.isCreatorToken) return false;
      if (filters.creatorIds?.length && !filters.creatorIds.includes(coin.creator.handle)) {
        return false;
      }

      const totalVolume = parseFloat(coin.totalVolume || '0');
      const volume24h = parseFloat(coin.volume24h || '0');
      const marketCap = parseFloat(coin.marketCap || '0');
      const uniqueHolders = coin.uniqueHolders;

      if (filters.totalVolume?.min !== undefined && totalVolume < filters.totalVolume.min)
        return false;
      if (filters.totalVolume?.max !== undefined && totalVolume > filters.totalVolume.max)
        return false;
      if (filters.volume24h?.min !== undefined && volume24h < filters.volume24h.min) return false;
      if (filters.volume24h?.max !== undefined && volume24h > filters.volume24h.max) return false;
      if (filters.marketCap?.min !== undefined && marketCap < filters.marketCap.min) return false;
      if (filters.marketCap?.max !== undefined && marketCap > filters.marketCap.max) return false;
      if (filters.uniqueHolders?.min !== undefined && uniqueHolders < filters.uniqueHolders.min)
        return false;
      if (filters.uniqueHolders?.max !== undefined && uniqueHolders > filters.uniqueHolders.max)
        return false;

      return true;
    });
  }, [coins, filters]);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, inView, hasNextPage]);

  return (
    <div className="mb-5">
      <div className="p-3 gap-3 flex items-center justify-between sticky top-[61px] md:top-[65px] bg-background z-25 border-b">
        <div className="flex items-center gap-4">
          <h1 className="flex items-center gap-2 text-green-400">
            <Compass className="size-5.5" strokeWidth={2} />
            <span className="font-semibold text-xl truncate">Token Explorer</span>
          </h1>

          <div className="h-9">
            <Separator orientation="vertical" />
          </div>

          <Select value={tab} onValueChange={(value) => router.push(`?tab=${value}`)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map(({ key, title }) => (
                <SelectItem key={key} value={key}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="size-8 rounded-full sm:h-8.5 sm:w-21 sm:rounded-md"
            disabled={isLoading}
            onClick={() => {
              open({
                cb: setFilters,
                options: {
                  creators,
                  isContentToken: true,
                  isCreatorToken: true,
                  marketCap: true,
                  totalVolume: true,
                  uniqueHolders: true,
                  volume24h: true,
                },
              });
            }}
          >
            <span className="hidden sm:block">Filter</span>
            <ListFilter className="opacity-60 size-3.5" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[calc(100vh-150px)] md:h-[calc(100vh-150px)] flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {filteredCoins.map((coin, idx) => {
            const change = getPercentChange(Number(coin.marketCap), Number(coin.marketCapDelta24h));

            const tokenInfo = (
              <div className="flex items-center gap-2.5">
                <div>
                  <Tooltip>
                    <TooltipTrigger>
                      {coin.isCreatorToken ? (
                        <IconUserScreen className="size-5 text-yellow-400" strokeWidth={1.5} />
                      ) : (
                        <IconComet className="size-5 text-indigo-400" strokeWidth={1.5} />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">
                        {coin.isCreatorToken ? 'Creator Token' : 'Content Token'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2.5 w-40 shrink-0">
                  <Link href={`/coin/${coin.address}`}>
                    <SmartImage
                      src={coin.mediaContent.previewImage.medium}
                      alt={coin.symbol}
                      className="size-9 rounded-full"
                      loaderClassName="size-9 rounded-full bg-secondary"
                    />
                  </Link>
                  <div className="space-y-[1px]">
                    <h4 className="flex items-center gap-1">
                      <Link
                        href={`/coin/${coin.address}`}
                        className="font-medium text-xs truncate w-full max-w-30"
                      >
                        {coin.symbol}
                      </Link>
                      <button
                        className="opacity-60 shrink-0"
                        onClick={() => copyToClipboard(coin.address)}
                      >
                        <Copy className="size-3" strokeWidth={3} />
                      </button>
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <TimeAgo
                        className="text-orange-400 font-semibold text-xs opacity-100"
                        date={coin.created_at}
                      />
                      <Link href={`https://basescan.org/address/${coin.address}`} target="_blank">
                        <Basescan className="size-[13px] dark:text-[#555] #eee" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <div ref={idx === filteredCoins.length - 8 ? ref : undefined} key={coin.address}>
                {/** >= tablets */}
                <div className="hidden md:flex border w-full p-4 hover:bg-secondary/30 hover:border-gray-600 items-center gap-8">
                  {tokenInfo}

                  <div className="h-10">
                    <Separator orientation="vertical" />
                  </div>

                  <Link
                    href={`/coin/${coin.address}`}
                    className="w-full flex items-center gap-10 justify-between"
                  >
                    <div className="space-y-[1px] flex-1 text-end">
                      <p className="text-xs font-medium">{formatNumber(coin.uniqueHolders)}</p>
                      <p className="text-xs font-medium opacity-50 truncate">U. Holders </p>
                    </div>

                    <div className="space-y-[1px] flex-1 text-end">
                      <p className="text-xs font-medium">
                        ${formatNumber(Number(coin.totalVolume))}
                      </p>
                      <p className="text-xs font-medium opacity-50 truncate">Total Volume</p>
                    </div>

                    <div className="space-y-[1px] flex-1 text-end">
                      <p className="text-xs font-medium">${formatNumber(Number(coin.volume24h))}</p>
                      <p className="text-xs font-medium opacity-50 truncate">Volume (24h)</p>
                    </div>

                    <div className="space-y-[1px] flex-1 text-end">
                      <p className="text-xs font-medium flex items-center justify-end gap-1">
                        <span
                          className={cn(
                            'block lg:hidden',
                            change >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {change >= 0 ? (
                            <ChevronUp className="size-3.5" strokeWidth={3} />
                          ) : (
                            <ChevronDown className="size-3.5" strokeWidth={3} />
                          )}
                        </span>
                        <span>${formatNumber(Number(coin.marketCap))}</span>
                      </p>
                      <p className="text-xs font-medium opacity-50 truncate">Mkt Price</p>
                    </div>

                    <div className="hidden lg:block space-y-[1px] text-end flex-1">
                      <p
                        className={cn(
                          'flex items-center justify-end gap-0.5',
                          change >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {change >= 0 ? (
                          <ChevronUp className="size-3.5" strokeWidth={3} />
                        ) : (
                          <ChevronDown className="size-3.5" strokeWidth={3} />
                        )}
                        <span className="text-xs font-semibold">{formatNumber(change)}%</span>
                      </p>
                      <p className="text-xs font-medium opacity-50">24h</p>
                    </div>
                  </Link>
                </div>

                {/** <= mobile */}
                <div className="flex flex-col md:hidden border w-full hover:bg-secondary/30 hover:border-gray-600">
                  <div className="flex items-center justify-between border-b w-full p-4">
                    {tokenInfo}

                    <Link href={`/coin/${coin.address}`} className="flex items-center gap-5">
                      <div className="space-y-[1px] text-end flex-1">
                        <p
                          className={cn(
                            'flex items-center justify-end gap-0.5',
                            change >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {change >= 0 ? (
                            <ChevronUp className="size-3.5" strokeWidth={3} />
                          ) : (
                            <ChevronDown className="size-3.5" strokeWidth={3} />
                          )}
                          <span className="text-xs font-semibold">{formatNumber(change)}%</span>
                        </p>
                        <p className="text-xs font-medium opacity-50">24h</p>
                      </div>
                      <div className="space-y-[1px] flex-1 text-end">
                        <p className="text-xs font-medium">
                          ${formatNumber(Number(coin.marketCap))}
                        </p>
                        <p className="text-xs font-medium opacity-50 truncate">Mkt Price</p>
                      </div>
                    </Link>
                  </div>

                  <Link
                    href={`/coin/${coin.address}`}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="space-y-[1px] flex-1 text-center">
                      <p className="text-xs font-medium">{formatNumber(coin.uniqueHolders)}</p>
                      <p className="text-xs font-medium opacity-50 truncate">U. Holders </p>
                    </div>

                    <div className="space-y-[1px] flex-1 text-center">
                      <p className="text-xs font-medium">
                        ${formatNumber(Number(coin.totalVolume))}
                      </p>
                      <p className="text-xs font-medium opacity-50 truncate">Total Volume</p>
                    </div>

                    <div className="space-y-[1px] flex-1 text-center">
                      <p className="text-xs font-medium">${formatNumber(Number(coin.volume24h))}</p>
                      <p className="text-xs font-medium opacity-50 truncate">Volume (24h)</p>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isFetchingNextPage ? (
        <div className="flex items-center justify-center pb-5 pt-3">
          <Loader />
        </div>
      ) : null}
    </div>
  );
};

export default Explore;
