'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, type PropsWithChildren } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import Navbar from '../global/Navbar';
import Sidebar from '../global/Sidebar';
import ModalProvider from './ModalProvider';
import { ThemeProvider } from './ThemeProvider';
import FilterComponent from '../global/FilterComponent';
import CustomSidebar from '../global/CustomSidebar';
import Modal from '../global/Modal';
import { useApp } from '@/hooks/useApp';
import { wagmiConfig } from '@/lib/wagmi/config';
import { privyConfig } from '@/lib/adapters/privy/config';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from '@/lib/constants';

export default function GlobalProvider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();
  const app = useApp();

  React.useEffect(() => {
    app.init();
  }, [app.isReady]);

  if (!app.isReady) return null;

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
            <WagmiProvider config={wagmiConfig}>
              <ModalProvider>
                <main className="md:w-[calc(100vw-64px)] md:ml-16">
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
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </ThemeProvider>
    </Suspense>
  );
}
