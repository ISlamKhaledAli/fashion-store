"use client";

import React from "react";
import { PolicyLayout } from "@/components/shop/PolicyLayout";

const sections = [
  {
    id: "dispatch",
    title: "Global White-Glove Dispatch",
    content: (
      <>
        <p>
          At The Curator, every garment and accessory is handled with extreme
          delicacy. Following purchase authentication and quality verification
          at our atelier, orders are packaged by hand in archival protective
          wrapping and dispatched via our dedicated courier fleet (DHL Express
          and FedEx Priority).
        </p>
        <p>
          Orders placed Monday through Friday before 2:00 PM EST are dispatched
          the same day. Orders placed after this cutoff or over the weekend will
          depart our facilities on the following business day.
        </p>
      </>
    ),
  },
  {
    id: "delivery-speeds",
    title: "Delivery Timelines & Destinations",
    content: (
      <>
        <p>
          We currently serve over 90 countries worldwide. Estimated transit
          times commence once your package leaves our fulfillment atelier:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Domestic Express (USA & Canada):</strong> 1 to 2 business
            days.
          </li>
          <li>
            <strong>European Union & UK:</strong> 2 to 3 business days via
            priority air transit.
          </li>
          <li>
            <strong>Asia-Pacific & Middle East:</strong> 2 to 4 business days.
          </li>
          <li>
            <strong>Rest of World:</strong> 3 to 5 business days.
          </li>
        </ul>
        <p>
          Complimentary express delivery is granted on all orders exceeding
          $250. Orders below this threshold carry a nominal $15 domestic or $25
          international shipping fee.
        </p>
      </>
    ),
  },
  {
    id: "duties-taxes",
    title: "Duties, Customs & Import Tariffs",
    content: (
      <>
        <p>
          To ensure an effortless arrival experience, all international
          shipments are processed strictly on a{" "}
          <strong>Delivered Duty Paid (DDP)</strong> basis.
        </p>
        <p>
          All regional VAT, customs tariffs, and administrative import duties
          are calculated in real time and collected during checkout. The carrier
          will release your parcel directly to your address with no additional
          payment required at delivery.
        </p>
      </>
    ),
  },
  {
    id: "insurance-tracking",
    title: "Transit Insurance & Real-Time Tracking",
    content: (
      <>
        <p>
          Each package dispatched is fully insured against theft, loss, and
          transit damage until the moment it is signed for. Once collected by
          the carrier, you will receive an SMS and email notification containing
          your live GPS tracking number.
        </p>
        <p>
          For security reasons, an adult signature is required upon delivery for
          all orders with a value exceeding $500.
        </p>
      </>
    ),
  },
  {
    id: "packaging",
    title: "Signature Packaging & Gift Services",
    content: (
      <>
        <p>
          Orders arrive housed in our signature heavyweight matte gift box,
          bound with cotton ribbon and an embossed lacquer seal. Structured
          garments, tailored blazers, and outerwear arrive with a breathable
          dust cover and engraved hanger.
        </p>
        <p>
          Gift notes on handcrafted parchment paper can be requested during
          checkout or through our Client Concierge team.
        </p>
      </>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Dispatch Protocol"
      subtitle="Comprehensive guidelines on international transport, customs handling, and white-glove packaging."
      lastUpdated="September 2026"
      currentPath="/shipping"
      sections={sections}
    />
  );
}
