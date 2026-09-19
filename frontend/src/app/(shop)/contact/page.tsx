"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const departments = [
  "Orders & Shipping",
  "Personal Styling & Sizing",
  "Bespoke & Pre-Orders",
  "Press & Partnerships",
  "General Inquiries",
];

const salons = [
  {
    city: "Paris Atelier",
    address: "18 Place Vendôme, 75001 Paris, France",
    hours: "Mon – Sat: 10:00 – 19:00 CET",
  },
  {
    city: "New York Flagship",
    address: "720 Fifth Avenue, New York, NY 10019",
    hours: "Mon – Sat: 10:00 – 20:00 EST",
  },
  {
    city: "Tokyo Studio",
    address: "5-7-22 Minamiaoyama, Minato-ku, Tokyo",
    hours: "Tue – Sun: 11:00 – 19:30 JST",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: departments[0],
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate luxury concierge dispatch
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      toast.success("Your message has been received by our concierge.");
    } catch {
      toast.error("An error occurred. Please try contacting us by phone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 pt-36 pb-28 sm:px-12">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center lg:text-left"
      >
        <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">
          Client Services & Concierge
        </span>
        <h1 className="mt-2 text-4xl font-light tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
          Atelier <span className="font-serif font-normal italic">Contact</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed font-normal text-on-surface-variant">
          For private styling sessions, sizing consultations, order inquiries,
          or bespoke creations — our dedicated advisors are at your service.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Form Section (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm sm:p-12 lg:col-span-7"
        >
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-light tracking-tight text-on-surface">
                  Inquiry Dispatched
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
                  Thank you,{" "}
                  <span className="font-semibold text-on-surface">
                    {formData.name}
                  </span>
                  . Your correspondence has been directed to our{" "}
                  {formData.department} desk. A concierge advisor will reply to{" "}
                  <span className="font-medium text-on-surface">
                    {formData.email}
                  </span>{" "}
                  within 2 to 4 hours.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      department: departments[0],
                      subject: "",
                      message: "",
                    });
                  }}
                  className="mt-8 px-6 py-2.5 text-xs font-semibold tracking-widest uppercase"
                >
                  Send Another Inquiry
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-on-surface">
                    Direct Correspondence
                  </h2>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Please provide your details below and select the appropriate
                    division.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                      Your Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g. Julian Dupont"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="julian@domain.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                    Department
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {departments.map((dep) => (
                      <button
                        key={dep}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, department: dep }))
                        }
                        className={`cursor-pointer rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                          formData.department === dep
                            ? "bg-primary text-on-primary shadow-sm"
                            : "border border-outline-variant/30 bg-surface text-on-surface hover:border-outline-variant/80"
                        }`}
                      >
                        {dep}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                    Subject (Optional)
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Order Reference # or Inquiry Topic"
                  />
                </div>

                <div>
                  <Textarea
                    label="Your Message *"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Describe how our concierge team can assist you with your wardrobe or orders..."
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase sm:w-auto sm:px-10"
                  >
                    {isSubmitting ? (
                      "Dispatching..."
                    ) : (
                      <>
                        <Send size={15} />
                        Dispatch Inquiry
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Contact Info & Salons (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8 lg:col-span-5"
        >
          {/* Direct Concierge Box */}
          <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
              <Sparkles size={18} className="text-primary" />
              Direct Client Services
            </h3>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                    Concierge Email
                  </p>
                  <a
                    href="mailto:concierge@thecurator.com"
                    className="font-medium text-on-surface transition-colors hover:text-primary"
                  >
                    concierge@thecurator.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                    Private Client Line
                  </p>
                  <p className="font-medium text-on-surface">
                    +1 (800) 742-8820
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-primary">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                    Atelier Hours
                  </p>
                  <p className="text-on-surface-variant">
                    Monday – Saturday: 9:00 AM – 8:00 PM EST
                  </p>
                  <p className="text-xs text-on-surface-variant/70">
                    Sunday: Closed for private collection appointments
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Salons & Showrooms */}
          <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-lowest p-8 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-on-surface">
              <MapPin size={18} className="text-primary" />
              Flagship Salons
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              Visit our spaces for bespoke fittings and archive viewings.
            </p>

            <div className="mt-6 space-y-4 divide-y divide-outline-variant/10">
              {salons.map((salon) => (
                <div key={salon.city} className="pt-4 first:pt-0">
                  <h4 className="text-sm font-semibold text-on-surface">
                    {salon.city}
                  </h4>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {salon.address}
                  </p>
                  <p className="mt-1 text-[11px] text-on-surface-variant/70">
                    {salon.hours}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
