"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Shield,
  FileText,
  Truck,
  RotateCcw,
  Mail,
  RefreshCw,
  Info,
  Smartphone,
  Ruler,
  Globe,
  Megaphone,
  Image as ImageIcon,
} from "lucide-react";
import { BannerManager } from "@/components/admin/BannerManager";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { contentApi, adminApi } from "@/lib/api";
import type {
  HeroContent,
  BrandStoryContent,
  CtaBannerContent,
  FooterContent,
  ContactPageContent,
  AboutPageContent,
  FAQItemData,
  PolicyPageContent,
  PwaModalContent,
  HomeCategoriesSectionContent,
  HomeFeaturedSectionContent,
  SizeGuideContent,
  RegionSettingsContent,
  AnnouncementBarContent,
  NavLinkItem,
} from "@/types";

type ContentTab =
  | "banners"
  | "announcement"
  | "home"
  | "about"
  | "contact_footer"
  | "faq"
  | "policies"
  | "app"
  | "size_guide"
  | "regions";
type PolicyTab = "privacy" | "terms" | "shipping" | "returns";

// Image input with Cloudinary upload + URL input + live preview + recommended dimensions
const ImageField = ({
  label,
  value,
  onChange,
  aspectRatio = "aspect-16/9",
  recommendedSize,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  aspectRatio?: string;
  recommendedSize?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await adminApi.uploadMedia(file);
      if (res.data?.data?.url) {
        onChange(res.data.data.url);
        toast.success("Image uploaded successfully");
      }
    } catch {
      toast.error("Failed to upload image to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
          {label}
        </label>
        {recommendedSize && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Recommended: {recommendedSize}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload image"
          className="flex-1"
        />
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Upload size={14} className={isUploading ? "animate-spin" : ""} />
          <span>{isUploading ? "Uploading..." : "Upload"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Live Preview */}
      {value && (
        <div
          className={`relative mt-2 w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 ${aspectRatio}`}
        >
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 600px) 100vw, 400px"
          />
        </div>
      )}
    </div>
  );
};

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("home");
  const [activePolicy, setActivePolicy] = useState<PolicyTab>("privacy");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Content states
  const [announcement, setAnnouncement] = useState<AnnouncementBarContent>({
    enabled: true,
    text: "Complimentary Worldwide Express Shipping on All Orders Over $250",
    badgeText: "LIMITED TIME",
    link: "/products",
    linkText: "Shop Collection",
    bgColor: "#09090b",
    textColor: "#f4f4f5",
    closable: true,
  });

  const [hero, setHero] = useState<HeroContent>({
    tagline: "Winter / Spring 2026",
    title: "Modern Elegance Redefined",
    description:
      "Architectural silhouettes crafted with uncompromising materials.",
    ctaText: "Explore Collection",
    ctaLink: "/products",
    secondaryCtaText: "Our Story",
    secondaryCtaLink: "/about",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    stats: [
      { value: "100%", label: "Sustainable Sourcing" },
      { value: "48h", label: "Express Delivery" },
      { value: "Limited", label: "Edition Pieces" },
    ],
  });

  const [brandStory, setBrandStory] = useState<BrandStoryContent>({
    title: "The Curator",
    heading:
      "Born from a desire to strip away the unnecessary and celebrate the essential.",
    quote:
      "True luxury is not about excess. It is about intention, precision, and the quiet confidence of well-crafted design.",
    author: "Elena Rostova",
    authorRole: "Creative Director",
    badgeText: "Edition 2026",
    badgeSubtext: "Crafted in Milan",
    imageUrl:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
  });

  const [ctaBanner, setCtaBanner] = useState<CtaBannerContent>({
    tagline: "Curated Aesthetic",
    title: "Evolve your space with archival garments.",
    description: "Join our private client program for bespoke appointments.",
    primaryButtonText: "Become a Member",
    primaryButtonLink: "/register",
    secondaryButtonText: "Explore Story",
    secondaryButtonLink: "/about",
  });

  const [footer, setFooter] = useState<FooterContent>({
    brandDescription:
      "The Curator is a premium fashion destination dedicated to architectural silhouettes.",
    copyrightText: "© 2026 The Curator. All rights reserved.",
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://x.com",
      facebook: "https://facebook.com",
      pinterest: "https://pinterest.com",
      tiktok: "https://tiktok.com",
    },
  });

  const [navLinks, setNavLinks] = useState<NavLinkItem[]>([
    { name: "Collections", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]);

  const [contact, setContact] = useState<ContactPageContent>({
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
    ],
  });

  const [about, setAbout] = useState<AboutPageContent>({
    badge: "Archival Atelier & Design House",
    title: "Fashion Conceived as Wearable Sculpture",
    description:
      "The Curator was founded on a singular conviction: enduring design transcends the ephemeral noise.",
    bannerImage: "/images/curator_atelier.jpg",
    quote: "We do not believe in disposable novelty.",
    quoteAuthor: "Master Tailor Marco V., Atelier Florence",
    pillars: [
      {
        num: "01",
        title: "Uncompromising Curation",
        description: "Selected for architectural precision.",
      },
      {
        num: "02",
        title: "Noble & Traceable Fibers",
        description: "Spun in Biella, Italy.",
      },
      {
        num: "03",
        title: "Artisanal Tailoring",
        description: "Constructed in family-owned ateliers.",
      },
      {
        num: "04",
        title: "Responsible Stewardship",
        description: "Zero deadstock inventory.",
      },
    ],
    milestones: [
      { value: "100%", label: "Traceable Organic & Noble Fibers" },
      { value: "14", label: "Heritage Generational Ateliers" },
      { value: "0", label: "Seasonal Landfill / Deadstock" },
      { value: "90+", label: "Global White-Glove Destinations" },
    ],
  });

  const [pwaModal, setPwaModal] = useState<PwaModalContent>({
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
  });

  const [categoriesSection, setCategoriesSection] =
    useState<HomeCategoriesSectionContent>({
      label: "Curated Selects",
      heading: "The Architecture of Wear",
    });

  const [featuredSection, setFeaturedSection] =
    useState<HomeFeaturedSectionContent>({
      label: "New Release",
      heading: "The Core Collection",
      viewAllText: "View All",
    });

  const [sizeGuide, setSizeGuide] = useState<SizeGuideContent>({
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
  });

  const [regionsData, setRegionsData] = useState<RegionSettingsContent>({
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
  });

  const [faqs, setFaqs] = useState<FAQItemData[]>([]);

  const [policies, setPolicies] = useState<
    Record<PolicyTab, PolicyPageContent>
  >({
    privacy: {
      title: "Privacy Policy",
      subtitle: "Data protection guidelines",
      lastUpdated: "January 2026",
      sections: [],
    },
    terms: {
      title: "Terms of Service",
      subtitle: "Legal guidelines and conditions",
      lastUpdated: "January 2026",
      sections: [],
    },
    shipping: {
      title: "Shipping Policy",
      subtitle: "Global express transit",
      lastUpdated: "January 2026",
      sections: [],
    },
    returns: {
      title: "Returns Policy",
      subtitle: "Complimentary 14-day collection",
      lastUpdated: "January 2026",
      sections: [],
    },
  });

  // Load all content on mount
  const loadAllContent = () => {
    setIsLoading(true);
    contentApi
      .getAll()
      .then((res) => {
        const map = res.data?.data?.map || {};
        if (map.announcement_bar)
          setAnnouncement((prev) => ({
            ...prev,
            ...(map.announcement_bar as AnnouncementBarContent),
          }));
        if (map.home_hero)
          setHero((prev) => ({ ...prev, ...(map.home_hero as HeroContent) }));
        if (map.home_brand_story)
          setBrandStory((prev) => ({
            ...prev,
            ...(map.home_brand_story as BrandStoryContent),
          }));
        if (map.home_categories_section)
          setCategoriesSection((prev) => ({
            ...prev,
            ...(map.home_categories_section as HomeCategoriesSectionContent),
          }));
        if (map.home_featured_section)
          setFeaturedSection((prev) => ({
            ...prev,
            ...(map.home_featured_section as HomeFeaturedSectionContent),
          }));
        if (map.home_cta_banner)
          setCtaBanner((prev) => ({
            ...prev,
            ...(map.home_cta_banner as CtaBannerContent),
          }));
        if (map.footer)
          setFooter((prev) => ({ ...prev, ...(map.footer as FooterContent) }));
        if (Array.isArray(map.nav_links) && map.nav_links.length > 0)
          setNavLinks(map.nav_links as NavLinkItem[]);
        if (map.contact)
          setContact((prev) => ({
            ...prev,
            ...(map.contact as ContactPageContent),
          }));
        if (map.about)
          setAbout((prev) => ({ ...prev, ...(map.about as AboutPageContent) }));
        if (map.pwa_modal)
          setPwaModal((prev) => ({
            ...prev,
            ...(map.pwa_modal as PwaModalContent),
          }));
        if (map.size_guide)
          setSizeGuide((prev) => ({
            ...prev,
            ...(map.size_guide as SizeGuideContent),
          }));
        if (map.regions)
          setRegionsData((prev) => ({
            ...prev,
            ...(map.regions as RegionSettingsContent),
          }));
        if (Array.isArray(map.faq)) setFaqs(map.faq as FAQItemData[]);
        if (map.policy_privacy)
          setPolicies((prev) => ({
            ...prev,
            privacy: map.policy_privacy as PolicyPageContent,
          }));
        if (map.policy_terms)
          setPolicies((prev) => ({
            ...prev,
            terms: map.policy_terms as PolicyPageContent,
          }));
        if (map.policy_shipping)
          setPolicies((prev) => ({
            ...prev,
            shipping: map.policy_shipping as PolicyPageContent,
          }));
        if (map.policy_returns)
          setPolicies((prev) => ({
            ...prev,
            returns: map.policy_returns as PolicyPageContent,
          }));
      })
      .catch(() => {
        toast.error("Failed to load site content");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadAllContent();
  }, []);

  const saveSection = async (key: string, data: unknown) => {
    setIsSaving(true);
    try {
      await contentApi.upsert(key, data);
      toast.success(`Saved changes for ${key.replace("_", " ")}`);
    } catch {
      toast.error(`Failed to save ${key}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers for FAQ ---
  const handleAddFaq = () => {
    const newFaq: FAQItemData = {
      id: `faq-${Date.now()}`,
      category: "shipping",
      question: "New question",
      answer: "New answer details.",
    };
    setFaqs((prev) => [newFaq, ...prev]);
  };

  const handleUpdateFaq = (
    idx: number,
    field: keyof FAQItemData,
    val: string
  ) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleDeleteFaq = (idx: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
  };

  // --- Handlers for Policy Sections ---
  const handleAddPolicySection = (tab: PolicyTab) => {
    const newSec = {
      id: `sec-${Date.now()}`,
      title: "New Policy Section",
      content: "Detailed policy content...",
    };
    setPolicies((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        sections: [...prev[tab].sections, newSec],
      },
    }));
  };

  const handleUpdatePolicySection = (
    tab: PolicyTab,
    idx: number,
    field: "title" | "content",
    val: string
  ) => {
    setPolicies((prev) => {
      const copy = [...prev[tab].sections];
      copy[idx] = { ...copy[idx], [field]: val };
      return {
        ...prev,
        [tab]: {
          ...prev[tab],
          sections: copy,
        },
      };
    });
  };

  const handleDeletePolicySection = (tab: PolicyTab, idx: number) => {
    setPolicies((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        sections: prev[tab].sections.filter((_, i) => i !== idx),
      },
    }));
  };

  return (
    <div className="mx-auto max-w-[1600px] p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
            Content <span className="font-serif italic">Studio</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage storefront imagery, editorial copy, salon addresses, FAQs,
            and policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllContent}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Reload All
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {[
          { id: "banners", label: "Hero Banners", icon: ImageIcon },
          { id: "announcement", label: "Announcement Bar", icon: Megaphone },
          { id: "home", label: "Landing & Hero", icon: Sparkles },
          { id: "about", label: "About Atelier", icon: Info },
          { id: "contact_footer", label: "Contact & Footer", icon: Mail },
          { id: "app", label: "App & PWA Modal", icon: Smartphone },
          { id: "size_guide", label: "Size Guide", icon: Ruler },
          { id: "regions", label: "Regions & Currencies", icon: Globe },
          { id: "faq", label: "FAQ Center", icon: HelpCircle },
          { id: "policies", label: "Legal Policies", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ContentTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                isActive
                  ? "bg-zinc-950 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950"
                  : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Promotional Banners */}
      {activeTab === "banners" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <BannerManager />
        </div>
      )}

      {/* Tab 0: Announcement Bar */}
      {activeTab === "announcement" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex flex-col gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Storefront Announcement Bar
                </h2>
                <p className="text-xs text-zinc-500">
                  Global promotional banner displayed at the absolute top of the
                  flagship boutique.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("announcement_bar", announcement)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Announcement
              </Button>
            </div>

            {/* Live Interactive Preview */}
            <div className="mb-8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                  Live Interactive Preview
                </span>
                <span className="text-[10px] text-zinc-400">
                  Matches storefront appearance
                </span>
              </div>

              <div
                style={{
                  backgroundColor: announcement.bgColor || "#09090b",
                  color: announcement.textColor || "#f4f4f5",
                }}
                className="relative overflow-hidden rounded-xl border border-zinc-200/50 p-3 shadow-inner transition-colors duration-300 dark:border-zinc-700"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-center text-xs">
                    {announcement.badgeText && (
                      <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-white uppercase backdrop-blur-xs">
                        {announcement.badgeText}
                      </span>
                    )}
                    <span className="font-light">
                      {announcement.text || "Your announcement message here..."}
                    </span>
                    {announcement.link && (
                      <span className="font-bold underline underline-offset-4">
                        {announcement.linkText || "Learn More"} →
                      </span>
                    )}
                  </div>
                  {announcement.closable !== false && (
                    <span className="cursor-pointer text-xs opacity-60 hover:opacity-100">
                      ✕
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {/* Active Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div>
                    <label className="text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                      Enable Banner
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Toggle banner visibility on the storefront
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={announcement.enabled}
                    onChange={(e) =>
                      setAnnouncement({
                        ...announcement,
                        enabled: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                </div>

                {/* Announcement Text */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Announcement Message
                  </label>
                  <Input
                    value={announcement.text}
                    onChange={(e) =>
                      setAnnouncement({ ...announcement, text: e.target.value })
                    }
                    placeholder="e.g. Free shipping on orders over $250"
                  />
                </div>

                {/* Badge Text */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Badge Pill (Optional)
                  </label>
                  <Input
                    value={announcement.badgeText || ""}
                    onChange={(e) =>
                      setAnnouncement({
                        ...announcement,
                        badgeText: e.target.value,
                      })
                    }
                    placeholder="e.g. LIMITED TIME, ARCHIVE DROP"
                  />
                </div>

                {/* Closable Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div>
                    <label className="text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                      Allow Dismissal
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Display close button (X) for customers
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={announcement.closable !== false}
                    onChange={(e) =>
                      setAnnouncement({
                        ...announcement,
                        closable: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* CTA Link & Link Text */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Destination Link
                    </label>
                    <Input
                      value={announcement.link || ""}
                      onChange={(e) =>
                        setAnnouncement({
                          ...announcement,
                          link: e.target.value,
                        })
                      }
                      placeholder="/products"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Link Text
                    </label>
                    <Input
                      value={announcement.linkText || ""}
                      onChange={(e) =>
                        setAnnouncement({
                          ...announcement,
                          linkText: e.target.value,
                        })
                      }
                      placeholder="Shop Now"
                    />
                  </div>
                </div>

                {/* Color Palette Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={announcement.bgColor || "#09090b"}
                        onChange={(e) =>
                          setAnnouncement({
                            ...announcement,
                            bgColor: e.target.value,
                          })
                        }
                        className="h-9 w-10 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0.5 dark:border-zinc-700"
                      />
                      <Input
                        value={announcement.bgColor || "#09090b"}
                        onChange={(e) =>
                          setAnnouncement({
                            ...announcement,
                            bgColor: e.target.value,
                          })
                        }
                        placeholder="#09090b"
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={announcement.textColor || "#f4f4f5"}
                        onChange={(e) =>
                          setAnnouncement({
                            ...announcement,
                            textColor: e.target.value,
                          })
                        }
                        className="h-9 w-10 cursor-pointer rounded-lg border border-zinc-200 bg-transparent p-0.5 dark:border-zinc-700"
                      />
                      <Input
                        value={announcement.textColor || "#f4f4f5"}
                        onChange={(e) =>
                          setAnnouncement({
                            ...announcement,
                            textColor: e.target.value,
                          })
                        }
                        placeholder="#f4f4f5"
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Themes */}
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Luxury Curated Presets
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      { name: "Onyx Flagship", bg: "#09090b", text: "#f4f4f5" },
                      {
                        name: "Heritage Crimson",
                        bg: "#450a0a",
                        text: "#fef2f2",
                      },
                      {
                        name: "Emerald Archive",
                        bg: "#064e3b",
                        text: "#ecfdf5",
                      },
                      {
                        name: "Atelier Warm Sand",
                        bg: "#292524",
                        text: "#fafaf9",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setAnnouncement({
                            ...announcement,
                            bgColor: preset.bg,
                            textColor: preset.text,
                          })
                        }
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 text-left text-xs transition-colors hover:border-zinc-400 dark:border-zinc-700"
                      >
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: preset.bg }}
                        />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Homepage (Hero, Brand Story, CTA Banner) */}
      {activeTab === "home" && (
        <div className="space-y-10">
          {/* Section: Hero */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Landing Hero Section
                </h2>
                <p className="text-xs text-zinc-500">
                  Main banner displayed when visitors enter the flagship store.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("home_hero", hero)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Hero
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Tagline
                  </label>
                  <Input
                    value={hero.tagline}
                    onChange={(e) =>
                      setHero({ ...hero, tagline: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Main Title
                  </label>
                  <Input
                    value={hero.title}
                    onChange={(e) =>
                      setHero({ ...hero, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Description
                  </label>
                  <Textarea
                    rows={3}
                    value={hero.description}
                    onChange={(e) =>
                      setHero({ ...hero, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Primary CTA Text
                    </label>
                    <Input
                      value={hero.ctaText}
                      onChange={(e) =>
                        setHero({ ...hero, ctaText: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Primary CTA Link
                    </label>
                    <Input
                      value={hero.ctaLink}
                      onChange={(e) =>
                        setHero({ ...hero, ctaLink: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Secondary CTA Text
                    </label>
                    <Input
                      value={hero.secondaryCtaText}
                      onChange={(e) =>
                        setHero({ ...hero, secondaryCtaText: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Secondary CTA Link
                    </label>
                    <Input
                      value={hero.secondaryCtaLink}
                      onChange={(e) =>
                        setHero({ ...hero, secondaryCtaLink: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ImageField
                  label="Hero Background Image"
                  value={hero.imageUrl}
                  onChange={(url) => setHero({ ...hero, imageUrl: url })}
                  aspectRatio="aspect-16/10"
                  recommendedSize="1920 × 1080 (16:9)"
                />

                <div className="pt-2">
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Hero Stats Cards
                  </label>
                  <div className="mt-2 space-y-2">
                    {hero.stats.map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder="Value (e.g. 48h)"
                          value={stat.value}
                          onChange={(e) => {
                            const copy = [...hero.stats];
                            copy[idx].value = e.target.value;
                            setHero({ ...hero, stats: copy });
                          }}
                          className="w-1/3"
                        />
                        <Input
                          placeholder="Label (e.g. Express delivery)"
                          value={stat.label}
                          onChange={(e) => {
                            const copy = [...hero.stats];
                            copy[idx].label = e.target.value;
                            setHero({ ...hero, stats: copy });
                          }}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Brand Story / Manifesto */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Brand Story & Manifesto
                </h2>
                <p className="text-xs text-zinc-500">
                  Parallax editorial section highlighting brand vision and
                  craftsmanship.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("home_brand_story", brandStory)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Story
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Section Tag
                  </label>
                  <Input
                    value={brandStory.title}
                    onChange={(e) =>
                      setBrandStory({ ...brandStory, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Manifesto Quote
                  </label>
                  <Textarea
                    rows={4}
                    value={brandStory.quote}
                    onChange={(e) =>
                      setBrandStory({ ...brandStory, quote: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Author / Heading
                    </label>
                    <Input
                      value={brandStory.author}
                      onChange={(e) =>
                        setBrandStory({ ...brandStory, author: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Role / Subtitle
                    </label>
                    <Input
                      value={brandStory.authorRole}
                      onChange={(e) =>
                        setBrandStory({
                          ...brandStory,
                          authorRole: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <ImageField
                  label="Parallax Story Background"
                  value={brandStory.imageUrl}
                  onChange={(url) =>
                    setBrandStory({ ...brandStory, imageUrl: url })
                  }
                  aspectRatio="aspect-16/9"
                  recommendedSize="1920 × 1280 (3:2)"
                />
              </div>
            </div>
          </div>

          {/* Section: Categories Carousel Header */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Category Carousel Header
                </h2>
                <p className="text-xs text-zinc-500">
                  Section tag and headline for the homepage category scroll.
                  Individual category images and links are managed in
                  Categories.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() =>
                  saveSection("home_categories_section", categoriesSection)
                }
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Category Header
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Section Badge / Tagline
                </label>
                <Input
                  value={categoriesSection.label}
                  onChange={(e) =>
                    setCategoriesSection({
                      ...categoriesSection,
                      label: e.target.value,
                    })
                  }
                  placeholder="e.g. Curated Selects"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Main Headline
                </label>
                <Input
                  value={categoriesSection.heading}
                  onChange={(e) =>
                    setCategoriesSection({
                      ...categoriesSection,
                      heading: e.target.value,
                    })
                  }
                  placeholder="e.g. The Architecture of Wear"
                />
              </div>
            </div>
          </div>

          {/* Section: Featured Products Section Header */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Featured Products Section Header
                </h2>
                <p className="text-xs text-zinc-500">
                  Section tag, headline, and link text for the featured product
                  grid on the homepage.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() =>
                  saveSection("home_featured_section", featuredSection)
                }
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Featured Header
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Section Badge / Tagline
                </label>
                <Input
                  value={featuredSection.label}
                  onChange={(e) =>
                    setFeaturedSection({
                      ...featuredSection,
                      label: e.target.value,
                    })
                  }
                  placeholder="e.g. New Release"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Main Headline
                </label>
                <Input
                  value={featuredSection.heading}
                  onChange={(e) =>
                    setFeaturedSection({
                      ...featuredSection,
                      heading: e.target.value,
                    })
                  }
                  placeholder="e.g. The Core Collection"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  View All Button Text
                </label>
                <Input
                  value={featuredSection.viewAllText}
                  onChange={(e) =>
                    setFeaturedSection({
                      ...featuredSection,
                      viewAllText: e.target.value,
                    })
                  }
                  placeholder="e.g. View All"
                />
              </div>
            </div>
          </div>

          {/* Section: CTA Banner */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Call-To-Action Banner
                </h2>
                <p className="text-xs text-zinc-500">
                  Bottom invitation banner displayed above the footer.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("home_cta_banner", ctaBanner)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Banner
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Banner Title
                  </label>
                  <Input
                    value={ctaBanner.title}
                    onChange={(e) =>
                      setCtaBanner({ ...ctaBanner, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Description
                  </label>
                  <Textarea
                    rows={3}
                    value={ctaBanner.description}
                    onChange={(e) =>
                      setCtaBanner({
                        ...ctaBanner,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Primary Button Text
                    </label>
                    <Input
                      value={ctaBanner.primaryButtonText}
                      onChange={(e) =>
                        setCtaBanner({
                          ...ctaBanner,
                          primaryButtonText: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Primary Button Link
                    </label>
                    <Input
                      value={ctaBanner.primaryButtonLink}
                      onChange={(e) =>
                        setCtaBanner({
                          ...ctaBanner,
                          primaryButtonLink: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Secondary Button Text
                    </label>
                    <Input
                      value={ctaBanner.secondaryButtonText}
                      onChange={(e) =>
                        setCtaBanner({
                          ...ctaBanner,
                          secondaryButtonText: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Secondary Button Link
                    </label>
                    <Input
                      value={ctaBanner.secondaryButtonLink}
                      onChange={(e) =>
                        setCtaBanner({
                          ...ctaBanner,
                          secondaryButtonLink: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: About Atelier */}
      {activeTab === "about" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  About Atelier Page Content
                </h2>
                <p className="text-xs text-zinc-500">
                  Brand heritage story, atelier photography, craftsmanship
                  pillars, and milestones.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("about", about)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save About Page
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Badge Text
                    </label>
                    <Input
                      value={about.badge}
                      onChange={(e) =>
                        setAbout({ ...about, badge: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Headline
                    </label>
                    <Input
                      value={about.title}
                      onChange={(e) =>
                        setAbout({ ...about, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Introduction Paragraph
                    </label>
                    <Textarea
                      rows={4}
                      value={about.description}
                      onChange={(e) =>
                        setAbout({ ...about, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <ImageField
                    label="Atelier Visual Banner Image"
                    value={about.bannerImage}
                    onChange={(url) => setAbout({ ...about, bannerImage: url })}
                    aspectRatio="aspect-16/9"
                    recommendedSize="1200 × 800 (3:2)"
                  />

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Featured Atelier Quote
                    </label>
                    <Textarea
                      rows={2}
                      value={about.quote}
                      onChange={(e) =>
                        setAbout({ ...about, quote: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Quote Author
                    </label>
                    <Input
                      value={about.quoteAuthor}
                      onChange={(e) =>
                        setAbout({ ...about, quoteAuthor: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 4 Pillars */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <h3 className="mb-4 text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                  The Four Craftsmanship Pillars
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {about.pillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          value={pillar.num}
                          placeholder="01"
                          onChange={(e) => {
                            const copy = [...about.pillars];
                            copy[idx].num = e.target.value;
                            setAbout({ ...about, pillars: copy });
                          }}
                          className="w-16 font-mono"
                        />
                        <Input
                          value={pillar.title}
                          placeholder="Pillar Title"
                          onChange={(e) => {
                            const copy = [...about.pillars];
                            copy[idx].title = e.target.value;
                            setAbout({ ...about, pillars: copy });
                          }}
                          className="flex-1 font-semibold"
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={pillar.description}
                        placeholder="Description of pillar..."
                        onChange={(e) => {
                          const copy = [...about.pillars];
                          copy[idx].description = e.target.value;
                          setAbout({ ...about, pillars: copy });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <h3 className="mb-4 text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                  Impact Milestones
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {about.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
                    >
                      <Input
                        value={m.value}
                        placeholder="e.g. 100%"
                        onChange={(e) => {
                          const copy = [...about.milestones];
                          copy[idx].value = e.target.value;
                          setAbout({ ...about, milestones: copy });
                        }}
                        className="font-mono text-lg font-bold"
                      />
                      <Input
                        value={m.label}
                        placeholder="Label"
                        onChange={(e) => {
                          const copy = [...about.milestones];
                          copy[idx].label = e.target.value;
                          setAbout({ ...about, milestones: copy });
                        }}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Contact & Footer */}
      {activeTab === "contact_footer" && (
        <div className="space-y-10">
          {/* Contact Details & Salons */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Concierge & Salon Locations
                </h2>
                <p className="text-xs text-zinc-500">
                  Contact page hotline, email, operating hours, and flagship
                  boutiques.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("contact", contact)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Contact Info
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Concierge Email
                </label>
                <Input
                  value={contact.email}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Private Client Phone
                </label>
                <Input
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({ ...contact, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Atelier Hours
                </label>
                <Input
                  value={contact.hours}
                  onChange={(e) =>
                    setContact({ ...contact, hours: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Salons List */}
            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                  Flagship Salons ({contact.salons.length})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setContact({
                      ...contact,
                      salons: [
                        ...contact.salons,
                        {
                          city: "New Salon",
                          address: "Address here",
                          hours: "Mon–Sat 10–19",
                        },
                      ],
                    })
                  }
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Plus size={14} />
                  Add Salon
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contact.salons.map((salon, idx) => (
                  <div
                    key={idx}
                    className="relative space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setContact({
                          ...contact,
                          salons: contact.salons.filter((_, i) => i !== idx),
                        })
                      }
                      className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500"
                      title="Remove Salon"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                        City / Flagship
                      </label>
                      <Input
                        value={salon.city}
                        onChange={(e) => {
                          const copy = [...contact.salons];
                          copy[idx].city = e.target.value;
                          setContact({ ...contact, salons: copy });
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                        Full Address
                      </label>
                      <Input
                        value={salon.address}
                        onChange={(e) => {
                          const copy = [...contact.salons];
                          copy[idx].address = e.target.value;
                          setContact({ ...contact, salons: copy });
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                        Hours
                      </label>
                      <Input
                        value={salon.hours}
                        onChange={(e) => {
                          const copy = [...contact.salons];
                          copy[idx].hours = e.target.value;
                          setContact({ ...contact, salons: copy });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Global Storefront Footer
                </h2>
                <p className="text-xs text-zinc-500">
                  Footer brand mission statement and copyright line.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("footer", footer)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Footer
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Brand Mission Statement
                </label>
                <Textarea
                  rows={3}
                  value={footer.brandDescription}
                  onChange={(e) =>
                    setFooter({ ...footer, brandDescription: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Copyright Notice
                </label>
                <Input
                  value={footer.copyrightText}
                  onChange={(e) =>
                    setFooter({ ...footer, copyrightText: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Social Media Presence */}
            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h3 className="mb-4 text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                Social Media Presence & Outposts
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                    Instagram URL
                  </label>
                  <Input
                    value={footer.socialLinks?.instagram || ""}
                    placeholder="https://instagram.com/thecurator"
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socialLinks: {
                          ...footer.socialLinks,
                          instagram: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                    Twitter / X URL
                  </label>
                  <Input
                    value={footer.socialLinks?.twitter || ""}
                    placeholder="https://x.com/thecurator"
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socialLinks: {
                          ...footer.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                    Facebook URL
                  </label>
                  <Input
                    value={footer.socialLinks?.facebook || ""}
                    placeholder="https://facebook.com/thecurator"
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socialLinks: {
                          ...footer.socialLinks,
                          facebook: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                    Pinterest URL
                  </label>
                  <Input
                    value={footer.socialLinks?.pinterest || ""}
                    placeholder="https://pinterest.com/thecurator"
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socialLinks: {
                          ...footer.socialLinks,
                          pinterest: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">
                    TikTok URL
                  </label>
                  <Input
                    value={footer.socialLinks?.tiktok || ""}
                    placeholder="https://tiktok.com/@thecurator"
                    onChange={(e) =>
                      setFooter({
                        ...footer,
                        socialLinks: {
                          ...footer.socialLinks,
                          tiktok: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Top Header Navigation Links
                </h2>
                <p className="text-xs text-zinc-500">
                  Manage primary storefront navigation links displayed in the
                  sticky header.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("nav_links", navLinks)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Navigation
              </Button>
            </div>

            <div className="space-y-3">
              {navLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <Input
                    value={link.name}
                    placeholder="Link Label (e.g. Collections)"
                    onChange={(e) => {
                      const copy = [...navLinks];
                      copy[idx].name = e.target.value;
                      setNavLinks(copy);
                    }}
                    className="flex-1 text-xs font-semibold"
                  />
                  <Input
                    value={link.href}
                    placeholder="URL Path (e.g. /products)"
                    onChange={(e) => {
                      const copy = [...navLinks];
                      copy[idx].href = e.target.value;
                      setNavLinks(copy);
                    }}
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNavLinks(navLinks.filter((_, i) => i !== idx));
                    }}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    icon={<Trash2 size={14} />}
                  />
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNavLinks([
                    ...navLinks,
                    { name: "New Page", href: "/products" },
                  ]);
                }}
                icon={<Plus size={14} />}
                className="mt-2 text-xs"
              >
                Add Navigation Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: App & PWA Modal */}
      {activeTab === "app" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Mobile App & PWA Installation Modal
                </h2>
                <p className="text-xs text-zinc-500">
                  Customize the photography, headline, value propositions, and
                  action button on the Luxury PWA Modal.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("pwa_modal", pwaModal)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save App Modal
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Badge Text
                    </label>
                    <Input
                      value={pwaModal.badge}
                      onChange={(e) =>
                        setPwaModal({ ...pwaModal, badge: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Modal Headline
                    </label>
                    <Input
                      value={pwaModal.title}
                      onChange={(e) =>
                        setPwaModal({ ...pwaModal, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Description Paragraph
                    </label>
                    <Textarea
                      rows={3}
                      value={pwaModal.description}
                      onChange={(e) =>
                        setPwaModal({
                          ...pwaModal,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                      Button Text
                    </label>
                    <Input
                      value={pwaModal.buttonText}
                      onChange={(e) =>
                        setPwaModal({ ...pwaModal, buttonText: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <ImageField
                    label="Header Atelier Photography"
                    value={pwaModal.imageUrl}
                    onChange={(url) =>
                      setPwaModal({ ...pwaModal, imageUrl: url })
                    }
                    aspectRatio="aspect-16/10"
                    recommendedSize="400 × 600 (2:3)"
                  />
                </div>
              </div>

              {/* Numbered Benefits */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <h3 className="mb-4 text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                  Key Pillars & Benefits
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {pwaModal.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          value={benefit.num}
                          placeholder="01"
                          onChange={(e) => {
                            const copy = [...pwaModal.benefits];
                            copy[idx].num = e.target.value;
                            setPwaModal({ ...pwaModal, benefits: copy });
                          }}
                          className="w-16 font-mono"
                        />
                        <Input
                          value={benefit.title}
                          placeholder="Benefit Title"
                          onChange={(e) => {
                            const copy = [...pwaModal.benefits];
                            copy[idx].title = e.target.value;
                            setPwaModal({ ...pwaModal, benefits: copy });
                          }}
                          className="flex-1 font-semibold"
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={benefit.description}
                        placeholder="Description..."
                        onChange={(e) => {
                          const copy = [...pwaModal.benefits];
                          copy[idx].description = e.target.value;
                          setPwaModal({ ...pwaModal, benefits: copy });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: FAQ Management */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex flex-col gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Frequently Asked Questions ({faqs.length})
                </h2>
                <p className="text-xs text-zinc-500">
                  Manage questions and answers displayed in the storefront help
                  center.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddFaq}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Plus size={14} />
                  Add Question
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => saveSection("faq", faqs)}
                  className="flex items-center gap-2 text-xs"
                >
                  <Save size={14} />
                  Save FAQs
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-3">
                      <select
                        value={item.category}
                        onChange={(e) =>
                          handleUpdateFaq(idx, "category", e.target.value)
                        }
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      >
                        <option value="shipping">Shipping & Delivery</option>
                        <option value="returns">Returns & Exchanges</option>
                        <option value="sizing">Sizing & Garment Care</option>
                        <option value="payments">Payments & Security</option>
                        <option value="orders">Orders & Packaging</option>
                      </select>
                      <Input
                        value={item.question}
                        placeholder="Question title"
                        onChange={(e) =>
                          handleUpdateFaq(idx, "question", e.target.value)
                        }
                        className="flex-1 font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(idx)}
                      className="p-1.5 text-zinc-400 transition-colors hover:text-rose-500"
                      title="Delete Question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <Textarea
                    rows={3}
                    value={item.answer}
                    placeholder="Provide full authoritative answer..."
                    onChange={(e) =>
                      handleUpdateFaq(idx, "answer", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Legal Policies */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          {/* Sub-tabs for policies */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "privacy", label: "Privacy Policy", icon: Shield },
              { id: "terms", label: "Terms of Service", icon: FileText },
              { id: "shipping", label: "Shipping Policy", icon: Truck },
              { id: "returns", label: "Returns Policy", icon: RotateCcw },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = activePolicy === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePolicy(p.id as PolicyTab)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  <Icon size={14} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Policy Editor */}
          {(() => {
            const currentPolicy = policies[activePolicy];
            const policyKey = `policy_${activePolicy}`;

            return (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-6 flex flex-col gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                      {currentPolicy.title}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Edit document title, subtitle, and policy clauses.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddPolicySection(activePolicy)}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <Plus size={14} />
                      Add Clause
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isSaving}
                      onClick={() => saveSection(policyKey, currentPolicy)}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Save size={14} />
                      Save Policy
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                        Document Title
                      </label>
                      <Input
                        value={currentPolicy.title}
                        onChange={(e) =>
                          setPolicies({
                            ...policies,
                            [activePolicy]: {
                              ...currentPolicy,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                        Subtitle / Header Note
                      </label>
                      <Input
                        value={currentPolicy.subtitle}
                        onChange={(e) =>
                          setPolicies({
                            ...policies,
                            [activePolicy]: {
                              ...currentPolicy,
                              subtitle: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                        Last Updated Date Label
                      </label>
                      <Input
                        value={currentPolicy.lastUpdated}
                        onChange={(e) =>
                          setPolicies({
                            ...policies,
                            [activePolicy]: {
                              ...currentPolicy,
                              lastUpdated: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Policy Sections / Clauses */}
                  <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                    <h3 className="text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                      Clauses & Sections ({currentPolicy.sections.length})
                    </h3>

                    {currentPolicy.sections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-950/60"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <Input
                            value={sec.title}
                            placeholder="Section Title (e.g. 14-Day Return Window)"
                            onChange={(e) =>
                              handleUpdatePolicySection(
                                activePolicy,
                                idx,
                                "title",
                                e.target.value
                              )
                            }
                            className="font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleDeletePolicySection(activePolicy, idx)
                            }
                            className="p-1.5 text-zinc-400 transition-colors hover:text-rose-500"
                            title="Delete Clause"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div>
                          <Textarea
                            rows={4}
                            value={sec.content}
                            placeholder="Clause body paragraphs. Double newline separates paragraphs."
                            onChange={(e) =>
                              handleUpdatePolicySection(
                                activePolicy,
                                idx,
                                "content",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab: Size Guide */}
      {activeTab === "size_guide" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Size Guide & Measurement Standards
                </h2>
                <p className="text-xs text-zinc-500">
                  Manage the sizing table, body measurement guidelines, and
                  silhouette fit notes.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("size_guide", sizeGuide)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Size Guide
              </Button>
            </div>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Page Title
                  </label>
                  <Input
                    value={sizeGuide.title}
                    onChange={(e) =>
                      setSizeGuide({ ...sizeGuide, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                    Page Subtitle
                  </label>
                  <Input
                    value={sizeGuide.subtitle}
                    onChange={(e) =>
                      setSizeGuide({ ...sizeGuide, subtitle: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Size Chart Rows */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                      Size Matrix Rows (Inches)
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Standard size conversions for apparel.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSizeGuide({
                        ...sizeGuide,
                        rows: [
                          ...sizeGuide.rows,
                          { size: "", chest: "", waist: "", hip: "" },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Plus size={14} />
                    Add Size Row
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 tracking-wider text-zinc-600 uppercase dark:bg-zinc-800 dark:text-zinc-400">
                      <tr>
                        <th className="px-4 py-3">Size Code</th>
                        <th className="px-4 py-3">Chest (in)</th>
                        <th className="px-4 py-3">Waist (in)</th>
                        <th className="px-4 py-3">Hips (in)</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {sizeGuide.rows.map((row, idx) => (
                        <tr key={idx} className="bg-white dark:bg-zinc-900">
                          <td className="p-2">
                            <Input
                              value={row.size}
                              placeholder="e.g. M"
                              onChange={(e) => {
                                const copy = [...sizeGuide.rows];
                                copy[idx].size = e.target.value;
                                setSizeGuide({ ...sizeGuide, rows: copy });
                              }}
                              className="h-8 font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={row.chest}
                              placeholder="38-40"
                              onChange={(e) => {
                                const copy = [...sizeGuide.rows];
                                copy[idx].chest = e.target.value;
                                setSizeGuide({ ...sizeGuide, rows: copy });
                              }}
                              className="h-8"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={row.waist}
                              placeholder="32-34"
                              onChange={(e) => {
                                const copy = [...sizeGuide.rows];
                                copy[idx].waist = e.target.value;
                                setSizeGuide({ ...sizeGuide, rows: copy });
                              }}
                              className="h-8"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={row.hip}
                              placeholder="38-40"
                              onChange={(e) => {
                                const copy = [...sizeGuide.rows];
                                copy[idx].hip = e.target.value;
                                setSizeGuide({ ...sizeGuide, rows: copy });
                              }}
                              className="h-8"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSizeGuide({
                                  ...sizeGuide,
                                  rows: sizeGuide.rows.filter(
                                    (_, i) => i !== idx
                                  ),
                                });
                              }}
                              className="p-1.5 text-zinc-400 transition-colors hover:text-rose-500"
                              title="Delete Row"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* How to Measure Guidelines */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                      How to Measure Instructions
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Step-by-step anatomical guidance for taking accurate body
                      measurements.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSizeGuide({
                        ...sizeGuide,
                        howToMeasure: [
                          ...sizeGuide.howToMeasure,
                          { label: "", instruction: "" },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Plus size={14} />
                    Add Instruction
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {sizeGuide.howToMeasure.map((item, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
                    >
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder="Measurement Area (e.g. Chest)"
                          value={item.label}
                          onChange={(e) => {
                            const copy = [...sizeGuide.howToMeasure];
                            copy[idx].label = e.target.value;
                            setSizeGuide({ ...sizeGuide, howToMeasure: copy });
                          }}
                          className="text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSizeGuide({
                              ...sizeGuide,
                              howToMeasure: sizeGuide.howToMeasure.filter(
                                (_, i) => i !== idx
                              ),
                            });
                          }}
                          className="ml-2 p-1.5 text-zinc-400 transition-colors hover:text-rose-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <Textarea
                        rows={3}
                        placeholder="Detailed instructions for measuring this area..."
                        value={item.instruction}
                        onChange={(e) => {
                          const copy = [...sizeGuide.howToMeasure];
                          copy[idx].instruction = e.target.value;
                          setSizeGuide({ ...sizeGuide, howToMeasure: copy });
                        }}
                        className="text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fits & Styles Description */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <label className="text-xs font-semibold tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
                  Fits & Silhouette Styling Notes
                </label>
                <p className="mt-1 mb-2 text-xs text-zinc-500">
                  General guidance on tailoring, oversized proportions, or snug
                  fits.
                </p>
                <Textarea
                  rows={3}
                  value={sizeGuide.fitsAndStyles}
                  onChange={(e) =>
                    setSizeGuide({
                      ...sizeGuide,
                      fitsAndStyles: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Regions & Currencies */}
      {activeTab === "regions" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Regional Localization & Currencies
                </h2>
                <p className="text-xs text-zinc-500">
                  Manage the supported destination countries, currencies, and
                  languages in the Region Modal.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={isSaving}
                onClick={() => saveSection("regions", regionsData)}
                className="flex items-center gap-2 text-xs"
              >
                <Save size={14} />
                Save Regional Settings
              </Button>
            </div>

            <div className="space-y-8">
              {/* Regions List */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                      Supported Regions & Currencies
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Options available in the currency and shipping destination
                      selector.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRegionsData({
                        ...regionsData,
                        regions: [
                          ...regionsData.regions,
                          {
                            code: "",
                            name: "",
                            currency: "",
                            symbol: "",
                            flag: "🌐",
                          },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Plus size={14} />
                    Add Region
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 tracking-wider text-zinc-600 uppercase dark:bg-zinc-800 dark:text-zinc-400">
                      <tr>
                        <th className="px-4 py-3">Flag Emoji</th>
                        <th className="px-4 py-3">ISO Code</th>
                        <th className="px-4 py-3">Region / Country Name</th>
                        <th className="px-4 py-3">Currency</th>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {regionsData.regions.map((reg, idx) => (
                        <tr key={idx} className="bg-white dark:bg-zinc-900">
                          <td className="w-16 p-2">
                            <Input
                              value={reg.flag}
                              placeholder="🇺🇸"
                              onChange={(e) => {
                                const copy = [...regionsData.regions];
                                copy[idx].flag = e.target.value;
                                setRegionsData({
                                  ...regionsData,
                                  regions: copy,
                                });
                              }}
                              className="h-8 text-center"
                            />
                          </td>
                          <td className="w-24 p-2">
                            <Input
                              value={reg.code}
                              placeholder="US"
                              onChange={(e) => {
                                const copy = [...regionsData.regions];
                                copy[idx].code = e.target.value.toUpperCase();
                                setRegionsData({
                                  ...regionsData,
                                  regions: copy,
                                });
                              }}
                              className="h-8 font-mono font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={reg.name}
                              placeholder="United States"
                              onChange={(e) => {
                                const copy = [...regionsData.regions];
                                copy[idx].name = e.target.value;
                                setRegionsData({
                                  ...regionsData,
                                  regions: copy,
                                });
                              }}
                              className="h-8"
                            />
                          </td>
                          <td className="w-28 p-2">
                            <Input
                              value={reg.currency}
                              placeholder="USD"
                              onChange={(e) => {
                                const copy = [...regionsData.regions];
                                copy[idx].currency =
                                  e.target.value.toUpperCase();
                                setRegionsData({
                                  ...regionsData,
                                  regions: copy,
                                });
                              }}
                              className="h-8 font-mono font-semibold"
                            />
                          </td>
                          <td className="w-20 p-2">
                            <Input
                              value={reg.symbol}
                              placeholder="$"
                              onChange={(e) => {
                                const copy = [...regionsData.regions];
                                copy[idx].symbol = e.target.value;
                                setRegionsData({
                                  ...regionsData,
                                  regions: copy,
                                });
                              }}
                              className="h-8 text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setRegionsData({
                                  ...regionsData,
                                  regions: regionsData.regions.filter(
                                    (_, i) => i !== idx
                                  ),
                                });
                              }}
                              className="p-1.5 text-zinc-400 transition-colors hover:text-rose-500"
                              title="Delete Region"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supported Languages */}
              <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold tracking-wider text-zinc-950 uppercase dark:text-zinc-50">
                      Storefront Languages
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Languages selectable by visitors in the regional
                      localization modal.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRegionsData({
                        ...regionsData,
                        languages: [
                          ...regionsData.languages,
                          { code: "", name: "" },
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Plus size={14} />
                    Add Language
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {regionsData.languages.map((lang, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/60"
                    >
                      <Input
                        value={lang.code}
                        placeholder="en"
                        onChange={(e) => {
                          const copy = [...regionsData.languages];
                          copy[idx].code = e.target.value.toLowerCase();
                          setRegionsData({ ...regionsData, languages: copy });
                        }}
                        className="h-8 w-16 font-mono text-xs font-semibold"
                      />
                      <Input
                        value={lang.name}
                        placeholder="English (US)"
                        onChange={(e) => {
                          const copy = [...regionsData.languages];
                          copy[idx].name = e.target.value;
                          setRegionsData({ ...regionsData, languages: copy });
                        }}
                        className="h-8 flex-1 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRegionsData({
                            ...regionsData,
                            languages: regionsData.languages.filter(
                              (_, i) => i !== idx
                            ),
                          });
                        }}
                        className="p-1 text-zinc-400 transition-colors hover:text-rose-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
