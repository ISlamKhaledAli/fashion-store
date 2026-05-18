import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ChatAssistant } from "@/components/layout/ChatAssistant";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen pt-[70px]">
        {children}
      </main>
      <ChatAssistant />
      <Footer />
    </>
  );
}
