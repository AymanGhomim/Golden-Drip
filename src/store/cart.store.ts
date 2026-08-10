"use client";

import { create } from "zustand";
import { cafeDataService } from "@/services/cafe-data.service";
import type { CartItem } from "@/types/cart.types";

interface CartState { tenantId: string; items: CartItem[]; addItem: (item: CartItem) => void; removeItem: (productId: string) => void; increaseQuantity: (productId: string) => void; decreaseQuantity: (productId: string) => void; updateNotes: (productId: string, notes: string) => void; clearCart: () => void; getTotalItems: () => number; getSubtotal: () => number; }
export const useCartStore = create<CartState>((set, get) => ({
  tenantId: cafeDataService.tenantId(), items: [],
  addItem: (item) => set((state) => { const tenantId = cafeDataService.tenantId(); const scoped = { ...item, tenantId }; const existing = state.tenantId === tenantId ? state.items.find((current) => current.productId === item.productId) : undefined; return { tenantId, items: existing ? state.items.map((current) => current.productId === item.productId ? { ...current, quantity: current.quantity + item.quantity, notes: item.notes || current.notes } : current) : [...(state.tenantId === tenantId ? state.items : []), scoped] }; }),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
  increaseQuantity: (productId) => set((state) => ({ items: state.items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) })),
  decreaseQuantity: (productId) => set((state) => ({ items: state.items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0) })),
  updateNotes: (productId, notes) => set((state) => ({ items: state.items.map((item) => item.productId === productId ? { ...item, notes } : item) })),
  clearCart: () => set({ tenantId: cafeDataService.tenantId(), items: [] }),
  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
