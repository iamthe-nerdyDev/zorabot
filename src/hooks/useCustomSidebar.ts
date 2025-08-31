'use client';

import React from 'react';
import { create } from 'zustand';

interface CustomSidebarState {
  state: boolean;
  content?: React.ReactNode;
  open: ({ content }: { content: React.ReactNode }) => void;
  close: () => void;
}

export const useCustomSidebar = create<CustomSidebarState>((set) => ({
  state: false,
  open: ({ content }: { content: React.ReactNode }) => set({ state: true, content }),
  close: () => set({ state: false }),
  toggle: () => set((state) => ({ state: !state.state })),
}));
