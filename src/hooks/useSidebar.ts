'use client';

import { create } from 'zustand';

interface SidebarState {
  state: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useSidebar = create<SidebarState>((set) => ({
  state: false,
  open: () => set({ state: true }),
  close: () => set({ state: false }),
  toggle: () => set((state) => ({ state: !state.state })),
}));
