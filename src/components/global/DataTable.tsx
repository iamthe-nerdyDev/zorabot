'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';

type Props<T> = {
  containerClassName?: string;
  headerClassName?: string;
  columns: ColumnDef<T>[];
  data: T[];
  enableStickyColumns?: boolean;
  triggerRowRef?: (node?: Element | null | undefined) => void;
  triggerOffset?: number;
};

export default function DataTable<T>({
  containerClassName,
  headerClassName,
  data,
  columns,
  className,
  enableStickyColumns = true,
  triggerRowRef,
  triggerOffset = 1,
  ...props
}: React.ComponentProps<'table'> & Props<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: React.useMemo(() => [...data], [data]),
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className={cn('overflow-auto max-h-[81dvh]', containerClassName)}
      style={{
        WebkitOverflowScrolling: 'touch',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        scrollBehavior: 'smooth',
        touchAction: 'pan-x pan-y',
        willChange: 'scroll-position',
      }}
    >
      <table className={cn('min-w-full border-collapse', className)} {...props}>
        <thead className={cn('bg-background sticky top-0 z-15', headerClassName)}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === headerGroup.headers.length - 1;

                return (
                  <th
                    key={header.id}
                    className={cn(
                      'text-start text-sm font-medium cursor-pointer select-none whitespace-nowrap dark:text-gray-500',
                      enableStickyColumns && isFirst && 'sticky left-0 z-15 bg-background',
                      enableStickyColumns &&
                        isLast &&
                        columns.length > 1 &&
                        'sticky right-0 z-15 bg-background'
                    )}
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      perspective: '1000px',
                      scrollBehavior: 'smooth',
                      touchAction: 'pan-x pan-y',
                      willChange: 'scroll-position',
                    }}
                    colSpan={header.colSpan}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div
                      className={cn(
                        'p-3 border-b',
                        isFirst && 'border-r',
                        isLast && 'border-l',
                        header.column.getCanSort()
                          ? { asc: 'asc', desc: 'desc' }[header.column.getIsSorted() as string] ??
                              'sort'
                          : null
                      )}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, idx) => {
            const totalRows = table.getRowModel().rows.length;
            const isTriggerRow = idx === totalRows - triggerOffset;

            return (
              <tr
                key={row.id}
                className="border-b hover:bg-[#222]/50"
                ref={isTriggerRow ? triggerRowRef : undefined}
              >
                {row.getVisibleCells().map((cell, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === row.getVisibleCells().length - 1;

                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        'whitespace-nowrap min-w-30',
                        enableStickyColumns && isFirst && 'sticky left-0 z-10 bg-background',
                        enableStickyColumns &&
                          isLast &&
                          row.getVisibleCells().length > 1 &&
                          'sticky right-0 z-10 bg-background'
                      )}
                      style={{
                        WebkitOverflowScrolling: 'touch',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        perspective: '1000px',
                        scrollBehavior: 'smooth',
                        touchAction: 'pan-x pan-y',
                        willChange: 'scroll-position',
                      }}
                    >
                      <div className={cn('p-3', isFirst && 'border-r', isLast && 'border-l')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
