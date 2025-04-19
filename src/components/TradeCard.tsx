import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';
import { Trade } from '../types';

interface TradeCardProps {
  trade: Trade;
  compact?: boolean;
}

const TradeCard = React.memo(({ trade, compact = false }: TradeCardProps) => {
  const isTransaction = trade.type === 'withdrawal' || trade.type === 'deposit';
  const isProfitable = trade.pl > 0;

  return (
    <div className="bg-[#1A1A1A] rounded-lg overflow-hidden border border-white/5 hover:border-white/10 transition-all">
      {!compact && (
        <div className="relative h-48 bg-[#252525]">
          {trade.screenshot ? (
            <img
              src={trade.screenshot}
              alt="Trade Screenshot"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              No Screenshot
            </div>
          )}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
            isProfitable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isProfitable ? '+' : ''}{trade.pl.toFixed(2)}
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-white">
              {isTransaction ? (trade.type === 'withdrawal' ? 'Withdrawal' : 'Deposit') : trade.symbol}
            </h3>
            <p className="text-sm text-white/70">
              {isTransaction ? trade.description || '' : trade.instrument}
            </p>
          </div>
          {!isTransaction && (
            isProfitable ? 
              <ArrowUpRight className="text-green-400" /> : 
              <ArrowDownRight className="text-red-400" />
          )}
        </div>

        {!compact && !isTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/80">Price</p>
                <p className="font-medium text-white">${trade.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/80">Quantity</p>
                <p className="font-medium text-white">{trade.qty}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-white/70">
            {new Date(trade.date).toLocaleDateString()}
          </span>
          {compact ? (
            <Link 
              to={`/trades/${trade.id}`}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              Details <ExternalLink size={14} />
            </Link>
          ) : (
            <div className={`text-sm font-medium ${
              isTransaction 
                ? trade.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                : isProfitable ? 'text-green-400' : 'text-red-400'
            }`}>
              {isTransaction 
                ? trade.type === 'withdrawal' ? 'Withdrawn' : 'Deposited' 
                : isProfitable ? 'Profit' : 'Loss'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TradeCard;
