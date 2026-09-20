"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Package,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react";
import { notificationApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Notification } from "@/types";
import { formatDate, cn } from "@/lib/utils";

export const CustomerNotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.data?.data) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // Graceful silence for unauthenticated or background network
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await notificationApi.getAll({ limit: 8 });
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch {
      // Graceful silence
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch and periodic check every 45s
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 45000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Click outside to dismiss
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const getIconForType = (type: string) => {
    if (type.includes("ORDER")) {
      return <Package size={14} className="text-primary" />;
    }
    if (type.includes("RETURN")) {
      return <RotateCcw size={14} className="text-amber-500" />;
    }
    if (type.includes("RENTAL")) {
      return <Clock size={14} className="text-blue-500" />;
    }
    return <Sparkles size={14} className="text-amber-400" />;
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-all duration-300 hover:scale-95 hover:bg-surface-container-lowest"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell size={19} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-outline-variant/15 bg-surface p-4 shadow-xl backdrop-blur-xl sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-on-surface">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant transition-colors hover:text-primary"
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 divide-y divide-outline-variant/5 overflow-y-auto py-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-on-surface-variant">
                  Loading updates...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs font-medium text-on-surface">
                    All caught up
                  </p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">
                    No new atelier updates or order events.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={(e) => {
                      if (!n.isRead) handleMarkAsRead(n.id, e);
                    }}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors",
                      n.isRead
                        ? "hover:bg-surface-container-low"
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                      {getIconForType(n.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            "truncate text-xs font-semibold",
                            n.isRead ? "text-on-surface" : "text-primary"
                          )}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-on-surface-variant">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-on-surface-variant">
                        {n.message}
                      </p>
                    </div>

                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer link to Orders */}
            <div className="border-t border-outline-variant/10 pt-2 text-center">
              <Link
                href="/account/orders"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold text-primary underline hover:opacity-85"
              >
                View Order History
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
