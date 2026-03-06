'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-6">
                    <div className="glass-card p-12 rounded-[3rem] text-center max-w-md space-y-8 border-destructive/20 shadow-2xl shadow-destructive/10">
                        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black tracking-tight">System Fault</h1>
                            <p className="text-muted-foreground font-medium">A core cognitive overflow occurred. The session integrity remains protected.</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-2xl text-[10px] font-mono text-muted-foreground break-all text-left border border-glass">
                            {this.state.error?.message}
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full h-14 rounded-2xl gap-2 font-black uppercase tracking-widest"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset Environment
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
