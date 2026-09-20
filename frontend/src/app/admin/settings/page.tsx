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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { contentApi } from "@/lib/api";

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
};

type AdminSettingsTab = "general" | "shipping" | "tax" | "notifications";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminSettingsTab>("general");
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<AdminSettingsState>("admin_settings")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setSettings((prev) => ({ ...prev, ...res.data.data }));
          try {
            localStorage.setItem(
              "curator_admin_settings",
              JSON.stringify(res.data.data)
            );
          } catch {}
        }
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
      await contentApi.upsert("admin_settings", settings);
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
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                  Default Store Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="JPY">JPY (¥) — Japanese Yen</option>
                </select>
              </div>

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
