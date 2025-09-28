"use client";
import { useState } from "react";

export default function OpsRefresh() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/ops", { cache: "no-store" });
      const j = await r.json();
      setMsg(j?.ok ? "Refreshed ✅" : "Error ❌");
    } catch {
      setMsg("Error ❌");
    }
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={busy}
        className="px-3 py-1 rounded-lg border hover:bg-black/5 disabled:opacity-60"
      >
        {busy ? "Refreshing…" : "Refresh"}
      </button>
      {msg && <span className="text-xs opacity-70">{msg}</span>}
    </div>
  );
}