import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
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

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl cinematic-shadow border border-outline-variant/10 overflow-hidden h-full flex flex-col">
        <div className="p-6 flex justify-between items-center border-b border-surface-container-low">
          <h3 className="text-lg font-medium tracking-tight">Top Performing Products</h3>
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-surface-container-high rounded"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                <div className="h-3 bg-surface-container-high rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl cinematic-shadow border border-outline-variant/10 overflow-hidden h-full flex flex-col">
      <div className="p-6 flex justify-between items-center border-b border-surface-container-low">
        <h3 className="text-lg font-medium tracking-tight text-on-surface">Top Performing Products</h3>
        <Button 
          variant="none"
          size="none"
          className="text-xs font-bold tracking-widest text-primary border-b border-primary/20 pb-0.5 hover:border-primary transition-all"
        >
          VIEW ALL
        </Button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/30">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Product</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Units</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Revenue</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low/50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-on-surface-variant/40">No products data</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <TableImage 
                      src={product.image}
                      alt={product.name}
                      containerClassName="w-10 h-10 rounded border border-outline-variant/10 shadow-sm"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-on-surface truncate">{product.name}</span>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter truncate font-medium">
                        {product.categoryName || "Edition 01"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface tabular-nums">{product.quantity}</td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface text-right">
                      <PriceDisplay amount={product.revenue} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
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
