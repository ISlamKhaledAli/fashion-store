import React from "react";
import { TrendingUp } from "lucide-react";
import { PriceDisplay } from "@/components/admin/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { TableImage } from "./TableImage";

export interface TopProduct {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  revenue: number;
  categoryName?: string;
}

interface TopProductsTableProps {
  products: TopProduct[];
  isLoading: boolean;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="cinematic-shadow flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-surface-container-low p-6">
          <h3 className="text-lg font-medium tracking-tight">
            Top Performing Products
          </h3>
        </div>
        <div className="space-y-6 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-10 w-10 rounded bg-surface-container-high"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-1/3 rounded bg-surface-container-high"></div>
                <div className="h-3 w-1/4 rounded bg-surface-container-high"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cinematic-shadow flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-surface-container-low p-6">
        <h3 className="text-lg font-medium tracking-tight text-on-surface">
          Top Performing Products
        </h3>
        <Button
          variant="none"
          size="none"
          className="border-b border-primary/20 pb-0.5 text-xs font-bold tracking-widest text-primary transition-all hover:border-primary"
        >
          VIEW ALL
        </Button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/30">
              <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Product
              </th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Units
              </th>
              <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Revenue
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low/50">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-on-surface-variant/40"
                >
                  No products data
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="group transition-colors hover:bg-surface-container-lowest/50"
                >
                  <td className="flex items-center gap-3 px-6 py-4">
                    <TableImage
                      src={product.image}
                      alt={product.name}
                      containerClassName="w-10 h-10 rounded border border-outline-variant/10 shadow-sm"
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-on-surface">
                        {product.name}
                      </span>
                      <span className="truncate text-[10px] font-medium tracking-tighter text-on-surface-variant uppercase">
                        {product.categoryName || "Edition 01"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface tabular-nums">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-on-surface">
                    <PriceDisplay amount={product.revenue} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <TrendingUp className="ml-auto h-4 w-4 text-green-500" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
