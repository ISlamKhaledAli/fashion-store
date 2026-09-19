"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Fatal Global Application Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9fb] px-6 text-center font-sans text-[#1a1c1d]">
        <div className="max-w-md space-y-6">
          <div className="inline-block rounded-full bg-red-100 px-4 py-1 text-xs font-semibold tracking-widest text-red-700 uppercase">
            System Error
          </div>
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
            Critical App Disruption
          </h1>
          <p className="text-sm text-[#46464a]">
            An unrecoverable system exception occurred. Please try reloading the
            application.
          </p>
          <div>
            <button
              onClick={() => reset()}
              className="rounded-lg bg-[#030304] px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase transition hover:bg-neutral-800"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
