"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useCurrencyStore } from "@/store/currencyStore";

interface RegionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REGIONS = [
  {
    code: "US",
    name: "United States",
    currency: "USD",
    symbol: "$",
    flag: "🇺🇸",
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    flag: "🇬🇧",
  },
  { code: "FR", name: "France & EU", currency: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "EG", name: "Egypt", currency: "EGP", symbol: "E£", flag: "🇪🇬" },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    symbol: "AED",
    flag: "🇦🇪",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    currency: "SAR",
    symbol: "SAR",
    flag: "🇸🇦",
  },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", flag: "🇯🇵" },
];

const LANGUAGES = [
  { code: "en", name: "English (US)" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" },
];

export function RegionModal({ isOpen, onClose }: RegionModalProps) {
  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("thecurator_preferences");
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = REGIONS.find((r) => r.code === parsed.region);
          if (found) return found;
        }
      } catch {
        // Ignore
      }
    }
    return REGIONS[0];
  });

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("thecurator_preferences");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.language) return parsed.language;
        }
      } catch {
        // Ignore
      }
    }
    return LANGUAGES[0].code;
  });

  const handleSave = () => {
    try {
      localStorage.setItem(
        "thecurator_preferences",
        JSON.stringify({
          region: selectedRegion.code,
          currency: selectedRegion.currency,
          language: selectedLanguage,
        })
      );
      localStorage.setItem("thecurator_has_seen_region_modal", "true");
      useCurrencyStore.getState().setCurrency(selectedRegion.currency);
    } catch {
      // Ignore
    }

    toast.success("Region & Currency Updated", {
      description: `Shipping to ${selectedRegion.name} • Prices in ${selectedRegion.currency} (${selectedRegion.symbol})`,
    });
    onClose();
  };

  const handleClose = () => {
    try {
      localStorage.setItem("thecurator_has_seen_region_modal", "true");
    } catch {
      // Ignore
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Region & Currency"
      description="Select your shipping destination and preferred shopping currency."
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {/* Destination List */}
        <div>
          <label className="mb-3 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
            Shipping Destination & Currency
          </label>
          <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {REGIONS.map((region) => {
              const isSelected = selectedRegion.code === region.code;
              return (
                <button
                  key={region.code}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-surface-container-high shadow-xs"
                      : "border-outline-variant/50 bg-surface hover:border-outline hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{region.flag}</span>
                    <div>
                      <p className="text-xs font-medium text-on-surface">
                        {region.name}
                      </p>
                      <p className="font-mono text-[11px] text-on-surface-variant">
                        {region.currency} ({region.symbol})
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="mb-3 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
            Language
          </label>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`flex-1 cursor-pointer rounded-lg border py-2 text-center text-xs font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant/60 bg-surface text-on-surface hover:border-outline"
                  }`}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            className="text-xs font-semibold tracking-wider uppercase"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}
