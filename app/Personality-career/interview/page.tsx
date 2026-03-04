'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useInterview } from '@/hooks/useInterview';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Brain, WifiOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils-r";

import { WebcamCaptureProps } from "@/components/components/features/interview/WebcamCapture";

const WebcamCapture = dynamic<WebcamCaptureProps>(() => import("@/components/components/features/interview/WebcamCapture"), { ssr: false });

export default function InterviewPage() {
    const {
        questions,
        currentIndex,
        loading,
        error,
        webcamStatus,
        webcamError,
        timeLeft,
        currentEmotions,
        blinkCount,
        handleNext,
        handleEmotionsDetected,
        handleBlinkDetected,
        handleWebcamError,
        progress
    } = useInterview();

    const { isConnected, lastInsight, sendEmotions } = useWebSocket('ws://localhost:8000/ws/analyze');

    const lastSentRef = useRef<number>(0);

    useEffect(() => {
        const now = Date.now();
        if (currentEmotions && isConnected && now - lastSentRef.current > 500) {
            sendEmotions(currentEmotions);
            lastSentRef.current = now;
        }
    }, [currentEmotions, isConnected, sendEmotions]);

    if (loading && questions.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center font-sans">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm font-medium">Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error || webcamError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
                <div className="text-center space-y-4 max-w-sm w-full p-8 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl shadow-primary/10 animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2 shadow-sm">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                        {webcamError ? "Camera Error" : "Error Occurred"}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium">
                        {error || webcamError}
                    </p>
                    {webcamError && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg text-left border border-slate-100 font-medium">
                            Please ensure you have granted camera permissions in your browser settings and that no other application is using the camera.
                        </p>
                    )}
                    <Button onClick={() => window.location.reload()} className="w-full rounded-xl h-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white mt-2 shadow-lg shadow-primary/20 font-bold transition-all">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <main className="min-h-screen bg-background flex flex-col relative font-sans">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 md:px-12 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
                <div>
                    <h1 className="text-lg font-black text-slate-800 tracking-tight">Interview Session</h1>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                            <p className="text-sm font-black text-primary">{isConnected ? 'Connected' : 'Offline'}</p>
                        </div>
                        <div className="text-right border-l border-slate-200 pl-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blinks</p>
                            <p className="text-sm font-black text-slate-800">{blinkCount}</p>
                        </div>
                    </div>
                    <Link href="/Personality-career/results">
                        <Button variant="outline" className="rounded-xl px-4 h-10 text-sm font-bold bg-white border-slate-200 text-slate-700 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 shadow-sm transition-all">
                            End Session
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Offline Banner */}
            {!isConnected && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <p className="text-xs font-bold text-red-600">
                        Connection lost. Attempting to reconnect...
                    </p>
                </div>
            )}

            <div className="flex-1 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
                {/* Left Side: Video + Question */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Video Feed */}
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-primary/10 ring-1 ring-slate-100">
                        <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                            <WebcamCapture
                                isActive={true}
                                onEmotionsDetected={handleEmotionsDetected}
                                onBlinkDetected={handleBlinkDetected}
                                onError={handleWebcamError}
                            />

                            {/* Question Overlay - Top */}
                            <div className="absolute top-0 inset-x-0 p-8 pt-10 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-transparent pointer-events-none">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="max-w-3xl"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2.5 py-1 rounded-md bg-primary text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/40">
                                                {currentQ?.category || "Category"}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 drop-shadow-sm">
                                                Q{currentIndex + 1}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-2xl tracking-tight">
                                            {currentQ?.question || "Loading..."}
                                        </h2>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Next Question/Finish Button - Top Right Overlay */}
                            <div className="absolute top-8 right-8 z-20">
                                <Button
                                    onClick={handleNext}
                                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold shadow-2xl shadow-primary/30 flex items-center gap-2 group transition-all"
                                >
                                    {questions && currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>

                            {/* Live indicator */}
                            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Feed</span>
                            </div>

                            {/* Timer Overlay - Bottom Right */}
                            <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-primary/80 uppercase tracking-widest">Time Remaining</p>
                                    <p className={cn(
                                        "text-2xl font-black tabular-nums transition-colors tracking-tight",
                                        timeLeft < 10 ? "text-red-400" : "text-white"
                                    )}>
                                        {timeLeft}s
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Insights */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Emotion Analysis */}
                    <div className="glass-card rounded-[2rem] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Real-time Emotions</h3>
                        </div>

                        <div className="space-y-4">
                            {currentEmotions ? (
                                Object.entries(currentEmotions).map(([stat, value], i) => {
                                    const emotionColors: Record<string, string> = {
                                        happy: 'var(--primary)',
                                        neutral: 'var(--muted-foreground)',
                                        surprise: 'var(--accent)',
                                        fear: 'var(--secondary)',
                                        sad: 'var(--chart-3)',
                                        angry: 'var(--destructive)',
                                        disgust: 'var(--chart-4)',
                                    };
                                    const color = emotionColors[stat.toLowerCase()] || 'var(--primary)';
                                    const val = typeof value === 'number' ? value : 0;

                                    return (
                                        <div key={i} className="space-y-1.5 group">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat}</span>
                                                <span className="text-sm font-black text-slate-800">{Math.round(val * 100)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className="h-full transition-all duration-700 ease-out rounded-full relative"
                                                    style={{
                                                        width: `${val * 100}%`,
                                                        backgroundColor: color
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 w-full h-full" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
                                    <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Calibrating sensors</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Insight */}
                    <div className="glass-card rounded-[2rem] p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-accent/10 text-accent rounded-lg">
                                <Brain className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">AI Prediction</h3>
                        </div>
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/50 shadow-inner">
                            <p className="text-sm text-slate-700 font-bold leading-relaxed">
                                {lastInsight?.topCareer
                                    ? `Trending toward ${lastInsight.topCareer}`
                                    : "Analyzing cognitive patterns..."}
                            </p>
                            {lastInsight?.confidence && (
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                            style={{ width: `${lastInsight.confidence * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md">{Math.round(lastInsight.confidence * 100)}% Match</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading overlay */}
            {loading && questions.length > 0 && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-primary/10 border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                        <div>
                            <p className="text-slate-900 text-xl font-black tracking-tight mb-1">Processing...</p>
                            <p className="text-slate-500 text-sm font-medium">Preparing your next scenario</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
