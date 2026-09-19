"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminDrawer } from "./AdminDrawer";
import { RotateCcw, Calendar, Percent, DollarSign } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import type { DiscountItem } from "@/app/admin/discounts/page";

interface DiscountFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  discount?: DiscountItem | null;
  onSuccess: () => void;
}

const SubsectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-4 py-4">
    <div className="h-[1px] flex-1 bg-zinc-100" />
    <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
      {title}
    </h4>
    <div className="h-[1px] flex-1 bg-zinc-100" />
  </div>
);

export const DiscountFormPanel: React.FC<DiscountFormPanelProps> = ({
  isOpen,
  onClose,
  discount,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    minOrder: "",
    maxUses: "",
    startDate: "",
    expiresAt: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code,
        type: discount.type as "PERCENTAGE" | "FIXED",
        value: discount.value.toString(),
        minOrder: discount.minOrder?.toString() || "",
        maxUses: discount.maxUses?.toString() || "",
        startDate: discount.startDate
          ? new Date(discount.startDate).toISOString().split("T")[0]
          : "",
        expiresAt: discount.expiresAt
          ? new Date(discount.expiresAt).toISOString().split("T")[0]
          : "",
        isActive: discount.isActive,
      });
    } else {
      setFormData({
        code: "",
        type: "PERCENTAGE",
        value: "",
        minOrder: "",
        maxUses: "",
        startDate: "",
        expiresAt: "",
        isActive: true,
      });
    }
  }, [discount, isOpen]);

  const generateRandomCode = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "CURATOR-";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: result }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.value) {
      toast.error("Manifest incomplete: Code and value are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minOrder: formData.minOrder ? parseFloat(formData.minOrder) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        startDate: formData.startDate || null,
        expiresAt: formData.expiresAt || null,
      };

      if (discount) {
        await adminApi.updateDiscount(discount.id, payload);
        toast.success("Catalog entry synchronized.");
      } else {
        await adminApi.createDiscount(payload);
        toast.success("New promotion manifested.");
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Sync failure."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={discount ? "Refine Promotion" : "New Manifest"}
      subtitle={
        discount
          ? `REF: ${discount.id.slice(-6).toUpperCase()}`
          : "Designing a new editorial reward"
      }
      footer={
        <>
          <Button
            variant="outline"
            className="flex-1 rounded-sm py-6 text-[10px] font-black tracking-[0.2em] uppercase"
            onClick={onClose}
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 rounded-sm py-6 text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-black/10 transition-all hover:-translate-y-0.5"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {discount ? "Sync Manifest" : "Save Manifest"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Promotion Context */}
        <section className="space-y-6">
          <SubsectionHeader title="Promotion Context" />

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Discount Code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. SUMMER24"
                  className="py-4 font-mono tracking-widest uppercase"
                  required
                />
              </div>
              <div className="pt-7">
                <Button
                  type="button"
                  variant="none"
                  size="none"
                  onClick={generateRandomCode}
                  className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-zinc-400 shadow-sm hover:border-zinc-300 hover:text-zinc-950"
                  title="Generate Random Code"
                >
                  <RotateCcw size={18} />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="ml-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
              Reward Classification
            </label>
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-zinc-100 bg-zinc-50 p-1.5">
              <Button
                type="button"
                variant="none"
                size="none"
                onClick={() => setFormData({ ...formData, type: "PERCENTAGE" })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black tracking-widest uppercase transition-all",
                  formData.type === "PERCENTAGE"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <Percent size={14} />
                <span>Percentage</span>
              </Button>
              <Button
                type="button"
                variant="none"
                size="none"
                onClick={() => setFormData({ ...formData, type: "FIXED" })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black tracking-widest uppercase transition-all",
                  formData.type === "FIXED"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <DollarSign size={14} />
                <span>Fixed Amount</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Financial Matrix */}
        <section className="space-y-6">
          <SubsectionHeader title="Financial Matrix" />
          <div className="grid grid-cols-2 gap-6">
            <Input
              label={formData.type === "PERCENTAGE" ? "Value (%)" : "Value ($)"}
              type="number"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              placeholder={formData.type === "PERCENTAGE" ? "20" : "50.00"}
              required
            />
            <Input
              label="Minimum Order"
              type="number"
              value={formData.minOrder}
              onChange={(e) =>
                setFormData({ ...formData, minOrder: e.target.value })
              }
              placeholder="0.00"
              icon={<span className="text-[10px] font-bold">$</span>}
            />
          </div>
        </section>

        {/* Temporal & Cycle */}
        <section className="space-y-6">
          <SubsectionHeader title="Temporal & Cycle" />
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Usage Limit"
              type="number"
              value={formData.maxUses}
              onChange={(e) =>
                setFormData({ ...formData, maxUses: e.target.value })
              }
              placeholder="Unlimited"
            />
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                Cycle Start
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full appearance-none rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3.5 text-sm transition-all focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                Cycle End / Expiry
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full appearance-none rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3.5 text-sm transition-all focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Publication Status */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-6 rounded-2xl border border-zinc-100 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-1 flex-col">
              <h4 className="text-sm font-bold tracking-tight text-zinc-950">
                Manifest Status
              </h4>
              <p className="mt-1 text-[11px] font-medium text-zinc-400 italic">
                Instantly enable this code in the archival cycle.
              </p>
            </div>
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={cn(
                "relative h-6 w-12 rounded-full transition-colors duration-300",
                formData.isActive ? "bg-zinc-950" : "bg-zinc-200"
              )}
            >
              <motion.div
                initial={false}
                animate={{ x: formData.isActive ? 24 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
              />
            </Button>
          </div>
        </section>
      </form>
    </AdminDrawer>
  );
};
