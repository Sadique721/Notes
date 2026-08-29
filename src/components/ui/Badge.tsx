"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "spring" | "spring-boot" | "annotations" | "microservices" | "collections" | "java8" | "multithreading" | "sql" | "jvm" | "core-java" | "default";
}

export function Badge({
  children,
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
    spring: "bg-module-spring/10 text-module-spring border-module-spring/30",
    "spring-boot": "bg-module-spring-boot/10 text-module-spring-boot border-module-spring-boot/30",
    annotations: "bg-module-annotations/10 text-module-annotations border-module-annotations/30",
    microservices: "bg-module-microservices/10 text-module-microservices border-module-microservices/30",
    collections: "bg-module-collections/10 text-module-collections border-module-collections/30",
    java8: "bg-module-java8/10 text-module-java8 border-module-java8/30",
    multithreading: "bg-module-multithreading/10 text-module-multithreading border-module-multithreading/30",
    sql: "bg-module-sql/10 text-module-sql border-module-sql/30",
    jvm: "bg-module-jvm/10 text-module-jvm border-module-jvm/30",
    "core-java": "bg-module-core-java/10 text-module-core-java border-module-core-java/30",
    default: "bg-white/5 text-white/70 border-white/10"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border backdrop-blur-xs",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
