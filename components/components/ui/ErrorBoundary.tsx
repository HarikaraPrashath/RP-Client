'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Professional Error Boundary to catch runtime exceptions in the component tree.
 * Provides a localized recovery UI instead of a full app crash.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
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
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
                    <div className="text-center space-y-8 max-w-md p-12 bg-card rounded-[3rem] border border-border shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive border-4 border-destructive/20 shadow-lg shadow-destructive/10">
                            <AlertCircle className="w-12 h-12" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tight">System Interrupted</h2>
                            <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4">
                                An unexpected emotional state was detected that the binary could not parse. Our systems are recalibrating.
                            </p>
                            {this.state.error && (
                                <p className="text-[10px] font-mono bg-muted p-2 rounded-lg opacity-50 mt-4 break-all max-h-24 overflow-auto">
                                    {this.state.error.message}
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="default"
                            size="lg"
                            className="w-full h-16 rounded-2xl text-lg font-black tracking-tight bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex gap-3"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Resume Session
                        </Button>
                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground opacity-30">
                            Error Boundary v1.0 • Fail-Safe Active
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
