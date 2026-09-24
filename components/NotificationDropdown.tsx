"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { Bell, CheckCheck, BookOpen, CheckCircle, AlertTriangle, Clock, Sparkles } from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification.actions";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

interface NotificationDropdownProps {
  variant?: "dark" | "light";
}

const NotificationDropdown = ({ variant = "dark" }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await getUserNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Ignore background poll errors
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time Socket.IO notification events
    const handleRealtimeNotification = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationItem>;
      if (customEvent.detail) {
        setNotifications((prev) => [customEvent.detail, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener("bookwise:new-notification", handleRealtimeNotification);

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("bookwise:new-notification", handleRealtimeNotification);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  };

  const handleItemClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      startTransition(async () => {
        await markNotificationAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <span className="text-sm leading-none shrink-0">📢</span>;
      case "UPDATE":
        return <span className="text-sm leading-none shrink-0">⚙️</span>;
      case "REMINDER":
        return <span className="text-sm leading-none shrink-0">⏳</span>;
      case "ALERT":
        return <span className="text-sm leading-none shrink-0">⚠️</span>;
      case "GENERAL":
        return <span className="text-sm leading-none shrink-0">ℹ️</span>;
      case "ACCOUNT_APPROVED":
        return <CheckCircle className="size-4 text-emerald-400 shrink-0" />;
      case "ACCOUNT_REJECTED":
      case "OVERDUE":
        return <AlertTriangle className="size-4 text-rose-400 shrink-0" />;
      case "RENEW":
        return <Clock className="size-4 text-amber-400 shrink-0" />;
      case "BORROW":
      case "RETURN":
        return <BookOpen className="size-4 text-primary shrink-0" />;
      default:
        return <Sparkles className="size-4 text-blue-400 shrink-0" />;
    }
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full transition-all cursor-pointer",
          variant === "dark"
            ? "bg-dark-300/80 text-light-100 hover:bg-dark-200 hover:text-white border border-light-100/10"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 shadow-2xs"
        )}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-dark-100 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl p-4 shadow-2xl border z-50 transition-all",
            variant === "dark"
              ? "bg-dark-100 border-light-100/15 text-white"
              : "bg-white border-slate-200 text-dark-400"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between pb-3",
              variant === "dark"
                ? "border-b border-light-100/10 text-white"
                : "border-b border-slate-100 text-slate-900",
            )}
          >
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    variant === "dark"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-rose-50 text-rose-600 border border-rose-100",
                  )}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className={cn(
                  "inline-flex items-center gap-1 text-xs transition-colors cursor-pointer",
                  variant === "dark"
                    ? "text-primary hover:text-primary/80"
                    : "text-blue-600 hover:text-blue-700 font-medium",
                )}
              >
                <CheckCheck className="size-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => {
                const itemKey =
                  notif.id ||
                  `notif_${index}_${new Date(notif.createdAt || Date.now()).getTime()}`;

                const cardContent = (
                  <div
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl p-3 text-left transition-all cursor-pointer",
                      !notif.isRead
                        ? variant === "dark"
                          ? "bg-dark-300/80 border border-primary/20"
                          : "bg-blue-50/80 border border-blue-200/70"
                        : variant === "dark"
                          ? "hover:bg-dark-200/50 border border-transparent"
                          : "hover:bg-slate-50 border border-transparent",
                    )}
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-xs font-bold truncate",
                            variant === "dark" ? "text-white" : "text-slate-900",
                          )}
                        >
                          {notif.title}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] shrink-0",
                            variant === "dark"
                              ? "text-light-100/50"
                              : "text-slate-400 font-medium",
                          )}
                        >
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-1 line-clamp-2 leading-relaxed",
                          variant === "dark"
                            ? "text-light-100/80"
                            : "text-slate-600 font-normal",
                        )}
                      >
                        {notif.message}
                      </p>
                    </div>

                    {!notif.isRead && (
                      <span className="size-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                );

                return notif.link ? (
                  <Link key={itemKey} href={notif.link} className="block">
                    {cardContent}
                  </Link>
                ) : (
                  <div key={itemKey}>{cardContent}</div>
                );
              })
            ) : (
              <div
                className={cn(
                  "py-8 text-center text-xs",
                  variant === "dark" ? "text-light-100/50" : "text-slate-400",
                )}
              >
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
