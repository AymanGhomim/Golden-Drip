# Shared Development Data

## Purpose

Cafe Web Admin, Cafe Desktop, Customer Menu, and Platform Web now initialize from one canonical development dataset. This is a frontend development mechanism only; it is not a Backend, a shared database, or realtime synchronization.

The canonical fixtures are in [shared/development-data/index.ts](../shared/development-data/index.ts). Shared order presentation labels are in [shared/presentation/order.ts](../shared/presentation/order.ts).

## Audit and source mapping

| Domain | Previous Web source | Previous Desktop source | Canonical source / adapter |
|---|---|---|---|
| Tenant and branding | `src/config/tenants.config.ts` | `desktop/src/dev/development-data.ts` | `shared/development-data/index.ts` |
| Branches, menus, MenuItems | private seed functions in `branch.repository.ts` | independent Desktop branches and products | shared fixtures → Web `branchRepository` / Desktop `desktopDevelopmentRepository` |
| Products and categories | `src/mocks/*.mock.ts` | four independent sellable products | shared fixtures → Web mock/repository compatibility exports / Desktop adapter |
| Orders | `src/mocks/orders.mock.ts` with runtime dates | two independent Desktop orders | shared fixtures with stable timestamps → local stores |
| Tables and offers | Web mock files | absent | shared fixtures |
| Inventory and operational resources | private seed function in `cafe-operations.repository.ts` | absent | shared `developmentOperations` → client adapters |
| Employees, roles, permissions | private seed functions in `access-control.repository.ts` | independent owner, role, and permission array | shared employees/roles using the existing canonical Web permission contract |
| Dashboard mock summaries | unused independent `dashboard.mock.ts` | derived from Desktop orders | removed; both dashboards derive metrics from canonical source records |
| Arabic status/source/type labels | page-local mappings | Desktop-local mappings | `shared/presentation/order.ts` |

The conflicting Desktop fixtures (`branch-golden-main`, `branch-golden-roastery`, `p-espresso`, `mi-espresso`, `order-1042`, `employee-desktop-owner`, and `role-desktop-owner`) were removed. No alternative Desktop Golden Drip IDs remain.

## Canonical Golden Drip identity

- Tenant: `tenant-golden-drip`
- Slug: `golden-drip`
- Admin client mode: `BOTH`
- Branch: `branch-golden-nasr` (`فرع كفر الشيخ`, code `KFS`)
- Assigned menu: `menu-golden-cairo`
- Development Desktop owner: `tenant-golden-drip:employee:owner`
- Owner login: `owner@golden.demo` or username `owner`
- Owner role: `tenant-golden-drip:role:OWNER`

Moon Café remains `adminClientMode = WEB`. Desktop development authentication rejects it without changing the product decision.

## Pricing rule

`MenuItem.price` is the authoritative selling price in both clients. Desktop sellable products are resolved through:

`Tenant → Branch → assigned Menu → MenuItem → Product`

The Web `branchService.getBranchProducts` and Desktop `desktopDevelopmentRepository.getSellableMenuItems` both resolve the branch Menu first. `Product.price` remains in the current frontend model only as a catalog/default compatibility value; checkout does not use it when an assigned MenuItem exists.

For example, `prod-6` is `85 EGP` in `menu-golden-cairo` and `100 EGP` in `menu-golden-new-cairo`. Desktop does not maintain a separate price for it.

## Repository and mutable-state boundaries

```text
Canonical development fixtures
        ├── Web repositories/services ──> Web localStorage/Zustand/UI
        └── Desktop development adapter ──> Redux/UI
```

UI components do not read canonical fixture arrays directly. Web repositories clone fixtures into tenant-scoped local storage. Desktop dynamically loads its development adapter after development login and hydrates a local Redux snapshot.

Both clients therefore start from the same records and IDs in a clean development profile. Runtime changes remain client-local:

- Web mutations persist in that browser profile's local storage.
- Desktop mutations remain in that Electron renderer's Redux state.
- A mutation in one client does not appear live in the other client.
- Existing persisted Web development data is preserved and may differ from a clean fixture initialization until local development storage is reset.

True cross-client persistence, concurrency, and realtime events will be provided by the future shared Backend. No development server or production Backend was added in this task.

## Canonical operational resources

