import { useEffect } from "react";
import type { OverlayActions } from "../ui/overlayActions";

interface Handlers {
  overlayActions: OverlayActions | null;

  onHome: () => void;
  onQuickTimer: () => void;
  onShopping: () => void;
}

export function useHardwareKeys(h: Handlers) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const oa = h.overlayActions;

      switch (e.key) {
        case "h":
          h.onHome();
          break;

        case "t":
          h.onQuickTimer();
          break;

        case "s":
          h.onShopping();
          break;

        case "ArrowLeft":
          oa?.onLeft?.();
          break;

        case "ArrowRight":
          oa?.onRight?.();
          break;

        case "Enter":
          oa?.onOk?.();
          break;

        case "Escape":
          oa?.onCancel?.() ?? h.onHome();
          break;

        default:
          return;
      }

      e.preventDefault();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [h]);
}