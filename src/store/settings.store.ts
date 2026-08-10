"use client";

import { create } from "zustand";
import { cafeDataService } from "@/services/cafe-data.service";

interface SettingsState { tenantId: string; serviceTaxPercent: number; loadForTenant: (tenantId?: string) => void; setServiceTaxPercent: (value: number) => void; getServiceTaxAmount: (subtotal: number) => number; getTotalWithServiceTax: (subtotal: number) => number; }
export const useSettingsStore = create<SettingsState>((set) => ({
  tenantId: "", serviceTaxPercent: 0,
  loadForTenant: (tenantId = cafeDataService.tenantId()) => { const settings = cafeDataService.getSettings(); set({ tenantId, serviceTaxPercent: settings.serviceCharge }); },
  setServiceTaxPercent: (value) => { const safe = Math.max(0, Math.min(100, value)); const settings = cafeDataService.getSettings(); cafeDataService.saveSettings({ ...settings, serviceCharge: safe }); set({ serviceTaxPercent: safe }); },
  getServiceTaxAmount: (subtotal) => Math.round(subtotal * (cafeDataService.getSettings().serviceCharge / 100)),
  getTotalWithServiceTax: (subtotal) => subtotal + Math.round(subtotal * (cafeDataService.getSettings().serviceCharge / 100)),
}));
