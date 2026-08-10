# Brand asset storage

Tenant brand images are selected through `BrandAssetUpload` and processed by
`brandAssetService`. Pages never read files or write browser storage directly.

## Current frontend-only flow

1. The service validates MIME type and size.
2. It serializes the image as a Data URL for the development environment.
3. The editor keeps that value in temporary React state for live previews.
4. Saving sends the updated `TenantBranding` through `tenantService` to the
   tenant repository. Cancelling/resetting restores the repository value.

Data URLs in local storage are a development-only representation. They are not
intended for production file storage. Current limits are centralized in
`src/services/brand-asset.service.ts`: 2 MB for logos, 1 MB for favicons, and
5 MB for login backgrounds. Arbitrary SVG uploads are intentionally rejected.

## Future backend contract

The service implementation can later upload `multipart/form-data` to:

```text
POST /platform/tenants/:tenantId/assets
```

The response should be an asset reference:

```json
{
  "id": "asset_id",
  "url": "https://cdn.example.com/tenant/asset.webp",
  "type": "logo"
}
```

`TenantBranding` would then persist the returned URL/reference. The upload UI
and editor state flow do not need to change; only `brandAssetService` and the
repository transport need production implementations.
