import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
};

type Lang = "uk" | "en";

const layout = {
  en: [
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["shift","z","x","c","v","b","n","m","back"],
    ["lang","space","ok"]
  ],
  uk: [
    ["й","ц","у","к","е","н","г","ш","щ","з","х","ї"],
    ["ф","і","в","а","п","р","о","л","д","ж","є","ʼ"],
    ["shift","я","ч","с","м","и","т","ь","б","ю","back"],
    ["lang","space","ok"]
  ]
};

export default function TouchKeyboard({
  value,
  onChange,
  onClose
}: Props) {
  const { i18n } = useTranslation();
  const initialLang = (i18n.language.split("-")[0] as Lang) || "uk";  
  const [lang, setLang] = useState<Lang>(initialLang);
  const [shift, setShift] = useState(false);

  function press(key: string) {
    if (key === "shift") {
      setShift(s => !s);
      return;
    }

    if (key === "lang") {
      setLang(l => (l === "uk" ? "en" : "uk"));
      return;
    }

    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === "space") {
      onChange(value + " ");
      return;
    }

    if (key === "ok") {
      onClose();
      return;
    }

    const char = shift ? key.toUpperCase() : key;
    onChange(value + char);

    if (shift) {
      setShift(false);
    }
  }

  return (
    <div style={keyboard}>
      {layout[lang].map((row, i) => (
        <div key={i} style={rowStyle}>
          {row.map(k => (
            <button
              key={k}
              style={{
                ...keyStyle,
                ...(k === "shift" && shift ? shiftActive : {}),
                ...(k === "shift" && !shift ? shiftKey : {}),
                ...(k === "back" ? backKey : {}),
                ...(k === "ok" ? okKey : {}),
                ...(k === "space" ? spaceKey : {})
              }}
              onClick={() => press(k)}
            >
              {label(k, lang, shift)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- helpers ---------- */

function label(key: string, lang: Lang, shift: boolean) {
  switch (key) {
    case "shift": return "⇧";
    case "back": return "⌫";
    case "space": return "␣";
    case "lang": return lang === "uk" ? "EN" : "UA";
    case "ok": return "OK";
    default: return applyShift(key, shift);
  }
}

  function applyShift(char: string, shift:boolean) {
    if (!shift) return char;
    return char.length === 1 ? char.toUpperCase() : char;
}

/* ---------- styles ---------- */

const keyboard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.92)",   // ✅ білий + напівпрозорий
  backdropFilter: "blur(6px)",              // ✅ приємний ефект (можна прибрати)
  borderRadius: 16,
  padding: 10,
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 32px rgba(0,0,0,0.25)"
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 8,
  justifyContent: "center"
};

const keyStyle: React.CSSProperties = {
  minWidth: 46,
  height: 46,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: 20,
  fontWeight: 800,
  cursor: "pointer"
};

/* special keys */

const shiftKey: React.CSSProperties = {
  background: "#e5e7eb"
};

const shiftActive: React.CSSProperties = {
  background: "#2563eb",
  color: "#ffffff"
};

const backKey: React.CSSProperties = {
  background: "#dc2626",
  color: "#ffffff"
};

const okKey: React.CSSProperties = {
  background: "#16a34a",
  color: "#ffffff",
  minWidth: 70
};

const spaceKey: React.CSSProperties = {
  minWidth: 180,
  background: "#e5e7eb"
};