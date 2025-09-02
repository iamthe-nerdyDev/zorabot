'use client';

import DataTable from '@/components/global/DataTable';
import { Loader } from '@/components/global/Loader';
import SmartImage from '@/components/global/SmartImage';
import TimeAgo from '@/components/global/TimeAgo';
import Basescan from '@/components/icons/Basescan';
import Ethereum from '@/components/icons/Ethereum';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFilterSidebar } from '@/hooks/useFilterSideBar';
import {
  copyToClipboard,
  formatNumber,
  getPercentChange,
  toNumber,
  toQueryString,
} from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { IconComet, IconUserScreen } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Coins, Copy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { useInView } from 'react-intersection-observer';

type CoinResponse = {
  data: null | {
    coins: Coin[];
    cursor: string | null;
  };
};

export default function CreatorComponent({ data: profile }: { data: ZoraProfileAdvance }) {
  const [filters, setFilters] = React.useState<Filters>({});
  const { ref, inView } = useInView();
  const { open } = useFilterSidebar();
  const { address } = useParams();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<CoinResponse>({
      queryKey: ['profileCoins', address],
      initialPageParam: null,
      enabled: !!address,
      getNextPageParam: (lastPage) => lastPage.data?.cursor ?? undefined,
      queryFn: async ({ pageParam = null }) => {
        const query = toQueryString({ address, cursor: pageParam });
        const res = await fetch(`/api/creator/coins?${query}`);
        // --
        if (!res.ok) return null;
        return res.json();
      },
    });

  const coins = (data?.pages.flatMap((page) => page.data?.coins) ?? []).filter((c) => !!c);
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

  const columns: ColumnDef<Coin>[] = [
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
          <p className="text-end">
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
            <div className="text-end space-y-[1px]">
              <p className="text-sm">${formatNumber(Number(renderValue()))}</p>
              <div className="flex items-center justify-end gap-1.5">
                <p
                  className={cn(
                    'flex items-center gap-0.5',
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change >= 0 ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
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
          <div className="text-end space-y-[1px]">
            <p className="text-sm">${formatNumber(Number(renderValue()))}</p>
            <div className="flex items-center justify-end gap-1.5">
              <p className="flex items-center gap-0.5">
                <span className="text-[12px] font-medium">
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
          <div className="text-end">
            <p className="text-end text-sm font-medium">{formatNumber(Number(renderValue()))}$</p>
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
            <div className="flex items-center gap-3.5 justify-end">
              <p className="text-end text-sm font-medium">{formatNumber(holders)}</p>
              <span
                className={cn(
                  'block h-7 w-[3px] rounded-full',
                  holders > 0 ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
            </div>
          </Link>
        );
      },
    },
    {
      header: 'Buy',
      enableSorting: false,
      cell: ({ row }) => (
        <Link href={`/coin/${row.original.address}`}>
          <Button variant={'outline'} className="min-w-20">
            <Ethereum className="size-3 text-gray-400" />
            <span className="-ml-0.5 font-semibold text-xs">BUY</span>
          </Button>
        </Link>
      ),
    },
  ];

  const change = profile.creatorCoin
    ? getPercentChange(
        Number(profile.creatorCoin.marketCap),
        Number(profile.creatorCoin.marketCapDelta24h)
      )
    : 0;

  return (
    <div>
      <div className="px-3.5 py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b">
        <div className="flex items-center gap-2.5">
          <SmartImage
            src={profile.avatar.previewImage.medium}
            alt={profile.displayName}
            className="size-15 rounded-full"
            loaderClassName="size-15 rounded-full bg-secondary"
          />

          <div>
            <h3 className="text-xl font-semibold">{profile.displayName}</h3>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <span>{profile.handle}</span>
              <button onClick={() => copyToClipboard(address as string)}>
                <Copy className="size-3.5 opacity-50" strokeWidth={3} />
              </button>
            </p>
          </div>
        </div>

        {profile.creatorCoin ? (
          <div>
            <p className="font-medium text-sm mb-1 opacity-60">Creator Coin</p>
            <div className="flex items-center gap-7">
              <div className="flex flex-col">
                <div>
                  <h1 className="text-lg font-semibold">
                    ${formatNumber(toNumber(profile.creatorCoin.marketCap, 0))}
                  </h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <p
                    className={cn(
                      'flex items-center gap-0.5',
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {change >= 0 ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                    <span className="text-[12px] font-medium">{formatNumber(change)}%</span>
                  </p>
                  <p className="text-xs opacity-60 font-medium">(24h)</p>
                </div>
              </div>

              <div className="h-10">
                <Separator orientation="vertical" />
              </div>

              <div>
                <Link href={`/coin/${profile.creatorCoin.address}`}>
                  <Button className="w-25 h-10">
                    <span className="font-bold">BUY</span>
                    <Coins className="opacity-50" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="p-3.5 font-medium opacity-70 border-b">{profile.displayName}'s Token(s)</h2>
        {isLoading ? (
          <div className="h-[calc(100vh-300px)] md:h-[calc(100vh-232px)] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="overflow-y-hidden">
            <DataTable<Coin>
              columns={columns}
              data={filteredCoins}
              triggerRowRef={ref}
              triggerOffset={10}
              containerClassName="h-[calc(100dvh-300px)] md:h-[calc(100dvh-232px)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
