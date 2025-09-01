'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, type PropsWithChildren } from 'react';
import Navbar from '../global/Navbar';
import Sidebar from '../global/Sidebar';
import ModalProvider from './ModalProvider';
import { ThemeProvider } from './ThemeProvider';
import FilterComponent from '../global/FilterComponent';
import CustomSidebar from '../global/CustomSidebar';
import Modal from '../global/Modal';
import { sdk } from '@farcaster/miniapp-sdk';

export default function GlobalProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = React.useState(false);
  const queryClient = new QueryClient();

  React.useEffect(() => {
    async function init() {
      if (isReady) return;
      // --
      await sdk.actions.ready();
      setIsReady(true);
    }

    init();
  }, [isReady]);

  return (
    <Suspense>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </ThemeProvider>
    </Suspense>
  );
}
