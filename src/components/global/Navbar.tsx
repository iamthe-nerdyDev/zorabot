'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Copy, Power, Search } from 'lucide-react';
import useModal from '@/hooks/useModal';
import SearchModal from './SearchModal';
import Link from 'next/link';
import { copyToClipboard, getImageURL, truncate } from '@/lib/helpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConnectButton from './ConnectButton';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { Separator } from '../ui/separator';

export default function Navbar() {
  const { open: openModal } = useModal();
  const { address } = useAccount();
  const { authenticated, user, getAccessToken, logout } = usePrivy();
  // --
  const addr = React.useMemo(
    () => (address || user?.wallet?.address)?.toLowerCase(),
    [address, user?.wallet]
  );

  const openSearchModal = () => {
    openModal({ content: <SearchModal /> });
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        openSearchModal();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    async function run() {
      if (!user) return;

      const token = await getAccessToken();
      await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user }),
      });
    }

    run();
  }, [user]);

  return (
    <nav className="p-3 border-b sticky top-0 bg-background z-20">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex md:hidden items-center gap-3">
            <button onClick={openSearchModal}>
              <Search className="size-5" />
            </button>

            <div className="h-7">
              <Separator orientation="vertical" />
            </div>

            <Link href={'/'} className="flex items-center gap-3">
              <img src={'/logo.png'} className="w-9 rounded-full h-auto" />
              {/* <p className="font-light text-2xl">Zolify</p> */}
            </Link>
          </div>

          <aside className="hidden md:flex items-center gap-3 w-[65%] max-w-[25rem]">
            <div
              className="w-full relative select-none cursor-pointer"
              role="button"
              onClick={openSearchModal}
            >
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                autoComplete="off"
                disabled
                className="w-full pr-10 pl-9 h-10 disabled:border-[#666]"
                placeholder="Search"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 bg-muted text-muted-foreground pointer-events-none flex items-center justify-center size-6.5 gap-1 rounded-sm border font-mono text-[12px] font-medium opacity-100 select-none">
                <span className="text-xs">/</span>
              </kbd>
            </div>
          </aside>

          <aside className="flex items-center gap-3">
            {authenticated && addr ? (
              <div className="flex items-center gap-2.5">
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <img src={getImageURL(addr)} className="size-8 rounded-full" />
                      <p className="text-[15px] font-medium">{truncate(addr)}</p>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-45 mr-2" side="bottom" sideOffset={10}>
                    <DropdownMenuLabel className="opacity-50">Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <button
                        className="flex items-center gap-2"
                        onClick={() => copyToClipboard(addr)}
                      >
                        <Copy className="size-3" strokeWidth={2} />
                        <p className="text-[14px] font-medium">{truncate(addr)}</p>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button className="flex items-center gap-2 text-red-500" onClick={logout}>
                        <Power className="size-3" strokeWidth={2} />
                        <p className="text-[14px] font-medium">Disconnect</p>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <ConnectButton />
            )}
          </aside>
        </div>
      </div>
    </nav>
  );
}
