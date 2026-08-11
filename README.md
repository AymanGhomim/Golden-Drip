# Golden Drip — Product and Project Overview

Golden Drip is a multi-tenant, multi-branch cafe and restaurant management product operated through the Penta-K Platform.

It connects the complete cafe workflow in one product:

```text
Penta-K Platform
→ Cafe tenant
→ Branches
→ Employees and access
→ Menu and pricing
→ Customer ordering and POS
→ Kitchen preparation
→ Payments and refunds
→ Inventory and purchasing
→ Customers and loyalty
→ Reports and audit
```

This README is the shared product overview for Product, Backend, Frontend, Mobile, QA, Design, DevOps, Support, and Operations teams. It describes what the system does, how its modules interact, and the business rules every implementation must preserve.

## 1. Product objective

The product allows Penta-K to operate multiple cafe brands from one Platform while keeping every cafe’s data, branding, employees, branches, menus, and operations isolated.

Each cafe receives:

- A white-label customer menu
- A cafe administration dashboard
- A point-of-sale workflow
- A kitchen order screen
- Branch-level operational management
- Employee roles and permissions
- Inventory and purchasing workflows
- Customer, loyalty, and promotional tools
- Finance and reporting tools

Penta-K receives a separate central Platform for managing tenants, plans, subscriptions, branding, feature access, and branch limits.

## 2. Product hierarchy

```text
Platform
└── Tenant / Cafe Brand
    ├── Client access mode: WEB | DESKTOP | BOTH
    ├── Subscription and enabled features
    ├── Branding and public contact details
    ├── Tenant-level catalog and management data
    ├── Employees
    │   └── Role
    │       └── Permissions
    │           └── Branch access
    └── Branches
        ├── Assigned internal menu
        ├── Tables and QR codes
        ├── Orders and kitchen workflow
        ├── Payments, cash register, and shifts
        ├── Inventory and purchases
        ├── Expenses and delivery zones
        └── Notifications and waiter requests
```

### Scope definitions

| Scope | Meaning | Examples |
|---|---|---|
| Platform | Shared Penta-K administration | Tenants, plans, subscriptions |
| Tenant | Shared across one cafe brand | Products, categories, menus, customers, roles |
| Branch | Operational data for one location | Orders, tables, stock, shifts, expenses |
| Public | Customer-safe data from validated context | Public menu, QR table, public order tracking |

Tenant and branch boundaries are security boundaries, not only interface filters.

## Client delivery architecture

Penta-K supports two staff-facing Cafe clients while keeping one shared product and one shared Backend.

```text
                         ┌────────────────────┐
                         │  Penta-K Platform  │
                         │   Platform Owner   │
                         └─────────┬──────────┘
                                   │ assigns per Cafe
                                   ▼
                           WEB | DESKTOP | BOTH
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
             Cafe Web Client              Cafe Desktop Client
             existing product              additional client
                    └──────────────┬──────────────┘
                                   ▼
                           One Shared Backend
                                   │
                    Tenant, Branch, User, Role,
                    Menu, Orders, Payments, Stock

Customer Menu → Web only → the same shared Backend
```

### Client access modes

The Platform Owner assigns one staff-client mode to every Cafe tenant:

| Mode | Cafe Web | Cafe Desktop | Customer Menu |
|---|---:|---:|---:|
| `WEB` | Enabled | Disabled | Web enabled according to public-menu features |
| `DESKTOP` | Disabled for staff operations | Enabled | Web enabled according to public-menu features |
| `BOTH` | Enabled | Enabled | Web enabled according to public-menu features |

`AdminClientMode` is therefore:

```text
WEB
DESKTOP
BOTH
```

This mode controls which staff-facing clients may open an authenticated Cafe session. It does not create another Tenant, Branch, subscription, role, permission catalog, or operational dataset.

### Cafe Web

The existing Cafe Web application continues to work with its current responsibilities:

- Cafe administration
- POS
- Orders
- Kitchen access
- Inventory and finance
- Employees and settings

The Web client is available when the tenant mode is `WEB` or `BOTH`.

### Cafe Desktop

Cafe Desktop is an additional client for the same Cafe system. It must:

