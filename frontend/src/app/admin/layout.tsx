"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminChatWidget } from "@/components/admin/AdminChatWidget";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

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
  }, [pathname]);

  const navLinks = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
  ];

  const desktopMargin = isCollapsed ? 60 : 240;

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="flex min-h-screen bg-surface font-inter text-zinc-950">
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <motion.main
          initial={false}
          animate={{ marginLeft: isDesktop ? desktopMargin : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full min-w-0 flex-1 flex-col"
        >
          {/* TopNavBar */}
          <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-zinc-100 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10 lg:py-5">
            <div className="flex items-center gap-4 lg:gap-10">
              {/* Mobile hamburger */}
              <Button
                variant="icon"
                size="none"
                onClick={() => setIsMobileOpen(true)}
                className="-ml-1 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 lg:hidden"
                icon={<Menu size={22} />}
              />

              <h1 className="text-lg font-bold tracking-tight text-zinc-950 lg:text-xl">
                Dashboard
              </h1>
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
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 transition-colors hover:bg-zinc-200 lg:h-10 lg:w-10">
                <span className="text-[10px] font-bold text-zinc-600 lg:text-xs">
                  JD
                </span>
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
