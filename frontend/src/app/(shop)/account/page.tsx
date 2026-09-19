"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { orderApi, wishlistApi, sizeApi } from "@/lib/api";
import type { Order, UserMeasurements, WishlistItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCartStore } from "@/store/cartStore";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function AccountPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [measurements, setMeasurements] = useState<UserMeasurements | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showClearMeasurementsModal, setShowClearMeasurementsModal] =
    useState(false);
  const [formData, setFormData] = useState<UserMeasurements>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, wishlistRes, measurementsRes] = await Promise.all([
          orderApi.getMine({ limit: 5 }),
          wishlistApi.getAll(),
          sizeApi.getMeasurements(),
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.data);
        if (wishlistRes.data.success) setWishlist(wishlistRes.data.data);
        if (measurementsRes.data.success) {
          setMeasurements(measurementsRes.data.data);
          setFormData(measurementsRes.data.data || {});
        }
      } catch (err) {
        console.error("Failed to fetch account data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await sizeApi.updateMeasurements(formData);
      if (res.data.success) {
        setMeasurements(res.data.data);
        setFormData(res.data.data);
        setIsEditing(false);
        const { toast } = await import("sonner");
        toast.success("Measurements successfully saved!");
      }
    } catch (err) {
      console.error("Failed to save measurements:", err);
      const { toast } = await import("sonner");
      toast.error("Failed to save measurements. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearMeasurements = () => {
    setShowClearMeasurementsModal(true);
  };

  const executeClearMeasurements = async () => {
    try {
      const res = await sizeApi.clearMeasurements();
      if (res.data.success) {
        setMeasurements(null);
        setFormData({});
        const { toast } = await import("sonner");
        toast.success("Measurements cleared from your profile.");
      }
    } catch (err) {
      console.error("Failed to clear measurements:", err);
      const { toast } = await import("sonner");
      toast.error("Failed to clear measurements.");
    } finally {
      setShowClearMeasurementsModal(false);
    }
  };

  const handleReorder = async (order: Order) => {
    // Add each order item back to cart
    for (const item of order.items) {
      const variant = item.variant;
      if (!variant) continue;

      await useCartStore.getState().addItem({
        id: "", // Server handles IDs
        cartItemId: "",
        variantId: item.variantId,
        productId: item.productId,
        name: item.product?.name || "",
        image: item.product?.images?.[0]?.url || "",
        price: item.price,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        stock: 99, // Fallback for reorder
      });
    }

    // Open cart drawer
    useCartStore.getState().toggleDrawer();

    // Show toast
    import("sonner").then(({ toast }) =>
      toast.success("Items added to bag for reorder")
    );
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface">
        <AccountSidebar />

        <main className="flex-1 p-12">
          <header className="mb-12">
            <h1 className="text-3xl font-medium tracking-tight text-on-surface">
              Good morning, {user?.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-on-surface-variant">
              Everything you need to manage your boutique experience.
            </p>
          </header>

          {/* Metric Cards */}
          <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-4">
            <MetricCard
              label="Total Orders"
              value={loading ? undefined : orders.length.toString()}
            />
            <MetricCard
              label="Pending Delivery"
              value={
                loading
                  ? undefined
                  : orders
                      .filter(
                        (o) =>
                          o.status === "PENDING" ||
                          o.status === "PROCESSING" ||
                          o.status === "SHIPPED"
                      )
                      .length.toString()
              }
              hasIndicator
            />
            <MetricCard
              label="Wishlist Items"
              value={loading ? undefined : wishlist.length.toString()}
            />
            <MetricCard
              label="Reward Points"
              value={loading ? undefined : "2,450"}
            />
          </section>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Recent Orders Table */}
            <div className="lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-on-surface">
                  Recent Orders
                </h2>
                <Link
                  href="/account/orders"
                  className="text-sm font-medium text-secondary underline-offset-4 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-hidden rounded-sm border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-low text-[10px] tracking-widest text-on-surface-variant uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order Number</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-6">
                              <Skeleton className="h-4 w-16" />
                            </td>
                            <td className="px-6 py-6">
                              <Skeleton className="h-6 w-24 rounded-full" />
                            </td>
                            <td className="px-6 py-6">
                              <Skeleton className="ml-auto h-4 w-8" />
                            </td>
                          </tr>
                        ))
                    ) : orders.length > 0 ? (
                      orders.slice(0, 3).map((order) => (
                        <tr key={order.id} className="group">
                          <td className="px-6 py-6 font-medium text-on-surface">
                            #{order.id.slice(-4).toUpperCase()}
                          </td>
                          <td className="px-6 py-6">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-6 text-right">
                            <Link
                              href={`/account/orders?id=${order.id}`}
                              className="font-semibold text-on-surface transition-colors hover:text-secondary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-on-surface-variant"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Reorder */}
            <div>
              <h2 className="mb-6 text-xl font-semibold text-on-surface">
                Quick Reorder
              </h2>
              <div className="space-y-6">
                {loading ? (
                  Array(2)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-24 w-24" />
                        <div className="flex flex-col justify-center gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    <div className="mb-6 rounded-sm border border-outline-variant/10 bg-surface-container-low p-4">
                      <p className="mb-2 text-[10px] tracking-widest text-on-surface-variant uppercase">
                        From Your Last Order
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          #{orders[0].id.slice(-4).toUpperCase()}
                        </span>
                        <Button
                          variant="none"
                          size="none"
                          onClick={() => handleReorder(orders[0])}
                          className="text-xs font-bold text-primary underline-offset-4 hover:underline"
                        >
                          Reorder All
                        </Button>
                      </div>
                    </div>
                    {orders[0].items.slice(0, 2).map((item) => (
                      <QuickReorderItem
                        key={item.id}
                        name={item.product?.name || "Product"}
                        price={item.price}
                        image={item.product?.images?.[0]?.url || ""}
                        onReorder={() =>
                          handleReorder({ ...orders[0], items: [item] })
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant italic">
                    Start your collection to enable quick reordering.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* My Measurements Section */}
          <section className="mt-16 border-t border-outline-variant/15 pt-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-on-surface">
                  My Measurements
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Customize your body profile for accurate, automated size
                  recommendations across all products.
                </p>
              </div>
              {measurements && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Measurements Saved
                </span>
              )}
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSaveMeasurements}
                className="max-w-3xl space-y-6 rounded-sm border border-outline-variant/10 bg-surface-container-lowest p-8"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.heightCm || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, heightCm: e.target.value })
                      }
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="178"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weightKg || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, weightKg: e.target.value })
                      }
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Fit Preference
                    </label>
                    <select
                      value={formData.fitPreference || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fitPreference: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="">Select fit...</option>
                      <option value="slim">Slim Fit</option>
                      <option value="regular">Regular Fit</option>
                      <option value="relaxed">Relaxed Fit</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Chest (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.chestCm || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, chestCm: e.target.value })
                      }
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="96"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.waistCm || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, waistCm: e.target.value })
                      }
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="84"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Hips (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.hipsCm || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, hipsCm: e.target.value })
                      }
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="98"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                      Shoe Size (EU)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.shoeEU || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, shoeEU: e.target.value })
                      }
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="42.5"
                    />
                  </div>
                </div>

                <div className="flex gap-4 border-t border-outline-variant/10 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Measurements"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(measurements || {});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : measurements ? (
              <div className="max-w-3xl rounded-sm border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm">
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                  <MeasurementDisplay
                    label="Height"
                    value={
                      measurements.heightCm
                        ? `${measurements.heightCm} cm`
                        : "—"
                    }
                  />
                  <MeasurementDisplay
                    label="Weight"
                    value={
                      measurements.weightKg
                        ? `${measurements.weightKg} kg`
                        : "—"
                    }
                  />
                  <MeasurementDisplay
                    label="Fit Preference"
                    value={
                      measurements.fitPreference
                        ? `${measurements.fitPreference.toUpperCase()}`
                        : "—"
                    }
                  />
                  <MeasurementDisplay
                    label="Shoe Size"
                    value={
                      measurements.shoeEU ? `EU ${measurements.shoeEU}` : "—"
                    }
                  />
                  <MeasurementDisplay
                    label="Chest"
                    value={
                      measurements.chestCm ? `${measurements.chestCm} cm` : "—"
                    }
                  />
                  <MeasurementDisplay
                    label="Waist"
                    value={
                      measurements.waistCm ? `${measurements.waistCm} cm` : "—"
                    }
                  />
                  <MeasurementDisplay
                    label="Hips"
                    value={
                      measurements.hipsCm ? `${measurements.hipsCm} cm` : "—"
                    }
                  />
                  <MeasurementDisplay
                    label="Last Updated"
                    value={
                      measurements.updatedAt
                        ? new Date(measurements.updatedAt).toLocaleDateString()
                        : "—"
                    }
                  />
                </div>

                <div className="mt-8 flex gap-4 border-t border-outline-variant/10 pt-6">
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearMeasurements}
                    className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                  >
                    Clear Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl rounded-sm border border-outline-variant/10 bg-surface-container-lowest p-8 text-center shadow-sm">
                <p className="text-sm text-on-surface-variant italic">
                  No saved measurements yet.
                </p>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-on-surface/50">
                  Use the interactive <strong>AI Size Advisor</strong> on any
                  product detail page to automatically calculate and save your
                  personalized boutique fit profile.
                </p>
                <Button
                  onClick={() => {
                    setIsEditing(true);
                    setFormData({});
                  }}
                  className="mt-6"
                >
                  Enter Measurements Manually
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>
      <ConfirmDialog
        isOpen={showClearMeasurementsModal}
        onClose={() => setShowClearMeasurementsModal(false)}
        onConfirm={executeClearMeasurements}
        title="Clear Sizing Profile?"
        description="Are you sure you want to clear your boutique body measurements? This will remove your saved dimensions from your personal stylist profile."
        confirmBrand="danger"
        confirmText="Clear Profile"
        cancelText="Keep Profile"
      />
    </ProtectedRoute>
  );
}

