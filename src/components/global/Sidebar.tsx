'use client';

import { Bell, Compass, Home, Mail, Star, Wallet2 } from 'lucide-react';
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { isPathMatching } from '@/lib/helpers';

export default function Sidebar() {
  const path = usePathname();
  const { state, close } = useSidebar();

  const menus = [
    {
      title: 'Home',
      icon: Home,
      href: '/',
      match: ['/coin/*', '/creator/*'],
    },
    {
      title: 'Explore',
      icon: Compass,
      href: '/explore',
    },
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
      icon: Wallet2,
      href: '/portfolio',
    },
  ];

  const actions = [
    {
      title: 'Send Us a Message',
      icon: Mail,
      handleClick: () => {
        window.open('mailto:momoreoluwaadedeji@gmail.com', '_blank');
      },
    },
  ];

  React.useEffect(() => {
    close();
  }, [path, close]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state) close();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state, close]);

  return (
    <React.Fragment>
      <div className="fixed left-0 top-0 bottom-0 h-dvh w-16 z-20 bg-background border-r p-3 hidden md:flex flex-col items-center justify-between overflow-y-auto gap-15">
        <div className="w-full flex flex-col items-center justify-center gap-1.5">
          <Link href={'/'} className="pt-3.5 pb-5 w-10 h-auto">
            <img src={'/logo.png'} className="rounded-full w-full" />
          </Link>

          {menus.map((menu) => {
            const isActive =
              path === menu.href || (menu.match && menu.match.some((m) => isPathMatching(path, m)));

            return (
              <Tooltip key={menu.title}>
                <TooltipTrigger>
                  <Link
                    href={menu.href}
                    className="flex flex-col items-center justify-center gap-1 relative"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute inset-0 rounded-full border bg-secondary"
                      />
                    )}
                    <div
                      className={cn(
                        'relative z-10 p-3 md:p-2.5 rounded-full',
                        isActive ? 'opacity-100' : 'opacity-50'
                      )}
                    >
                      {<menu.icon className="size-5" strokeWidth={2} />}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold">
                  <p className="font-medium">{menu.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 items-center justify-center mb-3">
          {actions.map((action) => (
            <Tooltip key={action.title}>
              <TooltipTrigger
                onClick={action.handleClick}
                className="size-9 flex items-center justify-center bg-[#555]/30 border rounded-full"
              >
                {<action.icon className="size-4" strokeWidth={2} />}
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold">
                <p className="font-medium">{action.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {isPathMatching(path, '/coin/*') ? null : (
        <nav className="flex md:hidden fixed right-0 left-0 bottom-0 bg-black/50 border-t items-center justify-around z-50 backdrop-blur-md">
          {menus.map((menu) => {
            const isActive =
              path === menu.href || (menu.match && menu.match.some((m) => isPathMatching(path, m)));

            return (
              <Link
                href={menu.href}
                className={cn(
                  'flex flex-col gap-0.5 items-center text-center p-1.5',
                  isActive ? 'opacity-100 text-violet-300' : 'opacity-50'
                )}
              >
                <div className="relative p-2.5 rounded-full">
                  <menu.icon className="size-4.5 z-50" strokeWidth={2} />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute inset-0 rounded-full border-[1px] border-violet-500 bg-transparent pointer-events-none"
                    />
                  )}
                </div>
                <span className="text-[12px]">{menu.title}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </React.Fragment>
  );
}
