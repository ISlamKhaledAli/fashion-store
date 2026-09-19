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
  avatars?: { name: string; avatar?: string }[];
  progressBar?: number;
  href?: string;
  icon?: React.ReactNode;
  color?: string;
}

const AnimatedNumber = ({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1] as const,
    });
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      // Force 2 decimals for currency ($)
      const isCurrency = prefix === "$";
      setDisplayValue(
        latest.toLocaleString(undefined, {
          minimumFractionDigits: isCurrency ? 2 : value % 1 === 0 ? 0 : 2,
          maximumFractionDigits: isCurrency ? 2 : value % 1 === 0 ? 0 : 2,
        })
      );
    });
  }, [springValue, value, prefix]);

  const [whole, decimal] = displayValue.split(".");

  if (prefix === "$") {
    return (
      <span className="inline-flex items-baseline tabular-nums">
        <span className="mr-[1px] align-baseline text-[0.6em] leading-none font-medium text-zinc-500 select-none">
          {prefix}
        </span>
        <span className="text-zinc-950">{whole}</span>
        {decimal && (
          <span className="text-[0.8em] font-medium tracking-tight text-zinc-400">
            .{decimal}
          </span>
        )}
        {suffix && <span className="ml-1 text-zinc-400">{suffix}</span>}
      </span>
    );
  }

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
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
  href,
  icon,
  color,
}: MetricCardProps) => {
  const CardContent = (
    <div className="group/card relative flex min-h-[170px] flex-col gap-2 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-zinc-200/50 active:scale-[0.98]">
      {/* Decorative gradient glow */}
      <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-zinc-50 blur-3xl transition-colors duration-500 group-hover/card:bg-zinc-100" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] leading-none font-black tracking-[0.2em] text-zinc-400 uppercase opacity-60 transition-colors group-hover/card:text-zinc-500">
            {title}
          </span>
          {icon && (
            <div
              className={cn(
                "inline-flex items-center",
                color || "text-zinc-400"
              )}
            >
              {icon}
            </div>
          )}
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center rounded-full border px-2 py-1 text-[10px] font-black",
              trendDirection === "up"
                ? "border-green-100/50 bg-green-50 text-green-600"
                : "border-red-100/50 bg-red-50 text-red-600"
            )}
          >
            {trendDirection === "up" ? "+" : "-"}
            {trend}%
            <span className="ml-1 shrink-0">
              {trendDirection === "up" ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
            </span>
          </span>
        )}
      </div>

      <div className="relative z-10 mt-1 text-3xl font-black tracking-tighter text-zinc-950">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>

      {sparkline && (
        <div className="relative z-10 mt-4 h-10 w-full overflow-hidden">
          {sparkline}
        </div>
      )}

      {avatars && avatars.length > 0 && (
        <div className="relative z-10 mt-auto flex items-center justify-between pt-4">
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((item, i) => (
              <div
                key={i}
                className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white shadow-sm ring-2 ring-transparent transition-all group-hover/card:ring-zinc-50"
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-[8px] font-black text-zinc-500">
                    {item.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </div>
                )}
              </div>
            ))}
            {avatars.length > 3 && (
              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-zinc-50 text-[8px] font-black text-zinc-400 shadow-sm">
                +{avatars.length - 3}
              </div>
            )}
          </div>
          {href && (
            <div className="text-zinc-300 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-zinc-950">
              <ArrowRight size={16} />
            </div>
          )}
        </div>
      )}

      {!avatars && href && (
        <div className="relative z-10 mt-auto flex items-center justify-end pt-4">
          <div className="text-zinc-300 transition-all duration-300 group-hover/card:translate-x-1 group-hover/card:text-zinc-950">
            <ArrowRight size={16} />
          </div>
        </div>
      )}

      {progressBar !== undefined && (
        <div className="relative z-10 mt-auto w-full pt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressBar}%` }}
              transition={{
                duration: 1.5,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className="h-full rounded-full bg-zinc-950"
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
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
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

  return <motion.div variants={containerVariants}>{CardContent}</motion.div>;
};
