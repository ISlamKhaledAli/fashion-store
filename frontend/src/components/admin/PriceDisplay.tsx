import React from 'react';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PriceDisplay = React.memo(({ amount, currency = '$', size = 'md', className }: PriceDisplayProps) => {
  // Format with commas, always keep 2 decimal points
  const formatted = amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  const [whole, decimal] = formatted.split('.');

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  const textClass = sizeClasses[size] || sizeClasses.md;

  return (
    <span className={cn("inline-flex items-baseline tabular-nums tracking-tight", textClass, className)}>
      <span className="text-zinc-500 mr-[1px] select-none font-medium">{currency}</span>
      <span className="text-zinc-950 font-bold">{whole}</span>
      <span className="text-zinc-400 font-medium">.{decimal}</span>
    </span>
  );
});

PriceDisplay.displayName = 'PriceDisplay';
