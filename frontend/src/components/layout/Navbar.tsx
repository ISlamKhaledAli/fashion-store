"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleDrawer, getTotalItems } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const height = useTransform(scrollY, [0, 80], ["80px", "64px"]);
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(249, 249, 251, 0)", "rgba(249, 249, 251, 0.8)"]
  );

  useEffect(() => {
    return scrollY.onChange((latest) => {
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
          className="text-2xl font-semibold tracking-tighter text-on-surface"
        >
          CURATOR
        </Link>

        <div className="hidden md:flex items-center gap-10 font-medium tracking-tight">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative group py-2 text-on-surface/60 hover:text-on-surface transition-colors duration-300"
            >
              {link.name}
              <motion.span
                className="absolute bottom-0 left-0 w-full h-[1px] bg-on-surface origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => toggleDrawer(true)}
          className="relative material-symbols-outlined text-on-surface hover:scale-95 duration-500 ease-out"
        >
          shopping_bag
          <AnimatePresence>
            {getTotalItems() > 0 && (
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
        </button>

        <Link
          href={isAuthenticated ? "/account" : "/login"}
          className="material-symbols-outlined text-on-surface hover:scale-95 duration-500 ease-out"
        >
          person
        </Link>
      </div>
    </motion.nav>
  );
};
