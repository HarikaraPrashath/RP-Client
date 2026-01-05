import styles from "./page.module.css";
import AppSider from "../../components/app-sider";
import siderStyles from "../../components/app-sider.module.css";

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

type TrendEntry = {
  ranAt: string;
  keyword?: string;
  jobCount?: number;
  skillCounts?: Record<string, number>;
  roleCounts?: Record<string, number>;
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

const formatDate = (value?: string | null) => {
  if (!value) return "Not yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not yet";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatChange = (value?: number | null) => {
  if (value === null || value === undefined) return "new";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
};

const TrendList = ({
  title,
  items,
  tone,
  emptyLabel,
}: {
  title: string;
  items: TrendItem[];
  tone: "rise" | "fall" | "new";
  emptyLabel: string;
}) => (
  <div className={`${styles.panel} ${styles[`panel${tone}`]}`}>
    <div className={styles.panelHead}>
      <p className={styles.panelTitle}>{title}</p>
      <span className={styles.panelBadge}>{items.length}</span>
    </div>
    {items.length === 0 ? (
      <p className={styles.panelEmpty}>{emptyLabel}</p>
    ) : (
      <ul className={styles.panelList}>
        {items.map((item) => (
          <li key={`${title}-${item.term}`} className={styles.panelRow}>
            <div>
              <p className={styles.panelTerm}>{item.term}</p>
              <p className={styles.panelMeta}>
                <span className={styles.panelMetaLabel}>Current</span> {item.current}
                {typeof item.baseline === "number" ? (
                  <>
                    {" "}
                    <span className={styles.panelMetaDivider}>·</span>{" "}
                    <span className={styles.panelMetaLabel}>Baseline</span> {item.baseline}
                  </>
                ) : null}
              </p>
            </div>
            <span className={styles.panelDelta}>{formatChange(item.changePct)}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default async function TrendsPage() {
  const { summary, history } = await loadTrendData();
  const historySorted = [...history].sort(
    (a, b) => new Date(a.ranAt).getTime() - new Date(b.ranAt).getTime(),
  );
  const historySlice = historySorted.slice(-12);
  const maxJobs = Math.max(1, ...historySlice.map((entry) => entry.jobCount ?? 0));
  const lastEntry = historySorted[historySorted.length - 1];
  const keyword = lastEntry?.keyword ? String(lastEntry.keyword) : "Not set";
  const jobCount = lastEntry?.jobCount ?? 0;
  const chartWidth = 600;
  const chartHeight = 140;
  const chartPadding = 20;
  const chartPoints =
    historySlice.length === 0
      ? []
      : historySlice.map((entry, index) => {
          const x =
            historySlice.length === 1
              ? chartWidth / 2
              : chartPadding +
                (index / (historySlice.length - 1)) * (chartWidth - chartPadding * 2);
          const value = entry.jobCount ?? 0;
          const y =
            chartPadding +
            (1 - Math.min(1, value / maxJobs)) * (chartHeight - chartPadding * 2);
          return { x, y, value, label: formatDate(entry.ranAt) };
        });
  const chartPath =
    chartPoints.length === 0
      ? ""
      : chartPoints
          .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
          .join(" ");
  const chartAreaPath =
    chartPoints.length === 0
      ? ""
      : `${chartPath} L${chartPoints[chartPoints.length - 1].x},${
          chartHeight - chartPadding
        } L${chartPoints[0].x},${chartHeight - chartPadding} Z`;
  const windowSkillCounts = historySlice.reduce<Record<string, number>>((acc, entry) => {
    const skills = entry.skillCounts || {};
    Object.entries(skills).forEach(([term, count]) => {
      const key = term.trim().toLowerCase();
      if (!key) return;
      acc[key] = (acc[key] ?? 0) + (typeof count === "number" ? count : 0);
    });
    return acc;
  }, {});
  const topWindowSkills = Object.entries(windowSkillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([term, count]) => ({ term, count }));
  const maxWindowSkill = Math.max(1, ...topWindowSkills.map((item) => item.count));

  return (
    <div className={siderStyles.siderLayout}>
      <AppSider variant="light" />
      <div className={siderStyles.siderContent}>
        <div className={styles.page}>
          <div className={styles.glowOne} />
          <div className={styles.glowTwo} />
          <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Market trend radar</p>
            <h1 className={styles.title}>Track skill momentum over time</h1>
            <p className={styles.lead}>
              Each scrape saves a snapshot of job postings. Compare snapshots to spot the skills
              and roles gaining momentum or fading out.
            </p>
            <div className={styles.heroChips}>
              <span className={styles.heroChip}>Snapshots collected: {summary.snapshotCount}</span>
              <span className={styles.heroChip}>Lookback window: {summary.windowDays} days</span>
              <span className={styles.heroChip}>Most recent: {formatDate(summary.latestAt)}</span>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <div>
              <p className={styles.heroLabel}>Keyword focus</p>
              <p className={styles.heroValue}>{keyword}</p>
            </div>
            <div className={styles.heroDivider} />
            <div>
              <p className={styles.heroLabel}>Jobs captured</p>
              <p className={styles.heroValue}>{jobCount}</p>
            </div>
          </div>
        </header>

        <section className={styles.timeline}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionKicker}>Scrape timeline</p>
              <h2 className={styles.sectionTitle}>Multiple scrapes, stacked in time</h2>
            </div>
            <p className={styles.sectionMeta}>{historySlice.length} recent snapshots</p>
          </div>
          {historySlice.length === 0 ? (
            <div className={styles.emptyCard}>
              <p className={styles.emptyTitle}>No trend history yet</p>
              <p className={styles.emptyText}>
                Run a job refresh to store a snapshot, or seed demo data from the server.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.timelineChart}>
                <div className={styles.timelineChartHead}>
                  <p className={styles.timelineChartTitle}>Job count trend</p>
                  <p className={styles.timelineChartMeta}>Relative volume per snapshot</p>
                </div>
                <svg
                  className={styles.timelineSvg}
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  role="img"
                  aria-label="Line chart showing job counts per snapshot"
                >
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
                      <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                    </linearGradient>
                  </defs>
                  <rect
                    x={chartPadding}
                    y={chartPadding}
                    width={chartWidth - chartPadding * 2}
                    height={chartHeight - chartPadding * 2}
                    className={styles.timelineGrid}
                  />
                  <path d={chartAreaPath} fill="url(#trendFill)" />
                  <path d={chartPath} className={styles.timelineLine} />
                  {chartPoints.map((point) => (
                    <g key={`${point.label}-${point.value}`}>
                      <circle cx={point.x} cy={point.y} r="4" className={styles.timelineDot} />
                      <text x={point.x} y={chartHeight - 6} className={styles.timelineTick}>
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className={styles.timelineSkills}>
                <div className={styles.timelineSkillsHead}>
                  <p className={styles.timelineSkillsTitle}>Highly available skills</p>
                  <p className={styles.timelineSkillsMeta}>Most frequent in this window</p>
                </div>
                {topWindowSkills.length === 0 ? (
                  <p className={styles.timelineSkillsEmpty}>No skill data yet.</p>
                ) : (
                  <>
                    <div className={styles.timelineSkillsChart}>
                      {topWindowSkills.map((item) => {
                        const width = (item.count / maxWindowSkill) * 100;
                        return (
                          <div key={item.term} className={styles.timelineSkillRow}>
                            <span className={styles.timelineSkillName}>{item.term}</span>
                            <div className={styles.timelineSkillBarTrack}>
                              <div
                                className={styles.timelineSkillBarFill}
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <span className={styles.timelineSkillValue}>{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.timelineSkillChips}>
                      {topWindowSkills.map((item) => (
                        <span key={item.term} className={styles.timelineSkillChip}>
                          {item.term} <span className={styles.timelineSkillCount}>{item.count}</span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionKicker}>Trending skills</p>
              <h2 className={styles.sectionTitle}>Signals from the skill stream</h2>
            </div>
            <p className={styles.sectionMeta}>Compared with earlier snapshots in the window</p>
          </div>
          <div className={styles.panelGrid}>
            <TrendList
              title="Emerging"
              items={summary.skills.emerging}
              tone="new"
              emptyLabel="No new skills yet."
            />
            <TrendList
              title="Rising"
              items={summary.skills.rising}
              tone="rise"
              emptyLabel="No strong risers yet."
            />
            <TrendList
              title="Declining"
              items={summary.skills.declining}
              tone="fall"
              emptyLabel="No declines yet."
            />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionKicker}>Emerging roles</p>
              <h2 className={styles.sectionTitle}>Role momentum across snapshots</h2>
            </div>
            <p className={styles.sectionMeta}>Role counts are based on job titles</p>
          </div>
          <div className={styles.panelGrid}>
            <TrendList
              title="Emerging"
              items={summary.roles.emerging}
              tone="new"
              emptyLabel="No new roles yet."
            />
            <TrendList
              title="Rising"
              items={summary.roles.rising}
              tone="rise"
              emptyLabel="No strong risers yet."
            />
            <TrendList
              title="Declining"
              items={summary.roles.declining}
              tone="fall"
              emptyLabel="No declines yet."
            />
          </div>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
