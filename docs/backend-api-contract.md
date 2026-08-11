# Backend API Contract

> Frozen 200-endpoint, self-contained DTO/API contract derived from the existing frontend. Backend implementation must not require reading frontend TypeScript to discover fields.

## 1. Executive Summary

- Endpoints: **200**
- GET: **89**
- POST: **50**
- PATCH: **29**
- PUT: **14**
- DELETE: **18**
- P0: **87**
- P1: **109**
- P2: **4**

## 2. Architecture

```text
Platform → Tenant → Branch → Operational Data
Employee → Role → Permission → Branch Access
Product → Menu → MenuItem.price
```

`MenuItem.price` is the authoritative selling price. `ProductDto.defaultPrice` is an optional helper mapped from the legacy frontend product price and is never trusted by quote or checkout.

## 3. API Conventions

- Base URL: `/api/v1`.
- Access token: bearer token; refresh token: rotating Secure, HttpOnly, SameSite cookie.
- Platform login and Cafe login return `accessToken` and `expiresIn`; neither returns `refreshToken` in JSON.
- Login/refresh set `Set-Cookie: refresh_token=<opaque>; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth; Max-Age=<policy>`.
- Refresh consumes the cookie, rotates both server session and cookie, and returns a new access token.
- Logout revokes the session and clears the refresh cookie with `Max-Age=0`.
- Tenant scope comes from signed session claims; request bodies cannot select a tenant.
- Branch scope requires tenant ownership plus employee Branch Access.
- Pagination uses `page` and `pageSize` only where each endpoint explicitly lists them.
- Sorting/search/date filters are accepted only where explicitly listed.
- Dates are ISO-8601; persistence uses UTC.
- Money is JSON decimal and fixed-precision persistence, never binary floating-point.
- Mutations use the documented 200, 201, or 204 status.
- Idempotency applies only where marked and in the matrix.
- Optimistic writes use `version`/`If-Match`; stale writes return `409 VERSION_CONFLICT`.

Success envelopes are `ApiSuccess<T>` or `Paginated<T>`. Error envelopes are `ApiError`. 204 responses have no body.

## 4. Contract Corrections

- Internal Menu/MenuItem management is independent of `onlineMenu`.
- `MenuItem.price` is authoritative; checkout never trusts client price or Product default price.
- Notification read operations require `notifications.view`.
- Basic customer analytics requires `customers.view` and no Reports feature.
- Operational Order status and Payment status are separate state machines.
- `QR_MENU + TABLE` requires `qrOrdering`; `ONLINE_MENU + TAKEAWAY` requires `onlineMenu + takeaway`; `ONLINE_MENU + DELIVERY` requires `onlineMenu + delivery`.
- `/customer/qr/{token}` is QR-only context resolution; bundled `/customer/menu` handles non-QR resolution and accepts a validated QR context token.

## Enum Reference

All values are case-sensitive JSON strings. The API operational `OrderStatus` intentionally excludes the legacy frontend-only `REFUNDED` value; refund state belongs to `PaymentStatus`.

### Enum: TenantStatus

```text
"ACTIVE" | "SUSPENDED" | "TRIAL" | "ARCHIVED"
```

### Enum: SubscriptionStatus

```text
"TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED"
```

### Enum: SubscriptionType

```text
"TRIAL" | "PAID"
```

### Enum: BranchStatus

```text
"ACTIVE" | "INACTIVE"
```

### Enum: MenuStatus

```text
"ACTIVE" | "INACTIVE"
```

### Enum: EmployeeStatus

```text
"ACTIVE" | "SUSPENDED"
```

### Enum: BranchAccessMode

```text
"ALL" | "SELECTED"
```

### Enum: AuthRole

```text
"admin" | "kitchen" | "platform_super_admin"
```

### Enum: OrderStatus

```text
"NEW" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
```

### Enum: OrderSource

```text
"POS" | "QR_MENU" | "ONLINE_MENU" | "MANUAL"
```

### Enum: OrderType

```text
"TABLE" | "TAKEAWAY" | "DELIVERY"
```

### Enum: PaymentMethod

```text
"CASH" | "CARD" | "WALLET" | "ONLINE" | "MIXED"
```

### Enum: PaymentAllocationMethod

```text
"CASH" | "CARD" | "WALLET" | "ONLINE"
```

### Enum: PaymentStatus

```text
"PENDING" | "PAID" | "FAILED" | "PARTIALLY_REFUNDED" | "REFUNDED"
```

### Enum: RefundType

```text
"FULL" | "PARTIAL"
```

### Enum: CashTransactionType

```text
"OPENING_BALANCE" | "CASH_SALE" | "CASH_IN" | "CASH_OUT" | "EXPENSE" | "REFUND" | "SHIFT_ADJUSTMENT"
```

### Enum: ShiftStatus

```text
"OPEN" | "CLOSED"
```

### Enum: PurchaseStatus

```text
"DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED"
```

### Enum: StockCountStatus

```text
"DRAFT" | "CONFIRMED"
```

### Enum: StockMovementType

```text
"PURCHASE" | "SALE" | "WASTE" | "ADJUSTMENT" | "RETURN" | "ORDER_CANCELLATION_RESTORE"
```

### Enum: LoyaltyTransactionType

```text
"EARN" | "REDEEM" | "ADJUSTMENT" | "EXPIRED"
```

### Enum: CouponType

```text
"PERCENTAGE" | "FIXED"
```

### Enum: WaiterRequestType

```text
"WAITER" | "BILL" | "TISSUES" | "HELP" | "OTHER"
```

### Enum: WaiterRequestStatus

```text
"NEW" | "ACCEPTED" | "COMPLETED"
```

### Enum: NotificationType

```text
"NEW_ORDER" | "QR_ORDER" | "WAITER_REQUEST" | "BILL_REQUEST" | "LOW_STOCK" | "OUT_OF_STOCK" | "KITCHEN_DELAY" | "SHIFT_DIFFERENCE" | "PAYMENT_FAILED" | "REFUND"
```

### Enum: InventoryUnit

```text
"g" | "gm" | "gram" | "جم" | "kg" | "kilogram" | "كجم" | "ml" | "مل" | "l" | "liter" | "litre" | "لتر" | "piece" | "pcs" | "قطعة"
```

### Enum: FeatureKey

```text
"onlineMenu" | "pos" | "orders" | "tables" | "qrOrdering" | "kitchen" | "takeaway" | "delivery" | "inventory" | "recipes" | "suppliers" | "purchases" | "expenses" | "loyalty" | "employees" | "reports" | "advancedReports"
```

### Enum: PermissionKey

```text
"dashboard.view" | "pos.use" | "orders.view" | "orders.create" | "orders.update" | "orders.cancel" | "orders.refund" | "orders.print" | "products.view" | "products.create" | "products.update" | "products.delete" | "categories.view" | "categories.manage" | "menus.view" | "menus.manage" | "branches.view" | "branches.manage" | "tables.view" | "tables.manage" | "qr.view" | "qr.manage" | "kitchen.view" | "kitchen.update" | "inventory.view" | "inventory.create" | "inventory.adjust" | "inventory.stockCount" | "inventory.waste" | "purchases.view" | "purchases.create" | "purchases.update" | "purchases.receive" | "suppliers.view" | "suppliers.manage" | "customers.view" | "customers.manage" | "loyalty.view" | "loyalty.manage" | "coupons.view" | "coupons.manage" | "deliveryZones.view" | "deliveryZones.manage" | "payments.view" | "refunds.view" | "refunds.create" | "expenses.view" | "expenses.create" | "expenses.update" | "expenses.delete" | "cashRegister.view" | "cashRegister.manage" | "shifts.view" | "shifts.open" | "shifts.close" | "waiterRequests.view" | "waiterRequests.manage" | "employees.view" | "employees.create" | "employees.update" | "employees.suspend" | "roles.view" | "roles.manage" | "reports.view" | "notifications.view" | "notifications.manage" | "audit.view" | "settings.view" | "settings.edit"
```


## DTO Reference

Notation is language-neutral TypeScript structural syntax: `?` means an optional JSON member, intersections compose the stated members, and `Omit`/`Pick` have their standard structural meaning. Every referenced type is defined below.

### DTO: PageMeta

```ts
type PageMeta = { page: number; pageSize: number; total: number; totalPages: number };
```

### DTO: ApiSuccess<T>

```ts
type ApiSuccess<T> = { success: true; data: T };
```

### DTO: Paginated<T>

```ts
type Paginated<T> = { success: true; data: T[]; meta: PageMeta };
```

### DTO: ApiError

```ts
type ApiError = { success: false; error: { code: string; message: string; details: Record<string, unknown>; fields?: Record<string, string[]>; requestId: string } };
```

### DTO: AuthUserDto

```ts
type AuthUserDto = { id: string; name: string; email: string; role: AuthRole; tenantId?: string; employeeId?: string };
```

### DTO: TokenDto

```ts
type TokenDto = { accessToken: string; expiresIn: number };
```

`expiresIn` is seconds. Refresh tokens are never returned in JSON.

### DTO: PlatformLoginRequest

```ts
type PlatformLoginRequest = { login: string; password: string };
```

### DTO: PlatformLoginResponse

```ts
type PlatformLoginResponse = ApiSuccess<TokenDto & { user: AuthUserDto }>;
```

### DTO: CafeLoginRequest

```ts
type CafeLoginRequest = { tenantCode: string; login: string; password: string };
```

### DTO: BranchAccessDto

```ts
type BranchAccessDto = { mode: BranchAccessMode; branchIds: string[] };
```

### DTO: CafeLoginResponse

```ts
type CafeLoginResponse = ApiSuccess<TokenDto & { user: AuthUserDto; employee: CafeEmployeeDto; tenant: TenantDto; role: CafeRoleDto; permissions: PermissionKey[]; branchAccess: BranchAccessDto; features: EffectiveFeaturesDto; accessibleBranches: BranchDto[]; currentBranch: BranchDto | null }>;
```

### DTO: RefreshResponse

```ts
type RefreshResponse = ApiSuccess<TokenDto>;
```

### DTO: ForgotPasswordRequest

```ts
type ForgotPasswordRequest = { tenantCode?: string; login: string };
```

### DTO: PasswordResetAcceptedDto

```ts
type PasswordResetAcceptedDto = { accepted: true };
```

### DTO: ResetPasswordRequest

```ts
type ResetPasswordRequest = { token: string; newPassword: string };
```

### DTO: ChangePasswordRequest

```ts
type ChangePasswordRequest = { currentPassword: string; newPassword: string };
```

### DTO: SessionDto

```ts
type SessionDto = { id: string; createdAt: string; lastUsedAt: string; expiresAt: string; ipAddress?: string; userAgent?: string; current: boolean };
```

Session display fields beyond `id/current/timestamps` are Product decision required if the UI later exposes device details.

### DTO: CafeSessionResponse

```ts
type CafeSessionResponse = ApiSuccess<{ user: AuthUserDto; employee: CafeEmployeeDto | null; tenant: TenantDto | null; role: CafeRoleDto | null; permissions: PermissionKey[]; branchAccess: BranchAccessDto | null; features: EffectiveFeaturesDto; accessibleBranches: BranchDto[]; currentBranch: BranchDto | null }>;
```

### DTO: AssetDto

```ts
type AssetDto = { id: string; url: string; mimeType: string; size: number; width?: number; height?: number; createdAt: string };
```

### DTO: TenantContactDto

```ts
type TenantContactDto = { phone?: string; whatsapp?: string; email?: string; address?: string; locationUrl?: string; facebook?: string; instagram?: string; tiktok?: string };
```

### DTO: TenantOwnerDto

```ts
type TenantOwnerDto = { name: string; email: string; phone?: string; username?: string };
```

### DTO: TenantSettingsDto

```ts
type TenantSettingsDto = { currency: string; currencySymbol: string; timezone: string; locale: "ar" | "en"; taxRate: number };
```

### DTO: BrandingLoginDto

```ts
type BrandingLoginDto = { backgroundColor: string; backgroundImage?: string; welcomeTitle: string; subtitle: string; cardStyle: "solid" | "glass" };
```

### DTO: BrandingReceiptDto

```ts
type BrandingReceiptDto = { phone?: string; address?: string; taxNumber?: string; header?: string; footer?: string; showQr: boolean };
```

### DTO: BrandingDto

```ts
type BrandingDto = { logo: string; favicon?: string; lightLogo?: string; darkLogo?: string; primary: string; primaryForeground?: string; secondary: string; secondaryForeground?: string; accent: string; accentForeground?: string; background: string; surface: string; surfaceSecondary?: string; sidebar: string; sidebarText: string; sidebarActive?: string; sidebarActiveForeground?: string; textPrimary: string; textSecondary: string; muted?: string; border: string; radius: string; fontFamily?: string; login?: BrandingLoginDto; menu?: { categoryAccent: string; headerText?: string }; receipt?: BrandingReceiptDto; qr?: { foregroundColor: string; title: string; helperText: string } };
```

No Penta-K attribution controls are permitted.

### DTO: UpdateBrandingRequest

```ts
type UpdateBrandingRequest = BrandingDto;
```

### DTO: SubscriptionDto

```ts
type SubscriptionDto = { type: SubscriptionType; startsAt: string; endsAt: string; status: SubscriptionStatus; planCode: string };
```

### DTO: TenantDto