All current operation resource keys have one canonical fixture location: inventory, stock movements, stock counts, waste, recipes, suppliers, purchases, expenses, customers, loyalty, coupons, delivery zones, payments, refunds, cash register, shifts, notifications, waiter requests, modifier groups, loyalty settings, and audit log.

Only records that already existed as current product data were retained. Resources without existing development records use one canonical empty array rather than invented examples. Future Desktop module adapters should call `desktopDevelopmentRepository.getOperations(...)` instead of creating module-local examples.

## Branding

Golden Drip logo, colors, surfaces, sidebar colors, active sidebar colors, text, border, radius, and font originate from the canonical Tenant. Desktop converts that object to CSS variables in `AppShell`; it does not hard-code a second Golden Drip palette.

## Verification matrix: Golden Drip data

| Domain | Result | Evidence |
|---|---|---|
| Tenant | MATCH | Both adapters use `developmentTenants` |
| Branding | MATCH | Same Tenant branding object and logo path |
| Branches | MATCH | Same `developmentBranches` records and IDs |
| Products | MATCH | Same 20 Golden Drip products and IDs |
| Categories | MATCH | Same six categories and IDs |
| Menus | MATCH | Same menu records and branch assignment |
| MenuItem prices | MATCH | Both resolve `developmentMenuItems`; no Desktop price list |
| Modifiers | MATCH | One canonical empty initial resource |
| Orders | MATCH | Same four stable initial Golden Drip orders and IDs |
| Inventory | MATCH | Same `inv-coffee` branch record |
| Employees | MATCH | Same canonical employee records and IDs |
| Roles | MATCH | Same role records and permission lists |
| Permissions | MATCH | Shared roles are built from the existing `DEFAULT_ROLE_PERMISSIONS` contract |
| Features | MATCH | Desktop session receives canonical `tenant.features` |

## UI comparison

| Screen | Result | Notes |
|---|---|---|
| Dashboard | CLOSE MATCH | Same title, permission-aware KPIs, source metrics, recent orders, and kitchen summary. Desktop uses lightweight CSS bars instead of the Web Recharts component. |
| POS | CLOSE MATCH | Same title, branch-menu pricing, search/categories, product cards, order types, table selection, cart notes, discount, totals, and payment choice. Desktop uses an inline Electron-oriented checkout panel instead of the Web responsive dialogs. |
| Orders | CLOSE MATCH | Same title, status tabs, search, type/source filters, columns, badges, actions, CSV export, and empty state. Current fixture volume requires one page only. |
| Order Details | CLOSE MATCH | Same operational, item, total, customer, payment, branch/table, timeline, and permission-aware action sections. Desktop printing/refund workflows remain dependent on future platform integration. |
| Kitchen | MATCHED | Same KPIs, three KDS stages, cards, late state, sound toggle, and `kitchen.update` gating while consuming the Orders resource. |

The differences above are presentation/integration adaptations for the Electron client; they do not create different business data or terminology.

## Arabic and encoding

Shared and Desktop development source files are UTF-8. The malformed/independent Desktop Arabic fixture path was removed. Canonical Arabic labels come from the existing Web terminology and the shared presentation helper.

## Future Backend replacement

When the Backend is available:

1. Keep the current UI-facing repository/service interfaces.
2. Replace Web mock repository initialization with API repositories.
3. Replace Desktop's dynamically imported development adapter with RTK Query endpoints.
4. Hydrate both clients from Backend responses using the same contract IDs.
5. Remove fixture initialization only after API parity tests pass.

This change does not modify the frozen Backend API contract, endpoint count, Electron packaging, NSIS configuration, product name, app ID, signing, or update behavior.

## Verification results

Verified on 2026-08-11:

| Check | Result |
|---|---|
| Web `npm run type-check` | PASS |
| Web `npm run lint` | PASS (Next.js printed its existing deprecation notice for `next lint`) |
| Web `npm run build` | PASS; 54 static pages generated |
| Desktop `npm run typecheck` | PASS |
| Desktop `npm run lint` | PASS with zero warnings |
| Desktop `npm run build` | PASS |
| Electron main-process smoke test | PASS |
| Electron development renderer startup | PASS (`Electron renderer loaded successfully`) |
| Production Desktop bundle fixture scan | PASS; no Golden Drip development credentials/data found |
| Common mojibake marker scan | PASS |
