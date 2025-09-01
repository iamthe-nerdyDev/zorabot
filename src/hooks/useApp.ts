'use client';

import { User } from '@/generated/prisma';
import { BASE_URL } from '@/lib/constants';
import sdk from '@farcaster/miniapp-sdk';
import { SiweMessage } from 'siwe';
import { create } from 'zustand';

interface AppState {
  isReady: boolean;
  isInMiniApp: boolean;
  user?: User;
  init: () => Promise<void>;
  getNonce: () => Promise<string | null>;
  whoami: () => Promise<void>;
  logout: () => Promise<void>;
  siwe: (message: SiweMessage, signature: string) => Promise<boolean>;
}

export const useApp = create<AppState>((set, get) => ({
  isReady: false,
  isInMiniApp: false,
  init: async () => {
    const state = get();
    if (state.isReady) return;
    // --
    const isInMiniApp = await sdk.isInMiniApp();
    if (isInMiniApp) {
      await sdk.back.enableWebNavigation();
      await sdk.actions.ready();
    }

    // -- set user if already authenticated
    await state.whoami();
    set({ isInMiniApp, isReady: true });
  },
  getNonce: async () => {
    const res = await fetch('/api/nonce');
    if (!res.ok) return null;
    // --
    return (await res.json())?.data?.nonce ?? null;
  },
  siwe: async (message: SiweMessage, signature: string) => {
    const state = get();
    const res = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    });
    // --
    if (!res.ok) return false;
    const user = (await res.json())?.data;
    // --- if in mini app, set user fid
    if (state.isInMiniApp) {
      await sdk.quickAuth.fetch(`${BASE_URL}/api/auth`, {
        credentials: 'include',
      });
    }

    set({ user });
    return true;
  },
  whoami: async () => {
    const res = await fetch('/api/whoami', {
      credentials: 'include',
    });
    if (!res.ok) return;
    // --
    const user = (await res.json())?.data;
    set({ user });
  },
  logout: async () => {
    const user = get().user;
    set({ user: undefined });
    const res = await fetch('/api/auth', {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) return;
    // --
    const success = (await res.json())?.data;
    if (!success) set({ user });
  },
}));
