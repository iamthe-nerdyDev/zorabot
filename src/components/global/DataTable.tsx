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
import { ArrowUp, ArrowDown } from 'lucide-react';

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
};

export default function DataTable<T>({ data, columns }: Props<T>) {
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
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse relative text-sm">
        <thead className="sticky top-0 bg-background z-20 shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => {
                const isFirst = i === 0;
                const isLast = i === headerGroup.headers.length - 1;

                return (
                  <th
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`px-4 py-2 border text-left whitespace-nowrap font-medium
                      ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                      ${isFirst ? 'sticky left-0 bg-background z-30 shadow-md' : ''}
                      ${isLast ? 'sticky right-0 bg-background z-30 shadow-md' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() &&
                        (header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="h-3.5 w-3.5" />
                        ) : null)}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, i) => {
                const isFirst = i === 0;
                const isLast = i === row.getVisibleCells().length - 1;

                return (
                  <td
                    key={cell.id}
                    className={`px-4 py-2 border whitespace-nowrap
                      ${isFirst ? 'sticky left-0 bg-background z-20 shadow-md' : ''}
                      ${isLast ? 'sticky right-0 bg-background z-20 shadow-md' : ''}
                    `}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
