"use client";

import React, { useState, useEffect } from "react";
import { contentApi } from "@/lib/api";
import type { SizeGuideContent } from "@/types";

const DEFAULT_SIZE_GUIDE: SizeGuideContent = {
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
};

export default function SizeGuidePage() {
  const [guide, setGuide] = useState<SizeGuideContent>(
    () => DEFAULT_SIZE_GUIDE
  );

  useEffect(() => {
    contentApi
      .getByKey<SizeGuideContent>("size_guide")
      .then((res) => {
        if (res.data.success && res.data.data) {
          const fetched = res.data.data as unknown as Partial<SizeGuideContent>;
          setGuide((prev) => ({
            title: fetched.title || prev.title,
            subtitle: fetched.subtitle || prev.subtitle,
            rows:
              Array.isArray(fetched.rows) && fetched.rows.length > 0
                ? fetched.rows
                : prev.rows,
            howToMeasure:
              Array.isArray(fetched.howToMeasure) &&
              fetched.howToMeasure.length > 0
                ? fetched.howToMeasure
                : prev.howToMeasure,
            fitsAndStyles: fetched.fitsAndStyles || prev.fitsAndStyles,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-surface px-8 py-24 lg:px-12">
      <div className="mx-auto max-w-4xl space-y-16">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-medium tracking-tighter md:text-6xl">
            {guide.title}
          </h1>
          <p className="text-lg text-on-surface-variant">{guide.subtitle}</p>
        </header>

        <section className="space-y-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                    Size
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                    Chest (in)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                    Waist (in)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                    Hip (in)
                  </th>
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((row, idx) => (
                  <tr
                    key={row.size || idx}
                    className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4 font-medium">{row.size}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {row.chest}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {row.waist}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {row.hip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-12 pt-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">
              How to Measure
            </h2>
            <ul className="space-y-3 text-sm leading-relaxed text-on-surface-variant">
              {guide.howToMeasure.map((item, idx) => (
                <li key={idx}>
                  <strong className="text-on-surface">{item.label}:</strong>{" "}
                  {item.instruction}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">
              Fits & Styles
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {guide.fitsAndStyles}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
