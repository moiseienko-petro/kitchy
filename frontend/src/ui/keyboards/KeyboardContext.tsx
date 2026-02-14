import React, { createContext, useContext, useState } from "react";

export type KeyboardOptions = {
  title?: string;
  initialValue?: string;
  placeholder?: string;
  mode?: "text" | "number" | "quantity";
  layout?: "EN" | "UA" | "AUTO";
  maxLen?: number;
};

type KeyboardRequest = {
  options: KeyboardOptions;
  resolve: (value: string | null) => void;
};

type KeyboardApi = {
  openKeyboard: (options: KeyboardOptions) => Promise<string | null>;
};

type KeyboardState = {
  request: KeyboardRequest | null;
  close: (value: string | null) => void;
};

const KeyboardApiContext = createContext<KeyboardApi | null>(null);
const KeyboardStateContext = createContext<KeyboardState | null>(null);

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<KeyboardRequest | null>(null);

  function openKeyboard(options: KeyboardOptions) {
    return new Promise<string | null>((resolve) => {
      setRequest({ options, resolve });
    });
  }

  function close(value: string | null) {
    if (request) {
      request.resolve(value);
      setRequest(null);
    }
  }

  return (
    <KeyboardApiContext.Provider value={{ openKeyboard }}>
      <KeyboardStateContext.Provider value={{ request, close }}>
        {children}
      </KeyboardStateContext.Provider>
    </KeyboardApiContext.Provider>
  );
}

export function useKeyboard() {
  const ctx = useContext(KeyboardApiContext);
  if (!ctx) throw new Error("useKeyboard must be used inside KeyboardProvider");
  return ctx;
}

export function useKeyboardState() {
  const ctx = useContext(KeyboardStateContext);
  if (!ctx) throw new Error("useKeyboardState must be used inside KeyboardProvider");
  return ctx;
}