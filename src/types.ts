export type InstrumentType = 'Stocks' | 'Options' | 'Forex' | 'Crypto' | 'Futures' | 'all';
export type TradeType = 'trade' | 'withdrawal' | 'deposit';

export interface Trade {
  id: string;
  user_id: string;
  type: TradeType;  // New field
  symbol: string;
  date: string;
  side: 'Buy' | 'Sell';
  qty: number;
  price: number;
  pl: number;
  instrument: InstrumentType;
  screenshot?: string;
  deleted?: boolean;
  deleted_at?: string;  // Change to snake_case for Supabase
  created_at?: string;  // Add these timestamps
  updated_at?: string;
  description?: string;  // For withdrawal/deposit descriptions
}

export interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  currency: string;
  created_at?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TradePlan {
  id: string;
  name: string;
  instrument: InstrumentType;
  checklist: ChecklistItem[];
  deleted?: boolean;
  deletedAt?: string;
}

export interface LifeJournalEntry {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  mood_score: number; // 1-10 rating for tracking
}

export interface MoodPrompt {
  id: string;
  created_at: string;
  user_id: string;
  mood: string;
  mood_score: number;
}

export interface MoodStats {
  averageScore: number;
  moodCounts: Record<string, number>;
  weeklyScores: Array<{
    date: string;
    score: number;
  }>;
}

export interface AppState {
  lastVisitedPage: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  currency: string;
  timezone: string;
  notifications: boolean;
}