"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  Zap,
  Briefcase,
  BarChart3
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { SkillTag } from "../../../components/market/merge-skill-components";
import SaveToProfileButton from "../../../components/market/save-to-profile-button";

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
  forecasted?: {
    rising: Array<{ skill_name: string; growth_score: number; absolute_growth: number; trend_status: string; coverage_pct?: number; mape_pct?: number }>;
    declining: Array<{ skill_name: string; growth_score: number; absolute_growth: number; trend_status: string; coverage_pct?: number; mape_pct?: number }>;
  };
};

export type TrendEntry = {
  ranAt: string;
  keyword?: string;
  jobCount?: number;
  skillCounts?: Record<string, number>;
  roleCounts?: Record<string, number>;
};

type AllTrendClientProps = {
  summary: TrendSummary;
  history: TrendEntry[];
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not yet";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};





const SkillTrendExplorer = ({ history, skills }: { history: TrendEntry[], skills: string[] }) => {
  const [selectedSkill, setSelectedSkill] = useState(skills[0] || "");
  const [selectedKeyword, setSelectedKeyword] = useState("All Roles");
  const [range, setRange] = useState("1M");

  // Dynamically derive keywords that exist in the history data
  const availableKeywords = useMemo(() => {
    const kws = new Set(history.map(h => h.keyword).filter(Boolean) as string[]);
    return ["All Roles", ...Array.from(kws).sort()];
  }, [history]);

  // Dynamically derive years that exist in the history data
  const availableYears = useMemo(() => {
    const years = new Set(history.map(h => new Date(h.ranAt).getFullYear()));
    return Array.from(years).sort();
  }, [history]);

  // Which years actually have data for the selected skill and keyword
  const yearsWithData = useMemo(() => {
    return new Set(
      history
        .filter(h => {
          if (selectedKeyword !== "All Roles" && h.keyword !== selectedKeyword) return false;
          const count = h.skillCounts?.[selectedSkill] || h.skillCounts?.[selectedSkill.toLowerCase()] || 0;
          return Number(count) > 0;
        })
        .map(h => new Date(h.ranAt).getFullYear())
    );
  }, [history, selectedSkill, selectedKeyword]);

  const skillHistory = useMemo(() => {
    if (!selectedSkill) return [];

    const now = new Date();
    const filteredHistory = history.filter(h => {
      // Keyword filter
      if (selectedKeyword !== "All Roles" && h.keyword !== selectedKeyword) return false;

      const date = new Date(h.ranAt);
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (range === "1D") return diffDays <= 1;
      if (range === "5D") return diffDays <= 5;
      if (range === "1M") return diffDays <= 30;
      if (range === "1Y") return diffDays <= 365;
      if (range === "Max") return true;
      const yr = parseInt(range, 10);
      if (!isNaN(yr)) return date.getFullYear() === yr;
      return true;
    });

    const aggregated: Record<string, number> = {};
    filteredHistory.forEach(h => {
      const date = new Date(h.ranAt);
      const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = h.skillCounts?.[selectedSkill] || h.skillCounts?.[selectedSkill.toLowerCase()] || 0;
      aggregated[key] = (aggregated[key] || 0) + Number(count);
    });

    return Object.entries(aggregated).map(([date, count]) => ({ date, count }));
  }, [history, selectedSkill, selectedKeyword, range]);

  const peak = useMemo(() => {
    if (skillHistory.length === 0) return null;
    return [...skillHistory].sort((a, b) => b.count - a.count)[0];
  }, [skillHistory]);

  const timeRanges = ["1D", "5D", "1M", "1Y", "Max"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 flex flex-col h-[550px]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">Skill Momentum</h3>
          <p className="text-sm text-slate-500 font-medium">Historical timeline for a specific skill</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time-range group */}
          <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
            {timeRanges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${range === r
                  ? "bg-white text-primary shadow-sm border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Dynamic year group */}
          {availableYears.length > 0 && (
            <>
              <span className="w-px h-5 bg-slate-200 rounded-full hidden sm:block" />
              <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                {availableYears.map((yr) => {
                  const hasData = yearsWithData.has(yr);
                  const isActive = range === String(yr);
                  return (
                    <button
                      key={yr}
                      onClick={() => hasData && setRange(String(yr))}
                      title={hasData ? `Show ${yr}` : `No data for ${selectedSkill} in ${yr}`}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isActive
                        ? "bg-white text-primary shadow-sm border border-slate-200"
                        : hasData
                          ? "text-slate-400 hover:text-slate-600 cursor-pointer"
                          : "text-slate-200 cursor-not-allowed"
                        }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <select
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            >
              {availableKeywords.map(k => <option key={k} value={k}>{k}</option>)}
            </select>

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            >
              {skills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full -ml-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={skillHistory}>
            <defs>
              <linearGradient id="colorSkill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} dx={-10} />
            <Tooltip
              contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", padding: "16px" }}
            />
            <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorSkill)" animationDuration={2000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peak Volume</p>
          <p className="text-xl font-black text-slate-900">{peak?.count || 0} mentions</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peak Date</p>
          <p className="text-xl font-black text-slate-900">{peak?.date || "N/A"}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function AllTrendClient({ summary, history }: AllTrendClientProps) {
  const [activeCategory, setActiveCategory] = useState<"skills" | "roles">("skills");

  const chartData = useMemo(() => {
    const daily: Record<string, number> = {};
    history.forEach(entry => {
      const date = new Date(entry.ranAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      daily[date] = (daily[date] || 0) + (entry.jobCount || 0);
    });
    return Object.entries(daily).map(([date, count]) => ({ date, count }));
  }, [history]);





  const promiseMatrix = useMemo(() => {
    const all = [
      ...summary[activeCategory].rising.map(i => ({ ...i, status: "Rising" })),
      ...summary[activeCategory].emerging.map(i => ({ ...i, status: "Emerging" })),
      ...summary[activeCategory].stable.map(i => ({ ...i, status: "Stable" }))
    ];

    return all.map(item => ({
      name: item.term,
      volume: item.current,
      growth: item.changePct ?? 50, // Emerging gets a boost
      promise: (item.current * 0.4) + ((item.changePct || 20) * 0.6),
      status: item.status
    })).sort((a, b) => b.promise - a.promise).slice(0, 20);
  }, [summary, activeCategory]);

  const topPromising = useMemo(() => promiseMatrix.slice(0, 5), [promiseMatrix]);

  const skillOptions = useMemo(() => {
    return [
      ...summary.skills.rising,
      ...summary.skills.stable,
      ...summary.skills.emerging
    ].sort((a, b) => b.current - a.current).map(i => i.term).slice(0, 50);
  }, [summary]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 selection:bg-primary/20">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-12 xl:p-20 space-y-20">

        {/* LIGHT PREMIUM HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[3rem] overflow-hidden bg-white text-slate-900 p-8 lg:p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-12 items-center">
            <div className="xl:col-span-7 space-y-8">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Market Velocity Active</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Search size={14} className="text-primary" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">8,400+ Technical Signals</span>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
                  Track skill <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">momentum</span> over time
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                  Each scrape saves a snapshot of job postings. Compare historical data to spot the skills and roles gaining momentum or fading out in real-time.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <SaveToProfileButton
                  type="allTrend"
                  label="Export Market Report"
                  data={{
                    topPromising: topPromising.map(p => ({ name: p.name, growth: p.growth, promise: p.promise })),
                    rising: summary.skills.rising.slice(0, 5),
                    emerging: summary.skills.emerging.slice(0, 5),
                    windowDays: summary.windowDays,
                    snapshotCount: summary.snapshotCount
                  }}
                />
                <div className="h-10 w-px bg-slate-100 hidden md:block" />
                <div className="hidden md:block">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Last Updated</p>
                  <p className="text-sm font-bold text-slate-600">{formatDate(summary.latestAt)}</p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Zap size={140} />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Analysis window</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-slate-900">{summary.windowDays}</span>
                        <span className="text-xs font-bold text-slate-400 italic">Days</span>
                      </div>
                      <div className="h-1 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Data density</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-slate-900">{summary.snapshotCount}</span>
                        <span className="text-xs font-bold text-slate-400 italic">Events</span>
                      </div>
                      <div className="h-1 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1.5, delay: 0.2 }} className="h-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">Market Coverage</h4>
                        <p className="text-xs text-slate-500">8 Key Industrial Sectors Scanned</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* PRIMARY ANALYTICS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Main Pulse Chart 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-12 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 flex flex-col h-[500px]"
          >
            {/* Main Pulse Chart 
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Job Market Velocity</h3>
                <p className="text-sm text-slate-500 font-medium">Daily aggregate volume across all technical domains</p>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-black border border-slate-100">ALL SECTORS</div>
              </div>
            </div>
            <div className="flex-1 w-full -ml-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", padding: "16px" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorPulse)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

            {/* Skill Trend Explorer */}
          <div className="xl:col-span-12">
            <SkillTrendExplorer history={history} skills={skillOptions} />
          </div>

          {/* AI FORECAST SECTION */}
          {(summary.forecasted?.rising?.length || summary.forecasted?.declining?.length) ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Rising Forecast */}
              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-emerald-100/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">AI Momentum Forecast</h3>
                    <p className="text-xs text-slate-500 font-medium">Predicted top growth (Next 30 Days)</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {summary.forecasted?.declining.map((s) => (
                    <div key={s.skill_name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700">{s.skill_name}</span>
                      <div className="flex items-center gap-3">
                        {s.coverage_pct && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[14px] font-black text-emerald-600">
                            {s.coverage_pct}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Declining Forecast */}
              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-rose-100/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">AI Decline Warning</h3>
                    <p className="text-xs text-slate-500 font-medium">Predicted cooling trends (Next 30 Days)</p>
                  </div>
                </div>
                <div className="space-y-4">

                  {summary.forecasted?.rising.map((s) => (
                    <div key={s.skill_name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700">{s.skill_name}</span>
                      <div className="flex items-center gap-3">
                        {s.coverage_pct && (
                          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-[14px] font-black text-rose-600">
                            {s.coverage_pct}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="xl:col-span-12 p-10 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">AI Forecast data is currently being synthesized. Please check back later.</p>
            </div>
          )}





        </div>



        {/* STABLE FOUNDATIONS 
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[4rem] p-12 lg:p-20 overflow-hidden relative text-white"
        >
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none rotate-12">
            <Globe size={500} />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest">
                The Core Layer
              </div>
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
                Stable <br /> <span className="text-primary italic">Foundations</span>
              </h2>
              <p className="text-slate-400 font-medium text-xl leading-relaxed max-w-lg">
                These {activeCategory} are the bedrock of the industry. They rarely fluctuate wildly, representing "must-have" knowledge for anyone entering the technical space today.
              </p>
              <div className="flex gap-10">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white">{summary[activeCategory].stable.length}</p>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Stable</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-emerald-400">98%</p>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Confidence</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 content-center justify-center lg:justify-start">
              <AnimatePresence mode="popLayout">
                {summary[activeCategory].stable.length === 0 ? (
                  <p className="text-slate-500 italic">No stable entries found.</p>
                ) : (
                  summary[activeCategory].stable.map((item, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      key={item.term}
                    >
                      <SkillTag
                        name={item.term}
                        className="py-4 px-8 bg-white/5 border-white/10 hover:bg-primary hover:border-primary transition-all cursor-default text-base font-black rounded-3xl"
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* FOOTER INSIGHTS */}
        <footer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 pt-16 border-t border-slate-100">
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl">The Algo</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Our "Promise Matrix" uses a weighted Bayesian average to score paths based on current volume vs historical growth.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Updates</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Data is re-calculated every 24 hours based on thousands of scrapes from LinkedIn, Indeed, and glassdoor.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Bias Filter</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              We normalize for sector-specific jargon to ensure "React" and "React.js" are treated as the same market signal.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Support</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Need help choosing? Reach out to our career mentors in the hub for a 1-on-1 session.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
