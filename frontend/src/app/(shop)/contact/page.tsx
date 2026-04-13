import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PlaceholderPage() {
  return (
    <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4 capitalize">contact</h1>
      <p className="text-on-surface-variant mb-8">This section is currently being curated. Coming soon.</p>
      <Link href="/">
        <Button variant="outline">Return Home</Button>
      </Link>
    </main>
  );
}
