'use client';

import React from 'react';
import { PersonalityTraits } from '@/types';
import { motion } from 'framer-motion';

interface PersonalityRadarProps {
    data: PersonalityTraits;
}

const CircularTrait = ({ value, label, colorHex }: { value: number, label: string, colorHex: string }) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center w-20 h-20">
                <svg className="transform -rotate-90 w-20 h-20">
                    <circle
                        className="text-gray-100"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                    />
                    <motion.circle
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke={colorHex}
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-black text-gray-800">
                        {Math.round(value)}%
                    </span>
                </div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center h-8 flex items-center">{label}</span>
        </div>
    );
};

export default function PersonalityRadar({ data }: PersonalityRadarProps) {
    // Map personality traits to the requested bars
    const traits = [
        { label: 'Openness', value: data.openness * 100, colorHex: 'var(--primary)' },
        { label: 'Altruism', value: data.agreeableness * 100, colorHex: 'var(--accent)' },
        { label: 'Conscientious', value: data.conscientiousness * 100, colorHex: 'var(--secondary)' },
        { label: 'Agreeable', value: data.agreeableness * 100, colorHex: 'var(--chart-1)' },
        { label: 'Extraversion', value: data.extraversion * 100, colorHex: 'var(--chart-4)' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
    };

    return (
        <div className="p-6 h-full min-h-[320px] flex items-center justify-center">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6 md:gap-8 items-center"
            >
                {/* Top Row: 3 items */}
                <div className="flex justify-center gap-6 md:gap-8">
                    {traits.slice(0, 3).map((trait) => (
                        <motion.div key={trait.label} variants={itemVariants}>
                            <CircularTrait {...trait} />
                        </motion.div>
                    ))}
                </div>
                {/* Bottom Row: 2 items */}
                <div className="flex justify-center gap-6 md:gap-8">
                    {traits.slice(3, 5).map((trait) => (
                        <motion.div key={trait.label} variants={itemVariants}>
                            <CircularTrait {...trait} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

PersonalityRadar.displayName = 'PersonalityRadar';