- Authenticate against the shared Backend
- Use the same Tenant and Branch identifiers
- Use the same employees, roles, permissions, and branch access
- Consume the same API contracts and realtime events
- Read and write the same Menu, Orders, Payments, Inventory, Shifts, and other operational records
- Apply the same feature checks and business rules
- Use idempotency for checkout and financial actions
- Respect tenant branding where applicable

The Desktop client must not introduce separate local business truth or a Desktop-only order, menu, payment, or inventory model. Offline operation and synchronization are not assumed; they require a separate explicit product decision.

The Desktop client is available when the tenant mode is `DESKTOP` or `BOTH`.

### Customer Menu

The Customer Menu remains a Web experience for every Cafe. It is not converted into a Desktop client and is not disabled by selecting `DESKTOP` for staff operations.

Customer-menu availability continues to depend on the relevant public features and context:

- Non-QR online menu: `onlineMenu`
- Table QR flow: `qrOrdering`
- Takeaway ordering: `onlineMenu + takeaway`
- Delivery ordering: `onlineMenu + delivery`

### Shared Backend

There is one Backend for Platform, Cafe Web, Cafe Desktop, Kitchen, and Customer Menu.

The shared Backend owns:

- Authentication and client-access-mode enforcement
- Tenant and Branch isolation
- Plans, subscriptions, and features
- Employees, roles, permissions, and branch access
- Menu pricing and checkout
- Orders, kitchen state, payments, and refunds
- Inventory, purchasing, cash, shifts, and expenses
- Customers, loyalty, coupons, and offers
- Notifications, audit, reports, assets, and realtime events

No client may implement alternative business rules. Differences between Web and Desktop are presentation, operating-system integration, and delivery channel—not domain behavior.

### Session enforcement

The Backend must know the requesting staff client type and validate it against the tenant mode:

```text
WEB client     allowed by WEB or BOTH
DESKTOP client allowed by DESKTOP or BOTH
Customer Web   validated by public feature/context rules, not staff client mode
Platform       validated as a separate Platform scope
```

The exact mechanism for identifying a trusted Desktop build—such as an OAuth client, signed application identity, or another secure client registration—is a Backend/security design decision. A freely editable request header is not sufficient authorization.

### API contract impact

This architecture does not require a second Backend or duplicate resource endpoints. It extends the existing tenant and authentication contracts:

- Tenant create and update carry `adminClientMode`.
- Tenant details expose `adminClientMode` to authorized Platform and Cafe administration clients.
- Cafe staff login identifies whether the session is requested by the Web or Desktop client.
- The Backend compares the trusted requesting client type with the tenant mode before issuing a staff session.
- Public Customer Menu requests do not use the staff `adminClientMode` check.

The frozen endpoint count can remain unchanged because these fields belong to existing Tenant and authentication endpoints.

## 3. Product users

### Platform operator

Manages the complete Penta-K product:

- Creates and updates cafe tenants
- Provisions the cafe owner
- Activates, suspends, archives, or restores tenants
- Manages subscription plans
- Assigns and extends subscriptions
- Configures feature overrides
- Configures branch-limit overrides
- Assigns the Cafe staff-client mode: `WEB`, `DESKTOP`, or `BOTH`
- Manages tenant branding
- Reviews Platform activity

### Cafe owner

Has full access inside one tenant and manages branches, employees, menus, settings, finance, and operations.

### Cafe manager

Runs daily operations according to assigned permissions and accessible branches.

### Cashier

Uses POS, creates orders, handles allowed payments, opens or closes shifts, and views cash-register data.

### Waiter

Creates or follows table orders and handles customer service requests.

### Kitchen employee

Views authorized kitchen orders and moves them through preparation states.

### Inventory employee

Manages stock, stock counts, waste, suppliers, and purchasing according to permissions.

### Customer

Browses the public menu, configures products, places supported order types, tracks an order, and requests table service.

## 4. Product surfaces

The product has four connected experiences.

### Public customer experience

- Cafe-branded menu
- Category and product browsing
- Modifier selection
- Offers
- Cart
- Table QR ordering
- Takeaway ordering
- Delivery ordering
- Customer and delivery information
- Payment-option selection
- Order confirmation and tracking
- Waiter and bill requests

### Cafe administration

