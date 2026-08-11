# Frontend Component Architecture

## 1. Objective

This document defines the incremental component architecture for the Golden-Drip Cafe Web Admin, Customer Web Menu, Platform Admin, and Cafe Desktop Electron client. The refactor preserves existing routes, business behavior, access control, tenant branding, API contracts, development adapters, and Electron packaging.

The intended dependency direction is:

```text
Route page
  -> feature components
  -> application-shared components
  -> UI primitives

Route page / feature component
  -> feature hook or controller
  -> application service
  -> repository or API adapter
```

Components are extracted only when they are reused, own meaningful interaction, represent a domain concept, or materially clarify a page. Single wrappers and one-line fragments remain inline.

## 2. Audit Findings

### Existing strengths

- `src/components/ui` already provides the Radix/shadcn-style primitive layer. It remains the only Web primitive system.
- `src/components/shared` already contains page headers, data tables, pagination, search, loading, empty/error states, prices, dialogs, and status badges.
- Providers, services, repositories, and Zustand stores already establish useful state and data boundaries.
- `shared/development-data` is the canonical shared development fixture source.
- `shared/presentation` is already consumed by both Web and Desktop for order presentation.
- Permission and feature gates already use permission/feature keys rather than employee role names.

### Problems found

- Several route files contain 300-700 lines and combine data lookup, filtering, mutations, dialogs, tables, and low-level JSX.
- Web POS and Orders contain interaction workflows and presentation markup in their route components.
- Product, tenant, cart, branding, payment, and report screens contain multiple independent responsibilities.
- `desktop/src/pages/OperationalPages.tsx` contains Dashboard, POS, Orders, Order Details, Kitchen, shared layout pieces, and CSV export in one file.
- Money/date rendering and status styles are repeated in Web and Desktop.
- Similar page headers, search/filter rows, table empty states, and badges are sometimes reimplemented despite existing shared components.
- Some feature-specific components live directly in route files, making reuse and focused testing difficult.
- A few large files are large because of configuration or canonical data. Those are data-oriented, not UI responsibility problems, and should not be split mechanically.

## 3. Target Folder Architecture

```text
src/
  app/                         # Next.js route composition and boundaries
  components/
    ui/                        # existing generic primitives
    shared/                    # application-wide composed UI
    layout/                    # cross-feature layout building blocks
    feedback/                  # loading, empty, error and route states
    access/                    # permission/feature/client availability gates
    admin/                     # Cafe shell and broad admin composition
    customer/                  # Customer Menu rendering components
    platform/                  # Platform-only rendering components
    features/
      dashboard/
      pos/
      orders/
      kitchen/
      products/
      inventory/
      employees/
      roles/
      menus/
      customers/
  hooks/                       # genuinely reusable application hooks
  services/                    # workflows and application use cases
  repositories/               # API/development persistence adapters
  providers/                   # React context boundaries
  store/                       # global/cross-feature client state
  lib/                         # pure domain and formatting helpers
  types/                       # contracts and domain types

desktop/src/
  components/
    ui/                        # Desktop-only primitives/compositions
    layout/                    # Electron shell rendering
    shared/                    # reusable Desktop application UI
    features/                  # Desktop feature presentation
  hooks/                       # Desktop controllers and derived state
  pages/                       # one route-level responsibility per file
  dev/                         # shared-development-data adapter
  store/                       # Redux state

shared/
  development-data/           # canonical development fixtures
  presentation/               # client-neutral labels, tones and formatters
```

The structure is directional, not a requirement to create empty folders. New folders are added only with concrete components.

## 4. Component Levels

### UI primitives

Generic controls such as Button, Input, Dialog, Select, Badge, Card, Table, Tabs, Skeleton, and Tooltip remain under `src/components/ui`. New primitives must not duplicate an existing Radix/shadcn component.

### Application-shared components

Reusable product UI such as PageHeader, SearchInput, DataTable, Pagination, EmptyState, LoadingState, ConfirmationDialog, Price, and StatusBadge belongs under `src/components/shared` or `src/components/feedback` when it is state-specific.

### Feature components

Components that understand a domain concept belong under `src/components/features/<feature>`. Examples include `PosCart`, `OrdersFilters`, `OrdersTable`, `OrderStatusBadge`, and `KitchenOrderCard`. They receive typed props and avoid direct repository access.

### Route pages

