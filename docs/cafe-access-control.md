# Cafe employee access control

The current implementation is a frontend-only UX simulation. It uses one Cafe
application, one `/admin/login` page, and one `/admin/dashboard`. Roles never
select a separate application; saved permissions determine visible navigation,
routes, widgets, and actions.

## Effective access

Effective Cafe access is the intersection of:

1. Tenant subscription feature entitlement.
2. Current employee role permissions.
3. Current employee branch access (`ALL` or `SELECTED`).

Employees and roles are stored per Tenant through the access-control repository.
An Employee is not duplicated per Branch. `BranchProvider` filters its branches
against the current Employee and replaces an invalid active Branch with the
first allowed active Branch.

The development login account selector is rendered only when
`NODE_ENV !== "production"`. Development credentials must be supplied through
explicit development-only environment configuration and are not authentication
or security for a production deployment.

## Future login response

The future backend should return a server-validated session contract containing
the user and Tenant identity, Employee status, Role, effective permissions, and
branch access:

```json
{
  "user": { "id": "user_id", "name": "Name", "employeeId": "employee_id" },
  "tenant": { "id": "tenant_id" },
  "employee": { "id": "employee_id", "name": "Name", "status": "ACTIVE" },
  "role": { "id": "role_id", "name": "Cashier" },
  "permissions": ["dashboard.view", "pos.use"],
  "branchAccess": { "mode": "SELECTED", "branchIds": ["branch_id"] }
}
```

## Mandatory backend enforcement

The backend must resolve the Employee inside the requested Tenant, reject
suspended Employees, calculate effective permissions, prevent self-escalation,
validate every protected endpoint and Branch-owned resource, prevent Cafe users
from Platform APIs, invalidate sessions after sensitive access changes, and
generate authoritative audit records server-side. Client-side hiding and route
gates must never be treated as production authorization.
