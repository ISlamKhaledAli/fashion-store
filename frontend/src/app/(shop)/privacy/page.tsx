"use client";

import React from "react";
import { PolicyLayout } from "@/components/shop/PolicyLayout";

const sections = [
  {
    id: "data-collection",
    title: "Information We Collect",
    content: (
      <>
        <p>
          At The Curator, protecting your privacy and personal data is a
          foundational tenet of our client service. We collect information
          necessary to deliver personalized, world-class luxury shopping
          experiences:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Identity & Contact:</strong> Full name, billing and shipping
            addresses, email address, and telephone numbers.
          </li>
          <li>
            <strong>Sizing & Fit Profile:</strong> Height, body measurements,
            and silhouette preferences submitted to our AI Sizing Assistant or
            bespoke tailors.
          </li>
          <li>
            <strong>Transactional Records:</strong> Order histories, wishlist
            items, receipts, and client concierge correspondence.
          </li>
          <li>
            <strong>Technical Telemetry:</strong> IP addresses, browser
            specifications, operating system, and interaction logs.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "purpose",
    title: "How We Utilize Your Data",
    content: (
      <>
        <p>
          We process your personal information strictly for legitimate
          commercial purposes, including:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Fulfilling orders, scheduling couriers, and executing customs
            paperwork.
          </li>
          <li>
            Generating bespoke wardrobe recommendations and tailored garment
            size matching.
          </li>
          <li>
            Facilitating secure financial transactions via certified gateway
            partners.
          </li>
          <li>
            Communicating order status changes, delivery updates, and exclusive
            private collection invitations.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Storage Technologies",
    content: (
      <>
        <p>
          We employ strictly necessary cookies and local storage tokens to
          maintain your session credentials, preserve items in your shopping
          bag, and remember your regional currency preferences.
        </p>
        <p>
          You retain the ability to modify or reject non-essential analytics
          cookies at any time through your browser settings without impairing
          checkout functionality.
        </p>
      </>
    ),
  },
  {
    id: "security-sharing",
    title: "Data Safeguards & Confidentiality",
    content: (
      <>
        <p>
          <strong>
            We never sell, rent, or monetize your personal information to third
            parties or marketing brokers.
          </strong>
        </p>
        <p>
          Information is shared solely with trusted service providers under
          rigorous non-disclosure and data protection contracts (such as Stripe
          for PCI-DSS payment compliance and global freight couriers for
          delivery fulfillment).
        </p>
        <p>
          All data transmitted across our platform is protected with advanced
          TLS 1.3 encryption and stored in hardened database facilities.
        </p>
      </>
    ),
  },
  {
    id: "client-rights",
    title: "Your Rights & Data Portability",
    content: (
      <>
        <p>
          Under international privacy frameworks (including GDPR, UK Data
          Protection Act, and CCPA/CPRA), you possess distinct rights regarding
          your digital footprint:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            The right to obtain a comprehensive copy of all stored personal
            information.
          </li>
          <li>
            The right to rectify inaccurate contact, billing, or sizing data.
          </li>
          <li>
            The right to request the permanent deletion of your account and
            historical records.
          </li>
          <li>
            The right to revoke marketing and newsletter consents at any time
            with a single click.
          </li>
        </ul>
        <p>
          To exercise any of these privileges, contact our dedicated Data
          Privacy Officer at <code>privacy@thecurator.com</code>.
        </p>
      </>
    ),
  },
];

import { useState, useEffect } from "react";
import { contentApi } from "@/lib/api";
import type { PolicyPageContent } from "@/types";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<PolicyPageContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<PolicyPageContent>("policy_privacy")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setContent(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const renderedSections =
    content?.sections && content.sections.length > 0
      ? content.sections.map((sec) => ({
          id: sec.id,
          title: sec.title,
          content: (
            <div className="space-y-4">
              {sec.content.split("\n\n").map((p, idx) => (
                <p key={idx} className="leading-relaxed whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          ),
        }))
      : sections;

  return (
    <PolicyLayout
      title={content?.title || "Privacy & Data Protection"}
      subtitle={
        content?.subtitle ||
        "Our unwavering commitment to safeguarding client information, payment credentials, and personal privacy."
      }
      lastUpdated={content?.lastUpdated || "January 2026"}
      currentPath="/privacy"
      sections={renderedSections}
    />
  );
}
