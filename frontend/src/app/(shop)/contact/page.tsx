import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[1440px] flex-col items-center justify-center px-8 pt-32 pb-24 text-center">
      <h1 className="mb-4 text-4xl font-medium tracking-tighter capitalize md:text-5xl">
        contact
      </h1>
      <p className="mb-8 text-on-surface-variant">
        This section is currently being curated. Coming soon.
      </p>
      <Link href="/">
        <Button variant="outline">Return Home</Button>
      </Link>
    </main>
  );
}
