"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  trendDirection?: "up" | "down";
  sparkline?: React.ReactNode;
  avatars?: { name: string; avatar?: string; }[];
  progressBar?: number;
}

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(latest.toLocaleString(undefined, { 
        minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        maximumFractionDigits: value % 1 === 0 ? 0 : 2 
      }));
    });
  }, [springValue, value]);

  return <span>{prefix}{displayValue}{suffix}</span>;
};

export const MetricCard = ({ 
  title, 
  value, 
  prefix, 
  suffix, 
  trend, 
  trendDirection = "up", 
  sparkline, 
  avatars,
  progressBar 
}: MetricCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col gap-2 relative overflow-hidden group min-h-[160px]"
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant leading-none">{title}</span>
        {trend !== undefined && (
          <span className={cn(
            "text-[10px] font-bold flex items-center px-1.5 py-0.5 rounded-full",
            trendDirection === "up" ? "text-green-600" : "text-red-600"
          )}>
            {trendDirection === "up" ? "+" : "-"}{trend}% 
            <span className="material-symbols-outlined text-[14px] ml-0.5">
              {trendDirection === "up" ? "trending_up" : "trending_down"}
            </span>
          </span>
        )}
      </div>
      
      <div className="text-2xl font-bold tracking-tighter text-on-surface mt-1">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>

      {sparkline && (
        <div className="mt-4 h-8 w-full">
          {sparkline}
        </div>
      )}

      {avatars && avatars.length > 0 && (
        <div className="mt-auto pt-4 flex -space-x-2">
          {avatars.slice(0, 3).map((item, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-sm relative group">
              {item.avatar ? (
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-on-surface-variant">
                  {item.name.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
              )}
            </div>
          ))}
          {avatars.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-on-surface-variant shadow-sm relative z-10">
              +{avatars.length - 3}
            </div>
          )}
        </div>
      )}

      {progressBar !== undefined && (
        <div className="mt-auto pt-4 w-full">
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressBar}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-zinc-900"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};
