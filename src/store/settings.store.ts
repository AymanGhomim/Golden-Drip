"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  serviceTaxPercent: number;
  setServiceTaxPercent: (value: number) => void;
  getServiceTaxAmount: (subtotal: number) => number;
  getTotalWithServiceTax: (subtotal: number) => number;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      serviceTaxPercent: 0,

      setServiceTaxPercent: (value) =>
        set({ serviceTaxPercent: clampPercent(Number.isFinite(value) ? value : 0) }),

      getServiceTaxAmount: (subtotal) => {
        return Math.round((subtotal * get().serviceTaxPercent) / 100);
      },

      getTotalWithServiceTax: (subtotal) => {
        return subtotal + get().getServiceTaxAmount(subtotal);
      },
    }),
    {
      name: "golden-drip-settings",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
