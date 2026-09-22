"use client";

import React from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AddressManager } from "@/components/account/AddressManager";

export default function AccountAddressesPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
        <AccountSidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-12">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AddressManager />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
