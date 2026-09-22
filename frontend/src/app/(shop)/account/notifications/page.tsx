"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { notificationApi } from "@/lib/api";
import type { Notification } from "@/types";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Package,
  RotateCcw,
  Clock,
  Sparkles,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { getNotificationTarget } from "@/lib/notifications";

const filterTabs = [
  { id: "ALL", label: "All Updates" },
  { id: "UNREAD", label: "Unread" },
  { id: "ORDERS", label: "Orders" },
  { id: "BAG", label: "Curated Bag" },
  { id: "RENTALS_RETURNS", label: "Rentals & Returns" },
];

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll({ limit: 50 });
      if (res.data?.success && res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error("Could not update status");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await notificationApi.delete(deleteConfirmId);
      setNotifications((prev) => prev.filter((n) => n.id !== deleteConfirmId));
      toast.success("Notification dismissed");
    } catch {
      toast.error("Failed to remove notification");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleItemClick = (n: Notification) => {
    if (!n.isRead) {
      void handleMarkAsRead(n.id);
    }
    const target = getNotificationTarget(n, false);
    if (target) {
      router.push(target);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filterType === "ALL") return true;
      if (filterType === "UNREAD") return !n.isRead;
      if (filterType === "ORDERS") return n.type.includes("ORDER");
      if (filterType === "BAG") {
        return n.type.includes("CART") || n.type.includes("BAG");
      }
      if (filterType === "RENTALS_RETURNS") {
        return n.type.includes("RENTAL") || n.type.includes("RETURN");
      }
      return true;
    });
  }, [notifications, filterType]);

  const getIconForType = (type: string) => {
    if (type.includes("ORDER")) {
      return <Package size={18} className="text-primary" />;
    }
    if (type.includes("BAG") || type.includes("CART")) {
      return <ShoppingBag size={18} className="text-amber-500" />;
    }
    if (type.includes("RETURN")) {
      return <RotateCcw size={18} className="text-purple-500" />;
    }
    if (type.includes("RENTAL")) {
      return <Clock size={18} className="text-blue-500" />;
    }
    return <Sparkles size={18} className="text-amber-500" />;
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface">
        <AccountSidebar />

        <main className="flex-1 p-8 lg:p-12">
          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="mb-3 text-4xl font-medium tracking-tight text-on-surface lg:text-5xl">
                  Notifications &amp; Alerts
                </h1>
                <p className="max-w-xl leading-relaxed text-on-surface-variant">
                  Stay updated on order status, curated bag recovery offers, and
                  exclusive atelier communications.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchNotifications}
                  disabled={loading}
                  icon={
                    <RefreshCw
                      size={14}
                      className={loading ? "animate-spin" : ""}
                    />
                  }
                >
                  Refresh
                </Button>

                {unreadCount > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleMarkAllRead}
                    icon={<CheckCheck size={14} />}
                  >
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Filter Tabs matching Brand Identity */}
          <div className="relative mb-8 flex gap-x-8 overflow-x-auto border-b border-outline-variant/15">
            {filterTabs.map((tab) => (
              <Button
                variant="none"
                size="none"
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={cn(
                  "relative cursor-pointer pb-4 text-sm font-medium whitespace-nowrap transition-all",
                  filterType === tab.id
                    ? "font-semibold text-primary"
                    : "text-on-surface-variant hover:text-primary"
                )}
              >
                <span>{tab.label}</span>
                {tab.id === "UNREAD" && unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {unreadCount}
                  </span>
                )}
                {filterType === tab.id && (
                  <motion.div
                    layoutId="activeNotificationTab"
                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary"
                  />
                )}
              </Button>
            ))}
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex min-h-[30vh] items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/20 bg-surface-container-lowest py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
                  <Bell size={24} className="text-outline-variant/50" />
                </div>
                <h3 className="text-base font-semibold text-on-surface">
                  No notifications to display
                </h3>
                <p className="mt-1 max-w-sm text-xs text-on-surface-variant">
                  You are completely caught up. When order updates or exclusive
                  offers arrive, they will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    "group flex cursor-pointer flex-col justify-between gap-4 rounded-sm border p-5 transition-all duration-300 sm:flex-row sm:items-center",
                    n.isRead
                      ? "border-outline-variant/10 bg-surface-container-lowest hover:border-outline-variant/25 hover:bg-surface-container-low"
                      : "border-primary/25 bg-surface-container-low/70 shadow-xs hover:border-primary/45 hover:bg-surface-container-low"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high ring-1 ring-outline-variant/15">
                      {getIconForType(n.type)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3
                          className={cn(
                            "text-sm font-semibold tracking-tight",
                            n.isRead
                              ? "text-on-surface"
                              : "font-bold text-primary"
                          )}
                        >
                          {n.title}
                        </h3>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <span className="text-xs text-on-surface-variant">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                        <span className="text-xs text-outline-variant">
                          • {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-on-surface-variant">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(n);
                      }}
                      className="gap-1 text-xs"
                    >
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </Button>

                    {!n.isRead && (
                      <Button
                        variant="none"
                        size="none"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                        title="Mark as read"
                      >
                        <CheckCheck size={16} />
                      </Button>
                    )}

                    <Button
                      variant="none"
                      size="none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(n.id);
                      }}
                      className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                      title="Dismiss notification"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <ConfirmDialog
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={handleDelete}
          title="Dismiss Notification"
          description="Are you sure you want to dismiss this notification from your atelier history?"
          confirmText="Dismiss"
          confirmBrand="danger"
        />
      </div>
    </ProtectedRoute>
  );
}
