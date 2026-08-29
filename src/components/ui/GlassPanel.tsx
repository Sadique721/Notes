"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "light" | "heavy" | "vision";
  hoverEffect?: boolean;
  accentColor?: string;
}

export function GlassPanel({
  children,
  variant = "vision",
  hoverEffect = false,
  accentColor,
  className,
  ...props
}: GlassPanelProps) {
  const accent = accentColor || "#22d3ee";

  const styles: React.CSSProperties =
    variant === "heavy"
      ? {
          background: "linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(4,8,20,0.92) 100%)",
          border: "1px solid rgba(251,191,36,0.18)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(251,191,36,0.08)",
        }
      : variant === "light"
      ? {
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${accent}14`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }
      : {
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(4,8,20,0.9) 100%)",
          border: `1px solid ${accent}1A`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.05)`,
          backdropFilter: "blur(16px) saturate(160%)",
        };

  if (hoverEffect) {
    return (
      <motion.div
        whileHover={{ scale: 1.012, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={cn("rounded-2xl p-6 transition-shadow duration-300", className)}
        style={styles}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn("rounded-2xl p-6", className)}
      style={styles}
      {...props}
    >
      {children}
    </div>
  );
}
