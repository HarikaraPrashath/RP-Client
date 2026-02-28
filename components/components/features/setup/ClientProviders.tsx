'use client';

import React from 'react';
import ErrorBoundary from "@/components/features/setup/ErrorBoundary";
import { NotificationSystem, useNotifications } from "@/components/features/setup/NotificationSystem";
import { SolarisBackground } from "@/components/features/setup/SolarisBackground";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const { notifications, remove } = useNotifications();

    return (
        <ErrorBoundary>
            <SolarisBackground />
            {children}
            <NotificationSystem notifications={notifications} onRemove={remove} />
        </ErrorBoundary>
    );
}
