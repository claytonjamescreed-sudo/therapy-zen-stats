import { createContext, useContext, type ReactNode } from "react";
import type { Access } from "@/lib/auth.functions";

const AccessContext = createContext<Access | null>(null);

export function AccessProvider({ value, children }: { value: Access; children: ReactNode }) {
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used inside AccessProvider");
  return ctx;
}
