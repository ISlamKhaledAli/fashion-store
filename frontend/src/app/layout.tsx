import type { Metadata } from "next";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NavigationObserver } from "@/components/layout/NavigationObserver";
import { TopProgressBar } from "@/components/layout/TopProgressBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.CLIENT_URL || "https://thecurator.fashion"),
  title: {
    default: "THE CURATOR | Premium Fashion Commerce",
    template: "%s | THE CURATOR",
  },
  applicationName: "THE CURATOR",
  description:
    "A cinematic premium fashion storefront with AI-assisted shopping, resilient checkout, and a retail-grade admin command center.",
  keywords: [
    "premium fashion",
    "ecommerce",
    "luxury storefront",
    "AI shopping assistant",
    "fashion admin dashboard",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "THE CURATOR",
    title: "THE CURATOR | Premium Fashion Commerce",
    description:
      "A cinematic premium fashion storefront with AI-assisted shopping and an archival luxury collection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "THE CURATOR | Premium Fashion Commerce",
    description:
      "A cinematic premium fashion storefront with AI-assisted shopping and an archival luxury collection.",
  },
};

export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${playfair.variable} ${inter.variable} light font-sans`}
      style={{
        colorScheme: "only light",
        backgroundColor: "#f9f9fb",
        color: "#1a1c1d",
      }}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="only light" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#f9f9fb"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#f9f9fb"
        />
        <meta name="darkreader-lock" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="The Curator" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className="bg-surface font-sans text-on-surface"
        suppressHydrationWarning
      >
        <TopProgressBar />
        <NavigationObserver />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
