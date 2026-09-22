"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Brand } from "@/types";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { CloudUpload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BrandLogo } from "@/components/admin/BrandLogo";

interface BrandFormProps {
  brand?: Brand | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BrandForm: React.FC<BrandFormProps> = ({
  brand,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!brand;
  const [name, setName] = useState(brand?.name || "");
  const [slug, setSlug] = useState(brand?.slug || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [logo, setLogo] = useState(brand?.logo || "");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    brand?.status || "ACTIVE"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from name if not editing an existing slug (or if slug is empty)
  useEffect(() => {
    if (!isEditing && name) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      setSlug(generatedSlug);
    }
  }, [name, isEditing]);

  // Update fields if brand prop changes (e.g. switching between different brands in edit mode)
  useEffect(() => {
    if (brand) {
      setName(brand.name);
      setSlug(brand.slug);
      setDescription(brand.description || "");
      setLogo(brand.logo || "");
      setStatus(brand.status || "ACTIVE");
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setLogo("");
      setStatus("ACTIVE");
    }
  }, [brand]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res.data.success) {
        setLogo(res.data.data.url);
        toast.success("Logo uploaded successfully");
      }
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Name and slug are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name, slug, description, logo, status };
      if (isEditing && brand) {
        await adminApi.updateBrand(brand.id, payload);
        toast.success("Brand updated successfully");
      } else {
        await adminApi.createBrand(payload);
        toast.success("Brand created successfully");
      }
      onSuccess();
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "create"} brand`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!brand) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteBrand(brand.id);
      toast.success("Brand deleted successfully");
      onSuccess();
    } catch {
      toast.error("Failed to delete brand");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="flex min-h-[600px] flex-col rounded-[4px] border border-outline-variant/30 bg-white p-8 shadow-sm">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-on-surface">
          {isEditing ? "Edit Brand" : "Add Brand"}
        </h3>
        {isEditing && (
          <span className="bg-surface-container px-2 py-1 text-[11px] tracking-widest text-on-surface-variant uppercase">
            Editing {brand?.name}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-grow space-y-8">
        {/* Logo Upload */}
        <div className="mb-12 flex flex-col items-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn("group relative cursor-pointer")}
          >
            <BrandLogo
              src={logo}
              name={name || "New Brand"}
              size="xxl"
              containerClassName={cn(
                "border-dashed",
                logo ? "border-solid" : "border-outline-variant"
              )}
            />
            {!logo && !isUploading && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
                <CloudUpload className="text-4xl text-stone-300 transition-colors group-hover:text-stone-900" />
                <span className="px-8 text-center text-[12px] text-on-surface-variant">
                  Drag & drop or click to upload
                </span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
                <span className="text-[12px] font-medium text-on-surface-variant">
                  Uploading...
                </span>
              </div>
            )}
            {logo && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <CloudUpload className="text-white" size={32} />
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          <label className="mt-4 text-[11px] font-medium tracking-widest text-on-surface-variant uppercase">
            Brand Logo
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-medium tracking-widest text-on-surface-variant uppercase">
              Brand Name
            </label>
            <input
              className="h-[48px] w-full rounded-sm border-none bg-surface-container-low px-4 text-sm text-on-surface transition-all outline-none focus:ring-1 focus:ring-primary"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Velasquez"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-medium tracking-widest text-on-surface-variant uppercase">
              Slug
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm text-stone-400">/</span>
              <input
                className="h-[48px] w-full rounded-sm border-none bg-surface-container-low pr-4 pl-7 text-sm text-on-surface transition-all outline-none focus:ring-1 focus:ring-primary"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="velasquez-studio"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-medium tracking-widest text-on-surface-variant uppercase">
            Brand Story (Bio)
          </label>
          <textarea
            className="w-full resize-none rounded-sm border-none bg-surface-container-low p-4 text-sm text-on-surface transition-all outline-none focus:ring-1 focus:ring-primary"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Defining luxury through the lens of architectural minimalism..."
          />
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
          <div>
            <p className="text-sm font-medium">Brand Visibility</p>
            <p className="text-[11px] text-on-surface-variant">
              Control if this brand is visible in filters.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-on-surface-variant">Status:</span>
            <div
              onClick={() =>
                setStatus(status === "ACTIVE" ? "INACTIVE" : "ACTIVE")
              }
              className="group flex cursor-pointer items-center gap-2"
            >
              <div
                className={cn(
                  "relative flex h-5 w-10 items-center rounded-full px-1 tabular-nums transition-colors",
                  status === "ACTIVE"
                    ? "bg-primary"
                    : "bg-surface-container-high"
                )}
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full bg-white transition-all",
                    status === "ACTIVE" ? "ml-auto" : "ml-0"
                  )}
                ></div>
              </div>
              <span
                className={cn(
                  "text-[13px] font-medium transition-colors",
                  status === "ACTIVE"
                    ? "text-primary"
                    : "text-on-surface-variant"
                )}
              >
                {status === "ACTIVE" ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="mt-12 flex flex-col gap-4 border-t border-outline-variant/10 pt-8">
        <div className="flex gap-3">
          <Button
            className="h-[48px] flex-grow"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEditing ? "Save Changes" : "Create Brand"}
          </Button>
          <Button
            variant="outline"
            className="h-[48px] px-8"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>

        {isEditing && (
          <div className="flex justify-start">
            <Button
              variant="none"
              size="none"
              onClick={() => setIsConfirmOpen(true)}
              className="group flex items-center gap-1 text-[13px] font-medium text-error hover:underline"
            >
              <Trash2 className="text-error" size={16} />
              Delete Brand
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Brand"
        description={`Are you sure you want to delete "${name}"? This action cannot be undone and may affect products linked to this brand.`}
        confirmText="Delete Brand"
        cancelText="Cancel"
        confirmBrand="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
