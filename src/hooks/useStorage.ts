import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StorageState {
  quickBuyPreset: number;
  buyPresets: number[];
  sellPresets: number[];
  buySlippage: number;
  buyPriorityFee: number;
  sellSlippage: number;
  sellPriorityFee: number;
  setQuickBuyPreset: (value: number) => void;
  setBuyPresets: (value: number[]) => void;
  setSellPresets: (value: number[]) => void;
  setBuySlippage: (value: number) => void;
  setBuyPriorityFee: (value: number) => void;
  setSellSlippage: (value: number) => void;
  setSellPriorityFee: (value: number) => void;
}

export const useStorage = create<StorageState>()(
  persist(
    (set) => ({
      quickBuyPreset: 0,
      buyPresets: [0.01, 0.1, 0.5, 1],
      sellPresets: [25, 50, 75, 100],
      buySlippage: 20,
      buyPriorityFee: 0.01,
      sellSlippage: 20,
      sellPriorityFee: 0.01,
      // --
      setQuickBuyPreset: (value) => set({ quickBuyPreset: value }),
      setBuyPresets: (value) => set({ buyPresets: value }),
      setSellPresets: (value) => set({ sellPresets: value }),
      setBuySlippage: (value) => set({ buySlippage: value }),
      setBuyPriorityFee: (value) => set({ buyPriorityFee: value }),
      setSellSlippage: (value) => set({ sellSlippage: value }),
      setSellPriorityFee: (value) => set({ sellPriorityFee: value }),
    }),
    { name: 'zorabot-settings' }
  )
);
