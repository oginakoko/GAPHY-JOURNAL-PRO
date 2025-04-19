import { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';
import { ErrorBoundaryProps } from '../types/common';

export function withPageWrapper<P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
) {
  return function WrappedPage(props: P & ErrorBoundaryProps) {
    return (
      <ErrorBoundary
        fallback={({ error, resetErrorBoundary }) => (
          <ErrorFallback
            error={error}
            resetErrorBoundary={resetErrorBoundary} 
            message={`Failed to load ${pageName}`}
          />
        )}
      >
        <Suspense
          fallback={
            <div className="w-full h-[200px] flex items-center justify-center">
              <div className="animate-pulse text-white/40">
                Loading {pageName.toLowerCase()}...
              </div>
            </div>
          }
        >
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}
