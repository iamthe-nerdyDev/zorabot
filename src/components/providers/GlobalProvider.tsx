'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type PropsWithChildren } from 'react';
import Navbar from '../global/Navbar';
import Sidebar from '../global/Sidebar';
import ModalProvider from './ModalProvider';
import { ThemeProvider } from './ThemeProvider';

export default function GlobalProvider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <main className="md:w-[calc(100vw-60px)] md:ml-15">
            <aside>
              <Sidebar />
            </aside>

            <aside>
              <Navbar />
              <div>{children}</div>
            </aside>
          </main>
        </ModalProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
