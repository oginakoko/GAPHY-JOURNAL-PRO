import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { LifeJournalEntry, CreateLifeJournalEntry } from '../types/lifeJournal';

export function useLifeJournal() {
  const [entries, setEntries] = useState<LifeJournalEntry[]>([]);
  const [tradeMoods, setTradeMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchWithRetry = async (fn: () => Promise<any>, retries = 0) => {
    try {
      return await fn();
    } catch (err) {
      if (retries < MAX_RETRIES) {
        setRetryCount(retries + 1);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
        return fetchWithRetry(fn, retries + 1);
      }
      throw err;
    }
  };

  const fetchEntries = useCallback(async () => {
    try {
      await fetchWithRetry(async () => {
        const session = await supabase.auth.getSession();
        const user_id = session.data.session?.user?.id;
        if (!user_id) throw new Error('No authenticated user');

        const { data, error } = await supabase
          .from('life_journal_entries')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEntries(data || []);
        setRetryCount(0);
      });
    } catch (err) {
      setError('Failed to fetch entries');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchEntries = (query: string) => {
    if (!query) {
      fetchEntries();
      return;
    }

    const filtered = entries.filter(entry =>
      entry.title.toLowerCase().includes(query.toLowerCase()) ||
      entry.content.toLowerCase().includes(query.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    setEntries(filtered);
  };

  const createEntry = async (entry: CreateLifeJournalEntry) => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;
      
      if (!user_id) throw new Error('No authenticated user');

      // Process tags - ensure they're an array and remove empty strings
      const processedTags = Array.isArray(entry.tags) 
        ? entry.tags.filter(tag => tag.trim().length > 0)
        : entry.tags?.toString()
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0) || [];

      let image_url = entry.image_url;

      // If there's an image file, upload it first
      if (entry.image_file) {
        const file = entry.image_file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${user_id}/journal/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('journal-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('journal-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const newEntry = {
        ...entry,
        tags: processedTags,
        image_url,
        user_id,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('life_journal_entries')
        .insert([newEntry])
        .select()
        .single();

      if (insertError) throw insertError;

      setEntries(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Create entry error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<CreateLifeJournalEntry>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('life_journal_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setEntries(prev => prev.map(e => e.id === id ? data : e));
      return data;
    } catch (err) {
      console.error('Error updating entry:', err);
      setError('Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('life_journal_entries')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deleteError) throw deleteError;
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry');
      throw err;
    }
  };

  const addMoodPrompt = async (mood: string, score: number) => {
    try {
      const session = await supabase.auth.getSession();
      const user_id = session.data.session?.user?.id;

      if (!user_id) throw new Error('No authenticated user');

      const { error: moodError } = await supabase
        .from('life_journal_moods')
        .insert([{
          user_id,
          mood,
          score,
          created_at: new Date().toISOString()
        }]);

      if (moodError) throw moodError;

      // Refresh entries to update mood stats
      await fetchEntries();
    } catch (err) {
      console.error('Error saving mood:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    tradeMoods,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    addMoodPrompt,
    refetch: fetchEntries,
    searchEntries,
    retryCount,
    retry: () => fetchEntries(),
  };
}
