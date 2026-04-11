"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { name: "Overview", href: "/admin", icon: "dashboard" },
  { name: "Orders", href: "/admin/orders", icon: "shopping_cart" },
  { name: "Products", href: "/admin/products", icon: "inventory_2" },
  { name: "Customers", href: "/admin/customers", icon: "group" },
  { name: "Analytics", href: "/admin/analytics", icon: "analytics" },
  { name: "Settings", href: "/admin/settings", icon: "settings" },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary border-r border-white/5 flex flex-col z-[60]">
      <div className="px-8 py-10">
        <div className="text-xl font-bold tracking-tighter text-on-primary">
          CURATOR ADMIN
        </div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-on-primary/40 uppercase mt-2">
          Premium Management
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center px-4 py-3 rounded-md transition-all duration-300 font-medium text-sm tracking-tight",
              pathname === link.href
                ? "bg-white/10 text-on-primary border-l-2 border-white"
                : "text-on-primary/60 hover:text-on-primary hover:bg-white/5"
            )}
          >
            <span className="material-symbols-outlined mr-3 text-lg leading-none">
              {link.icon}
            </span>
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden relative">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMs_v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v" 
              alt="Admin" 
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-on-primary">Jordan Admin</div>
            <div className="text-[10px] text-on-primary/40 font-bold uppercase tracking-widest">
              Super Admin
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
