"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ChevronRight, Hash, Compass, Cpu, Briefcase, Award, Zap, Code, Shield } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface MindMapProps {
  accentColor: string;
  onSelectField: (field: string) => void;
}

const CATEGORIES = [
  {
    name: "Definition & History",
    icon: Compass,
    fields: [
      "1. Introduction",
      "2. Meaning of every word",
      "3. Definition",
      "4. History",
      "5. Why it was introduced",
      "6. Previous technology/problem",
      "7. Limitations of previous technology",
      "8. How this technology solved those problems",
    ],
  },
  {
    name: "Architecture & Lifecycles",
    icon: Cpu,
    fields: [
      "9. Internal working (step by step)",
      "10. Complete architecture",
      "11. Complete flow",
      "12. Every component explanation",
      "13. Every keyword explanation",
      "14. How every keyword is related to every other keyword",
    ],
  },
  {
    name: "Production & Use Cases",
    icon: Briefcase,
    fields: [
      "15. Why this concept is important",
      "16. Where it is used",
      "17. When it should be used",
      "18. When it should NOT be used",
      "19. Advantages",
      "20. Disadvantages",
      "21. Real-world analogy",
      "22. Real-time enterprise example",
    ],
  },
  {
    name: "Enterprise & Domain Examples",
    icon: Award,
    fields: [
      "23. FAANG company example",
      "24. Banking example",
      "25. E-commerce example",
      "26. Healthcare example",
      "27. Telecom example",
      "28. Cloud example",
    ],
  },
  {
    name: "FAANG Interview Zone",
    icon: Zap,
    fields: [
      "29. Interview explanation (5 Crore package level)",
      "30. Internal interview follow-up questions",
      "31. Common mistakes",
      "32. Best practices",
      "33. Performance considerations",
      "34. Security considerations",
      "35. Production considerations",
      "36. Architecture interview discussion",
    ],
  },
  {
    name: "System Design & LLD/HLD",
    icon: Code,
    fields: [
      "37. Low Level Design relation",
      "38. High Level Design relation",
      "39. System Design relation",
      "40. Java relation",
      "41. JVM relation",
      "42. Spring relation",
      "43. Spring Boot relation",
      "44. Microservices relation",
      "45. Database relation",
      "46. Docker relation",
      "47. Kubernetes relation",
      "48. Kafka relation",
      "49. API Gateway relation",
      "50. Eureka relation",
      "51. Configuration Server relation",
      "52. Load Balancer relation",
      "53. Monitoring relation",
      "54. Logging relation",
      "55. Distributed Tracing relation",
    ],
  },
  {
    name: "Advanced Practice & Review",
    icon: Shield,
    fields: [
      "56. Future scope",
      "57. Current industry usage",
      "58. Latest improvements",
      "59. Interview tips",
      "60. Tricky interview questions",
      "61. Scenario-based questions",
      "62. Coding interview discussion (where applicable)",
      "63. Production debugging",
      "64. Common interview pitfalls",
      "65. Summary",
      "66. English Interview Questions & Answers (Numbered 1, 2, 3, ...)",
      "67. Advanced Interview Questions",
      "68. HR + Technical discussion points",
      "69. Complete revision notes",
    ],
  },
];

export function TopicMindMap({ accentColor, onSelectField }: MindMapProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  return (
    <GlassPanel className="p-5 border-white/5 bg-black/20 space-y-4">
      <div className="flex items-center gap-2">
        <Network className="w-4 h-4 text-emerald-400" />
        <h3 className="font-display font-semibold text-xs text-white/80">Interactive 69-Point Mind Map</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const isActive = activeCategory === idx;

          return (
            <div key={idx} className="relative">
              <button
                onClick={() => setActiveCategory(isActive ? null : idx)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 text-left text-xs font-medium text-white/80 transition-all cursor-pointer"
                style={isActive ? { borderColor: `${accentColor}40`, background: `${accentColor}08` } : {}}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }} />
                  <span className="truncate pr-1">{cat.name}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-white/30 transition-transform flex-shrink-0 ${isActive ? "rotate-90" : ""}`} />
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="absolute top-full left-0 mt-1.5 z-20 w-full rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl p-2 space-y-1 max-h-[220px] overflow-y-auto"
                  >
                    {cat.fields.map((field) => (
                      <button
                        key={field}
                        onClick={() => {
                          setActiveCategory(null);
                          onSelectField(field);
                        }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-white/5 text-[10px] text-white/60 hover:text-white transition-all flex items-start gap-1.5 cursor-pointer font-mono"
                      >
                        <Hash className="w-3 h-3 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                        <span>{field}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
