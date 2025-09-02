import { Bell } from 'lucide-react';
import React from 'react';

export default function AlertComponent() {
  return (
    <div className="h-[60dvh]">
      <div className="h-full flex flex-col items-center justify-center gap-2.5">
        <Bell className="size-10 opacity-60" strokeWidth={1} />
        <p className="text-xl opacity-80 text-center">No alert(s) set yet!</p>
      </div>
    </div>
  );
}
