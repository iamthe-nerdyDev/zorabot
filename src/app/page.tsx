'use client';

import DataTable from '@/components/global/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toQueryString } from '@/lib/helpers';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Bolt, DollarSign, Leaf, Settings2, Zap } from 'lucide-react';
import React from 'react';

type CoinResponse = {
  data: null | {
    coins: Coin[];
    cursor: string | null;
  };
};

type Filters = {
  creatorIds?: string[];
  totalVolume?: {
    min?: number;
    max?: number;
  };
  volume24h?: {
    min?: number;
    max?: number;
  };
  marketCap?: {
    min?: number;
    max?: number;
  };
  uniqueHolders?: {
    min?: number;
    max?: number;
  };
};

const Home = () => {
  const [filters, setFilters] = React.useState<Filters>({});
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery<CoinResponse>({
      queryKey: ['coins'],
      initialPageParam: null,
      refetchInterval: 5000,
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
      if (filters.creatorIds?.length && !filters.creatorIds.includes(coin.creator.id)) {
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
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const el = document.getElementById('load-more');
    if (el) observer.observe(el);
    // --
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const columns: ColumnDef<Coin>[] = [
    {
      header: 'Token',
      enableSorting: false,
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'marketCap',
      header: 'Market Cap',
      enableSorting: true, // ✅ sortable
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'totalVolume',
      header: 'Total Volume',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      header: 'Actions',
      enableSorting: false,
      cell: () => <button className="px-2 py-1 bg-blue-500 text-white rounded">Buy</button>,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="p-3 flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="flex items-center gap-2 text-green-600">
            <Leaf />
            <span className="font-medium text-2xl">New Pairs</span>
          </h1>
          <p className="text-sm text-muted-foreground">Find the latest tokens across zora</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border gap-2.5 p-[3px] rounded-lg bg-secondary">
            <div className="flex items-center gap-1.5 ml-2">
              <Zap strokeWidth={1.8} className="size-4 opacity-50" />
              <span className="text-[13px] font-medium font-mono uppercase">Buy</span>
            </div>
            <div className="relative bg-background rounded-lg">
              <Input className="w-[4.5rem] h-8" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                $
              </span>
            </div>
          </div>

          <Button>
            <span>Filter</span>
            <Settings2 className="opacity-60" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <DataTable<Coin> columns={columns} data={filteredCoins} />

      <div id="load-more" className="h-10" />
      {isFetchingNextPage && <p>Loading more...</p>}
    </div>
  );
};

export default Home;
