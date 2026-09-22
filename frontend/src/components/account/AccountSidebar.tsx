"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    label: "My Rentals",
    href: "/account/rentals",
    icon: "schedule",
  },
  {
    label: "My Returns",
    href: "/account/returns",
    icon: "assignment_return",
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
    label: "Notifications",
    href: "/account/notifications",
    icon: "notifications",
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
    <>
      {/* Mobile Top Navigation & Profile Bar (< lg) */}
      <div className="block w-full border-b border-outline-variant/15 bg-surface-container-low lg:hidden">
        {/* Compact User Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-container-high ring-1 ring-outline-variant/20">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || "User Avatar"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5 text-base font-bold text-primary">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-on-surface">
                {user?.name || "User"}
              </h3>
              <p className="truncate text-[11px] tracking-wide text-on-surface-variant">
                {user?.email}
              </p>
              <span className="inline-block text-[9px] font-bold tracking-widest text-primary uppercase">
                Premium Member
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => useAuthStore.getState().logout()}
            className="flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">
              logout
            </span>
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        {/* Scrollable Horizontal Navigation Tabs */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all duration-200",
                  isActive
                    ? "bg-primary font-semibold text-white shadow-xs"
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[16px]",
                    isActive && "fill-1"
                  )}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Sticky Vertical Sidebar (>= lg) */}
      <aside className="sticky top-20 hidden min-h-[calc(100vh-5rem)] w-72 shrink-0 flex-col gap-y-2 border-r border-outline-variant/10 bg-surface-container-low p-8 lg:flex">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full bg-surface-container-high ring-1 ring-outline-variant/20">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || "User Avatar"}
                fill
                className="object-cover"
                unoptimized
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
    </>
  );
};
