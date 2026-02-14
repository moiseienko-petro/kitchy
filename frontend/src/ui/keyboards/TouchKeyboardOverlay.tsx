import React, { useEffect, useMemo, useState } from "react";

export type KeyboardMode = "text" | "number";
export type KeyboardLayout = "EN" | "UA" | "AUTO";

type Props = {
  title?: string;
  initialValue: string;
  placeholder?: string;
  mode: KeyboardMode;
  layout: KeyboardLayout;
  maxLen?: number;
  onCancel: () => void;
  onSubmit: (value: string) => void;
};

type KeyDef =
  | { t: string; v?: string; w?: number; action?: "backspace" | "space" | "enter" | "caps" | "clear" | "lang" };

const EN_ROWS: KeyDef[][] = [
  [{ t: "q" }, { t: "w" }, { t: "e" }, { t: "r" }, { t: "t" }, { t: "y" }, { t: "u" }, { t: "i" }, { t: "o" }, { t: "p" }],
  [{ t: "a" }, { t: "s" }, { t: "d" }, { t: "f" }, { t: "g" }, { t: "h" }, { t: "j" }, { t: "k" }, { t: "l" }],
  [{ t: "Caps", action: "caps", w: 1.4 }, { t: "z" }, { t: "x" }, { t: "c" }, { t: "v" }, { t: "b" }, { t: "n" }, { t: "m" }, { t: "⌫", action: "backspace", w: 1.4 }],
  [{ t: "UA/EN", action: "lang", w: 1.4 }, { t: "Space", action: "space", w: 4 }, { t: "Clear", action: "clear", w: 1.4 }, { t: "Enter", action: "enter", w: 1.8 }]
];

const UA_ROWS: KeyDef[][] = [
  [{ t: "й" }, { t: "ц" }, { t: "у" }, { t: "к" }, { t: "е" }, { t: "н" }, { t: "г" }, { t: "ш" }, { t: "щ" }, { t: "з" }],
  [{ t: "ф" }, { t: "і" }, { t: "в" }, { t: "а" }, { t: "п" }, { t: "р" }, { t: "о" }, { t: "л" }, { t: "д" }],
  [{ t: "Caps", action: "caps", w: 1.4 }, { t: "я" }, { t: "ч" }, { t: "с" }, { t: "м" }, { t: "и" }, { t: "т" }, { t: "ь" }, { t: "⌫", action: "backspace", w: 1.4 }],
  [{ t: "UA/EN", action: "lang", w: 1.4 }, { t: "Space", action: "space", w: 4 }, { t: "Clear", action: "clear", w: 1.4 }, { t: "Enter", action: "enter", w: 1.8 }]
];

const NUM_ROWS: KeyDef[][] = [
  [{ t: "1" }, { t: "2" }, { t: "3" }, { t: "⌫", action: "backspace", w: 1.5 }],
  [{ t: "4" }, { t: "5" }, { t: "6" }, { t: "Clear", action: "clear", w: 1.5 }],
  [{ t: "7" }, { t: "8" }, { t: "9" }, { t: "Enter", action: "enter", w: 1.5 }],
  [{ t: "0", w: 2 }, { t: ".", }, { t: "Space", action: "space", w: 1.5 }]
];

function isCyrillicText(s: string) {
  return /[а-яА-ЯіІїЇєЄґҐ]/.test(s);
}

