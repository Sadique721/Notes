"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Award, RotateCcw } from "lucide-react";
import { GlassPanel } from "./GlassPanel";
import { useProgressStore } from "@/components/providers/ProgressProvider";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizCardProps {
  questions: QuizQuestion[];
}

export function QuizCard({ questions }: QuizCardProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const { addXp } = useProgressStore();

  if (questions.length === 0) {
    return (
      <GlassPanel className="p-8 text-center text-white/30 text-sm">
        No quiz questions loaded for this topic.
      </GlassPanel>
    );
  }

  const currentQuestion = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      // Award XP based on score
      const finalScore = score;
      const passed = finalScore >= Math.ceil(questions.length * 0.7);
      if (passed) {
        addXp(30); // Award 30 XP on successful quiz completion
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const currentScore = score;
  const percent = Math.round((currentScore / questions.length) * 100);

  return (
    <GlassPanel className="p-6 border-white/5 bg-black/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-aurora-2 opacity-5 pointer-events-none" />

      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Header progress info */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400">
                QUESTION {currentIdx + 1} OF {questions.length}
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Score: {currentScore}/{questions.length}
              </span>
            </div>

            {/* Question title */}
            <h3 className="font-display font-bold text-white text-base leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Options grid */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrectOpt = idx === currentQuestion.correctIndex;

                let borderStyle = "border-white/5 bg-white/2 hover:bg-white/4";
                let textStyle = "text-white/80";

                if (isAnswered) {
                  if (isCorrectOpt) {
                    borderStyle = "border-emerald-500/40 bg-emerald-500/10 shadow-glow-sm";
                    textStyle = "text-emerald-400 font-semibold";
                  } else if (isSelected) {
                    borderStyle = "border-rose-500/40 bg-rose-500/10";
                    textStyle = "text-rose-400";
                  } else {
                    borderStyle = "border-white/2 bg-white/1 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-xs transition-all cursor-pointer ${borderStyle}`}
                  >
                    <span className={textStyle}>{option}</span>
                    {isAnswered && isCorrectOpt && (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2 animate-scale-in" />
                    )}
                    {isAnswered && isSelected && !isCorrectOpt && (
                      <X className="w-4 h-4 text-rose-400 flex-shrink-0 ml-2 animate-scale-in" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next action */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t border-white/5"
              >
                {currentQuestion.explanation && (
                  <p className="text-[11px] text-white/50 leading-relaxed italic">
                    💡 {currentQuestion.explanation}
                  </p>
                )}
                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-display font-semibold text-xs tracking-wider uppercase hover:shadow-glow-md hover:scale-103 active:scale-97 transition-all cursor-pointer"
                >
                  {currentIdx + 1 === questions.length ? "Finish Quiz" : "Next Question"}
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center space-y-6 py-6"
          >
            {/* Circular Progress Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-white/5 fill-transparent"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-emerald-400 fill-transparent"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 48}
                  initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - percent / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-2xl text-white">{percent}%</span>
                <span className="text-[9px] text-white/40 uppercase font-mono tracking-widest mt-0.5">SCORE</span>
              </div>
            </div>

            {/* Achievement Text */}
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-white">
                {percent >= 70 ? "🎉 Topic Mission Cleared!" : "💪 Practice Makes Perfect"}
              </h4>
              <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                {percent >= 70
                  ? "Outstanding! You earned 30 XP towards your developer profile level."
                  : "Review the topic explanation and try again to achieve a passing score of 70%."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