```ts
type TenantDto = { id: string; slug: string; name: string; legalName?: string; status: TenantStatus; plan: string; subscriptionStatus: SubscriptionStatus; branding: BrandingDto; settings: TenantSettingsDto; features: EffectiveFeaturesDto; createdAt: string; owner?: TenantOwnerDto; contact?: TenantContactDto; subscription?: { type: SubscriptionType; startsAt: string; endsAt: string }; featureOverrides?: Partial<Record<FeatureKey, boolean>>; maxBranchesOverride?: number };
```

### DTO: TenantSummaryDto

```ts
type TenantSummaryDto = { id: string; slug: string; name: string; status: TenantStatus; plan: string; subscriptionStatus: SubscriptionStatus; logo: string; ownerName?: string; phone?: string; subscriptionEndsAt?: string; createdAt: string };
```

### DTO: TenantDetailsDto

```ts
type TenantDetailsDto = TenantDto & { branches: BranchDto[]; effectiveBranchLimit: number; subscription: SubscriptionDto | null };
```

### DTO: CreateTenantRequest

```ts
type CreateTenantRequest = { slug: string; name: string; status: TenantStatus; plan: string; branding: BrandingDto; settings: TenantSettingsDto; contact: TenantContactDto; owner: { name: string; email: string; phone: string; username: string; password: string }; subscription: { type: SubscriptionType; startsAt: string; endsAt: string }; featureOverrides: Partial<Record<FeatureKey, boolean>> };
```

### DTO: UpdateTenantRequest

```ts
type UpdateTenantRequest = { slug?: string; name?: string; legalName?: string; status?: TenantStatus; plan?: string; branding?: BrandingDto; settings?: TenantSettingsDto; contact?: TenantContactDto; owner?: TenantOwnerDto; subscription?: { type: SubscriptionType; startsAt: string; endsAt: string }; featureOverrides?: Partial<Record<FeatureKey, boolean>>; version: number };
```

### DTO: UpdateTenantContactRequest

```ts
type UpdateTenantContactRequest = { name?: string; legalName?: string; contact?: TenantContactDto; version: number };
```

### DTO: TenantStatusRequest

```ts
type TenantStatusRequest = { status: TenantStatus; version: number };
```

### DTO: PlanDto

```ts
type PlanDto = { id: string; code: string; name: string; description: string; price?: number; active: boolean; maxBranches: number; features: FeatureKey[] };
```

### DTO: CreatePlanRequest

```ts
type CreatePlanRequest = { code: string; name: string; description: string; price?: number; active: boolean; maxBranches: number; features: FeatureKey[] };
```

### DTO: UpdatePlanRequest

```ts
type UpdatePlanRequest = { name?: string; description?: string; price?: number; active?: boolean; maxBranches?: number; features?: FeatureKey[]; version: number };
```

### DTO: AssignSubscriptionRequest

```ts
type AssignSubscriptionRequest = { planCode: string; type: SubscriptionType; startsAt: string; endsAt: string; status: SubscriptionStatus; version: number };
```

### DTO: ExtendSubscriptionRequest

```ts
type ExtendSubscriptionRequest = { months: 1 | 3 | 6 | 12 };
```

### DTO: FeatureOverridesDto

```ts
type FeatureOverridesDto = { overrides: Partial<Record<FeatureKey, boolean>> };
```

### DTO: EffectiveFeaturesDto

```ts
type EffectiveFeaturesDto = Record<FeatureKey, boolean>;
```

### DTO: BranchLimitRequest

```ts
type BranchLimitRequest = { maxBranchesOverride: number | null; version: number };
```

### DTO: PlatformDashboardDto

```ts
type PlatformDashboardDto = { totalTenants: number; activeTenants: number; trialTenants: number; suspendedTenants: number; archivedTenants: number; expiringWithin30Days: number; byStatus: { status: TenantStatus; count: number }[]; byPlan: { planCode: string; planName: string; count: number }[]; recentTenants: TenantSummaryDto[] };
```

### DTO: BranchSettingsDto

```ts
type BranchSettingsDto = { dineInEnabled: boolean; takeawayEnabled: boolean; deliveryEnabled: boolean; preparationTime: number; openingHours?: string };
```

### DTO: BranchDto

```ts
type BranchDto = { id: string; tenantId: string; name: string; code?: string; phone?: string; email?: string; address?: string; status: BranchStatus; menuId?: string; settings?: BranchSettingsDto; createdAt: string; updatedAt: string };
```

### DTO: PublicBranchDto

```ts
type PublicBranchDto = { id: string; name: string; phone?: string; address?: string; status: BranchStatus; settings?: BranchSettingsDto };
```

### DTO: CreateBranchRequest

```ts
type CreateBranchRequest = { name: string; code?: string; phone?: string; email?: string; address?: string; status: BranchStatus; menuId?: string; settings?: BranchSettingsDto };
```

### DTO: UpdateBranchRequest

```ts
type UpdateBranchRequest = { name?: string; code?: string; phone?: string; email?: string; address?: string; menuId?: string; settings?: BranchSettingsDto; version: number };
```

### DTO: BranchStatusRequest

```ts
type BranchStatusRequest = { status: BranchStatus; version: number };
```

### DTO: AssignBranchMenuRequest

```ts
type AssignBranchMenuRequest = { menuId: string; version: number };
```

### DTO: ProductDto

```ts
type ProductDto = { id: string; tenantId?: string; modifierGroupIds?: string[]; name: string; description: string; defaultPrice?: number; image?: string; categoryId: string; isAvailable: boolean };
```

`defaultPrice` maps the legacy frontend `price` helper. Checkout ignores it and loads `MenuItem.price`.

### DTO: PublicProductDto

```ts
type PublicProductDto = { id: string; name: string; description: string; image?: string; categoryId: string; isAvailable: boolean; modifierGroupIds?: string[] };
```

### DTO: CreateProductRequest

```ts
type CreateProductRequest = { name: string; description: string; defaultPrice?: number; image?: string; categoryId: string; isAvailable: boolean; modifierGroupIds?: string[] };
```

### DTO: UpdateProductRequest

```ts
type UpdateProductRequest = { name?: string; description?: string; defaultPrice?: number; image?: string; categoryId?: string; isAvailable?: boolean; modifierGroupIds?: string[]; version: number };
```

### DTO: CategoryDto

```ts
type CategoryDto = { id: string; tenantId?: string; name: string; image?: string; sortOrder: number; isActive: boolean };
```

### DTO: PublicCategoryDto

```ts
type PublicCategoryDto = { id: string; name: string; image?: string; sortOrder: number };
```

### DTO: CreateCategoryRequest

```ts
type CreateCategoryRequest = { name: string; image?: string; sortOrder: number; isActive: boolean };
```

### DTO: UpdateCategoryRequest

```ts
type UpdateCategoryRequest = { name?: string; image?: string; sortOrder?: number; isActive?: boolean; version: number };
```

### DTO: MenuDto

```ts
type MenuDto = { id: string; tenantId: string; name: string; description?: string; status: MenuStatus; createdAt: string; updatedAt: string };
```

### DTO: CreateMenuRequest

```ts
type CreateMenuRequest = { name: string; description?: string; status: MenuStatus };
```

### DTO: UpdateMenuRequest

```ts
type UpdateMenuRequest = { name?: string; description?: string; status?: MenuStatus; version: number };
```

### DTO: DuplicateMenuRequest

```ts
type DuplicateMenuRequest = { name?: string };
```

### DTO: MenuItemDto

```ts
type MenuItemDto = { id: string; tenantId: string; menuId: string; productId: string; price: number; available: boolean; sortOrder: number };
```

### DTO: PublicMenuItemDto

```ts
type PublicMenuItemDto = { id: string; productId: string; price: number; available: boolean; sortOrder: number };
```

### DTO: CreateMenuItemRequest

```ts
type CreateMenuItemRequest = { productId: string; price: number; available: boolean; sortOrder: number };
```

### DTO: UpdateMenuItemRequest

```ts
type UpdateMenuItemRequest = { price?: number; available?: boolean; sortOrder?: number; version: number };
```

### DTO: ReorderMenuItemsRequest

```ts
type ReorderMenuItemsRequest = { items: { menuItemId: string; sortOrder: number }[] };
```

### DTO: ModifierOptionDto

```ts
type ModifierOptionDto = { id: string; name: string; priceAdjustment: number; available: boolean; sortOrder?: number };
```

### DTO: ModifierGroupDto

```ts
type ModifierGroupDto = { id: string; tenantId?: string; name: string; required: boolean; minSelections: number; maxSelections: number; productIds: string[]; options: ModifierOptionDto[]; active: boolean; sortOrder?: number };
```

### DTO: CreateModifierGroupRequest

```ts
type CreateModifierGroupRequest = { name: string; required: boolean; minSelections: number; maxSelections: number; productIds: string[]; options: ModifierOptionDto[]; active: boolean; sortOrder?: number };
```

### DTO: UpdateModifierGroupRequest

```ts
type UpdateModifierGroupRequest = Partial<CreateModifierGroupRequest> & { version: number };
```

### DTO: RecipeIngredientDto

```ts
type RecipeIngredientDto = { inventoryItemId: string; quantity: number; unit: InventoryUnit };
```

### DTO: RecipeDto

```ts
type RecipeDto = { id: string; tenantId?: string; productId: string; ingredients: RecipeIngredientDto[] };
```

### DTO: UpdateRecipeRequest

```ts
type UpdateRecipeRequest = { ingredients: RecipeIngredientDto[]; version?: number };
```

### DTO: TableDto

```ts
type TableDto = { id: string; tenantId?: string; branchId?: string; number: number; qrCode: string; isActive: boolean };
```

### DTO: PublicTableDto

```ts
type PublicTableDto = { id: string; number: number };
```

### DTO: CreateTableRequest

```ts
type CreateTableRequest = { number: number; isActive: boolean };
```

### DTO: UpdateTableRequest

```ts
type UpdateTableRequest = { number?: number; isActive?: boolean; version: number };
```

### DTO: QrTokenDto

```ts
type QrTokenDto = { tableId: string; active: boolean; createdAt: string; rotatedAt?: string; publicUrl: string };
```

The raw token appears only inside `publicUrl` at creation/rotation; persisted token material must be hashed.

### DTO: RotateQrTokenRequest

```ts
type RotateQrTokenRequest = { rotate: true };
```

### DTO: QrResolveResponse

```ts
type QrResolveResponse = ApiSuccess<{ contextToken: string; tenant: PublicTenantDto; branch: PublicBranchDto; table: PublicTableDto; orderType: "TABLE" }>;
```

### DTO: CashierQrConfigDto

```ts
type CashierQrConfigDto = { orderType: OrderType; tableId?: string };
```

### DTO: PublicTenantDto

```ts
type PublicTenantDto = { name: string; slug: string; branding: BrandingDto; contact?: TenantContactDto; settings: Pick<TenantSettingsDto, "currency" | "currencySymbol" | "timezone" | "locale"> };
```

Branding contains no Platform attribution controls.

### DTO: MenuSettingsDto

```ts
type MenuSettingsDto = { tenantId: string; onlineOrderingEnabled: boolean; menuOpen: boolean; autoAcceptOrders: boolean; qrEnabled: boolean; multipleTableOrders: boolean; waiterRequestsEnabled: boolean; billRequestsEnabled: boolean; payAtCashierEnabled: boolean; electronicDineInPaymentEnabled: boolean; takeawayEnabled: boolean; asapPickupEnabled: boolean; scheduledPickupEnabled: boolean; preparationMinutes: number; deliveryEnabled: boolean; minimumDeliveryOrder: number; estimatedDeliveryMinutes: number; cashEnabled: boolean; cardEnabled: boolean; walletEnabled: boolean; onlinePaymentEnabled: boolean; updatedAt: string };
```

### DTO: UpdateMenuSettingsRequest

```ts
type UpdateMenuSettingsRequest = Omit<MenuSettingsDto, "tenantId" | "updatedAt"> & { version: number };
```

### DTO: PublicMenuResponse

```ts
type PublicMenuResponse = ApiSuccess<{ contextToken: string; tenant: PublicTenantDto; branch: PublicBranchDto; table?: PublicTableDto; orderType?: OrderType; settings: Omit<MenuSettingsDto, "tenantId" | "updatedAt">; menu: { id: string; name: string; description?: string }; categories: PublicCategoryDto[]; items: PublicMenuItemDto[]; products: PublicProductDto[]; modifierGroups: ModifierGroupDto[]; offers: PublicOfferDto[] }>;
```

### DTO: ModifierSelectionRequest

```ts
type ModifierSelectionRequest = { groupId: string; optionIds: string[] };
```

### DTO: CheckoutItemRequest

```ts
type CheckoutItemRequest = { productId: string; quantity: number; notes?: string; variantId?: string; modifierSelections?: ModifierSelectionRequest[] };
```

No client price or trusted total is accepted.

### DTO: CustomerOrderRequest

```ts
type CustomerOrderRequest = { contextToken: string; items: CheckoutItemRequest[]; orderType: OrderType; customerId?: string; customerName?: string; customerPhone?: string; customerAddress?: string; customerNotes?: string; deliveryZoneId?: string; couponCode?: string; paymentMethod: PaymentMethod; paymentAllocations?: PaymentAllocationDto[]; receivedAmount?: number; source: "QR_MENU" | "ONLINE_MENU"; deferPayment?: boolean };
```

### DTO: PosCheckoutRequest

