'use client';

import { coinColumns } from '@/app/page';
import DataTable from '@/components/global/DataTable';
import { Loader } from '@/components/global/Loader';
import { Button } from '@/components/ui/button';
import { useFilterSidebar } from '@/hooks/useFilterSideBar';
import useTableDiv from '@/hooks/useTableDiv';
import { toQueryString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  IconActivity,
  IconClock,
  IconCurrencyDollar,
  IconHistory,
  IconStar,
  IconTrendingUp,
  IconUserPlus,
} from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Compass, ListFilter } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { useInView } from 'react-intersection-observer';

type CoinResponse = {
  data: null | {
    coins: Coin[];
    cursor: string | null;
  };
};

export default function ExploreComponent() {
  const { headerHeight, headerRef } = useTableDiv();
  const tabs = [
    {
      title: 'Top Volume (24h)',
      key: 'TOP_VOLUME_24H',
      icon: IconActivity,
    },
    {
      title: 'Gainers',
      key: 'TOP_GAINERS',
      icon: IconTrendingUp,
    },
    {
      title: 'Most Valuable',
      key: 'MOST_VALUABLE',
      icon: IconCurrencyDollar,
    },
    {
      title: 'Old Tokens',
      key: 'OLD',
      icon: IconHistory,
    },
    {
      title: 'Last Traded Tokens',
      key: 'LAST_TRADED_UNIQUE',
      icon: IconClock,
    },
    {
      title: 'New Creators',
      key: 'NEW_CREATORS',
      icon: IconUserPlus,
    },
    {
      title: 'Most Valuable Creators',
      key: 'MOST_VALUABLE_CREATORS',
      icon: IconStar,
    },
  ];

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
      // refetchInterval: 3000,
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

  const FilterBtn = () => {
    return (
      <Button
        className="h-8.5 w-21 rounded-md"
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
        <span>Filter</span>
        <ListFilter className="opacity-60 size-3.5" strokeWidth={2} />
      </Button>
    );
  };

  return (
    <div>
      <div
        ref={headerRef}
        className="p-3 gap-3 flex flex-col 2xl:flex-row 2xl:items-center justify-between sticky top-[61px] md:top-[65px] bg-background z-25 border-b"
      >
        <div className="flex items-center gap-4 w-full 2xl:w-max justify-between">
          <h1 className="flex items-center gap-2 text-green-400">
            <Compass className="size-5.5" strokeWidth={2} />
            <span className="font-semibold text-xl truncate">Tokens Explorer</span>
          </h1>

          {/* <Select value={tab} onValueChange={(value) => router.push(`?tab=${value}`)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map(({ key, title }) => (
                <SelectItem key={key} value={key}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <div className="2xl:hidden">
            <FilterBtn />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap border-t -mx-3 pt-3 px-3 2xl:border-none 2xl:p-0 2xl:m-0">
          {tabs.map(({ key, title, ...item }) => {
            const isActive = tab === key;
            return (
              <Link
                href={`?tab=${key}`}
                key={key}
                className={cn(
                  'border flex items-center gap-2 px-3.5 py-2',
                  isActive && 'border-violet-300 text-violet-300'
                )}
              >
                <item.icon className="size-4.5 opacity-60" />
                <span className={cn('whitespace-nowrap text-sm', isActive && 'font-semibold')}>
                  {title}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="hidden 2xl:block">
          <FilterBtn />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-30">
          <Loader />
        </div>
      ) : (
        <div className="overflow-y-hidden">
          <DataTable<Coin>
            columns={coinColumns}
            data={filteredCoins}
            triggerRowRef={ref}
            triggerOffset={10}
            containerClassName="pb-17 md:pb-0"
            containerStyles={{ height: `calc(100dvh - ${headerHeight + 110}px)` }}
          />
        </div>
      )}
    </div>
  );
}
