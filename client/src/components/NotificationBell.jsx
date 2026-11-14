import { useEffect, useState, useRef } from "react";
import socket from "../services/socket";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(socket.connected);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onNotification(notif) {
      setNotifications((prev) => [
        {
          id: notif.id || Date.now(),
          type: notif.type || "info",
          title: notif.title || "Alert",
          message: notif.message,
          timestamp: notif.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: false,
        },
        ...prev.slice(0, 19), // Keep latest 20
      ]);
      setUnreadCount((c) => c + 1);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification", onNotification);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notification", onNotification);
    };
  }, []);

  // Close dropdown on click or touch outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking_created":
        return "🎟️";
      case "booking_cancelled":
        return "↩️";
      case "class_created":
        return "✨";
      case "class_updated":
        return "📝";
      case "class_deleted":
        return "🗑️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        title={connected ? "Socket.IO: Connected (Live)" : "Socket.IO: Connecting..."}
      >
        <span className="text-xl">🔔</span>

        {/* Live WebSocket Status Dot */}
        <span
          className={`absolute bottom-1 right-1 h-2 w-2 rounded-full border border-slate-900 ${
            connected ? "bg-emerald-400" : "bg-amber-400 animate-ping"
          }`}
        />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white shadow-sm animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-3 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-800 py-3 z-50 text-white animate-slide-in">
          <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Live Notifications</span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-amber-400 font-medium transition cursor-pointer"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm rounded-lg hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <span className="text-3xl block mb-2">🔕</span>
                No notifications yet.
                <p className="text-[11px] text-slate-500 mt-1">
                  Announcements and spot bookings will flash here live!
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 hover:bg-slate-800/60 transition flex items-start gap-3"
                >
                  <span className="text-xl shrink-0 mt-0.5">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{notif.title}</p>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-amber-400/80 mt-1 block">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

