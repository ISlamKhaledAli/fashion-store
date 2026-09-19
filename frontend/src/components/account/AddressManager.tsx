"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle2,
  Home,
  Building2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { addressApi } from "@/lib/api";
import type { Address } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Checkbox } from "@/components/ui/Checkbox";

interface AddressFormData {
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const emptyForm: AddressFormData = {
  label: "Home",
  firstName: "",
  lastName: "",
  street: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
  isDefault: false,
};

export const AddressManager = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await addressApi.getAll();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAddresses(res.data.data as unknown as Address[]);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
      toast.error("Could not load addresses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setFormData({
      ...emptyForm,
      isDefault: addresses.length === 0, // Auto-default if first address
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label || "Home",
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      street: addr.street || "",
      apartment: addr.apartment || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "United States",
      phone: addr.phone || "",
      isDefault: !!addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !formData.country
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAddress) {
        await addressApi.update(editingAddress.id, formData);
        toast.success("Address updated successfully");
      } else {
        await addressApi.create(formData);
        toast.success("Address added successfully");
      }
      setIsModalOpen(false);
      await fetchAddresses();
    } catch (err: unknown) {
      console.error("Save address error:", err);
      toast.error("Failed to save address. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    if (addr.isDefault) return;
    try {
      await addressApi.update(addr.id, { isDefault: true });
      toast.success("Default address updated");
      await fetchAddresses();
    } catch (err) {
      console.error("Set default address error:", err);
      toast.error("Failed to set default address");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await addressApi.delete(deletingId);
      toast.success("Address removed");
      setDeletingId(null);
      await fetchAddresses();
    } catch (err) {
      console.error("Delete address error:", err);
      toast.error("Failed to delete address");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Address Book
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage your delivery destinations and primary shipping location.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 self-start px-5 py-2.5 text-xs font-semibold tracking-widest uppercase sm:self-auto"
        >
          <Plus size={16} strokeWidth={2} />
          Add New Address
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-outline-variant/20 bg-surface-container-low p-6"
            />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-primary">
            <MapPin size={26} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-on-surface">
            No Saved Addresses
          </h3>
          <p className="mt-1 max-w-sm text-sm text-on-surface-variant">
            You have not added any shipping addresses yet. Add your primary
            residence or workplace for effortless checkout.
          </p>
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase"
          >
            <Plus size={16} />
            Add First Address
          </Button>
        </div>
      ) : (
        /* Addresses Grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`relative flex flex-col justify-between rounded-xl border p-6 transition-all duration-300 ${
                  addr.isDefault
                    ? "border-primary/40 bg-surface-container-lowest shadow-sm ring-1 ring-primary/20"
                    : "border-outline-variant/20 bg-surface-container-lowest hover:border-outline-variant/60"
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-primary">
                        {addr.label?.toLowerCase() === "work" ||
                        addr.label?.toLowerCase() === "office" ? (
                          <Building2 size={14} />
                        ) : (
                          <Home size={14} />
                        )}
                      </span>
                      <span className="text-xs font-bold tracking-widest text-on-surface uppercase">
                        {addr.label || "Address"}
                      </span>
                    </div>

                    {addr.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        <CheckCircle2 size={12} />
                        Default
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addr)}
                        className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-on-surface-variant/70 transition-colors hover:text-primary"
                      >
                        <Star size={12} />
                        Set Default
                      </button>
                    )}
                  </div>

                  <h4 className="text-base font-semibold text-on-surface">
                    {addr.firstName} {addr.lastName}
                  </h4>

                  <div className="mt-2 space-y-0.5 text-sm text-on-surface-variant">
                    <p>{addr.street}</p>
                    {addr.apartment && <p>{addr.apartment}</p>}
                    <p>
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="font-medium">{addr.country}</p>
                    {addr.phone && (
                      <p className="pt-1 text-xs text-on-surface-variant/70">
                        Phone: {addr.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 border-t border-outline-variant/10 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(addr)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <Edit2 size={13} />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingId(addr.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        description="Fill in your delivery details for seamless order dispatches."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                Address Tag
              </label>
              <Input
                name="label"
                value={formData.label}
                onChange={handleFormChange}
                placeholder="e.g. Home, Studio, Office"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                Phone Number (Optional)
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                First Name *
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                Last Name *
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
              Street Address *
            </label>
            <Input
              name="street"
              value={formData.street}
              onChange={handleFormChange}
              placeholder="House number and street name"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
              Apartment, Suite, Unit (Optional)
            </label>
            <Input
              name="apartment"
              value={formData.apartment}
              onChange={handleFormChange}
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                City *
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                placeholder="City"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                State / Region *
              </label>
              <Input
                name="state"
                value={formData.state}
                onChange={handleFormChange}
                placeholder="State / Province"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                Postal Code *
              </label>
              <Input
                name="zip"
                value={formData.zip}
                onChange={handleFormChange}
                placeholder="ZIP / Postal code"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
              Country *
            </label>
            <Input
              name="country"
              value={formData.country}
              onChange={handleFormChange}
              placeholder="Country"
              required
            />
          </div>

          <div className="pt-2">
            <Checkbox
              id="isDefault"
              label="Set as default shipping address"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isDefault: e.target.checked,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-outline-variant/10 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting
                ? "Saving..."
                : editingAddress
                  ? "Update Address"
                  : "Save Address"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Address"
        description="Are you sure you want to remove this address from your book? This action cannot be undone."
        confirmBrand="danger"
        confirmText="Delete"
        cancelText="Keep"
        isLoading={isDeleting}
      />
    </div>
  );
};
