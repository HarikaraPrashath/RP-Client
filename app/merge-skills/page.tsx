"use client";

import { useEffect, useState } from "react";
import { authHeader } from "../../lib/auth";
import styles from "../skills/page.module.css";
import AppSider from "../../components/app-sider";
import siderStyles from "../../components/app-sider.module.css";

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
};
type AnalysisResponse = {
  predictions?: {
    recommendations?: string[];
    career_timeline?: Record<string, CareerTimelineEntry>;
  };
};

const calcAverageCount = (jobs: RankedJob[], key: "skills_found" | "missing") => {
  if (!jobs.length) return 0;
  const total = jobs.reduce((sum, job) => sum + (job[key]?.length ?? 0), 0);
  return total / jobs.length;
};

const loadRanked = async (): Promise<RankedJob[]> => {
  try {
    const res = await fetch(`${API_BASE}/ranked`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.ranked) ? data.ranked : [];
  } catch {
    return [];
  }
};

const summarizeSkills = (jobs: RankedJob[]) => {
  const counts = new Map<string, number>();
  jobs.forEach((job) => {
    (job.skills_found ?? []).forEach((skill) => {
      const key = skill.trim().toLowerCase();
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
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
  jobs.forEach((job) => (job.skills_found ?? []).forEach((s) => set.add(s.toLowerCase().trim())));
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

const matchBuckets = (jobs: RankedJob[]) => {
  const ranges = [
    { label: "0-19%", min: 0, max: 19 },
    { label: "20-39%", min: 20, max: 39 },
    { label: "40-59%", min: 40, max: 59 },
    { label: "60-79%", min: 60, max: 79 },
    { label: "80-100%", min: 80, max: 100 },
  ];

  return ranges.map((r) => {
    const count = jobs.filter((job) => {
      const pct = job.match_percent ?? 0;
      return pct >= r.min && pct <= r.max;
    }).length;
    return { ...r, count };
  });
};

const loadProfileData = async (): Promise<ProfileData> => {
  try {
    const res = await fetch(`${API_BASE}/profile`, { cache: "no-store", headers: authHeader() });
    if (res.status === 401) {
      throw new Error("unauthorized");
    }
    if (!res.ok) return { position: "", skills: [] };
    const doc = await res.json();
    const skills = Array.isArray(doc?.skills) ? doc.skills : [];
    const position = typeof doc?.basics?.position === "string" ? doc.basics.position : "";
    return {
      position: position.trim(),
      skills: skills.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean),
    };
  } catch (error) {
    throw error;
  }
};

const loadAnalysis = async (keyword: string): Promise<AnalysisResponse | null> => {
  const cleanKeyword = keyword.trim();
  if (!cleanKeyword) return null;
  try {
    const res = await fetch(`${API_BASE}/analyse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ keyword: cleanKeyword }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as AnalysisResponse;
  } catch {
    return null;
  }
};

const refreshFromProfile = async (keyword: string, userSkills: string[]) => {
  const cleanKeyword = keyword.trim() || "software engineer";
  try {
    const res = await fetch(`${API_BASE}/jobs/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: cleanKeyword, userSkills }),
      cache: "no-store",
    });
    if (!res.ok) {
      return "Auto-refresh failed (backend error); showing last saved data.";
    }
    const data = await res.json();
    if (!data?.refreshed) {
      return "Showing cached data (recently refreshed).";
    }
    return "";
  } catch {
    return "Auto-refresh failed (backend error); showing last saved data.";
  }
};

const BarChart = ({
  data,
  max = Math.max(1, Math.max(...data.map((d) => d.count))),
  label,
  showLabel = false,
}: {
  data: { label: string; count: number }[];
  max?: number;
  label?: string;
  showLabel?: boolean;
}) => (
  <div className={styles.barWrap}>
    {showLabel ? (
      <div className={styles.barHeader}>
        <p className={styles.statLabel}>{label ?? "Chart"}</p>
      </div>
    ) : null}
    <div className={styles.barArea}>
      {data.map((d, idx) => {
        const width = max === 0 ? 0 : (d.count / max) * 100;
        return (
          <div key={`${d.label}-${idx}`} className={styles.barRow}>
            <span className={styles.barLabel}>{d.label}</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${width}%` }} />
            </div>
            <span className={styles.barCount}>{d.count}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default function MergeSkillsPage() {
  const [profile, setProfile] = useState<ProfileData>({ position: "", skills: [] });
  const [ranked, setRanked] = useState<RankedJob[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [refreshNote, setRefreshNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const profileData = await loadProfileData();
        if (ignore) return;
        setProfile(profileData);

        let note = "";
        try {
          note = await refreshFromProfile(profileData.position, profileData.skills);
        } catch (error) {
          console.error("Refresh from profile failed:", error);
          note = "Auto-refresh failed (python/selenium); showing last saved data.";
        }
        if (ignore) return;
        setRefreshNote(note);

        const rankedData = await loadRanked();
        if (ignore) return;
        setRanked(rankedData);

        const analysisData = await loadAnalysis(profileData.position);
        if (ignore) return;
        setAnalysis(analysisData);
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

  const searchKeyword = profile.position || "software engineer";
  const userSkills = profile.skills;
  const topSkills = summarizeSkills(ranked);
  const average = avgMatch(ranked);
  const withAnySkills = ranked.filter((j) => (j.skills_found ?? []).length > 0).length;
  const coverage = Math.round(coveragePercent(ranked));
  const topMissingSkills = topMissing(ranked);
  const buckets = matchBuckets(ranked);
  const uniqueSkills = uniqueSkillCount(ranked);
  const avgSkillsFound = calcAverageCount(ranked, "skills_found");
  const avgMissing = calcAverageCount(ranked, "missing");
  const strongMatches = ranked.filter((j) => (j.match_percent ?? 0) >= 80).length;
  const sortedByMatch = [...ranked].sort(
    (a, b) => (b.match_percent ?? 0) - (a.match_percent ?? 0),
  );
  const bestMatch = sortedByMatch[0];
  const lowestMatch = sortedByMatch[sortedByMatch.length - 1];
  const recommendations = analysis?.predictions?.recommendations ?? [];
  const timelineEntries = Object.entries(analysis?.predictions?.career_timeline ?? {});

  return (
    <div className={siderStyles.siderLayout}>
      <AppSider />
      <div className={siderStyles.siderContent}>
        <div className={styles.page}>
      <div className={styles.gradientOne} />
      <div className={styles.gradientTwo} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Skill radar</p>
            <h1 className={styles.title}>Skill story from your scraped jobs</h1>
            <p className={styles.lead}>
              A colorful snapshot of how every role aligns with your profile: strengths, gaps, and the
              skills showing up most often.
            </p>
            <div className={styles.heroChips}>
              <span className={styles.glowChip}>Role: {searchKeyword}</span>
              <span className={styles.glowChip}>Top skills: {topSkills.length}</span>
              <span className={styles.glowChip}>Gaps flagged: {topMissingSkills.length}</span>
              <span className={styles.glowChip}>Strong fits: {strongMatches}</span>
              {isLoading ? <span className={styles.glowChip}>Loading data...</span> : null}
              {loadError ? <span className={styles.glowChip}>{loadError}</span> : null}
              {refreshNote ? <span className={styles.glowChip}>{refreshNote}</span> : null}
            </div>
          </div>
          <div className={styles.heroOrb}>
            <div className={styles.orbRing}>
              <div className={styles.orbCore}>
                <p className={styles.orbLabel}>Avg match</p>
                <p className={styles.orbValue}>{Math.round(average)}%</p>
                <p className={styles.orbHint}>{ranked.length} ranked jobs</p>
              </div>
            </div>
            <div className={styles.orbFooter}>
              <div>
                <p className={styles.heroLabel}>Coverage</p>
                <p className={styles.heroNumber}>{coverage}%</p>
              </div>
              <div className={styles.heroLine} />
              <div>
                <p className={styles.heroLabel}>Strong fits</p>
                <p className={styles.heroNumber}>{strongMatches}</p>
              </div>
            </div>
          </div>
        </header>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Your skills</p>
            {userSkills.length === 0 ? (
              <p className={styles.muted}>No skills saved yet.</p>
            ) : (
              <div className={styles.skillChips}>
                {userSkills.map((skill) => (
                  <span key={skill} className={styles.skillChipSoft}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Jobs with skills</p>
            <p className={styles.statValue}>{withAnySkills}</p>
            <p className={styles.statHint}>Out of {ranked.length} ranked ads</p>
            <div className={styles.statBar}>
              <div className={styles.statFill} style={{ width: `${coverage}%` }} />
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Unique skills spotted</p>
            <p className={styles.statValue}>{uniqueSkills}</p>
            <p className={styles.statHint}>Across all roles</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Avg skills per ad</p>
            <p className={styles.statValue}>{avgSkillsFound.toFixed(1)}</p>
            <p className={styles.statHint}>Signals extracted per job</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Avg missing per ad</p>
            <p className={styles.statValue}>{avgMissing.toFixed(1)}</p>
            <p className={styles.statHint}>Gaps to focus on</p>
          </div>
        </section>

        <section className={styles.chartsRow}>
          <div className={styles.chartCard}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>Match distribution</p>
              <span className={styles.pill}>shape of the funnel</span>
            </div>
            <BarChart data={buckets} />
          </div>
          <div className={styles.chartCard}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>Top extracted</p>
              <span className={styles.pill}>most repeated</span>
            </div>
            <BarChart
              data={topSkills.map(({ skill, count }) => ({ label: skill, count }))}
              max={Math.max(1, Math.max(...topSkills.map((s) => s.count), 0))}
            />
          </div>
          <div className={styles.chartCard}>
            <div className={styles.cardHead}>
              <p className={styles.cardTitle}>Top missing</p>
              <span className={styles.pill}>where to upskill</span>
            </div>
            <div className={styles.skillChips}>
              {topMissingSkills.length === 0 ? (
                <span className={styles.muted}>No missing yet</span>
              ) : (
                topMissingSkills.map((item) => (
                  <span key={item.skill} className={styles.skillChipSoft}>
                    {item.skill} <span className={styles.skillCount}>A-{item.count}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        <section className={styles.highlightRow}>
          <div className={styles.highlightCard}>
            <p className={styles.cardTitle}>Best match</p>
            {bestMatch ? (
              <>
                <p className={styles.highlightRole}>
                  {bestMatch.position ?? "Untitled role"} <span>→ {bestMatch.match_percent}%</span>
                </p>
                <p className={styles.employer}>{bestMatch.employer ?? "Unknown employer"}</p>
                <div className={styles.chips}>
                  {(bestMatch.overlap ?? []).slice(0, 8).map((skill) => (
                    <span key={skill} className={styles.matchChip}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className={styles.muted}>No ranked data yet.</p>
            )}
          </div>
          <div className={styles.highlightCardSoft}>
            <p className={styles.cardTitle}>Toughest match</p>
            {lowestMatch ? (
              <>
                <p className={styles.highlightRole}>
                  {lowestMatch.position ?? "Untitled role"}{" "}
                  <span>→ {lowestMatch.match_percent ?? 0}%</span>
                </p>
                <p className={styles.employer}>{lowestMatch.employer ?? "Unknown employer"}</p>
                <div className={styles.chips}>
                  {(lowestMatch.missing ?? []).slice(0, 8).map((skill) => (
                    <span key={skill} className={styles.missingChip}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className={styles.muted}>No ranked data yet.</p>
            )}
          </div>
        </section>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Recommendations</p>
            {recommendations.length === 0 ? (
              <p className={styles.muted}>No recommendations yet.</p>
            ) : (
              <div className={styles.skillChips}>
                {recommendations.slice(0, 6).map((rec) => (
                  <span key={rec} className={styles.skillChipSoft}>
                    {rec}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Career timeline</p>
            {timelineEntries.length === 0 ? (
              <p className={styles.muted}>No roadmap yet.</p>
            ) : (
              <div className={styles.skillChips}>
                {timelineEntries.map(([key, data]) => (
                  <span key={key} className={styles.skillChipSoft}>
                    {key.replace("_", " ")}: {data.focus ?? "Focus"} ({data.opportunities ?? 0} jobs)
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.list}>
          {ranked.length === 0 ? (
            <div className={styles.empty}>
              <p>No ranked data found.</p>
              <p className={styles.muted}>Run the pipeline to create ranked jobs.</p>
            </div>
          ) : (
            ranked.map((job, idx) => {
              const skills = job.skills_found ?? [];
              const missing = job.missing ?? [];
              const overlap = job.overlap ?? [];
              const pct = Math.round(job.match_percent ?? 0);
              return (
                <article key={`${job.ref ?? "job"}-${idx}`} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.ref}>{job.ref ?? "No ref"}</p>
                      <h2 className={styles.jobTitle}>{job.position ?? "Untitled role"}</h2>
                      <p className={styles.employer}>{job.employer ?? "Unknown employer"}</p>
                    </div>
                    <div className={styles.scoreBadge}>
                      <span className={styles.scoreNumber}>{pct}%</span>
                      <span className={styles.scoreLabel}>match</span>
                    </div>
                  </div>

                  <div className={styles.progress}>
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>

                  <div className={styles.skillsRow}>
                    <p className={styles.subLabel}>Extracted skills</p>
                    {skills.length === 0 ? (
                      <span className={styles.muted}>None found</span>
                    ) : (
                      <div className={styles.chips}>
                        {skills.map((skill) => {
                          const isMatch = overlap.includes(skill);
                          const isMissing = missing.includes(skill);
                          const cls = isMatch
                            ? styles.matchChip
                            : isMissing
                              ? styles.missingChip
                              : styles.chip;
                          return (
                            <span key={skill} className={cls}>
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    {job.url ? (
                      <a href={job.url} className={styles.link} target="_blank" rel="noreferrer">
                        View on TopJobs
                      </a>
                    ) : (
                      <span className={styles.muted}>No external link</span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
        </div>
      </div>
    </div>
  );
}
