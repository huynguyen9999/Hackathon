export function isAdminOpsAuthorized(request: Request): boolean {
  const token = process.env.ADMIN_OPS_TOKEN?.trim();
  if (!token) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${token}`) return true;

  const header = request.headers.get("x-admin-ops-token");
  return header === token;
}
