import { useState } from 'react';
import { X } from 'lucide-react';
import { MoodType, MOODS } from '../types/mood';
import type { LifeJournalEntry } from '../types/lifeJournal';

interface LifeJournalFormProps {
  onSubmit: (entry: Omit<LifeJournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_deleted'>) => void;
  onClose: () => void;
  initialData?: LifeJournalEntry;
}

export default function LifeJournalForm({ onSubmit, onClose, initialData }: LifeJournalFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState<MoodType>(initialData?.mood || 'NEUTRAL');
  const [tags, setTags] = useState(initialData?.tags || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      mood,
      tags
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Entry' : 'New Entry'}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#252525] rounded px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-[#252525] rounded px-4 py-2 text-white h-32"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Mood</label>
            <select
              value={mood}
              onChange={e => setMood(e.target.value as MoodType)}
              className="w-full bg-[#252525] rounded px-4 py-2 text-white"
            >
              {Object.entries(MOODS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags.join(',')}
              onChange={e => setTags(e.target.value.split(',').map(tag => tag.trim()))}
              className="w-full bg-[#252525] rounded px-4 py-2 text-white"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#303030]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              {initialData ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}