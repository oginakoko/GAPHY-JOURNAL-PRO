import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WithdrawalFormProps {
  onSubmit: (amount: number, description: string) => void;
  onClose: () => void;
}

function WithdrawalForm({ onSubmit, onClose }: WithdrawalFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentBalance = 1000; // Example balance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    try {
      await onSubmit(Number(amount), description);
      onClose();
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h2>
          <button 
            onClick={onClose} 
            className="hover:bg-[#252525] p-2 rounded"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => {
                setAmount(e.target.value);
                setError(null);
              }}
              className={`w-full bg-[#252525] rounded px-4 py-2 text-white ${
                error ? 'border border-red-500' : ''
              }`}
              required
              min="0.01"
              step="0.01"
              placeholder="Enter withdrawal amount"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#252525] rounded px-4 py-2 text-white"
              placeholder="Add a note about this withdrawal"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="text-sm text-white/80 mt-4">
            Current Balance: ${currentBalance.toLocaleString()}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#303030]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WithdrawalForm;