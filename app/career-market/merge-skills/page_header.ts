"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Wrench,
  Briefcase,
  Layers,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { authHeader } from "../../../lib/auth";
import AppSider from "../../../components/market/app-sider";
import {
  CAREER_MARKET_ROLE_OPTIONS,
  mergeRoleOptions,
  resolveCareerRole,
} from "../../../components/market/role-config";
import {
  ScoreCard,
  MetricBlock,
  SkillTag,
  JobCard,
  RoadmapStep
} from "../../../components/market/merge-skill-components";
import { cn } from "@/lib/utils";

type RankedJob = {
  ref?: string;
  position?: string;
  employer?: string;
  url?: string;
  skills_found?: string[];
  match_percent?: number;
  missing?: string[];
  overlap?: string[];
  job_skill_count?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ProfileData = { position: string; skills: string[] };
type CareerTimelineEntry = {
  focus?: string;
  opportunities?: number;
  recommended_skills?: string[];
  mentor_tip?: string;
};

const categorizeSkills = (skills: string[]) => {
  const languages = ["java", "python", "javascript", "typescript", "php", "kotlin", "swift", "c", "c++", "c#", "go", "rust", "ruby", "scala", "r", "bash", "powershell"];
  const frameworks = ["react", "vue", "angular", "next.js", "nuxt", "flutter", "django", "flask", "fastapi", "spring", "express", "nestjs", ".net", "laravel"];
  const tools = ["docker", "kubernetes", "aws", "gcp", "azure", "git", "jenkins", "terraform", "ansible", "mysql", "postgresql", "mongodb", "redis", "elasticsearch"];

  const categories = {
    Languages: [] as string[],
    "Frameworks & Libraries": [] as string[],
    "Tools & Platforms": [] as string[],
    Other: [] as string[]
  };

  skills.forEach(skill => {
    const s = skill.toLowerCase();
    if (languages.some(l => s.includes(l))) categories.Languages.push(skill);
    else if (frameworks.some(f => s.includes(f))) categories["Frameworks & Libraries"].push(skill);
    else if (tools.some(t => s.includes(t))) categories["Tools & Platforms"].push(skill);
    else categories.Other.push(skill);
  });

  return categories;
};
