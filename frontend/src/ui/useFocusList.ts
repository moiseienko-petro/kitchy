import { useState } from "react";

export function useFocusList<T>(items: T[]) {
  const [index, setIndex] = useState(0);

  function next() {
    setIndex(i => (i + 1) % items.length);
  }

  function prev() {
    setIndex(i => (i - 1 + items.length) % items.length);
  }

  function reset() {
    setIndex(0);
  }

  return {
    index,
    setIndex,
    next,
    prev,
    reset
  };
}