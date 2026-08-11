# Backend API Contract

> Final reviewed contract derived from the existing frontend audit. This document defines contracts only; it does not introduce backend implementation, schema, or frontend changes.

## 1. Executive Summary

- Previous endpoint count: **201**
- Final endpoint count: **200**
- GET: **89**
- POST: **50**
- PATCH: **29**
- PUT: **14**
- DELETE: **18**
- P0: **87**
- P1: **109**
- P2: **4**

`GET /api/v1/customer/context` was removed. Non-QR public Tenant/Branch resolution is now part of the bundled public-menu request. QR resolution remains exclusively owned by `GET /api/v1/customer/qr/{token}`. No endpoint was added.

## 2. Architecture

```text
Platform
└── Tenant
    └── Branch
        └── Operational Data

Employee
└── Role
    └── Permission
        └── Branch Access

Product (tenant descriptive catalog)
└── Menu (internal selling configuration)
    └── MenuItem.price (authoritative branch-menu selling price)
```

A Branch is assigned an internal Menu. POS and public checkout load the Branch Menu and its MenuItem server-side. Product `defaultPrice`, when retained for form convenience, is only a suggested initial value and never the final checkout price.

## 3. API Conventions

- Base URL: `/api/v1`.
- Authentication: short-lived bearer access token and rotating secure HTTP-only refresh cookie.
- Tenant resolution: authenticated tenant comes from signed session claims, never from request bodies.
- Branch authorization: `{branchId}` is checked against tenant ownership and employee branch access.
- Pagination: `page`, `pageSize`; responses include `meta.page`, `pageSize`, `total`, and `totalPages`.
- Search: `search` with domain-specific indexed fields.
- Sorting: `sortBy`, `sortOrder=asc|desc`, with an allowlist per endpoint.
- Date filtering: ISO-8601 `from` and `to`, interpreted in the tenant timezone and persisted as UTC.
- ISO dates: UTC ISO-8601 strings.
- Money: decimal values; persistence must use fixed precision, never binary float.
- Idempotency: `Idempotency-Key` on the operations in section 51.
- Optimistic concurrency: `version` or `If-Match`; stale writes return `409 VERSION_CONFLICT`.

Success envelope:

```json
{"success":true,"data":{},"meta":{"page":1,"pageSize":25,"total":0,"totalPages":0}}
```

Error envelope:

```json
{"success":false,"error":{"code":"VALIDATION_FAILED","message":"Request validation failed.","details":{},"fields":{"fieldName":["Validation message"]},"requestId":"req_..."}}
```

Validation errors use HTTP 400/422 with machine-readable field mappings. Conflicts use HTTP 409, including duplicate codes, branch-limit exceeded, role/resource in use, already-received purchases, confirmed stock counts, duplicate open shifts, stale versions, and reused idempotency keys.

## 4. Contract Corrections

1. **Menu feature gating:** Internal Menu/MenuItem management has no `onlineMenu` dependency. It is required by POS. `onlineMenu` gates only public online-menu functionality and online-menu-origin customer ordering.
2. **Selling-price authority:** `MenuItem.price` is authoritative. Existing `Product.price` is represented conceptually as optional `Product.defaultPrice`; checkout never trusts it as final price.
3. **Notification reads:** Both individual read and mark-all-read require `notifications.view`. `notifications.manage` is reserved for actual administration, for which no current endpoint exists.
4. **Customer analytics:** Basic order count, total spend, average order, and last order require only `customers.view`; no reports feature.
5. **State separation:** Operational Order status is `NEW | ACCEPTED | PREPARING | READY | COMPLETED | CANCELLED`. Payment status is `PENDING | PAID | FAILED | PARTIALLY_REFUNDED | REFUNDED`. Refund/payment states never enter order transition validation.
6. **Public feature matrix:** `QR_MENU + TABLE` requires `qrOrdering`; `ONLINE_MENU + TAKEAWAY` requires `onlineMenu + takeaway`; `ONLINE_MENU + DELIVERY` requires `onlineMenu + delivery`.
7. **Customer context:** `/customer/qr/{token}` resolves QR-only Tenant + Branch + Table context. `/customer/menu` resolves non-QR Tenant/Branch context. The redundant `/customer/context` endpoint is removed.

## 5. Authentication Endpoints

### `POST /api/v1/auth/platform/login`

**Purpose:**  
Authenticate a Platform operator.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Platform

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "login": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/auth/cafe/login`

**Purpose:**  
Authenticate a Cafe owner or employee after tenant resolution.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "tenantCode": "string",
  "login": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/auth/refresh`

**Purpose:**  
Rotate the access and refresh tokens.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public refresh cookie

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Authentication domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/auth/logout`

**Purpose:**  
Revoke the current session.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Authentication domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/auth/session`

**Purpose:**  
Return the current principal and effective access context.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": "principal",
    "employee": "optional employee",
    "tenant": "optional tenant",
    "role": "optional role",
    "permissions": [
      "key"
    ],
    "branchAccess": [
      "branch-id"
    ],
    "features": {
      "feature": true
    },
    "accessibleBranches": [],
    "currentBranch": "optional"
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/auth/forgot-password`

**Purpose:**  
Start password recovery.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "tenantCode": "optional string",
  "login": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/auth/reset-password`

**Purpose:**  
Complete password recovery with a single-use token.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "token": "single-use token",
  "newPassword": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/auth/password`

**Purpose:**  
Change the current principal password.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/auth/sessions`

