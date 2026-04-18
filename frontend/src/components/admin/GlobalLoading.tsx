"use client";

import React from "react";
import { motion } from "framer-motion";

export const GlobalLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-8 animate-in fade-in duration-1000">
      <div className="relative w-20 h-20 mb-8">
        {/* Outer glowing ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-[3px] border-zinc-100"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Animated spinning arc */}
        <motion.div 
          className="absolute inset-0 rounded-full border-[3px] border-t-zinc-900 border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />

        {/* Inner pulse */}
        <motion.div 
          className="absolute inset-4 rounded-full bg-zinc-50"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      <div className="space-y-4 text-center">
        <motion.h3 
          className="text-lg font-bold tracking-tight text-zinc-950"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Synchronizing Archives
        </motion.h3>
        <motion.div 
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div 
                key={i}
                className="w-1.5 h-1.5 bg-zinc-200 rounded-full"
                animate={{ 
                  backgroundColor: ["#e4e4e7", "#18181b", "#e4e4e7"]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut" 
                }}
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            Fetching global intelligence
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 no-print">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-zinc-400">
          The Curator v1.0
        </p>
      </div>
    </div>
  );
};
