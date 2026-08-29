/**
 * interviewEvaluator.ts — Deterministic Frontend Interview Evaluation Engine (GOD MODE v3 Layer 5)
 *
 * Evaluates typed user answers against official answers on the client-side.
 * Uses key-concept tokenization, critical terminology mapping, coverage analysis,
 * and semantic heuristic weights to score answer precision and award XP.
 */

export type EvaluationReport = {
  score: number; // 0 to 100
  grade: "Mastered" | "Proficient" | "Review Needed";
  matchedTerms: string[];
  missingTerms: string[];
  criticalMatched: string[];
  criticalMissing: string[];
  xpEarned: number;
};

// Core Technical Dictionary for JVM, Concurrency, Spring & DB
const TECHNICAL_DICTIONARY = [
  "hashmap", "concurrenthashmap", "segment locking", "cas operation", "compare and swap",
  "heap", "stack", "metaspace", "classloader", "garbage collector", "minor gc", "major gc",
  "eden space", "survivor space", "tenured", "generational gc", "zgc", "g1 gc",
  "virtual threads", "platform threads", "thread pooling", "threadpoolexecutor",
  "synchronization", "deadlock", "race condition", "optimistic locking", "pessimistic locking",
  "aqs", "abstractqueuedsynchronizer", "volatile", "transient", "serialization",
  "ioc", "inversion of control", "dependency injection", "bean lifecycle", "singleton",
  "prototype", "bean factory", "applicationcontext", "reflection", "proxy pattern",
  "autoconfigure", "springbootstarter", "tomcat", "actuator", "profiles",
  "microservices", "service discovery", "eureka", "api gateway", "circuit breaker",
  "hystrix", "resilience4j", "load balancing", "saga pattern", "distributed transaction",
  "acid", "isolation level", "dirty read", "phantom read", "btree index", "clustered index",
  "joins", "execution plan", "query optimizer", "type erasure", "generics", "bridge method"
];

// Map questions or terms to Critical/Must-Have terms
const CRITICAL_CONCEPTS_MAP: Record<string, string[]> = {
  "hashmap": ["hashcode", "equals", "bucket", "linked list", "collision"],
  "concurrenthashmap": ["segment", "cas", "lock", "node", "volatile"],
  "classloader": ["delegation", "parent", "bootstrap", "application", "namespace"],
  "jit": ["bytecode", "compilation", "hotspot", "native", "profiling"],
  "aqs": ["state", "fifo", "queue", "cas", "lock"],
  "virtual-threads": ["platform", "pinning", "carrier", "mount", "scheduler"],
  "gc": ["generation", "eden", "promotion", "stop the world", "mark sweep"],
  "ioc": ["decoupling", "container", "dependency", "injection", "lifecycle"],
  "circuit-breaker": ["open", "closed", "half-open", "fallback", "threshold"],
  "saga": ["distributed", "compensating", "local transaction", "orchestrator", "choreography"],
  "acid": ["atomicity", "consistency", "isolation", "durability", "commit"],
  "btree": ["index", "node", "binary", "leaf", "pointer"]
};

export function evaluateAnswer(
  userAnswer: string,
  officialAnswer: string,
  topicSlug: string
): EvaluationReport {
  const normUser = userAnswer.toLowerCase().replace(/[^\w\s]/g, " ");
  const normOfficial = officialAnswer.toLowerCase().replace(/[^\w\s]/g, " ");

  // 1. Extract Key Technical Terms present in the official answer
  const officialTerms = TECHNICAL_DICTIONARY.filter(term => 
    normOfficial.includes(term) || officialAnswer.toLowerCase().includes(term)
  );

  // Also parse capitalized terms as potential code keywords (e.g. ClassLoader, BeanLifecycle)
  const codeKeywords = Array.from(officialAnswer.matchAll(/\b[A-Z][a-zA-Z0-9_]{3,}\b/g))
    .map(match => match[0].toLowerCase())
    .filter(term => !officialTerms.includes(term) && term.length > 3);
  
  officialTerms.push(...codeKeywords);

  // Unique terms only
  const uniqueOfficialTerms = Array.from(new Set(officialTerms));

  // 2. Identify Critical Concepts for the specific Topic
  let criticalTerms: string[] = [];
  const matchedSlugKey = Object.keys(CRITICAL_CONCEPTS_MAP).find(k => topicSlug.includes(k));
  if (matchedSlugKey) {
    criticalTerms = CRITICAL_CONCEPTS_MAP[matchedSlugKey];
  }

  // 3. Match against User's Input
  const matchedTerms: string[] = [];
  const missingTerms: string[] = [];

  uniqueOfficialTerms.forEach(term => {
    if (normUser.includes(term)) {
      matchedTerms.push(term);
    } else {
      missingTerms.push(term);
    }
  });

  const criticalMatched: string[] = [];
  const criticalMissing: string[] = [];

  criticalTerms.forEach(term => {
    if (normUser.includes(term)) {
      criticalMatched.push(term);
    } else {
      criticalMissing.push(term);
    }
  });

  // 4. Calculate Scores
  const termsWeight = 0.6;
  const criticalWeight = 0.4;

  const termsScore = uniqueOfficialTerms.length > 0 
    ? (matchedTerms.length / uniqueOfficialTerms.length) * 100 
    : 100;
  
  const criticalScore = criticalTerms.length > 0
    ? (criticalMatched.length / criticalTerms.length) * 100
    : 100;

  const finalScore = Math.round(termsScore * termsWeight + criticalScore * criticalWeight);

  // 5. Determine Grade
  let grade: "Mastered" | "Proficient" | "Review Needed" = "Review Needed";
  if (finalScore >= 80 && criticalMissing.length === 0) {
    grade = "Mastered";
  } else if (finalScore >= 50) {
    grade = "Proficient";
  }

  // 6. Compute XP Earned
  let xpEarned = 5; // Base XP for attempting
  if (grade === "Mastered") {
    xpEarned = 50; // A-grade
  } else if (grade === "Proficient") {
    xpEarned = 25; // B-grade
  }

  return {
    score: finalScore,
    grade,
    matchedTerms,
    missingTerms,
    criticalMatched,
    criticalMissing,
    xpEarned
  };
}
