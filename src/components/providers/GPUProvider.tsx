"use client";

/**
 * GPUProvider — Adaptive GPU / Performance-Tier Engine (GOD MODE v3 Layer 4)
 *
 * Detects device capability at runtime and provides a 4-tier animation mode
 * to all child components via React Context.
 *
 * Tiers:
 *   HIGH    — ≥8GB RAM, 60fps, WebGL2: Full particle/aurora + all GSAP loops
 *   MEDIUM  — 4-8GB, 30-60fps: Framer Motion only, reduced particles
 *   LOW     — <4GB or <30fps: CSS-only ambient, simplified graphs
 *   MINIMAL — prefers-reduced-motion OR user toggle: zero loops, full a11y
 */

import React, { createContext, useContext, useEffect, useState } from "react";

export type GPUTier = "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";

interface GPUContextValue {
  tier: GPUTier;
  isReady: boolean;
  forceMinimal: () => void;
  particlesEnabled: boolean;
  canvasEnabled: boolean;
  gsapEnabled: boolean;
  framerEnabled: boolean;
}

const GPUContext = createContext<GPUContextValue>({
  tier: "MEDIUM",
  isReady: false,
  forceMinimal: () => {},
  particlesEnabled: false,
  canvasEnabled: true,
  gsapEnabled: false,
  framerEnabled: true,
});

export function GPUProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<GPUTier>("MEDIUM");
  const [isReady, setIsReady] = useState(false);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    if (forced) return;

    async function detect() {
      // 1. Reduced motion — always MINIMAL if set
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        setTier("MINIMAL");
        setIsReady(true);
        return;
      }

      // 2. WebGL2 check
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      const hasWebGL2 = !!gl;

      // 3. RAM check
      const ram = (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory ?? 4;

      // 4. Battery check (where available)
      let lowBattery = false;
      try {
        const nav = navigator as Navigator & {
          getBattery?: () => Promise<{ level: number; charging: boolean }>;
        };
        if (nav.getBattery) {
          const battery = await nav.getBattery();
          lowBattery = battery.level < 0.2 && !battery.charging;
        }
      } catch {
        // Not available
      }

      // 5. FPS sample (quick 500ms test)
      const fps = await measureFPS();

      // Decision tree
      if (lowBattery || fps < 20 || ram < 2) {
        setTier("LOW");
      } else if (ram >= 8 && fps >= 55 && hasWebGL2) {
        setTier("HIGH");
      } else if (ram >= 4 && fps >= 30) {
        setTier("MEDIUM");
      } else {
        setTier("LOW");
      }

      setIsReady(true);
    }

    detect();
  }, [forced]);

  const forceMinimal = () => {
    setForced(true);
    setTier("MINIMAL");
  };

  const value: GPUContextValue = {
    tier,
    isReady,
    forceMinimal,
    particlesEnabled: tier === "HIGH" || tier === "MEDIUM",
    canvasEnabled: tier !== "MINIMAL",
    gsapEnabled: tier === "HIGH" || tier === "MEDIUM",
    framerEnabled: tier !== "LOW" && tier !== "MINIMAL",
  };

  return <GPUContext.Provider value={value}>{children}</GPUContext.Provider>;
}

export function useGPU() {
  return useContext(GPUContext);
}

/** Quick FPS measurement over ~500ms */
async function measureFPS(): Promise<number> {
  return new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();

    function frame() {
      frames++;
      if (performance.now() - start < 500) {
        requestAnimationFrame(frame);
      } else {
        resolve(frames * 2); // extrapolate to 1s
      }
    }

    requestAnimationFrame(frame);
  });
}
