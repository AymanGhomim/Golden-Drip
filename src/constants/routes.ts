export const ROUTES = {
  home: "/",
  menu: "/menu",
  cart: "/cart",
  orderSuccess: "/order-success",
  order: (id: string) => `/order/${id}`,
  admin: {
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    pos: "/admin/pos",
    products: "/admin/products",
    categories: "/admin/categories",
    offers: "/admin/offers",
    orders: "/admin/orders",
    tables: "/admin/tables",
    qr: "/admin/qr",
    settings: "/admin/settings",
  },
  kitchen: {
    orders: "/kitchen/orders",
  },
} as const;
