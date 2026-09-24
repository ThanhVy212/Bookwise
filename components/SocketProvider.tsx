"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Bell } from "lucide-react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to same origin Socket.io server
    const socketInstance = io({
      path: "/socket.io",
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      if (session?.user?.id) {
        socketInstance.emit("join-user", session.user.id);
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    const handleNewNotification = (notification: any) => {
      // Toast notification alert
      toast(notification.title || "New Notification", {
        description: notification.message,
        icon: <Bell className="size-4 text-primary" />,
        duration: 6000,
        action: notification.link
          ? {
              label: "View",
              onClick: () => {
                window.location.href = notification.link;
              },
            }
          : undefined,
      });

      // Dispatch global window event for components like NotificationDropdown
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("bookwise:new-notification", {
            detail: notification,
          }),
        );
      }
    };

    socketInstance.on("notification:new", handleNewNotification);
    socketInstance.on("notification:broadcast", handleNewNotification);

    setSocket(socketInstance);

    return () => {
      if (session?.user?.id) {
        socketInstance.emit("leave-user", session.user.id);
      }
      socketInstance.off("notification:new", handleNewNotification);
      socketInstance.off("notification:broadcast", handleNewNotification);
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
