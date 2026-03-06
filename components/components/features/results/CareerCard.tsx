import React, { useState } from 'react';
import {
    Database, Shield, Cloud, Code, LineChart,
    Layers, Cpu, Globe, Search, BookOpen,
    CheckCircle2, Settings, PenTool, Layout, Activity, ChevronDown
} from 'lucide-react';
import { cn } from "@/lib/utils-r";
import { motion, AnimatePresence } from 'framer-motion';

import { PersonalityTraits } from '@/types';

interface CareerCardProps {
    career: string;
    confidence: number;
    description: string;
    skills: string[];
    growth_path?: string;
    justification?: string;
    variant?: 'default' | 'compact';
    isPrimary?: boolean;
    userTraits?: PersonalityTraits;
    userEmotion?: string;
}

const getCareerIcon = (career: string) => {
    const c = career.toLowerCase();
    const iconClass = "w-6 h-6";
    if (c.includes('scientist')) return <LineChart className={iconClass} />;
    if (c.includes('developer') || c.includes('engineer')) return <Code className={iconClass} />;
    if (c.includes('devops')) return <Settings className={iconClass} />;
    if (c.includes('designer') || c.includes('creative')) return <PenTool className={iconClass} />;
    if (c.includes('security')) return <Shield className={iconClass} />;
    if (c.includes('architect')) return <Cloud className={iconClass} />;
    if (c.includes('stack')) return <Layers className={iconClass} />;
    if (c.includes('database')) return <Database className={iconClass} />;
    if (c.includes('network')) return <Globe className={iconClass} />;
    if (c.includes('manager')) return <CheckCircle2 className={iconClass} />;
    if (c.includes('writer')) return <BookOpen className={iconClass} />;
    if (c.includes('analyst')) return <Search className={iconClass} />;
    return <Activity className={iconClass} />;
};

const CircularProgress = ({ value, isPrimary }: { value: number, isPrimary: boolean }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
            <svg className="transform -rotate-90 w-12 h-12">
                <circle
                    className="text-gray-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="24"
                    cy="24"
                />
                <motion.circle
                    className={isPrimary ? "text-primary" : "text-primary/70"}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="24"
                    cy="24"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <span className="absolute text-xs font-bold text-gray-800">
                {Math.round(value)}%
            </span>
        </div>
    );
};

export default function CareerCard({
    career,
    confidence,
    description,
    skills,
    growth_path,
    justification,
    variant = 'default',
    isPrimary = false,
    userTraits,
    userEmotion
}: CareerCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Dynamic justification helper
    const getDynamicJustification = () => {
        if (justification) return justification;
        if (!userTraits) return "Your responses closely align with the competencies required for this role. Based on your emotional intelligence patterns and analytical traits, you show strong potential.";

        // Find highest trait
        const validTraits = Object.entries(userTraits).filter(([key]) => key !== 'neuroticism'); // Neuroticism isn't usually a "pulse" highlight
        const topTraitEntry = validTraits.sort((a, b) => b[1] - a[1])[0];
        const traitName = topTraitEntry ? topTraitEntry[0] : 'Openness';
        const emotionStr = userEmotion ? `composed ${userEmotion} state` : "balanced emotional state";

        return `Your high ${traitName.charAt(0).toUpperCase() + traitName.slice(1)} and ${emotionStr} match the core demands of a ${career}. You demonstrate exactly the kind of cognitive profile and composure typically found in top-performing professionals in this field.`;
    };

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/20 transition-colors shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    {getCareerIcon(career)}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{career}</h4>
                    <p className="text-xs text-primary font-bold">{Math.round(confidence * 100)}% Match</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "rounded-xl border bg-white p-5 transition-all duration-300 hover:shadow-md shadow-sm overflow-hidden relative group",
            isPrimary ? "border-primary/20 ring-1 ring-primary/5" : "border-gray-100"
        )}>
            {isPrimary && (
                <div className="absolute top-0 right-0 z-20">
                    <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg rounded-tr-xl uppercase tracking-wider shadow-sm">
                        Best Fit
                    </div>
                </div>
            )}

            <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    isPrimary ? "bg-primary text-white" : "bg-primary/10 text-primary"
                )}>
                    {getCareerIcon(career)}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-base font-bold text-gray-900 truncate leading-tight mb-2 pr-16">{career}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 pr-12">
                        {description}
                    </p>
                </div>

                <div className={cn("absolute right-0", isPrimary ? "top-8" : "top-0")}>
                    <CircularProgress value={confidence * 100} isPrimary={isPrimary} />
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex flex-wrap gap-2">
                    {(skills || []).slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600">
                            {skill}
                        </span>
                    ))}
                    {(skills || []).length > 3 && (
                        <span className="text-xs font-bold text-gray-400 self-center">
                            +{skills.length - 3}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={`Toggle Why This Match for ${career}`}
                    aria-expanded={isExpanded}
                    className="w-full flex items-center justify-between text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg p-3 transition-colors border border-primary/10"
                >
                    <span>Why This Match?</span>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 pb-1 space-y-4 text-sm text-gray-600 border-t border-gray-50">
                                <p className="leading-relaxed relative pl-3 before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-blue-200 before:rounded-full">
                                    {getDynamicJustification()}
                                </p>

                                {growth_path && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Growth Path</span>
                                        <p className="text-sm font-medium text-gray-700">
                                            {growth_path}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
