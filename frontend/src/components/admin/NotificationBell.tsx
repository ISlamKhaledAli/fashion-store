"use client";

import React, { useState, useEffect, useRef } from "react";
import { notificationApi } from "@/lib/api";
import type { Notification } from "@/types";
import {
  Bell,
  Check,
  AlertTriangle,
  RotateCcw,
  Clock,
  Package,
  Sparkles,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.data?.success && res.data?.data) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  const fetchLatestNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll({ limit: 8 });
      if (res.data?.success && res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUnreadCount();
    const interval = setInterval(() => {
      void fetchUnreadCount();
    }, 45000); // 45 seconds polling

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      void fetchLatestNotifications();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LOW_STOCK":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "RENTAL_RETURN_REQUEST":
      case "RETURN_REQUEST":
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case "ADMIN_RENTAL_OVERDUE":
      case "RENTAL_OVERDUE":
        return <Clock className="h-4 w-4 text-rose-500" />;
      case "NEW_ORDER":
        return <Package className="h-4 w-4 text-emerald-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-xl sm:w-96 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 p-3.5 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Alerts &amp; Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No notifications right now. Everything is running smoothly!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`flex cursor-pointer gap-3 p-3.5 transition-colors ${
                    n.isRead
                      ? "bg-transparent opacity-70 hover:opacity-100"
                      : "bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-zinc-400">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
