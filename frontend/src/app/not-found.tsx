import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-surface-container-high/40 blur-3xl" />

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest px-4 py-1.5 text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
        <Compass className="h-3.5 w-3.5 text-secondary" />
        <span>Edition 404 &bull; Lost in Curation</span>
      </div>

      {/* Main Title */}
      <h1 className="mb-4 text-4xl font-extralight tracking-tight text-on-surface sm:text-6xl md:text-7xl">
        Piece Not Found
      </h1>

      <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed font-normal text-on-surface-variant sm:text-lg">
        The silhouette, editorial, or archive piece you are searching for is
        unavailable or has been retired from this season&apos;s collection.
      </p>

      {/* Call to Actions */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-xs font-semibold tracking-widest text-on-primary uppercase shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-8 text-xs font-semibold tracking-widest text-on-surface uppercase transition-all hover:border-outline hover:bg-surface-container-low"
        >
          Explore Collection
        </Link>
      </div>

      {/* Decorative Brand Mark */}
      <div className="mt-20 text-[10px] font-bold tracking-[0.3em] text-outline uppercase">
        THE CURATOR &bull; ARCHIVAL EDITORIAL
      </div>
    </div>
  );
}
