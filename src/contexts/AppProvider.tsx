"use client";

import { ReactNode } from "react";
import { LocaisProvider } from "./LocaisContext";
import { PlantoesProvider } from "./PlantoesContext";

// Provider global que combina todos os contextos
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <LocaisProvider>
      <PlantoesProvider>
        {children}
      </PlantoesProvider>
    </LocaisProvider>
  );
}
