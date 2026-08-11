# Dual-Client Cafe Architecture

## Decision

Every Cafe tenant has one required `adminClientMode`:

| `adminClientMode` | Cafe Web | Cafe Desktop | Customer Menu |
|---|---:|---:|---:|
| `WEB` | Allowed | Denied | Web, controlled by public features |
| `DESKTOP` | Denied | Allowed | Web, controlled by public features |
| `BOTH` | Allowed | Allowed | Web, controlled by public features |

The field name is canonical. `clientAccessMode` must not be introduced as an alias.

## Runtime topology

```text
Platform Owner
    → configures Tenant.adminClientMode

Cafe Web ───────┐
Cafe Desktop ───┼──→ One Backend → Tenant → Branch → Operational Data
Customer Menu ──┘

Employee → Role → Permission → Branch Access
Product → Menu → MenuItem.price
```

Platform authentication is a separate scope. Customer Menu remains a Web client and is never blocked by `adminClientMode`; its public access is governed by QR/public context and the relevant Features.

## Authentication contract

Cafe staff login submits:

```ts
type CafeLoginRequest = {
  tenantCode: string;
  login: string;
  password: string;
  clientType: "WEB" | "DESKTOP";
};
```

The Backend validates the trusted client identity against `adminClientMode` before issuing a session. Disallowed clients receive `CLIENT_TYPE_NOT_ALLOWED`. Refresh and session restoration repeat the check so a Platform mode change revokes incompatible existing sessions.

The request field expresses contract intent but is not sufficient proof by itself. Production must bind Desktop identity to an application registration or equivalent trusted mechanism; arbitrary headers are not authorization.

## Web implementation

- Platform tenant create/edit requires an Arabic `adminClientMode` selector.
- Tenant details display a shared Arabic mode label.
- Cafe Web login sends `clientType: "WEB"`.
- A centralized Web guard denies `DESKTOP` tenants before protected administration is rendered.
- Existing persisted development tenants missing the field migrate to `WEB`; real Backend responses are never silently defaulted.
- Platform pages and all Customer Menu routes remain unaffected.

## Desktop implementation

The [`desktop/`](../desktop/) project is an independent Electron + React client. Electron runs with `contextIsolation: true`, `nodeIntegration: false`, and a narrow preload bridge.

The authenticated session stores the Backend-shaped context:

- user
- employee
- tenant
- role
- permissions
- accessibleBranches
- currentBranch
- features
- clientType

Authorization uses permission keys, Feature keys, and branch access—not role names. Navigation metadata, direct-route protection, component-level `PermissionGate`, branch switching, and the first accessible route all use the same access helpers.

Real operational foundations are implemented for Dashboard, POS, Orders, Order Details, and Kitchen. Remaining modules have routed, permission-aware placeholders ready for Backend integration. POS uses `MenuItem.price` (`menuItemPrice` in the development projection) as the selling-price source.

## Development adapter boundary

Until the production Backend exists, Desktop uses `desktop/src/dev/auth-adapter.ts` and explicit development data. This adapter mirrors the frozen request/session contracts and enforces `CLIENT_TYPE_NOT_ALLOWED`; it is not a second business Backend and contains no production credentials.

Golden Drip is seeded as `BOTH`. Moon Cafe is seeded as `WEB` and is denied by Desktop. The adapter must be replaced by RTK Query endpoints against the shared `/api/v1` Backend without changing domain behavior.

## Endpoint impact

No endpoint is added or duplicated. Existing Tenant create/update/detail DTOs gain `adminClientMode`; existing Cafe login/session DTOs gain `clientType`. The Master API Contract remains exactly **200 endpoints**.

## Explicit non-goals

- No Desktop-only Menu, Order, Payment, Kitchen, or Inventory resource.
- No local authoritative business database.
- No offline synchronization assumption.
- No Customer Menu desktop conversion.
- No role-name-based authorization.
