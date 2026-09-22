"use client";

import React from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AddressManager } from "@/components/account/AddressManager";

export default function AccountAddressesPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface">
        <AccountSidebar />

        <main className="flex-1 p-6 md:p-12">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AddressManager />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
