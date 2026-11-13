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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 py-3 z-50 text-slate-800">
          <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Live Notifications</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Socket.IO
              </span>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium transition"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <span className="text-3xl block mb-2">🔕</span>
                No notifications yet.
                <p className="text-xs text-slate-400 mt-1">
                  Actions in another tab will trigger live alerts here!
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 hover:bg-slate-50 transition flex items-start gap-3"
                >
                  <span className="text-xl shrink-0 mt-0.5">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
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