function MetricCard({
  label,
  value,
  hasIndicator,
}: {
  label: string;
  value?: string;
  hasIndicator?: boolean;
}) {
  return (
    <div className="group cursor-default rounded-sm border border-outline-variant/5 bg-surface-container-lowest p-8 shadow-sm transition-all hover:border-outline-variant/20 hover:shadow-md">
      <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
        {label}
      </p>
      <div className="flex items-center gap-3">
        {value === undefined ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-3xl font-medium tracking-tighter text-on-surface">
            {value}
          </p>
        )}
        {hasIndicator && value && parseInt(value) > 0 && (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary"></span>
        )}
      </div>
    </div>
  );
}

function QuickReorderItem({
  name,
  price,
  image,
  onReorder,
}: {
  name: string;
  price: number;
  image: string;
  onReorder: () => void;
}) {
  return (
    <div
      onClick={onReorder}
      className="group flex cursor-pointer gap-4 rounded-sm border border-outline-variant/5 bg-surface-container-lowest p-4 transition-all duration-500 hover:bg-surface-container-low"
    >
      <div className="h-20 w-20 overflow-hidden rounded-sm bg-surface-container ring-1 ring-outline-variant/10">
        <img
          src={image}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={name}
        />
      </div>
      <div className="flex flex-col justify-between py-1">
        <div>
          <h4 className="text-sm font-semibold text-on-surface">{name}</h4>
          <p className="text-xs text-on-surface-variant">
            {formatCurrency(price)}
          </p>
        </div>
        <Button
          variant="none"
          size="none"
          onClick={(e) => {
            e.stopPropagation();
            onReorder();
          }}
          className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-primary uppercase transition-all hover:gap-2"
        >
          Reorder{" "}
          <span className="material-symbols-outlined !text-[12px]">
            arrow_forward
          </span>
        </Button>
      </div>
    </div>
  );
}

function MeasurementDisplay({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">
        {label}
      </p>
      <p className="text-lg font-medium tracking-tight text-on-surface">
        {value}
      </p>
    </div>
  );
}
