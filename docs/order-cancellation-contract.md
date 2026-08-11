# Order cancellation and inventory contract

Checkout consumes recipe inventory once and records `inventoryConsumedAt` on the order when consumption occurred.

Inventory is restored only when an order is cancelled from `NEW` or `ACCEPTED`. Cancelling after preparation begins is a financial/order-state operation and does not add stock back automatically. Refunds never restore inventory.

Successful restoration records `inventoryRestoredAt` and `inventoryRestoredBy` on the order and creates an `ORDER_CANCELLATION_RESTORE` stock movement for every restored ingredient. The persisted restoration marker is checked before any mutation, making repeated cancellation/reversal attempts idempotent.

All restoration operations must match the active tenant and branch. Production persistence should enforce the restoration marker and stock changes atomically in one database transaction.
