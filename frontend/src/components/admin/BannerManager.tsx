"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Upload,
  RefreshCw,
} from "lucide-react";
import { adminBannerApi, adminApi } from "@/lib/api";
import type { Banner } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [badge, setBadge] = useState("");
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBannerApi.getBanners();
      if (res.data.success && Array.isArray(res.data.data)) {
        setBanners(res.data.data);
      }
    } catch {
      toast.error("Failed to load promotional banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setLinkUrl("");
    setBadge("");
    setPosition(banners.length);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || "");
    setBadge(b.badge || "");
    setPosition(b.position);
    setIsActive(b.isActive);
    setStartDate(b.startDate ? b.startDate.split("T")[0] : "");
    setEndDate(b.endDate ? b.endDate.split("T")[0] : "");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const updatedStatus = !banner.isActive;
      await adminBannerApi.updateBanner(banner.id, { isActive: updatedStatus });
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, isActive: updatedStatus } : b
        )
      );
      toast.success(`Banner ${updatedStatus ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update banner status");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await adminApi.uploadMedia(file);
      if (res.data.data?.url) {
        setImageUrl(res.data.data.url);
        toast.success("Image uploaded successfully");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error("Title and Image URL are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Banner> = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim() || null,
        badge: badge.trim() || null,
        position: Number(position) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };

      if (editingBanner) {
        await adminBannerApi.updateBanner(editingBanner.id, payload);
        toast.success("Banner updated successfully");
      } else {
        await adminBannerApi.createBanner(payload);
        toast.success("Banner created successfully");
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await adminBannerApi.deleteBanner(bannerToDelete);
      toast.success("Banner purged");
      setBanners((prev) => prev.filter((b) => b.id !== bannerToDelete));
    } catch {
      toast.error("Failed to delete banner");
    } finally {
      setBannerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-border/40 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
            <ImageIcon className="h-5 w-5 text-primary" />
            Promotional &amp; Hero Banners
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Manage high-impact editorial banners, schedule seasonal drops, and
            route clients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBanners}
            disabled={loading}
            icon={
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />
            }
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            icon={<Plus className="h-4 w-4" />}
          >
            Create Banner
          </Button>
        </div>
      </div>

      {/* Grid of Banners */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted/40 h-44 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="border-border/60 bg-muted/20 rounded-xl border border-dashed p-12 text-center">
          <ImageIcon className="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-40" />
          <h3 className="text-sm font-semibold">No banners published</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
            Manifest custom hero displays or seasonal promotional banners to
            showcase collections.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreate}
            className="mt-4"
          >
            Create First Banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={cn(
                "group bg-card relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all",
                banner.isActive
                  ? "border-border/60"
                  : "border-border/30 opacity-70"
              )}
            >
              {/* Banner Image Header */}
              <div className="bg-muted relative h-40 w-full overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Badge if present */}
                {banner.badge && (
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-black tracking-widest text-zinc-950 uppercase shadow-sm backdrop-blur-xs">
                    {banner.badge}
                  </span>
                )}

                {/* Status Toggle & Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(banner)}
                    className="rounded-md bg-black/60 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-black/80"
                    title={banner.isActive ? "Deactivate" : "Activate"}
                  >
                    {banner.isActive ? (
                      <ToggleRight className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(banner)}
                    className="rounded-md bg-black/60 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-black/80"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerToDelete(banner.id)}
                    className="rounded-md bg-black/60 p-1.5 text-red-400 backdrop-blur-xs transition-colors hover:bg-black/80"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Banner Title on overlay */}
                <div className="absolute right-3 bottom-3 left-3">
                  <h3 className="line-clamp-1 text-base font-bold tracking-tight text-white drop-shadow-sm">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-white/80">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Banner Details Footer */}
              <div className="bg-muted/20 border-border/40 text-muted-foreground flex items-center justify-between border-t p-3.5 text-xs">
                <span className="font-mono text-[11px]">
                  Position: #{banner.position}
                </span>

                {banner.linkUrl ? (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    Link Target
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-[11px] italic">No routing target</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingBanner ? "Edit Promotional Banner" : "Manifest New Banner"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Banner Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Winter Archival Capsule Release"
              required
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Subtitle (Optional)
            </label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Handcrafted tailoring available in limited volumes"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
              Image URL *
            </label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="flex-1"
                required
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  className="h-10 shrink-0 px-3"
                  icon={<Upload className="h-4 w-4" />}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </label>
            </div>
            {imageUrl && (
              <div className="border-border/60 relative mt-2 h-24 w-full overflow-hidden rounded-lg border">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Link Destination (Optional)
              </label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/products?category=outerwear"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Badge Text (Optional)
              </label>
              <Input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. NEW DROP, 20% OFF"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Sort Position
              </label>
              <Input
                type="number"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                min={0}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                Start Date (Optional)
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                End Date (Optional)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <Checkbox
              checked={isActive}
              onCheckedChange={setIsActive}
              label={
                <span className="text-xs font-medium">
                  Active &amp; published immediately
                </span>
              }
            />
          </div>

          <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingBanner
                  ? "Update Banner"
                  : "Manifest Banner"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(bannerToDelete)}
        onClose={() => setBannerToDelete(null)}
        onConfirm={handleDelete}
        title="Purge Promotional Banner?"
        description="Are you sure you want to permanently delete this banner? Clients will no longer see this hero feature."
        confirmBrand="danger"
        confirmText="Purge Banner"
      />
    </div>
  );
};
