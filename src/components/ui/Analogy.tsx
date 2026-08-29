"use client";

import React from "react";
import { Coffee, ShieldAlert, Library, Landmark, HelpCircle, Activity } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface AnalogyProps {
  title: string;
  theme?: "restaurant" | "hospital" | "airport" | "library" | "bank" | "chef" | "traffic" | "default";
  children: React.ReactNode;
}

export function Analogy({ title, theme = "default", children }: AnalogyProps) {
  const getIcon = () => {
    switch (theme) {
      case "restaurant":
      case "chef":
        return <Coffee className="w-5 h-5 text-emerald-400" />;
      case "hospital":
        return <Activity className="w-5 h-5 text-rose-400" />;
      case "library":
        return <Library className="w-5 h-5 text-cyan-400" />;
      case "bank":
        return <Landmark className="w-5 h-5 text-amber-400" />;
      case "traffic":
        return <ShieldAlert className="w-5 h-5 text-orange-400" />;
      default:
        return <HelpCircle className="w-5 h-5 text-purple-400" />;
    }
  };

  const themeColors: Record<NonNullable<AnalogyProps["theme"]>, string> = {
    restaurant: "border-emerald-500/20 bg-emerald-500/5",
    chef: "border-emerald-500/20 bg-emerald-500/5",
    hospital: "border-rose-500/20 bg-rose-500/5",
    library: "border-cyan-500/20 bg-cyan-500/5",
    bank: "border-amber-500/20 bg-amber-500/5",
    traffic: "border-orange-500/20 bg-orange-500/5",
    airport: "border-purple-500/20 bg-purple-500/5",
    default: "border-purple-500/20 bg-purple-500/5",
  };

  return (
    <GlassPanel
      variant="light"
      className={`my-6 relative overflow-hidden ${themeColors[theme] || themeColors.default}`}
    >
      <div className="flex gap-4">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 h-fit self-start animate-float-slow">
          {getIcon()}
        </div>
        <div>
          <h4 className="font-display font-semibold text-white text-base mb-1">
            Real-Life Analogy: {title}
          </h4>
          <div className="text-white/70 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </GlassPanel>
  );
}
