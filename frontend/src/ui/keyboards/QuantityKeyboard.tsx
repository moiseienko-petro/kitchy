import { useTranslation } from "react-i18next";

type Unit = "g" | "kg" | "pcs" | null;

export interface QuantityValue {
  num: string; // numeric part only, e.g. "1", "1.5"
  unit: Unit;  // selected unit, e.g. "шт"
}

interface Props {
  value: QuantityValue;
  onChange: (v: QuantityValue) => void;
  onOk: () => void;
}

const DIGITS: string[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["0", ".", "⌫"],
];

const UNITS: Exclude<Unit, null>[] = ["g", "kg", "pcs"];

export default function QuantityKeyboard({ value, onChange, onOk }: Props) {

  const { t } = useTranslation();

  function addChar(ch: string) {
    if (ch === ".") {
      // Don't allow '.' as first char, don't allow second '.'
      if (!value.num || value.num.includes(".")) return;
      onChange({ ...value, num: value.num + "." });
      return;
    }

    // digit
    onChange({ ...value, num: value.num + ch });
  }

  function backspace() {
    if (!value.num) {
      // already empty -> keep empty (do not keep unit without number)
      onChange({ num: "", unit: null });
      return;
    }

    const next = value.num.slice(0, -1);
    if (!next) {
      onChange({ num: "", unit: null });
    } else {
      onChange({ ...value, num: next });
    }
  }

  function setUnit(u: Exclude<Unit, null>) {
    if (!value.num) return; // unit only makes sense with a number
    onChange({ ...value, unit: u });
  }

  return (
    <div style={kb} onClick={(e) => e.stopPropagation()}>
      <div style={unitRow}>
        {UNITS.map((u) => (
          <button
            key={t(`units.${u}`)}
            type="button"
            style={unitBtn}
            onClick={() => setUnit(u)}
          >
            {t(`units.${u}`)}
          </button>
        ))}
      </div>

      {DIGITS.map((row, i) => (
        <div key={i} style={rowStyle}>
          {row.map((k) => (
            <button
              key={k}
              type="button"
              style={keyBtn}
              onClick={() => (k === "⌫" ? backspace() : addChar(k))}
            >
              {k}
            </button>
          ))}
        </div>
      ))}

      <button type="button" style={okBtn} onClick={onOk}>
        OK
      </button>
    </div>
  );
}

/* styles */

const kb: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#fff",
  padding: 10,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
};

const unitRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 8,
};

const unitBtn: React.CSSProperties = {
  flex: 1,
  padding: 8,
  fontWeight: 800,
  fontSize: 16,
  background: "rgb(210, 105, 30)"
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  marginBottom: 6,
};

const keyBtn: React.CSSProperties = {
  flex: 1,
  padding: 12,
  fontSize: 18,
  fontWeight: 800,
};

const okBtn: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  background: "#16a34a",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  borderRadius: 10,
  border: "none",
};