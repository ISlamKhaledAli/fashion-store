"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const beadRef = useRef<HTMLDivElement | null>(null);

  const progressRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingRef = useRef(false);

  const clearAllTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (guardTimerRef.current) clearTimeout(guardTimerRef.current);
    timerRef.current = null;
    fadeTimerRef.current = null;
    guardTimerRef.current = null;
  };

  const updateDom = (percent: number, opacity: number, display: string) => {
    if (!containerRef.current || !barRef.current || !beadRef.current) return;
    containerRef.current.style.display = display;
    containerRef.current.style.opacity = String(opacity);
    barRef.current.style.width = `${percent}%`;
    beadRef.current.style.left = `${percent}%`;
  };

  const startProgress = () => {
    clearAllTimers();
    isNavigatingRef.current = true;
    progressRef.current = 15;

    // Instant DOM display with zero React setState
    updateDom(15, 1, "block");

    timerRef.current = setInterval(() => {
      let next = progressRef.current;
      if (next < 50) next += 12;
      else if (next < 75) next += 5;
      else if (next < 90) next += 1.5;

      progressRef.current = next;
      if (barRef.current && beadRef.current) {
        barRef.current.style.width = `${next}%`;
        beadRef.current.style.left = `${next}%`;
      }
    }, 120);

    // Guard against hanging transitions (10 seconds timeout)
    guardTimerRef.current = setTimeout(() => {
      completeProgress();
    }, 10000);
  };

  const completeProgress = () => {
    if (!isNavigatingRef.current) return;
    isNavigatingRef.current = false;
    clearAllTimers();

    // Snap to 100%
    if (barRef.current && beadRef.current) {
      barRef.current.style.width = "100%";
      beadRef.current.style.left = "100%";
    }

    // Smoothly fade out and hide
    fadeTimerRef.current = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
      }
      fadeTimerRef.current = setTimeout(() => {
        updateDom(0, 0, "none");
        progressRef.current = 0;
      }, 250);
    }, 120);
  };

  // Complete progress when pathname or searchParams changes
  useEffect(() => {
    if (isNavigatingRef.current) {
      completeProgress();
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Primary button only, no modifiers
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a");

      if (!anchor || !anchor.href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.origin !== currentUrl.origin) return;

        // Ignore same-page hash transitions
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          if (targetUrl.hash !== currentUrl.hash) return;
          return;
        }

        // Defer start slightly out of event execution context
        window.requestAnimationFrame(() => {
          startProgress();
        });
      } catch {
        // Invalid URL, ignore
      }
    };

    const handlePopState = () => {
      window.requestAnimationFrame(() => {
        startProgress();
      });
    };

    // Safely intercept pushState & replaceState outside of React insertion effects
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      const url = args[2];
      if (url && typeof url === "string") {
        const nextPath = url.split("?")[0].split("#")[0];
        const currentPath = window.location.pathname;
        if (nextPath !== currentPath) {
          // Wrap in setTimeout to escape React internal hook execution callstack
          setTimeout(() => {
            startProgress();
          }, 0);
        }
      }
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      const url = args[2];
      if (url && typeof url === "string") {
        const nextPath = url.split("?")[0].split("#")[0];
        const currentPath = window.location.pathname;
        if (nextPath !== currentPath) {
          // Wrap in setTimeout to escape React internal hook execution callstack
          setTimeout(() => {
            startProgress();
          }, 0);
        }
      }
      return originalReplaceState.apply(this, args);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearAllTimers();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-[99999] h-[2.5px] transition-opacity duration-200"
      style={{ display: "none", opacity: 0 }}
    >
      {/* Background track */}
      <div className="relative h-full w-full bg-surface-container/20">
        {/* Active progress bar - Quiet Luxury Obsidian & Graphite */}
        <div
          ref={barRef}
          className="cinematic-ease h-full bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600 shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out"
          style={{ width: "0%" }}
        />
        {/* Subtle platinum-sheen glow bead at leading edge */}
        <div
          ref={beadRef}
          className="absolute top-1/2 h-2.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400 opacity-60 blur-[2px] transition-all duration-200 ease-out"
          style={{ left: "0%" }}
        />
      </div>
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}

export default TopProgressBar;
