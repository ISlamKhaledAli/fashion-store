"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  Package,
  Sparkles,
  Trash2,
  Send,
  RefreshCw,
  ExternalLink,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { notificationApi } from "@/lib/api";
import type { Notification } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { getNotificationTarget } from "@/lib/notifications";

const typeBadges: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  LOW_STOCK: {
    label: "Low Stock",
    icon: AlertTriangle,
    color:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900",
  },
  ORDER_STATUS: {
    label: "Order",
    icon: Package,
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
  },
  RENTAL_DUE: {
    label: "Rental Due",
    icon: Clock,
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
  },
  RETURN_REQUEST: {
    label: "Return",
    icon: RotateCcw,
    color:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900",
  },
  SYSTEM: {
    label: "System Dispatch",
    icon: Sparkles,
    color:
      "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
  },
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Broadcast Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"ALL" | "ADMINS">(
    "ALL"
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationApi.getAll({ limit: 50 });
      if (res.data?.success && res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleRowClick = (notification: Notification) => {
    if (!notification.isRead) {
      void handleMarkRead(notification.id);
    }
    const target = getNotificationTarget(notification, true);
    if (target) {
      router.push(target);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await notificationApi.delete(deleteConfirmId);
      setNotifications((prev) => prev.filter((n) => n.id !== deleteConfirmId));
      toast.success("Notification removed");
      setDeleteConfirmId(null);
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setIsBroadcasting(true);
      const res = await notificationApi.broadcast({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        type: "SYSTEM",
        target: broadcastTarget,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Broadcast dispatched successfully");
        setBroadcastModalOpen(false);
        setBroadcastTitle("");
        setBroadcastMessage("");
        void fetchNotifications();
      }
    } catch {
      toast.error("Failed to dispatch broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "ALL") return true;
    if (filterType === "UNREAD") return !n.isRead;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const lowStockCount = notifications.filter(
    (n) => n.type === "LOW_STOCK"
  ).length;

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-950 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase dark:bg-white dark:text-zinc-950">
              Concierge Dispatch
            </span>
            <span className="text-xs tracking-wider text-zinc-400 uppercase">
              Operations Hub
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            System Notifications &amp; Alerts
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time atelier alerts, inventory stock deficits, return requests,
            and administrative broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={isLoading}
            icon={
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            }
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              icon={<CheckCheck className="h-3.5 w-3.5 text-emerald-600" />}
            >
              Mark All Read
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setBroadcastModalOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Dispatch Broadcast
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Total In System
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {notifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
            Unread Alerts
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[10px] font-bold tracking-widest text-rose-600 uppercase">
            Low Stock Alerts
          </span>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {[
          { id: "ALL", label: "All Dispatches" },
          { id: "UNREAD", label: `Unread (${unreadCount})` },
          { id: "LOW_STOCK", label: "Low Stock" },
          { id: "ORDER_STATUS", label: "Orders" },
          { id: "RENTAL_DUE", label: "Rentals" },
          { id: "RETURN_REQUEST", label: "Returns" },
          { id: "SYSTEM", label: "Broadcasts" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filterType === tab.id
                ? "bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-xs text-zinc-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Synchronizing
            atelier dispatches...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-400">
            <Bell className="mx-auto mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            No notifications matching current filter.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredNotifications.map((notification) => {
              const badge = typeBadges[notification.type] || typeBadges.SYSTEM;
              const Icon = badge.icon;
              return (
                <div
                  key={notification.id}
                  onClick={() => handleRowClick(notification)}
                  className={`group flex cursor-pointer flex-col justify-between gap-4 p-5 transition-colors sm:flex-row sm:items-center ${
                    !notification.isRead
                      ? "bg-amber-50/25 hover:bg-amber-50/50 dark:bg-amber-950/15 dark:hover:bg-amber-950/25"
                      : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                      <Icon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                        <span className="text-[11px] text-zinc-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {notification.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                        {notification.message}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex shrink-0 items-center gap-2 self-end sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={getNotificationTarget(notification, true)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                      >
                        Inspect <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                        className="h-8 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        Acknowledge
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(notification.id)}
                      className="h-8 text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        title="Dispatch System Broadcast Announcement"
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2">
          <p className="text-xs leading-relaxed text-zinc-500">
            Emit a high-priority system dispatch. Announcements will appear
            immediately in client notification feeds and administrative
            dashboards.
          </p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Target Audience
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBroadcastTarget("ALL")}
                className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                  broadcastTarget === "ALL"
                    ? "border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-800"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
                }`}
              >
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  All Active Members
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  Broadcasts to every registered client.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBroadcastTarget("ADMINS")}
                className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                  broadcastTarget === "ADMINS"
                    ? "border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-800"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"
                }`}
              >
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Concierge Staff Only
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  Internal atelier administrative alert.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Announcement Title
            </label>
            <Input
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. VIP Archival Drop Now Open"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Message Content
            </label>
            <Textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Detailed description or alert terms..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBroadcastModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isBroadcasting}
              icon={<Send className="h-3.5 w-3.5" />}
            >
              {isBroadcasting ? "Dispatching..." : "Transmit Broadcast"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Remove Notification"
        description="Are you certain you wish to delete this alert from the central operations archive? This action cannot be reversed."
        confirmText="Remove Alert"
        confirmBrand="danger"
      />
    </div>
  );
}
