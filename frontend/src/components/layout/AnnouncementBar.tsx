"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { contentApi } from "@/lib/api";
import type { AnnouncementBarContent } from "@/types";

const defaultAnnouncement: AnnouncementBarContent = {
  enabled: true,
  text: "Complimentary Worldwide Express Shipping on All Orders Over $250",
  badgeText: "LIMITED TIME",
  link: "/products",
  linkText: "Shop Collection",
  bgColor: "#09090b",
  textColor: "#f4f4f5",
  closable: true,
};

export const AnnouncementBar = () => {
  const [content, setContent] =
    useState<AnnouncementBarContent>(defaultAnnouncement);
  const [isLoaded, setIsLoaded] = useState(false);
  const [manualDismissed, setManualDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    contentApi
      .getByKey("announcement_bar")
      .then((res) => {
        if (isMounted && res.data?.data) {
          const remoteData = res.data.data as Partial<AnnouncementBarContent>;
          setContent((prev) => ({ ...prev, ...remoteData }));
        }
      })
      .catch(() => {
        // Fallback to default
      })
      .finally(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isStorageDismissed = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => {
      try {
        const dismissKey = `announcement_dismissed_${content.text}`;
        return Boolean(sessionStorage.getItem(dismissKey));
      } catch {
        return false;
      }
    },
    () => false
  );

  const handleDismiss = () => {
    setManualDismissed(true);
    try {
      const dismissKey = `announcement_dismissed_${content.text}`;
      sessionStorage.setItem(dismissKey, "true");
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Storage unavailable
    }
  };

  const isDismissed = manualDismissed || isStorageDismissed;

  if (!isLoaded || !content.enabled || !content.text || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          backgroundColor: content.bgColor || "#09090b",
          color: content.textColor || "#f4f4f5",
        }}
        className="relative z-50 overflow-hidden border-b border-white/10 text-xs"
      >
        <div className="mx-auto flex min-h-[38px] max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-center text-[11px] font-medium tracking-wider">
            {content.badgeText && (
              <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-black tracking-widest text-white uppercase backdrop-blur-xs">
                {content.badgeText}
              </span>
            )}

            <span className="font-light">{content.text}</span>

            {content.link && (
              <Link
                href={content.link}
                className="group ml-1 inline-flex items-center gap-1 font-bold underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                <span>{content.linkText || "Learn More"}</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {content.closable !== false && (
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="ml-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
