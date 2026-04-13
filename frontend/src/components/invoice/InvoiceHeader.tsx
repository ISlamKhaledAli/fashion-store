import React from "react";

interface InvoiceHeaderProps {
  date: string;
  reference: string;
}

export const InvoiceHeader = ({ date, reference }: InvoiceHeaderProps) => {
  return (
    <header style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'flex-end', boxSizing: 'border-box' }} className="border-b border-zinc-100 pb-8">
      {/* Date Issued - Left */}
      <div style={{ width: '30%', textAlign: 'left' }} className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Date Issued</p>
        <p className="text-sm font-medium">{date}</p>
      </div>
      
      {/* Logo - Center */}
      <div style={{ width: '40%', textAlign: 'center' }}>
        <h1 className="text-xl font-extrabold tracking-tighter uppercase text-zinc-900">THE CURATOR</h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-bold">Premium Fashion</p>
      </div>
      
      {/* Reference - Right */}
      <div style={{ width: '30%', textAlign: 'right' }} className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Reference</p>
        <p className="text-sm font-medium">#{reference}</p>
      </div>
    </header>
  );
};