Route pages resolve route parameters, enforce route-level client/server boundaries, connect feature controllers, and compose feature components. They should not duplicate tables, badges, dialogs, or lengthy mutation workflows.

## 5. Hooks and Controller Strategy

- Extract a hook when it coordinates several state values, derives meaningful data, or owns a workflow.
- Keep one-off visual state local.
- Do not wrap a single `useState` merely to move it.
- Existing providers remain responsible for tenant, branch, employee, and customer route context.
- Existing services remain responsible for business workflows and repositories remain responsible for persistence/API adaptation.
- Hooks may call services and expose small, intention-revealing handlers to visual components.

Example:

```tsx
const checkout = usePosCheckout({ menuItems, tables });

return <PosCart {...checkout.cartProps} onSubmit={checkout.submit} />;
```

## 6. Shared Presentation Strategy

Client-neutral mappings belong in `shared/presentation`:

- order status labels and tones
- payment status labels and tones
- order source/type labels
- payment method labels
- currency, date, time, and quantity formatting when both clients use the same output contract

Web and Desktop can map semantic tones to their own class names. Web-specific rendering such as `next/image` stays in Web; Desktop may use native `img`.

`MenuItem.price` remains the authoritative selling price everywhere. Presentation extraction must not introduce or trust a competing Product selling price.

## 7. Access and Branding

- Authorization remains permission-based. Role names are presentation data only.
- Feature checks and branch access remain in the current access architecture.
- Tenant semantic CSS variables remain the source for Cafe branding.
- Platform components remain independent of Cafe Tenant branding.
- The fixed Penta-K customer footer attribution remains present and is not exposed as a Tenant setting.

## 8. Migration Plan

1. Preserve the current primitive system and document reusable shared components.
2. Centralize shared presentation helpers before moving markup.
3. Split Desktop operational routes and extract Desktop shared layout/status components.
4. Extract POS controller/cart/product-grid components without changing the current product card visuals.
5. Extract Orders filters/table/details/status components while preserving state transitions.
6. Extract Dashboard and Kitchen presentation sections.
7. Refactor Products/Menus, Inventory, Customers, Employees/Roles, then remaining Cafe modules.
8. Componentize Customer Menu while preserving routing, cart behavior, and Penta-K attribution.
9. Componentize Platform forms/tables without importing Tenant-branded components.
10. Remove only imports/components proven dead after route and build verification.
11. Re-run duplicate and file-size audits and document intentionally large files.

After each major group, run TypeScript validation. Final gates are Web typecheck/lint/build, Desktop typecheck/lint/build, Electron development renderer startup, and Electron smoke startup. Installer generation is excluded because packaging files are unchanged.

## 9. Practical Placement Examples

### POS

```text
app/(cafe)/admin/pos/page.tsx
  -> components/features/pos/pos-workspace.tsx
     -> pos-product-browser.tsx
     -> existing pos-product-card.tsx
     -> pos-cart.tsx
  -> hooks/use-pos-checkout.ts
  -> services/checkout.service.ts
```

### Orders

```text
app/(cafe)/admin/orders/page.tsx
  -> components/features/orders/orders-filters.tsx
  -> components/features/orders/orders-table.tsx
  -> components/features/orders/order-badges.tsx
  -> hooks/use-order-filters.ts
  -> services/order.service.ts
```

### Desktop operational routes

```text
pages/DashboardPage.tsx
pages/PosPage.tsx
pages/OrdersPage.tsx
pages/OrderDetailsPage.tsx
pages/KitchenPage.tsx
  -> components/shared/*
  -> components/features/*
  -> hooks/*
  -> Redux actions and development adapter
```

## 10. Adding New Code

- Add a primitive only when no existing primitive has the needed generic behavior.
- Add reusable non-domain UI to `components/shared`.
- Add domain-aware UI beside its feature.
- Add route composition to `app` (Web) or `pages` (Desktop).
- Add multi-state reusable interaction logic to a hook.
- Add workflows to services and persistence concerns to repositories.
- Prefer existing aliases (`@/*`, `@shared/*`) and avoid broad barrel exports that can create cycles.
- Preserve semantic permission, feature, tenant, and branch checks during every extraction.

## 11. Verification and Remaining Audit

The living migration report is completed after implementation. It records extracted components, before/after page composition, remaining intentionally large files, shared versus client-specific code, quality-gate results, and remaining technical debt.

## 12. Completed Migration Report

### 12.1 Previous architectural problems

