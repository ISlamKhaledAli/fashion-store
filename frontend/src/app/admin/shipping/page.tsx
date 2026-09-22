"use client";

import React, { useState, useEffect } from "react";
import { adminShippingApi } from "@/lib/api";
import type { ShippingZone } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Truck, Plus, Trash2, Edit2, Globe2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);

  const [name, setName] = useState("");
  const [countriesText, setCountriesText] = useState("EG");
  const [standardRate, setStandardRate] = useState("10");
  const [expressRate, setExpressRate] = useState("20");
  const [freeAbove, setFreeAbove] = useState("150");
  const [isActive, setIsActive] = useState(true);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await adminShippingApi.getZones();
      if (res.data?.success && res.data?.data) {
        setZones(res.data.data);
      }
    } catch {
      toast.error("Failed to load shipping zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchZones();
  }, []);

  const handleOpenCreate = () => {
    setEditingZone(null);
    setName("");
    setCountriesText("EG");
    setStandardRate("10");
    setExpressRate("20");
    setFreeAbove("150");
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setName(zone.name);
    setCountriesText(
      Array.isArray(zone.countries) ? zone.countries.join(", ") : "EG"
    );
    setStandardRate(String(zone.standardRate));
    setExpressRate(zone.expressRate !== null ? String(zone.expressRate) : "");
    setFreeAbove(zone.freeAbove !== null ? String(zone.freeAbove) : "");
    setIsActive(zone.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const countries = countriesText
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const payload = {
      name,
      countries,
      standardRate: parseFloat(standardRate) || 0,
      expressRate: expressRate ? parseFloat(expressRate) : undefined,
      freeAbove: freeAbove ? parseFloat(freeAbove) : undefined,
      isActive,
    };

    try {
      if (editingZone) {
        await adminShippingApi.updateZone(editingZone.id, payload);
        toast.success("Shipping zone updated");
      } else {
        await adminShippingApi.createZone(payload);
        toast.success("Shipping zone created");
      }
      setModalOpen(false);
      void fetchZones();
    } catch {
      toast.error("Failed to save shipping zone");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping zone?")) return;
    try {
      await adminShippingApi.deleteZone(id);
      toast.success("Shipping zone removed");
      void fetchZones();
    } catch {
      toast.error("Failed to delete shipping zone");
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            Shipping Zones &amp; Delivery Rules
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Define dynamic regional shipping rates, courier tiers, and free
            shipping cart thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
        >
          <Plus className="h-4 w-4" />
          Add Shipping Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-zinc-400">
            Loading shipping zones...
          </div>
        ) : zones.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">
            No shipping zones created yet. Click above to define your first
            delivery zone.
          </div>
        ) : (
          zones.map((zone) => (
            <div
              key={zone.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-600" />
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {zone.name}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      zone.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {zone.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      Countries:{" "}
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {Array.isArray(zone.countries)
                          ? zone.countries.join(", ")
                          : "Any"}
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    <span>Standard Shipping:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(zone.standardRate)}
                    </span>
                  </div>

                  {typeof zone.expressRate === "number" && (
                    <div className="flex justify-between">
                      <span>Express Shipping:</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(zone.expressRate)}
                      </span>
                    </div>
                  )}

                  {typeof zone.freeAbove === "number" && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Free Shipping Above:</span>
                      <span className="font-bold">
                        {formatCurrency(zone.freeAbove)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(zone)}
                  className="inline-flex items-center gap-1 rounded border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(zone.id)}
                  className="inline-flex items-center gap-1 rounded border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Zone Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {editingZone ? "Edit Shipping Zone" : "New Shipping Zone"}
            </h3>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Zone Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cairo Metro, Upper Egypt, Gulf Countries"
                  className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Country Codes (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={countriesText}
                  onChange={(e) => setCountriesText(e.target.value)}
                  placeholder="e.g. EG, SA, AE"
                  className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                    Standard Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={standardRate}
                    onChange={(e) => setStandardRate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                    Express Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={expressRate}
                    onChange={(e) => setExpressRate(e.target.value)}
                    placeholder="Optional"
                    className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Free Shipping Cart Threshold ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={freeAbove}
                  onChange={(e) => setFreeAbove(e.target.value)}
                  placeholder="e.g. 150 (Leave empty for no free shipping)"
                  className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <label
                  htmlFor="isActive"
                  className="text-xs text-zinc-700 dark:text-zinc-300"
                >
                  Active and available at checkout
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
