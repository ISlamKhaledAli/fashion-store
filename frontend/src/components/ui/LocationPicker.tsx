"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  Search,
  Check,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface LocationData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  formattedAddress?: string;
  lat?: number;
  lon?: number;
}

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  postcode?: string;
  country?: string;
  house_number?: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  className?: string;
  compact?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  className,
  compact = false,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimResponse[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [activeMode, setActiveMode] = useState<"gps" | "search">("gps");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseNominatimAddress = (data: NominatimResponse): LocationData => {
    const a = data.address || {};

    // Construct best street name
    const streetComponents = [
      a.house_number,
      a.road || a.pedestrian || a.suburb || a.neighbourhood,
    ].filter(Boolean);
    const street =
      streetComponents.join(" ") || data.display_name.split(",")[0] || "";

    // City resolution
    const city =
      a.city || a.town || a.village || a.municipality || a.county || "";

    // State / Governorate resolution
    const state = a.state || a.region || "";

    // Postal code
    const zip = a.postcode || "";

    // Country
    const country = a.country || "United States";

    return {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      country: country.trim(),
      formattedAddress: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
    };
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en,ar",
              },
            }
          );

          if (!res.ok) throw new Error("Failed to reverse geocode");

          const data = (await res.json()) as NominatimResponse;
          const parsed = parseNominatimAddress(data);

          setDetectedLocation(parsed);
          onLocationSelect(parsed);
          toast.success("Location detected successfully!", {
            description: parsed.street
              ? `${parsed.street}, ${parsed.city}`
              : parsed.formattedAddress,
          });
        } catch (err) {
          console.error("Geocoding error:", err);
          toast.error(
            "Could not fetch address details for your coordinates. You can type it manually."
          );
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location access denied. Please enable location permissions or enter address manually."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error(
              "Location information unavailable. Please enter address manually."
            );
            break;
          case error.TIMEOUT:
            toast.error(
              "Location request timed out. Please try again or enter manually."
            );
            break;
          default:
            toast.error("Failed to detect location. Please enter manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          searchQuery
        )}&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "en,ar",
          },
        }
      );

      if (!res.ok) throw new Error("Search failed");

      const results = (await res.json()) as NominatimResponse[];
      setSearchResults(results);
      setShowSearchResults(true);

      if (results.length === 0) {
        toast.info(
          "No addresses found matching your search. Try different keywords."
        );
      }
    } catch (err) {
      console.error("Address search error:", err);
      toast.error("Failed to search address. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: NominatimResponse) => {
    const parsed = parseNominatimAddress(result);
    setDetectedLocation(parsed);
    setCoords({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) });
    setShowSearchResults(false);
    setSearchQuery(
      parsed.street ? `${parsed.street}, ${parsed.city}` : result.display_name
    );
    onLocationSelect(parsed);
    toast.success("Address auto-filled!");
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low/60 transition-all",
        className
      )}
    >
      {/* Header bar / Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/15 bg-surface-container-high/40 px-3.5 py-2.5 sm:px-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary" />
          <span className="text-xs font-semibold tracking-wide text-on-surface">
            Location Auto-Fill
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            GPS / Map
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode("gps")}
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              activeMode === "gps"
                ? "bg-surface text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            GPS Detect
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("search")}
            className={cn(
              "cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              activeMode === "search"
                ? "bg-surface text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            Search Area
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-4">
        {activeMode === "gps" ? (
          /* GPS Mode */
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-on-surface">
                Instant delivery location via GPS
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Auto-fill street, city, state, postal code and country in one
                tap.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all select-none",
                isDetecting
                  ? "bg-surface-container-high text-on-surface-variant opacity-75"
                  : "bg-primary text-on-primary shadow-xs hover:bg-primary/90 active:scale-98"
              )}
            >
              {isDetecting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Locating you...</span>
                </>
              ) : (
                <>
                  <Navigation size={14} />
                  <span>Use My Current Location</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Search Mode */
          <div ref={searchContainerRef} className="relative space-y-2">
            <form onSubmit={handleSearchAddress} className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search district, street, or landmark (e.g. Zamalek, Cairo)..."
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest py-1.5 pr-3 pl-9 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="cursor-pointer rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  "Find"
                )}
              </button>
            </form>

            {/* Dropdown Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-outline-variant/20 bg-surface shadow-xl">
                {searchResults.map((result, idx) => (
                  <button
                    key={`${result.lat}-${result.lon}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="flex w-full cursor-pointer items-start gap-2 border-b border-outline-variant/10 p-2.5 text-left text-xs transition-colors last:border-b-0 hover:bg-surface-container-low"
                  >
                    <MapPin
                      size={14}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <span className="line-clamp-2 text-on-surface">
                      {result.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Location Detection Result & Map Preview */}
        {detectedLocation && (
          <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                  <Check size={10} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface">
                    Location Detected
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-on-surface-variant">
                    {detectedLocation.street && `${detectedLocation.street}, `}
                    {detectedLocation.city && `${detectedLocation.city}, `}
                    {detectedLocation.country}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectGPS}
                title="Re-detect"
                className="cursor-pointer p-1 text-on-surface-variant hover:text-primary"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Interactive mini map if coordinates are available and not compact */}
            {coords && !compact && (
              <div className="relative mt-2.5 h-28 w-full overflow-hidden rounded-md border border-outline-variant/20 bg-surface-container-lowest">
                <iframe
                  title="Location Map Preview"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.005}%2C${coords.lat - 0.003}%2C${coords.lon + 0.005}%2C${coords.lat + 0.003}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`}
                  className="pointer-events-none opacity-90"
                />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=16/${coords.lat}/${coords.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-1.5 bottom-1 flex items-center gap-1 rounded bg-surface/90 px-1.5 py-0.5 text-[9px] font-medium text-on-surface-variant shadow-xs backdrop-blur-xs hover:text-primary"
                >
                  <span>View full map</span>
                  <ExternalLink size={9} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
