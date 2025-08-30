'use client';

import {
  Bell,
  Bolt,
  ChevronRight,
  Compass,
  History,
  Mail,
  Search,
  Star,
  WalletCards,
  X,
} from 'lucide-react';
import React from 'react';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';
import { isPathMatching } from '@/lib/helpers';

export default function Sidebar() {
  const path = usePathname();
  const { state, close } = useSidebar();

  const menus = [
    { title: 'New Pairs', icon: History, href: '/', match: ['/coin/*'] },
    { title: 'Explore', icon: Compass, href: '/explore' },
    { title: 'Alerts', icon: Bell, href: '/alerts' },
    { title: 'Watchlist', icon: Star, href: '/watchlist' },
    { title: 'Portfolio', icon: WalletCards, href: '/explore' },
  ];

  const actions = [
    { title: 'Settings', icon: Bolt, handleClick: () => {} },
    { title: 'Send Us a Message', icon: Mail, handleClick: () => {} },
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
      <div className="fixed left-0 top-0 bottom-0 h-svh w-16 z-20 bg-background border-r p-3 hidden md:flex flex-col items-center justify-between overflow-y-auto gap-15">
        <div className="w-full flex flex-col items-center justify-center gap-1.5">
          <Link href={'/'} className="pt-3.5 pb-5 w-5 h-auto">
            <img src={'/logo.png'} />
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
                      {<menu.icon className="size-5" strokeWidth={1.5} />}
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
                {<action.icon className="size-4" strokeWidth={1.5} />}
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold">
                <p className="font-medium">{action.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {state && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 h-svh w-full z-50 bg-background border-r md:hidden p-4"
          >
            <div className="flex items-center justify-between mb-8 mt-1">
              <Link href={'/'} className="w-6 h-auto">
                <img src={'/logo.png'} />
              </Link>

              <div className="flex items-center gap-4">
                <button onClick={close}>
                  <Search className="size-5" />
                </button>

                <button onClick={close}>
                  <X className="size-5 opacity-60" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {menus.map((menu) => {
                const isActive =
                  path === menu.href ||
                  (menu.match && menu.match.some((m) => isPathMatching(path, m)));

                return (
                  <Link
                    href={menu.href}
                    key={menu.title}
                    className="flex items-center justify-between"
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3',
                        isActive ? 'font-semibold opacity-100' : 'opacity-50'
                      )}
                    >
                      <menu.icon className="size-5 opacity-50" />
                      <span>{menu.title}</span>
                    </div>

                    <ChevronRight className="size-4 opacity-50" />
                  </Link>
                );
              })}
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-6">
              {actions.map((action) => (
                <button key={action.title} className="flex items-center justify-between">
                  <div className={cn('flex items-center gap-3')}>
                    <action.icon className="size-5 opacity-50" />
                    <span>{action.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}