The audit found route files that owned filtering, mutations, dialogs, tables, and low-level markup at the same time. Web POS, Orders, Products, Payments, Customer Cart, Platform Tenant Form, and Desktop operational screens were the most concentrated examples. Desktop also bundled five unrelated route pages in `OperationalPages.tsx`. Order/payment badges, money formatting, filter controls, and navigation markup had repeated implementations.

### 12.2 New concrete structure

The migration added feature-owned folders for:

- `customer-cart` and `customer-menu`
- `orders`, `payments`, `pos`, `products`, `reports`, and `tenants`
- Desktop `kitchen`, `orders`, and `pos`

It also added Web layout-owned admin navigation/sidebar components, Desktop shared page layout components, and feature controllers under both clients' `hooks` folders.

### 12.3 Shared UI and data-display components

The existing Button, Input, Card, Dialog, Badge, Table, Pagination, SearchInput, EmptyState, LoadingState, Price, ConfirmDialog, and StatusBadge implementations were reused. New domain-aware display components include:

- Orders filters, table, badges, cancellation dialog, and order detail sections
- Payments filters, table, and detail/refund dialogs
- Products filters, table, and form dialog
- Report metric grid and report table
- Desktop page, panel, metric, filter button, empty state, and information rows

No second primitive or forms system was introduced.

### 12.4 Layout components

Cafe admin navigation data moved to `components/layout/admin-navigation.ts`. Desktop/mobile sidebar rendering moved to `CafeAdminSidebar`; `AdminShell` now owns session/access decisions and composes the layout. Desktop operational screens use a shared Desktop page layout while retaining Electron-specific rendering.

### 12.5 Form components

The Product form became `ProductFormDialog`. Platform Tenant creation/editing now composes separate details, owner, branding, plan/features, subscription, review, and navigation components around a typed `TenantDraft`. `TenantFormField` is shared only within that meaningful form family.

### 12.6 Feature results

1. Dashboard: existing focused Web dashboard composition was retained; Desktop Dashboard is now its own route page and reuses Desktop metric/panel components.
2. POS: Web uses `usePosPage`, `PosProductBrowser`, `PosCart`, and `PosModifierDialog`. Desktop uses `usePosCheckout`, `PosProductBrowser`, and `PosCart`.
3. Orders: Web uses `useOrdersPage`, reusable filters/table/badges/cancellation/detail sections. Desktop uses `useOrderFilters`, reusable filters/table/status badge, and an independent detail page.
4. Kitchen: Desktop Kitchen is independent and composes `KitchenBoard` and `KitchenOrderCard`. Existing permission behavior remains key-based.
5. Products/Menu: Product state/workflows moved to `useProductsPage`; table/form/filter rendering is feature-owned. Customer Menu product cards and category controls are isolated without changing their visuals.
6. Inventory: existing service-backed inventory pages and unit helpers were retained; no duplicate inventory framework was added.
7. Customers: existing customer service/details separation was retained. Customer Cart now uses `useCustomerCart` plus item, empty, and checkout summary components.
8. Employees/Roles: existing permission-based services and gates were retained. No role-name authorization was introduced.
9. Platform: Tenant form steps and branding preview are Platform/Tenant feature components and do not import Cafe shell branding.

### 12.7 Hooks extracted

- `usePosPage`
- `useOrdersPage`
- `usePaymentsPage`
- `useProductsPage`
- `useCustomerCart`
- Desktop `usePosCheckout`
- Desktop `useOrderFilters`

These hooks coordinate several state values and workflows; one-state wrapper hooks were deliberately avoided.

### 12.8 Presentation helpers centralized

Both clients continue to consume `shared/presentation/order`. New feature badges map semantic order/payment states once per client rendering system. Existing `formatMoney` and date formatters are reused. Desktop order formatting is isolated in a client-neutral feature helper. `MenuItem.price` behavior and the current branch-product adapter were not changed.

### 12.9 Duplicate and dead code removed

- The unused Orders in-page detail dialog was removed because the dedicated order-details route is authoritative.
- Repeated Desktop page/panel/status/money implementations left `OperationalPages.tsx`.
- Repeated Web order/payment table badges moved to feature components.
- Customer Cart, Product, POS, and Tenant form markup no longer lives in route/controller files.
- The old inline branding preview was removed after the new preview component was wired.

### 12.10 Large-file result

Key route/controller reductions after formatting:

