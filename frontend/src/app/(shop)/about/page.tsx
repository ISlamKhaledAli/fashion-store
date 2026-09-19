"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  Feather,
  Scissors,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const pillars = [
  {
    num: "01",
    title: "Uncompromising Curation",
    description:
      "We operate outside the feverish rhythm of seasonal overproduction. Every garment admitted into our catalog is selected for architectural precision, tactile depth, and historical endurance.",
    icon: Compass,
  },
  {
    num: "02",
    title: "Noble & Traceable Fibers",
    description:
      "From double-faced virgin cashmere spun in Biella, Italy, to Japanese selvedge denim woven on vintage Toyoda shuttle looms — we source raw materials that mature and develop patina with age.",
    icon: Feather,
  },
  {
    num: "03",
    title: "Artisanal Tailoring",
    description:
      "Constructed in small family-owned ateliers across Europe and Japan. Floating canvas chest pieces, hand-sewn buttonholes, and horn buttons anchor each silhouette in couture pedigree.",
    icon: Scissors,
  },
  {
    num: "04",
    title: "Responsible Stewardship",
    description:
      "Zero deadstock inventory. We produce in micro-batches and bespoke pre-orders, pairing traditional tailoring with AI-assisted sizing algorithms to eliminate post-consumer waste.",
    icon: ShieldCheck,
  },
];

const milestones = [
  { value: "100%", label: "Traceable Organic & Noble Fibers" },
  { value: "14", label: "Heritage Generational Ateliers" },
  { value: "0", label: "Seasonal Landfill / Deadstock" },
  { value: "90+", label: "Global White-Glove Destinations" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-36 pb-20 text-center sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-lowest px-4 py-1.5 text-[11px] font-bold tracking-[0.3em] text-primary uppercase shadow-sm">
            <Sparkles size={13} />
            <span>Archival Atelier & Design House</span>
          </div>

          <h1 className="text-4xl leading-[1.08] font-light tracking-tight text-on-surface sm:text-6xl lg:text-7xl">
            Fashion Conceived as{" "}
            <span className="font-serif font-normal text-primary italic">
              Wearable Sculpture
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed font-normal text-on-surface-variant">
            The Curator was founded on a singular conviction: enduring design
            transcends the ephemeral noise of fast fashion. We bridge the rigor
            of modern architecture with the warmth of ancestral craftsmanship.
          </p>
        </motion.div>
      </section>

      {/* Atelier Visual Banner */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-16/9 w-full overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-high shadow-2xl"
        >
          <Image
            src="/images/curator_atelier.jpg"
            alt="The Curator Atelier Interior"
            fill
            priority
            className="object-cover transition-transform duration-1000 hover:scale-105"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute right-6 bottom-6 left-6 flex flex-col text-white sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
                Atelier 01 · Paris
              </p>
              <h3 className="text-xl font-light tracking-tight text-white">
                Place Vendôme Fitting Salon & Archive
              </h3>
            </div>
            <span className="mt-2 font-mono text-xs text-white/60 sm:mt-0">
              Crafted in limited runs
            </span>
          </div>
        </motion.div>
      </section>

      {/* Philosophy / Story Section */}
      <section className="mx-auto max-w-[1280px] px-6 py-28 sm:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">
              The Genesis
            </span>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-on-surface sm:text-4xl">
              Rejecting the Disposable,{" "}
              <span className="font-serif font-normal italic">
                Honoring the Hand
              </span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed font-normal text-on-surface-variant">
              <p>
                In an era dominated by hyper-accelerated micro-trends and
                synthetic fabrics destined for landfills, The Curator emerged as
                an intentional antidote.
              </p>
              <p>
                Our philosophy begins not with mood boards, but at the raw fiber
                level. We collaborate intimately with generational spinners and
                master patternmakers across Northern Italy and Honshu, Japan.
                Each cut is informed by structural minimalism — omitting
                extraneous adornment to let the poise of the silhouette and the
                weight of the weave command attention.
              </p>
              <p>
                A garment from The Curator is never complete until it is worn,
                shaped by the contours of its owner&apos;s posture and years of
                living.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative lg:col-span-6"
          >
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm sm:p-12">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award size={24} strokeWidth={1.5} />
              </div>
              <blockquote className="font-serif text-2xl leading-relaxed font-light text-on-surface italic sm:text-3xl">
                &ldquo;We do not create for seasons that expire in months. We
                design artifacts that carry personal dignity and quiet presence
                for decades.&rdquo;
              </blockquote>
              <div className="mt-6 border-t border-outline-variant/15 pt-4">
                <p className="text-sm font-semibold text-on-surface">
                  Atelier Directorate
                </p>
                <p className="text-xs text-on-surface-variant">
                  The Curator Creative Guild
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The 4 Pillars */}
      <section className="border-y border-outline-variant/10 bg-surface-container-lowest py-28">
        <div className="mx-auto max-w-[1360px] px-6 sm:px-12">
          <div className="mb-16 text-center">
            <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">
              Core Tenets
            </span>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-on-surface sm:text-5xl">
              The Four Pillars of{" "}
              <span className="font-serif font-normal italic">Excellence</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative flex flex-col justify-between rounded-3xl border border-outline-variant/15 bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-outline-variant/50 hover:shadow-lg"
                >
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-on-surface-variant/40">
                        {pillar.num}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                        <Icon size={18} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-on-surface">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Milestones / Impact Metrics */}
      <section className="mx-auto max-w-[1280px] px-6 py-28 sm:px-12">
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {milestones.map((m, idx) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm"
            >
              <div className="font-mono text-4xl font-light tracking-tight text-primary sm:text-5xl">
                {m.value}
              </div>
              <p className="mt-2 text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="border-t border-outline-variant/15 bg-surface-container-low py-24 text-center">
        <div className="mx-auto max-w-2xl px-6 sm:px-12">
          <h2 className="text-3xl font-light tracking-tight text-on-surface sm:text-4xl">
            Experience the{" "}
            <span className="font-serif font-normal italic">
              Permanent Archive
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
            Discover sculptural coats, bespoke tailoring, and foundational
            knitwear crafted to outlive trend cycles.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/products">
              <Button
                variant="primary"
                className="flex items-center gap-2 px-8 py-3 text-xs font-semibold tracking-widest uppercase shadow-md"
              >
                Explore Catalog
                <ArrowRight size={14} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="px-8 py-3 text-xs font-semibold tracking-widest uppercase"
              >
                Atelier Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
