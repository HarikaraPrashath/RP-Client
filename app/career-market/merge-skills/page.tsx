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
import SaveToProfileButton from "../../../components/market/save-to-profile-button";
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
    if (languages.some(l => s === l || s.split(/\s+/).includes(l))) categories.Languages.push(skill);
    else if (frameworks.some(f => s === f || s.split(/\s+/).includes(f))) categories["Frameworks & Libraries"].push(skill);
    else if (tools.some(t => s === t || s.split(/\s+/).includes(t))) categories["Tools & Platforms"].push(skill);
    else categories.Other.push(skill);
  });

  return categories;
};

const calcAverageCount = (jobs: RankedJob[], key: "skills_found" | "missing") => {
  if (!jobs.length) return 0;
  const total = jobs.reduce((sum, job) => sum + (job[key]?.length ?? 0), 0);
  return total / jobs.length;
};

const loadRanked = async (role: string, userSkills: string[]): Promise<RankedJob[]> => {
  try {
    const res = await fetch(`${API_BASE}/ranked/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ role, userSkills }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.ranked) ? data.ranked : [];
  } catch {
    return [];
  }
};

const avgMatch = (jobs: RankedJob[]) => {
  const withScores = jobs.filter((j) => typeof j.match_percent === "number");
  if (!withScores.length) return 0;
  const total = withScores.reduce((sum, j) => sum + (j.match_percent ?? 0), 0);
  return total / withScores.length;
};

const coveragePercent = (jobs: RankedJob[]) => {
  const withSkills = jobs.filter((j) => (j.skills_found ?? []).length > 0).length;
  if (!jobs.length) return 0;
  return (withSkills / jobs.length) * 100;
};

const uniqueSkillCount = (jobs: RankedJob[]) => {
  const set = new Set<string>();
  jobs.forEach((job) =>
    (job.skills_found ?? []).forEach((s: string) => set.add(s.toLowerCase().trim()))
  );
  return set.size;
};

const topMissing = (jobs: RankedJob[], limit = 8) => {
  const counts = new Map<string, number>();
  jobs.forEach((job) => {
    (job.missing ?? []).forEach((skill) => {
      const key = skill.trim().toLowerCase();
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([skill, count]) => ({ skill, count }));
};

const buildCareerTimeline = (
  jobs: RankedJob[],
  missingSkills: { skill: string; count: number }[],
): Record<string, CareerTimelineEntry> => {
  const immediate = jobs.filter((j) => (j.match_percent ?? 0) >= 70).length;
  const shortTerm = jobs.filter((j) => {
    const pct = j.match_percent ?? 0;
    return pct >= 50 && pct < 70;
  }).length;
  const longTerm = jobs.filter((j) => (j.match_percent ?? 0) < 50).length;
  const skills = missingSkills.map((item) => item.skill);

  return {
    "0-3_months": {
      focus: "Apply to immediate opportunities while learning 2-3 high-priority skills",
      opportunities: immediate,
      recommended_skills: skills.slice(0, 3),
      mentor_tip: "Focus on interview readiness. Your skill set is almost ready; prioritize the few high-impact gaps to unlock multiple offers quickly."
    },
    "3-6_months": {
      focus: "Expand skill set with medium-priority skills and apply to mid-range roles",
      opportunities: shortTerm,
      recommended_skills: skills.slice(3, 6),
      mentor_tip: "Deepen your technical depth. Start working on a significant project using these next-step skills to prove your expertise to mid-level recruiters."
    },
    "6-12_months": {
      focus: "Master advanced technologies to qualify for highly specialized positions",
      opportunities: longTerm,
      recommended_skills: skills.slice(6, 9),
      mentor_tip: "Think architectural. These skills are often used in specialized or senior roles. Understanding the 'why' is as important as the 'how' for these targets."
    },
  };
};

const loadProfileData = async (): Promise<ProfileData> => {
  try {
    const res = await fetch(`${API_BASE}/profile`, { cache: "no-store", headers: authHeader() });
    if (res.status === 401) {
      throw new Error("unauthorized");
    }
    if (!res.ok) return { position: "", skills: [] };
    const doc = await res.json();
    const rawSkills = Array.isArray(doc?.skills) ? doc.skills : [];
    // Robustly split any combined skill strings
    const skills = Array.from(new Set(
      rawSkills.flatMap((s: unknown) => 
        typeof s === "string" ? s.split(/[\n,;\u2022·]|\s{2,}/).map(i => i.trim()).filter(Boolean) : []
      )
    ));
    const position = typeof doc?.basics?.position === "string" ? doc.basics.position : "";
    return {
      position: position.trim(),
      skills: skills as string[],
    };
  } catch (error) {
    throw error;
  }
};

const refreshFromProfile = async (keyword: string, userSkills: string[]) => {
  const cleanKeyword = resolveCareerRole(keyword);
  try {
    const res = await fetch(`${API_BASE}/jobs/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ keyword: cleanKeyword, userSkills, force: false }),
      cache: "no-store",
    });
    if (!res.ok) {
      return "Auto-refresh failed (backend error); showing last saved data.";
    }
    const data = await res.json();
    if (!data?.refreshed) {
      return "Showing cached data (recently refreshed).";
    }
    try {
      const analysisRes = await fetch(`${API_BASE}/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ keyword: cleanKeyword }),
        cache: "no-store",
      });
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        if (analysisData?.warning) {
          return analysisData.warning as string;
        }
      }
    } catch {
      // Ignore analysis errors
    }
    return "";
  } catch {
    return "Auto-refresh failed (backend error); showing last saved data.";
  }
};

export default function MergeSkillsPage() {
  const [profile, setProfile] = useState<ProfileData>({ position: "", skills: [] });
  const [activeRole, setActiveRole] = useState(() => resolveCareerRole());
  const [ranked, setRanked] = useState<RankedJob[]>([]);
  const [refreshNote, setRefreshNote] = useState("");
  const [reindexNote, setReindexNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingRole, setIsRefreshingRole] = useState(false);
  const [isReindexingJobs, setIsReindexingJobs] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const roleOptions = useMemo(() => mergeRoleOptions(
    [profile.position, activeRole],
    CAREER_MARKET_ROLE_OPTIONS,
  ), [profile.position, activeRole]);

  const refreshRoleAnalysis = async (role: string, userSkills: string[]) => {
    setIsRefreshingRole(true);
    setLoadError(null);
    try {
      const note = await refreshFromProfile(role, userSkills);
      setRefreshNote(note);
      setReindexNote("");
      const rankedData = await loadRanked(role, userSkills);
      setRanked(rankedData);
    } catch (error: any) {
      console.error("Refresh from profile failed:", error);
      if (error?.message === "unauthorized") {
        setLoadError("Sign in to load your profile data.");
      } else {
        setLoadError("Unable to refresh role analysis.");
      }
    } finally {
      setIsRefreshingRole(false);
    }
  };

  const reindexJobs = async () => {
    if (isReindexingJobs) return;
    setIsReindexingJobs(true);
    setLoadError(null);
    setReindexNote("");
    try {
      const res = await fetch(`${API_BASE}/jobs/reindex`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ onlyMissing: true, limit: 500 }),
        cache: "no-store",
      });
      if (res.status === 401) {
        setLoadError("Sign in to reindex job skills.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setLoadError(data?.detail || "Job reindex failed.");
        return;
      }
      const data = await res.json().catch(() => null);
      const updated = Number(data?.updated ?? 0);
      const skipped = Number(data?.skipped ?? 0);
      setReindexNote(`Reindexed ${updated} jobs (skipped ${skipped}).`);
      const rankedData = await loadRanked(searchKeyword, userSkills);
      setRanked(rankedData);
    } catch {
      setLoadError("Job reindex failed (network error).");
    } finally {
      setIsReindexingJobs(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const profileData = await loadProfileData();
        if (ignore) return;
        setProfile(profileData);
        const resolvedRole = resolveCareerRole(profileData.position);
        setActiveRole(resolvedRole);

        let note = "";
        try {
          note = await refreshFromProfile(resolvedRole, profileData.skills);
        } catch (error) {
          console.error("Refresh from profile failed:", error);
          note = "Auto-refresh failed; showing last saved data.";
        }
        if (ignore) return;
        setRefreshNote(note);

        const rankedData = await loadRanked(resolvedRole, profileData.skills);
        if (ignore) return;
        setRanked(rankedData);
      } catch (error: any) {
        if (!ignore) {
          if (error?.message === "unauthorized") {
            setLoadError("Sign in to load your profile data.");
          } else {
            setLoadError("Unable to load merge skills data.");
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const searchKeyword = resolveCareerRole(activeRole, profile.position);
  const userSkills = profile.skills;
  const average = avgMatch(ranked);
  const coverage = Math.round(coveragePercent(ranked));
  const topMissingSkills = topMissing(ranked);
  const uniqueSkillsCount = uniqueSkillCount(ranked);
  const avgSkillsFound = calcAverageCount(ranked, "skills_found");
  const avgMissing = calcAverageCount(ranked, "missing");
  const strongMatches = ranked.filter((j) => (j.match_percent ?? 0) >= 80).length;

  const timelineEntries = Object.entries(buildCareerTimeline(ranked, topMissingSkills));

  const skillCategories = useMemo(() => categorizeSkills(profile.skills), [profile.skills]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSider variant="light" />
      <main className="flex-1 transition-all duration-300 p-8 lg:p-12">
        <div className="max-w-screen-2xl mx-auto space-y-12">

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                <Sparkles size={14} />
                <span>Career Intelligence</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">Skill Radar</h1>
              <p className="text-muted-foreground text-lg max-w-2xl font-medium">
                Analyze your skill alignment against live job market data for <span className="text-foreground font-bold">{searchKeyword}</span> roles.
              </p>
              {(refreshNote || reindexNote) && (
                <p className="text-sm text-muted-foreground/80 font-medium">
                  {[refreshNote, reindexNote].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card border border-border p-2 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 px-3 border-r border-border/50">
                <Search size={16} className="text-muted-foreground" />
                <select
                  className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer min-w-[160px]"
                  value={searchKeyword}
                  onChange={(e) => setActiveRole(e.target.value)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => refreshRoleAnalysis(searchKeyword, userSkills)}
                disabled={isRefreshingRole || isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
              >
                <RefreshCcw size={16} className={cn(isRefreshingRole && "animate-spin")} />
                {isRefreshingRole ? "Analyzing..." : "Refresh Data"}
              </button>
              <button
                onClick={reindexJobs}
                disabled={isReindexingJobs || isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/70 transition-all disabled:opacity-50"
                title="Re-extract skills from stored full job text (no scraping)"
              >
                <Wrench size={16} className={cn(isReindexingJobs && "animate-spin")} />
                {isReindexingJobs ? "Reindexing..." : "Fix Matching"}
              </button>
              
              <SaveToProfileButton 
                type="mergeSkills"
                label="Save Radar"
                data={{
                  career: searchKeyword,
                  averageMatch: average,
                  marketCoverage: coverage,
                  topMissing: topMissingSkills,
                  roadmap: buildCareerTimeline(ranked, topMissingSkills)
                }}
              />
            </div>
          </header>

          {loadError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {loadError}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              <div className="col-span-1 md:col-span-2 h-[400px] bg-muted rounded-3xl" />
              <div className="space-y-4">
                <div className="h-[120px] bg-muted rounded-3xl" />
                <div className="h-[120px] bg-muted rounded-3xl" />
                <div className="h-[120px] bg-muted rounded-3xl" />
              </div>
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <ScoreCard
                    score={average}
                    label="Skill Match Score"
                    subtext={`Based on analysis of ${ranked.length} recent job advertisements.`}
                  />
                </div>
                <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricBlock
                    icon={Target}
                    label="Market Coverage"
                    value={`${coverage}%`}
                    hint={`${ranked.filter(j => (j.skills_found?.length ?? 0) > 0).length} jobs with skills`}
                  />
                  <MetricBlock
                    icon={Sparkles}
                    label="Strong Fits"
                    value={strongMatches}
                    hint="Jobs with 80%+ match"
                    trend="High"
                  />
                  <MetricBlock
                    icon={Briefcase}
                    label="Total Analyzed"
                    value={ranked.length}
                    hint="Scraped job postings"
                  />
                  <MetricBlock
                    icon={Layers}
                    label="Unique Skills"
                    value={uniqueSkillsCount}
                    hint="Spotted across market"
                  />
                  <MetricBlock
                    icon={Search}
                    label="Avg Skills/Job"
                    value={avgSkillsFound.toFixed(1)}
                    hint="Technical signals found"
                  />
                  <MetricBlock
                    icon={AlertCircle}
                    label="Avg Gaps/Job"
                    value={avgMissing.toFixed(1)}
                    hint="Skills to prioritize"
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                <div className="xl:col-span-1 space-y-8">
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <h2 className="text-xl font-black tracking-tight mb-6">Your Skillset</h2>
                    <div className="space-y-6">
                      {Object.entries(skillCategories).map(([cat, skills]) => {
                        if (skills.length === 0) return null;
                        const isExpanded = expandedCategories[cat] || false;
                        const visibleSkills = isExpanded ? skills : skills.slice(0, 8);

                        return (
                          <div key={cat} className="space-y-3">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cat}</p>
                            <div className="flex flex-wrap gap-2">
                              {visibleSkills.map(skill => (
                                <SkillTag key={skill} name={skill} />
                              ))}
                              {skills.length > 8 && (
                                <button
                                  onClick={() => toggleCategory(cat)}
                                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  {isExpanded ? (
                                    <>Show less <ChevronUp size={12} /></>
                                  ) : (
                                    <>+{skills.length - 8} more <ChevronDown size={12} /></>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-2 space-y-8">
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
                      <h2 className="text-xl font-black tracking-tight">Career Roadmap</h2>
                      <p className="text-xs text-muted-foreground font-medium">
                        Short, medium, and long-term focus based on your current skill profile.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {timelineEntries.map(([key, data], idx) => (
                        <RoadmapStep
                          key={key}
                          timeline={key.replace("_", " ")}
                          focus={data.focus || ""}
                          opportunities={data.opportunities || 0}
                          skills={data.recommended_skills}
                          tip={data.mentor_tip}
                          active={idx === 0}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black tracking-tight">Market Matches</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">Sort by:</span>
                        <span className="text-xs font-bold text-primary cursor-pointer hover:underline">Match %</span>
                      </div>
                    </div>

                    {ranked.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                        <Briefcase size={40} className="text-muted-foreground mb-4 opacity-50" />
                        <p className="text-lg font-bold text-muted-foreground">No matches found</p>
                        <p className="text-sm text-muted-foreground/60">Try refreshing your profile or role.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {ranked.map((job, idx) => (
                          <JobCard
                            key={`${job.ref}-${idx}`}
                            title={job.position || "Untitled Role"}
                            company={job.employer || "Private Company"}
                            matchScore={Math.round(job.match_percent || 0)}
                            skills={job.skills_found || []}
                            url={job.url}
                            overlap={job.overlap}
                            missing={job.missing}
                          />
                        ))}
                      </div>
                    )}
                  </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
