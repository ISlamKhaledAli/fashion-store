import React from "react";

const SIZE_CHART = [
  { size: "XS", chest: "34-36", waist: "28-30", hip: "34-36" },
  { size: "S", chest: "36-38", waist: "30-32", hip: "36-38" },
  { size: "M", chest: "38-40", waist: "32-34", hip: "38-40" },
  { size: "L", chest: "40-42", waist: "34-36", hip: "40-42" },
  { size: "XL", chest: "42-44", waist: "36-38", hip: "42-44" },
  { size: "XXL", chest: "44-46", waist: "38-40", hip: "44-46" },
];

export default function SizeGuidePage() {
  return (
    <div className="bg-surface min-h-screen py-24 px-8 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl md:text-6xl font-medium tracking-tighter">Size Guide</h1>
          <p className="text-on-surface-variant text-lg">
            Find your perfect fit with our comprehensive size chart.
          </p>
        </header>

        <section className="space-y-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Size</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Chest (in)</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Waist (in)</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 font-medium">{row.size}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{row.chest}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{row.waist}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
          <div className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">How to Measure</h2>
            <ul className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
              <li>
                <strong className="text-on-surface">Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.
              </li>
              <li>
                <strong className="text-on-surface">Waist:</strong> Measure around the narrowest part of your waistline, usually near your belly button.
              </li>
              <li>
                <strong className="text-on-surface">Hips:</strong> Measure around the fullest part of your hips, keeping the tape horizontal.
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight">Fits & Styles</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Our garments are designed with varied silhouettes. For a structured look, stick to your true size. For a more relaxed, oversized fit, consider sizing up.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
