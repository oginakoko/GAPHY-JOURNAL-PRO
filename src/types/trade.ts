import { MoodType } from './mood';

export interface Trade {
  // ...existing properties...
  mood?: MoodType;
}
