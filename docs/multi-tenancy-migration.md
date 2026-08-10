# Multi-tenant migration notes

## Current state

The application currently has a Next.js frontend with demo Zustand stores and no API, database, ORM, or server session. The tenant resolver and Platform Admin screens are therefore development scaffolding, not a security boundary.

Golden Drip is represented as `tenant-golden-drip`, the first migration/seed tenant. Shared UI reads its identity and branding from `TenantProvider`; it must not read a hardcoded cafe name or color.

## Required backend contract before production

- Resolve `tenantId` from the authenticated session, verified hostname, or a server-side mapping. Never accept a tenant ID as authorization from the browser.
- Add `Tenant`, `TenantBranding`, `TenantSettings`, `Subscription`, `UserTenantMembership`, and `AuditLog` tables.
- Add `tenant_id` to every tenant-owned table and enforce it in repository queries and database policies.
- Scope every list, read, create, update, delete, report, export, receipt, QR, inventory, and order operation on the server.
- Keep `PLATFORM_SUPER_ADMIN` routes and permissions separate from tenant-admin routes.
- Replace demo login/localStorage with secure httpOnly sessions, CSRF protection where applicable, rate limits, audit logging, and password reset/MFA flows.

## Hostname migration

`NEXT_PUBLIC_ROOT_DOMAIN` enables the demo resolver to recognize `{tenantSlug}.example.com`. Production should resolve this mapping on the server and reject unknown, suspended, or archived tenants before rendering or serving API data.

## Verification plan

Create integration tests after the API exists for cross-tenant reads/writes, suspended tenants, platform-vs-tenant permissions, hostname mapping, subscription feature flags, and exports/receipts. The current repository has no test runner, so these tests cannot honestly be claimed as passing yet.