- Dashboard
- POS
- Orders
- Products, categories, menus, and modifiers
- Branches, tables, and QR
- Inventory and purchasing
- Customers and loyalty
- Finance and shifts
- Employees and roles
- Reports, notifications, audit, and settings

### Kitchen operations

- Branch-scoped preparation queue
- Shared order status updates
- No duplicate Kitchen Order entity

### Penta-K Platform

- Tenant management
- Plans and subscriptions
- Features and branch limits
- Branding
- Platform dashboard and audit

## 5. Tenant and white-label management

Every tenant represents one cafe brand or workspace.

A tenant contains:

- Name, slug, legal name, and status
- Owner and public contact information
- Subscription plan and status
- Subscription dates and type
- Staff-client access mode: `WEB`, `DESKTOP`, or `BOTH`
- Feature overrides
- Maximum-branch override
- Currency, timezone, locale, and tax settings
- Complete branding configuration

Supported tenant statuses:

```text
ACTIVE
TRIAL
SUSPENDED
ARCHIVED
```

Suspended or archived tenants must not expose active customer ordering or operational access.

### Branding

Tenant branding can control:

- Main, light, and dark logos
- Favicon
- Primary, secondary, accent, background, surface, sidebar, text, muted, and border colors
- Border radius and font family
- Login background, title, subtitle, and card style
- Public-menu heading and category accent
- Receipt header, footer, address, phone, tax number, and QR visibility
- QR title, helper text, and foreground color

Penta-K attribution is fixed product attribution:

https://penta-k.com/en

There is no tenant control for hiding, replacing, editing, or removing it.

## 6. Plans, subscriptions, and feature access

Plans define:

- Code
- Name and description
- Monthly price when configured
- Active status
- Maximum branches
- Included features

Tenant feature overrides can enable or disable individual capabilities without creating another source of truth. Effective access is calculated from the selected plan plus explicit overrides.

Supported feature keys:

```text
onlineMenu
pos
orders
tables
qrOrdering
kitchen
takeaway
delivery
inventory
recipes
suppliers
purchases
expenses
loyalty
employees
reports
advancedReports
```

Feature checks must be enforced by the Backend as well as the interface.

Important distinction:

- Internal Menu and MenuItem management is required for POS and is not exclusively gated by `onlineMenu`.
- `onlineMenu` controls non-QR customer-facing online-menu functionality.
- QR customer flows are controlled by `qrOrdering`.

## 7. Branch management

A tenant can have one or more branches, limited by its effective subscription branch limit.

Each branch can contain:

- Name and optional code
- Phone, email, and address
- Active or inactive status
- Assigned internal menu
- Dine-in availability
- Takeaway availability
- Delivery availability
- Preparation time
- Opening hours

Branch-scoped resources must always validate both:

1. The branch belongs to the authenticated tenant.
2. The employee is allowed to access the branch.

## 8. Product catalog and pricing

### Products

Products are tenant-level descriptive catalog records containing:

- Name and description
- Image
- Category
- Availability
- Assigned modifier groups
- Optional default/helper price

### Categories

Categories control product organization, image, display order, and active status.

### Internal menus

A tenant can create multiple internal menus and assign one menu to each branch.

A MenuItem connects a Product to a Menu and defines:

- `productId`
- `price`
- `available`
- `sortOrder`

### Price source of truth

`MenuItem.price` is the authoritative base selling price.

This rule exists because the same product can have different prices in different branch menus.

The Backend must never trust:

- A price submitted by the customer
- A price submitted by POS
- The product helper/default price as the final price
- A client-calculated total

Quote and checkout must load the branch, its assigned menu, and the matching MenuItem server-side.

### Modifiers

A modifier group defines:

- Name
- Whether selection is required
- Minimum and maximum selections
- Assigned products
- Active status and display order
- Options with name, price adjustment, availability, and display order

The Backend validates selection limits and recalculates modifier adjustments.

### Recipes

Recipes connect products to inventory ingredients. Each ingredient defines an inventory item, quantity, and compatible unit.

Recipes are used for:

- Estimated product cost
- Stock validation
- Inventory consumption during checkout
- Eligible inventory restoration during early cancellation

## 9. Public menu and customer context

The public menu returns a customer-safe bundle containing:

