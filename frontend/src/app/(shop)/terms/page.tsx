"use client";

import React from "react";
import { PolicyLayout } from "@/components/shop/PolicyLayout";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance & Eligibility",
    content: (
      <>
        <p>
          By accessing, browsing, or completing purchases on The Curator website
          and digital storefronts, you confirm that you are at least 18 years of
          age (or the legal age of majority in your jurisdiction) and legally
          capable of entering into binding agreements.
        </p>
        <p>
          These Terms govern all interactions with our online boutique,
          concierge services, and atelier facilities. If you do not agree with
          any aspect of these terms, please discontinue use of our services.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property Rights",
    content: (
      <>
        <p>
          All trademarks, editorial photography, typography, video campaigns,
          garment designs, website architecture, and software code are the
          proprietary intellectual property of The Curator and its licensed
          fashion houses.
        </p>
        <p>
          No content, imagery, or textual material may be reproduced, reverse
          engineered, republished, or exploited for commercial purposes without
          our explicit written permission.
        </p>
      </>
    ),
  },
  {
    id: "pricing-orders",
    title: "Pricing, Inventory & Order Acceptance",
    content: (
      <>
        <p>
          All prices are displayed in the selected regional currency and are
          authoritative at the moment of checkout. While we endeavor to maintain
          absolute catalog accuracy, rare typographical or system pricing errors
          may occur. In such instances, we reserve the right to decline or
          cancel the affected order prior to dispatch with an immediate 100%
          refund.
        </p>
        <p>
          Receipt of an electronic order confirmation does not signify our final
          acceptance of your order; it constitutes an acknowledgement of
          receipt. Formal acceptance and contract completion occur when items
          are dispatched and scanned by the courier.
        </p>
      </>
    ),
  },
  {
    id: "account-responsibility",
    title: "Account Security & Client Conduct",
    content: (
      <>
        <p>
          Registered clients are solely responsible for maintaining the
          confidentiality of their login credentials, passwords, and two-factor
          authentication tokens. You agree to notify our Concierge immediately
          upon discovery of any unauthorized access to your profile.
        </p>
        <p>
          The Curator reserves the right to suspend or terminate accounts that
          engage in fraudulent chargebacks, automated web scraping, abusive
          behavior toward atelier staff, or commercial resale of limited
          archival drops.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law & Legal Jurisdiction",
    content: (
      <>
        <p>
          These Terms and any non-contractual obligations arising out of them
          shall be governed by and construed in accordance with the laws of
          Delaware, United States, without regard to conflicts of law
          principles.
        </p>
        <p>
          Any disputes shall be resolved through private arbitration in
          accordance with commercial arbitration rules. Nothing in these terms
          excludes statutory consumer rights guaranteed in your country of
          residence that cannot be waived by contract.
        </p>
      </>
    ),
  },
];

import { useState, useEffect } from "react";
import { contentApi } from "@/lib/api";
import type { PolicyPageContent } from "@/types";

export default function TermsOfServicePage() {
  const [content, setContent] = useState<PolicyPageContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<PolicyPageContent>("policy_terms")
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
      title={content?.title || "Terms & Conditions of Service"}
      subtitle={
        content?.subtitle ||
        "Standard guidelines governing access, acquisitions, copyright, and platform stewardship."
      }
      lastUpdated={content?.lastUpdated || "January 2026"}
      currentPath="/terms"
      sections={renderedSections}
    />
  );
}
