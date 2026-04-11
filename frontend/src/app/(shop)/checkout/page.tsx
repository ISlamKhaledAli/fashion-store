"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { orderApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Simplification: Direct order creation for demo
      // In production, we'd handle Stripe clientSecret here
      const response = await orderApi.create({
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
      });

      if (response.data.success) {
        clearCart();
        router.push(`/order-success?id=${response.data.data.order.id}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message : "Checkout failed. Please check your details.";
      setError(errorMessage || "Checkout failed. Please check your details.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-40 text-center space-y-8">
        <h1 className="text-2xl font-bold tracking-tighter">Your bag is empty</h1>
        <Button onClick={() => router.push("/products")}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-8 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
        {/* Left: Shipping Form */}
        <div className="lg:col-span-7 space-y-16">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tighter">Shipping Details</h1>
            <p className="text-on-surface-variant text-sm uppercase tracking-[0.2em] font-bold">
              Where shall we send your curation?
            </p>
          </div>

          <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <Input 
                name="name" 
                label="Full Name" 
                placeholder="Alex Curator" 
                required 
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <Input 
                name="email" 
                type="email" 
                label="Email Address" 
                placeholder="name@example.com" 
                required
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <Input 
                name="address" 
                label="Street Address" 
                placeholder="123 Archive St." 
                required
                onChange={handleInputChange}
              />
            </div>
            <Input 
                name="city" 
                label="City" 
                placeholder="Paris" 
                required
                onChange={handleInputChange}
            />
            <Input 
                name="zipCode" 
                label="ZIP / Postal Code" 
                placeholder="75001" 
                required
                onChange={handleInputChange}
            />
            
            <div className="md:col-span-2 pt-8">
              <Button 
                type="submit" 
                className="w-full" 
                isLoading={isProcessing}
              >
                Place Order — {formatCurrency(getTotalPrice())}
              </Button>
              {error && (
                <p className="text-error text-xs font-bold uppercase tracking-widest text-center mt-4">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-low p-12 space-y-12 sticky top-32">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Order Summary</h3>
            
            <div className="space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6">
                  <div className="w-16 h-20 relative bg-white overflow-hidden rounded-sm">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {item.color} / {item.size} × {item.quantity}
                    </p>
                    <p className="text-sm font-bold tracking-tighter">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-outline-variant/10 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Subtotal</span>
                <span className="font-bold">{formatCurrency(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Shipping</span>
                <span className="font-bold">Complimentary</span>
              </div>
              <div className="flex justify-between items-baseline pt-4 border-t border-outline-variant/10">
                <span className="text-xs font-extrabold uppercase tracking-widest">Total</span>
                <span className="text-3xl font-bold tracking-tighter">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
