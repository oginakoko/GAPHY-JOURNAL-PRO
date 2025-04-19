import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: (props: { error: Error; resetErrorBoundary: () => void }) => JSX.Element;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  private resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({ error: this.state.error, resetErrorBoundary: this.resetErrorBoundary });
      } else {
        console.error('fallback prop is not a function!', this.props.fallback);
        return <div>Error: Fallback is not a function</div>;
      }
    }

    return this.props.children;
  }
}
