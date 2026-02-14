import { createContext, useContext } from "react";
import type { OverlayActions } from "./overlayActions";

/**
 * Internal context.
 * Do NOT import OverlayActionContext directly.
 */
const OverlayActionContext = createContext<OverlayActions | null>(null);

export function OverlayActionProvider({
  actions,
  children
}: {
  actions: OverlayActions | null;
  children: React.ReactNode;
}) {
  return (
    <OverlayActionContext.Provider value={actions}>
      {children}
    </OverlayActionContext.Provider>
  );
}

export function useOverlayActions() {
  return useContext(OverlayActionContext);
}