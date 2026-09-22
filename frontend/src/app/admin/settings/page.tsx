"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Store,
  Truck,
  Percent,
  Bell,
  Save,
  RotateCcw,
  AlertTriangle,
  Clock,
  ShoppingBag,
  MapPin,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { contentApi, adminSettingsApi } from "@/lib/api";

interface AdminSettingsState {
  storeName: string;
  tagline: string;
  supportEmail: string;
  currency: string;
  freeShippingThreshold: number;
  domesticShippingFee: number;
  internationalShippingFee: number;
  taxRatePercent: number;
  includeTaxInPrices: boolean;
  lowStockThreshold: number;
  notifyOnNewOrders: boolean;
  notifyOnLowStock: boolean;
  maintenanceMode: boolean;
  // Rental System Controls
  enableRentalSystem: boolean;
  enableSecurityDeposit: boolean;
  defaultLateFeePerDay: number;
  maxRentalExtensionDays: number;
  storeSalons: Array<{ name: string; address: string }>;
  // Abandoned Cart Recovery
  enableAbandonedCartRecovery: boolean;
  abandonedCartEmailDelay: number;
  abandonedCartDiscountPercent: number;
}

const defaultSettings: AdminSettingsState = {
  storeName: "The Curator",
  tagline: "Archival Atelier & Haute Prêt-à-Porter",
  supportEmail: "concierge@thecurator.com",
  currency: "USD",
  freeShippingThreshold: 250,
  domesticShippingFee: 15,
  internationalShippingFee: 25,
  taxRatePercent: 8.5,
  includeTaxInPrices: false,
  lowStockThreshold: 3,
  notifyOnNewOrders: true,
  notifyOnLowStock: true,
  maintenanceMode: false,
  enableRentalSystem: true,
  enableSecurityDeposit: true,
  defaultLateFeePerDay: 15,
  maxRentalExtensionDays: 7,
  storeSalons: [
    { name: "Cairo Flagship Salon", address: "15 Brazil St, Zamalek, Cairo" },
    { name: "Alexandria Boutique", address: "Glim Bay, Alexandria" },
  ],
  enableAbandonedCartRecovery: true,
  abandonedCartEmailDelay: 60,
  abandonedCartDiscountPercent: 5,
};

