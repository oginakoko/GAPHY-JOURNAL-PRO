import React, { useState } from 'react';
import { Edit2, Trash, Undo, X } from 'lucide-react';
import { Trade } from '../types';
import TradeForm from './TradeForm';

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onRestore: (id: string) => void;
  showDeleted: boolean;
}

function TradeTable({ trades, onEdit, onDelete, onPermanentDelete, onRestore, showDeleted }: TradeTableProps) {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  return (
    <>
      <div className="bg-[#1A1A1A] rounded-lg overflow-hidden w-full min-w-[800px]">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="p-4">Symbol</th>
              <th className="p-4">Date</th>
              <th className="p-4">Side</th>
              <th className="p-4">Instrument</th>
              <th className="p-4">Qty.</th>
              <th className="p-4">Price</th>
              <th className="p-4">P/L</th>
              <th className="p-4">Screenshot</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className={`border-t border-gray-800 ${trade.deleted ? 'opacity-50' : ''}`}>
                <td className="p-4 font-medium">{trade.symbol}</td>
                <td className="p-4 text-gray-300">{trade.date}</td>
                <td className="p-4">
                  <span className={trade.side === 'Buy' ? 'text-green-400' : 'text-red-400'}>
                    {trade.side}
                  </span>
                </td>
                <td className="p-4">{trade.instrument}</td>
                <td className="p-4">{trade.qty}</td>
                <td className="p-4">${trade.price.toLocaleString()}</td>
                <td className={`p-4 ${trade.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.pl >= 0 ? '+' : ''}{trade.pl}
                </td>
                <td className="p-4">
                  {trade.screenshot && (
                    <img 
                      src={trade.screenshot} 
                      alt="Trade Screenshot" 
                      className="w-10 h-10 object-cover rounded cursor-pointer"
                      onClick={() => window.open(trade.screenshot, '_blank')}
                    />
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {trade.deleted ? (
                      <>
                        <button
                          onClick={() => onRestore(trade.id)}
                          className="p-2 hover:bg-[#252525] rounded"
                          title="Restore"
                        >
                          <Undo className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to permanently delete this trade? This action cannot be undone.')) {
                              onPermanentDelete(trade.id);
                            }
                          }}
                          className="p-2 hover:bg-red-500 rounded"
                          title="Delete Forever"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingTrade(trade)}
                          className="p-2 hover:bg-[#252525] rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(trade.id)}
                          className="p-2 hover:bg-[#252525] rounded"
                          title="Move to Trash"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTrade && (
        <TradeForm
          trade={editingTrade}
          onSubmit={(updatedTrade) => {
            onEdit(updatedTrade);
            setEditingTrade(null);
          }}
          onClose={() => setEditingTrade(null)}
          selectedInstrument={editingTrade.instrument}
        />
      )}
    </>
  );
}

export default TradeTable;