"use client";

import React, { useState, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brand } from "@/types";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { cn } from "@/lib/utils";
import { ArrowRight, Upload, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

interface BrandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Brand>) => Promise<void>;
  editingBrand: Brand | null;
}

const IdentitySection = memo(({
  name,
  slug,
  description,
  status,
  onNameChange,
  onFieldChange,
}: {
  name: string;
  slug: string;
  description: string;
  status: string;
  onNameChange: (val: string) => void;
  onFieldChange: (field: string, val: string) => void;
}) => (
  <section className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="h-[1px] flex-1 bg-zinc-100" />
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Core Identity</h4>
      <div className="h-[1px] flex-1 bg-zinc-100" />
    </div>
    
    <div className="space-y-6">
      <Input
        label="Brand Name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g. Maison Margiela"
        required
      />

      <Input
        label="Custom Slug"
        value={slug}
        onChange={(e) => onFieldChange("slug", e.target.value)}
        placeholder="e.g. maison-margiela"
      />

      <Textarea
        label="Editorial Description"
        value={description}
        onChange={(e) => onFieldChange("description", e.target.value)}
        rows={5}
        placeholder="Detailed history and philosophy of the maison..."
      />

      <div className="flex items-center justify-between gap-6 px-5 py-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
        <div className="flex flex-col flex-1">
          <h4 className="text-sm font-semibold tracking-wide text-zinc-950">Publication Status</h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Toggle visibility on the main archival feed</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onFieldChange("status", status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shrink-0",
              status === 'ACTIVE' ? "bg-black" : "bg-zinc-300"
            )}
          >
            <motion.div 
              initial={false}
              animate={{ x: status === 'ACTIVE' ? 24 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm pointer-events-none" 
            />
          </button>
        </div>
      </div>
    </div>
  </section>
));
IdentitySection.displayName = "IdentitySection";

const MediaSection = memo(({ logo, onLogoUpload, onRemoveLogo, isUploading }: {
  logo: string;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  isUploading: boolean;
}) => (
  <section className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="h-[1px] flex-1 bg-zinc-100" />
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Brand Insignia</h4>
      <div className="h-[1px] flex-1 bg-zinc-100" />
    </div>
    
    <div className="space-y-4">
      {logo ? (
        <div className="relative aspect-[3/4] w-full rounded-xl bg-zinc-50 overflow-hidden border border-zinc-200 group lg:max-w-xs mx-auto flex items-center justify-center p-8">
          <img src={logo} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110" alt="Logo Preview" />
          <button
            type="button"
            onClick={onRemoveLogo}
            className="absolute top-3 right-3 bg-white p-2 text-zinc-600 rounded-full shadow-md hover:bg-zinc-100 transition-colors z-10 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-zinc-200 rounded-xl hover:border-zinc-950 cursor-pointer transition-all duration-300 hover:bg-zinc-50 group lg:max-w-xs mx-auto">
          <input type="file" className="hidden" accept="image/*" onChange={onLogoUpload} disabled={isUploading} />
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <div className="animate-spin h-6 w-6 border-2 border-zinc-950 border-t-transparent rounded-full" />
            ) : (
              <Upload size={24} strokeWidth={1.5} className="text-zinc-300 group-hover:text-zinc-950 transition-colors" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-950 group-hover:text-zinc-950 transition-colors">
                {isUploading ? "Uploading insignia..." : "Upload logo"}
              </p>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">PNG, SVN, WEBP</p>
            </div>
          </div>
        </label>
      )}
    </div>
  </section>
));
MediaSection.displayName = "MediaSection";

export const BrandDrawer = React.memo(({ 
  isOpen,
  onClose,
  onSave,
  editingBrand
}: BrandDrawerProps) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    logo: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingBrand) {
      setFormData({
        name: editingBrand.name,
        slug: editingBrand.slug,
        description: editingBrand.description || "",
        status: (editingBrand as Brand & { status?: string }).status || "ACTIVE",
        logo: editingBrand.logo || "",
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        status: "ACTIVE",
        logo: "",
      });
    }
  }, [editingBrand, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleNameChange = React.useCallback((name: string) => {
    if (!editingBrand) {
      const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
      setFormData(prev => ({ ...prev, name, slug }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  }, [editingBrand]);

  const handleFieldChange = React.useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res.data.success) {
        setFormData(prev => ({ ...prev, logo: res.data.data.url }));
        toast.success("Logo attached securely");
      }
    } catch (err) {
      toast.error("Failed to upload insignia. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRemoveLogo = React.useCallback(() => {
    setFormData(prev => ({ ...prev, logo: "" }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            style={{ willChange: "transform", z: 0 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-8 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-20">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {editingBrand ? "Sync Maison" : "Archive New Brand"}
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  {editingBrand ? `Brand ID: ${editingBrand.id.slice(-6).toUpperCase()}` : "Initiating brand identity"}
                </p>
              </div>
              <CloseButton onClick={onClose} />
            </div>

            {/* Scroll Area */}
            <form id="brand-panel-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-8 py-10 space-y-16">
              <IdentitySection
                name={formData.name}
                slug={formData.slug}
                description={formData.description}
                status={formData.status}
                onNameChange={handleNameChange}
                onFieldChange={handleFieldChange}
              />

              <MediaSection
                logo={formData.logo}
                onLogoUpload={handleLogoUpload}
                onRemoveLogo={handleRemoveLogo}
                isUploading={isUploading}
              />

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Search Presence</h4>
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                </div>
                
                <div className="p-8 bg-zinc-50/50 rounded-xl space-y-3 border border-zinc-100 shadow-inner">
                  <p className="text-[#1a0dab] text-xl font-medium tracking-tight truncate hover:underline cursor-pointer">
                    {formData.name || "Maison Curator"} | Luxury Portfolio
                  </p>
                  <div className="flex items-center gap-1.5 text-[#006621] text-xs font-medium">
                    <span>thecurator.com</span>
                    <ArrowRight size={10} className="text-zinc-400" />
                    <span>brands</span>
                    <ArrowRight size={10} className="text-zinc-400" />
                    <span className="truncate">{formData.slug || "new-maison"}</span>
                  </div>
                  <p className="text-zinc-500 text-[13px] leading-relaxed line-clamp-2 italic font-serif">
                    {formData.description || "Refining the history and curated vision of this maison within the Cinematic repository... "}
                  </p>
                </div>
              </section>
            </form>

            {/* Footer */}
            <div className="px-8 py-8 border-t border-zinc-100 bg-white sticky bottom-0 flex gap-4 shadow-[0_-20px_60px_rgba(0,0,0,0.02)] z-20">
              <Button
                type="button"
                variant="outline"
                className="flex-1 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-sm"
                onClick={onClose}
              >
                Discard
              </Button>
              <Button
                type="submit"
                form="brand-panel-form"
                variant="primary"
                className="flex-1 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-sm shadow-2xl shadow-black/10 transition-all hover:-translate-y-0.5"
                isLoading={loading}
              >
                {editingBrand ? "Apply Sync" : "Manifest Brand"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
});
BrandDrawer.displayName = "BrandDrawer";
