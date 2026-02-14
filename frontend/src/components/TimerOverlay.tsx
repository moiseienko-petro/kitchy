import { useEffect, useState } from "react";
import { createTimer } from "../api/timers";
import { formatSeconds } from "../utils/time";
import { useFocusList } from "../ui/useFocusList";
import type { OverlayActions } from "../ui/overlayActions";
import TextField from "../ui/inputs/TextField";
import { TimerIcon } from "../ui/icons";

import { useTranslation } from "react-i18next";


interface Props {
  onClose: () => void;
  onStarted: () => void;
  registerActions: (a: OverlayActions) => void;
  unregisterActions: () => void;
}

export default function TimerOverlay({
  onClose,
  onStarted,
  registerActions,
  unregisterActions,
}: Props) {
  const [seconds, setSeconds] = useState(300);
  const [name, setName] = useState("");

  const focus = useFocusList(["minus5", "minus1", "plus1", "plus5", "start"]);
  const { t } = useTranslation();

  function add(delta: number) {
    setSeconds((prev) => Math.max(0, prev + delta));
  }

  async function start() {
    if (seconds <= 0) return;
    await createTimer(seconds, name.trim() || t("defaultTimerName"));
    onStarted();
  }

  useEffect(() => {
    registerActions({
      onLeft: focus.prev,
      onRight: focus.next,
      onOk: () => {
        switch (focus.index) {
          case 0:
            add(-300);
            break;
          case 1:
            add(-60);
            break;
          case 2:
            add(-30);
            break;
          case 3:
            add(30);
            break;
          case 4:
            add(60);
            break;
          case 5:
            add(300);
            break;
          case 6:
            start();
            break;
        }
      },
      onCancel: onClose,
    });

    return unregisterActions;
  }, [focus.index, seconds, name]);

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <h2 style={title}>
          <div style={titleRow}>
            <TimerIcon size={32}/>
            {t("timerTitle")}
          </div>
        </h2>  
        <div style={inputText}>
          <TextField
            value={name}
            onChange={setName}
            placeholder={t("timerNamePlaceholder")}
          />
        </div>

        <div style={time}>{formatSeconds(seconds)}</div>

        <div style={row}>
          <button
            className={`focusable ${focus.index === 0 ? "focused" : ""}`}
            style={{ ...btn, ...minus }}
            onClick={() => add(-300)}
          >
            −5
          </button>

          <button
            className={`focusable ${focus.index === 1 ? "focused" : ""}`}
            style={{ ...btn, ...minus }}
            onClick={() => add(-60)}
          >
            −1
          </button>

          <button
            className={`focusable ${focus.index === 2 ? "focused" : ""}`}
            style={{ ...btn, ...minus }}
            onClick={() => add(-30)}
          >
            −0.5
          </button>

          <button
            className={`focusable ${focus.index === 2 ? "focused" : ""}`}
            style={{ ...btn, ...plus }}
            onClick={() => add(30)}
          >
            +0.5
          </button>

          <button
            className={`focusable ${focus.index === 2 ? "focused" : ""}`}
            style={{ ...btn, ...plus }}
            onClick={() => add(60)}
          >
            +1
          </button>

          <button
            className={`focusable ${focus.index === 3 ? "focused" : ""}`}
            style={{ ...btn, ...plus }}
            onClick={() => add(300)}
          >
            +5
          </button>
        </div>

        <button
          className={`focusable ${focus.index === 4 ? "focused" : ""}`}
          style={{ ...primary, opacity: seconds > 0 ? 1 : 0.5 }}
          onClick={start}
          disabled={seconds <= 0}
        >
          {t("startButton")}
        </button>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const card: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  background: "#fff",
  padding: 40,
  borderRadius: 24,
  textAlign: "center",
  width: 1000,
  maxWidth: "95vw",
  minHeight: "70vh",
  height: "90vh",
};

const inputText: React.CSSProperties = {
  width: "80%",
  marginLeft: "10%"
};

const title: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 12,
  display: "flex",
  justifyContent: "center"
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const time: React.CSSProperties = {
  fontSize: 96,
  fontWeight: 900,
  margin: "20px 0 32px",
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 16,
  justifyContent: "center",
};

const btn: React.CSSProperties = {
  padding: "20px 26px",
  fontSize: 24,
  borderRadius: 18,
  border: "none",
  color: "white",
  minWidth: 90,
};

const minus: React.CSSProperties = { background: "#eb5757" };
const plus: React.CSSProperties = { background: "#27ae60" };

const primary: React.CSSProperties = {
  marginTop: 32,
  padding: "22px 32px",
  fontSize: 26,
  borderRadius: 18,
  border: "none",
  background: "#2f80ed",
  color: "white",
  width: "50%",
  marginLeft: "25%",
};
