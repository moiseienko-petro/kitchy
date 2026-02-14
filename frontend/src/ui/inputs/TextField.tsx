import { useRef, useState, useEffect } from "react";
import TouchKeyboard from "../keyboards/TouchKeyboard";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function TextField({
  value,
  onChange,
  placeholder
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [kbWidth, setKbWidth] = useState<number>();

  // sync keyboard width to input width
  useEffect(() => {
    if (inputRef.current) {
      setKbWidth(inputRef.current.offsetWidth);
    }
  }, [open]);

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", width: "100%" }}
    >
      <input
        ref={inputRef}
        readOnly
        value={value}
        placeholder={placeholder}
        onClick={() => setOpen(true)}
        style={inputStyle}
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: kbWidth,
            zIndex: 50,
            marginTop: 6
          }}
          onClick={e => e.stopPropagation()}
        >
          <TouchKeyboard
            value={value}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}


const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "8px 14px",
  fontSize: 18,
  borderRadius: 12,
  border: "2px solid #d1d5db",
  boxSizing: "border-box",
  cursor: "pointer",
  background: "#fff"
};