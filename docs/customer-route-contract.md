# Customer route contract

Customer-facing routes use the canonical query parameters `tenantId`, `branchId`, and optional `tableId`. `CustomerRouteProvider` resolves and validates that context before customer pages read data or create an order.

- Every customer data lookup must match the resolved tenant and branch.
- QR table orders additionally require a table that belongs to the resolved branch.
- Links between menu, cart, offers, and order status must be built with `useCustomerRoute().href(...)` so the context is preserved.
- Legacy browser-storage table selection is not part of this contract and must not be read or written.
- Invalid or incomplete context must render a safe state and must never silently fall back to another cafe's data in production.

The current frontend adapter persists demo data in browser storage. Production routing and order submission require server-side context validation and tenant-aware authorization at the API boundary as well.
