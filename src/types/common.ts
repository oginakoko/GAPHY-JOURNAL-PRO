export type MoodType = 'HAPPY' | 'SAD' | 'EXCITED' | 'ANXIOUS' | 'NEUTRAL';

export interface MoodDefinition {
  label: string;
  emoji: string;
  score: number;
  color: string;
}

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

export const MOODS: Record<MoodType, MoodDefinition> = {
  HAPPY: { label: "Happy", emoji: "😊", score: 9, color: 'bg-green-400' },
  EXCITED: { label: "Excited", emoji: "🤗", score: 10, color: 'bg-yellow-400' },
  NEUTRAL: { label: "Neutral", emoji: "😐", score: 5, color: 'bg-blue-400' },
  ANXIOUS: { label: "Anxious", emoji: "😰", score: 3, color: 'bg-orange-400' },
  SAD: { label: "Sad", emoji: "😔", score: 2, color: 'bg-red-400' }
};
