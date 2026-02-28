'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/features/setup/ThemeToggle";
import { Users, Activity, Brain, ShieldCheck, ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import Link from 'next/link';

export default function AdminDashboard() {
    const stats = [
        { label: "Total Sessions", value: "1,284", icon: Users, color: "text-blue-500" },
        { label: "AI Confidence Avg", value: "88.4%", icon: Brain, color: "text-purple-500" },
        { label: "Stability Index", value: "99.9%", icon: Activity, color: "text-emerald-500" },
        { label: "Verified Results", value: "942", icon: ShieldCheck, color: "text-primary" },
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-foreground p-8 md:p-16 transition-colors duration-700 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-16">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/results" className="p-4 rounded-2xl bg-white/5 border-glass hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase">Intelligence <span className="text-primary italic">Console</span></h1>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black opacity-50">Admin Analytics Environment</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-card p-10 rounded-[3rem] space-y-4 hover:scale-105 transition-transform duration-500">
                            <div className={`p-4 rounded-2xl bg-white/5 w-fit ${stat.color}`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">{stat.label}</p>
                                <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 glass-card rounded-[4rem] p-12 space-y-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-4">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                Real-time Engagement Flux
                            </h2>
                            <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 tracking-widest uppercase">Live Telemetry</span>
                        </div>
                        <div className="h-80 w-full bg-white/5 rounded-[2rem] border border-glass flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                            <BarChart3 className="w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-40">Visualizing psychometric trends...</p>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-12">
                        <div className="glass-card rounded-[3.5rem] p-12 space-y-8 h-full">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-40">System Node Status</h3>
                            <div className="space-y-6">
                                {[
                                    { node: "Neural Engine v4", status: "Active", delay: "4ms" },
                                    { node: "Biometric Stream", status: "Online", delay: "12ms" },
                                    { node: "Cognitive Relay", status: "Idle", delay: "0ms" },
                                ].map((node, i) => (
                                    <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                                        <div>
                                            <p className="text-sm font-black">{node.node}</p>
                                            <p className="text-[8px] font-black text-emerald-500 tracking-widest uppercase">{node.status}</p>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-muted-foreground">{node.delay}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="max-w-7xl mx-auto mt-32 py-12 border-t border-glass flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.6em] opacity-30">
                <span>Admin.Collective_Protocol_v2.5</span>
                <span>© 2026 Sovereign Systems</span>
            </footer>
        </main>
    );
}
