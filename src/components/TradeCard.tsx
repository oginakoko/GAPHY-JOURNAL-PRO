import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TradeCardProps {
  trade: {
    id: string;
    symbol: string;
    instrument: string;
    pl: number;
    entry: number;
    exit: number;
    date: string;
    screenshot?: string;
    notes?: string;
  };
  compact?: boolean;
}

function TradeCard({ trade, compact = false }: TradeCardProps) {
  if (!trade) return null;
  
  const isProfitable = trade.pl > 0;

  return (
    <div className="bg-[#1A1A1A] rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all h-full">
      <div className="aspect-video relative bg-[#252525]">
        {trade.screenshot ? (
          <img 
            src={trade.screenshot} 
            alt={`Trade ${trade.symbol}`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Screenshot
          </div>
        )}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
          isProfitable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isProfitable ? '+' : ''}{trade.pl.toFixed(2)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{trade.symbol}</h3>
            <p className="text-sm text-gray-400">{trade.instrument}</p>
          </div>
          {isProfitable ? 
            <ArrowUpRight className="text-green-400" /> : 
            <ArrowDownRight className="text-red-400" />
          }
        </div>

        {!compact && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Entry</p>
                <p className="font-medium">${trade.entry}</p>
              </div>
              <div>
                <p className="text-gray-400">Exit</p>
                <p className="font-medium">${trade.exit}</p>
              </div>
            </div>
            {trade.notes && (
              <p className="text-sm text-gray-400">{trade.notes}</p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500">
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
              isProfitable ? 'text-green-400' : 'text-red-400'
            }`}>
              {isProfitable ? 'Profit' : 'Loss'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradeCard;
