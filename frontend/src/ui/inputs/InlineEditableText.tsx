import { useEffect, useRef, useState } from "react";
import TouchKeyboard from "../keyboards/TouchKeyboard";

interface Props {
  value: string;
  onCommit: (v: string) => void;
  style?: React.CSSProperties;
}

export default function InlineEditableText({
  value,
  onCommit,
  style,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isCommitting, setIsCommitting] = useState(false);

  // 🔥 Sync only when NOT committing and NOT editing
  useEffect(() => {
    if (!open && !isCommitting) {
      setDraft(value);
    }
  }, [value, open, isCommitting]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        if (open) {
          closeAndCommit();
        }
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, draft]);

  function closeAndCommit() {
    setOpen(false);

    if (draft.trim() !== value.trim()) {
      setIsCommitting(true);

      Promise.resolve(onCommit(draft.trim())).finally(() => {
        setIsCommitting(false);
      });
    }
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        cursor: "pointer",
        ...style,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <span>{draft || "—"}</span>

        {open && (
          <span style={caretStyle} />
        )}
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 100,
            marginTop: 6,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TouchKeyboard
            value={draft}
            onChange={setDraft}
            onClose={closeAndCommit}
          />
        </div>
      )}
    </div>
  );
}

const caretStyle: React.CSSProperties = {
  width: 2,
  height: "1em",
  background: "#111",
  animation: "blink 1s steps(1) infinite",
};

/* Inject keyframes globally once */
const style = document.createElement("style");
style.innerHTML = `
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
`;
document.head.appendChild(style);