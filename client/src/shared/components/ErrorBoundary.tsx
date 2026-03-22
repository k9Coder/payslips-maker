import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold">משהו השתבש</h2>
          <p className="text-muted-foreground">
            אירעה שגיאה בלתי צפויה. אנא נסה שוב.
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>נסה שוב</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
