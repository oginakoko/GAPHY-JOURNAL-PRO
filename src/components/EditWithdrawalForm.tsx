import React, { useState } from 'react';

interface EditWithdrawalFormProps {
  originalAmount: number;
  onSubmit: (amount: number, description: string) => void;
}

const EditWithdrawalForm: React.FC<EditWithdrawalFormProps> = ({ originalAmount, onSubmit }) => {
  const [amount, setAmount] = useState(originalAmount);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(amount, description);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Withdrawal</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/90 mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white"
        />
      </div>
      <div className="text-sm text-white/80 mt-4">
        Original Amount: ${originalAmount.toLocaleString()}
      </div>
      <button
        type="submit"
        className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditWithdrawalForm;