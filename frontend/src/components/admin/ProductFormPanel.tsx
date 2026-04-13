"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, Trash2, ArrowRight } from "lucide-react";
import { Product, Category, Brand, Variant } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { adminApi, categoryApi, brandApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductVariantsTable } from "./ProductVariantsTable";

interface ProductFormPanelProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductFormPanel = ({ product, isOpen, onClose, onSuccess }: ProductFormPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    discountPrice: 0,
    cost: 0,
    categoryId: "",
    brandId: "",
    status: "ACTIVE" as "ACTIVE" | "DRAFT" | "ARCHIVED",
    images: [] as { url: string; publicId: string; isMain: boolean }[],
    variants: [] as Partial<Variant>[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll()
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (brandRes.data.success) setBrands(brandRes.data.data);
      } catch (err) {
        console.error("Failed to fetch form data", err);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || 0,
        cost: 0,
        categoryId: product.categoryId,
        brandId: product.brandId,
        status: (product as any).status || "ACTIVE",
        images: product.images,
        variants: product.variants,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: 0,
        discountPrice: 0,
        cost: 0,
        categoryId: "",
        brandId: "",
        status: "ACTIVE",
        images: [],
        variants: [],
      });
    }
  }, [product, isOpen]);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res.data.success) {
        setFormData({
          ...formData,
          images: [
            ...formData.images,
            { url: res.data.data.url, publicId: res.data.data.publicId, isMain: formData.images.length === 0 }
          ]
        });
        toast.success("Imagery digitized successfully");
      }
    } catch (err) {
      toast.error("Cloud ingestion failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await adminApi.updateProduct(product.id, formData);
        toast.success("Catalog entry updated");
      } else {
        await adminApi.createProduct(formData);
        toast.success("New piece added to collection");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Sync failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const margin = formData.price > 0 ? (((formData.price - formData.cost) / formData.price) * 100).toFixed(0) : "0";

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  const brandOptions = brands.map(b => ({ label: b.name, value: b.id }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed inset-y-0 right-0 w-[520px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-8 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-20">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {product ? "Refine Piece" : "New Archive"}
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  {product ? `Collection Item REF: ${product.id.slice(-6).toUpperCase()}` : "Initiating catalog entry"}
                </p>
              </div>
              <Button variant="icon" size="none" onClick={onClose} className="rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 transition-all p-2" icon={<X size={20} />} />
            </div>

            {/* Scroll Area */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-8 py-10 space-y-16">
              {/* Basic Info */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Core Identity</h4>
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                </div>
                
                <div className="space-y-6">
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Sculptural Trench Coat"
                    required
                  />

                  <div className="grid grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Classification</label>
                      <Select
                        options={categoryOptions}
                        value={formData.categoryId}
                        onChange={(val) => setFormData({ ...formData, categoryId: val })}
                        className="w-full"
                        labelPrefix="In"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Source / Brand</label>
                       <Select
                        options={brandOptions}
                        value={formData.brandId}
                        onChange={(val) => setFormData({ ...formData, brandId: val })}
                        className="w-full"
                        labelPrefix="By"
                      />
                    </div>
                  </div>

                  <Textarea
                    label="Editorial Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    placeholder="Crafted from Italian wool..."
                    required
                  />

                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-950">Publication Status</p>
                      <p className="text-[10px] text-zinc-400 font-medium">Toggle visibility on the main archival feed</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' })}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-500 shadow-inner",
                        formData.status === 'ACTIVE' ? "bg-zinc-950" : "bg-zinc-200"
                      )}
                    >
                      <motion.div 
                        animate={{ x: formData.status === 'ACTIVE' ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Pricing */}
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    icon={<span className="text-xs font-bold">$</span>}
                  />
                  <Input
                    label="Compare"
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || 0 })}
                    icon={<span className="text-xs font-bold">$</span>}
                  />
                  <Input
                    label="Cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    icon={<span className="text-xs font-bold">$</span>}
                  />
                </div>
              </section>

              {/* Media */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Archival Imagery</h4>
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((img, idx) => (
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
                          variant="none"
                          size="none"
                          onClick={() => {
                            const updated = formData.images.map((im, i) => ({ ...im, isMain: i === idx }));
                            setFormData({ ...formData, images: updated });
                          }}
                          className="bg-white p-2 text-zinc-950 rounded-full hover:scale-110 transition-transform shadow-lg"
                          icon={<Check size={14} className={img.isMain ? "text-green-600" : ""} />}
                        />
                        <Button
                          variant="none"
                          size="none"
                          onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                          className="bg-white p-2 text-red-500 rounded-full hover:scale-110 transition-transform shadow-lg"
                          icon={<Trash2 size={14} />}
                        />
                      </div>
                      {img.isMain && (
                        <div className="absolute top-2 left-2">
                           <Badge variant="primary" className="px-1.5 py-0.5 text-[7px]">Primary View</Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <label className="aspect-[3/4] border-2 border-dashed border-zinc-200 rounded-sm flex flex-col items-center justify-center gap-2 hover:border-zinc-950 cursor-pointer transition-all duration-500 hover:bg-zinc-50 group">
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    <Upload size={24} strokeWidth={1.5} className="text-zinc-300 group-hover:text-zinc-950 transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-950">Add Perspective</span>
                  </label>
                </div>
              </section>

              {/* Variants */}
              <section>
                <ProductVariantsTable 
                  variants={formData.variants} 
                  onChange={(variants) => setFormData({ ...formData, variants })} 
                />
              </section>

              {/* SEO Preview */}
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
            </form>

            {/* Footer */}
            <div className="px-8 py-8 border-t border-zinc-100 bg-white sticky bottom-0 flex gap-4 shadow-[0_-20px_60px_rgba(0,0,0,0.02)] z-20">
              <Button
                variant="outline"
                className="flex-1 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-sm"
                onClick={onClose}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                className="flex-1 font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-sm shadow-2xl shadow-black/10 transition-all hover:-translate-y-0.5"
                onClick={handleSubmit}
                isLoading={loading}
              >
                {product ? "Sync Archive" : "Manifest Collection"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
