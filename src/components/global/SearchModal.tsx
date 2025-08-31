'use client';

import { formatNumber, getPercentChange, toQueryString } from '@/lib/helpers';
import { ChevronDown, ChevronUp, Loader2, Search, X } from 'lucide-react';
import debounce from 'lodash.debounce';
import React from 'react';
import useModal from '@/hooks/useModal';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import SmartImage from './SmartImage';
import { IconDiscountCheck } from '@tabler/icons-react';

export default function SearchModal() {
  const { close } = useModal();
  const [query, setQuery] = React.useState<string>();
  const [results, setResults] = React.useState<ZoraProfile[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchFn = async (q?: string): Promise<void | { edges: ZoraProfile[]; count: number }> => {
    if (!q || !q.trim()) return;
    setLoading(true);
    // --
    try {
      const query = toQueryString({ query: q });
      const res = await fetch(`/api/search?${query}`);
      // --
      if (!res.ok) return;
      return (await res.json()).data;
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = React.useMemo(() => {
    return debounce(async (q: string) => {
      const response = await searchFn(q);
      console.log(response);
      if (response) setResults(response.edges);
    }, 400);
  }, []);

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (query) debouncedSearch(query);
    else setResults([]);
  }, [query, debouncedSearch]);

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full">
          <Search className="size-4.5 opacity-60" strokeWidth={2.5} />
          <input
            autoFocus
            placeholder="Search tokens"
            className="outline-none w-full"
            value={query || ''}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          className="shrink-0"
          onClick={() => {
            close();
            setQuery(undefined);
          }}
        >
          <X className="size-4.5 opacity-60" />
        </button>
      </div>

      <div>
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="animate-spin size-6 opacity-60" />
          </div>
        ) : !query ? (
          <div className="py-20 flex items-center justify-center">
            <p className="opacity-60 font-medium text-sm">Type in something</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 flex items-center justify-center">
            <p className="opacity-60 font-medium text-sm">No results found</p>
          </div>
        ) : (
          <div className="max-h-[25rem] overflow-y-auto -mx-4 px-4 -mb-3">
            <p className="opacity-60 font-medium text-sm mb-3">Results</p>
            <div className="flex flex-col gap-5 mb-5">
              {results.map((result) => {
                const change = result.node.creatorCoin
                  ? getPercentChange(
                      Number(result.node.creatorCoin.marketCap),
                      Number(result.node.creatorCoin.marketCapDelta24h)
                    )
                  : 0;

                return (
                  <Link
                    key={result.node.id}
                    href={`/creator/${result.node.publicWallet.walletAddress}`}
                    className="flex items-center justify-between"
                    onClick={close}
                  >
                    <div className="flex items-center gap-2">
                      <SmartImage
                        src={result.node.avatar?.icon ?? '/avatar.png'}
                        alt={result.node.handle}
                        className="size-9 rounded-full"
                        loaderClassName="size-9 rounded-full bg-secondary"
                      />
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-1">
                          <span>{result.node.displayName}</span>
                          {result.node.isUnverifiedCreator ? null : (
                            <IconDiscountCheck className="size-4 text-green-600" />
                          )}
                        </h4>
                        <p className="text-xs font-medium text-muted-foreground">
                          {result.node.handle}
                        </p>
                      </div>
                    </div>

                    {result.node.creatorCoin ? (
                      <div className="text-end flex flex-col justify-end">
                        <p className="text-xs font-medium mb-[2px]">
                          ${formatNumber(Number(result.node.creatorCoin.marketCap))}
                        </p>
                        <p
                          className={cn(
                            'flex items-center justify-end gap-0.5',
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
                      </div>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
