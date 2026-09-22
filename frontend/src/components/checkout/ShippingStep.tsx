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
import {
  LocationPicker,
  type LocationData,
} from "@/components/ui/LocationPicker";

const shippingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  country: z.string().optional(),
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
  const [shippingMethods, setShippingMethods] = React.useState<
    ShippingMethod[]
  >([]);
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

  const handleLocationSelect = (loc: LocationData) => {
    if (loc.street) setValue("address", loc.street, { shouldValidate: true });
    if (loc.city) setValue("city", loc.city, { shouldValidate: true });
    if (loc.state) setValue("state", loc.state, { shouldValidate: true });
    if (loc.zip) setValue("zipCode", loc.zip, { shouldValidate: true });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 space-y-12 duration-700">
      <div>
        <h1 className="mb-2 text-3xl font-medium tracking-tight">
          Shipping Details
        </h1>
        <p className="text-sm text-on-surface-variant">
          Please enter your delivery information below or use auto-detect.
        </p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-8">
        {/* Quick GPS Location Picker */}
        <LocationPicker
          compact
          onLocationSelect={handleLocationSelect}
          className="mb-2"
        />

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
          <h2 className="text-xl font-medium tracking-tight">
            Shipping Method
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="space-y-4 rounded-sm border border-outline-variant/10 p-6"
                  >
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))
              : shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className="group relative block cursor-pointer"
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
                        "h-full rounded-sm border p-6 transition-all duration-300",
                        selectedMethod === method.id
                          ? "border-primary bg-surface-container-lowest ring-1 ring-primary/10"
                          : "border-outline-variant/30 hover:border-outline-variant"
                      )}
                    >
                      <p className="mb-1 text-[10px] font-bold tracking-widest uppercase">
                        {method.name}
                      </p>
                      <p className="mb-4 text-sm text-on-surface-variant">
                        {method.time}
                      </p>
                      <p className="text-base font-medium">
                        {method.rate === 0
                          ? "Free"
                          : formatCurrency(method.rate)}
                      </p>
                    </div>
                  </label>
                ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between border-t border-outline-variant/10 pt-8">
          <Button
            variant="none"
            size="none"
            type="button"
            className="flex items-center gap-2 text-sm font-medium opacity-60 grayscale transition-opacity hover:opacity-70"
            icon={
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
            }
            onClick={() => window.history.back()}
          >
            Return to cart
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="scale-100 px-10 py-5 font-medium"
          >
            Continue to Payment
          </Button>
        </div>
      </form>
    </div>
  );
};
