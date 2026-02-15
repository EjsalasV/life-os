// app/components/ui/ErrorBoundary.tsx
"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center space-y-6">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="p-4 bg-rose-100 dark:bg-rose-900/20 rounded-full">
                                <AlertTriangle className="text-rose-600 dark:text-rose-400" size={48} />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                ¡Oops! Algo salió mal
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
                            </p>
                        </div>

                        {/* Error details (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-left">
                                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-95 transition-transform"
                            >
                                <RefreshCw size={16} />
                                Intentar de nuevo
                            </button>

                            <button
                                onClick={this.handleReload}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Home size={16} />
                                Recargar aplicación
                            </button>
                        </div>

                        {/* Support message */}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Si el problema persiste, contacta a soporte en{' '}
                            <a
                                href="mailto:joaosalas123@gmail.com"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                joaosalas123@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
