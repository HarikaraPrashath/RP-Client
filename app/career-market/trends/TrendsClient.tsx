"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

export type TrendItem = {
  term: string;
  current: number;
  baseline?: number;
  changePct?: number | null;
};

export type TrendBucket = {
  emerging: TrendItem[];
  rising: TrendItem[];
  declining: TrendItem[];
  stable: TrendItem[];
};

export type TrendSummary = {
  windowDays: number;
  snapshotCount: number;
  latestAt: string | null;
  skills: TrendBucket;
  roles: TrendBucket;
};

export type TrendEntry = {
  ranAt: string;
  keyword?: string;
  jobCount?: number;
  skillCounts?: Record<string, number>;
  roleCounts?: Record<string, number>;
};

type TrendsClientProps = {
  summary: TrendSummary;
  history: TrendEntry[];
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not yet";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateLong = (value?: string | null) => {
  if (!value) return "Not yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not yet";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatMonth = (value?: string | null) => {
  if (!value) return "Not yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not yet";
  return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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
                    <span className={styles.panelMetaDivider}>-</span>{" "}
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

export default function TrendsClient({ summary, history }: TrendsClientProps) {
  const historySorted = useMemo(
    () => [...history].sort((a, b) => new Date(a.ranAt).getTime() - new Date(b.ranAt).getTime()),
    [history],
  );
  const [windowSize, setWindowSize] = useState(() => Math.min(12, Math.max(6, historySorted.length)));
  const [mode, setMode] = useState<"skills" | "roles">("skills");
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [skillActiveIndex, setSkillActiveIndex] = useState<number | null>(null);
  const [skillView, setSkillView] = useState<"daily" | "monthly">("daily");
  const maxSnapshots = historySorted.length;

  const historySlice = historySorted.slice(-windowSize);
  const maxJobs = Math.max(1, ...historySlice.map((entry) => entry.jobCount ?? 0));
  const lastEntry = historySorted[historySorted.length - 1];
  const keyword = lastEntry?.keyword ? String(lastEntry.keyword) : "Not set";
  const jobCount = lastEntry?.jobCount ?? 0;
  const chartWidth = 680;
  const chartHeight = 160;
  const chartPadding = 22;

  const chartPoints = useMemo(() => {
    if (historySlice.length === 0) return [];
    return historySlice.map((entry, index) => {
      const x =
        historySlice.length === 1
          ? chartWidth / 2
          : chartPadding + (index / (historySlice.length - 1)) * (chartWidth - chartPadding * 2);
      const value = entry.jobCount ?? 0;
      const y =
        chartPadding + (1 - Math.min(1, value / maxJobs)) * (chartHeight - chartPadding * 2);
      return { x, y, value, label: formatDate(entry.ranAt), rawDate: entry.ranAt };
    });
  }, [historySlice, maxJobs]);

  const chartPath =
    chartPoints.length === 0
      ? ""
      : chartPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const chartAreaPath =
    chartPoints.length === 0
      ? ""
      : `${chartPath} L${chartPoints[chartPoints.length - 1].x},${chartHeight - chartPadding} L${chartPoints[0].x},${chartHeight - chartPadding} Z`;

  const activePoint = activeIndex !== null ? chartPoints[activeIndex] : null;

  const handleChartMove: React.MouseEventHandler<SVGSVGElement> = (event) => {
    if (chartPoints.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * chartWidth;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    chartPoints.forEach((point, index) => {
      const delta = Math.abs(point.x - x);
      if (delta < distance) {
        distance = delta;
        closest = index;
      }
    });
    setActiveIndex(closest);
  };

  const handleChartLeave = () => setActiveIndex(null);

  const skillChartWidth = 680;
  const skillChartHeight = 170;
  const skillChartPadding = 22;

  const windowSkillCounts = useMemo(() => {
    return historySlice.reduce<Record<string, number>>((acc, entry) => {
      const skills = entry.skillCounts || {};
      Object.entries(skills).forEach(([term, count]) => {
        const key = term.trim().toLowerCase();
        if (!key) return;
        acc[key] = (acc[key] ?? 0) + (typeof count === "number" ? count : 0);
      });
      return acc;
    }, {});
  }, [historySlice]);

  const topWindowSkills = useMemo(() => {
    return Object.entries(windowSkillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));
  }, [windowSkillCounts]);

  const maxWindowSkill = Math.max(1, ...topWindowSkills.map((item) => item.count));

  const allSkillTotals = useMemo(() => {
    return historySorted.reduce<Record<string, number>>((acc, entry) => {
      const skills = entry.skillCounts || {};
      Object.entries(skills).forEach(([term, count]) => {
        const key = term.trim().toLowerCase();
        if (!key) return;
        acc[key] = (acc[key] ?? 0) + (typeof count === "number" ? count : 0);
      });
      return acc;
    }, {});
  }, [historySorted]);

  const skillOptions = useMemo(
    () =>
      Object.entries(allSkillTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([term]) => term),
    [allSkillTotals],
  );

  const [selectedSkill, setSelectedSkill] = useState(() => skillOptions[0] ?? "");

  const effectiveSkill = selectedSkill || skillOptions[0] || "";

  const skillSeriesDaily = useMemo(() => {
    if (!effectiveSkill) return [];
    return historySorted.map((entry) => {
      let count = 0;
      const skills = entry.skillCounts || {};
      Object.entries(skills).forEach(([term, value]) => {
        if (term.trim().toLowerCase() === effectiveSkill) {
          count = typeof value === "number" ? value : 0;
        }
      });
      return { ranAt: entry.ranAt, count };
    });
  }, [effectiveSkill, historySorted]);

  const skillSeriesMonthly = useMemo(() => {
    if (!effectiveSkill) return [];
    const map = new Map<string, { month: string; count: number }>();
    skillSeriesDaily.forEach((entry) => {
      const parsed = new Date(entry.ranAt);
      if (Number.isNaN(parsed.getTime())) return;
      const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
      const current = map.get(key);
      map.set(key, {
        month: key,
        count: (current?.count ?? 0) + entry.count,
      });
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [effectiveSkill, skillSeriesDaily]);

  const skillSeries = skillView === "daily" ? skillSeriesDaily : skillSeriesMonthly;

  const maxSkillCount = Math.max(
    1,
    ...(skillView === "daily" ? skillSeriesDaily.map((item) => item.count) : skillSeriesMonthly.map((item) => item.count)),
  );

  const skillChartPoints = useMemo(() => {
    if (skillSeries.length === 0) return [];
    return skillSeries.map((entry, index) => {
      const x =
        skillSeries.length === 1
          ? skillChartWidth / 2
          : skillChartPadding +
            (index / (skillSeries.length - 1)) * (skillChartWidth - skillChartPadding * 2);
      const y =
        skillChartPadding +
        (1 - Math.min(1, entry.count / maxSkillCount)) * (skillChartHeight - skillChartPadding * 2);
      return {
        x,
        y,
        count: entry.count,
        label: skillView === "daily" ? formatDate(entry.ranAt) : formatMonth(entry.month),
        rawDate: "ranAt" in entry ? entry.ranAt : entry.month,
      };
    });
  }, [skillSeries, maxSkillCount, skillView]);

  const skillChartPath =
    skillChartPoints.length === 0
      ? ""
      : skillChartPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");

  const skillChartAreaPath =
    skillChartPoints.length === 0
      ? ""
      : `${skillChartPath} L${skillChartPoints[skillChartPoints.length - 1].x},${
          skillChartHeight - skillChartPadding
        } L${skillChartPoints[0].x},${skillChartHeight - skillChartPadding} Z`;

  const skillActivePoint = skillActiveIndex !== null ? skillChartPoints[skillActiveIndex] : null;

  const handleSkillChartMove: React.MouseEventHandler<SVGSVGElement> = (event) => {
    if (skillChartPoints.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * skillChartWidth;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    skillChartPoints.forEach((point, index) => {
      const delta = Math.abs(point.x - x);
      if (delta < distance) {
        distance = delta;
        closest = index;
      }
    });
    setSkillActiveIndex(closest);
  };

  const handleSkillChartLeave = () => setSkillActiveIndex(null);

  const peakDay = skillSeriesDaily.reduce<{ ranAt: string; count: number } | null>((acc, entry) => {
    if (!acc || entry.count > acc.count) return entry;
    return acc;
  }, null);

  const peakMonth = skillSeriesMonthly.reduce<{ month: string; count: number } | null>((acc, entry) => {
    if (!acc || entry.count > acc.count) return entry;
    return acc;
  }, null);

  const filteredBuckets = useMemo(() => {
    const buckets = summary[mode];
    const needle = search.trim().toLowerCase();
    const filterList = (items: TrendItem[]) =>
      needle ? items.filter((item) => item.term.toLowerCase().includes(needle)) : items;
    return {
      emerging: filterList(buckets.emerging),
      rising: filterList(buckets.rising),
      declining: filterList(buckets.declining),
    };
  }, [summary, mode, search]);

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
              Each scrape saves a snapshot of job postings. Compare snapshots to spot the skills and roles
              gaining momentum or fading out.
            </p>
            <div className={styles.heroChips}>
              <span className={styles.heroChip}>{summary.windowDays || 7} day window</span>
              <span className={styles.heroChip}>{summary.snapshotCount} snapshots</span>
              <span className={styles.heroChip}>Updated {formatDate(summary.latestAt)}</span>
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

        <section className={styles.skillExplorer}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionKicker}>Skill explorer</p>
              <h2 className={styles.sectionTitle}>See when a skill spikes</h2>
            </div>
            <p className={styles.sectionMeta}>Track demand by day or month</p>
          </div>

          <div className={styles.explorerControls}>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Skill</span>
              <select
                className={styles.controlSelect}
                value={effectiveSkill}
                onChange={(event) => setSelectedSkill(event.target.value)}
              >
                {skillOptions.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>View</span>
              {(["daily", "monthly"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.controlButton} ${skillView === value ? styles.controlButtonActive : ""}`}
                  onClick={() => setSkillView(value)}
                >
                  {value === "daily" ? "Daily" : "Monthly"}
                </button>
              ))}
            </div>
            <div className={styles.quickChips}>
              {topWindowSkills.slice(0, 6).map((item) => (
                <button
                  key={item.term}
                  type="button"
                  className={`${styles.quickChip} ${item.term === effectiveSkill ? styles.quickChipActive : ""}`}
                  onClick={() => setSelectedSkill(item.term)}
                >
                  {item.term}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.explorerGrid}>
            <div className={styles.explorerChart}>
              <div className={styles.timelineChartHead}>
                <p className={styles.timelineChartTitle}>{effectiveSkill || "Select a skill"}</p>
                <p className={styles.timelineChartMeta}>
                  {skillView === "daily" ? "Snapshot-by-snapshot counts" : "Aggregated by month"}
                </p>
              </div>
              <div className={styles.timelineChartShell}>
                <svg
                  className={styles.timelineSvg}
                  viewBox={`0 0 ${skillChartWidth} ${skillChartHeight}`}
                  role="img"
                  aria-label="Line chart showing skill frequency"
                  onMouseMove={handleSkillChartMove}
                  onMouseLeave={handleSkillChartLeave}
                >
                  <defs>
                    <linearGradient id="skillFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.35)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                  </defs>
                  <rect
                    x={skillChartPadding}
                    y={skillChartPadding}
                    width={skillChartWidth - skillChartPadding * 2}
                    height={skillChartHeight - skillChartPadding * 2}
                    className={styles.timelineGrid}
                  />
                  <path d={skillChartAreaPath} fill="url(#skillFill)" />
                  <path d={skillChartPath} className={styles.timelineLineAlt} />
                  {skillChartPoints.map((point, index) => (
                    <g key={`${point.rawDate}-${point.count}-${index}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={skillActiveIndex === index ? 6 : 4}
                        className={`${styles.timelineDotAlt} ${skillActiveIndex === index ? styles.timelineDotActive : ""}`}
                      />
                    </g>
                  ))}
                  {skillActivePoint ? (
                    <line
                      x1={skillActivePoint.x}
                      x2={skillActivePoint.x}
                      y1={skillChartPadding}
                      y2={skillChartHeight - skillChartPadding}
                      className={styles.timelineMarkerLine}
                    />
                  ) : null}
                </svg>
                {skillActivePoint ? (
                  <div className={styles.timelineTooltip}>
                    <p className={styles.timelineTooltipLabel}>{skillActivePoint.label}</p>
                    <p className={styles.timelineTooltipValue}>{skillActivePoint.count} mentions</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.explorerStats}>
              <div className={styles.explorerCard}>
                <p className={styles.explorerLabel}>Peak day</p>
                <p className={styles.explorerValue}>{peakDay ? formatDateLong(peakDay.ranAt) : "Not yet"}</p>
                <p className={styles.explorerMeta}>{peakDay ? `${peakDay.count} mentions` : "No snapshots"}</p>
              </div>
              <div className={styles.explorerCard}>
                <p className={styles.explorerLabel}>Peak month</p>
                <p className={styles.explorerValue}>
                  {peakMonth ? formatMonth(`${peakMonth.month}-01`) : "Not yet"}
                </p>
                <p className={styles.explorerMeta}>{peakMonth ? `${peakMonth.count} mentions` : "No snapshots"}</p>
              </div>
            </div>
          </div>
        </section>\n\n<section className={styles.timeline}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionKicker}>Scrape timeline</p>
              <h2 className={styles.sectionTitle}>Multiple scrapes, stacked in time</h2>
            </div>
            <p className={styles.sectionMeta}>{historySlice.length} recent snapshots</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Window</span>
              {[6, 12, 20].map((size) => {
                const disabled = maxSnapshots > 0 && maxSnapshots < size;
                return (
                <button
                  key={size}
                  type="button"
                  className={`${styles.controlButton} ${windowSize === size ? styles.controlButtonActive : ""}`}
                  onClick={() => setWindowSize(Math.min(size, maxSnapshots || size))}
                  disabled={disabled}
                  aria-disabled={disabled}
                >
                  {size} snapshots
                </button>
              )})}
            </div>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Mode</span>
              {(["skills", "roles"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.controlButton} ${mode === value ? styles.controlButtonActive : ""}`}
                  onClick={() => setMode(value)}
                >
                  {value === "skills" ? "Skills" : "Roles"}
                </button>
              ))}
            </div>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Filter</span>
              <input
                className={styles.controlInput}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search terms"
              />
            </div>
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
                  <p className={styles.timelineChartMeta}>Hover to inspect each snapshot</p>
                </div>
                <div className={styles.timelineChartShell}>
                  <svg
                    className={styles.timelineSvg}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    role="img"
                    aria-label="Line chart showing job counts per snapshot"
                    onMouseMove={handleChartMove}
                    onMouseLeave={handleChartLeave}
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
                    {chartPoints.map((point, index) => (
                      <g key={`${point.rawDate}-${point.value}-${index}`}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={activeIndex === index ? 6 : 4}
                          className={`${styles.timelineDot} ${activeIndex === index ? styles.timelineDotActive : ""}`}
                        />
                      </g>
                    ))}
                    {activePoint ? (
                      <line
                        x1={activePoint.x}
                        x2={activePoint.x}
                        y1={chartPadding}
                        y2={chartHeight - chartPadding}
                        className={styles.timelineMarkerLine}
                      />
                    ) : null}
                    {chartPoints.map((point, index) => (
                      <text
                        key={`${point.rawDate}-tick-${index}`}
                        x={point.x}
                        y={chartHeight - 6}
                        className={styles.timelineTick}
                      >
                        {point.label}
                      </text>
                    ))}
                  </svg>
                  {activePoint ? (
                    <div className={styles.timelineTooltip}>
                      <p className={styles.timelineTooltipLabel}>{formatDate(activePoint.rawDate)}</p>
                      <p className={styles.timelineTooltipValue}>{activePoint.value} jobs</p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.timelineSkills}>
                <div className={styles.timelineSkillsHead}>
                  <div>
                    <p className={styles.timelineSkillsTitle}>Highly available skills</p>
                    <p className={styles.timelineSkillsMeta}>Most frequent in this window</p>
                  </div>
                  <p className={styles.timelineSkillsMeta}>{topWindowSkills.length} highlights</p>
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
              <p className={styles.sectionKicker}>{mode === "skills" ? "Trending skills" : "Trending roles"}</p>
              <h2 className={styles.sectionTitle}>
                {mode === "skills" ? "Signals from the skill stream" : "Role momentum across snapshots"}
              </h2>
            </div>
            <p className={styles.sectionMeta}>
              {search ? `Filtered by “${search}”` : "Compared with earlier snapshots in the window"}
            </p>
          </div>
          <div className={styles.panelGrid}>
            <TrendList
              title="Emerging"
              items={filteredBuckets.emerging}
              tone="new"
              emptyLabel="No new signals yet."
            />
            <TrendList
              title="Rising"
              items={filteredBuckets.rising}
              tone="rise"
              emptyLabel="No strong risers yet."
            />
            <TrendList
              title="Declining"
              items={filteredBuckets.declining}
              tone="fall"
              emptyLabel="No declines yet."
            />
          </div>
        </section>
      </div>
    </div>
  );
}


