import { UserProfile } from "../types";

/**
 * Returns security and multi-tenant headers for reliable REST operations
 */
export const getHeaders = (currentUser: UserProfile | null) => {
  return {
    "Content-Type": "application/json",
    "x-company-id": currentUser?.tenantId || "tenant_acme",
    "x-user-role": currentUser?.role || "Employee",
    "x-user-id": currentUser?.id || "system"
  };
};
