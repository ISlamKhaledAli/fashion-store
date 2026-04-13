"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Truck, Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onAction: (action: string) => void;
}

export const BulkActionBar = ({ selectedCount, onClear, onAction }: BulkActionBarProps) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl px-6"
        >
          <div className="bg-zinc-900/95 text-white rounded-2xl px-8 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between border border-white/10 backdrop-blur-xl">
            {/* Left: Selection Info */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center text-sm font-black shadow-lg">
                {selectedCount}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium tracking-tight text-white">Orders Selected</span>
                <Button 
                  variant="none"
                  size="none"
                  onClick={onClear}
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.15em] font-bold text-left"
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-white/10 mx-6" />

            {/* Center: Actions */}
            <div className="flex-1 flex items-center justify-center gap-6">
              <Button 
                variant="none"
                size="none"
                onClick={() => onAction("ship")}
                className="flex items-center gap-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-all group"
                icon={<Truck size={18} className="text-zinc-500 group-hover:text-white transition-colors" />}
              >
                Mark as Shipped
              </Button>
              
              <div className="h-4 w-px bg-white/5" />

              <Button 
                variant="none"
                size="none"
                onClick={() => onAction("export")}
                className="flex items-center gap-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-all group"
                icon={<Download size={18} className="text-zinc-500 group-hover:text-white transition-colors" />}
              >
                Export CSV
              </Button>

              <div className="h-4 w-px bg-white/5" />

              <Button 
                variant="none"
                size="none"
                onClick={() => onAction("delete")}
                className="flex items-center gap-2.5 text-sm font-medium text-red-400/80 hover:text-red-400 transition-all group"
                icon={<Trash2 size={18} className="text-red-500/50 group-hover:text-red-400 transition-colors" />}
              >
                Delete
              </Button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-white/10 mx-6" />

            {/* Right: Close */}
            <Button 
              variant="icon"
              size="none"
              onClick={onClear}
              className="w-10 h-10 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-white flex shrink-0"
              icon={<X size={20} />}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
