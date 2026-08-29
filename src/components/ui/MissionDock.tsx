"use client";

import React from "react";
import Link from "next/link";
import { Search, Trophy, Compass, Award, User } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePathname } from "next/navigation";

export function MissionDock() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Galaxy Map", icon: Compass, href: "/" },
    { label: "Search", icon: Search, href: "/search" },
    { label: "Interview Vault", icon: Trophy, href: "/interview-vault" },
    { label: "Glossary", icon: Award, href: "/glossary" },
    { label: "Progress", icon: User, href: "/progress" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-6 py-3 rounded-full glass-vision border-white/10 bg-black/40 shadow-glass-heavy">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={idx}
              href={item.href}
              className={cn(
                "relative p-2.5 rounded-full text-white/60 hover:text-white transition-all duration-300 group cursor-pointer",
                isActive && "text-emerald-400 bg-white/5"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow-sm" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
