"use client";

import React, { useState } from "react";
import { Copy, Check, Play } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface CodeBlockProps {
  code: string;
  language?: string;
  highlights?: number[];
  steps?: { line: number; text: string }[];
}

export function CodeBlock({
  code,
  language = "java",
  highlights = [],
  steps = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  const runSimulation = () => {
    if (steps.length === 0) return;
    let current = 0;
    setActiveStep(0);
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setActiveStep(current);
      } else {
        clearInterval(interval);
        setTimeout(() => setActiveStep(null), 3000);
      }
    }, 2000);
  };

  return (
    <GlassPanel variant="heavy" className="my-6 p-4 font-mono text-sm relative overflow-hidden bg-black/40 border-white/5">
      {/* Top bar controls */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3 text-white/50 text-xs">
        <span className="uppercase tracking-widest">{language} playground</span>
        <div className="flex items-center gap-3">
          {steps.length > 0 && (
            <button
              onClick={runSimulation}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div className="overflow-x-auto relative leading-relaxed max-h-96">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlights.includes(lineNum);
          const isSimulated = activeStep !== null && steps[activeStep]?.line === lineNum;

          return (
            <div
              key={idx}
              className={`flex items-center -mx-4 px-4 transition-all duration-300 ${
                isSimulated
                  ? "bg-emerald-500/15 border-l-2 border-emerald-400"
                  : isHighlighted
                  ? "bg-white/5 border-l-2 border-white/30"
                  : "border-l-2 border-transparent"
              }`}
            >
              <span className="w-8 text-white/20 text-xs select-none pr-3 text-right">{lineNum}</span>
              <pre className={`text-white/80 whitespace-pre ${isSimulated ? "text-white font-semibold" : ""}`}>
                {line}
              </pre>
            </div>
          );
        })}

        {/* Step Simulator Tooltip overlay */}
        {activeStep !== null && steps[activeStep] && (
          <div className="absolute right-4 bottom-4 glass-vision border-emerald-500/30 bg-emerald-950/80 p-3 rounded-lg max-w-xs shadow-glow-sm animate-slide-up text-xs">
            <div className="font-display font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              Step {activeStep + 1} of {steps.length}
            </div>
            <p className="text-white/80 leading-normal">{steps[activeStep].text}</p>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
