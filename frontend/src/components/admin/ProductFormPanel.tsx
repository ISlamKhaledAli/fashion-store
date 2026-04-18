"use client";

import React, { useState, useEffect, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Upload, Check, Trash2, ArrowRight } from "lucide-react";
import { Product, Category, Brand, Variant } from "@/types";
import { Button } from "@/components/ui/Button";
import { AdminDrawer } from "./AdminDrawer";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { Skeleton } from "../ui/Skeleton";
import { adminApi, categoryApi, brandApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductVariantsTable } from "./ProductVariantsTable";

// --- Memoized Sections ---

interface IdentitySectionProps {
  name: string;
  slug: string;
  categoryId: string;
  brandId: string;
  description: string;
  status: string;
  categoryOptions: { label: string; value: string }[];
  brandOptions: { label: string; value: string }[];
  onNameChange: (val: string) => void;
  onFieldChange: (field: string, val: string) => void;
  errors: Record<string, string>;
}

const IdentitySection = memo(({ 
  name, 
  slug,
  categoryId, 
  brandId, 
  description, 
  status,
  categoryOptions, 
  brandOptions, 
  onNameChange, 
  onFieldChange,
  errors
}: IdentitySectionProps) => (
  <section className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="h-[1px] flex-1 bg-zinc-100" />
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Core Identity</h4>
      <div className="h-[1px] flex-1 bg-zinc-100" />
    </div>
    
    <div className="space-y-6">
      <Input
        label="Product Name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g. Sculptural Trench Coat"
        error={errors?.name}
        required
      />

      <Input
        label="Custom Slug"
        value={slug}
        onChange={(e) => onFieldChange("slug", e.target.value)}
        placeholder="e.g. sculptural-trench-coat"
        error={errors?.slug}
      />

      <div className="grid grid-cols-2 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Classification</label>
          <Select
            options={categoryOptions}
            value={categoryId}
            onChange={(val) => onFieldChange("categoryId", val)}
            className="w-full"
            labelPrefix="In"
            error={errors?.categoryId}
          />
        </div>
        <div className="space-y-2">
           <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Source / Brand</label>
           <Select
            options={brandOptions}
            value={brandId}
            onChange={(val) => onFieldChange("brandId", val)}
            className="w-full"
            labelPrefix="By"
            error={errors?.brandId}
          />
        </div>
      </div>

      <Textarea
        label="Editorial Description"
        value={description}
        onChange={(e) => onFieldChange("description", e.target.value)}
        rows={5}
        placeholder="Crafted from Italian wool..."
        error={errors?.description}
        required
      />

      <div className="flex items-center justify-between gap-6 px-5 py-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
        <div className="flex flex-col flex-1">
          <h4 className="text-sm font-semibold tracking-wide text-zinc-950">Publication Status</h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Toggle visibility on the main archival feed</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="none"
            size="none"
            onClick={() => onFieldChange("status", status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE')}
            disabled={status === 'ARCHIVED'}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shrink-0",
              status === 'ACTIVE' ? "bg-black" : "bg-zinc-300",
              status === 'ARCHIVED' && "opacity-50 cursor-not-allowed"
            )}
          >
            <motion.div 
              initial={false}
              animate={{ x: status === 'ACTIVE' ? 24 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm pointer-events-none" 
            />
          </Button>
          
          <Button
            type="button"
            variant={status === 'ARCHIVED' ? 'primary' : 'outline'}
            onClick={() => onFieldChange("status", status === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED')}
            className={cn(
              "px-4 py-2 h-9 rounded-lg text-[11px] font-bold uppercase tracking-widest transition shrink-0",
              status === 'ARCHIVED' 
                ? "bg-stone-900 text-white border-stone-900 hover:bg-stone-800" 
                : "border-zinc-200 hover:bg-zinc-50"
            )}
          >
            {status === 'ARCHIVED' ? "Archived" : "Archive"}
          </Button>
        </div>
      </div>
    </div>
  </section>
));
IdentitySection.displayName = "IdentitySection";

const PricingSection = memo(({ price, comparePrice, cost, margin, onFieldChange, errors }: {
  price: number;
  comparePrice?: number;
  cost?: number;
  margin: string;
  onFieldChange: (field: string, val: number | string) => void;
  errors: Record<string, string>;
}) => (
  <section className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="h-[1px] flex-1 bg-zinc-100" />
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Financial Matrix</h4>
      <div className={cn(
        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
        Number(margin) > 40 ? "bg-green-50 text-green-700 border-green-100" : "bg-zinc-50 text-zinc-400 border-zinc-200"
      )}>
        Margin: {margin}%
      </div>
      <div className="h-[1px] flex-1 bg-zinc-100" />
    </div>

    <div className="grid grid-cols-3 gap-6">
      <Input
        label="Price"
        type="number"
        value={price}
        onChange={(e) => onFieldChange("price", parseFloat(e.target.value) || 0)}
        icon={<span className="text-xs font-bold">$</span>}
        error={errors?.price}
      />
      <Input
        label="Compare"
        type="number"
        value={comparePrice}
        onChange={(e) => onFieldChange("comparePrice", parseFloat(e.target.value) || 0)}
        icon={<span className="text-xs font-bold">$</span>}
      />
      <Input
        label="Cost"
        type="number"
        value={cost}
        onChange={(e) => onFieldChange("cost", parseFloat(e.target.value) || 0)}
        icon={<span className="text-xs font-bold">$</span>}
      />
    </div>
  </section>
));
PricingSection.displayName = "PricingSection";

const MediaSection = memo(({ images, onUpload, onSetMain, onRemove }: {
  images: { url: string; publicId: string; isMain: boolean }[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetMain: (idx: number) => void;
  onRemove: (idx: number) => void;
}) => (
  <section className="space-y-8">
    <div className="flex items-center gap-4">
      <div className="h-[1px] flex-1 bg-zinc-100" />
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Archival Imagery</h4>
      <div className="h-[1px] flex-1 bg-zinc-100" />
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      {images.map((img: { url: string; publicId: string; isMain: boolean }, idx: number) => (
        <motion.div 
          layout
          key={img.publicId} 
          className={cn(
            "aspect-[3/4] rounded-sm bg-zinc-50 overflow-hidden relative group border-2 transition-all duration-500 shadow-sm",
            img.isMain ? "border-zinc-950 scale-[1.02] z-10" : "border-transparent"
          )}
        >
          <img src={img.url} className="w-full h-full object-cover" alt="Product piece" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() => onSetMain(idx)}
              className="bg-white p-2 text-zinc-950 rounded-full hover:scale-110 transition-transform shadow-lg"
              icon={<Check size={14} className={img.isMain ? "text-green-600" : ""} />}
            />
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() => onRemove(idx)}
              className="bg-white p-2 text-red-500 rounded-full hover:scale-110 transition-transform shadow-lg"
              icon={<Trash2 size={14} />}
            />
          </div>
          <div className="absolute top-2 left-2 z-20">
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() => onSetMain(idx)}
              className={cn(
                "px-2 py-0.5 text-[7px] font-black uppercase tracking-widest rounded-full transition-all duration-300",
                img.isMain 
                  ? "bg-black text-white shadow-lg scale-105" 
                  : "bg-zinc-200 text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-zinc-300"
              )}
            >
              Primary View
            </Button>
          </div>
        </motion.div>
      ))}
      <label className="aspect-[3/4] border-2 border-dashed border-zinc-200 rounded-sm hover:border-zinc-950 cursor-pointer transition-all duration-500 hover:bg-zinc-50 group">
        <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
        <div className="flex items-center justify-center h-full w-full p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <Upload size={24} strokeWidth={1.5} className="text-zinc-300 group-hover:text-zinc-950 transition-colors" />
            <span className="text-xs tracking-[0.2em] text-zinc-400 group-hover:text-zinc-950">
              Add Perspective
            </span>
          </div>
        </div>
      </label>
    </div>
  </section>
));
MediaSection.displayName = "MediaSection";

const FormSkeleton = () => (
  <div className="space-y-16 animate-in fade-in duration-500">
    <div className="space-y-8">
      <Skeleton className="h-4 w-1/3 mx-auto" />
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
    <div className="space-y-8">
      <Skeleton className="h-4 w-1/3 mx-auto" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

// --- Main Component ---

interface ProductFormPanelProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductFormPanel = ({ product, isOpen, onClose, onSuccess }: ProductFormPanelProps) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    comparePrice: 0,
    cost: 0,
    categoryId: "",
    brandId: "",
    status: "ACTIVE" as "ACTIVE" | "DRAFT" | "ARCHIVED",
    images: [] as { url: string; publicId: string; isMain: boolean }[],
    variants: [] as Partial<Variant>[],
  });

  const flatCategoryOptions = useMemo(() => {
    const flatten = (cats: Category[], level = 0): { label: string; value: string }[] => {
      return cats.reduce((acc: { label: string; value: string }[], cat) => {
        acc.push({ 
          label: level > 0 ? `${"\u00A0".repeat(level * 4)} ${cat.name}` : cat.name, 
          value: cat.id 
        });
        if (cat.children && cat.children.length > 0) {
          acc.push(...flatten(cat.children, level + 1));
        }
        return acc;
      }, []);
    };
    return [
      { label: "Select Category", value: "" },
      ...flatten(categories)
    ];
  }, [categories]);

  const brandOptions = useMemo(() => [
    { label: "Select Brand (Optional)", value: "" },
    ...brands.map(b => ({ label: b.name, value: b.id }))
  ], [brands]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch meta-data (categories/brands) once when panel opens
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll()
        ]);
        if (catRes.data.success) setCategories(catRes.data.data as Category[]);
        if (brandRes.data.success) setBrands(brandRes.data.data as Brand[]);
      } catch (err) {
        console.error("Failed to fetch meta data", err);
      }
    };
    if (isOpen) fetchMetadata();
  }, [isOpen]);

  useEffect(() => {
    if (product && isOpen) {
      setFetching(true);
      const fetchFullProduct = async () => {
        try {
          const res = await adminApi.getProductById(product.id);
          if (res.data.success) {
            const full = res.data.data as Product;
            setFormData({
              name: full.name,
              slug: full.slug,
              description: full.description,
              price: full.price,
              comparePrice: full.comparePrice || 0,
              cost: full.cost || 0,
              categoryId: full.categoryId,
              brandId: full.brandId,
              status: (full.status as "ACTIVE" | "DRAFT" | "ARCHIVED") || "ACTIVE",
              images: full.images,
              variants: full.variants,
            });
          }
        } catch (err) {
          console.error("Failed to fetch full product", err);
          // Fallback
          setFormData({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice || 0,
            cost: product.cost || 0,
            categoryId: product.categoryId,
            brandId: product.brandId,
            status: (product.status as "ACTIVE" | "DRAFT" | "ARCHIVED") || "ACTIVE",
            images: product.images,
            variants: product.variants,
          });
        } finally {
          setFetching(false);
        }
      };
      fetchFullProduct();
    } else if (!product && isOpen) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: 0,
        comparePrice: 0,
        cost: 0,
        categoryId: "",
        brandId: "",
        status: "ACTIVE",
        images: [],
        variants: [],
      });
      setFetching(false);
    }
  }, [product, isOpen]);

  const handleNameChange = React.useCallback((name: string) => {
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    setFormData(prev => ({ ...prev, name, slug }));
  }, []);

  const handleFieldChange = React.useCallback((field: string, value: string | number | Partial<Variant>[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: previewUrl, publicId: tempId, isMain: prev.images.length === 0 }]
    }));

    setLoading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          images: prev.images.map(img => 
            img.publicId === tempId ? { url: res.data.data.url, publicId: res.data.data.publicId, isMain: img.isMain } : img
          )
        }));
        toast.success("Imagery digitized successfully");
      }
    } catch (err) {
      setFormData(prev => ({ ...prev, images: prev.images.filter(img => img.publicId !== tempId) }));
      toast.error("Cloud ingestion failed");
    } finally {
      setLoading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSetMain = React.useCallback((idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((im, i) => ({ ...im, isMain: i === idx }))
    }));
  }, []);

  const handleRemoveImage = React.useCallback((idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  }, []);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Title is required for the archive";
    if (!formData.categoryId) errors.categoryId = "Section classification required";
    // brandId is optional
    if (!formData.description.trim()) errors.description = "Editorial copy cannot be blank";
    if (formData.price <= 0) errors.price = "Valuation must be positive";
    
    // Ensure variants have at least basic data if present
    formData.variants.forEach((v, idx) => {
      if (v.size && !v.sku) {
        errors[`variant_${idx}_sku`] = "SKU required for defined sizing";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Form incomplete. Review highlighted fields.");
      return;
    }

    setLoading(true);
    
    // Sanitize Payload
    const sanitizedPayload = {
      ...formData,
      variants: formData.variants.filter(v => v.size || v.color || v.sku), // Remove empty rows
      images: formData.images.filter(img => !img.publicId.startsWith('temp-')), // Ensure only synced images go
    };

    try {
      if (product) {
        await adminApi.updateProduct(product.id, sanitizedPayload);
        toast.success("Catalog entry updated");
      } else {
        await adminApi.createProduct(sanitizedPayload);
        toast.success("New piece added to collection");
      }
      onSuccess();
      onClose();
    } catch (err) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 409) {
        toast.error("Conflict: This SKU or Slug already exists in the archive.");
      } else {
        toast.error("Sync failed. Check credentials and required fields.");
      }
    } finally {
      setLoading(false);
    }
  };

  const margin = useMemo(() => 
    formData.price > 0 ? (((formData.price - formData.cost) / formData.price) * 100).toFixed(0) : "0",
  [formData.price, formData.cost]);

  if (!mounted) return null;

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Refine Piece" : "New Archive"}
      subtitle={product ? `Collection Item REF: ${product.id.slice(-6).toUpperCase()}` : "Initiating catalog entry"}
      footer={
        <>
          <Button
            variant="outline"
            className="flex-1 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-sm"
            onClick={onClose}
            disabled={fetching}
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-sm shadow-2xl shadow-black/10 transition-all hover:-translate-y-0.5"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={fetching}
          >
            {product ? "Sync Archive" : "Manifest Collection"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-16">
        {fetching ? (
          <FormSkeleton />
        ) : (
          <>
            <IdentitySection 
              {...formData}
              categoryOptions={flatCategoryOptions}
              brandOptions={brandOptions}
              onNameChange={handleNameChange}
              onFieldChange={handleFieldChange}
              errors={formErrors}
            />

            <PricingSection 
              {...formData}
              margin={margin}
              onFieldChange={handleFieldChange}
              errors={formErrors}
            />

            <MediaSection 
              images={formData.images}
              onUpload={handleImageUpload}
              onSetMain={handleSetMain}
              onRemove={handleRemoveImage}
            />

            <section>
              <ProductVariantsTable 
                variants={formData.variants} 
                onChange={(variants) => handleFieldChange("variants", variants)} 
                errors={formErrors}
              />
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-zinc-100" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Search Presence</h4>
                <div className="h-[1px] flex-1 bg-zinc-100" />
              </div>
              
              <div className="p-8 bg-zinc-50/50 rounded-xl space-y-3 border border-zinc-100 shadow-inner">
                <p className="text-[#1a0dab] text-xl font-medium tracking-tight truncate hover:underline cursor-pointer">
                  {formData.name || "Product Archive Piece"} | Editorial curator
                </p>
                <div className="flex items-center gap-1.5 text-[#006621] text-xs font-medium">
                  <span>thecurator.com</span>
                  <ArrowRight size={10} className="text-zinc-400" />
                  <span className="truncate">{formData.slug || "item-pathway"}</span>
                </div>
                <p className="text-zinc-500 text-[13px] leading-relaxed line-clamp-2 italic font-serif">
                  {formData.description || "Refining the intersection of modern utility and timeless editorial aesthetics... "}
                </p>
              </div>
            </section>
          </>
        )}
      </form>
    </AdminDrawer>
  );
};