- Public tenant branding and contact information
- Public branch information
- Customer-menu settings
- Categories
- MenuItems and authoritative prices
- Products
- Modifier groups and options
- Active offers

### Non-QR context

The bundled public-menu request resolves the public tenant and branch context.

### QR context

An opaque QR token resolves only:

- Tenant public context
- Branch public context
- Table public context

QR responses must not expose employee data, permissions, inventory, cost information, audit data, or internal administration fields.

## 10. Customer order types and feature rules

Supported order types:

```text
TABLE
TAKEAWAY
DELIVERY
```

Supported order sources:

```text
POS
QR_MENU
ONLINE_MENU
MANUAL
```

Required server-side feature combinations:

| Source and type | Required features |
|---|---|
| `QR_MENU + TABLE` | `qrOrdering` |
| `ONLINE_MENU + TAKEAWAY` | `onlineMenu + takeaway` |
| `ONLINE_MENU + DELIVERY` | `onlineMenu + delivery` |
| POS checkout | `pos` and employee order permission |

The customer submits product choices, quantity, modifiers, order context, customer information, delivery information, coupon, payment option, and notes. The customer does not submit a trusted final total.

## 11. Checkout workflow

POS and public checkout use the same business rules even though they have different authorization contexts.

The Backend checkout operation must execute as one atomic transaction:

1. Resolve tenant and branch context.
2. Confirm the branch is active.
3. Confirm the branch has an assigned Menu.
4. Load each Product and matching MenuItem.
5. Use `MenuItem.price`.
6. Validate product and MenuItem availability.
7. Validate modifiers and calculate adjustments.
8. Validate table, takeaway, or delivery context.
9. Validate the delivery zone and fee when applicable.
10. Validate offers and coupon rules.
11. Calculate subtotal, discount, tax, service charge, delivery fee, and total.
12. Validate payment method and mixed allocations.
13. Validate recipe inventory.
14. Create the Order and immutable item snapshots.
15. Consume inventory and create stock movements.
16. Create Payment and cash effects when payment is not deferred.
17. Consume coupon usage.
18. Earn loyalty points when applicable.
19. Create audit and notification records.

Checkout is idempotent. Repeating the same request with the same idempotency key must not create another order or payment.

## 12. Order lifecycle

Operational Order status is separate from Payment status.

### Operational Order statuses

```text
NEW
ACCEPTED
PREPARING
READY
COMPLETED
CANCELLED
```

Typical lifecycle:

```text
NEW → ACCEPTED → PREPARING → READY → COMPLETED
```

Cancellation is a controlled action and requires a reason.

### Cancellation and inventory

- Cancelling from `NEW` or `ACCEPTED` can restore recipe inventory that checkout consumed.
- Later preparation states do not automatically restore inventory because ingredients may already be used.
- Cancellation writes timeline, audit, and inventory movement records in the same transaction.

Refund status must never be inserted into the operational order-state machine.

## 13. Kitchen workflow

Kitchen uses the shared Orders domain.

Kitchen employees:

- View branch-authorized orders in preparation-related statuses
- Accept new orders
- Move orders to preparing
- Mark orders ready
- Follow the shared order timeline

There is no separate Kitchen Order resource. Duplicating it would create synchronization conflicts with POS, customer tracking, payments, and reports.

## 14. Tables, QR, and waiter requests

### Tables

Tables are branch-scoped and contain a table number, active state, and QR association.

### QR tokens

QR tokens must be:

- Opaque
- Non-sequential
- Tenant, branch, and table-bound
- Rotatable
- Revocable
- Stored securely by the Backend

### Waiter requests

Supported request types:

```text
WAITER
BILL
TISSUES
HELP
OTHER
```

Lifecycle:

```text
NEW → ACCEPTED → COMPLETED
```

Public requests require validated QR table context. Staff actions require branch access and waiter-request permissions.

## 15. Payments and refunds

Supported payment methods:

```text
CASH
CARD
WALLET
ONLINE
MIXED
```

Payment status:

```text
PENDING
PAID
FAILED
PARTIALLY_REFUNDED
REFUNDED
```

Mixed payment contains separate allocations for cash, card, wallet, or online amounts. Allocation totals must equal the order total.

Refunds can be full or partial and must validate the remaining refundable amount.

