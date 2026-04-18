"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn, formatCurrency } from "@/lib/utils";
import { cartApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

const shippingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  shippingMethod: z.enum(["standard", "express", "overnight"]),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingMethod {
  id: "standard" | "express" | "overnight";
  name: string;
  time: string;
  rate: number;
}

interface ShippingStepProps {
  onNext: (data: ShippingFormData) => void;
  initialData?: Partial<ShippingFormData>;
}

export const ShippingStep = ({ onNext, initialData }: ShippingStepProps) => {
  const [shippingMethods, setShippingMethods] = React.useState<ShippingMethod[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await cartApi.getShippingMethods();
        if (res.data.success) {
          setShippingMethods(res.data.data as ShippingMethod[]);
        }
      } catch (err) {
        console.error("Failed to fetch shipping methods", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      shippingMethod: "standard",
      ...initialData,
    },
  });

  const selectedMethod = watch("shippingMethod");

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
      <div>
        <h1 className="text-3xl font-medium tracking-tight mb-2">Shipping Details</h1>
        <p className="text-on-surface-variant text-sm">Please enter your delivery information below.</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-10">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="firstName"
              label="First Name"
              variant="floating"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              id="lastName"
              label="Last Name"
              variant="floating"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <Input
            id="email"
            label="Email Address"
            type="email"
            variant="floating"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="address"
            label="Shipping Address"
            variant="floating"
            error={errors.address?.message}
            {...register("address")}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              id="city"
              label="City"
              variant="floating"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              id="state"
              label="State"
              variant="floating"
              error={errors.state?.message}
              {...register("state")}
            />
            <Input
              id="zipCode"
              label="ZIP Code"
              variant="floating"
              error={errors.zipCode?.message}
              {...register("zipCode")}
            />
          </div>
        </div>

        {/* Shipping Methods Section */}
        <div className="space-y-8">
          <h2 className="text-xl font-medium tracking-tight">Shipping Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-6 border border-outline-variant/10 rounded-sm space-y-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))
            ) : (
              shippingMethods.map((method) => (
                <label 
                  key={method.id} 
                  className="relative cursor-pointer group block"
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => setValue("shippingMethod", method.id)}
                  />
                  <div 
                    className={cn(
                      "p-6 border transition-all duration-300 h-full rounded-sm",
                      selectedMethod === method.id 
                        ? "border-primary bg-surface-container-lowest ring-1 ring-primary/10" 
                        : "border-outline-variant/30 hover:border-outline-variant"
                    )}
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1">
                      {method.name}
                    </p>
                    <p className="text-sm text-on-surface-variant mb-4">
                      {method.time}
                    </p>
                    <p className="text-base font-medium">
                      {method.rate === 0 ? "Free" : formatCurrency(method.rate)}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8 flex justify-between items-center border-t border-outline-variant/10">
          <Button 
            variant="none" 
            size="none" 
            type="button"
            className="text-sm font-medium flex items-center gap-2 hover:opacity-70 transition-opacity grayscale opacity-60"
            icon={<span className="material-symbols-outlined text-lg">arrow_back</span>}
            onClick={() => window.history.back()}
          >
            Return to cart
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            className="px-10 py-5 scale-100 font-medium"
          >
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
};
