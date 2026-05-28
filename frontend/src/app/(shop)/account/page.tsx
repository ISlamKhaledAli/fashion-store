"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { orderApi, wishlistApi, sizeApi } from "@/lib/api";
import { Order, UserMeasurements, WishlistItem } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCartStore } from "@/store/cartStore";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default function AccountPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [measurements, setMeasurements] = useState<UserMeasurements | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserMeasurements>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, wishlistRes, measurementsRes] = await Promise.all([
          orderApi.getMine({ limit: 5 }),
          wishlistApi.getAll(),
          sizeApi.getMeasurements()
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

  const handleClearMeasurements = async () => {
    if (!confirm("Are you sure you want to clear your boutique measurements profile?")) {
      return;
    }
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
    }
  };

  const handleReorder = async (order: Order) => {
    // Add each order item back to cart
    for (const item of order.items) {
      const variant = item.variant;
      if (!variant) continue;
      
      await useCartStore.getState().addItem({
        id: '', // Server handles IDs
        cartItemId: '',
        variantId: item.variantId,
        productId: item.productId,
        name: item.product?.name || '',
        image: item.product?.images?.[0]?.url || '',
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
    import("sonner").then(({ toast }) => toast.success("Items added to bag for reorder"));
  };

  return (
    <ProtectedRoute>
      <div className="flex bg-surface min-h-screen">
        <AccountSidebar />
        
        <main className="flex-1 p-12">
          <header className="mb-12">
            <h1 className="text-3xl font-medium text-on-surface tracking-tight">
              Good morning, {user?.name.split(" ")[0]}
            </h1>
            <p className="text-on-surface-variant mt-1">Everything you need to manage your boutique experience.</p>
          </header>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <MetricCard 
            label="Total Orders" 
            value={loading ? undefined : orders.length.toString()} 
          />
          <MetricCard 
            label="Pending Delivery" 
            value={loading ? undefined : orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "SHIPPED").length.toString()} 
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-on-surface">Recent Orders</h2>
              <Link href="/account/orders" className="text-sm font-medium text-secondary hover:underline underline-offset-4">
                View All
              </Link>
            </div>
            
            <div className="bg-surface-container-lowest rounded-sm border border-outline-variant/10 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order Number</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-6"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-6 py-6"><Skeleton className="h-6 w-24 rounded-full" /></td>
                        <td className="px-6 py-6"><Skeleton className="h-4 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : orders.length > 0 ? (
                    orders.slice(0, 3).map((order) => (
                      <tr key={order.id} className="group">
                        <td className="px-6 py-6 font-medium text-on-surface">#{order.id.slice(-4).toUpperCase()}</td>
                        <td className="px-6 py-6">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-6 text-right">
                          <Link href={`/account/orders?id=${order.id}`} className="text-on-surface font-semibold hover:text-secondary transition-colors">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-on-surface-variant">
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
            <h2 className="text-xl font-semibold text-on-surface mb-6">Quick Reorder</h2>
            <div className="space-y-6">
              {loading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-24 h-24" />
                    <div className="flex flex-col justify-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-low rounded-sm border border-outline-variant/10 mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">From Your Last Order</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">#{orders[0].id.slice(-4).toUpperCase()}</span>
                      <Button 
                        variant="none" 
                        size="none" 
                        onClick={() => handleReorder(orders[0])}
                        className="text-xs font-bold text-primary hover:underline underline-offset-4"
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
                      onReorder={() => handleReorder({ ...orders[0], items: [item] })}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic">Start your collection to enable quick reordering.</p>
              )}
            </div>
          </div>
        </div>

        {/* My Measurements Section */}
        <section className="mt-16 border-t border-outline-variant/15 pt-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-semibold text-on-surface">My Measurements</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Customize your body profile for accurate, automated size recommendations across all products.
              </p>
            </div>
            {measurements && (
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Measurements Saved
              </span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveMeasurements} className="bg-surface-container-lowest p-8 rounded-sm border border-outline-variant/10 max-w-3xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm || ""}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="178"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg || ""}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Fit Preference</label>
                  <select
                    value={formData.fitPreference || ""}
                    onChange={(e) => setFormData({ ...formData, fitPreference: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface outline-none"
                  >
                    <option value="">Select fit...</option>
                    <option value="slim">Slim Fit</option>
                    <option value="regular">Regular Fit</option>
                    <option value="relaxed">Relaxed Fit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Chest (cm)</label>
                  <input
                    type="number"
                    value={formData.chestCm || ""}
                    onChange={(e) => setFormData({ ...formData, chestCm: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="96"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Waist (cm)</label>
                  <input
                    type="number"
                    value={formData.waistCm || ""}
                    onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="84"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Hips (cm)</label>
                  <input
                    type="number"
                    value={formData.hipsCm || ""}
                    onChange={(e) => setFormData({ ...formData, hipsCm: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="98"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Shoe Size (EU)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.shoeEU || ""}
                    onChange={(e) => setFormData({ ...formData, shoeEU: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    placeholder="42.5"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/10">
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
            <div className="bg-surface-container-lowest p-8 rounded-sm border border-outline-variant/10 max-w-3xl shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <MeasurementDisplay label="Height" value={measurements.heightCm ? `${measurements.heightCm} cm` : "—"} />
                <MeasurementDisplay label="Weight" value={measurements.weightKg ? `${measurements.weightKg} kg` : "—"} />
                <MeasurementDisplay label="Fit Preference" value={measurements.fitPreference ? `${measurements.fitPreference.toUpperCase()}` : "—"} />
                <MeasurementDisplay label="Shoe Size" value={measurements.shoeEU ? `EU ${measurements.shoeEU}` : "—"} />
                <MeasurementDisplay label="Chest" value={measurements.chestCm ? `${measurements.chestCm} cm` : "—"} />
                <MeasurementDisplay label="Waist" value={measurements.waistCm ? `${measurements.waistCm} cm` : "—"} />
                <MeasurementDisplay label="Hips" value={measurements.hipsCm ? `${measurements.hipsCm} cm` : "—"} />
                <MeasurementDisplay
                  label="Last Updated"
                  value={measurements.updatedAt ? new Date(measurements.updatedAt).toLocaleDateString() : "—"}
                />
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-outline-variant/10">
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Button variant="outline" onClick={handleClearMeasurements} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                  Clear Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest p-8 rounded-sm border border-outline-variant/10 max-w-3xl text-center shadow-sm">
              <p className="text-sm text-on-surface-variant italic">
                No saved measurements yet.
              </p>
              <p className="text-xs text-on-surface/50 mt-2 max-w-md mx-auto leading-relaxed">
                Use the interactive <strong>AI Size Advisor</strong> on any product detail page to automatically calculate and save your personalized boutique fit profile.
              </p>
              <Button onClick={() => { setIsEditing(true); setFormData({}); }} className="mt-6">
                Enter Measurements Manually
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
    </ProtectedRoute>
  );
}

function MetricCard({ label, value, hasIndicator }: { label: string; value?: string; hasIndicator?: boolean }) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-sm border border-outline-variant/5 shadow-sm transition-all hover:border-outline-variant/20 hover:shadow-md cursor-default group">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-center gap-3">
        {value === undefined ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-3xl font-medium text-on-surface tracking-tighter">{value}</p>
        )}
        {hasIndicator && value && parseInt(value) > 0 && (
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
        )}
      </div>
    </div>
  );
}



function QuickReorderItem({ name, price, image, onReorder }: { name: string; price: number; image: string; onReorder: () => void }) {
  return (
    <div 
      onClick={onReorder}
      className="group bg-surface-container-lowest p-4 rounded-sm flex gap-4 transition-all duration-500 hover:bg-surface-container-low border border-outline-variant/5 cursor-pointer"
    >
      <div className="w-20 h-20 bg-surface-container overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
        <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={name} />
      </div>
      <div className="flex flex-col justify-between py-1">
        <div>
          <h4 className="text-sm font-semibold text-on-surface">{name}</h4>
          <p className="text-xs text-on-surface-variant">{formatCurrency(price)}</p>
        </div>
        <Button 
          variant="none" 
          size="none" 
          onClick={(e) => { e.stopPropagation(); onReorder(); }}
          className="text-[9px] uppercase tracking-widest font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
        >
          Reorder <span className="material-symbols-outlined !text-[12px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}

function MeasurementDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-lg font-medium text-on-surface tracking-tight">{value}</p>
    </div>
  );
}
