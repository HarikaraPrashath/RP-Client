'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useInterview } from '@/hooks/useInterview';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Brain, WifiOff, ArrowRight } from "lucide-react";
import motionShim, { AnimatePresence } from '@/lib/motion';
const motion = motionShim;
import { cn } from "@/lib/utils";

const WebcamCapture = dynamic(() => import("@/components/features/interview/WebcamCapture"), { ssr: false });

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm">Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error || webcamError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-sm w-full p-8 bg-white rounded-xl border border-gray-200 shadow-sm animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {webcamError ? "Camera Error" : "Error Occurred"}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {error || webcamError}
                    </p>
                    {webcamError && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg text-left">
                            Please ensure you have granted camera permissions in your browser settings and that no other application is using the camera.
                        </p>
                    )}
                    <Button onClick={() => window.location.reload()} className="w-full rounded-lg h-10 bg-indigo-500 hover:bg-indigo-600 text-white mt-2">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <main className="min-h-screen flex flex-col relative">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-6 md:px-12 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Interview Session</h1>
                    <p className="text-xs text-gray-400">Question {currentIndex + 1} of {questions.length}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-medium text-gray-400 uppercase">Status</p>
                            <p className="text-sm font-semibold text-indigo-500">{isConnected ? 'Connected' : 'Offline'}</p>
                        </div>
                        <div className="text-right border-l border-gray-200 pl-6">
                            <p className="text-[10px] font-medium text-gray-400 uppercase">Blinks</p>
                            <p className="text-sm font-semibold text-gray-900">{blinkCount}</p>
                        </div>
                    </div>
                    <Link href="/results">
                        <Button variant="outline" className="rounded-lg px-4 h-9 text-xs font-medium border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                            End Session
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Offline Banner */}
            {!isConnected && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <p className="text-xs font-medium text-red-600">
                        Connection lost. Attempting to reconnect...
                    </p>
                </div>
            )}

            <div className="flex-1 p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Video + Question */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Video Feed */}
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="relative aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
                            <WebcamCapture
                                isActive={true}
                                onEmotionsDetected={handleEmotionsDetected}
                                onBlinkDetected={handleBlinkDetected}
                                onError={handleWebcamError}
                            />

                            {/* Question Overlay - Top */}
                            <div className="absolute top-0 inset-x-0 p-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="max-w-2xl"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                                                {currentQ.category}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                                                Question {currentIndex + 1}
                                            </span>
                                        </div>
                                        <h2 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-2xl">
                                            {currentQ.question}
                                        </h2>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Next Question/Finish Button - Top Right Overlay */}
                            <div className="absolute top-8 right-8 z-20">
                                <Button
                                    onClick={handleNext}
                                    className="h-12 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-2xl flex items-center gap-2 group transition-all"
                                >
                                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>

                            {/* Live indicator */}
                            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Feed</span>
                            </div>

                            {/* Timer Overlay - Bottom Right */}
                            <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest">Time Remaining</p>
                                    <p className={cn(
                                        "text-xl font-black tabular-nums transition-colors",
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
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-semibold text-gray-900">Emotion Analysis</h3>
                            <Brain className="w-4 h-4 text-indigo-500" />
                        </div>

                        <div className="space-y-4">
                            {currentEmotions ? (
                                Object.entries(currentEmotions).map(([stat, value], i) => {
                                    const emotionColors: Record<string, string> = {
                                        happy: '#10b981',    // Emerald
                                        neutral: '#94a3b8',  // Slate
                                        surprise: '#f59e0b', // Amber
                                        fear: '#6366f1',     // Indigo
                                        sad: '#3b82f6',      // Blue
                                        angry: '#f43f5e',    // Rose
                                        disgust: '#ec4899',  // Pink
                                    };
                                    const color = emotionColors[stat.toLowerCase()] || '#6366f1';
                                    const barWidth = `${(value as number) * 100}%`;

                                    return (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs text-gray-500 capitalize">{stat}</span>
                                                <span className="text-xs font-semibold text-gray-900">{Math.round((value as number) * 100)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-700 ease-out rounded-full"
                                                    style={{
                                                        width: barWidth,
                                                        backgroundColor: color
                                                    } as React.CSSProperties}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-400 text-xs py-8">Waiting for camera...</p>
                            )}
                        </div>
                    </div>

                    {/* Live Personality Profile
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Live Personality Pulse</h3>
                            <Brain className="w-4 h-4 text-indigo-500" />
                        </div>
                        {lastInsight?.personality ? (
                            <div className="h-[240px] -mx-4">
                                <PersonalityRadar data={lastInsight.personality} />
                            </div>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-center text-gray-400 text-xs px-8">
                                    Continue speaking to generate your personality profile...
                                </p>
                            </div>
                        )}
                        <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
                            Traits update dynamically based on your emotional patterns and responses.
                        </p>
                    </div> */}

                    {/* AI Insight */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-sm font-semibold text-gray-900">Current Prediction</h3>
                        </div>
                        <div className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100">
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                {lastInsight?.topCareer
                                    ? `Trending toward ${lastInsight.topCareer}`
                                    : "Analyzing your responses..."}
                            </p>
                            {lastInsight?.confidence && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-indigo-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 transition-all duration-500"
                                            style={{ width: `${lastInsight.confidence * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-600">{Math.round(lastInsight.confidence * 100)}% Match</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                        <div>
                            <p className="text-gray-900 text-lg font-semibold">Loading...</p>
                            <p className="text-gray-400 text-sm">Preparing your next question</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
