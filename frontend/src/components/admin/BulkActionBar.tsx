"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onAction: (action: string) => void;
}

export const BulkActionBar = ({
  selectedCount,
  onClear,
  onAction,
}: BulkActionBarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="fixed bottom-10 left-1/2 z-[100] w-full max-w-3xl -translate-x-1/2 px-6"
        >
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/95 px-8 py-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {/* Left: Selection Info */}
            <div className="flex shrink-0 items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-zinc-900 shadow-lg">
                {selectedCount}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium tracking-tight text-white">
                  Orders Selected
                </span>
                <Button
                  variant="none"
                  size="none"
                  onClick={onClear}
                  className="text-left text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase transition-colors hover:text-white"
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-6 h-8 w-px bg-white/10" />

            {/* Center: Actions */}
            <div className="flex flex-1 items-center justify-center gap-6">
              <Button
                variant="none"
                size="none"
                onClick={() => onAction("ship")}
                className="group flex items-center gap-2.5 text-sm font-medium text-zinc-300 transition-all hover:text-white"
                icon={
                  <Truck
                    size={18}
                    className="text-zinc-500 transition-colors group-hover:text-white"
                  />
                }
              >
                Mark as Shipped
              </Button>

              <div className="h-4 w-px bg-white/5" />

              <Button
                variant="none"
                size="none"
                onClick={() => onAction("export")}
                className="group flex items-center gap-2.5 text-sm font-medium text-zinc-300 transition-all hover:text-white"
                icon={
                  <Download
                    size={18}
                    className="text-zinc-500 transition-colors group-hover:text-white"
                  />
                }
              >
                Export CSV
              </Button>

              <div className="h-4 w-px bg-white/5" />

              <Button
                variant="none"
                size="none"
                onClick={() => onAction("delete")}
                className="group flex items-center gap-2.5 text-sm font-medium text-red-400/80 transition-all hover:text-red-400"
                icon={
                  <Trash2
                    size={18}
                    className="text-red-500/50 transition-colors group-hover:text-red-400"
                  />
                }
              >
                Delete
              </Button>
            </div>

            {/* Divider */}
            <div className="mx-6 h-8 w-px bg-white/10" />

            {/* Right: Close */}
            <CloseButton
              onClick={onClear}
              className="text-zinc-500 hover:bg-white/10 hover:text-white"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