type AdminSettingsTab =
  "general" | "shipping" | "tax" | "notifications" | "rental" | "recovery";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminSettingsTab>("general");
  const [showResetModal, setShowResetModal] = useState(false);
  const [newSalonName, setNewSalonName] = useState("");
  const [newSalonAddress, setNewSalonAddress] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      contentApi.getByKey<AdminSettingsState>("admin_settings"),
      adminSettingsApi.getSettings(),
    ])
      .then(([contentRes, adminRes]) => {
        if (!isMounted) return;
        let merged = { ...defaultSettings };
        if (contentRes.status === "fulfilled" && contentRes.value.data?.data) {
          merged = { ...merged, ...contentRes.value.data.data };
        }
        if (adminRes.status === "fulfilled" && adminRes.value.data?.data) {
          const adminData = adminRes.value.data.data as Record<string, unknown>;
          if (Array.isArray(adminData.storeSalons)) {
            merged.storeSalons = adminData.storeSalons as Array<{
              name: string;
              address: string;
            }>;
          }
        }
        setSettings(merged);
        try {
          localStorage.setItem(
            "curator_admin_settings",
            JSON.stringify(merged)
          );
        } catch {}
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("curator_admin_settings");
          if (saved && isMounted) {
            setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
          }
        } catch {}
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = <K extends keyof AdminSettingsState>(
    field: K,
    value: AdminSettingsState[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await Promise.allSettled([
        contentApi.upsert("admin_settings", settings),
        adminSettingsApi.updateSetting(
          "lowStockThreshold",
          settings.lowStockThreshold
        ),
        adminSettingsApi.updateSetting(
          "enableSecurityDeposit",
          settings.enableSecurityDeposit
        ),
        adminSettingsApi.updateSetting(
          "defaultLateFeePerDay",
          settings.defaultLateFeePerDay
        ),
        adminSettingsApi.updateSetting(
          "maxRentalExtensionDays",
          settings.maxRentalExtensionDays
        ),
        adminSettingsApi.updateSetting(
          "enableAbandonedCartRecovery",
          settings.enableAbandonedCartRecovery
        ),
        adminSettingsApi.updateSetting(
          "abandonedCartEmailDelay",
          settings.abandonedCartEmailDelay
        ),
        adminSettingsApi.updateSetting(
          "abandonedCartDiscountPercent",
          settings.abandonedCartDiscountPercent
        ),
        adminSettingsApi.updateSetting("storeSalons", settings.storeSalons),
      ]);
      try {
        localStorage.setItem(
          "curator_admin_settings",
          JSON.stringify(settings)
        );
      } catch {}
      toast.success("Platform settings updated and synced successfully");
    } catch {
      try {
        localStorage.setItem(
          "curator_admin_settings",
          JSON.stringify(settings)
        );
      } catch {}
      toast.error("Failed to sync settings to server (saved locally)");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setShowResetModal(true);
  };

  const executeResetDefaults = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("curator_admin_settings");
    toast.info("Settings restored to factory defaults");
    setShowResetModal(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            <Settings className="text-zinc-700" size={28} />
            Store Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure boutique identity, checkout rules, logistics thresholds,
            and administrative preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2 text-xs"
          >
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase"
          >
            <Save size={15} />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2">
        {[
          { id: "general", label: "Store Identity", icon: Store },
          { id: "shipping", label: "Logistics & Shipping", icon: Truck },
          { id: "tax", label: "Taxes & Currency", icon: Percent },
          { id: "notifications", label: "Alerts & Operations", icon: Bell },
          { id: "rental", label: "Rental System", icon: Clock },
          { id: "recovery", label: "Cart Recovery", icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminSettingsTab)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Forms by Tab */}
      <form onSubmit={handleSave} className="max-w-4xl space-y-8">
        {/* Tab 1: General */}
        {activeTab === "general" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Boutique Identity
              </h3>
              <p className="text-xs text-zinc-500">
                Public store branding and customer support contacts
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  Store Display Name
                </label>
                <Input
                  value={settings.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  placeholder="The Curator"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  Support & Concierge Email
                </label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                  placeholder="concierge@thecurator.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                Editorial Tagline / Motto
              </label>
              <Input
                value={settings.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="Archival Atelier & Haute Prêt-à-Porter"
              />
            </div>
          </motion.div>
        )}

        {/* Tab 2: Shipping */}
        {activeTab === "shipping" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Logistics & Shipping Thresholds
              </h3>
              <p className="text-xs text-zinc-500">
                Manage delivery tariffs and complimentary shipping
                qualifications
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  Free Shipping Minimum ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    handleChange(
                      "freeShippingThreshold",
                      Number(e.target.value)
                    )
                  }
                  required
                />
                <p className="mt-1 text-[11px] text-zinc-400">
                  Orders exceeding this amount receive free shipping.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  Domestic Express Fee ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={settings.domesticShippingFee}
                  onChange={(e) =>
                    handleChange("domesticShippingFee", Number(e.target.value))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  International Express Fee ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={settings.internationalShippingFee}
                  onChange={(e) =>
                    handleChange(
                      "internationalShippingFee",
                      Number(e.target.value)
                    )
                  }
                  required
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Taxes & Currency */}
        {activeTab === "tax" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Taxes & Regional Currency
              </h3>
              <p className="text-xs text-zinc-500">
                Configure sales tax rates and base currency conventions
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Default Store Currency"
                value={settings.currency}
                onChange={(val) => handleChange("currency", val)}
                options={[
                  { value: "USD", label: "USD ($) — United States Dollar" },
                  { value: "EUR", label: "EUR (€) — Euro" },
                  { value: "GBP", label: "GBP (£) — British Pound" },
                  { value: "JPY", label: "JPY (¥) — Japanese Yen" },
                ]}
                className="w-full"
              />

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  Default Sales Tax Rate (%)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.taxRatePercent}
                  onChange={(e) =>
                    handleChange("taxRatePercent", Number(e.target.value))
                  }
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.includeTaxInPrices}
                  onChange={(e) =>
                    handleChange("includeTaxInPrices", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-sm font-medium text-zinc-800">
                  Prices are tax-inclusive (VAT standard in UK/Europe)
                </span>
              </label>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Notifications & Operations */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Operational Alerts & Maintenance
              </h3>
              <p className="text-xs text-zinc-500">
                Automated administrative dispatches and store status
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  Low Stock Threshold Warning (Units)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) =>
                    handleChange("lowStockThreshold", Number(e.target.value))
                  }
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-3 pt-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewOrders}
                    onChange={(e) =>
                      handleChange("notifyOnNewOrders", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-800">
                    Send admin email dispatch on every newly completed order
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnLowStock}
                    onChange={(e) =>
                      handleChange("notifyOnLowStock", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-800">
                    Send instant restock warning when variant drops below
                    threshold
                  </span>
                </label>
              </div>

              <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50/60 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="mt-0.5 shrink-0 text-amber-600"
                    size={18}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      Maintenance Mode
                    </h4>
                    <p className="mt-1 text-xs text-amber-700">
                      When enabled, storefront displays a private curation
                      notice to visitors while allowing admins access.
                    </p>
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) =>
                          handleChange("maintenanceMode", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-semibold tracking-wider text-amber-950 uppercase">
                        Enable Maintenance Mode
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Rental System */}
        {activeTab === "rental" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Luxury Rental System Controls
              </h3>
              <p className="text-xs text-zinc-500">
                Global settings for couture bookings, deposit policy, and
                overdue policies.
              </p>
            </div>

            <div className="space-y-6">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableRentalSystem}
                  onChange={(e) =>
                    handleChange("enableRentalSystem", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <div>
                  <span className="text-sm font-semibold text-zinc-800">
                    Enable Rental Service on Storefront
                  </span>
                  <p className="text-xs text-zinc-500">
                    Allows customers to book and rent designated archive
                    garments
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableSecurityDeposit}
                  onChange={(e) =>
                    handleChange("enableSecurityDeposit", e.target.checked)
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <div>
                  <span className="text-sm font-semibold text-zinc-800">
                    Mandatory Refundable Security Deposit
                  </span>
                  <p className="text-xs text-zinc-500">
                    Collect deposit held safely on card until piece is returned
                    and inspected
                  </p>
                </div>
              </label>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                    Default Overdue Fee per Day ($)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={settings.defaultLateFeePerDay}
                    onChange={(e) =>
                      handleChange(
                        "defaultLateFeePerDay",
                        Number(e.target.value)
                      )
                    }
                    className="mt-2"
                  />
                  <span className="mt-1 block text-[11px] text-zinc-500">
                    Applied automatically when item return date has expired.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                    Max Extension Allowance (Days)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.maxRentalExtensionDays}
                    onChange={(e) =>
                      handleChange(
                        "maxRentalExtensionDays",
                        Number(e.target.value)
                      )
                    }
                    className="mt-2"
                  />
                  <span className="mt-1 block text-[11px] text-zinc-500">
                    Maximum extra days customer can request to extend their
                    wear.
                  </span>
                </div>
              </div>

              {/* Salon Pickup Locations Section */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      <MapPin className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                      Salon Pickup Locations
                    </h4>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Manage boutique flagship branches where customers can
                      collect and return luxury pieces.
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {settings.storeSalons?.length || 0} Locations
                  </span>
                </div>

                {/* List of active salon locations */}
                <div className="mb-4 space-y-2.5">
                  {(settings.storeSalons || []).map((salon, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {salon.name}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {salon.address}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            storeSalons: (prev.storeSalons || []).filter(
                              (_, i) => i !== idx
                            ),
                          }));
                          toast.info("Salon removed from draft");
                        }}
                        className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  ))}

                  {(!settings.storeSalons ||
                    settings.storeSalons.length === 0) && (
                    <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
                      No salon pickup locations configured yet. Add your first
                      boutique salon below.
                    </div>
                  )}
                </div>

                {/* Add New Salon Form */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <h5 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                    <Plus className="h-3.5 w-3.5" /> Add New Boutique / Salon
                  </h5>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        Salon Name
                      </label>
                      <Input
                        placeholder="e.g. Cairo Flagship Salon (Zamalek)"
                        value={newSalonName}
                        onChange={(e) => setNewSalonName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        Full Address &amp; Landmarks
                      </label>
                      <Input
                        placeholder="e.g. 15 Brazil St, Zamalek, Cairo"
                        value={newSalonAddress}
                        onChange={(e) => setNewSalonAddress(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3.5 flex justify-end">
                    <Button
                      type="button"
                      disabled={!newSalonName.trim() || !newSalonAddress.trim()}
                      onClick={() => {
                        if (!newSalonName.trim() || !newSalonAddress.trim())
                          return;
                        setSettings((prev) => ({
                          ...prev,
                          storeSalons: [
                            ...(prev.storeSalons || []),
                            {
                              name: newSalonName.trim(),
                              address: newSalonAddress.trim(),
                            },
                          ],
                        }));
                        setNewSalonName("");
                        setNewSalonAddress("");
                        toast.success("Salon location added to settings draft");
                      }}
                      className="text-xs"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add Salon Location
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 6: Abandoned Cart Recovery */}
        {activeTab === "recovery" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Abandoned Cart Recovery Automation
              </h3>
              <p className="text-xs text-zinc-500">
                Automatically remind visitors who left garments in bag with an
                exclusive discount code.
              </p>
            </div>

            <div className="space-y-6">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableAbandonedCartRecovery}
                  onChange={(e) =>
                    handleChange(
                      "enableAbandonedCartRecovery",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <div>
                  <span className="text-sm font-semibold text-zinc-800">
                    Enable Automated Abandoned Cart Recovery Emails
                  </span>
                  <p className="text-xs text-zinc-500">
                    Sends high-converting email with items and discount coupon
                  </p>
                </div>
              </label>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                    Email Dispatch Delay (Minutes)
                  </label>
                  <Input
                    type="number"
                    min={15}
                    max={1440}
                    value={settings.abandonedCartEmailDelay}
                    onChange={(e) =>
                      handleChange(
                        "abandonedCartEmailDelay",
                        Number(e.target.value)
                      )
                    }
                    className="mt-2"
                  />
                  <span className="mt-1 block text-[11px] text-zinc-500">
                    Time to wait before sending email after user leaves session.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                    Incentive Discount Percentage (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.abandonedCartDiscountPercent}
                    onChange={(e) =>
                      handleChange(
                        "abandonedCartDiscountPercent",
                        Number(e.target.value)
                      )
                    }
                    className="mt-2"
                  />
                  <span className="mt-1 block text-[11px] text-zinc-500">
                    Exclusive coupon generated and provided inside the recovery
                    email.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 text-xs font-semibold tracking-wider uppercase"
          >
            <Save size={15} />
            {isSaving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={executeResetDefaults}
        title="Reset Platform Settings?"
        description="Are you sure you want to reset all boutique settings, tax rates, and logistics thresholds back to initial factory defaults?"
        confirmBrand="danger"
        confirmText="Reset Defaults"
        cancelText="Keep Settings"
      />
    </div>
  );
}
