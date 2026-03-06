'use client';

import React from 'react';

export function SolarisBackground() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-white">
            {/* Subtle dot pattern */}
            <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
        </div>
    );
}
