"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  Edit,
  Ban,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { AdminCustomer } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CustomerDetailPanel } from "@/components/admin/CustomerDetailPanel";
import { TableImage } from "@/components/admin/TableImage";
import type { AdminTab } from "@/components/admin/AdminTabs";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PriceDisplay } from "@/components/admin/PriceDisplay";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "ALL" | "ACTIVE" | "BLOCKED" | "VIP"
  >("ALL");

  // Detail Panel State
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Pagination (Mocked for now as per HTML design)
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCustomers();
      if (res.data.success) {
        setCustomers(res.data.data as AdminCustomer[]);
      }
    } catch (err) {
      toast.error("Failed to fetch customer data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleStatusChange = async (
    id: string,
    status: "ACTIVE" | "BANNED"
  ) => {
    try {
      await adminApi.updateCustomerStatus(id, status);
      toast.success(
        `Customer status updated to ${status === "ACTIVE" ? "Active" : "Blocked"}`
      );

      // Update local state
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      if (selectedCustomer?.id === id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const tabList: AdminTab[] = useMemo(
    () => [
      { id: "ALL", label: "All Customers", count: customers.length },
      {
        id: "ACTIVE",
        label: "Active",
        count: customers.filter((c) => c.status === "ACTIVE").length,
      },
      {
        id: "BLOCKED",
        label: "Blocked",
        count: customers.filter((c) => c.status === "BANNED").length,
      },
      {
        id: "VIP",
        label: "VIP",
        count: customers.filter((c) => c.totalSpent > 10000).length,
      },
    ],
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (activeTab === "ACTIVE") matchesTab = c.status === "ACTIVE";
      if (activeTab === "BLOCKED") matchesTab = c.status === "BANNED";
      if (activeTab === "VIP") matchesTab = c.totalSpent > 10000;

      return matchesSearch && matchesTab;
    });
  }, [customers, searchQuery, activeTab]);

  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, page]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const exportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Join Date",
      "Total Orders",
      "Total Spent",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map((c) =>
        [
          c.id,
          `"${c.name}"`,
          c.email,
          c.joinDate,
          c.totalOrders,
          c.totalSpent,
          c.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customers_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPanel = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setIsPanelOpen(true);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-6">
          <div>
            <h2 className="text-[3rem] leading-none font-bold tracking-tight text-zinc-950 sm:text-[3.5rem]">
              Customers
            </h2>
            <p className="mt-4 text-base text-zinc-500 sm:text-lg">
              {customers.length.toLocaleString()} registered members across
              global regions.
            </p>
          </div>

          {!isLoading && customers.length > 0 && (
            <div className="animate-in fade-in slide-in-from-left-4 flex items-center gap-4 delay-200 duration-1000">
              <div className="flex -space-x-3 overflow-hidden">
                {customers.slice(0, 5).map((c, i) => (
                  <div
                    key={c.id}
                    className="flex inline-block h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-100 bg-zinc-50 ring-2 ring-white"
                  >
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px] font-black text-zinc-300 uppercase">
                        {c.name.split(" ")[0][0]}
                      </span>
                    )}
                  </div>
                ))}
                {customers.length > 5 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 ring-2 ring-white">
                    <span className="text-[8px] font-black text-white">
                      +{customers.length - 5}
                    </span>
                  </div>
                )}
              </div>
              <div className="h-4 w-[1px] bg-zinc-200" />
              <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                Growing Audience
              </p>
            </div>
          )}
        </div>
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pr-4 pl-9 text-sm transition-all outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <Button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-transform duration-300 hover:scale-[0.98]"
          >
            <FileDown size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col items-start justify-between gap-6 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center">
        <AdminTabs
          tabs={tabList}
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(id as "ALL" | "ACTIVE" | "BLOCKED" | "VIP");
            setPage(1);
          }}
          layoutId="customersTabUnderline"
          className="flex-1 lg:flex-none"
        />
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Sort by
          </span>
          <Button
            variant="none"
            size="none"
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            Join Date
            <Filter size={14} className="text-zinc-400" />
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Customer Identity
                </th>
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Engagement
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Total Spent
                </th>
                <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Stance
                </th>
                <th className="px-8 py-5 pr-12 text-right text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="flex items-center gap-6 px-8 py-8">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <Skeleton className="h-6 w-32 rounded-full" />
                    </td>
                    <td className="px-8 py-8">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </td>
                    <td className="px-8 py-8">
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </td>
                    <td className="px-8 py-8">
                      <Skeleton className="ml-auto h-5 w-12" />
                    </td>
                  </tr>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Users size={48} strokeWidth={1} />
                      <p className="text-sm font-bold tracking-[0.2em] uppercase">
                        No customers found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => openPanel(customer)}
                    className="group/row relative cursor-pointer border-b border-zinc-50 transition-all hover:bg-zinc-50/50"
                  >
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <TableImage
                          src={customer.avatar}
                          alt={customer.name}
                          containerClassName="w-12 h-12 rounded-full border border-zinc-200 group-hover/row:shadow-xl group-hover/row:z-10"
                        />
                        <div className="space-y-1">
                          <p className="text-base font-bold tracking-tight text-zinc-950 transition-transform group-hover/row:translate-x-1">
                            {customer.name}
                          </p>
                          <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                            MEMBER SINCE:{" "}
                            {new Date(customer.joinDate).getFullYear()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-1.5">
                        <StatusBadge
                          status="ARCHIVED"
                          className="w-fit bg-zinc-50/50"
                        >
                          {customer.email}
                        </StatusBadge>
                        <div className="flex w-fit items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-2.5 py-0.5 shadow-sm">
                          <span className="text-[10px] font-bold text-zinc-400">
                            LVL
                          </span>
                          <span className="text-[10px] font-black tracking-tight text-zinc-950 uppercase">
                            {customer.totalSpent > 10000
                              ? "VIP ELITE"
                              : "MEMBER"}
                          </span>
                        </div>
                        {customer.tags && customer.tags.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {customer.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-700"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <PriceDisplay amount={customer.totalSpent} />
                    </td>
                    <td className="px-8 py-8">
                      <StatusBadge
                        status={
                          customer.status === "ACTIVE" ? "ACTIVE" : "ARCHIVED"
                        }
                      />
                    </td>
                    <td
                      className="px-8 py-8 pr-12 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex translate-x-4 items-center justify-end gap-1.5 opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100">
                        <Button
                          variant="icon"
                          size="none"
                          onClick={() => openPanel(customer)}
                          className="rounded-full p-2.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-950"
                          icon={<Edit size={18} />}
                        />
                        <Button
                          variant="icon"
                          size="none"
                          onClick={() =>
                            (window.location.href = `mailto:${customer.email}`)
                          }
                          className="rounded-full p-2.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-950"
                          icon={<Mail size={18} />}
                        />
                        <Button
                          variant="icon"
                          size="none"
                          onClick={() =>
                            handleStatusChange(
                              customer.id,
                              customer.status === "ACTIVE" ? "BANNED" : "ACTIVE"
                            )
                          }
                          className="rounded-full p-2.5 text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500"
                          icon={<Ban size={18} />}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="mt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
          Showing{" "}
          {Math.min(filteredCustomers.length, (page - 1) * itemsPerPage + 1)} to{" "}
          {Math.min(filteredCustomers.length, page * itemsPerPage)} of{" "}
          {filteredCustomers.length.toLocaleString()} results
        </span>
        <div className="flex gap-2">
          <Button
            variant="none"
            size="none"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
            <Button
              variant="none"
              size="none"
              key={i}
              onClick={() => setPage(i + 1)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all",
                page === i + 1
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-50"
              )}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="none"
            size="none"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 font-bold transition-all hover:bg-zinc-50 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Customer Detail Side Panel */}
      <CustomerDetailPanel
        customer={selectedCustomer}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onStatusChange={handleStatusChange}
        onCustomerUpdated={fetchCustomers}
      />
    </div>
  );
}
