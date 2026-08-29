'use client';

import React, { useState, useEffect } from 'react';

interface TopicInfographicOverlayProps {
  slug: string;
}

export default function TopicInfographicOverlay({ slug }: TopicInfographicOverlayProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (slug === 'hashmap-internals') {
    const steps = [
      {
        title: 'Step 1: Calculate Hash',
        desc: 'Key "UserA" is processed: hashCode("UserA") = 208323. Index = 208323 & (16-1) = Bucket 3.',
        highlight: 'hash'
      },
      {
        title: 'Step 2: Check Bucket',
        desc: 'Checking Node array at index 3. Currently empty, inserting new EntryNode("UserA", 95).',
        highlight: 'bucket'
      },
      {
        title: 'Step 3: Hash Collision',
        desc: 'Inserting "UserB" -> hashes to Bucket 3 too! Resolving collision via Linked List link.',
        highlight: 'collision'
      },
      {
        title: 'Step 4: Treeify Threshold',
        desc: 'If linked list length exceeds 8, Bucket 3 converts from Linked List to Red-Black Tree.',
        highlight: 'treeify'
      }
    ];

    return (
      <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono select-none">
        {/* Top Header Labels */}
        <div className="flex justify-between items-start gap-4">
          <div className="bg-black/80 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-500/5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5" />
            HASHMAP INTERNALS INFOGRAPHIC
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-black/80 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg px-2.5 py-1 text-[10px] backdrop-blur-md cursor-pointer transition-all"
          >
            {isPlaying ? '⏸ Pause Simulation' : '▶ Play Simulation'}
          </button>
        </div>

        {/* Dynamic Interactive Flow Overlay */}
        <div className="relative flex-1 w-full flex items-center justify-between pointer-events-none my-2">
          {/* Hash Function Node */}
          <div className={`absolute left-[10%] top-[40%] bg-black/90 border rounded-lg p-2 text-center transition-all duration-500 ${step === 0 ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,227,155,0.4)] scale-105' : 'border-white/10 opacity-70'}`}>
            <div className="text-[10px] text-white/50">Input: "UserA"</div>
            <div className="text-xs text-emerald-400 font-bold">hash(Key)</div>
            <div className="text-[9px] text-white/40">index = hash & (n-1)</div>
          </div>

          {/* Node Array Grid */}
          <div className={`absolute left-[45%] top-[15%] flex flex-col gap-1 transition-all duration-500 ${step === 1 ? 'scale-105' : 'opacity-80'}`}>
            {[0, 1, 2, 3, 4].map(idx => (
              <div 
                key={idx} 
                className={`w-12 h-6 border rounded flex items-center justify-center text-[9px] transition-all ${idx === 3 && step >= 1 ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,227,155,0.3)]' : 'border-white/10 bg-black/60 text-white/40'}`}
              >
                Bucket {idx}
              </div>
            ))}
          </div>

          {/* Linked List / Red-Black Tree Chain */}
          {step >= 2 && (
            <div className="absolute left-[65%] top-[45%] flex items-center gap-3 animate-fade-in">
              <svg className="w-8 h-4 text-emerald-400/80" fill="none" viewBox="0 0 32 16">
                <path d="M0 8h24M16 4l8 4-8 4" stroke="currentColor" strokeWidth="2" strokeDasharray="3" className="animate-scan" />
              </svg>
              <div className={`bg-black/95 border p-1.5 rounded text-[9px] transition-all duration-500 ${step === 2 ? 'border-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.4)] text-fuchsia-300' : 'border-emerald-500/20 text-emerald-300'}`}>
                Node: "UserB" (Collided)
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="absolute right-[5%] top-[10%] bg-black/95 border border-amber-400/50 p-2 rounded-lg max-w-[120px] text-center animate-pulse">
              <div className="text-[9px] text-amber-400 font-bold">🚨 Treeify Node</div>
              <div className="text-[8px] text-white/60">Converting bucket to Red-Black Tree (O(log N))</div>
            </div>
          )}
        </div>

        {/* Bottom Console Logger */}
        <div className="bg-black/90 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-between mb-1">
            <span>CONSOLE SIMULATOR</span>
            <span className="text-[9px] text-white/30">Step {step + 1} of 4</span>
          </div>
          <div className="text-xs text-white/95 font-semibold transition-all duration-300">
            {steps[step].title}
          </div>
          <div className="text-[11px] text-white/70 mt-1 leading-relaxed transition-all duration-300">
            {steps[step].desc}
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'exception-handling') {
    const steps = [
      {
        title: '1. Uncaught Exception',
        desc: 'Method stack error occurs inside dbQuery(). Exception object is thrown back up the stack.',
        highlight: 'throw'
      },
      {
        title: '2. Try Block Intercept',
        desc: 'Exception travels back to calling method handleRequest() which wraps the call inside a try block.',
        highlight: 'try'
      },
      {
        title: '3. Match Catch Handler',
        desc: 'JVM compares exception type to catch definitions. Found match: Catch(SQLException).',
        highlight: 'catch'
      },
      {
        title: '4. Graceful Recovery',
        desc: 'Catch block processes error, prints clean logs, and returns fallback response. App remains alive!',
        highlight: 'finally'
      }
    ];

    return (
      <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono select-none">
        <div className="flex justify-between items-start gap-4">
          <div className="bg-black/80 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-[11px] text-cyan-400 backdrop-blur-md">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-ping mr-1.5" />
            EXCEPTION RUNTIME FIREWALL
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-black/80 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg px-2.5 py-1 text-[10px] backdrop-blur-md cursor-pointer transition-all"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        {/* Dynamic Stack visualization */}
        <div className="relative flex-1 w-full flex items-center justify-center pointer-events-none my-2">
          <div className="flex flex-col gap-1 w-44">
            <div className={`border p-2 rounded text-center text-[10px] transition-all duration-500 ${step === 0 ? 'border-red-400 bg-red-950/40 text-red-300 shadow-[0_0_15px_rgba(248,113,113,0.4)]' : 'border-white/10 bg-black/60 text-white/40'}`}>
              dbQuery() [Exception Thrown ❌]
            </div>
            <div className={`border p-2 rounded text-center text-[10px] transition-all duration-500 ${step === 1 ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]' : 'border-white/10 bg-black/60 text-white/40'}`}>
              handleRequest() [Try Block 🛡]
            </div>
            <div className={`border p-2 rounded text-center text-[10px] transition-all duration-500 ${step === 2 || step === 3 ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,227,155,0.3)]' : 'border-white/10 bg-black/60 text-white/40'}`}>
              Controller [Catch Block ✅]
            </div>
          </div>
        </div>

        <div className="bg-black/90 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <div className="text-[10px] text-cyan-400 font-bold flex items-center justify-between mb-1">
            <span>EXCEPTION FLOW STATUS</span>
            <span className="text-[9px] text-white/30">Step {step + 1} of 4</span>
          </div>
          <div className="text-xs text-white/95 font-semibold">{steps[step].title}</div>
          <div className="text-[11px] text-white/70 mt-1 leading-relaxed">{steps[step].desc}</div>
        </div>
      </div>
    );
  }

  if (slug === 'oop-principles') {
    const cards = [
      { title: '1. Encapsulation', desc: 'Hiding object internal data state behind getter/setter gates (Data Protection).' },
      { title: '2. Abstraction', desc: 'Hiding code implementation complexity, showing only essential interface signatures.' },
      { title: '3. Inheritance', desc: 'Extending code functionality and field templates from parent classes to child classes.' },
      { title: '4. Polymorphism', desc: 'Allowing unified interfaces to support multiple custom runtime behaviors.' }
    ];

    return (
      <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono select-none">
        <div className="bg-black/80 border border-blue-500/30 rounded-lg px-2.5 py-1 text-[11px] text-blue-400 backdrop-blur-md self-start">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping mr-1.5" />
          OOP 4 PILLARS EXPLANATION
        </div>

        <div className="grid grid-cols-2 gap-2 my-2 flex-1 items-center pointer-events-none">
          {cards.map((c, idx) => (
            <div 
              key={idx} 
              className={`border p-2 rounded-xl bg-black/80 backdrop-blur-sm transition-all duration-500 flex flex-col justify-center h-16 ${step === idx ? 'border-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.3)] scale-[1.02]' : 'border-white/5 opacity-60'}`}
            >
              <div className="text-[10px] text-blue-400 font-bold">{c.title}</div>
              <div className="text-[8px] text-white/70 leading-normal mt-0.5">{step === idx ? c.desc : 'Pillar Active'}</div>
            </div>
          ))}
        </div>

        <div className="bg-black/90 border border-white/10 rounded-xl p-2.5 backdrop-blur-md text-[10px] text-white/60 text-center">
          Simulation displays the core definitions of structural OOP architecture.
        </div>
      </div>
    );
  }

  if (slug === 'generics') {
    return (
      <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono select-none">
        <div className="bg-black/80 border border-fuchsia-500/30 rounded-lg px-2.5 py-1 text-[11px] text-fuchsia-400 backdrop-blur-md self-start">
          <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-500 animate-ping mr-1.5" />
          GENERICS TYPE FUNNEL
        </div>

        {/* Funnel animation */}
        <div className="relative flex-1 w-full flex items-center justify-between pointer-events-none my-2">
          <div className="absolute left-[5%] top-[30%] bg-black/90 border border-white/10 p-1.5 rounded text-[9px] text-white/50">
            <div>Input: Object</div>
            <div className="text-[8px] text-red-400">May cause ClassCastException</div>
          </div>

          <div className="absolute left-[40%] top-[25%] bg-black/95 border border-fuchsia-400 p-2.5 rounded-xl text-center shadow-[0_0_15px_rgba(232,121,249,0.3)]">
            <div className="text-[10px] text-fuchsia-300 font-bold">Funnel: Class&lt;T&gt;</div>
            <div className="text-[8px] text-white/50">Compile-time Verification</div>
          </div>

          <div className="absolute right-[5%] top-[10%] flex flex-col gap-1">
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-1 rounded text-[8px] text-emerald-300">
              List&lt;String&gt;: Only strings
            </div>
            <div className="bg-blue-950/40 border border-blue-500/30 p-1 rounded text-[8px] text-blue-300">
              List&lt;Integer&gt;: Only integers
            </div>
          </div>
        </div>

        <div className="bg-black/90 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <div className="text-[10px] text-fuchsia-400 font-bold mb-1">TYPE SAFETY GUARANTEE</div>
          <div className="text-[11px] text-white/70 leading-relaxed">
            Generics acts as a type filter funnel. It forces compile-time type verification so that type mismatches are caught before execution, eliminating runtime casting crashes.
          </div>
        </div>
      </div>
    );
  }

  if (slug === 'jvm-architecture') {
    const steps = [
      {
        title: 'Step 1: Allocation in Eden',
        desc: 'New objects are instantiated in the Young Gen Eden space (Fast thread-local allocation via TLAB).',
        highlight: 'eden'
      },
      {
        title: 'Step 2: Minor GC & Copy to S0',
        desc: 'Eden space fills up. Minor GC triggers. Live objects are swept and copied into Survivor Space 0 (S0).',
        highlight: 's0'
      },
      {
        title: 'Step 3: Survivor Aging (S0 ⇄ S1)',
        desc: 'Subsequent Minor GCs copy survivors between S0 and S1, incrementing object age tags.',
        highlight: 's1'
      },
      {
        title: 'Step 4: Promotion to Tenured',
        desc: 'Objects reaching the age threshold (tenuring threshold, default 15) promote to the Tenured (Old) space.',
        highlight: 'tenured'
      }
    ];

    return (
      <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono select-none">
        <div className="flex justify-between items-start gap-4">
          <div className="bg-black/80 border border-purple-500/30 rounded-lg px-2.5 py-1 text-[11px] text-purple-400 backdrop-blur-md">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-ping mr-1.5" />
            JVM HEAP MEMORY LIFE CYCLE
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-black/80 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg px-2.5 py-1 text-[10px] backdrop-blur-md cursor-pointer transition-all"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        {/* Heap Spaces visualization */}
        <div className="relative flex-1 w-full flex items-center justify-center pointer-events-none my-2">
          <div className="grid grid-cols-4 gap-3 w-full max-w-md">
            {/* Eden */}
            <div className={`border p-2.5 rounded-xl text-center text-[10px] flex flex-col justify-center h-20 transition-all duration-500 ${step === 0 ? 'border-purple-400 bg-purple-950/40 text-purple-300 shadow-[0_0_15px_rgba(167,139,250,0.4)] scale-105' : 'border-white/10 bg-black/60 text-white/40'}`}>
              <span className="font-bold text-xs">Eden</span>
              <span className="text-[8px] mt-1 text-white/50">{step === 0 ? 'Allocating [●●●]' : 'Empty'}</span>
            </div>
            {/* S0 */}
            <div className={`border p-2.5 rounded-xl text-center text-[10px] flex flex-col justify-center h-20 transition-all duration-500 ${step === 1 ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-105' : 'border-white/10 bg-black/60 text-white/40'}`}>
              <span className="font-bold text-xs">S0</span>
              <span className="text-[8px] mt-1 text-white/50">{step === 1 ? 'Copying [●]' : 'Idle'}</span>
            </div>
            {/* S1 */}
            <div className={`border p-2.5 rounded-xl text-center text-[10px] flex flex-col justify-center h-20 transition-all duration-500 ${step === 2 ? 'border-blue-400 bg-blue-950/40 text-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.3)] scale-105' : 'border-white/10 bg-black/60 text-white/40'}`}>
              <span className="font-bold text-xs">S1</span>
              <span className="text-[8px] mt-1 text-white/50">{step === 2 ? 'Aging [●]' : 'Idle'}</span>
            </div>
            {/* Tenured */}
            <div className={`border p-2.5 rounded-xl text-center text-[10px] flex flex-col justify-center h-20 transition-all duration-500 ${step === 3 ? 'border-amber-400 bg-amber-950/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] scale-105' : 'border-white/10 bg-black/60 text-white/40'}`}>
              <span className="font-bold text-xs">Tenured</span>
              <span className="text-[8px] mt-1 text-white/50">{step === 3 ? 'Promoted [●●●]' : 'Resident'}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/90 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <div className="text-[10px] text-purple-400 font-bold flex items-center justify-between mb-1">
            <span>JVM HEAP LOGS</span>
            <span className="text-[9px] text-white/30">Step {step + 1} of 4</span>
          </div>
          <div className="text-xs text-white/95 font-semibold">{steps[step].title}</div>
          <div className="text-[11px] text-white/70 mt-1 leading-relaxed">{steps[step].desc}</div>
        </div>
      </div>
    );
  }

  // Default fallback overlay (generic instructions overlay)
  return (
    <div className="absolute inset-0 bg-black/10 flex flex-col justify-between p-4 pointer-events-none font-mono">
      <div className="bg-black/80 border border-white/10 rounded px-2.5 py-1 text-[10px] text-white/60 backdrop-blur-md self-start">
        SYS DIAGRAM // {slug.toUpperCase().replace(/-/g, ' ')}
      </div>
      <div className="bg-black/90 border border-white/10 rounded-lg p-2 backdrop-blur-md max-w-[80%] self-end">
        <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          SYSTEM LIVE
        </div>
      </div>
    </div>
  );
}
