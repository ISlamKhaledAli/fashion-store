import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { AccordionItem } from "./types";
import { ACCORDION_PRESETS } from "./types";

interface AccordionsSectionProps {
  productName: string;
  description: string;
  onDescriptionChange: (val: string) => void;
  descriptionError?: string;
  isGeneratingDescription: boolean;
  generationError: boolean;
  onGenerateDescription: () => void;
  isGeneratingAllAccordions: boolean;
  onGenerateAllAccordions: () => void;
  details: AccordionItem[];
  onDetailsChange: (details: AccordionItem[]) => void;
  onGenerateSingleAccordion: (index: number, title: string) => void;
  accordionAiLoading: Record<number, boolean>;
  accordionAiError: Record<number, boolean>;
}

export const AccordionsSection: React.FC<AccordionsSectionProps> = ({
  productName,
  description,
  onDescriptionChange,
  descriptionError,
  isGeneratingDescription,
  generationError,
  onGenerateDescription,
  isGeneratingAllAccordions,
  onGenerateAllAccordions,
  details,
  onDetailsChange,
  onGenerateSingleAccordion,
  accordionAiLoading,
  accordionAiError,
}) => {
  const updateAccordion = (
    index: number,
    field: "title" | "content" | "titleInputFocused",
    value: string | boolean
  ) => {
    const nextDetails = [...details];
    nextDetails[index] = {
      ...nextDetails[index],
      [field]: value,
    };
    onDetailsChange(nextDetails);
  };

  return (
    <section className="space-y-8">
      <div className="mt-6 border-t border-zinc-100 pt-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-widest text-zinc-900 uppercase">
              Detail Accordions
            </h3>
            <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
              Add custom sections for Materials, Care, Shipping, or general
              product details
            </p>
          </div>
          <div className="group/tooltip relative flex flex-col items-end gap-1">
            <Button
              type="button"
              variant="none"
              size="none"
              disabled={!productName.trim() || isGeneratingAllAccordions}
              onClick={onGenerateAllAccordions}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                isGeneratingAllAccordions
                  ? "text-zinc-400"
                  : "text-zinc-700 hover:text-zinc-950"
              )}
            >
              {isGeneratingAllAccordions ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                  Generating...
                </>
              ) : (
                "✦ Generate Standard Sections with AI"
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
        {/* Permanent First Accordion Item: Editorial Description */}
        <div className="group relative space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex items-center gap-3">
            <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
              EDITORIAL DESCRIPTION
            </label>
            <div className="group/tooltip relative flex flex-col items-start gap-1">
              <Button
                type="button"
                variant="none"
                size="none"
                disabled={!productName.trim() || isGeneratingDescription}
                onClick={onGenerateDescription}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                  isGeneratingDescription
                    ? "text-zinc-400"
                    : "text-zinc-700 hover:text-zinc-950"
                )}
              >
                {isGeneratingDescription ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                    Generating...
                  </>
                ) : (
                  "✦ Generate with AI"
                )}
              </Button>
              {!productName.trim() && (
                <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded bg-zinc-900 px-2.5 py-1.5 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                  Enter a product name first
                </div>
              )}
              {generationError && (
                <span className="text-[10px] leading-none font-bold tracking-wider text-red-500 uppercase">
                  Generation failed. Try again.
                </span>
              )}
            </div>
          </div>
          <p className="-mt-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            MAIN PRODUCT DESCRIPTION — ALWAYS VISIBLE ON PRODUCT PAGE
          </p>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={5}
            placeholder="Crafted from Italian wool..."
            error={descriptionError}
            required
          />
        </div>

        {details?.map((detail, idx) => (
          <div
            key={idx}
            className="group animate-in fade-in relative space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 duration-300"
          >
            <Button
              type="button"
              variant="none"
              size="none"
              onClick={() => {
                const nextDetails = [...details];
                nextDetails.splice(idx, 1);
                onDetailsChange(nextDetails);
              }}
              className="absolute top-4 right-4 text-zinc-400 transition-colors hover:text-red-500"
            >
              <Trash2 size={16} />
            </Button>

            <div className="space-y-2">
              <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                Accordion Section Title
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={detail.title}
                  onChange={(e) =>
                    updateAccordion(idx, "title", e.target.value)
                  }
                  onFocus={() =>
                    updateAccordion(idx, "titleInputFocused", true)
                  }
                  onBlur={() =>
                    setTimeout(
                      () => updateAccordion(idx, "titleInputFocused", false),
                      150
                    )
                  }
                  placeholder="e.g. Care Instructions"
                  className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />

                <i
                  className="ti ti-chevron-down"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    color: "#71717a",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                />

                {detail.titleInputFocused && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      background: "#ffffff",
                      border: "0.5px solid #e4e4e7",
                      borderRadius: "6px",
                      zIndex: 50,
                      margin: 0,
                      padding: "4px 0",
                      listStyle: "none",
                      boxShadow:
                        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    }}
                  >
                    {ACCORDION_PRESETS.filter(
                      (preset) =>
                        preset
                          .toLowerCase()
                          .includes(detail.title.toLowerCase()) ||
                        detail.title === ""
                    ).map((preset) => (
                      <li
                        key={preset}
                        onMouseDown={() =>
                          updateAccordion(idx, "title", preset)
                        }
                        style={{
                          padding: "8px 12px",
                          fontSize: "13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "#18181b",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f4f4f5")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <span>{preset}</span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#71717a",
                            border: "0.5px solid #e4e4e7",
                            borderRadius: "4px",
                            padding: "1px 6px",
                          }}
                        >
                          + add
                        </span>
                      </li>
                    ))}

                    {detail.title.trim() !== "" &&
                      !ACCORDION_PRESETS.includes(detail.title) && (
                        <li
                          onMouseDown={() =>
                            updateAccordion(idx, "title", detail.title)
                          }
                          style={{
                            padding: "8px 12px",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: "#71717a",
                            borderTop: "0.5px solid #e4e4e7",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f4f4f5")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <span>Use: &quot;{detail.title}&quot;</span>
                          <i
                            className="ti ti-corner-down-left"
                            style={{ fontSize: "13px" }}
                            aria-hidden="true"
                          />
                        </li>
                      )}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                  Accordion Content
                </label>
                <div className="group/tooltip relative flex flex-col items-start gap-1">
                  <Button
                    type="button"
                    variant="none"
                    size="none"
                    disabled={!detail.title.trim() || accordionAiLoading[idx]}
                    onClick={() => onGenerateSingleAccordion(idx, detail.title)}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm transition duration-200 hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
                      accordionAiLoading[idx]
                        ? "text-zinc-400"
                        : "text-zinc-700 hover:text-zinc-950"
                    )}
                  >
                    {accordionAiLoading[idx] ? (
                      <>
                        <div className="h-2.5 w-2.5 animate-spin rounded-full border border-zinc-300/60 border-t-zinc-700" />
                        Generating...
                      </>
                    ) : (
                      "✦ Generate with AI"
                    )}
                  </Button>
                  {!detail.title.trim() && (
                    <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded bg-zinc-900 px-2 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg group-hover/tooltip:block">
                      Enter a section title first
                    </div>
                  )}
                  {accordionAiError[idx] && (
                    <span className="text-[9px] leading-none font-bold tracking-wider text-red-500 uppercase">
                      Generation failed. Try again.
                    </span>
                  )}
                </div>
              </div>
              <Textarea
                value={detail.content}
                onChange={(e) => {
                  const nextDetails = [...details];
                  nextDetails[idx].content = e.target.value;
                  onDetailsChange(nextDetails);
                }}
                placeholder="Detail terms and specifications..."
                rows={3}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onDetailsChange([...(details || []), { title: "", content: "" }]);
          }}
          className="h-11 w-full py-4 text-[10px] font-black tracking-[0.2em] uppercase"
        >
          + Add Accordion Item
        </Button>
      </div>
    </section>
  );
};
