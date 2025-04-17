import { useState } from 'react';
import { useTradeData } from '../hooks/useTradeData';
import TradeCard from '../components/TradeCard';
import { Archive } from 'lucide-react';

function TradeArchives() {
  const { trades } = useTradeData();
  const [filter, setFilter] = useState('all');

  const filteredTrades = trades.filter(trade => 
    filter === 'all' || 
    (filter === 'profit' && trade.pl > 0) ||
    (filter === 'loss' && trade.pl < 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Archive className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold">Trade Archives</h1>
        </div>
        
        <div className="flex gap-2">
          {['all', 'profit', 'loss'].map(option => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === option 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-[#1A1A1A] hover:bg-[#252525]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrades.map(trade => (
          <TradeCard key={trade.id} trade={trade} />
        ))}
      </div>
    </div>
  );
}

export default TradeArchives;
