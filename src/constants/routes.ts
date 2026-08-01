export const ROUTES = {
  home: "/",
  menu: "/menu",
  cart: "/cart",
  orderSuccess: "/order-success",
  order: (id: string) => `/order/${id}`,
  admin: {
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    products: "/admin/products",
    categories: "/admin/categories",
    offers: "/admin/offers",
    orders: "/admin/orders",
    tables: "/admin/tables",
    settings: "/admin/settings",
  },
  kitchen: {
    orders: "/kitchen/orders",
  },
} as const;