A refund transaction updates:

- Refund record
- Payment status
- Order payment status
- Cash movement for the refundable cash portion
- Notification
- Audit record

Payment gateway integration remains provider-neutral. Provider-specific fields are decided when a payment provider is selected.

## 16. Cash register and shifts

Cash transaction types:

```text
OPENING_BALANCE
CASH_SALE
CASH_IN
CASH_OUT
EXPENSE
REFUND
SHIFT_ADJUSTMENT
```

An employee can have only one open shift in the applicable branch context.

Shift closing calculates:

- Opening cash
- Cash sales
- Cash in
- Cash out
- Expenses
- Refunds
- Adjustments
- Expected cash
- Actual cash
- Difference

The expected amount is calculated by the Backend, not accepted from the client.

## 17. Expenses

Expenses are branch-scoped and contain:

- Category
- Amount
- Date
- Notes
- Employee
- Payment method
- Optional attachment metadata

Creating, updating, or deleting a cash expense must update its associated cash-register effect atomically.

Binary expense attachment handling remains a product/integration decision.

## 18. Inventory and recipes

Inventory items contain:

- Name and optional SKU
- Unit
- Current quantity
- Minimum stock
- Average unit cost
- Active status

Supported movement types:

```text
PURCHASE
SALE
WASTE
ADJUSTMENT
RETURN
ORDER_CANCELLATION_RESTORE
```

### Stock counts

A stock count starts as `DRAFT` and becomes `CONFIRMED`. Confirmation updates item quantities and creates adjustment movements atomically. A confirmed count cannot be confirmed again.

### Waste

Waste records contain the inventory item, quantity, unit, reason, notes, and estimated cost. Recording waste decrements inventory and creates a movement and audit record in one transaction.

### Low-stock notifications

Inventory consumption can create low-stock or out-of-stock notifications when the resulting quantity reaches configured thresholds.

## 19. Suppliers and purchases

Suppliers are tenant-level records containing contact, company, address, notes, and active state.

Purchases are branch-scoped and contain:

- Invoice number
- Supplier
- Date
- Inventory items
- Quantity and unit cost
- Subtotal, discount, tax, total, paid, and remaining amounts
- Purchase status

Purchase statuses:

```text
DRAFT
ORDERED
RECEIVED
CANCELLED
```

Receiving a purchase is idempotent and atomic. It:

- Prevents repeated receipt
- Updates inventory quantities
- Recalculates weighted average costs
- Creates purchase stock movements
- Marks the purchase received
- Writes an audit record

## 20. Customers and addresses

Customer records contain:

- Name
- Phone and email
- Primary address
- Saved addresses
- Active state

Addresses contain a label, address, notes, phone, and default state. Changing the default address must leave only one default address.

Basic customer analytics are part of Customer Details and require `customers.view`, not the Reports feature:

- Order count
- Total spend
- Average order value
- Last order/visit
- Customer order history

## 21. Loyalty

Loyalty settings define:

- Whether loyalty is enabled
- Spend required per point
- Point redemption value
- Minimum redeemable points
- Optional maximum redemption amount
- Optional expiry period

Transaction types:

```text
EARN
REDEEM
ADJUSTMENT
EXPIRED
```

Balances cannot become negative. Automatic earning must occur only once for the same order.

## 22. Coupons and offers

### Coupons

Coupons support percentage and fixed discounts.

Rules can include:

- Active state
- Start and end dates
- Minimum order
- Maximum discount
- Eligible products
- Eligible categories
- Global usage limit
- Per-customer usage limit

Coupon validation can provide an early cart response, but checkout must repeat validation transactionally before consuming usage.

### Offers

Offers contain:

- Title and description
- Image
- Original price
- Offer price
- Active state
- Display order

Only public-safe active offers are returned to customers.

## 23. Delivery zones

Delivery zones are branch-scoped and define:

- Name
- Delivery fee
- Optional minimum order
- Optional estimated delivery minutes
- Active state

Delivery checkout validates customer name, phone, address, delivery zone, minimum order, feature access, and branch delivery settings.

## 24. Employees, roles, and permissions

An employee contains:

- Name and phone
- Optional email and username
- Role
- Status
- Join date
- Branch access mode
- Selected branch IDs when applicable