| File | Before | After | Result |
| --- | ---: | ---: | --- |
| Web POS page | 630 | 62 | composition page |
| Web Orders page | 736 | 82 | composition page |
| Web Products page | 604 | 120 | composition page |
| Customer Cart page | 696 | 35 | composition page |
| Web Order Details page | 421 | about 160 | route/controller plus feature sections |
| Web Payments page | 437 | under 100 | composition page |
| Platform Tenant Form | 837 | 297 | controller plus six feature steps |
| Cafe Admin Shell | 578 | 325 | access/layout composition |
| Desktop OperationalPages | 254 | 5 | compatibility re-exports only |

Remaining intentionally larger UI files are:

- Platform Tenant Branding editor: a single live controlled-editor workflow; its preview is now isolated.
- Customer Menu client: carousel/drag/hydration orchestration remains together; product cards and category controls are isolated.
- Add-ons, Platform Plans, Purchases, Settings, Inventory, and Menu screens: each remains a cohesive feature-specific CRUD workflow near the audit threshold. Splitting their accidental similarities into universal business forms would add coupling without meaningful reuse.
- Finance, checkout, and customer services: intentionally large application/domain services rather than React presentation files. They preserve transaction and business-rule boundaries.

### 12.11 Web/Desktop sharing

Shared: contracts, development fixtures, order labels/tones, permission and feature keys, domain services/helpers, and formatting behavior.

Web-specific: Next.js routes, `next/image`, server/client boundaries, Radix/shadcn primitives, and Tenant CSS rendering.

Desktop-specific: React Router route pages, Redux controllers, native `img` rendering, Electron shell, and Desktop Tailwind compositions.

No Next.js component was forced into Electron, and no Electron packaging file was changed.

## 13. Before/After Composition Examples

### POS

Before: one route owned product loading, search, cart controls, customer/delivery fields, modifiers, validation, checkout, and all markup.

After:

```text
PosPage
  -> usePosPage
  -> PosProductBrowser
     -> existing PosProductCard (visual preserved)
  -> PosCart
  -> PosModifierDialog
  -> PaymentDialog
  -> checkoutService
```

### Orders

Before: one route owned event subscription, eleven filter values, CSV export, transitions, cancellation, table markup, badges, pagination, and a second unused detail dialog.

After:

```text
OrdersPage
  -> useOrdersPage
  -> OrdersFilters
  -> OrdersTable
     -> OrderStatusBadge / PaymentStatusBadge
  -> OrderCancellationDialog
  -> orderService / reportService
```

### Desktop OperationalPages

Before:

```text
OperationalPages.tsx
  Dashboard + POS + Orders + Details + Kitchen + shared UI + workflows
```

After:

```text
OperationalPages.tsx (compatibility exports)
  -> DashboardPage
  -> PosPage -> usePosCheckout -> POS feature components
  -> OrdersPage -> useOrderFilters -> Orders feature components
  -> OrderDetailsPage
  -> KitchenPage -> KitchenBoard -> KitchenOrderCard
```

## 14. Business-Behavior Verification

The refactor did not change API endpoint definitions, DTO contracts, Tenant/Branch resolution, permission keys, feature checks, AdminClientMode rules, order transitions, payment/refund workflows, inventory restoration, development adapters, Electron production security, packaging, or Penta-K attribution. Local visual state remains local; existing Zustand/Redux ownership remains unchanged.

The fixed Penta-K customer attribution remains in its existing Customer layout/footer component and no Tenant control was added for it.

## 15. Quality Gates

- Web TypeScript: passed
- Web lint: passed with no warnings
- Web production build: passed; all 54 pages generated/validated
- Desktop TypeScript and Electron TypeScript: passed
- Desktop lint: passed with zero warnings
- Desktop Vite production build: passed
- Electron development Vite startup: passed
- Electron renderer smoke startup: passed
- Electron main-process smoke startup: passed
- Windows installer: intentionally not regenerated because packaging configuration was untouched

## 16. Remaining Technical Debt

- The legacy `OrderStatus` type still includes `REFUNDED`; correcting that domain contract is outside this frontend-only refactor and would be a business-contract change.
- A few cohesive CRUD screens can adopt the new filter/table/dialog patterns when future feature work touches them, but they were not forced into a universal business component.
- `next lint` reports its upstream deprecation notice; migrating the lint script is build-tooling work and was intentionally excluded.
- The development adapters remain local/in-memory until the frozen Backend API is implemented.
