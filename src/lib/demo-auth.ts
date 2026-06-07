import { useEffect, useMemo, useState } from "react";

export type DemoRole = "Admin" | "Academic Director" | "Registrar" | "Teacher" | "Student";

export type DemoUser = {
  id: string;
  name: string;
  role: DemoRole;
  initials: string;
  email: string;
  scope: string;
  landingPath: "/" | "/students" | "/academic-levels" | "/enrollment" | "/reports";
};

export const demoUsers: DemoUser[] = [
  {
    id: "admin",
    name: "Amina Hassan",
    role: "Admin",
    initials: "AH",
    email: "admin@scholaris.edu",
    scope: "Full school operations, RBAC, finance, audit",
    landingPath: "/",
  },
  {
    id: "academic-director",
    name: "Omar Farouk",
    role: "Academic Director",
    initials: "OF",
    email: "academic@scholaris.edu",
    scope: "Academic years, subjects, grade levels, teacher load",
    landingPath: "/academic-levels",
  },
  {
    id: "registrar",
    name: "Ana Reyes",
    role: "Registrar",
    initials: "AR",
    email: "registrar@scholaris.edu",
    scope: "Admissions, student registry, enrollment workflow",
    landingPath: "/enrollment",
  },
  {
    id: "teacher",
    name: "Laila Khan",
    role: "Teacher",
    initials: "LK",
    email: "teacher@scholaris.edu",
    scope: "Classes, attendance, gradebook, student alerts",
    landingPath: "/students",
  },
  {
    id: "student",
    name: "Yusuf Ahmed",
    role: "Student",
    initials: "YA",
    email: "student@scholaris.edu",
    scope: "Schedule, subjects, grades, attendance, invoices",
    landingPath: "/reports",
  },
];

const storageKey = "school-compass-demo-user";
const fallbackUser = demoUsers[2];

export function getStoredDemoUser(): DemoUser {
  if (typeof window === "undefined") return fallbackUser;

  const stored = window.localStorage.getItem(storageKey);
  return demoUsers.find((user) => user.id === stored) ?? fallbackUser;
}

export function setStoredDemoUser(userId: string) {
  window.localStorage.setItem(storageKey, userId);
  window.dispatchEvent(new Event("school-compass-demo-user-changed"));
}

export function useDemoUser() {
  const [userId, setUserId] = useState(fallbackUser.id);

  useEffect(() => {
    const sync = () => setUserId(getStoredDemoUser().id);
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("school-compass-demo-user-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("school-compass-demo-user-changed", sync);
    };
  }, []);

  return useMemo(() => demoUsers.find((user) => user.id === userId) ?? fallbackUser, [userId]);
}
