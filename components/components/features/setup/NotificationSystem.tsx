'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning';
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const remove = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return { notifications, notify, remove };
};

export const NotificationSystem: React.FC<{
    notifications: Notification[],
    onRemove: (id: string) => void
}> = ({ notifications, onRemove }) => {
    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none w-80">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className="pointer-events-auto glass-card p-5 rounded-[1.5rem] border-glass flex items-start gap-4 shadow-2xl animate-in fade-in slide-in-from-right-8 duration-500"
                >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                            n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-primary/10 text-primary'
                        }`}>
                        {n.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                            n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">{n.type}</p>
                        <p className="text-sm font-bold leading-tight">{n.message}</p>
                    </div>
                    <button
                        onClick={() => onRemove(n.id)}
                        className="hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
