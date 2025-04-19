export interface LifeJournalEntry {
  id?: string;
  title: string;
  content: string;
  mood?: MoodType;
  tags: string[];
  date?: string;
  image_url?: string;
}

export type CreateLifeJournalEntry = Omit<LifeJournalEntry, 'id' | 'date'>;
