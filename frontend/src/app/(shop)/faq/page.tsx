"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Package,
  RotateCcw,
  Ruler,
  CreditCard,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { contentApi } from "@/lib/api";
import type { FAQItemData } from "@/types";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  // Shipping & Delivery
  {
    id: "ship-1",
    category: "shipping",
    question: "What courier services do you use and how fast is delivery?",
    answer:
      "All orders are dispatched via our premium global courier partners (DHL Express and FedEx Priority). Domestic orders arrive within 1–2 business days. International deliveries typically take 2–4 business days with end-to-end temperature and handling control for delicate garments.",
  },
  {
    id: "ship-2",
    category: "shipping",
    question: "Are customs duties and import taxes included?",
    answer:
      "Yes. For all international destinations, we operate on a Delivered Duty Paid (DDP) basis. All applicable import duties, customs clearance tariffs, and regional taxes are calculated and included at checkout. There are never any surprise fees upon arrival.",
  },
  {
    id: "ship-3",
    category: "shipping",
    question: "Do you offer complimentary delivery?",
    answer:
      "We provide complimentary express delivery on all orders exceeding $250. Orders below this threshold are subject to a flat $15 delivery fee for domestic shipping or $25 for global express delivery.",
  },

  // Returns & Exchanges
  {
    id: "ret-1",
    category: "returns",
    question: "What is your return policy?",
    answer:
      "We offer a 14-day return window starting from the moment your parcel is signed for. Garments must remain unworn, unaltered, and unwashed, with all designer brand tags, security tags, and bespoke packaging intact.",
  },
  {
    id: "ret-2",
    category: "returns",
    question: "How do I initiate a return or exchange?",
    answer:
      "You can effortlessly request a return label from your Account Dashboard under 'My Orders'. Alternatively, contact our Client Concierge team to arrange a complimentary courier pickup directly from your doorstep.",
  },
  {
    id: "ret-3",
    category: "returns",
    question: "When will I receive my refund?",
    answer:
      "Once our atelier inspects and validates the returned garments (normally within 48 hours of receipt), your refund is immediately processed to your original payment method. Banking institutions typically reflect the credit within 3–5 business days.",
  },

  // Sizing & Care
  {
    id: "size-1",
    category: "sizing",
    question: "How do I find my precise size?",
    answer:
      "Each product page features a detailed 'Size Guide' with garment-specific dimensional measurements in both inches and centimeters. You can also utilize our interactive AI Sizing Assistant, which recommends optimal sizing based on your height, weight, and fit preferences.",
  },
  {
    id: "size-2",
    category: "sizing",
    question:
      "How should I care for natural fabrics (cashmere, silk, raw wool)?",
    answer:
      "Every piece arrives with specific fabric care instructions sewn into the interior seam. We strongly recommend professional eco-friendly dry cleaning for tailoring, wool coats, and silks. Hand-washable knits should be laid flat to dry on breathable surfaces away from direct sunlight.",
  },

  // Payments & Security
  {
    id: "pay-1",
    category: "payments",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and encrypted checkout processed through Stripe. Depending on your region, interest-free flexible payment options (such as Klarna) are also supported.",
  },
  {
    id: "pay-2",
    category: "payments",
    question: "Is my payment information secure?",
    answer:
      "Your privacy and security are paramount. All transactions are safeguarded with bank-grade 256-bit TLS encryption. We adhere to stringent PCI-DSS Level 1 compliance and never store your full payment credentials on our servers.",
  },

  // Orders & Packaging
  {
    id: "ord-1",
    category: "orders",
    question: "Can I amend or cancel an order after placing it?",
    answer:
      "Because our atelier begins preparing items swiftly to guarantee prompt delivery, orders can only be modified or cancelled within 60 minutes of placement. Please immediately reach out to our Concierge via phone or chat for urgent changes.",
  },
  {
    id: "ord-2",
    category: "orders",
    question: "How will my order be packaged?",
    answer:
      "Every order arrives in our signature matte black presentation box, enveloped in archival acid-free tissue paper and sealed with a bespoke wax emblem. Outer garments and tailoring include a breathable canvas garment bag and custom hanger.",
  },
];

const categories = [
  { id: "all", label: "All Topics", icon: Sparkles },
  { id: "shipping", label: "Shipping & Delivery", icon: Package },
  { id: "returns", label: "Returns & Exchanges", icon: RotateCcw },
  { id: "sizing", label: "Sizing & Garment Care", icon: Ruler },
  { id: "payments", label: "Payments & Security", icon: CreditCard },
  { id: "orders", label: "Orders & Packaging", icon: ShoppingBag },
];

export default function FAQPage() {
  const [faqList, setFaqList] = useState<FAQItemData[]>(faqs);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    "ship-1": true, // First item open by default
  });

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<FAQItemData[]>("faq")
      .then((res) => {
        if (
          isMounted &&
          Array.isArray(res.data?.data) &&
          res.data.data.length > 0
        ) {
          setFaqList(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    return faqList.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [faqList, activeCategory, searchQuery]);

  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-6 pt-36 pb-28 sm:px-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-14 text-center"
      >
        <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">
          Help Center
        </span>
        <h1 className="mt-2 text-4xl font-light tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
          Frequently Asked{" "}
          <span className="font-serif font-normal italic">Questions</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base font-normal text-on-surface-variant">
          Find answers regarding our shipping standards, bespoke tailoring,
          return protocols, and payment security.
        </p>

        {/* Search Bar */}
        <div className="relative mx-auto mt-8 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full rounded-full border border-outline-variant/30 bg-surface-container-lowest py-3.5 pr-5 pl-12 text-sm text-on-surface shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </motion.div>

      {/* Category Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:border-outline-variant/80 hover:bg-surface-container-low"
              }`}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </motion.div>

      {/* FAQs Accordion */}
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl divide-y divide-outline-variant/15 overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm"
      >
        {filteredFaqs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <HelpCircle
              size={36}
              className="mx-auto text-on-surface-variant/40"
            />
            <p className="mt-3 text-base font-medium text-on-surface">
              No matching questions found
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Try adjusting your search query or explore another category.
            </p>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isOpen = !!openIds[item.id];
            return (
              <div key={item.id} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left transition-colors hover:bg-surface-container-low/40 sm:px-8"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 text-base font-medium tracking-tight text-on-surface sm:text-lg">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 bg-primary/10 text-primary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pt-1 pb-6 text-sm leading-relaxed text-on-surface-variant sm:px-8">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </motion.div>

      {/* Still Need Assistance Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto mt-16 max-w-3xl rounded-3xl border border-outline-variant/15 bg-surface-container-low p-8 text-center sm:p-10"
      >
        <h3 className="text-xl font-medium tracking-tight text-on-surface">
          Have a Question Not Answered Here?
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
          Our client concierge advisors are available to guide you through
          sizes, tailoring, and order tracking.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/contact">
            <Button
              variant="primary"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase"
            >
              Contact Atelier
              <ArrowRight size={14} />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              // Open floating chat assistant
              const chatBtn = document.querySelector<HTMLButtonElement>(
                "[data-chat-trigger]"
              );
              if (chatBtn) chatBtn.click();
              else {
                window.location.href = "/contact";
              }
            }}
            className="px-6 py-2.5 text-xs font-semibold tracking-wider uppercase"
          >
            Ask AI Stylist
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
