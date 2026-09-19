import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ChatAssistantWrapper } from "@/components/layout/ChatAssistantWrapper";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="min-h-screen pt-[70px]">{children}</div>
      <ChatAssistantWrapper />
      <Footer />
    </>
  );
}
