"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="flex bg-surface min-h-screen font-inter">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
        
        <motion.main 
          initial={false}
          animate={{ marginLeft: isCollapsed ? 60 : 240 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col min-w-0"
        >
          {/* TopNavBar Component */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 w-full border-b border-outline-variant/10">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
              <div className="h-4 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
              <nav className="hidden lg:flex gap-6">
                <span className="text-zinc-900 font-semibold border-b-2 border-zinc-900 pb-1 text-sm tracking-tight cursor-pointer">Overview</span>
                <span className="text-zinc-500 hover:opacity-70 transition-opacity text-sm tracking-tight cursor-pointer">Reports</span>
                <span className="text-zinc-500 hover:opacity-70 transition-opacity text-sm tracking-tight cursor-pointer">Notifications</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-6">
              <Button 
                variant="icon" 
                size="none" 
                className="text-zinc-500"
                icon={<span className="material-symbols-outlined text-[20px]">notifications</span>}
              />
              <Button 
                variant="primary" 
                size="sm" 
                className="rounded-lg shadow-none"
              >
                Add Product
              </Button>
            </div>
          </header>

          <div className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </motion.main>
      </div>
    </ProtectedRoute>
  );
}
