# P2 frontend QA notes

## Time and timezone

Dates are formatted centrally for Arabic UI through `src/lib/formatters.ts`. The current frontend displays persisted timestamps using the browser's safe local timezone behavior. Authoritative tenant-timezone conversion, daylight-saving rules, and server-side reporting boundaries remain a backend responsibility.

## Browser visual QA still required

The following breakpoints should be verified manually when a connected browser is available: 1920×1080, 1366×768, 1024px tablet, 768px, and a mobile viewport.

Highest-priority routes: POS, orders, order details, reports, platform branding editor, customer menu, product details, cart, employees/roles, and inventory details.

## Frontend-only limitations

- Online checkout, payment gateways, secure authentication, realtime notifications, and atomic writes remain intentionally unimplemented.
- QR output remains a visual frontend preview; no scannable/security claim is made.
- `/offers` is intentionally absent because current navigation only requires direct offer details.
- Frontend pagination exposes `page`, `pageSize`, `total`, and `totalPages` so API pagination can replace local slicing later.
