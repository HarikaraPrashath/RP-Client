"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles, Calendar, Layers, Clock } from "lucide-react";
import { MetricBlock } from "../../../components/market/merge-skill-components";

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
}) => {
  const Icon = tone === "rise" ? TrendingUp : tone === "fall" ? TrendingDown : Sparkles;
  const toneColor = tone === "rise" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : tone === "fall" ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : "text-blue-500 bg-blue-500/10 border-blue-500/20";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 flex flex-col shadow-sm"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${toneColor}`}>
            <Icon size={18} />
          </div>
          <h3 className="text-lg font-black tracking-tight">{title}</h3>
        </div>
        <span className="text-xs font-bold bg-muted px-2 py-1 rounded-md">{items.length}</span>
      </div>
      
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-sm font-medium text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={`${title}-${item.term}`} className="flex items-center justify-between group">
              <div>
                <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.term}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current: {item.current}</span>
                  {typeof item.baseline === "number" && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Base: {item.baseline}</span>
                    </>
                  )}
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${toneColor}`}>
                {formatChange(item.changePct)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

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
  const chartTicks = useMemo(() => {
    const max = Math.max(1, maxJobs);
    const mid = Math.round(max / 2);
    return [
      { label: String(max), value: max },
      { label: String(mid), value: mid },
      { label: "0", value: 0 },
    ];
  }, [maxJobs]);

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
  const skillTicks = useMemo(() => {
    const max = Math.max(1, maxSkillCount);
    const mid = Math.round(max / 2);
    return [
      { label: String(max), value: max },
      { label: String(mid), value: mid },
      { label: "0", value: 0 },
    ];
  }, [maxSkillCount]);

  const skillChartPoints = useMemo(() => {
    if (skillSeries.length === 0) return [];
    const buildPoint = (count: number, index: number, label: string, rawDate: string) => {
      const x =
        skillSeries.length === 1
          ? skillChartWidth / 2
          : skillChartPadding +
            (index / (skillSeries.length - 1)) * (skillChartWidth - skillChartPadding * 2);
      const y =
        skillChartPadding +
        (1 - Math.min(1, count / maxSkillCount)) * (skillChartHeight - skillChartPadding * 2);
      return { x, y, count, label, rawDate };
    };

    if (skillView === "daily") {
      return skillSeriesDaily.map((entry, index) =>
        buildPoint(entry.count, index, formatDate(entry.ranAt), entry.ranAt),
      );
    }
    return skillSeriesMonthly.map((entry, index) =>
      buildPoint(entry.count, index, formatMonth(entry.month), entry.month),
    );
  }, [skillSeries, maxSkillCount, skillView, skillSeriesDaily, skillSeriesMonthly]);

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

  const windowRoleCounts = useMemo(() => {
    return historySlice.reduce<Record<string, number>>((acc, entry) => {
      const roles = entry.roleCounts || {};
      Object.entries(roles).forEach(([term, count]) => {
        const key = term.trim().toLowerCase();
        if (!key) return;
        acc[key] = (acc[key] ?? 0) + (typeof count === "number" ? count : 0);
      });
      return acc;
    }, {});
  }, [historySlice]);

  const topWindowRoles = useMemo(() => {
    return Object.entries(windowRoleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([term, count]) => ({ term, count }));
  }, [windowRoleCounts]);

  const allRoleTotals = useMemo(() => {
    return historySorted.reduce<Record<string, number>>((acc, entry) => {
      const roles = entry.roleCounts || {};
      Object.entries(roles).forEach(([term, count]) => {
        const key = term.trim().toLowerCase();
        if (!key) return;
        acc[key] = (acc[key] ?? 0) + (typeof count === "number" ? count : 0);
      });
      return acc;
    }, {});
  }, [historySorted]);

  const roleOptions = useMemo(
    () =>
      Object.entries(allRoleTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([term]) => term),
    [allRoleTotals],
  );

  const [selectedRole, setSelectedRole] = useState(() => roleOptions[0] ?? "");
  const [roleView, setRoleView] = useState<"daily" | "monthly">("daily");
  const [roleActiveIndex, setRoleActiveIndex] = useState<number | null>(null);

  const effectiveRole = selectedRole || roleOptions[0] || "";

  const roleSeriesDaily = useMemo(() => {
    if (!effectiveRole) return [];
    return historySorted.map((entry) => {
      let count = 0;
      const roles = entry.roleCounts || {};
      Object.entries(roles).forEach(([term, value]) => {
        if (term.trim().toLowerCase() === effectiveRole) {
          count = typeof value === "number" ? value : 0;
        }
      });
      return { ranAt: entry.ranAt, count };
    });
  }, [effectiveRole, historySorted]);

  const roleSeriesMonthly = useMemo(() => {
    if (!effectiveRole) return [];
    const map = new Map<string, { month: string; count: number }>();
    roleSeriesDaily.forEach((entry) => {
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
  }, [effectiveRole, roleSeriesDaily]);

  const roleSeries = roleView === "daily" ? roleSeriesDaily : roleSeriesMonthly;

  const roleChartWidth = 520;
  const roleChartHeight = 140;
  const roleChartPadding = 18;
  const maxRoleCount = Math.max(
    1,
    ...(roleView === "daily" ? roleSeriesDaily.map((item) => item.count) : roleSeriesMonthly.map((item) => item.count)),
  );

  const roleChartPoints = useMemo(() => {
    if (roleSeries.length === 0) return [];
    const buildPoint = (count: number, index: number, label: string, rawDate: string) => {
      const x =
        roleSeries.length === 1
          ? roleChartWidth / 2
          : roleChartPadding +
            (index / (roleSeries.length - 1)) * (roleChartWidth - roleChartPadding * 2);
      const y =
        roleChartPadding +
        (1 - Math.min(1, count / maxRoleCount)) * (roleChartHeight - roleChartPadding * 2);
      return { x, y, count, label, rawDate };
    };

    if (roleView === "daily") {
      return roleSeriesDaily.map((entry, index) =>
        buildPoint(entry.count, index, formatDate(entry.ranAt), entry.ranAt),
      );
    }
    return roleSeriesMonthly.map((entry, index) =>
      buildPoint(entry.count, index, formatMonth(entry.month), entry.month),
    );
  }, [roleSeries, maxRoleCount, roleView, roleSeriesDaily, roleSeriesMonthly]);

  const roleChartPath =
    roleChartPoints.length === 0
      ? ""
      : roleChartPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");

  const roleChartAreaPath =
    roleChartPoints.length === 0
      ? ""
      : `${roleChartPath} L${roleChartPoints[roleChartPoints.length - 1].x},${
          roleChartHeight - roleChartPadding
        } L${roleChartPoints[0].x},${roleChartHeight - roleChartPadding} Z`;

  const roleActivePoint = roleActiveIndex !== null ? roleChartPoints[roleActiveIndex] : null;

  const handleRoleChartMove: React.MouseEventHandler<SVGSVGElement> = (event) => {
    if (roleChartPoints.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * roleChartWidth;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    roleChartPoints.forEach((point, index) => {
      const delta = Math.abs(point.x - x);
      if (delta < distance) {
        distance = delta;
        closest = index;
      }
    });
    setRoleActiveIndex(closest);
  };

  const handleRoleChartLeave = () => setRoleActiveIndex(null);

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
    <div className="min-h-screen max-w-[1400px] mx-auto space-y-8 pb-12 p-4 lg:p-8">
      {/* HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Track skill momentum over time</h1>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Each scrape saves a snapshot of job postings. Compare snapshots to spot the skills and roles gaining momentum or fading out.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MetricBlock icon={Calendar} label="Window" value={`${summary.windowDays || 7} Days`} />
          <MetricBlock icon={Layers} label="Snapshots" value={summary.snapshotCount} />
          <MetricBlock icon={Clock} label="Updated" value={formatDate(summary.latestAt)} hint={keyword !== "Not set" ? keyword : undefined} />
        </div>
      </motion.div>

      {/* SCRAPE TIMELINE & TOP SKILLS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-8"
      >
        {/* Job Count Trend */}
        <div className="xl:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">Job count trend</h2>
              <p className="text-xs text-muted-foreground font-medium">Multiple scrapes, stacked in time ({historySlice.length} recent snapshots)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Window:</span>
              <div className="flex items-center bg-muted p-1 rounded-lg">
                {[6, 12, 20].map((size) => {
                  const disabled = maxSnapshots > 0 && maxSnapshots < size;
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${windowSize === size ? "bg-background shadow-sm text-foreground" : disabled ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setWindowSize(Math.min(size, maxSnapshots || size))}
                      disabled={disabled}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {historySlice.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/10 p-8">
              <p className="text-lg font-bold text-muted-foreground">No trend history yet</p>
              <p className="text-sm text-muted-foreground/60">Run a job refresh to store a snapshot.</p>
            </div>
          ) : (
            <div className="relative h-[240px] w-full rounded-xl border border-border bg-muted/20 overflow-hidden flex-1">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                onMouseMove={handleChartMove}
                onMouseLeave={handleChartLeave}
              >
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {chartTicks.map((tick) => {
                  const y = chartPadding + (1 - Math.min(1, tick.value / maxJobs)) * (chartHeight - chartPadding * 2);
                  return (
                    <g key={`jobs-tick-${tick.value}`}>
                      <line x1={chartPadding} x2={chartWidth - chartPadding} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
                      <text x={6} y={y + 4} className="fill-muted-foreground text-[10px] font-medium">
                        {tick.label}
                      </text>
                    </g>
                  );
                })}
                <path d={chartAreaPath} fill="url(#trendFill)" />
                <path d={chartPath} stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                {chartPoints.map((point, index) => (
                  <circle
                    key={`${point.rawDate}-${point.value}-${index}`}
                    cx={point.x} cy={point.y}
                    r={activeIndex === index ? 6 : 4}
                    fill={activeIndex === index ? "#22c55e" : "var(--background)"}
                    stroke="#22c55e"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                ))}
                {activePoint ? (
                  <line x1={activePoint.x} x2={activePoint.x} y1={chartPadding} y2={chartHeight - chartPadding} stroke="#22c55e" strokeOpacity="0.5" strokeDasharray="4 4" />
                ) : null}
                {chartPoints.map((point, index) => (
                  <text key={`${point.rawDate}-tick-${index}`} x={point.x} y={chartHeight - 6} className="fill-muted-foreground text-[9px] font-bold text-anchor-middle" textAnchor="middle">
                    {point.label}
                  </text>
                ))}
              </svg>
              {activePoint ? (
                <div
                  className="absolute bg-popover border border-border shadow-xl rounded-lg p-2 pointer-events-none z-10 whitespace-nowrap"
                  style={{
                    left: `${Math.min(88, Math.max(12, (activePoint.x / chartWidth) * 100))}%`,
                    top: "10%",
                    transform: "translate(-50%, 0)",
                  }}
                >
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{formatDate(activePoint.rawDate)}</p>
                  <p className="text-sm font-black text-[#22c55e]">{activePoint.value} jobs</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Highly Available Skills */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col h-full max-h-[400px]">
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tight">Highly available skills</h2>
            <p className="text-xs text-muted-foreground font-medium">Most frequent in this window</p>
          </div>
          
          {topWindowSkills.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No skill data yet.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
              {topWindowSkills.map((item) => {
                const width = (item.count / maxWindowSkill) * 100;
                return (
                  <div key={item.term} className="flex flex-col gap-1 group">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-foreground group-hover:text-primary transition-colors truncate pr-2">{item.term}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/60 group-hover:bg-primary transition-all duration-500 rounded-full" 
                        style={{ width: `${width}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* SKILL EXPLORER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">Skill explorer</h2>
              <p className="text-xs text-muted-foreground font-medium">See when a skill spikes</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="bg-muted border border-border rounded-lg text-sm font-medium px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
                value={effectiveSkill}
                onChange={(event) => setSelectedSkill(event.target.value)}
              >
                {skillOptions.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
              <div className="flex items-center bg-muted p-1 rounded-lg">
                {(["daily", "monthly"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${skillView === value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setSkillView(value)}
                  >
                    {value === "daily" ? "Daily" : "Monthly"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mb-6">
            {topWindowSkills.slice(0, 6).map((item) => (
              <button
                key={item.term}
                type="button"
                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-colors ${item.term === effectiveSkill ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-accent"}`}
                onClick={() => setSelectedSkill(item.term)}
              >
                {item.term}
              </button>
            ))}
          </div>

          <div className="relative h-[200px] w-full rounded-xl border border-border bg-muted/20 overflow-hidden flex-1">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${skillChartWidth} ${skillChartHeight}`}
              role="img"
              onMouseMove={handleSkillChartMove}
              onMouseLeave={handleSkillChartLeave}
            >
              <defs>
                <linearGradient id="skillFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              {skillTicks.map((tick) => {
                const y = skillChartPadding + (1 - Math.min(1, tick.value / maxSkillCount)) * (skillChartHeight - skillChartPadding * 2);
                return (
                  <g key={`skill-tick-${tick.value}`}>
                    <line x1={skillChartPadding} x2={skillChartWidth - skillChartPadding} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
                    <text x={6} y={y + 4} className="fill-muted-foreground text-[10px] font-medium">
                      {tick.label}
                    </text>
                  </g>
                );
              })}
              <path d={skillChartAreaPath} fill="url(#skillFill)" />
              <path d={skillChartPath} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {skillChartPoints.map((point, index) => (
                <circle
                  key={`${point.rawDate}-${point.count}-${index}`}
                  cx={point.x} cy={point.y}
                  r={skillActiveIndex === index ? 6 : 4}
                  fill={skillActiveIndex === index ? "hsl(var(--primary))" : "var(--background)"}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              ))}
              {skillActivePoint ? (
                <line x1={skillActivePoint.x} x2={skillActivePoint.x} y1={skillChartPadding} y2={skillChartHeight - skillChartPadding} stroke="hsl(var(--primary))" strokeOpacity="0.5" strokeDasharray="4 4" />
              ) : null}
            </svg>
            {skillActivePoint ? (
              <div
                className="absolute bg-popover border border-border shadow-xl rounded-lg p-2 pointer-events-none z-10 whitespace-nowrap"
                style={{
                  left: `${Math.min(88, Math.max(12, (skillActivePoint.x / skillChartWidth) * 100))}%`,
                  top: "10%",
                  transform: "translate(-50%, 0)",
                }}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{skillActivePoint.label}</p>
                <p className="text-sm font-black text-foreground">{skillActivePoint.count} mentions</p>
              </div>
            ) : null}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Peak Day</p>
              <p className="text-lg font-black tracking-tight">{peakDay ? formatDateLong(peakDay.ranAt) : "Not yet"}</p>
              <p className="text-xs font-medium text-primary">{peakDay ? `${peakDay.count} mentions` : "No snapshots"}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Peak Month</p>
              <p className="text-lg font-black tracking-tight">{peakMonth ? formatMonth(`${peakMonth.month}-01`) : "Not yet"}</p>
              <p className="text-xs font-medium text-primary">{peakMonth ? `${peakMonth.count} mentions` : "No snapshots"}</p>
            </div>
          </div>
        </motion.div>

        {/* ROLE EXPLORER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">Role constellation</h2>
              <p className="text-xs text-muted-foreground font-medium">Explore roles by momentum</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="bg-muted border border-border rounded-lg text-sm font-medium px-3 py-1.5 outline-none focus:ring-2 focus:ring-amber-500/20"
                value={effectiveRole}
                onChange={(event) => setSelectedRole(event.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <div className="flex items-center bg-muted p-1 rounded-lg">
                {(["daily", "monthly"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${roleView === value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setRoleView(value)}
                  >
                    {value === "daily" ? "Daily" : "Monthly"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative h-[200px] w-full rounded-xl border border-border bg-muted/20 overflow-hidden flex-1 mb-6">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${roleChartWidth} ${roleChartHeight}`}
              role="img"
              onMouseMove={handleRoleChartMove}
              onMouseLeave={handleRoleChartLeave}
            >
              <defs>
                <linearGradient id="roleFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={roleChartAreaPath} fill="url(#roleFill)" />
              <path d={roleChartPath} stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {roleChartPoints.map((point, index) => (
                <circle
                  key={`${point.rawDate}-${point.count}-${index}`}
                  cx={point.x} cy={point.y}
                  r={roleActiveIndex === index ? 6 : 4}
                  fill={roleActiveIndex === index ? "#f59e0b" : "var(--background)"}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              ))}
              {roleActivePoint ? (
                <line x1={roleActivePoint.x} x2={roleActivePoint.x} y1={roleChartPadding} y2={roleChartHeight - roleChartPadding} stroke="#f59e0b" strokeOpacity="0.5" strokeDasharray="4 4" />
              ) : null}
            </svg>
            {roleActivePoint ? (
              <div
                className="absolute bg-popover border border-border shadow-xl rounded-lg p-2 pointer-events-none z-10 whitespace-nowrap"
                style={{
                  left: `${Math.min(88, Math.max(12, (roleActivePoint.x / roleChartWidth) * 100))}%`,
                  top: "10%",
                  transform: "translate(-50%, 0)",
                }}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{roleActivePoint.label}</p>
                <p className="text-sm font-black text-amber-500">{roleActivePoint.count} mentions</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {topWindowRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No role data yet.</p>
            ) : (
              topWindowRoles.map((item, index) => (
                <button
                  key={item.term}
                  type="button"
                  className={`relative flex items-center justify-center rounded-full border transition-all ${item.term === effectiveRole ? "bg-amber-500 text-white border-amber-600 shadow-md scale-110 z-10" : "bg-card text-foreground border-border hover:bg-muted"}`}
                  style={{ width: Math.max(56, Math.min(100, 40 + item.count * 4)), height: Math.max(56, Math.min(100, 40 + item.count * 4)) }}
                  title={item.term}
                  onClick={() => setSelectedRole(item.term)}
                >
                  <span className="text-[9px] font-bold text-center leading-tight p-1 break-words line-clamp-2">{item.term}</span>
                  {item.term === effectiveRole && (
                    <span className="absolute -top-1 -right-1 bg-background text-foreground text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border shadow-sm">{index + 1}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* TREND BUCKETS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6 pt-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{mode === "skills" ? "Trending skills" : "Trending roles"}</h2>
            <p className="text-sm text-muted-foreground font-medium">Signals from the stream across snapshots</p>
          </div>
          <div className="flex items-center gap-4 bg-background border border-border p-2 rounded-2xl shadow-sm">
            <div className="flex items-center bg-muted p-1 rounded-xl">
              {(["skills", "roles"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-colors ${mode === value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setMode(value)}
                >
                  {value === "skills" ? "Skills" : "Roles"}
                </button>
              ))}
            </div>
            <input
              className="bg-transparent text-sm font-medium outline-none px-2 w-32 focus:w-48 transition-all placeholder:text-muted-foreground/50"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TrendList title="Emerging" items={filteredBuckets.emerging} tone="new" emptyLabel="No new signals yet." />
          <TrendList title="Rising" items={filteredBuckets.rising} tone="rise" emptyLabel="No strong risers yet." />
          <TrendList title="Declining" items={filteredBuckets.declining} tone="fall" emptyLabel="No declines yet." />
        </div>
      </motion.div>
    </div>
  );
}