Employee statuses:

```text
ACTIVE
SUSPENDED
```

Branch access modes:

```text
ALL
SELECTED
```

A role contains a name, description, system-role flag, and `PermissionKey[]`.

Important rules:

- The owner role has immutable full access.
- System roles cannot be deleted.
- A role assigned to employees cannot be deleted.
- Suspended employees cannot authenticate.
- Permissions and branch access are enforced separately.
- Route visibility is not a Backend authorization mechanism.

The exact permission catalog is documented in [Cafe Access Control](docs/cafe-access-control.md) and [Backend API Contract](docs/backend-api-contract.md).

## 25. Notifications and audit

Notification types cover:

- New and QR orders
- Waiter and bill requests
- Low and out-of-stock events
- Kitchen delays
- Shift differences
- Failed payments
- Refunds

Employees can mark their own visible notifications as read using `notifications.view`. `notifications.manage` is reserved for genuine administrative actions.

Audit records can include:

- User
- Module and action
- Description
- Entity type and ID
- Tenant and branch context
- Timestamp

Platform activity and Cafe operational activity are separate audit scopes.

## 26. Reports

Dedicated reports require `reports.view` and the `reports` feature.

Implemented report contracts cover:

- Sales
- Estimated profit
- Product performance
- Order breakdown by type and source
- Payment method breakdown
- Inventory summary

Report filters can include date range, accessible branch IDs, order type, order source, and payment method.

Simple CSV export can remain frontend-side while datasets are small. Large asynchronous exports require a future product decision and are not part of the frozen API contract.

## 27. Settings

Cafe settings include:

- Working hours
- Tax rate
- Service charge
- Online-ordering switch
- Takeaway and delivery switches
- Enabled payment methods
- Receipt header and footer
- Kitchen sound

Customer-menu settings include:

- Ordering and menu availability
- Automatic order acceptance
- QR and multiple-table-order behavior
- Waiter and bill requests
- Pay-at-cashier and electronic dine-in payment
- Takeaway, ASAP pickup, and scheduled pickup
- Preparation time
- Delivery minimum and estimate
- Cash, card, wallet, and online payment switches

## 28. End-to-end workflows

### Platform onboarding

```text
Platform operator creates tenant
→ owner credential is provisioned
→ plan and subscription are assigned
→ effective features are calculated
→ branding is configured
→ branch limit is enforced
→ cafe owner can configure branches and operations
```

### Cafe setup

```text
Create branch
→ create products and categories
→ create internal menu
→ add MenuItems with selling prices
→ assign menu to branch
→ configure tables, QR, delivery, and menu settings
→ create employees and branch access
```

### Customer QR order

```text
Customer scans table QR
→ opaque token resolves Tenant + Branch + Table
→ bundled public menu loads
→ customer configures cart
→ Backend validates qrOrdering and table context
→ atomic checkout creates order
→ kitchen and staff receive realtime event
→ customer tracks status
```

### POS order

```text
Employee opens branch and shift
→ selects products and modifiers
→ quote uses MenuItem.price
→ payment is confirmed
→ atomic checkout creates order/payment/stock/cash effects
→ kitchen receives order
→ order moves through preparation lifecycle
```

### Purchase receipt

```text
Employee creates purchase
→ purchase remains ordered
→ authorized employee receives it once
→ quantities and average costs update
→ movements and audit are recorded
```

### Refund

```text
Authorized employee opens payment
→ Backend calculates remaining refundable amount
→ full or partial refund is created
→ payment and order payment statuses update
→ cash effect, notification, and audit are recorded
```

## 29. Realtime behavior

Realtime delivery is expected for:

- New orders
- Order status changes and cancellation
- Payment status changes
- Refunds
- Inventory changes and stock alerts
- Purchase receipt and stock-count confirmation
- Waiter requests
- Notifications
- Shift open and close events

Channels are scoped by Platform, tenant, branch, employee, or public order token. Events carry minimal summaries; clients retrieve sensitive details through authorized HTTP endpoints.

## 30. Backend responsibilities

The Backend owns:

- Authentication and secure refresh sessions
- Tenant isolation
- Permission and feature enforcement
- Employee branch authorization
- Authoritative pricing and totals
- Order and payment state machines
- Inventory validation and mutation
- Transactions and locks
- Idempotency
- Optimistic concurrency
- Subscription and branch-limit enforcement
- Audit creation
- Notification targeting
- Payment webhook verification
- Public-safe response projection
- Asset validation and storage

The complete implementation contract contains 200 HTTP endpoints, 212 reusable DTOs, and 28 enum definitions:

[Backend API Contract](docs/backend-api-contract.md)

## 31. Frontend responsibilities

The Frontend owns:

- User interaction and navigation
- Forms and immediate usability validation
- Responsive RTL presentation
- Tenant branding and theme rendering
- Dialog and local interface state
- Local formatting of dates, currency, and labels
- QR visual rendering from a Backend-issued token
- Receipt rendering from Backend data
- Small synchronous CSV exports where appropriate

The Frontend must not be treated as the security or pricing authority.

## 32. Mobile application expectations

A future mobile client should consume the same API and business rules rather than reproducing browser storage behavior.

Mobile teams should use:

- Public menu and QR contracts for customer applications
- Cafe session, permission, feature, and branch context for staff applications
- Shared Order, Payment, Notification, and Waiter Request DTOs
- Realtime channels for operational updates
- Idempotency keys for checkout and financial actions

## 33. QA coverage

QA should validate at least the following cross-module scenarios:

### Isolation and access

- No cross-tenant data access
- Branch access restricted to assigned branches
- Permission denial even when a route is opened manually
- Feature denial even when a request is sent directly
- Suspended tenant and employee behavior

### Menu and pricing

- Different branch prices for the same Product
- POS works when `onlineMenu` is disabled
- Client price manipulation does not affect checkout
- Product and MenuItem availability
- Modifier minimum and maximum selection rules

### Orders and payments

- Each supported order source/type combination
- Valid and invalid operational status transitions
- Payment status never becomes an Order status
- Mixed-payment total validation
- Duplicate checkout idempotency
- Full and partial refunds

### Inventory and finance

- Recipe consumption
- Early cancellation restoration
- No automatic restoration after preparation begins
- Purchase receipt only once
- Stock-count confirmation only once
- Waste quantity validation
- Shift expected-cash calculation
- Expense and refund cash effects

### Customer and public safety

- Invalid or revoked QR token
- Inactive branch and unavailable menu
- Public responses contain no private tenant or employee fields
- Coupon date, usage, customer, product, and category rules
- Delivery minimum and required customer information

## 34. Non-functional requirements

### Security

- Secure password hashing
- Short-lived access tokens
- Rotating HTTP-only refresh cookies
- CSRF protection where applicable
- Strict request DTO allowlists
- Payment webhook signature verification
- Opaque public tokens
- Asset MIME, size, and ownership validation
- Audit logs without secrets

### Performance

- Public menu returned as one cacheable bundled response
- Tenant/branch/menu version-based cache invalidation
- Paginated operational lists
- Indexed search and date filters
- Minimal realtime payloads
- Optimized tenant-brand images

### Reliability

- Atomic checkout and financial operations
- Idempotent retried operations
- Optimistic concurrency for conflicting admin updates
- UTC persistence with tenant-timezone display
- Fixed-precision money handling

### Localization and accessibility

- Arabic-first RTL support
- English locale support where available
- Tenant currency and timezone
- Keyboard-accessible controls
- Clear loading, empty, error, and permission-denied states

## 35. Current implementation status

### Available now

- Complete routed Frontend prototype
- Seeded Golden Drip and Moon Cafe data
- Tenant-aware browser repositories
- Public customer experience
- Cafe dashboard and operational modules
- Kitchen screen
- Penta-K Platform screens
- Role, permission, feature, and branch-access behavior
- Runnable Electron/React Cafe Desktop foundation with real Dashboard, POS, Orders, Order Details, and Kitchen screens
- Platform-managed `adminClientMode` with centralized Web and Desktop access enforcement
- Complete Backend API contract

### Not production-ready yet

- Most data is persisted in browser `localStorage`
- Platform authentication is temporary and frontend-only
- Production Backend and database are not included
- Payment provider is not connected
- Secure server sessions are not active
- WebSocket delivery is specified but not implemented
- Desktop currently uses an explicit development auth/data adapter until the production Backend is implemented
- Browser storage does not provide server-enforced isolation, durable transactions, or cross-device synchronization

