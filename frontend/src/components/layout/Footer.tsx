"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Share2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { RegionModal } from "./RegionModal";
import { ShareModal } from "./ShareModal";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

    try {
      const stored = localStorage.getItem("curator_newsletter_subscribers");
      const subscribers: string[] = stored ? JSON.parse(stored) : [];

      if (subscribers.includes(cleanEmail)) {
        toast.info("You are already subscribed to The Curator editorial.");
        setEmail("");
        return;
      }

      setStatus("loading");
      await new Promise((r) => setTimeout(r, 600));

      subscribers.push(cleanEmail);
      localStorage.setItem(
        "curator_newsletter_subscribers",
        JSON.stringify(subscribers)
      );

      setStatus("success");
      setEmail("");
      toast.success(
        "Welcome. You are now subscribed to our private dispatches."
      );
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      toast.error("Subscription failed. Please try again later.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const footerLinks = {
    Navigation: [
      { name: "Collections", href: "/products" },
      { name: "Editorial", href: "/editorial" },
      { name: "Archives", href: "/archives" },
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
              A multi-disciplinary studio focusing on the intersection of modern
              utility and timeless aesthetics.
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

        <div className="flex flex-col items-center justify-between gap-8 border-t border-outline-variant/10 pt-12 md:flex-row">
          <p className="text-[11px] font-medium tracking-widest text-on-surface-variant uppercase">
            © {new Date().getFullYear()} Curator Editorial. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-pwa-install"))
              }
              aria-label="The Curator Atelier App"
              title="Install Atelier App"
              className="group flex cursor-pointer items-center gap-1.5 text-on-surface-variant/50 transition-colors hover:text-amber-500"
            >
              <Sparkles
                className="text-amber-500 transition-transform group-hover:scale-110"
                size={18}
                strokeWidth={1.5}
              />
              <span className="hidden text-[11px] font-medium tracking-wider text-amber-500 uppercase opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                Atelier App
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegionModalOpen(true)}
              aria-label="Change Region and Currency"
              title="Region & Currency"
              className="group flex cursor-pointer items-center gap-1.5 text-on-surface-variant/50 transition-colors hover:text-primary"
            >
              <Globe
                className="transition-transform group-hover:scale-110"
                size={20}
                strokeWidth={1.5}
              />
              <span className="hidden text-[11px] font-medium tracking-wider uppercase opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                Region
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              aria-label="Share Store"
              title="Share Collection"
              className="group flex cursor-pointer items-center gap-1.5 text-on-surface-variant/50 transition-colors hover:text-primary"
            >
              <Share2
                className="transition-transform group-hover:scale-110"
                size={20}
                strokeWidth={1.5}
              />
              <span className="hidden text-[11px] font-medium tracking-wider uppercase opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
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
