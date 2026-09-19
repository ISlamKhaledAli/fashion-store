import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "THE CURATOR | Premium Fashion Commerce",
    short_name: "The Curator",
    description:
      "A cinematic premium fashion storefront with AI-assisted shopping and an archival luxury collection.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9fb",
    theme_color: "#030304",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
