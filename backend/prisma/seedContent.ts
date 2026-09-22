import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the seedContent script.");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export const DEFAULT_SITE_CONTENT: Record<string, unknown> = {
  announcement_bar: {
    enabled: true,
    text: "Complimentary Worldwide Express Shipping on All Orders Over $250",
    badgeText: "LIMITED TIME",
    link: "/products",
    linkText: "Shop Collection",
    bgColor: "#09090b",
    textColor: "#f4f4f5",
    closable: true,
  },

  nav_links: [
    { name: "Collections", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],

  home_hero: {
    tagline: "Winter / Spring 2026",
    title: "Modern Elegance Redefined",
    description:
      "Architectural silhouettes crafted with uncompromising materials. Built for the modern aesthete who demands form and function in equal measure.",
    ctaText: "Explore Collection",
    ctaLink: "/products",
    secondaryCtaText: "View Lookbook",
    secondaryCtaLink: "/products",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    stats: [
      { value: "100%", label: "Sustainable Sourcing" },
      { value: "48h", label: "Express Delivery" },
      { value: "Limited", label: "Edition Pieces" },
    ],
  },

  home_brand_story: {
    title: "The Curator",
    heading: "Born from a desire to strip away the unnecessary and celebrate the essential.",
    quote:
      "True luxury is not about excess. It is about intention, precision, and the quiet confidence of well-crafted design.",
    author: "Elena Rostova",
    authorRole: "Creative Director",
    badgeText: "Edition 2026",
    badgeSubtext: "Crafted in Milan",
    imageUrl:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
  },

  home_categories_section: {
    label: "Curated Selects",
    heading: "The Architecture of Wear",
  },

  home_featured_section: {
    label: "New Release",
    heading: "The Core Collection",
    viewAllText: "View All",
  },

  home_cta_banner: {
    tagline: "Curated Aesthetic",
    title: "Evolve your space with archival garments.",
    description:
      "Join our private client program for bespoke appointments, priority access to seasonal drops, and archival restoration services.",
    primaryButtonText: "Become a Member",
    primaryButtonLink: "/register",
    secondaryButtonText: "Explore Story",
    secondaryButtonLink: "/about",
  },

  pwa_modal: {
    badge: "Private Client Edition",
    title: "The Digital Flagship",
    imageUrl: "/images/curator_atelier.jpg",
    description:
      "Experience seamless bespoke shopping, priority archival drops, and private AI styling directly on your home screen with zero browser latency.",
    benefits: [
      {
        num: "01",
        title: "Priority Runway Reservations",
        description:
          "Private client early access to limited seasonal capsule releases.",
      },
      {
        num: "02",
        title: "Native Fluid Continuity",
        description:
          "Fullscreen gesture navigation and instant offline lookbook caching.",
      },
      {
        num: "03",
        title: "Bespoke AI Concierge",
        description:
          "Instant biometric access to your sizing profile and personal wardrobe recommendations.",
      },
    ],
    buttonText: "Add to Home Screen",
  },

  footer: {
    brandDescription:
      "The Curator is a premium fashion destination dedicated to architectural silhouettes, uncompromising materials, and timeless design.",
    copyrightText: "© 2026 The Curator. All rights reserved.",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://x.com",
      facebook: "https://facebook.com",
      pinterest: "https://pinterest.com",
      tiktok: "https://tiktok.com",
    },
  },

  contact: {
    email: "concierge@thecurator.com",
    phone: "+1 (800) 555-0199",
    hours: "Monday – Friday, 9:00 AM – 8:00 PM EST",
    salons: [
      {
        city: "Milan",
        address: "Via Montenapoleone 8, 20121",
        hours: "Mon–Sat, 10:00–19:00",
      },
      {
        city: "Paris",
        address: "28 Rue du Faubourg Saint-Honoré, 75008",
        hours: "Mon–Sat, 10:00–19:30",
      },
      {
        city: "New York",
        address: "742 Madison Avenue, NY 10065",
        hours: "Mon–Sat, 10:00–18:00",
      },
    ],
  },

  about: {
    badge: "Archival Atelier & Design House",
    title: "Fashion Conceived as Wearable Sculpture",
    description:
      "The Curator was founded on a singular conviction: enduring design transcends the ephemeral noise of fast fashion. We bridge the rigor of modern architecture with the warmth of ancestral craftsmanship.",
    bannerImage: "/images/curator_atelier.jpg",
    quote:
      "We do not believe in disposable novelty. Every stitch is executed with the intention that it will be worn, preserved, and handed down across generations.",
    quoteAuthor: "Master Tailor Marco V., Atelier Florence",
    pillars: [
      {
        num: "01",
        title: "Uncompromising Curation",
        description:
          "We operate outside the feverish rhythm of seasonal overproduction. Every garment admitted into our catalog is selected for architectural precision, tactile depth, and historical endurance.",
      },
      {
        num: "02",
        title: "Noble & Traceable Fibers",
        description:
          "From double-faced virgin cashmere spun in Biella, Italy, to Japanese selvedge denim woven on vintage Toyoda shuttle looms — we source raw materials that mature and develop patina with age.",
      },
      {
        num: "03",
        title: "Artisanal Tailoring",
        description:
          "Constructed in small family-owned ateliers across Europe and Japan. Floating canvas chest pieces, hand-sewn buttonholes, and horn buttons anchor each silhouette in couture pedigree.",
      },
      {
        num: "04",
        title: "Responsible Stewardship",
        description:
          "Zero deadstock inventory. We produce in micro-batches and bespoke pre-orders, pairing traditional tailoring with AI-assisted sizing algorithms to eliminate post-consumer waste.",
      },
    ],
    milestones: [
      { value: "100%", label: "Traceable Organic & Noble Fibers" },
      { value: "14", label: "Heritage Generational Ateliers" },
      { value: "0", label: "Seasonal Landfill / Deadstock" },
      { value: "90+", label: "Global White-Glove Destinations" },
    ],
  },

  faq: [
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
      question: "How do I request a complimentary courier pickup for a return?",
      answer:
        "Navigate to your Account Orders page, locate the relevant consignment, and click 'Initiate Atelier Return'. A pre-printed DHL/FedEx return label and customs manifest will be generated, and a courier will arrive at your door at your scheduled time.",
    },
    {
      id: "size-1",
      category: "sizing",
      question: "How accurate is the AI Sizing Assistant?",
      answer:
        "Our AI Sizing Assistant matches your exact physiological measurements against the precise volumetric pattern cuts and garment ease of each brand in our atelier. It eliminates sizing guesswork with a verified 97.4% precision rate.",
    },
    {
      id: "orders-1",
      category: "orders",
      question: "Can I alter or cancel an order after placement?",
      answer:
        "Because our atelier begins white-glove inspection and custom boxing immediately, cancellations or modifications are permitted within 60 minutes of placing your order via the Concierge or your account dashboard.",
    },
  ],

  policy_privacy: {
    title: "Privacy Policy",
    subtitle: "How we collect, safeguard, and honor your personal data and digital identity.",
    lastUpdated: "January 2026",
    sections: [
      {
        id: "data-collection",
        title: "Information We Collect",
        content:
          "At The Curator, protecting your privacy and personal data is a foundational tenet of our client service. We collect information necessary to deliver personalized, world-class luxury shopping experiences:\n\n• Identity & Contact: Full name, billing and shipping addresses, email address, and telephone numbers.\n• Sizing & Fit Profile: Height, body measurements, and silhouette preferences submitted to our AI Sizing Assistant or bespoke tailors.\n• Transactional Records: Order histories, wishlist items, receipts, and client concierge correspondence.\n• Technical Telemetry: IP addresses, browser specifications, operating system, and interaction logs.",
      },
      {
        id: "purpose",
        title: "How We Utilize Your Data",
        content:
          "We process your personal information strictly for legitimate commercial purposes, including:\n\n• Fulfilling orders, scheduling couriers, and executing customs paperwork.\n• Generating bespoke wardrobe recommendations and tailored garment size matching.\n• Facilitating secure financial transactions via certified gateway partners.\n• Preventing fraudulent transactions and ensuring atelier integrity.",
      },
      {
        id: "third-parties",
        title: "Third-Party Disclosures & Security",
        content:
          "We will never monetize, lease, or distribute your private client information to advertising networks. Your data is shared exclusively with critical operating partners:\n\n• Payment gateways (Stripe) for encrypted payment tokenization.\n• Courier carriers (DHL Express, FedEx Priority) for residential delivery fulfillment.\n• Cloud infrastructure providers compliant with SOC-2 and ISO/IEC 27001 security standards.",
      },
      {
        id: "client-rights",
        title: "Your Rights & GDPR Compliance",
        content:
          "Under the General Data Protection Regulation (GDPR) and regional privacy frameworks, you possess the right to:\n\n• Request an exported archive of all personal records maintained by The Curator.\n• Rectify inaccurate identity, biometric sizing, or contact details.\n• Exercise the 'Right to be Forgotten' by requesting total permanent erasure of your profile and data.\n\nTo exercise any of these protections, submit a formal inquiry to concierge@thecurator.com.",
      },
    ],
  },

  policy_terms: {
    title: "Terms of Service",
    subtitle: "The legal guidelines and conditions governing your experience at The Curator.",
    lastUpdated: "January 2026",
    sections: [
      {
        id: "acceptance",
        title: "Acceptance & Eligibility",
        content:
          "By accessing, browsing, or completing purchases on The Curator website and digital storefronts, you confirm that you are at least 18 years of age (or the legal age of majority in your jurisdiction) and legally capable of entering into binding agreements.\n\nThese Terms govern all interactions with our online boutique, concierge services, and atelier facilities. If you do not agree with any aspect of these terms, please discontinue use of our services.",
      },
      {
        id: "intellectual-property",
        title: "Intellectual Property Rights",
        content:
          "All trademarks, editorial photography, typography, video campaigns, garment designs, website architecture, and software code are the proprietary intellectual property of The Curator and its licensed fashion houses.\n\nNo content, imagery, or textual material may be reproduced, reverse engineered, republished, or exploited for commercial purposes without our explicit written permission.",
      },
      {
        id: "pricing-orders",
        title: "Pricing, Inventory & Order Acceptance",
        content:
          "All prices are displayed in the selected regional currency and are authoritative at the moment of checkout. While we endeavor to maintain absolute catalog accuracy, rare typographical or system pricing errors may occur. In such instances, we reserve the right to decline or cancel the affected order prior to dispatch with an immediate 100% refund.\n\nReceipt of an electronic order confirmation does not signify our final acceptance of your order; it constitutes an acknowledgement of receipt. Formal acceptance occurs when items are dispatched and scanned by the courier.",
      },
      {
        id: "account-responsibility",
        title: "Account Security & Client Conduct",
        content:
          "Registered clients are solely responsible for maintaining the confidentiality of their login credentials, passwords, and two-factor authentication tokens. You agree to notify our Concierge immediately upon discovery of any unauthorized access to your profile.\n\nThe Curator reserves the right to suspend or terminate accounts that engage in fraudulent chargebacks, automated web scraping, abusive behavior toward atelier staff, or commercial resale of limited archival drops.",
      },
      {
        id: "governing-law",
        title: "Governing Law & Legal Jurisdiction",
        content:
          "These Terms and any non-contractual obligations arising out of them shall be governed by and construed in accordance with the laws of Delaware, United States, without regard to conflicts of law principles.\n\nAny disputes shall be resolved through private arbitration in accordance with commercial arbitration rules.",
      },
    ],
  },

  policy_shipping: {
    title: "Shipping & Delivery Policy",
    subtitle: "Delivered Duty Paid (DDP) global express transit from our master ateliers to your door.",
    lastUpdated: "January 2026",
    sections: [
      {
        id: "dispatch",
        title: "Global White-Glove Dispatch",
        content:
          "At The Curator, every garment and accessory is handled with extreme delicacy. Following purchase authentication and quality verification at our atelier, orders are packaged by hand in archival protective wrapping and dispatched via our dedicated courier fleet (DHL Express and FedEx Priority).\n\nOrders placed Monday through Friday before 2:00 PM EST are dispatched the same day. Orders placed after this cutoff or over the weekend will depart our facilities on the following business day.",
      },
      {
        id: "delivery-speeds",
        title: "Delivery Timelines & Destinations",
        content:
          "We currently serve over 90 countries worldwide. Estimated transit times commence once your package leaves our fulfillment atelier:\n\n• Domestic Express (USA & Canada): 1 to 2 business days.\n• European Union & UK: 2 to 3 business days via priority air transit.\n• Asia-Pacific & Middle East: 2 to 4 business days.\n• Rest of World: 3 to 5 business days.\n\nComplimentary express delivery is granted on all orders exceeding $250. Orders below this threshold carry a nominal $15 domestic or $25 international shipping fee.",
      },
      {
        id: "duties-taxes",
        title: "Duties, Customs & Import Tariffs",
        content:
          "To ensure an effortless arrival experience, all international shipments are processed strictly on a Delivered Duty Paid (DDP) basis.\n\nAll regional sales taxes, customs tariffs, border clearances, and VAT are calculated directly within your shopping cart and paid at checkout. There are never any surprise charges, courier broker holds, or supplemental fees demanded upon receipt.",
      },
      {
        id: "tracking-security",
        title: "Signature Verification & Transit Insurance",
        content:
          "Every shipment dispatched by The Curator is covered by full comprehensive marine transit insurance against loss, transit damage, or theft.\n\nFor security reasons, all deliveries require a physical signature by an adult at the destination address. Couriers are instructed not to leave packages unattended on porches or in common residential vestibules.",
      },
    ],
  },

  policy_returns: {
    title: "Returns & Exchanges Policy",
    subtitle: "Complimentary 14-day courier collection from your residence or preferred address.",
    lastUpdated: "January 2026",
    sections: [
      {
        id: "return-window",
        title: "14-Day Return Window",
        content:
          "We want you to take pleasure in every silhouette you acquire. Should an item fall short of your expectations in silhouette, fit, or feel, you may initiate a return within 14 calendar days of parcel delivery.\n\nReturns initiated within this period enjoy complimentary courier collection from your residence or preferred office address.",
      },
      {
        id: "garment-condition",
        title: "Required Garment Condition",
        content:
          "To qualify for a full refund or exchange, returned items must comply with strict atelier conditions:\n\n• Garments must be entirely unworn, unwashed, and unblemished by makeup, deodorant, or perfume.\n• All original designer brand tags, fabric labels, and security ribbons must remain attached in their original location.\n• Footwear must be tried on carpeted surfaces only to avoid scuffing outer leather soles, and returned in the intact original shoebox with dust bags.\n• Bespoke customized garments or personalized monogrammed pieces are final sale and non-returnable.",
      },
      {
        id: "return-procedure",
        title: "Step-by-Step Return Process",
        content:
          "Returning a piece is streamlined and effortless:\n\n1. Sign in to your Curator client account, locate your order, and click 'Initiate Return'.\n2. Select your pickup date, preferred time slot, and reason for return.\n3. Place the garment into the original archival box with all accessories, booklets, and packaging.\n4. Hand the parcel to the visiting DHL or FedEx courier. The shipping label is pre-printed digitally by the driver.",
      },
      {
        id: "refund-timelines",
        title: "Inspection & Refund Timelines",
        content:
          "Once your returned parcel arrives back at our Florence or New York atelier, our quality team inspects each piece within 48 business hours.\n\nUpon approval, your refund is credited immediately back to your original payment method (Credit Card, Apple Pay, Klarna). Financial institutions typically process the credited amount within 3 to 5 business days.",
      },
    ],
  },

  size_guide: {
    title: "Size Guide",
    subtitle: "Find your perfect fit with our comprehensive size chart.",
    rows: [
      { size: "XS", chest: "34-36", waist: "28-30", hip: "34-36" },
      { size: "S", chest: "36-38", waist: "30-32", hip: "36-38" },
      { size: "M", chest: "38-40", waist: "32-34", hip: "38-40" },
      { size: "L", chest: "40-42", waist: "34-36", hip: "40-42" },
      { size: "XL", chest: "42-44", waist: "36-38", hip: "42-44" },
      { size: "XXL", chest: "44-46", waist: "38-40", hip: "44-46" },
    ],
    howToMeasure: [
      {
        label: "Chest",
        instruction:
          "Measure around the fullest part of your chest, keeping the tape horizontal.",
      },
      {
        label: "Waist",
        instruction:
          "Measure around the narrowest part of your waistline, usually near your belly button.",
      },
      {
        label: "Hips",
        instruction:
          "Measure around the fullest part of your hips, keeping the tape horizontal.",
      },
    ],
    fitsAndStyles:
      "Our garments are designed with varied silhouettes. For a structured look, stick to your true size. For a more relaxed, oversized fit, consider sizing up.",
  },

  regions: {
    regions: [
      {
        code: "US",
        name: "United States",
        currency: "USD",
        symbol: "$",
        flag: "🇺🇸",
      },
      {
        code: "GB",
        name: "United Kingdom",
        currency: "GBP",
        symbol: "£",
        flag: "🇬🇧",
      },
      {
        code: "FR",
        name: "France & EU",
        currency: "EUR",
        symbol: "€",
        flag: "🇪🇺",
      },
      { code: "EG", name: "Egypt", currency: "EGP", symbol: "E£", flag: "🇪🇬" },
      {
        code: "AE",
        name: "United Arab Emirates",
        currency: "AED",
        symbol: "AED",
        flag: "🇦🇪",
      },
      {
        code: "SA",
        name: "Saudi Arabia",
        currency: "SAR",
        symbol: "SAR",
        flag: "🇸🇦",
      },
      { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", flag: "🇯🇵" },
    ],
    languages: [
      { code: "en", name: "English (US)" },
      { code: "ar", name: "العربية" },
      { code: "fr", name: "Français" },
    ],
  },

  admin_settings: {
    storeName: "The Curator",
    tagline: "Archival Atelier & Haute Prêt-à-Porter",
    supportEmail: "concierge@thecurator.com",
    currency: "USD",
    freeShippingThreshold: 250,
    domesticShippingFee: 15,
    internationalShippingFee: 25,
    taxRatePercent: 8.5,
    includeTaxInPrices: false,
    lowStockThreshold: 3,
    notifyOnNewOrders: true,
    notifyOnLowStock: true,
    maintenanceMode: false,
  },
};

async function main() {
  console.log("Seeding default site content...");

  for (const [key, data] of Object.entries(DEFAULT_SITE_CONTENT)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { data: data as any },
      create: { key, data: data as any },
    });
    console.log(`✓ Seeded content key: ${key}`);
  }

  console.log("Site content seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Failed to seed site content:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
