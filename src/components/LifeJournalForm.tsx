import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import { MOODS } from '../constants/moods';
import type { LifeJournalEntry } from '../types/lifeJournal';

interface Props {
  onSubmit: (entry: Partial<LifeJournalEntry>) => Promise<void>;
  onClose: () => void;
  initialData?: LifeJournalEntry;
}

export default function LifeJournalForm({ onSubmit, onClose, initialData }: Props) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    mood: initialData?.mood || 'NEUTRAL',
    tags: initialData?.tags || [],
    is_private: initialData?.is_private || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-[#1A1A1A] rounded-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title input */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-[#252525] rounded-lg px-4 py-2"
              required
            />
          </div>

          {/* Mood selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Mood</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MOODS).map(([key, { label, emoji }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mood: key }))}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    formData.mood === key 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-[#252525] text-white/60 hover:text-white'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content textarea */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full h-40 bg-[#252525] rounded-lg px-4 py-2"
              required
            />
          </div>

          {/* Tags input */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={e => setFormData(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              }))}
              className="w-full bg-[#252525] rounded-lg px-4 py-2"
              placeholder="e.g. work, personal, goals"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
