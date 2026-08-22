export type AccountRole = "admin" | "customer" | null | undefined;

export function accountDestinationForRole(role: AccountRole) {
  return role === "admin" ? "/admin" : "/perfil";
}
