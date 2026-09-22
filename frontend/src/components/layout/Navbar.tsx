"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ShoppingBag, User, Menu, X, Search, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useSearchStore } from "@/store/searchStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { SearchOverlay } from "./SearchOverlay";
import { CustomerNotificationBell } from "./CustomerNotificationBell";
import { contentApi } from "@/lib/api";
import type { NavLinkItem } from "@/types";

const defaultNavLinks: NavLinkItem[] = [
  { name: "Collections", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toggleDrawer, getTotalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { onOpen: onSearchOpen } = useSearchStore();
  const { fetchWishlist } = useWishlistStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const height = useTransform(scrollY, [0, 80], ["70px", "58px"]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(249, 249, 251, 0.92)", "rgba(249, 249, 251, 0.98)"]
  );

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      fetchWishlist();
    }
  }, [isMounted, isAuthenticated, fetchWishlist]);

  useEffect(() => {
    // Ensuring setIsMounted is set after initial render to avoid cascading render warning
    // while still handling hydration logic correctly.
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 80);
    });
  }, [scrollY]);

  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(defaultNavLinks);

  useEffect(() => {
    let isCurrent = true;
    contentApi
      .getByKey("nav_links")
      .then((res) => {
        if (
          isCurrent &&
          Array.isArray(res.data?.data) &&
          res.data.data.length > 0
        ) {
          setNavLinks(res.data.data as NavLinkItem[]);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, []);

  const accountHref = isMounted && isAuthenticated ? "/account" : "/login";

  const handleSearchOpen = () => {
    setIsMobileMenuOpen(false);
    onSearchOpen();
  };

  return (
    <motion.nav
      style={{ height, backgroundColor }}
      className={cn(
        "cinematic-ease relative z-40 flex w-full items-center justify-between border-b px-4 backdrop-blur-xl transition-all duration-500 sm:px-8",
        isScrolled
          ? "border-outline-variant/15 shadow-sm"
          : "border-outline-variant/10"
      )}
    >
      <div className="flex items-center gap-4 sm:gap-12">
        <Link
          href="/"
          className="cursor-pointer text-xl font-semibold tracking-tighter text-on-surface transition-opacity hover:opacity-70 sm:text-2xl"
        >
          CURATOR
        </Link>

        <div className="hidden items-center gap-10 font-medium tracking-tight md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group relative cursor-pointer py-2 text-on-surface/60 transition-colors duration-300 hover:text-on-surface"
            >
              {link.name}
              <motion.span
                className="h-1px absolute bottom-0 left-0 w-full origin-left bg-on-surface"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 md:gap-6">
        <Button
          variant="icon"
          size="icon"
          onClick={handleSearchOpen}
          className="text-on-surface"
          aria-label="Open search"
        >
          <Search size={20} strokeWidth={1.5} />
        </Button>

        <Button
          id="cart-icon"
          variant="icon"
          size="icon"
          onClick={() => toggleDrawer(true)}
          className="relative text-on-surface"
          aria-label="Open cart"
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
          <AnimatePresence>
            {isMounted && getTotalItems() > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-on-primary"
              >
                {getTotalItems()}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {isMounted && isAuthenticated && <CustomerNotificationBell />}

        <Link
          href={accountHref}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-all duration-300 hover:scale-95 hover:bg-surface-container-lowest"
          aria-label={isMounted && isAuthenticated ? "Open account" : "Sign in"}
        >
          <User size={20} strokeWidth={1.5} />
        </Link>

        <Button
          variant="icon"
          size="icon"
          className="text-on-surface md:hidden"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X size={20} strokeWidth={1.5} />
          ) : (
            <Menu size={20} strokeWidth={1.5} />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute top-full right-0 left-0 z-40 border-b border-outline-variant/20 bg-surface/95 px-6 py-6 shadow-xl shadow-black/5 backdrop-blur-xl md:hidden"
            )}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between border-b border-outline-variant/10 text-lg font-medium text-on-surface"
                >
                  {link.name}
                </Link>
              ))}

              {/* Luxury Atelier App Install Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("open-pwa-install"));
                }}
                className="flex min-h-12 cursor-pointer items-center justify-between border-b border-outline-variant/10 font-sans text-base font-semibold text-amber-600 dark:text-amber-400"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Atelier App
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-sans text-[9px] font-bold tracking-widest text-amber-600 uppercase dark:text-amber-300">
                  Install
                </span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSearchOpen}
                className="min-h-12 border border-outline-variant text-sm font-bold text-on-surface uppercase transition-colors hover:bg-surface-container-low"
              >
                Search
              </button>
              <Link
                href={accountHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-12 items-center justify-center bg-primary text-sm font-bold text-on-primary uppercase"
              >
                {isMounted && isAuthenticated ? "Account" : "Sign in"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchOverlay />
    </motion.nav>
  );
};