```ts
type PosCheckoutRequest = { items: CheckoutItemRequest[]; orderType: OrderType; tableId?: string; customerId?: string; customerName?: string; customerPhone?: string; customerAddress?: string; customerNotes?: string; deliveryZoneId?: string; couponCode?: string; paymentMethod: PaymentMethod; paymentAllocations?: PaymentAllocationDto[]; receivedAmount?: number; source?: "POS" | "MANUAL"; deferPayment?: boolean };
```

### DTO: CheckoutQuoteRequest

```ts
type CheckoutQuoteRequest = { items: CheckoutItemRequest[]; orderType: OrderType; tableId?: string; customerId?: string; deliveryZoneId?: string; couponCode?: string };
```

### DTO: OrderModifierSnapshotDto

```ts
type OrderModifierSnapshotDto = { groupId: string; groupName: string; optionId: string; optionName: string; priceAdjustment: number };
```

### DTO: OrderAddonSnapshotDto

```ts
type OrderAddonSnapshotDto = { id: string; name: string; price: number };
```

### DTO: OrderItemDto

```ts
type OrderItemDto = { id: string; productId: string; productName: string; unitPrice: number; quantity: number; totalPrice: number; notes?: string; variantName?: string; addons?: OrderAddonSnapshotDto[]; selectedModifiers?: OrderModifierSnapshotDto[] };
```

### DTO: OrderTimelineEntryDto

```ts
type OrderTimelineEntryDto = { status: OrderStatus; employeeId?: string; at: string; note?: string };
```

### DTO: OrderTotalsDto

```ts
type OrderTotalsDto = { subtotal: number; discount: number; tax: number; serviceCharge: number; deliveryFee: number; total: number };
```

### DTO: OrderCancellationDto

```ts
type OrderCancellationDto = { reason: string; employeeId?: string; cancelledAt: string };
```

### DTO: OrderDto

```ts
type OrderDto = { id: string; tenantId?: string; branchId?: string; orderNumber: string; tableNumber: number; orderType: OrderType; source?: OrderSource; paymentStatus?: PaymentStatus; paymentMethod?: PaymentMethod; createdBy?: string; tableSessionId?: string; tableId?: string; customerId?: string; deliveryZoneId?: string; customerName?: string; customerPhone?: string; customerAddress?: string; customerNotes?: string; deliveryZoneName?: string; couponCode?: string; couponDiscount?: number; cancellation?: OrderCancellationDto; inventoryConsumedAt?: string; inventoryRestoredAt?: string; inventoryRestoredBy?: string; timeline?: OrderTimelineEntryDto[]; status: OrderStatus; items: OrderItemDto[]; subtotal: number; discount?: number; tax?: number; serviceCharge?: number; deliveryFee?: number; total: number; createdAt: string; updatedAt?: string; version: number };
```

### DTO: PublicOrderDto

```ts
type PublicOrderDto = { publicOrderToken: string; orderNumber: string; status: OrderStatus; paymentStatus: PaymentStatus; orderType: OrderType; branch: Pick<PublicBranchDto, "name" | "phone" | "address">; items: OrderItemDto[]; totals: OrderTotalsDto; createdAt: string };
```

### DTO: CheckoutQuoteItemDto

```ts
type CheckoutQuoteItemDto = { productId: string; productName: string; quantity: number; menuItemPrice: number; modifierAdjustment: number; unitPrice: number; lineTotal: number };
```

### DTO: StockValidationIssueDto

```ts
type StockValidationIssueDto = { productId: string; inventoryItemId?: string; code: "INSUFFICIENT_STOCK" | "MISSING_RECIPE_ITEM"; message: string };
```

### DTO: CheckoutQuoteDto

```ts
type CheckoutQuoteDto = { items: CheckoutQuoteItemDto[]; subtotal: number; discount: number; coupon?: { code: string; discount: number }; tax: number; serviceCharge: number; deliveryFee: number; total: number; loyalty: { pointsToEarn: number; pointsRedeemed: number; redemptionAmount: number }; stockValidationErrors: StockValidationIssueDto[] };
```

### DTO: CheckoutResponse

```ts
type CheckoutResponse = ApiSuccess<{ order: OrderDto; payment: PaymentDto | null; receipt: ReceiptSummaryDto }>;
```

### DTO: CustomerOrderResponse

```ts
type CustomerOrderResponse = ApiSuccess<PublicOrderDto>;
```

### DTO: ReceiptSummaryDto

```ts
type ReceiptSummaryDto = { orderNumber: string; branchName: string; items: OrderItemDto[]; totals: OrderTotalsDto; paymentMethod?: PaymentMethod; receivedAmount?: number; changeAmount?: number; createdAt: string };
```

### DTO: UpdateOrderStatusRequest

```ts
type UpdateOrderStatusRequest = { status: OrderStatus; note?: string; version: number };
```

### DTO: CancelOrderRequest

```ts
type CancelOrderRequest = { reason: string; version: number };
```

### DTO: CancelOrderResponse

```ts
type CancelOrderResponse = ApiSuccess<{ order: OrderDto; inventoryRestored: boolean; inventoryRestoredAt?: string }>;
```

### DTO: PrintDataDto

```ts
type PrintDataDto = { tenantName: string; branchName: string; branding: Pick<BrandingDto, "logo" | "receipt">; order: OrderDto; payment?: PaymentDto; printedAt: string };
```

### DTO: PaymentAllocationDto

```ts
type PaymentAllocationDto = { method: PaymentAllocationMethod; amount: number };
```

### DTO: PaymentDto

```ts
type PaymentDto = { id: string; tenantId?: string; branchId?: string; transactionNumber?: string; orderId: string; customerId?: string; employeeId?: string; amount: number; method: PaymentMethod; allocations?: PaymentAllocationDto[]; receivedAmount?: number; changeAmount?: number; status: PaymentStatus; transactionReference?: string; createdAt: string };
```

### DTO: PaymentDetailsDto

```ts
type PaymentDetailsDto = { payment: PaymentDto; order?: OrderDto; refunds: RefundDto[]; totalRefunded: number; remainingRefundable: number; status: PaymentStatus };
```

### DTO: CreatePaymentIntentRequest

```ts
type CreatePaymentIntentRequest = { orderId: string; method: "CARD" | "WALLET" | "ONLINE"; amount: number; returnUrl?: string };
```

`returnUrl` handling is provider integration data; exact provider allowlist is Product decision required.

### DTO: PaymentIntentDto

```ts
type PaymentIntentDto = { id: string; orderId: string; amount: number; method: "CARD" | "WALLET" | "ONLINE"; status: PaymentStatus; clientAction?: { type: "REDIRECT"; url: string }; expiresAt?: string; createdAt: string };
```

### DTO: ConfirmPaymentIntentRequest

```ts
type ConfirmPaymentIntentRequest = { providerReference?: string };
```

Provider-specific confirmation fields are Product decision required.

### DTO: CreateRefundRequest

```ts
type CreateRefundRequest = { amount: number; reason: string };
```

### DTO: RefundDto

```ts
type RefundDto = { id: string; tenantId?: string; branchId?: string; orderId: string; paymentId: string; amount: number; type: RefundType; reason: string; employeeId?: string; createdAt: string };
```

### DTO: RefundResponse

```ts
type RefundResponse = ApiSuccess<{ refund: RefundDto; payment: PaymentDto; previouslyRefunded: number; remainingRefundable: number }>;
```

### DTO: CashTransactionDto

```ts
type CashTransactionDto = { id: string; tenantId?: string; branchId?: string; type: CashTransactionType; amount: number; reason?: string; orderId?: string; paymentId?: string; refundId?: string; expenseId?: string; shiftId?: string; employeeId?: string; createdAt: string };
```

### DTO: CreateCashTransactionRequest

```ts
type CreateCashTransactionRequest = { type: "CASH_IN" | "CASH_OUT" | "SHIFT_ADJUSTMENT"; amount: number; reason: string; shiftId?: string };
```

### DTO: CashRegisterSummaryDto

```ts
type CashRegisterSummaryDto = { openingCash: number; cashSales: number; cashIn: number; cashOut: number; expenses: number; refunds: number; adjustments: number; expectedCash: number };
```

### DTO: ShiftDto

```ts
type ShiftDto = { id: string; tenantId?: string; branchId?: string; employeeId: string; openingCash: number; openedAt: string; status: ShiftStatus; closedAt?: string; expectedCash?: number; actualCash?: number; difference?: number };
```

### DTO: ShiftDetailsDto

```ts
type ShiftDetailsDto = ShiftDto & { entries: CashTransactionDto[]; summary: CashRegisterSummaryDto };
```

### DTO: OpenShiftRequest

```ts
type OpenShiftRequest = { openingCash: number };
```

### DTO: CloseShiftRequest

```ts
type CloseShiftRequest = { actualCash: number };
```

### DTO: CloseShiftResponse

```ts
type CloseShiftResponse = ApiSuccess<{ shift: ShiftDto; openingCash: number; cashSales: number; cashIn: number; cashOut: number; expenses: number; refunds: number; adjustments: number; expectedCash: number; actualCash: number; difference: number }>;
```

### DTO: ExpenseAttachmentDto

```ts
type ExpenseAttachmentDto = { name: string; type?: string; size?: number };
```

Binary upload/linkage is Product decision required.

### DTO: ExpenseDto

```ts
type ExpenseDto = { id: string; tenantId?: string; branchId?: string; category: string; amount: number; date: string; notes?: string; employeeId?: string; paymentMethod?: PaymentAllocationMethod; attachment?: ExpenseAttachmentDto; createdAt: string };
```

### DTO: CreateExpenseRequest

```ts
type CreateExpenseRequest = { category: string; amount: number; date: string; notes?: string; paymentMethod?: PaymentAllocationMethod; attachment?: ExpenseAttachmentDto };
```

### DTO: UpdateExpenseRequest

```ts
type UpdateExpenseRequest = Partial<CreateExpenseRequest> & { version: number };
```

### DTO: InventoryItemDto

```ts
type InventoryItemDto = { id: string; tenantId?: string; branchId?: string; name: string; sku?: string; unit: InventoryUnit; quantity: number; minimumStock: number; averageCost: number; active: boolean; createdAt: string; updatedAt: string };
```

### DTO: CreateInventoryItemRequest

```ts
type CreateInventoryItemRequest = { name: string; sku?: string; unit: InventoryUnit; quantity: number; minimumStock: number; averageCost: number; active: boolean };
```

### DTO: UpdateInventoryItemRequest

```ts
type UpdateInventoryItemRequest = { name?: string; sku?: string; unit?: InventoryUnit; minimumStock?: number; averageCost?: number; active?: boolean; quantityAdjustment?: number; adjustmentReason?: string; version: number };
```

### DTO: StockMovementDto

```ts
type StockMovementDto = { id: string; tenantId?: string; branchId?: string; inventoryItemId: string; type: StockMovementType; quantity: number; quantityBefore: number; quantityAfter: number; notes?: string; createdBy?: string; createdAt: string };
```

### DTO: StockCountItemDto

```ts
type StockCountItemDto = { inventoryItemId: string; expectedQuantity: number; actualQuantity: number };
```

### DTO: StockCountDto

```ts
type StockCountDto = { id: string; tenantId?: string; branchId?: string; number: string; items: StockCountItemDto[]; status: StockCountStatus; createdAt: string; confirmedAt?: string };
```

### DTO: CreateStockCountRequest

```ts
type CreateStockCountRequest = { number?: string; items: StockCountItemDto[] };
```

### DTO: ConfirmStockCountRequest

```ts
type ConfirmStockCountRequest = {};
```

### DTO: ConfirmStockCountResponse

```ts
type ConfirmStockCountResponse = ApiSuccess<{ stockCount: StockCountDto; movements: StockMovementDto[]; inventory: InventoryItemDto[] }>;
```

### DTO: WasteDto

```ts
type WasteDto = { id: string; tenantId?: string; branchId?: string; inventoryItemId: string; quantity: number; unit: InventoryUnit; estimatedCost: number; reason: string; notes?: string; createdAt: string };
```

### DTO: CreateWasteRequest

```ts
type CreateWasteRequest = { inventoryItemId: string; quantity: number; unit: InventoryUnit; reason: string; notes?: string };
```

### DTO: CreateWasteResponse

```ts
type CreateWasteResponse = ApiSuccess<{ waste: WasteDto; movement: StockMovementDto; inventoryItem: InventoryItemDto }>;
```

### DTO: SupplierDto

```ts
type SupplierDto = { id: string; tenantId?: string; name: string; company?: string; phone?: string; email?: string; address?: string; notes?: string; active: boolean; createdAt: string };
```

### DTO: CreateSupplierRequest

```ts
type CreateSupplierRequest = { name: string; company?: string; phone?: string; email?: string; address?: string; notes?: string; active: boolean };
```

### DTO: UpdateSupplierRequest

```ts
type UpdateSupplierRequest = Partial<CreateSupplierRequest> & { version: number };
```

### DTO: SupplierStatusRequest

```ts
type SupplierStatusRequest = { active: boolean; version: number };
```

### DTO: PurchaseItemDto

```ts
type PurchaseItemDto = { inventoryItemId: string; quantity: number; unitCost: number; total: number };
```

### DTO: PurchaseDto

```ts
type PurchaseDto = { id: string; tenantId?: string; branchId?: string; invoiceNumber: string; supplierId: string; date: string; items: PurchaseItemDto[]; subtotal: number; discount: number; tax: number; total: number; paid: number; remaining: number; status: PurchaseStatus };
```

