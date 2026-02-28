'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EmotionTimelineProps {
    data: any[];
}

export default function EmotionTimeline({ data }: EmotionTimelineProps) {
    const formattedData = data.map(item => {
        // Parse time to display only time part, ensuring no date is shown
        let parsedTime = item.time || '';
        try {
            if (parsedTime) {
                const date = new Date(parsedTime);
                if (!isNaN(date.getTime())) {
                    parsedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                } else if (parsedTime.includes('T')) {
                    parsedTime = parsedTime.split('T')[1].split('.')[0];
                }
            }
        } catch (e) {
            // fall back to original
        }

        return {
            time: parsedTime,
            happy: (item.emotions?.happy || 0) * 100,
            neutral: (item.emotions?.neutral || 0) * 100,
            surprise: (item.emotions?.surprise || 0) * 100,
            fear: (item.emotions?.fear || 0) * 100,
            sad: (item.emotions?.sad || 0) * 100,
            angry: (item.emotions?.angry || 0) * 100,
            disgust: (item.emotions?.disgust || 0) * 100
        };
    });

    // If data doesn't start from 0 and user wants it to start from 0, we can ensure the minimum is 0 using the YAxis domain below.
    const emotions = [
        { key: 'happy', color: '#10b981' }, // Emerald (Matches Altruism)
        { key: 'neutral', color: '#94a3b8' }, // Slate
        { key: 'surprise', color: '#f59e0b' }, // Amber (Matches Agreeable)
        { key: 'fear', color: '#6366f1' }, // Indigo (Matches Openness)
        { key: 'sad', color: '#3b82f6' }, // Blue (Matches Conscientious)
        { key: 'angry', color: '#f43f5e' }, // Rose (Matches Extraversion)
        { key: 'disgust', color: '#ec4899' } // Pink
    ];

    return (
        <div className="w-full h-[400px] p-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f1f5f9" />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        dy={10}
                        minTickGap={20}
                    />
                    <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(val) => `${val}%`}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: any, name: any) => {
                            const val = typeof value === 'number' ? value : 0;
                            const nm = typeof name === 'string' ? name : String(name || '');
                            return [`${Math.round(val)}%`, nm.toUpperCase()];
                        }}
                        labelStyle={{ color: '#475569', marginBottom: '8px' }}
                    />
                    <Legend
                        iconType="circle"
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{
                            paddingBottom: '30px',
                            fontSize: '10px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            opacity: 0.8
                        }}
                    />
                    {emotions.map(e => (
                        <Line
                            key={e.key}
                            type="monotone"
                            dataKey={e.key}
                            name={e.key}
                            stroke={e.color}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: e.color }}
                            animationDuration={1500}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

EmotionTimeline.displayName = 'EmotionTimeline';
