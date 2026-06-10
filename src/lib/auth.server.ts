// Server-only authentication utilities.
// The .server.ts suffix ensures this never ships to the client bundle.

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { getCookie, setCookie, deleteCookie } from "vinxi/http";
import { hasDatabase, queryOne } from "./db.server";
import type { AuthUser, UserRole } from "./auth-types";

export type { AuthUser, UserRole };

// ── Constants ────────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "scholaris_session";

// ── Internal helpers ─────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn(
      "[auth] JWT_SECRET env var not set — using dev fallback. Set it in Coolify for production!"
    );
  }
  return new TextEncoder().encode(
    secret ?? "scholaris-dev-secret-please-set-jwt-secret-in-production"
  );
}

function buildInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Password hashing ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ──────────────────────────────────────────────────────────────────────

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

// ── Cookie session management ─────────────────────────────────────────────────

export async function getSessionFromCookie(): Promise<AuthUser | null> {
  try {
    const token = getCookie(SESSION_COOKIE);
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: AuthUser): Promise<void> {
  const token = await signToken(user);
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

// ── Database login ────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser } | { error: string }> {
  if (!hasDatabase()) {
    return {
      error: "Database not configured. Contact your administrator.",
    };
  }

  try {
    const row = await queryOne<{
      id: string;
      email: string;
      name: string;
      role: UserRole;
      password_hash: string;
      is_active: boolean;
    }>(
      `SELECT id, email, name, role, password_hash, is_active
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (!row) return { error: "Invalid email or password" };
    if (!row.is_active)
      return { error: "Account is disabled. Contact your administrator." };

    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) return { error: "Invalid email or password" };

    const user: AuthUser = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      initials: buildInitials(row.name),
    };

    return { user };
  } catch (err) {
    console.error("[auth] loginUser error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
