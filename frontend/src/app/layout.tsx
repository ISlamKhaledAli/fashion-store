import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "THE CURATOR | Premium Fashion",
  description: "Experience modern utility and timeless aesthetics with The Curator.",
};

export const revalidate = 0;

import { NavigationObserver } from "@/components/layout/NavigationObserver";

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
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-surface text-on-surface" suppressHydrationWarning>
        <NavigationObserver />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
