"use client";

import React, { useRef } from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { SPRING_SNAPPY } from "@/utils/motionTimeline";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  glowColor?: string; // e.g. "var(--spring)"
  magnetic?: boolean;
}

export function GlowButton({
  children,
  glowColor,
  magnetic = true,
  className,
  ...props
}: GlowButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Magnetic translate effect (slight translate)
    buttonRef.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = `translate(0px, 0px)`;
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING_SNAPPY}
      className={cn(
        "relative px-6 py-2.5 rounded-xl font-display font-medium text-sm text-white",
        "bg-white/5 border border-white/10 backdrop-blur-md shadow-glass",
        "hover:bg-white/10 hover:border-white/20 transition-all duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        className
      )}
      style={{
        // Override glow color
        ["--glow-color" as any]: glowColor,
      } as React.CSSProperties}
      {...(props as any)}
    >
      <span className="relative z-10">{children}</span>
      {/* Glow shadow layer */}
      <span className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 glow-sm pointer-events-none" />
    </motion.button>
  );
}
