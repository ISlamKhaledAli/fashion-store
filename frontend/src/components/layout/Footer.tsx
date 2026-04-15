"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Share2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setStatus('loading');
    try {
      // For now: just simulate success (no backend endpoint yet)
      await new Promise(r => setTimeout(r, 800));
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
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
      className="bg-surface-container-low w-full py-24 px-8 mt-24 border-t border-outline-variant/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          <div className="max-w-sm space-y-8">
            <div className="text-2xl font-bold tracking-tighter text-on-surface">
              CURATOR
            </div>
            <p className="text-on-surface-variant text-sm tracking-wide leading-relaxed">
              A multi-disciplinary studio focusing on the intersection of modern utility and timeless aesthetics.
            </p>
            <form onSubmit={handleSubscribe} className="w-full max-w-[320px] space-y-3">
              <div className="relative group">
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Subscribe to Editorial" 
                  className="bg-white/50 focus:bg-white transition-colors duration-300 pr-12"
                  disabled={status === 'loading' || status === 'success'}
                />
                <Button
                  type="submit"
                  variant="none"
                  disabled={status !== 'idle' || !email.includes('@')}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 p-0",
                    status === 'idle' ? "bg-zinc-950 text-white hover:scale-110" : "bg-zinc-100 text-zinc-400"
                  )}
                >
                  {status === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin" />
                  ) : status === 'success' ? (
                    <span className="material-symbols-outlined text-sm text-green-600">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  )}
                </Button>
              </div>
              <AnimatePresence>
                {status === 'success' && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-green-600 uppercase tracking-widest pl-1"
                  >
                    ✓ Subscribed!
                  </motion.p>
                )}
                {status === 'error' && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-red-600 uppercase tracking-widest pl-1"
                  >
                    Try again
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h5 className="text-on-surface font-bold text-xs uppercase tracking-widest">
                  {title}
                </h5>
                <nav className="flex flex-col gap-4">
                  {links.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-on-surface-variant hover:text-primary hover:underline underline-offset-4 decoration-1 transition-all text-sm"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-on-surface-variant text-[11px] uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} Curator Editorial. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Globe className="text-on-surface-variant/40 cursor-pointer hover:text-primary transition-colors" size={20} strokeWidth={1.5} />
            <Share2 className="text-on-surface-variant/40 cursor-pointer hover:text-primary transition-colors" size={20} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
