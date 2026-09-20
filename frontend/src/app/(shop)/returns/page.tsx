"use client";

import React from "react";
import { PolicyLayout } from "@/components/shop/PolicyLayout";

const sections = [
  {
    id: "return-window",
    title: "14-Day Return Window",
    content: (
      <>
        <p>
          We want you to take pleasure in every silhouette you acquire. Should
          an item fall short of your expectations in silhouette, fit, or feel,
          you may initiate a return within <strong>14 calendar days</strong> of
          parcel delivery.
        </p>
        <p>
          Returns initiated within this period enjoy complimentary courier
          collection from your residence or preferred office address.
        </p>
      </>
    ),
  },
  {
    id: "garment-condition",
    title: "Required Garment Condition",
    content: (
      <>
        <p>
          To qualify for a full refund or exchange, returned items must comply
          with strict atelier conditions:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Garments must be entirely unworn, unwashed, and unblemished by
            makeup, deodorant, or perfume.
          </li>
          <li>
            All original designer brand tags, fabric labels, and security
            ribbons must remain attached in their original location.
          </li>
          <li>
            Footwear must be tried on carpeted surfaces only to avoid scuffing
            outer leather soles, and returned in the intact original shoebox
            with dust bags.
          </li>
          <li>
            Bespoke customized garments or personalized monogrammed pieces are
            final sale and non-returnable.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "return-procedure",
    title: "Step-by-Step Return Process",
    content: (
      <>
        <p>Initiating a return is simple and automated:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Access Your Account:</strong> Navigate to your Account
            Dashboard and select <em>My Orders</em>.
          </li>
          <li>
            <strong>Select Items:</strong> Choose the items you wish to return
            and indicate the reason for return.
          </li>
          <li>
            <strong>Generate Prepaid Label:</strong> Download and print the
            prepaid DHL / FedEx return air waybill and commercial invoice.
          </li>
          <li>
            <strong>Book Pickup or Drop Off:</strong> Schedule a courier pickup
            directly through our portal or drop your package at any authorized
            depot.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "exchanges",
    title: "Exchanges & Sizing Swaps",
    content: (
      <>
        <p>
          Need a different size or alternative colorway? Exchanges are handled
          with elevated priority. As soon as your return parcel is scanned by
          the courier, our team immediately reserves your replacement piece in
          our atelier to ensure it doesn&apos;t sell out.
        </p>
        <p>
          Exchanges carry no shipping charges or administrative processing fees.
        </p>
      </>
    ),
  },
  {
    id: "refund-timeline",
    title: "Inspection & Refund Disbursal",
    content: (
      <>
        <p>
          Upon arrival at our atelier, our garment quality specialists inspect
          each piece within 48 hours. Once verified, your refund will be
          automatically dispatched to your original form of payment.
        </p>
        <p>
          Depending on your financial institution&apos;s processing cycles,
          funds generally appear on your credit card statement within 3 to 5
          business days. You will receive email confirmation the moment the
          disbursement is executed.
        </p>
      </>
    ),
  },
];

import { useState, useEffect } from "react";
import { contentApi } from "@/lib/api";
import type { PolicyPageContent } from "@/types";

export default function ReturnsPolicyPage() {
  const [content, setContent] = useState<PolicyPageContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getByKey<PolicyPageContent>("policy_returns")
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
      title={content?.title || "Returns & Exchanges Policy"}
      subtitle={
        content?.subtitle ||
        "Seamless 14-day return protocols, complimentary courier pickups, and exchange reservations."
      }
      lastUpdated={content?.lastUpdated || "January 2026"}
      currentPath="/returns"
      sections={renderedSections}
    />
  );
}