The frontend prototype demonstrates workflows. The Backend API contract is the production handoff.

## 36. Team handoff guide

| Team | Primary reference | Main responsibility |
|---|---|---|
| Product | This README | Scope, workflows, rules, unresolved decisions |
| Backend | [Backend API Contract](docs/backend-api-contract.md) | APIs, DTOs, security, transactions, events |
| Frontend | This README + contract | Interface integration and state migration |
| Desktop | [`desktop/`](desktop/) + Backend contract | Electron client using the shared API and rules |
| Mobile | Backend contract | Shared customer/staff clients |
| QA | This README + contract error codes | Functional and cross-module validation |
| Design | Product surfaces and roles | Responsive, RTL, white-label experiences |
| DevOps | Backend security and non-functional requirements | Environments, deployment, observability |
| Support/Operations | Roles, workflows, status rules | Tenant and cafe operational support |

## 37. Product decisions still required

Only these bounded decisions remain:

- Password recovery delivery provider and token lifetime
- Concrete card, wallet, and online payment providers
- Provider-specific payment confirmation and webhook fields
- Expense binary attachment workflow
- Whether supplier and purchase editing controls remain exposed
- Whether deleting a Recipe is distinct from saving an empty Recipe
- Whether `advancedReports` changes Backend datasets or only presentation
- Trusted Desktop client identification and application registration
- Whether Desktop requires offline operation and conflict synchronization

These decisions do not change the frozen endpoint count or core domain architecture.

## 38. Documentation map

| Document | Purpose |
|---|---|
| [Backend API Contract](docs/backend-api-contract.md) | Complete 200-endpoint implementation contract |
| [Cafe Access Control](docs/cafe-access-control.md) | Roles, permissions, and branch access |
| [Branch Architecture](docs/branch-architecture.md) | Branch ownership and operational scope |
| [Customer Route Contract](docs/customer-route-contract.md) | Existing customer route behavior |
| [Tenant Data Flow](docs/tenant-data-flow.md) | Tenant context and frontend data flow |
| [Multi-Tenancy Migration](docs/multi-tenancy-migration.md) | Migration guidance |
| [Brand Assets](docs/brand-assets.md) | Branding asset behavior |
| [Order Cancellation Contract](docs/order-cancellation-contract.md) | Cancellation and inventory restoration |
| [Shift and Cash Contract](docs/shift-cash-contract.md) | Cash and shift calculations |
| [Frontend Limitations](docs/p1-frontend-limitations.md) | Known implementation limitations |
| [Frontend QA](docs/p2-frontend-qa.md) | Existing Frontend QA notes |

## 39. Local prototype setup

This section is only for teams that need to run the existing Frontend prototype.

### Requirements

- A current Node.js LTS release
- npm

### Start locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open:

```text
Customer menu:     http://localhost:3000/menu
Cafe login:        http://localhost:3000/admin/login
Kitchen:           http://localhost:3000/kitchen/orders
Platform login:    http://localhost:3000/platform/login
Platform dashboard: http://localhost:3000/platform/dashboard
```

Temporary local Platform credentials:

```text
Email:    platform@example.com
Password: platform123
```

These credentials must never be deployed as production authentication.

### Validation

```bash
npm run type-check
npm run build
```

### Cafe Desktop

```bash
cd desktop
npm install
npm run electron:dev
```

Development login:

```text
Tenant:   golden-drip
Login:    owner@golden.demo
Password: desktop123
```

The password is development-only and can be replaced with `VITE_DESKTOP_DEV_PASSWORD`. Validate Desktop independently with:

```bash
npm run typecheck
npm run lint
npm run build
npm run electron:smoke
npm run electron:dev-test
```

## 40. Final source-of-truth statement

- This README is the shared product and project overview.
- [docs/backend-api-contract.md](docs/backend-api-contract.md) is the implementation source of truth for Backend endpoints, DTOs, enums, permissions, features, transactions, idempotency, events, statuses, and errors.
- Frontend TypeScript models describe the existing prototype but do not override the frozen Backend contract.
- Penta-K attribution remains fixed and non-configurable.
