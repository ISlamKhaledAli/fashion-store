import React from "react";

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

export const CategoryRevenueChart: React.FC<CategoryRevenueChartProps> = ({
  categories,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="cinematic-shadow h-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8">
        <h3 className="mb-8 text-lg font-medium tracking-tight">
          Traffic by Category
        </h3>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-surface-container-high"></div>
                <div className="h-3 w-8 rounded bg-surface-container-high"></div>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container-low"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate percentages based on total revenue
  const totalRevenue = categories.reduce((sum, cat) => sum + cat.revenue, 0);

  // Sort by revenue descending
  const sortedCategories = [...categories]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="cinematic-shadow h-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8">
      <h3 className="mb-8 text-lg font-medium tracking-tight text-on-surface">
        Traffic by Category
      </h3>
      <div className="space-y-6">
        {sortedCategories.length === 0 ? (
          <div className="py-8 text-center text-sm text-on-surface-variant/40">
            No data available
          </div>
        ) : (
          sortedCategories.map((cat) => {
            const percentage =
              totalRevenue > 0
                ? Math.round((cat.revenue / totalRevenue) * 100)
                : 0;
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="max-w-[70%] truncate text-on-surface">
                    {cat.name}
                  </span>
                  <span className="whitespace-nowrap text-on-surface-variant tabular-nums">
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
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
