"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { cn } from "@/lib/utils";
import { ArrowRight, Upload, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
  editingCategory: Category | null;
  allCategories: Category[];
}

const IdentitySection = memo(
  ({
    name,
    slug,
    description,
    status,
    parentId,
    parentOptions,
    onNameChange,
    onFieldChange,
  }: {
    name: string;
    slug: string;
    description: string;
    status: string;
    parentId: string;
    parentOptions: { label: string; value: string }[];
    onNameChange: (val: string) => void;
    onFieldChange: (field: string, val: string) => void;
  }) => (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-zinc-100" />
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Core Identity
        </h4>
        <div className="h-[1px] flex-1 bg-zinc-100" />
      </div>

      <div className="space-y-6">
        <Input
          label="Category Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Footwear"
          required
        />

        <Input
          label="Custom Slug"
          value={slug}
          onChange={(e) => onFieldChange("slug", e.target.value)}
          placeholder="e.g. footwear"
        />

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            Hierarchy Segment
          </label>
          <Select
            options={parentOptions}
            value={parentId}
            onChange={(val) => onFieldChange("parentId", val)}
            className="w-full"
            labelPrefix="Under"
          />
        </div>

        <Textarea
          label="Editorial Description"
          value={description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          rows={5}
          placeholder="Curated selection of pieces..."
        />

        <div className="flex items-center justify-between gap-6 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-1 flex-col">
            <h4 className="text-sm font-semibold tracking-wide text-zinc-950">
              Publication Status
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Toggle visibility on the main archival feed
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() =>
                onFieldChange(
                  "status",
                  status === "ACTIVE" ? "HIDDEN" : "ACTIVE"
                )
              }
              className={cn(
                "relative h-6 w-12 shrink-0 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none",
                status === "ACTIVE" ? "bg-black" : "bg-zinc-300"
              )}
            >
              <motion.div
                initial={false}
                animate={{ x: status === "ACTIVE" ? 24 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
              />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
);
IdentitySection.displayName = "IdentitySection";

const MediaSection = memo(
  ({
    image,
    onImageUpload,
    onRemoveImage,
    isUploading,
  }: {
    image: string;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    isUploading: boolean;
  }) => (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-zinc-100" />
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Cover Banner
        </h4>
        <div className="h-[1px] flex-1 bg-zinc-100" />
      </div>

      <div className="space-y-4">
        {image ? (
          <div className="group relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 lg:max-w-xs">
            <Image
              src={image}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Preview"
              unoptimized
            />
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={onRemoveImage}
              className="absolute top-3 right-3 z-10 cursor-pointer rounded-full bg-white p-2 text-zinc-600 shadow-md transition-colors hover:bg-zinc-100"
            >
              <X size={14} />
            </Button>
          </div>
        ) : (
          <label className="group mx-auto flex aspect-[3/4] w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 transition-all duration-300 hover:border-zinc-950 hover:bg-zinc-50 lg:max-w-xs">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onImageUpload}
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-3">
              {isUploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : (
                <Upload
                  size={24}
                  strokeWidth={1.5}
                  className="text-zinc-300 transition-colors group-hover:text-zinc-950"
                />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-950 transition-colors group-hover:text-zinc-950">
                  {isUploading ? "Uploading file..." : "Upload image"}
                </p>
                <p className="mt-1 text-xs tracking-widest text-zinc-400 uppercase">
                  PNG, JPG, WEBP
                </p>
              </div>
            </div>
          </label>
        )}
      </div>
    </section>
  )
);
MediaSection.displayName = "MediaSection";

export const CategoryDrawer = React.memo(
  ({
    isOpen,
    onClose,
    onSave,
    editingCategory,
    allCategories,
  }: CategoryDrawerProps) => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
      name: "",
      slug: "",
      description: "",
      parentId: "",
      status: "ACTIVE" as "ACTIVE" | "HIDDEN",
      image: "",
    });

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (editingCategory) {
        setFormData({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description || "",
          parentId: editingCategory.parentId || "",
          status: editingCategory.status || "ACTIVE",
          image: editingCategory.image || "",
        });
      } else {
        setFormData({
          name: "",
          slug: "",
          description: "",
          parentId: "",
          status: "ACTIVE",
          image: "",
        });
      }
    }, [editingCategory, isOpen]);

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

    const handleNameChange = React.useCallback(
      (name: string) => {
        if (!editingCategory) {
          const slug = name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
          setFormData((prev) => ({ ...prev, name, slug }));
        } else {
          setFormData((prev) => ({ ...prev, name }));
        }
      },
      [editingCategory]
    );

    const handleFieldChange = React.useCallback(
      (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      },
      []
    );

    const handleImageUpload = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const res = await adminApi.uploadMedia(file);
        if (res.data.success) {
          setFormData((prev) => ({ ...prev, image: res.data.data.url }));
          toast.success("Image attached securely");
        }
      } catch {
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
        e.target.value = ""; // Reset file input
      }
    };

    const handleRemoveImage = React.useCallback(() => {
      setFormData((prev) => ({ ...prev, image: "" }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      await onSave({
        ...formData,
        parentId: formData.parentId || null,
      });
      setLoading(false);
    };

    const parentOptions = useMemo(() => {
      let list = allCategories;
      if (editingCategory) {
        const isDescendant = (catId: string, targetId: string): boolean => {
          if (catId === targetId) return true;
          const cat = allCategories.find((c) => c.id === catId);
          if (!cat?.parentId) return false;
          return isDescendant(cat.parentId, targetId);
        };
        list = allCategories.filter(
          (c) => !isDescendant(c.id, editingCategory.id)
        );
      }
      return [
        { label: "None (Root Category)", value: "" },
        ...list.map((c) => ({ label: c.name, value: c.id })),
      ];
    }, [allCategories, editingCategory]);

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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              style={{ willChange: "transform", z: 0 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] sm:w-[420px]"
            >
              {/* Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-8 py-8 backdrop-blur-xl">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-950">
                    {editingCategory ? "Refine Segment" : "New Collection"}
                  </h3>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                    {editingCategory
                      ? `Segment ID: ${editingCategory.id.slice(-6).toUpperCase()}`
                      : "Initiating hierarchy segment"}
                  </p>
                </div>
                <CloseButton onClick={onClose} />
              </div>

              {/* Scroll Area */}
              <form
                id="category-panel-form"
                onSubmit={handleSubmit}
                className="no-scrollbar flex-1 space-y-16 overflow-y-auto px-8 py-10"
              >
                <IdentitySection
                  name={formData.name}
                  slug={formData.slug}
                  description={formData.description}
                  status={formData.status}
                  parentId={formData.parentId}
                  parentOptions={parentOptions}
                  onNameChange={handleNameChange}
                  onFieldChange={handleFieldChange}
                />

                <MediaSection
                  image={formData.image}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                  isUploading={isUploading}
                />

                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-zinc-100" />
                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                      Search Presence
                    </h4>
                    <div className="h-[1px] flex-1 bg-zinc-100" />
                  </div>

                  <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-8 shadow-inner">
                    <p className="cursor-pointer truncate text-xl font-medium tracking-tight text-[#1a0dab] hover:underline">
                      {formData.name || "Curator Collection"} | Editorial
                      segment
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#006621]">
                      <span>thecurator.com</span>
                      <ArrowRight size={10} className="text-zinc-400" />
                      <span>category</span>
                      <ArrowRight size={10} className="text-zinc-400" />
                      <span className="truncate">
                        {formData.slug || "new-pathway"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-zinc-500 italic">
                      {formData.description ||
                        "Refining the intersection of modern utility and timeless editorial aesthetics... "}
                    </p>
                  </div>
                </section>
              </form>

              {/* Footer */}
              <div className="sticky bottom-0 z-20 flex gap-4 border-t border-zinc-100 bg-white px-8 py-8 shadow-[0_-20px_60px_rgba(0,0,0,0.02)]">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-sm py-6 text-[10px] font-black tracking-[0.2em] uppercase"
                  onClick={onClose}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  form="category-panel-form"
                  variant="primary"
                  className="flex-1 rounded-sm py-6 text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-black/10 transition-all hover:-translate-y-0.5"
                  isLoading={loading}
                >
                  {editingCategory ? "Sync Archive" : "Manifest Hierarchy"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);
CategoryDrawer.displayName = "CategoryDrawer";
