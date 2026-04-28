import styles from "./page.module.css";
import AppSider from "../../../components/market/app-sider";
import siderStyles from "../../../components/market/app-sider.module.css";
import SaveToProfileButton from "../../../components/market/save-to-profile-button";

type TrendEntry = {
  ranAt: string;
  keyword?: string;
  jobCount?: number;
  skillCounts?: Record<string, number>;
  roleCounts?: Record<string, number>;
};

type TrendItem = {
  term: string;
  current: number;
  baseline?: number;
  changePct?: number | null;
};

type TrendBucket = {
  emerging: TrendItem[];
  rising: TrendItem[];
  declining: TrendItem[];
  stable: TrendItem[];
};

type TrendSummary = {
  windowDays: number;
  snapshotCount: number;
  latestAt: string | null;
  skills: TrendBucket;
  roles: TrendBucket;
};

type RankedJob = {
  position?: string;
  employer?: string;
  match_percent?: number;
  overlap?: string[];
  missing?: string[];
  skills_found?: string[];
};

type JobView = {
  position?: string;
  employer?: string;
  url?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const emptySummary: TrendSummary = {
  windowDays: 0,
  snapshotCount: 0,
  latestAt: null,
  skills: { emerging: [], rising: [], declining: [], stable: [] },
  roles: { emerging: [], rising: [], declining: [], stable: [] },
};

const loadTrendData = async (): Promise<{ summary: TrendSummary; history: TrendEntry[] }> => {
  try {
    const [summaryRes, historyRes] = await Promise.all([
      fetch(`${API_BASE}/trends`, { cache: "no-store" }),
      fetch(`${API_BASE}/trends/history`, { cache: "no-store" }),
    ]);

    const summaryData = summaryRes.ok ? await summaryRes.json() : emptySummary;
    const historyData = historyRes.ok ? await historyRes.json() : {};
    const history = Array.isArray(historyData?.history) ? (historyData.history as TrendEntry[]) : [];

    return {
      summary: summaryData ?? emptySummary,
      history,
    };
  } catch {
    return { summary: emptySummary, history: [] };
  }
};

const loadRanked = async (): Promise<RankedJob[]> => {
  try {
    const res = await fetch(`${API_BASE}/ranked`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.ranked) ? (data.ranked as RankedJob[]) : [];
  } catch {
    return [];
  }
};

const loadJobs = async (): Promise<JobView[]> => {
  try {
    const res = await fetch(`${API_BASE}/jobs`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.jobs) ? (data.jobs as JobView[]) : [];
  } catch {
    return [];
  }
};

const normalizeSkill = (value: string) => value.trim().toLowerCase();

const buildTopSkills = (history: TrendEntry[]) => {
  const counts = new Map<string, number>();
  history.forEach((entry) => {
    const skillCounts = entry.skillCounts || {};
    Object.entries(skillCounts).forEach(([skill, count]) => {
      const key = normalizeSkill(skill);
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + (typeof count === "number" ? count : 0));
    });
  });
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({
      skill,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    }));
};

const categorizeSkill = (skill: string) => {
  const s = normalizeSkill(skill);
  if (/(react|vue|angular|next|css|html|frontend|typescript)/.test(s)) return "Frontend";
  if (/(node|express|spring|django|flask|api|backend|java|\.net)/.test(s)) return "Backend";
  if (/(sql|postgres|mysql|mongo|database|redis)/.test(s)) return "Database";
  if (/(aws|azure|gcp|cloud|lambda)/.test(s)) return "Cloud";
  if (/(docker|kubernetes|ci\/cd|devops|jenkins)/.test(s)) return "DevOps";
  if (/(test|qa|cypress|jest)/.test(s)) return "Testing";
  if (/(ml|ai|nlp|python|pytorch|tensorflow|llm)/.test(s)) return "AI/ML";
  if (/(flutter|android|ios|mobile|react native)/.test(s)) return "Mobile";
  return "Other";
};

const groupCategories = (skills: { skill: string }[]) => {
  const buckets = new Map<string, string[]>();
  skills.forEach((item) => {
    const category = categorizeSkill(item.skill);
    const list = buckets.get(category) ?? [];
    if (list.length < 8) list.push(item.skill);
    buckets.set(category, list);
  });
  return [...buckets.entries()].map(([label, list]) => ({ label, skills: list }));
};

const buildTrendSeries = (history: TrendEntry[]) => {
  const recent = [...history].slice(-4);
  const aggregated = buildTopSkills(recent);
  return aggregated.slice(0, 4).map((item) => ({
    skill: item.skill,
    values: recent.map((entry) => {
      const count = entry.skillCounts?.[item.skill] ?? 0;
      return typeof count === "number" ? count : 0;
    }),
  }));
};

