'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Copy, Menu, Power, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { useSidebar } from '@/hooks/useSidebar';
import { Separator } from '../ui/separator';
import useModal from '@/hooks/useModal';
import SearchModal from './SearchModal';
import Link from 'next/link';
import { useApp } from '@/hooks/useApp';
import { truncate } from '@/lib/helpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConnectWallet, usePrivy } from '@privy-io/react-auth';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';

export default function Navbar() {
  const { login, logout, authenticated, user } = usePrivy();
  const { connectWallet } = useConnectWallet();
  const { connect, connectors } = useConnect();
  const { address } = useAccount();
  // const { disconnect } = useDisconnect();
  // const { signMessageAsync } = useSignMessage();
  // const { walletClient, account, publicClient, isConnected } = useWalletClient();
  const app = useApp();
  const { open } = useSidebar();
  const { open: openModal } = useModal();

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

  const handleConnect = async () => {
    if (app.isInMiniApp) {
      // Use Farcaster connector for miniapp
      const farcasterConnector = connectors.find((c) => c.id === 'farcaster');
      if (farcasterConnector) connect({ connector: farcasterConnector });
    } else {
      connectWallet();
    }
  };

  return (
    <nav className="p-3 border-b sticky top-0 bg-background z-20">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex md:hidden items-center gap-3">
            <Button onClick={open} variant={'outline'} size={'icon'} className="rounded-full">
              <Menu strokeWidth={1.8} />
            </Button>
            <div className="h-7">
              <Separator orientation="vertical" />
            </div>
            <Link href={'/'}>
              <img src={'/logo.png'} className="w-5.5 h-auto" />
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
            {address ? (
              <React.Fragment>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-lg">
                    <Button variant={'outline'} className="rounded-lg" asChild>
                      <p>
                        <span className="size-1.5 bg-green-500 rounded-full" />
                        <span>{truncate(address)}</span>
                      </p>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-45 mr-3" side="bottom">
                    <DropdownMenuLabel className="opacity-50">Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <button className="flex items-center gap-2">
                        <Copy className="size-3" strokeWidth={2} />
                        <p className="text-[13px] font-medium">{truncate(address)}</p>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button className="flex items-center gap-2">
                        <Power className="size-3" strokeWidth={2} />
                        <p className="text-[13px] font-medium">Logout</p>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </React.Fragment>
            ) : (
              <Button className="rounded-lg" onClick={handleConnect}>
                <span>Connect Wallet</span>
              </Button>
            )}
          </aside>
        </div>
      </div>
    </nav>
  );
}
