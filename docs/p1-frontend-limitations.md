# P1 frontend-only boundaries

The P1 implementation deliberately keeps the existing UI → Service → Repository → tenant/branch browser storage architecture.

The following require a future backend and are not represented as secure or atomic operations in this frontend build:

- Real card, wallet, and online payment gateway processing.
- Real card/wallet refunds and atomic refund transactions.
- Atomic shift closing and cash/expense operations.
- Immutable, server-owned audit history.
- Server authorization and tenant/branch ownership enforcement.
- Realtime notifications and WebSocket/KDS synchronization.
- Customer authentication.
- Coupon and loyalty anti-abuse enforcement.
- Production file storage and server-generated PDF documents.

Browser printing and CSV download are frontend capabilities. Online order submission and online payment are visibly disabled in the customer cart until a backend can confirm them safely.
