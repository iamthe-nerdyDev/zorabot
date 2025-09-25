'use client';

import { Button } from '@/components/ui/button';
import useBreakpoint from '@/hooks/useBreakpoint';
import { formatNumber } from '@/lib/helpers';
import { IconChartBar } from '@tabler/icons-react';
import React from 'react';
import { AreaChart, Tooltip, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { MouseHandlerDataParam } from 'recharts/types/synchronisation/types';

type Props = {
  data: ZoraChart | null;
  price?: number;
  height?: number;
};

const OPTIONS = [
  { key: 'oneHour', label: '1H' },
  { key: 'oneDay', label: '1D' },
  { key: 'oneWeek', label: '7D' },
  { key: 'oneMonth', label: '30D' },
  { key: 'all', label: 'All' },
];

export default function CoinChart({ data, price, height }: Props) {
  const breakpoint = useBreakpoint();
  const [mousePosition, setMousePosition] = React.useState<null | {
    x: number;
    percentage: number;
  }>(null);
  const [hoverPrice, setHoverPrice] = React.useState<number | null>(null);
  const [diff, setDiff] = React.useState<'oneHour' | 'oneDay' | 'oneWeek' | 'oneMonth' | 'all'>(
    'all'
  );

  const chartData = React.useMemo(() => data?.[diff], [diff, data]);

  const handleMouseMove = React.useCallback(
    (e: MouseHandlerDataParam) => {
      if (e.activeLabel && chartData) {
        const activeIndex = chartData.findIndex((item) => item.timestamp === e.activeLabel);
        const percentage = (activeIndex / (chartData.length - 1)) * 100;
        setMousePosition({ x: e.activeCoordinate?.x || 0, percentage });
        // --
        const hoverPrice = chartData[activeIndex]?.closePrice;
        setHoverPrice(hoverPrice ? Number(hoverPrice) : null);
      }
    },
    [chartData]
  );

  const handleMouseLeave = React.useCallback(() => {
    setMousePosition(null);
    setHoverPrice(null);
  }, []);

  return (
    <div className="pb-4">
      {price && (
        <div className="p-4">
          <p className="text-sm text-muted-foreground font-medium">Price</p>
          <h1 className="text-3xl font-semibold">${formatNumber(hoverPrice ?? price, false)}</h1>
        </div>
      )}

      <ResponsiveContainer
        width="100%"
        height={
          height ||
          (breakpoint === 'base'
            ? 200
            : breakpoint === 'sm'
            ? 250
            : breakpoint === 'md'
            ? 310
            : typeof window !== 'undefined'
            ? breakpoint === 'lg'
              ? window.innerHeight - 380
              : window.innerHeight - 320
            : 0)
        }
      >
        {chartData && chartData.length > 0 ? (
          <AreaChart
            data={chartData}
            dataKey="closePrice"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Tooltip
              labelFormatter={(label) =>
                new Date(label).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }
              cursor={{ strokeDasharray: '4 4', stroke: '#888' }}
              itemStyle={{ display: 'none' }}
              labelStyle={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-sans)' }}
              contentStyle={{
                backgroundColor: '#111',
                borderColor: '#555',
                padding: '0.35rem 0.6rem',
                borderRadius: '5px',
              }}
              formatter={(value) => `$${formatNumber(Number(value))}`}
            />
            <defs>
              <linearGradient id="splitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset={`${mousePosition?.percentage || 0}%`}
                  stopColor="#05df72"
                  stopOpacity="1"
                />
                <stop
                  offset={`${mousePosition?.percentage || 0}%`}
                  stopColor="#444"
                  stopOpacity="1"
                />
              </linearGradient>
            </defs>

            <Area
              dataKey="closePrice"
              stroke={mousePosition ? 'url(#splitGradient)' : '#05df72'}
              strokeWidth={1.8}
              fillOpacity={0}
              dot={false}
              activeDot={{ r: 7, stroke: '#000', strokeWidth: 3, fill: '#05df72' }}
            />

            <XAxis dataKey="timestamp" hide />
            <YAxis dataKey="closePrice" hide />
          </AreaChart>
        ) : (
          <div className="flex flex-col h-full items-center justify-center gap-2 opacity-60">
            <IconChartBar strokeWidth={1.3} className="size-8" />
            <p className="font-medium">Nothing here</p>
          </div>
        )}
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-3 mt-5">
        {OPTIONS.map(({ key, label }) => (
          <Button
            className="w-11 font-semibold uppercase"
            variant={diff === key ? 'outline' : 'ghost'}
            size={'sm'}
            key={key}
            onClick={() => setDiff(key as any)}
          >
            <span style={{ fontSize: '12.5px' }}>{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
