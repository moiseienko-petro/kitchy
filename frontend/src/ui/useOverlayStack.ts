import { useState } from "react";
import type { Overlay } from "./overlay";

export function useOverlayStack() {
  const [stack, setStack] = useState<Overlay[]>([]);

  function push(overlay: Overlay) {
    setStack(prev => [...prev, overlay]);
  }

  function pop() {
    setStack(prev => prev.slice(0, -1));
  }

  function clear() {
    setStack([]);
  }

  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  return {
    stack,
    top,
    push,
    pop,
    clear
  };
}