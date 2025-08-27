'use client';

import { Bell, Compass, History, MailPlus, Settings, Star, WalletCards } from 'lucide-react';
import React from 'react';
import { Separator } from '../ui/separator';

export default function Sidebar() {
  const menus = [
    { title: 'New Pairs', icon: History, href: '/' },
    { title: 'Explore', icon: Compass, href: '/explore' },
    { title: 'Alerts', icon: Bell, href: '/alerts' },
    { title: 'Watchlist', icon: Star, href: '/watchlist' },
    { title: 'Portfolio', icon: WalletCards, href: '/explore' },
  ];

  const actions = [
    { title: 'Settings', icon: Settings, handleClick: () => {} },
    { title: 'Contact Us', icon: MailPlus, handleClick: () => {} },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 h-svh w-15 z-20 bg-background border-r p-3 hidden md:flex flex-col justify-between">
      <div></div>
      <Separator />
      <div></div>
    </div>
  );
}
