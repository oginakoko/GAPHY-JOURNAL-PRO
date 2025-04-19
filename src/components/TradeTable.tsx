import { useState } from 'react';
import TradeForm from './TradeForm';
import { Trade } from '../types';
import { Pencil, Trash2, RotateCcw, XCircle } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void; // Add this prop
  showDeleted?: boolean;
}

function TradeTable({ trades, onEdit, onDelete, onRestore, onPermanentDelete, showDeleted }: TradeTableProps) {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const renderTradeRow = (trade: Trade) => {
    const isWithdrawal = trade.type === 'withdrawal';
    const isDeposit = trade.type === 'deposit';

    return (
      <tr key={trade.id} className={`border-t border-gray-800 ${trade.deleted ? 'opacity-70' : ''} ${isWithdrawal ? 'bg-red-900/20' : isDeposit ? 'bg-green-900/20' : ''}`}>
        <td className="p-4 font-medium text-white">
          {isWithdrawal ? 'Withdrawal' : isDeposit ? 'Deposit' : trade.symbol}
          {(isWithdrawal || isDeposit) && trade.description && (
            <div className="text-sm text-white/70">{trade.description}</div>
          )}
        </td>
        <td className="p-4 text-white/90">{trade.date}</td>
        <td className="p-4">
          {!isWithdrawal && !isDeposit && (
            <span className={trade.side === 'Buy' ? 'text-green-400' : 'text-red-400'}>
              {trade.side}
            </span>
          )}
        </td>
        <td className="p-4 text-white/90">{isWithdrawal || isDeposit ? '-' : trade.instrument}</td>
        <td className="p-4 text-white/90">{isWithdrawal || isDeposit ? '-' : trade.qty}</td>
        <td className="p-4 text-white/90">
          {isWithdrawal || isDeposit ? (
            <span className={isWithdrawal ? 'text-red-400' : 'text-green-400'}>
              ${trade.price.toLocaleString()}
            </span>
          ) : (
            `$${trade.price.toLocaleString()}`
          )}
        </td>
        <td className="p-4">
          <span className={`font-medium ${trade.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(trade.pl).toLocaleString()}
          </span>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            {showDeleted ? (
              <>
                <button 
                  onClick={() => onRestore(trade.id)}
                  className="hover:bg-white/5 p-1 rounded"
                  title="Restore trade"
                >
                  <RotateCcw className="w-4 h-4 text-green-400 hover:text-green-300" />
                </button>
                <button 
                  onClick={() => onPermanentDelete(trade.id)}
                  className="hover:bg-white/5 p-1 rounded"
                  title="Delete forever"
                >
                  <XCircle className="w-4 h-4 text-red-500 hover:text-red-400" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setEditingTrade(trade)}
                  className="hover:bg-white/5 p-1 rounded"
                >
                  <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-300" />
                </button>
                <button 
                  onClick={() => onDelete(trade.id)}
                  className="hover:bg-white/5 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="bg-[#1A1A1A] rounded-lg overflow-hidden w-full min-w-[800px]">
        <table className="w-full">
          <thead>
            <tr className="text-left text-white/70">
              <th className="p-4">Symbol</th>
              <th className="p-4">Date</th>
              <th className="p-4">Side</th>
              <th className="p-4">Instrument</th>
              <th className="p-4">Qty.</th>
              <th className="p-4">Price</th>
              <th className="p-4">P/L</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {trades.map(renderTradeRow)}
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