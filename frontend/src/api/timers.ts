import { API_BASE } from "./config";

const TIMERS_API = `${API_BASE}/timers`

export async function listTimers() {
  const res = await fetch(TIMERS_API);
  return res.json();
}

export async function deleteTimer(timerId: string): Promise<void> {
    const res = await fetch(`${TIMERS_API}/${timerId}`, {
      method: "DELETE"
    });
  
    if (!res.ok) {
      throw new Error("Failed to delete timer");
    }
}

export async function createTimer(
    durationSec: number,
    name?: string
  ) {

    const postData = {
      duration_sec: durationSec,
      name: name?.trim() || undefined
    };
  
    const res = await fetch(`${TIMERS_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
    });
  
    if (!res.ok) {
      throw new Error(`Failed to create timer: ${res.status}`);
    }
  
    return res.json();
  }

export async function startTimer(id: string) {
  return fetch(`${TIMERS_API}/${id}/start`, { method: "POST" });
}

export async function pauseTimer(id: string) {
  return fetch(`${TIMERS_API}/${id}/pause`, { method: "POST" });
}