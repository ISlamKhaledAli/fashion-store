import React from "react";
import { OrderItem } from "@/types";

interface OrderSummaryProps {
  items: OrderItem[];
}

export const OrderSummary = ({ items }: OrderSummaryProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold border-b border-zinc-100 pb-3">
        Items Summary
      </h3>
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px', gap: '12px', paddingBottom: '12px', boxSizing: 'border-box' }}
          className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
          <div>Product</div>
          <div style={{ textAlign: 'center' }}>Qty</div>
          <div style={{ textAlign: 'right' }}>Price</div>
        </div>

        {/* Items */}
        <div className="divide-y divide-zinc-100/50 border-t border-zinc-100">
          {(items || []).map((item, idx) => (
            <div key={idx}
              style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px', gap: '12px', padding: '16px 0', alignItems: 'center', boxSizing: 'border-box' }}>
              
              {/* Product */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{ width: '56px', height: '72px', flexShrink: 0, overflow: 'hidden', borderRadius: '4px', border: '1px solid #f4f4f5', background: '#fafafa' }}>
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#18181b', fontSize: '14px', margin: 0, wordBreak: 'break-word' }}>
                    {item.product.name}
                  </p>
                  <p style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
                    {item.variant.color} / {item.variant.size}
                  </p>
                </div>
              </div>

              {/* Qty */}
              <div style={{ textAlign: 'center', color: '#71717a', fontSize: '13px', fontWeight: 500 }}>
                {item.quantity}x
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#18181b', fontSize: '14px', whiteSpace: 'nowrap' }}>
                ${item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};