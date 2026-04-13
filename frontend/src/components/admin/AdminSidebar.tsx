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
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Tags,
  Warehouse,
  FolderTree,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { name: "Discounts", href: "/admin/discounts", icon: Tags },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 60 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800/50 flex flex-col z-50 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="h-24 flex items-center px-6 relative border-b border-zinc-900/50">
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
                Cinematic <span className="text-zinc-500 font-light italic">Admin</span>
              </div>
              <div className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase mt-1">Premium Management</div>
            </motion.div>
          ) : (
            <motion.div
              key="small-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto"
            >
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-zinc-950 font-black text-xs">
                C
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 py-6 space-y-1 no-scrollbar overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center h-12 px-6 transition-all relative group",
                isActive 
                  ? "text-white bg-zinc-900 border-l-4 border-white" 
                  : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900"
              )}
            >
              <link.icon 
                size={18} 
                strokeWidth={isActive ? 2 : 1.5}
                className={cn("min-w-[18px]", isCollapsed ? "mx-auto" : "mr-4")} 
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium tracking-tight whitespace-nowrap"
                >
                  {link.name}
                </motion.span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-white text-zinc-950 text-xs font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-xl">
                  {link.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 border-t border-zinc-800/50">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30",
          isCollapsed ? "justify-center" : "px-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 overflow-hidden border border-zinc-700">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-white font-bold">
                {user?.name?.charAt(0) || "S"}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{user?.name || "Sarah Jenkins"}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold truncate">Super Admin</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button 
            variant="icon"
            size="none"
            onClick={onToggle}
            className="w-10 h-10 flex items-center justify-center bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all border border-zinc-800/50 shadow-lg group"
            icon={
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
              >
                <ChevronLeft size={18} className="transition-transform group-hover:scale-110" />
              </motion.div>
            }
          />
        </div>
      </div>
    </motion.aside>
  );
};
