"use client";

import React, { useState, useEffect, useRef } from "react";
import { Brand } from "@/types";
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

export const BrandForm: React.FC<BrandFormProps> = ({ brand, onSuccess, onCancel }) => {
  const isEditing = !!brand;
  const [name, setName] = useState(brand?.name || "");
  const [slug, setSlug] = useState(brand?.slug || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [logo, setLogo] = useState(brand?.logo || "");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(brand?.status || "ACTIVE");
  
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to delete brand");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="bg-white border border-outline-variant/30 rounded-[4px] p-8 shadow-sm flex flex-col min-h-[600px]">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-lg font-semibold text-on-surface">
          {isEditing ? "Edit Brand" : "Add Brand"}
        </h3>
        {isEditing && (
          <span className="text-[11px] uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-1">
            Editing {brand?.name}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 flex-grow">
        {/* Logo Upload */}
        <div className="flex flex-col items-center mb-12">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "cursor-pointer group relative",
            )}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                <CloudUpload className="text-stone-300 text-4xl group-hover:text-stone-900 transition-colors" />
                <span className="text-[12px] text-on-surface-variant text-center px-8">
                  Drag & drop or click to upload
                </span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                <span className="text-[12px] text-on-surface-variant font-medium">Uploading...</span>
              </div>
            )}
            {logo && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
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
          <label className="mt-4 text-[11px] uppercase tracking-widest text-on-surface-variant font-medium">Brand Logo</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-medium">Brand Name</label>
            <input 
              className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-sm h-[48px] px-4 text-on-surface text-sm transition-all outline-none" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Velasquez"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-medium">Slug</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-stone-400 text-sm">/</span>
              <input 
                className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-sm h-[48px] pl-7 pr-4 text-on-surface text-sm transition-all outline-none" 
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
          <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-medium">Brand Story (Bio)</label>
          <textarea 
            className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-sm p-4 text-on-surface text-sm transition-all outline-none resize-none" 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Defining luxury through the lens of architectural minimalism..."
          />
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
          <div>
            <p className="text-sm font-medium">Brand Visibility</p>
            <p className="text-[11px] text-on-surface-variant">Control if this brand is visible in filters.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-on-surface-variant">Status:</span>
            <div 
              onClick={() => setStatus(status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className={cn(
                "w-10 h-5 rounded-full relative flex items-center px-1 transition-colors tabular-nums",
                status === "ACTIVE" ? "bg-primary" : "bg-surface-container-high"
              )}>
                <div className={cn(
                  "w-3 h-3 bg-white rounded-full transition-all",
                  status === "ACTIVE" ? "ml-auto" : "ml-0"
                )}></div>
              </div>
              <span className={cn(
                "text-[13px] font-medium transition-colors",
                status === "ACTIVE" ? "text-primary" : "text-on-surface-variant"
              )}>
                {status === "ACTIVE" ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="mt-12 pt-8 border-t border-outline-variant/10 flex flex-col gap-4">
        <div className="flex gap-3">
          <Button 
            className="flex-grow h-[48px]" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEditing ? "Save Changes" : "Create Brand"}
          </Button>
          <Button 
            variant="outline" 
            className="px-8 h-[48px]" 
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
              className="text-error text-[13px] font-medium flex items-center gap-1 hover:underline group"
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
