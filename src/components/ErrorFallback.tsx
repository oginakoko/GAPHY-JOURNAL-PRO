import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  message?: string;
}

export function ErrorFallback({ error, resetErrorBoundary, message }: ErrorFallbackProps) {
  return (
    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-medium text-red-400">
          {message || 'Something went wrong'}
        </h3>
      </div>
      <p className="text-sm text-white/60 mb-4">
        {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all text-red-400"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
