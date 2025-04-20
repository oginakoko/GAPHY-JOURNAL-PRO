export type MoodType = 'HAPPY' | 'SAD' | 'NEUTRAL' | 'EXCITED' | 'ANXIOUS';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (error: Error) => JSX.Element;
}

export interface StatsBarProps {
  winRate: number;
  trades: number;
  withdrawals: number;
  equity: number;
  deposits: number;
  initialBalance: number;
  roi: number;
}
