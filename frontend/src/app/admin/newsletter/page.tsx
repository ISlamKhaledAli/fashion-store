"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Download,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  Users,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { newsletterApi } from "@/lib/api";
import type {
  NewsletterSubscriber,
  NewsletterStatus,
  NewsletterStats,
} from "@/types";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
  });
  const [statusFilter, setStatusFilter] = useState<NewsletterStatus | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchSubscribers = () => {
    setIsLoading(true);
    const params = {
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
    };

    newsletterApi
      .getSubscribers(params)
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setSubscribers(data.subscribers || []);
          setStats(data.stats || { total: 0, active: 0, unsubscribed: 0 });
        }
      })
      .catch(() => {
        toast.error("Failed to load newsletter subscribers");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscribers();
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: NewsletterStatus
  ) => {
    const newStatus: NewsletterStatus =
      currentStatus === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED";

    try {
      await newsletterApi.updateStatus(id, newStatus);
      toast.success(
        newStatus === "SUBSCRIBED"
          ? "Subscriber reactivated"
          : "Subscriber marked as unsubscribed"
      );
      setSubscribers((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
      );
      setStats((prev) => ({
        ...prev,
        active: newStatus === "SUBSCRIBED" ? prev.active + 1 : prev.active - 1,
        unsubscribed:
          newStatus === "UNSUBSCRIBED"
            ? prev.unsubscribed + 1
            : prev.unsubscribed - 1,
      }));
    } catch {
      toast.error("Failed to update subscriber status");
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!deleteConfirmId) return;

    try {
      await newsletterApi.delete(deleteConfirmId);
      toast.success("Subscriber removed successfully");
      const target = subscribers.find((s) => s.id === deleteConfirmId);
      setSubscribers((prev) => prev.filter((s) => s.id !== deleteConfirmId));
      if (target) {
        setStats((prev) => ({
          total: Math.max(0, prev.total - 1),
          active:
            target.status === "SUBSCRIBED"
              ? Math.max(0, prev.active - 1)
              : prev.active,
          unsubscribed:
            target.status === "UNSUBSCRIBED"
              ? Math.max(0, prev.unsubscribed - 1)
              : prev.unsubscribed,
        }));
      }
      setDeleteConfirmId(null);
    } catch {
      toast.error("Failed to delete subscriber");
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const res = await newsletterApi.export();
      const list = res.data?.data || [];

      if (list.length === 0) {
        toast.info("No subscribers to export");
        return;
      }

      const headers = [
        "ID",
        "Email",
        "Status",
        "Subscribed At",
        "Last Updated",
      ];
      const rows = list.map((item) => [
        item.id,
        item.email,
        item.status,
        new Date(item.createdAt).toISOString(),
        new Date(item.updatedAt).toISOString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `the_curator_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Subscribers CSV exported successfully");
    } catch {
      toast.error("Failed to export subscribers CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
            Newsletter & <span className="font-serif italic">Subscribers</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Review client mailing list members, update subscription preferences,
            and export archival lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscribers}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Reload
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting || subscribers.length === 0}
            className="flex items-center gap-2 text-xs"
          >
            <Download size={14} className={isExporting ? "animate-spin" : ""} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Total Audience
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-light text-zinc-950 dark:text-zinc-50">
            {stats.total}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            All registered mailing list accounts
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Active Subscribers
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-light text-emerald-600 dark:text-emerald-400">
            {stats.active}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Receiving seasonal drops & atelier invites
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Unsubscribed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <UserX size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-light text-amber-600 dark:text-amber-400">
            {stats.unsubscribed}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Opted out of email communications
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "SUBSCRIBED", "UNSUBSCRIBED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                statusFilter === st
                  ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                  : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {st === "ALL"
                ? `All (${stats.total})`
                : st === "SUBSCRIBED"
                  ? `Active (${stats.active})`
                  : `Unsubscribed (${stats.unsubscribed})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
            />
            <Input
              type="search"
              placeholder="Search email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="text-xs">
            Search
          </Button>
        </form>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/70 tracking-wider text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-3.5">Subscriber Email</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Subscription Date</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading subscriber records...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Mail className="mx-auto mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                    No subscribers found matching this criteria.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => {
                  const isSubscribed = sub.status === "SUBSCRIBED";
                  return (
                    <tr
                      key={sub.id}
                      className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                            <Mail size={13} />
                          </span>
                          <span>{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isSubscribed
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSubscribed ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {formatDate(sub.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(sub.id, sub.status)
                            }
                            className="h-7 px-2.5 text-[11px]"
                            title={
                              isSubscribed
                                ? "Mark as Unsubscribed"
                                : "Reactivate Subscriber"
                            }
                          >
                            {isSubscribed ? (
                              <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                <UserX size={12} />
                                Deactivate
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <UserCheck size={12} />
                                Activate
                              </span>
                            )}
                          </Button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(sub.id)}
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            title="Delete Subscriber"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteSubscriber}
        title="Remove Subscriber"
        description="Are you sure you want to permanently remove this subscriber from the mailing list? This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep"
        confirmBrand="danger"
      />
    </div>
  );
}
