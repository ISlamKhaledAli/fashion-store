"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Mail,
  Ban,
  RotateCcw,
  ShoppingCart,
  Tag,
  X,
  FileText,
  Save,
  Ruler,
  Star,
  MapPin,
  Check,
} from "lucide-react";
import type { AdminCustomer, Customer360Profile, Order } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AdminDrawer } from "./AdminDrawer";
import { PriceDisplay } from "./PriceDisplay";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";

interface CustomerDetailPanelProps {
  customer: AdminCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: "ACTIVE" | "BANNED") => void;
  onCustomerUpdated?: () => void;
}

export const CustomerDetailPanel = ({
  customer,
  isOpen,
  onClose,
  onStatusChange,
  onCustomerUpdated,
}: CustomerDetailPanelProps) => {
  const [profile360, setProfile360] = useState<Customer360Profile | null>(null);
  const [loading360, setLoading360] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "sizing" | "notes">(
    "overview"
  );

  // Tag editing state
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  // Admin notes state
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [isNotesSaved, setIsNotesSaved] = useState(false);

  // Role state
  const [role, setRole] = useState<"CUSTOMER" | "ADMIN">(
    customer?.role || "CUSTOMER"
  );

  const fetch360Data = useCallback(
    async (customerId: string) => {
      setLoading360(true);
      try {
        const res = await adminApi.getCustomer360(customerId);
        if (res.data.success && res.data.data) {
          setProfile360(res.data.data);
          setTags(res.data.data.tags || []);
          setAdminNotes(res.data.data.adminNotes || "");
          if (res.data.data.role) {
            setRole(res.data.data.role);
          }
        }
      } catch {
        // Fallback to basic customer data
        if (customer) {
          setTags(customer.tags || []);
          setAdminNotes(customer.adminNotes || "");
          if (customer.role) {
            setRole(customer.role);
          }
        }
      } finally {
        setLoading360(false);
      }
    },
    [customer]
  );

  useEffect(() => {
    if (customer && isOpen) {
      fetch360Data(customer.id);
    }
  }, [customer, isOpen, fetch360Data]);

  const handleRoleChange = async (newRole: "CUSTOMER" | "ADMIN") => {
    if (newRole === role || !customer) return;
    try {
      await adminApi.updateCustomerDetails(customer.id, { role: newRole });
      setRole(newRole);
      toast.success(`User role updated to ${newRole}`);
      onCustomerUpdated?.();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "Failed to update role privileges";
      toast.error(errorMsg);
    }
  };

  if (!customer) return null;

  const handleAddTag = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;

    const updatedTags = [...tags, trimmed];
    setTags(updatedTags);
    setNewTagInput("");

    try {
      await adminApi.updateCustomerDetails(customer.id, { tags: updatedTags });
      toast.success(`Tag "${trimmed}" attached to client`);
      onCustomerUpdated?.();
    } catch {
      toast.error("Failed to save tag");
      setTags(tags);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);

    try {
      await adminApi.updateCustomerDetails(customer.id, { tags: updatedTags });
      toast.success(`Tag "${tagToRemove}" removed`);
      onCustomerUpdated?.();
    } catch {
      toast.error("Failed to remove tag");
      setTags(tags);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await adminApi.updateCustomerDetails(customer.id, { adminNotes });
      toast.success("Client dossier notes saved");
      setIsNotesSaved(true);
      onCustomerUpdated?.();
      setTimeout(() => setIsNotesSaved(false), 2500);
    } catch {
      toast.error("Failed to save client dossier notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const isVip =
    (profile360?.totalSpent || customer.totalSpent) > 5000 ||
    tags.includes("VIP");

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Client Dossier (360°)"
      subtitle={customer.name}
      footer={
        <>
          <Button
            variant="primary"
            className="h-[48px] flex-1 text-[10px] font-black tracking-[0.2em] uppercase"
            onClick={() => (window.location.href = `mailto:${customer.email}`)}
            icon={<Mail size={16} />}
          >
            Message Client
          </Button>
          <Button
            variant={customer.status === "ACTIVE" ? "outline" : "primary"}
            className={cn(
              "h-[48px] px-8 text-[10px] font-black tracking-[0.2em] uppercase",
              customer.status === "ACTIVE"
                ? "border-red-100 text-red-500 hover:bg-red-50"
                : "border-red-600 bg-red-600 text-white hover:bg-red-700"
            )}
            onClick={() =>
              onStatusChange(
                customer.id,
                customer.status === "ACTIVE" ? "BANNED" : "ACTIVE"
              )
            }
            icon={
              customer.status === "ACTIVE" ? (
                <Ban size={16} />
              ) : (
                <RotateCcw size={16} />
              )
            }
          >
            {customer.status === "ACTIVE" ? "Restrict" : "Restore"}
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="border-border/40 flex flex-col items-center border-b pb-6 text-center">
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-zinc-100 bg-zinc-50 shadow-inner">
            {customer.avatar ? (
              <Image
                className="object-cover"
                src={customer.avatar}
                alt={customer.name}
                fill
                unoptimized
              />
            ) : (
              <span className="text-2xl font-black text-zinc-400">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {customer.name}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">{customer.email}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {isVip && (
              <span className="rounded bg-zinc-950 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                VIP Collector
              </span>
            )}
            <span className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-zinc-600 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              Member Since {new Date(customer.joinDate).getFullYear()}
            </span>

            {/* Staff / Admin Privilege Selector */}
            <div className="inline-flex items-center rounded border border-zinc-200 bg-white p-0.5 text-[9px] font-bold uppercase dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => handleRoleChange("CUSTOMER")}
                className={cn(
                  "cursor-pointer rounded px-2 py-0.5 transition-colors",
                  role === "CUSTOMER"
                    ? "bg-zinc-100 font-bold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("ADMIN")}
                className={cn(
                  "cursor-pointer rounded px-2 py-0.5 transition-colors",
                  role === "ADMIN"
                    ? "bg-amber-500 font-bold text-white"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Staff Admin
              </button>
            </div>
          </div>

          {/* Tags Pills Section */}
          <div className="mt-4 flex max-w-md flex-wrap items-center justify-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Tag className="h-2.5 w-2.5 text-zinc-400" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="+ Add tag..."
                className="w-20 border-b border-zinc-200 bg-transparent px-1 py-0.5 text-[11px] transition-all focus:w-28 focus:outline-hidden dark:border-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-border/40 flex border-b">
          {[
            { id: "overview", label: "Overview & Orders", icon: ShoppingCart },
            { id: "sizing", label: "Fit & Measurements", icon: Ruler },
            { id: "notes", label: "Staff Dossier Notes", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id as "overview" | "sizing" | "notes")
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 border-b-2 pb-3 text-xs font-semibold transition-colors",
                  isSelected
                    ? "border-zinc-950 text-zinc-950 dark:border-white dark:text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Overview & Orders */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Bento metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <span className="mb-1 block text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Lifetime Value
                </span>
                <PriceDisplay
                  amount={profile360?.totalSpent ?? customer.totalSpent}
                  size="md"
                />
              </div>
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <span className="mb-1 block text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Acquisitions
                </span>
                <p className="text-xl font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                  {profile360?.totalOrders ?? customer.totalOrders}
                </p>
              </div>
            </div>

            {/* Addresses */}
            {profile360?.addresses && profile360.addresses.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                  <MapPin className="h-3.5 w-3.5" />
                  Primary Delivery Coordinates
                </h4>
                <div className="space-y-2">
                  {profile360.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-lg border border-zinc-100 bg-zinc-50/40 p-3 text-xs dark:border-zinc-800"
                    >
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {addr.firstName} {addr.lastName}{" "}
                        {addr.isDefault && "(Default)"}
                      </p>
                      <p className="text-zinc-500">
                        {addr.street} {addr.apartment || ""}, {addr.city},{" "}
                        {addr.state} {addr.zip}, {addr.country}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div>
              <h4 className="mb-3 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                Order Acquisition Stream
              </h4>

              {loading360 ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : profile360?.orders && profile360.orders.length > 0 ? (
                <div className="space-y-3">
                  {profile360.orders.map((o) => {
                    const orderItem = o as Order;
                    return (
                      <div
                        key={orderItem.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/40 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <ShoppingCart className="h-4 w-4 text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              #{orderItem.id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {new Date(
                                orderItem.createdAt || ""
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <PriceDisplay amount={orderItem.total} size="sm" />
                          <span
                            className={cn(
                              "mt-1 inline-block rounded px-2 py-0.5 text-[9px] font-black uppercase",
                              orderItem.status === "DELIVERED"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : orderItem.status === "CANCELLED"
                                  ? "bg-rose-500/10 text-rose-600"
                                  : "bg-amber-500/10 text-amber-600"
                            )}
                          >
                            {orderItem.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-zinc-400 italic">
                  No acquisition history logged for this client profile.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Sizing & Biometrics */}
        {activeTab === "sizing" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="mb-4 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-zinc-600" />
                <h4 className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                  Client Biometric Measurements
                </h4>
              </div>

              {profile360?.measurements ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Height",
                      value: profile360.measurements.heightCm
                        ? `${profile360.measurements.heightCm} cm`
                        : "Not recorded",
                    },
                    {
                      label: "Weight",
                      value: profile360.measurements.weightKg
                        ? `${profile360.measurements.weightKg} kg`
                        : "Not recorded",
                    },
                    {
                      label: "Chest",
                      value: profile360.measurements.chestCm
                        ? `${profile360.measurements.chestCm} cm`
                        : "Not recorded",
                    },
                    {
                      label: "Waist",
                      value: profile360.measurements.waistCm
                        ? `${profile360.measurements.waistCm} cm`
                        : "Not recorded",
                    },
                    {
                      label: "Hips",
                      value: profile360.measurements.hipsCm
                        ? `${profile360.measurements.hipsCm} cm`
                        : "Not recorded",
                    },
                    {
                      label: "Shoe Size",
                      value: profile360.measurements.shoeEU
                        ? `EU ${profile360.measurements.shoeEU}`
                        : "Not recorded",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase">
                        {m.label}
                      </span>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400">
                  No biometric measurements submitted by the client yet.
                </div>
              )}
            </div>

            {/* Client Reviews */}
            {profile360?.reviews && profile360.reviews.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Critiques &amp; Reviews Left
                </h4>
                <div className="space-y-2">
                  {profile360.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-lg border border-zinc-100 bg-zinc-50/40 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">
                          {rev.product?.name || "Garment"}
                        </span>
                        <span className="font-bold text-amber-600">
                          ★ {rev.rating}/5
                        </span>
                      </div>
                      <p className="mt-1 text-zinc-600">{rev.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Staff Notes */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-600" />
                  <h4 className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                    Private Concierge &amp; Staff Notes
                  </h4>
                </div>
                <span className="text-[10px] text-zinc-400 italic">
                  Strictly internal
                </span>
              </div>

              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log VIP preferences, personal styling requests, custom sizing requirements, or concierge follow-ups..."
                rows={6}
                className="w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-xs font-medium text-zinc-800 transition-colors focus:border-zinc-900 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              />

              <div className="mt-3 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  icon={
                    isNotesSaved ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )
                  }
                  className="gap-1.5 text-xs"
                >
                  {savingNotes
                    ? "Saving..."
                    : isNotesSaved
                      ? "Saved to Dossier!"
                      : "Save Client Notes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDrawer>
  );
};
