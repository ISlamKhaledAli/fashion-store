"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { contentApi, newsletterApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FooterContent } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { RegionModal } from "./RegionModal";
import { ShareModal } from "./ShareModal";

const defaultFooterContent: FooterContent = {
  brandDescription:
    "A multi-disciplinary studio focusing on the intersection of modern utility and timeless aesthetics.",
  copyrightText: "© 2026 The Curator. All Rights Reserved.",
  socialLinks: {
    instagram: "https://instagram.com",
    twitter: "https://x.com",
    facebook: "https://facebook.com",
    pinterest: "https://pinterest.com",
    tiktok: "https://tiktok.com",
  },
};

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [footerData, setFooterData] = useState<FooterContent>(
    () => defaultFooterContent
  );

  useEffect(() => {
    contentApi
      .getByKey<FooterContent>("footer")
      .then((res) => {
        if (res.data.success && res.data.data) {
          const apiData = res.data.data as FooterContent;
          setFooterData((prev) => ({
            brandDescription: apiData.brandDescription || prev.brandDescription,
            copyrightText: apiData.copyrightText || prev.copyrightText,
            socialLinks: {
              instagram:
                apiData.socialLinks?.instagram ||
                defaultFooterContent.socialLinks?.instagram,
              twitter:
                apiData.socialLinks?.twitter ||
                defaultFooterContent.socialLinks?.twitter,
              facebook:
                apiData.socialLinks?.facebook ||
                defaultFooterContent.socialLinks?.facebook,
              pinterest:
                apiData.socialLinks?.pinterest ||
                defaultFooterContent.socialLinks?.pinterest,
              tiktok:
                apiData.socialLinks?.tiktok ||
                defaultFooterContent.socialLinks?.tiktok,
            },
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem("thecurator_has_seen_region_modal");
      const hasPrefs = localStorage.getItem("thecurator_preferences");
      if (!hasSeen && !hasPrefs) {
        const timer = setTimeout(() => {
          setIsRegionModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      const res = await newsletterApi.subscribe(cleanEmail);
      setStatus("success");
      setEmail("");
      toast.success(
        res.data.message ||
          "Welcome. You are now subscribed to our private dispatches."
      );
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      toast.error(
        "Subscription failed. Please check your email and try again."
      );
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const footerLinks = {
    Navigation: [
      { name: "Collections", href: "/products" },
      { name: "About Atelier", href: "/about" },
      { name: "Client Concierge", href: "/contact" },
    ],
    Policies: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Shipping", href: "/shipping" },
    ],
    Support: [
      { name: "Returns", href: "/returns" },
      { name: "Contact", href: "/contact" },
      { name: "FAQ", href: "/faq" },
    ],
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      className="mt-24 w-full border-t border-outline-variant/10 bg-surface-container-low px-8 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 flex flex-col items-start justify-between gap-16 md:flex-row">
          <div className="max-w-sm space-y-8">
            <div className="text-2xl font-bold tracking-tighter text-on-surface">
              CURATOR
            </div>
            <p className="text-sm leading-relaxed tracking-wide text-on-surface-variant">
              {footerData.brandDescription ||
                defaultFooterContent.brandDescription}
            </p>
            <form
              onSubmit={handleSubscribe}
              className="w-full max-w-[320px] space-y-3"
            >
              <div className="group relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Subscribe to Editorial"
                  className="bg-white/50 pr-12 transition-colors duration-300 focus:bg-white"
                  disabled={status === "loading" || status === "success"}
                />
                <Button
                  type="submit"
                  variant="none"
                  disabled={status !== "idle" || !email.includes("@")}
                  className={cn(
                    "absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full p-0 transition-all duration-300",
                    status === "idle"
                      ? "bg-zinc-950 text-white hover:scale-110"
                      : "bg-zinc-100 text-zinc-400"
                  )}
                >
                  {status === "loading" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/30 border-t-zinc-400" />
                  ) : status === "success" ? (
                    <span className="material-symbols-outlined text-sm text-green-600">
                      check
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  )}
                </Button>
              </div>
              <AnimatePresence>
                {status === "success" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pl-1 text-[10px] font-bold tracking-widest text-green-600 uppercase"
                  >
                    ✓ Subscribed!
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pl-1 text-[10px] font-bold tracking-widest text-red-600 uppercase"
                  >
                    Try again
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-16 md:gap-24 lg:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h5 className="text-xs font-bold tracking-widest text-on-surface uppercase">
                  {title}
                </h5>
                <nav className="flex flex-col gap-4">
                  {links.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-sm text-on-surface-variant decoration-1 underline-offset-4 transition-all hover:text-primary hover:underline"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Social Presence Row */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/10 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-on-surface-variant uppercase">
              Atelier Dispatches & Social
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            {footerData.socialLinks?.instagram && (
              <a
                href={footerData.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow The Curator on Instagram"
                title="Instagram"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-lowest/50 text-on-surface-variant/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-500 hover:shadow-xs"
              >
                <svg
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {footerData.socialLinks?.twitter && (
              <a
                href={footerData.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow The Curator on X"
                title="X (Twitter)"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-lowest/50 text-on-surface-variant/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-on-surface/40 hover:bg-surface-container-high hover:text-on-surface hover:shadow-xs"
              >
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {footerData.socialLinks?.facebook && (
              <a
                href={footerData.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow The Curator on Facebook"
                title="Facebook"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-lowest/50 text-on-surface-variant/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-500 hover:shadow-xs"
              >
                <svg
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.611.234-2.028.675-.417.442-.488 1.13-.488 2.222v1.087h4.722l-.789 3.667h-3.933v7.98z" />
                </svg>
              </a>
            )}
            {footerData.socialLinks?.pinterest && (
              <a
                href={footerData.socialLinks.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow The Curator on Pinterest"
                title="Pinterest"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-lowest/50 text-on-surface-variant/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 hover:shadow-xs"
              >
                <svg
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.372 12-11.993C24.017 5.367 18.644 0 12.017 0z" />
                </svg>
              </a>
            )}
            {footerData.socialLinks?.tiktok && (
              <a
                href={footerData.socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow The Curator on TikTok"
                title="TikTok"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-lowest/50 text-on-surface-variant/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white hover:shadow-xs dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
              >
                <svg
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.46-.02 2.72-1.02 3.05-2.45.14-.54.19-1.1.19-1.66V.02h-.01z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-outline-variant/10 pt-12 md:flex-row">
          <p className="text-[11px] font-medium tracking-widest text-on-surface-variant uppercase">
            {footerData.copyrightText ||
              `© ${new Date().getFullYear()} Curator. All Rights Reserved.`}
          </p>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-pwa-install"))
              }
              aria-label="The Curator Atelier App"
              title="Install Atelier App"
              className="group relative flex h-8 cursor-pointer items-center rounded-full px-2 text-on-surface-variant/60 transition-all duration-500 ease-out hover:bg-amber-500/10 hover:text-amber-500"
            >
              <Sparkles
                className="shrink-0 text-amber-500 transition-transform duration-500 ease-out group-hover:scale-110"
                size={17}
                strokeWidth={1.5}
              />
              <span className="max-w-0 overflow-hidden text-[11px] font-medium tracking-wider whitespace-nowrap text-amber-500 uppercase opacity-0 transition-all duration-500 ease-out group-hover:max-w-28 group-hover:ps-1.5 group-hover:opacity-100">
                Atelier App
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegionModalOpen(true)}
              aria-label="Change Region and Currency"
              title="Region & Currency"
              className="group relative flex h-8 cursor-pointer items-center rounded-full px-2 text-on-surface-variant/60 transition-all duration-500 ease-out hover:bg-surface-container-high/70 hover:text-primary"
            >
              <Globe
                className="shrink-0 transition-transform duration-500 ease-out group-hover:scale-110"
                size={17}
                strokeWidth={1.5}
              />
              <span className="max-w-0 overflow-hidden text-[11px] font-medium tracking-wider whitespace-nowrap uppercase opacity-0 transition-all duration-500 ease-out group-hover:max-w-24 group-hover:ps-1.5 group-hover:opacity-100">
                Region
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              aria-label="Share Store"
              title="Share Collection"
              className="group relative flex h-8 cursor-pointer items-center rounded-full px-2 text-on-surface-variant/60 transition-all duration-500 ease-out hover:bg-surface-container-high/70 hover:text-primary"
            >
              <Share2
                className="shrink-0 transition-transform duration-500 ease-out group-hover:scale-110"
                size={17}
                strokeWidth={1.5}
              />
              <span className="max-w-0 overflow-hidden text-[11px] font-medium tracking-wider whitespace-nowrap uppercase opacity-0 transition-all duration-500 ease-out group-hover:max-w-24 group-hover:ps-1.5 group-hover:opacity-100">
                Share
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <RegionModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </motion.footer>
  );
};
