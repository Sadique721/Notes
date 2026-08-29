"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { MissionDock } from "@/components/ui/MissionDock";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Grid, Layers, Compass, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModulesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "graph">("graph");

  const modules = [
    { slug: "dashboard", title: "Dashboard Stats & Charts", desc: "Interactive widgets, margins tracker, active service monitors.", color: "#10E39B" },
    { slug: "api-providers", title: "API Provider Integrations", desc: "Dhru Web Host API connections, automated order routing.", color: "#22D3EE" },
    { slug: "services", title: "IMEI & Unlock Services", desc: "Samsung KG Unlock, Xiaomi Bootloader, Oppo/Realme IMEI Repair.", color: "#38BDF8" },
    { slug: "inventory", title: "Digital Goods Inventory", desc: "Key activations, low stock alerts, server license codes.", color: "#A78BFA" },
    { slug: "orders", title: "Orders & Transaction Logs", desc: "Queue processing lifecycles, reference generators.", color: "#FBBF24" },
    { slug: "users", title: "Client Account Tiers", desc: "Credit limit management, access groups, user profiles.", color: "#E879F9" },
    { slug: "message", title: "Support Notifications", desc: "Support ticketing alerts, WhatsApp broadcast template logs.", color: "#FB7185" },
    { slug: "payments", title: "Payments & Credits Funding", desc: "Online gateway bindings, manual fund ledger audit routes.", color: "#A3E635" },
    { slug: "invoices", title: "Billing & Invoices compliance", desc: "PDF billing layouts, credit memo adjustments, tax tables.", color: "#FB923C" },
    { slug: "currency", title: "Currency FX Conversions", desc: "Dynamic conversion parameters (USD/INR), profit margin setups.", color: "#60A5FA" },
  ];

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-hidden px-6 pb-28 flex flex-col items-center" style={{ paddingTop: "9.5rem" }}>
      <FloatingParticles />
      <NavBar />

      <div className="w-full max-w-6xl space-y-8 z-10">
        {/* Top Header Selector Controls */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Constellation</h1>
            <p className="text-sm text-white/50">Explore the 10 core modules of the Unlocking Platform framework.</p>
          </div>
          {/* Toggle buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white/10 text-emerald-400" : "text-white/60 hover:text-white"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "graph" ? "bg-white/10 text-emerald-400" : "text-white/60 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Layout Renderer */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {modules.map((m) => (
                <Link key={m.slug} href={`/modules/${m.slug}`} className="block group cursor-pointer">
                  <GlassPanel
                    hoverEffect
                    className="h-full border-white/5 hover:border-white/12 transition-all relative flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="w-2.5 h-2.5 rounded-full shadow-glow-sm" style={{ backgroundColor: m.color }} />
                      <h3 className="font-display font-bold text-lg leading-snug group-hover:text-emerald-400 transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-sm text-white/65 leading-relaxed">{m.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-emerald-400 transition-colors pt-6 self-start">
                      <span>Launch module</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </GlassPanel>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="graph"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-[500px] rounded-2xl glass-vision border-white/10 bg-black/40 flex items-center justify-center relative overflow-hidden"
            >
              {/* Render connected tree graph representation of modules */}
              <div className="absolute inset-0 bg-aurora-2 opacity-5 pointer-events-none" />
              <div className="flex flex-col items-center gap-16 relative z-10">
                {/* Center Root node */}
                <div className="px-6 py-2.5 rounded-full glass border-emerald-500/30 text-emerald-400 font-display font-semibold text-sm shadow-glow-sm flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>Curriculum Core</span>
                </div>

                {/* Sub branches list */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                  {modules.map((m, idx) => (
                    <motion.div
                      key={m.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link href={`/modules/${m.slug}`} className="block text-center cursor-pointer group">
                        <div
                          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border border-white/10 bg-black/50 group-hover:border-white/20 transition-colors shadow-lg relative"
                          style={{ borderColor: `${m.color}25` }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        </div>
                        <h4 className="font-display font-bold text-xs mt-3 text-white/70 group-hover:text-white transition-colors">
                          {m.title.split(" ")[0]}
                        </h4>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Connecting lines drawing overlay background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <path d="M 576 210 L 100 310" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                <path d="M 576 210 L 300 310" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                <path d="M 576 210 L 500 310" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                <path d="M 576 210 L 700 310" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                <path d="M 576 210 L 900 310" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MissionDock />
    </main>
  );
}
