"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  ArrowUpRight, 
  Briefcase, 
  Target, 
  Layers, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Undo2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ScoreCard: Prominent match score display
 */
export function ScoreCard({ score, label, subtext }: { score: number; label: string; subtext?: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500 border-emerald-100 bg-emerald-50/50";
    if (s >= 60) return "text-blue-500 border-blue-100 bg-blue-50/50";
    return "text-orange-500 border-orange-100 bg-orange-50/50";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border p-8 flex flex-col items-center justify-center text-center transition-all duration-300",
        getScoreColor(score)
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Target size={120} />
      </div>
      
      <span className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">{label}</span>
      <div className="relative">
        <span className="text-7xl font-black tracking-tighter">{Math.round(score)}%</span>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-1.5 bg-current rounded-full mt-2 opacity-30"
        />
      </div>
      {subtext && <p className="mt-4 text-sm font-medium opacity-80 max-w-[200px]">{subtext}</p>}
    </motion.div>
  );
}

/**
 * MetricBlock: Lightweight info blocks
 */
export function MetricBlock({ icon: Icon, label, value, hint, trend }: { 
  icon: any; 
  label: string; 
  value: string | number; 
  hint?: string;
  trend?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon size={18} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-1 truncate">{hint}</p>}
    </div>
  );
}

/**
 * SkillTag: Pill-style component
 */
export function SkillTag({ name, type = "default", className }: { 
  name: string; 
  type?: "match" | "missing" | "default";
  className?: string;
}) {
  const variants = {
    match: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
    missing: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100",
    default: "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-default whitespace-nowrap inline-flex items-center gap-1.5",
      variants[type],
      className
    )}>
      {type === "match" && <CheckCircle2 size={12} />}
      {type === "missing" && <Circle size={12} className="opacity-50" />}
      {name}
    </span>
  );
}

/**
 * JobCard: Premium job recommendation card
 */
export function JobCard({ 
  title, 
  company, 
  matchScore, 
  skills, 
  url,
  overlap = [],
  missing = []
}: { 
  title: string; 
  company: string; 
  matchScore: number; 
  skills: string[]; 
  url?: string;
  overlap?: string[];
  missing?: string[];
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const getMatchLevel = (s: number, empty: boolean) => {
    if (empty) return { label: "No Skills Found", color: "text-slate-500 bg-slate-50 border-slate-200" };
    if (s >= 80) return { label: "High Match", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (s >= 50) return { label: "Medium Match", color: "text-blue-600 bg-blue-50 border-blue-100" };
    return { label: "Low Match", color: "text-muted-foreground bg-muted border-border" };
  };

  const effectiveScore = skills.length === 0 ? 0 : matchScore;
  const match = getMatchLevel(effectiveScore, skills.length === 0);

  return (
    <motion.div 
      style={{ perspective: "1000px" }} 
      className="h-full z-10"
      whileHover={{ y: -4 }}
    >
      <motion.div 
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* FRONT FACE */}
        <div 
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
          className="bg-card border border-border rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-shadow duration-300 h-full"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border", match.color)}>
                  {match.label}
                </span>
                <span className="text-sm font-bold text-primary">
                  {skills.length === 0 ? "--%" : `${effectiveScore}%`}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight line-clamp-1">{title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{company}</p>
            </div>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
              <Briefcase size={20} className="text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Skill alignment</p>
            {skills.length === 0 ? (
              <div className="flex items-start gap-2 p-3 bg-muted/40 border border-dashed border-border rounded-xl">
                <AlertCircle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                  No technical skills were detected in this job description.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {skills.slice(0, 6).map((skill) => (
                  <SkillTag 
                    key={skill} 
                    name={skill} 
                    type={overlap.includes(skill) ? "match" : missing.includes(skill) ? "missing" : "default"} 
                  />
                ))}
                {skills.length > 6 && (
                  <button 
                    onClick={() => setIsFlipped(true)}
                    className="text-[10px] text-primary font-bold self-center ml-1 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full hover:bg-primary/10 transition-colors cursor-pointer focus:outline-none flex items-center gap-1 group"
                  >
                    +{skills.length - 6} more
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 group"
            >
              View Job Details
              <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* BACK FACE */}
        <div 
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)",
            WebkitBackfaceVisibility: "hidden"
          }}
          className="absolute inset-0 bg-card border border-border rounded-3xl p-6 flex flex-col shadow-xl overflow-hidden"
        >
          {/* Decorative Background Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-center mb-4 relative z-10">
            <div>
              <h3 className="text-sm font-black tracking-tight text-foreground uppercase">All Required Skills</h3>
              <p className="text-[10px] font-bold text-muted-foreground">{skills.length} skills found</p>
            </div>
            <button 
              onClick={() => setIsFlipped(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border shadow-sm hover:scale-105 hover:text-primary transition-all text-muted-foreground"
            >
              <Undo2 size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 relative z-10">
            <div className="flex flex-wrap gap-1.5 content-start pb-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isFlipped ? 1 : 0, scale: isFlipped ? 1 : 0.8 }}
                  transition={{ duration: 0.3, delay: isFlipped ? index * 0.02 : 0 }}
                >
                  <SkillTag 
                    name={skill} 
                    type={overlap.includes(skill) ? "match" : missing.includes(skill) ? "missing" : "default"} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Fade out bottom to indicate scroll */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent pointer-events-none rounded-b-3xl" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * RoadmapStep: Timeline entry component
 */
export function RoadmapStep({ 
  timeline, 
  focus, 
  opportunities, 
  skills = [],
  active = false,
  tip
}: { 
  timeline: string; 
  focus: string; 
  opportunities: number; 
  skills?: string[];
  active?: boolean;
  tip?: string;
}) {
  return (
    <div className={cn(
      "relative pl-8 pb-10 last:pb-0 group",
      active ? "opacity-100" : "opacity-70 hover:opacity-100 transition-opacity"
    )}>
      {/* Timeline Line */}
      <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-border group-last:hidden" />
      
      {/* Marker */}
      <div className={cn(
        "absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 bg-card flex items-center justify-center transition-all duration-300",
        active ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-border group-hover:border-primary/50"
      )}>
        {active && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider",
            active ? "text-primary" : "text-muted-foreground"
          )}>
            {timeline}
          </span>
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">
            {opportunities} Roles
          </span>
        </div>
        <h4 className="text-base font-bold tracking-tight mb-2">{focus}</h4>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills.map((skill) => (
            <SkillTag key={skill} name={skill} className="text-[10px] py-0.5 px-2" />
          ))}
        </div>

        {tip && (
          <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-xl relative group-hover:bg-primary/10 transition-colors">
            <div className="flex items-start gap-2">
              <Sparkles size={12} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic">
                &ldquo;{tip}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
