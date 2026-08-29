// types/content.ts
// CodeVerse — Master Content Type System
// LOCKED: do not modify structure without updating build-content-index.ts

export type InterviewQA = {
  number: number; // global sequential: 1, 2, 3 ... 388, 389, ...
  question: string;
  answer: string;
  isFiveCrore?: boolean; // true = elevated ₹5 Crore treatment
  difficulty?: "easy" | "medium" | "hard" | "five-crore";
};

export type DiagramNode = {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  type?: "prerequisite" | "related" | "flow" | "cycle";
};

export type DiagramSpec = {
  id: string;
  kind:
    | "flow"
    | "tree"
    | "cycle"
    | "layered"
    | "comparisonTable"
    | "timeline";
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  layout?: "LR" | "TB" | "RL" | "BT"; // dagre layout direction
};

export type AnalogyEntry = {
  title: string;
  theme: string; // "restaurant" | "hospital" | "airport" | "library" etc.
  bodyMdx: string;
  imageSlot: string; // path in /public/illustrations/analogies/
};

export type EnterpriseExample = {
  company: string;
  monogram: string; // single letter for badge
  accentColor: string;
  bodyMdx: string;
};

export type Misconception = {
  claim: string; // the wrong belief
  correction: string; // the correct explanation
};

export type ContentPart = {
  partNumber: number;
  heading: string;
  interviewHook?: string; // "Interview Question (₹5 Crore Level)" prompt
  bodyMdx: string; // verbatim / self-authored markdown (full, unabridged)
  diagrams: DiagramSpec[]; // converted from ASCII arrows
  analogy?: AnalogyEntry;
  enterpriseExamples?: EnterpriseExample[];
  misconceptions?: Misconception[];
  relationshipDiagram?: DiagramSpec;
  fiveCroreAnswer?: string;
  interviewQAs: InterviewQA[];
};

export type TopicImageManifest = {
  hero: string; // /public/illustrations/topics/<slug>/hero.avif
  analogy: string; // /public/illustrations/analogies/<theme>.avif
  architectureOverlay: string; // /public/illustrations/overlays/<slug>.avif
  processIllustration: string; // /public/illustrations/topics/<slug>/process.avif
  thumbnail: string; // /public/illustrations/thumbnails/<slug>.avif
  mobileVariant: string; // /public/illustrations/mobile/<slug>.avif
};

export type Topic = {
  slug: string;
  moduleSlug: string;
  title: string;
  order: number;
  summaryOneLiner: string; // ≤140 chars for cards
  estimatedReadMinutes: number;
  parts: ContentPart[];
  keyTerms: string[]; // feeds /glossary
  generated: boolean; // true = AI-Extended badge shown
  prerequisiteTopicSlugs: string[]; // powers graph edges + prerequisite lock
  images: TopicImageManifest;
};

export type Module = {
  slug: string;
  title: string;
  order: number;
  color: string; // accent hex (see design system §4.2)
  icon: string; // lucide-react icon name
  description: string;
  topics: Topic[];
};

// Flattened search-ready entry (emitted into content-index.json)
export type SearchEntry = {
  type: "topic" | "interviewQA" | "glossaryTerm" | "codeSnippet";
  moduleSlug: string;
  moduleTitle: string;
  topicSlug: string;
  topicTitle: string;
  partNumber?: number;
  partHeading?: string;
  // For type === "topic"
  summary?: string;
  keyTerms?: string[];
  // For type === "interviewQA"
  qaNumber?: number;
  qaQuestion?: string;
  qaAnswer?: string;
  isFiveCrore?: boolean;
  difficulty?: string;
  // For type === "glossaryTerm"
  term?: string;
  definition?: string;
  pronunciation?: string;
  relatedTopicSlugs?: string[];
  // Semantic expansion
  concepts: string[];
  relations: string[];
  // Content text for Fuse.js indexing
  searchableText: string;
};

export type GlossaryTerm = {
  term: string;
  definition: string;
  pronunciation?: string;
  relatedTopicSlugs: string[];
  sourceModuleSlug: string;
};

// Progress store shape (persisted to localStorage via Zustand)
export type ProgressState = {
  visitedTopicSlugs: string[];     // array (not Set) — matches Zustand store
  reviewedQANumbers: number[];     // array (not Set) — matches Zustand store
  lastViewMode: "grid" | "graph";
  xp: number;
  streak: number;
  lastVisitDate: string | null;
  milestones: string[];
};

// Diagram kind display config
export type DiagramRenderConfig = {
  kind: DiagramSpec["kind"];
  animationDuration: number;
  loopEnabled: boolean;
  interactable: boolean;
};

export const DIAGRAM_CONFIGS: Record<
  DiagramSpec["kind"],
  DiagramRenderConfig
> = {
  flow: {
    kind: "flow",
    animationDuration: 800,
    loopEnabled: true,
    interactable: true,
  },
  tree: {
    kind: "tree",
    animationDuration: 600,
    loopEnabled: false,
    interactable: true,
  },
  cycle: {
    kind: "cycle",
    animationDuration: 1200,
    loopEnabled: true,
    interactable: true,
  },
  layered: {
    kind: "layered",
    animationDuration: 900,
    loopEnabled: true,
    interactable: true,
  },
  comparisonTable: {
    kind: "comparisonTable",
    animationDuration: 400,
    loopEnabled: false,
    interactable: true,
  },
  timeline: {
    kind: "timeline",
    animationDuration: 500,
    loopEnabled: false,
    interactable: true,
  },
};