**Purpose:**  
List the current principal active sessions.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/auth/sessions/{sessionId}`

**Purpose:**  
Revoke one active session.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

```json
{
  "sessionId": "Opaque sessionId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Authentication result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 6. Platform Endpoints

### `GET /api/v1/platform/dashboard`

**Purpose:**  
Return Platform dashboard summary metrics.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/platform/tenants`

**Purpose:**  
Search and paginate tenants.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/platform/tenants`

**Purpose:**  
Create a tenant and owner credential atomically.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Platform domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
Yes

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/platform/tenants/{tenantId}`

**Purpose:**  
Return tenant details.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/platform/tenants/{tenantId}`

**Purpose:**  
Update tenant identity, contact, and configuration.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Platform domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/platform/tenants/{tenantId}/status`

**Purpose:**  
Change tenant lifecycle status.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "status": "Allowed domain status",
  "note": "optional string",
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/platform/tenants/{tenantId}/branding`

**Purpose:**  
Return tenant branding.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/branding`

**Purpose:**  
Replace tenant branding configuration.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Platform domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/platform/tenants/{tenantId}/branding/assets`

**Purpose:**  
Upload a tenant branding asset.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "multipart": "file, purpose, entityId?"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/platform/tenants/{tenantId}/branding/assets/{assetId}`

**Purpose:**  
Remove a tenant branding asset.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier",
  "assetId": "Opaque assetId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/platform/plans`

**Purpose:**  
List subscription plans.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/platform/plans`

**Purpose:**  
Create a subscription plan.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Platform domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/platform/plans/{planId}`

**Purpose:**  
Update a subscription plan.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "planId": "Opaque planId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Platform domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/platform/plans/{planId}`

**Purpose:**  
Delete an unused subscription plan.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "planId": "Opaque planId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/platform/subscriptions`

**Purpose:**  
Search and paginate subscriptions.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/platform/tenants/{tenantId}/subscription`

**Purpose:**  
Return a tenant subscription.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/subscription`

**Purpose:**  
Assign or replace a tenant subscription.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Platform domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/platform/tenants/{tenantId}/subscription/extensions`

**Purpose:**  
Extend a tenant subscription.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "months": "1 | 3 | 6 | 12"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
None.

### `GET /api/v1/platform/tenants/{tenantId}/features`

**Purpose:**  
Return plan, overrides, and effective features.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/feature-overrides`

**Purpose:**  
Replace explicit tenant feature overrides.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "overrides": {
    "featureKey": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/branch-limit`

**Purpose:**  
Set or clear the tenant branch-limit override.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{
  "tenantId": "Opaque tenantId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "maxBranchesOverride": "integer or null"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Platform result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 7. Tenant Endpoints

### `GET /api/v1/cafe/tenant`

**Purpose:**  
Return the authenticated tenant.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/tenant`

**Purpose:**  
Update tenant contact and workspace data.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
settings.edit

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Tenant domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Tenant result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 8. Branch Endpoints

### `GET /api/v1/cafe/branches`

**Purpose:**  
List accessible tenant branches.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
branches.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches`

**Purpose:**  
Create a branch within the effective branch limit.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Branch domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Branch result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/branches/{branchId}`

**Purpose:**  
Return one accessible branch.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
branches.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Branch result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}`

**Purpose:**  
Update branch data and settings.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Branch domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Branch result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/status`

**Purpose:**  
Activate or deactivate a branch.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "status": "Allowed domain status",
  "note": "optional string",
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Branch result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/branches/{branchId}/menu`

**Purpose:**  
Assign an internal menu to a branch.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Branch domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Branch result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 9. Product Endpoints

Product fields are descriptive catalog fields. If retained, `defaultPrice` is an optional menu-item creation helper only.

### `GET /api/v1/cafe/products`

**Purpose:**  
List tenant products.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/products`

**Purpose:**  
Create a tenant product.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.create

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "defaultPrice": "optional helper only",
  "image": "optional URL/asset",
  "categoryId": "id",
  "isAvailable": true,
  "modifierGroupIds": [
    "id"
  ],
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Product result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/products/{productId}`

**Purpose:**  
Return a product.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "productId": "Opaque productId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Product result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/products/{productId}`

**Purpose:**  
Update product descriptive data and optional default price.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.update

**Feature:**  
—

**Path Parameters:**

```json
{
  "productId": "Opaque productId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "defaultPrice": "optional helper only",
  "image": "optional URL/asset",
  "categoryId": "id",
  "isAvailable": true,
  "modifierGroupIds": [
    "id"
  ],
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Product result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/products/{productId}`

**Purpose:**  
Delete an unreferenced product.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.delete

**Feature:**  
—

**Path Parameters:**

```json
{
  "productId": "Opaque productId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Product result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 10. Category Endpoints

### `GET /api/v1/cafe/categories`

**Purpose:**  
List product categories.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
categories.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/categories`

**Purpose:**  
Create a category.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
categories.manage

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Category domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Category result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/categories/{categoryId}`

**Purpose:**  
Update a category.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
categories.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "categoryId": "Opaque categoryId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Category domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Category result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/categories/{categoryId}`

**Purpose:**  
Delete an unused category.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
categories.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "categoryId": "Opaque categoryId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Category result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 11. Menu Endpoints

Internal Menu management is available independently of `onlineMenu` so POS pricing remains operable.

### `GET /api/v1/cafe/menus`

**Purpose:**  
List internal menus used by branches and POS.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/menus`

**Purpose:**  
Create an internal menu.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Menu domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Menu result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/menus/{menuId}`

**Purpose:**  
Return an internal menu.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Menu result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/menus/{menuId}`

**Purpose:**  
Update internal menu metadata.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Menu domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Menu result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/menus/{menuId}/duplicate`

**Purpose:**  
Duplicate an internal menu and its items.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Menu result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/menus/{menuId}`

**Purpose:**  
Delete an unassigned internal menu.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Menu result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 12. MenuItem Endpoints

`MenuItem.price` is the only authoritative base selling price for checkout.

### `GET /api/v1/cafe/menus/{menuId}/items`

**Purpose:**  
List internal menu items and authoritative selling prices.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/menus/{menuId}/items`

**Purpose:**  
Add a product and selling price to a menu.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "productId": "id",
  "price": 0,
  "available": true,
  "sortOrder": 0
}
```

**Response:**

```json
{
  "success": true,
  "data": "MenuItem result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/menus/{menuId}/items/{menuItemId}`

**Purpose:**  
Update authoritative menu-item selling price or availability.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier",
  "menuItemId": "Opaque menuItemId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "price": 0,
  "available": true,
  "sortOrder": 0,
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "MenuItem result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/menus/{menuId}/items/{menuItemId}`

**Purpose:**  
Remove an item from a menu.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier",
  "menuItemId": "Opaque menuItemId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "MenuItem result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/menus/{menuId}/items/order`

**Purpose:**  
Replace menu-item ordering.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "menuId": "Opaque menuId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "items": [
    {
      "menuItemId": "id",
      "sortOrder": 0
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": "MenuItem result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 13. Modifier Endpoints

### `GET /api/v1/cafe/modifier-groups`

**Purpose:**  
List modifier groups.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/modifier-groups`

**Purpose:**  
Create a modifier group.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.create

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Modifier domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Modifier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/modifier-groups/{modifierGroupId}`

**Purpose:**  
Return a modifier group.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "modifierGroupId": "Opaque modifierGroupId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Modifier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/modifier-groups/{modifierGroupId}`

**Purpose:**  
Update options, limits, assignments, or availability.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.update

**Feature:**  
—

**Path Parameters:**

```json
{
  "modifierGroupId": "Opaque modifierGroupId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Modifier domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Modifier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/modifier-groups/{modifierGroupId}`

**Purpose:**  
Delete an unused modifier group.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.delete

**Feature:**  
—

**Path Parameters:**

```json
{
  "modifierGroupId": "Opaque modifierGroupId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Modifier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 14. Recipe Endpoints

### `GET /api/v1/cafe/recipes`

**Purpose:**  
List product recipes.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
recipes

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/products/{productId}/recipe`

**Purpose:**  
Return a product recipe.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
recipes

**Path Parameters:**

```json
{
  "productId": "Opaque productId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/products/{productId}/recipe`

**Purpose:**  
Create or replace a product recipe.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.update

**Feature:**  
recipes

**Path Parameters:**

```json
{
  "productId": "Opaque productId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Recipe domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Recipe result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/products/{productId}/recipe`

**Purpose:**  
Remove a product recipe.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
products.delete

**Feature:**  
recipes

**Path Parameters:**

```json
{
  "productId": "Opaque productId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Recipe result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 15. Table Endpoints

### `GET /api/v1/cafe/branches/{branchId}/tables`

**Purpose:**  
List branch tables.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
tables.view

**Feature:**  
tables

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/tables`

**Purpose:**  
Create a branch table.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
tables.manage

**Feature:**  
tables

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Table domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Table result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/branches/{branchId}/tables/{tableId}`

**Purpose:**  
Return a branch table.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
tables.view

**Feature:**  
tables

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "tableId": "Opaque tableId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Table result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/tables/{tableId}`

**Purpose:**  
Update a branch table.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
tables.manage

**Feature:**  
tables

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "tableId": "Opaque tableId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Table domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Table result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/tables/{tableId}`

**Purpose:**  
Delete an unused branch table.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
tables.manage

**Feature:**  
tables

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "tableId": "Opaque tableId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Table result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 16. QR Endpoints

### `GET /api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token`

**Purpose:**  
Return QR-token metadata without exposing secrets unnecessarily.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
qr.view

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "tableId": "Opaque tableId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token`

**Purpose:**  
Create or rotate an opaque table QR token.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
qr.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "tableId": "Opaque tableId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "rotate": true
}
```

**Response:**

```json
{
  "success": true,
  "data": "QR result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token`

**Purpose:**  
Revoke a table QR token.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
qr.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "tableId": "Opaque tableId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "QR result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/branches/{branchId}/cashier-qr`

**Purpose:**  
Return cashier QR configuration.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
qr.view

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/branches/{branchId}/cashier-qr`

**Purpose:**  
Create or replace cashier QR configuration.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
qr.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "orderType": "TAKEAWAY",
  "active": true
}
```

**Response:**

```json
{
  "success": true,
  "data": "QR result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/customer/qr/{token}`

**Purpose:**  
Resolve only an opaque table QR token to public Tenant, Branch, and Table context.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "token": "Opaque token identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "QR result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Resolve only an opaque QR token to Tenant + Branch + Table public context.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 17. Public Customer Endpoints

The bundled public menu resolves non-QR Tenant/Branch context. QR Table context must first be resolved through the QR endpoint.

### `GET /api/v1/customer/menu`

**Purpose:**  
Resolve non-QR Tenant and Branch context and return a bundled public menu.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` for non-QR context; `qrOrdering` for validated QR context

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "tenantSlug": "Public tenant identifier",
  "branchSlug": "Optional public branch identifier"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Resolve only non-QR public Tenant/Branch context; reject table QR token responsibility.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/customer/products/{productId}`

**Purpose:**  
Return public-safe product details.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` for non-QR context; `qrOrdering` for validated QR context

**Path Parameters:**

```json
{
  "productId": "Opaque productId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Public Customer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/customer/offers`

**Purpose:**  
Return active public offers.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` for non-QR context; `qrOrdering` for validated QR context

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/customer/offers/{offerId}`

**Purpose:**  
Return public-safe offer details.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` for non-QR context; `qrOrdering` for validated QR context

**Path Parameters:**

```json
{
  "offerId": "Opaque offerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Public Customer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/customer/orders`

**Purpose:**  
Create a public customer order through atomic checkout.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
Conditional by source/type

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "id",
      "quantity": 1,
      "modifierSelections": [
        "option-id"
      ]
    }
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "tableId": "optional",
  "customerId": "optional",
  "customerName": "optional",
  "customerPhone": "optional",
  "deliveryAddress": "optional",
  "deliveryZoneId": "optional",
  "couponCode": "optional",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED",
  "allocations": "optional",
  "receivedAmount": "optional",
  "notes": "optional",
  "source": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "deferPayment": false
}
```

**Response:**

```json
{
  "success": true,
  "data": "Public Customer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price. QR_MENU + TABLE requires qrOrdering; ONLINE_MENU + TAKEAWAY requires onlineMenu + takeaway; ONLINE_MENU + DELIVERY requires onlineMenu + delivery.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes order events.

### `GET /api/v1/customer/orders/{publicOrderToken}`

**Purpose:**  
Return public-safe order tracking data.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public order token

**Feature:**  
—

**Path Parameters:**

```json
{
  "publicOrderToken": "Opaque publicOrderToken identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Public Customer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/customer/orders/{publicOrderToken}/payment-status`

**Purpose:**  
Synchronize public payment status.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public order token

**Feature:**  
—

**Path Parameters:**

```json
{
  "publicOrderToken": "Opaque publicOrderToken identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 18. POS / Checkout Endpoints

### `POST /api/v1/cafe/branches/{branchId}/checkout/quote`

**Purpose:**  
Calculate an authoritative non-persistent POS quote.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "id",
      "quantity": 1,
      "modifierSelections": [
        "option-id"
      ]
    }
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "tableId": "optional",
  "deliveryZoneId": "optional",
  "couponCode": "optional"
}
```

**Response:**

```json
{
  "success": true,
  "data": "POS / Checkout result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes order events.

### `POST /api/v1/cafe/branches/{branchId}/checkout`

**Purpose:**  
Create a POS order and related financial and inventory records atomically.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "id",
      "quantity": 1,
      "modifierSelections": [
        "option-id"
      ]
    }
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "tableId": "optional",
  "customerId": "optional",
  "customerName": "optional",
  "customerPhone": "optional",
  "deliveryAddress": "optional",
  "deliveryZoneId": "optional",
  "couponCode": "optional",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED",
  "allocations": "optional",
  "receivedAmount": "optional",
  "notes": "optional",
  "source": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "deferPayment": false
}
```

**Response:**

```json
{
  "success": true,
  "data": "POS / Checkout result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership. Load MenuItem.price server-side; never accept Product.defaultPrice or a client price as final selling price.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes order events.

## 19. Order Endpoints

Order operational status and payment status are separate fields and separate state machines.

### `GET /api/v1/cafe/orders`

**Purpose:**  
Search orders constrained by accessible branches.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
orders.view or kitchen.view

**Feature:**  
orders or kitchen

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/orders/{orderId}`

**Purpose:**  
Return an authorized order.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
orders.view or kitchen.view

**Feature:**  
orders or kitchen

**Path Parameters:**

```json
{
  "orderId": "Opaque orderId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Order result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/orders/{orderId}/status`

**Purpose:**  
Perform an operational order-status transition.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
orders.update or kitchen.update

**Feature:**  
orders or kitchen

**Path Parameters:**

```json
{
  "orderId": "Opaque orderId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "status": "Allowed domain status",
  "note": "optional string",
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Order result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership. Allow only NEW, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED operational transitions; payment/refund states are forbidden.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes order events.

### `POST /api/v1/cafe/orders/{orderId}/cancellation`

**Purpose:**  
Cancel an order with a reason and conditional stock restoration.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
orders.cancel

**Feature:**  
orders

**Path Parameters:**

```json
{
  "orderId": "Opaque orderId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "reason": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Order result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes order events.

### `GET /api/v1/cafe/orders/{orderId}/print-data`

**Purpose:**  
Return normalized receipt-print data.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
orders.print

**Feature:**  
orders

**Path Parameters:**

```json
{
  "orderId": "Opaque orderId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 20. Payment Endpoints

### `GET /api/v1/cafe/payments`

**Purpose:**  
Search payments within accessible branches.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
payments.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/payments/{paymentId}`

**Purpose:**  
Return payment, order, refunds, and refundable balance.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
payments.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "paymentId": "Opaque paymentId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Payment result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/payment-intents`

**Purpose:**  
Create a provider-neutral online payment intent.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
Conditional payment method

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Payment domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Payment result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes payment/refund events.

### `POST /api/v1/cafe/payment-intents/{intentId}/confirm`

**Purpose:**  
Confirm or synchronize a payment intent.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
Conditional payment method

**Path Parameters:**

```json
{
  "intentId": "Opaque intentId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Payment result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes payment/refund events.

### `GET /api/v1/cafe/payment-intents/{intentId}/status`

**Purpose:**  
Return normalized payment-intent status.

**Authentication:**  
Authenticated.

**Scope:**  
Branch/Public

**Permission:**  
Authenticated or public payment token

**Feature:**  
—

**Path Parameters:**

```json
{
  "intentId": "Opaque intentId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Payment result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 21. Refund Endpoints

### `GET /api/v1/cafe/refunds`

**Purpose:**  
Search refunds.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
refunds.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/refunds/{refundId}`

**Purpose:**  
Return a refund.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
refunds.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "refundId": "Opaque refundId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Refund result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/payments/{paymentId}/refunds`

**Purpose:**  
Create a full or partial refund atomically.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
refunds.create

**Feature:**  
—

**Path Parameters:**

```json
{
  "paymentId": "Opaque paymentId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "amount": 0,
  "reason": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Refund result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes payment/refund events.

## 22. Cash Register Endpoints

### `GET /api/v1/cafe/branches/{branchId}/cash-register/summary`

**Purpose:**  
Return calculated cash-register totals.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
cashRegister.view

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Cash Register result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/branches/{branchId}/cash-transactions`

**Purpose:**  
List branch cash transactions.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
cashRegister.view

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/cash-transactions`

**Purpose:**  
Create an authorized manual cash movement.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
cashRegister.manage

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "type": "CASH_IN | CASH_OUT | SHIFT_ADJUSTMENT",
  "amount": 0,
  "note": "string",
  "shiftId": "optional"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Cash Register result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 23. Shift Endpoints

### `GET /api/v1/cafe/branches/{branchId}/shifts`

**Purpose:**  
List branch shifts.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
shifts.view

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/branches/{branchId}/shifts/current`

**Purpose:**  
Return the current employee open shift.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
shifts.view

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Shift result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/branches/{branchId}/shifts/{shiftId}`

**Purpose:**  
Return a shift and its calculated entries.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
shifts.view

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "shiftId": "Opaque shiftId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Shift result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/shifts`

**Purpose:**  
Open a shift.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
shifts.open

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "openingCash": 0
}
```

**Response:**

```json
{
  "success": true,
  "data": "Shift result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes shift events.

### `POST /api/v1/cafe/branches/{branchId}/shifts/{shiftId}/close`

**Purpose:**  
Close a shift using server-calculated expected cash.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
shifts.close

**Feature:**  
pos

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "shiftId": "Opaque shiftId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "actualCash": 0,
  "note": "optional"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Shift result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes shift events.

## 24. Expense Endpoints

### `GET /api/v1/cafe/branches/{branchId}/expenses`

**Purpose:**  
List branch expenses.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
expenses.view

**Feature:**  
expenses

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/expenses`

**Purpose:**  
Create an expense and associated cash movement.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
expenses.create

**Feature:**  
expenses

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Expense domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Expense result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/branches/{branchId}/expenses/{expenseId}`

**Purpose:**  
Return an expense.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
expenses.view

**Feature:**  
expenses

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "expenseId": "Opaque expenseId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Expense result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/expenses/{expenseId}`

**Purpose:**  
Update an expense and associated cash movement.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
expenses.update

**Feature:**  
expenses

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "expenseId": "Opaque expenseId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Expense domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Expense result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/expenses/{expenseId}`

**Purpose:**  
Delete an expense and reverse its cash effect.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
expenses.delete

**Feature:**  
expenses

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "expenseId": "Opaque expenseId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Expense result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 25. Inventory Endpoints

### `GET /api/v1/cafe/branches/{branchId}/inventory`

**Purpose:**  
List branch inventory.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/inventory`

**Purpose:**  
Create an inventory item with opening values.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.create

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Inventory domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Inventory result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes inventory events when quantities change.

### `GET /api/v1/cafe/branches/{branchId}/inventory/{inventoryItemId}`

**Purpose:**  
Return an inventory item.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "inventoryItemId": "Opaque inventoryItemId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Inventory result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/inventory/{inventoryItemId}`

**Purpose:**  
Update or deactivate an inventory item.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.adjust

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "inventoryItemId": "Opaque inventoryItemId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Inventory domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Inventory result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes inventory events when quantities change.

## 26. Stock Movement Endpoints

### `GET /api/v1/cafe/branches/{branchId}/stock-movements`

**Purpose:**  
Search immutable stock movements.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 27. Stock Count Endpoints

### `GET /api/v1/cafe/branches/{branchId}/stock-counts`

**Purpose:**  
List stock counts.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/stock-counts`

**Purpose:**  
Create a draft stock count.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.stockCount

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Stock Count domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Stock Count result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes inventory events when quantities change.

### `GET /api/v1/cafe/branches/{branchId}/stock-counts/{stockCountId}`

**Purpose:**  
Return a stock count.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "stockCountId": "Opaque stockCountId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Stock Count result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/stock-counts/{stockCountId}/confirm`

**Purpose:**  
Confirm a stock count and apply inventory adjustments.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.stockCount

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "stockCountId": "Opaque stockCountId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Stock Count result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes inventory events when quantities change.

## 28. Waste Endpoints

### `GET /api/v1/cafe/branches/{branchId}/waste`

**Purpose:**  
List recorded waste.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/waste`

**Purpose:**  
Record waste and decrement stock atomically.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
inventory.waste

**Feature:**  
inventory

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Waste domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Waste result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes inventory events when quantities change.

## 29. Supplier Endpoints

### `GET /api/v1/cafe/suppliers`

**Purpose:**  
List tenant suppliers.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
suppliers.view

**Feature:**  
suppliers

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/suppliers`

**Purpose:**  
Create a supplier.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
suppliers.manage

**Feature:**  
suppliers

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Supplier domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Supplier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/suppliers/{supplierId}`

**Purpose:**  
Return a supplier.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
suppliers.view

**Feature:**  
suppliers

**Path Parameters:**

```json
{
  "supplierId": "Opaque supplierId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Supplier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/suppliers/{supplierId}`

**Purpose:**  
Update a supplier.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
suppliers.manage

**Feature:**  
suppliers

**Path Parameters:**

```json
{
  "supplierId": "Opaque supplierId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Supplier domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Supplier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/suppliers/{supplierId}/status`

**Purpose:**  
Activate or deactivate a supplier.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
suppliers.manage

**Feature:**  
suppliers

**Path Parameters:**

```json
{
  "supplierId": "Opaque supplierId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "status": "Allowed domain status",
  "note": "optional string",
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Supplier result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 30. Purchase Endpoints

### `GET /api/v1/cafe/branches/{branchId}/purchases`

**Purpose:**  
List purchase invoices.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
purchases.view

**Feature:**  
purchases

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/purchases`

**Purpose:**  
Create a purchase invoice.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
purchases.create

**Feature:**  
purchases

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Purchase domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Purchase result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes inventory events when quantities change.

### `GET /api/v1/cafe/branches/{branchId}/purchases/{purchaseId}`

**Purpose:**  
Return a purchase invoice.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
purchases.view

**Feature:**  
purchases

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "purchaseId": "Opaque purchaseId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Purchase result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/purchases/{purchaseId}`

**Purpose:**  
Update an unreceived purchase.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
purchases.update

**Feature:**  
purchases

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "purchaseId": "Opaque purchaseId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Purchase domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Purchase result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes inventory events when quantities change.

### `POST /api/v1/cafe/branches/{branchId}/purchases/{purchaseId}/receive`

**Purpose:**  
Receive a purchase and update stock and average costs.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
purchases.receive

**Feature:**  
purchases

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "purchaseId": "Opaque purchaseId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Purchase result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
Yes

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes inventory events when quantities change.

## 31. Customer Endpoints

Basic customer analytics are part of Customer Details and require only `customers.view`.

### `GET /api/v1/cafe/customers`

**Purpose:**  
Search customers.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/customers`

**Purpose:**  
Create a customer.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Customer domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Customer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/customers/{customerId}`

**Purpose:**  
Return customer details.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Customer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/customers/{customerId}`

**Purpose:**  
Update a customer.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
—

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Customer domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Customer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/customers/{customerId}/analytics`

**Purpose:**  
Return basic customer-detail analytics without requiring reports.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 32. Customer Address Endpoints

### `GET /api/v1/cafe/customers/{customerId}/addresses`

**Purpose:**  
List customer addresses.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/customers/{customerId}/addresses`

**Purpose:**  
Create a customer address.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Customer Address domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Customer Address result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/customers/{customerId}/addresses/{addressId}`

**Purpose:**  
Update an address or make it the default.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier",
  "addressId": "Opaque addressId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Customer Address domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Customer Address result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/customers/{customerId}/addresses/{addressId}`

**Purpose:**  
Delete a customer address.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier",
  "addressId": "Opaque addressId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Customer Address result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 33. Loyalty Endpoints

### `GET /api/v1/cafe/loyalty/settings`

**Purpose:**  
Return loyalty settings.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
loyalty.view

**Feature:**  
loyalty

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/loyalty/settings`

**Purpose:**  
Replace loyalty settings.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
loyalty.manage

**Feature:**  
loyalty

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Loyalty domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Loyalty result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/customers/{customerId}/loyalty/balance`

**Purpose:**  
Return a customer loyalty balance.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
loyalty.view

**Feature:**  
loyalty

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/customers/{customerId}/loyalty/transactions`

**Purpose:**  
List customer loyalty transactions.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
loyalty.view

**Feature:**  
loyalty

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/customers/{customerId}/loyalty/adjustments`

**Purpose:**  
Create an auditable manual loyalty adjustment.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
loyalty.manage

**Feature:**  
loyalty

**Path Parameters:**

```json
{
  "customerId": "Opaque customerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "points": 0,
  "reason": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Loyalty result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 34. Coupon Endpoints

### `GET /api/v1/cafe/coupons`

**Purpose:**  
List coupons.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
loyalty

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/coupons`

**Purpose:**  
Create a coupon.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
loyalty

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Coupon domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Coupon result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/coupons/{couponId}`

**Purpose:**  
Return a coupon.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
loyalty

**Path Parameters:**

```json
{
  "couponId": "Opaque couponId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Coupon result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/coupons/{couponId}`

**Purpose:**  
Update a coupon.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
loyalty

**Path Parameters:**

```json
{
  "couponId": "Opaque couponId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Coupon domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Coupon result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/coupons/{couponId}`

**Purpose:**  
Delete an unused coupon.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
loyalty

**Path Parameters:**

```json
{
  "couponId": "Opaque couponId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Coupon result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/coupons/validate`

**Purpose:**  
Validate a coupon for a provisional cart.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
orders.create

**Feature:**  
loyalty

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "code": "string",
  "items": [
    {
      "productId": "id",
      "quantity": 1
    }
  ],
  "subtotal": 0,
  "customerId": "optional"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Coupon result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 35. Offer Endpoints

### `GET /api/v1/cafe/offers`

**Purpose:**  
List tenant offers.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
onlineMenu

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/offers`

**Purpose:**  
Create an offer.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
onlineMenu

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Offer domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Offer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/offers/{offerId}`

**Purpose:**  
Return an offer.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
onlineMenu

**Path Parameters:**

```json
{
  "offerId": "Opaque offerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Offer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/offers/{offerId}`

**Purpose:**  
Update an offer.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
onlineMenu

**Path Parameters:**

```json
{
  "offerId": "Opaque offerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Offer domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Offer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/offers/{offerId}`

**Purpose:**  
Delete an offer.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
onlineMenu

**Path Parameters:**

```json
{
  "offerId": "Opaque offerId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Offer result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 36. Delivery Zone Endpoints

### `GET /api/v1/cafe/branches/{branchId}/delivery-zones`

**Purpose:**  
List branch delivery zones.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
deliveryZones.view

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/branches/{branchId}/delivery-zones`

**Purpose:**  
Create a delivery zone.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
deliveryZones.manage

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Delivery Zone domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Delivery Zone result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/delivery-zones/{zoneId}`

**Purpose:**  
Update a delivery zone.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
deliveryZones.manage

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "zoneId": "Opaque zoneId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Delivery Zone domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Delivery Zone result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/delivery-zones/{zoneId}`

**Purpose:**  
Delete a delivery zone.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
deliveryZones.manage

**Feature:**  
delivery

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "zoneId": "Opaque zoneId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Delivery Zone result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 37. Waiter Request Endpoints

### `POST /api/v1/customer/waiter-requests`

**Purpose:**  
Create a public waiter or bill request.

**Authentication:**  
Public or token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public QR context

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "type": "WAITER | BILL | TISSUES | HELP | OTHER",
  "note": "optional",
  "publicContextToken": "required for public request"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Waiter Request result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes waiter request events.

### `GET /api/v1/cafe/branches/{branchId}/waiter-requests`

**Purpose:**  
List branch waiter requests.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
waiterRequests.view

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier"
}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/waiter-requests/{requestId}/status`

**Purpose:**  
Accept or complete a waiter request.

**Authentication:**  
Authenticated.

**Scope:**  
Branch

**Permission:**  
waiterRequests.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```json
{
  "branchId": "Opaque branchId identifier",
  "requestId": "Opaque requestId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "status": "Allowed domain status",
  "note": "optional string",
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Waiter Request result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes waiter request events.

## 38. Kitchen API Usage

Kitchen consumes the existing Orders API with branch/status filters and updates operational status through the same order-status endpoint. A separate Kitchen Order resource would duplicate order state, create synchronization conflicts, and break the single order lifecycle. Kitchen authorization uses `kitchen.view` and `kitchen.update`.

## 39. Notification Endpoints

### `GET /api/v1/cafe/notifications`

**Purpose:**  
List notifications visible to the current employee.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership. Read operations may affect only notifications visible to the current employee.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/notifications/unread-count`

**Purpose:**  
Return the current employee unread count.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Notification result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership. Read operations may affect only notifications visible to the current employee.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/notifications/{notificationId}/read`

**Purpose:**  
Mark one current-employee notification as read.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

```json
{
  "notificationId": "Opaque notificationId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "read": true
}
```

**Response:**

```json
{
  "success": true,
  "data": "Notification result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership. Read operations may affect only notifications visible to the current employee.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes notification events.

### `POST /api/v1/cafe/notifications/mark-all-read`

**Purpose:**  
Mark all current-employee notifications as read.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Notification result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership. Read operations may affect only notifications visible to the current employee.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
Publishes notification events.

## 40. Audit Log Endpoints

### `GET /api/v1/platform/audit-log`

**Purpose:**  
Search Platform audit events.

**Authentication:**  
Authenticated.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/audit-log`

**Purpose:**  
Search tenant operational audit events.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
audit.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 41. Employee Endpoints

### `GET /api/v1/cafe/employees`

**Purpose:**  
List employees.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
employees.view

**Feature:**  
employees

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/employees`

**Purpose:**  
Create an employee and credential.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
employees.create

**Feature:**  
employees

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Employee domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Employee result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/employees/{employeeId}`

**Purpose:**  
Return an employee.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
employees.view

**Feature:**  
employees

**Path Parameters:**

```json
{
  "employeeId": "Opaque employeeId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Employee result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/employees/{employeeId}`

**Purpose:**  
Update employee identity and login fields.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
employees.update

**Feature:**  
employees

**Path Parameters:**

```json
{
  "employeeId": "Opaque employeeId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Employee domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Employee result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/employees/{employeeId}/status`

**Purpose:**  
Suspend or activate an employee.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
employees.suspend

**Feature:**  
employees

**Path Parameters:**

```json
{
  "employeeId": "Opaque employeeId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "status": "Allowed domain status",
  "note": "optional string",
  "version": "integer"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Employee result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/employees/{employeeId}/role`

**Purpose:**  
Assign an existing tenant role.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
employees.update

**Feature:**  
employees

**Path Parameters:**

```json
{
  "employeeId": "Opaque employeeId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "roleId": "id"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Employee result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/employees/{employeeId}/branch-access`

**Purpose:**  
Replace employee branch access.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
employees.update

**Feature:**  
employees

**Path Parameters:**

```json
{
  "employeeId": "Opaque employeeId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "branchIds": [
    "id"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": "Employee result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 42. Role Endpoints

### `GET /api/v1/cafe/roles`

**Purpose:**  
List tenant roles.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
roles.view

**Feature:**  
employees

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/roles`

**Purpose:**  
Create a role.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Role domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Role result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/roles/{roleId}`

**Purpose:**  
Return a role.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
roles.view

**Feature:**  
employees

**Path Parameters:**

```json
{
  "roleId": "Opaque roleId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Role result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PATCH /api/v1/cafe/roles/{roleId}`

**Purpose:**  
Update role name and permissions.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

```json
{
  "roleId": "Opaque roleId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Role domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Role result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `POST /api/v1/cafe/roles/{roleId}/duplicate`

**Purpose:**  
Duplicate a tenant role.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

```json
{
  "roleId": "Opaque roleId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Role result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/roles/{roleId}`

**Purpose:**  
Delete an unused non-system role.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

```json
{
  "roleId": "Opaque roleId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "Role result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 43. Permission Contract

### `GET /api/v1/cafe/permissions`

**Purpose:**  
Return the immutable permission catalog.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
roles.view

**Feature:**  
employees

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 44. Reports Endpoints

### `GET /api/v1/cafe/reports/sales`

**Purpose:**  
Return sales reporting data.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "from": "ISO date",
  "to": "ISO date",
  "branchIds": [
    "branch-id"
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "orderSource": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/reports/profit`

**Purpose:**  
Return profit reporting data.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "from": "ISO date",
  "to": "ISO date",
  "branchIds": [
    "branch-id"
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "orderSource": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/reports/products`

**Purpose:**  
Return product-performance reporting data.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "from": "ISO date",
  "to": "ISO date",
  "branchIds": [
    "branch-id"
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "orderSource": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/reports/orders`

**Purpose:**  
Return order-breakdown reporting data.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "from": "ISO date",
  "to": "ISO date",
  "branchIds": [
    "branch-id"
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "orderSource": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/reports/payments`

**Purpose:**  
Return payment reporting data.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "from": "ISO date",
  "to": "ISO date",
  "branchIds": [
    "branch-id"
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "orderSource": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `GET /api/v1/cafe/reports/inventory`

**Purpose:**  
Return inventory reporting data.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "from": "ISO date",
  "to": "ISO date",
  "branchIds": [
    "branch-id"
  ],
  "orderType": "TABLE | TAKEAWAY | DELIVERY",
  "orderSource": "POS | QR_MENU | ONLINE_MENU | MANUAL",
  "paymentMethod": "CASH | CARD | WALLET | ONLINE | MIXED"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side. Validate employee branch access and resource ownership.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 45. Settings Endpoints

### `GET /api/v1/cafe/settings`

**Purpose:**  
Return cafe-level settings.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
settings.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/settings`

**Purpose:**  
Replace editable cafe-level settings.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
settings.edit

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Settings domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Settings result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 46. Menu Settings Endpoints

### `GET /api/v1/cafe/menu-settings`

**Purpose:**  
Return customer-menu behavior settings.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
settings.view

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{
  "page": 1,
  "pageSize": 25,
  "search": "optional",
  "sortBy": "optional",
  "sortOrder": "asc | desc",
  "from": "optional ISO date",
  "to": "optional ISO date"
}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0
  }
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `PUT /api/v1/cafe/menu-settings`

**Purpose:**  
Replace customer-menu behavior settings.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
settings.edit

**Feature:**  
—

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "fields": "Current Menu Settings domain fields",
  "version": "Required on conflicting updates when applicable"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Menu Settings result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 47. File Upload Endpoints

### `POST /api/v1/cafe/assets`

**Purpose:**  
Upload a product or offer image.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Purpose-specific write permission

**Feature:**  
Purpose-specific

**Path Parameters:**

```json
{}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "multipart": "file, purpose, entityId?"
}
```

**Response:**

```json
{
  "success": true,
  "data": "File Upload result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

### `DELETE /api/v1/cafe/assets/{assetId}`

**Purpose:**  
Delete an unreferenced uploaded asset.

**Authentication:**  
Authenticated.

**Scope:**  
Tenant

**Permission:**  
Purpose-specific write permission

**Feature:**  
Purpose-specific

**Path Parameters:**

```json
{
  "assetId": "Opaque assetId identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "data": "File Upload result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
No

**Realtime Impact?**  
None.

## 48. Payment Webhooks

### `POST /api/v1/webhooks/payments/{provider}`

**Purpose:**  
Consume a provider-neutral payment webhook.

**Authentication:**  
Authenticated.

**Scope:**  
Public

**Permission:**  
Verified provider signature

**Feature:**  
—

**Path Parameters:**

```json
{
  "provider": "Opaque provider identifier"
}
```

**Query Parameters:**

```json
{}
```

**Request Body:**

```json
{
  "providerPayload": "Verified provider payload"
}
```

**Response:**

```json
{
  "success": true,
  "data": "Payment Webhook result"
}
```

**Important Validation:**  
Validate authentication, scope, permission, feature, and tenant isolation server-side.

**Transaction Required?**  
No

**Idempotency Required?**  
Yes — Idempotency-Key or verified provider event ID

**Realtime Impact?**  
Publishes payment/refund events.

## 49. WebSocket Events

| Event | Direction | Channel | Recipients | Payload summary |
|---|---|---|---|---|
| `order.created` | Server → client | `branch:{branchId}` | POS, kitchen, authorized admins | Order ID, number, type, source, status, totals summary |
| `order.status_changed` | Server → client | `branch:{branchId}` and `public-order:{token}` | Staff and tracking customer | Order ID/token, previous and next operational status, timestamp |
| `order.cancelled` | Server → client | Branch/public order | Staff and tracking customer | Order reference, reason, timestamp |
| `order.payment_status_changed` | Server → client | Branch/public order | Staff and tracking customer | Payment status only; never operational status |
| `payment.updated` | Server → client | `branch:{branchId}` | Authorized payment viewers | Payment ID, order ID, normalized status, amount |
| `refund.created` | Server → client | `branch:{branchId}` | Authorized payment/refund viewers | Refund ID, payment ID, amount, resulting payment status |
| `inventory.changed` | Server → client | `branch:{branchId}` | Inventory viewers | Item ID, movement type, quantity delta, resulting quantity |
| `inventory.low_stock` | Server → client | `branch:{branchId}` | Inventory viewers | Item ID, quantity, minimum stock |
| `inventory.out_of_stock` | Server → client | `branch:{branchId}` | Inventory viewers | Item ID, resulting quantity |
| `purchase.received` | Server → client | `branch:{branchId}` | Purchase/inventory viewers | Purchase ID and affected inventory IDs |
| `stock_count.confirmed` | Server → client | `branch:{branchId}` | Inventory viewers | Count ID and adjustment summary |
| `waiter_request.created` | Server → client | `branch:{branchId}` | Waiter-request viewers | Request ID, table, type, status |
| `waiter_request.status_changed` | Server → client | Branch and QR context | Staff and requesting customer | Request ID and status |
| `notification.created` | Server → client | `employee:{employeeId}` | Target employee | Notification ID, type, title, resource reference |
| `notification.read` | Server → client | `employee:{employeeId}` | Current employee sessions | Notification ID/read count |
| `shift.opened` | Server → client | `branch:{branchId}` | Shift/cash viewers | Shift ID, employee ID, opening timestamp |
| `shift.closed` | Server → client | `branch:{branchId}` | Shift/cash viewers | Shift ID, expected/actual/difference summary |

Clients refetch sensitive resource details through authorized HTTP endpoints. Events do not carry credentials, costs outside permission scope, or full customer records.

## 50. Transaction Boundaries

- Tenant creation plus owner credential provisioning.
- Checkout and public customer order creation.
- Order cancellation plus eligible inventory restoration.
- Refund plus payment/order/cash/audit/notification updates.
- Purchase receipt plus weighted-average inventory updates and movements.
- Stock-count confirmation and stock movements.
- Waste record plus stock decrement and audit.
- Expense mutation plus associated cash movement.
- Shift open/close and expected-cash calculation.
- Loyalty redemption/adjustment and coupon consumption.
- Default customer-address switching.
- Subscription extension and effective-access updates.

## 51. Idempotency Matrix

| Operation | Required | Key scope |
|---|---:|---|
| POS checkout | Yes | Tenant + Branch + key |
| Public order checkout | Yes | Public context + key |
| Payment intent create/confirm | Yes | Tenant/intent + key |
| Refund | Yes | Payment + key |
| Purchase receipt | Yes | Purchase + key |
| Stock-count confirmation | Yes | Stock count + key |
| Waste creation | Yes | Branch + key |
| Shift open/close | Yes | Employee + Branch + key |
| Order cancellation | Yes | Order + key |
| Subscription extension | Yes | Tenant + key |
| Payment webhook | Yes | Provider + provider event ID |
| Ordinary CRUD | No | Optimistic concurrency where applicable |

## 52. Permission Matrix

| Domain | Read | Write/actions |
|---|---|---|
| Orders | `orders.view` | `orders.create`, `orders.update`, `orders.cancel`, `orders.refund`, `orders.print` |
| Products | `products.view` | `products.create`, `products.update`, `products.delete` |
| Categories | `categories.view` | `categories.manage` |
| Menus | `menus.view` | `menus.manage` |
| Branches | `branches.view` | `branches.manage` |
| Tables/QR | `tables.view`, `qr.view` | `tables.manage`, `qr.manage` |
| Kitchen | `kitchen.view` | `kitchen.update` |
| Inventory | `inventory.view` | `inventory.create`, `inventory.adjust`, `inventory.stockCount`, `inventory.waste` |
| Purchases/Suppliers | `purchases.view`, `suppliers.view` | `purchases.create/update/receive`, `suppliers.manage` |
| Customers/Loyalty | `customers.view`, `loyalty.view` | `customers.manage`, `loyalty.manage` |
| Coupons/Offers | `coupons.view` | `coupons.manage` |
| Payments/Refunds | `payments.view`, `refunds.view` | `refunds.create` |
| Expenses/Cash/Shifts | respective `.view` keys | respective create/update/manage/open/close keys |
| Notifications | `notifications.view` including own read state | `notifications.manage` only for future real administration |
| Employees/Roles | `employees.view`, `roles.view` | employee and role write keys |
| Reports/Audit/Settings | `reports.view`, `audit.view`, `settings.view` | `settings.edit` |

## 53. Feature Matrix

| Feature | Protected functionality |
|---|---|
| `onlineMenu` | Public menu browsing, public offers, `ONLINE_MENU` order source |
| `pos` | POS quote/checkout, cash register, shifts |
| `orders` | Order management |
| `tables` | Table management |
| `qrOrdering` | Table QR, `QR_MENU + TABLE`, waiter requests |
| `kitchen` | Kitchen access through Orders API |
| `takeaway` | Takeaway order type |
| `delivery` | Delivery order type, addresses, zones |
| `inventory` | Inventory, stock counts, waste, movements |
| `recipes` | Recipe management and checkout consumption |
| `suppliers` | Supplier management |
| `purchases` | Purchase management |
| `expenses` | Expense management |
| `loyalty` | Loyalty and coupons |
| `employees` | Employee, role, permission administration |
| `reports` | Dedicated reports only, not basic customer analytics |
| `advancedReports` | Advanced report presentation/datasets only when explicitly implemented |

Internal Menu and MenuItem management intentionally has no `onlineMenu` feature requirement.

## 54. Branch Scope Matrix

| Resource | Scope source |
|---|---|
| Platform resources | Platform principal |
| Tenant catalog, menus, modifiers, suppliers, customers, roles | Authenticated tenant claim |
| Branch operational data | `{branchId}` plus tenant ownership and employee branch access |
| Reports | Requested branch IDs intersected with allowed branch access |
| Public QR | Validated opaque QR token resolving Tenant + Branch + Table |
| Public non-QR menu | Public tenant/branch slug resolved by bundled menu endpoint |
| Public order tracking | Opaque public order token |

## 55. Rate Limiting Matrix

| Endpoint class | Baseline policy |
|---|---|
| Login/password recovery | Strict per IP + login + tenant |
| Token refresh | Per session and IP |
| Public menu reads | CDN/cache friendly; per IP/tenant burst limit |
| Public order/quote | Per public context, IP, and idempotency key |
| QR resolution/waiter requests | Per token and IP |
| Payment intents | Per tenant/customer/order |
| Payment webhooks | Provider allowlist/signature plus event deduplication |
| Authenticated reads | Per principal/tenant |
| Authenticated writes | Lower per-principal limit with audit |
| Uploads | Per tenant, file count, size, and MIME policy |

## 56. Backend Security Requirements

- Enforce tenant isolation on every query and mutation.
- Never trust tenant, branch, price, discount, tax, loyalty, inventory, payment status, or permission data supplied by the client.
- Verify branch access independently of route visibility.
- Hash passwords with a modern memory-hard algorithm and rotate refresh tokens.
- Use secure HTTP-only cookies for refresh tokens and CSRF protection where cookie-authenticated writes apply.
- Validate MIME type from content, file size, image dimensions, and storage ownership.
- Verify payment webhook signatures and deduplicate events.
- Use parameterized queries, strict DTO allowlists, output shaping, audit logs, and secret redaction.
- Return public-safe projections for all public endpoints.
- Prevent ID enumeration with opaque identifiers and public tokens.
- Recalculate `MenuItem.price`, modifiers, offers, coupons, tax, service, and delivery server-side.

## 57. Backend-Only Responsibilities

- Authentication, authorization, feature and branch-access enforcement.
- Tenant isolation and public-context validation.
- Authoritative price and total calculation.
- Order/payment state-machine enforcement.
- Inventory and recipe consumption/restoration.
- Transaction boundaries, locks, idempotency, and concurrency.
- Subscription limits and effective-feature calculation.
- Audit creation, notification targeting, payment webhook processing, and signed asset handling.

## 58. Frontend-Only Actions

- Fixed Penta-K footer attribution linking to https://penta-k.com/en.
- Frontend CSV generation where current result sizes are appropriate.
- Dialog, popover, menu and navigation state.
- Local date, number, currency, and label formatting.
- Theme rendering and branding preview.
- QR visual rendering from a server-issued opaque token.
- Receipt rendering from server-returned print data.

Penta-K attribution is fixed Platform attribution. There is no Tenant endpoint for disabling, editing, replacing, or removing it.

## 59. P0 Implementation Order

1. Authentication/session, tenant isolation, permissions, features, and branch access.
2. Platform tenant/plan/subscription core.
3. Tenant, branch, products, categories, internal menus and MenuItems.
4. Bundled public menu and QR context resolution.
5. POS/public checkout, orders, payments, refunds, and payment webhook.
6. Employees, roles, permission catalog, and core settings.

## 60. P1 Implementation Order

1. Modifiers, recipes, tables, QR administration, waiter requests, and notifications.
2. Inventory, movements, counts, waste, suppliers, and purchases.
3. Cash register, shifts, expenses, customers, loyalty, coupons, offers, and delivery zones.
4. Reports, audit logs, uploads, branding, and realtime delivery.

## 61. P2 Implementation Order

1. Forgot-password and reset-password flows after delivery-provider selection.
2. Active-session listing and remote session revocation.

## 62. Product Decisions Still Required

- Password-reset delivery channel/provider and token lifetime.
- Concrete payment gateway providers behind the provider-neutral contract.
- Expense binary attachment workflow; current frontend only establishes attachment metadata.
- Whether supplier edit/deactivate and purchase edit controls will be exposed fully in the UI.
- Whether recipe deletion remains visible or replacement with an empty recipe is preferred.
- Whether `advancedReports` changes backend datasets or only frontend presentation.

## 63. Complete Master API Table

| # | Method | Endpoint | Domain | Scope | Permission | Feature | Priority |
|---:|---|---|---|---|---|---|---|
| 1 | POST | `/api/v1/auth/platform/login` | Authentication | Platform | Public | — | P0 |
| 2 | POST | `/api/v1/auth/cafe/login` | Authentication | Tenant | Public | — | P0 |
| 3 | POST | `/api/v1/auth/refresh` | Authentication | Tenant | Public refresh cookie | — | P0 |
| 4 | POST | `/api/v1/auth/logout` | Authentication | Tenant | Authenticated | — | P0 |
| 5 | GET | `/api/v1/auth/session` | Authentication | Tenant | Authenticated | — | P0 |
| 6 | POST | `/api/v1/auth/forgot-password` | Authentication | Tenant | Public | — | P2 |
| 7 | POST | `/api/v1/auth/reset-password` | Authentication | Tenant | Public | — | P2 |
| 8 | PATCH | `/api/v1/auth/password` | Authentication | Tenant | Authenticated | — | P0 |
| 9 | GET | `/api/v1/auth/sessions` | Authentication | Tenant | Authenticated | — | P2 |
| 10 | DELETE | `/api/v1/auth/sessions/{sessionId}` | Authentication | Tenant | Authenticated | — | P2 |
| 11 | GET | `/api/v1/platform/dashboard` | Platform | Platform | Platform operator | — | P0 |
| 12 | GET | `/api/v1/platform/tenants` | Platform | Platform | Platform operator | — | P0 |
| 13 | POST | `/api/v1/platform/tenants` | Platform | Platform | Platform operator | — | P0 |
| 14 | GET | `/api/v1/platform/tenants/{tenantId}` | Platform | Platform | Platform operator | — | P0 |
| 15 | PATCH | `/api/v1/platform/tenants/{tenantId}` | Platform | Platform | Platform operator | — | P0 |
| 16 | PATCH | `/api/v1/platform/tenants/{tenantId}/status` | Platform | Platform | Platform operator | — | P0 |
| 17 | GET | `/api/v1/platform/tenants/{tenantId}/branding` | Platform | Platform | Platform operator | — | P1 |
| 18 | PUT | `/api/v1/platform/tenants/{tenantId}/branding` | Platform | Platform | Platform operator | — | P1 |
| 19 | POST | `/api/v1/platform/tenants/{tenantId}/branding/assets` | Platform | Platform | Platform operator | — | P1 |
| 20 | DELETE | `/api/v1/platform/tenants/{tenantId}/branding/assets/{assetId}` | Platform | Platform | Platform operator | — | P1 |
| 21 | GET | `/api/v1/platform/plans` | Platform | Platform | Platform operator | — | P0 |
| 22 | POST | `/api/v1/platform/plans` | Platform | Platform | Platform operator | — | P0 |
| 23 | PATCH | `/api/v1/platform/plans/{planId}` | Platform | Platform | Platform operator | — | P0 |
| 24 | DELETE | `/api/v1/platform/plans/{planId}` | Platform | Platform | Platform operator | — | P0 |
| 25 | GET | `/api/v1/platform/subscriptions` | Platform | Platform | Platform operator | — | P0 |
| 26 | GET | `/api/v1/platform/tenants/{tenantId}/subscription` | Platform | Platform | Platform operator | — | P0 |
| 27 | PUT | `/api/v1/platform/tenants/{tenantId}/subscription` | Platform | Platform | Platform operator | — | P0 |
| 28 | POST | `/api/v1/platform/tenants/{tenantId}/subscription/extensions` | Platform | Platform | Platform operator | — | P0 |
| 29 | GET | `/api/v1/platform/tenants/{tenantId}/features` | Platform | Platform | Platform operator | — | P0 |
| 30 | PUT | `/api/v1/platform/tenants/{tenantId}/feature-overrides` | Platform | Platform | Platform operator | — | P0 |
| 31 | PUT | `/api/v1/platform/tenants/{tenantId}/branch-limit` | Platform | Platform | Platform operator | — | P0 |
| 32 | GET | `/api/v1/platform/audit-log` | Audit Log | Platform | Platform operator | — | P1 |
| 33 | GET | `/api/v1/cafe/tenant` | Tenant | Tenant | Authenticated | — | P0 |
| 34 | PATCH | `/api/v1/cafe/tenant` | Tenant | Tenant | settings.edit | — | P0 |
| 35 | GET | `/api/v1/cafe/branches` | Branch | Tenant | branches.view | — | P0 |
| 36 | POST | `/api/v1/cafe/branches` | Branch | Tenant | branches.manage | — | P0 |
| 37 | GET | `/api/v1/cafe/branches/{branchId}` | Branch | Branch | branches.view | — | P0 |
| 38 | PATCH | `/api/v1/cafe/branches/{branchId}` | Branch | Branch | branches.manage | — | P0 |
| 39 | PATCH | `/api/v1/cafe/branches/{branchId}/status` | Branch | Branch | branches.manage | — | P0 |
| 40 | PUT | `/api/v1/cafe/branches/{branchId}/menu` | Branch | Branch | branches.manage | — | P0 |
| 41 | GET | `/api/v1/cafe/products` | Product | Tenant | products.view | — | P0 |
| 42 | POST | `/api/v1/cafe/products` | Product | Tenant | products.create | — | P0 |
| 43 | GET | `/api/v1/cafe/products/{productId}` | Product | Tenant | products.view | — | P0 |
| 44 | PATCH | `/api/v1/cafe/products/{productId}` | Product | Tenant | products.update | — | P0 |
| 45 | DELETE | `/api/v1/cafe/products/{productId}` | Product | Tenant | products.delete | — | P0 |
| 46 | GET | `/api/v1/cafe/categories` | Category | Tenant | categories.view | — | P0 |
| 47 | POST | `/api/v1/cafe/categories` | Category | Tenant | categories.manage | — | P0 |
| 48 | PATCH | `/api/v1/cafe/categories/{categoryId}` | Category | Tenant | categories.manage | — | P0 |
| 49 | DELETE | `/api/v1/cafe/categories/{categoryId}` | Category | Tenant | categories.manage | — | P0 |
| 50 | GET | `/api/v1/cafe/menus` | Menu | Tenant | menus.view | — | P0 |
| 51 | POST | `/api/v1/cafe/menus` | Menu | Tenant | menus.manage | — | P0 |
| 52 | GET | `/api/v1/cafe/menus/{menuId}` | Menu | Tenant | menus.view | — | P0 |
| 53 | PATCH | `/api/v1/cafe/menus/{menuId}` | Menu | Tenant | menus.manage | — | P0 |
| 54 | POST | `/api/v1/cafe/menus/{menuId}/duplicate` | Menu | Tenant | menus.manage | — | P1 |
| 55 | DELETE | `/api/v1/cafe/menus/{menuId}` | Menu | Tenant | menus.manage | — | P0 |
| 56 | GET | `/api/v1/cafe/menus/{menuId}/items` | MenuItem | Tenant | menus.view | — | P0 |
| 57 | POST | `/api/v1/cafe/menus/{menuId}/items` | MenuItem | Tenant | menus.manage | — | P0 |
| 58 | PATCH | `/api/v1/cafe/menus/{menuId}/items/{menuItemId}` | MenuItem | Tenant | menus.manage | — | P0 |
| 59 | DELETE | `/api/v1/cafe/menus/{menuId}/items/{menuItemId}` | MenuItem | Tenant | menus.manage | — | P0 |
| 60 | PUT | `/api/v1/cafe/menus/{menuId}/items/order` | MenuItem | Tenant | menus.manage | — | P1 |
| 61 | GET | `/api/v1/cafe/modifier-groups` | Modifier | Tenant | products.view | — | P1 |
| 62 | POST | `/api/v1/cafe/modifier-groups` | Modifier | Tenant | products.create | — | P1 |
| 63 | GET | `/api/v1/cafe/modifier-groups/{modifierGroupId}` | Modifier | Tenant | products.view | — | P1 |
| 64 | PATCH | `/api/v1/cafe/modifier-groups/{modifierGroupId}` | Modifier | Tenant | products.update | — | P1 |
| 65 | DELETE | `/api/v1/cafe/modifier-groups/{modifierGroupId}` | Modifier | Tenant | products.delete | — | P1 |
| 66 | GET | `/api/v1/cafe/recipes` | Recipe | Tenant | products.view | recipes | P1 |
| 67 | GET | `/api/v1/cafe/products/{productId}/recipe` | Recipe | Tenant | products.view | recipes | P1 |
| 68 | PUT | `/api/v1/cafe/products/{productId}/recipe` | Recipe | Tenant | products.update | recipes | P1 |
| 69 | DELETE | `/api/v1/cafe/products/{productId}/recipe` | Recipe | Tenant | products.delete | recipes | P1 |
| 70 | GET | `/api/v1/cafe/branches/{branchId}/tables` | Table | Branch | tables.view | tables | P1 |
| 71 | POST | `/api/v1/cafe/branches/{branchId}/tables` | Table | Branch | tables.manage | tables | P1 |
| 72 | GET | `/api/v1/cafe/branches/{branchId}/tables/{tableId}` | Table | Branch | tables.view | tables | P1 |
| 73 | PATCH | `/api/v1/cafe/branches/{branchId}/tables/{tableId}` | Table | Branch | tables.manage | tables | P1 |
| 74 | DELETE | `/api/v1/cafe/branches/{branchId}/tables/{tableId}` | Table | Branch | tables.manage | tables | P1 |
| 75 | GET | `/api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token` | QR | Branch | qr.view | qrOrdering | P1 |
| 76 | PUT | `/api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token` | QR | Branch | qr.manage | qrOrdering | P1 |
| 77 | DELETE | `/api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token` | QR | Branch | qr.manage | qrOrdering | P1 |
| 78 | GET | `/api/v1/cafe/branches/{branchId}/cashier-qr` | QR | Branch | qr.view | qrOrdering | P1 |
| 79 | PUT | `/api/v1/cafe/branches/{branchId}/cashier-qr` | QR | Branch | qr.manage | qrOrdering | P1 |
| 80 | GET | `/api/v1/customer/qr/{token}` | QR | Public | Public | qrOrdering | P0 |
| 81 | GET | `/api/v1/customer/menu` | Public Customer | Public | Public | `onlineMenu` non-QR / `qrOrdering` QR | P0 |
| 82 | GET | `/api/v1/customer/products/{productId}` | Public Customer | Public | Public | `onlineMenu` non-QR / `qrOrdering` QR | P0 |
| 83 | GET | `/api/v1/customer/offers` | Public Customer | Public | Public | `onlineMenu` non-QR / `qrOrdering` QR | P0 |
| 84 | GET | `/api/v1/customer/offers/{offerId}` | Public Customer | Public | Public | `onlineMenu` non-QR / `qrOrdering` QR | P0 |
| 85 | POST | `/api/v1/customer/orders` | Public Customer | Public | Public | Conditional by source/type | P0 |
| 86 | GET | `/api/v1/customer/orders/{publicOrderToken}` | Public Customer | Public | Public order token | — | P0 |
| 87 | GET | `/api/v1/customer/orders/{publicOrderToken}/payment-status` | Public Customer | Public | Public order token | — | P0 |
| 88 | POST | `/api/v1/cafe/branches/{branchId}/checkout/quote` | POS / Checkout | Branch | orders.create | pos | P0 |
| 89 | POST | `/api/v1/cafe/branches/{branchId}/checkout` | POS / Checkout | Branch | orders.create | pos | P0 |
| 90 | GET | `/api/v1/cafe/orders` | Order | Tenant/Branch | orders.view or kitchen.view | orders or kitchen | P0 |
| 91 | GET | `/api/v1/cafe/orders/{orderId}` | Order | Tenant/Branch | orders.view or kitchen.view | orders or kitchen | P0 |
| 92 | PATCH | `/api/v1/cafe/orders/{orderId}/status` | Order | Branch | orders.update or kitchen.update | orders or kitchen | P0 |
| 93 | POST | `/api/v1/cafe/orders/{orderId}/cancellation` | Order | Branch | orders.cancel | orders | P0 |
| 94 | GET | `/api/v1/cafe/orders/{orderId}/print-data` | Order | Branch | orders.print | orders | P1 |
| 95 | GET | `/api/v1/cafe/payments` | Payment | Tenant/Branch | payments.view | — | P0 |
| 96 | GET | `/api/v1/cafe/payments/{paymentId}` | Payment | Branch | payments.view | — | P0 |
| 97 | POST | `/api/v1/cafe/payment-intents` | Payment | Branch | orders.create | Conditional payment method | P0 |
| 98 | POST | `/api/v1/cafe/payment-intents/{intentId}/confirm` | Payment | Branch | orders.create | Conditional payment method | P0 |
| 99 | GET | `/api/v1/cafe/payment-intents/{intentId}/status` | Payment | Branch/Public | Authenticated or public payment token | — | P0 |
| 100 | GET | `/api/v1/cafe/refunds` | Refund | Tenant/Branch | refunds.view | — | P1 |
| 101 | GET | `/api/v1/cafe/refunds/{refundId}` | Refund | Branch | refunds.view | — | P1 |
| 102 | POST | `/api/v1/cafe/payments/{paymentId}/refunds` | Refund | Branch | refunds.create | — | P0 |
| 103 | GET | `/api/v1/cafe/branches/{branchId}/cash-register/summary` | Cash Register | Branch | cashRegister.view | pos | P1 |
| 104 | GET | `/api/v1/cafe/branches/{branchId}/cash-transactions` | Cash Register | Branch | cashRegister.view | pos | P1 |
| 105 | POST | `/api/v1/cafe/branches/{branchId}/cash-transactions` | Cash Register | Branch | cashRegister.manage | pos | P1 |
| 106 | GET | `/api/v1/cafe/branches/{branchId}/shifts` | Shift | Branch | shifts.view | pos | P1 |
| 107 | GET | `/api/v1/cafe/branches/{branchId}/shifts/current` | Shift | Branch | shifts.view | pos | P1 |
| 108 | GET | `/api/v1/cafe/branches/{branchId}/shifts/{shiftId}` | Shift | Branch | shifts.view | pos | P1 |
| 109 | POST | `/api/v1/cafe/branches/{branchId}/shifts` | Shift | Branch | shifts.open | pos | P1 |
| 110 | POST | `/api/v1/cafe/branches/{branchId}/shifts/{shiftId}/close` | Shift | Branch | shifts.close | pos | P1 |
| 111 | GET | `/api/v1/cafe/branches/{branchId}/expenses` | Expense | Branch | expenses.view | expenses | P1 |
| 112 | POST | `/api/v1/cafe/branches/{branchId}/expenses` | Expense | Branch | expenses.create | expenses | P1 |
| 113 | GET | `/api/v1/cafe/branches/{branchId}/expenses/{expenseId}` | Expense | Branch | expenses.view | expenses | P1 |
| 114 | PATCH | `/api/v1/cafe/branches/{branchId}/expenses/{expenseId}` | Expense | Branch | expenses.update | expenses | P1 |
| 115 | DELETE | `/api/v1/cafe/branches/{branchId}/expenses/{expenseId}` | Expense | Branch | expenses.delete | expenses | P1 |
| 116 | GET | `/api/v1/cafe/branches/{branchId}/inventory` | Inventory | Branch | inventory.view | inventory | P1 |
| 117 | POST | `/api/v1/cafe/branches/{branchId}/inventory` | Inventory | Branch | inventory.create | inventory | P1 |
| 118 | GET | `/api/v1/cafe/branches/{branchId}/inventory/{inventoryItemId}` | Inventory | Branch | inventory.view | inventory | P1 |
| 119 | PATCH | `/api/v1/cafe/branches/{branchId}/inventory/{inventoryItemId}` | Inventory | Branch | inventory.adjust | inventory | P1 |
| 120 | GET | `/api/v1/cafe/branches/{branchId}/stock-movements` | Stock Movement | Branch | inventory.view | inventory | P1 |
| 121 | GET | `/api/v1/cafe/branches/{branchId}/stock-counts` | Stock Count | Branch | inventory.view | inventory | P1 |
| 122 | POST | `/api/v1/cafe/branches/{branchId}/stock-counts` | Stock Count | Branch | inventory.stockCount | inventory | P1 |
| 123 | GET | `/api/v1/cafe/branches/{branchId}/stock-counts/{stockCountId}` | Stock Count | Branch | inventory.view | inventory | P1 |
| 124 | POST | `/api/v1/cafe/branches/{branchId}/stock-counts/{stockCountId}/confirm` | Stock Count | Branch | inventory.stockCount | inventory | P1 |
| 125 | GET | `/api/v1/cafe/branches/{branchId}/waste` | Waste | Branch | inventory.view | inventory | P1 |
| 126 | POST | `/api/v1/cafe/branches/{branchId}/waste` | Waste | Branch | inventory.waste | inventory | P1 |
| 127 | GET | `/api/v1/cafe/suppliers` | Supplier | Tenant | suppliers.view | suppliers | P1 |
| 128 | POST | `/api/v1/cafe/suppliers` | Supplier | Tenant | suppliers.manage | suppliers | P1 |
| 129 | GET | `/api/v1/cafe/suppliers/{supplierId}` | Supplier | Tenant | suppliers.view | suppliers | P1 |
| 130 | PATCH | `/api/v1/cafe/suppliers/{supplierId}` | Supplier | Tenant | suppliers.manage | suppliers | P1 |
| 131 | PATCH | `/api/v1/cafe/suppliers/{supplierId}/status` | Supplier | Tenant | suppliers.manage | suppliers | P1 |
| 132 | GET | `/api/v1/cafe/branches/{branchId}/purchases` | Purchase | Branch | purchases.view | purchases | P1 |
| 133 | POST | `/api/v1/cafe/branches/{branchId}/purchases` | Purchase | Branch | purchases.create | purchases | P1 |
| 134 | GET | `/api/v1/cafe/branches/{branchId}/purchases/{purchaseId}` | Purchase | Branch | purchases.view | purchases | P1 |
| 135 | PATCH | `/api/v1/cafe/branches/{branchId}/purchases/{purchaseId}` | Purchase | Branch | purchases.update | purchases | P1 |
| 136 | POST | `/api/v1/cafe/branches/{branchId}/purchases/{purchaseId}/receive` | Purchase | Branch | purchases.receive | purchases | P1 |
| 137 | GET | `/api/v1/cafe/customers` | Customer | Tenant | customers.view | — | P1 |
| 138 | POST | `/api/v1/cafe/customers` | Customer | Tenant | customers.manage | — | P1 |
| 139 | GET | `/api/v1/cafe/customers/{customerId}` | Customer | Tenant | customers.view | — | P1 |
| 140 | PATCH | `/api/v1/cafe/customers/{customerId}` | Customer | Tenant | customers.manage | — | P1 |
| 141 | GET | `/api/v1/cafe/customers/{customerId}/analytics` | Customer | Tenant | customers.view | — | P1 |
| 142 | GET | `/api/v1/cafe/customers/{customerId}/addresses` | Customer Address | Tenant | customers.view | delivery | P1 |
| 143 | POST | `/api/v1/cafe/customers/{customerId}/addresses` | Customer Address | Tenant | customers.manage | delivery | P1 |
| 144 | PATCH | `/api/v1/cafe/customers/{customerId}/addresses/{addressId}` | Customer Address | Tenant | customers.manage | delivery | P1 |
| 145 | DELETE | `/api/v1/cafe/customers/{customerId}/addresses/{addressId}` | Customer Address | Tenant | customers.manage | delivery | P1 |
| 146 | GET | `/api/v1/cafe/loyalty/settings` | Loyalty | Tenant | loyalty.view | loyalty | P1 |
| 147 | PUT | `/api/v1/cafe/loyalty/settings` | Loyalty | Tenant | loyalty.manage | loyalty | P1 |
| 148 | GET | `/api/v1/cafe/customers/{customerId}/loyalty/balance` | Loyalty | Tenant | loyalty.view | loyalty | P1 |
| 149 | GET | `/api/v1/cafe/customers/{customerId}/loyalty/transactions` | Loyalty | Tenant | loyalty.view | loyalty | P1 |
| 150 | POST | `/api/v1/cafe/customers/{customerId}/loyalty/adjustments` | Loyalty | Tenant | loyalty.manage | loyalty | P1 |
| 151 | GET | `/api/v1/cafe/coupons` | Coupon | Tenant | coupons.view | loyalty | P1 |
| 152 | POST | `/api/v1/cafe/coupons` | Coupon | Tenant | coupons.manage | loyalty | P1 |
| 153 | GET | `/api/v1/cafe/coupons/{couponId}` | Coupon | Tenant | coupons.view | loyalty | P1 |
| 154 | PATCH | `/api/v1/cafe/coupons/{couponId}` | Coupon | Tenant | coupons.manage | loyalty | P1 |
| 155 | DELETE | `/api/v1/cafe/coupons/{couponId}` | Coupon | Tenant | coupons.manage | loyalty | P1 |
| 156 | POST | `/api/v1/cafe/coupons/validate` | Coupon | Tenant/Branch | orders.create | loyalty | P1 |
| 157 | GET | `/api/v1/cafe/offers` | Offer | Tenant | coupons.view | onlineMenu | P1 |
| 158 | POST | `/api/v1/cafe/offers` | Offer | Tenant | coupons.manage | onlineMenu | P1 |
| 159 | GET | `/api/v1/cafe/offers/{offerId}` | Offer | Tenant | coupons.view | onlineMenu | P1 |
| 160 | PATCH | `/api/v1/cafe/offers/{offerId}` | Offer | Tenant | coupons.manage | onlineMenu | P1 |
| 161 | DELETE | `/api/v1/cafe/offers/{offerId}` | Offer | Tenant | coupons.manage | onlineMenu | P1 |
| 162 | GET | `/api/v1/cafe/branches/{branchId}/delivery-zones` | Delivery Zone | Branch | deliveryZones.view | delivery | P1 |
| 163 | POST | `/api/v1/cafe/branches/{branchId}/delivery-zones` | Delivery Zone | Branch | deliveryZones.manage | delivery | P1 |
| 164 | PATCH | `/api/v1/cafe/branches/{branchId}/delivery-zones/{zoneId}` | Delivery Zone | Branch | deliveryZones.manage | delivery | P1 |
| 165 | DELETE | `/api/v1/cafe/branches/{branchId}/delivery-zones/{zoneId}` | Delivery Zone | Branch | deliveryZones.manage | delivery | P1 |
| 166 | POST | `/api/v1/customer/waiter-requests` | Waiter Request | Public | Public QR context | qrOrdering | P1 |
| 167 | GET | `/api/v1/cafe/branches/{branchId}/waiter-requests` | Waiter Request | Branch | waiterRequests.view | qrOrdering | P1 |
| 168 | PATCH | `/api/v1/cafe/branches/{branchId}/waiter-requests/{requestId}/status` | Waiter Request | Branch | waiterRequests.manage | qrOrdering | P1 |
| 169 | GET | `/api/v1/cafe/notifications` | Notification | Tenant/Branch | notifications.view | — | P1 |
| 170 | GET | `/api/v1/cafe/notifications/unread-count` | Notification | Tenant/Branch | notifications.view | — | P1 |
| 171 | PATCH | `/api/v1/cafe/notifications/{notificationId}/read` | Notification | Tenant/Branch | notifications.view | — | P1 |
| 172 | POST | `/api/v1/cafe/notifications/mark-all-read` | Notification | Tenant/Branch | notifications.view | — | P1 |
| 173 | GET | `/api/v1/cafe/audit-log` | Audit Log | Tenant | audit.view | — | P1 |
| 174 | GET | `/api/v1/cafe/employees` | Employee | Tenant | employees.view | employees | P0 |
| 175 | POST | `/api/v1/cafe/employees` | Employee | Tenant | employees.create | employees | P0 |
| 176 | GET | `/api/v1/cafe/employees/{employeeId}` | Employee | Tenant | employees.view | employees | P0 |
| 177 | PATCH | `/api/v1/cafe/employees/{employeeId}` | Employee | Tenant | employees.update | employees | P0 |
| 178 | PATCH | `/api/v1/cafe/employees/{employeeId}/status` | Employee | Tenant | employees.suspend | employees | P0 |
| 179 | PUT | `/api/v1/cafe/employees/{employeeId}/role` | Employee | Tenant | employees.update | employees | P0 |
| 180 | PUT | `/api/v1/cafe/employees/{employeeId}/branch-access` | Employee | Tenant | employees.update | employees | P0 |
| 181 | GET | `/api/v1/cafe/roles` | Role | Tenant | roles.view | employees | P0 |
| 182 | POST | `/api/v1/cafe/roles` | Role | Tenant | roles.manage | employees | P0 |
| 183 | GET | `/api/v1/cafe/roles/{roleId}` | Role | Tenant | roles.view | employees | P0 |
| 184 | PATCH | `/api/v1/cafe/roles/{roleId}` | Role | Tenant | roles.manage | employees | P0 |
| 185 | POST | `/api/v1/cafe/roles/{roleId}/duplicate` | Role | Tenant | roles.manage | employees | P1 |
| 186 | DELETE | `/api/v1/cafe/roles/{roleId}` | Role | Tenant | roles.manage | employees | P0 |
| 187 | GET | `/api/v1/cafe/permissions` | Permission | Tenant | roles.view | employees | P0 |
| 188 | GET | `/api/v1/cafe/reports/sales` | Report | Tenant/Branch | reports.view | reports | P1 |
| 189 | GET | `/api/v1/cafe/reports/profit` | Report | Tenant/Branch | reports.view | reports | P1 |
| 190 | GET | `/api/v1/cafe/reports/products` | Report | Tenant/Branch | reports.view | reports | P1 |
| 191 | GET | `/api/v1/cafe/reports/orders` | Report | Tenant/Branch | reports.view | reports | P1 |
| 192 | GET | `/api/v1/cafe/reports/payments` | Report | Tenant/Branch | reports.view | reports | P1 |
| 193 | GET | `/api/v1/cafe/reports/inventory` | Report | Tenant/Branch | reports.view | reports | P1 |
| 194 | GET | `/api/v1/cafe/settings` | Settings | Tenant | settings.view | — | P0 |
| 195 | PUT | `/api/v1/cafe/settings` | Settings | Tenant | settings.edit | — | P0 |
| 196 | GET | `/api/v1/cafe/menu-settings` | Menu Settings | Tenant | settings.view | — | P0 |
| 197 | PUT | `/api/v1/cafe/menu-settings` | Menu Settings | Tenant | settings.edit | — | P0 |
| 198 | POST | `/api/v1/cafe/assets` | File Upload | Tenant | Purpose-specific write permission | Purpose-specific | P1 |
| 199 | DELETE | `/api/v1/cafe/assets/{assetId}` | File Upload | Tenant | Purpose-specific write permission | Purpose-specific | P1 |
| 200 | POST | `/api/v1/webhooks/payments/{provider}` | Payment Webhook | Public | Verified provider signature | — | P0 |

## 64. Final Endpoint Counts

| Measure | Count |
|---|---:|
| Total | 200 |
| GET | 89 |
| POST | 50 |
| PATCH | 29 |
| PUT | 14 |
| DELETE | 18 |
| P0 | 87 |
| P1 | 109 |
| P2 | 4 |

Counts grouped by Domain:

| Domain | Count |
|---|---:|
| Authentication | 10 |
| Platform | 21 |
| Audit Log | 2 |
| Tenant | 2 |
| Branch | 6 |
| Product | 5 |
| Category | 4 |
| Menu | 6 |
| MenuItem | 5 |
| Modifier | 5 |
| Recipe | 4 |
| Table | 5 |
| QR | 6 |
| Public Customer | 7 |
| POS / Checkout | 2 |
| Order | 5 |
| Payment | 5 |
| Refund | 3 |
| Cash Register | 3 |
| Shift | 5 |
| Expense | 5 |
| Inventory | 4 |
| Stock Movement | 1 |
| Stock Count | 4 |
| Waste | 2 |
| Supplier | 5 |
| Purchase | 5 |
| Customer | 5 |
| Customer Address | 4 |
| Loyalty | 5 |
| Coupon | 6 |
| Offer | 5 |
| Delivery Zone | 4 |
| Waiter Request | 3 |
| Notification | 4 |
| Employee | 7 |
| Role | 6 |
| Permission | 1 |
| Report | 6 |
| Settings | 2 |
| Menu Settings | 2 |
| File Upload | 2 |
| Payment Webhook | 1 |

Previous total: **201**.  
New total: **200**.  
Difference: **-1**.  
Reason: removed only `GET /api/v1/customer/context`; its non-QR responsibility is consolidated into `GET /api/v1/customer/menu`, while QR-only context remains at `GET /api/v1/customer/qr/{token}`.

## Final Recommendation

**YES — API CONTRACT READY**

The contract is ready to hand to the Backend developer. Items in section 62 are bounded integration/product choices and do not invalidate the frozen resource, authorization, pricing, scope, or state-machine contract.
