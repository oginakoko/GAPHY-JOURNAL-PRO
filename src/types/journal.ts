export interface LifeJournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  images?: string[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export type CreateLifeJournalEntry = Omit<LifeJournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_deleted'>;
