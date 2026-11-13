import { createContext, useContext, useState, useEffect } from "react";
import socket from "../services/socket";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "system",
      title: "⚡ Welcome to GymHub",
      message: "WebSocket connection established. Live slot syncing is active.",
      timestamp: "System",
      read: false,
    },
    {
      id: 2,
      type: "announcement",
      title: "📢 Facility Announcement",
      message: "The new cryotherapy chamber is now available in the recovery lounge.",
      timestamp: "2 hours ago",
      read: false,
    },
  ]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNotification(data) {
      setNotifications((prev) => [
        {
          id: data.id || Date.now(),
          type: data.type || "announcement",
          title: data.title || "Live Alert",
          message: data.message,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: false,
        },
        ...prev,
      ]);
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const broadcastAnnouncement = (message) => {
    socket.emit("admin_broadcast", { message });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotifications,
        broadcastAnnouncement,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export default SocketContext;

