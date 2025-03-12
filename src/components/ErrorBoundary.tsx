import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getUserFriendlyErrorMessage } from '../lib/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack trace:', errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 my-4">
          <h2 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4">
            {this.state.error
              ? getUserFriendlyErrorMessage(this.state.error)
              : 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Component-specific error boundary that wraps a single component
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  WithErrorBoundary.displayName = `WithErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WithErrorBoundary;
};
