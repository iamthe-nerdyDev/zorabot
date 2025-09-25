'use client';

import DataTable from '@/components/global/DataTable';
import { Loader } from '@/components/global/Loader';
import QuickBuy from '@/components/global/QuickBuy';
import SmartImage from '@/components/global/SmartImage';
import TimeAgo from '@/components/global/TimeAgo';
import Basescan from '@/components/icons/Basescan';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFilterSidebar } from '@/hooks/useFilterSideBar';
import { useStorage } from '@/hooks/useStorage';
import { copyToClipboard, formatNumber, getPercentChange, toQueryString } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { IconUserScreen, IconComet } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Coins, Copy, ListFilter } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useInView } from 'react-intersection-observer';

type CoinResponse = {
  data: null | {
    coins: Coin[];
    cursor: string | null;
  };
};

export const coinColumns: ColumnDef<Coin>[] = [
  {
    header: 'Token',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div>
          <Tooltip>
            <TooltipTrigger>
              {row.original.isCreatorToken ? (
                <IconUserScreen className="size-5 text-yellow-400" strokeWidth={1.5} />
              ) : (
                <IconComet className="size-5 text-indigo-400" strokeWidth={1.5} />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">
                {row.original.isCreatorToken ? 'Creator Token' : 'Content Token'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2.5 pr-">
          <Link href={`/coin/${row.original.address}`}>
            <SmartImage
              src={row.original.mediaContent.previewImage.medium}
              alt={row.original.symbol}
              className="size-9 rounded-full"
              loaderClassName="size-9 rounded-full bg-secondary"
            />
          </Link>
          <div className="space-y-[1px]">
            <h4 className="flex items-center gap-1">
              <Link className="w-full max-w-20 truncate" href={`/coin/${row.original.address}`}>
                <span className="font-medium text-xs">{row.original.symbol}</span>
              </Link>
              <button
                className="opacity-60 shrink-0"
                onClick={() => copyToClipboard(row.original.address)}
              >
                <Copy className="size-3" strokeWidth={3} />
              </button>
            </h4>
            <div className="flex items-center gap-1.5">
              <TimeAgo
                className="text-green-600 font-semibold text-xs opacity-100"
                date={row.original.created_at}
              />
              <Link target="_blank" href={`https://basescan.org/address/${row.original.address}`}>
                <Basescan className="size-[13px] dark:text-[#555] #eee" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    enableSorting: true,
    cell: ({ row, renderValue }) => (
      <Link href={`/coin/${row.original.address}`}>
        <p className="text-start">
          <TimeAgo className="font-medium text-xs" date={renderValue() as string} />
        </p>
      </Link>
    ),
  },
  {
    accessorKey: 'marketCap',
    header: 'Market Cap',
    enableSorting: true,
    cell: ({ row, renderValue }) => {
      const change = getPercentChange(
        Number(row.original.marketCap),
        Number(row.original.marketCapDelta24h)
      );

      return (
        <Link href={`/coin/${row.original.address}`}>
          <div className="text-start space-y-[1px]">
            <p className="text-[13px] font-medium">${formatNumber(Number(renderValue()))}</p>
            <div className="flex items-center justify-start gap-1.5">
              <p
                className={cn(
                  'flex items-center gap-0.5',
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change >= 0 ? (
                  <ChevronUp className="size-3" strokeWidth={3} />
                ) : (
                  <ChevronDown className="size-3" strokeWidth={3} />
                )}
                <span className="text-[12px] font-medium">{formatNumber(change)}%</span>
              </p>
              <p className="text-xs opacity-60 font-medium">(24h)</p>
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: 'totalVolume',
    header: 'Total Volume',
    enableSorting: true,
    cell: ({ row, renderValue }) => (
      <Link href={`/coin/${row.original.address}`}>
        <div className="text-start space-y-[1px]">
          <p className="text-[13px] font-medium">${formatNumber(Number(renderValue()))}</p>
          <div className="flex items-center justify-start gap-1.5">
            <p className="flex items-center gap-0.5">
              <span className="text-[12px] font-medium opacity-70">
                ${formatNumber(Number(row.original.volume24h))}
              </span>
            </p>
            <p className="text-xs opacity-60 font-medium">(24h)</p>
          </div>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: 'price.priceInUsdc',
    header: 'Price',
    enableSorting: true,
    cell: ({ row, renderValue }) => (
      <Link href={`/coin/${row.original.address}`}>
        <div className="text-start">
          <p className="text-sm font-medium">{formatNumber(Number(renderValue()))}$</p>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: 'uniqueHolders',
    header: 'Unique Holders',
    enableSorting: true,
    cell: ({ row, renderValue }) => {
      const holders = Number(renderValue());
      return (
        <Link href={`/coin/${row.original.address}`}>
          <div className="flex items-center gap-3.5 justify-start">
            <span
              className={cn(
                'block h-7 w-[3px] rounded-full',
                holders > 0 ? 'bg-green-500' : 'bg-gray-400'
              )}
            />
            <p className="text-end text-sm font-medium">{formatNumber(holders)}</p>
          </div>
        </Link>
      );
    },
  },
  {
    header: 'Action',
    enableSorting: false,
    cell: ({ row }) => <QuickBuy coin={row.original} />,
  },
];

const Home = () => {
  const [filters, setFilters] = React.useState<Filters>({});
  const { ref, inView } = useInView();
  const { open } = useFilterSidebar();
  const storage = useStorage();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<CoinResponse>({
      queryKey: ['coins'],
      initialPageParam: null,
      // refetchInterval: 2000,
      getNextPageParam: (lastPage) => lastPage.data?.cursor ?? undefined,
      queryFn: async ({ pageParam = null }) => {
        const query = toQueryString({ cursor: pageParam });
        const res = await fetch(`/api/coins?${query}`);
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
    <div className="overflow-y-hidden">
      <div className="p-3 gap-3 flex items-center justify-between sticky top-0 bg-background z-25 border-b">
        <div className="flex flex-col gap-0.5">
          <h1 className="flex items-center gap-2 text-green-400">
            <Coins className="size-5.5" strokeWidth={2} />
            <span className="font-semibold text-xl truncate">New Tokens</span>
          </h1>
          <p className="hidden md:block text-sm text-muted-foreground">
            Find the latest tokens across zora
          </p>
        </div>

        <div>
          <Button
            className="h-8.5 w-21"
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
        </div>
      </div>

      {isLoading ? (
        <div className="h-[calc(100dvh-169px)] md:h-[calc(100dvh-185px)] flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="overflow-y-hidden">
          <DataTable<Coin>
            columns={coinColumns}
            data={filteredCoins}
            triggerRowRef={ref}
            triggerOffset={10}
            containerClassName="h-[calc(100dvh-169px)] md:h-[calc(100dvh-185px)] pb-17 md:pb-0"
          />
        </div>
      )}
    </div>
  );
};

export default Home;
