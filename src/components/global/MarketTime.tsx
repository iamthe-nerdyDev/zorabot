'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  endTime: Date;
  prefix?: string;
  className?: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function MarketTime({ endTime, prefix, className }: Props) {
  const [timeLeft, setTimeLeft] = React.useState(endTime.getTime() - Date.now());

  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(endTime.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, timeLeft]);

  const isEnded = timeLeft <= 0;
  const isWithin24h = timeLeft > 0 && timeLeft <= 24 * 60 * 60 * 1000;

  const percentElapsed = Math.min(1, (24 * 60 * 60 * 1000 - timeLeft) / (24 * 60 * 60 * 1000));

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const countdown = `${hours.toString().padStart(2, '0')}h:${minutes
    .toString()
    .padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`;

  return isEnded ? (
    <p className={cn('font-light text-gray-300 text-[16px]', className)}>Ended</p>
  ) : isWithin24h ? (
    <div className={cn('mb-2 flex items-center gap-2 w-fit', className)}>
      {prefix && <span className="font-light text-gray-300 text-[16px]">{prefix}</span>}
      <Pie percent={percentElapsed} />
      <span className="font-light text-gray-300 text-[16px]">{countdown}</span>
    </div>
  ) : (
    prefix && (
      <span className="font-light text-gray-300 text-[16px]">Ends: {formatDate(endTime)}</span>
    )
  );
}

function Pie({ percent }: { percent: number }) {
  const size = 17;
  const radius = size / 2;
  const angle = percent * 360;
  const radians = (angle - 90) * (Math.PI / 180);

  const x = radius + radius * Math.cos(radians);
  const y = radius + radius * Math.sin(radians);

  const largeArc = angle > 180 ? 1 : 0;

  const pathData = `
    M ${radius} ${radius}
    L ${radius} 0
    A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y}
    Z
  `;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={radius} cy={radius} r={radius} fill="#444" />
      <path d={pathData} fill="#ccc" />
    </svg>
  );
}
