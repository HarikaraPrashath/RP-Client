'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertCircle, Activity } from "lucide-react";
import CareerCard from "@/components/features/results/CareerCard";
<<<<<<< HEAD
import PersonalityRadar from "@/components/features/results/PersonalityRadar";
=======
import PersonalityRadar from "@/components//features/results/PersonalityRadar";
>>>>>>> 436a876 (Initial commit - FastAPI career prediction model deployment)
import EmotionTimeline from "@/components/features/results/EmotionTimeline";
import { AnalysisResult } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import motionShim from '@/lib/motion';
const motion = motionShim;

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
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
                <div className="w-full max-w-5xl space-y-6 pt-12">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-6 w-96" />
                    <div className="grid grid-cols-3 gap-4 pt-6">
                        <Skeleton className="h-28 rounded-xl" />
                        <Skeleton className="h-28 rounded-xl" />
                        <Skeleton className="h-28 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-12 gap-6 pt-6">
                        <div className="col-span-7 space-y-4">
                            <Skeleton className="h-48 rounded-xl" />
                            <Skeleton className="h-48 rounded-xl" />
                        </div>
                        <div className="col-span-5 space-y-4">
                            <Skeleton className="h-72 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !results) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-sm p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mx-auto", error ? "bg-red-50 text-red-500" : "bg-indigo-50 text-indigo-500")}>
                        {error ? <AlertCircle className="w-7 h-7" /> : <Activity className="w-7 h-7" />}
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">{error ? "Something Went Wrong" : "No Results Found"}</h2>
                        <p className="text-sm text-gray-500">{error || "Please complete an interview session first to view your results."}</p>
                    </div>
                    <Button onClick={() => router.push('/setup')} className="w-full h-10 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
                        {error ? "Try Again" : "Start Interview"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-6 md:p-12 flex flex-col items-center relative">
            {/* Header */}
            <div className="w-full max-w-5xl mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="text-xs font-medium text-indigo-500 mb-1">Assessment Complete</p>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                            Hi {results.userName}, here are your results.
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => window.print()}
                            variant="outline"
                            className="h-9 rounded-lg px-4 border-gray-200 text-sm font-medium print:hidden"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="h-9 rounded-lg px-4 border-gray-200 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
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
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-widest">Top Emotion</p>
                            <div className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                                {Object.entries(results.aggregatedEmotions).sort((a, b) => b[1] - a[1])[0][0]}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/10 p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5 relative overflow-hidden">
                        <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                            <svg className="transform -rotate-90 w-16 h-16">
                                <circle className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                                <circle
                                    className="text-indigo-600"
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
                            <span className="absolute text-sm font-black text-indigo-700">
                                {Math.round((results.topCareers[0]?.confidence || 0) * 100)}%
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-indigo-400 mb-1 uppercase tracking-widest">Top Match</p>
                            <div className="text-3xl font-black text-gray-900 truncate tracking-tight">
                                {results.topCareers[0]?.career || 'None'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Personality Pulse */}
                    <div className="space-y-8">
                        {/* Personality Profile */}
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Personality Pulse
                            </h2>
                            <div className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                                <PersonalityRadar data={results.personality} />
                            </div>
                        </section>

                        {/* Deep Insights */}
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Qualitative Insights
                            </h2>
                            <div className="space-y-3">
                                {results.insights.map((insight, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white flex gap-3 hover:border-indigo-100/50 hover:shadow-sm transition-all duration-300">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Profile & Recommendations */}
                    <div className="space-y-8">
                        {/* Career Recommendations */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    Best Match Outcomes
                                </h2>
                                <span className="text-xs text-indigo-500 font-bold px-2 py-0.5 bg-indigo-50 rounded">Top 3 Results</span>
                            </div>
                            <div className="space-y-4">
                                {([...results.topCareers, ...results.otherCareers]).slice(0, 3).map((career, idx) => {
                                    const topEmotion = Object.entries(results.aggregatedEmotions).sort((a, b) => b[1] - a[1])[0][0];
                                    return (
                                        <CareerCard
                                            key={career.career}
                                            {...career}
                                            isPrimary={idx === 0}
                                            userTraits={results.personality}
                                            userEmotion={topEmotion}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </motion.div>

                {/* Bottom Section: Emotion Timeline */}
                <motion.div variants={itemVariants} className="w-full">
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                Emotional Journey
                            </h2>
                            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                Time Series Analysis
                            </span>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                            <EmotionTimeline data={results.emotionTimeline} />
                        </div>
                    </section>
                </motion.div>
            </motion.div>

            <footer className="w-full max-w-5xl mt-16 py-8 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
                <span>Career Assessment v2.0</span>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Analysis Complete</span>
                </div>
                <span>© 2026</span>
            </footer>
        </main>
    );
}
