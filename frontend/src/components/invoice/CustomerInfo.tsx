import React from "react";
import type { Address } from "@/types";

interface CustomerInfoProps {
  address: Address;
  email: string;
}

export const CustomerInfo = ({ address, email }: CustomerInfoProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: "4%",
        boxSizing: "border-box",
      }}
    >
      {/* Bill To */}
      <div
        style={{
          width: "48%",
          textAlign: "left",
          verticalAlign: "top",
          overflow: "hidden",
          minWidth: 0,
        }}
        className="space-y-4"
      >
        <h3 className="border-b border-zinc-100 pb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
          Bill To
        </h3>
        <div className="space-y-2">
          <p className="font-semibold text-zinc-900">
            {address.firstName} {address.lastName}
          </p>
          <p
            style={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
              maxWidth: "100%",
            }}
            className="text-zinc-500"
          >
            {email}
          </p>
          <p className="leading-relaxed text-zinc-500">
            {address.street}
            {address.apartment ? `, ${address.apartment}` : ""}
            <br />
            {address.city}, {address.state} {address.zip}, {address.country}
          </p>
        </div>
      </div>

      {/* Shipping To */}
      <div
        style={{ width: "48%", textAlign: "left", verticalAlign: "top" }}
        className="space-y-4"
      >
        <h3 className="border-b border-zinc-100 pb-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
          Shipping To
        </h3>
        <div className="space-y-2">
          <p className="font-semibold text-zinc-900">
            {address.firstName} {address.lastName}
          </p>
          <p className="leading-relaxed text-zinc-500">
            {address.street}
            {address.apartment ? `, ${address.apartment}` : ""}
            <br />
            {address.city}, {address.state} {address.zip}, {address.country}
          </p>
          <p className="mt-3 inline-block rounded border border-zinc-100/50 bg-zinc-50 px-3 py-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Express Delivery
          </p>
        </div>
      </div>
    </div>
  );
};
