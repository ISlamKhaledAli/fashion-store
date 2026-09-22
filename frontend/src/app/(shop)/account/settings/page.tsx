"use client";

import React from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AccountSettings } from "@/components/account/AccountSettings";

export default function AccountSettingsPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
        <AccountSidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-12">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AccountSettings />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
