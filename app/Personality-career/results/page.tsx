'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertCircle, Activity, Save } from "lucide-react";
import CareerCard from "@/components/components/features/results/CareerCard";
import PersonalityRadar from "@/components/components/features/results/PersonalityRadar";
import EmotionTimeline from "@/components/components/features/results/EmotionTimeline";
import { AnalysisResult } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils-r";
import { motion } from "framer-motion";
import { authHeader } from "../../../lib/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('interviewResults');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed !== 'object' || !parsed.topCareers) {
          throw new Error("Invalid results schema");
        }
        setResults(parsed);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
        console.error("Failed to parse results", errorMessage);
        setError("Your assessment results are corrupted or invalid. Please try restarting the interview.");
      }
    }
    setLoading(false);
  }, []);

  const handleReset = () => {
    sessionStorage.removeItem('interviewResults');
    router.push('/Personality-career');
  };

  const onSaveToProfile = async () => {
    if (!results) {
      alert("No results to save.");
      return;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const resGet = await fetch(apiBase + "/profile", { 
        credentials: "include",
        headers: { ...authHeader() }
      });
      if (!resGet.ok) throw new Error("Failed to get profile");
      const profileData = await resGet.json();

      profileData.careerEmotion = results;

      const resPut = await fetch(apiBase + "/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...authHeader()
        },
        credentials: "include",
        body: JSON.stringify(profileData)
      });
      if (resPut.ok) {
        alert("Success! Your Emotion/Interview insights are saved to your Profile.");
      } else {
        alert("Failed to save to profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-6 pt-12">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid grid-cols-3 gap-4 pt-6">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm p-8 bg-white rounded-xl shadow-2xl shadow-blue-200/30 border border-slate-200">
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mx-auto", error ? "bg-red-50 text-red-500" : "bg-primary/5 text-primary")}>
            {error ? <AlertCircle className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">{error ? "Something Went Wrong" : "No Results Found"}</h2>
            <p className="text-sm text-slate-500">{error || "Please complete an interview session first to view your results."}</p>
          </div>
          <Button onClick={() => router.push('/Personality-career')} className="w-full h-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg shadow-primary/20 text-sm font-semibold transition-all">
            {error ? "Try Again" : "Start Interview"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-12 flex flex-col items-center relative font-sans">
      {/* Header */}
      <div className="w-full max-w-5xl mb-10 mt-4 md:mt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-xs font-bold text-primary mb-1 uppercase tracking-widest">Assessment Complete</p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
              Hi {results.userName}, here are your results.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onSaveToProfile}
              variant="outline"
              className="h-10 rounded-xl px-4 bg-blue-50 border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-100 shadow-sm transition-all"
            >
              <Save className="w-4 h-4 mr-2" /> Save to Profile
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="h-10 rounded-xl px-4 bg-white border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all print:hidden"
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-10 rounded-xl px-4 bg-white border-slate-200 text-slate-700 text-sm font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 shadow-sm transition-all"
            >
              New Interview
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-5xl space-y-8"
      >
        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm p-6 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-shadow flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">Top Emotion</p>
              <div className="text-3xl font-black text-slate-800 capitalize tracking-tight">
                {Object.entries(results.aggregatedEmotions).sort((a, b) => b[1] - a[1])[0][0]}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-shadow flex items-center gap-5 relative overflow-hidden backdrop-blur-sm">
            <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
              <svg className="transform -rotate-90 w-16 h-16">
                <circle className="text-primary/10" strokeWidth="4" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                <circle
                  className="text-primary"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 - (((results.topCareers[0]?.confidence || 0) * 100) / 100) * (2 * Math.PI * 28)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="28" cx="32" cy="32"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <span className="absolute text-sm font-black text-primary">
                {Math.round((results.topCareers[0]?.confidence || 0) * 100)}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">Top Match</p>
              <div className="text-3xl font-black text-slate-800 truncate tracking-tight">
                {results.topCareers[0]?.career || 'None'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Best Match Outcomes Row */}
        <motion.div variants={itemVariants} className="w-full">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Best Match Outcomes
              </h2>
              <span className="text-xs text-primary font-bold px-2 py-0.5 bg-primary/10 rounded-md">Top 3 Results</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {([...results.topCareers, ...results.otherCareers]).slice(0, 3).map((career, idx) => {
                const topEmotion = Object.entries(results.aggregatedEmotions).sort((a, b) => b[1] - a[1])[0][0];
                return (
                  <div key={career.career} className={cn("rounded-2xl border bg-white/95 backdrop-blur-sm transition-all shadow-lg hover:shadow-xl overflow-hidden", idx === 0 ? "border-primary/40 shadow-primary/10" : "border-slate-200 shadow-slate-200/30")}>
                    <CareerCard
                      {...career}
                      isPrimary={idx === 0}
                      userTraits={results.personality}
                      userEmotion={topEmotion}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </motion.div>

        {/* Analysis Row: Side by Side */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Personality Profile */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Personality Pulse
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-shadow p-4">
              <PersonalityRadar data={results.personality} />
            </div>
          </section>

          {/* Qualitative Insights */}
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              Qualitative Insights
            </h2>
            <div className="space-y-3">
              {results.insights.map((insight, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white flex gap-3 shadow-sm hover:border-primary/20 hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{insight}</p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>

        {/* Bottom Section: Emotion Timeline */}
        <motion.div variants={itemVariants} className="w-full pt-4">
          <section>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Emotional Journey
                </h2>
                <p className="text-2xl font-black text-slate-800 tracking-tight">Real-time Affective Analysis</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/10 uppercase tracking-widest">Time Series Data</span>
                <span className="text-[10px] font-black bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border uppercase tracking-widest">v2.0 Tracking</span>
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-slate-200 bg-white/95 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 p-4 md:p-8">
              <div className="mb-4 flex flex-wrap gap-4 px-2">
                {[
                  { label: 'High Focus', color: 'bg-emerald-500' },
                  { label: 'Analytical Peaks', color: 'bg-primary' },
                  { label: 'Cognitive Engagement', color: 'bg-accent' }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", badge.color)} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">{badge.label}</span>
                  </div>
                ))}
              </div>
              <EmotionTimeline data={results.emotionTimeline} />
            </div>
          </section>
        </motion.div>
      </motion.div>

      <footer className="w-full max-w-5xl mt-16 py-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-medium">
        <span>Career Assessment v2.0</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span>Analysis Complete</span>
        </div>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
