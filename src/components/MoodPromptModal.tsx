import { useState } from 'react';
import { X } from 'lucide-react';
import { MOODS } from '../constants/moods';

interface Props {
  onSubmit: (mood: string, score: number) => void;
  onClose: () => void;
}

export default function MoodPromptModal({ onSubmit, onClose }: Props) {
  const [selectedMood, setSelectedMood] = useState('');

  const handleSubmit = () => {
    if (selectedMood) {
      onSubmit(selectedMood, MOODS[selectedMood].score);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1A1A1A] rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">How are you feeling?</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(MOODS).map(([key, { emoji, label }]) => (
            <button
              key={key}
              onClick={() => setSelectedMood(key)}
              className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                selectedMood === key 
                  ? 'bg-blue-500/20 ring-1 ring-blue-500' 
                  : 'bg-[#252525] hover:bg-[#303030]'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm text-white/80">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedMood}
          className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 
                   disabled:hover:bg-blue-500 transition-all"
        >
          Save
        </button>
      </div>
    </div>
  );
}
