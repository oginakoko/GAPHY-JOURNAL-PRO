import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LifeJournalEntry } from '../types/lifeJournal';
import { MOODS, MoodType } from '../types/common';

interface LifeJournalCardProps {
  entry: LifeJournalEntry & { id: string; mood?: MoodType };
  onEdit: (entry: LifeJournalEntry) => void;
  onDelete: (id: string) => void;
}

export default function LifeJournalCard({ entry, onEdit, onDelete }: LifeJournalCardProps) {
  const isValidMood = (mood: any): mood is MoodType => mood && Object.keys(MOODS).includes(mood);
  const moodColor = isValidMood(entry.mood) ? MOODS[entry.mood].color : 'bg-blue-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-[#252525] rounded-xl p-6 hover:bg-[#2A2A2A] transition-colors relative"
    >
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(entry)}
          className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
        >
          <Pencil className="w-4 h-4 text-white/60" />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <h3 className="text-xl font-semibold text-white/90 mb-2">
        {entry.title}
      </h3>
      <p className="text-white/60 line-clamp-2">
        {entry.content}
      </p>

      <div className="absolute bottom-4 left-6 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${moodColor}`}></span>
        <span className="text-sm text-white/40">{entry.date}</span>
      </div>
    </motion.div>
  );
}
