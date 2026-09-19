"use client";

import React from "react";
import { AddressManager } from "@/components/account/AddressManager";

export default function AccountAddressesPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AddressManager />
    </div>
  );
}
