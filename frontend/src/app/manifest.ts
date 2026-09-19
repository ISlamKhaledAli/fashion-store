import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Curator — High Fashion & Atelier",
    short_name: "The Curator",
    description:
      "Digital flagship for archival luxury collections, private client concierge, and AI bespoke styling.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#030304",
    theme_color: "#030304",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
