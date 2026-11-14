import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function LiveToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleNotification(data) {
      const id = Date.now() + Math.random();
      const type = data.type || "announcement";
      
      let title = data.title;
      if (!title) {
        if (type === "booking_created") title = "🎟️ New Spot Reserved!";
        else if (type === "booking_cancelled") title = "↩️ Booking Cancelled";
        else title = "📢 Facility Announcement";
      }

      const newToast = {
        id,
        title,
        message: data.message || "New event received",
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type,
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
    <div className="fixed top-16 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto sm:max-w-sm z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const isBooking = toast.type === "booking_created";
        const isCancel = toast.type === "booking_cancelled";
        
        const borderColor = isBooking
          ? "border-emerald-500/80 shadow-emerald-500/25"
          : isCancel
          ? "border-rose-500/80 shadow-rose-500/25"
          : "border-amber-500/80 shadow-amber-500/25";

        const titleColor = isBooking
          ? "text-emerald-400"
          : isCancel
          ? "text-rose-400"
          : "text-amber-400";

        const icon = isBooking ? "🎟️" : isCancel ? "↩️" : "📢";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-slate-900/95 backdrop-blur-md border-2 ${borderColor} rounded-xl p-4 shadow-2xl text-white transform transition-all duration-300 animate-slide-in`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl animate-pulse">{icon}</span>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${titleColor}`}>
                    {toast.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">{toast.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white text-sm p-1 transition"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              {toast.message}
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live WebSocket
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                GymHub Real-Time
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
