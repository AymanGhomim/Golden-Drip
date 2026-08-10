"use client";

import { create } from "zustand";
import { cafeDataService } from "@/services/cafe-data.service";
import { branchService } from "@/services/branch.service";
import type { Order, OrderItem, OrderSource, OrderStatus, OrderType } from "@/types/order.types";

type ManualOrderInput = { orderType: OrderType; tableNumber?: number; items: OrderItem[]; subtotal: number; total: number; paymentMethod?: Order["paymentMethod"]; createdBy?: string; };
interface OrdersState { orders: Order[]; tenantId: string; loadForTenant: (tenantId?: string) => void; addOrder: (input: ManualOrderInput & { source?: OrderSource }) => Order; updateStatus: (orderId: string, status: OrderStatus) => void; cancelOrder: (orderId: string) => void; }

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [], tenantId: "",
  loadForTenant: (tenantId = cafeDataService.tenantId()) => set({ tenantId, orders: cafeDataService.getOrders().filter((order) => order.tenantId === tenantId) }),
  addOrder: (input) => {
    const tenantId = cafeDataService.tenantId(); const branchId = branchService.getActiveBranchId(tenantId) ?? undefined;
    const order: Order = { id: `${tenantId}-ord-${Date.now()}`, orderNumber: `ORD-${String(Date.now()).slice(-4)}`, tenantId, branchId, tableNumber: input.tableNumber ?? 0, orderType: input.orderType, source: input.source ?? "MANUAL", paymentMethod: input.paymentMethod ?? "CASH", paymentStatus: "PENDING", createdBy: input.createdBy ?? "Cafe Admin", status: "NEW", items: input.items, subtotal: input.subtotal, total: input.total, createdAt: new Date().toISOString() };
    const orders = [order, ...get().orders]; set({ orders }); cafeDataService.saveOrders(orders); return order;
  },
  updateStatus: (orderId, status) => { const orders = get().orders.map((order) => order.id === orderId ? { ...order, status } : order); set({ orders }); cafeDataService.saveOrders(orders); },
  cancelOrder: (orderId) => { const orders = get().orders.map((order) => order.id === orderId ? { ...order, status: "CANCELLED" as const } : order); set({ orders }); cafeDataService.saveOrders(orders); },
}));
