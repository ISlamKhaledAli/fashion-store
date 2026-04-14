"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from "next/link";

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
  href?: string;
}

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 2, ease: [0.16, 1, 0.3, 1] as const });
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
  progressBar,
  href
}: MetricCardProps) => {
  const CardContent = (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-2 relative overflow-hidden group/card min-h-[170px] transition-all duration-500 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1.5 active:scale-[0.98]">
      {/* Decorative gradient glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-50 rounded-full blur-3xl group-hover/card:bg-zinc-100 transition-colors duration-500" />
      
      <div className="flex justify-between items-start relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none group-hover/card:text-zinc-500 transition-colors">{title}</span>
        {trend !== undefined && (
          <span className={cn(
            "text-[10px] font-black flex items-center px-2 py-1 rounded-full border",
            trendDirection === "up" 
              ? "text-green-600 bg-green-50 border-green-100/50" 
              : "text-red-600 bg-red-50 border-red-100/50"
          )}>
            {trendDirection === "up" ? "+" : "-"}{trend}% 
            <span className="ml-1 shrink-0">
              {trendDirection === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            </span>
          </span>
        )}
      </div>
      
      <div className="text-3xl font-black tracking-tighter text-zinc-950 mt-1 relative z-10">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>

      {sparkline && (
        <div className="mt-4 h-10 w-full relative z-10 overflow-hidden">
          {sparkline}
        </div>
      )}

      {avatars && avatars.length > 0 && (
        <div className="mt-auto pt-4 flex items-center justify-between relative z-10">
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((item, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-sm relative ring-2 ring-transparent group-hover/card:ring-zinc-50 transition-all">
                {item.avatar ? (
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[8px] font-black text-zinc-500">
                    {item.name.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                )}
              </div>
            ))}
            {avatars.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-zinc-50 flex items-center justify-center text-[8px] font-black text-zinc-400 shadow-sm relative z-10">
                +{avatars.length - 3}
              </div>
            )}
          </div>
          {href && (
            <div className="text-zinc-300 group-hover/card:text-zinc-950 group-hover/card:translate-x-1 transition-all duration-300">
              <ArrowRight size={16} />
            </div>
          )}
        </div>
      )}

      {!avatars && href && (
        <div className="mt-auto pt-4 flex items-center justify-end relative z-10">
          <div className="text-zinc-300 group-hover/card:text-zinc-950 group-hover/card:translate-x-1 transition-all duration-300">
            <ArrowRight size={16} />
          </div>
        </div>
      )}

      {progressBar !== undefined && (
        <div className="mt-auto pt-6 w-full relative z-10">
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressBar}%` }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
              className="h-full bg-zinc-950 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  if (href) {
    return (
      <motion.div variants={containerVariants}>
        <Link href={href} className="block no-underline">
          {CardContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants}>
      {CardContent}
    </motion.div>
  );
};
