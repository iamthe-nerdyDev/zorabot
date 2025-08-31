'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren } from 'react';
import Navbar from '../global/Navbar';
import Sidebar from '../global/Sidebar';
import ModalProvider from './ModalProvider';
import { ThemeProvider } from './ThemeProvider';
import FilterComponent from '../global/FilterComponent';
import CustomSidebar from '../global/CustomSidebar';

export default function GlobalProvider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
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
          <FilterComponent />
          <CustomSidebar />
        </ModalProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
