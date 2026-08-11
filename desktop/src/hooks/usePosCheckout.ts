import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { orderCreated } from "@/store/orders-slice";

type CartLine = { menuItemId: string; quantity: number; notes: string };
type OrderType = "TABLE" | "TAKEAWAY" | "DELIVERY";
type PaymentMethod = "CASH" | "CARD";

export function usePosCheckout() {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [orderType, setOrderType] = useState<OrderType>("TABLE");
  const [tableId, setTableId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const menuItems = useAppSelector((state) => state.development.menuItems);
  const tables = useAppSelector((state) => state.development.tables);
  const session = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const categories = [...new Set(menuItems.map((item) => item.category))];
  const visibleItems = menuItems.filter(
    (item) =>
      (category === "ALL" || item.category === category) &&
      (!query ||
        `${item.name} ${item.category}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const lines = menuItems.flatMap((item) =>
    cart[item.id]?.quantity ? [{ ...item, ...cart[item.id] }] : [],
  );
  const subtotal = lines.reduce(
    (sum, line) => sum + line.menuItemPrice * line.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount);

  function changeQuantity(id: string, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[id]?.quantity ?? 0) + delta);
      if (!next) {
        const clone = { ...current };
        delete clone[id];
        return clone;
      }
      return {
        ...current,
        [id]: {
          menuItemId: id,
          quantity: next,
          notes: current[id]?.notes ?? "",
        },
      };
    });
  }

  function updateLineNotes(id: string, notes: string) {
    setCart((current) => ({ ...current, [id]: { ...current[id], notes } }));
  }

  function changeOrderType(value: OrderType) {
    setOrderType(value);
    setTableId("");
  }

  function submit() {
    if (
      !session?.currentBranch ||
      !lines.length ||
      (orderType === "TABLE" && !tableId)
    )
      return;
    const createdAt = new Date().toISOString();
    const id = `order-${Date.now()}`;
    const table = tables.find((item) => item.id === tableId);
    dispatch(
      orderCreated({
        id,
        tenantId: session.tenant.id,
        branchId: session.currentBranch.id,
        orderNumber: `ORD-${String(Date.now()).slice(-4)}`,
        tableId: table?.id,
        tableNumber: table?.number ?? 0,
        orderType,
        source: "POS",
        paymentStatus: "PAID",
        paymentMethod,
        createdBy: session.employee.id,
        status: "NEW",
        items: lines.map((line, index) => ({
          id: `${id}-item-${index + 1}`,
          productId: line.productId,
          productName: line.name,
          unitPrice: line.menuItemPrice,
          quantity: line.quantity,
          totalPrice: line.menuItemPrice * line.quantity,
          notes: line.notes || undefined,
        })),
        subtotal,
        discount,
        total,
        createdAt,
        timeline: [
          { status: "NEW", employeeId: session.employee.id, at: createdAt },
        ],
      }),
    );
    setCart({});
    navigate(`/orders/${id}`);
  }

  return {
    categories,
    category,
    changeOrderType,
    changeQuantity,
    discount,
    lines,
    menuItems,
    orderType,
    paymentMethod,
    query,
    session,
    setCategory,
    setDiscount,
    setPaymentMethod,
    setQuery,
    setTableId,
    submit,
    subtotal,
    tableId,
    tables,
    total,
    updateLineNotes,
    visibleItems,
  };
}
