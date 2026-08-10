# Cafe Admin tenant data flow

The development data boundary is now:

`Cafe Admin UI -> cafeDataService -> tenantDataRepository -> tenantStorage`

Tenant storage keys are versioned and namespaced as `tenant-data:v1:{tenantId}:{resource}`. Golden Drip and Moon Café have separate seeded products, categories, orders, tables, and offers. A newly created tenant has no business seed data.

The development tenant switcher clears the cart, reloads orders/settings for the selected tenant, then reloads the page to reset component-local filters and selections. This is frontend-only isolation and is not a security boundary.

Migrated core flows: dashboard, orders/POS creation, kitchen status updates, settings, offers, and the shared mock datasets used by products/categories/tables/QR. The remaining low-level demo-only screens (such as inventory/recipes/coupons/waiter requests) still contain presentation fixtures and should be moved to the same repository pattern when their CRUD persistence is implemented.

Production still requires server-side tenant resolution and authorization for every tenant-owned resource.
