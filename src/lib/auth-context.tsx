import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser } from "./auth-types";

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: AuthUser | null;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

/** Use inside any authenticated route/component. Throws if no session. */
export function useAuthUser(): AuthUser {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error("useAuthUser must be called within an authenticated context");
  }
  return user;
}

/** Use in components that may render on the login page too. */
export function useOptionalAuthUser(): AuthUser | null {
  return useContext(AuthContext);
}
