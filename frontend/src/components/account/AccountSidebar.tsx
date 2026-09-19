"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const menuItems = [
  {
    label: "Overview",
    href: "/account",
    icon: "dashboard",
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: "package_2",
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: "favorite",
  },
  {
    label: "Address Book",
    href: "/account/addresses",
    icon: "location_on",
  },
  {
    label: "Settings",
    href: "/account/settings",
    icon: "settings",
  },
];

export const AccountSidebar = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="sticky top-20 flex min-h-[calc(100vh-5rem)] w-72 flex-col gap-y-2 border-r border-outline-variant/10 bg-surface-container-low p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-surface-container-high ring-1 ring-outline-variant/20">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/5 text-xl font-bold text-primary">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-on-surface">
          {user?.name || "User"}
        </h3>
        <p className="text-xs tracking-wide text-on-surface-variant lowercase">
          {user?.email}
        </p>
        <div className="mt-1 text-xs tracking-widest text-on-surface-variant uppercase">
          Premium Member
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-sm px-4 py-3 transition-all duration-300",
                isActive
                  ? "border-l-2 border-primary bg-surface-container-lowest font-semibold text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined transition-all",
                  isActive && "fill-1"
                )}
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <Button
          variant="none"
          size="none"
          onClick={() => useAuthStore.getState().logout()}
          className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high hover:text-on-surface"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-left text-sm font-normal">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