### DTO: CreatePurchaseRequest

```ts
type CreatePurchaseRequest = { invoiceNumber: string; supplierId: string; date: string; items: Omit<PurchaseItemDto, "total">[]; discount: number; tax: number; paid: number };
```

### DTO: UpdatePurchaseRequest

```ts
type UpdatePurchaseRequest = Partial<CreatePurchaseRequest> & { status?: "DRAFT" | "ORDERED" | "CANCELLED"; version: number };
```

### DTO: ReceivePurchaseRequest

```ts
type ReceivePurchaseRequest = {};
```

### DTO: ReceivePurchaseResponse

```ts
type ReceivePurchaseResponse = ApiSuccess<{ purchase: PurchaseDto; movements: StockMovementDto[]; inventory: InventoryItemDto[] }>;
```

### DTO: CustomerAddressDto

```ts
type CustomerAddressDto = { id: string; label: string; address: string; notes?: string; phone?: string; isDefault: boolean };
```

### DTO: CustomerDto

```ts
type CustomerDto = { id: string; tenantId?: string; name: string; phone?: string; email?: string; address?: string; addresses?: CustomerAddressDto[]; active: boolean; createdAt: string };
```

### DTO: CreateCustomerRequest

```ts
type CreateCustomerRequest = { name: string; phone?: string; email?: string; address?: string; active: boolean };
```

### DTO: UpdateCustomerRequest

```ts
type UpdateCustomerRequest = Partial<CreateCustomerRequest> & { version: number };
```

### DTO: CreateCustomerAddressRequest

```ts
type CreateCustomerAddressRequest = { label: string; address: string; notes?: string; phone?: string; isDefault: boolean };
```

### DTO: UpdateCustomerAddressRequest

```ts
type UpdateCustomerAddressRequest = Partial<CreateCustomerAddressRequest> & { version: number };
```

### DTO: CustomerAnalyticsDto

```ts
type CustomerAnalyticsDto = { orders: OrderDto[]; orderCount: number; totalSpend: number; averageOrder: number; lastVisit?: string };
```

### DTO: LoyaltySettingsDto

```ts
type LoyaltySettingsDto = { id: string; tenantId?: string; enabled: boolean; spendAmountPerPoint: number; pointRedemptionValue: number; minimumRedeemPoints: number; maximumRedemptionAmount?: number; expiryDays?: number; updatedAt: string };
```

### DTO: UpdateLoyaltySettingsRequest

```ts
type UpdateLoyaltySettingsRequest = { enabled: boolean; spendAmountPerPoint: number; pointRedemptionValue: number; minimumRedeemPoints: number; maximumRedemptionAmount?: number; expiryDays?: number; version: number };
```

### DTO: LoyaltyTransactionDto

```ts
type LoyaltyTransactionDto = { id: string; tenantId?: string; customerId: string; orderId?: string; points: number; type: LoyaltyTransactionType; notes?: string; createdAt: string };
```

### DTO: LoyaltyBalanceDto

```ts
type LoyaltyBalanceDto = { customerId: string; points: number };
```

### DTO: LoyaltyAdjustmentRequest

```ts
type LoyaltyAdjustmentRequest = { points: number; notes?: string };
```

### DTO: CouponUsageDto

```ts
type CouponUsageDto = { orderId: string; customerId?: string; usedAt: string };
```

### DTO: CouponDto

```ts
type CouponDto = { id: string; tenantId?: string; code: string; type: CouponType; value: number; minimumOrder?: number; maximumDiscount?: number; startDate?: string; endDate?: string; productIds?: string[]; categoryIds?: string[]; usageLimit?: number; perCustomerLimit?: number; usageCount?: number; usages?: CouponUsageDto[]; active: boolean };
```

### DTO: CreateCouponRequest

```ts
type CreateCouponRequest = Omit<CouponDto, "id" | "tenantId" | "usageCount" | "usages">;
```

### DTO: UpdateCouponRequest

```ts
type UpdateCouponRequest = Partial<CreateCouponRequest> & { version: number };
```

### DTO: CouponValidateRequest

```ts
type CouponValidateRequest = { code: string; subtotal: number; items: { productId: string; quantity: number; lineTotal: number }[]; customerId?: string };
```

### DTO: CouponValidateResponse

```ts
type CouponValidateResponse = ApiSuccess<{ valid: true; coupon: CouponDto; discount: number } | { valid: false; code: "NOT_FOUND" | "INACTIVE" | "NOT_STARTED" | "EXPIRED" | "MINIMUM_ORDER" | "USAGE_LIMIT" | "CUSTOMER_LIMIT" | "NOT_APPLICABLE"; message: string }>;
```

### DTO: OfferDto

```ts
type OfferDto = { id: string; tenantId: string; title: string; description: string; image: string; originalPrice: number; price: number; isActive: boolean; sortOrder: number };
```

### DTO: PublicOfferDto

```ts
type PublicOfferDto = { id: string; title: string; description: string; image: string; originalPrice: number; price: number; sortOrder: number };
```

### DTO: CreateOfferRequest

```ts
type CreateOfferRequest = { title: string; description: string; image: string; originalPrice: number; price: number; isActive: boolean; sortOrder: number };
```

### DTO: UpdateOfferRequest

```ts
type UpdateOfferRequest = Partial<CreateOfferRequest> & { version: number };
```

### DTO: DeliveryZoneDto

```ts
type DeliveryZoneDto = { id: string; tenantId?: string; branchId?: string; name: string; fee: number; minimumOrder?: number; estimatedMinutes?: number; active: boolean };
```

### DTO: CreateDeliveryZoneRequest

```ts
type CreateDeliveryZoneRequest = { name: string; fee: number; minimumOrder?: number; estimatedMinutes?: number; active: boolean };
```

### DTO: UpdateDeliveryZoneRequest

```ts
type UpdateDeliveryZoneRequest = Partial<CreateDeliveryZoneRequest> & { version: number };
```

### DTO: CreateWaiterRequest

```ts
type CreateWaiterRequest = { contextToken: string; type: WaiterRequestType; notes?: string };
```

### DTO: WaiterRequestDto

```ts
type WaiterRequestDto = { id: string; tenantId?: string; branchId?: string; tableId: string; tableNumber?: number; type: WaiterRequestType; status: WaiterRequestStatus; notes?: string; acceptedBy?: string; acceptedAt?: string; completedBy?: string; completedAt?: string; createdAt: string };
```

### DTO: UpdateWaiterRequestStatusRequest

```ts
type UpdateWaiterRequestStatusRequest = { status: "ACCEPTED" | "COMPLETED"; version: number };
```

### DTO: NotificationDto

```ts
type NotificationDto = { id: string; tenantId?: string; branchId?: string; type: NotificationType; title: string; message: string; read: boolean; relatedEntityType?: "order" | "table" | "waiterRequest" | "payment" | "inventory"; relatedEntityId?: string; createdAt: string };
```

### DTO: UnreadCountDto

```ts
type UnreadCountDto = { count: number };
```

### DTO: MarkNotificationReadRequest

```ts
type MarkNotificationReadRequest = { read: true };
```

### DTO: MarkAllNotificationsReadDto

```ts
type MarkAllNotificationsReadDto = { updatedCount: number };
```

### DTO: AuditEntryDto

```ts
type AuditEntryDto = { id: string; tenantId?: string; branchId?: string; userId?: string; module: string; action: string; description: string; entityType?: string; entityId?: string; createdAt: string };
```

### DTO: CafeEmployeeDto

```ts
type CafeEmployeeDto = { id: string; tenantId: string; name: string; phone: string; email?: string; username?: string; roleId: string; branchAccess: BranchAccessMode; branchIds: string[]; status: EmployeeStatus; joinDate?: string; createdAt: string; updatedAt: string };
```

### DTO: CreateEmployeeRequest

```ts
type CreateEmployeeRequest = { name: string; phone: string; email?: string; username?: string; roleId: string; branchAccess: BranchAccessMode; branchIds: string[]; status: EmployeeStatus; joinDate?: string; password?: string };
```

Password initialization is Product decision required if the Platform owner does not set it separately.

### DTO: UpdateEmployeeRequest

```ts
type UpdateEmployeeRequest = { name?: string; phone?: string; email?: string; username?: string; roleId?: string; branchAccess?: BranchAccessMode; branchIds?: string[]; status?: EmployeeStatus; joinDate?: string; version: number };
```

### DTO: EmployeeStatusRequest

```ts
type EmployeeStatusRequest = { status: EmployeeStatus; version: number };
```

### DTO: EmployeeRoleRequest

```ts
type EmployeeRoleRequest = { roleId: string; version: number };
```

### DTO: EmployeeBranchAccessRequest

```ts
type EmployeeBranchAccessRequest = { mode: BranchAccessMode; branchIds: string[]; version: number };
```

### DTO: CafeRoleDto

```ts
type CafeRoleDto = { id: string; tenantId: string; code?: "OWNER" | "MANAGER" | "CASHIER" | "WAITER" | "KITCHEN"; name: string; description?: string; systemRole: boolean; permissions: PermissionKey[]; createdAt: string; updatedAt: string };
```

### DTO: CreateRoleRequest

```ts
type CreateRoleRequest = { name: string; description?: string; permissions: PermissionKey[] };
```

### DTO: UpdateRoleRequest

```ts
type UpdateRoleRequest = { name?: string; description?: string; permissions?: PermissionKey[]; version: number };
```

### DTO: DuplicateRoleRequest

```ts
type DuplicateRoleRequest = { name?: string };
```

### DTO: PermissionDefinitionDto

```ts
type PermissionDefinitionDto = { key: PermissionKey; label: string; description: string; group: string; groupLabel: string };
```

### DTO: SalesReportDto

```ts
type SalesReportDto = { orders: OrderDto[]; payments: PaymentDto[]; grossSales: number; discounts: number; refunds: number; netSales: number; taxes: number; serviceCharges: number; deliveryFees: number; orderCount: number; averageOrder: number };
```

### DTO: ProfitReportDto

```ts
type ProfitReportDto = { revenue: number; cogs: number; grossProfit: number; expenses: number; netProfit: number; estimated: boolean };
```

### DTO: ProductReportRowDto

```ts
type ProductReportRowDto = { productId: string; name: string; quantity: number; revenue: number };
```

### DTO: OrderBreakdownReportDto

```ts
type OrderBreakdownReportDto = { byType: { value: OrderType; count: number }[]; bySource: { value: OrderSource; count: number }[] };
```

### DTO: PaymentReportRowDto

```ts
type PaymentReportRowDto = { method: PaymentMethod; amount: number; count: number; percentage: number };
```

### DTO: InventoryReportDto

```ts
type InventoryReportDto = { value: number; lowStock: number; outOfStock: number; purchases: number; waste: number; saleConsumption: number; adjustments: number };
```

### DTO: CafeSettingsDto

```ts
type CafeSettingsDto = { workingHours: string; taxRate: number; serviceCharge: number; onlineOrdering: boolean; takeaway: boolean; delivery: boolean; paymentMethods: PaymentAllocationMethod[]; receiptHeader: string; receiptFooter: string; kitchenSound: boolean };
```

### DTO: UpdateCafeSettingsRequest

```ts
type UpdateCafeSettingsRequest = CafeSettingsDto & { version: number };
```

### DTO: BrandAssetUploadRequest

```ts
type BrandAssetUploadRequest = { file: binary; kind: "logo" | "favicon" | "loginBackground" };
```

### DTO: CafeAssetUploadRequest

```ts
type CafeAssetUploadRequest = { file: binary; purpose: "productImage" | "offerImage"; entityId?: string };
```

### DTO: BrandAssetResponse

```ts
type BrandAssetResponse = ApiSuccess<AssetDto>;
```

### DTO: PaymentWebhookAcknowledgementDto

```ts
type PaymentWebhookAcknowledgementDto = { received: true; duplicate: boolean };
```

### DTO: PaymentWebhookRequest

```ts
type PaymentWebhookRequest = { providerPayload: unknown };
```

Provider payload and signature header are Product decision required per selected provider; the normalized internal fields are intent reference, provider event ID, amount, and payment status.

### DTO: PlatformAuditQuery

```ts
type PlatformAuditQuery = { page?: number; pageSize?: number; search?: string; tenantId?: string; userId?: string; action?: string; from?: string; to?: string };
```

### DTO: CafeAuditQuery

```ts
type CafeAuditQuery = { page?: number; pageSize?: number; search?: string; branchId?: string; userId?: string; module?: string; action?: string; entityType?: string; entityId?: string; from?: string; to?: string };
```

### DTO: SubscriptionListItemDto

```ts
type SubscriptionListItemDto = { tenant: TenantSummaryDto; subscription: SubscriptionDto | null };
```

## 5. Authentication Endpoints

### `POST /api/v1/auth/platform/login`

**Purpose:**  
Authenticate a Platform operator and establish a rotating session.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Platform

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`PlatformLoginRequest`

**Response DTO:**  
`PlatformLoginResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
INVALID_CREDENTIALS, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/auth/cafe/login`

**Purpose:**  
Resolve the tenant, authenticate a Cafe owner/employee, and return effective access context.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`CafeLoginRequest`

**Response DTO:**  
`CafeLoginResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
INVALID_CREDENTIALS, TENANT_NOT_FOUND, TENANT_SUSPENDED, EMPLOYEE_SUSPENDED, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/auth/refresh`

