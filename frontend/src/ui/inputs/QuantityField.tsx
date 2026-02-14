import { useEffect, useRef, useState } from "react";
import QuantityKeyboard from "../keyboards/QuantityKeyboard";
import type { QuantityValue } from "../keyboards/QuantityKeyboard";
import { useTranslation } from "react-i18next";

type Unit = "g" | "kg" | "pcs" | null;

interface Props {
  value: string;
  onCommit: (v: string) => void;
}

export default function QuantityField({ value, onCommit }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [inputWidth, setInputWidth] = useState<number | null>(null);

  const { t } = useTranslation();

  /* ----------------------------
     INTERNAL STATE
  ----------------------------- */

  const [q, setQ] = useState(() => parseQuantity(value));
  const qRef = useRef(q);

  useEffect(() => {
    qRef.current = q;
  }, [q]);

  useEffect(() => {
    setQ(parseQuantity(value));
  }, [value]);

  /* ----------------------------
     OUTSIDE CLICK HANDLER
  ----------------------------- */

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return;

      const el = wrapperRef.current;
      if (el && !el.contains(e.target as Node)) {
        commitAndClose();
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  /* ----------------------------
     HELPERS
  ----------------------------- */

  function parseQuantity(v: string): { num: string; unit: Unit } {
    const m = v.match(/^([\d.]+)?\s*(г|кг|шт|g|kg|pcs)?$/);

    return {
      num: m?.[1] ?? "",
      unit: normalizeUnit(m?.[2] ?? null),
    };
  }

  function normalizeUnit(u: string | null): Unit {
    if (!u) return null;

    const map: Record<string, Unit> = {
      г: "g",
      кг: "kg",
      шт: "pcs",
      g: "g",
      kg: "kg",
      pcs: "pcs",
    };

    return map[u] ?? null;
  }

  function formatQuantity(q: { num: string; unit: Unit }) {
    if (!q.num) return "";

    const num = q.num.replace(/\.$/, "");
    if (!num) return "";

    if (!q.unit) return num;

    return `${num}${t(`units.${q.unit}`)}`;
  }

  function commitAndClose() {
    const current = qRef.current;

    const q2 =
      current.num && !current.unit
        ? { ...current, unit: "pcs" as Unit }
        : current;

    const formatted = formatQuantity(q2);

    onCommit(formatted || "");
    setOpen(false);
  }

  /* ----------------------------
     RENDER
  ----------------------------- */

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
          if (inputRef.current) {
            setInputWidth(inputRef.current.offsetWidth);
          }
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
            onChange={(v) => setQ(v)}
            onOk={commitAndClose}
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