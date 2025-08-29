'use client';

import { create } from 'zustand';

type FilterOptions = {
  creators?: Creator[];
  isCreatorToken?: boolean;
  isContentToken?: boolean;
  totalVolume?: boolean;
  volume24h?: boolean;
  marketCap?: boolean;
  uniqueHolders?: boolean;
};

type OpenInput = {
  options: FilterOptions;
  cb: (input: Filters) => void;
};

interface FilterSidebarState {
  state: boolean;
  options?: FilterOptions;
  cb?: (value: Filters) => void;
  open: (input: OpenInput) => void;
  close: () => void;
}

export const useFilterSidebar = create<FilterSidebarState>((set) => ({
  state: false,
  open: (input: OpenInput) => {
    set({ state: true, options: input.options, cb: input.cb });
  },
  close: () => set({ state: false, options: undefined }),
}));
