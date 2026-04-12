import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "THE CURATOR | Premium Fashion",
  description: "Experience modern utility and timeless aesthetics with The Curator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} light font-sans`} style={{ colorScheme: 'only light', backgroundColor: '#f9f9fb', color: '#1a1c1d' }} data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f9f9fb" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#f9f9fb" />
        <meta name="darkreader-lock" />
      </head>
      <body className="bg-surface text-on-surface" suppressHydrationWarning>
        <Navbar />
        <CartDrawer />
        <main className="min-h-screen pt-[70px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
