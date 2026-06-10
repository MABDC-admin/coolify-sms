// Shared auth types — safe to import on client and server.
// No runtime dependencies, just TypeScript types.

export type UserRole =
  | "Admin"
  | "Academic Director"
  | "Registrar"
  | "Teacher"
  | "Finance"
  | "Student";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  initials: string;
};