const buildStudentGap = (ranked: RankedJob[]) => {
  const overlapCounts = new Map<string, number>();
  const missingCounts = new Map<string, number>();
  ranked.forEach((job) => {
    (job.overlap ?? []).forEach((skill) => {
      const key = normalizeSkill(skill);
      if (!key) return;
      overlapCounts.set(key, (overlapCounts.get(key) ?? 0) + 1);
    });
    (job.missing ?? []).forEach((skill) => {
      const key = normalizeSkill(skill);
      if (!key) return;
      missingCounts.set(key, (missingCounts.get(key) ?? 0) + 1);
    });
  });
  const have = [...overlapCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill]) => skill);
  const missing = [...missingCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill, count]) => ({
      skill,
      priority: count >= 6 ? "High" : count >= 3 ? "Medium" : "Low",
      score: Math.min(100, count * 12 + 40),
    }));
  return { have, missing };
};

const buildRoleDistribution = (jobs: JobView[]) => {
  const titles = jobs.map((job) => (job.position ?? "").toLowerCase());
  const counts = {
    junior: titles.filter((t) => t.includes("junior")).length,
    mid: titles.filter((t) => t.includes("associate") || t.includes("engineer")).length,
    senior: titles.filter((t) => t.includes("senior") || t.includes("lead")).length,
    intern: titles.filter((t) => t.includes("intern")).length,
  };
  const total = Math.max(1, Object.values(counts).reduce((sum, v) => sum + v, 0));
  return [
    { label: "Junior", value: Math.round((counts.junior / total) * 100) },
    { label: "Mid", value: Math.round((counts.mid / total) * 100) },
    { label: "Senior", value: Math.round((counts.senior / total) * 100) },
    { label: "Intern", value: Math.round((counts.intern / total) * 100) },
  ];
};

