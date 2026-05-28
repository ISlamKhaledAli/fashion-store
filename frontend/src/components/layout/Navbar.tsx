"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Menu, X, Search } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useSearchStore } from "@/store/searchStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { SearchOverlay } from "./SearchOverlay";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toggleDrawer, getTotalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { onOpen: onSearchOpen } = useSearchStore();
  const { fetchWishlist } = useWishlistStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const height = useTransform(scrollY, [0, 80], ["70px", "56px"]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(249, 249, 251, 0)", "rgba(249, 249, 251, 0.8)"]
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

  const navLinks = [
    { name: "Collections", href: "/products" },
    { name: "Archives", href: "/archives" },
    { name: "Editorial", href: "/editorial" },
    { name: "About", href: "/about" },
  ];

  const accountHref = isMounted && isAuthenticated ? "/account" : "/login";

  const handleSearchOpen = () => {
    setIsMobileMenuOpen(false);
    onSearchOpen();
  };

  return (
    <motion.nav
      style={{ height, backgroundColor }}
      className={cn(
        "fixed top-0 w-full z-50 flex justify-between items-center px-8 backdrop-blur-xl cinematic-ease transition-all duration-500 border-b",
        isScrolled ? "border-outline-variant/10 shadow-sm" : "border-transparent"
      )}
    >
      <div className="flex items-center gap-12">
        <Link 
          href="/" 
          className="text-2xl font-semibold tracking-tighter text-on-surface cursor-pointer hover:opacity-70 transition-opacity"
        >
          CURATOR
        </Link>

        <div className="hidden md:flex items-center gap-10 font-medium tracking-tight">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative group py-2 text-on-surface/60 hover:text-on-surface transition-colors duration-300 cursor-pointer"
            >
              {link.name}
              <motion.span
                className="absolute bottom-0 left-0 w-full h-1px bg-on-surface origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
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
                className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-on-primary text-[8px] flex items-center justify-center rounded-full font-bold"
              >
                {getTotalItems()}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

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
          className="md:hidden text-on-surface"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
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
              "fixed left-0 right-0 z-40 border-b border-outline-variant/20 bg-surface/95 px-6 py-6 shadow-xl shadow-black/5 backdrop-blur-xl md:hidden",
              isScrolled ? "top-[56px]" : "top-[70px]"
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
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSearchOpen}
                className="min-h-12 border border-outline-variant text-sm font-bold uppercase text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Search
              </button>
              <Link
                href={accountHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-12 items-center justify-center bg-primary text-sm font-bold uppercase text-on-primary"
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
