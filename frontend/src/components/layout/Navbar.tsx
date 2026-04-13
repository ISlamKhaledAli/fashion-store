"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Menu } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { useSearchStore } from "@/store/searchStore";
import { SearchOverlay } from "./SearchOverlay";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toggleDrawer, getTotalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { onOpen: onSearchOpen } = useSearchStore();

  const height = useTransform(scrollY, [0, 80], ["70px", "56px"]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(249, 249, 251, 0)", "rgba(249, 249, 251, 0.8)"]
  );

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
          onClick={onSearchOpen}
          className="text-on-surface"
        >
          <Search size={20} strokeWidth={1.5} />
        </Button>

        <Button
          variant="icon"
          size="icon"
          onClick={() => toggleDrawer(true)}
          className="relative text-on-surface"
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
          href={isMounted && isAuthenticated ? "/account" : "/login"}
          className="text-on-surface hover:scale-95 transition-all duration-500 ease-out flex items-center justify-center cursor-pointer"
        >
          <Button variant="icon" size="icon">
            <User size={20} strokeWidth={1.5} />
          </Button>
        </Link>
        
        {/* Mobile Menu Toggle */}
        <Button variant="icon" size="icon" className="md:hidden text-on-surface">
          <Menu size={20} strokeWidth={1.5} />
        </Button>
      </div>
      <SearchOverlay />
    </motion.nav>
  );
};
