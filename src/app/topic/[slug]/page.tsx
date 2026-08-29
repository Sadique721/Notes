"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BookOpen, Trophy, Award, CheckCircle, ChevronDown, ChevronRight,
  Bookmark, FileText, Plus, Trash2, Highlighter 
} from "lucide-react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { MissionDock } from "@/components/ui/MissionDock";
import { NavBar } from "@/components/layout/NavBar";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";
import { InterviewHook } from "@/components/ui/InterviewHook";
import { FiveCroreAnswer } from "@/components/ui/FiveCroreAnswer";
import { useProgressStore } from "@/components/providers/ProgressProvider";
import { TopicMindMap } from "@/components/ui/TopicMindMap";
import { AnimatedDiagram } from "@/components/ui/AnimatedDiagram";
import { QuizCard, QuizQuestion } from "@/components/ui/QuizCard";
import { DiagramSpec } from "@/types/content";
import TopicInfographicOverlay from "@/components/ui/TopicInfographicOverlay";
import { 
  getNotes, saveNote, deleteNote, 
  getHighlights, deleteHighlight, saveHighlight, UserNote, UserHighlight 
} from "@/utils/db";

const MODULE_COLORS: Record<string, string> = {
  "spring-framework-fundamentals": "#10E39B", "spring-boot": "#22D3EE",
  "spring-boot-annotations": "#38BDF8", "microservices": "#A78BFA",
  "java-collections": "#FBBF24", "java-8-17-21": "#E879F9",
  "multithreading-concurrency": "#FB7185", "sql-database": "#A3E635",
  "jvm-internals": "#FB923C", "core-java": "#60A5FA",
};

