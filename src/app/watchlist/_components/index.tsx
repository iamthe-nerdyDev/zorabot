'use client';

import { Star } from 'lucide-react';
import React from 'react';

export default function WatchlistComponent() {
  return (
    <div className="h-[60dvh]">
      <div className="h-full flex flex-col items-center justify-center gap-2.5">
        <Star className="size-10 opacity-60" strokeWidth={1} />
        <p className="text-xl opacity-80 text-center">Nothing in watchlist!</p>
      </div>
    </div>
  );
}
