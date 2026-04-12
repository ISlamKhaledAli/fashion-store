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
    <aside className="w-72 sticky top-20 flex flex-col p-8 gap-y-2 border-r border-outline-variant/10 bg-surface-container-low min-h-[calc(100vh-5rem)]">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container-high mb-4 overflow-hidden ring-1 ring-outline-variant/20">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-on-surface">{user?.name || "User"}</h3>
        <p className="text-xs text-on-surface-variant tracking-wide lowercase">{user?.email}</p>
        <div className="text-xs uppercase tracking-widest text-on-surface-variant mt-1">Premium Member</div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-sm group",
                isActive
                  ? "text-on-surface font-semibold bg-surface-container-lowest border-l-2 border-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <span 
                className={cn(
                  "material-symbols-outlined transition-all",
                  isActive && "fill-1"
                )}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
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
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-300 rounded-md w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm text-left font-normal">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
