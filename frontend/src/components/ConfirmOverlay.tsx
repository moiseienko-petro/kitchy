import { useEffect } from "react";
import { useFocusList } from "../ui/useFocusList";
import type { OverlayActions } from "../ui/overlayActions";
import { useTranslation } from "react-i18next";

interface Props {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;

  registerActions: (a: OverlayActions) => void;
  unregisterActions: () => void;
}

export default function ConfirmOverlay({
  title = "Confirmation",
  message,
  onConfirm,
  onCancel,
  registerActions,
  unregisterActions
}: Props) {
  const focus = useFocusList(["yes", "no"]);
  const { t } = useTranslation();

  useEffect(() => {
    registerActions({
      onLeft: focus.prev,
      onRight: focus.next,
      onOk: () => {
        focus.index === 0 ? onConfirm() : onCancel();
      },
      onCancel
    });

    return unregisterActions;
  }, [focus.index]);

  return (
    <div style={backdrop} onClick={onCancel}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>

        <p style={{ margin: "20px 0", fontSize: 18 }}>
          {message}
        </p>

        <div style={row}>
          <button
            className={`focusable ${focus.index === 0 ? "focused" : ""}`}
            style={{ ...btn, background: "#eb5757" }}
            onClick={onConfirm}
          >
            {t("yesButton")}
          </button>

          <button
            className={`focusable ${focus.index === 1 ? "focused" : ""}`}
            style={{ ...btn, background: "#27ae60" }}
            onClick={onCancel}
          >
            {t("noButton")}
          </button>
        </div>
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
  zIndex: 1100
};

const card: React.CSSProperties = {
  background: "#fff",
  padding: 30,
  borderRadius: 18,
  width: 360,
  textAlign: "center"
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16
};

const btn: React.CSSProperties = {
  flex: 1,
  padding: "16px 0",
  fontSize: 20,
  borderRadius: 14,
  border: "none",
  color: "white"
};