**Purpose:**  
Rotate the refresh session and issue a new access token.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public refresh cookie

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`RefreshResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, REFRESH_TOKEN_EXPIRED, REFRESH_TOKEN_REUSED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/auth/logout`

**Purpose:**  
Revoke the current session and clear the refresh cookie.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/auth/session`

**Purpose:**  
Hydrate the authenticated principal and effective access context.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`CafeSessionResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/auth/forgot-password`

**Purpose:**  
Accept a password-recovery request without disclosing account existence.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`ForgotPasswordRequest`

**Response DTO:**  
`ApiSuccess<PasswordResetAcceptedDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/auth/reset-password`

**Purpose:**  
Consume a single-use recovery token and replace the password.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Tenant

**Permission:**  
Public

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`ResetPasswordRequest`

**Response DTO:**  
`ApiSuccess<{ passwordChanged: true }>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
RESET_TOKEN_INVALID, RESET_TOKEN_EXPIRED, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/auth/password`

**Purpose:**  
Verify the current password and replace it.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`ChangePasswordRequest`

**Response DTO:**  
`ApiSuccess<{ passwordChanged: true }>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/auth/sessions`

**Purpose:**  
List or return the authorized Authentication representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<SessionDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/auth/sessions/{sessionId}`

**Purpose:**  
Delete or revoke the selected Authentication resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { sessionId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 6. Platform Endpoints

### `GET /api/v1/platform/dashboard`

**Purpose:**  
Return tenant, status, plan, expiry, and recent-tenant Platform metrics.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PlatformDashboardDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/platform/tenants`

**Purpose:**  
List or return the authorized Platform representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; status?: TenantStatus; plan?: string; sortBy?: "name" | "createdAt" | "status"; sortOrder?: "asc" | "desc" };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<TenantSummaryDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/platform/tenants`

**Purpose:**  
Create a Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; status?: TenantStatus; plan?: string; sortBy?: "name" | "createdAt" | "status"; sortOrder?: "asc" | "desc" };
```

**Request DTO:**  
`CreateTenantRequest`

**Response DTO:**  
`Paginated<TenantSummaryDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/platform/tenants/{tenantId}`

**Purpose:**  
Return the authorized Platform representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<TenantDetailsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/platform/tenants/{tenantId}`

**Purpose:**  
Partially update the selected Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateTenantRequest`

**Response DTO:**  
`ApiSuccess<TenantDetailsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/platform/tenants/{tenantId}/status`

**Purpose:**  
Partially update the selected Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`TenantStatusRequest`

**Response DTO:**  
`ApiSuccess<TenantDetailsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/platform/tenants/{tenantId}/branding`

**Purpose:**  
List or return the authorized Platform representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<BrandingDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/branding`

**Purpose:**  
Replace or assign the selected Platform configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateBrandingRequest`

**Response DTO:**  
`ApiSuccess<BrandingDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/platform/tenants/{tenantId}/branding/assets`

**Purpose:**  
Create a Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`BrandAssetUploadRequest`

**Response DTO:**  
`BrandAssetResponse`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/platform/tenants/{tenantId}/branding/assets/{assetId}`

**Purpose:**  
Delete or revoke the selected Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string; assetId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/platform/plans`

**Purpose:**  
List or return the authorized Platform representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { active?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PlanDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/platform/plans`

**Purpose:**  
Create a Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { active?: boolean };
```

**Request DTO:**  
`CreatePlanRequest`

**Response DTO:**  
`ApiSuccess<PlanDto[]>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/platform/plans/{planId}`

**Purpose:**  
Partially update the selected Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { planId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdatePlanRequest`

**Response DTO:**  
`ApiSuccess<PlanDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/platform/plans/{planId}`

**Purpose:**  
Delete or revoke the selected Platform resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { planId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/platform/subscriptions`

**Purpose:**  
List or return the authorized Platform representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; status?: SubscriptionStatus };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<SubscriptionListItemDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/platform/tenants/{tenantId}/subscription`

**Purpose:**  
List or return the authorized Platform representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<SubscriptionDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/subscription`

**Purpose:**  
Replace or assign the selected Platform configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`AssignSubscriptionRequest`

**Response DTO:**  
`ApiSuccess<SubscriptionDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/platform/tenants/{tenantId}/subscription/extensions`

**Purpose:**  
Extend the tenant subscription by an allowed month interval.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`ExtendSubscriptionRequest`

**Response DTO:**  
`ApiSuccess<SubscriptionDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
None.

### `GET /api/v1/platform/tenants/{tenantId}/features`

**Purpose:**  
List or return the authorized Platform representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<EffectiveFeaturesDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/feature-overrides`

**Purpose:**  
Replace or assign the selected Platform configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`FeatureOverridesDto`

**Response DTO:**  
`ApiSuccess<EffectiveFeaturesDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/platform/tenants/{tenantId}/branch-limit`

**Purpose:**  
Replace or assign the selected Platform configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { tenantId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`BranchLimitRequest`

**Response DTO:**  
`ApiSuccess<{ maxBranchesOverride: number | null; effectiveMaxBranches: number }>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 7. Tenant Endpoints

### `GET /api/v1/cafe/tenant`

**Purpose:**  
List or return the authorized Tenant representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Authenticated

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<TenantDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/tenant`

**Purpose:**  
Partially update the selected Tenant resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
settings.edit

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`UpdateTenantContactRequest`

**Response DTO:**  
`ApiSuccess<TenantDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 8. Branch Endpoints

### `GET /api/v1/cafe/branches`

**Purpose:**  
List or return the authorized Branch representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
branches.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { status?: BranchStatus };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<BranchDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches`

**Purpose:**  
Create a Branch resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { status?: BranchStatus };
```

**Request DTO:**  
`CreateBranchRequest`

**Response DTO:**  
`ApiSuccess<BranchDto[]>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/branches/{branchId}`

**Purpose:**  
Return the authorized Branch representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
branches.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<BranchDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}`

**Purpose:**  
Partially update the selected Branch resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateBranchRequest`

**Response DTO:**  
`ApiSuccess<BranchDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/status`

**Purpose:**  
Partially update the selected Branch resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`BranchStatusRequest`

**Response DTO:**  
`ApiSuccess<BranchDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/branches/{branchId}/menu`

**Purpose:**  
Replace or assign the selected Branch configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
branches.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`AssignBranchMenuRequest`

**Response DTO:**  
`ApiSuccess<BranchDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 9. Product Endpoints

### `GET /api/v1/cafe/products`

**Purpose:**  
List or return the authorized Product representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; categoryId?: string; isAvailable?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<ProductDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/products`

**Purpose:**  
Create a Product resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.create

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; categoryId?: string; isAvailable?: boolean };
```

**Request DTO:**  
`CreateProductRequest`

**Response DTO:**  
`Paginated<ProductDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/products/{productId}`

**Purpose:**  
Return the authorized Product representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { productId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ProductDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/products/{productId}`

**Purpose:**  
Partially update the selected Product resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.update

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { productId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateProductRequest`

**Response DTO:**  
`ApiSuccess<ProductDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/products/{productId}`

**Purpose:**  
Delete or revoke the selected Product resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.delete

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { productId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 10. Category Endpoints

### `GET /api/v1/cafe/categories`

**Purpose:**  
List or return the authorized Category representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
categories.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; isActive?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<CategoryDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/categories`

**Purpose:**  
Create a Category resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
categories.manage

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; isActive?: boolean };
```

**Request DTO:**  
`CreateCategoryRequest`

**Response DTO:**  
`Paginated<CategoryDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/categories/{categoryId}`

**Purpose:**  
Partially update the selected Category resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
categories.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { categoryId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateCategoryRequest`

**Response DTO:**  
`ApiSuccess<CategoryDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/categories/{categoryId}`

**Purpose:**  
Delete or revoke the selected Category resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
categories.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { categoryId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 11. Menu Endpoints

Internal menu administration has no `onlineMenu` gate.

### `GET /api/v1/cafe/menus`

**Purpose:**  
List or return the authorized Menu representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; status?: MenuStatus };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<MenuDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/menus`

**Purpose:**  
Create a Menu resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; status?: MenuStatus };
```

**Request DTO:**  
`CreateMenuRequest`

**Response DTO:**  
`Paginated<MenuDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/menus/{menuId}`

**Purpose:**  
Return the authorized Menu representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<MenuDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/menus/{menuId}`

**Purpose:**  
Partially update the selected Menu resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateMenuRequest`

**Response DTO:**  
`ApiSuccess<MenuDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/menus/{menuId}/duplicate`

**Purpose:**  
Duplicate the selected Menu resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`DuplicateMenuRequest`

**Response DTO:**  
`ApiSuccess<MenuDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/menus/{menuId}`

**Purpose:**  
Delete or revoke the selected Menu resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 12. MenuItem Endpoints

All quote and checkout operations load `MenuItem.price` server-side.

### `GET /api/v1/cafe/menus/{menuId}/items`

**Purpose:**  
List or return the authorized MenuItem representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<MenuItemDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/menus/{menuId}/items`

**Purpose:**  
Create a MenuItem resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`CreateMenuItemRequest`

**Response DTO:**  
`ApiSuccess<MenuItemDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/menus/{menuId}/items/{menuItemId}`

**Purpose:**  
Partially update the selected MenuItem resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string; menuItemId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateMenuItemRequest`

**Response DTO:**  
`ApiSuccess<MenuItemDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/menus/{menuId}/items/{menuItemId}`

**Purpose:**  
Delete or revoke the selected MenuItem resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string; menuItemId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/menus/{menuId}/items/order`

**Purpose:**  
Replace or assign the selected MenuItem configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
menus.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { menuId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`ReorderMenuItemsRequest`

**Response DTO:**  
`ApiSuccess<MenuItemDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 13. Modifier Endpoints

### `GET /api/v1/cafe/modifier-groups`

