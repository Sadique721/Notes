"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/utils/cn";

interface MagnetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagnetButton({
  children,
  className,
  strength = 30,
  ...props
}: MagnetButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const moveX = (clientX - centerX) / (width / 2) * strength;
    const moveY = (clientY - centerY) / (height / 2) * strength;

    x.set(moveX);
    y.set(moveY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <button
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative inline-flex items-center justify-center p-0.5 rounded-xl font-display overflow-hidden transition-all duration-300 active:scale-95 group focus:outline-none cursor-pointer",
        className
      )}
      {...props}
    >
      <motion.div
        style={{ x: springX, y: springY }}
        className="w-full h-full relative z-10 flex items-center justify-center"
      >
        {children}
      </motion.div>
      {/* Aurora glow effect background */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
    </button>
  );
}
