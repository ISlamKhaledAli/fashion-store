"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, ArrowRight, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof window !== "undefined") {
      return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    }
    return false;
  });
  const [showLuxuryModal, setShowLuxuryModal] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // Service Worker Active
        })
        .catch(() => {
          // Ignore registration failures in unsupported environments
        });
    }

    // 2. Check if already running in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      return;
    }

    // Cooldown check (3 days)
    const lastDismissed = localStorage.getItem("curator_pwa_dismissed");
    if (lastDismissed) {
      const daysSince =
        (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) {
        return;
      }
    }

    // 3. Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show gently after 4s
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }

    const handleAppInstalled = () => {
      setIsVisible(false);
      setShowLuxuryModal(false);
      setDeferredPrompt(null);
    };

    const handleCustomOpen = () => {
      setShowLuxuryModal(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("open-pwa-install", handleCustomOpen);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleCustomOpen);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setShowLuxuryModal(false);
    localStorage.setItem("curator_pwa_dismissed", Date.now().toString());
  };

  if (!isVisible && !showLuxuryModal) return null;

  return (
    <>
      {/* Haute Couture Floating Dock (Minimalist, Architectural Luxury) */}
      <AnimatePresence>
        {isVisible && !showLuxuryModal && (
          <motion.aside
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-4 bottom-5 left-4 z-50 mx-auto max-w-sm sm:right-6 sm:bottom-6 sm:left-auto"
            aria-label="The Curator Application"
          >
            <div className="relative flex items-center justify-between gap-4 border border-stone-200 bg-white/95 px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/95">
              {/* Monogram */}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-stone-900 bg-stone-950 dark:border-stone-700">
                <Image
                  src="/icon-192.png"
                  alt="The Curator"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Editorial Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-xs font-semibold tracking-wider text-stone-900 uppercase dark:text-stone-100">
                  The Curator
                </p>
                <p className="truncate font-sans text-[10px] tracking-[0.16em] text-stone-500 uppercase">
                  Atelier Digital Flagship
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLuxuryModal(true)}
                  className="cursor-pointer bg-stone-950 px-3.5 py-1.5 text-[10px] font-medium tracking-[0.18em] text-white uppercase transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
                >
                  {isIOS ? "Details" : "Install"}
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="cursor-pointer p-1 text-stone-400 transition-colors hover:text-stone-900 dark:hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Editorial Maison Installation Modal */}
      <AnimatePresence>
        {showLuxuryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Cinematic Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowLuxuryModal(false)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-md"
            />

            {/* Editorial Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md overflow-hidden border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowLuxuryModal(false)}
                className="absolute top-4 right-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Editorial Header Photography */}
              <div className="relative h-44 w-full overflow-hidden bg-stone-900">
                <Image
                  src="/images/curator_atelier.jpg"
                  alt="The Curator Atelier Haute Couture"
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-cover object-center contrast-105 grayscale"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                {/* Overlaid Atelier Badge */}
                <div className="absolute right-6 bottom-4 left-6 flex items-end justify-between">
                  <div>
                    <span className="font-sans text-[10px] font-medium tracking-[0.25em] text-stone-300 uppercase">
                      Private Client Edition
                    </span>
                    <h3 className="font-serif text-2xl font-normal tracking-wide text-white">
                      The Digital Flagship
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-7">
                <p className="font-sans text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                  Experience seamless bespoke shopping, priority archival drops,
                  and private AI styling directly on your home screen with zero
                  browser latency.
                </p>

                {/* Haute Couture Numbered Pillars */}
                <div className="dark:border-stone-850 mt-6 space-y-4 border-t border-stone-100 pt-5">
                  <div className="flex items-start gap-4">
                    <span className="pt-0.5 font-serif text-xs font-semibold tracking-wider text-stone-400 dark:text-stone-500">
                      01
                    </span>
                    <div>
                      <h4 className="font-serif text-xs font-semibold tracking-wider text-stone-900 uppercase dark:text-stone-100">
                        Priority Runway Reservations
                      </h4>
                      <p className="mt-0.5 text-[11px] leading-normal text-stone-500 dark:text-stone-400">
                        Private client early access to limited seasonal capsule
                        releases.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="pt-0.5 font-serif text-xs font-semibold tracking-wider text-stone-400 dark:text-stone-500">
                      02
                    </span>
                    <div>
                      <h4 className="font-serif text-xs font-semibold tracking-wider text-stone-900 uppercase dark:text-stone-100">
                        Native Fluid Continuity
                      </h4>
                      <p className="mt-0.5 text-[11px] leading-normal text-stone-500 dark:text-stone-400">
                        Fullscreen gesture navigation and instant offline
                        lookbook caching.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="pt-0.5 font-serif text-xs font-semibold tracking-wider text-stone-400 dark:text-stone-500">
                      03
                    </span>
                    <div>
                      <h4 className="font-serif text-xs font-semibold tracking-wider text-stone-900 uppercase dark:text-stone-100">
                        Bespoke AI Concierge
                      </h4>
                      <p className="mt-0.5 text-[11px] leading-normal text-stone-500 dark:text-stone-400">
                        Instant biometric access to your sizing profile and
                        personal wardrobe recommendations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* iOS Instructions (if detected) */}
                {isIOS ? (
                  <div className="mt-5 border border-stone-200 bg-stone-50 p-3.5 text-left dark:border-stone-800 dark:bg-stone-900/60">
                    <div className="mb-2 flex items-center gap-2">
                      <Share className="h-3.5 w-3.5 text-stone-700 dark:text-stone-300" />
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-stone-800 uppercase dark:text-stone-200">
                        Safari Instructions:
                      </span>
                    </div>
                    <ol className="list-decimal space-y-1 pl-4 font-sans text-xs text-stone-600 dark:text-stone-400">
                      <li>
                        Tap the{" "}
                        <strong className="font-medium text-stone-900 dark:text-white">
                          Share icon (⎋)
                        </strong>{" "}
                        in Safari.
                      </li>
                      <li>
                        Select{" "}
                        <strong className="font-medium text-stone-900 dark:text-white">
                          Add to Home Screen
                        </strong>
                        .
                      </li>
                      <li>
                        Confirm by tapping{" "}
                        <strong className="font-medium text-stone-900 dark:text-white">
                          Add
                        </strong>
                        .
                      </li>
                    </ol>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="mt-7 flex flex-col gap-2.5">
                  {!isIOS ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (deferredPrompt) {
                          deferredPrompt.prompt();
                          setShowLuxuryModal(false);
                        } else {
                          setShowLuxuryModal(false);
                        }
                      }}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 bg-stone-950 py-3.5 text-xs font-medium tracking-[0.22em] text-white uppercase shadow-sm transition-all hover:bg-stone-800 active:scale-[0.99] dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
                    >
                      <span>Add to Home Screen</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLuxuryModal(false)}
                      className="flex w-full cursor-pointer items-center justify-center bg-stone-950 py-3.5 text-xs font-medium tracking-[0.22em] text-white uppercase transition-all hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
                    >
                      Understood
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowLuxuryModal(false)}
                    className="cursor-pointer py-2 text-center text-[11px] tracking-[0.18em] text-stone-400 uppercase transition-colors hover:text-stone-900 dark:hover:text-stone-200"
                  >
                    Continue in Browser
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
