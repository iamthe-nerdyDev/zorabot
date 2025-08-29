'use client';

import { cn } from '@/lib/utils';
import React from 'react';

function getTimeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) {
    return {
      seconds,
      text: `${seconds}s`,
    };
  }

  // --
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return {
      seconds,
      text: `${minutes}m`,
    };
  }

  // --
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return {
      seconds,
      text: `${hours}h`,
    };
  }

  // --
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return {
      seconds,
      text: `${days}d`,
    };
  }

  // --
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return {
      seconds,
      text: `${weeks}w`,
    };
  }

  // --
  const months = Math.floor(days / 30);
  if (months < 12) {
    return {
      seconds,
      text: `${months}mo`,
    };
  }

  // --
  const years = Math.floor(days / 365);
  return {
    seconds,
    text: `${years}y`,
  };
}

type Props = {
  date: string;
};

export default function TimeAgo({
  date,
  className,
  ...props
}: React.ComponentProps<'span'> & Props) {
  const targetDate = new Date(!date.endsWith('Z') ? date + 'Z' : date);
  const [timeAgo, setTimeAgo] = React.useState(() => getTimeAgo(targetDate));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const sec = 0;

  return (
    <span
      className={cn(
        timeAgo.seconds <= 60 ? 'text-yellow-600' : timeAgo.seconds <= 60 * 5 ? null : 'opacity-60',
        className
      )}
      {...props}
    >
      {timeAgo.text}
    </span>
  );
}
