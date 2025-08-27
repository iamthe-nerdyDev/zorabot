'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Bell, PanelLeftOpen, Search, Star, WalletCards } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export default function Navbar() {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        console.log('Triggered!');
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const actions = [
    {
      title: 'Alerts',
      icon: Bell,
      href: '/alerts',
    },
    {
      title: 'Watchlist',
      icon: Star,
      href: '/watchlist',
    },
    {
      title: 'Portfolio',
      icon: WalletCards,
      href: '/portfolio',
    },
  ];

  return (
    <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-background z-20">
      <div className="flex items-center gap-3 w-[65%] max-w-[25rem]">
        <Button variant={'outline'} size={'icon'} className="rounded-full flex md:hidden">
          <PanelLeftOpen strokeWidth={1.8} />
        </Button>
        <aside className="w-full">
          <div className="w-full relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input autoComplete="off" className="w-full pr-10 pl-9 h-10" placeholder="Search" />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 bg-muted text-muted-foreground pointer-events-none flex items-center justify-center size-6.5 gap-1 rounded-sm border font-mono text-[12px] font-medium opacity-100 select-none">
              <span className="text-xs">/</span>
            </kbd>
          </div>
        </aside>
      </div>

      <aside className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          {actions.map((action) => (
            <Link href={action.href} key={action.title}>
              <Button
                variant={'outline'}
                size={'icon'}
                className="rounded-full"
                title={action.title}
              >
                <action.icon strokeWidth={1.8} />
              </Button>
            </Link>
          ))}
        </div>

        <Button className="rounded-lg">
          <span>Connect Wallet</span>
        </Button>
      </aside>
    </div>
  );
}
