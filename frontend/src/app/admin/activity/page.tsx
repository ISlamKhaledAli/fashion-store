"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  User as UserIcon,
  Tag,
  FileText,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { AuditLog, PaginationData } from "@/types";
import { cn } from "@/lib/utils";

const ENTITY_OPTIONS = [
  { label: "All Entities", value: "ALL" },
  { label: "Orders", value: "Order" },
  { label: "Products", value: "Product" },
  { label: "Customers", value: "User" },
  { label: "Discounts", value: "Discount" },
  { label: "Inventory", value: "Variant" },
  { label: "Settings", value: "StoreSettings" },
  { label: "Shipping", value: "ShippingZone" },
];

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        entity?: string;
        search?: string;
        page: number;
        limit: number;
      } = {
        page,
        limit: 20,
      };

      if (selectedEntity !== "ALL") {
        params.entity = selectedEntity;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await adminApi.getAuditLogs(params);
      if (res.data && Array.isArray(res.data.data)) {
        setLogs(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, selectedEntity, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleEntityChange = (entity: string) => {
    setSelectedEntity(entity);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("DELETE") || action.includes("BANNED")) {
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
    if (action.includes("CREATE") || action.includes("ACTIVE")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    if (action.includes("UPDATE") || action.includes("BULK")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
    return "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20";
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, " ");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="border-border/40 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-medium tracking-tight">
              Activity &amp; Audit Trail
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time administrative operations, status updates, and platform
            events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border-border/60 space-y-4 rounded-xl border p-4 shadow-sm">
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          {/* Entity Pills */}
          <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {ENTITY_OPTIONS.map((opt) => {
              const isSelected = selectedEntity === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleEntityChange(opt.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                    isSelected
                      ? "text-primary-foreground bg-primary shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex min-w-[280px] items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search actions, users, IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="h-9 px-3"
            >
              Filter
            </Button>
          </form>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-card border-border/60 overflow-hidden rounded-xl border shadow-sm">
        {loading ? (
          <div className="divide-border/40 space-y-4 divide-y p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 pt-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-muted/60 text-muted-foreground mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-base font-medium">No activity records found</h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
              Actions taken by store managers and automated processes will be
              logged here with complete trace data.
            </p>
          </div>
        ) : (
          <div className="divide-border/40 divide-y">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const hasDetails =
                log.details && Object.keys(log.details).length > 0;

              return (
                <div
                  key={log.id}
                  className="hover:bg-muted/20 flex flex-col gap-2 p-4 transition-colors"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
                          getActionBadgeVariant(log.action)
                        )}
                      >
                        {formatActionName(log.action)}
                      </span>

                      <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                        <Tag className="h-3 w-3" />
                        <span className="text-foreground font-medium">
                          {log.entity}
                        </span>
                        {log.entityId && (
                          <span className="bg-muted/80 rounded px-1.5 py-0.5 font-mono text-[11px]">
                            {log.entityId.length > 16
                              ? `${log.entityId.slice(0, 14)}…`
                              : log.entityId}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="h-3.5 w-3.5" />
                        {log.userName || "System"}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Performed by / IP Info */}
                  <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px]">
                      {log.ipAddress
                        ? `IP: ${log.ipAddress}`
                        : "Internal Trigger"}
                    </span>

                    {hasDetails && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLogId(isExpanded ? null : log.id)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        {isExpanded ? "Hide Payload" : "View Payload"}
                      </button>
                    )}
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && hasDetails && (
                    <pre className="mt-2 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-200">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t p-4 text-xs">
            <span>
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total events)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
