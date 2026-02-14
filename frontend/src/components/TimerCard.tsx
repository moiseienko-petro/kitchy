import { pauseTimer, startTimer } from "../api/timers";
import { formatSeconds } from "../utils/time";
import { TrashIcon, PlayIcon, PauseIcon} from "../ui/icons";


interface Timer {
  id: string;
  name: string;
  remaining_sec: number;
  status: "idle" | "running" | "paused" | "finished";
}

interface Props {
  timer: Timer;
  onDeleteRequested: (timer: Timer) => void;
}

export default function TimerCard({ timer, onDeleteRequested }: Props) {
  const isRunning = timer.status === "running";
  const isPaused = timer.status === "paused";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
        borderLeft: isRunning ? "6px solid #27ae60" : "6px solid transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}
    >
      {/* INFO */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            opacity: 0.7,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {timer.name}
        </div>

        <div style={{ fontSize: 28, fontWeight: "bold" }}>
          {formatSeconds(timer.remaining_sec)}
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 8 }}>
        {(isPaused || timer.status === "idle") && (
          <button
            onClick={() => startTimer(timer.id)}
            style={{ ...iconButton, background: "#16a34a"}}
          >
            <PlayIcon size={22}/>
          </button>
        )}

        {isRunning && (
          <button
            onClick={() => pauseTimer(timer.id)}
            style={{ ...iconButton, background: "#ca8a04"}}
          >
            <PauseIcon size={22}/>
          </button>
        )}

        <button
          onClick={() => onDeleteRequested(timer)}
          style={{ ...iconButton, background: "#eb5757" }}
        >
          <TrashIcon size={22}/>
        </button>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const iconButton: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 18,
  borderRadius: 10,
  border: "none",
  background: "#e0e0e0",
  cursor: "pointer"
};