**Purpose:**  
List or return the authorized Modifier representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { productId?: string; active?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ModifierGroupDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/modifier-groups`

**Purpose:**  
Create a Modifier resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.create

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { productId?: string; active?: boolean };
```

**Request DTO:**  
`CreateModifierGroupRequest`

**Response DTO:**  
`ApiSuccess<ModifierGroupDto[]>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/modifier-groups/{modifierGroupId}`

**Purpose:**  
Return the authorized Modifier representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { modifierGroupId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ModifierGroupDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/modifier-groups/{modifierGroupId}`

**Purpose:**  
Partially update the selected Modifier resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.update

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { modifierGroupId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateModifierGroupRequest`

**Response DTO:**  
`ApiSuccess<ModifierGroupDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/modifier-groups/{modifierGroupId}`

**Purpose:**  
Delete or revoke the selected Modifier resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.delete

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { modifierGroupId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 14. Recipe Endpoints

### `GET /api/v1/cafe/recipes`

**Purpose:**  
List or return the authorized Recipe representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
recipes

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { productId?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<RecipeDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/products/{productId}/recipe`

**Purpose:**  
List or return the authorized Recipe representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.view

**Feature:**  
recipes

**Path Parameters:**

```ts
type PathParameters = { productId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<RecipeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/products/{productId}/recipe`

**Purpose:**  
Replace or assign the selected Recipe configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.update

**Feature:**  
recipes

**Path Parameters:**

```ts
type PathParameters = { productId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateRecipeRequest`

**Response DTO:**  
`ApiSuccess<RecipeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/products/{productId}/recipe`

**Purpose:**  
Delete or revoke the selected Recipe resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
products.delete

**Feature:**  
recipes

**Path Parameters:**

```ts
type PathParameters = { productId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 15. Table Endpoints

### `GET /api/v1/cafe/branches/{branchId}/tables`

**Purpose:**  
List or return the authorized Table representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
tables.view

**Feature:**  
tables

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { search?: string; isActive?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<TableDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/tables`

**Purpose:**  
Create a Table resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
tables.manage

**Feature:**  
tables

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { search?: string; isActive?: boolean };
```

**Request DTO:**  
`CreateTableRequest`

**Response DTO:**  
`ApiSuccess<TableDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/branches/{branchId}/tables/{tableId}`

**Purpose:**  
Return the authorized Table representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
tables.view

**Feature:**  
tables

**Path Parameters:**

```ts
type PathParameters = { branchId: string; tableId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<TableDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/tables/{tableId}`

**Purpose:**  
Partially update the selected Table resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
tables.manage

**Feature:**  
tables

**Path Parameters:**

```ts
type PathParameters = { branchId: string; tableId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateTableRequest`

**Response DTO:**  
`ApiSuccess<TableDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/tables/{tableId}`

**Purpose:**  
Delete or revoke the selected Table resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
tables.manage

**Feature:**  
tables

**Path Parameters:**

```ts
type PathParameters = { branchId: string; tableId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 16. QR Endpoints

### `GET /api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token`

**Purpose:**  
List or return the authorized QR representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
qr.view

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { branchId: string; tableId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<QrTokenDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token`

**Purpose:**  
Replace or assign the selected QR configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
qr.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { branchId: string; tableId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`RotateQrTokenRequest`

**Response DTO:**  
`ApiSuccess<QrTokenDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/tables/{tableId}/qr-token`

**Purpose:**  
Delete or revoke the selected QR resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
qr.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { branchId: string; tableId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/branches/{branchId}/cashier-qr`

**Purpose:**  
List or return the authorized QR representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
qr.view

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CashierQrConfigDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/branches/{branchId}/cashier-qr`

**Purpose:**  
Replace or assign the selected QR configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
qr.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`CashierQrConfigDto`

**Response DTO:**  
`ApiSuccess<CashierQrConfigDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/customer/qr/{token}`

**Purpose:**  
Resolve an opaque table QR token into safe Tenant, Branch, and Table context.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { token: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`QrResolveResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
QR_TOKEN_INVALID, QR_TOKEN_REVOKED, TABLE_NOT_FOUND, BRANCH_INACTIVE, FEATURE_DISABLED, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 17. Public Customer Endpoints

Public responses exclude internal tenant IDs, employee data, permissions, costs, inventory, and audit data.

### `GET /api/v1/customer/menu`

**Purpose:**  
Resolve public context and return the complete bundled customer-menu payload.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` non-QR / `qrOrdering` QR

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { tenantId?: string; branchId?: string; contextToken?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`PublicMenuResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
PUBLIC_CONTEXT_INVALID, TENANT_NOT_FOUND, BRANCH_NOT_FOUND, BRANCH_INACTIVE, MENU_NOT_ASSIGNED, FEATURE_DISABLED, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/customer/products/{productId}`

**Purpose:**  
Return the authorized Public Customer representation.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` non-QR / `qrOrdering` QR

**Path Parameters:**

```ts
type PathParameters = { productId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { contextToken: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PublicProductDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
PUBLIC_CONTEXT_INVALID, PRODUCT_NOT_IN_MENU, PRODUCT_UNAVAILABLE, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/customer/offers`

**Purpose:**  
List or return the authorized Public Customer representation required by this route.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` non-QR / `qrOrdering` QR

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { contextToken: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PublicOfferDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
PUBLIC_CONTEXT_INVALID, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/customer/offers/{offerId}`

**Purpose:**  
Return the authorized Public Customer representation.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
`onlineMenu` non-QR / `qrOrdering` QR

**Path Parameters:**

```ts
type PathParameters = { offerId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { contextToken: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PublicOfferDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
PUBLIC_CONTEXT_INVALID, OFFER_NOT_FOUND, OFFER_INACTIVE, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/customer/orders`

**Purpose:**  
Create an idempotent public order using server-authoritative menu pricing.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public

**Feature:**  
Conditional by source/type

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`CustomerOrderRequest`

**Response DTO:**  
`CustomerOrderResponse`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
PUBLIC_CONTEXT_INVALID, FEATURE_DISABLED, MENU_NOT_ASSIGNED, PRODUCT_NOT_IN_MENU, PRODUCT_UNAVAILABLE, INVALID_MODIFIER_SELECTION, INSUFFICIENT_STOCK, COUPON_INVALID, PAYMENT_METHOD_DISABLED, RATE_LIMITED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes the applicable order lifecycle event.

### `GET /api/v1/customer/orders/{publicOrderToken}`

**Purpose:**  
Return the authorized Public Customer representation.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public order token

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { publicOrderToken: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PublicOrderDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
PUBLIC_ORDER_TOKEN_INVALID, ORDER_NOT_FOUND, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/customer/orders/{publicOrderToken}/payment-status`

**Purpose:**  
List or return the authorized Public Customer representation required by this route.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public order token

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { publicOrderToken: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<{ paymentStatus: PaymentStatus; updatedAt: string }>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
PUBLIC_ORDER_TOKEN_INVALID, ORDER_NOT_FOUND, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 18. POS / Checkout Endpoints

### `POST /api/v1/cafe/branches/{branchId}/checkout/quote`

**Purpose:**  
Calculate a non-persistent server-authoritative checkout quote.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`CheckoutQuoteRequest`

**Response DTO:**  
`ApiSuccess<CheckoutQuoteDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED, MENU_NOT_ASSIGNED, PRODUCT_NOT_IN_MENU, PRODUCT_UNAVAILABLE, INVALID_MODIFIER_SELECTION, INSUFFICIENT_STOCK

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes the applicable order lifecycle event.

### `POST /api/v1/cafe/branches/{branchId}/checkout`

**Purpose:**  
Create the POS order, payment, stock, loyalty, coupon, cash, audit, and notification effects atomically.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`PosCheckoutRequest`

**Response DTO:**  
`CheckoutResponse`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED, MENU_NOT_ASSIGNED, PRODUCT_NOT_IN_MENU, PRODUCT_UNAVAILABLE, INVALID_MODIFIER_SELECTION, INSUFFICIENT_STOCK

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes the applicable order lifecycle event.

## 19. Order Endpoints

`OrderDto.status` uses `OrderStatus`; `OrderDto.paymentStatus` uses `PaymentStatus`. Refund state never enters operational transition validation.

### `GET /api/v1/cafe/orders`

**Purpose:**  
List or return the authorized Order representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
orders.view or kitchen.view

**Feature:**  
orders or kitchen

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; branchId?: string; status?: OrderStatus; orderType?: OrderType; source?: OrderSource; paymentStatus?: PaymentStatus; customerId?: string; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<OrderDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/orders/{orderId}`

**Purpose:**  
Return the authorized Order representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
orders.view or kitchen.view

**Feature:**  
orders or kitchen

**Path Parameters:**

```ts
type PathParameters = { orderId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<OrderDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/orders/{orderId}/status`

**Purpose:**  
Validate and apply one operational OrderStatus transition.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
orders.update or kitchen.update

**Feature:**  
orders or kitchen

**Path Parameters:**

```ts
type PathParameters = { orderId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateOrderStatusRequest`

**Response DTO:**  
`ApiSuccess<OrderDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, ORDER_INVALID_STATUS_TRANSITION, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes the applicable order lifecycle event.

### `POST /api/v1/cafe/orders/{orderId}/cancellation`

**Purpose:**  
Cancel an order and restore eligible inventory atomically.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
orders.cancel

**Feature:**  
orders

**Path Parameters:**

```ts
type PathParameters = { orderId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`CancelOrderRequest`

**Response DTO:**  
`CancelOrderResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, ORDER_ALREADY_CANCELLED, ORDER_INVALID_STATUS_TRANSITION

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes the applicable order lifecycle event.

### `GET /api/v1/cafe/orders/{orderId}/print-data`

**Purpose:**  
Return the authorized Order representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
orders.print

**Feature:**  
orders

**Path Parameters:**

```ts
type PathParameters = { orderId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PrintDataDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 20. Payment Endpoints

### `GET /api/v1/cafe/payments`

**Purpose:**  
List or return the authorized Payment representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
payments.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; branchId?: string; method?: PaymentMethod; status?: PaymentStatus; orderId?: string; customerId?: string; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<PaymentDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/payments/{paymentId}`

**Purpose:**  
Return the authorized Payment representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
payments.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { paymentId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PaymentDetailsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/payment-intents`

**Purpose:**  
Create a Payment resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
Conditional payment method

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`CreatePaymentIntentRequest`

**Response DTO:**  
`ApiSuccess<PaymentIntentDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes payment/refund synchronization events.

### `POST /api/v1/cafe/payment-intents/{intentId}/confirm`

**Purpose:**  
Confirm the selected Payment operation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
orders.create

**Feature:**  
Conditional payment method

**Path Parameters:**

```ts
type PathParameters = { intentId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`ConfirmPaymentIntentRequest`

**Response DTO:**  
`ApiSuccess<PaymentIntentDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes payment/refund synchronization events.

### `GET /api/v1/cafe/payment-intents/{intentId}/status`

**Purpose:**  
Return the authorized Payment representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch/Public

**Permission:**  
Authenticated or public payment token

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { intentId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PaymentIntentDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 21. Refund Endpoints

### `GET /api/v1/cafe/refunds`

**Purpose:**  
List or return the authorized Refund representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
refunds.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; branchId?: string; paymentId?: string; orderId?: string; type?: RefundType; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<RefundDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/refunds/{refundId}`

**Purpose:**  
Return the authorized Refund representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
refunds.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { refundId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<RefundDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/payments/{paymentId}/refunds`

**Purpose:**  
Create a full or partial refund and update financial state atomically.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
refunds.create

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { paymentId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`CreateRefundRequest`

**Response DTO:**  
`RefundResponse`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED, REFUND_AMOUNT_EXCEEDED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes payment/refund synchronization events.

## 22. Cash Register Endpoints

### `GET /api/v1/cafe/branches/{branchId}/cash-register/summary`

**Purpose:**  
List or return the authorized Cash Register representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
cashRegister.view

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CashRegisterSummaryDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/branches/{branchId}/cash-transactions`

**Purpose:**  
List or return the authorized Cash Register representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
cashRegister.view

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; type?: CashTransactionType; shiftId?: string; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<CashTransactionDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/cash-transactions`

**Purpose:**  
Create a Cash Register resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
cashRegister.manage

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; type?: CashTransactionType; shiftId?: string; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
`CreateCashTransactionRequest`

**Response DTO:**  
`ApiSuccess<CashTransactionDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 23. Shift Endpoints

### `GET /api/v1/cafe/branches/{branchId}/shifts`

**Purpose:**  
List or return the authorized Shift representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
shifts.view

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; status?: ShiftStatus; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<ShiftDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/branches/{branchId}/shifts/current`

**Purpose:**  
List or return the authorized Shift representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
shifts.view

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ShiftDto | null>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/branches/{branchId}/shifts/{shiftId}`

**Purpose:**  
Return the authorized Shift representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
shifts.view

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string; shiftId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ShiftDetailsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/shifts`

**Purpose:**  
Create a Shift resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
shifts.open

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; status?: ShiftStatus; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
`OpenShiftRequest`

**Response DTO:**  
`ApiSuccess<ShiftDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED, SHIFT_ALREADY_OPEN

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes applicable shift events.

### `POST /api/v1/cafe/branches/{branchId}/shifts/{shiftId}/close`

**Purpose:**  
Close the selected Shift resource using server-calculated totals.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
shifts.close

**Feature:**  
pos

**Path Parameters:**

```ts
type PathParameters = { branchId: string; shiftId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`CloseShiftRequest`

**Response DTO:**  
`CloseShiftResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED, SHIFT_ALREADY_CLOSED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes applicable shift events.

## 24. Expense Endpoints

### `GET /api/v1/cafe/branches/{branchId}/expenses`

**Purpose:**  
List or return the authorized Expense representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
expenses.view

**Feature:**  
expenses

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; category?: string; paymentMethod?: PaymentAllocationMethod; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<ExpenseDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/expenses`

**Purpose:**  
Create a Expense resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
expenses.create

**Feature:**  
expenses

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; category?: string; paymentMethod?: PaymentAllocationMethod; employeeId?: string; from?: string; to?: string };
```

**Request DTO:**  
`CreateExpenseRequest`

**Response DTO:**  
`ApiSuccess<ExpenseDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/branches/{branchId}/expenses/{expenseId}`

**Purpose:**  
Return the authorized Expense representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
expenses.view

**Feature:**  
expenses

**Path Parameters:**

```ts
type PathParameters = { branchId: string; expenseId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ExpenseDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/expenses/{expenseId}`

**Purpose:**  
Partially update the selected Expense resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
expenses.update

**Feature:**  
expenses

**Path Parameters:**

```ts
type PathParameters = { branchId: string; expenseId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateExpenseRequest`

**Response DTO:**  
`ApiSuccess<ExpenseDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/expenses/{expenseId}`

**Purpose:**  
Delete or revoke the selected Expense resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
expenses.delete

**Feature:**  
expenses

**Path Parameters:**

```ts
type PathParameters = { branchId: string; expenseId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 25. Inventory Endpoints

### `GET /api/v1/cafe/branches/{branchId}/inventory`

**Purpose:**  
List or return the authorized Inventory representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; active?: boolean; lowStock?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<InventoryItemDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/inventory`

**Purpose:**  
Create a Inventory resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.create

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; active?: boolean; lowStock?: boolean };
```

**Request DTO:**  
`CreateInventoryItemRequest`

**Response DTO:**  
`ApiSuccess<InventoryItemDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

### `GET /api/v1/cafe/branches/{branchId}/inventory/{inventoryItemId}`

**Purpose:**  
Return the authorized Inventory representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string; inventoryItemId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<InventoryItemDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/inventory/{inventoryItemId}`

**Purpose:**  
Partially update the selected Inventory resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.adjust

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string; inventoryItemId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateInventoryItemRequest`

**Response DTO:**  
`ApiSuccess<InventoryItemDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

## 26. Stock Movement Endpoints

### `GET /api/v1/cafe/branches/{branchId}/stock-movements`

**Purpose:**  
List or return the authorized Stock Movement representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; inventoryItemId?: string; type?: StockMovementType; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<StockMovementDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 27. Stock Count Endpoints

### `GET /api/v1/cafe/branches/{branchId}/stock-counts`

**Purpose:**  
List or return the authorized Stock Count representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; status?: StockCountStatus; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<StockCountDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/stock-counts`

**Purpose:**  
Create a Stock Count resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.stockCount

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; status?: StockCountStatus; from?: string; to?: string };
```

**Request DTO:**  
`CreateStockCountRequest`

**Response DTO:**  
`ApiSuccess<StockCountDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

### `GET /api/v1/cafe/branches/{branchId}/stock-counts/{stockCountId}`

**Purpose:**  
Return the authorized Stock Count representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string; stockCountId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<StockCountDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/stock-counts/{stockCountId}/confirm`

**Purpose:**  
Confirm a stock count and create its adjustment movements.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.stockCount

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string; stockCountId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`ConfirmStockCountRequest`

**Response DTO:**  
`ConfirmStockCountResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED, STOCK_COUNT_ALREADY_CONFIRMED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

## 28. Waste Endpoints

### `GET /api/v1/cafe/branches/{branchId}/waste`

**Purpose:**  
List or return the authorized Waste representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.view

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; inventoryItemId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<WasteDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/waste`

**Purpose:**  
Create a Waste resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
inventory.waste

**Feature:**  
inventory

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; inventoryItemId?: string; from?: string; to?: string };
```

**Request DTO:**  
`CreateWasteRequest`

**Response DTO:**  
`CreateWasteResponse`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

## 29. Supplier Endpoints

### `GET /api/v1/cafe/suppliers`

**Purpose:**  
List or return the authorized Supplier representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
suppliers.view

**Feature:**  
suppliers

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; active?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<SupplierDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/suppliers`

**Purpose:**  
Create a Supplier resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
suppliers.manage

**Feature:**  
suppliers

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; active?: boolean };
```

**Request DTO:**  
`CreateSupplierRequest`

**Response DTO:**  
ApiSuccess<SupplierDto>

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/suppliers/{supplierId}`

**Purpose:**  
Return the authorized Supplier representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
suppliers.view

**Feature:**  
suppliers

**Path Parameters:**

```ts
type PathParameters = { supplierId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
ApiSuccess<SupplierDto>

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/suppliers/{supplierId}`

**Purpose:**  
Partially update the selected Supplier resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
suppliers.manage

**Feature:**  
suppliers

**Path Parameters:**

```ts
type PathParameters = { supplierId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateSupplierRequest`

**Response DTO:**  
ApiSuccess<SupplierDto>

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/suppliers/{supplierId}/status`

**Purpose:**  
Partially update the selected Supplier resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
suppliers.manage

**Feature:**  
suppliers

**Path Parameters:**

```ts
type PathParameters = { supplierId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`SupplierStatusRequest`

**Response DTO:**  
ApiSuccess<SupplierDto>

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 30. Purchase Endpoints

### `GET /api/v1/cafe/branches/{branchId}/purchases`

**Purpose:**  
List or return the authorized Purchase representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
purchases.view

**Feature:**  
purchases

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; supplierId?: string; status?: PurchaseStatus; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<PurchaseDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/purchases`

**Purpose:**  
Create a Purchase resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
purchases.create

**Feature:**  
purchases

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; supplierId?: string; status?: PurchaseStatus; from?: string; to?: string };
```

**Request DTO:**  
`CreatePurchaseRequest`

**Response DTO:**  
`ApiSuccess<PurchaseDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

### `GET /api/v1/cafe/branches/{branchId}/purchases/{purchaseId}`

**Purpose:**  
Return the authorized Purchase representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
purchases.view

**Feature:**  
purchases

**Path Parameters:**

```ts
type PathParameters = { branchId: string; purchaseId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PurchaseDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/purchases/{purchaseId}`

**Purpose:**  
Partially update the selected Purchase resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
purchases.update

**Feature:**  
purchases

**Path Parameters:**

```ts
type PathParameters = { branchId: string; purchaseId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdatePurchaseRequest`

**Response DTO:**  
`ApiSuccess<PurchaseDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

### `POST /api/v1/cafe/branches/{branchId}/purchases/{purchaseId}/receive`

**Purpose:**  
Receive a purchase and update quantities and weighted average costs.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
purchases.receive

**Feature:**  
purchases

**Path Parameters:**

```ts
type PathParameters = { branchId: string; purchaseId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`ReceivePurchaseRequest`

**Response DTO:**  
`ReceivePurchaseResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED, PURCHASE_ALREADY_RECEIVED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes inventory change events when stock changes.

## 31. Customer Endpoints

### `GET /api/v1/cafe/customers`

**Purpose:**  
List or return the authorized Customer representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; active?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<CustomerDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/customers`

**Purpose:**  
Create a Customer resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; active?: boolean };
```

**Request DTO:**  
`CreateCustomerRequest`

**Response DTO:**  
`ApiSuccess<CustomerDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/customers/{customerId}`

**Purpose:**  
Return the authorized Customer representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CustomerDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/customers/{customerId}`

**Purpose:**  
Partially update the selected Customer resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateCustomerRequest`

**Response DTO:**  
`ApiSuccess<CustomerDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/customers/{customerId}/analytics`

**Purpose:**  
Return the authorized Customer representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CustomerAnalyticsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 32. Customer Address Endpoints

### `GET /api/v1/cafe/customers/{customerId}/addresses`

**Purpose:**  
List or return the authorized Customer Address representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.view

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CustomerAddressDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/customers/{customerId}/addresses`

**Purpose:**  
Create a Customer Address resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`CreateCustomerAddressRequest`

**Response DTO:**  
`ApiSuccess<CustomerAddressDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/customers/{customerId}/addresses/{addressId}`

**Purpose:**  
Partially update the selected Customer Address resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { customerId: string; addressId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateCustomerAddressRequest`

**Response DTO:**  
`ApiSuccess<CustomerAddressDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/customers/{customerId}/addresses/{addressId}`

**Purpose:**  
Delete or revoke the selected Customer Address resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
customers.manage

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { customerId: string; addressId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 33. Loyalty Endpoints

### `GET /api/v1/cafe/loyalty/settings`

**Purpose:**  
List or return the authorized Loyalty representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
loyalty.view

**Feature:**  
loyalty

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<LoyaltySettingsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/loyalty/settings`

**Purpose:**  
Replace or assign the selected Loyalty configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
loyalty.manage

**Feature:**  
loyalty

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`UpdateLoyaltySettingsRequest`

**Response DTO:**  
`ApiSuccess<LoyaltySettingsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/customers/{customerId}/loyalty/balance`

**Purpose:**  
List or return the authorized Loyalty representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
loyalty.view

**Feature:**  
loyalty

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<LoyaltyBalanceDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/customers/{customerId}/loyalty/transactions`

**Purpose:**  
List or return the authorized Loyalty representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
loyalty.view

**Feature:**  
loyalty

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; type?: LoyaltyTransactionType; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<LoyaltyTransactionDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/customers/{customerId}/loyalty/adjustments`

**Purpose:**  
Create a Loyalty resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
loyalty.manage

**Feature:**  
loyalty

**Path Parameters:**

```ts
type PathParameters = { customerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`LoyaltyAdjustmentRequest`

**Response DTO:**  
`ApiSuccess<LoyaltyTransactionDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
Yes.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 34. Coupon Endpoints

### `GET /api/v1/cafe/coupons`

**Purpose:**  
List or return the authorized Coupon representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
loyalty

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; type?: CouponType; active?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<CouponDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/coupons`

**Purpose:**  
Create a Coupon resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
loyalty

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; type?: CouponType; active?: boolean };
```

**Request DTO:**  
`CreateCouponRequest`

**Response DTO:**  
`ApiSuccess<CouponDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/coupons/{couponId}`

**Purpose:**  
Return the authorized Coupon representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
loyalty

**Path Parameters:**

```ts
type PathParameters = { couponId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CouponDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/coupons/{couponId}`

**Purpose:**  
Partially update the selected Coupon resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
loyalty

**Path Parameters:**

```ts
type PathParameters = { couponId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateCouponRequest`

**Response DTO:**  
`ApiSuccess<CouponDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/coupons/{couponId}`

**Purpose:**  
Delete or revoke the selected Coupon resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
loyalty

**Path Parameters:**

```ts
type PathParameters = { couponId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/coupons/validate`

**Purpose:**  
Validate the supplied Coupon against the provisional cart.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
orders.create

**Feature:**  
loyalty

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`CouponValidateRequest`

**Response DTO:**  
`CouponValidateResponse`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 35. Offer Endpoints

### `GET /api/v1/cafe/offers`

**Purpose:**  
List or return the authorized Offer representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
onlineMenu

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; isActive?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<OfferDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/offers`

**Purpose:**  
Create a Offer resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
onlineMenu

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; isActive?: boolean };
```

**Request DTO:**  
`CreateOfferRequest`

**Response DTO:**  
`ApiSuccess<OfferDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/offers/{offerId}`

**Purpose:**  
Return the authorized Offer representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.view

**Feature:**  
onlineMenu

**Path Parameters:**

```ts
type PathParameters = { offerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<OfferDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/offers/{offerId}`

**Purpose:**  
Partially update the selected Offer resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
onlineMenu

**Path Parameters:**

```ts
type PathParameters = { offerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateOfferRequest`

**Response DTO:**  
`ApiSuccess<OfferDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/offers/{offerId}`

**Purpose:**  
Delete or revoke the selected Offer resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
coupons.manage

**Feature:**  
onlineMenu

**Path Parameters:**

```ts
type PathParameters = { offerId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 36. Delivery Zone Endpoints

### `GET /api/v1/cafe/branches/{branchId}/delivery-zones`

**Purpose:**  
List or return the authorized Delivery Zone representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
deliveryZones.view

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { active?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<DeliveryZoneDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/branches/{branchId}/delivery-zones`

**Purpose:**  
Create a Delivery Zone resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
deliveryZones.manage

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { active?: boolean };
```

**Request DTO:**  
`CreateDeliveryZoneRequest`

**Response DTO:**  
`ApiSuccess<DeliveryZoneDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, BRANCH_LIMIT_EXCEEDED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/delivery-zones/{zoneId}`

**Purpose:**  
Partially update the selected Delivery Zone resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
deliveryZones.manage

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { branchId: string; zoneId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateDeliveryZoneRequest`

**Response DTO:**  
`ApiSuccess<DeliveryZoneDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/branches/{branchId}/delivery-zones/{zoneId}`

**Purpose:**  
Delete or revoke the selected Delivery Zone resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
deliveryZones.manage

**Feature:**  
delivery

**Path Parameters:**

```ts
type PathParameters = { branchId: string; zoneId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 37. Waiter Request Endpoints

### `POST /api/v1/customer/waiter-requests`

**Purpose:**  
Create a Waiter Request resource.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Public QR context

**Feature:**  
qrOrdering

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; status?: WaiterRequestStatus; type?: WaiterRequestType; tableId?: string; from?: string; to?: string };
```

**Request DTO:**  
`CreateWaiterRequest`

**Response DTO:**  
`ApiSuccess<WaiterRequestDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
PUBLIC_CONTEXT_INVALID, QR_TOKEN_INVALID, TABLE_NOT_FOUND, WAITER_REQUESTS_DISABLED, FEATURE_DISABLED, RATE_LIMITED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes applicable waiter request events.

### `GET /api/v1/cafe/branches/{branchId}/waiter-requests`

**Purpose:**  
List or return the authorized Waiter Request representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
waiterRequests.view

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { branchId: string };
```

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; status?: WaiterRequestStatus; type?: WaiterRequestType; tableId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<WaiterRequestDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/branches/{branchId}/waiter-requests/{requestId}/status`

**Purpose:**  
Partially update the selected Waiter Request resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Branch

**Permission:**  
waiterRequests.manage

**Feature:**  
qrOrdering

**Path Parameters:**

```ts
type PathParameters = { branchId: string; requestId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateWaiterRequestStatusRequest`

**Response DTO:**  
`ApiSuccess<WaiterRequestDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes applicable waiter request events.

## 38. Kitchen API Usage

Kitchen consumes `GET /api/v1/cafe/orders` with branch/status filters and `PATCH /api/v1/cafe/orders/{orderId}/status`. A second Kitchen Order resource would duplicate the operational order state machine.

## 39. Notification Endpoints

### `GET /api/v1/cafe/notifications`

**Purpose:**  
List or return the authorized Notification representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; read?: boolean; type?: NotificationType; branchId?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<NotificationDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/notifications/unread-count`

**Purpose:**  
List or return the authorized Notification representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<UnreadCountDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/notifications/{notificationId}/read`

**Purpose:**  
Partially update the selected Notification resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { notificationId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`MarkNotificationReadRequest`

**Response DTO:**  
`ApiSuccess<NotificationDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes applicable notification events.

### `POST /api/v1/cafe/notifications/mark-all-read`

**Purpose:**  
Mark all notifications visible to the current employee as read.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
notifications.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<MarkAllNotificationsReadDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
Publishes applicable notification events.

## 40. Audit Log Endpoints

### `GET /api/v1/platform/audit-log`

**Purpose:**  
List or return the authorized Audit Log representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Platform

**Permission:**  
Platform operator

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; tenantId?: string; userId?: string; action?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<AuditEntryDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/audit-log`

**Purpose:**  
List or return the authorized Audit Log representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
audit.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; branchId?: string; userId?: string; module?: string; action?: string; entityType?: string; entityId?: string; from?: string; to?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<AuditEntryDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 41. Employee Endpoints

### `GET /api/v1/cafe/employees`

**Purpose:**  
List or return the authorized Employee representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
employees.view

**Feature:**  
employees

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; status?: EmployeeStatus; roleId?: string; branchId?: string };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<CafeEmployeeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/employees`

**Purpose:**  
Create a Employee resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
employees.create

**Feature:**  
employees

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; status?: EmployeeStatus; roleId?: string; branchId?: string };
```

**Request DTO:**  
`CreateEmployeeRequest`

**Response DTO:**  
`Paginated<CafeEmployeeDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/employees/{employeeId}`

**Purpose:**  
Return the authorized Employee representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
employees.view

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { employeeId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CafeEmployeeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/employees/{employeeId}`

**Purpose:**  
Partially update the selected Employee resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
employees.update

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { employeeId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateEmployeeRequest`

**Response DTO:**  
`ApiSuccess<CafeEmployeeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/employees/{employeeId}/status`

**Purpose:**  
Partially update the selected Employee resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
employees.suspend

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { employeeId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`EmployeeStatusRequest`

**Response DTO:**  
`ApiSuccess<CafeEmployeeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/employees/{employeeId}/role`

**Purpose:**  
Replace or assign the selected Employee configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
employees.update

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { employeeId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`EmployeeRoleRequest`

**Response DTO:**  
`ApiSuccess<CafeEmployeeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/employees/{employeeId}/branch-access`

**Purpose:**  
Replace or assign the selected Employee configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
employees.update

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { employeeId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`EmployeeBranchAccessRequest`

**Response DTO:**  
`ApiSuccess<CafeEmployeeDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 42. Role Endpoints

### `GET /api/v1/cafe/roles`

**Purpose:**  
List or return the authorized Role representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
roles.view

**Feature:**  
employees

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; systemRole?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`Paginated<CafeRoleDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/roles`

**Purpose:**  
Create a Role resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; systemRole?: boolean };
```

**Request DTO:**  
`CreateRoleRequest`

**Response DTO:**  
`Paginated<CafeRoleDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/roles/{roleId}`

**Purpose:**  
Return the authorized Role representation.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
roles.view

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { roleId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CafeRoleDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PATCH /api/v1/cafe/roles/{roleId}`

**Purpose:**  
Partially update the selected Role resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { roleId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`UpdateRoleRequest`

**Response DTO:**  
`ApiSuccess<CafeRoleDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `POST /api/v1/cafe/roles/{roleId}/duplicate`

**Purpose:**  
Duplicate the selected Role resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { roleId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`DuplicateRoleRequest`

**Response DTO:**  
`ApiSuccess<CafeRoleDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/roles/{roleId}`

**Purpose:**  
Delete or revoke the selected Role resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
roles.manage

**Feature:**  
employees

**Path Parameters:**

```ts
type PathParameters = { roleId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, ROLE_IN_USE

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 43. Permission Contract

### `GET /api/v1/cafe/permissions`

**Purpose:**  
List or return the authorized Permission representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
roles.view

**Feature:**  
employees

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PermissionDefinitionDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 44. Reports Endpoints

### `GET /api/v1/cafe/reports/sales`

**Purpose:**  
List or return the authorized Report representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { from?: string; to?: string; branchIds?: string[]; orderType?: OrderType; orderSource?: OrderSource; paymentMethod?: PaymentMethod };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<SalesReportDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/reports/profit`

**Purpose:**  
List or return the authorized Report representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { from?: string; to?: string; branchIds?: string[]; orderType?: OrderType; orderSource?: OrderSource; paymentMethod?: PaymentMethod };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ProfitReportDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/reports/products`

**Purpose:**  
List or return the authorized Report representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { from?: string; to?: string; branchIds?: string[]; orderType?: OrderType; orderSource?: OrderSource; paymentMethod?: PaymentMethod };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<ProductReportRowDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/reports/orders`

**Purpose:**  
List or return the authorized Report representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { from?: string; to?: string; branchIds?: string[]; orderType?: OrderType; orderSource?: OrderSource; paymentMethod?: PaymentMethod };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<OrderBreakdownReportDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/reports/payments`

**Purpose:**  
List or return the authorized Report representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { from?: string; to?: string; branchIds?: string[]; orderType?: OrderType; orderSource?: OrderSource; paymentMethod?: PaymentMethod };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<PaymentReportRowDto[]>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `GET /api/v1/cafe/reports/inventory`

**Purpose:**  
List or return the authorized Report representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant/Branch

**Permission:**  
reports.view

**Feature:**  
reports

**Path Parameters:**

None.

**Query Parameters:**

```ts
type QueryParameters = { page?: number; pageSize?: number; search?: string; active?: boolean; lowStock?: boolean };
```

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<InventoryReportDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED, BRANCH_ACCESS_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 45. Settings Endpoints

### `GET /api/v1/cafe/settings`

**Purpose:**  
List or return the authorized Settings representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
settings.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<CafeSettingsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/settings`

**Purpose:**  
Replace or assign the selected Settings configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
settings.edit

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`UpdateCafeSettingsRequest`

**Response DTO:**  
`ApiSuccess<CafeSettingsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 46. Menu Settings Endpoints

### `GET /api/v1/cafe/menu-settings`

**Purpose:**  
List or return the authorized Menu Settings representation required by this route.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
settings.view

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
`ApiSuccess<MenuSettingsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `PUT /api/v1/cafe/menu-settings`

**Purpose:**  
Replace or assign the selected Menu Settings configuration.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
settings.edit

**Feature:**  
—

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`UpdateMenuSettingsRequest`

**Response DTO:**  
`ApiSuccess<MenuSettingsDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, VERSION_CONFLICT

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 47. File Upload Endpoints

### `POST /api/v1/cafe/assets`

**Purpose:**  
Create a File Upload resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Purpose-specific write permission

**Feature:**  
Purpose-specific

**Path Parameters:**

None.

**Query Parameters:**

None.

**Request DTO:**  
`CafeAssetUploadRequest`

**Response DTO:**  
`ApiSuccess<AssetDto>`

**Success Status:**  
201

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

### `DELETE /api/v1/cafe/assets/{assetId}`

**Purpose:**  
Delete or revoke the selected File Upload resource.

**Authentication:**  
Bearer access token.

**Scope:**  
Tenant

**Permission:**  
Purpose-specific write permission

**Feature:**  
Purpose-specific

**Path Parameters:**

```ts
type PathParameters = { assetId: string };
```

**Query Parameters:**

None.

**Request DTO:**  
Empty body (`{}`).

**Response DTO:**  
Empty response body.

**Success Status:**  
204

**Important Validation / Machine-readable Errors:**  
AUTHENTICATION_REQUIRED, PERMISSION_DENIED, FEATURE_DISABLED

**Transaction Required?**  
No.

**Idempotency Required?**  
No.

**Realtime Impact:**  
None.

## 48. Payment Webhooks

### `POST /api/v1/webhooks/payments/{provider}`

**Purpose:**  
Verify and consume a deduplicated payment-provider event.

**Authentication:**  
Public/token-bound as stated.

**Scope:**  
Public

**Permission:**  
Verified provider signature

**Feature:**  
—

**Path Parameters:**

```ts
type PathParameters = { provider: string };
```

**Query Parameters:**

None.

**Request DTO:**  
`PaymentWebhookRequest`

**Response DTO:**  
`ApiSuccess<PaymentWebhookAcknowledgementDto>`

**Success Status:**  
200

**Important Validation / Machine-readable Errors:**  
WEBHOOK_SIGNATURE_INVALID, WEBHOOK_EVENT_INVALID, PAYMENT_INTENT_NOT_FOUND, PAYMENT_AMOUNT_MISMATCH

**Transaction Required?**  
Yes.

**Idempotency Required?**  
Yes — `Idempotency-Key`; payment webhook uses verified provider event ID.

**Realtime Impact:**  
Publishes payment/refund synchronization events.

## 49. WebSocket Events

| Event | Direction | Channel | Recipients | Payload |
|---|---|---|---|---|
| `order.created` | Server → client | `branch:{branchId}` | POS, kitchen, authorized admins | order ID/number/type/source/status/totals summary |
| `order.status_changed` | Server → client | branch and `public-order:{token}` | Staff and tracking customer | order reference, previous/next `OrderStatus`, timestamp |
| `order.cancelled` | Server → client | branch/public order | Staff and tracking customer | order reference, reason, timestamp |
| `order.payment_status_changed` | Server → client | branch/public order | Staff and tracking customer | `PaymentStatus`, timestamp |
| `payment.updated` | Server → client | branch | Payment viewers | payment ID, order ID, method, status, amount |
| `refund.created` | Server → client | branch | Refund/payment viewers | refund ID, payment ID, amount, remaining refundable |
| `inventory.changed` | Server → client | branch | Inventory viewers | item ID, movement type, delta, resulting quantity |
| `inventory.low_stock` | Server → client | branch | Inventory viewers | item ID, quantity, minimum stock |
| `inventory.out_of_stock` | Server → client | branch | Inventory viewers | item ID, quantity |
| `purchase.received` | Server → client | branch | Purchase/inventory viewers | purchase ID, movement IDs, inventory IDs |
| `stock_count.confirmed` | Server → client | branch | Inventory viewers | count ID and movement IDs |
| `waiter_request.created` | Server → client | branch | Waiter-request viewers | `WaiterRequestDto` summary |
| `waiter_request.status_changed` | Server → client | branch/QR context | Staff and requester | request ID/status/timestamps |
| `notification.created` | Server → client | `employee:{employeeId}` | Target employee | `NotificationDto` |
| `notification.read` | Server → client | employee | Employee sessions | notification ID and unread count |
| `shift.opened` | Server → client | branch | Shift/cash viewers | shift ID, employee ID, openedAt |
| `shift.closed` | Server → client | branch | Shift/cash viewers | shift ID and close summary |

## 50. Transaction Boundaries

Transactions are used only where endpoint cards say Yes. Atomic groups include tenant+owner creation, subscriptions/effective access, checkout, cancellation/restoration, refund/payment/cash updates, expense/cash updates, shift lifecycle, stock confirmation, waste, purchase receipt, address default switching, loyalty adjustments, and webhook processing.

## 51. Idempotency Matrix

| Endpoint class | Key scope |
|---|---|
| POS/public checkout | tenant/public context + branch + key |
| Payment intent create/confirm | tenant/intent + key |
| Refund | payment + key |
| Purchase receipt | purchase + key |
| Stock-count confirmation | stock count + key |
| Waste | branch + key |
| Shift open/close | employee + branch + key |
| Order cancellation | order + key |
| Subscription extension | tenant + key |
| Payment webhook | provider + provider event ID |

## 52. Permission Matrix

Permission values are the exact `PermissionKey` enum. Each endpoint card is authoritative for its required key; backend checks do not rely on hidden frontend routes.

## 53. Feature Matrix

Feature values are the exact `FeatureKey` enum. Internal Menu/MenuItem endpoints are ungated. Public menu reads require `onlineMenu` for non-QR context or `qrOrdering` for validated QR context. Dedicated reports require `reports`; customer-detail analytics does not.

## 54. Branch Scope Matrix

Branch routes validate `{branchId}` against tenant ownership and employee access. Tenant lists/reports intersect requested branch IDs with accessible branches. Public QR context is token-derived; public tracking is public-order-token-derived.

## 55. Rate Limiting Matrix

| Class | Limit key |
|---|---|
| Login/recovery | IP + login + tenant |
| Refresh | session + IP |
| Public menu/QR | IP + public context |
| Public order/payment | public context + IP + idempotency key |
| Authenticated reads | principal + tenant |
| Authenticated writes | principal + tenant |
| Uploads | tenant + size/count |
| Webhooks | provider + event ID + signature |

## 56. Backend Security Requirements

- Enforce tenant isolation, permissions, features, branch access, output projection, DTO allowlists, secure password hashing, token rotation, CSRF controls, file-content validation, webhook signatures, and audit redaction.
- Recalculate menu prices, modifiers, offers, coupon, tax, service, delivery, loyalty, payment and stock server-side.
- Public endpoints return only public DTOs.

## 57. Backend-Only Responsibilities

Authorization, scope resolution, price calculation, status transitions, inventory effects, transactions, idempotency, concurrency, subscription limits, audit creation, notification targeting, webhook normalization, and signed asset storage.

## 58. Frontend-Only Actions

- Fixed Penta-K attribution: https://penta-k.com/en.
- CSV generation where current datasets are suitable.
- Dialogs, navigation, local formatting, theme rendering, and QR visual rendering from a server token.

Penta-K attribution is a fixed Platform/product constant. No Tenant, Branding, Plan, or Asset DTO contains controls to hide, edit, replace, or remove it.

## 59. P0 Implementation Order

Authentication/scope → Platform core → Tenant/Branch/catalog/internal menus → public context/menu → checkout/orders/payments/refunds/webhook → employees/roles/settings.

## 60. P1 Implementation Order

Modifiers/recipes/tables/QR → inventory/purchases → cash/shifts/expenses → customers/loyalty/offers/delivery → waiter/notifications/reports/audit/assets/realtime.

## 61. P2 Implementation Order

Password recovery delivery integration, active-session listing, and remote session revocation.

## 62. Product Decisions Still Required

- Password-reset delivery provider and token lifetime.
- Concrete payment providers and provider-specific confirmation/webhook members.
- Expense binary attachment linkage.
- Whether supplier/purchase editing controls remain exposed.
- Whether recipe deletion remains visible or is represented by an empty recipe.
- Whether `advancedReports` changes backend datasets.

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

- Total: **200**
- GET: **89**
- POST: **50**
- PATCH: **29**
- PUT: **14**
- DELETE: **18**
- P0: **87**
- P1: **109**
- P2: **4**

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

**BACKEND HANDOFF STATUS: READY FOR IMPLEMENTATION**

