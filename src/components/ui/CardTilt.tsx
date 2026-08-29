"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/utils/cn";

interface CardTiltProps {
  children: React.ReactNode;
  className?: string;
  maxRotate?: number;
}

export function CardTilt({ children, className, maxRotate = 15 }: CardTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [0, 1], [maxRotate, -maxRotate]);
  const rotateY = useTransform(springX, [0, 1], [-maxRotate, maxRotate]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("perspective-1000", className)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full transition-shadow duration-300"
      >
        <div style={{ transform: "translateZ(30px)" }} className="w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
