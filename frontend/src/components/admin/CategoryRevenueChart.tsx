import React from "react";
import { formatCurrency } from "@/lib/utils";

export interface CategoryStat {
  id: string;
  name: string;
  revenue: number;
  orders: number;
}

interface CategoryRevenueChartProps {
  categories: CategoryStat[];
  isLoading: boolean;
}

export const CategoryRevenueChart: React.FC<CategoryRevenueChartProps> = ({ categories, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl cinematic-shadow border border-outline-variant/10 h-full">
        <h3 className="text-lg font-medium tracking-tight mb-8">Traffic by Category</h3>
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="w-20 h-3 bg-surface-container-high rounded"></div>
                <div className="w-8 h-3 bg-surface-container-high rounded"></div>
              </div>
              <div className="h-2 w-full bg-surface-container-low rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate percentages based on total revenue
  const totalRevenue = categories.reduce((sum, cat) => sum + cat.revenue, 0);
  
  // Sort by revenue descending
  const sortedCategories = [...categories].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl cinematic-shadow border border-outline-variant/10 h-full">
      <h3 className="text-lg font-medium tracking-tight mb-8 text-on-surface">Traffic by Category</h3>
      <div className="space-y-6">
        {sortedCategories.length === 0 ? (
          <div className="py-8 text-center text-sm text-on-surface-variant/40">No data available</div>
        ) : (
          sortedCategories.map(cat => {
            const percentage = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface truncate max-w-[70%]">{cat.name}</span>
                  <span className="text-on-surface-variant whitespace-nowrap tabular-nums">{percentage}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
