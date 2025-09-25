import { Loader2 } from 'lucide-react';
import React from 'react';

export function MarketPending() {
  return (
    <div className="flex items-center gap-1.5 opacity-50 h-4">
      <Loader2 className="animate-spin" size={17} />
      <div className="text-sm">Pending resolution</div>
    </div>
  );
}