export default async function TrDashboardPage() {
  const [{ summary, history }, ranked, jobs] = await Promise.all([
    loadTrendData(),
    loadRanked(),
    loadJobs(),
  ]);

  const lastEntry = history[history.length - 1];
  const career = lastEntry?.keyword ? String(lastEntry.keyword) : "Career";
  const openings = lastEntry?.jobCount ?? jobs.length;
  const topSkills = buildTopSkills(history);
  const categories = groupCategories(topSkills);
  const trendSeries = buildTrendSeries(history);
  const student = buildStudentGap(ranked);
  const roleDistribution = buildRoleDistribution(jobs);

  const topLocations = ["Colombo", "Remote", "Hybrid"];
  const salaryRange = "Not available";
  const trendDelta =
    summary?.skills?.rising?.length || summary?.roles?.rising?.length
      ? "Rising demand in recent window"
      : "Stable demand in recent window";

  return (
    <div className={siderStyles.siderLayout}>
      <AppSider variant="light" />
      <div className={siderStyles.siderContent}>
        <div className={styles.page}>
          <div className={styles.hero}>
            <div>
              <p className={styles.kicker}>Career Guidance Dashboard</p>
              <h1 className={styles.title}>TR Dashboard</h1>
              <p className={styles.subtitle}>
                Executive view of market demand, skill gaps, and learning priorities.
              </p>
            </div>
            <div>
              <div className={styles.heroBadge}>Live snapshot</div>
              <SaveToProfileButton studentGap={student} topSkills={topSkills} career={career} />
            </div>
          </div>

          <section className={styles.overviewGrid}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Selected Career</p>
              <p className={styles.cardValue}>{career}</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Total Job Openings</p>
              <p className={styles.cardValue}>{openings}</p>
              <p className={styles.cardSub}>{trendDelta}</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Top 5 In-Demand Skills</p>
              <div className={styles.chips}>
                {topSkills.slice(0, 5).map((item) => (
                  <span key={item.skill} className={styles.chip}>
                    {item.skill}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Average Salary Range</p>
              <p className={styles.cardValue}>{salaryRange}</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Top Hiring Locations</p>
              <p className={styles.cardValueSm}>{topLocations.join(", ")}</p>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Skill Demand Analysis</h2>
              <p>Top skills by demand and category clusters.</p>
            </div>
            <div className={styles.gridTwo}>
              <div className={styles.panel}>
                <h3>Top Skills by Demand</h3>
                <div className={styles.barList}>
                  {topSkills.map((item) => (
                    <div key={item.skill} className={styles.barRow}>
                      <span className={styles.barLabel}>{item.skill}</span>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${item.percent}%` }} />
                      </div>
                      <span className={styles.barValue}>
                        {item.percent}% · {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.panel}>
                <h3>Skill Categories</h3>
                <div className={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <div key={cat.label} className={styles.categoryCard}>
                      <p className={styles.categoryLabel}>{cat.label}</p>
                      <p className={styles.categorySkills}>{cat.skills.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Skill Trend Over Time</h2>
              <p>Recent snapshots show which skills are rising or declining.</p>
            </div>
            <div className={styles.panel}>
              <div className={styles.trendGrid}>
                  {trendSeries.map((series) => {
                  const max = Math.max(...series.values);
                  return (
                    <div key={series.skill} className={styles.trendCard}>
                      <p className={styles.trendTitle}>{series.skill}</p>
                      <div className={styles.trendLine}>
                        {series.values.map((value, idx) => (
                          <div
                            key={`${series.skill}-${idx}`}
                            className={styles.trendPoint}
                            style={{ height: `${(value / max) * 100}%` }}
                          />
                        ))}
                      </div>
                      <p className={styles.trendMeta}>
                        Latest: {series.values[series.values.length - 1]}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Student Skill Gap Analysis</h2>
              <p>Personalized guidance based on market demand.</p>
            </div>
            <div className={styles.gridTwo}>
              <div className={styles.panel}>
                <h3>Skills You Have</h3>
                <div className={styles.chips}>
                  {student.have.map((skill) => (
                    <span key={skill} className={styles.chipPositive}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.panel}>
                <h3>Missing High-Demand Skills</h3>
                <div className={styles.missingList}>
                  {student.missing.map((item) => (
                    <div key={item.skill} className={styles.missingRow}>
                      <div>
                        <p className={styles.missingSkill}>{item.skill}</p>
                        <p className={styles.missingMeta}>Priority: {item.priority}</p>
                      </div>
                      <span className={styles.missingScore}>{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Career Path Suggestions</h2>
              <p>Roles that best match the current skill clusters.</p>
            </div>
            <div className={styles.gridThree}>
              {summary.roles.rising.slice(0, 3).map((role) => (
                <div key={role.term} className={styles.panel}>
                  <h3>{role.term}</h3>
                  <p className={styles.cardSub}>Demand: Rising</p>
                  <p className={styles.smallLabel}>Recent Count</p>
                  <p className={styles.cardValueSm}>{role.current}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Role Distribution Analysis</h2>
              <p>Entry-level feasibility and market competition.</p>
            </div>
            <div className={styles.gridTwo}>
              <div className={styles.panel}>
                <h3>Role Mix</h3>
                <div className={styles.pillGrid}>
                  {roleDistribution.map((role) => (
                    <div key={role.label} className={styles.pillCard}>
                      <p className={styles.pillLabel}>{role.label}</p>
                      <p className={styles.pillValue}>{role.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.panel}>
                <h3>Industry & Company Insights</h3>
                <p className={styles.smallLabel}>Top Hiring Companies</p>
                <p className={styles.cardValueSm}>
                  {[...new Set(jobs.map((job) => job.employer).filter(Boolean))].slice(0, 5).join(", ")}
                </p>
                <div className={styles.splitRow}>
                  <div>
                    <p className={styles.smallLabel}>Remote Share</p>
                    <p className={styles.cardValue}>
                      {Math.round(
                        (jobs.filter((job) => (job.position ?? "").toLowerCase().includes("remote")).length /
                          Math.max(1, jobs.length)) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <div>
                    <p className={styles.smallLabel}>Startup vs Enterprise</p>
                    <p className={styles.cardValueSm}>N/A</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Learning Roadmap</h2>
              <p>Suggested roadmap with estimated learning windows.</p>
            </div>
            <div className={styles.gridThree}>
              {["Month 1–2", "Month 3–4", "Month 5–6"].map((phase, idx) => {
                const skills = topSkills.slice(idx * 3, idx * 3 + 3).map((item) => item.skill);
                return (
                  <div key={phase} className={styles.panel}>
                    <h3>{phase}</h3>
                    <p className={styles.cardValueSm}>{skills.join(", ") || "No data yet"}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Future Market Prediction</h2>
              <p>Signals of emerging demand based on trend acceleration.</p>
            </div>
            <div className={styles.panel}>
              <p className={styles.cardValueSm}>
                Emerging skills detected:{" "}
                {summary.skills.emerging.slice(0, 3).map((item) => item.term).join(", ") || "Not yet"}
              </p>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Skill Frequency</p>
                  <p className={styles.metricValue}>
                    Top 10 cover {Math.min(100, Math.round(topSkills.reduce((sum, item) => sum + item.percent, 0)))}%
                    of listings
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Skill Growth Rate</p>
                  <p className={styles.metricValue}>
                    {summary.skills.rising[0]?.term ?? "N/A"}{" "}
                    {summary.skills.rising[0]?.changePct
                      ? `+${summary.skills.rising[0]?.changePct}%`
                      : ""}
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Stability Index</p>
                  <p className={styles.metricValue}>
                    {summary.skills.stable[0]?.term ?? "N/A"}
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Role Competition</p>
                  <p className={styles.metricValue}>{Math.round(openings / 3)} candidates/opening</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Junior/Senior Ratio</p>
                  <p className={styles.metricValue}>
                    {roleDistribution[0]?.value ?? 0}:{roleDistribution[2]?.value ?? 0}
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Cloud Adoption</p>
                  <p className={styles.metricValue}>
                    {Math.round(
                      (topSkills.filter((item) => categorizeSkill(item.skill) === "Cloud").length /
                        Math.max(1, topSkills.length)) *
                        100,
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
