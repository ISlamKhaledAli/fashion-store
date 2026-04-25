"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, 
  Search, 
  FileDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  MoreVertical,
  Mail,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Ban
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { AdminCustomer } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CustomerDetailPanel } from "@/components/admin/CustomerDetailPanel";
import { TableImage } from "@/components/admin/TableImage";
import { AdminTabs, AdminTab } from "@/components/admin/AdminTabs";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PriceDisplay } from "@/components/admin/PriceDisplay";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab ] = useState<"ALL" | "ACTIVE" | "BLOCKED" | "VIP">("ALL");
  
  // Detail Panel State
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
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

  const handleStatusChange = async (id: string, status: "ACTIVE" | "BANNED") => {
    try {
      await adminApi.updateCustomerStatus(id, status);
      toast.success(`Customer status updated to ${status === 'ACTIVE' ? 'Active' : 'Blocked'}`);
      
      // Update local state
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  
  const tabList: AdminTab[] = useMemo(() => [
    { id: "ALL",      label: "All Customers", count: customers.length },
    { id: "ACTIVE",   label: "Active",        count: customers.filter(c => c.status === "ACTIVE").length },
    { id: "BLOCKED",  label: "Blocked",       count: customers.filter(c => c.status === "BANNED").length },
    { id: "VIP",      label: "VIP",           count: customers.filter(c => c.totalSpent > 10000).length },
  ], [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
    const headers = ["ID", "Name", "Email", "Join Date", "Total Orders", "Total Spent", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map(c => [
        c.id,
        `"${c.name}"`,
        c.email,
        c.joinDate,
        c.totalOrders,
        c.totalSpent,
        c.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-[3rem] sm:text-[3.5rem] font-bold tracking-tight text-zinc-950 leading-none">Customers</h2>
            <p className="text-zinc-500 mt-4 text-base sm:text-lg">
              {customers.length.toLocaleString()} registered members across global regions.
            </p>
          </div>
          
          {!isLoading && customers.length > 0 && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
              <div className="flex -space-x-3 overflow-hidden">
                {customers.slice(0, 5).map((c, i) => (
                  <div 
                    key={c.id}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden"
                  >
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-black text-zinc-300 uppercase">{c.name.split(" ")[0][0]}</span>
                    )}
                  </div>
                ))}
                {customers.length > 5 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 ring-2 ring-white">
                    <span className="text-[8px] font-black text-white">+{customers.length - 5}</span>
                  </div>
                )}
              </div>
              <div className="h-4 w-[1px] bg-zinc-200" />
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                 Growing Audience
               </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all"
            />
          </div>
          <Button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-medium text-sm hover:scale-[0.98] transition-transform duration-300 whitespace-nowrap"
          >
            <FileDown size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-4 border-b border-zinc-100">
        <AdminTabs
          tabs={tabList}
          activeTab={activeTab}
          onTabChange={(id) => { setActiveTab(id as "ALL" | "ACTIVE" | "BLOCKED" | "VIP"); setPage(1); }}
          layoutId="customersTabUnderline"
          className="flex-1 lg:flex-none"
        />
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Sort by</span>
          <Button 
            variant="none"
            size="none"
            className="flex items-center gap-2 px-4 py-2 bg-white text-xs font-bold border border-zinc-200 rounded-lg text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            Join Date
            <Filter size={14} className="text-zinc-400" />
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer Identity</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Engagement</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Total Spent</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Stance</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-8 flex items-center gap-6">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </td>
                    <td className="px-8 py-8"><Skeleton className="h-6 w-32 rounded-full" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-20 ml-auto" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-8 w-24 rounded-full" /></td>
                    <td className="px-8 py-8"><Skeleton className="h-5 w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Users size={48} strokeWidth={1} />
                      <p className="text-sm font-bold uppercase tracking-[0.2em]">No customers found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => openPanel(customer)}
                    className="group/row hover:bg-zinc-50/50 transition-all cursor-pointer relative border-b border-zinc-50"
                  >
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <TableImage 
                          src={customer.avatar}
                          alt={customer.name}
                          containerClassName="w-12 h-12 rounded-full border border-zinc-200 group-hover/row:shadow-xl group-hover/row:z-10"
                        />
                        <div className="space-y-1">
                          <p className="text-base font-bold text-zinc-950 tracking-tight group-hover/row:translate-x-1 transition-transform">{customer.name}</p>
                          <p className="text-[10px] font-bold font-mono text-zinc-400 tracking-widest uppercase">MEMBER SINCE: {new Date(customer.joinDate).getFullYear()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-1.5">
                        <StatusBadge status="ARCHIVED" className="bg-zinc-50/50 w-fit">
                          {customer.email}
                        </StatusBadge>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-100 bg-white w-fit shadow-sm">
                          <span className="text-[10px] font-bold text-zinc-400">LVL</span>
                          <span className="text-[10px] font-black uppercase text-zinc-950 tracking-tight">
                            {customer.totalSpent > 10000 ? "VIP ELITE" : "MEMBER"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <PriceDisplay amount={customer.totalSpent} />
                    </td>
                    <td className="px-8 py-8">
                       <StatusBadge status={customer.status === "ACTIVE" ? "ACTIVE" : "ARCHIVED"} />
                    </td>
                    <td className="px-8 py-8 text-right pr-12" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                        <Button 
                          variant="icon" 
                          size="none" 
                          onClick={() => openPanel(customer)}
                          className="hover:bg-zinc-100 transition-all p-2.5 text-zinc-400 hover:text-zinc-950 rounded-full" 
                          icon={<Edit size={18} />} 
                        />
                         <Button 
                          variant="icon" 
                          size="none" 
                          onClick={() => window.location.href = `mailto:${customer.email}`}
                          className="hover:bg-zinc-100 transition-all p-2.5 text-zinc-400 hover:text-zinc-950 rounded-full" 
                          icon={<Mail size={18} />} 
                        />
                        <Button 
                          variant="icon" 
                          size="none" 
                          onClick={() => handleStatusChange(customer.id, customer.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE')}
                          className="hover:bg-red-50 transition-all p-2.5 text-zinc-400 hover:text-red-500 rounded-full" 
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Showing {Math.min(filteredCustomers.length, (page - 1) * itemsPerPage + 1)} to {Math.min(filteredCustomers.length, page * itemsPerPage)} of {filteredCustomers.length.toLocaleString()} results
        </span>
        <div className="flex gap-2">
          <Button 
            variant="none"
            size="none"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
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
                "w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xs transition-all",
                page === i + 1 ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"
              )}
            >
              {i + 1}
            </Button>
          ))}
          <Button 
            variant="none"
            size="none"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 transition-all font-bold"
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
      />
    </div>
  );
}
