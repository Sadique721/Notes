"use client";

import React from "react";
import Link from "next/link";
import { Compass, Flame, Search, Menu, X } from "lucide-react";
import { useProgressStore, getLevel } from "@/components/providers/ProgressProvider";
import { motion } from "framer-motion";

export function NavBar() {
  const { xp, streak, sidebarOpen, toggleSidebar } = useProgressStore();
  const lvlInfo = getLevel(xp);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 flex-nowrap select-none"
      style={{
        height: "72px",
        background: "rgba(4, 8, 20, 0.92)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid rgba(34, 211, 238, 0.1)",
        boxShadow: "0 1px 0 rgba(34,211,238,0.04), 0 8px 32px rgba(0,0,0,0.4)",
      }}>

      {/* Brand & Menu Toggle */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl border cursor-pointer transition-all duration-300"
          title="Toggle Navigation Sidebar"
          style={{
            background: sidebarOpen ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.03)",
            borderColor: sidebarOpen ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.08)",
            color: sidebarOpen ? "#22d3ee" : "rgba(255,255,255,0.5)",
          }}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ background: "linear-gradient(135deg, rgba(16,227,155,0.2), rgba(34,211,238,0.1))", border: "1px solid rgba(34,211,238,0.25)", boxShadow: "0 0 12px rgba(34,211,238,0.15)" }}>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-display font-black text-white text-base md:text-lg tracking-wide">
            Injoy<span style={{ color: "#22d3ee" }}>&read</span>&play
          </span>
        </Link>
      </div>

      {/* Center search */}
      <Link
        href="/search"
        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-xs w-64 cursor-pointer flex-shrink-0 transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Search curriculum...</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          Ctrl+K
        </kbd>
      </Link>

      {/* Gamification */}
      <div className="flex items-center gap-4 md:gap-5 flex-shrink-0">
        {streak > 0 && (
          <div className="flex items-center gap-1.5" title={`${streak} day streak`}
            style={{ color: "#fb923c" }}>
            <Flame className="w-4 h-4 fill-orange-500/20" />
            <span className="font-display font-bold text-sm">{streak}d</span>
          </div>
        )}

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/50">XP: <strong className="text-white">{xp}</strong></span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg font-display font-bold text-xs"
              style={{ background: "rgba(16,227,155,0.1)", color: "#10e39b", border: "1px solid rgba(16,227,155,0.2)" }}>
              {lvlInfo.label}
            </span>
          </div>
          <div className="hidden md:block w-28 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lvlInfo.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #10e39b, #22d3ee)" }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

