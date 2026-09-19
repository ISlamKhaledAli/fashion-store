"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  ChevronLeft,
  Tags,
  Tag,
  Warehouse,
  FolderTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Brands", href: "/admin/brands", icon: Tag },
  { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { name: "Discounts", href: "/admin/discounts", icon: Tags },
];

export const AdminSidebar = ({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: AdminSidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="relative flex h-24 items-center border-b border-zinc-900/50 px-6">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="whitespace-nowrap"
            >
              <div className="text-xl font-bold tracking-tighter text-white">
                Cinematic{" "}
                <span className="font-light text-zinc-500 italic">Admin</span>
              </div>
              <div className="mt-1 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                Premium Management
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="small-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-xs font-black text-zinc-950">
                C
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close button */}
        <CloseButton
          onClick={onMobileClose}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-500 hover:bg-zinc-800 hover:text-white lg:hidden"
          size={18}
        />
      </div>

      {/* Nav Section */}
      <nav className="no-scrollbar flex-1 space-y-1 overflow-x-hidden overflow-y-auto py-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onMobileClose}
              className={cn(
                "group relative flex h-12 items-center px-6 transition-all",
                isActive
                  ? "border-l-4 border-white bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <link.icon
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "min-w-[18px]",
                  isCollapsed && !isMobileOpen ? "mx-auto" : "mr-4"
                )}
              />
              {(!isCollapsed || isMobileOpen) && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium tracking-tight whitespace-nowrap"
                >
                  {link.name}
                </motion.span>
              )}
              {isCollapsed && !isMobileOpen && (
                <div className="pointer-events-none absolute left-full z-[60] ml-4 rounded bg-white px-3 py-2 text-xs font-bold whitespace-nowrap text-zinc-950 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  {link.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-t border-zinc-800/50 p-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-zinc-800/30 bg-zinc-900/50 p-2",
            isCollapsed && !isMobileOpen ? "justify-center" : "px-3"
          )}
        >
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
                {user?.name?.charAt(0) || "S"}
              </div>
            )}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-bold text-white">
                {user?.name || "Sarah Jenkins"}
              </div>
              <div className="truncate text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
                Super Admin
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle - desktop only */}
        <div className="mt-4 hidden justify-center lg:flex">
          <Button
            variant="icon"
            size="none"
            onClick={onToggle}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800/50 bg-zinc-900 text-zinc-500 shadow-lg transition-all hover:bg-zinc-800 hover:text-white"
            icon={
              <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
                <ChevronLeft
                  size={18}
                  className="transition-transform group-hover:scale-110"
                />
              </motion.div>
            }
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 60 : 240 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        className="fixed top-0 left-0 z-50 hidden h-screen flex-col overflow-hidden border-r border-zinc-800/50 bg-zinc-950 lg:flex"
      >
        {sidebarContent}
      </motion.aside>

      {/* ===== MOBILE SIDEBAR (DRAWER) ===== */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 z-[100] flex h-screen w-[280px] flex-col overflow-hidden border-r border-zinc-800/50 bg-zinc-950 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
