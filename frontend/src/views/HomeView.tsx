import { useEffect, useState } from "react";

import { listTimers, deleteTimer } from "../api/timers";
import TimerCard from "../components/TimerCard";
import TimerOverlay from "../components/TimerOverlay";
import ShoppingOverlay from "../components/ShoppingOverlay";
import ConfirmOverlay from "../components/ConfirmOverlay";

import { useOverlayStack } from "../ui/useOverlayStack";
import { useHardwareKeys } from "../hooks/useHardwareKeys";
import type { OverlayActions } from "../ui/overlayActions";

import { formatSeconds } from "../utils/time";
import { CartIcon, TimerIcon, UkraineFlag, UKFlag } from "../ui/icons";
import { useTranslation } from "react-i18next";

/* ---------- types ---------- */

interface Timer {
  id: string;
  name: string;
  remaining_sec: number;
  status: "idle" | "running" | "paused" | "finished";
}

/* ---------- component ---------- */

export default function HomeView() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [overlayActions, setOverlayActions] = useState<OverlayActions | null>(
    null,
  );

  const overlays = useOverlayStack();
  const { t, i18n } = useTranslation();

  /* ---------- data ---------- */

  async function refresh() {
    const data = await listTimers();
    setTimers(data);
  }

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 1000);
    return () => clearInterval(i);
  }, []);

  /* ---------- hardware / keyboard ---------- */

  useHardwareKeys({
    overlayActions,

    onHome: () => {
      overlays.clear();
      setOverlayActions(null);
    },

    onQuickTimer: () => {
      overlays.push({ type: "quickTimer" });
    },

    onShopping: () => {
      overlays.push({ type: "shoppingList" });
    },
  });

  /* ---------- derived state ---------- */

  const activeTimer = timers.find((t) => t.status === "running");

  /* ---------- render ---------- */

  return (
    <div style={{ padding: 20, maxWidth: 1280, margin: "0 auto" }}>
      <header style={header}>
        <div style={headerRight}>
          <button
            style={{
              ...langBtn,
              opacity: i18n.language.startsWith("uk") ? 1 : 0.5,
            }}
            onClick={() => i18n.changeLanguage("uk")}
          >
            <UkraineFlag size={28} />
          </button>

          <button
            style={{
              ...langBtn,
              opacity: i18n.language.startsWith("en") ? 1 : 0.5,
            }}
            onClick={() => i18n.changeLanguage("en")}
          >
            <UKFlag size={28} />
          </button>
        </div>
      </header>
      <div style={mainLayout}>
        {/* LEFT SIDE - TILES */}
        <div style={tilesColumn}>
          <div style={tileGrid}>
            <button
              style={tileButton}
              onClick={() => overlays.push({ type: "quickTimer" })}
            >
              <TimerIcon size={42} />
              <span style={tileLabel}>{t("timerName")}</span>
            </button>

            <button
              style={tileButton}
              onClick={() => overlays.push({ type: "shoppingList" })}
            >
              <CartIcon size={42} />
              <span style={tileLabel}>{t("shoppingName")}</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - ACTIVE TIMERS */}
        <div style={timersColumn}>
          <h3 style={sideTitle}>{t("timersSectionName")}</h3>

          {timers
            .filter((t) => t.status !== "finished")
            .sort(sortTimers)
            .map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onDeleteRequested={(timer) =>
                  overlays.push({
                    type: "confirm",
                    title: t("removeTimerTitle"),
                    message: t("removeTimerText", { name: timer.name }),
                    onConfirm: async () => {
                      await deleteTimer(timer.id);
                      refresh();
                    },
                  })
                }
              />
            ))}
        </div>
      </div>
      {/* ---------- OVERLAYS ---------- */}
      {overlays.top?.type === "quickTimer" && (
        <TimerOverlay
          onClose={() => {
            overlays.pop();
            setOverlayActions(null);
          }}
          onStarted={() => {
            overlays.clear();
            setOverlayActions(null);
            refresh();
          }}
          registerActions={setOverlayActions}
          unregisterActions={() => setOverlayActions(null)}
        />
      )}
      {overlays.top?.type === "shoppingList" && (
        <ShoppingOverlay
          onClose={() => {
            overlays.pop();
            setOverlayActions(null);
          }}
          registerActions={setOverlayActions}
          unregisterActions={() => setOverlayActions(null)}
        />
      )}
      {overlays.top?.type === "confirm" && (
        <ConfirmOverlay
          title={overlays.top.title}
          message={overlays.top.message}
          onConfirm={() => {
            if (overlays.top?.type === "confirm") {
              overlays.top.onConfirm();
            }
            overlays.pop();
            setOverlayActions(null);
          }}
          onCancel={() => {
            overlays.pop();
            setOverlayActions(null);
          }}
          registerActions={setOverlayActions}
          unregisterActions={() => setOverlayActions(null)}
        />
      )}{" "}
    </div>
  );
}

/* ---------- helpers ---------- */

function sortTimers(a: Timer, b: Timer) {
  const priority: Record<Timer["status"], number> = {
    running: 0,
    paused: 1,
    idle: 2,
    finished: 3,
  };

  return priority[a.status] - priority[b.status];
}

const header: React.CSSProperties = {
  height: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "end",
};

const headerRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const langBtn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 4,
  borderRadius: 8,
  transition: "opacity 0.2s ease",
};

const mainLayout: React.CSSProperties = {
  display: "flex",
  gap: 40,
  alignItems: "flex-start",
};

const tilesColumn: React.CSSProperties = {
  flex: 1,
};

const timersColumn: React.CSSProperties = {
  width: 420,
  maxHeight: 650,
  overflowY: "auto",
};

const tileGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
};

const tileButton: React.CSSProperties = {
  height: 200,
  borderRadius: 24,
  border: "1px solid #e5e7eb",
  cursor: "pointer",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,

  fontSize: 22,
  fontWeight: 600,

  transition: "transform 0.1s ease",
};

const tileLabel: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
};

const sideTitle: React.CSSProperties = {
  marginBottom: 16,
  fontSize: 18,
  fontWeight: 600,
};
