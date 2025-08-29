'use client';

import { useFilterSidebar } from '@/hooks/useFilterSideBar';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, ListFilter, RotateCw, X } from 'lucide-react';
import React from 'react';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { MultiSelect } from '../ui/multi-select';

export default function FilterComponent() {
  const [filters, setFilters] = React.useState<Filters>({});
  const { state, close, options, cb } = useFilterSidebar();

  const forrmInputs = React.useMemo(() => {
    if (!options) return [];
    const arr = [];

    if (options.marketCap) {
      arr.push({ title: 'Market Cap', key: 'marketCap', isCurrency: true });
    }
    if (options.totalVolume) {
      arr.push({ title: 'Total Volume', key: 'totalVolume', isCurrency: true });
    }
    if (options.volume24h) {
      arr.push({ title: 'Volume (24h)', key: 'volume24h', isCurrency: true });
    }
    if (options.uniqueHolders) {
      arr.push({ title: 'Unique Holders', key: 'uniqueHolders', isCurrency: false });
    }

    return arr;
  }, [options]);

  return (
    <AnimatePresence>
      {state && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={close}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className="fixed right-0 top-0 bottom-0 h-svh w-full md:w-md z-50 bg-background border-l"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ListFilter className="opacity-60 size-3.5" strokeWidth={2} />
                <span className="font-medium text-sm text-green-400">Filter Tokens</span>
              </div>

              <button onClick={close}>
                <X className="size-4 opacity-60" />
              </button>
            </div>

            <div className="p-4 border-b flex flex-col gap-5">
              {options?.isContentToken && options.isCreatorToken && (
                <React.Fragment>
                  <div className="flex flex-col gap-4">
                    {options?.isCreatorToken && (
                      <div className="flex items-center justify-between">
                        <label
                          className="text-sm font-medium flex items-center gap-2"
                          htmlFor="creatorTokens"
                        >
                          <Coins className="size-4 opacity-50" />
                          <span>Creator Tokens</span>
                        </label>
                        <Checkbox
                          id="creatorTokens"
                          checked={filters.isCreatorToken}
                          onCheckedChange={(checked) => {
                            setFilters((prev) => ({
                              ...prev,
                              isCreatorToken: checked ? true : false,
                            }));
                          }}
                        />
                      </div>
                    )}

                    {options?.isContentToken && (
                      <div className="flex items-center justify-between">
                        <label
                          className="text-sm font-medium flex items-center gap-2"
                          htmlFor="contentTokens"
                        >
                          <Coins className="size-4 opacity-50" />
                          <span>Content Tokens</span>
                        </label>
                        <Checkbox
                          id="contentTokens"
                          checked={filters.isContentToken}
                          onCheckedChange={(checked) => {
                            setFilters((prev) => ({
                              ...prev,
                              isContentToken: checked ? true : false,
                            }));
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <Separator />
                </React.Fragment>
              )}

              {options?.creators && options.creators.length > 0 && (
                <React.Fragment>
                  <p className="text-sm font-medium -mb-1">Filter by Creator(s)</p>
                  <MultiSelect
                    options={options.creators.map((c) => ({ value: c.handle, label: c.handle }))}
                    placeholder="Select creator(s)"
                    searchPlaceholder="Search creators"
                    emptyMessage="Nothing found"
                    selectedValues={filters.creatorIds || []}
                    className="h-10.5"
                    onSelectionChange={(values) =>
                      setFilters((prev) => ({ ...prev, creatorIds: values }))
                    }
                  />

                  <Separator />
                </React.Fragment>
              )}

              <div className="flex flex-col gap-4">
                {forrmInputs.map((formInput) => (
                  <div key={formInput.key} className="grid grid-cols-2 gap-3">
                    <p className="text-sm font-medium">{formInput.title}</p>

                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <Input
                          placeholder="min"
                          type="number"
                          min={0}
                          style={{ fontSize: '12px' }}
                          value={String(
                            (filters[formInput.key as keyof Filters] as any)?.min || ''
                          )}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              [formInput.key]: {
                                ...(prev[formInput.key as keyof Filters] as any),
                                min: Number(e.target.value),
                              },
                            }))
                          }
                          className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        {formInput.isCurrency && (
                          <span className="absolute text-[11px] right-[10px] top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                            $
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          placeholder="max"
                          type="number"
                          style={{ fontSize: '12px' }}
                          value={String(
                            (filters[formInput.key as keyof Filters] as any)?.max || ''
                          )}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              [formInput.key]: {
                                ...(prev[formInput.key as keyof Filters] as any),
                                max: Number(e.target.value),
                              },
                            }))
                          }
                          className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        {formInput.isCurrency && (
                          <span className="absolute text-[11px] right-[10px] top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                            $
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <Button
                variant={'link'}
                size={'sm'}
                onClick={() => {
                  cb?.({});
                  setFilters({});
                  close();
                }}
              >
                <RotateCw className="size-3.5 opacity-50" />
                <span>Reset</span>
              </Button>

              <Button
                variant={'outline'}
                className="px-5 h-9"
                onClick={() => {
                  cb?.(filters);
                  close();
                }}
              >
                <span className="text-[13px]">Apply</span>
              </Button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
