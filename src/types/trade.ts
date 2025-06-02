import { MoodType } from './mood';

export interface Trade {
  // ...existing properties...
  trade_type?: string;
  mood?: MoodType;
}
