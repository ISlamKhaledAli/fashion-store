import React from "react";
import { ArrowRight } from "lucide-react";

interface SearchPresenceSectionProps {
  name: string;
  slug: string;
  description: string;
}

export const SearchPresenceSection: React.FC<SearchPresenceSectionProps> = ({
  name,
  slug,
  description,
}) => {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-zinc-100" />
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Search Presence
        </h4>
        <div className="h-[1px] flex-1 bg-zinc-100" />
      </div>

      <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-8 shadow-inner">
        <p className="cursor-pointer truncate text-xl font-medium tracking-tight text-[#1a0dab] hover:underline">
          {name || "Product Archive Piece"} | Editorial curator
        </p>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#006621]">
          <span>thecurator.com</span>
          <ArrowRight size={10} className="text-zinc-400" />
          <span className="truncate">{slug || "item-pathway"}</span>
        </div>
        <p className="line-clamp-2 font-serif text-[13px] leading-relaxed text-zinc-500 italic">
          {description ||
            "Refining the intersection of modern utility and timeless editorial aesthetics... "}
        </p>
      </div>
    </section>
  );
};
