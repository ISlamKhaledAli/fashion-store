"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Bell,
  Menu,
  ExternalLink,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminChatWidget } from "@/components/admin/AdminChatWidget";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  // Track viewport for layout margin
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsDesktop(e.matches);
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/settings", label: "Settings" },
  ];

  const desktopMargin = isCollapsed ? 60 : 240;

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-zinc-950 selection:text-white">
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <motion.main
          animate={{
            marginLeft: isDesktop ? desktopMargin : 0,
            transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
          }}
          className="flex min-h-screen flex-col"
        >
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md lg:h-20 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="icon"
                size="none"
                onClick={() => setIsMobileOpen(true)}
                className="p-2 text-zinc-600 lg:hidden"
                icon={<Menu size={20} />}
              />
              <span className="text-xs font-black tracking-widest text-zinc-950 uppercase lg:hidden">
                The Curator
              </span>
              <div className="hidden h-4 w-[1px] bg-zinc-200 lg:block"></div>
              <nav className="hidden gap-8 lg:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "border-b-2 pb-1 text-sm font-medium tracking-tight transition-all",
                      pathname === link.href
                        ? "border-zinc-950 text-zinc-950"
                        : "border-transparent text-zinc-500 hover:border-zinc-200 hover:text-zinc-950"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <Button
                variant="icon"
                size="none"
                onClick={() => router.push("/admin/notifications")}
                className="rounded-full p-2 text-zinc-400 transition-all hover:bg-zinc-50 hover:text-zinc-950 lg:p-2.5"
                icon={<Bell size={20} />}
              />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex cursor-pointer items-center gap-2 rounded-full p-1 transition-colors hover:bg-zinc-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-zinc-900 text-xs font-bold text-white lg:h-10 lg:w-10">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className="hidden text-zinc-400 sm:block"
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-200 bg-white py-2 shadow-xl"
                    >
                      <div className="border-b border-zinc-100 px-4 py-2.5">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {user?.name || "Administrator"}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {user?.email || "admin@thecurator.com"}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/admin/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                          <SettingsIcon size={15} />
                          Admin Settings
                        </Link>
                        <Link
                          href="/"
                          target="_blank"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                          <ExternalLink size={15} />
                          Visit Storefront
                        </Link>
                      </div>

                      <div className="border-t border-zinc-100 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                            router.push("/login");
                          }}
                          className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8 xl:p-12">
            {children}
          </div>
        </motion.main>
      </div>
      <AdminChatWidget />
    </ProtectedRoute>
  );
}
