export type Role = "editor" | "publisher" | "public";

export function roleFromRequest(request: Request): Role | null {
  const apiKey = process.env.ANIMBRIO_API_KEY;
  const publishKey = process.env.ANIMBRIO_PUBLISH_KEY ?? apiKey;
  const header = request.headers.get("x-animbrio-key");
  const roleHeader = request.headers.get("x-animbrio-role");
  if (!apiKey) {
    if (roleHeader === "publisher") return "publisher";
    if (roleHeader === "public") return "public";
    return "editor";
  }
  if (header && header === publishKey && roleHeader === "publisher") return "publisher";
  if (header && header === apiKey) return "editor";
  return null;
}

export function assertRole(request: Request, allowed: Role[]): boolean {
  const role = roleFromRequest(request);
  if (!role) return false;
  return allowed.includes(role);
}
