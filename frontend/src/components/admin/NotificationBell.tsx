"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ArrowRight,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { getNotificationTarget } from "@/lib/notifications";

export const NotificationBell: React.FC = () => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      if (
        res.data?.success &&
        typeof res.data?.data?.unreadCount === "number"
      ) {
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch {
      // Silently ignore polling failures
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
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      void handleMarkAsRead(n.id);
    }
    setIsOpen(false);
    const target = getNotificationTarget(n, true);
    if (target) {
      router.push(target);
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
        return <Sparkles className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-600 shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4.5 w-4.5 transition-transform group-hover:scale-105" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold tracking-tight text-white shadow-xs ring-2 ring-white dark:ring-zinc-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-zinc-200/80 bg-white shadow-xl duration-200 sm:w-96 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
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
                className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
              >
                <Check className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] divide-y divide-zinc-100/80 overflow-y-auto dark:divide-zinc-800/80">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent dark:border-zinc-100" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-500">
                <Bell className="mx-auto mb-2 h-7 w-7 text-zinc-300 dark:text-zinc-700" />
                No notifications right now. Everything is running smoothly!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group flex cursor-pointer items-start gap-3.5 p-3.5 transition-colors ${
                    n.isRead
                      ? "bg-transparent opacity-75 hover:bg-zinc-50/80 hover:opacity-100 dark:hover:bg-zinc-800/40"
                      : "bg-zinc-100/70 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200/60 bg-zinc-50 dark:border-zinc-700/60 dark:bg-zinc-800">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`truncate text-xs font-semibold ${
                          n.isRead
                            ? "text-zinc-800 dark:text-zinc-200"
                            : "text-zinc-950 dark:text-white"
                        }`}
                      >
                        {n.title}
                      </h4>
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-zinc-950 dark:bg-zinc-100" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer - View All Notifications */}
          <div className="border-t border-zinc-100 p-2.5 text-center dark:border-zinc-800">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-white"
            >
              <span>View all notifications</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
