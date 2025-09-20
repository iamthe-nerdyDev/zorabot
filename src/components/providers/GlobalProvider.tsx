'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, type PropsWithChildren } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import Navbar from '../global/Navbar';
import Sidebar from '../global/Sidebar';
import ModalProvider from './ModalProvider';
import { ThemeProvider } from './ThemeProvider';
import FilterComponent from '../global/FilterComponent';
import CustomSidebar from '../global/CustomSidebar';
import Modal from '../global/Modal';
import { privyConfig } from '@/lib/adapters/privy/config';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from '@/lib/constants';
import CustomProvider from './CustomProvider';
import { WagmiProvider } from '@privy-io/wagmi';
import { wagmiConfig, connectors } from '@/lib/adapters/wagmi/config';
import { useSyncWagmiConfig } from '@lifi/wallet-management';
import { useAvailableChains } from '@lifi/widget';
import { Config } from 'wagmi';

function CustomWagmiProvider({ children }: PropsWithChildren) {
  const { chains } = useAvailableChains();
  const wagmi = React.useRef<Config>(null);

  if (!wagmi.current) wagmi.current = wagmiConfig;

  useSyncWagmiConfig(wagmi.current, connectors, chains);

  return <WagmiProvider config={wagmi.current}>{children}</WagmiProvider>;
}

export default function GlobalProvider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <Suspense>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID} config={privyConfig}>
          <QueryClientProvider client={queryClient}>
            <CustomWagmiProvider>
              <CustomProvider>
                <ModalProvider>
                  <main className="md:w-[calc(100vw-64px)] md:ml-16 mb-0 md:mb-0">
                    <aside>
                      <Sidebar />
                    </aside>

                    <aside>
                      <Navbar />
                      <div>{children}</div>
                    </aside>
                  </main>
                  <Modal />
                  <FilterComponent />
                  <CustomSidebar />
                </ModalProvider>
              </CustomProvider>
            </CustomWagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </ThemeProvider>
    </Suspense>
  );
}
