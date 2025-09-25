'use client';

import DataTable from '@/components/global/DataTable';
import { Loader } from '@/components/global/Loader';
import QuickBuy from '@/components/global/QuickBuy';
import SmartImage from '@/components/global/SmartImage';
import TimeAgo from '@/components/global/TimeAgo';
import Basescan from '@/components/icons/Basescan';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  copyToClipboard,
  formatNumber,
  getPercentChange,
  toNumber,
  toQueryString,
} from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { usePrivy } from '@privy-io/react-auth';
import { IconComet, IconUserScreen } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Copy, Percent } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { useAccount } from 'wagmi';

type Holding = {
  coin: Coin;
  balance: string;
  id: string;
};

type HoldingsResponse = {
  data: null | {
    total: number;
    holdings: Holding[];
    cursor: string | null;
  };
};

export default function PortfolioComponent() {
  const { ref, inView } = useInView();
  const { address } = useAccount();
  const { ready, user } = usePrivy();
  // --
  const addr = React.useMemo(() => address || user?.wallet?.address, [address, user?.wallet]);
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<HoldingsResponse>({
      queryKey: ['portfolio'],
      initialPageParam: null,
      enabled: ready,
      getNextPageParam: (lastPage) => lastPage.data?.cursor ?? undefined,
      queryFn: async ({ pageParam = null }) => {
        if (!addr) {
          return {
            data: null,
          };
        }

        const query = toQueryString({ cursor: pageParam, address: addr });
        const res = await fetch(`/api/portfolio?${query}`);
        // --
        if (!res.ok) return null;
        return res.json();
      },
    });

  const holdings = (data?.pages.flatMap((page) => page.data?.holdings) ?? []).filter((c) => !!c);
  const value = isLoading
    ? undefined
    : holdings.reduce((acc, curr) => {
        return acc + Number(curr.coin.price.priceInUsdc) * toNumber(curr.balance);
      }, 0);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, inView, hasNextPage]);

  const { pnl24h, pnlPct24h } = React.useMemo(() => {
    if (!holdings.length) return { pnl24h: 0, pnlPct24h: 0 };
    const totalNow = holdings.reduce(
      (acc, h) => acc + toNumber(h.balance) * Number(h.coin.price.priceInUsdc),
      0
    );

    const total24hAgo = holdings.reduce((acc, h) => {
      const pctChange = getPercentChange(
        Number(h.coin.marketCap),
        Number(h.coin.marketCapDelta24h)
      );
      const priceNow = Number(h.coin.price.priceInUsdc);
      const price24hAgo = priceNow / (1 + pctChange / 100);

      return acc + toNumber(h.balance) * price24hAgo;
    }, 0);

    const pnl = totalNow - total24hAgo;
    const pct = total24hAgo > 0 ? (pnl / total24hAgo) * 100 : 0;

    return { pnl24h: pnl, pnlPct24h: pct };
  }, [holdings]);

  const columns: ColumnDef<Holding>[] = [
    {
      header: 'Token',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div>
            <Tooltip>
              <TooltipTrigger>
                {row.original.coin.isCreatorToken ? (
                  <IconUserScreen className="size-5 text-yellow-400" strokeWidth={1.5} />
                ) : (
                  <IconComet className="size-5 text-indigo-400" strokeWidth={1.5} />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">
                  {row.original.coin.isCreatorToken ? 'Creator Token' : 'Content Token'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2.5 pr-">
            <Link href={`/coin/${row.original.coin.address}`}>
              <SmartImage
                src={row.original.coin.mediaContent.previewImage.medium}
                alt={row.original.coin.symbol}
                className="size-9 rounded-full"
                loaderClassName="size-9 rounded-full bg-secondary"
              />
            </Link>
            <div className="space-y-[1px]">
              <h4 className="flex items-center gap-1">
                <Link
                  className="w-full max-w-20 md:max-w-30 lg:max-w-50 truncate"
                  href={`/coin/${row.original.coin.address}`}
                >
                  <span className="font-medium text-xs">{row.original.coin.symbol}</span>
                </Link>
                <button
                  className="opacity-60 shrink-0"
                  onClick={() => copyToClipboard(row.original.coin.address)}
                >
                  <Copy className="size-3" strokeWidth={3} />
                </button>
              </h4>
              <div className="flex items-center gap-1.5">
                <TimeAgo
                  className="text-green-600 font-semibold text-xs opacity-100"
                  date={row.original.coin.created_at}
                />
                <Link
                  target="_blank"
                  href={`https://basescan.org/address/${row.original.coin.address}`}
                >
                  <Basescan className="size-[13px] dark:text-[#555] #eee" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Amount',
      enableSorting: true,
      cell: ({ renderValue }) => (
        <p className="text-sm font-medium">{formatNumber(toNumber(renderValue() as string))}</p>
      ),
    },
    {
      accessorKey: 'coin.price.priceInUsdc',
      header: 'Price',
      enableSorting: true,
      cell: ({ row, renderValue }) => {
        const change = getPercentChange(
          Number(row.original.coin.marketCap),
          Number(row.original.coin.marketCapDelta24h)
        );

        return (
          <div className="space-y-[1px]">
            <p className="text-sm font-medium">${formatNumber(Number(renderValue()))}</p>
            <div className="flex items-center justify-start gap-1.5">
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
        );
      },
    },
    {
      header: 'Value',
      enableSorting: true,
      cell: ({ row }) => (
        <p className="text-sm font-medium">
          $
          {formatNumber(
            Number(row.original.coin.price.priceInUsdc) * toNumber(row.original.balance)
          )}
        </p>
      ),
    },
    {
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => <QuickBuy action="Sell" coin={row.original.coin} />,
    },
  ];

  return isLoading || !ready ? (
    <div className="h-[calc(100vh-190px)] md:h-[calc(100vh-198px)] flex items-center justify-center">
      <Loader />
    </div>
  ) : (
    <div className="overflow-y-hidden">
      <div className="py-5 px-4 flex sticky top-0 z-30 bg-background border-b">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-1">Portfolio Value</p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            $
            {typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : '--'}
          </h1>
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-1">Profit/Loss (24h)</p>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                'text-2xl md:text-3xl font-semibold',
                pnl24h >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {pnl24h >= 0 ? '+' : ''}
              {pnl24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}$
            </h1>

            <p
              className={cn(
                'text-sm font-semibold',
                pnlPct24h >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              ({pnlPct24h.toLocaleString(undefined, { maximumFractionDigits: 3 })}%)
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-y-hidden">
        <DataTable<Holding>
          columns={columns}
          data={holdings}
          containerClassName="h-[calc(100dvh-205px)] md:h-[calc(100dvh-212px)] pb-17 md:pb-0"
          triggerRowRef={ref}
          triggerOffset={10}
        />
      </div>
    </div>
  );
}
