import React from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ChatAssistantWrapper } from "@/components/layout/ChatAssistantWrapper";
import { PwaInstallPrompt } from "@/components/layout/PwaInstallPrompt";
import { MaintenanceGuard } from "@/components/layout/MaintenanceGuard";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaintenanceGuard>
      <header className="sticky top-0 z-50 w-full">
        <AnnouncementBar />
        <Navbar />
      </header>
      <CartDrawer />
      <main className="min-h-screen overflow-x-clip">{children}</main>
      <ChatAssistantWrapper />
      <PwaInstallPrompt />
      <Footer />
    </MaintenanceGuard>
  );
}
