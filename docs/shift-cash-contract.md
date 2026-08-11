# Shift and cash contract

An open cash shift is owned by one employee in one tenant branch. Duplicate-open checks therefore use tenant, branch, employee, and `OPEN` status together.

Cash movements created during a shift carry the active `shiftId`. Closing a shift calculates expected cash from entries with that exact `shiftId`; entries from another shift, employee, or branch are excluded.

Expected cash is calculated by the centralized `calculateShiftExpectedCash` function:

`opening cash + cash sales + cash in + shift adjustments - cash out - expenses - cash refunds`

The close operation records expected cash, actual closing cash, and their difference. Production APIs must repeat ownership and branch authorization checks and close the shift atomically.
