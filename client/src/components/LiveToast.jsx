import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function LiveToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleNotification(data) {
      const id = Date.now() + Math.random();
      const newToast = {
        id,
        title: data.title || "📢 Live Facility Announcement",
        message: data.message || "New announcement broadcasted",
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: data.type || "announcement",
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 3)); // Keep max 3 toasts

      // Auto-dismiss after 7 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 7000);
    }

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/80 rounded-xl p-4 shadow-2xl shadow-amber-500/20 text-white transform transition-all duration-300 animate-slide-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">📢</span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {toast.title}
                </h4>
                <p className="text-[10px] text-slate-400">{toast.timestamp}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-sm transition"
            >
              ✕
            </button>
          </div>

          <p className="mt-2 text-sm text-slate-100 font-medium leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            {toast.message}
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-amber-300/80">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live WebSocket Transmission
            </span>
            <span>Broadcast Feed</span>
          </div>
        </div>
      ))}
    </div>
  );
}