function QAAccordion({ qa, color }: { qa: any; color: string }) {
  const [open, setOpen] = useState(false);
  const { reviewedQANumbers, reviewQA } = useProgressStore();
  const isReviewed = reviewedQANumbers.includes(qa.number);

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-white/2 transition-colors"
        style={{ background: isReviewed ? `${color}08` : undefined }}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-bold" style={{ color }}>{qa.isFiveCrore ? "₹5Cr" : `Q${qa.number}`}</span>
          <span className="text-sm text-white/85 font-medium line-clamp-2">{qa.question}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-t border-white/5">
            <div className="p-4 space-y-3">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
              <button onClick={() => reviewQA(qa.number)}
                className={`text-[10px] font-mono font-bold uppercase tracking-wider border px-3 py-1 rounded-full transition-all cursor-pointer ${isReviewed ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" : "text-white/40 border-white/10 hover:text-white hover:border-white/20"}`}>
                {isReviewed ? "✓ Reviewed" : "Mark reviewed"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContentRenderer({ bodyMdx, slug, accentColor }: { bodyMdx: string; slug: string; accentColor: string }) {
  const lines = bodyMdx.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const elementKey = i;
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const altText = imgMatch[1];
      const imgUrl = imgMatch[2];
      
      let keywords: string[] = [];
      let hint = "";
      
      const kwMatch = altText.match(/Keywords:\s*(.*?)(?:\||$)/i);
      const hintMatch = altText.match(/Hint:\s*(.*?)(?:\||$)/i);
      
      if (kwMatch) {
        keywords = kwMatch[1].split(",").map(k => k.trim());
      }
      if (hintMatch) {
        hint = hintMatch[1].trim();
      }
      
      const caption = (!kwMatch && !hintMatch) ? altText : "";

      elements.push(
        <div key={elementKey} className="my-6 rounded-2xl overflow-hidden border bg-black/40 backdrop-blur-md shadow-2xl p-4 space-y-3 group hover:border-emerald-500/30 transition-all duration-300" style={{ borderColor: `${accentColor}20` }}>
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-white/5 border border-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imgUrl} 
              alt={altText} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute left-0 top-0 w-full h-[2px] bg-gradient-to-r from-transparent to-transparent shadow-[0_0_8px_rgba(16,227,155,0.8)] animate-scan pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,227,155,0.15),transparent)] mix-blend-color-dodge pointer-events-none animate-pulse-glow" style={{ backgroundImage: `radial-gradient(circle at 50% 120%, ${accentColor}25, transparent)` }} />
            
            {/* Interactive Animated Infographic Overlay */}
            <TopicInfographicOverlay slug={slug as string} />
          </div>
          {(keywords.length > 0 || hint || caption) && (
            <div className="space-y-2 px-1">
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw, idx) => (
                    <span key={idx} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border text-white/75" style={{ borderColor: `${accentColor}30`, color: accentColor, backgroundColor: `${accentColor}10` }}>
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
              {hint && (
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  <span className="font-semibold mr-1" style={{ color: accentColor }}>💡 Architecture Hint:</span>
                  {hint}
                </p>
              )}
              {caption && (
                <p className="text-xs text-white/50 italic text-center font-sans">
                  {caption}
                </p>
              )}
            </div>
          )}
        </div>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={elementKey} className="text-lg font-display font-extrabold text-white mt-12 mb-4 first:mt-0 flex items-center gap-2 border-b border-white/5 pb-2" style={{ textShadow: `0 0 10px ${accentColor}15` }}>
          <span className="w-1 h-5 rounded-full" style={{ backgroundColor: accentColor }} />
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={elementKey} className="text-sm font-display font-bold mt-10 mb-3 first:mt-0" style={{ color: accentColor }}>
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h4 key={elementKey} className="text-xs font-display font-semibold text-white/85 mt-8 mb-2 first:mt-0">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={elementKey} className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group bg-[#08090d]">
          <div className="absolute right-3 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-mono uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded">java</span>
          </div>
          <div className="bg-white/3 px-4 py-2 text-[9px] font-mono text-white/45 border-b border-white/5 flex items-center justify-between">
            <span>Source Code Block</span>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-[#050608]" style={{ color: accentColor }}>
            <code style={{ textShadow: `0 0 2px ${accentColor}20` }}>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={elementKey} className="my-3 space-y-3 pl-2 list-none">
          {listItems.map((item, j) => (
            <li key={j} className="text-sm text-white/85 leading-relaxed flex items-start gap-2.5 hover:text-white transition-colors duration-200">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 shadow-lg" style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
              <span dangerouslySetInnerHTML={{ __html: item
                .replace(/\*\*(.*?)\*\*/g, `<strong class="font-extrabold px-1.5 py-0.5 rounded-md shadow-sm font-display" style="color: ${accentColor}; background: ${accentColor}10; border: 1px solid ${accentColor}25;">$1</strong>`)
                .replace(/`(.*?)`/g, `<code class="font-bold font-mono px-1.5 py-0.5 rounded text-xs shadow-md border" style="color: ${accentColor}; border-color: ${accentColor}30; background-color: rgba(5,6,10,0.6);">$1</code>`)
              }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const listItems: { num: string; text: string }[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const match = lines[i].match(/^(\d+)\.\s(.*)/);
        if (match) {
          listItems.push({ num: match[1], text: match[2] });
        }
        i++;
      }
      elements.push(
        <ol key={elementKey} className="my-3 space-y-3 pl-2 list-none">
          {listItems.map((item, j) => (
            <li key={j} className="text-sm text-white/85 leading-relaxed flex items-start gap-2.5 hover:text-white transition-colors duration-200">
              <span className="font-mono text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: accentColor }}>{item.num}.</span>
              <span dangerouslySetInnerHTML={{ __html: item.text
                .replace(/\*\*(.*?)\*\*/g, `<strong class="font-extrabold px-1.5 py-0.5 rounded-md shadow-sm font-display" style="color: ${accentColor}; background: ${accentColor}10; border: 1px solid ${accentColor}25;">$1</strong>`)
                .replace(/`(.*?)`/g, `<code class="font-bold font-mono px-1.5 py-0.5 rounded text-xs shadow-md border" style="color: ${accentColor}; border-color: ${accentColor}30; background-color: rgba(5,6,10,0.6);">$1</code>`)
              }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.trim().length > 0) {
      const htmlLine = line
        .replace(/\*\*(.*?)\*\*/g, `<strong class="font-extrabold px-1.5 py-0.5 rounded-md shadow-sm font-display" style="color: ${accentColor}; background: ${accentColor}10; border: 1px solid ${accentColor}25;">$1</strong>`)
        .replace(/\*(.*?)\*/g, `<em class="text-white/95 italic font-sans" style="text-shadow: 0 0 4px ${accentColor}20;">$1</em>`)
        .replace(/`(.*?)`/g, `<code class="font-bold font-mono px-1.5 py-0.5 rounded text-xs shadow-md border" style="color: ${accentColor}; border-color: ${accentColor}30; background-color: rgba(5,6,10,0.6);">$1</code>`);
      elements.push(<p key={elementKey} className="text-sm text-white/80 leading-relaxed font-sans font-normal my-2 tracking-wide" dangerouslySetInnerHTML={{ __html: htmlLine }} />);
    }
    i++;
  }
  return <div className="flex flex-col gap-6">{elements}</div>;
}

import { generateTopicContent } from "@/lib/syllabusGenerator";

export default function TopicMissionControlPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<any>(null);
  const [diagramSpecs, setDiagramSpecs] = useState<DiagramSpec[]>([]);
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [activeMode, setActiveMode] = useState<"learn" | "interview" | "revision">("learn");
  
  const { 
    visitTopic, visitedTopicSlugs, reviewedQANumbers,
    bookmarks, toggleBookmark, addXp 
  } = useProgressStore();

  const isBookmarked = bookmarks?.includes(slug as string) || false;

  // Sibling topics loading for keyboard navigation
  const [siblingTopics, setSiblingTopics] = useState<any[]>([]);

  useEffect(() => {
    if (!topic?.moduleSlug) return;
    fetch("/modules-manifest.json")
      .then(r => r.json())
      .then(data => {
        const mod = data[topic.moduleSlug];
        if (mod) {
          setSiblingTopics(mod.topics || []);
        }
      })
      .catch(console.error);
  }, [topic?.moduleSlug]);

  const currentIdx = siblingTopics.findIndex(t => t.slug === slug);
  const nextTopic = currentIdx !== -1 && currentIdx < siblingTopics.length - 1 ? siblingTopics[currentIdx + 1] : null;
  const prevTopic = currentIdx > 0 ? siblingTopics[currentIdx - 1] : null;

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "j" && nextTopic) {
        router.push(`/topic/${nextTopic.slug}`);
      } else if (key === "k" && prevTopic) {
        router.push(`/topic/${prevTopic.slug}`);
      } else if (key === "b") {
        toggleBookmark(slug as string);
      } else if (key === "n") {
        e.preventDefault();
        const noteInputElem = document.querySelector("input[placeholder='Take a quick note...']") as HTMLInputElement;
        noteInputElem?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextTopic, prevTopic, slug, toggleBookmark, router]);

  // Notes & Highlights States
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [selectionText, setSelectionText] = useState("");
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);

  // Load notes and highlights on mount/slug change
  useEffect(() => {
    async function loadNotesAndHighlights() {
      try {
        const freshNotes = await getNotes(slug as string);
        const freshHls = await getHighlights(slug as string);
        setNotes(freshNotes);
        setHighlights(freshHls);
      } catch (err) {
        console.error("Failed to load topic notes and highlights", err);
      }
    }
    loadNotesAndHighlights();
  }, [slug]);

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    const newNote = {
      id: crypto.randomUUID(),
      topicId: slug as string,
      text: noteInput.trim(),
      timestamp: new Date().toISOString()
    };
    try {
      await saveNote(newNote);
      addXp(10);
      setNoteInput("");
      const freshNotes = await getNotes(slug as string);
      setNotes(freshNotes);
    } catch (err) {
      console.error("Failed to save note", err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      const freshNotes = await getNotes(slug as string);
      setNotes(freshNotes);
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    try {
      await deleteHighlight(id);
      const freshHls = await getHighlights(slug as string);
      setHighlights(freshHls);
    } catch (err) {
      console.error("Failed to delete highlight", err);
    }
  };

  const handleMouseUpSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelectionText("");
      setSelectionCoords(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length > 5) {
      setSelectionText(text);
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionCoords({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 32
      });
    } else {
      setSelectionText("");
      setSelectionCoords(null);
    }
  };

  const handleCreateHighlight = async () => {
    if (!selectionText) return;
    try {
      await saveHighlight({
        id: crypto.randomUUID(),
        topicId: slug as string,
        text: selectionText,
        partIdx: activePartIdx
      });
      addXp(5);
      const freshHls = await getHighlights(slug as string);
      setHighlights(freshHls);
      setSelectionText("");
      setSelectionCoords(null);
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      console.error("Failed to save highlight", err);
    }
  };

  const handleSelectField = (field: string) => {
    if (!topic?.parts) return;
    const matchedPartIdx = topic.parts.findIndex((part: any) => 
      part.bodyMdx.toLowerCase().includes(field.toLowerCase().substring(0, 30))
    );

    if (matchedPartIdx !== -1) {
      setActivePartIdx(matchedPartIdx);
      setTimeout(() => {
        const headers = Array.from(document.querySelectorAll("h2, h3, h4"));
        const matchedHeader = headers.find((h) => 
          h.textContent?.toLowerCase().includes(field.toLowerCase().substring(0, 30))
        );
        if (matchedHeader) {
          matchedHeader.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  };

  useEffect(() => {
    fetch("/content-manifest.json")
      .then(r => r.json())
      .then(manifest => {
        let t = manifest[slug as string];
        if (!t) {
          t = generateTopicContent(slug as string);
        }
        if (t) { 
          setTopic(t); 
          visitTopic(slug as string); 
        }
      })
      .catch(console.error);
  }, [slug, visitTopic]);

  // Load diagram sidecars
  useEffect(() => {
    if (!topic) return;
    if (topic.diagramCount > 0) {
      fetch(`/diagrams/${topic.moduleSlug}/${topic.slug}.diagram.json`)
        .then(r => r.json())
        .then(specs => setDiagramSpecs(specs))
        .catch(err => console.error("Failed to load topic diagrams", err));
    } else {
      setDiagramSpecs([]);
    }
  }, [topic]);

  if (!topic) {
    return (
      <main className="min-h-screen bg-surface-base text-white flex items-center justify-center">
        <NavBar />
        <div className="text-white/30 text-sm animate-pulse font-mono">Initializing mission control...</div>
      </main>
    );
  }

  const accentColor = MODULE_COLORS[topic.moduleSlug] || "#10E39B";
  const activePart = topic.parts?.[activePartIdx] || topic.parts?.[0];
  const allQAs = topic.parts?.flatMap((p: any) => p.interviewQAs || []) || [];
  const isCompleted = visitedTopicSlugs.includes(slug as string);

  // Filter diagrams for active part
  const activeDiagrams = diagramSpecs.filter(spec => 
    activePart?.diagramIds?.includes(spec.id)
  );

  // Generate Multiple Choice Quiz Questions from Q&As
  const quizQuestions: QuizQuestion[] = allQAs.slice(0, 3).map((qa: any) => {
    const distractors = allQAs
      .filter((q: any) => q.number !== qa.number)
      .map((q: any) => q.answer.substring(0, 75) + "...")
      .slice(0, 3);
    
    while (distractors.length < 3) {
      distractors.push("Heavy synchronization block causing thread scheduling overhead.");
      distractors.push("Unoptimized object layout leading to context switching bottlenecks.");
    }
    
    const options = [qa.answer.substring(0, 75) + "...", ...distractors];
    const shuffled = options.map((opt, i) => ({ opt, originalIdx: i }));
    shuffled.sort(() => Math.random() - 0.5);

    return {
      question: qa.question,
      options: shuffled.map(s => s.opt),
      correctIndex: shuffled.findIndex(s => s.originalIdx === 0),
      explanation: qa.answer.substring(0, 160) + "..."
    };
  });

  return (
    <main className="min-h-screen bg-surface-base text-white relative overflow-x-hidden" data-module={topic.moduleSlug}>
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse 50% 35% at 80% 0%, ${accentColor}12 0%, transparent 70%)` }} />
      <FloatingParticles />
      <NavBar />

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 pb-28 relative z-10" style={{ paddingTop: "9.5rem" }}>

        {/* LEFT RAIL — Part Timeline */}
        <div className="lg:col-span-3 space-y-4">
          <Link href={`/modules/${topic.moduleSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to module
          </Link>

          <GlassPanel className="p-5 border-white/5 bg-black/20 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Badge variant={topic.moduleSlug}>{topic.moduleSlug.replace(/-/g, " ")}</Badge>
                  <h1 className="text-xl font-display font-bold mt-2 leading-tight truncate" style={{ color: accentColor }}>
                    {topic.title}
                  </h1>
                </div>
                <button
                  onClick={() => toggleBookmark(slug as string)}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 text-yellow-400 cursor-pointer flex-shrink-0"
                  title="Bookmark this topic"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-yellow-400" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-white/45 mt-2 leading-relaxed">{topic.summaryOneLiner}</p>
            </div>

            {isCompleted && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2 text-xs font-medium">
                <CheckCircle className="w-4 h-4" /> Topic visited
              </div>
            )}

            {/* Mode selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/35 block mb-2">View Mode</span>
              {([["learn", BookOpen, "Learn Content"], ["interview", Trophy, "Interview Prep"], ["revision", Award, "Quick Revision"]] as const).map(([mode, Icon, label]) => (
                <button key={mode} onClick={() => setActiveMode(mode)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${activeMode === mode ? "border-opacity-30 text-white" : "bg-white/2 text-white/55 border-white/5 hover:bg-white/4"}`}
                  style={activeMode === mode ? { background: `${accentColor}15`, borderColor: `${accentColor}40`, color: accentColor } : {}}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Part timeline */}
            {topic.parts?.length > 1 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/35 block mb-2">Parts ({topic.parts.length})</span>
                {topic.parts.map((part: any, idx: number) => (
                  <button key={idx} onClick={() => setActivePartIdx(idx)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all cursor-pointer ${activePartIdx === idx ? "text-white" : "text-white/50 hover:text-white/70"}`}
                    style={activePartIdx === idx ? { background: `${accentColor}12`, borderLeft: `2px solid ${accentColor}` } : {}}>
                    <span className="font-mono text-[9px] font-bold" style={{ color: activePartIdx === idx ? accentColor : undefined }}>P{part.partNumber}</span>
                    <span className="truncate">{part.heading}</span>
                  </button>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>

        {/* CENTER — Main Content */}
        <div className="lg:col-span-6 space-y-6">
          {/* Mind Map representation of 69 fields */}
          {activeMode === "learn" && (
            <TopicMindMap accentColor={accentColor} onSelectField={handleSelectField} />
          )}

          <AnimatePresence mode="wait">
            <motion.div key={`${activeMode}-${activePartIdx}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-6">

              {activeMode === "learn" && activePart && (
                <>
                  {activePart.interviewHook && <InterviewHook>{activePart.interviewHook}</InterviewHook>}

                  {/* Render diagram block if diagram specs are available for active part */}
                  {activeDiagrams.map((spec) => (
                    <div key={spec.id} style={{ "--accent-color": accentColor } as React.CSSProperties}>
                      <AnimatedDiagram spec={spec} />
                    </div>
                  ))}

                  <GlassPanel variant="vision" className="p-6 border-white/8 bg-black/35 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-5 rounded-full" style={{ backgroundColor: accentColor }} />
                      <h2 className="text-lg font-display font-bold text-white">{activePart.heading}</h2>
                    </div>
                    <div onMouseUp={handleMouseUpSelection}>
                      <ContentRenderer bodyMdx={activePart.bodyMdx || ""} slug={slug as string} accentColor={accentColor} />
                    </div>
                  </GlassPanel>

                  {activePart.fiveCroreAnswer && (
                    <FiveCroreAnswer question={`₹5 Crore Level: ${activePart.heading}`}>
                      {activePart.fiveCroreAnswer}
                    </FiveCroreAnswer>
                  )}

                  {/* Mission Quiz Section */}
                  {quizQuestions.length > 0 && (
                    <div className="space-y-3 pt-6">
                      <h3 className="text-sm font-display font-bold text-white flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-emerald-400" /> Mission Quiz
                      </h3>
                      <QuizCard questions={quizQuestions} />
                    </div>
                  )}
                </>
              )}

              {activeMode === "interview" && (
                <div className="space-y-3">
                  <h2 className="text-lg font-display font-bold">Interview Questions ({allQAs.length})</h2>
                  {allQAs.length > 0 ? allQAs.map((qa: any) => (
                    <QAAccordion key={qa.number} qa={qa} color={accentColor} />
                  )) : (
                    <GlassPanel className="p-8 text-center text-white/30 text-sm">No interview questions indexed for this topic yet.</GlassPanel>
                  )}
                </div>
              )}

              {activeMode === "revision" && (
                <div className="space-y-4">
                  {topic.parts?.map((part: any, idx: number) => (
                    <GlassPanel key={idx} className="p-5 border-white/5 bg-black/20">
                      <h3 className="font-display font-bold text-sm mb-2" style={{ color: accentColor }}>Part {part.partNumber}: {part.heading}</h3>
                      {part.fiveCroreAnswer && (
                        <p className="text-xs text-white/60 leading-relaxed line-clamp-4">{part.fiveCroreAnswer}</p>
                      )}
                      <button onClick={() => { setActivePartIdx(idx); setActiveMode("learn"); }}
                        className="mt-3 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        style={{ color: accentColor }}>
                        Deep dive <ChevronRight className="w-3 h-3" />
                      </button>
                    </GlassPanel>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT RAIL — Interview Radar */}
        <div className="lg:col-span-3 space-y-4">
          <GlassPanel className="p-5 border-white/5 bg-black/20 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/40">Interview Radar</h4>
            <p className="text-xs text-white/35">{allQAs.length} questions in this topic</p>
            <div className="grid grid-cols-3 gap-1">
              {allQAs.slice(0, 18).map((qa: any) => {
                const reviewed = reviewedQANumbers.includes(qa.number);
                return (
                  <div key={qa.number} title={`Q${qa.number}: ${qa.question.substring(0, 60)}...`}
                    className="w-full aspect-square rounded-md flex items-center justify-center text-[8px] font-mono transition-all cursor-default border"
                    style={{
                      background: qa.isFiveCrore ? `${accentColor}25` : reviewed ? `${accentColor}15` : "rgba(255,255,255,0.03)",
                      borderColor: qa.isFiveCrore ? `${accentColor}60` : reviewed ? `${accentColor}30` : "rgba(255,255,255,0.06)",
                      color: qa.isFiveCrore ? accentColor : reviewed ? accentColor : "rgba(255,255,255,0.3)",
                    }}>
                    {qa.number}
                  </div>
                );
              })}
            </div>
            {allQAs.length > 18 && (
              <button onClick={() => setActiveMode("interview")}
                className="w-full text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors cursor-pointer text-center mt-1">
                +{allQAs.length - 18} more → view all
              </button>
            )}
          </GlassPanel>

          {/* Topic stats */}
          <GlassPanel className="p-5 border-white/5 bg-black/20 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/40">Topic Stats</h4>
            {[["Parts", topic.partCount], ["Diagrams", topic.diagramCount], ["Q&As", topic.qaCount], ["Read time", `${topic.estimatedReadMinutes}m`]].map(([label, val]) => (
              <div key={label as string} className="flex justify-between items-center">
                <span className="text-xs text-white/45">{label}</span>
                <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>{val}</span>
              </div>
            ))}
          </GlassPanel>

          {/* Topic contextual notes & highlights */}
          <GlassPanel className="p-5 border-white/5 bg-black/20 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" /> Topic Notebook
            </h4>

            {/* Note input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Take a quick note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-white/20 focus:outline-none focus:border-purple-500/40"
              />
              <button
                onClick={handleAddNote}
                className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notes list */}
            {notes.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div key={note.id} className="flex justify-between items-start gap-2 bg-white/2 border border-white/5 rounded-lg p-2 text-[10px]">
                    <p className="text-white/80 leading-normal flex-1">{note.text}</p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-white/20 hover:text-red-400 cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Highlights list */}
            {highlights.length > 0 && (
              <div className="space-y-1.5 border-t border-white/5 pt-3">
                <span className="text-[9px] font-mono text-white/35 uppercase tracking-wider block">Highlights:</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {highlights.map((hl) => (
                    <div key={hl.id} className="flex justify-between items-start gap-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-2 text-[9px] italic">
                      <p className="text-yellow-400/90 leading-normal flex-1 font-sans">"{hl.text.substring(0, 80)}..."</p>
                      <button
                        onClick={() => handleDeleteHighlight(hl.id)}
                        className="text-white/20 hover:text-red-400 cursor-pointer flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassPanel>
        </div>
      </div>

      {selectionCoords && (
        <button
          onClick={handleCreateHighlight}
          className="absolute z-50 bg-yellow-400 hover:bg-yellow-300 text-black px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold shadow-lg flex items-center gap-1 transition-all -translate-x-1/2 cursor-pointer border border-yellow-500"
          style={{ left: selectionCoords.x, top: selectionCoords.y }}
        >
          <Highlighter className="w-3.5 h-3.5" /> Highlight Selection
        </button>
      )}

      <MissionDock />
    </main>
  );
}