import { useEffect, useRef, useState } from "react";
import QuantityKeyboard from "../keyboards/QuantityKeyboard";
import type { QuantityValue } from "../keyboards/QuantityKeyboard";

type Unit = "г" | "кг" | "шт" | null;

function parseQuantity(v: string): { num: string; unit: Unit } {
  const m = v.match(/^([\d.]+)?\s*(г|кг|шт)?$/);
  return {
    num: m?.[1] ?? "",
    unit: (m?.[2] as Unit) ?? null,
  };
}

function formatQuantity(q: { num: string; unit: Unit }) {
  if (!q.num) return "";
  const num = q.num.replace(/\.$/, ""); // never allow trailing '.'
  if (!num) return "";
  return q.unit ? `${num}${q.unit}` : num;
}

interface Props {
  value: string;
  onCommit: (v: string) => void;
}

export default function QuantityField({ value, onCommit }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(() => parseQuantity(value));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputWidth, setInputWidth] = useState<number | null>(null);

  // sync external value
  useEffect(() => {
    setQ(parseQuantity(value));
  }, [value]);

  // click outside → close (capture phase so stopPropagation won't block it)
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return;
      const el = wrapperRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const qAsKeyboardValue: QuantityValue = {
    num: q.num,
    unit: q.unit,
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-block" }}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        readOnly
        value={formatQuantity(q)}
        style={qtyInput}
        onClick={(e) => {
          e.stopPropagation();
          if (inputRef.current) setInputWidth(inputRef.current.offsetWidth);
          setOpen(true);
        }}
      />

      {open && (
        <div
          style={{
            ...keyboardWrapper,
            width: inputWidth ?? "auto",
          }}
        >
          <QuantityKeyboard
            value={qAsKeyboardValue}
            onChange={(v) => setQ({ num: v.num, unit: v.unit })}
            onOk={() => {
              // Default unit if user entered only a number
              const q2 = q.num && !q.unit ? { ...q, unit: "шт" as Unit } : q;
              const v = formatQuantity(q2);
              if (v) onCommit(v);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

/* styles — мінімальні, не ламають layout */

const qtyInput: React.CSSProperties = {
  minWidth: 72,
  height: 36,
  padding: "4px 10px",
  textAlign: "center",
  fontSize: 16,
  fontWeight: 700,
  borderRadius: 10,
  border: "2px solid #d1d5db",
  cursor: "pointer",
  userSelect: "none",
  background: "#fff",
};

const keyboardWrapper: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: 6,
  zIndex: 1000,
};