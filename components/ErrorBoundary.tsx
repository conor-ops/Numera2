import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI instead of crashing the app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('Uncaught error:', error, errorInfo);
    }
    
    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-white flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white border-2 border-black shadow-swiss p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h1 className="text-2xl font-extrabold text-black uppercase mb-2">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Your data is safe and stored locally.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-50 border border-gray-200 p-4 mb-4 text-left">
                <p className="text-xs font-mono text-red-600 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-black text-white font-bold uppercase flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