export default function TouchKeyboardOverlay({
  title,
  initialValue,
  placeholder,
  mode,
  layout,
  maxLen,
  onCancel,
  onSubmit
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [caps, setCaps] = useState(false);

  const [activeLayout, setActiveLayout] = useState<"EN" | "UA">(() => {
    if (layout === "EN" || layout === "UA") return layout;
    return isCyrillicText(initialValue) ? "UA" : "EN";
  });

  useEffect(() => setValue(initialValue), [initialValue]);

  const rows = useMemo(() => {
    if (mode === "number") return NUM_ROWS;
    return activeLayout === "UA" ? UA_ROWS : EN_ROWS;
  }, [mode, activeLayout]);

  function appendChar(ch: string) {
    if (maxLen && value.length >= maxLen) return;
    const out = caps ? ch.toUpperCase() : ch;
    setValue((v) => v + out);
  }

  function backspace() {
    setValue((v) => v.slice(0, -1));
  }

  function clear() {
    setValue("");
  }

  function space() {
    if (maxLen && value.length >= maxLen) return;
    setValue((v) => v + " ");
  }

  function enter() {
    onSubmit(value.trim());
  }

  function toggleLang() {
    setActiveLayout((l) => (l === "EN" ? "UA" : "EN"));
  }

  function handleKey(k: KeyDef) {
    if (k.action) {
      switch (k.action) {
        case "backspace": backspace(); return;
        case "space": space(); return;
        case "enter": enter(); return;
        case "caps": setCaps((c) => !c); return;
        case "clear": clear(); return;
        case "lang": toggleLang(); return;
      }
    }
    appendChar(k.v ?? k.t);
  }

  // ESC закриває, Enter сабмітить (зручно для деву на Mac)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") enter();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [value]);

  return (
    <div style={backdrop} onClick={onCancel}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={topBar}>
          <div style={{ fontWeight: 700 }}>{title ?? "Keyboard"}</div>
          <button style={closeBtn} onClick={onCancel}>✕</button>
        </div>

        <input
          style={previewInput}
          value={value}
          placeholder={placeholder ?? ""}
          readOnly
        />

        <div style={kbd}>
          {rows.map((r, idx) => (
            <div key={idx} style={row}>
              {r.map((k, j) => (
                <button
                  key={j}
                  style={{
                    ...keyBtn,
                    flex: k.w ?? 1,
                    ...(k.action === "enter" ? keyEnter : null),
                    ...(k.action === "backspace" ? keyFn : null),
                    ...(k.action === "caps" ? (caps ? keyActive : keyFn) : null),
                    ...(k.action === "lang" ? keyFn : null),
                    ...(k.action === "clear" ? keyFn : null),
                    ...(k.action === "space" ? keySpace : null)
                  }}
                  onClick={() => handleKey(k)}
                >
                  {k.t}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={bottomBar}>
          <button style={btnCancel} onClick={onCancel}>Cancel</button>
          <button style={btnOk} onClick={() => onSubmit(value.trim())}>OK</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 2000,
  padding: 12,
  boxSizing: "border-box"
};

const panel: React.CSSProperties = {
  width: "min(980px, 100%)",
  background: "#fff",
  borderRadius: 18,
  padding: 12,
  boxSizing: "border-box"
};

const topBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "6px 6px 10px 6px"
};

const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  color: "#eb5757"
};

const previewInput: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 12,
  border: "2px solid #333",
  padding: "10px 12px",
  fontSize: 20,
  fontWeight: 700,
  color: "#111",
  boxSizing: "border-box",
  marginBottom: 10
};

const kbd: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 8
};

const keyBtn: React.CSSProperties = {
  height: 56,
  borderRadius: 14,
  border: "2px solid #444",
  background: "#ffffff",
  fontSize: 20,
  fontWeight: 700,
  color: "#111",
  cursor: "pointer",
  userSelect: "none",
  boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
};

const keyFn: React.CSSProperties = {
  background: "#e5e7eb",   // світло-сірий, але контрастний
  color: "#111",
  fontWeight: 800,
  borderColor: "#333"
};

const keyActive: React.CSSProperties = {
  background: "#2563eb",   // насичений синій
  borderColor: "#1e40af",
  color: "#fff",
  fontWeight: 900
};

const keyEnter: React.CSSProperties = {
  background: "#16a34a",   // зелений “OK”
  borderColor: "#15803d",
  color: "#fff",
  fontWeight: 900,
  boxShadow: "0 0 0 2px rgba(22,163,74,0.4)"
};

const keySpace: React.CSSProperties = {
  background: "#f3f4f6",
  borderColor: "#555",
  color: "#111",
  fontWeight: 700
};

const bottomBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 12
};

const btnCancel: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer"
};

const btnOk: React.CSSProperties = {
  height: 44,
  padding: "0 16px",
  borderRadius: 12,
  border: "none",
  background: "#2f80ed",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800
};