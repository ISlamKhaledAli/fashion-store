"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, FileText, Truck, RotateCcw } from "lucide-react";

interface PolicySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  currentPath: "/shipping" | "/returns" | "/privacy" | "/terms";
  sections: PolicySection[];
}

const policyLinks = [
  { href: "/shipping", label: "Shipping Policy", icon: Truck },
  { href: "/returns", label: "Returns & Exchanges", icon: RotateCcw },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/terms", label: "Terms of Service", icon: FileText },
];

export const PolicyLayout = ({
  title,
  subtitle,
  lastUpdated,
  currentPath,
  sections,
}: PolicyLayoutProps) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1360px] px-6 pt-36 pb-28 sm:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 max-w-3xl"
      >
        <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">
          Atelier Guidelines & Legal Protocols
        </span>
        <h1 className="mt-2 text-4xl font-light tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-relaxed font-normal text-on-surface-variant">
          {subtitle}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-1 text-xs text-on-surface-variant">
          <span>Last revised: {lastUpdated}</span>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Sticky Table of Contents (4 cols) */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-32 space-y-8 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Table of Contents
              </h3>
              <nav className="mt-4 space-y-1">
                {sections.map((section, idx) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`group flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-xs transition-all ${
                        isActive
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      }`}
                    >
                      <span className="w-5 text-[10px] text-on-surface-variant/50">
                        0{idx + 1}
                      </span>
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Other Policies Navigation */}
            <div className="border-t border-outline-variant/15 pt-6">
              <h4 className="mb-3 text-[11px] font-bold tracking-widest text-on-surface-variant/70 uppercase">
                Related Policies
              </h4>
              <div className="space-y-1.5">
                {policyLinks
                  .filter((p) => p.href !== currentPath)
                  .map((p) => {
                    const Icon = p.icon;
                    return (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="flex items-center gap-2 py-1 text-xs text-on-surface-variant transition-colors hover:text-primary"
                      >
                        <Icon size={14} />
                        {p.label}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </aside>

        {/* Policy Body Content (8 cols) */}
        <article className="space-y-12 lg:col-span-8">
          {sections.map((section, idx) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="scroll-mt-32 rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm sm:p-10"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high font-mono text-xs font-bold text-primary">
                  0{idx + 1}
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-on-surface sm:text-2xl">
                  {section.title}
                </h2>
              </div>
              <div className="prose prose-zinc max-w-none space-y-4 text-sm leading-relaxed text-on-surface-variant">
                {section.content}
              </div>
            </motion.section>
          ))}

          {/* Quick Footer Links for Mobile / Tablets */}
          <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-low p-8 text-center sm:p-10">
            <h3 className="text-lg font-medium text-on-surface">
              Explore Other Terms
            </h3>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {policyLinks.map((p) => (
                <Link key={p.href} href={p.href}>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all ${
                      p.href === currentPath
                        ? "bg-primary text-on-primary"
                        : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {p.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
};
