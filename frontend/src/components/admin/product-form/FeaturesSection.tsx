import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { ProductFeature } from "./types";

interface FeaturesSectionProps {
  productName: string;
  features: ProductFeature[];
  onChange: (features: ProductFeature[]) => void;
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
  onGenerateSingle: (index: number, title: string) => void;
  loadingMap: Record<number, boolean>;
  errorMap: Record<number, boolean>;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  productName,
  features,
  onChange,
  onGenerateAll,
  isGeneratingAll,
  onGenerateSingle,
  loadingMap,
  errorMap,
}) => {
  return (
    <section className="space-y-8">
      <div className="mt-6 border-t border-zinc-100 pt-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-widest text-zinc-900 uppercase">
              Showcase Features
            </h3>
            <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
              Add dynamic storytelling cards with Material symbols (shown in the
              Sticky Showcase)
            </p>
          </div>
          <div className="group/tooltip relative flex flex-col items-end gap-1">
            <Button
              type="button"
              variant="none"
              size="none"
              disabled={!productName.trim() || isGeneratingAll}
              onClick={onGenerateAll}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                isGeneratingAll
                  ? "text-zinc-400"
                  : "text-zinc-700 hover:text-zinc-950"
              )}
            >
              {isGeneratingAll ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                  Generating...
                </>
              ) : (
                "✦ Generate Features with AI"
              )}
            </Button>
            {!productName.trim() && (
              <div className="pointer-events-none absolute right-0 bottom-full z-50 mb-2 hidden rounded bg-zinc-900 px-2.5 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                Enter a product name first
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {features?.map((feature, idx) => (
          <div
            key={idx}
            className="group animate-in fade-in relative space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 duration-300"
          >
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() => {
                const nextFeatures = [...features];
                nextFeatures.splice(idx, 1);
                onChange(nextFeatures);
              }}
              className="absolute top-4 right-4 text-zinc-400 transition-colors hover:text-red-500"
            >
              <Trash2 size={16} />
            </Button>

            <div className="flex flex-col items-end gap-6 md:flex-row">
              <div className="shrink-0 space-y-2">
                <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                  Icon
                </label>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white transition-colors focus-within:ring-1 focus-within:ring-black hover:border-zinc-300">
                  <select
                    value={feature.icon}
                    onChange={(e) => {
                      const nextFeatures = [...features];
                      nextFeatures[idx].icon = e.target.value;
                      onChange(nextFeatures);
                    }}
                    className="material-symbols-outlined m-0 h-full w-full cursor-pointer appearance-none border-none bg-transparent p-0 text-lg text-zinc-800 outline-none"
                    style={{
                      fontVariationSettings: "'FILL' 0, 'wght' 400",
                      textAlignLast: "center",
                      textAlign: "center",
                    }}
                  >
                    <option
                      value="eco"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      eco
                    </option>
                    <option
                      value="architecture"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      architecture
                    </option>
                    <option
                      value="history"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      history
                    </option>
                    <option
                      value="ac_unit"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      ac_unit
                    </option>
                    <option
                      value="shield"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      shield
                    </option>
                    <option
                      value="auto_awesome"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      auto_awesome
                    </option>
                    <option
                      value="apparel"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      apparel
                    </option>
                    <option
                      value="package_2"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      package_2
                    </option>
                    <option
                      value="water_drop"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      water_drop
                    </option>
                    <option
                      value="local_shipping"
                      className="material-symbols-outlined text-zinc-800"
                    >
                      local_shipping
                    </option>
                  </select>
                </div>
              </div>

              <div className="w-full flex-1 space-y-2">
                <Input
                  label="Feature Title"
                  value={feature.title}
                  onChange={(e) => {
                    const nextFeatures = [...features];
                    nextFeatures[idx].title = e.target.value;
                    onChange(nextFeatures);
                  }}
                  placeholder="e.g. Anatomical Tailoring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                  Feature Description
                </label>
                <div className="group/tooltip relative flex flex-col items-start gap-1">
                  <Button
                    type="button"
                    variant="none"
                    size="none"
                    disabled={!feature.title.trim() || loadingMap[idx]}
                    onClick={() => onGenerateSingle(idx, feature.title)}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                      loadingMap[idx]
                        ? "text-zinc-400"
                        : "text-zinc-700 hover:text-zinc-950"
                    )}
                  >
                    {loadingMap[idx] ? (
                      <>
                        <div className="h-2.5 w-2.5 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                        Generating...
                      </>
                    ) : (
                      "✦ Generate with AI"
                    )}
                  </Button>
                  {!feature.title.trim() && (
                    <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded bg-zinc-900 px-2 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                      Enter a feature title first
                    </div>
                  )}
                  {errorMap[idx] && (
                    <span className="text-[9px] leading-none font-bold tracking-wider text-red-500 uppercase">
                      Generation failed. Try again.
                    </span>
                  )}
                </div>
              </div>
              <Textarea
                value={feature.description}
                onChange={(e) => {
                  const nextFeatures = [...features];
                  nextFeatures[idx].description = e.target.value;
                  onChange(nextFeatures);
                }}
                placeholder="e.g. Sourced from the finest Italian mills..."
                rows={2}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onChange([
              ...(features || []),
              { icon: "eco", title: "", description: "" },
            ]);
          }}
          className="h-11 w-full py-4 text-[10px] font-black tracking-[0.2em] uppercase"
        >
          + Add Showcase Feature Card
        </Button>
      </div>
    </section>
  );
};
