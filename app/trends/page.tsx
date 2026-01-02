import styles from "./page.module.css";

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
                current {item.current}
                {typeof item.baseline === "number" ? `, baseline ${item.baseline}` : ""}
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

  return (
    <div className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Market trend radar</p>
            <h1 className={styles.title}>Track skill momentum over time</h1>
            <p className={styles.lead}>
              Each scrape drops a snapshot into the timeline so you can see emerging skills,
              rising roles, and the signals that are fading out.
            </p>
            <div className={styles.heroChips}>
              <span className={styles.heroChip}>Snapshots: {summary.snapshotCount}</span>
              <span className={styles.heroChip}>Window: {summary.windowDays} days</span>
              <span className={styles.heroChip}>Latest: {formatDate(summary.latestAt)}</span>
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
            <div className={styles.timelineBars}>
              {historySlice.map((entry) => {
                const height = Math.max(8, (entry.jobCount ?? 0) / maxJobs * 100);
                return (
                  <div key={entry.ranAt} className={styles.timelineBar}>
                    <div className={styles.timelineFill} style={{ height: `${height}%` }} />
                    <span className={styles.timelineLabel}>{formatDate(entry.ranAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionKicker}>Trending skills</p>
              <h2 className={styles.sectionTitle}>Signals from the skill stream</h2>
            </div>
            <p className={styles.sectionMeta}>Based on the latest scrape vs baseline</p>
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
  );
}
